import { useState } from 'react'
import { useAnecdotes } from '../hooks'
export default function AnecdoteList() {
  const { anecdotes, deleteAnecdote, loading, error } = useAnecdotes()
  const [pending, setPending] = useState(null)
  const [failure, setFailure] = useState('')
  const remove = async id => {
    setPending(id)
    try { await deleteAnecdote(id) }
    catch (error) { setFailure(error.message) }
    finally { setPending(null) }
  }
  return <section><h2>Anecdotes</h2>
    {loading && <p>loading...</p>}{(error || failure) && <p role="alert">{error || failure}</p>}
    <ul>{anecdotes.map(anecdote => <li key={anecdote.id}>{anecdote.content} <button disabled={pending !== null} onClick={() => remove(anecdote.id)}>delete</button></li>)}</ul>
  </section>
}
