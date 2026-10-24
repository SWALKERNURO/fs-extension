import express from 'express'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import blogs from './controllers/blogs.js'
import users from './controllers/users.js'
import login from './controllers/login.js'
import testing from './controllers/testing.js'
import { tokenExtractor, unknownEndpoint, errorHandler } from './utils/middleware.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '16kb' }))
app.use(tokenExtractor)
app.get('/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api/blogs', blogs)
app.use('/api/users', users)
app.use('/api/login', login)
if (process.env.NODE_ENV === 'test') app.use('/api/testing', testing)
const clientDist = fileURLToPath(new URL('../client/dist/', import.meta.url))
app.use(express.static(clientDist))
app.get('/{*path}', (request, response, next) => {
  if ((request.path === '/api' || request.path.startsWith('/api/')) || !existsSync(clientDist + 'index.html')) return next()
  response.sendFile(clientDist + 'index.html')
})
app.use(unknownEndpoint)
app.use(errorHandler)
export default app
