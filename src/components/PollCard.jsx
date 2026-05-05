import { Link } from 'react-router-dom'

export default function PollCard({ poll }) {
  const pollId = poll.poll_id || poll.id || poll.ID

  return (
    <li className="poll-card">
      <div>
        <h2 className="poll-card__title">{poll.title || poll.TITLE}</h2>
        {poll.description || poll.DESCRIPTION ? (
          <p className="poll-card__description">{poll.description || poll.DESCRIPTION}</p>
        ) : null}
        <p className="poll-card__meta">Closes at: {poll.closes_at || poll.CLOSES_AT}</p>
      </div>
      <div className="poll-card__actions">
        <Link to={`/polls/${pollId}`} className="button button--secondary">
          Vote / details
        </Link>
        <Link to={`/polls/${pollId}/results`} className="button button--secondary">
          Results
        </Link>
      </div>
    </li>
  )
}
