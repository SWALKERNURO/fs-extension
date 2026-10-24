import { useState } from 'react'
import { useField } from '../hooks'
import { StyledForm } from '../ui'
export default function BlogForm({ onCreate, onCancel }) {
  const title = useField('text')
  const author = useField('text')
  const url = useField('url')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      if (
        (await onCreate({
          title: title.value.trim(),
          author: author.value.trim(),
          url: url.value.trim(),
        })) !== false
      ) {
        title.reset()
        author.reset()
        url.reset()
      }
    } finally {
      setBusy(false)
    }
  }
  return (
    <section>
      <h2>create new blog</h2>
      <StyledForm onSubmit={submit}>
        <label>
          Title
          <input {...title.inputProps} required />
        </label>
        <label>
          Author
          <input {...author.inputProps} />
        </label>
        <label>
          URL
          <input {...url.inputProps} pattern="https?://.+" required />
        </label>
        <button disabled={busy}>create</button>
        <button type="button" disabled={busy} onClick={onCancel}>
          cancel
        </button>
      </StyledForm>
    </section>
  )
}
