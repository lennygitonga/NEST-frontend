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

function PropertyCard({ property }) {
  const cover = property.images?.[0]?.image

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(34,31,28,0.10)' }}
      transition={{ duration: 0.2, ease: easing }}
    >
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white rounded-xl border border-clay/15 overflow-hidden group"
    >
      <div className="aspect-[4/3] bg-clay/10 relative overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-clay/40">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-charcoal/80 text-sand text-xs px-2.5 py-1 rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
          {TYPE_OPTIONS.find((t) => t.value === property.property_type)?.label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
          {property.title}
        </h3>
        <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {property.city}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-clay font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            KSh {Number(property.rent_amount).toLocaleString()}/mo
          </span>
          <span className="text-charcoal/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            {property.bedrooms} bed · {property.bathrooms} bath
          </span>
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

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchProperties()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-charcoal mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
      >
        Properties
      </h1>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Browse available properties and find your next home.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10 bg-white p-4 rounded-xl border border-clay/15"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
        />
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
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
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
        />
        <input
          type="number"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
          placeholder="Max rent (KSh)"
          className="px-3 py-2 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition text-sm"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading properties...
        </p>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          No properties match your search.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}

export default Properties