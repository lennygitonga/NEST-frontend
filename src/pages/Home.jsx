import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easing } from '../utils/animations'

function BuildingIllustration({ className }) {
  return (
    <svg
      viewBox="0 0 480 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        points="0,220 0,140 40,140 40,90 90,90 90,160 150,160 150,60 210,60 210,160 270,160 270,40 330,40 330,160 390,160 390,110 440,110 440,160 480,160 480,220"
        stroke="#EFE6D8"
        strokeWidth="2"
        strokeOpacity="0.5"
      />
      <rect x="100" y="105" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
      <rect x="160" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
      <rect x="220" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
      <rect x="280" y="55" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
      <rect x="340" y="75" width="10" height="14" fill="#C97B5E" fillOpacity="0.6" />
    </svg>
  )
}

function StepIcon({ paths }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  )
}

function Home() {
  return (
    <div className="bg-sand">

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

      {/* Hero — reserved for future 3D/video background */}
      <section className="relative min-h-[calc(100vh-65px)] bg-charcoal text-sand overflow-hidden flex items-center">
        {/* This layer is reserved for a future Three.js / Spline scene or background video.
            It currently holds a static, faded illustration as a placeholder. */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <BuildingIllustration className="w-full max-w-4xl opacity-10" />
        </div>

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
                Get started
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
          </motion.div>
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