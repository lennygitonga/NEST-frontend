import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

function LandlordProperties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/')
      .then((response) => setProperties(response.data))
      .catch(() => setError('Could not load your properties.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Properties
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Properties listed under your name by your managing agency.
      </p>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-xl p-8 text-center">
          <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            No properties listed yet. Your agency will add them on your behalf.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((property) => (
          <div key={property.id} className="bg-white border border-clay/15 rounded-xl overflow-hidden">
            <div className="aspect-[4/3] bg-clay/10 relative">
              {property.images?.[0] ? (
                <img
                  src={property.images[0].image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-clay/40">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </div>
              )}
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                  property.is_vacant ? 'bg-olive/20 text-olive' : 'bg-sienna/20 text-sienna'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {property.is_vacant ? 'Vacant' : 'Occupied'}
              </span>
            </div>

            <div className="p-4">
              <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                {property.title}
              </p>
              <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {property.city}
              </p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-clay font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  KSh {Number(property.rent_amount).toLocaleString()}/mo
                </p>
                <p className="text-charcoal/40 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {property.bedrooms} bed · {property.bathrooms} bath
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-clay/10">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    property.is_published ? 'bg-olive/10 text-olive' : 'bg-charcoal/10 text-charcoal/50'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {property.is_published ? 'Published' : 'Hidden'}
                </span>
                <span className="text-xs text-charcoal/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {property.property_type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandlordProperties