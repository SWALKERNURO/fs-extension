import { useState } from 'react'
export const useField = (type) => {
  const [value, setValue] = useState('')
  const onChange = (event) => setValue(event.target.value)
  return { value, reset: () => setValue(''), inputProps: { type, value, onChange } }
}
