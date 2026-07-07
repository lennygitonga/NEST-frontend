import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'
import { easing } from '../utils/animations'

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const formWrapperRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [buttonWidth, setButtonWidth] = useState(null)

  useEffect(() => {
    if (formWrapperRef.current) {
      setButtonWidth(formWrapperRef.current.offsetWidth)
    }
  }, [])

  const handleAuthError = (err) => {
    const data = err.response?.data
    if (data?.status === 'banned') {
      setError(data.reason ? `Account banned: ${data.reason}` : 'Your account has been banned.')
    } else if (data?.status === 'email_not_verified') {
      setError('Please verify your email before logging in.')
    } else if (data?.error) {
      setError(data.error)
    } else if (data?.email) {
      setError(data.email[0])
    } else if (data?.password) {
      setError(data.password[0])
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleAuthSuccess = (data) => {
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    localStorage.setItem('nest_user', JSON.stringify(data.user))
    setUser(data.user)
    const role = data.user?.profile?.role
    if (role === 'AGENCY') navigate('/agency/dashboard')
    else if (role === 'LANDLORD') navigate('/landlord/dashboard')
    else if (role === 'NEST_ADMIN') navigate('/admin/dashboard')
    else navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await apiClient.post('/api/auth/login/', { email, password })
      const data = response.data
      if (data.status === '2fa_required') {
        navigate('/verify-2fa', { state: { uid: data.uid } })
        return
      }
      handleAuthSuccess(data)
    } catch (err) {
      handleAuthError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setIsLoading(true)
    try {
      const response = await apiClient.post('/api/auth/google-login/', {
        id_token: credentialResponse.credential,
      })
      handleAuthSuccess(response.data)
    } catch (err) {
      handleAuthError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sand">

      {/* Cinematic Brand Video Panel */}
      <div className="hidden lg:block relative bg-[#0A0A0A] overflow-hidden">
        {/* Background property tour video loop */}
        <video
          src="/assets/nest-hero-tour.mp4"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 saturate-50"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Editorial color grade mask */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-charcoal/40 to-transparent mix-blend-multiply" />

        {/* Floating Architectural Branding Layer */}
        <motion.div
          className="relative h-full z-10 flex flex-col justify-between px-16 py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: easing }}
        >
          <div>
            <span className="text-xl tracking-[0.25em] font-light text-white block">
              N E S T
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sand/40 block mt-1 font-mono">
              Residential Management System
            </span>
          </div>

          {/* Wireframe branding SVG aligned neatly within high-end typography */}
          <div className="my-auto max-w-sm space-y-6">
            <svg viewBox="0 0 480 220" className="w-full h-auto text-sand/20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="0,220 0,140 40,140 40,90 90,90 90,160 150,160 150,60 210,60 210,160 270,160 270,40 330,40 330,160 390,160 390,110 440,110 440,160 480,160 480,220"
                stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4"
              />
              <rect x="100" y="105" width="10" height="14" fill="#C97B5E" fillOpacity="0.45" />
              <rect x="160" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.45" />
              <rect x="220" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.45" />
              <rect x="280" y="55" width="10" height="14" fill="#C97B5E" fillOpacity="0.45" />
              <rect x="340" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.45" />
            </svg>
            <p className="text-3xl text-white font-light leading-[1.25]" style={{ fontFamily: "'Fraunces', serif" }}>
              Properties, tenants, and automated workflows. <span className="italic text-sienna font-normal">Unified</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-sand/40">
            <span>System Terminal V1.0</span>
            <div className="w-6 h-[1px] bg-sand/20" />
            <span>Secure Architecture</span>
          </div>
        </motion.div>
      </div>

      {/* Form Panel Container */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          ref={formWrapperRef}
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing, delay: 0.1 }}
        >
          <div className="lg:hidden mb-8">
            <span className="text-xl tracking-[0.2em] text-charcoal font-light">
              N E S T
            </span>
          </div>

          <h1 className="text-3xl text-charcoal mb-2 font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Welcome back
          </h1>
          <p className="text-charcoal/50 text-sm mb-8 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Log in to access your secure operational node.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium tracking-wide text-charcoal/70 mb-1.5 uppercase">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2 rounded-md border border-clay/20 bg-white text-charcoal text-sm placeholder:text-charcoal/20 focus:outline-none focus:ring-1 focus:ring-clay focus:border-clay transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium tracking-wide text-charcoal/70 mb-1.5 uppercase">
                Security Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2 pr-10 rounded-md border border-clay/20 bg-white text-charcoal text-sm placeholder:text-charcoal/20 focus:outline-none focus:ring-1 focus:ring-clay focus:border-clay transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-brick bg-brick/5 border border-brick/10 rounded-md px-3 py-2 font-mono"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md bg-charcoal text-sand text-sm font-medium hover:bg-sienna transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-charcoal/5"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate access'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-clay/10" />
            <span className="text-[10px] font-mono text-charcoal/30 uppercase tracking-widest">
              or authentication mapping
            </span>
            <div className="flex-1 h-px bg-clay/10" />
          </div>

          {buttonWidth && (
            <div className="overflow-hidden rounded-md border border-clay/20 hover:border-clay/40 transition-colors">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in mapping failed.')}
                width={String(buttonWidth)}
                theme="outline"
                shape="rectangular"
              />
            </div>
          )}

          <p className="mt-8 text-xs text-charcoal/50 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Don't have an active workspace?{' '}
            <Link to="/register" className="text-sienna font-normal underline hover:text-clay transition-colors">
              Begin onboarding
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login