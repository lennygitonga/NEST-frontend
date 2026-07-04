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

const ROLES = [
  { value: 'TENANT', label: 'Tenant', description: 'Looking for a property to rent' },
  { value: 'LANDLORD', label: 'Landlord', description: 'Own properties managed by an agency' },
  { value: 'AGENCY', label: 'Agency', description: 'Manage properties on behalf of landlords' },
]

function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const formWrapperRef = useRef(null)

  const [role, setRole] = useState('TENANT')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [agencyName, setAgencyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [agencyAddress, setAgencyAddress] = useState('')
  const [agencyPhone, setAgencyPhone] = useState('')
  const [agencyWebsite, setAgencyWebsite] = useState('')
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
    if (data?.email) setError(data.email[0])
    else if (data?.password) setError(data.password[0])
    else if (data?.accept_terms) setError(data.accept_terms[0])
    else if (data?.agency_name) setError(data.agency_name[0])
    else if (data?.registration_number) setError(data.registration_number[0])
    else if (data?.agency_address) setError(data.agency_address[0])
    else if (data?.agency_phone) setError(data.agency_phone[0])
    else if (data?.non_field_errors) setError(data.non_field_errors[0])
    else if (data?.error) setError(data.error)
    else setError('Something went wrong. Please try again.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role,
      accept_terms: acceptTerms,
    }

    if (role === 'AGENCY') {
      payload.agency_name = agencyName
      payload.registration_number = regNumber
      payload.agency_address = agencyAddress
      payload.agency_phone = agencyPhone
      if (agencyWebsite) payload.agency_website = agencyWebsite
    }

    try {
      const response = await apiClient.post('/api/auth/register/', payload)
      const data = response.data
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('nest_user', JSON.stringify(data.user))
      setUser(data.user)
      navigate('/verify-email')
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
      const data = response.data
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('nest_user', JSON.stringify(data.user))
      setUser(data.user)
      const role = data.user?.profile?.role
      if (role === 'AGENCY') navigate('/agency/dashboard')
      else if (role === 'LANDLORD') navigate('/landlord/dashboard')
      else if (role === 'NEST_ADMIN') navigate('/admin/dashboard')
      else navigate('/dashboard')
    } catch (err) {
      handleAuthError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sand">

      {/* Brand panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-between bg-charcoal text-sand px-12 py-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: easing }}
      >
        <div>
          <span className="text-3xl tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            NEST
          </span>
        </div>

        <div className="relative">
          <svg viewBox="0 0 480 220" className="w-full h-auto opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="0,220 0,140 40,140 40,90 90,90 90,160 150,160 150,60 210,60 210,160 270,160 270,40 330,40 330,160 390,160 390,110 440,110 440,160 480,160 480,220"
              stroke="#EFE6D8" strokeWidth="2" strokeOpacity="0.5"
            />
            <rect x="100" y="105" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="160" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="220" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="280" y="55" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
            <rect x="340" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
          </svg>
        </div>

        <div>
          <p className="text-xl leading-snug max-w-sm" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
            Properties, tenants, and payments, in one place.
          </p>
        </div>
      </motion.div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          ref={formWrapperRef}
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easing, delay: 0.15 }}
        >
          <div className="lg:hidden mb-10">
            <span className="text-2xl text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              NEST
            </span>
          </div>

          <h1 className="text-2xl text-charcoal mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Create your account
          </h1>
          <p className="text-charcoal/60 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Choose your role to get started.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-3 rounded-xl border text-left transition ${
                  role === r.value ? 'border-sienna bg-sienna/5' : 'border-clay/20 hover:border-clay/40'
                }`}
              >
                <p className={`text-sm font-medium ${role === r.value ? 'text-sienna' : 'text-charcoal'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {r.label}
                </p>
                <p className="text-charcoal/40 text-xs mt-0.5 leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {r.description}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="Jane" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Last name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="Wanjiru" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={8} autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                  placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 transition"
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {role === 'AGENCY' && (
                <motion.div
                  key="agency-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: easing }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-2 border-t border-clay/15">
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide pt-1">Agency details</p>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">Agency name</label>
                      <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                        placeholder="Acme Properties Ltd" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">Registration number</label>
                      <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                        placeholder="REG-12345" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">Address</label>
                      <input type="text" value={agencyAddress} onChange={(e) => setAgencyAddress(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                        placeholder="123 Kimathi Street, Nairobi" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">Phone</label>
                      <input type="text" value={agencyPhone} onChange={(e) => setAgencyPhone(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                        placeholder="+254 7XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">Website (optional)</label>
                      <input type="url" value={agencyWebsite} onChange={(e) => setAgencyWebsite(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
                        placeholder="https://acmeproperties.co.ke" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="flex items-start gap-2.5 text-sm text-charcoal/70 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 accent-sienna" />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-sienna font-medium hover:text-clay">Terms and Conditions</Link>
              </span>
            </label>

            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: easing }}
                  className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {role !== 'AGENCY' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-clay/20" />
                <span className="text-xs text-charcoal/40 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>or</span>
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
            </>
          )}

          <p className="mt-8 text-sm text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            Already have an account?{' '}
            <Link to="/login" className="text-sienna font-medium hover:text-clay">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register