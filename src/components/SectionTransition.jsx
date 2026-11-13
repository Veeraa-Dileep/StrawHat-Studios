import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useScrollStage } from '../context/ScrollStage'

/**
 * Wraps a section to:
 *  - cross-fade the page background to `bg` on enter (background transition between chapters)
 *  - report its index to ScrollStage (drives the ChapterIndicator)
 *  - run a one-shot scoped reveal of the section's leading elements
 */
export default function SectionTransition({
  index = 0,
  bg = 'var(--bg)',
  children,
  className = '',
  id,
  sectionName,
  innerRef,
  as: Tag = 'section',
}) {
  const ref = useRef(null)
  const { setActive } = useScrollStage()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      // Background transition: set the shared --bg-section var as this section enters.
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) {
            document.documentElement.style.setProperty('--bg-section', bg)
            setActive(index)
          }
        },
      })

      // One-shot scoped reveal for the section's leading content (its own language lives in children).
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = el.querySelectorAll('[data-reveal]')
        if (targets.length === 0) return
        gsap.fromTo(
          targets,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        )
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        const targets = el.querySelectorAll('[data-reveal]')
        if (targets.length === 0) return
        gsap.set(targets, { opacity: 1, y: 0 })
      })
    },
    { scope: ref }
  )

  return (
    <Tag
      ref={(node) => {
        ref.current = node
        if (innerRef) innerRef.current = node
      }}
      id={id}
      data-section={sectionName}
      className={className}
      style={{ position: 'relative' }}
    >
      {children}
    </Tag>
  )
}
