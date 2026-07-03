import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

function LandlordLeases() {
  const [leases, setLeases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/leases/')
      .then((response) => setLeases(response.data))
      .catch(() => setError('Could not load your leases.'))
      .finally(() => setIsLoading(false))
  }, [])

  const active = leases.filter((l) => l.is_active)
  const inactive = leases.filter((l) => !l.is_active)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Leases
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Lease agreements for your properties managed by your agency.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && leases.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No leases yet. Your agency will create them once a tenant is approved.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Active
          </h2>
          <div className="space-y-3">
            {active.map((lease) => (
              <div key={lease.id} className="bg-white border border-clay/15 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                      Lease #{lease.id}
                    </p>
                    <p className="text-charcoal/40 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Property #{lease.property} · Tenant #{lease.tenant}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-olive/10 text-olive"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Active
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">Rent</p>
                    <p className="text-charcoal font-medium mt-1">KSh {Number(lease.rent_amount).toLocaleString()}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">Start</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">End</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h2 className="text-lg text-charcoal mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Past leases
          </h2>
          <div className="space-y-3">
            {inactive.map((lease) => (
              <div key={lease.id} className="bg-white border border-clay/15 rounded-xl p-5 opacity-70">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                      Lease #{lease.id}
                    </p>
                    <p className="text-charcoal/40 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Property #{lease.property} · Tenant #{lease.tenant}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-charcoal/10 text-charcoal/50"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Inactive
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">Rent</p>
                    <p className="text-charcoal font-medium mt-1">KSh {Number(lease.rent_amount).toLocaleString()}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">Start</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wide">End</p>
                    <p className="text-charcoal font-medium mt-1">{new Date(lease.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LandlordLeases