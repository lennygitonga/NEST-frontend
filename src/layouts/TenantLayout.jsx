import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { easing } from '../utils/animations'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/applications', label: 'Applications' },
  { to: '/lease', label: 'Lease' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/payments', label: 'Payments' },
]

function TenantLayout() {
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

      <header className="sticky top-0 z-20 bg-sand/95 backdrop-blur-sm border-b border-clay/15">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <NavLink
            to="/dashboard"
            className="text-xl text-charcoal tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            NEST
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-clay/10 text-clay'
                      : 'text-charcoal/60 hover:text-charcoal hover:bg-clay/5'
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

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-clay/15 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-clay/10">
                    <p className="text-sm text-charcoal font-medium truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-charcoal/50 truncate">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-charcoal hover:bg-clay/5 transition"
                  >
                    Profile and settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-brick hover:bg-brick/5 transition"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-clay/10 text-clay'
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-clay/5'
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

export default TenantLayout