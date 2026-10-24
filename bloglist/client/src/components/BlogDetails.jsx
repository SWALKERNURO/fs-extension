import { BlogCard } from '../ui.js'

export default function BlogDetails({ blog, user, onLike, onRemove, busy = false }) {
  const safeUrl = /^https?:\/\//i.test(blog.url)
  return <BlogCard aria-label={blog.title}>
    <h2>{blog.title}</h2><p>By {blog.author || 'unknown author'}</p>
    <p>{safeUrl ? <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a> : blog.url}</p>
    <p>Likes <span className="like-count">{blog.likes}</span>
      {user && <button type="button" disabled={busy} onClick={() => onLike(blog)}>Like</button>}
    </p>
    <p>Added by {blog.user?.name || blog.user?.username || 'unknown user'}</p>
    {user && user.username === blog.user?.username && <button className="remove" type="button" disabled={busy} onClick={() => onRemove(blog)}>Remove</button>}
  </BlogCard>
}
