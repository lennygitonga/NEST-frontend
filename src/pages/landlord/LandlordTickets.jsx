import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'

const PRIORITY_STYLES = {
  LOW: 'border-olive/20 bg-olive/5 text-olive',
  MEDIUM: 'border-clay/20 bg-clay/5 text-clay',
  HIGH: 'border-sienna/20 bg-sienna/5 text-sienna',
  URGENT: 'border-brick/20 bg-brick/5 text-brick font-semibold',
}

const STATUS_STYLES = {
  OPEN: 'border-clay/20 bg-clay/5 text-clay',
  IN_PROGRESS: 'border-sienna/20 bg-sienna/5 text-sienna',
  RESOLVED: 'border-olive/20 bg-olive/5 text-olive',
  CLOSED: 'border-charcoal/20 bg-charcoal/5 text-charcoal/40',
}

function LandlordTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    apiClient.get('/api/tickets/')
      .then((response) => setTickets(response.data))
      .catch(() => setError('Could not pull decentralized maintenance event streams.'))
      .finally(() => setIsLoading(false))
  }, [])

  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED')

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Operational Log</span>
            <span className="w-1 h-1 rounded-full bg-brick" />
            <span>Tenant Disruption Streams</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Maintenance Desks
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Asynchronous optimization and structural correction arrays filed across property clusters.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Pumping operational ticket contexts...
          </div>
        )}

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              Zero active physical engineering incidents registered across database partitions.
            </p>
          </div>
        )}

        {/* Section: Open Operations */}
        {openTickets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Open & Processing Actions ]
            </h2>
            <div className="space-y-4">
              {openTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal/30 block">Incident Token #{ticket.id}</span>
                      <h3 className="text-base font-light text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                        {ticket.title}
                      </h3>
                      <p className="text-xs font-mono text-charcoal/40">
                        Originator: {ticket.reported_by_email} <span className="text-clay/30 mx-1">·</span> Filed: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${PRIORITY_STYLES[ticket.priority] || 'border-clay/20'}`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${STATUS_STYLES[ticket.status] || 'border-clay/20'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-light text-charcoal/80 leading-relaxed border-t border-clay/5 pt-3 font-sans">
                    {ticket.description}
                  </p>

                  {ticket.comments?.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                        className="text-[10px] font-mono uppercase tracking-wider text-sienna hover:text-clay transition focus:outline-none"
                      >
                        {expandedId === ticket.id ? '[-] Collapse Operational Comm Logs' : `[+] View Comm Logs (${ticket.comments.length})`}
                      </button>
                    </div>
                  )}

                  {/* Clean safe comment toggle map with safe optional chaining key fallbacks */}
                  <AnimatePresence>
                    {expandedId === ticket.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: easing }}
                        className="overflow-hidden space-y-2 pt-3 border-t border-clay/5"
                      >
                        {ticket.comments?.map((comment) => (
                          <div key={comment.id} className="bg-sand/40 border border-clay/10 rounded-xl p-4 space-y-1">
                            <p className="text-sm text-charcoal/90 font-light font-sans">{comment.text}</p>
                            <p className="text-[9px] font-mono text-charcoal/40 pt-1">
                              Node ID: {comment.author_email} · Broadcast: {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Resolved Vaults */}
        {resolvedTickets.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Terminated & Resolved Operations ]
            </h2>
            <div className="space-y-3">
              {resolvedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white/60 border border-clay/10 rounded-xl p-5 shadow-sm opacity-60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-md font-light text-charcoal/70 tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                      {ticket.title}
                    </h3>
                    <p className="text-[10px] font-mono text-charcoal/40">
                      Filed: {new Date(ticket.created_at).toLocaleDateString()} 
                      {ticket.resolved_at && ` · De-escalated: ${new Date(ticket.resolved_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLES[ticket.status] || 'border-clay/15'}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandlordTickets