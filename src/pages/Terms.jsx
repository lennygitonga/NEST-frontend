import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

function Terms() {
  const [terms, setTerms] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/terms/current/')
      .then((response) => setTerms(response.data))
      .catch(() => setError('Could not load the Terms and Conditions. Please try again later.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-sand px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link to="/register" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
          ← Back to sign up
        </Link>

        <h1
          className="text-3xl text-charcoal mt-6 mb-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          Terms and Conditions
        </h1>

        {isLoading && (
          <p className="text-charcoal/60 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Loading...
          </p>
        )}

        {error && (
          <div className="mt-6 text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {terms && (
          <>
            <p className="text-charcoal/50 text-sm mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              Version {terms.version}
            </p>
            <div
              className="text-charcoal whitespace-pre-wrap leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {terms.content}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Terms