import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, unique: true, trim: true },
  name: { type: String, default: '', trim: true },
  passwordHash: { type: String, required: true },
})
schema.virtual('blogs', { ref: 'Blog', localField: '_id', foreignField: 'user' })
schema.set('toJSON', { virtuals: true, transform: (_document, object) => {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
} })
export default mongoose.model('BlogUser', schema)
