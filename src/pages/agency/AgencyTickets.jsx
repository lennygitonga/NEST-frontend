import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'

const PRIORITY_STYLES = {
  LOW: 'bg-olive/10 text-olive',
  MEDIUM: 'bg-clay/10 text-clay',
  HIGH: 'bg-sienna/10 text-sienna',
  URGENT: 'bg-brick/10 text-brick',
}

const STATUS_STYLES = {
  OPEN: 'bg-clay/10 text-clay',
  IN_PROGRESS: 'bg-sienna/10 text-sienna',
  RESOLVED: 'bg-olive/10 text-olive',
  CLOSED: 'bg-charcoal/10 text-charcoal/50',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

function AgencyTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [updating, setUpdating] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      const response = await apiClient.get('/api/tickets/', { params })
      setTickets(response.data)
    } catch {
      setError('Could not load tickets.')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleStatusUpdate = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: true }))
    try {
      await apiClient.patch(`/api/tickets/${id}/status/`, { status })
      fetchTickets()
    } catch {
      // silently fail
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleComment = async (ticketId) => {
    if (!comment.trim()) return
    setIsSending(true)
    try {
      await apiClient.post(`/api/tickets/${ticketId}/comments/`, { text: comment })
      setComment('')
      fetchTickets()
    } catch {
      // silently fail
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Tickets
      </h1>
      <p className="text-charcoal/60 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage maintenance requests from your tenants.
      </p>

      <div className="flex gap-3 mb-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && tickets.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No tickets found.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border border-clay/15 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  {ticket.title}
                </p>
                <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.reported_by_email} · {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[ticket.priority]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.priority}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-charcoal/70 text-sm mt-3 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              {ticket.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(ticket.id, s)}
                  disabled={ticket.status === s || updating[ticket.id]}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                    ticket.status === s
                      ? 'border-clay/30 bg-clay/10 text-clay cursor-default'
                      : 'border-clay/20 text-charcoal/60 hover:border-clay/40 hover:text-charcoal disabled:opacity-40'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
              <button
                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-clay/20 text-charcoal/60 hover:border-clay/40 hover:text-charcoal transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {expandedId === ticket.id ? 'Hide comments' : `Comments (${ticket.comments?.length || 0})`}
              </button>
            </div>

            {expandedId === ticket.id && (
              <div className="mt-4 pt-4 border-t border-clay/10">
                <div className="space-y-2 mb-3">
                  {ticket.comments?.length === 0 && (
                    <p className="text-charcoal/40 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No comments yet.</p>
                  )}
                  {ticket.comments?.map((c) => (
                    <div key={c.id} className="bg-sand rounded-lg px-3 py-2">
                      <p className="text-charcoal text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{c.text}</p>
                      <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {c.author_email} · {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button
                    onClick={() => handleComment(ticket.id)}
                    disabled={isSending}
                    className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Send
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

export default AgencyTickets