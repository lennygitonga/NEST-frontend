import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white border border-clay/15 rounded-xl p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(34,31,28,0.08)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
      <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </p>
      <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-charcoal/40 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {sub}
        </p>
      )}
    </motion.div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function AgencyDashboard() {
  const user = useAuthStore((state) => state.user)
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/agencies/dashboard/'),
      apiClient.get('/api/payments/analytics/'),
    ]).then(([dashRes, analyticsRes]) => {
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data)
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
      if (dashRes.status === 'rejected') setError('Could not load dashboard data.')
    }).finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || 'there'

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Hello, {firstName}.
      </h1>
      <p className="text-charcoal/60 mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        Here's your agency overview.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {dashboard && (
        <>
          {!dashboard.is_verified && (
            <div className="bg-clay/10 border border-clay/20 rounded-xl p-4 mb-8">
              <p className="text-sm text-clay font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your agency is pending verification by NEST Admin. You won't be able to list properties until verified.
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Total properties"
              value={dashboard.total_properties}
              sub={`${dashboard.vacant_properties} vacant`}
              to="/agency/properties"
            />
            <StatCard
              label="Occupied"
              value={dashboard.occupied_properties}
              sub="active leases"
              to="/agency/leases"
            />
            <StatCard
              label="Landlords"
              value={dashboard.total_landlords}
              sub="active relationships"
              to="/agency/landlords"
            />
            <StatCard
              label="Commission rate"
              value={`${dashboard.commission_rate}%`}
              sub="of rent collected"
            />
          </div>

          {analytics && (
            <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                Financial summary
              </p>
              <div className="grid sm:grid-cols-3 gap-6 mb-5">
                <div>
                  <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Total collected</p>
                  <p className="text-xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                    KSh {Number(analytics.total_collected || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Agency earnings</p>
                  <p className="text-xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                    KSh {Number(analytics.agency_earnings || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Vacant properties</p>
                  <p className="text-xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                    {dashboard.vacant_properties}
                  </p>
                </div>
              </div>
              {analytics.ai_insight && (
                <p className="text-sm text-charcoal/70 italic border-t border-clay/10 pt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {analytics.ai_insight}
                </p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/agency/properties"
              className="bg-sienna text-sand rounded-xl p-5 hover:bg-clay transition"
            >
              <p className="font-medium" style={{ fontFamily: "'Fraunces', serif" }}>List a property</p>
              <p className="text-sand/70 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Add a new listing</p>
            </Link>
            <Link
              to="/agency/applications"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Review applications</p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Approve or reject</p>
            </Link>
            <Link
              to="/agency/tickets"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Maintenance tickets</p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Manage open issues</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default AgencyDashboard