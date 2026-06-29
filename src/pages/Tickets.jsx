import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
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
      setTickets(ticketsRes.data)

      const uniqueProps = await Promise.all(
        [...new Set(leasesRes.data.map((l) => l.property))].map((id) =>
          apiClient.get(`/api/properties/${id}/`).then((r) => r.data)
        )
      )
      setProperties(uniqueProps)
      if (uniqueProps.length > 0) setPropertyId(String(uniqueProps[0].id))
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
      setSubmitError(data?.error || 'Could not file the ticket. Please try again.')
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
          Tickets
        </h1>
        {properties.length > 0 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showForm ? 'Cancel' : 'Report an issue'}
          </button>
        )}
      </div>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Report maintenance issues and track their progress.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-8 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
              placeholder="e.g. Leaking kitchen tap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm resize-none"
              placeholder="Describe the issue in detail..."
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
            {submitStatus === 'submitting' ? 'Submitting...' : 'Submit ticket'}
          </button>
        </form>
      )}

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading...
        </p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            You need an active lease before you can file maintenance tickets.
          </p>
        </div>
      )}

      {!isLoading && !error && properties.length > 0 && tickets.length === 0 && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          No tickets filed yet.
        </p>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="block bg-white border border-clay/15 rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                  {ticket.title}
                </p>
                <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Filed {new Date(ticket.created_at).toLocaleDateString()}
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
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Tickets