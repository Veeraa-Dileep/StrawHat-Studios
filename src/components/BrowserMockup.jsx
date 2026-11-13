import { forwardRef } from 'react'

/**
 * Reusable browser-window frame. Decorative chrome (traffic lights + URL bar)
 * is aria-hidden; the generated visual is passed as children. The forwarded ref
 * is attached to the body so a 3D tilt can be applied by the parent.
 */
const BrowserMockup = forwardRef(function BrowserMockup({ url = '', accent = 'var(--accent)', children, className = '' }, ref) {
  const host = typeof url === 'string' && url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'localhost'

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{ border: '1px solid var(--line)', backgroundColor: 'var(--bg)', transformStyle: 'preserve-3d' }}
    >
      {/* Chrome */}
      <div
        aria-hidden="true"
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface)' }}
      >
        <span className="flex gap-1.5">
          <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--line)' }} />
          <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--line)' }} />
          <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--line)' }} />
        </span>
        <span
          className="ml-3 flex-1 truncate rounded-md px-3 py-1 font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.04em]"
          style={{ border: '1px solid var(--line)', color: 'var(--muted)' }}
        >
          {host}
        </span>
      </div>

      {/* Body (tiltable) */}
      <div ref={ref} className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  )
})

export default BrowserMockup
