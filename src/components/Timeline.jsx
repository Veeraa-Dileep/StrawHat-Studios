import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import Icon from './Icon'

/**
 * Reusable vertical timeline with a scroll-drawn SVG spine. The spine draws
 * (strokeDashoffset) on scroll via a scrubbed ScrollTrigger; each node reveals
 * with an icon pop. No progress bars. Reduced-motion safe.
 */
export default function Timeline({ items = [], accent = 'var(--accent)' }) {
  const rootRef = useRef(null)
  const spineRef = useRef(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const spine = spineRef.current
      if (!root || !spine) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          const len = spine.getTotalLength ? spine.getTotalLength() : 1000
          gsap.set(spine, { strokeDasharray: len, strokeDashoffset: len })
          gsap.to(spine, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top 70%', end: 'bottom 80%', scrub: 0.6 },
          })

          root.querySelectorAll('[data-node]').forEach((node) => {
            gsap.fromTo(
              node,
              { opacity: 0, x: -16 },
              {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: EASE_DRAFT,
                scrollTrigger: { trigger: node, start: 'top 82%', once: true },
              }
            )
            const ic = node.querySelector('[data-icon="draw"]')
            if (ic) {
              gsap.fromTo(
                ic,
                { scale: 0.4, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', scrollTrigger: { trigger: node, start: 'top 82%', once: true } }
              )
            }
          })
        }, root)
        return () => ctx.revert()
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (spine.getTotalLength) gsap.set(spine, { strokeDashoffset: 0 })
        gsap.set(root.querySelectorAll('[data-node], [data-icon="draw"]'), { opacity: 1, x: 0, scale: 1 })
      })
    },
    { scope: rootRef }
  )

  return (
    <ol ref={rootRef} className="relative pl-10 lg:pl-14">
      {/* Spine */}
      <svg
        className="pointer-events-none absolute left-[14px] lg:left-[22px] top-2 bottom-2"
        width="2"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <line
          ref={spineRef}
          x1="1"
          y1="0"
          x2="1"
          y2="100%"
          stroke="var(--accent)"
          strokeWidth="1.5"
          style={{ strokeDasharray: '100%' }}
        />
      </svg>

      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} data-node className="relative mb-12 last:mb-0">
          {/* Node dot */}
          <span
            className="absolute -left-[34px] lg:-left-[46px] top-1 grid h-6 w-6 place-items-center rounded-full"
            style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--bg)' }}
          >
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          </span>

          <div className="flex items-start gap-4">
            <span className="mt-1 text-[var(--accent)]" style={{ color: accent }}>
              <Icon name={item.icon || 'spark'} size={22} animated />
            </span>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] text-[var(--muted)]">
                  {item.year}
                </span>
                <h4 className="font-['Clash_Display'] font-semibold text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.1] text-[var(--paper)]">
                  {item.title}
                </h4>
              </div>
              <p className="font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.06em] uppercase text-[var(--accent)] mt-1">
                {item.subtitle}
              </p>
              <p className="text-[1rem] text-[var(--muted)] leading-[1.6] mt-2 max-w-[52ch]">{item.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
