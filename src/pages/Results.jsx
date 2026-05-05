import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults } from '../api.js'

export default function Results() {
  const { id } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getResults(id)
      .then((result) => setResults(result))
      .catch((err) => setError(err.message || 'Unable to load results.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p>Loading results...</p>
  }

  if (error) {
    return (
      <section className="page page-results">
        <h1>Results</h1>
        <div className="message message--error">{error}</div>
        <Link to={`/polls/${id}`} className="button button--secondary">Back to poll</Link>
      </section>
    )
  }

  if (!results) {
    return <p>No results available.</p>
  }

  const options = Array.isArray(results.options)
    ? results.options
    : Array.isArray(results.items)
    ? results.items
    : results.RESULTS || []

  return (
    <section className="page page-results">
      <h1>Poll results</h1>
      {options.length === 0 ? (
        <p>No votes have been recorded yet or results are not available.</p>
      ) : (
        <ul className="result-list">
          {options.map((option) => {
            const label = option.option_text || option.OPTION_TEXT || option.text || option.TEXT || option.label
            const count = option.vote_count || option.VOTE_COUNT || option.count || 0
            return (
              <li key={option.option_id || option.id || option.OPTION_ID || label} className="result-item">
                <strong>{label}</strong>: {count}
              </li>
            )
          })}
        </ul>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Link to={`/polls/${id}`} className="button button--secondary">Back to poll</Link>
      </div>
    </section>
  )
}
