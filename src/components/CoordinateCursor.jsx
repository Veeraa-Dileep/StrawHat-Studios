import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { isInteractive } from '../hooks/useRipple'

/**
 * Full custom cursor (desktop / fine-pointer only).
 * - Crosshair dot that follows the pointer with a slight lag
 * - Trailing ghosts for a subtle motion trail
 * - Context-aware states driven by [data-cursor]:
 *     default  -> crosshair
 *     link     -> small square (auto-detected on a/button/inputs)
 *     view     -> 64px circle, pulls toward element center, shows label (VIEW or data-cursor-label)
 *     text     -> thin I-bar over text elements
 * - Disabled (native cursor restored) on touch / reduced-motion / < lg.
 */
export default function CoordinateCursor() {
  const cursorRef = useRef(null)
  const labelRef = useRef(null)
  const trailRefs = useRef([])

  useEffect(() => {
    if (!isInteractive()) return

    const cursor = cursorRef.current
    const label = labelRef.current
    if (!cursor || !label) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    document.documentElement.classList.add('has-custom-cursor')

    const trail = trailRefs.current.filter(Boolean).slice(0, 3)
    const durations = [0.12, 0.22, 0.34]
    const quickX = gsap.quickTo(cursor, 'x', { duration: prefersReduced ? 0 : 0.12, ease: 'power3.out' })
    const quickY = gsap.quickTo(cursor, 'y', { duration: prefersReduced ? 0 : 0.12, ease: 'power3.out' })
    const trailQuick = trail.map((t, i) => ({
      x: gsap.quickTo(t, 'x', { duration: durations[i], ease: 'power2.out' }),
      y: gsap.quickTo(t, 'y', { duration: durations[i], ease: 'power2.out' }),
    }))

    let magnetEl = null

    const setState = (mode, el) => {
      magnetEl = mode === 'view' ? el : null
      const base = {
        width: '24px', height: '24px',
        border: '1px solid var(--accent)',
        backgroundColor: 'transparent', borderRadius: '0',
      }
      let next = base
      if (mode === 'link') next = { ...base, width: '14px', height: '14px' }
      else if (mode === 'view') next = { ...base, width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,90,31,0.10)' }
      else if (mode === 'text') next = { ...base, width: '3px', height: '26px', borderRadius: '2px', backgroundColor: 'var(--accent)' }

      gsap.to(cursor, {
        width: next.width, height: next.height, borderRadius: next.borderRadius,
        backgroundColor: next.backgroundColor, border: next.border,
        duration: 0.25, ease: 'power3.out', overwrite: 'auto',
      })
      if (mode === 'view') {
        const text = el?.dataset?.cursorLabel || 'VIEW'
        label.textContent = text
        gsap.to(label, { opacity: 1, duration: 0.2 })
      } else {
        gsap.to(label, { opacity: 0, duration: 0.2 })
      }
    }

    const move = (e) => {
      let tx = e.clientX
      let ty = e.clientY
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        tx = cx + (e.clientX - cx) * 0.25
        ty = cy + (e.clientY - cy) * 0.25
      }
      quickX(tx)
      quickY(ty)
      trailQuick.forEach((q) => { q.x(e.clientX); q.y(e.clientY) })
    }

    const linkSel = 'a, button, [role="button"], input, textarea, select'
    const over = (e) => {
      const t = e.target
      if (t.closest('[data-cursor="view"]')) {
        setState('view', t.closest('[data-cursor="view"]'))
      } else if (t.closest('p, h1, h2, h3, h4, h5, h6, li, span, blockquote')) {
        setState('text', null)
      } else if (t.closest(linkSel)) {
        setState('link', null)
      } else {
        setState('default', null)
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(n) => (trailRefs.current[i] = n)}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[9998] hidden lg:block"
          style={{
            width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px',
            borderRadius: '50%', backgroundColor: 'rgba(255,90,31,0.25)',
            willChange: 'transform',
          }}
        />
      ))}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[10000] hidden items-center justify-center lg:flex"
        style={{
          width: '24px', height: '24px', marginTop: '-12px', marginLeft: '-12px',
          border: '1px solid var(--accent)', borderRadius: '0',
          willChange: 'transform',
        }}
      >
        <span
          ref={labelRef}
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
            letterSpacing: '0.08em', color: 'var(--accent)', opacity: 0,
            transition: 'opacity 0.2s ease', userSelect: 'none',
          }}
        >
          VIEW
        </span>
        <span style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '1px', backgroundColor: 'var(--accent)', transform: 'translate(-50%, -50%)' }} />
        <span style={{ position: 'absolute', top: '50%', left: '50%', width: '1px', height: '100%', backgroundColor: 'var(--accent)', transform: 'translate(-50%, -50%)' }} />
      </div>
      
    </>
  )
}
