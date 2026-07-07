import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { easing } from '../utils/animations'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const navItems = [
  { to: '/agency/dashboard', label: 'Dashboard' },
  { to: '/agency/properties', label: 'Properties' },
  { to: '/agency/applications', label: 'Applications' },
  { to: '/agency/leases', label: 'Leases' },
  { to: '/agency/tickets', label: 'Tickets' },
  { to: '/agency/payments', label: 'Payments' },
  { to: '/agency/tenants', label: 'Tenants' },
  { to: '/agency/landlords', label: 'Landlords' },
  { to: '/agency/profile', label: 'Profile' },
]

function AgencyLayout() {
  const navigate = useNavigate()
  const location = useLocation()
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
    <div className="min-h-screen bg-sand text-charcoal flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="sticky top-0 z-30 bg-sand/80 backdrop-blur-md border-b border-clay/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Architectural Brand Identity Logo */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/agency/dashboard"
              className="text-xl text-charcoal tracking-[0.15em] hover:text-sienna transition-colors font-light"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              NEST
            </NavLink>
            <div className="hidden lg:block w-px h-4 bg-clay/20" />
            <span className="hidden lg:inline text-[9px] font-mono uppercase tracking-[0.2em] text-charcoal/40 mt-0.5">
              // Agency Node
            </span>
          </div>

          {/* Sliding Track Desktop Navigation Layout */}
          <nav className="hidden md:flex items-center h-full gap-1 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-200 h-9 flex items-center ${
                    isActive ? 'text-sienna' : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeAgencyNav"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-sienna"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Secure User Command Node Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-charcoal text-sand text-xs font-mono flex items-center justify-center hover:bg-sienna transition-colors duration-300 ring-2 ring-clay/5 hover:ring-sienna/20 shadow-sm"
              aria-label="Toggle user command menu"
            >
              {initials}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    className="absolute right-0 mt-3 w-60 bg-white/95 backdrop-blur-md rounded-lg shadow-xl shadow-charcoal/5 border border-clay/10 z-20 overflow-hidden font-mono text-[11px]"
                    initial={{ opacity: 0, scale: 0.98, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -4 }}
                    transition={{ duration: 0.15, ease: easing }}
                    style={{ transformOrigin: 'top right' }}
                  >
                    <div className="px-4 py-3.5 border-b border-clay/15 bg-clay/5">
                      <p className="text-charcoal font-medium truncate font-sans text-xs">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-charcoal/40 truncate text-[10px] mt-0.5">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[9px] text-sienna uppercase tracking-widest font-bold">
                        <span className="w-1 h-1 rounded-full bg-sienna animate-pulse" />
                        <span>Agency Root</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-brick hover:bg-brick/5 transition-colors duration-200 border-t border-clay/5 uppercase tracking-wider font-semibold text-[10px]"
                    >
                      Disconnect Node
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Micro Horizontal Mobile Scroller Menu */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2.5 overflow-x-auto border-t border-clay/5 pt-1.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sienna text-sand shadow-sm shadow-sienna/10'
                    : 'text-charcoal/50 hover:text-charcoal hover:bg-clay/5'
                }`}
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export default AgencyLayout