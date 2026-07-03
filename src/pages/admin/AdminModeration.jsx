import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const APPEAL_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  APPROVED: 'bg-olive/10 text-olive',
  DISMISSED: 'bg-charcoal/10 text-charcoal/50',
}

const FRAUD_STATUS_STYLES = {
  PENDING: 'bg-clay/10 text-clay',
  REVIEWED: 'bg-sienna/10 text-sienna',
  DISMISSED: 'bg-charcoal/10 text-charcoal/50',
  ACTION_TAKEN: 'bg-olive/10 text-olive',
}

const ACTION_LABELS = {
  BAN_USER: 'Banned user',
  UNBAN_USER: 'Unbanned user',
  SUSPEND_AGENCY: 'Suspended agency',
  UNSUSPEND_AGENCY: 'Unsuspended agency',
  DELETE_USER: 'Deleted user',
  WARN_USER: 'Issued warning',
  PENALIZE_AGENCY: 'Penalized agency',
  VERIFY_AGENCY: 'Verified agency',
}

const TABS = ['appeals', 'fraud', 'audit']

function AdminModeration() {
  const [activeTab, setActiveTab] = useState('appeals')
  const [appeals, setAppeals] = useState([])
  const [fraudReports, setFraudReports] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [acting, setActing] = useState({})
  const [responses, setResponses] = useState({})
  const [fraudNotes, setFraudNotes] = useState({})

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [appealsRes, fraudRes, auditRes] = await Promise.all([
        apiClient.get('/api/moderation/appeals/'),
        apiClient.get('/api/moderation/fraud-reports/'),
        apiClient.get('/api/moderation/audit-log/'),
      ])
      setAppeals(appealsRes.data)
      setFraudReports(fraudRes.data)
      setAuditLog(auditRes.data)
    } catch {
      // silently fail per section
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAppealReview = async (id, status) => {
    setActing((prev) => ({ ...prev, [id]: status }))
    try {
      await apiClient.patch(`/api/moderation/appeals/${id}/review/`, {
        status,
        admin_response: responses[id] || '',
      })
      setResponses((prev) => ({ ...prev, [id]: '' }))
      fetchData()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleFraudReview = async (id, status) => {
    setActing((prev) => ({ ...prev, [`fraud_${id}`]: status }))
    try {
      await apiClient.patch(`/api/moderation/fraud-reports/${id}/review/`, {
        status,
        admin_notes: fraudNotes[id] || '',
      })
      setFraudNotes((prev) => ({ ...prev, [id]: '' }))
      fetchData()
    } catch {
      // silently fail
    } finally {
      setActing((prev) => ({ ...prev, [`fraud_${id}`]: null }))
    }
  }

  const pendingAppeals = appeals.filter((a) => a.status === 'PENDING')
  const reviewedAppeals = appeals.filter((a) => a.status !== 'PENDING')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Moderation
      </h1>
      <p className="text-charcoal/60 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage ban appeals, fraud reports, and review the audit log.
      </p>

      <div className="flex gap-1 bg-white border border-clay/15 rounded-lg p-1 mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${
              activeTab === tab ? 'bg-sienna text-sand' : 'text-charcoal/60 hover:text-charcoal'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {tab === 'fraud' ? 'Fraud reports' : tab === 'audit' ? 'Audit log' : 'Ban appeals'}
            {tab === 'appeals' && pendingAppeals.length > 0 && (
              <span className="ml-1.5 bg-brick text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingAppeals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {!isLoading && activeTab === 'appeals' && (
        <div className="space-y-8">
          {appeals.length === 0 && (
            <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
              <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>No ban appeals yet.</p>
            </div>
          )}

          {pendingAppeals.length > 0 && (
            <div>
              <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                Pending
              </h2>
              <div className="space-y-4">
                {pendingAppeals.map((appeal) => (
                  <div key={appeal.id} className="bg-white border border-clay/15 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                          Appeal #{appeal.id}
                        </p>
                        <p className="text-charcoal/40 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {new Date(appeal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${APPEAL_STATUS_STYLES[appeal.status]}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {appeal.status}
                      </span>
                    </div>

                    <p className="text-charcoal/70 text-sm italic mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                      "{appeal.message}"
                    </p>

                    <div className="space-y-2">
                      <textarea
                        value={responses[appeal.id] || ''}
                        onChange={(e) => setResponses((prev) => ({ ...prev, [appeal.id]: e.target.value }))}
                        rows={2}
                        placeholder="Admin response (optional)"
                        className="w-full px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition resize-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAppealReview(appeal.id, 'APPROVED')}
                          disabled={acting[appeal.id]}
                          className="text-xs px-3 py-1.5 rounded-lg bg-olive text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {acting[appeal.id] === 'APPROVED' ? 'Approving...' : 'Approve (unban)'}
                        </button>
                        <button
                          onClick={() => handleAppealReview(appeal.id, 'DISMISSED')}
                          disabled={acting[appeal.id]}
                          className="text-xs px-3 py-1.5 rounded-lg bg-brick text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {acting[appeal.id] === 'DISMISSED' ? 'Dismissing...' : 'Dismiss'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewedAppeals.length > 0 && (
            <div>
              <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
                Reviewed
              </h2>
              <div className="space-y-3">
                {reviewedAppeals.map((appeal) => (
                  <div key={appeal.id} className="bg-white border border-clay/15 rounded-xl p-5 opacity-70">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-charcoal text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Appeal #{appeal.id} · {new Date(appeal.created_at).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${APPEAL_STATUS_STYLES[appeal.status]}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {appeal.status}
                      </span>
                    </div>
                    {appeal.admin_response && (
                      <p className="text-charcoal/50 text-xs mt-2 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Response: {appeal.admin_response}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && activeTab === 'fraud' && (
        <div className="space-y-4">
          {fraudReports.length === 0 && (
            <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
              <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>No fraud reports yet.</p>
            </div>
          )}
          {fraudReports.map((report) => (
            <div key={report.id} className="bg-white border border-clay/15 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                    Report #{report.id}
                  </p>
                  <p className="text-charcoal/40 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${FRAUD_STATUS_STYLES[report.status]}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-charcoal/70 text-sm mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                {report.reason}
              </p>

              {report.status === 'PENDING' && (
                <div className="space-y-2">
                  <textarea
                    value={fraudNotes[report.id] || ''}
                    onChange={(e) => setFraudNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                    rows={2}
                    placeholder="Admin notes (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-clay transition resize-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFraudReview(report.id, 'ACTION_TAKEN')}
                      disabled={acting[`fraud_${report.id}`]}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brick text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {acting[`fraud_${report.id}`] === 'ACTION_TAKEN' ? 'Processing...' : 'Take action'}
                    </button>
                    <button
                      onClick={() => handleFraudReview(report.id, 'REVIEWED')}
                      disabled={acting[`fraud_${report.id}`]}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {acting[`fraud_${report.id}`] === 'REVIEWED' ? 'Marking...' : 'Mark reviewed'}
                    </button>
                    <button
                      onClick={() => handleFraudReview(report.id, 'DISMISSED')}
                      disabled={acting[`fraud_${report.id}`]}
                      className="text-xs px-3 py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition disabled:opacity-60"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {report.admin_notes && (
                <p className="text-charcoal/50 text-xs mt-2 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Notes: {report.admin_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === 'audit' && (
        <div className="space-y-2">
          {auditLog.length === 0 && (
            <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
              <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>No audit log entries yet.</p>
            </div>
          )}
          {auditLog.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-clay/15 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-charcoal text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {ACTION_LABELS[entry.action_type] || entry.action_type}
                </p>
                <p className="text-charcoal/50 text-xs mt-0.5 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {entry.reason}
                </p>
              </div>
              <p className="text-charcoal/40 text-xs shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminModeration