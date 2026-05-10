import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults } from '../api.js'

function normalizeResults(rawResults) {
  if (!rawResults) return []
  if (Array.isArray(rawResults)) return rawResults
  const arrayKeys = ['results', 'options', 'items', 'data', 'rows']
  for (const key of arrayKeys) {
    if (Array.isArray(rawResults[key])) return rawResults[key]
  }
  const nestedArray = Object.values(rawResults).find((v) => Array.isArray(v))
  return Array.isArray(nestedArray) ? nestedArray : []
}

function formatOption(option, index) {
  if (option == null) return { key: `option-${index}`, label: `Option ${index + 1}`, count: 0 }
  if (typeof option === 'string' || typeof option === 'number') return { key: String(option), label: String(option), count: 0 }

  const label =
    option.option || option.OPTION || option.option_text || option.OPTION_TEXT ||
    option.text || option.TEXT || option.label || `Option ${index + 1}`

  const count =
    option.votes ?? option.VOTES ?? option.vote_count ?? option.VOTE_COUNT ?? option.count ?? 0

  const key = option.option_id || option.id || option.OPTION_ID || label || `option-${index}`
  return { key, label, count }
}

export default function Results() {
  const { id } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getResults(id)
      .then((result) => setResults(result))
      .catch((err) => setError(err.message || 'Unable to load results.'))
      .finally(() => setLoading(false))
  }, [id])

  const options = useMemo(() => normalizeResults(results), [results])
  const formattedOptions = options.map(formatOption)
  const totalVotes = formattedOptions.reduce((sum, o) => sum + Number(o.count), 0)

  if (loading) return <p className="text-muted">Loading results...</p>

  if (error) return (
    <section className="page page-results">
      <div className="page-header"><h1>Results</h1></div>
      <div className="message message--error">{error}</div>
      <Link to={`/polls/${id}`} className="button button--secondary" style={{ marginTop: '1rem' }}>Back to poll</Link>
    </section>
  )

  if (!results) return (
    <section className="page page-results">
      <div className="page-header"><h1>Results</h1></div>
      <p className="text-muted">No results available.</p>
    </section>
  )

  return (
    <section className="page page-results">
      <div className="page-header">
        <h1>{results.title || 'Poll results'}</h1>
        <p>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} total</p>
      </div>

      {formattedOptions.length === 0 ? (
        <div className="empty-state">No votes have been recorded yet.</div>
      ) : (
        <ul className="result-list">
          {formattedOptions.map(({ key, label, count }) => (
            <li key={key} className="result-item">
              <strong>{label}</strong>
              <span className="result-count">{count} vote{count !== 1 ? 's' : ''}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to={`/polls/${id}`} className="button button--secondary">Back to poll</Link>
      </div>
    </section>
  )
}