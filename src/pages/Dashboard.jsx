import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'
import useAuthStore from '../store/authStore'
import apiClient from '../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white border border-clay/15 rounded-xl p-6 flex flex-col justify-between min-h-[130px] shadow-sm"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, borderColor: 'rgba(201, 123, 94, 0.35)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
      <div className="space-y-2">
        <p className="text-[9px] font-mono text-charcoal/40 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          {value}
        </p>
      </div>
      {sub && (
        <p className="text-[11px] text-charcoal/50 font-light mt-4 border-t border-clay/5 pt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
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
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-12">
        
        {/* Editorial Sub-Header & Greeting */}
        <header className="border-b border-clay/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40">
              <span>Operational Node</span>
              <span className="w-1 h-1 rounded-full bg-sienna" />
              <span>Active State</span>
            </div>
            <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Welcome back, <span className="italic text-sienna font-light">{firstName}</span>.
            </h1>
          </div>
          <p className="text-charcoal/40 font-mono text-[10px] tracking-widest md:text-right uppercase">
            System Synchronization Complete
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center gap-2.5 py-12 text-xs text-charcoal/50 font-mono tracking-wider uppercase">
            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-clay" />
            <span>Retrieving account configuration records...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            
            {/* Primary Workspace Sections (Left Column Span) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Lease Status Architecture Banner */}
              {lease ? (
                <div className="relative overflow-hidden bg-charcoal text-sand rounded-xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  {/* Subtle clean architectural reference grid in backdrop */}
                  <div className="absolute right-0 bottom-0 top-0 opacity-[0.03] pointer-events-none w-1/2 select-none">
                    <svg className="w-full h-full object-cover" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="0.25"/>
                      <line x1="20" y1="100" x2="100" y2="20" stroke="#FFFFFF" strokeWidth="0.25"/>
                    </svg>
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    <span className="inline-block text-[9px] font-mono uppercase tracking-widest bg-white/10 text-sand/80 px-2 py-0.5 rounded">
                      Active Deployment Lease
                    </span>
                    <h3 className="text-xl font-light tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                      Framework Contract · #{lease.property}
                    </h3>
                    <p className="text-sand/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Allocation sequence mapped to expire <span className="text-sand font-mono">{new Date(lease.end_date).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-3 relative z-10 shrink-0 w-full sm:w-auto">
                    <Link
                      to="/payments"
                      className="flex-1 sm:flex-none text-center bg-sienna text-sand px-5 py-2.5 rounded text-[10px] font-mono uppercase tracking-wider hover:bg-clay transition duration-200"
                    >
                      Remit Rent
                    </Link>
                    <Link
                      to="/tickets"
                      className="flex-1 sm:flex-none text-center border border-sand/20 text-sand px-5 py-2.5 rounded text-[10px] font-mono uppercase tracking-wider hover:bg-white/5 transition duration-200"
                    >
                      Log Incident
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-clay/20 bg-white/40 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-base text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                      No Managed Tenancy Found
                    </h3>
                    <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Your system configuration has no active housing deployment mapped yet.
                    </p>
                  </div>
                  <Link
                    to="/properties"
                    className="bg-charcoal text-sand px-4 py-2.5 rounded text-[10px] font-mono uppercase tracking-wider hover:bg-sienna transition shrink-0"
                  >
                    Explore Properties
                  </Link>
                </div>
              )}

              {/* Grid Metric Panel */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-charcoal/40">
                  <span>System Telemetry Matrix</span>
                  <div className="h-px bg-clay/10 flex-1" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatCard
                    label="Last Account Remittance"
                    value={lastPayment ? `KSh ${Number(lastPayment.total_amount).toLocaleString()}` : '—'}
                    sub={lastPayment ? `Cleared on ${new Date(lastPayment.payment_date).toLocaleDateString()}` : 'No processing logs recorded'}
                    to="/payments"
                  />
                  <StatCard
                    label="Outstanding Obligations"
                    value={pendingInvoices.length > 0 ? pendingInvoices.length : 'Complete Clear'}
                    sub={pendingInvoices.length > 0 ? `KSh ${Number(pendingInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)).toLocaleString()} cumulative balances` : 'Ledger balanced successfully'}
                    to="/payments"
                  />
                  <StatCard
                    label="Active Incident Traces"
                    value={openTickets.length}
                    sub={openTickets.length === 1 ? '1 unresolved fault track' : openTickets.length > 0 ? `${openTickets.length} exceptions logged` : 'Zero unresolved hardware exceptions'}
                    to="/tickets"
                  />
                  <StatCard
                    label="Onboarding Verification"
                    value={lease ? 'Authorized' : 'Pending Step'}
                    sub={lease ? 'Lease structure fully integrated' : 'Requires identity document verification step'}
                    to="/applications"
                  />
                </div>
              </div>
            </div>

            {/* Context Sidebar (Right Column) */}
            <div className="space-y-8 lg:border-l lg:border-clay/10 lg:pl-8 lg:min-h-[420px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-charcoal/40">
                    <span>Incident Traces</span>
                    {openTickets.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brick animate-ping" />
                    )}
                  </div>
                  <Link to="/tickets" className="text-[10px] text-sienna hover:text-charcoal font-mono uppercase tracking-wider underline decoration-sienna/20 underline-offset-4">
                    All logs →
                  </Link>
                </div>

                {openTickets.length > 0 ? (
                  <div className="space-y-3">
                    {openTickets.slice(0, 3).map((ticket) => (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="group block bg-white border border-clay/15 rounded-xl px-5 py-4 hover:border-sienna/30 shadow-sm transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-charcoal text-xs font-light tracking-tight line-clamp-2 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {ticket.title}
                          </p>
                          <span
                            className={`shrink-0 text-[8px] font-mono tracking-wider px-2 py-0.5 rounded border uppercase font-medium ${
                              ticket.priority === 'URGENT' ? 'border-brick/30 bg-brick/5 text-brick' :
                              ticket.priority === 'HIGH' ? 'border-sienna/30 bg-sienna/5 text-sienna' :
                              'border-clay/30 bg-clay/5 text-clay'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/30 border border-dashed border-clay/15 rounded-xl p-6 text-center">
                    <p className="text-[10px] font-mono text-charcoal/40 uppercase tracking-widest">
                      No Urgent Actions Flagged
                    </p>
                  </div>
                )}
              </div>

              {/* Secure Environment Metadata Block */}
              <div className="bg-clay/5 border border-clay/10 rounded-xl p-5 font-mono text-[9px] text-charcoal/40 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span>DEPLOYMENT INSTANCE:</span>
                  <span className="text-charcoal font-medium tracking-tight">NEST-PRD-01</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ENCRYPTION ROUTE:</span>
                  <span className="text-charcoal font-medium tracking-tight">AES-256 SYSTEM WIRE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SUBSYSTEM LINK:</span>
                  <span className="text-emerald-700 font-medium tracking-wider bg-emerald-50 border border-emerald-200/40 px-1.5 py-0.5 rounded text-[8px]">SECURE // ONLINE</span>
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