import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import { downloadFile } from '../utils/downloadFile'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  COMPLETED: 'bg-olive/10 text-olive',
  FAILED: 'bg-brick/10 text-brick',
  REFUNDED: 'bg-charcoal/10 text-charcoal/50',
}

const INVOICE_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  PAID: 'bg-olive/10 text-olive',
  OVERDUE: 'bg-brick/10 text-brick',
}

const PAYMENT_METHODS = [
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'CASH', label: 'Cash' },
]

function ReceiptRow({ payment }) {
  const [expanded, setExpanded] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && !receipt) {
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/api/payments/${payment.id}/receipt/`)
        setReceipt(response.data)
      } catch {
        // ignore, just won't show confirmation message
      } finally {
        setIsLoading(false)
      }
    }
    setExpanded((v) => !v)
  }

  const handleDownload = () => {
    downloadFile(`/api/payments/${payment.id}/receipt/download/`, `NEST_Receipt_${payment.id}.pdf`)
  }

  return (
    <div className="bg-white border border-clay/15 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
            {payment.property_title}
          </p>
          <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            For {new Date(payment.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            KSh {Number(payment.total_amount).toLocaleString()}
          </p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mt-1 ${PAYMENT_STATUS_STYLES[payment.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {payment.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={toggle}
          className="text-sienna text-sm font-medium hover:text-clay"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {expanded ? 'Hide receipt' : 'View receipt'}
        </button>
        <button
          onClick={handleDownload}
          className="text-sienna text-sm font-medium hover:text-clay"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Download PDF
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-clay/10 text-sm space-y-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {isLoading && <p className="text-charcoal/50">Loading...</p>}
          {receipt && (
            <>
              <p className="text-charcoal/70">Receipt: {receipt.receipt_number}</p>
              <p className="text-charcoal/70">Method: {receipt.payment_method}</p>
              {receipt.transaction_id && <p className="text-charcoal/70">Transaction ID: {receipt.transaction_id}</p>}
              <p className="text-charcoal mt-2 italic">{receipt.confirmation_message}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function InvoiceRow({ invoice }) {
  const [expanded, setExpanded] = useState(false)

  const handleDownload = () => {
    downloadFile(`/api/payments/invoices/${invoice.id}/download/`, `NEST_Invoice_${invoice.id}.pdf`)
  }

  return (
    <div className="bg-white border border-clay/15 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
            {invoice.title}
          </p>
          <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            {invoice.property_title} · Due {new Date(invoice.due_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            KSh {Number(invoice.total_amount).toLocaleString()}
          </p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mt-1 ${INVOICE_STATUS_STYLES[invoice.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {invoice.status}
          </span>
        </div>
      </div>

      {invoice.ai_summary && (
        <p className="text-charcoal/70 text-sm mt-3 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
          {invoice.ai_summary}
        </p>
      )}

      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sienna text-sm font-medium hover:text-clay"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {expanded ? 'Hide items' : 'View items'}
        </button>
        <button
          onClick={handleDownload}
          className="text-sienna text-sm font-medium hover:text-clay"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Download PDF
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-clay/10 space-y-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {invoice.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-charcoal/70">
              <span>{item.description}</span>
              <span>KSh {Number(item.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Payments() {
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [leases, setLeases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [leaseId, setLeaseId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('MPESA')
  const [transactionId, setTransactionId] = useState('')
  const [month, setMonth] = useState('')
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [paymentsRes, invoicesRes, leasesRes] = await Promise.all([
        apiClient.get('/api/payments/'),
        apiClient.get('/api/payments/invoices/'),
        apiClient.get('/api/properties/leases/'),
      ])
      setPayments(paymentsRes.data)
      setInvoices(invoicesRes.data)
      setLeases(leasesRes.data)
      if (leasesRes.data.length > 0) {
        setLeaseId(String(leasesRes.data[0].id))
        setAmount(String(leasesRes.data[0].rent_amount))
      }
    } catch {
      setError('Could not load your payments.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const selectedLease = leases.find((l) => String(l.id) === leaseId)

  const handleLeaseChange = (id) => {
    setLeaseId(id)
    const lease = leases.find((l) => String(l.id) === id)
    if (lease) setAmount(String(lease.rent_amount))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      await apiClient.post('/api/payments/', {
        lease: leaseId,
        property: selectedLease.property,
        total_amount: amount,
        payment_method: method,
        transaction_id: transactionId || undefined,
        payment_for_month: month,
      })
      setShowForm(false)
      setTransactionId('')
      setSubmitStatus('idle')
      fetchData()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || 'Could not process this payment. Please try again.')
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1
          className="text-3xl text-charcoal"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          Payments
        </h1>
        {leases.length > 0 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showForm ? 'Cancel' : 'Pay rent'}
          </button>
        )}
      </div>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Pay rent, view receipts, and check your invoices.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-10 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Lease</label>
            <select
              value={leaseId}
              onChange={(e) => handleLeaseChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
            >
              {leases.map((l) => (
                <option key={l.id} value={l.id}>Lease #{l.id} — KSh {Number(l.rent_amount).toLocaleString()}/mo</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Amount (KSh)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Payment method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Payment for month</label>
              <input
                type="date"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Transaction ID (optional)</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
                placeholder="e.g. M-Pesa code"
              />
            </div>
          </div>

          {submitError && (
            <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
          >
            {submitStatus === 'submitting' ? 'Processing...' : 'Submit payment'}
          </button>
        </form>
      )}

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && leases.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center mb-10">
          <p className="text-charcoal/60 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            You don't have an active lease yet, so there's nothing to pay.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Browse properties
          </Link>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="text-charcoal/50 text-sm mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
              No payments yet.
            </p>
          ) : (
            <div className="space-y-3 mb-10">
              {payments.map((p) => <ReceiptRow key={p.id} payment={p} />)}
            </div>
          )}

          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Invoices
          </h2>
          {invoices.length === 0 ? (
            <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              No invoices yet.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Payments