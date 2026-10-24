import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { tokenSecret } from '../utils/config.js'

const router = Router()
router.post('/', async (request, response) => {
  const { username, password } = request.body
  if (typeof username !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72) return response.status(401).json({ error: 'invalid username or password' })
  const user = await User.findOne({ username: username.trim() })
  const passwordCorrect = user && await bcrypt.compare(password, user.passwordHash)
  if (!passwordCorrect) return response.status(401).json({ error: 'invalid username or password' })
  const token = jwt.sign({ username: user.username, id: user.id }, tokenSecret, { algorithm: 'HS256', expiresIn: '1h' })
  response.json({ token, username: user.username, name: user.name })
})
export default router
