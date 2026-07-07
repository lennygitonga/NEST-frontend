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
        rent_amount: Number(rentAmount),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        city,
        address,
      })
      setProperty(response.data.property || response.data)
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
      const updatedStatus = !property.is_published
      await apiClient.patch(`/api/properties/${id}/update/`, {
        is_published: updatedStatus,
      })
      setProperty((prev) => ({ ...prev, is_published: updatedStatus }))
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 flex justify-center items-center">
        <p className="text-charcoal/40 text-sm tracking-wide animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
          Loading...
        </p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3.5 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          {error || 'Property not found.'}
        </div>
        <Link to="/agency/properties" className="inline-flex items-center text-sienna text-sm font-medium hover:text-clay transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="mr-2">←</span> Back to properties
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/agency/properties" className="inline-flex items-center text-sienna text-sm font-medium hover:text-clay transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
        <span className="mr-2">←</span> Back to properties
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-10">
        <h1 className="text-3xl text-charcoal tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
          {property.title}
        </h1>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full tracking-wide ${
              property.is_vacant ? 'bg-olive/10 text-olive' : 'bg-sienna/10 text-sienna'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {property.is_vacant ? 'Vacant' : 'Occupied'}
          </span>
          <button
            onClick={handleTogglePublish}
            className={`text-xs font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${
              property.is_published
                ? 'border-brick/20 text-brick hover:bg-brick/5'
                : 'border-olive/20 text-olive hover:bg-olive/5'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {property.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {property.images?.length > 0 && (
        <div className="flex gap-3 mb-10 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-clay/20 scrollbar-track-transparent">
          {property.images.map((img) => (
            <img
              key={img.id}
              src={img.image}
              alt=""
              className="w-40 h-28 object-cover rounded-xl shrink-0 border border-clay/10 shadow-sm"
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-clay/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(43,41,40,0.02)]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-xl text-charcoal font-medium" style={{ fontFamily: "'Fraunces', serif" }}>Edit details</h2>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm placeholder:text-charcoal/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm placeholder:text-charcoal/30 resize-none leading-relaxed"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">Rent (KSh / mo)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-clay/20 bg-white text-charcoal text-sm focus:outline-none focus:border-clay focus:ring-4 focus:ring-clay/5 transition-all duration-200 shadow-sm"
            />
          </div>
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
        </div>

        {saveError && (
          <div className="text-sm text-brick bg-brick/5 border border-brick/10 rounded-xl px-4 py-3">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="text-sm text-olive bg-olive/5 border border-olive/10 rounded-xl px-4 py-3">
            Changes saved.
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-sienna text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
          >
            {saving ? 'Saving changes...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AgencyPropertyDetail