import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { isInteractive } from './useRipple'

/**
 * Mouse-driven perspective tilt for cards/images.
 * Adds depth (rotateX/rotateY + translateZ lift), a pointer-tracked glare
 * sheen, and a dynamic soft shadow that grows with tilt angle.
 * Disabled on touch / reduced-motion / small screens.
 *
 * The glare element is created internally and layered above content; pass
 * `glareRef` to control its stacking, or leave undefined to auto-append.
 *
 * @param {Object} options
 * @param {number} options.max - max rotation in degrees (default 8)
 * @param {number} options.scale - hover scale (default 1.02)
 * @param {number} options.perspective - CSS perspective in px (default 900)
 * @param {number} options.lift - translateZ in px on hover (default 0)
 * @param {boolean} options.glare - render a pointer-tracked sheen (default true)
 * @param {boolean} options.shadow - animate box-shadow with tilt (default true)
 */
export default function useTilt3D(options = {}) {
  const ref = useRef(null)
  const {
    max = 8,
    scale = 1.02,
    perspective = 900,
    lift = 0,
    glare = true,
    shadow = true,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!isInteractive()) return

    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    let glareEl = null
    if (glare) {
      glareEl = document.createElement('span')
      glareEl.setAttribute('aria-hidden', 'true')
      Object.assign(glareEl.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        background:
          'radial-gradient(220px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.12), transparent 60%)',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        mixBlendMode: 'soft-light',
        willChange: 'background',
        zIndex: '5',
      })
      el.appendChild(glareEl)
    }

    const quickRotateX = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' })
    const quickRotateY = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' })
    const quickScale = gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' })
    const quickZ = lift ? gsap.quickTo(el, 'z', { duration: 0.5, ease: 'power3.out' }) : null

    gsap.set(el, { transformPerspective: perspective })

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height

      const rotateY = (px - 0.5) * max * 2
      const rotateX = (0.5 - py) * max * 2

      quickRotateX(rotateX)
      quickRotateY(rotateY)
      quickScale(scale)
      if (quickZ) quickZ(lift)

      if (glareEl) {
        glareEl.style.setProperty('--gx', `${px * 100}%`)
        glareEl.style.setProperty('--gy', `${py * 100}%`)
        glareEl.style.opacity = '1'
      }

      if (shadow) {
        const dist = Math.min(40, Math.hypot(rotateX, rotateY) * 2.4)
        el.style.boxShadow = `0 ${10 + dist * 0.6}px ${20 + dist}px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,90,31,0.06)`
      }
    }

    const handleLeave = () => {
      quickRotateX(0)
      quickRotateY(0)
      quickScale(1)
      if (quickZ) quickZ(0)
      if (glareEl) glareEl.style.opacity = '0'
      if (shadow) el.style.boxShadow = ''
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      if (glareEl) glareEl.remove()
      el.style.boxShadow = ''
    }
  }, [max, scale, perspective, lift, glare, shadow])

  return ref
}
