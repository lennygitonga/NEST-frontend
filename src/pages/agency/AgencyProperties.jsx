import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'

const TYPE_OPTIONS = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'SHORT_TERM', label: 'Short Term Rental' },
]

function AgencyProperties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyType, setPropertyType] = useState('RESIDENTIAL')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [rent, setRent] = useState('')
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [landlordId, setLandlordId] = useState('')
  const [landlords, setLandlords] = useState([])
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/api/properties/')
      setProperties(response.data)
    } catch {
      setError('Could not load properties.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
    apiClient.get('/api/agencies/landlords/')
      .then((response) => {
        setLandlords(response.data)
        if (response.data.length > 0) setLandlordId(String(response.data[0].landlord))
      })
      .catch(() => {})
  }, [fetchProperties])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      await apiClient.post('/api/properties/create/', {
        title,
        description,
        property_type: propertyType,
        address,
        city,
        rent_amount: rent,
        bedrooms,
        bathrooms,
        landlord: landlordId,
      })
      setTitle('')
      setDescription('')
      setAddress('')
      setCity('')
      setRent('')
      setBedrooms(1)
      setBathrooms(1)
      setShowForm(false)
      setSubmitStatus('idle')
      fetchProperties()
    } catch (err) {
      const data = err.response?.data
      setSubmitError(data?.error || 'Could not create property. Please try again.')
      setSubmitStatus('error')
    }
  }

  const handleTogglePublish = async (property) => {
    try {
      await apiClient.patch(`/api/properties/${property.id}/update/`, {
        is_published: !property.is_published,
      })
      fetchProperties()
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    try {
      await apiClient.delete(`/api/properties/${id}/delete/`)
      fetchProperties()
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl text-charcoal mb-2 tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Properties
          </h1>
          <p className="text-charcoal/60 text-sm">
            Manage listings, track occupancy, and update property profiles.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm self-start sm:self-center ${
            showForm ? 'bg-white border border-clay/20 text-charcoal hover:bg-sand/20' : 'bg-sienna text-sand hover:bg-clay'
          }`}
        >
          {showForm ? 'Close form' : 'Add property'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-2xl p-6 sm:p-8 mb-12 space-y-6 shadow-[0_4px_24px_rgba(43,41,40,0.02)] animate-fade-in"
        >
          <p className="text-xl text-charcoal border-b border-clay/5 pb-3 font-medium tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            New Listing Details
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Property Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
              placeholder="e.g. Modern duplex suite in Kilimani"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm resize-none leading-relaxed"
              placeholder="Provide a polished narrative of the property features..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Property Type</label>
              <div className="relative">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-charcoal/40">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Monthly Rent (KSh)</label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
                placeholder="120,000"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
                placeholder="e.g. 123 Ngong Road"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal placeholder:text-charcoal/30 text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
                placeholder="Nairobi"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Bedrooms</label>
              <input
                type="number"
                min={1}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Bathrooms</label>
              <input
                type="number"
                min={1}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Assign Landlord</label>
              <div className="relative">
                <select
                  value={landlordId}
                  onChange={(e) => setLandlordId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                >
                  {landlords.length === 0 && (
                    <option value="">No registered landlords yet</option>
                  )}
                  {landlords.map((l) => (
                    <option key={l.id} value={l.landlord}>
                      {l.landlord_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-charcoal/40">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          <div className="pt-2 border-t border-clay/5 flex justify-end">
            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full sm:w-auto bg-sienna text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
            >
              {submitStatus === 'submitting' ? 'Creating index record...' : 'Publish listing'}
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="py-12 flex justify-center">
          <p className="text-charcoal/40 text-sm tracking-wide animate-pulse">
            Loading active assets...
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3.5 mb-8">
          {error}
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <div className="bg-white border border-clay/15 rounded-2xl p-12 text-center shadow-[0_4px_24px_rgba(43,41,40,0.01)]">
          <p className="text-charcoal/50 text-sm mb-6">
            You haven't registered any real estate entries yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-sienna text-sand px-5 py-2.5 rounded-xl font-medium hover:bg-clay transition-all duration-200 text-sm shadow-sm"
          >
            Create your first asset listing
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div 
            key={property.id} 
            className="bg-white border border-clay/15 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(43,41,40,0.015)] flex flex-col justify-between transition-all duration-200 hover:border-clay/30"
          >
            <div>
              <div className="relative aspect-[16/11] bg-sand/30 border-b border-clay/5">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0].image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-clay/30 bg-charcoal/[0.01]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                      <path d="M9 22V12h6v10" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
                      property.is_published ? 'bg-olive text-sand' : 'bg-charcoal/80 text-sand'
                    }`}
                  >
                    {property.is_published ? 'Live' : 'Hidden'}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
                      property.is_vacant ? 'bg-sand text-charcoal border border-clay/10' : 'bg-sienna text-sand'
                    }`}
                  >
                    {property.is_vacant ? 'Vacant' : 'Occupied'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-lg text-charcoal font-medium tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                  {property.title}
                </h2>
                <p className="text-charcoal/50 text-xs mt-1 truncate">
                  {property.city} · KSh {Number(property.rent_amount).toLocaleString()}
                  <span className="text-charcoal/40 font-normal lowercase"> / mo</span>
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-clay/5 flex items-center gap-2 mt-auto">
              <button
                onClick={() => handleTogglePublish(property)}
                className="flex-1 text-center text-xs py-2 rounded-lg border border-clay/20 text-charcoal hover:bg-clay/5 font-medium transition-all duration-200"
              >
                {property.is_published ? 'Hide' : 'Publish'}
              </button>
              <Link
                to={`/agency/properties/${property.id}`}
                className="flex-1 text-center text-xs py-2 rounded-lg bg-sienna text-sand hover:bg-clay font-medium transition-all duration-200 shadow-sm"
              >
                Manage
              </Link>
              <button
                onClick={() => handleDelete(property.id)}
                className="text-xs p-2 rounded-lg border border-brick/20 text-brick hover:bg-brick/5 transition-all duration-200"
                title="Remove listing"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgencyProperties