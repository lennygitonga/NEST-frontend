import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  APPROVED: 'bg-olive/10 text-olive',
  REJECTED: 'bg-brick/10 text-brick',
}

function AgencyApplications() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState({})

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/properties/applications/')
      const apps = response.data

      const withDetails = await Promise.all(
        apps.map(async (app) => {
          try {
            const propRes = await apiClient.get(`/api/properties/${app.property}/`)
            return { ...app, propertyDetail: propRes.data }
          } catch {
            return { ...app, propertyDetail: null }
          }
        })
      )
      setApplications(withDetails)
    } catch {
      setError('Could not load applications.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleReview = async (id, status) => {
    setReviewing((prev) => ({ ...prev, [id]: status }))
    try {
      await apiClient.patch(`/api/properties/applications/${id}/review/`, { status })
      fetchApplications()
    } catch {
      // silently fail
    } finally {
      setReviewing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const pending = applications.filter((a) => a.status === 'PENDING')
  const reviewed = applications.filter((a) => a.status !== 'PENDING')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Applications
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Review and respond to tenant applications.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No applications yet.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Pending review
          </h2>
          <div className="space-y-4">
            {pending.map((app) => (
              <div key={app.id} className="bg-white border border-clay/15 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                      {app.propertyDetail?.title || `Property #${app.property}`}
                    </p>
                    <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {app.propertyDetail?.city} · KSh {Number(app.propertyDetail?.rent_amount || 0).toLocaleString()}/mo
                    </p>
                    <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[app.status]}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {app.status}
                  </span>
                </div>

                {app.message && (
                  <p className="text-sm text-charcoal/70 bg-sand rounded-lg px-3 py-2 mb-4 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                    "{app.message}"
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(app.id, 'APPROVED')}
                    disabled={!!reviewing[app.id]}
                    className="bg-olive text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {reviewing[app.id] === 'APPROVED' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReview(app.id, 'REJECTED')}
                    disabled={!!reviewing[app.id]}
                    className="bg-brick text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {reviewing[app.id] === 'REJECTED' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Reviewed
          </h2>
          <div className="space-y-3">
            {reviewed.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-clay/15 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                    {app.propertyDetail?.title || `Property #${app.property}`}
                  </p>
                  <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Reviewed {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[app.status]}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencyApplications