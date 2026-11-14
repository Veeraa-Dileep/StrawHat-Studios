import { Fragment, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, getLenis } from '../lib/gsap'
import { EASE_DRAFT, EASE_SNAP, EASE_SMOOTH, DURATION_REVEAL } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import Button from '../components/Button'
import SectionTransition from '../components/SectionTransition'
import useTilt3D from '../hooks/useTilt3D'
import useImageZoom from '../hooks/useImageZoom'
import { canRender3D } from '../lib/capabilities'

// 3D glass ball (R3F + Rapier physics) — lazy so the three/r3f/rapier
// chunk never loads on mobile / reduced-motion / no-WebGL (gated by canRender3D).
const GlassBallScene = lazy(() => import('../three/GlassBallScene'))

// Desktop shows one line per entry (breaks injected as responsive <br>s);
// below lg the breaks are hidden so the sentence wraps naturally.
const HEADLINE = ['Websites that', 'make your', 'expertise', 'easy to trust.']

function HeroVisual() {
  const tiltRef = useTilt3D({ max: 10, scale: 1.03, perspective: 1000, lift: 40 })
  const zoomRef = useImageZoom({ scale: 1.06 })
  const wrapRef = useRef(null)
  const layerBackRef = useRef(null)
  const layerMidRef = useRef(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      if (!wrap) return

      gsap.to(layerBackRef.current, {
        yPercent: -14, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
      gsap.to(layerMidRef.current, {
        yPercent: -7, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
    },
    { scope: wrapRef }
  )

  return (
    <div ref={wrapRef} className="relative hidden lg:block pointer-events-auto" style={{ width: '420px', height: '480px' }}>
      <div
        ref={layerBackRef}
        className="absolute inset-0"
        style={{ border: '1px solid var(--line)', backgroundColor: 'var(--surface)', transform: 'translate(28px, 24px) rotate(-2deg)' }}
      />
      <div
        ref={layerMidRef}
        className="absolute inset-0"
        style={{ border: '1px solid var(--line)', transform: 'translate(14px, 12px) rotate(1deg)' }}
      />
      <div
        ref={tiltRef}
        data-cursor="view"
        data-cursor-label="EXPLORE"
        className="absolute inset-0 flex flex-col justify-between p-6 overflow-hidden"
        style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--bg)' }}
      >
        <div className="flex justify-between items-start">
          <MonoLabel className="text-[var(--muted)]">FIG / 00.1</MonoLabel>
          <MonoLabel className="text-[var(--accent)]">△</MonoLabel>
        </div>

        <svg ref={zoomRef} width="100%" height="140" viewBox="0 0 300 140" fill="none" style={{ transformOrigin: 'center' }}>
          <circle cx="150" cy="70" r="46" stroke="var(--accent)" strokeWidth="1" />
          <circle cx="150" cy="70" r="4" fill="var(--accent)" />
          <line x1="150" y1="10" x2="150" y2="130" stroke="var(--line)" strokeWidth="1" />
          <line x1="60" y1="70" x2="240" y2="70" stroke="var(--line)" strokeWidth="1" />
        </svg>

        <div className="flex justify-between items-end">
          <MonoLabel className="text-[var(--muted)]">SCALE / 1:1</MonoLabel>
          <MonoLabel className="text-[var(--muted)]">SHS—2026</MonoLabel>
        </div>
      </div>
    </div>
  )
}

/**
 * Renders the WebGL glass ball on capable desktops; otherwise the 2D blueprint
 * card. The decision runs after mount (client-only) so the 2D card is the
 * first paint (LCP-safe) and the effect only ever loads when it will render.
 */
function Hero3DVisual() {
  const [use3D, setUse3D] = useState(false)

  useEffect(() => {
    setUse3D(canRender3D())
  }, [])

  if (!use3D) return <HeroVisual />

  return (
    <div
      className="relative hidden lg:block overflow-hidden pointer-events-none"
      style={{
        width: '1080px',
        height: '660px',
        WebkitMaskImage: 'radial-gradient(ellipse 82% 72% at 50% 50%, #000 50%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 82% 72% at 50% 50%, #000 50%, transparent 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '880px',
          height: '880px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Suspense fallback={<HeroVisual />}>
          <GlassBallScene />
        </Suspense>
      </div>
    </div>
  )
}



function ScrollIndicator({ className = '' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      gsap.to(ref.current, {
        y: 8, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true,
        scrollTrigger: { trigger: document.body, start: 'top top', end: '+=200', onLeave: () => gsap.to(ref.current, { autoAlpha: 0, duration: 0.3 }) },
      })
    },
    { scope: ref }
  )

  return (
    <div
      ref={ref}
      data-hero="scroll"
      className={`pointer-events-none flex flex-col items-center gap-2 ${className}`}
    >
      <span className="block w-px h-8" style={{ background: 'linear-gradient(var(--accent), transparent)' }} />
      <MonoLabel className="text-[var(--muted)] text-[0.6rem]">SCROLL</MonoLabel>
    </div>
  )
}

export default function Hero() {
  const rootRef = useRef(null)
  const headlineRef = useRef(null)
  const eyebrowRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const visualRef = useRef(null)
  const badgeRef = useRef(null)
  const mobileVisualRef = useRef(null)
  const tlRef = useRef(null)

  useGSAP(
    () => {
      const headline = headlineRef.current
      // `words` only: building line wrappers would discard the responsive
      // <br>s above (split-type drops non-word nodes). Word animation is
      // unchanged — nothing styles or queries `.line` here.
      const split = new SplitType(headline, { types: 'words', tagName: 'span' })

      // Intro timeline (paused) — plays when the preloader completes.
      const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })
      tlRef.current = tl

      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE_DRAFT }, 0)
        .fromTo(
          split.words,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.8, ease: EASE_DRAFT, stagger: 0.035 },
          0.15
        )
        .fromTo(
          mobileVisualRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE_DRAFT },
          0.35
        )
        .fromTo(
          [subRef.current, badgeRef.current, ctaRef.current],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE_SNAP, stagger: 0.08 },
          0.55
        )
        .fromTo(
          visualRef.current,
          { opacity: 0, x: 40 + 260, yPercent: -50 },
          { opacity: 1, x: 260, yPercent: -50, duration: 1, ease: EASE_SMOOTH },
          0.45
        )
        .fromTo('[data-hero="scroll"]', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE_DRAFT }, 0.9)

      const play = () => tl.play()
      window.addEventListener('hero:start', play, { once: true })

      return () => {
        window.removeEventListener('hero:start', play)
        split.revert()
        tl.kill()
      }
    },
    { scope: rootRef }
  )

  const handleSeeWork = (e) => {
    e.preventDefault()
    const target = document.getElementById('work')
    if (!target) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.1 })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SectionTransition
      index={0}
      id="hero"
      bg="var(--bg)"
      innerRef={rootRef}
      sectionName="hero"
      className="relative min-h-[100svh] flex flex-col justify-center max-lg:justify-center pb-[64px] max-lg:pb-[48px] px-6 lg:px-10 pt-[60px] max-lg:pt-[56px]"
    >
      <div
        ref={visualRef}
        className="absolute pointer-events-none"
        style={{
          opacity: 0,
          perspective: '1200px',
          zIndex: 4,
          top: '46%',
          right: '2%',
        }}
      >
        <Hero3DVisual />
      </div>

      <div className="relative max-w-[1400px] mx-auto w-full" style={{ zIndex: 1 }}>
        <div ref={eyebrowRef} className="mb-6" style={{ opacity: 0 }}>
          <MonoLabel className="text-[var(--muted)]">STRAW HAT STUDIOS / 2026</MonoLabel>
        </div>

        <h1
          ref={headlineRef}
          className="font-['Clash_Display'] font-bold text-[clamp(2.75rem,7.5vw,7.5rem)] leading-[0.95] text-[var(--paper)] max-w-[14ch]"
        >
          {HEADLINE.map((line, i) => (
            <Fragment key={line}>
              {line}
              {i < HEADLINE.length - 1 && (
                <>
                  {' '}
                  <br className="hidden lg:inline" />
                </>
              )}
            </Fragment>
          ))}
        </h1>

        {/* Mobile 2D visual — shown below headline on mobile only */}
        <div
          ref={mobileVisualRef}
          className="lg:hidden mt-8 mb-6 relative"
          style={{ opacity: 0, width: '100%', maxWidth: '280px', height: '200px' }}
        >
          <div
            className="absolute inset-0"
            style={{ border: '1px solid var(--line)', backgroundColor: 'var(--surface)', transform: 'translate(12px, 10px) rotate(-2deg)' }}
          />
          <div
            className="absolute inset-0"
            style={{ border: '1px solid var(--line)', transform: 'translate(6px, 5px) rotate(1deg)' }}
          />
          <div
            className="absolute inset-0 flex flex-col justify-between p-4 overflow-hidden"
            style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--bg)' }}
          >
            <div className="flex justify-between items-start">
              <MonoLabel className="text-[var(--muted)] text-[0.6rem]">FIG / 00.1</MonoLabel>
              <MonoLabel className="text-[var(--accent)] text-[0.6rem]">△</MonoLabel>
            </div>
            <svg width="100%" height="80" viewBox="0 0 300 140" fill="none">
              <circle cx="150" cy="70" r="46" stroke="var(--accent)" strokeWidth="1" />
              <circle cx="150" cy="70" r="4" fill="var(--accent)" />
              <line x1="150" y1="10" x2="150" y2="130" stroke="var(--line)" strokeWidth="1" />
              <line x1="60" y1="70" x2="240" y2="70" stroke="var(--line)" strokeWidth="1" />
            </svg>
            <div className="flex justify-between items-end">
              <MonoLabel className="text-[var(--muted)] text-[0.6rem]">SCALE / 1:1</MonoLabel>
              <MonoLabel className="text-[var(--muted)] text-[0.6rem]">SHS—2026</MonoLabel>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <p
            ref={subRef}
            className="text-[1.125rem] text-[var(--muted)] leading-[1.6] max-w-[50ch]"
            style={{ opacity: 0 }}
          >
            Custom websites for independent consultants, fractional executives and coaches. Designed, built and launched end to end.
          </p>

          <div ref={ctaRef} style={{ opacity: 0 }}>
            <Button href="#work" onClick={handleSeeWork}>See the work</Button>
          </div>
        </div>

        <ScrollIndicator className="absolute bottom-0 right-0" />
      </div>
    </SectionTransition>
  )
}
