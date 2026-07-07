import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm h-full flex flex-col justify-between space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(34,31,28,0.05)' }}
      transition={{ duration: 0.3, ease: easing }}
    >
      <div className="space-y-1">
        <p className="text-[9px] font-mono uppercase tracking-widest text-charcoal/40">
          {label}
        </p>
        <p className="text-3xl font-light tracking-tight text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>
          {value}
        </p>
      </div>
      {sub && (
        <p className="text-[10px] font-mono text-charcoal/40 border-t border-clay/5 pt-2 uppercase tracking-wider">
          {sub}
        </p>
      )}
    </motion.div>
  )
  return to ? <Link to={to} className="block h-full">{inner}</Link> : inner
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
      if (dashRes.status === 'rejected') setError('Could not stabilize communication with terminal registers.')
    }).finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || 'Administrator'

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Corporate Dashboard</span>
            <span className="w-1 h-1 rounded-full bg-olive" />
            <span>Operational Summary</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Welcome, {firstName}.
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Real-time aggregate computations mapped over linked properties and cash flows.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Assembling system analytic matrices...
          </div>
        )}

        {error && (
          <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {dashboard && (
          <div className="space-y-8">
            {!dashboard.is_verified && (
              <div className="bg-brick/5 border border-brick/20 rounded-xl p-5">
                <p className="text-xs font-mono text-brick uppercase tracking-wider leading-relaxed">
                  Notice: Agency verification pipeline unfulfilled by NEST Core. Asset public deployment suspended.
                </p>
              </div>
            )}

            {/* Matrix Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Portfolio Footprint"
                value={dashboard.total_properties}
                sub={`${dashboard.vacant_properties} vacant units`}
                to="/agency/properties"
              />
              <StatCard
                label="Lease Occupancy"
                value={dashboard.occupied_properties}
                sub="active contracts"
                to="/agency/leases"
              />
              <StatCard
                label="Partner Landlords"
                value={dashboard.total_landlords}
                sub="brokerage linkages"
                to="/agency/landlords"
              />
              <StatCard
                label="Commission Share"
                value={`${dashboard.commission_rate}%`}
                sub="gross yield slice"
              />
            </div>

            {/* Financial Ledger Analytics */}
            {analytics && (
              <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-charcoal/40">
                    Financial Reconciliation Layer
                  </h2>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-clay/5">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Gross Inflow Volume</p>
                    <p className="text-xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                      KSh {Number(analytics.total_collected || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Retained Earnings Yield</p>
                    <p className="text-xl font-light tracking-tight text-olive" style={{ fontFamily: "'Fraunces', serif" }}>
                      KSh {Number(analytics.agency_earnings || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Unassigned Spatials</p>
                    <p className="text-xl font-light tracking-tight text-sienna" style={{ fontFamily: "'Fraunces', serif" }}>
                      {dashboard.vacant_properties} Units
                    </p>
                  </div>
                </div>

                {analytics.ai_insight && (
                  <div className="border-t border-clay/5 pt-4 bg-sand/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                    <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest mb-1">[ Machine Intelligence Heuristics ]</p>
                    <p className="text-sm text-charcoal/70 italic font-sans font-light leading-relaxed">
                      {analytics.ai_insight}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions Router */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <Link to="/agency/properties" className="bg-sienna text-sand rounded-xl p-6 hover:bg-clay transition flex flex-col justify-between min-h-[110px]">
                <p className="text-sm uppercase font-mono tracking-wider">Deploy Asset</p>
                <p className="text-sand/50 text-2xs uppercase tracking-widest font-mono">Provision New Node</p>
              </Link>
              <Link to="/agency/applications" className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm hover:border-clay/40 transition flex flex-col justify-between min-h-[110px]">
                <p className="text-sm uppercase font-mono tracking-wider text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>Assess Intakes</p>
                <p className="text-charcoal/40 text-2xs uppercase tracking-widest font-mono">Approve / Purge Applications</p>
              </Link>
              <Link to="/agency/tickets" className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm hover:border-clay/40 transition flex flex-col justify-between min-h-[110px]">
                <p className="text-sm uppercase font-mono tracking-wider text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>System Disruption Logs</p>
                <p className="text-charcoal/40 text-2xs uppercase tracking-widest font-mono">Resolve Structural Tickets</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyDashboard