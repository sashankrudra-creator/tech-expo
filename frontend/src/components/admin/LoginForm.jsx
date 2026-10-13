import { useState } from 'react'
import Logo from '../Logo'
import { api, setToken, isMock } from '../../api/client'

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState(isMock ? 'admin' : '')
  const [password, setPassword] = useState(isMock ? 'preview' : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username || !password) return setError('Enter your username and password.')
    setBusy(true); setError('')
    try {
      const { token } = await api.login({ username: username.trim(), password })
      setToken(token); onSuccess()
    } catch (err) {
      setError(err.status === 401 ? 'Wrong username or password.' : err.message)
    } finally { setBusy(false) }
  }

  return (
    <form className="login" onSubmit={submit} noValidate>
      <Logo className="mb" />
      <h2>Admin login</h2>
      <p className="sub">Only organisers can see participant details.</p>
      <div className="field"><label htmlFor="au">Username</label><input id="au" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></div>
      <div className="field"><label htmlFor="ap">Password</label><input id="ap" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
      {error && <div className="msg bad">{error}</div>}
      <button className="cta submit" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Log in'}</button>
      {isMock && <p className="demo">Preview: any password works. The real login is checked by the backend .env.</p>}
    </form>
  )
}
