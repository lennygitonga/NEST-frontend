import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'

const STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  APPROVED: 'border-olive/20 bg-olive/5 text-olive',
  REJECTED: 'border-brick/20 bg-brick/5 text-brick',
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
      setError('Could not establish application pipeline synchronization.')
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
      setError('Application status migration failed.')
    } finally {
      setReviewing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const pending = applications.filter((a) => a.status === 'PENDING')
  const reviewed = applications.filter((a) => a.status !== 'PENDING')

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Brokerage Portal</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Tenant Acquisition Arrays</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Applications Desk
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Review and provision tenancy clearance vectors requested across managed properties.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            De-serializing incoming routing payloads...
          </div>
        )}

        {error && (
          <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              Zero tenant placement intent structures recorded in active workspace registers.
            </p>
          </div>
        )}

        {/* Pending Section */}
        {pending.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Pending Evaluation Contexts ]
            </h2>
            <div className="space-y-4">
              {pending.map((app) => (
                <div key={app.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/30 block">
                        Placement ID: #{app.id} · Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      <h3 className="text-base font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                        {app.propertyDetail?.title || `Property Node #${app.property}`}
                      </h3>
                      <p className="text-xs font-mono text-charcoal/40">
                        {app.propertyDetail?.city || 'Location Pending'} <span className="text-clay/30 mx-1">·</span> KSh {Number(app.propertyDetail?.rent_amount || 0).toLocaleString()}<span className="text-[10px]">/mo</span>
                      </p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {app.message && (
                    <div className="bg-sand/40 border border-clay/10 rounded-xl p-4">
                      <p className="text-sm font-light text-charcoal/80 italic leading-relaxed font-sans">
                        "{app.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-clay/5">
                    <button
                      onClick={() => handleReview(app.id, 'APPROVED')}
                      disabled={!!reviewing[app.id]}
                      className="bg-olive text-sand px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider text-2xs hover:opacity-90 transition disabled:opacity-40"
                    >
                      {reviewing[app.id] === 'APPROVED' ? 'Authorizing...' : 'Grant Access'}
                    </button>
                    <button
                      onClick={() => handleReview(app.id, 'REJECTED')}
                      disabled={!!reviewing[app.id]}
                      className="bg-brick text-sand px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider text-2xs hover:opacity-90 transition disabled:opacity-40"
                    >
                      {reviewing[app.id] === 'REJECTED' ? 'Denying...' : 'Drop Connection'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Section */}
        {reviewed.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Historical Application Archive ]
            </h2>
            <div className="space-y-3">
              {reviewed.map((app) => (
                <div key={app.id} className="bg-white/60 border border-clay/10 rounded-xl p-5 shadow-sm opacity-65 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-md font-light text-charcoal/70 tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                      {app.propertyDetail?.title || `Property Matrix #${app.property}`}
                    </h3>
                    <p className="text-[10px] font-mono text-charcoal/40">
                      Evaluated Log Vector: {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'Instantaneous Mutation'}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${STATUS_STYLES[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyApplications