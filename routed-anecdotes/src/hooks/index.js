import { useContext, useState } from 'react'
import { AnecdoteContext } from './context'

export const useField = type => {
  const [value, setValue] = useState('')
  const onChange = event => setValue(event.target.value)
  const reset = () => setValue('')
  return { type, value, onChange, reset, inputProps: { type, value, onChange } }
}
export const useAnecdotes = () => {
  const context = useContext(AnecdoteContext)
  if (!context) throw new Error('AnecdoteProvider is missing')
  const { anecdotes, addAnecdote, deleteAnecdote, loading, error } = context
  return { anecdotes, addAnecdote, deleteAnecdote, loading, error }
}
