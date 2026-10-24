import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } from '../utils/list_helper.js'

const blogs = [
  { title: 'Readable state', author: 'Maya', url: 'https://example.com/state', likes: 3 },
  { title: 'API boundaries', author: 'Leon', url: 'https://example.com/api', likes: 8 },
  { title: 'Small feedback loops', author: 'Maya', url: 'https://example.com/tests', likes: 6 },
]
test('dummy returns one for empty and populated input', () => {
  assert.equal(dummy([]), 1)
  assert.equal(dummy(blogs), 1)
})
describe('total likes', () => {
  test('empty list', () => assert.equal(totalLikes([]), 0))
  test('single blog', () => assert.equal(totalLikes([blogs[1]]), 8))
  test('multiple blogs', () => assert.equal(totalLikes(blogs), 17))
})
describe('favorite blog', () => {
  test('empty list', () => assert.equal(favoriteBlog([]), null))
  test('largest likes wins without changing input', () => {
    const original = structuredClone(blogs)
    assert.deepEqual(favoriteBlog(blogs), blogs[1])
    assert.deepEqual(blogs, original)
  })
  test('ties return one valid favorite', () => assert.equal(favoriteBlog([{ likes: 5 }, { likes: 5 }]).likes, 5))
})
describe('most blogs', () => {
  test('empty list', () => assert.equal(mostBlogs([]), null))
  test('counts entries by author', () => assert.deepEqual(mostBlogs(blogs), { author: 'Maya', blogs: 2 }))
  test('single author', () => assert.deepEqual(mostBlogs([blogs[1]]), { author: 'Leon', blogs: 1 }))
})
describe('most likes', () => {
  test('empty list', () => assert.equal(mostLikes([]), null))
  test('aggregates rather than selecting a single blog', () => assert.deepEqual(mostLikes(blogs), { author: 'Maya', likes: 9 }))
  test('all zero likes still has a winner', () => assert.deepEqual(mostLikes([{ author: 'Zero', likes: 0 }]), { author: 'Zero', likes: 0 }))
})
