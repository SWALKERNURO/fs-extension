import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'

// Node's test runner isolates this file from the database tests.
process.env.NODE_ENV = 'production'
const { default: app } = await import('../app.js')

test('production application never exposes the destructive test-reset endpoint', async () => {
  const { body } = await request(app).post('/api/testing/reset').expect(404)
  assert.equal(body.error, 'unknown endpoint')
})
