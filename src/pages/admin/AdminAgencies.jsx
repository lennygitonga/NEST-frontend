import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

function AdminAgencies() {
  const [agencies, setAgencies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [acting, setActing] = useState({})
  const [penalizeId, setPenalizeId] = useState(null)
  const [penalizeRate, setPenalizeRate] = useState('')
  const [penalizeReason, setPenalizeReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendId, setSuspendId] = useState(null)

  const fetchAgencies = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/agencies/')
      setAgencies(response.data)
    } catch {
      setError('Could not load agencies.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  const handleVerify = async (id, isVerified) => {
    setActing((prev) => ({ ...prev, [id]: 'verifying' }))
    try {
      await apiClient.patch(`/api/agencies/${id}/verify/`, { is_verified: isVerified })
      fetchAgencies()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleSuspend = async (id) => {
    if (!suspendReason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'suspending' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/suspend/`, { reason: suspendReason })
      setSuspendId(null)
      setSuspendReason('')
      fetchAgencies()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleUnsuspend = async (id) => {
    setActing((prev) => ({ ...prev, [id]: 'unsuspending' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/unsuspend/`)
      fetchAgencies()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handlePenalize = async (id) => {
    if (!penalizeRate || !penalizeReason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'penalizing' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/penalize/`, {
        new_commission_rate: penalizeRate,
        reason: penalizeReason,
      })
      setPenalizeId(null)
      setPenalizeRate('')
      setPenalizeReason('')
      fetchAgencies()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Agencies
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Verify, suspend, and manage all agencies on the platform.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && agencies.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No agencies registered yet.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {agencies.map((agency) => (
          <div key={agency.id} className="bg-white border border-clay/15 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  {agency.name}
                </p>
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {agency.email} · {agency.phone_number}
                </p>
                <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Reg: {agency.registration_number} · Commission: {agency.commission_rate}%
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    agency.is_verified ? 'bg-olive/10 text-olive' : 'bg-clay/10 text-clay'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {agency.is_verified ? 'Verified' : 'Unverified'}
                </span>
                {agency.is_suspended && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-brick/10 text-brick"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Suspended
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {!agency.is_verified ? (
                <button
                  onClick={() => handleVerify(agency.id, true)}
                  disabled={acting[agency.id]}
                  className="text-xs px-3 py-1.5 rounded-lg bg-olive text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {acting[agency.id] === 'verifying' ? 'Verifying...' : 'Verify'}
                </button>
              ) : (
                <button
                  onClick={() => handleVerify(agency.id, false)}
                  disabled={acting[agency.id]}
                  className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Revoke verification
                </button>
              )}

              {!agency.is_suspended ? (
                <button
                  onClick={() => setSuspendId(agency.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-brick/30 text-brick hover:bg-brick/5 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => handleUnsuspend(agency.id)}
                  disabled={acting[agency.id]}
                  className="text-xs px-3 py-1.5 rounded-lg bg-olive text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {acting[agency.id] === 'unsuspending' ? 'Unsuspending...' : 'Unsuspend'}
                </button>
              )}

              <button
                onClick={() => setPenalizeId(agency.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Adjust commission
              </button>
            </div>

            {suspendId === agency.id && (
              <div className="mt-4 pt-4 border-t border-clay/10 space-y-2">
                <p className="text-sm font-medium text-charcoal" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Reason for suspension
                </p>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition resize-none"
                  placeholder="Enter reason..."
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSuspend(agency.id)}
                    disabled={acting[agency.id]}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brick text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {acting[agency.id] === 'suspending' ? 'Suspending...' : 'Confirm suspension'}
                  </button>
                  <button
                    onClick={() => { setSuspendId(null); setSuspendReason('') }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {penalizeId === agency.id && (
              <div className="mt-4 pt-4 border-t border-clay/10 space-y-2">
                <p className="text-sm font-medium text-charcoal" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Adjust commission rate
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={penalizeRate}
                    onChange={(e) => setPenalizeRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="New rate (%)"
                    className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <input
                    type="text"
                    value={penalizeReason}
                    onChange={(e) => setPenalizeReason(e.target.value)}
                    placeholder="Reason"
                    className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePenalize(agency.id)}
                    disabled={acting[agency.id]}
                    className="text-xs px-3 py-1.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {acting[agency.id] === 'penalizing' ? 'Updating...' : 'Update rate'}
                  </button>
                  <button
                    onClick={() => { setPenalizeId(null); setPenalizeRate(''); setPenalizeReason('') }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminAgencies
