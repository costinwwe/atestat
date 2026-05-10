import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'
import { getPoll, vote } from '../api.js'

export default function Vote() {
  const { user } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPoll(id)
      .then((result) => setPoll(result))
      .catch((err) => setError(err.message || 'Unable to load poll.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleVote = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!user) { navigate('/login'); return }
    if (!selectedOption) { setError('Select an option before voting.'); return }

    try {
      const result = await vote({
        option_id: selectedOption,
        poll_id: id,
        user_id: user.user_id || user.id,
      })
      setMessage(result?.message || 'Vote registered successfully.')
      setHasVoted(true)
    } catch (err) {
      setError(err.message || 'Unable to submit vote.')
    }
  }

  if (loading) return <p className="text-muted">Loading poll...</p>
  if (!poll) return <p className="text-muted">{error || 'Poll not found.'}</p>

  const options = Array.isArray(poll.options) ? poll.options : poll.OPTIONS || []
  const closesAt = poll.closes_at || poll.CLOSES_AT
  const isClosed =
    poll.is_closed === 1 || poll.is_closed === '1' || poll.is_closed === true ||
    (closesAt && new Date(closesAt) < new Date())

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : ''

  return (
    <section className="page page-vote">
      <div className="vote-header">
        <h1>{poll.title || poll.TITLE}</h1>
        {(poll.description || poll.DESCRIPTION) && (
          <p style={{ marginTop: '0.25rem' }}>{poll.description || poll.DESCRIPTION}</p>
        )}
      </div>

      <div className="vote-meta">
        <span className="vote-meta-item">{isClosed ? 'Closed' : 'Closes'} {formatDate(closesAt)}</span>
        {poll.organizer && <span className="vote-meta-item">by {poll.organizer}</span>}
        <span className={`poll-badge ${isClosed ? 'closed' : 'open'}`}>{isClosed ? 'Closed' : 'Open'}</span>
      </div>

      {isClosed ? (
        <div className="closed-notice">
          <span>This poll is closed.</span>
          <Link to={`/polls/${id}/results`} className="button button--secondary" style={{ marginLeft: 'auto' }}>
            See results
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleVote}>
          <div className="field-group">
            <span className="legend">Select an option</span>
            <div className="vote-options">
              {options.length === 0 ? (
                <p className="text-muted">No options available.</p>
              ) : (
                options.map((option) => {
                  const value = option.option_id || option.id || option.OPTION_ID
                  const label = option.option_text || option.OPTION_TEXT || option.text || option.TEXT
                  return (
                    <label className="vote-option" key={value}>
                      <input
                        type="radio"
                        name="pollOption"
                        value={value}
                        checked={String(selectedOption) === String(value)}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        disabled={hasVoted}
                      />
                      {label}
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {error && <div className="message message--error">{error}</div>}
          {message && <div className="message message--success">{message}</div>}

          {hasVoted ? (
            <Link to={`/polls/${id}/results`} className="button">See results</Link>
          ) : (
            <button type="submit" className="button">Submit vote</button>
          )}
        </form>
      )}
    </section>
  )
}