import { useState, useEffect } from 'react'
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

function LandlordTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    apiClient.get('/api/tickets/')
      .then((response) => setTickets(response.data))
      .catch(() => setError('Could not load tickets.'))
      .finally(() => setIsLoading(false))
  }, [])

  const open = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Tickets
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Maintenance requests raised by tenants on your properties.
      </p>

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
            No maintenance tickets yet.
          </p>
        </div>
      )}

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Open
          </h2>
          <div className="space-y-4">
            {open.map((ticket) => (
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

                {ticket.comments?.length > 0 && (
                  <button
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                    className="mt-3 text-sienna text-sm font-medium hover:text-clay"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {expandedId === ticket.id ? 'Hide comments' : `View comments (${ticket.comments.length})`}
                  </button>
                )}

                {expandedId === ticket.id && (
                  <div className="mt-4 pt-4 border-t border-clay/10 space-y-2">
                    {ticket.comments.map((c) => (
                      <div key={c.id} className="bg-sand rounded-lg px-3 py-2">
                        <p className="text-charcoal text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{c.text}</p>
                        <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {c.author_email} · {new Date(c.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Resolved
          </h2>
          <div className="space-y-3">
            {resolved.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-clay/15 rounded-xl p-5 opacity-70">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                      {ticket.title}
                    </p>
                    <p className="text-charcoal/40 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                      {ticket.resolved_at && ` · resolved ${new Date(ticket.resolved_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[ticket.status]}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LandlordTickets