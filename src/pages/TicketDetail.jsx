import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { easing } from '../utils/animations'
import apiClient from '../api/client'

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

function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchTicket = () => {
    apiClient.get(`/api/tickets/${id}/`)
      .then((response) => setTicket(response.data))
      .catch(() => setError('Could not load this ticket.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setIsSending(true)

    try {
      await apiClient.post(`/api/tickets/${id}/comments/`, { text: comment })
      setComment('')
      fetchTicket()
    } catch {
      // silently fail, comment box keeps text for retry
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error || 'Ticket not found.'}
        </div>
        <Link to="/tickets" className="text-sienna text-sm font-medium hover:text-clay mt-4 inline-block" style={{ fontFamily: "'Inter', sans-serif" }}>
          ← Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/tickets" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
        ← Back to tickets
      </Link>

      <div className="flex items-start justify-between gap-4 mt-6">
        <h1
          className="text-2xl text-charcoal"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          {ticket.title}
        </h1>
        <div className="flex gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[ticket.priority]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {ticket.priority}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <p className="text-charcoal/40 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        Filed {new Date(ticket.created_at).toLocaleDateString()}
      </p>

      <p className="text-charcoal/80 mt-5 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Inter', sans-serif" }}>
        {ticket.description}
      </p>

      {ticket.photo && (
        <img src={ticket.photo} alt="" className="mt-5 rounded-lg max-h-72 object-cover" />
      )}

      <motion.div
        className="mt-10 pt-8 border-t border-clay/15"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: easing }}
      >
        <h2 className="text-lg text-charcoal mb-4" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
          Comments
        </h2>

        <div className="space-y-3 mb-5">
          {ticket.comments.length === 0 && (
            <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              No comments yet.
            </p>
          )}
          {ticket.comments.map((c) => (
            <div key={c.id} className="bg-white border border-clay/15 rounded-lg p-3">
              <p className="text-charcoal text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                {c.text}
              </p>
              <p className="text-charcoal/40 text-xs mt-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {c.author_email} · {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
          <button
            type="submit"
            disabled={isSending}
            className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Send
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default TicketDetail