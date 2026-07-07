import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'
import { QRCodeSVG } from 'qrcode.react'

function Profile() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Personal info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [infoStatus, setInfoStatus] = useState('idle')
  const [infoError, setInfoError] = useState('')

  // Change password
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('idle')
  const [passwordError, setPasswordError] = useState('')

  // Change email
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle')
  const [emailError, setEmailError] = useState('')

  // 2FA
  const [twoFaSetup, setTwoFaSetup] = useState(null)
  const [twoFaCode, setTwoFaCode] = useState('')
  const [twoFaStatus, setTwoFaStatus] = useState('idle')
  const [twoFaError, setTwoFaError] = useState('')
  const [disableCode, setDisableCode] = useState('')

  // Deletion
  const [deletionStatus, setDeletionStatus] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteStatus, setDeleteStatus] = useState('idle')
  const [deleteError, setDeleteError] = useState('')

  // In-App Notifications
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)

  // Notification Preferences (Toggles)
  const [emailOnTickets, setEmailOnTickets] = useState(true)
  const [emailOnRent, setEmailOnRent] = useState(true)
  const [prefStatus, setPrefStatus] = useState('idle')

  const loadProfile = () => {
    apiClient.get('/api/auth/profile/')
      .then((response) => {
        setProfile(response.data)
        setFirstName(response.data.first_name || '')
        setLastName(response.data.last_name || '')
        setPhone(response.data.profile?.phone_number || '')
        // Set initial preferences if provided by backend, e.g.:
        // setEmailOnTickets(response.data.profile?.email_on_tickets ?? true)
        // setEmailOnRent(response.data.profile?.email_on_rent ?? true)
      })
      .finally(() => setIsLoading(false))

    apiClient.get('/api/auth/account/deletion-status/')
      .then((response) => setDeletionStatus(response.data))
      .catch(() => { })
  }

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      const response = await apiClient.get('/api/notifications/')
      setNotifications(response.data)
    } catch {
      // silently fail
    } finally {
      setNotifLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadNotifications()
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
      setPasswordError(data?.error || data?.old_password?.[0] || data?.new_password?.[0] || 'Could not change your password.')
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
      const data = err.response?.data
      setEmailError(data?.error || 'Could not change your email.')
      setEmailStatus('error')
    }
  }

  const handle2faSetup = async () => {
    setTwoFaStatus('setting-up')
    setTwoFaError('')
    try {
      const response = await apiClient.post('/api/auth/2fa/setup/')
      setTwoFaSetup(response.data)
      setTwoFaStatus('idle')
    } catch (err) {
      setTwoFaError(err.response?.data?.error || 'Could not start 2FA setup.')
      setTwoFaStatus('idle')
    }
  }

  const handle2faVerify = async (e) => {
    e.preventDefault()
    setTwoFaStatus('verifying')
    setTwoFaError('')
    try {
      await apiClient.post('/api/auth/2fa/verify-setup/', { code: twoFaCode })
      setTwoFaSetup(null)
      setTwoFaCode('')
      loadProfile()
    } catch (err) {
      setTwoFaError(err.response?.data?.error || 'Invalid code.')
    } finally {
      setTwoFaStatus('idle')
    }
  }

  const handle2faDisable = async (e) => {
    e.preventDefault()
    setTwoFaStatus('disabling')
    setTwoFaError('')
    try {
      await apiClient.post('/api/auth/2fa/disable/', { code: disableCode })
      setDisableCode('')
      loadProfile()
    } catch (err) {
      setTwoFaError(err.response?.data?.error || 'Invalid code.')
    } finally {
      setTwoFaStatus('idle')
    }
  }

  const handlePrefSubmit = async (e) => {
    e.preventDefault()
    setPrefStatus('saving')
    try {
      await apiClient.patch('/api/auth/profile/update/', {
        email_on_tickets: emailOnTickets,
        email_on_rent: emailOnRent
      })
      setPrefStatus('success')
      setTimeout(() => setPrefStatus('idle'), 2000)
    } catch {
      setPrefStatus('idle')
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

  const handleMarkRead = async (id) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/`)
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch {
      // silently fail
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/api/notifications/mark-all-read/')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      // silently fail
    }
  }

  const handleDeleteNotif = async (id) => {
    try {
      await apiClient.delete(`/api/notifications/${id}/delete/`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // silently fail
    }
  }

  const handleLogoutClick = () => {
    logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-xs font-mono text-charcoal/40 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-sienna animate-pulse" />
        Loading your profile settings...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16" style={{ fontFamily: "'Inter', sans-serif" }}>

      {deletionStatus?.is_pending_deletion && (
        <div className="bg-brick/10 border border-brick/20 rounded-lg p-4 mb-10 flex items-center justify-between gap-4">
          <p className="text-sm text-brick font-light">
            Your account is scheduled to be deleted on <span className="font-semibold">{new Date(deletionStatus.deletion_date).toLocaleDateString()}</span>.
          </p>
          <button onClick={handleCancelDeletion} className="shrink-0 text-xs font-semibold text-brick hover:text-charcoal transition-colors underline">
            Cancel Deletion
          </button>
        </div>
      )}

      <header className="border-b border-clay/10 pb-6 mb-12">
        <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Profile and settings
        </h1>
        <p className="text-charcoal/50 text-xs mt-1.5">Manage your personal information, login details, and account security.</p>
      </header>

      <div className="grid lg:grid-cols-4 gap-12 items-start">

        <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 border-b border-clay/5 lg:border-b-0 text-[11px] font-mono uppercase tracking-wider text-charcoal/50">
            <a href="#personal-info" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-charcoal transition-colors whitespace-nowrap">Personal Info</a>
            <a href="#email-config" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-charcoal transition-colors whitespace-nowrap">Email Address</a>
            <a href="#password-security" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-charcoal transition-colors whitespace-nowrap">Password</a>
            <a href="#two-factor" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-charcoal transition-colors whitespace-nowrap">2-Factor Security</a>
            <a href="#notifications" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-charcoal transition-colors whitespace-nowrap">Notifications</a>
            <a href="#danger-zone" className="px-3 py-1.5 rounded hover:bg-clay/5 hover:text-brick transition-colors whitespace-nowrap">Delete Account</a>
          </nav>

          <div className="hidden lg:block pt-6 border-t border-clay/10">
            <button
              onClick={handleLogoutClick}
              className="w-full text-left px-3 py-2 text-xs font-medium text-brick hover:bg-brick/5 rounded transition-colors"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-16">

          {/* Section 01: Personal Information */}
          <section id="personal-info" className="scroll-mt-24 space-y-6">
            <div className="border-b border-clay/10 pb-3">
              <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Personal information</h2>
            </div>
            <form onSubmit={handleInfoSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal/70 mb-1.5">First name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Last name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Phone number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-sienna transition text-sm font-light" />
              </div>
              {infoError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{infoError}</div>}
              {infoStatus === 'success' && <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-3 py-2">Changes saved.</div>}
              <button type="submit" disabled={infoStatus === 'submitting'}
                className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                {infoStatus === 'submitting' ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </section>

          {/* Section 02: Email Address */}
          <section id="email-config" className="scroll-mt-24 space-y-6">
            <div className="border-b border-clay/10 pb-3">
              <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Email address</h2>
            </div>
            <div className="max-w-xl space-y-4">
              <div className="bg-clay/5 border border-clay/10 rounded p-4 text-xs flex justify-between items-center">
                <span className="text-charcoal/50">Current email:</span>
                <span className="text-charcoal font-medium">{profile?.email}</span>
              </div>
              {emailStatus === 'success' ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 rounded p-3">Email updated. Please check your new inbox to verify it.</p>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal/70 mb-1.5">New email address</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
                      className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Confirm current password</label>
                    <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required
                      className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
                  </div>
                  {emailError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{emailError}</div>}
                  <button type="submit" disabled={emailStatus === 'submitting'}
                    className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                    {emailStatus === 'submitting' ? 'Updating...' : 'Update email'}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Section 03: Password */}
          <section id="password-security" className="scroll-mt-24 space-y-6">
            <div className="border-b border-clay/10 pb-3">
              <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Current password</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
                  className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal/70 mb-1.5">New password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                  className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-sienna transition text-sm font-light" />
              </div>
              {passwordError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{passwordError}</div>}
              {passwordStatus === 'success' && <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-3 py-2">Password updated successfully.</div>}
              <button type="submit" disabled={passwordStatus === 'submitting'}
                className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                {passwordStatus === 'submitting' ? 'Changing...' : 'Change password'}
              </button>
            </form>
          </section>

          {/* Section 04: Two-Factor Authentication */}
          <section id="two-factor" className="scroll-mt-24 space-y-6">
            <div className="border-b border-clay/10 pb-3">
              <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Two-factor authentication</h2>
            </div>
            <div className="max-w-xl">
              {profile?.profile?.is_2fa_enabled ? (
                <form onSubmit={handle2faDisable} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded p-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Two-factor authentication is currently turned on.
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Enter authenticator code to disable</label>
                    <input type="text" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} required
                      className="w-full px-3 py-2 rounded border border-clay/20 bg-white text-charcoal focus:outline-none focus:border-brick transition text-sm font-mono tracking-widest"
                      placeholder="000000" />
                  </div>
                  {twoFaError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{twoFaError}</div>}
                  <button type="submit" disabled={twoFaStatus === 'disabling'}
                    className="bg-brick text-sand px-5 py-2 rounded text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
                    {twoFaStatus === 'disabling' ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </form>
              ) : twoFaSetup ? (
                <form onSubmit={handle2faVerify} className="space-y-6">
                  <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                    Open your authenticator app and scan the QR code below. If you can't scan it, enter the text key manually.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-white border border-clay/10 rounded-xl p-5">
                    <div className="p-2 bg-white border border-clay/10 rounded-lg shrink-0">
                      <QRCodeSVG
                        value={twoFaSetup.otpauth_url || `otpauth://totp/NestPortal:${profile?.email}?secret=${twoFaSetup.secret}&issuer=NestPortal`}
                        size={140}
                        level="M"
                      />
                    </div>
                    <div className="w-full space-y-3">
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-1">Text Key (Backup)</span>
                        <div className="bg-clay/5 rounded px-3 py-2 font-mono text-xs text-charcoal/70 break-all border border-clay/10 select-all">
                          {twoFaSetup.secret}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal/70 mb-1">6-digit code</label>
                        <input type="text" value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value)} required maxLength={6}
                          className="w-full px-3 py-2 rounded border border-clay/20 bg-sand/40 text-charcoal focus:outline-none focus:border-sienna transition text-sm font-mono tracking-widest"
                          placeholder="000000" />
                      </div>
                    </div>
                  </div>
                  {twoFaError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{twoFaError}</div>}
                  <button type="submit" disabled={twoFaStatus === 'verifying'}
                    className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                    {twoFaStatus === 'verifying' ? 'Verifying...' : 'Verify and turn on'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                    Two-factor authentication adds an extra layer of protection by requiring a temporary 6-digit code from your authenticator app whenever you log in.
                  </p>
                  {twoFaError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2 mb-3">{twoFaError}</div>}
                  <button onClick={handle2faSetup} disabled={twoFaStatus === 'setting-up'}
                    className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                    {twoFaStatus === 'setting-up' ? 'Setting up...' : 'Set up 2FA'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 05: Notifications Feed & Preferences */}
          <section id="notifications" className="scroll-mt-24 space-y-10">
            {/* Preferences Toggles */}
            <div className="space-y-6">
              <div className="border-b border-clay/10 pb-3">
                <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Notification preferences</h2>
              </div>
              <form onSubmit={handlePrefSubmit} className="space-y-4 max-w-xl">
                <p className="text-xs text-charcoal/60 font-light leading-relaxed">Choose how you want to be notified about your activity updates.</p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={emailOnTickets}
                      onChange={(e) => setEmailOnTickets(e.target.checked)}
                      className="mt-0.5 rounded border-clay/30 text-sienna focus:ring-sienna/20 accent-charcoal"
                    />
                    <div className="text-xs">
                      <span className="block font-medium text-charcoal group-hover:text-sienna transition-colors">Email updates for tickets</span>
                      <span className="block text-charcoal/50 font-light mt-0.5">Get emails when a maintenance worker leaves a comment or updates your issue status.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={emailOnRent}
                      onChange={(e) => setEmailOnRent(e.target.checked)}
                      className="mt-0.5 rounded border-clay/30 text-sienna focus:ring-sienna/20 accent-charcoal"
                    />
                    <div className="text-xs">
                      <span className="block font-medium text-charcoal group-hover:text-sienna transition-colors">Rent and statement notices</span>
                      <span className="block text-charcoal/50 font-light mt-0.5">Receive email copy statements when monthly invoices are generated or balance sheets change.</span>
                    </div>
                  </label>
                </div>

                {prefStatus === 'success' && <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-3 py-2 max-w-max">Preferences saved.</div>}

                <button type="submit" disabled={prefStatus === 'saving'}
                  className="bg-charcoal text-sand px-5 py-2 rounded text-xs font-medium hover:bg-sienna transition disabled:opacity-60">
                  {prefStatus === 'saving' ? 'Saving...' : 'Save preferences'}
                </button>
              </form>
            </div>

            {/* In-App Notifications Feed */}
            <div className="space-y-6 pt-4">
              <div className="border-b border-clay/10 pb-3 flex items-center justify-between">
                <h2 className="text-lg text-charcoal font-light" style={{ fontFamily: "'Fraunces', serif" }}>Recent updates</h2>
                {Array.isArray(notifications) && notifications.some((n) => !n.is_read) && (
                  <button onClick={handleMarkAllRead} className="text-xs text-sienna hover:text-clay font-medium transition">
                    Mark all as read
                  </button>
                )}
              </div>

              {notifLoading && (
                <p className="text-xs text-charcoal/40 font-mono">Loading updates...</p>
              )}

              {!notifLoading && (!Array.isArray(notifications) || notifications.length === 0) && (
                <p className="text-xs text-charcoal/40 font-mono">No recent notices found.</p>
              )}

              {/* In-App Notifications Feed list block */}
              <div className="space-y-2 max-w-xl">
                {Array.isArray(notifications) && notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between gap-4 px-4 py-3 rounded-lg border transition ${
                      n.is_read
                        ? 'bg-white border-clay/10 opacity-60'
                        : 'bg-sienna/5 border-sienna/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-charcoal truncate">{n.title}</p>
                      <p className="text-xs text-charcoal/60 mt-0.5 font-light leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-charcoal/30 mt-1 font-mono">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!n.is_read && (
                        <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-sienna hover:text-clay font-medium transition">
                          Mark read
                        </button>
                      )}
                      <button onClick={() => handleDeleteNotif(n.id)} className="text-[10px] text-brick hover:text-brick/70 font-medium transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 06: Delete Account */}
          <section id="danger-zone" className="scroll-mt-24 space-y-6 pt-6 border-t border-clay/10">
            <div>
              <h2 className="text-lg text-brick font-light" style={{ fontFamily: "'Fraunces', serif" }}>Delete account</h2>
            </div>
            <div className="max-w-xl space-y-4">
              {deletionStatus?.is_pending_deletion ? (
                <p className="text-xs font-mono text-charcoal/40 uppercase">Your account is scheduled for deletion.</p>
              ) : (
                <form onSubmit={handleDeleteRequest} className="space-y-4">
                  <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                    Deleting your account starts a 7-day grace period. You can cancel this request at any time during the 7 days simply by logging back into your account.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-brick/70 mb-1.5">Confirm with your password</label>
                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required
                      className="w-full px-3 py-2 rounded border border-brick/20 bg-white text-charcoal focus:outline-none focus:border-brick transition text-sm font-light" />
                  </div>
                  {deleteError && <div className="text-xs text-brick bg-brick/5 rounded px-3 py-2">{deleteError}</div>}
                  <button type="submit" disabled={deleteStatus === 'submitting'}
                    className="bg-brick text-sand px-5 py-2 rounded text-xs font-medium hover:bg-brick/90 transition disabled:opacity-60 font-semibold">
                    {deleteStatus === 'submitting' ? 'Processing...' : 'Request account deletion'}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Mobile Bottom Logout Layout */}
          <div className="block lg:hidden pt-8 border-t border-clay/10 text-center">
            <button onClick={handleLogoutClick} className="px-6 py-2.5 text-xs font-medium text-brick border border-brick/20 rounded hover:bg-brick/5 transition">
              Log out
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile