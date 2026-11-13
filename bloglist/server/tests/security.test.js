import assert from 'node:assert/strict'
import test from 'node:test'
import request from 'supertest'
import app from '../app.js'

test('rejects malformed and query-shaped blog identifiers before database access', async () => {
  for (const id of ['not-an-id', encodeURIComponent('{"$ne":null}')]) {
    const result = await request(app).put(`/api/blogs/${id}`).send({ likes: 1 }).expect(400)
    assert.equal(result.body.error, 'malformatted id')
  }
})

test('rejects query-shaped update values before database access', async () => {
  const result = await request(app)
    .put('/api/blogs/507f1f77bcf86cd799439011')
    .send({ likes: { $gt: 0 } })
    .expect(400)
  assert.equal(result.body.error, 'likes must be a nonnegative integer')
})

test('throttles repeated failed login requests without a database', async () => {
  let result
  for (let attempt = 0; attempt < 21; attempt += 1) {
    result = await request(app).post('/api/login').send({})
    if (result.status === 429) break
    assert.equal(result.status, 401)
  }
  assert.equal(result.status, 429)
  assert.match(result.headers['retry-after'], /^\d+$/)
})

test('bounds repeated HTTP requests and reports when clients may retry', async () => {
  let result
  for (let attempt = 0; attempt < 1001; attempt += 1) {
    result = await request(app).get('/health')
    if (result.status === 429) break
    assert.equal(result.status, 200)
  }
  assert.equal(result.status, 429)
  assert.match(result.headers['retry-after'], /^\d+$/)
})
