import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import useAuthStore from '../../store/authStore'

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-clay/15 rounded-2xl p-6 sm:p-8 mb-6 shadow-[0_4px_24px_rgba(43,41,40,0.01)]">
      <h2 className="text-lg text-charcoal mb-6" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function AgencyProfile() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [infoStatus, setInfoStatus] = useState('idle')
  const [infoError, setInfoError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('idle')
  const [passwordError, setPasswordError] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle')
  const [emailError, setEmailError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteStatus, setDeleteStatus] = useState('idle')
  const [deleteError, setDeleteError] = useState('')
  const [deletionStatus, setDeletionStatus] = useState(null)

  useEffect(() => {
    apiClient.get('/api/auth/profile/')
      .then((response) => {
        setProfile(response.data)
        setFirstName(response.data.first_name || '')
        setLastName(response.data.last_name || '')
        setPhone(response.data.profile?.phone_number || '')
      })
      .finally(() => setIsLoading(false))

    apiClient.get('/api/auth/account/deletion-status/')
      .then((response) => setDeletionStatus(response.data))
      .catch(() => {})
  }, [])

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setInfoStatus('submitting')
    setInfoError('')
    try {
      const response = await apiClient.patch('/api/auth/profile/update/', {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      })
      setUser(response.data.user)
      setInfoStatus('success')
      setTimeout(() => setInfoStatus('idle'), 2000)
    } catch (err) {
      setInfoError(err.response?.data?.error || 'Could not update your details.')
      setInfoStatus('error')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordStatus('submitting')
    setPasswordError('')
    try {
      await apiClient.post('/api/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      setOldPassword('')
      setNewPassword('')
      setPasswordStatus('success')
      setTimeout(() => setPasswordStatus('idle'), 2000)
    } catch (err) {
      const data = err.response?.data
      setPasswordError(data?.error || data?.old_password?.[0] || 'Could not change password.')
      setPasswordStatus('error')
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setEmailStatus('submitting')
    setEmailError('')
    try {
      await apiClient.post('/api/auth/change-email/', {
        new_email: newEmail,
        password: emailPassword,
      })
      setEmailPassword('')
      setEmailStatus('success')
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Could not change email.')
      setEmailStatus('error')
    }
  }

  const handleDeleteRequest = async (e) => {
    e.preventDefault()
    setDeleteStatus('submitting')
    setDeleteError('')
    try {
      const response = await apiClient.post('/api/auth/account/delete-request/', {
        password: deletePassword,
      })
      setDeletePassword('')
      setDeletionStatus({ is_pending_deletion: true, deletion_date: response.data.deletion_date })
      setDeleteStatus('idle')
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Could not process this request.')
      setDeleteStatus('error')
    }
  }

  const handleCancelDeletion = async () => {
    try {
      await apiClient.post('/api/auth/account/delete-cancel/')
      setDeletionStatus({ is_pending_deletion: false })
    } catch {
      // ignore
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 flex justify-center items-center">
        <p className="text-charcoal/40 text-sm tracking-wide animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading profile...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl text-charcoal mb-2 tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
        Profile & Settings
      </h1>
      <p className="text-charcoal/60 mb-10 text-sm">Manage personal agency details, security setups, and preferences.</p>

      {deletionStatus?.is_pending_deletion && (
        <div className="bg-brick/5 border border-brick/10 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 text-sm shadow-sm animate-fade-in">
          <p className="text-brick leading-relaxed">
            Your account is scheduled for final closure on <span className="font-semibold">{new Date(deletionStatus.deletion_date).toLocaleDateString()}</span>.
          </p>
          <button onClick={handleCancelDeletion} className="shrink-0 text-xs font-semibold text-brick uppercase tracking-wider underline hover:no-underline transition-all duration-200">
            Cancel request
          </button>
        </div>
      )}

      <SectionCard title="Personal Information">
        <form onSubmit={handleInfoSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX"
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
          </div>
          {infoError && <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">{infoError}</div>}
          {infoStatus === 'success' && <div className="text-sm text-olive bg-olive/5 border border-olive/10 rounded-xl px-4 py-3">Changes saved successfully.</div>}
          <div className="pt-1">
            <button type="submit" disabled={infoStatus === 'submitting'}
              className="bg-sienna text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay transition-all duration-200 disabled:opacity-50 text-sm shadow-sm">
              {infoStatus === 'submitting' ? 'Saving adjustments...' : 'Save details'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Email Address">
        <p className="text-sm text-charcoal/60 mb-5">
          Your account is currently linked to <span className="text-charcoal font-medium">{profile?.email}</span>
        </p>
        {emailStatus === 'success' ? (
          <p className="text-sm text-olive bg-olive/5 border border-olive/10 rounded-xl px-4 py-3">
            Your verification message was dispatched. Please view your new address inbox to finish.
          </p>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">New Email Address</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Current Password</label>
              <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
            </div>
            {emailError && <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">{emailError}</div>}
            <div className="pt-1">
              <button type="submit" disabled={emailStatus === 'submitting'}
                className="bg-sienna text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay transition-all duration-200 disabled:opacity-50 text-sm shadow-sm">
                {emailStatus === 'submitting' ? 'Updating email...' : 'Update address'}
              </button>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard title="Security Credentials">
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Current Password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
          </div>
          {passwordError && <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">{passwordError}</div>}
          {passwordStatus === 'success' && <div className="text-sm text-olive bg-olive/5 border border-olive/10 rounded-xl px-4 py-3">Your password was altered safely.</div>}
          <div className="pt-1">
            <button type="submit" disabled={passwordStatus === 'submitting'}
              className="bg-sienna text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay transition-all duration-200 disabled:opacity-50 text-sm shadow-sm">
              {passwordStatus === 'submitting' ? 'Modifying security settings...' : 'Update password'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Account Lifecycle">
        {deletionStatus?.is_pending_deletion ? (
          <p className="text-sm text-charcoal/50 leading-relaxed">Your request is currently being retained during the holding delay. Revoke it using the toggle box layout at the top of your dashboard if you decide to return.</p>
        ) : (
          <form onSubmit={handleDeleteRequest} className="space-y-4">
            <p className="text-sm text-charcoal/60 leading-relaxed">Deactivating your profile locks current assets and establishes a structured 7-day preservation timeline before permanent removal.</p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Verify Password</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm" />
            </div>
            {deleteError && <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">{deleteError}</div>}
            <div className="pt-1">
              <button type="submit" disabled={deleteStatus === 'submitting'}
                className="bg-brick text-sand px-5 py-3 rounded-xl font-medium hover:bg-brick/90 transition-all duration-200 disabled:opacity-50 text-sm shadow-sm">
                {deleteStatus === 'submitting' ? 'Filing archive profile...' : 'Deactivate account'}
              </button>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  )
}

export default AgencyProfile