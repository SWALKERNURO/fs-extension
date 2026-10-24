import { Router } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user.js'

const router = Router()
router.get('/', async (_request, response) => response.json(await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })))
router.post('/', async (request, response) => {
  const { username, password, name } = request.body
  if (typeof username !== 'string' || username.trim().length < 3 || typeof password !== 'string' || password.length < 3 || Buffer.byteLength(password) > 72) {
    return response.status(400).json({ error: 'username and password must have at least 3 characters; password must not exceed 72 bytes' })
  }
  if (name !== undefined && typeof name !== 'string') return response.status(400).json({ error: 'name must be text' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username: username.trim(), name, passwordHash })
  response.status(201).json(await user.save())
})
export default router
