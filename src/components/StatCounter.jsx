import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'

/**
 * Animated number counter (no progress bar). Counts 0 -> value once when scrolled
 * into view. Reduced-motion safe (shows final value immediately).
 */
export default function StatCounter({ value = 0, suffix = '', label }) {
  const numRef = useRef(null)

  useGSAP(
    () => {
      const el = numRef.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: value,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.v)}${suffix}`
          },
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        el.textContent = `${value}${suffix}`
      })
    },
    { scope: numRef }
  )

  return (
    <div className="flex flex-col">
      <span
        ref={numRef}
        className="font-['Clash_Display'] font-semibold leading-none text-[clamp(2.5rem,5vw,4rem)] text-[var(--paper)]"
        aria-label={`${value}${suffix} ${label || ''}`}
      >
        {`0${suffix}`}
      </span>
      {label && (
        <span className="mt-3 font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.06em] uppercase text-[var(--muted)] max-w-[22ch]">
          {label}
        </span>
      )}
    </div>
  )
}
