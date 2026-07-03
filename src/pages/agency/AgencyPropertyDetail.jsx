import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../../api/client'

function AgencyPropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    apiClient.get(`/api/properties/${id}/`)
      .then((response) => {
        const p = response.data
        setProperty(p)
        setTitle(p.title)
        setDescription(p.description)
        setRentAmount(String(p.rent_amount))
        setBedrooms(p.bedrooms)
        setBathrooms(p.bathrooms)
        setCity(p.city)
        setAddress(p.address)
      })
      .catch(() => setError('Could not load this property.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const response = await apiClient.patch(`/api/properties/${id}/update/`, {
        title,
        description,
        rent_amount: rentAmount,
        bedrooms,
        bathrooms,
        city,
        address,
      })
      setProperty(response.data.property)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      const data = err.response?.data
      setSaveError(data?.error || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      await apiClient.patch(`/api/properties/${id}/update/`, {
        is_published: !property.is_published,
      })
      setProperty((prev) => ({ ...prev, is_published: !prev.is_published }))
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3 mb-4">
          {error || 'Property not found.'}
        </div>
        <Link to="/agency/properties" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
          ← Back to properties
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/agency/properties" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
        ← Back to properties
      </Link>

      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-3xl text-charcoal" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
          {property.title}
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              property.is_vacant ? 'bg-olive/10 text-olive' : 'bg-sienna/10 text-sienna'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {property.is_vacant ? 'Vacant' : 'Occupied'}
          </span>
          <button
            onClick={handleTogglePublish}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              property.is_published
                ? 'border-brick/30 text-brick hover:bg-brick/5'
                : 'border-olive/30 text-olive hover:bg-olive/5'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {property.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {property.images?.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {property.images.map((img) => (
            <img
              key={img.id}
              src={img.image}
              alt=""
              className="w-32 h-24 object-cover rounded-lg shrink-0"
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-clay/15 rounded-xl p-6 space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <p className="text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Edit details</p>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Rent (KSh/mo)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-clay transition text-sm"
            />
          </div>
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
        </div>

        {saveError && (
          <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-2">
            Changes saved.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-sienna text-sand px-5 py-2.5 rounded-lg font-medium hover:bg-clay transition disabled:opacity-60 text-sm"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

export default AgencyPropertyDetail