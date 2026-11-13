import { useRef, useState } from 'react'
import useMagnetic from '../hooks/useMagnetic'
import { isInteractive } from '../hooks/useRipple'

/**
 * Interactive skill chip: hover/focus reveals a popover with level + related tools.
 * Magnetic micro-interaction on the chip. No progress bars. Touch: tap toggles.
 * Keyboard accessible (button + aria-describedby).
 */
export default function SkillChip({ name, level, tools = [] }) {
  const magneticRef = useMagnetic({ strength: 0.25 })
  const [open, setOpen] = useState(false)
  const popId = `skill-pop-${name.replace(/\s+/g, '-').toLowerCase()}`

  // On touch, rely on tap/focus only — mouseenter/leave can cancel the tap-open.
  const onEnter = () => { if (isInteractive()) setOpen(true) }
  const onLeave = () => { if (isInteractive()) setOpen(false) }

  return (
    <div className="relative inline-block">
      <button
        ref={magneticRef}
        type="button"
        data-cursor="view"
        aria-describedby={popId}
        aria-expanded={open}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="font-['JetBrains_Mono'] text-[0.8rem] tracking-[0.04em] uppercase px-4 py-2.5 min-h-[44px] transition-colors duration-200"
        style={{ border: '1px solid var(--line)', color: 'var(--paper)', borderRadius: '9999px' }}
      >
        {name}
      </button>

      <div
        id={popId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 w-56 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg p-4 will-change-transform"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--accent)',
          opacity: open ? 1 : 0,
          transform: `translate(-50%, ${open ? '0' : '6px'})`,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-['Clash_Display'] font-semibold text-[1rem] text-[var(--paper)]">{name}</span>
          <span className="font-['JetBrains_Mono'] text-[0.65rem] tracking-[0.08em] uppercase text-[var(--accent)]">
            {level}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tools.map((t) => (
            <span
              key={t}
              className="font-['JetBrains_Mono'] text-[0.65rem] tracking-[0.04em] text-[var(--muted)] px-2 py-0.5"
              style={{ border: '1px solid var(--line)', borderRadius: '9999px' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
