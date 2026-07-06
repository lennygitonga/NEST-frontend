import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'
import useAuthStore from '../store/authStore'
import apiClient from '../api/client'

function StatCard({ label, value, sub, to }) {
  const inner = (
    <motion.div
      className="bg-white border border-clay/15 rounded-xl p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(34,31,28,0.08)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
      <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </p>
      <p className="text-2xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-charcoal/40 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {sub}
        </p>
      )}
    </motion.div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
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

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'there'
  const lastPayment = payments.find((p) => p.status === 'COMPLETED')
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-1"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Hello, {firstName}.
      </h1>
      <p className="text-charcoal/60 mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        Here's a summary of your account.
      </p>

      {isLoading ? (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      ) : (
        <>
          {/* Lease banner */}
          {lease ? (
            <div className="bg-charcoal text-sand rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-sand/50 uppercase tracking-wide mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Active lease
                </p>
                <p className="text-xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                  Property #{lease.property}
                </p>
                <p className="text-sand/60 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  KSh {Number(lease.rent_amount).toLocaleString()}/mo · ends {new Date(lease.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/payments"
                  className="bg-sienna text-sand px-4 py-2 rounded-lg text-sm font-medium hover:bg-clay transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Pay rent
                </Link>
                <Link
                  to="/tickets"
                  className="border border-sand/30 text-sand px-4 py-2 rounded-lg text-sm font-medium hover:bg-sand/10 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Report issue
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-clay/15 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  No active lease yet
                </p>
                <p className="text-charcoal/60 text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Browse properties and apply to get started.
                </p>
              </div>
              <Link
                to="/properties"
                className="bg-sienna text-sand px-4 py-2 rounded-lg text-sm font-medium hover:bg-clay transition shrink-0"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Browse properties
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Last payment"
              value={lastPayment ? `KSh ${Number(lastPayment.total_amount).toLocaleString()}` : '—'}
              sub={lastPayment ? new Date(lastPayment.payment_date).toLocaleDateString() : 'No payments yet'}
              to="/payments"
            />
            <StatCard
              label="Open tickets"
              value={openTickets.length}
              sub={openTickets.length === 1 ? '1 needs attention' : openTickets.length > 0 ? `${openTickets.length} need attention` : 'All clear'}
              to="/tickets"
            />
            <StatCard
              label="Pending invoices"
              value={pendingInvoices.length}
              sub={pendingInvoices.length > 0 ? `KSh ${Number(pendingInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)).toLocaleString()} due` : 'Nothing outstanding'}
              to="/payments"
            />
            <StatCard
              label="Applications"
              value={lease ? 'Approved' : 'Pending'}
              sub={lease ? 'You have an active lease' : 'Check your applications'}
              to="/applications"
            />
          </div>

          {/* Recent tickets */}
          {openTickets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                  Open tickets
                </h2>
                <Link to="/tickets" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {openTickets.slice(0, 3).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block bg-white border border-clay/15 rounded-xl px-5 py-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-charcoal text-sm font-medium truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {ticket.title}
                      </p>
                      <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                          ticket.priority === 'URGENT' ? 'bg-brick/10 text-brick' :
                          ticket.priority === 'HIGH' ? 'bg-sienna/10 text-sienna' :
                          'bg-clay/10 text-clay'
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard