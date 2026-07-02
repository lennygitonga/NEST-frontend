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
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1
          className="text-3xl text-charcoal"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          Properties
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-sienna text-sand px-4 py-2 rounded-lg font-medium hover:bg-clay transition text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {showForm ? 'Cancel' : 'Add property'}
        </button>
      </div>
      <p className="text-charcoal/60 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Manage your agency's property listings.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-clay/15 rounded-xl p-6 mb-10 space-y-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p className="text-lg text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            New property
          </p>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              placeholder="e.g. Modern 2BR in Kilimani"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm resize-none"
              placeholder="Describe the property..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Rent (KSh/mo)</label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                placeholder="123 Ngong Road"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
                placeholder="Nairobi"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Bedrooms</label>
              <input
                type="number"
                min={1}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Bathrooms</label>
              <input
                type="number"
                min={1}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Landlord</label>
              <select
                value={landlordId}
                onChange={(e) => setLandlordId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
              >
                {landlords.length === 0 && (
                  <option value="">No landlords yet</option>
                )}
                {landlords.map((l) => (
                  <option key={l.id} value={l.landlord}>
                    {l.landlord_name} ({l.landlord_email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {submitError && (
            <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
          >
            {submitStatus === 'submitting' ? 'Creating...' : 'Create property'}
          </button>
        </form>
      )}

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
            No properties yet. Add your first listing above.
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
                  property.is_published ? 'bg-olive/20 text-olive' : 'bg-charcoal/20 text-charcoal/60'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {property.is_published ? 'Published' : 'Hidden'}
              </span>
            </div>

            <div className="p-4">
              <p className="text-charcoal font-medium truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                {property.title}
              </p>
              <p className="text-charcoal/50 text-sm mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {property.city} · KSh {Number(property.rent_amount).toLocaleString()}/mo
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className={property.is_vacant ? 'text-olive' : 'text-sienna'}>
                  {property.is_vacant ? 'Vacant' : 'Occupied'}
                </span>
              </p>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleTogglePublish(property)}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg border border-clay/30 text-charcoal/60 hover:bg-clay/5 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {property.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  to={`/agency/properties/${property.id}`}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg bg-sienna text-sand hover:bg-clay transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Manage
                </Link>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-brick/30 text-brick hover:bg-brick/5 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgencyProperties