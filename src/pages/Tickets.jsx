import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/client'

const PRIORITY_STYLES = {
  LOW: 'border-olive/20 text-olive bg-olive/5',
  MEDIUM: 'border-clay/20 text-clay bg-clay/5',
  HIGH: 'border-sienna/30 text-sienna bg-sienna/5',
  URGENT: 'border-brick/30 text-brick bg-brick/5',
}

const STATUS_STYLES = {
  OPEN: 'border-clay/20 text-clay bg-clay/5',
  IN_PROGRESS: 'border-sienna/20 text-sienna bg-sienna/5',
  RESOLVED: 'border-olive/20 text-olive bg-olive/5',
  CLOSED: 'border-charcoal/10 text-charcoal/40 bg-charcoal/5',
}

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [ticketsRes, leasesRes] = await Promise.all([
        apiClient.get('/api/tickets/'),
        apiClient.get('/api/properties/leases/'),
      ])
      
      const incomingTickets = ticketsRes.data
      const incomingLeases = leasesRes.data

      setTickets(Array.isArray(incomingTickets) ? incomingTickets : [])

      if (Array.isArray(incomingLeases)) {
        const uniqueProps = await Promise.all(
          [...new Set(incomingLeases.map((l) => l.property))].map((id) =>
            apiClient.get(`/api/properties/${id}/`).then((r) => r.data)
          )
        )
        setProperties(uniqueProps)
        if (uniqueProps.length > 0) setPropertyId(String(uniqueProps[0].id))
      } else {
        setProperties([])
      }
    } catch {
      setError('Could not load your tickets.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      await apiClient.post('/api/tickets/', {
        property: propertyId,
        title,
        description,
      })
      setTitle('')
      setDescription('')
      setShowForm(false)
      setSubmitStatus('idle')
      fetchData()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || 'Could not file ticket profile.')
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 space-y-12">
      {/* Title block with structural floating button */}
      <div className="flex items-end justify-between border-b border-clay/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Maintenance Desk
          </h1>
          <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Issue logs, technical work orders, and resolution flows.
          </p>
        </div>
        {Array.isArray(properties) && properties.length > 0 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-medium uppercase tracking-wider text-sienna hover:text-charcoal transition duration-150"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showForm ? 'Close panel' : '⚡ Log descriptive issue'}
          </button>
        )}
      </div>

      {/* Form Overlay Area */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-clay/5 border border-clay/10 rounded-xl p-6 space-y-4 font-light text-xs text-charcoal"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div>
              <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Impacted Property Asset</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none"
              >
                {Array.isArray(properties) && properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Problem Core (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none"
                placeholder="Brief summary of failure..."
              />
            </div>

            <div>
              <label className="block text-charcoal/50 uppercase text-[10px] font-mono mb-1.5">Granular Context Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded border border-clay/20 bg-white text-charcoal text-xs font-light focus:outline-none resize-none"
                placeholder="Elaborate on details, error patterns, location parameters..."
              />
            </div>

            {submitError && (
              <p className="text-brick font-mono text-[11px]">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="bg-charcoal text-sand uppercase font-medium tracking-wider text-[10px] px-5 py-2.5 rounded hover:bg-sienna transition disabled:opacity-50"
            >
              {submitStatus === 'submitting' ? 'Transmitting...' : 'File log entry'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading && (
        <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest">Polling servers...</p>
      )}

      {error && (
        <div className="text-xs text-brick border border-brick/10 bg-brick/5 rounded px-4 py-3 max-w-max font-mono">
          {error}
        </div>
      )}

      {!isLoading && !error && (!Array.isArray(properties) || properties.length === 0) && (
        <p className="text-sm font-light text-charcoal/50 font-serif italic">
          An active workspace lease configuration is required before ticketing initialization parameters can clear.
        </p>
      )}

      {!isLoading && !error && Array.isArray(properties) && properties.length > 0 && (!Array.isArray(tickets) || tickets.length === 0) && (
        <p className="text-sm font-light text-charcoal/50 font-serif italic">
          No operational issues logged under this identifier.
        </p>
      )}

      {/* Ticket Logs Feed */}
      <div className="space-y-4">
        {Array.isArray(tickets) && tickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="block border border-clay/15 rounded-xl p-6 bg-white hover:border-sienna/40 transition duration-200"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0 space-y-1">
                <p className="text-base text-charcoal font-light truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                  {ticket.title}
                </p>
                <p className="text-[10px] text-charcoal/40 font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Opened {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Status & Priority chips using thin mono aesthetics */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-[9px] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className={`px-2.5 py-0.5 rounded border ${PRIORITY_STYLES[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded border ${STATUS_STYLES[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Tickets