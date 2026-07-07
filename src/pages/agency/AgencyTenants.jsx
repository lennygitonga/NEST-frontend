import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'

function ScoreBadge({ score }) {
  const color =
    score >= 80 ? 'bg-olive/10 text-olive' :
    score >= 50 ? 'bg-clay/10 text-clay' :
    'bg-brick/10 text-brick'

  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full tracking-wide ${color}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Score: {score}
    </span>
  )
}

function AgencyTenants() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/agencies/tenants/')
      .then((response) => setData(response.data))
      .catch(() => setError('Could not load tenants.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2 tracking-tight"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Tenants
      </h1>
      <p className="text-charcoal/60 mb-10 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
        Active tenants across your properties.
      </p>

      {isLoading && (
        <p className="text-charcoal/40 text-sm animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading...
        </p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="bg-white border border-clay/15 rounded-2xl px-6 py-4 mb-8 inline-flex items-center gap-3.5 shadow-[0_4px_24px_rgba(43,41,40,0.01)]">
            <p className="text-3xl text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              {data.total_tenants}
            </p>
            <div className="h-4 w-px bg-clay/20" />
            <p className="text-charcoal/60 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              active {data.total_tenants === 1 ? 'tenant' : 'tenants'}
            </p>
          </div>

          {(!data.tenants || data.tenants.length === 0) ? (
            <div className="bg-white border border-clay/15 rounded-2xl p-10 text-center shadow-[0_4px_24px_rgba(43,41,40,0.01)]">
              <p className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                No active tenants yet. Create a lease to get started.
              </p>
              <Link
                to="/agency/leases"
                className="inline-block mt-5 bg-sienna text-sand px-5 py-2.5 rounded-xl font-medium hover:bg-clay transition-all duration-200 text-sm shadow-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Go to leases
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.tenants.map((tenant) => (
                <div
                  key={tenant.tenant_id}
                  className="bg-white border border-clay/15 rounded-2xl p-6 shadow-[0_4px_24px_rgba(43,41,40,0.02)] transition-all duration-200 hover:border-clay/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg text-charcoal font-medium tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                        {tenant.tenant_name || tenant.tenant_email}
                      </p>
                      <p className="text-charcoal/50 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {tenant.tenant_email}
                      </p>
                    </div>
                    <ScoreBadge score={tenant.credit_score} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-clay/5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div>
                      <p className="text-[10px] text-charcoal/40 uppercase font-semibold tracking-wider">Property</p>
                      <p className="text-charcoal text-sm font-medium mt-1 truncate">{tenant.property}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal/40 uppercase font-semibold tracking-wider">Lease start</p>
                      <p className="text-charcoal text-sm font-medium mt-1">
                        {new Date(tenant.lease_start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal/40 uppercase font-semibold tracking-wider">Lease end</p>
                      <p className="text-charcoal text-sm font-medium mt-1">
                        {new Date(tenant.lease_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-clay/10 flex items-center justify-between">
                    <p className="text-charcoal/60 text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Rent: KSh {Number(tenant.rent_amount).toLocaleString()} <span className="text-charcoal/40 font-normal text-xs">/ mo</span>
                    </p>
                    <Link
                      to={`/agency/properties/${tenant.property_id}`}
                      className="text-sienna text-sm font-medium hover:text-clay transition-colors duration-200"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      View property →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AgencyTenants