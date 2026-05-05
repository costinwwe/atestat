import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'
import { login } from '../api.js'

export default function SignIn() {
  const { setUser } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Complete both email and password.')
      return
    }
    setSubmitting(true)
    try {
      const result = await login({ email: email.trim(), password: password.trim() })
      const userData = result?.user || result
      setUser(userData)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page page-auth">
      <h1>Sign In</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="label">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <div className="message message--error">{error}</div>}
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p>
        New user? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}
