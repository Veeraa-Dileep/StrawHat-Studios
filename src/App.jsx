import { lazy, Suspense, useEffect, useState } from 'react'
import { initLenis, destroyLenis, getLenis } from './lib/gsap'
import Preloader from './components/Preloader'
import Header from './components/Header'
import Hero from './sections/Hero'
import { ScrollStageProvider } from './context/ScrollStage'

// Decorative / non-critical overlays — lazy, no layout impact (fixed/aria-hidden).
const BackgroundFX = lazy(() => import('./components/BackgroundFX'))
const CoordinateCursor = lazy(() => import('./components/CoordinateCursor'))
const ScrollProgressBar = lazy(() => import('./components/ScrollProgressBar'))
const ChapterIndicator = lazy(() => import('./components/ChapterIndicator'))

// Below-the-fold sections — lazy so the initial bundle is the LCP path only.
const Marquee = lazy(() => import('./sections/Marquee'))
const Work = lazy(() => import('./sections/Work'))
const Process = lazy(() => import('./sections/Process'))
const Pricing = lazy(() => import('./sections/Pricing'))
const Studio = lazy(() => import('./sections/Studio'))
const Contact = lazy(() => import('./sections/Contact'))

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'marquee', label: 'Disciplines' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'studio', label: 'Studio' },
  { id: 'contact', label: 'Contact' },
]

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lenis = initLenis()
    lenis.stop()
    document.body.style.overflow = 'hidden'
    return () => destroyLenis()
  }, [])

  const handlePreloadComplete = () => {
    setLoading(false)
    document.body.style.overflow = ''
    const lenis = getLenis()
    if (lenis) lenis.start()
    window.dispatchEvent(new Event('hero:start'))
  }

  return (
    <ScrollStageProvider sections={SECTIONS}>
      {loading && <Preloader onComplete={handlePreloadComplete} />}

      {/* Decorative overlays: render only when loaded, invisible fallback avoids layout shift. */}
      <Suspense fallback={null}>
        <BackgroundFX />
        <CoordinateCursor />
        <ScrollProgressBar />
        <ChapterIndicator />
      </Suspense>

      <Header />
      <main className="relative">
        {/* Hero is critical (LCP) — eager. Below-fold sections lazy. */}
        <Hero />
        <Suspense fallback={null}>
          <Marquee />
          <Work />
          <Process />
          <Pricing />
          <Studio />
          <Contact />
        </Suspense>
      </main>
    </ScrollStageProvider>
  )
}
