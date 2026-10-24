export const dummy = _blogs => 1
export const totalLikes = blogs => blogs.reduce((total, blog) => total + blog.likes, 0)
export const favoriteBlog = blogs => blogs.reduce((favorite, blog) => !favorite || blog.likes > favorite.likes ? blog : favorite, null)

const aggregateAuthors = (blogs, value, property) => {
  const totals = new Map()
  for (const blog of blogs) totals.set(blog.author, (totals.get(blog.author) || 0) + value(blog))
  let winner = null
  for (const [author, total] of totals) {
    if (!winner || total > winner[property]) winner = { author, [property]: total }
  }
  return winner
}
export const mostBlogs = blogs => aggregateAuthors(blogs, () => 1, 'blogs')
export const mostLikes = blogs => aggregateAuthors(blogs, blog => blog.likes, 'likes')
