import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  COMPLETED: 'border-olive/20 bg-olive/5 text-olive',
  FAILED: 'border-brick/20 bg-brick/5 text-brick',
  REFUNDED: 'border-charcoal/20 bg-charcoal/5 text-charcoal/40',
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
    }).catch(() => setError('Could not successfully synchronize ledger.'))
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
      setReportError('Unable to generate localized monthly diagnostic report.')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Admin Control</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Financial Ledger</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Platform Escrow & Payments
          </h1>
        </header>

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Global Summary Metrics */}
        {analytics && (
          <div className="bg-white border border-clay/15 rounded-xl p-8 shadow-sm space-y-6">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-charcoal/40 border-b border-clay/5 pb-2">
              System Financial Aggregates
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider mb-1">Gross Collected</p>
                <p className="text-2xl font-light tracking-tight text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>
                  KSh {Number(analytics.total_collected || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider mb-1">NEST Split Income</p>
                <p className="text-2xl font-light tracking-tight text-sienna" style={{ fontFamily: "'Fraunces', serif" }}>
                  KSh {Number(analytics.nest_commission_earned || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider mb-1">Affiliated Merchants</p>
                <p className="text-2xl font-light tracking-tight text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>
                  {analytics.total_verified_agencies || 0} <span className="text-[11px] font-mono text-charcoal/30 font-normal">Agencies</span>
                </p>
              </div>
            </div>
            {analytics.ai_insight && (
              <div className="bg-charcoal text-sand rounded-lg p-4 mt-2">
                <span className="text-[8px] font-mono uppercase tracking-widest text-sand/40 block mb-1">Automated Intelligence Summary</span>
                <p className="text-sm font-light italic font-serif text-sand/90">{analytics.ai_insight}</p>
              </div>
            )}
          </div>
        )}

        {/* Statement Invoicing Section */}
        <div className="bg-white border border-clay/15 rounded-xl p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-charcoal/50">— Statement Diagnostics</h3>
          <form onSubmit={handleMonthlyReport} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:flex-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-2">
                Target Statement Cycle
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-clay/15 bg-sand/20 text-charcoal font-mono text-xs focus:outline-none focus:border-clay transition"
              />
            </div>
            <button
              type="submit"
              disabled={reportLoading}
              className="w-full sm:w-auto bg-charcoal text-sand px-6 py-3 rounded-lg text-[10px] font-mono uppercase tracking-wider hover:bg-sienna hover:text-sand transition disabled:opacity-50 whitespace-nowrap"
            >
              {reportLoading ? 'Extracting...' : 'Compile Audit'}
            </button>
          </form>

          {reportError && (
            <p className="text-[11px] font-mono text-brick bg-brick/5 p-3 rounded border border-brick/10">{reportError}</p>
          )}

          {report && (
            <div className="mt-6 pt-6 border-t border-clay/10 bg-sand/20 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wide text-charcoal/40 mb-1">Cycle Intake</p>
                <p className="text-base font-light font-serif text-charcoal">KSh {Number(report.total_collected).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wide text-charcoal/40 mb-1">Nest Commission</p>
                <p className="text-base font-light font-serif text-sienna">KSh {Number(report.nest_commission).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wide text-charcoal/40 mb-1">Agency Share</p>
                <p className="text-base font-light font-serif text-charcoal">KSh {Number(report.agency_earnings).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wide text-charcoal/40 mb-1">Volume Processed</p>
                <p className="text-base font-mono text-charcoal font-semibold">{report.total_payments} x</p>
              </div>
            </div>
          )}
        </div>

        {/* Audit Stream */}
        {!isLoading && (
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-charcoal/50">— Stream Settlements</h2>
            {payments.length === 0 ? (
              <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">No system settlement actions triggered.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-clay/15 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-base font-light tracking-tight text-charcoal truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                        {p.property_title}
                      </h4>
                      <p className="text-charcoal/50 text-xs font-mono">
                        {p.tenant_email} <span className="text-charcoal/20">·</span> {new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <div className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider">
                        Cut: KSh {Number(p.nest_commission).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-clay/5 pt-3 sm:pt-0">
                      <p className="text-base font-light font-mono text-charcoal">
                        KSh {Number(p.total_amount).toLocaleString()}
                      </p>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border inline-block ${PAYMENT_STATUS_STYLES[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPayments