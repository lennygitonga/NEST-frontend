import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../api/client'
import { easing } from '../utils/animations'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'SHORT_TERM', label: 'Short Term Rental' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing } }
}

function PropertyCard({ property }) {
  const cover = property.images?.[0]?.image

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: easing }}
      className="group"
    >
      <Link to={`/properties/${property.id}`} className="block space-y-4">
        {/* Image Frame */}
        <div className="aspect-[16/10] bg-clay/5 relative overflow-hidden rounded-lg border border-clay/10">
          {cover ? (
            <img
              src={cover}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-clay/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              </svg>
            </div>
          )}
          <span 
            className="absolute bottom-3 left-3 bg-charcoal text-sand text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-white/10" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {TYPE_OPTIONS.find((t) => t.value === property.property_type)?.label}
          </span>
        </div>

        {/* Content Metadata */}
        <div className="space-y-1 px-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-charcoal font-light text-base tracking-tight truncate group-hover:text-sienna transition-colors" style={{ fontFamily: "'Fraunces', serif" }}>
              {property.title}
            </h3>
            <span className="text-charcoal font-medium text-sm shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
              KSh {Number(property.rent_amount).toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-charcoal/50 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p>{property.city}</p>
            <p className="font-mono text-[11px] text-charcoal/40">
              {property.bedrooms} bed · {property.bathrooms} bath
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Properties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [minRent, setMinRent] = useState('')
  const [maxRent, setMaxRent] = useState('')

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    setError('')

    const params = {}
    if (city) params.city = city
    if (propertyType) params.type = propertyType
    if (minRent) params.min_rent = minRent
    if (maxRent) params.max_rent = maxRent

    try {
      const response = await apiClient.get('/api/properties/', { params })
      setProperties(response.data)
    } catch {
      setError('Could not load properties. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [city, propertyType, minRent, maxRent])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 space-y-12">
      {/* Header Block */}
      <div className="max-w-xl space-y-2">
        <h1 className="text-4xl text-charcoal font-light tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Our Properties
        </h1>
        <p className="text-charcoal/60 text-sm font-light leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
          Carefully managed architectural spaces optimized for refined Living.
        </p>
      </div>

      {/* Premium Minimal Search Filters */}
      <form
        onSubmit={(e) => { e.preventDefault(); fetchProperties(); }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-clay/5 p-3 rounded-xl border border-clay/10 items-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city"
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-sienna focus:border-sienna transition text-xs font-light"
        />
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-sienna focus:border-sienna transition text-xs font-light appearance-none"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="number"
          value={minRent}
          onChange={(e) => setMinRent(e.target.value)}
          placeholder="Min rent (KSh)"
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-sienna focus:border-sienna transition text-xs font-light"
        />
        <input
          type="number"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
          placeholder="Max rent (KSh)"
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-sienna focus:border-sienna transition text-xs font-light"
        />
        <button
          type="submit"
          className="w-full col-span-2 md:col-span-1 py-2.5 rounded-lg bg-charcoal text-sand text-xs font-medium tracking-wide hover:bg-sienna transition duration-200 shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <p className="text-xs font-mono text-charcoal/40 tracking-wider uppercase animate-pulse">
          Sifting properties...
        </p>
      )}

      {/* Error Message Layout */}
      {error && (
        <div className="text-xs text-brick font-mono border border-brick/20 rounded-lg px-4 py-3 bg-brick/5 max-w-max">
          {error}
        </div>
      )}

      {/* Empty State Layout */}
      {!isLoading && !error && (!Array.isArray(properties) || properties.length === 0) && (
        <p className="text-sm font-light text-charcoal/50 font-serif italic">
          No structures match your current query parameters.
        </p>
      )}

      {/* Premium Grid layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isLoading ? "hidden" : "show"}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
      >
        {Array.isArray(properties) && properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </motion.div>
    </div>
  )
}

export default Properties