import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  COMPLETED: 'bg-olive/10 text-olive',
  FAILED: 'bg-brick/10 text-brick',
  REFUNDED: 'bg-charcoal/10 text-charcoal/50',
}

function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('')
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/payments/'),
      apiClient.get('/api/payments/analytics/'),
    ]).then(([paymentsRes, analyticsRes]) => {
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data)
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
    }).catch(() => setError('Could not load payment data.'))
    .finally(() => setIsLoading(false))
  }, [])

  const handleMonthlyReport = async (e) => {
    e.preventDefault()
    setReportLoading(true)
    setReportError('')
    setReport(null)

    try {
      const response = await apiClient.get('/api/payments/reports/monthly/', {
        params: { month: `${month}-01` },
      })
      setReport(response.data)
    } catch {
      setReportError('Could not generate report. Please try again.')
    } finally {
      setReportLoading(false)
    }
  }

  const totalCommission = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.nest_commission), 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Payments
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Platform-wide payment overview and monthly reports.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {analytics && (
        <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
          <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Platform summary
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Total collected</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(analytics.total_collected || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>NEST commission</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(analytics.nest_commission_earned || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Verified agencies</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                {analytics.total_verified_agencies || 0}
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

      <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
        <p className="text-charcoal font-medium mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          Monthly report
        </p>
        <form onSubmit={handleMonthlyReport} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-charcoal mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              Select month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <button
            type="submit"
            disabled={reportLoading}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm shrink-0"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {reportLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {reportError && (
          <p className="text-sm text-brick mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>{reportError}</p>
        )}

        {report && (
          <div className="mt-5 pt-5 border-t border-clay/10 grid sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Total collected</p>
              <p className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(report.total_collected).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>NEST commission</p>
              <p className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(report.nest_commission).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Agency earnings</p>
              <p className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(report.agency_earnings).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Total payments</p>
              <p className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                {report.total_payments}
              </p>
            </div>
          </div>
        )}
      </div>

      {!isLoading && (
        <>
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            All payments
          </h2>
          {payments.length === 0 ? (
            <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
              <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>No payments yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-clay/15 rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                      {p.property_title}
                    </p>
                    <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {p.tenant_email} · {new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Commission: KSh {Number(p.nest_commission).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                      KSh {Number(p.total_amount).toLocaleString()}
                    </p>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mt-1 ${PAYMENT_STATUS_STYLES[p.status]}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminPayments