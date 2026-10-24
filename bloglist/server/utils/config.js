import 'dotenv/config'

export const port = Number(process.env.PORT || 3001)
export const mongoUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
export const tokenSecret = process.env.SECRET
export const validateConfig = () => {
  if (!mongoUri) throw new Error('Configure a database URI for this environment')
  if (!tokenSecret || Buffer.byteLength(tokenSecret) < 32) throw new Error('SECRET must contain at least 32 bytes')
}
