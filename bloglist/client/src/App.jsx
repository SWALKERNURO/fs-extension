import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useBlogStore } from './store'
import { useField } from './hooks'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import ErrorBoundary from './components/ErrorBoundary'
import { Navigation, Notification, BlogCard, StyledForm } from './ui'

const NotFound = () => (
  <section>
    <h2>Page not found</h2>
    <p>Use the navigation to return to blogs.</p>
  </section>
)
function BlogList() {
  const blogs = useBlogStore((state) => state.blogs)
  const loading = useBlogStore((state) => state.loading)
  const error = useBlogStore((state) => state.loadError)
  const loadBlogs = useBlogStore((state) => state.actions.loadBlogs)
  return (
    <section>
      <h1>blogs</h1>
      {loading && <p>Loading blogs.</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={loadBlogs}>retry</button>
        </p>
      )}
      {!loading && !error && blogs.length === 0 && <p>No blogs yet.</p>}
      {blogs
        .toSorted((a, b) => b.likes - a.likes)
        .map((blog) => (
          <article className="blog" key={blog.id}>
            <Link to={'/blogs/' + blog.id}>{blog.title}</Link> {blog.author}
          </article>
        ))}
    </section>
  )
}
function BlogPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const blogs = useBlogStore((state) => state.blogs)
  const user = useBlogStore((state) => state.user)
  const loading = useBlogStore((state) => state.loading)
  const loadError = useBlogStore((state) => state.loadError)
  const actions = useBlogStore((state) => state.actions)
  const comment = useField('text')
  const [busy, setBusy] = useState(false)
  const blog = blogs.find((item) => item.id === id)
  const report = (error) =>
    actions.notify(error.response?.data?.error || error.message || 'Request failed', true)
  const like = async () => {
    setBusy(true)
    try {
      await actions.like(blog)
    } catch (error) {
      report(error)
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (!window.confirm('Remove ' + blog.title + '?')) return
    setBusy(true)
    try {
      await actions.remove(blog)
      navigate('/')
    } catch (error) {
      report(error)
    } finally {
      setBusy(false)
    }
  }
  const submitComment = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await actions.addComment(id, comment.value.trim())
      comment.reset()
    } catch (error) {
      report(error)
    } finally {
      setBusy(false)
    }
  }
  if (loading) return <p>Loading blog.</p>
  if (loadError) return <p role="alert">{loadError}</p>
  if (!blog) return <NotFound />
  if (!blog.user) throw new Error('Blog creator data is unavailable')
  const safeUrl = /^https?:\/\//i.test(blog.url)
  return (
    <BlogCard aria-label={blog.title}>
      <h2>{blog.title}</h2>
      <p>By {blog.author || 'unknown author'}</p>
      <p>
        {safeUrl ? (
          <a href={blog.url} target="_blank" rel="noreferrer">
            {blog.url}
          </a>
        ) : (
          blog.url
        )}
      </p>
      <p>
        Likes <span className="like-count">{blog.likes}</span>{' '}
        {user && (
          <button disabled={busy} onClick={like}>
            like
          </button>
        )}
      </p>
      <p>Added by {blog.user.name || blog.user.username}</p>
      {user?.username === blog.user.username && (
        <button className="remove" disabled={busy} onClick={remove}>
          remove
        </button>
      )}
      <h3>comments</h3>
      <StyledForm onSubmit={submitComment}>
        <label>
          Comment
          <input {...comment.inputProps} required maxLength={2000} />
        </label>
        <button disabled={busy}>add comment</button>
      </StyledForm>
      <ul>
        {(blog.comments || []).map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </BlogCard>
  )
}
function UsersPage({ individual = false }) {
  const { id } = useParams()
  const users = useBlogStore((state) => state.users)
  const loadUsers = useBlogStore((state) => state.actions.loadUsers)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        await loadUsers()
      } catch {
        if (active) setError('Could not load users.')
      } finally {
        if (active) setPending(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [loadUsers])
  if (pending) return <p>Loading users.</p>
  if (error) return <p role="alert">{error}</p>
  if (individual) {
    const user = users.find((item) => item.id === id)
    if (!user) return <NotFound />
    return (
      <section>
        <h2>{user.name || user.username}</h2>
        <h3>added blogs</h3>
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>
              <Link to={'/blogs/' + blog.id}>{blog.title}</Link>
            </li>
          ))}
        </ul>
        {user.blogs.length === 0 && <p>No blogs added yet.</p>}
      </section>
    )
  }
  return (
    <section>
      <h2>users</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <Link to={'/users/' + user.id}>{user.name || user.username}</Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
export default function App() {
  const user = useBlogStore((state) => state.user)
  const notice = useBlogStore((state) => state.notice)
  const actions = useBlogStore((state) => state.actions)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    actions.loadBlogs()
  }, [actions])
  const report = (error) => {
    if (error.response?.status === 401) actions.logout()
    actions.notify(error.response?.data?.error || error.message || 'Request failed', true)
  }
  const login = async (credentials) => {
    try {
      await actions.login(credentials)
      navigate('/')
    } catch {
      actions.notify('Wrong username or password, or login unavailable.', true)
    }
  }
  const create = async (values) => {
    try {
      await actions.create(values)
      navigate('/')
      return true
    } catch (error) {
      report(error)
      return false
    }
  }
  return (
    <main>
      <Navigation aria-label="Main navigation">
        <NavLink to="/" end>
          blogs
        </NavLink>
        <NavLink to="/users">users</NavLink>
        {user ? (
          <>
            <NavLink to="/create">new blog</NavLink>
            <span>{user.name || user.username} logged in</span>
            <button
              onClick={() => {
                actions.logout()
                navigate('/')
              }}
            >
              logout
            </button>
          </>
        ) : (
          <NavLink to="/login">login</NavLink>
        )}
      </Navigation>
      {notice && (
        <Notification $error={notice.error} role={notice.error ? 'alert' : 'status'}>
          {notice.text}
        </Notification>
      )}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginForm onLogin={login} />}
          />
          <Route
            path="/create"
            element={
              user ? (
                <BlogForm onCreate={create} onCancel={() => navigate('/')} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/blogs/:id" element={<BlogPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UsersPage individual />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </main>
  )
}
