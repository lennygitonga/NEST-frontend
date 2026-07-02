import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  ACTIVE: 'bg-olive/10 text-olive',
  TERMINATED: 'bg-brick/10 text-brick',
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

  const fetchLandlords = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/agencies/landlords/')
      setLandlords(response.data)
    } catch {
      setError('Could not load landlords.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLandlords()
  }, [fetchLandlords])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      const userRes = await apiClient.get(`/api/auth/profile/`)
      // We need the landlord's user ID from their email
      // Since there's no direct endpoint, we use the add landlord endpoint
      // which expects the landlord user ID
      // First find the user by searching — backend add_landlord_view expects landlord ID
      // We'll add by email approach via a backend lookup
      await apiClient.post('/api/agencies/landlords/add/', {
        landlord: landlordEmail,
        management_fee_percent: managementFee,
      })
      setLandlordEmail('')
      setManagementFee('0')
      setShowForm(false)
      setSubmitStatus('idle')
      fetchLandlords()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || data?.landlord?.[0] || data?.non_field_errors?.[0] || 'Could not add landlord.')
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
          Landlords
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {showForm ? 'Cancel' : 'Add landlord'}
        </button>
      </div>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage landlords linked to your agency.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-8 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p className="text-lg text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Add landlord
          </p>
          <p className="text-sm text-charcoal/60">
            The landlord must already have a NEST account with the Landlord role before you can link them.
          </p>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Landlord user ID</label>
            <input
              type="number"
              value={landlordEmail}
              onChange={(e) => setLandlordEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              placeholder="Enter the landlord's user ID"
            />
            <p className="text-xs text-charcoal/40 mt-1">
              The landlord can find their user ID in their profile settings.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Management fee (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={managementFee}
              onChange={(e) => setManagementFee(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
            />
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
            {submitStatus === 'submitting' ? 'Adding...' : 'Add landlord'}
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

      {!isLoading && !error && landlords.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No landlords linked yet. Add one to get started.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {landlords.map((l) => (
          <div
            key={l.id}
            className="bg-white border border-clay/15 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  {l.landlord_name || `Landlord #${l.landlord}`}
                </p>
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {l.landlord_email}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {l.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide">Management fee</p>
                <p className="text-charcoal text-sm font-medium mt-1">{l.management_fee_percent}%</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 uppercase tracking-wide">Joined</p>
                <p className="text-charcoal text-sm font-medium mt-1">
                  {new Date(l.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgencyLandlords