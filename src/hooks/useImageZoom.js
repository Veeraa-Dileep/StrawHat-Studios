import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import { isInteractive } from './useRipple'

/**
 * Hover zoom for an inner visual, clipped by the parent's overflow:hidden.
 * Scales the target 1 -> `scale` on enter, eases back on leave.
 * Disabled under reduced-motion.
 *
 * @param {Object} options
 * @param {number} options.scale - hover scale (default 1.08)
 */
export default function useImageZoom(options = {}) {
  const ref = useRef(null)
  const { scale = 1.08 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!isInteractive()) return

    el.style.willChange = 'transform'
    const quick = gsap.quickTo(el, 'scale', { duration: 0.6, ease: 'power3.out' })

    const enter = () => quick(scale)
    const leave = () => quick(1)

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [scale])

  return ref
}
