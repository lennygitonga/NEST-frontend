import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'

function StepIcon({ paths }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  )
}

function Home() {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    // Skill: Scroll-Triggered Input Lock Pattern (From 02-scroll-video.prompt.md)
    const handleScrollTrigger = (e) => {
      if (hasPlayed) return // Do not re-trigger once finished

      const isScrollDown = e.deltaY > 0 || (e.touches && e.touches[0])

      if (isScrollDown) {
        if (!isPlaying) {
          setIsPlaying(true)
          video.play().catch((err) => {
            console.log("Browser playback gesture restriction:", err)
          })
        }
      }

      // Lock input so multiple rapid gestures don't loop, skip, or break playback
      if (isPlaying) {
        if (e.cancelable) e.preventDefault()
      }
    }

    const handleVideoEnded = () => {
      setIsPlaying(false)
      setHasPlayed(true)
      video.pause() // Explicitly freeze on the precise final frame
    }

    // Attach native listener with passive option disabled to allow event cancellation/input locking
    container.addEventListener('wheel', handleScrollTrigger, { passive: false })
    container.addEventListener('touchmove', handleScrollTrigger, { passive: false })
    video.addEventListener('ended', handleVideoEnded)

    return () => {
      container.removeEventListener('wheel', handleScrollTrigger)
      container.removeEventListener('touchmove', handleScrollTrigger)
      video.removeEventListener('ended', handleVideoEnded)
    }
  }, [isPlaying, hasPlayed])

  return (
    <div className="bg-sand min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-sand/90 backdrop-blur-sm border-b border-clay/15">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="text-xl text-charcoal tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            NEST
          </span>
          <div className="flex items-center gap-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Link to="/login" className="text-sm font-medium text-charcoal/70 hover:text-charcoal transition">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-sienna text-sand px-4 py-2 rounded-lg hover:bg-clay transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Immersive Cinematic Video Section */}
      <section 
        ref={containerRef}
        className="relative min-h-[calc(100vh-65px)] bg-charcoal text-sand overflow-hidden flex items-center"
      >
        {/* Hardware-accelerated direct video layer */}
        <div className="absolute inset-0 w-full height-full z-0">
          <video
            ref={videoRef}
            src="/assets/nest-hero-tour.mp4"
            className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
            style={{ opacity: isPlaying || hasPlayed ? 0.6 : 0.25 }}
            muted
            playsInline
            preload="auto"
          />
          {/* Optional: object-fit: contain; if you prefer exact aspect bounding */}
        </div>

        {/* Dynamic UI Content Overlay */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 w-full">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easing }}
          >
            <h1
              className="text-5xl sm:text-6xl leading-tight mb-6"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
              Property management,{' '}
              <span className="text-sienna">simplified</span>.
            </h1>
            <p
              className="text-lg text-sand/70 mb-10 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              NEST connects agencies, landlords, and tenants on one platform — from browsing listings to paying rent and tracking maintenance.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="bg-sienna text-sand px-6 py-3 rounded-lg font-medium hover:bg-clay transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {hasPlayed ? "Explore Available Suites" : "Get started"}
              </Link>
              <Link
                to="/login"
                className="border border-sand/30 text-sand px-6 py-3 rounded-lg font-medium hover:bg-sand/10 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Log in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2
          className="text-3xl text-charcoal mb-16 text-center"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          How it works
        </h2>

        <div className="grid sm:grid-cols-3 gap-10">
          <div>
            <div className="w-12 h-12 rounded-full bg-clay/10 flex items-center justify-center text-clay mb-5">
              <StepIcon paths={
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </>
              } />
            </div>
            <h3 className="text-lg text-charcoal mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              Browse listings
            </h3>
            <p className="text-charcoal/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Search verified properties from agencies near you, with full details and photos.
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-full bg-clay/10 flex items-center justify-center text-clay mb-5">
              <StepIcon paths={
                <>
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </>
              } />
            </div>
            <h3 className="text-lg text-charcoal mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              Apply and get approved
            </h3>
            <p className="text-charcoal/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Submit your application directly through the platform and track its status.
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-full bg-clay/10 flex items-center justify-center text-clay mb-5">
              <StepIcon paths={
                <>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </>
              } />
            </div>
            <h3 className="text-lg text-charcoal mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              Manage payments and maintenance
            </h3>
            <p className="text-charcoal/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Pay rent, view receipts, and raise maintenance tickets, all in one place.
            </p>
          </div> {/* FIXED: Was previously </motion.div> causing compilation crash */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-sand/60 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-sand text-lg"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            NEST
          </span>
          <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} NEST. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home