import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { easing } from '../../utils/animations'
import apiClient from '../../api/client'

function LandlordProperties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/properties/')
      .then((response) => setProperties(response.data))
      .catch(() => setError('Could not establish synchronization with portfolio registries.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-sand text-charcoal py-16 px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-clay/10 pb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-charcoal/40 mb-2">
            <span>Portfolio Node</span>
            <span className="w-1 h-1 rounded-full bg-olive" />
            <span>Asset Allocations</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Properties Registry
          </h1>
          <p className="text-xs font-mono text-charcoal/50 mt-1">
            Real estate structures mapped and managed under corporate brokerage modules.
          </p>
        </header>

        {isLoading && (
          <div className="text-xs font-mono text-charcoal/40 uppercase tracking-widest animate-pulse">
            Indexing physical assets matrix...
          </div>
        )}

        {error && (
          <div className="text-[11px] font-mono uppercase text-brick border border-brick/20 bg-brick/5 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!isLoading && !error && properties.length === 0 && (
          <div className="bg-white border border-clay/15 rounded-xl p-12 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-charcoal/40">
              No registered architecture nodes verified. Structure mappings are provisioned natively via agent synchronization protocols.
            </p>
          </div>
        )}

        {/* Properties Layout Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <motion.div 
              key={property.id} 
              className="bg-white border border-clay/15 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easing }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(34,31,28,0.05)' }}
            >
              {/* Image Frame Wrapper */}
              <div className="aspect-[16/11] bg-clay/5 relative overflow-hidden group border-b border-clay/5">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0].image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-clay/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                      <path d="M9 22V12h6v10" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                  property.is_vacant ? 'bg-olive/10 border-olive/20 text-olive' : 'bg-sienna/10 border-sienna/20 text-sienna'
                }`}>
                  {property.is_vacant ? 'Vacant' : 'Occupied'}
                </span>
              </div>

              {/* Data Space */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/30 block">
                    {property.property_type} · ID: {property.id}
                  </p>
                  <h3 className="text-base font-light text-charcoal tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                    {property.title}
                  </h3>
                  <p className="text-xs font-mono text-charcoal/40">
                    {property.city}, Kenya
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-clay/5">
                  <p className="text-sm font-medium text-charcoal">
                    KSh {Number(property.rent_amount).toLocaleString()}<span className="text-[10px] font-mono text-charcoal/40 font-normal">/mo</span>
                  </p>
                  <p className="text-[10px] font-mono text-charcoal/40">
                    {property.bedrooms} BR · {property.bathrooms} BA
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-clay/5">
                  <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    property.is_published ? 'border-olive/10 bg-olive/5 text-olive/80' : 'border-charcoal/10 bg-charcoal/5 text-charcoal/40'
                  }`}>
                    {property.is_published ? 'Published Matrix' : 'Hidden Core'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandlordProperties