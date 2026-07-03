import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import useAuthStore from '../../store/authStore'

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-clay/15 rounded-xl p-6 mb-6">
      <h2 className="text-lg text-charcoal mb-4" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
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
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl text-charcoal mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
        Profile and settings
      </h1>
      <p className="text-charcoal/60 mb-8">Manage your account details and security.</p>

      {deletionStatus?.is_pending_deletion && (
        <div className="bg-brick/10 border border-brick/20 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-brick">
            Your account is scheduled for deletion on {new Date(deletionStatus.deletion_date).toLocaleDateString()}.
          </p>
          <button onClick={handleCancelDeletion} className="shrink-0 text-sm font-medium text-brick underline hover:no-underline">
            Cancel
          </button>
        </div>
      )}

      <SectionCard title="Personal information">
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">First name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Last name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Phone number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX"
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
          </div>
          {infoError && <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">{infoError}</div>}
          {infoStatus === 'success' && <div className="text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-2">Saved.</div>}
          <button type="submit" disabled={infoStatus === 'submitting'}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm">
            {infoStatus === 'submitting' ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Email address">
        <p className="text-sm text-charcoal/60 mb-4">Current email: {profile?.email}</p>
        {emailStatus === 'success' ? (
          <p className="text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-2">
            Email updated. Please verify your new address.
          </p>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">New email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Current password</label>
              <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
            </div>
            {emailError && <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">{emailError}</div>}
            <button type="submit" disabled={emailStatus === 'submitting'}
              className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm">
              {emailStatus === 'submitting' ? 'Updating...' : 'Update email'}
            </button>
          </form>
        )}
      </SectionCard>

      <SectionCard title="Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Current password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
          </div>
          {passwordError && <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">{passwordError}</div>}
          {passwordStatus === 'success' && <div className="text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-2">Password changed.</div>}
          <button type="submit" disabled={passwordStatus === 'submitting'}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm">
            {passwordStatus === 'submitting' ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Delete account">
        {deletionStatus?.is_pending_deletion ? (
          <p className="text-sm text-charcoal/60">Your account deletion is already scheduled. Cancel it using the banner above.</p>
        ) : (
          <form onSubmit={handleDeleteRequest} className="space-y-3">
            <p className="text-sm text-charcoal/60">Deleting your account starts a 7-day grace period during which you can cancel.</p>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Confirm with your password</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm" />
            </div>
            {deleteError && <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">{deleteError}</div>}
            <button type="submit" disabled={deleteStatus === 'submitting'}
              className="bg-brick text-sand px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60 text-sm">
              {deleteStatus === 'submitting' ? 'Processing...' : 'Request account deletion'}
            </button>
          </form>
        )}
      </SectionCard>
    </div>
  )
}

export default AgencyProfile