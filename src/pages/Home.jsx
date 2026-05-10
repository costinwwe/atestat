import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'
import { getPolls } from '../api.js'
import PollCard from '../components/PollCard.jsx'

export default function Home() {
  const { user } = useContext(AuthContext)
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getPolls()
      .then((result) => {
        const list = Array.isArray(result) ? result : result?.items || []
        setPolls(list)
      })
      .catch((err) => setError(err.message || 'Unable to load polls.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page page-home">
      <div className="page-header">
        <h1>Active polls</h1>
        <p>Browse and vote on open polls below.</p>
      </div>

      {user ? (
        <div className="user-pill">
          <span className="user-pill__dot" />
          Signed in as <strong style={{ marginLeft: 4 }}>{user.username || user.email}</strong>
          <span style={{ opacity: 0.5, margin: '0 2px' }}>·</span>
          {user.role}
        </div>
      ) : (
        <div className="message message--info" style={{ marginBottom: '1.5rem' }}>
          <Link to="/login">Sign in</Link> or <Link to="/register">register</Link> to vote.
        </div>
      )}

      {user?.role === 'organizer' && (
        <div className="home-banner">
          <p>You can create and manage polls as an organizer.</p>
          <Link to="/polls/create" className="button" style={{ flexShrink: 0 }}>
            Create poll
          </Link>
        </div>
      )}

      {loading && <p className="text-muted">Loading polls...</p>}
      {error && <div className="message message--error">{error}</div>}

      {!loading && polls.length === 0 ? (
        <div className="empty-state">No active polls found.</div>
      ) : (
        <ul className="poll-list">
          {polls.map((poll) => (
            <PollCard key={poll.poll_id || poll.id || poll.id_poll} poll={poll} />
          ))}
        </ul>
      )}
    </section>
  )
}