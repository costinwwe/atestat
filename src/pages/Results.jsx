import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults } from '../api.js'

function normalizeResults(rawResults) {
  if (!rawResults) return []
  if (Array.isArray(rawResults)) return rawResults

  const arrayKeys = ['options', 'items', 'results', 'data', 'rows']
  for (const key of arrayKeys) {
    if (Array.isArray(rawResults[key])) {
      return rawResults[key]
    }
  }

  const nestedArray = Object.values(rawResults).find((value) => Array.isArray(value))
  if (Array.isArray(nestedArray)) {
    return nestedArray
  }

  return []
}

function formatOption(option, index) {
  if (option == null) {
    return { key: `option-${index}`, label: `Option ${index + 1}`, count: 0 }
  }

  if (typeof option === 'string' || typeof option === 'number') {
    return { key: String(option), label: String(option), count: 0 }
  }

  const label =
    option.option_text ||
    option.OPTION_TEXT ||
    option.text ||
    option.TEXT ||
    option.label ||
    option.name ||
    option.NAME ||
    option.title ||
    option.TITLE ||
    `Option ${index + 1}`

  const count =
    option.vote_count ??
    option.VOTE_COUNT ??
    option.count ??
    option.total ??
    option.TOTAL ??
    option.votes ??
    option.VOTES ??
    0

  const key =
    option.option_id ||
    option.id ||
    option.OPTION_ID ||
    option.ID ||
    label ||
    `option-${index}`

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
    return (
      <section className="page page-results">
        <h1>Results</h1>
        <p>No results available.</p>
        <Link to={`/polls/${id}`} className="button button--secondary">Back to poll</Link>
      </section>
    )
  }

  return (
    <section className="page page-results">
      <h1>Poll results</h1>
      {formattedOptions.length === 0 ? (
        <p>No votes have been recorded yet or results are not available.</p>
      ) : (
        <ul className="result-list">
          {formattedOptions.map(({ key, label, count }) => (
            <li key={key} className="result-item">
              <strong>{label}</strong>: {count}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Link to={`/polls/${id}`} className="button button--secondary">Back to poll</Link>
      </div>
    </section>
  )
}
