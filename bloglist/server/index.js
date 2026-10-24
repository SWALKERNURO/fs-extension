import mongoose from 'mongoose'
import app from './app.js'
import { port, mongoUri, validateConfig } from './utils/config.js'

try {
  validateConfig()
  await mongoose.connect(mongoUri)
  await Promise.all(Object.values(mongoose.models).map(model => model.init()))
  app.listen(port, () => console.log(`Bloglist listening on port ${port}`))
} catch (error) {
  console.error('Could not start bloglist:', error.name)
  process.exitCode = 1
}
