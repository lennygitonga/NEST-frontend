import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'
import { downloadFile } from '../../utils/downloadFile'

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

function AgencyPayments() {
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('payments')

  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [invoiceTitle, setInvoiceTitle] = useState('')
  const [invoiceTenantId, setInvoiceTenantId] = useState('')
  const [invoicePropertyId, setInvoicePropertyId] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', amount: '' }])
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [paymentsRes, invoicesRes, analyticsRes] = await Promise.all([
        apiClient.get('/api/payments/'),
        apiClient.get('/api/payments/invoices/'),
        apiClient.get('/api/payments/analytics/'),
      ])
      setPayments(paymentsRes.data)
      setInvoices(invoicesRes.data)
      setAnalytics(analyticsRes.data)
    } catch {
      setError('Could not load payment data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    Promise.allSettled([
      apiClient.get('/api/agencies/tenants/'),
      apiClient.get('/api/properties/'),
    ]).then(([tenantsRes, propsRes]) => {
      if (tenantsRes.status === 'fulfilled') {
        const t = tenantsRes.value.data.tenants || []
        setTenants(t)
        if (t.length > 0) setInvoiceTenantId(String(t[0].tenant_id))
      }
      if (propsRes.status === 'fulfilled') {
        setProperties(propsRes.value.data)
        if (propsRes.value.data.length > 0) setInvoicePropertyId(String(propsRes.value.data[0].id))
      }
    })
  }, [fetchData])

  const addItem = () => setInvoiceItems((prev) => [...prev, { description: '', amount: '' }])
  const removeItem = (i) => setInvoiceItems((prev) => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, field, value) => {
    setInvoiceItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      await apiClient.post('/api/payments/invoices/create/', {
        tenant: invoiceTenantId,
        property: invoicePropertyId,
        title: invoiceTitle,
        due_date: invoiceDueDate,
        items: invoiceItems.map((item) => ({
          description: item.description,
          amount: parseFloat(item.amount),
        })),
      })
      setShowInvoiceForm(false)
      setInvoiceTitle('')
      setInvoiceDueDate('')
      setInvoiceItems([{ description: '', amount: '' }])
      setSubmitStatus('idle')
      fetchData()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || 'Could not create invoice.')
      setSubmitStatus('error')
    }
  }

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.total_amount), 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Payments
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Track rent payments and manage invoices.
      </p>

      {analytics && (
        <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8">
          <div className="grid sm:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Total collected</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(analytics.total_collected || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Agency earnings</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                KSh {Number(analytics.agency_earnings || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Vacant properties</p>
              <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                {analytics.vacant_properties || 0}
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-white border border-clay/15 rounded-lg p-1">
          {['payments', 'invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                activeTab === tab ? 'bg-sienna text-sand' : 'text-charcoal/60 hover:text-charcoal'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'invoices' && (
          <button
            onClick={() => setShowInvoiceForm((v) => !v)}
            className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showInvoiceForm ? 'Cancel' : 'Create invoice'}
          </button>
        )}
      </div>

      {showInvoiceForm && activeTab === 'invoices' && (
        <form
          onSubmit={handleCreateInvoice}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-8 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p className="text-lg text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            New invoice
          </p>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Title</label>
            <input
              type="text"
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              placeholder="e.g. Water and electricity — July 2026"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Tenant</label>
              <select
                value={invoiceTenantId}
                onChange={(e) => setInvoiceTenantId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              >
                {tenants.length === 0 && <option value="">No tenants yet</option>}
                {tenants.map((t) => (
                  <option key={t.tenant_id} value={t.tenant_id}>
                    {t.tenant_name} ({t.tenant_email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Property</label>
              <select
                value={invoicePropertyId}
                onChange={(e) => setInvoicePropertyId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              >
                {properties.length === 0 && <option value="">No properties yet</option>}
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Due date</label>
            <input
              type="date"
              value={invoiceDueDate}
              onChange={(e) => setInvoiceDueDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Items</label>
            <div className="space-y-2">
              {invoiceItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    required
                    placeholder="Description"
                    className="flex-1 px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(i, 'amount', e.target.value)}
                    required
                    placeholder="Amount"
                    className="w-32 px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                  />
                  {invoiceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-brick hover:text-brick/70 transition text-sm px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sienna text-sm font-medium hover:text-clay"
            >
              + Add item
            </button>
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
            {submitStatus === 'submitting' ? 'Creating...' : 'Create invoice'}
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

      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length === 0 && !isLoading && (
            <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No payments yet.</p>
          )}
          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-clay/15 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                  {p.property_title}
                </p>
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {p.tenant_email} · {new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  KSh {Number(p.total_amount).toLocaleString()}
                </p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mt-1 ${PAYMENT_STATUS_STYLES[p.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 && !isLoading && (
            <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No invoices yet.</p>
          )}
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white border border-clay/15 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                    {inv.title}
                  </p>
                  <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {inv.tenant_email} · due {new Date(inv.due_date).toLocaleDateString()}
                  </p>
                  {inv.ai_summary && (
                    <p className="text-charcoal/60 text-sm mt-2 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {inv.ai_summary}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-charcoal font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    KSh {Number(inv.total_amount).toLocaleString()}
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mt-1 ${INVOICE_STATUS_STYLES[inv.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {inv.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadFile(`/api/payments/invoices/${inv.id}/download/`, `NEST_Invoice_${inv.id}.pdf`)}
                className="mt-3 text-sienna text-sm font-medium hover:text-clay"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AgencyPayments