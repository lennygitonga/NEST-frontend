import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function StatCard({ label, value, sub, to, dark }) {
  const inner = (
    <div className={`rounded-xl p-5 hover:shadow-md transition border ${
      dark ? 'bg-charcoal/5 border-charcoal/10' : 'bg-white border-clay/15'
    }`}>
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

function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const [analytics, setAnalytics] = useState(null)
  const [appeals, setAppeals] = useState([])
  const [fraudReports, setFraudReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/payments/analytics/'),
      apiClient.get('/api/moderation/appeals/'),
      apiClient.get('/api/moderation/fraud-reports/'),
    ]).then(([analyticsRes, appealsRes, fraudRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
      if (appealsRes.status === 'fulfilled') setAppeals(appealsRes.value.data)
      if (fraudRes.status === 'fulfilled') setFraudReports(fraudRes.value.data)
    }).finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || 'Admin'
  const pendingAppeals = appeals.filter((a) => a.status === 'PENDING')
  const pendingFraud = fraudReports.filter((f) => f.status === 'PENDING')

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Hello, {firstName}.
      </h1>
      <p className="text-charcoal/60 mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        NEST platform overview.
      </p>

      {isLoading ? (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      ) : (
        <>
          {analytics && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total agencies"
                  value={analytics.total_verified_agencies ?? '—'}
                  sub="verified"
                  to="/admin/agencies"
                />
                <StatCard
                  label="Total properties"
                  value={analytics.total_properties ?? '—'}
                  sub={`${analytics.occupied_properties ?? 0} occupied`}
                  to="/admin/agencies"
                />
                <StatCard
                  label="Total collected"
                  value={`KSh ${Number(analytics.total_collected || 0).toLocaleString()}`}
                  sub="all time"
                  to="/admin/payments"
                />
                <StatCard
                  label="NEST commission"
                  value={`KSh ${Number(analytics.nest_commission_earned || 0).toLocaleString()}`}
                  sub="earned"
                  to="/admin/payments"
                />
              </div>

              {analytics.ai_insight && (
                <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
                  <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Platform insight
                  </p>
                  <p className="text-charcoal/70 italic text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {analytics.ai_insight}
                  </p>
                </div>
              )}
            </>
          )}

          {(pendingAppeals.length > 0 || pendingFraud.length > 0) && (
            <div className="bg-brick/5 border border-brick/20 rounded-xl p-5 mb-8">
              <p className="text-sm font-medium text-brick mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                Items needing attention
              </p>
              <div className="flex flex-wrap gap-3">
                {pendingAppeals.length > 0 && (
                  <Link
                    to="/admin/moderation"
                    className="text-sm text-brick bg-white border border-brick/20 px-3 py-1.5 rounded-lg hover:bg-brick/5 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {pendingAppeals.length} pending ban appeal{pendingAppeals.length !== 1 ? 's' : ''}
                  </Link>
                )}
                {pendingFraud.length > 0 && (
                  <Link
                    to="/admin/moderation"
                    className="text-sm text-brick bg-white border border-brick/20 px-3 py-1.5 rounded-lg hover:bg-brick/5 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {pendingFraud.length} pending fraud report{pendingFraud.length !== 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/admin/agencies"
              className="bg-sienna text-sand rounded-xl p-5 hover:bg-clay transition"
            >
              <p className="font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Manage agencies</p>
              <p className="text-sand/70 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Verify, suspend, penalize</p>
            </Link>
            <Link
              to="/admin/users"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Manage users</p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Ban, warn, delete</p>
            </Link>
            <Link
              to="/admin/moderation"
              className="bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Moderation</p>
              <p className="text-charcoal/50 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Appeals, fraud, audit log</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard