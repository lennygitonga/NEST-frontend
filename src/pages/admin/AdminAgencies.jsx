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
    } catch {} finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleSuspend = async (id) => {
    if (!suspendReason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'suspending' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/suspend/`, { reason: suspendReason })
      setSuspendId(null); setSuspendReason(''); fetchAgencies()
    } catch {} finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleUnsuspend = async (id) => {
    setActing((prev) => ({ ...prev, [id]: 'unsuspending' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/unsuspend/`); fetchAgencies()
    } catch {} finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handlePenalize = async (id) => {
    if (!penalizeRate || !penalizeReason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'penalizing' }))
    try {
      await apiClient.post(`/api/moderation/agencies/${id}/penalize/`, {
        new_commission_rate: penalizeRate, reason: penalizeReason,
      })
      setPenalizeId(null); setPenalizeRate(''); setPenalizeReason(''); fetchAgencies()
    } catch {} finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Admin Control</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Agencies</span>
          </div>
          <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Manage Agencies
          </h1>
        </header>

        {isLoading ? (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">Synchronizing agency records...</div>
        ) : (
          <div className="space-y-4">
            {agencies.map((agency) => (
              <div key={agency.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>{agency.name}</h3>
                    <p className="text-charcoal/50 text-xs mt-1 font-mono">{agency.email} · {agency.phone_number}</p>
                    <div className="flex gap-4 mt-3 text-[10px] uppercase tracking-wider font-mono text-charcoal/40">
                      <span>Reg: {agency.registration_number}</span>
                      <span>Commission: {agency.commission_rate}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${agency.is_verified ? 'border-olive/20 bg-olive/5 text-olive' : 'border-clay/20 bg-clay/5 text-clay'}`}>
                      {agency.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                    {agency.is_suspended && <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-brick/20 bg-brick/5 text-brick">Suspended</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-clay/5">
                  <button onClick={() => handleVerify(agency.id, !agency.is_verified)} className="text-[10px] font-mono uppercase tracking-wider border border-clay/20 px-4 py-2 rounded hover:bg-clay/5 transition">
                    {agency.is_verified ? 'Revoke Verification' : 'Verify Agency'}
                  </button>
                  <button onClick={() => setSuspendId(agency.id)} className="text-[10px] font-mono uppercase tracking-wider border border-brick/20 text-brick px-4 py-2 rounded hover:bg-brick/5 transition">
                    {agency.is_suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button onClick={() => setPenalizeId(agency.id)} className="text-[10px] font-mono uppercase tracking-wider border border-clay/20 px-4 py-2 rounded hover:bg-clay/5 transition">Adjust Commission</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAgencies