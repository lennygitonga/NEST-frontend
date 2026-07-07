import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../api/client'

const APPEAL_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  APPROVED: 'border-olive/20 bg-olive/5 text-olive',
  DISMISSED: 'border-charcoal/20 bg-charcoal/5 text-charcoal/40',
}

const FRAUD_STATUS_STYLES = {
  PENDING: 'border-clay/20 bg-clay/5 text-clay',
  REVIEWED: 'border-sienna/20 bg-sienna/5 text-sienna',
  DISMISSED: 'border-charcoal/20 bg-charcoal/5 text-charcoal/40',
  ACTION_TAKEN: 'border-olive/20 bg-olive/5 text-olive',
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
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Admin Control</span>
            <span className="w-1 h-1 rounded-full bg-sienna" />
            <span>Moderation Desk</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Compliance & Enforcement
          </h1>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-clay/10 pb-px">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-[10px] font-mono uppercase tracking-[0.2em] relative transition-colors ${
                activeTab === tab ? 'text-sienna font-semibold' : 'text-charcoal/40 hover:text-charcoal'
              }`}
            >
              {tab === 'fraud' ? 'Fraud Reports' : tab === 'audit' ? 'Audit Log' : 'Ban Appeals'}
              {tab === 'appeals' && pendingAppeals.length > 0 && (
                <span className="ml-2 bg-brick text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono tracking-normal">
                  {pendingAppeals.length}
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sienna" />
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">Syncing compliance registers...</div>
        ) : (
          <div className="space-y-6">
            {/* APPEALS TAB */}
            {activeTab === 'appeals' && (
              <div className="space-y-12">
                {appeals.length === 0 && (
                  <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
                    <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">No pending ban appeals recorded.</p>
                  </div>
                )}

                {pendingAppeals.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-mono uppercase tracking-widest text-charcoal/50 mb-2">— Pending Review</h2>
                    {pendingAppeals.map((appeal) => (
                      <div key={appeal.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 block">Ticket Record</span>
                            <h3 className="text-lg font-light tracking-tight mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>Appeal #{appeal.id}</h3>
                            <p className="text-[10px] font-mono text-charcoal/40 mt-1">{new Date(appeal.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${APPEAL_STATUS_STYLES[appeal.status]}`}>
                            {appeal.status}
                          </span>
                        </div>

                        <div className="border-l-2 border-clay/10 pl-4 py-1">
                          <p className="text-charcoal/70 text-sm italic">"{appeal.message}"</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-clay/5">
                          <textarea
                            value={responses[appeal.id] || ''}
                            onChange={(e) => setResponses((prev) => ({ ...prev, [appeal.id]: e.target.value }))}
                            rows={2}
                            placeholder="Provide administrative tracking note or response rationale..."
                            className="w-full p-3 rounded-lg border border-clay/15 bg-sand/20 text-charcoal text-xs font-mono focus:outline-none focus:border-clay transition resize-none placeholder:text-charcoal/30"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAppealReview(appeal.id, 'APPROVED')}
                              disabled={acting[appeal.id]}
                              className="text-[10px] font-mono uppercase tracking-wider bg-olive text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                            >
                              {acting[appeal.id] === 'APPROVED' ? 'Processing...' : 'Approve & Unban'}
                            </button>
                            <button
                              onClick={() => handleAppealReview(appeal.id, 'DISMISSED')}
                              disabled={acting[appeal.id]}
                              className="text-[10px] font-mono uppercase tracking-wider bg-brick text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                            >
                              {acting[appeal.id] === 'DISMISSED' ? 'Dismissing...' : 'Dismiss Appeal'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {reviewedAppeals.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-mono uppercase tracking-widest text-charcoal/50 mb-2">— Historical Records</h2>
                    <div className="space-y-3">
                      {reviewedAppeals.map((appeal) => (
                        <div key={appeal.id} className="bg-white border border-clay/15 rounded-xl p-5 shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between gap-4">
                            <div className="font-mono text-xs text-charcoal/60">
                              <span className="text-charcoal font-semibold">Appeal #{appeal.id}</span> · {new Date(appeal.created_at).toLocaleDateString()}
                            </div>
                            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${APPEAL_STATUS_STYLES[appeal.status]}`}>
                              {appeal.status}
                            </span>
                          </div>
                          {appeal.admin_response && (
                            <p className="text-charcoal/50 text-[11px] font-mono mt-3 pt-2 border-t border-clay/5 bg-sand/30 p-2 rounded">
                              <span className="text-charcoal/70 uppercase text-[9px] font-bold tracking-wider block mb-0.5">Admin Response:</span>
                              {appeal.admin_response}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FRAUD TAB */}
            {activeTab === 'fraud' && (
              <div className="space-y-4">
                {fraudReports.length === 0 && (
                  <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
                    <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">No fraud notifications pending evaluation.</p>
                  </div>
                )}
                {fraudReports.map((report) => (
                  <div key={report.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 block">System Report</span>
                        <h3 className="text-lg font-light tracking-tight mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>Report #{report.id}</h3>
                        <p className="text-[10px] font-mono text-charcoal/40 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${FRAUD_STATUS_STYLES[report.status]}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-charcoal/80 text-sm font-light leading-relaxed">{report.reason}</p>

                    {report.status === 'PENDING' && (
                      <div className="space-y-3 pt-4 border-t border-clay/5">
                        <textarea
                          value={fraudNotes[report.id] || ''}
                          onChange={(e) => setFraudNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                          rows={2}
                          placeholder="Internal administrative intelligence notes..."
                          className="w-full p-3 rounded-lg border border-clay/15 bg-sand/20 text-charcoal text-xs font-mono focus:outline-none focus:border-clay transition resize-none placeholder:text-charcoal/30"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleFraudReview(report.id, 'ACTION_TAKEN')}
                            disabled={acting[`fraud_${report.id}`]}
                            className="text-[10px] font-mono uppercase tracking-wider bg-brick text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                          >
                            {acting[`fraud_${report.id}`] === 'ACTION_TAKEN' ? 'Processing...' : 'Enforce Action'}
                          </button>
                          <button
                            onClick={() => handleFraudReview(report.id, 'REVIEWED')}
                            disabled={acting[`fraud_${report.id}`]}
                            className="text-[10px] font-mono uppercase tracking-wider bg-sienna text-sand px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
                          >
                            {acting[`fraud_${report.id}`] === 'REVIEWED' ? 'Marking...' : 'Mark Reviewed'}
                          </button>
                          <button
                            onClick={() => handleFraudReview(report.id, 'DISMISSED')}
                            disabled={acting[`fraud_${report.id}`]}
                            className="text-[10px] font-mono uppercase tracking-wider border border-clay/20 text-charcoal/60 px-4 py-2 rounded hover:bg-clay/5 transition disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {report.admin_notes && (
                      <p className="text-charcoal/50 text-[11px] font-mono mt-3 pt-2 border-t border-clay/5 bg-sand/30 p-2 rounded">
                        <span className="text-charcoal/70 uppercase text-[9px] font-bold tracking-wider block mb-0.5">Internal Audit Notes:</span>
                        {report.admin_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AUDIT LOG TAB */}
            {activeTab === 'audit' && (
              <div className="space-y-2">
                {auditLog.length === 0 && (
                  <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
                    <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">No modification audit instances logged.</p>
                  </div>
                )}
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white border border-clay/15 rounded-xl px-6 py-4 flex items-center justify-between gap-6 shadow-sm"
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-charcoal text-sand rounded mb-1.5 inline-block">
                        {ACTION_LABELS[entry.action_type] || entry.action_type}
                      </span>
                      <p className="text-charcoal/60 text-xs font-mono truncate">{entry.reason || 'No justification attached.'}</p>
                    </div>
                    <p className="text-charcoal/40 text-[10px] font-mono shrink-0 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminModeration