import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import useAuthStore from '../../store/authStore'
import apiClient from '../../api/client'

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-light tracking-tight text-charcoal" style={{ fontFamily: "'Fraunces', serif" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-mono text-charcoal/40 mt-1 uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
      <div className="pt-2 border-t border-clay/5">
        {children}
      </div>
    </div>
  )
}

function LandlordProfile() {
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

  const infoTimeoutRef = useRef(null)
  const passwordTimeoutRef = useRef(null)

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/api/auth/profile/'),
      apiClient.get('/api/auth/account/deletion-status/'),
    ]).then(([profileRes, deletionRes]) => {
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data)
        setFirstName(profileRes.value.data.first_name || '')
        setLastName(profileRes.value.data.last_name || '')
        setPhone(profileRes.value.data.profile?.phone_number || '')
      }
      if (deletionRes.status === 'fulfilled') {
        setDeletionStatus(deletionRes.value.data)
      }
    }).finally(() => setIsLoading(false))

    return () => {
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current)
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current)
    }
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
      infoTimeoutRef.current = setTimeout(() => setInfoStatus('idle'), 2000)
    } catch (err) {
      setInfoError(err.response?.data?.error || 'Could not update profile node mappings.')
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
      passwordTimeoutRef.current = setTimeout(() => setPasswordStatus('idle'), 2000)
    } catch (err) {
      const data = err.response?.data
      setPasswordError(data?.error || data?.old_password?.[0] || 'Security mismatch exception.')
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
      setEmailError(err.response?.data?.error || 'Communication channel updates dropped.')
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
      setDeleteError(err.response?.data?.error || 'Pipeline purge execution failed.')
      setDeleteStatus('error')
    }
  }

  const handleCancelDeletion = async () => {
    try {
      await apiClient.post('/api/auth/account/delete-cancel/')
      setDeletionStatus({ is_pending_deletion: false })
    } catch {
      // Swallowed silently safely
    }
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-clay/15 bg-sand/30 text-charcoal focus:outline-none focus:border-clay/40 focus:bg-white transition text-sm font-sans"
  const labelClasses = "block text-[9px] font-mono uppercase tracking-widest text-charcoal/40 mb-2"
  const buttonClasses = "bg-sienna text-sand px-6 py-3 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-clay transition disabled:opacity-40"

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Identity Core</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Security Configurations</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Profile & Settings
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            System parameter overrides for administrative credentials and asset linkages.
          </p>
        </header>

        {deletionStatus?.is_pending_deletion && (
          <div className="bg-brick/5 border border-brick/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <p className="text-xs font-mono text-brick uppercase tracking-wider leading-relaxed">
              Account purge execution scheduled on: {new Date(deletionStatus.deletion_date).toLocaleDateString()}
            </p>
            <button onClick={handleCancelDeletion} className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-brick underline hover:no-underline">
              Halt Deletion
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            De-serializing credential nodes...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Personal Info */}
            <SectionCard title="Identity Metadata" subtitle="Core Contact Matrix">
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Given Title (First)</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Surname (Last)</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Remittance Target Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className={inputClasses} />
                </div>
                {infoError && <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">{infoError}</div>}
                {infoStatus === 'success' && <div className="text-2xs font-mono uppercase border border-olive/20 bg-olive/5 text-olive px-4 py-2.5 rounded-lg">State Saved Synchronously.</div>}
                <button type="submit" disabled={infoStatus === 'submitting'} className={buttonClasses}>
                  {infoStatus === 'submitting' ? 'Saving...' : 'Commit Mutation'}
                </button>
              </form>
            </SectionCard>

            {/* Email Updating */}
            <SectionCard title="Communications Routing" subtitle={`Index Route: ${profile?.email}`}>
              {emailStatus === 'success' ? (
                <p className="text-xs font-mono text-olive uppercase border border-olive/10 bg-olive/5 p-4 rounded-xl">
                  Channel mutation triggered. Validate parameters via your new address node.
                </p>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className={labelClasses}>New Vector Email</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Verify Current Signature Password</label>
                    <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required className={inputClasses} />
                  </div>
                  {emailError && <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">{emailError}</div>}
                  <button type="submit" disabled={emailStatus === 'submitting'} className={buttonClasses}>
                    {emailStatus === 'submitting' ? 'Updating...' : 'Mutate Routing Route'}
                  </button>
                </form>
              )}
            </SectionCard>

            {/* Password Updating */}
            <SectionCard title="Cryptographic Access Signature" subtitle="Rotational Cryptography Layer">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className={labelClasses}>Legacy Token Password</label>
                  <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Target Generation Token</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className={inputClasses} />
                </div>
                {passwordError && <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">{passwordError}</div>}
                {passwordStatus === 'success' && <div className="text-2xs font-mono uppercase border border-olive/20 bg-olive/5 text-olive px-4 py-2.5 rounded-lg">Cryptography Rotated Successfully.</div>}
                <button type="submit" disabled={passwordStatus === 'submitting'} className={buttonClasses}>
                  {passwordStatus === 'submitting' ? 'Rotating...' : 'Rotate Signatures'}
                </button>
              </form>
            </SectionCard>

            {/* Account Purge */}
            <SectionCard title="Structural Pipeline Deprecation" subtitle="Danger Zone">
              {deletionStatus?.is_pending_deletion ? (
                <p className="text-xs font-mono text-charcoal/40 uppercase">Purge queue actively watching. Process holds for the remaining grace context.</p>
              ) : (
                <form onSubmit={handleDeleteRequest} className="space-y-4">
                  <p className="text-xs font-mono text-charcoal/50 normal-case leading-relaxed">
                    Triggering a destruction request begins a 7-day computational grace parameter cycle context before irreversible execution.
                  </p>
                  <div>
                    <label className={labelClasses}>Confirm Verification Token Password</label>
                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required className={inputClasses} />
                  </div>
                  {deleteError && <div className="text-2xs font-mono uppercase border border-brick/20 bg-brick/5 text-brick px-4 py-2.5 rounded-lg">{deleteError}</div>}
                  <button type="submit" disabled={deleteStatus === 'submitting'} className="bg-brick text-sand px-6 py-3 rounded-xl font-mono uppercase tracking-wider text-2xs hover:bg-brick/80 transition disabled:opacity-40">
                    {deleteStatus === 'submitting' ? 'Processing...' : 'Queue Pipeline Destruction'}
                  </button>
                </form>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandlordProfile