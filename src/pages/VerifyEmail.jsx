import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

function VerifyEmail() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      await apiClient.post('/api/auth/verify-email/', {
        email: user?.email,
        code,
      })
      const role = user?.profile?.role
      if (role === 'AGENCY') {
        navigate('/agency/dashboard')
      } else if (role === 'LANDLORD') {
        navigate('/landlord/dashboard')
      } else if (role === 'NEST_ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setIsResending(true)

    try {
      await apiClient.post('/api/auth/resend-verification/', {
        email: user?.email,
      })
      setMessage('A new code has been sent to your email.')
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Could not resend the code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand px-6 py-16">
      <div className="w-full max-w-sm">

        <span
          className="text-2xl text-charcoal tracking-tight block mb-10"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          NEST
        </span>

        <h1
          className="text-2xl text-charcoal mb-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          Verify your email
        </h1>
        <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          We sent a 6-digit code to{' '}
          <span className="text-charcoal font-medium">{user?.email}</span>. Enter it below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-charcoal mb-1.5">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal text-center text-lg tracking-widest placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-2.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <p className="mt-6 text-sm text-charcoal/60 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
          Didn't get a code?{' '}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sienna font-medium hover:text-clay disabled:opacity-60"
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail