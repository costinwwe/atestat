import { Link } from 'react-router-dom'

export default function PollCard({ poll }) {
  const pollId = poll.poll_id || poll.id || poll.ID
  const closesAt = poll.closes_at || poll.CLOSES_AT
  const isClosed = closesAt && new Date(closesAt) < new Date()

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <li className="poll-card">
      <div className="poll-card__header">
        <h2 className="poll-card__title">{poll.title || poll.TITLE}</h2>
        <span className={`poll-badge ${isClosed ? 'closed' : 'open'}`}>
          {isClosed ? 'Closed' : 'Open'}
        </span>
      </div>

      {(poll.description || poll.DESCRIPTION) && (
        <p className="poll-card__description">{poll.description || poll.DESCRIPTION}</p>
      )}

      <p className="poll-card__meta">
        {isClosed ? 'Closed' : 'Closes'} {formatDate(closesAt)}
        {poll.organizer ? ` · ${poll.organizer}` : ''}
      </p>

      <div className="poll-card__actions">
        {!isClosed && (
          <Link to={`/polls/${pollId}`} className="button">
            Vote
          </Link>
        )}
        <Link to={`/polls/${pollId}/results`} className="button button--secondary">
          Results
        </Link>
      </div>
    </li>
  )
}