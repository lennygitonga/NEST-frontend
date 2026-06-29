import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

const STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  APPROVED: 'bg-olive/10 text-olive',
  REJECTED: 'bg-brick/10 text-brick',
}

function Applications() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/applications/')
      .then(async (response) => {
        const apps = response.data

        const withProperties = await Promise.all(
          apps.map(async (app) => {
            try {
              const propRes = await apiClient.get(`/api/properties/${app.property}/`)
              return { ...app, propertyDetail: propRes.data }
            } catch {
              return { ...app, propertyDetail: null }
            }
          })
        )

        setApplications(withProperties)
      })
      .catch(() => setError('Could not load your applications.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Applications
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Track the status of properties you've applied for.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading...
        </p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            You haven't applied to any properties yet.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Browse properties
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-clay/15 rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <Link
                to={`/properties/${app.property}`}
                className="text-charcoal font-medium hover:text-clay transition truncate block"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {app.propertyDetail?.title || `Property #${app.property}`}
              </Link>
              {app.propertyDetail && (
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {app.propertyDetail.city} · KSh {Number(app.propertyDetail.rent_amount).toLocaleString()}/mo
                </p>
              )}
              <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                Applied {new Date(app.applied_at).toLocaleDateString()}
              </p>
            </div>

            <span
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[app.status]}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Applications