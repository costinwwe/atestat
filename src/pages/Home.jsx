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
      <h1>VoteSafe</h1>
      <p className="text-muted">Welcome to VoteSafe. Browse active polls and cast your vote.</p>

      {user ? (
        <div className="message message--success">
          Logged in as <strong>{user.username || user.email}</strong> ({user.role || 'voter'})
        </div>
      ) : (
        <div className="message message--info">
          <Link to="/login">Sign in</Link> or <Link to="/register">register</Link> to vote.
        </div>
      )}

      {user?.role === 'organizer' && (
        <div className="message message--info">
          <Link to="/polls/create">Create a new poll</Link>
        </div>
      )}

      {loading && <p>Loading polls...</p>}
      {error && <p className="message message--error">{error}</p>}

      {polls.length === 0 && !loading ? (
        <p>No active polls found.</p>
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
