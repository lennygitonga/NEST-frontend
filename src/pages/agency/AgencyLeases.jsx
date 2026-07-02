import { useState, useEffect, useCallback } from 'react'
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
      setError('Could not load leases.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    apiClient.get('/api/agencies/tenants/')
      .then((response) => {
        setTenants(response.data.tenants || [])
        if (response.data.tenants?.length > 0) {
          setTenantId(String(response.data.tenants[0].tenant_id))
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
      setSubmitError(data?.error || Object.values(data || {})?.[0]?.[0] || 'Could not create lease.')
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1
          className="text-3xl text-charcoal"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          Leases
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {showForm ? 'Cancel' : 'Create lease'}
        </button>
      </div>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage lease agreements for your properties.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-10 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p className="text-lg text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            New lease
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Property</label>
              {properties.length === 0 ? (
                <p className="text-sm text-brick">No vacant properties available.</p>
              ) : (
                <select
                  value={propertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Tenant</label>
              {tenants.length === 0 ? (
                <p className="text-sm text-brick">No tenants found. Approve an application first.</p>
              ) : (
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
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
              <label className="block text-sm font-medium text-charcoal mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Rent (KSh/mo)</label>
              <input
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
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
            disabled={submitStatus === 'submitting' || properties.length === 0 || tenants.length === 0}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
          >
            {submitStatus === 'submitting' ? 'Creating...' : 'Create lease'}
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
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No leases yet.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {leases.map((lease) => (
          <div
            key={lease.id}
            className="bg-white border border-clay/15 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  Lease #{lease.id}
                </p>
                <p className="text-charcoal/40 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Property #{lease.property} · Tenant #{lease.tenant}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                  lease.is_active ? 'bg-olive/10 text-olive' : 'bg-charcoal/10 text-charcoal/50'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {lease.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide">Rent</p>
                <p className="text-charcoal font-medium mt-1">KSh {Number(lease.rent_amount).toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide">Start</p>
                <p className="text-charcoal font-medium mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide">End</p>
                <p className="text-charcoal font-medium mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgencyLeases