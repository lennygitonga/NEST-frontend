import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client'

const TYPE_LABELS = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  SHORT_TERM: 'Short Term Rental',
}

function PropertyDetail() {
  const { id } = useParams()

  const [property, setProperty] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [message, setMessage] = useState('')
  const [applyStatus, setApplyStatus] = useState('idle') // idle | submitting | success | error
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    apiClient.get(`/api/properties/${id}/`)
      .then((response) => setProperty(response.data))
      .catch(() => setError('Could not load this property.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleApply = async (e) => {
    e.preventDefault()
    setApplyStatus('submitting')
    setApplyError('')

    try {
      await apiClient.post('/api/properties/applications/', {
        property: property.id,
        message,
      })
      setApplyStatus('success')
    } catch (err) {
      const data = err.response?.data
      setApplyError(data?.error || data?.property?.[0] || 'Could not submit your application. Please try again.')
      setApplyStatus('error')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-charcoal/60" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-4 py-3">
          {error || 'Property not found.'}
        </div>
        <Link to="/properties" className="text-sienna text-sm font-medium hover:text-clay mt-4 inline-block" style={{ fontFamily: "'Inter', sans-serif" }}>
          ← Back to properties
        </Link>
      </div>
    )
  }

  const images = property.images || []

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to="/properties" className="text-sienna text-sm font-medium hover:text-clay" style={{ fontFamily: "'Inter', sans-serif" }}>
        ← Back to properties
      </Link>

      <div className="grid lg:grid-cols-3 gap-10 mt-6">

        {/* Left: images + details */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] bg-clay/10 rounded-xl overflow-hidden relative">
            {images.length > 0 ? (
              <img src={images[activeImage].image} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-clay/40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === activeImage ? 'border-sienna' : 'border-transparent'
                  }`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <span
            className="inline-block bg-clay/10 text-clay text-xs px-2.5 py-1 rounded-full mt-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {TYPE_LABELS[property.property_type]}
          </span>

          <h1
            className="text-3xl text-charcoal mt-3"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            {property.title}
          </h1>
          <p className="text-charcoal/60 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            {property.address}, {property.city}
          </p>

          <div className="flex items-center gap-6 mt-4 text-charcoal/70" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
            <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>

          <p className="text-charcoal/80 mt-6 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            {property.description}
          </p>
        </div>

        {/* Right: apply card */}
        <div>
          <div className="bg-white rounded-xl border border-clay/15 p-6 sticky top-24">
            <p className="text-clay text-2xl font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
              KSh {Number(property.rent_amount).toLocaleString()}
              <span className="text-charcoal/50 text-base"> /month</span>
            </p>

            {applyStatus === 'success' ? (
              <div className="mt-5 text-sm text-olive bg-olive/10 border border-olive/20 rounded-lg px-3 py-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                Application submitted. You can track its status under Applications.
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-5 space-y-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1.5">
                    Message to the agency (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-clay/30 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-clay focus:border-clay transition text-sm resize-none"
                    placeholder="Tell them a bit about yourself..."
                  />
                </div>

                {applyError && (
                  <div className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-lg px-3 py-2">
                    {applyError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={applyStatus === 'submitting'}
                  className="w-full py-2.5 rounded-lg bg-sienna text-sand font-medium hover:bg-clay transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {applyStatus === 'submitting' ? 'Submitting...' : 'Apply for this property'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail
