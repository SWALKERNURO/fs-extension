import { Router } from 'express'
import { Types } from 'mongoose'
import Blog from '../models/blog.js'
import { userExtractor } from '../utils/middleware.js'

const router = Router()
router.param('id', (request, response, next, value) => {
  if (!/^[a-f\d]{24}$/i.test(value)) return response.status(400).json({ error: 'malformatted id' })
  request.blogId = new Types.ObjectId(value)
  next()
})
router.get('/', async (_request, response) => {
  response.json(await Blog.find({}).populate('user', { username: 1, name: 1 }))
})
router.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = new Blog({ title, author, url, likes, user: request.user._id })
  const saved = await blog.save()
  await saved.populate('user', { username: 1, name: 1 })
  response.status(201).json(saved)
})
router.put('/:id', async (request, response) => {
  const { likes } = request.body
  if (!Number.isSafeInteger(likes) || likes < 0)
    return response.status(400).json({ error: 'likes must be a nonnegative integer' })
  const blog = await Blog.findByIdAndUpdate(
    request.blogId,
    { likes: Number(likes) },
    { new: true, runValidators: true },
  ).populate('user', { username: 1, name: 1 })
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  response.json(blog)
})
router.post('/:id/comments', async (request, response) => {
  const { comment } = request.body
  if (typeof comment !== 'string' || !comment.trim() || comment.trim().length > 2000)
    return response.status(400).json({ error: 'comment must contain 1 to 2000 characters' })
  const blog = await Blog.findByIdAndUpdate(
    request.blogId,
    { $push: { comments: comment.trim() } },
    { new: true, runValidators: true },
  ).populate('user', { username: 1, name: 1 })
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  response.status(201).json(blog)
})
router.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.blogId)
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  if (blog.user.toString() !== request.user.id)
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  await blog.deleteOne()
  response.status(204).end()
})
export default router
