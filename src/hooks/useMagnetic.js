import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { isInteractive } from './useRipple'

/**
 * Magnetic hover effect — the element (or an inner label) is gently pulled
 * toward the cursor within a padded radius, then snaps back on leave.
 * Adds a subtle rotation toward the cursor for a more "alive" feel.
 *
 * @param {Object} options
 * @param {number} options.strength - travel toward cursor (0-1, default 0.35)
 * @param {number} options.radius - extra px around element that triggers pull (default 24)
 * @param {boolean} options.pullContent - pull the first child instead of the whole element
 * @param {number} options.rotate - max rotation in deg toward cursor (default 0)
 */
export default function useMagnetic(options = {}) {
  const ref = useRef(null)
  const { strength = 0.35, radius = 24, pullContent = false, rotate = 0 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!isInteractive()) return

    const target = pullContent ? el.firstElementChild || el : el
    target.style.willChange = 'transform'

    const quickX = gsap.quickTo(target, 'x', { duration: 0.5, ease: 'power3.out' })
    const quickY = gsap.quickTo(target, 'y', { duration: 0.5, ease: 'power3.out' })
    const quickR = rotate ? gsap.quickTo(target, 'rotation', { duration: 0.5, ease: 'power3.out' }) : null

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      quickX(dx * strength)
      quickY(dy * strength)
      if (quickR) quickR((dx / (rect.width / 2)) * rotate)
    }

    const handleLeave = () => {
      quickX(0)
      quickY(0)
      if (quickR) quickR(0)
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [strength, radius, pullContent, rotate])

  return ref
}
