import { useEffect, useState } from 'react'
import anecdoteService from '../services/anecdotes'
import { AnecdoteContext } from './context'
export default function AnecdoteProvider({ children }) {
  const [anecdotes, setAnecdotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      try { const data = await anecdoteService.getAll(); if (active) setAnecdotes(data) }
      catch (error) { if (active) setError(error.message) }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [])
  const addAnecdote = async values => {
    const created = await anecdoteService.createNew(values)
    setAnecdotes(current => [...current, created])
  }
  const deleteAnecdote = async id => {
    await anecdoteService.remove(id)
    setAnecdotes(current => current.filter(anecdote => anecdote.id !== id))
  }
  return <AnecdoteContext value={{ anecdotes, addAnecdote, deleteAnecdote, loading, error }}>{children}</AnecdoteContext>
}
