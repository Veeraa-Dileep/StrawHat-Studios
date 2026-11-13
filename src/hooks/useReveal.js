import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'

/**
 * Scroll-in reveal for a visual element: clip-path wipe + opacity/translate.
 * Always reveals (even under reduced-motion, just without the wipe).
 *
 * @param {Object} options
 * @param {React.Ref} options.scope - optional scope ref for useGSAP-style cleanup
 * @param {string} options.from - starting clip-path (default inset(0 100% 0 0))
 * @param {number} options.duration - reveal duration (default 0.8)
 * @param {number} options.start - ScrollTrigger start (default 'top 80%')
 */
export default function useReveal(options = {}) {
  const ref = useRef(null)
  const { from = 'inset(0 100% 0 0)', duration = 0.8, start = 'top 80%' } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(el, { clipPath: 'inset(0 0% 0 0)', opacity: 1 })
        return
      }
      gsap.fromTo(
        el,
        { clipPath: from, opacity: 0.4 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration,
          ease: EASE_DRAFT,
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [from, duration, start])

  return ref
}
