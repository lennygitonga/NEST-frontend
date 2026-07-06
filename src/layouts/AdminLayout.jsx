import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import PageTransition from '../components/PageTransition'
import { easing } from '../utils/animations'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/agencies', label: 'Agencies' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/moderation', label: 'Moderation' },
  { to: '/admin/payments', label: 'Payments' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-sand" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="sticky top-0 z-20 bg-charcoal text-sand border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink
            to="/admin/dashboard"
            className="text-xl tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            NEST <span className="text-sienna text-sm font-normal ml-1">Admin</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-sand/10 text-sand'
                      : 'text-sand/60 hover:text-sand hover:bg-sand/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-sienna text-sand text-sm font-medium flex items-center justify-center hover:bg-clay transition"
            >
              {initials}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-clay/15 z-20 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: easing }}
                    style={{ transformOrigin: 'top right' }}
                  >
                    <div className="px-4 py-3 border-b border-clay/10">
                      <p className="text-sm text-charcoal font-medium truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-charcoal/50 truncate">{user?.email}</p>
                      <p className="text-xs text-sienna mt-0.5">NEST Admin</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-brick hover:bg-brick/5 transition"
                    >
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sand/10 text-sand'
                    : 'text-sand/60 hover:text-sand hover:bg-sand/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export default AdminLayout
