import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { easing } from '../utils/animations'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import { downloadFile } from '../utils/downloadFile'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'border-clay/30 text-clay bg-clay/5',
  COMPLETED: 'border-olive/30 text-olive bg-olive/5',
  FAILED: 'border-brick/30 text-brick bg-brick/5',
  REFUNDED: 'border-charcoal/20 text-charcoal/40 bg-charcoal/5',
}

const INVOICE_STATUS_STYLES = {
  PENDING: 'border-clay/30 text-clay bg-clay/5',
  PAID: 'border-olive/30 text-olive bg-olive/5',
  OVERDUE: 'border-brick/30 text-brick bg-brick/5',
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
        // Fallback handled silently
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
    <div className="bg-white border border-clay/15 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 space-y-0.5">
          <p className="text-charcoal font-light text-base tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
            {payment.property_title}
          </p>
          <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Allocation for {new Date(payment.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1.5">
          <p className="text-charcoal font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            KSh {Number(payment.total_amount).toLocaleString()}
          </p>
          <span 
            className={`text-[9px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded border ${PAYMENT_STATUS_STYLES[payment.status] || 'border-clay/20'}`} 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {payment.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-clay/5">
        <button
          onClick={toggle}
          className="text-sienna text-xs font-medium uppercase tracking-wider hover:text-charcoal transition underline decoration-sienna/20 underline-offset-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {expanded ? 'Hide Ledger' : 'Review Statement'}
        </button>
        <button
          onClick={handleDownload}
          className="text-charcoal/50 text-xs font-mono uppercase tracking-wider hover:text-sienna transition"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Download PDF
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easing }}
            className="overflow-hidden mt-2 pt-4 border-t border-clay/10 text-xs space-y-1.5 font-light text-charcoal/70" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isLoading && <p className="font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">Querying internal ledger...</p>}
            {receipt && (
              <div className="bg-clay/5 p-4 rounded-lg space-y-1 border border-clay/10">
                <p><span className="font-mono text-[10px] uppercase text-charcoal/40 mr-2">Receipt Document</span> #{receipt.receipt_number}</p>
                <p><span className="font-mono text-[10px] uppercase text-charcoal/40 mr-2">Method Context</span> {receipt.payment_method}</p>
                {receipt.transaction_id && (
                  <p><span className="font-mono text-[10px] uppercase text-charcoal/40 mr-2">Transaction Ref</span> <span className="font-mono">{receipt.transaction_id}</span></p>
                )}
                <p className="text-charcoal mt-2 pt-2 border-t border-clay/5 italic font-serif text-charcoal/80">{receipt.confirmation_message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InvoiceRow({ invoice }) {
  const [expanded, setExpanded] = useState(false)

  const handleDownload = () => {
    downloadFile(`/api/payments/invoices/${invoice.id}/download/`, `NEST_Invoice_${invoice.id}.pdf`)
  }

  return (
    <div className="bg-white border border-clay/15 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 space-y-0.5">
          <p className="text-charcoal font-light text-base tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
            {invoice.title}
          </p>
          <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            {invoice.property_title} · <span className="font-mono text-[11px] text-charcoal/40">Matures {new Date(invoice.due_date).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1.5">
          <p className="text-charcoal font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            KSh {Number(invoice.total_amount).toLocaleString()}
          </p>
          <span 
            className={`text-[9px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded border ${INVOICE_STATUS_STYLES[invoice.status] || 'border-clay/20'}`} 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {invoice.ai_summary && (
        <div className="bg-clay/5 border border-clay/10 p-3.5 rounded-lg space-y-1">
          <p className="text-charcoal/40 text-[9px] uppercase tracking-widest font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>
            Plain English Digest
          </p>
          <p className="text-charcoal/80 text-xs font-light leading-relaxed font-serif italic" style={{ fontFamily: "'Inter', sans-serif" }}>
            "{invoice.ai_summary}"
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-clay/5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sienna text-xs font-medium uppercase tracking-wider hover:text-charcoal transition underline decoration-sienna/20 underline-offset-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {expanded ? 'Collapse Breakdowns' : 'Inspect Breakdown'}
        </button>
        <button
          onClick={handleDownload}
          className="text-charcoal/50 text-xs font-mono uppercase tracking-wider hover:text-sienna transition"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Download PDF
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 pt-2 divide-y divide-clay/5 text-xs font-light text-charcoal/80" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 text-charcoal/70">
                <span>{item.description}</span>
                <span className="font-mono text-charcoal/90">KSh {Number(item.amount).toLocaleString()}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
      setError('Could not balance ledger information records.')
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
      setSubmitError(data?.error || 'Could not process token transmission.')
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 space-y-12">
      {/* Editorial Header Row */}
      <div className="flex items-end justify-between border-b border-clay/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Financial Desk
          </h1>
          <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Reconcile balances, clear active invoices, and pull audited receipts.
          </p>
        </div>
        {leases.length > 0 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-medium uppercase tracking-wider text-sienna hover:text-charcoal transition duration-150"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showForm ? 'Close console' : '⚡ Initiate Remittance'}
          </button>
        )}
      </div>

      {/* Elegant Refined Input Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-clay/5 border border-clay/10 rounded-xl p-6 space-y-4 font-light text-xs text-charcoal"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div>
              <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Target Lease Architecture</label>
              <select
                value={leaseId}
                onChange={(e) => handleLeaseChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none focus:ring-1 focus:ring-sienna"
              >
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>Framework Contract #{l.id} — KSh {Number(l.rent_amount).toLocaleString()}/mo</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Remittance Value (KSh)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none focus:ring-1 focus:ring-sienna"
                />
              </div>
              <div>
                <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Payment Route</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none focus:ring-1 focus:ring-sienna"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Target Allocation Month</label>
                <input
                  type="date"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none focus:ring-1 focus:ring-sienna"
                />
              </div>
              <div>
                <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Network Transaction Reference Code (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-sienna"
                  placeholder="e.g. M-Pesa System Hash Code"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-brick font-mono text-[11px] border border-brick/10 bg-brick/5 p-3 rounded">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="bg-charcoal text-sand uppercase font-medium tracking-wider text-[10px] px-5 py-2.5 rounded hover:bg-sienna transition disabled:opacity-50"
            >
              {submitStatus === 'submitting' ? 'Transmitting Wire...' : 'Authorize Remittance'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading && (
        <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest">Polling financial systems...</p>
      )}

      {error && (
        <div className="text-xs text-brick border border-brick/10 bg-brick/5 rounded px-4 py-3 max-w-max font-mono">
          {error}
        </div>
      )}

      {!isLoading && !error && leases.length === 0 && (
        <div className="bg-clay/5 border border-clay/10 rounded-xl p-12 text-center max-w-xl">
          <p className="text-charcoal/50 text-sm font-light mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            An active allocation lease configuration is required before ticketing transaction matrices can generate.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-charcoal text-sand text-xs font-medium px-5 py-2.5 rounded tracking-wide hover:bg-sienna transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Locate Properties
          </Link>
        </div>
      )}

      {/* Main Account Data Displays */}
      {!isLoading && !error && leases.length > 0 && (
        <div className="space-y-10">
          <div>
            <h2 className="text-lg text-charcoal mb-4 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Statements File
            </h2>
            {payments.length === 0 ? (
              <p className="text-sm font-light text-charcoal/40 font-serif italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                No verified clearing files recorded.
              </p>
            ) : (
              <div className="space-y-4">
                {payments.map((p) => <ReceiptRow key={p.id} payment={p} />)}
              </div>
            )}
          </div>

          <div className="pt-4">
            <h2 className="text-lg text-charcoal mb-4 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Active Invoices
            </h2>
            {invoices.length === 0 ? (
              <p className="text-sm font-light text-charcoal/40 font-serif italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                Account ledger returns complete zero balance.
              </p>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments