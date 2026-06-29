import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/api/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: 'TENANT',
        accept_terms: acceptTerms,
      })

      const data = response.data
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      setUser(data.user)
      navigate('/verify-email')
    } catch (err) {
      const data = err.response?.data

      if (data?.email) {
        setError(data.email[0])
      } else if (data?.password) {
        setError(data.password[0])
      } else if (data?.accept_terms) {
        setError(data.accept_terms[0])
      } else if (data?.error) {
        setError(data.error)
      } else {
        setError('Something went wrong. Please try again.')
      }
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
        <div className="w-full max-w-sm">

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
            Create your account
          </h1>
          <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Sign up as a tenant to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-charcoal mb-1.5">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-charcoal mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="Wanjiru"
                />
              </div>
            </div>

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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                placeholder="At least 8 characters"
              />
            </div>

            <label className="flex items-start gap-2.5 text-sm text-charcoal/70 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-sienna"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-sienna font-medium hover:text-clay">
                  Terms and Conditions
                </Link>
              </span>
            </label>

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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-sm text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            Already have an account?{' '}
            <Link to="/login" className="text-sienna font-medium hover:text-clay">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register