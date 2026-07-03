import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const ROLE_STYLES = {
  TENANT: 'bg-clay/10 text-clay',
  LANDLORD: 'bg-olive/10 text-olive',
  AGENCY: 'bg-sienna/10 text-sienna',
  NEST_ADMIN: 'bg-charcoal/10 text-charcoal',
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
      setError('Could not load users.')
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
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Users
      </h1>
      <p className="text-charcoal/60 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage all users on the platform.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm mb-8"
        style={{ fontFamily: "'Inter', sans-serif" }}
      />

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No users found.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((user) => (
          <div key={user.id} className="bg-white border border-clay/15 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {user.email}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[user.profile?.role] || 'bg-clay/10 text-clay'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {user.profile?.role}
                </span>
                {user.profile?.is_banned && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-brick/10 text-brick"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Banned
                  </span>
                )}
                {!user.profile?.is_email_verified && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-clay/10 text-clay"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {user.profile?.is_banned ? (
                <button
                  onClick={() => handleUnban(user.id)}
                  disabled={acting[user.id]}
                  className="text-xs px-3 py-1.5 rounded-lg bg-olive text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {acting[user.id] === 'unbanning' ? 'Unbanning...' : 'Unban'}
                </button>
              ) : (
                <button
                  onClick={() => { setBanId(user.id); setWarnId(null); setReason('') }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-brick/30 text-brick hover:bg-brick/5 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Ban
                </button>
              )}
              <button
                onClick={() => { setWarnId(user.id); setBanId(null); setReason('') }}
                className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Warn
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={acting[user.id]}
                className="text-xs px-3 py-1.5 rounded-lg border border-brick/30 text-brick hover:bg-brick/5 transition disabled:opacity-60"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {acting[user.id] === 'deleting' ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            {(banId === user.id || warnId === user.id) && (
              <div className="mt-4 pt-4 border-t border-clay/10 space-y-2">
                <p className="text-sm font-medium text-charcoal" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {banId === user.id ? 'Reason for ban' : 'Warning message'}
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition resize-none"
                  placeholder="Enter reason..."
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => banId === user.id ? handleBan(user.id) : handleWarn(user.id)}
                    disabled={acting[user.id]}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brick text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {acting[user.id] ? 'Processing...' : banId === user.id ? 'Confirm ban' : 'Issue warning'}
                  </button>
                  <button
                    onClick={() => { setBanId(null); setWarnId(null); setReason('') }}
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

export default AdminUsers