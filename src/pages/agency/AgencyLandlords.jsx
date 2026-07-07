import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'

const STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  ACTIVE: 'border-olive/20 bg-olive/5 text-olive',
  TERMINATED: 'border-brick/20 bg-brick/5 text-brick',
}

function AgencyLandlords() {
  const [landlords, setLandlords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [landlordEmail, setLandlordEmail] = useState('')
  const [managementFee, setManagementFee] = useState('0')
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [foundLandlord, setFoundLandlord] = useState(null)

  const fetchLandlords = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/agencies/landlords/')
      setLandlords(response.data)
    } catch {
      setError('Could not query linked administrative accounts database context.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLandlords()
  }, [fetchLandlords])

  const handleLookup = async () => {
    setIsLooking(true)
    setLookupError('')
    setFoundLandlord(null)
    try {
      const response = await apiClient.get('/api/auth/find-user/', {
        params: { email: landlordEmail },
      })
      setFoundLandlord(response.data)
    } catch (err) {
      setLookupError(err.response?.data?.error || 'Target signature node could not be localized.')
    } finally {
      setIsLooking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!foundLandlord) return
    setSubmitStatus('submitting')
    setSubmitError('')
    try {
      await apiClient.post('/api/agencies/landlords/add/', {
        landlord: foundLandlord.id,
        management_fee_percent: managementFee,
      })
      setLandlordEmail('')
      setManagementFee('0')
      setFoundLandlord(null)
      setShowForm(false)
      setSubmitStatus('idle')
      fetchLandlords()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || data?.landlord?.[0] || data?.non_field_errors?.[0] || 'Link synchronization aborted.')
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
              <span>Identity Mapping</span>
              <span className="w-1 h-1 rounded-full bg-sienna" />
              <span>Asset Stakeholders</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Landlord Registry
            </h1>
            <p className="text-xs font-mono text-charcoal/50 mt-1">
              Management linkages established between corporate operational pools and independent developers.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm((v) => !v)
              if (showForm) {
                setLandlordEmail('')
                setFoundLandlord(null)
                setLookupError('')
              }
            }}
            className="bg-sienna text-sand px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition shrink-0"
          >
            {showForm ? 'Cancel Array' : 'Link Investor'}
          </button>
        </header>

        {/* Add Landlord Form Block */}
        {showForm && (
          <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                Establish Management Linkage
              </h2>
              <p className="text-[10px] font-mono text-charcoal/40 mt-1 uppercase tracking-wider">
                Target account must possess active cryptographic landlord parameters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-clay/5">
              <div>
                <label className={labelClasses}>Broker Signature Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="investor@domain.com"
                  />
                  <button
                    type="button"
                    onClick={handleLookup}
                    disabled={isLooking}
                    className="bg-charcoal text-sand px-4 py-2 rounded-xl text-2xs font-mono uppercase tracking-wider hover:bg-clay transition disabled:opacity-40"
                  >
                    {isLooking ? 'Searching...' : 'Verify Node'}
                  </button>
                </div>
                {lookupError && <p className="text-2xs font-mono uppercase text-brick mt-1.5">{lookupError}</p>}
                {foundLandlord && (
                  <p className="text-2xs font-mono uppercase text-olive mt-1.5 border border-olive/10 bg-olive/5 p-2 rounded-lg">
                    Matched Entity: {foundLandlord.name} ({foundLandlord.email})
                  </p>
                )}
              </div>

              <div>
                <label className={labelClasses}>Contractual Management Charge (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {submitError && (
                <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'submitting' || !foundLandlord}
                className="bg-sienna text-sand px-6 py-3 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition disabled:opacity-40"
              >
                {submitStatus === 'submitting' ? 'Syncing...' : 'Commit Relationship Parameters'}
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Querying partner ledger cells...
          </div>
        )}

        {error && (
          <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && landlords.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              No verified landlord structures linked to this terminal brokerage footprint.
            </p>
          </div>
        )}

        {/* Landlord Feed */}
        <div className="space-y-4">
          {landlords.map((l) => (
            <div key={l.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                    {l.landlord_name || `Stakeholder Context #${l.landlord}`}
                  </h3>
                  <p className="text-xs font-mono text-charcoal/40">
                    {l.landlord_email}
                  </p>
                </div>
                <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${STATUS_STYLES[l.status]}`}>
                  {l.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-clay/5">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Broker Revenue Slice</p>
                  <p className="text-sm font-light text-charcoal mt-0.5">{l.management_fee_percent}% gross</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Link Verification Timestamp</p>
                  <p className="text-sm font-light text-charcoal mt-0.5">
                    {new Date(l.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgencyLandlords