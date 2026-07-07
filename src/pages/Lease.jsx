import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/client'

function LeaseCard({ lease }) {
    const [property, setProperty] = useState(null)
    const [summary, setSummary] = useState('')
    const [summaryError, setSummaryError] = useState('')
    const [isSummarizing, setIsSummarizing] = useState(false)

    useEffect(() => {
        apiClient.get(`/api/properties/${lease.property}/`)
            .then((response) => setProperty(response.data))
            .catch(() => { })
    }, [lease.property])

    const handleSummarize = async () => {
        setIsSummarizing(true)
        setSummaryError('')

        try {
            const response = await apiClient.get(`/api/properties/leases/${lease.id}/summary/`)
            setSummary(response.data.summary)
        } catch {
            setSummaryError('Could not sync machine summary right now. Please reload.')
        } finally {
            setIsSummarizing(false)
        }
    }

    return (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-clay/15 rounded-xl p-8 space-y-8 shadow-sm"
        >
            {/* Row 1: Header */}
            <div className="flex items-start justify-between gap-6 border-b border-clay/10 pb-6">
                <div className="space-y-1">
                    <Link
                        to={`/properties/${lease.property}`}
                        className="text-2xl text-charcoal hover:text-sienna transition font-light tracking-tight"
                        style={{ fontFamily: "'Fraunces', serif" }}
                    >
                        {property?.title || `Lease Contract #${lease.property}`}
                    </Link>
                    {property && (
                        <p className="text-charcoal/50 text-xs font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {property.address}, {property.city}
                        </p>
                    )}
                </div>
                <span
                    className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded border ${
                      lease.is_active ? 'border-olive/30 text-olive bg-olive/5' : 'border-clay/20 text-charcoal/40 bg-clay/5'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    {lease.is_active ? 'Active Engagement' : 'Archived'}
                </span>
            </div>

            {/* Row 2: Metrics Grid */}
            <div className="grid grid-cols-3 gap-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="space-y-1">
                    <p className="text-charcoal/40 text-[10px] uppercase tracking-wider font-mono">Monthly Remittance</p>
                    <p className="text-charcoal font-medium text-base">KSh {Number(lease.rent_amount).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-charcoal/40 text-[10px] uppercase tracking-wider font-mono">Commencement Date</p>
                    <p className="text-charcoal font-light text-sm">{new Date(lease.start_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-charcoal/40 text-[10px] uppercase tracking-wider font-mono">Termination Date</p>
                    <p className="text-charcoal font-light text-sm">{new Date(lease.end_date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Row 3: Actions & Plain-English Engine */}
            <div className="pt-6 border-t border-clay/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {lease.lease_document && (
                    <a
                        href={lease.lease_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sienna text-xs font-medium uppercase tracking-wider hover:text-charcoal transition underline decoration-sienna/30 underline-offset-4"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Review Executed Document →
                    </a>
                )}

                <div className="max-w-md shrink-0">
                    {summary ? (
                        <div className="bg-clay/5 border border-clay/10 p-4 rounded-lg space-y-1">
                            <p className="text-charcoal/40 text-[9px] uppercase tracking-widest font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Plain English Digest
                            </p>
                            <p className="text-charcoal/80 text-xs font-light leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {summary}
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleSummarize}
                            disabled={isSummarizing}
                            className="text-charcoal/60 hover:text-sienna text-xs font-mono uppercase tracking-wider disabled:opacity-50 transition"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {isSummarizing ? 'Synthesizing...' : '⚡ Generate Plain English Summary'}
                        </button>
                    )}

                    {summaryError && (
                        <p className="text-[11px] text-brick font-mono mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {summaryError}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function Lease() {
    const [leases, setLeases] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        apiClient.get('/api/properties/leases/')
            .then((response) => setLeases(response.data))
            .catch(() => setError('Could not load your lease information.'))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
            <div className="max-w-md space-y-2">
                <h1 className="text-3xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                    Your Agreements
                </h1>
                <p className="text-charcoal/60 text-sm font-light leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Legally-binding contracts, monthly frameworks, and structural asset breakdowns.
                </p>
            </div>

            {isLoading && (
                <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest">Opening vault...</p>
            )}

            {error && (
                <div className="text-sm text-brick bg-brick/5 border border-brick/15 rounded-lg px-4 py-3 font-mono">
                    {error}
                </div>
            )}

            {!isLoading && !error && (!Array.isArray(leases) || leases.length === 0) && (
                <div className="bg-white border border-clay/10 rounded-xl p-12 text-center max-w-xl">
                    <p className="text-charcoal/50 text-sm font-light mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                        No active structural assignments found under your profile namespace.
                    </p>
                    <Link
                        to="/properties"
                        className="inline-block bg-charcoal text-sand text-xs font-medium px-5 py-2.5 rounded tracking-wide hover:bg-sienna transition"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Locate Properties
                    </Link>
                </div>
            )}

            <div className="space-y-8">
                {Array.isArray(leases) && leases.map((lease) => (
                    <LeaseCard key={lease.id} lease={lease} />
                ))}
            </div>
        </div>
    )
}

export default Lease