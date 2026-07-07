import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'

function StepIcon({ paths }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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

    const handleScrollTrigger = (e) => {
      if (hasPlayed) return

      const isScrollDown = e.deltaY > 0 || (e.touches && e.touches[0])

      if (isScrollDown) {
        if (!isPlaying) {
          setIsPlaying(true)
          video.play().catch((err) => {
            console.log("Browser playback gesture restriction:", err)
          })
        }
      }

      if (isPlaying) {
        if (e.cancelable) e.preventDefault()
      }
    }

    const handleVideoEnded = () => {
      setIsPlaying(false)
      setHasPlayed(true)
      video.pause()
    }

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
    <div className="bg-sand min-h-screen text-charcoal antialiased select-none">
      
      {/* Editorial Nav */}
      <nav className="sticky top-0 z-20 bg-sand/80 backdrop-blur-md border-b border-charcoal/5">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <span
            className="text-2xl text-charcoal tracking-tight font-light"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            N E S T
          </span>
          <div className="flex items-center gap-8 font-light tracking-wide text-xs uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Link to="/login" className="text-charcoal/60 hover:text-charcoal transition-colors duration-300">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-charcoal text-sand px-5 py-2.5 rounded-sm hover:bg-sienna transition-colors duration-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section 
        ref={containerRef}
        className="relative min-h-[calc(100vh-80px)] bg-[#0A0A0A] text-sand overflow-hidden flex items-center border-b border-charcoal/5"
      >
        {/* Immersive Video Layer */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            ref={videoRef}
            src="/assets/nest-hero-tour.mp4"
            className="w-full h-full object-cover transition-all duration-1000 ease-out"
            style={{ 
              opacity: isPlaying || hasPlayed ? 0.45 : 0.2,
              transform: isPlaying ? 'scale(1.02)' : 'scale(1)'
            }}
            muted
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
        </div>

        {/* Asymmetrical Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid md:grid-cols-12 gap-8">
          <motion.div
            className="md:col-span-7 lg:col-span-6 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-sand/40 font-medium block">Architectural Intelligence</span>
            <h1
              className="text-5xl sm:text-7xl leading-[1.1] font-light tracking-tight text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Property management, <span className="italic font-normal text-sienna">simplified</span>.
            </h1>
            <p
              className="text-base sm:text-lg text-sand/60 max-w-lg leading-relaxed font-light font-sans"
            >
              NEST seamlessly coordinates agencies, landlords, and modern tenants onto a singular, micro-designed residential ecosystem.
            </p>
            
            <div className="pt-4 flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
              <Link
                to="/register"
                className="bg-sienna text-sand px-8 py-4 rounded-sm font-medium hover:bg-white hover:text-charcoal transition-all duration-300 shadow-xl shadow-black/10"
              >
                {hasPlayed ? "View Properties" : "Initiate System"}
              </Link>
              <Link
                to="/login"
                className="border border-sand/20 text-sand px-8 py-4 rounded-sm hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                Access Account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-8 right-8 z-10 hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sand/30">
          <span>Scroll to tour architecture</span>
          <div className="w-8 h-[1px] bg-sand/20 relative overflow-hidden">
            <div className={`absolute inset-0 bg-sienna ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </section>

      {/* Editorial Grid Process Section */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-charcoal/10 pb-8 mb-16">
          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay">Operational Flow</span>
            <h2
              className="text-3xl sm:text-4xl text-charcoal font-light tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              The Ecosystem Architecture
            </h2>
          </div>
          <p className="text-charcoal/50 text-sm max-w-xs font-light mt-4 md:mt-0 leading-relaxed">
            A precise alignment of transactional security and structural management tools.
          </p>
        </div>

        {/* Premium Framed Cards */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-charcoal/10 border border-charcoal/10 bg-white/40 backdrop-blur-sm rounded-sm overflow-hidden">
          
          {/* Card 01 */}
          <div className="group p-10 space-y-12 hover:bg-charcoal hover:text-sand transition-all duration-500 ease-out flex flex-col justify-between min-h-[340px]">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-sm bg-clay/5 border border-clay/10 group-hover:bg-sand/10 group-hover:border-sand/20 flex items-center justify-center text-clay group-hover:text-sand transition-all duration-500">
                <StepIcon paths={
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </>
                } />
              </div>
              <span className="font-mono text-xs text-charcoal/20 group-hover:text-sand/30 transition-colors">// 01</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl text-charcoal group-hover:text-white font-medium tracking-tight transition-colors" style={{ fontFamily: "'Fraunces', serif" }}>
                Curated Architecture
              </h3>
              <p className="text-charcoal/60 group-hover:text-sand/60 text-sm leading-relaxed font-light transition-colors">
                Explore fully audited properties and verified boutique spaces matched perfectly with dynamic real-time specifications.
              </p>
            </div>
          </div>

          {/* Card 02 */}
          <div className="group p-10 space-y-12 hover:bg-charcoal hover:text-sand transition-all duration-500 ease-out flex flex-col justify-between min-h-[340px]">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-sm bg-clay/5 border border-clay/10 group-hover:bg-sand/10 group-hover:border-sand/20 flex items-center justify-center text-clay group-hover:text-sand transition-all duration-500">
                <StepIcon paths={
                  <>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </>
                } />
              </div>
              <span className="font-mono text-xs text-charcoal/20 group-hover:text-sand/30 transition-colors">// 02</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl text-charcoal group-hover:text-white font-medium tracking-tight transition-colors" style={{ fontFamily: "'Fraunces', serif" }}>
                Accelerated Lease Engine
              </h3>
              <p className="text-charcoal/60 group-hover:text-sand/60 text-sm leading-relaxed font-light transition-colors">
                Submit standard credentials cleanly via our secure pipeline, tracking background validation parameters end-to-end.
              </p>
            </div>
          </div>

          {/* Card 03 */}
          <div className="group p-10 space-y-12 hover:bg-charcoal hover:text-sand transition-all duration-500 ease-out flex flex-col justify-between min-h-[340px]">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-sm bg-clay/5 border border-clay/10 group-hover:bg-sand/10 group-hover:border-sand/20 flex items-center justify-center text-clay group-hover:text-sand transition-all duration-500">
                <StepIcon paths={
                  <>
                    <rect x="2" y="5" width="20" height="14" rx="1" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </>
                } />
              </div>
              <span className="font-mono text-xs text-charcoal/20 group-hover:text-sand/30 transition-colors">// 03</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl text-charcoal group-hover:text-white font-medium tracking-tight transition-colors" style={{ fontFamily: "'Fraunces', serif" }}>
                Unified Operations Hub
              </h3>
              <p className="text-charcoal/60 group-hover:text-sand/60 text-sm leading-relaxed font-light transition-colors">
                Manage automated banking channels, capture clear digital invoicing records, and dispatch priority engineering tickets.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="bg-[#0A0A0A] text-sand/40 py-16 border-t border-white/5 font-light">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span
            className="text-white text-xl tracking-widest font-light"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            N E S T
          </span>
          <div className="flex items-center gap-8 text-xs font-mono tracking-wider">
            <p>© {new Date().getFullYear()} NEST. Architectural Systems Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home