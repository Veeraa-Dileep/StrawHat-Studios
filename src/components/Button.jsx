import { useState, useRef } from 'react'
import useMagnetic from '../hooks/useMagnetic'
import useRipple from '../hooks/useRipple'

/**
 * Primary/secondary CTA.
 * - Magnetic pull (whole element travels toward cursor, subtle rotation)
 * - Ripple on pointer-down (spawns at click point)
 * - Hover sweep fill with a slight skew "morph"
 * - Cursor-tracked accent glow inside the button
 */
export default function Button({ children, href, variant = 'primary', className = '', ...props }) {
  const [hovered, setHovered] = useState(false)
  const magneticRef = useMagnetic({ strength: 0.35, rotate: 4 })
  const rippleRef = useRipple({ color: 'rgba(255, 90, 31, 0.30)' })
  const glowRef = useRef(null)

  const baseClasses = `group relative inline-flex min-h-[44px] items-center justify-center overflow-hidden px-8 py-3 text-[0.875rem] font-['JetBrains_Mono'] tracking-[0.04em] uppercase transition-colors duration-[200ms] ease-in-out active:scale-[0.98] ${className}`

  const isPrimary = variant === 'primary'
  const style = isPrimary
    ? { border: '1px solid var(--accent)', color: hovered ? 'var(--bg)' : 'var(--accent)' }
    : { border: '1px solid var(--line)', color: hovered ? 'var(--paper)' : 'var(--muted)' }

  const inner = (
    <>
      {/* cursor-tracked glow */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isPrimary
            ? 'radial-gradient(120px circle at var(--mx,50%) var(--my,50%), rgba(255,90,31,0.22), transparent 65%)'
            : 'radial-gradient(120px circle at var(--mx,50%) var(--my,50%), rgba(242,240,235,0.12), transparent 65%)',
        }}
      />
      {/* sweep fill with morph skew */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 transition-transform duration-[350ms] ease-out group-hover:scale-x-100 group-hover:skew-x-[-6deg]"
        style={{ backgroundColor: isPrimary ? 'var(--accent)' : 'var(--surface)', transformOrigin: 'left center' }}
      />
      <span className="relative z-10">{children}</span>
    </>
  )

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (glowRef.current) {
      glowRef.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      glowRef.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
  }

  const setRefs = (node) => {
    magneticRef.current = node
    rippleRef.current = node
  }

  const commonProps = {
    ref: setRefs,
    'data-cursor': 'view',
    className: baseClasses,
    style,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onMouseMove: onMove,
    ...props,
  }

  if (href) {
    return (
      <a href={href} {...commonProps}>
        {inner}
      </a>
    )
  }

  return (
    <button type="button" {...commonProps}>
      {inner}
    </button>
  )
}
