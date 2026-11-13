import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import blogs from './controllers/blogs.js'
import users from './controllers/users.js'
import login from './controllers/login.js'
import testing from './controllers/testing.js'
import { tokenExtractor, unknownEndpoint, errorHandler } from './utils/middleware.js'

const app = express()
// Bound per-process request work before parsing bodies, authorization or database access.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests; retry shortly.' },
  }),
)
app.use(cors())
app.use(express.json({ limit: '16kb' }))
app.use(tokenExtractor)
app.get('/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api/blogs', blogs)
app.use('/api/users', users)
app.use(
  '/api/login',
  rateLimit({
    windowMs: 60_000,
    limit: 20,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many failed login attempts; retry shortly.' },
  }),
  login,
)
if (process.env.NODE_ENV === 'test') app.use('/api/testing', testing)
const clientDist = fileURLToPath(new URL('../client/dist/', import.meta.url))
app.use(express.static(clientDist))
app.get('/{*path}', (request, response, next) => {
  if (
    request.path === '/api' ||
    request.path.startsWith('/api/') ||
    !existsSync(clientDist + 'index.html')
  )
    return next()
  response.sendFile(clientDist + 'index.html')
})
app.use(unknownEndpoint)
app.use(errorHandler)
export default app
