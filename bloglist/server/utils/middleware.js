import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { tokenSecret } from './config.js'

export const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization') || ''
  request.token = /^Bearer\s+\S+$/i.test(authorization) ? authorization.split(/\s+/)[1] : null
  next()
}
export const userExtractor = async (request, response, next) => {
  if (!request.token) return response.status(401).json({ error: 'token missing' })
  const decoded = jwt.verify(request.token, tokenSecret, { algorithms: ['HS256'] })
  if (!decoded.id) return response.status(401).json({ error: 'token invalid' })
  const user = await User.findById(decoded.id)
  if (!user) return response.status(401).json({ error: 'token user no longer exists' })
  request.user = user
  next()
}
export const unknownEndpoint = (_request, response) => response.status(404).json({ error: 'unknown endpoint' })
export const errorHandler = (error, _request, response, _next) => {
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return response.status(401).json({ error: 'token invalid or expired' })
  if (error.name === 'CastError') return response.status(400).json({ error: 'malformatted id' })
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  if (error.code === 11000) return response.status(400).json({ error: 'username must be unique' })
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'invalid JSON' })
  if (error.type === 'entity.too.large') return response.status(413).json({ error: 'request too large' })
  console.error('Request failed:', error.name)
  response.status(500).json({ error: 'internal server error' })
}
