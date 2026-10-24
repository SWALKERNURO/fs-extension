import { Router } from 'express'
import mongoose from 'mongoose'
import Blog from '../models/blog.js'
import User from '../models/user.js'

const router = Router()
router.post('/reset', async (_request, response) => {
  if (process.env.NODE_ENV !== 'test' || !mongoose.connection.name?.endsWith('_test')) {
    return response.status(403).json({ error: 'reset requires an isolated test database' })
  }
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})
export default router
