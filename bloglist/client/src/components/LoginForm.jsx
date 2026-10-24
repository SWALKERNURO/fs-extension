import { useState } from 'react'
import { useField } from '../hooks'
import { StyledForm } from '../ui'
export default function LoginForm({ onLogin }) {
  const username = useField('text')
  const password = useField('password')
  const [busy, setBusy] = useState(false)
  const submit = async event => {
    event.preventDefault(); setBusy(true)
    try { await onLogin({ username: username.value, password: password.value }) }
    finally { setBusy(false); password.reset() }
  }
  return <section><h1>login</h1><StyledForm onSubmit={submit}>
    <label>Username<input {...username.inputProps} autoComplete="username" required /></label>
    <label>Password<input {...password.inputProps} autoComplete="current-password" required /></label>
    <button disabled={busy}>login</button>
  </StyledForm></section>
}
