import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '', trim: true },
  url: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  comments: { type: [{ type: String, trim: true, maxlength: 2000 }], default: [] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogUser', required: true },
})
schema.set('toJSON', { transform: (_document, object) => {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
} })
export default mongoose.model('Blog', schema)
