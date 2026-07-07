import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/client'

const STATUS_STYLES = {
  PENDING: 'border-clay/30 text-clay bg-clay/5',
  APPROVED: 'border-olive/30 text-olive bg-olive/5',
  REJECTED: 'border-brick/30 text-brick bg-brick/5',
}

function Applications() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/applications/')
      .then(async (response) => {
        const apps = response.data
        if (!Array.isArray(apps)) { setApplications([]); return; }

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
    <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
      {/* Header Section */}
      <div className="border-b border-clay/10 pb-6">
        <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Your Applications
        </h1>
        <p className="text-charcoal/50 text-sm font-light mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Review and monitor the status of your real estate lease filings.
        </p>
      </div>

      {isLoading && (
        <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest">Retrieving history...</p>
      )}

      {error && (
        <div className="text-xs text-brick font-mono border border-brick/10 bg-brick/5 rounded-lg p-4 max-w-max">
          {error}
        </div>
      )}

      {!isLoading && !error && (!Array.isArray(applications) || applications.length === 0) && (
        <div className="bg-clay/5 rounded-xl p-12 text-center max-w-xl border border-clay/10">
          <p className="text-charcoal/60 text-sm font-light mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            You haven't initiated any application profiles yet.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-charcoal text-sand text-xs font-medium tracking-wide px-5 py-2.5 rounded hover:bg-sienna transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Explore available properties
          </Link>
        </div>
      )}

      {/* Table-Like Premium List */}
      <div className="divide-y divide-clay/10">
        {Array.isArray(applications) && applications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-5 flex items-center justify-between gap-6 group"
          >
            <div className="min-w-0 space-y-1">
              <Link
                to={`/properties/${app.property}`}
                className="text-base text-charcoal font-light group-hover:text-sienna transition truncate block"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {app.propertyDetail?.title || `Property Asset #${app.property}`}
              </Link>
              {app.propertyDetail && (
                <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {app.propertyDetail.city} · <span className="font-medium text-charcoal/70">KSh {Number(app.propertyDetail.rent_amount).toLocaleString()}/mo</span>
                </p>
              )}
              <p className="text-[10px] text-charcoal/30 font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>
                Filed on {new Date(app.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <span
              className={`shrink-0 text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded border ${STATUS_STYLES[app.status] || 'border-clay/20'}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {app.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Applications