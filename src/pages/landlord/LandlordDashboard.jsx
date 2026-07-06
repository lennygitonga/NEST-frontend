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
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function LandlordDashboard() {
  const user = useAuthStore((state) => state.user)
  const [properties, setProperties] = useState([])
  const [leases, setLeases] = useState([])
  const [payments, setPayments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/properties/'),
      apiClient.get('/api/properties/leases/'),
      apiClient.get('/api/payments/'),
      apiClient.get('/api/payments/analytics/'),
    ]).then(([propsRes, leasesRes, paymentsRes, analyticsRes]) => {
      if (propsRes.status === 'fulfilled') setProperties(propsRes.value.data)
      if (leasesRes.status === 'fulfilled') setLeases(leasesRes.value.data)
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data)
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
    }).finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || 'there'
  const activeLeases = leases.filter((l) => l.is_active)
  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.total_amount), 0)
  const vacantProperties = properties.filter((p) => p.is_vacant)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Hello, {firstName}.
      </h1>
      <p className="text-charcoal/60 mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        Here's an overview of your portfolio.
      </p>

      {isLoading ? (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Total properties"
              value={properties.length}
              sub={`${vacantProperties.length} vacant`}
              to="/landlord/properties"
            />
            <StatCard
              label="Active leases"
              value={activeLeases.length}
              sub="current tenants"
              to="/landlord/leases"
            />
            <StatCard
              label="Total collected"
              value={`KSh ${totalCollected.toLocaleString()}`}
              sub="completed payments"
              to="/landlord/payments"
            />
            <StatCard
              label="Vacant"
              value={vacantProperties.length}
              sub="available properties"
              to="/landlord/properties"
            />
          </div>

          {analytics?.ai_insight && (
            <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Portfolio insight
              </p>
              <p className="text-charcoal/70 italic text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                {analytics.ai_insight}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/landlord/properties"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                Your properties
              </p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                {properties.length} total · {vacantProperties.length} vacant
              </p>
            </Link>
            <Link
              to="/landlord/leases"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                Active leases
              </p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                {activeLeases.length} active lease{activeLeases.length !== 1 ? 's' : ''}
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default LandlordDashboard