import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api.js'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('voter')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password: password.trim(), role })
      setSuccess('Registration successful. You may sign in now.')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      setError(err.message || 'Could not register.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page page-auth">
      <h1>Register</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          Username
          <input
            className="input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
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
        <label className="label">
          Role
          <select
            className="select"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="voter">Voter</option>
            <option value="organizer">Organizer</option>
          </select>
        </label>
        {error && <div className="message message--error">{error}</div>}
        {success && <div className="message message--success">{success}</div>}
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  )
}
