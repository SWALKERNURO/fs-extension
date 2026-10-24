import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useField, useAnecdotes } from '../hooks'
export default function CreateNew() {
  const content = useField('text')
  const author = useField('text')
  const info = useField('url')
  const { addAnecdote } = useAnecdotes()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault(); setPending(true); setError('')
    try { await addAnecdote({ content: content.value.trim(), author: author.value.trim(), info: info.value.trim(), votes: 0 }); navigate('/') }
    catch (error) { setError(error.message) }
    finally { setPending(false) }
  }
  const reset = () => { content.reset(); author.reset(); info.reset(); setError('') }
  return <section><h2>create a new anecdote</h2>
    {error && <p role="alert">{error}</p>}
    <form onSubmit={submit}>
      <label>content <input name="content" {...content.inputProps} required /></label>
      <label>author <input name="author" {...author.inputProps} /></label>
      <label>url for more info <input name="info" {...info.inputProps} /></label>
      <button disabled={pending}>create</button><button type="button" disabled={pending} onClick={reset}>reset</button>
    </form>
  </section>
}
