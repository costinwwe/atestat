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

    if (!user) {
      navigate('/login')
      return
    }

    if (!selectedOption) {
      setError('Select an option before voting.')
      return
    }

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

  if (loading) {
    return <p>Loading poll...</p>
  }

  if (!poll) {
    return <p>{error || 'Poll not found.'}</p>
  }

  const options = Array.isArray(poll.options)
    ? poll.options
    : poll.OPTIONS || poll.options_list || []

  const closesAt = poll.closes_at || poll.CLOSES_AT
  const isClosed =
    poll.is_closed === 1 ||
    poll.is_closed === '1' ||
    poll.is_closed === true ||
    (closesAt && new Date(closesAt) < new Date())

  return (
    <section className="page page-vote">
      <h1>{poll.title || poll.TITLE}</h1>
      <p className="text-muted">{poll.description || poll.DESCRIPTION}</p>
      <p className="text-muted">Closes at: {closesAt}</p>
      <p className="text-muted">Status: {isClosed ? 'Closed' : 'Open'}</p>

      {isClosed ? (
        <div className="field-group">
          <p>This poll is closed. View the results.</p>
          <Link to={`/polls/${id}/results`} className="button button--secondary">
            See results
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleVote}>
          <fieldset className="fieldset" disabled={hasVoted}>
            <legend className="legend">Select an option</legend>
            {options.length === 0 ? (
              <p>No options available.</p>
            ) : (
              options.map((option) => {
                const value = option.option_id || option.id || option.OPTION_ID
                const label = option.option_text || option.OPTION_TEXT || option.text || option.TEXT
                return (
                  <label className="label" key={value}>
                    <input
                      type="radio"
                      name="pollOption"
                      value={value}
                      checked={String(selectedOption) === String(value)}
                      onChange={(event) => setSelectedOption(event.target.value)}
                    />{' '}
                    {label}
                  </label>
                )
              })
            )}
          </fieldset>
          {error && <div className="message message--error">{error}</div>}
          {message && <div className="message message--success">{message}</div>}
          {hasVoted && (
            <p>
              <Link to={`/polls/${id}/results`} className="button button--secondary">
                See results
              </Link>
            </p>
          )}
          <button type="submit" className="button" disabled={hasVoted}>
            {hasVoted ? 'Vote submitted' : 'Vote'}
          </button>
        </form>
      )}
    </section>
  )
}