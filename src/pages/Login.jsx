import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

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

  const handleAuthSuccess = (data) => {
  localStorage.setItem('access_token', data.tokens.access)
  localStorage.setItem('refresh_token', data.tokens.refresh)
  localStorage.setItem('nest_user', JSON.stringify(data.user))
  setUser(data.user)

  const role = data.user?.profile?.role
  if (role === 'AGENCY') {
    navigate('/agency/dashboard')
  } else if (role === 'LANDLORD') {
    navigate('/landlord/dashboard')
  } else if (role === 'NEST_ADMIN') {
    navigate('/admin/dashboard')
  } else {
    navigate('/dashboard')
  }
}

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

      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-charcoal text-sand px-12 py-16 relative overflow-hidden">
        <div>
          <span
            className="text-3xl tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            NEST
          </span>
        </div>

        <div className="relative">
          <svg
            viewBox="0 0 480 220"
            className="w-full h-auto opacity-90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="0,220 0,140 40,140 40,90 90,90 90,160 150,160 150,60 210,60 210,160 270,160 270,40 330,40 330,160 390,160 390,110 440,110 440,160 480,160 480,220"
              stroke="#EFE6D8"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <rect x="100" y="105" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="160" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="220" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="280" y="55" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="340" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
          </svg>
        </div>

        <div>
          <p
            className="text-xl leading-snug max-w-sm"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Properties, tenants, and payments, in one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div ref={formWrapperRef} className="w-full max-w-sm">

          <div className="lg:hidden mb-10">
            <span
              className="text-2xl text-charcoal tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
              NEST
            </span>
          </div>

          <h1
            className="text-2xl text-charcoal mb-2"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            Welcome back
          </h1>
          <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Log in to your NEST account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-clay/20" />
            <span className="text-xs text-charcoal/40 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
              or
            </span>
            <div className="flex-1 h-px bg-clay/20" />
          </div>

          {buttonWidth && (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              width={String(buttonWidth)}
              theme="outline"
              shape="rectangular"
            />
          )}

          <p className="mt-8 text-sm text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-sienna font-medium hover:text-clay">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login