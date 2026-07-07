import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(34,31,28,0.04)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-charcoal/40 mb-2">
        {label}
      </p>
      <p className="text-3xl font-light tracking-tight text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs font-mono text-charcoal/40 mt-2 pt-2 border-t border-clay/5">
          {sub}
        </p>
      )}
    </motion.div>
  )
  return to ? <Link to={to} className="block">{inner}</Link> : inner
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
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Portfolio Node</span>
            <span className="w-1 h-1 rounded-full bg-olive" />
            <span>Overview Matrix</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Hello, {firstName}.
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            System indexing architecture overview of your complete asset distribution.
          </p>
        </header>

        {isLoading ? (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Re-indexing real estate configurations...
          </div>
        ) : (
          <>
            {/* Grid Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Portfolio Assets"
                value={properties.length}
                sub={`${vacantProperties.length} vacancies mapped`}
                to="/landlord/properties"
              />
              <StatCard
                label="Active Covenants"
                value={activeLeases.length}
                sub="Occupied tenancy nodes"
                to="/landlord/leases"
              />
              <StatCard
                label="Aggregate Clearing"
                value={`KSh ${totalCollected.toLocaleString()}`}
                sub="Completed settlements"
                to="/landlord/payments"
              />
              <StatCard
                label="Vacant Modules"
                value={vacantProperties.length}
                sub="Immediate vacancy listings"
                to="/landlord/properties"
              />
            </div>

            {/* AI Insights Engine Output */}
            {analytics?.ai_insight && (
              <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-sienna rounded-full animate-pulse" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-charcoal/40">
                    Automated System Intelligence Insight
                  </p>
                </div>
                <p className="text-sm text-charcoal/80 font-light leading-relaxed italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                  "{analytics.ai_insight}"
                </p>
              </div>
            )}

            {/* Navigational Secondary Modules */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/landlord/properties"
                className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm hover:border-clay/30 transition group"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 block">Structure Allocation</span>
                <p className="text-xl font-light tracking-tight text-charcoal mt-1 group-hover:text-sienna transition" style={{ fontFamily: "'Fraunces', serif" }}>
                  Your Asset Registries
                </p>
                <p className="text-xs font-mono text-charcoal/40 mt-3 pt-3 border-t border-clay/5">
                  {properties.length} active metrics · {vacantProperties.length} detached structures open
                </p>
              </Link>

              <Link
                to="/landlord/leases"
                className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm hover:border-clay/30 transition group"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 block">Legal Structuring</span>
                <p className="text-xl font-light tracking-tight text-charcoal mt-1 group-hover:text-sienna transition" style={{ fontFamily: "'Fraunces', serif" }}>
                  Active Lease Covenants
                </p>
                <p className="text-xs font-mono text-charcoal/40 mt-3 pt-3 border-t border-clay/5">
                  {activeLeases.length} synchronous framework{activeLeases.length !== 1 ? 's' : ''} established
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LandlordDashboard