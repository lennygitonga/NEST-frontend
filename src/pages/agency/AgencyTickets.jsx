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

function TicketCommentSection({ ticket, onCommentAdded }) {
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return
    setIsSending(true)
    try {
      await apiClient.post(`/api/tickets/${ticket.id}/comments/`, { text: comment })
      setComment('')
      onCommentAdded()
    } catch {
      // silently fail
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mt-5 pt-5 border-t border-clay/10 space-y-4 animate-fadeIn">
      <div className="space-y-3">
        {(!ticket.comments || ticket.comments.length === 0) && (
          <p className="text-charcoal/40 text-xs italic" style={{ fontFamily: "'Inter', sans-serif" }}>No comments yet.</p>
        )}
        {ticket.comments?.map((c) => (
          <div key={c.id} className="bg-sand/40 border border-clay/5 rounded-xl px-4 py-3">
            <p className="text-charcoal text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{c.text}</p>
            <p className="text-charcoal/40 text-[10px] font-medium uppercase tracking-wider mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {c.author_email} · {new Date(c.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 pt-1">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all text-sm shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <button
          onClick={handleCommentSubmit}
          disabled={isSending}
          className="bg-sienna text-sand px-5 py-2.5 rounded-xl font-medium hover:bg-clay transition-all disabled:opacity-60 text-sm shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

function AgencyTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [updating, setUpdating] = useState({})
  const [expandedId, setExpandedId] = useState(null)

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
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      const response = await apiClient.get('/api/tickets/', { params })
      setTickets(response.data)
    } catch {
      // silently fail
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2 tracking-tight"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Tickets
      </h1>
      <p className="text-charcoal/60 mb-8 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage maintenance requests from your tenants.
      </p>

      <div className="flex gap-3 mb-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-clay/20 bg-white text-charcoal text-xs font-medium focus:outline-none focus:border-clay transition-all shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-clay/20 bg-white text-charcoal text-xs font-medium focus:outline-none focus:border-clay transition-all shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-charcoal/40 text-sm animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {error}
        </div>
      )}

      {!isLoading && !error && tickets.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-2xl p-10 text-center shadow-[0_4px_24px_rgba(43,41,40,0.01)]">
          <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            No tickets found.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border border-clay/15 rounded-2xl p-6 shadow-[0_4px_24px_rgba(43,41,40,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-clay/5">
              <div className="min-w-0">
                <p className="text-lg text-charcoal font-medium tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                  {ticket.title}
                </p>
                <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.reported_by_email} · {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${PRIORITY_STYLES[ticket.priority]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.priority}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-charcoal/70 text-sm mt-4 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              {ticket.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-6 pt-2">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(ticket.id, s)}
                  disabled={ticket.status === s || updating[ticket.id]}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium ${
                    ticket.status === s
                      ? 'border-clay/30 bg-clay/10 text-clay cursor-default'
                      : 'border-clay/15 text-charcoal/60 hover:border-clay/40 hover:text-charcoal disabled:opacity-40'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
              
              <div className="flex-1 min-w-[12px] sm:block hidden" />
              
              <button
                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-sienna/20 text-sienna hover:bg-sienna/5 transition-all font-medium ml-auto sm:ml-0"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {expandedId === ticket.id ? 'Hide comments' : `Comments (${ticket.comments?.length || 0})`}
              </button>
            </div>

            {expandedId === ticket.id && (
              <TicketCommentSection ticket={ticket} onCommentAdded={fetchTickets} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgencyTickets