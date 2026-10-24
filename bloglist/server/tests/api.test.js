import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

process.env.NODE_ENV = 'test'
process.env.SECRET = 'isolated-test-fixture-only-no-real-access-123456'
const { default: app } = await import('../app.js')
const { default: Blog } = await import('../models/blog.js')
const { default: User } = await import('../models/user.js')
const { mongoUri, tokenSecret, validateConfig } = await import('../utils/config.js')
const api = request(app)
let owner, other, token, otherToken, passwordHash
const password = 'fixture-password'
const newBlog = { title: 'Boundary tests', author: 'Avery', url: 'https://example.com/boundaries', likes: 4 }
const authorization = value => `Bearer ${value}`

before(async () => {
  validateConfig()
  const databaseName = new URL(mongoUri).pathname.slice(1)
  if (!databaseName.endsWith('_test')) throw new Error('Tests require a dedicated database ending in _test')
  await mongoose.connect(mongoUri)
  await Promise.all([Blog.init(), User.init()])
  passwordHash = await bcrypt.hash(password, 10)
})
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  ;[owner, other] = await User.create([
    { username: 'owner', name: 'Owner Fixture', passwordHash },
    { username: 'other', name: 'Other Fixture', passwordHash },
  ])
  token = jwt.sign({ id: owner.id, username: owner.username }, tokenSecret, { expiresIn: '1h' })
  otherToken = jwt.sign({ id: other.id, username: other.username }, tokenSecret, { expiresIn: '1h' })
  await Blog.create([
    { ...newBlog, title: 'First fixture', user: owner._id },
    { ...newBlog, title: 'Second fixture', user: other._id, likes: 2 },
  ])
})
after(async () => { await mongoose.disconnect() })

