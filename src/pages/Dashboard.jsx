import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'
import useAuthStore from '../store/authStore'
import apiClient from '../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white/70 backdrop-blur-sm border border-clay/10 rounded-lg p-5 flex flex-col justify-between min-h-[110px]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, borderColor: 'rgba(201, 123, 94, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
      <div>
        <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p className="text-2xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          {value}
        </p>
      </div>
      {sub && (
        <p className="text-xs text-charcoal/50 font-light mt-2 border-t border-clay/5 pt-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {sub}
        </p>
      )}
    </motion.div>
  )

  return to ? <Link to={to} className="group block">{inner}</Link> : inner
}

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [isLoading, setIsLoading] = useState(true)
  const [lease, setLease] = useState(null)
  const [payments, setPayments] = useState([])
  const [tickets, setTickets] = useState([])
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/properties/leases/'),
      apiClient.get('/api/payments/'),
      apiClient.get('/api/tickets/'),
      apiClient.get('/api/payments/invoices/'),
    ]).then(([leasesRes, paymentsRes, ticketsRes, invoicesRes]) => {
      if (leasesRes.status === 'fulfilled') {
        const active = leasesRes.value.data.find((l) => l.is_active)
        setLease(active || null)
      }
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data)
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.data)
      if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value.data)
    }).finally(() => setIsLoading(false))
  }, [])

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'User'
  const lastPayment = payments.find((p) => p.status === 'COMPLETED')
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')

  return (
    <div className="min-h-screen bg-sand text-charcoal">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        
        {/* Editorial Sub-Header & Greeting */}
        <header className="border-b border-clay/10 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              <span>Operational Node</span>
              <span className="w-1 h-1 rounded-full bg-sienna" />
              <span>Active State</span>
            </div>
            <h1 className="text-4xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Welcome back, <span className="italic text-sienna font-normal">{firstName}</span>.
            </h1>
          </div>
          <p className="text-charcoal/50 text-xs font-mono tracking-wider md:text-right uppercase">
            System Synchronization Complete
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-charcoal/50 font-mono">
            <span className="animate-pulse w-2 h-2 rounded-full bg-clay" />
            <span>Retrieving account configuration...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Primary Workspace Sections (Left Column Span) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Lease Status Architecture Banner */}
              {lease ? (
                <div className="relative overflow-hidden bg-charcoal text-sand rounded-xl p-6 shadow-xl shadow-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Subtle vector architectural reference mesh in background */}
                  <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none w-1/2 select-none">
                    <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="#EFE6D8" strokeWidth="0.5"/>
                      <line x1="20" y1="100" x2="100" y2="20" stroke="#EFE6D8" strokeWidth="0.5"/>
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <span className="inline-block text-[9px] font-mono uppercase tracking-[0.2em] bg-white/10 text-sand/80 px-2 py-0.5 rounded mb-3">
                      Active Deployment Lease
                    </span>
                    <h3 className="text-2xl font-light tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                      Property ID · #{lease.property}
                    </h3>
                    <p className="text-sand/60 text-sm mt-1.5 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Allocation Contract expiring <span className="text-sand font-mono">{new Date(lease.end_date).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2.5 relative z-10 shrink-0 w-full sm:w-auto">
                    <Link
                      to="/payments"
                      className="flex-1 sm:flex-none text-center bg-sienna text-sand px-5 py-2 rounded-md text-xs font-mono uppercase tracking-wider hover:bg-clay transition duration-300"
                    >
                      Remit Rent
                    </Link>
                    <Link
                      to="/tickets"
                      className="flex-1 sm:flex-none text-center border border-sand/20 text-sand px-5 py-2 rounded-md text-xs font-mono uppercase tracking-wider hover:bg-sand/10 transition duration-300"
                    >
                      Log Incident
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-clay/30 bg-white/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                      No Managed Tenancy Found
                    </h3>
                    <p className="text-charcoal/50 text-sm mt-1 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Your profile has no active housing deployment mapped yet.
                    </p>
                  </div>
                  <Link
                    to="/properties"
                    className="bg-charcoal text-sand px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider hover:bg-sienna transition shrink-0"
                  >
                    Explore Properties
                  </Link>
                </div>
              )}

              {/* Grid Metric Panel */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-charcoal/40">
                  <span>System Telemetry</span>
                  <div className="h-px bg-clay/10 flex-1" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatCard
                    label="Last Account Remittance"
                    value={lastPayment ? `KSh ${Number(lastPayment.total_amount).toLocaleString()}` : '—'}
                    sub={lastPayment ? `Processed on ${new Date(lastPayment.payment_date).toLocaleDateString()}` : 'No processing history'}
                    to="/payments"
                  />
                  <StatCard
                    label="Outstanding Obligations"
                    value={pendingInvoices.length}
                    sub={pendingInvoices.length > 0 ? `KSh ${Number(pendingInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)).toLocaleString()} cumulative` : 'Finances clear'}
                    to="/payments"
                  />
                  <StatCard
                    label="Open Support Tickets"
                    value={openTickets.length}
                    sub={openTickets.length === 1 ? '1 active trace' : openTickets.length > 0 ? `${openTickets.length} operational reports` : 'Zero active faults'}
                    to="/tickets"
                  />
                  <StatCard
                    label="Onboarding Status"
                    value={lease ? 'Authorized' : 'Review'}
                    sub={lease ? 'Lease fully synchronized' : 'Verification step required'}
                    to="/applications"
                  />
                </div>
              </div>
            </div>

            {/* Context Sidebar (Right Column) */}
            <div className="space-y-6 lg:border-l lg:border-clay/10 lg:pl-8 lg:min-h-[400px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-charcoal/40">
                    <span>Incident Traces</span>
                    {openTickets.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brick animate-ping" />
                    )}
                  </div>
                  <Link to="/tickets" className="text-xs text-sienna hover:text-clay font-mono uppercase tracking-wide">
                    All logs →
                  </Link>
                </div>

                {openTickets.length > 0 ? (
                  <div className="space-y-2.5">
                    {openTickets.slice(0, 3).map((ticket) => (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="group block bg-white/50 border border-clay/10 rounded-lg px-4 py-3.5 hover:bg-white transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-charcoal text-sm font-light tracking-tight line-clamp-2 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {ticket.title}
                          </p>
                          <span
                            className={`shrink-0 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded uppercase ${
                              ticket.priority === 'URGENT' ? 'bg-brick/10 text-brick' :
                              ticket.priority === 'HIGH' ? 'bg-sienna/10 text-sienna' :
                              'bg-clay/10 text-clay'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/20 border border-dashed border-clay/15 rounded-lg p-6 text-center">
                    <p className="text-xs font-mono text-charcoal/40 uppercase tracking-wider">
                      No Actionable Tasks Mapped
                    </p>
                  </div>
                )}
              </div>

              {/* Environment Information Block */}
              <div className="bg-clay/5 border border-clay/10 rounded-lg p-4 font-mono text-[10px] text-charcoal/50 space-y-2">
                <div className="flex justify-between">
                  <span>DEPLOYMENT NODE:</span>
                  <span className="text-charcoal">NEST-PRD-01</span>
                </div>
                <div className="flex justify-between">
                  <span>ENCRYPTION ROUTE:</span>
                  <span className="text-charcoal">AES-256 BIT</span>
                </div>
                <div className="flex justify-between">
                  <span>SATELLITE SYNC:</span>
                  <span className="text-emerald-700 font-medium">ONLINE</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard