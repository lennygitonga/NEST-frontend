import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const ROLE_STYLES = {
  TENANT: 'border-clay/20 bg-clay/5 text-clay',
  LANDLORD: 'border-olive/20 bg-olive/5 text-olive',
  AGENCY: 'border-sienna/20 bg-sienna/5 text-sienna',
  NEST_ADMIN: 'border-charcoal/20 bg-charcoal/5 text-charcoal font-semibold',
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState({})
  const [warnId, setWarnId] = useState(null)
  const [banId, setBanId] = useState(null)
  const [reason, setReason] = useState('')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/auth/users/')
      setUsers(response.data)
    } catch {
      setError('Could not establish synchronization with user database.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleBan = async (id) => {
    if (!reason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'banning' }))
    try {
      await apiClient.post(`/api/moderation/users/${id}/ban/`, { reason })
      setReason('')
      setBanId(null)
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleUnban = async (id) => {
    setActing((prev) => ({ ...prev, [id]: 'unbanning' }))
    try {
      await apiClient.post(`/api/moderation/users/${id}/unban/`)
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleWarn = async (id) => {
    if (!reason.trim()) return
    setActing((prev) => ({ ...prev, [id]: 'warning' }))
    try {
      await apiClient.post(`/api/moderation/users/${id}/warn/`, { reason })
      setReason('')
      setWarnId(null)
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user profile? This configuration is non-reversible.')) return
    setActing((prev) => ({ ...prev, [id]: 'deleting' }))
    try {
      await apiClient.delete(`/api/moderation/users/${id}/delete/`)
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Admin Control</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Identity Directory</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            User Account Ledger
          </h1>
        </header>

        {/* Filter Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search indexing by legal name or credential email..."
            className="w-full px-4 py-3 rounded-lg border border-clay/15 bg-white text-charcoal font-mono text-xs focus:outline-none focus:border-clay transition placeholder:text-charcoal/30"
          />
        </div>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Querying directory nodes...
          </div>
        )}

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              No matching identity signatures discovered.
            </p>
          </div>
        )}

        {/* Directory List */}
        <div className="space-y-4">
          {filtered.map((user) => (
            <div key={user.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 block">
                    Account Signature
                  </span>
                  <h3 className="text-lg font-light tracking-tight mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-xs font-mono text-charcoal/50 mt-1">{user.email}</p>
                </div>

                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${ROLE_STYLES[user.profile?.role] || 'border-clay/20 bg-clay/5 text-clay'}`}>
                    {user.profile?.role || 'No Role Specified'}
                  </span>
                  {user.profile?.is_banned && (
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border border-brick/20 bg-brick/5 text-brick">
                      Banned
                    </span>
                  )}
                  {!user.profile?.is_email_verified && (
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border border-clay/20 bg-clay/5 text-clay">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-clay/5">
                {user.profile?.is_banned ? (
                  <button
                    onClick={() => handleUnban(user.id)}
                    disabled={acting[user.id]}
                    className="text-[10px] font-mono uppercase tracking-wider bg-olive text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                  >
                    {acting[user.id] === 'unbanning' ? 'Reinstating...' : 'Unban Account'}
                  </button>
                ) : (
                  <button
                    onClick={() => { setBanId(user.id); setWarnId(null); setReason('') }}
                    className="text-[10px] font-mono uppercase tracking-wider border border-brick/30 text-brick px-4 py-2 rounded hover:bg-brick/5 transition"
                  >
                    Ban
                  </button>
                )}
                <button
                  onClick={() => { setWarnId(user.id); setBanId(null); setReason('') }}
                  className="text-[10px] font-mono uppercase tracking-wider border border-clay/30 text-charcoal/60 px-4 py-2 rounded hover:bg-clay/5 transition"
                >
                  Warn
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={acting[user.id]}
                  className="text-[10px] font-mono uppercase tracking-wider border border-brick/30 text-brick px-4 py-2 rounded hover:bg-brick/5 transition disabled:opacity-50"
                >
                  {acting[user.id] === 'deleting' ? 'Purging...' : 'Delete'}
                </button>
              </div>

              {/* Collapsible Action Input Drawer */}
              {(banId === user.id || warnId === user.id) && (
                <div className="mt-4 pt-4 border-t border-clay/10 space-y-3 bg-sand/20 p-4 rounded-lg">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal/60">
                    {banId === user.id ? 'Reasoning for Restriction Enactment' : 'Formal System Warning Notice'}
                  </p>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg border border-clay/15 bg-white text-charcoal text-xs font-mono focus:outline-none focus:border-clay transition resize-none placeholder:text-charcoal/30"
                    placeholder="Enter explicit policy infraction or notice rationale..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => banId === user.id ? handleBan(user.id) : handleWarn(user.id)}
                      disabled={acting[user.id]}
                      className="text-[10px] font-mono uppercase tracking-wider bg-brick text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                    >
                      {acting[user.id] ? 'Processing Action...' : banId === user.id ? 'Confirm Restriction' : 'Issue Warning'}
                    </button>
                    <button
                      onClick={() => { setBanId(null); setWarnId(null); setReason('') }}
                      className="text-[10px] font-mono uppercase tracking-wider border border-clay/30 text-charcoal/60 px-4 py-2 rounded hover:bg-clay/5 transition"
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
    </div>
  )
}

export default AdminUsers