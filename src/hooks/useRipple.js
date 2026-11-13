import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

const noop = () => {}

/** Returns true when fine-pointer + no reduced-motion + desktop width. */
export function isInteractive() {
  if (typeof window === 'undefined') return false
  const fine = window.matchMedia('(pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const wide = window.matchMedia('(min-width: 1024px)').matches
  return fine && !reduced && wide
}

export default function useRipple(options = {}) {
  const ref = useRef(null)
  const { color = 'rgba(255, 90, 31, 0.35)', duration = 0.6 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!isInteractive()) return

    el.style.position = el.style.position || 'relative'
    if (!el.style.overflow || el.style.overflow === 'visible') el.style.overflow = 'hidden'

    const spawn = (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height) * 2.2

      const ripple = document.createElement('span')
      ripple.setAttribute('aria-hidden', 'true')
      Object.assign(ripple.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `${-size / 2}px`,
        marginTop: `${-size / 2}px`,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        transform: 'scale(0)',
        willChange: 'transform, opacity',
        zIndex: '0',
      })
      el.appendChild(ripple)

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 0.5 },
        {
          scale: 1,
          opacity: 0,
          duration,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      )
    }

    el.addEventListener('pointerdown', spawn)
    return () => el.removeEventListener('pointerdown', spawn)
  }, [color, duration])

  return ref
}
