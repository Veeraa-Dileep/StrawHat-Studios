import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Animated technology stack chips. Stagger in once when scrolled into view.
 * One-shot, transform/opacity only — compositor friendly. Reduced-motion safe.
 */
export default function TechStack({ stack = [], className = '' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const chips = el.querySelectorAll('[data-chip]')

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          chips,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        )
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(chips, { opacity: 1, y: 0 })
      })
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={`flex flex-wrap gap-2 ${className}`}>
      {stack.map((tech) => (
        <span
          key={tech}
          data-chip
          className="font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.06em] text-[var(--muted)] px-3 py-1 will-change-transform"
          style={{ border: '1px solid var(--line)', borderRadius: '9999px' }}
        >
          {tech}
        </span>
      ))}
    </div>
  )
}
