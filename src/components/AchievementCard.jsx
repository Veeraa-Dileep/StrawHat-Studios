import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import Icon from './Icon'
import useTilt3D from '../hooks/useTilt3D'

export default function AchievementCard({ title, detail, icon }) {
  const ref = useRef(null)
  const tiltRef = useTilt3D({ max: 7, scale: 1.0, lift: 24, shadow: true })

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.6, ease: EASE_DRAFT, scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
          )
          const ic = el.querySelector('[data-icon="draw"]')
          if (ic) {
            gsap.fromTo(
              ic,
              { scale: 0.4, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
            )
          }
        }, el)
        return () => ctx.revert()
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(el, { opacity: 1, y: 0 })
        gsap.set(el.querySelector('[data-icon="draw"]'), { opacity: 1, scale: 1 })
      })
    },
    { scope: ref }
  )

  return (
    <article
      ref={ref}
      data-cursor="view"
      className="group rounded-xl p-6 transition-[border-color,box-shadow] duration-300 will-change-transform"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lift), var(--shadow-accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <div ref={tiltRef} style={{ transformStyle: 'preserve-3d' }}>
        <span className="mb-4 inline-flex text-[var(--accent)]">
          <Icon name={icon} size={26} animated />
        </span>
        <h4
          className="font-['Clash_Display'] font-semibold text-[1.25rem] leading-[1.15] text-[var(--paper)] mb-2"
          style={{ transform: 'translateZ(24px)' }}
        >
          {title}
        </h4>
        <p className="text-[0.95rem] text-[var(--muted)] leading-[1.6]">{detail}</p>
      </div>
    </article>
  )
}
