import { useState } from 'react'

export default function Blog({ blog, user, onLike, onRemove, busy = false }) {
  const [expanded, setExpanded] = useState(false)
  const safeUrl = /^https?:\/\//i.test(blog.url)
  return <article className="blog" aria-label={blog.title}>
    <div className="blog-summary"><strong>{blog.title}</strong> <span>{blog.author}</span> <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'View'}</button></div>
    {expanded && <div className="blog-details">
      <p>{safeUrl ? <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a> : blog.url}</p>
      <p>Likes <span className="like-count">{blog.likes}</span> <button type="button" onClick={() => onLike(blog)} disabled={busy}>Like</button></p>
      <p>Added by {blog.user?.name || blog.user?.username || 'unknown user'}</p>
      {user?.username === blog.user?.username && <button className="remove" type="button" disabled={busy} onClick={() => onRemove(blog)}>Remove</button>}
    </div>}
  </article>
}
