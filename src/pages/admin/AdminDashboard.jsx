import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to }) {
  return (
    <Link to={to} className="block bg-white border border-clay/15 rounded-xl p-6 hover:border-sienna/30 transition shadow-sm">
      <p className="text-[9px] font-mono uppercase tracking-widest text-charcoal/40 mb-2">{label}</p>
      <p className="text-2xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>{value}</p>
      {sub && <p className="text-[10px] text-charcoal/50 mt-3 border-t border-clay/5 pt-2">{sub}</p>}
    </Link>
  )
}

function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const [analytics, setAnalytics] = useState(null)
  const [pending, setPending] = useState({ appeals: [], fraud: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/payments/analytics/'),
      apiClient.get('/api/moderation/appeals/'),
      apiClient.get('/api/moderation/fraud-reports/'),
    ]).then(([a, b, c]) => {
      setAnalytics(a.value?.data); setPending({ appeals: b.value?.data || [], fraud: c.value?.data || [] })
    }).finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-clay/10 pb-8">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">Admin Console</div>
            <h1 className="text-3xl font-light" style={{ fontFamily: "'Fraunces', serif" }}>Welcome, {user?.first_name || 'Admin'}.</h1>
          </div>
        </header>

        {isLoading ? <div className="text-xs font-mono uppercase tracking-widest text-charcoal/40">Syncing System...</div> : (
          <div className="grid lg:grid-cols-4 gap-6">
            {analytics && (
              <>
                <StatCard label="Verified Agencies" value={analytics.total_verified_agencies} sub="Active status" to="/admin/agencies" />
                <StatCard label="Total Properties" value={analytics.total_properties} sub={`${analytics.occupied_properties} occupied`} to="/admin/agencies" />
                <StatCard label="Total Collected" value={`KSh ${Number(analytics.total_collected).toLocaleString()}`} sub="All time revenue" to="/admin/payments" />
                <StatCard label="Platform Commission" value={`KSh ${Number(analytics.nest_commission_earned).toLocaleString()}`} sub="System intake" to="/admin/payments" />
              </>
            )}
            
            <div className="lg:col-span-4 bg-charcoal text-sand rounded-xl p-8 shadow-sm">
              <div className="text-[9px] font-mono uppercase tracking-widest text-sand/40 mb-4">Platform Insights</div>
              <p className="text-lg italic font-light font-serif">{analytics?.ai_insight || "System operating within nominal parameters."}</p>
            </div>

            <div className="lg:col-span-4 grid md:grid-cols-3 gap-6">
              <Link to="/admin/agencies" className="bg-white border border-clay/15 rounded-xl p-6 hover:shadow-md transition">
                <h3 className="font-serif text-lg mb-1">Agencies</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40">Verification & Commissions</p>
              </Link>
              <Link to="/admin/users" className="bg-white border border-clay/15 rounded-xl p-6 hover:shadow-md transition">
                <h3 className="font-serif text-lg mb-1">User Base</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40">Accounts & Compliance</p>
              </Link>
              <Link to="/admin/moderation" className="bg-white border border-clay/15 rounded-xl p-6 hover:shadow-md transition">
                <h3 className="font-serif text-lg mb-1">Moderation</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40">Appeals & Fraud Detection</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard