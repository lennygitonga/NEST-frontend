import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
            setSummaryError('Could not generate a summary right now. Please try again.')
        } finally {
            setIsSummarizing(false)
        }
    }

    return (
        <div className="bg-white border border-clay/15 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        to={`/properties/${lease.property}`}
                        className="text-xl text-charcoal hover:text-clay transition"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                    >
                        {property?.title || `Property #${lease.property}`}
                    </Link>
                    {property && (
                        <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {property.address}, {property.city}
                        </p>
                    )}
                </div>
                <span
                    className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${lease.is_active ? 'bg-olive/10 text-olive' : 'bg-charcoal/10 text-charcoal/50'
                        }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    {lease.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div>
                    <p className="text-charcoal/50 text-xs uppercase tracking-wide">Rent</p>
                    <p className="text-charcoal font-medium mt-1">KSh {Number(lease.rent_amount).toLocaleString()}/mo</p>
                </div>
                <div>
                    <p className="text-charcoal/50 text-xs uppercase tracking-wide">Start date</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-charcoal/50 text-xs uppercase tracking-wide">End date</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
                </div>
            </div>

            {lease.lease_document && (
                <a
                    href={lease.lease_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-5 text-sienna text-sm font-medium hover:text-clay"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    View lease document →
                </a>
            )}

            <div className="mt-6 pt-6 border-t border-clay/10">
                {summary ? (
                    <div>
                        <p className="text-charcoal/50 text-xs uppercase tracking-wide mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            In plain English
                        </p>
                        <p className="text-charcoal leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {summary}
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="text-sienna text-sm font-medium hover:text-clay disabled:opacity-60"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {isSummarizing ? 'Summarizing...' : 'Explain this lease in plain English →'}
                    </button>
                )}

                {summaryError && (
                    <p className="text-sm text-brick mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {summaryError}
                    </p>
                )}
            </div>
        </div>
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
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1
                className="text-3xl text-charcoal mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
                Lease
            </h1>
            <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your lease details and agreement.
            </p>

            {isLoading && (
                <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Loading...
                </p>
            )}

            {error && (
                <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {!isLoading && !error && leases.length === 0 && (
                <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
                    <p className="text-charcoal/60 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        You don't have a lease yet. Once an agency approves your application, your lease will appear here.
                    </p>
                    <Link
                        to="/properties"
                        className="inline-block bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Browse properties
                    </Link>
                </div>
            )}

            <div className="space-y-6">
                {leases.map((lease) => (
                    <LeaseCard key={lease.id} lease={lease} />
                ))}
            </div>
        </div>
    )
}

export default Lease