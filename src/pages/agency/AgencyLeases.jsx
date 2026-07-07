import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'

function AgencyLeases() {
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const [propertyId, setPropertyId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rentAmount, setRentAmount] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [leasesRes, propsRes] = await Promise.all([
        apiClient.get('/api/properties/leases/'),
        apiClient.get('/api/properties/'),
      ])
      setLeases(leasesRes.data)
      const vacant = propsRes.data.filter((p) => p.is_vacant)
      setProperties(vacant)
      if (vacant.length > 0) {
        setPropertyId(String(vacant[0].id))
        setRentAmount(String(vacant[0].rent_amount))
      }
    } catch {
      setError('Lease configuration matrix synchronization failed.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    apiClient.get('/api/agencies/tenants/')
      .then((response) => {
        const t = response.data.tenants || []
        setTenants(t)
        if (t.length > 0) {
          setTenantId(String(t[0].tenant_id))
        }
      })
      .catch(() => {})
  }, [fetchData])

  const handlePropertyChange = (id) => {
    setPropertyId(id)
    const prop = properties.find((p) => String(p.id) === id)
    if (prop) setRentAmount(String(prop.rent_amount))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      await apiClient.post('/api/properties/leases/', {
        property: propertyId,
        tenant: tenantId,
        start_date: startDate,
        end_date: endDate,
        rent_amount: rentAmount,
      })
      setShowForm(false)
      setSubmitStatus('idle')
      fetchData()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || Object.values(data || {})?.[0]?.[0] || 'Lease initialization sequence aborted.')
      setSubmitStatus('error')
    }
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-clay/15 bg-sand/30 text-charcoal focus:outline-none focus:border-clay/40 focus:bg-white transition text-sm"
  const labelClasses = "block text-[9px] font-mono uppercase tracking-widest text-charcoal/40 mb-2"

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              <span>Legal Routing</span>
              <span className="w-1 h-1 rounded-full bg-sienna" />
              <span>Tenancy Bindings</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight font-serif">
              Leases Ledger
            </h1>
            <p className="text-xs font-mono text-charcoal/50 mt-1">
              Active legal covenants mapping tenant credentials to physical spatial assets.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-sienna text-sand px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition shrink-0"
          >
            {showForm ? 'Cancel Token' : 'Initialize Bond'}
          </button>
        </header>

        {/* Form Container */}
        {showForm && (
          <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-light text-charcoal tracking-tight font-serif">
                Provision New Lease Agreement
              </h2>
              <p className="text-[10px] font-mono text-charcoal/40 mt-1 uppercase tracking-wider">
                This transaction marks the target unit as occupied across linked routing panels.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-clay/5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Target Asset Node</label>
                  {properties.length === 0 ? (
                    <p className="text-2xs font-mono uppercase text-brick border border-brick/10 bg-brick/5 p-3 rounded-xl">No vacant assets in pool register.</p>
                  ) : (
                    <select
                      value={propertyId}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                      className={inputClasses}
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Tenant Node Identity</label>
                  {tenants.length === 0 ? (
                    <p className="text-2xs font-mono uppercase text-brick border border-brick/10 bg-brick/5 p-3 rounded-xl">No unassigned tenant profiles found.</p>
                  ) : (
                    <select
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      className={inputClasses}
                    >
                      {tenants.map((t) => (
                        <option key={t.tenant_id} value={t.tenant_id}>
                          {t.tenant_name} ({t.tenant_email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClasses}>Commencement Origin</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Termination Target</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Yield (KSh/Month)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              {submitError && (
                <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'submitting' || properties.length === 0 || tenants.length === 0}
                className="bg-sienna text-sand px-6 py-3 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition disabled:opacity-40"
              >
                {submitStatus === 'submitting' ? 'Encrypting Matrix...' : 'Commit Operational Covenant'}
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            De-serializing lease registries...
          </div>
        )}

        {error && (
          <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && leases.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              Zero active lease configurations mapping historical tenancy values.
            </p>
          </div>
        )}

        {/* Leases Feed */}
        <div className="space-y-4">
          {leases.map((lease) => (
            <div
              key={lease.id}
              className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-light text-charcoal tracking-tight font-serif">
                    Lease Contract Token #{lease.id}
                  </h3>
                  <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider">
                    Asset Stack ID: #{lease.property} <span className="text-clay/30 mx-1">·</span> Account Mapping Node: #{lease.tenant}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${
                    lease.is_active ? 'border-olive/20 bg-olive/5 text-olive' : 'border-clay/20 bg-clay/5 text-charcoal/40'
                  }`}
                >
                  {lease.is_active ? 'Active Flow' : 'Halted'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-clay/5 text-xs">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Committed Value</p>
                  <p className="font-light text-charcoal mt-1">KSh {Number(lease.rent_amount).toLocaleString()}<span className="text-[10px] text-charcoal/40">/mo</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Horizon Origin</p>
                  <p className="font-light text-charcoal mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Horizon Bound</p>
                  <p className="font-light text-charcoal mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgencyLeases