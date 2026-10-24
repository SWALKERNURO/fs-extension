import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../app.js'
import Blog from '../models/blog.js'
import User from '../models/user.js'
const api = supertest(app)
let blog
before(async () => {
  const uri = process.env.TEST_MONGODB_URI
  if (!uri || !new URL(uri).pathname.endsWith('_test')) throw new Error('Use an isolated database ending in _test')
  await mongoose.connect(uri)
  await Blog.deleteMany({})
  await User.deleteMany({})
  await api.post('/api/users').send({ username: 'comment-fixture', name: 'Comment Fixture', password: 'fictional-test-password' }).expect(201)
  const login = await api.post('/api/login').send({ username: 'comment-fixture', password: 'fictional-test-password' }).expect(200)
  const created = await api.post('/api/blogs').set('Authorization', 'Bearer ' + login.body.token).send({ title: 'Comment test', url: 'https://example.com/comments' }).expect(201)
  blog = created.body
})
after(async () => { await mongoose.connection.close() })
test('anonymous comments are trimmed, persisted and returned with the populated creator', async () => {
  const result = await api.post('/api/blogs/' + blog.id + '/comments').send({ comment: '  Useful test observation  ' }).expect(201)
  assert.deepEqual(result.body.comments, ['Useful test observation'])
  assert.equal(result.body.user.username, 'comment-fixture')
  assert.deepEqual((await Blog.findById(blog.id)).comments, ['Useful test observation'])
})
test('empty, non-text and oversized comments are rejected without changing the document', async () => {
  for (const comment of ['', '   ', 23, 'x'.repeat(2001)]) await api.post('/api/blogs/' + blog.id + '/comments').send({ comment }).expect(400)
  assert.equal((await Blog.findById(blog.id)).comments.length, 1)
})
test('commenting on an absent blog returns 404', async () => {
  await api.post('/api/blogs/000000000000000000000000/comments').send({ comment: 'Missing blog' }).expect(404)
})
