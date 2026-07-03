import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  COMPLETED: 'bg-olive/10 text-olive',
  FAILED: 'bg-brick/10 text-brick',
  REFUNDED: 'bg-charcoal/10 text-charcoal/50',
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
      .catch(() => setError('Could not load payments.'))
  }, [])

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.total_amount), 0)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Payments
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Rent payments collected on your properties.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {!isLoading && (
        <>
          <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
            <div className="grid sm:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Total collected
                </p>
                <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  KSh {totalCollected.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Total payments
                </p>
                <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  {payments.filter((p) => p.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
            {analytics?.ai_insight && (
              <p className="text-sm text-charcoal/70 italic border-t border-clay/10 pt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                {analytics.ai_insight}
              </p>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
              <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
                No payments recorded yet.
              </p>
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
                      {new Date(p.payment_date).toLocaleDateString()} · {p.payment_method}
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

export default LandlordPayments