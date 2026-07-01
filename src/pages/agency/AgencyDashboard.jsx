import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <div className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition">
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
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function AgencyDashboard() {
  const user = useAuthStore((state) => state.user)
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/agencies/dashboard/')
      .then((response) => setDashboard(response.data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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
            <div className="bg-clay/10 border border-clay/20 rounded-xl p-5 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              <p className="text-charcoal font-medium text-sm">Your agency is pending verification</p>
              <p className="text-charcoal/60 text-sm mt-1">
                A NEST admin will review and verify your agency before you can list properties. This usually takes 1-2 business days.
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
              sub={`${dashboard.total_properties - dashboard.occupied_properties} available`}
              to="/agency/properties"
            />
            <StatCard
              label="Landlords"
              value={dashboard.total_landlords}
              sub="Active relationships"
              to="/agency/landlords"
            />
            <StatCard
              label="Commission rate"
              value={`${dashboard.commission_rate}%`}
              sub="On all rent collected"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/agency/properties"
              className="bg-sienna text-sand rounded-xl p-6 hover:bg-clay transition"
            >
              <p className="text-lg font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                Manage properties
              </p>
              <p className="text-sand/70 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                Add listings, upload images, manage availability
              </p>
            </Link>
            <Link
              to="/agency/applications"
              className="bg-white border border-clay/15 rounded-xl p-6 hover:shadow-md transition"
            >
              <p className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                Review applications
              </p>
              <p className="text-charcoal/60 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                Approve or reject tenant applications
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default AgencyDashboard