test('GET returns JSON, all blogs, id property and safe creator details without authentication', async () => {
  const { body } = await api.get('/api/blogs').expect(200).expect('Content-Type', /json/)
  assert.equal(body.length, 2)
  const first = body.find(blog => blog.title === 'First fixture')
  assert.equal(typeof first.id, 'string')
  assert.equal(first._id, undefined)
  assert.equal(first.user.username, 'owner')
  assert.ok(body.every(blog => blog.user.passwordHash === undefined))
})
test('authenticated POST persists the content and authenticated creator, ignoring forged user IDs', async () => {
  const { body } = await api.post('/api/blogs').set('Authorization', authorization(token)).send({ ...newBlog, user: other.id }).expect(201)
  assert.equal(await Blog.countDocuments(), 3)
  const stored = await Blog.findById(body.id)
  assert.equal(stored.title, newBlog.title)
  assert.equal(stored.url, newBlog.url)
  assert.equal(stored.likes, 4)
  assert.equal(stored.user.toString(), owner.id)
})
test('missing likes defaults to zero', async () => {
  const blog = { ...newBlog }
  delete blog.likes
  const { body } = await api.post('/api/blogs').set('Authorization', authorization(token)).send(blog).expect(201)
  assert.equal(body.likes, 0)
})
for (const property of ['title', 'url']) {
  test(`missing ${property} rejects creation with 400 and leaves database unchanged`, async () => {
    const blog = { ...newBlog }
    delete blog[property]
    const { body } = await api.post('/api/blogs').set('Authorization', authorization(token)).send(blog).expect(400)
    assert.ok(body.error)
    assert.equal(await Blog.countDocuments(), 2)
  })
}
for (const header of [null, 'Bearer invalid-token']) {
  test(`${header ? 'invalid' : 'missing'} token rejects creation with 401`, async () => {
    const call = api.post('/api/blogs').send(newBlog)
    if (header) call.set('Authorization', header)
    await call.expect(401)
    assert.equal(await Blog.countDocuments(), 2)
  })
}
test('expired and deleted-user tokens are rejected', async () => {
  const expired = jwt.sign({ id: owner.id }, tokenSecret, { expiresIn: -1 })
  await api.post('/api/blogs').set('Authorization', authorization(expired)).send(newBlog).expect(401)
  await User.findByIdAndDelete(owner.id)
  await api.post('/api/blogs').set('Authorization', authorization(token)).send(newBlog).expect(401)
})
test('PUT updates persisted likes and cannot change ownership', async () => {
  const blog = await Blog.findOne({ user: owner._id })
  const { body } = await api.put(`/api/blogs/${blog.id}`).send({ likes: 12, user: other.id }).expect(200)
  assert.equal(body.likes, 12)
  const stored = await Blog.findById(blog.id)
  assert.equal(stored.likes, 12)
  assert.equal(stored.user.toString(), owner.id)
})
test('invalid likes do not change persisted data', async () => {
  const blog = await Blog.findOne({ user: owner._id })
  for (const likes of [-1, 1.5, 'many']) await api.put(`/api/blogs/${blog.id}`).send({ likes }).expect(400)
  assert.equal((await Blog.findById(blog.id)).likes, blog.likes)
})
test('owner can delete a blog and it is absent afterward', async () => {
  const blog = await Blog.findOne({ user: owner._id })
  await api.delete(`/api/blogs/${blog.id}`).set('Authorization', authorization(token)).expect(204)
  assert.equal(await Blog.findById(blog.id), null)
  assert.equal(await Blog.countDocuments(), 1)
})
test('missing token and another user cannot delete the owner blog', async () => {
  const blog = await Blog.findOne({ user: owner._id })
  await api.delete(`/api/blogs/${blog.id}`).expect(401)
  await api.delete(`/api/blogs/${blog.id}`).set('Authorization', authorization(otherToken)).expect(403)
  assert.equal(await Blog.countDocuments(), 2)
})
test('malformed and missing blog IDs return suitable errors', async () => {
  await api.put('/api/blogs/invalid').send({ likes: 1 }).expect(400)
  await api.put(`/api/blogs/${new mongoose.Types.ObjectId()}`).send({ likes: 1 }).expect(404)
  await api.delete(`/api/blogs/${new mongoose.Types.ObjectId()}`).set('Authorization', authorization(token)).expect(404)
})
test('valid user creation stores a bcrypt hash and never returns it', async () => {
  const { body } = await api.post('/api/users').send({ username: 'newuser', password: 'new-password', name: 'New Fixture' }).expect(201)
  assert.equal(body.passwordHash, undefined)
  assert.equal(body.password, undefined)
  const user = await User.findById(body.id)
  assert.notEqual(user.passwordHash, 'new-password')
  assert.equal(await bcrypt.compare('new-password', user.passwordHash), true)
})
for (const payload of [
  { username: 'ab', password: 'valid' }, { username: 'valid', password: 'ab' },
  { password: 'valid' }, { username: 'valid' }, { username: 'owner', password: 'valid' },
]) {
  test(`invalid user ${JSON.stringify(payload)} is rejected without persistence`, async () => {
    const { body } = await api.post('/api/users').send(payload).expect(400)
    assert.ok(body.error)
    assert.equal(await User.countDocuments(), 2)
  })
}
test('user listing populates blogs and excludes every password hash', async () => {
  const { body } = await api.get('/api/users').expect(200)
  const user = body.find(value => value.username === 'owner')
  assert.equal(user.blogs.length, 1)
  assert.equal(user.blogs[0].title, 'First fixture')
  assert.ok(body.every(value => !value.passwordHash && !value.password))
})
test('login returns a valid expiring token and rejects incorrect credentials', async () => {
  const { body } = await api.post('/api/login').send({ username: 'owner', password }).expect(200)
  const decoded = jwt.verify(body.token, tokenSecret)
  assert.equal(decoded.id, owner.id)
  assert.ok(decoded.exp > decoded.iat)
  await api.post('/api/login').send({ username: 'owner', password: 'incorrect' }).expect(401)
  await api.post('/api/login').send({ username: 'missing', password }).expect(401)
})
test('malformed JSON receives a JSON 400 error', async () => {
  const { body } = await api.post('/api/users').set('Content-Type', 'application/json').send('{broken').expect(400)
  assert.equal(body.error, 'invalid JSON')
})
