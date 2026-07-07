import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

function LandlordLeases() {
  const [leases, setLeases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/leases/')
      .then((response) => setLeases(response.data))
      .catch(() => setError('Could not establish synchronization with lease database registries.'))
      .finally(() => setIsLoading(false))
  }, [])

  const active = leases.filter((l) => l.is_active)
  const inactive = leases.filter((l) => !l.is_active)

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Corporate Matrix</span>
            <span className="w-1 h-1 rounded-full bg-clay" />
            <span>Covenants & Deeds</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Lease Protocols
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Verified contractual instruments managed asynchronously via counterparty representation.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Validating credential bindings...
          </div>
        )}

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!isLoading && !error && leases.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              No formal leases index verified. Structural pipelines generate binding nodes on applicant authorization.
            </p>
          </div>
        )}

        {/* Section: Synchronous Active Documents */}
        {active.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Active Execution Protocols ]
            </h2>
            <div className="space-y-4">
              {active.map((lease) => (
                <div key={lease.id} className="bg-white border border-clay/15 rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 block">System Index Key</span>
                      <h3 className="text-lg font-light tracking-tight mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>
                        Covenant Registry #{lease.id}
                      </h3>
                      <p className="text-xs font-mono text-charcoal/40 mt-1">
                        Asset Node ID: {lease.property} <span className="text-clay/40 mx-1">·</span> Holder Signature: {lease.tenant}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border border-olive/20 bg-olive/5 text-olive font-medium">
                      Active
                    </span>
                  </div>
                  
                  {/* Ledger Metrics Breakdown */}
                  <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-clay/5 text-left">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Escrow Remittance</p>
                      <p className="text-sm font-medium text-charcoal mt-1">KSh {Number(lease.rent_amount).toLocaleString()}<span className="text-xs font-mono text-charcoal/40 font-normal"> / mo</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Activation Cycle</p>
                      <p className="text-sm font-mono text-charcoal mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40">Maturation Cycle</p>
                      <p className="text-sm font-mono text-charcoal mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Expired/Historical Documents */}
        {inactive.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
              [ Terminated Historical Ledger ]
            </h2>
            <div className="space-y-3">
              {inactive.map((lease) => (
                <div key={lease.id} className="bg-white/60 border border-clay/10 rounded-xl p-5 shadow-sm opacity-60 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-md font-light tracking-tight text-charcoal/70" style={{ fontFamily: "'Fraunces', serif" }}>
                        Archived Lease #{lease.id}
                      </h3>
                      <p className="text-[11px] font-mono text-charcoal/40 mt-0.5">
                        Asset #{lease.property} · Counterparty #{lease.tenant}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-charcoal/10 bg-charcoal/5 text-charcoal/40">
                      Terminated
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t border-clay/5 text-xs font-mono text-charcoal/50">
                    <div>Rent: KSh {Number(lease.rent_amount).toLocaleString()}</div>
                    <div>Initiated: {new Date(lease.start_date).toLocaleDateString()}</div>
                    <div>Severed: {new Date(lease.end_date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandlordLeases