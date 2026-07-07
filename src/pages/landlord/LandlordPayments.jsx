import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  COMPLETED: 'border-olive/20 bg-olive/5 text-olive font-semibold',
  FAILED: 'border-brick/20 bg-brick/5 text-brick',
  REFUNDED: 'border-charcoal/20 bg-charcoal/5 text-charcoal/40',
}

function LandlordPayments() {
  const [payments, setPayments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/payments/'),
      apiClient.get('/api/payments/analytics/'),
    ]).then(([paymentsRes, analyticsRes]) => {
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data)
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
    }).finally(() => setIsLoading(false))

    apiClient.get('/api/payments/')
      .catch(() => setError('Could not load modern payment structural components.'))
  }, [])

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.total_amount), 0)

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Accounting Ledger</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Clearing Statements</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Remittance Postings
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Real-time balance clearing indices for your physical asset allocations.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Compiling decentralized ledger distributions...
          </div>
        )}

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Overview Balance Display card */}
            <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">
                    Aggregate Retained Clearing
                  </p>
                  <p className="text-3xl font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                    KSh {totalCollected.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">
                    Settled Transaction Volume
                  </p>
                  <p className="text-3xl font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                    {payments.filter((p) => p.status === 'COMPLETED').length} <span className="text-xs font-mono text-charcoal/40 tracking-normal">units</span>
                  </p>
                </div>
              </div>
              
              {analytics?.ai_insight && (
                <p className="text-xs font-mono leading-relaxed text-charcoal/60 italic border-t border-clay/5 pt-4">
                  <span className="text-sienna not-italic font-bold tracking-widest uppercase mr-1">[Insight]:</span> 
                  "{analytics.ai_insight}"
                </p>
              )}
            </div>

            {/* List Header */}
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 pt-4">
              [ Journal Entry Postings ]
            </h2>

            {payments.length === 0 ? (
              <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
                  No cryptographic payment receipts found in directory.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-clay/15 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-clay/20 transition"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal/30 block">
                        Asset Allocation Title
                      </span>
                      <p className="text-base font-light text-charcoal truncate tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                        {p.property_title}
                      </p>
                      <p className="text-xs font-mono text-charcoal/50">
                        {p.tenant_email} <span className="text-clay/30 mx-1">·</span> <span className="text-charcoal/70">{new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </p>
                      <p className="text-[10px] font-mono text-charcoal/40 pt-1">
                        Posted: {new Date(p.payment_date).toLocaleDateString()} via {p.payment_method}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-clay/5 pt-3 sm:pt-0">
                      <p className="text-sm font-mono font-medium text-charcoal">
                        KSh {Number(p.total_amount).toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${PAYMENT_STATUS_STYLES[p.status] || 'border-clay/20 bg-clay/5 text-clay'}`}>
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
    </div>
  )
}

export default LandlordPayments