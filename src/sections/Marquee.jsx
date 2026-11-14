import { useEffect, useRef } from 'react'
import { gsap, getLenis } from '../lib/gsap'

const LABELS = [
  'CUSTOM DESIGN', 'WEBSITES', 'LANDING PAGES', 'MOBILE-FIRST',
  'FAST LOADING', 'LAUNCH & HOSTING', 'ONGOING SUPPORT',
]

export default function Marquee() {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      const doubledWidth = track.scrollWidth / 2
      const duration = (doubledWidth / 100) * 2

      const loop = gsap.to(track, {
        xPercent: -50,
        duration,
        repeat: -1,
        ease: 'none',
      })

      track.addEventListener('mouseenter', () => {
        gsap.to(loop, { timeScale: 0, duration: 0.3, overwrite: 'auto' })
      })
      track.addEventListener('mouseleave', () => {
        gsap.to(loop, { timeScale: 1, duration: 0.5, overwrite: 'auto' })
      })

      // Velocity-reactive ribbon: fast scroll skews + brightens the strip, settles at rest.
      const quickSkew = gsap.quickTo(track, 'skewY', { duration: 0.5, ease: 'power3.out' })
      const quickOpacity = gsap.quickTo(track, 'opacity', { duration: 0.5, ease: 'power2.out' })

      const handleScroll = ({ velocity }) => {
        const clamped = gsap.utils.clamp(-3, 3, velocity * 0.08)
        const boost = gsap.utils.clamp(1, 2.2, 1 + Math.abs(velocity) * 0.04)
        quickSkew(clamped)
        quickOpacity(boost)
      }

      const poll = () => {
        const lenis = getLenis()
        if (lenis) lenis.on('scroll', handleScroll)
        else requestAnimationFrame(poll)
      }
      poll()

      return () => {
        const lenis = getLenis()
        if (lenis) lenis.off('scroll', handleScroll)
      }
    }, track)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="marquee"
      data-section="marquee"
      aria-hidden="true"
      className="relative overflow-hidden py-4"
      style={{ backgroundColor: 'var(--surface)', zIndex: 1 }}
    >
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {[...Array(2)].map((_, dupIdx) => (
          <div key={dupIdx} className="flex shrink-0">
            {LABELS.map((label, i) => (
              <span
                key={`${dupIdx}-${i}`}
                className="font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] text-[var(--muted)] uppercase px-6"
              >
                {label}
                <span className="text-[var(--accent)] ml-6">—</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
