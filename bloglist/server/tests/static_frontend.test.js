import test from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import app from '../app.js'
const api = supertest(app)
test('Express serves the built frontend at the root and on deep SPA routes', async () => {
  for (const path of ['/', '/blogs/000000000000000000000001', '/users']) {
    const result = await api.get(path).expect(200).expect('Content-Type', /html/)
    assert.match(result.text, /id="root"/)
  }
})
test('unknown API paths keep JSON 404 responses instead of serving the SPA', async () => {
  await api.get('/api/not-a-route').expect(404).expect('Content-Type', /json/)
})
