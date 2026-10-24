process.env.NODE_ENV = 'test'
process.env.TEST_MONGODB_URI ||= 'mongodb://127.0.0.1:27017/bloglist_test'
process.env.SECRET ||= 'local-test-only-secret-32-characters-minimum'
await import('./index.js')
