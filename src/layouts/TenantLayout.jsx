import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { easing } from '../utils/animations'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className="text-xl text-charcoal tracking-wider hover:text-sienna transition-colors font-medium"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              NEST
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center h-full gap-1 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors duration-200 h-9 flex items-center ${
                    isActive ? 'text-sienna' : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTenantNav"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-sienna"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User Profile Menu Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-charcoal text-sand text-xs font-medium flex items-center justify-center hover:bg-sienna transition-colors duration-300 ring-2 ring-clay/5 hover:ring-sienna/20 shadow-sm"
              aria-label="Open menu"
            >
              {initials}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-clay/10 z-20 overflow-hidden text-xs"
                    initial={{ opacity: 0, scale: 0.98, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -4 }}
                    transition={{ duration: 0.15, ease: easing }}
                    style={{ transformOrigin: 'top right' }}
                  >
                    <div className="px-4 py-3 border-b border-clay/10 bg-clay/5">
                      <p className="text-charcoal font-medium truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-charcoal/50 truncate text-[11px] mt-0.5">{user?.email}</p>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-charcoal/70 hover:text-charcoal hover:bg-clay/5 transition-colors duration-200"
                    >
                      Profile and settings
                    </NavLink>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-brick hover:bg-brick/5 transition-colors duration-200 border-t border-clay/5 font-medium"
                    >
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2.5 overflow-x-auto border-t border-clay/5 pt-1.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded text-[11px] font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sienna text-sand shadow-sm'
                    : 'text-charcoal/50 hover:text-charcoal hover:bg-clay/5'
                }`}
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export default TenantLayout