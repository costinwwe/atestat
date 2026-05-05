import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'
import { createPoll, createOption } from '../api.js'

export default function CreatePoll() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [options, setOptions] = useState(['', '', ''])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdPollId, setCreatedPollId] = useState(null)

  if (!user) {
    return (
      <section className="page page-create-poll">
        <h1>Create poll</h1>
        <p>You must sign in first.</p>
        <Link to="/login" className="button button--secondary">Go to login</Link>
      </section>
    )
  }

  if (user.role !== 'organizer') {
    return (
      <section className="page page-create-poll">
        <h1>Create poll</h1>
        <p>Only organizers can create polls.</p>
        <Link to="/" className="button button--secondary">Back to home</Link>
      </section>
    )
  }

  const updateOption = (index, value) => {
    setOptions((current) => current.map((item, idx) => (idx === index ? value : item)))
  }

  const handleAddOption = () => setOptions((current) => [...current, ''])

  const handleCopyLink = async () => {
    const link = `http://localhost:5173/polls/${createdPollId}`
    try {
      await navigator.clipboard.writeText(link)
      alert('Link copied to clipboard!')
    } catch (err) {
      alert('Failed to copy link. Please copy manually.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const trimmedOptions = options.map((item) => item.trim()).filter(Boolean)
    if (!title.trim() || !closesAt.trim()) {
      setError('Please complete all required fields.')
      return
    }
    if (trimmedOptions.length < 2) {
      setError('Add at least two options.')
      return
    }

    setSubmitting(true)
    try {
      const result = await createPoll({
        organizer_id: user.user_id || user.id,
        title: title.trim(),
        description: description.trim(),
        closes_at: closesAt,
      })
      const locationHeader = result?.headers?.get?.('Location') || result?.headers?.get?.('location')
      const pollIdFromLocation = locationHeader ? locationHeader.split('/').pop() : null
      const pollId =
        result?.data?.poll_id ||
        result?.data?.id ||
        result?.data?.pollId ||
        result?.data?.items?.[0]?.poll_id ||
        pollIdFromLocation

      if (!pollId) {
        setMessage('Poll created successfully, but the created poll ID was not returned.')
        setCreatedPollId(null)
        navigate('/')
        return
      }

      await Promise.all(
        trimmedOptions.map((optionText) =>
          createOption({ poll_id: pollId, option_text: optionText }),
        ),
      )

      setCreatedPollId(pollId)
      setMessage('Poll created successfully!')
    } catch (err) {
      setError(err.message || 'Unable to create poll.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page page-create-poll">
      <h1>Create poll</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          Title
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="label">
          Description
          <textarea
            className="textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
        </label>

        <label className="label">
          Closes at
          <input
            className="input"
            type="datetime-local"
            value={closesAt}
            onChange={(event) => setClosesAt(event.target.value)}
            required
          />
        </label>

        <div className="field-group">
          <p className="legend">Options</p>
          {options.map((option, index) => (
            <label className="label" key={index}>
              Option {index + 1}
              <input
                className="input"
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                required={index < 2}
              />
            </label>
          ))}
          <button type="button" className="button button--secondary" onClick={handleAddOption}>
            Add option
          </button>
        </div>

        {error && <div className="message message--error">{error}</div>}
        {message && <div className="message message--success">{message}</div>}

        {createdPollId && (
          <div className="share-box">
            <p>Share this link with others to let them vote:</p>
            <div className="copy-link__row">
              <input
                type="text"
                className="input copy-link__input"
                value={`http://localhost:5173/polls/${createdPollId}`}
                readOnly
              />
              <button type="button" className="button button--secondary" onClick={handleCopyLink}>
                Copy to Clipboard
              </button>
            </div>
            <p style={{ marginTop: '0.5rem' }}>
              <Link to={`/polls/${createdPollId}`}>View poll</Link> | <Link to={`/polls/${createdPollId}/results`}>View results</Link>
            </p>
          </div>
        )}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create poll'}
        </button>
      </form>
    </section>
  )
}
