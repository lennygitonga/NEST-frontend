import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'
import { downloadFile } from '../../utils/downloadFile'

const PAYMENT_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  COMPLETED: 'border-olive/20 bg-olive/5 text-olive',
  FAILED: 'border-brick/20 bg-brick/5 text-brick',
  REFUNDED: 'border-clay/20 bg-clay/5 text-charcoal/40',
}

const INVOICE_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  PAID: 'border-olive/20 bg-olive/5 text-olive',
  OVERDUE: 'border-brick/20 bg-brick/5 text-brick',
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
      setError('Could not reconcile transactional database states.')
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
      setSubmitError(data?.error || 'Invoice configuration generation rejected.')
      setSubmitStatus('error')
    }
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-clay/15 bg-sand/30 text-charcoal focus:outline-none focus:border-clay/40 focus:bg-white transition text-sm"
  const labelClasses = "block text-[9px] font-mono uppercase tracking-widest text-charcoal/40 mb-2"

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Capital Liquidity</span>
            <span className="w-1 h-1 rounded-full bg-olive" />
            <span>Ledger Inflows</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight font-serif">
            Financial Reconciliation
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Audit trailing rental payments and enforce custom transactional structures via statements.
          </p>
        </header>

        {/* Analytics Summary */}
        {analytics && (
          <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Gross Collected Layer</p>
                <p className="text-xl font-light tracking-tight font-serif">
                  KSh {Number(analytics.total_collected || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Retained Margin Share</p>
                <p className="text-xl font-light tracking-tight font-serif text-olive">
                  KSh {Number(analytics.agency_earnings || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Unassigned Spatials</p>
                <p className="text-xl font-light tracking-tight font-serif text-sienna">
                  {analytics.vacant_properties || 0} Nodes
                </p>
              </div>
            </div>
            {analytics.ai_insight && (
              <div className="border-t border-clay/5 pt-4 bg-sand/20 -mx-6 -mb-6 p-4 rounded-b-xl">
                <p className="text-[9px] font-mono text-charcoal/40 uppercase tracking-widest mb-1">[ Machine Intelligence Liquidity Heuristic ]</p>
                <p className="text-xs text-charcoal/70 italic font-sans font-light leading-relaxed">
                  "{analytics.ai_insight}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Controls & Navigation Router */}
        <div className="flex items-center justify-between border-b border-clay/10 pb-4">
          <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
            {['payments', 'invoices'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 transition relative ${
                  activeTab === tab ? 'text-charcoal font-medium' : 'text-charcoal/40 hover:text-charcoal/70'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-charcoal" 
                    layoutId="activePaymentTab"
                    transition={{ ease: easing, duration: 0.25 }}
                  />
                )}
              </button>
            ))}
          </div>
          {activeTab === 'invoices' && (
            <button
              onClick={() => setShowInvoiceForm((v) => !v)}
              className="bg-sienna text-sand px-4 py-2 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition"
            >
              {showInvoiceForm ? 'Cancel Array' : 'Issue Invoice'}
            </button>
          )}
        </div>

        {/* Invoice Creation Block */}
        {showInvoiceForm && activeTab === 'invoices' && (
          <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-light text-charcoal tracking-tight font-serif">
                Generate Custom Ad-Hoc Invoice Statement
              </h2>
              <p className="text-[10px] font-mono text-charcoal/40 mt-1 uppercase tracking-wider">
                This transaction routes an isolated financial obligation directly to the tenant's interface.
              </p>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 pt-4 border-t border-clay/5">
              <div>
                <label className={labelClasses}>Invoice Context Header</label>
                <input
                  type="text"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  required
                  className={inputClasses}
                  placeholder="e.g., Water Utility Consolidation — Quarter 3"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Debtor Profile Node</label>
                  <select value={invoiceTenantId} onChange={(e) => setInvoiceTenantId(e.target.value)} className={inputClasses}>
                    {tenants.length === 0 && <option value="">No targets registered</option>}
                    {tenants.map((t) => (
                      <option key={t.tenant_id} value={t.tenant_id}>{t.tenant_name} ({t.tenant_email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Associated Infrastructure Asset</label>
                  <select value={invoicePropertyId} onChange={(e) => setInvoicePropertyId(e.target.value)} className={inputClasses}>
                    {properties.length === 0 && <option value="">No spatial matrices compiled</option>}
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Maturity Timeline Bound (Due Date)</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>

              {/* Items Line Breakdown Array */}
              <div className="space-y-4 pt-2">
                <label className={labelClasses}>Line Item Allocation Sets</label>
                <div className="space-y-2">
                  {invoiceItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        required
                        placeholder="Item specification text"
                        className={inputClasses}
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateItem(i, 'amount', e.target.value)}
                        required
                        placeholder="KES amount"
                        className={`${inputClasses} w-32`}
                      />
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-brick hover:opacity-70 text-2xs font-mono uppercase tracking-wider px-2 shrink-0"
                        >
                          Purge
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sienna text-2xs font-mono uppercase tracking-widest hover:text-clay"
                >
                  + Add Line Component
                </button>
              </div>

              {submitError && (
                <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'submitting'}
                className="bg-sienna text-sand px-6 py-3 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition"
              >
                {submitStatus === 'submitting' ? 'Compiling Manifest...' : 'Compile Statement Parameters'}
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Querying audit parameters...
          </div>
        )}

        {error && (
          <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {/* Payments View Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 && !isLoading && (
              <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40 bg-white border border-clay/15 rounded-xl p-8 text-center">Zero matching balance streams detected.</p>
            )}
            {payments.map((p) => (
              <div key={p.id} className="bg-white border border-clay/15 rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm">
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-base font-light text-charcoal tracking-tight font-serif truncate">
                    {p.property_title}
                  </h3>
                  <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider">
                    {p.tenant_email} <span className="text-clay/20 mx-1">·</span> Allocation: {new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                  <p className="text-sm font-mono text-charcoal tracking-tight">
                    KSh {Number(p.total_amount).toLocaleString()}
                  </p>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border block ${PAYMENT_STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices View Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {invoices.length === 0 && !isLoading && (
              <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40 bg-white border border-clay/15 rounded-xl p-8 text-center">Zero statements generated across open fiscal years.</p>
            )}
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white border border-clay/15 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-base font-light text-charcoal tracking-tight font-serif truncate">
                      {inv.title}
                    </h3>
                    <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider">
                      {inv.tenant_email} <span className="text-clay/20 mx-1">·</span> Term Bounds: Due {new Date(inv.due_date).toLocaleDateString()}
                    </p>
                    {inv.ai_summary && (
                      <div className="pt-2">
                        <p className="text-xs text-charcoal/60 italic font-sans font-light leading-relaxed">
                          "{inv.ai_summary}"
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-sm font-mono text-charcoal tracking-tight">
                      KSh {Number(inv.total_amount).toLocaleString()}
                    </p>
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border block ${INVOICE_STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-clay/5">
                  <button
                    onClick={() => downloadFile(`/api/payments/invoices/${inv.id}/download/`, `NEST_Invoice_${inv.id}.pdf`)}
                    className="text-sienna text-2xs font-mono uppercase tracking-widest hover:text-clay transition"
                  >
                    [ Download Statement Manifest PDF ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyPayments