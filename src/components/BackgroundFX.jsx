import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import Particles from './Particles'

const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  )

export default function BackgroundFX() {
  const rootRef = useRef(null)
  const spotlightRef = useRef(null)
  const blobARef = useRef(null)
  const blobBRef = useRef(null)
  const blobCRef = useRef(null)
  const lightARef = useRef(null)
  const lightBRef = useRef(null)
  const gridRef = useRef(null)
  const particlesApi = useRef(null)

  // Cheaper blur on touch / low-power devices to spare the GPU.
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const blobBlur = coarse ? '45px' : '70px'
  const blobBlurB = coarse ? '50px' : '80px'
  const blobBlurC = coarse ? '55px' : '90px'

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    const tweens = []
    const mm = gsap.matchMedia()

    // Pause logic: tab hidden + idle. Reduced-motion has no loops.
    let idleTimer = null
    const setIdle = (v) => {
      if (particlesApi.current) particlesApi.current.setIdle(v)
      if (v) {
        tweens.forEach((t) => t.timeScale(0.15))
      } else {
        tweens.forEach((t) => t.timeScale(1))
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => setIdle(true), 2500)
      }
    }

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // Slow drifting blobs (transform-only).
        tweens.push(
          gsap.to(blobARef.current, { xPercent: -16, yPercent: 12, duration: 18, ease: 'none', repeat: -1, yoyo: true }),
          gsap.to(blobBRef.current, { xPercent: 14, yPercent: -10, duration: 21, ease: 'none', repeat: -1, yoyo: true }),
          gsap.to(blobCRef.current, { xPercent: -10, yPercent: -14, duration: 24, ease: 'none', repeat: -1, yoyo: true })
        )
        // Floating lights (distinct, larger, slower).
        tweens.push(
          gsap.to(lightARef.current, { xPercent: 12, yPercent: 16, duration: 26, ease: 'none', repeat: -1, yoyo: true }),
          gsap.to(lightBRef.current, { xPercent: -14, yPercent: -12, duration: 30, ease: 'none', repeat: -1, yoyo: true })
        )
        // Subtle grid drift.
        tweens.push(
          gsap.to(gridRef.current, { xPercent: 3, yPercent: 2, duration: 24, ease: 'none', repeat: -1, yoyo: true })
        )

        // Mouse-reactive spotlight (CSS-var, quickTo, no layout reads).
        if (!isTouch && spotlightRef.current) {
          const xTo = gsap.quickTo(spotlightRef.current, '--mx', { duration: 0.6, ease: 'power3.out' })
          const yTo = gsap.quickTo(spotlightRef.current, '--my', { duration: 0.6, ease: 'power3.out' })
          const onMove = (e) => {
            xTo((e.clientX / window.innerWidth) * 100)
            yTo((e.clientY / window.innerHeight) * 100)
            setIdle(false)
          }
          root.addEventListener('mousemove', onMove)
          return () => root.removeEventListener('mousemove', onMove)
        }
      }, root)
      return () => ctx.revert()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (spotlightRef.current) gsap.set(spotlightRef.current, { '--mx': 50, '--my': 38 })
    })

    // Pause logic: tab hidden + idle. Reduced-motion has no loops.
    const onActivity = () => setIdle(false)
    const onVisibility = () => {
      if (document.hidden) {
        tweens.forEach((t) => t.pause())
        if (particlesApi.current) particlesApi.current.stop()
      } else if (!prefersReduced) {
        tweens.forEach((t) => t.play())
        if (particlesApi.current) particlesApi.current.start()
        setIdle(false)
      }
    }

    window.addEventListener('mousemove', onActivity, { passive: true })
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('visibilitychange', onVisibility)
    const firstIdle = setTimeout(() => setIdle(true), 2500)

    return () => {
      mm.revert()
      clearTimeout(idleTimer)
      clearTimeout(firstIdle)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1, backgroundColor: 'var(--bg)' }}
    >
      {/* 1. Animated gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 20% 10%, rgba(255,90,31,0.06), transparent 55%), radial-gradient(120% 90% at 85% 90%, rgba(80,120,255,0.05), transparent 55%)',
        }}
      />

      {/* 2. Animated grid (replaces GridOverlay) */}
      <div
        ref={gridRef}
        className="absolute inset-[-10%]"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.05,
          willChange: 'transform',
        }}
      />

      {/* 3. Blurred blobs */}
      <div ref={blobARef} className="absolute" style={{ top: '6%', left: '4%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,90,31,0.18), transparent 65%)', filter: `blur(${blobBlur})`, willChange: 'transform' }} />
      <div ref={blobBRef} className="absolute" style={{ bottom: '2%', right: '6%', width: '36vw', height: '36vw', background: 'radial-gradient(circle, rgba(80,120,255,0.14), transparent 65%)', filter: `blur(${blobBlurB})`, willChange: 'transform' }} />
      <div ref={blobCRef} className="absolute" style={{ top: '40%', right: '30%', width: '28vw', height: '28vw', background: 'radial-gradient(circle, rgba(255,90,31,0.10), transparent 65%)', filter: `blur(${blobBlurC})`, willChange: 'transform' }} />

      {/* 4. Floating lights */}
      <div ref={lightARef} className="absolute" style={{ top: '20%', left: '55%', width: '22vw', height: '22vw', background: 'radial-gradient(circle, rgba(255,200,120,0.10), transparent 70%)', filter: 'blur(50px)', willChange: 'transform' }} />
      <div ref={lightBRef} className="absolute" style={{ bottom: '25%', left: '10%', width: '20vw', height: '20vw', background: 'radial-gradient(circle, rgba(120,180,255,0.10), transparent 70%)', filter: 'blur(55px)', willChange: 'transform' }} />

      {/* 5. Particle canvas */}
      <Particles ref={particlesApi} className="absolute inset-0 h-full w-full" />

      {/* 6. Mouse-reactive spotlight */}
      <div
        ref={spotlightRef}
        className="absolute inset-0"
        style={{
          '--mx': 50, '--my': 38,
          background:
            'radial-gradient(420px circle at calc(var(--mx) * 1%) calc(var(--my) * 1%), rgba(255,90,31,0.10), transparent 60%)',
        }}
      />

      {/* 7. Noise texture */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: '160px 160px', opacity: 0.04 }}
      />

      {/* 8. Per-section tint wash (set via --bg-section) */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--bg-section)', opacity: 0.25, transition: 'background-color 0.8s ease' }}
      />
    </div>
  )
}
