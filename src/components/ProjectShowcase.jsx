import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import MonoLabel from './MonoLabel'
import BrowserMockup from './BrowserMockup'
import TechStack from './TechStack'
import ProjectActions from './ProjectActions'
import useTilt3D from '../hooks/useTilt3D'
import useImageZoom from '../hooks/useImageZoom'
import useReveal from '../hooks/useReveal'

/**
 * One premium "launch card" for a project.
 * - BrowserMockup with generated visual (no external assets)
 * - 3D tilt on hover (desktop, non-reduced-motion)
 * - Hover lift
 * - Animated tech stack
 * - Expandable case-study details (GSAP height toggle, accessible)
 * - Signature clip-path + SVG accent line-draw reveal on scroll
 */
export default function ProjectShowcase({ project }) {
  const cardRef = useRef(null)
  const mockBodyRef = useTilt3D({ max: 6, scale: 1.02, perspective: 1200, lift: 30 })
  const visualRef = useImageZoom({ scale: 1.08 })
  const revealRef = useReveal({ duration: 0.9 })
  const accentLineRef = useRef(null)
  const detailsRef = useRef(null)
  const [open, setOpen] = useState(false)

  // Scroll reveal (Work's signature language): clip-path wipe + accent line draw.
  useGSAP(
    () => {
      const card = cardRef.current
      if (!card) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 78%', once: true },
            defaults: { overwrite: 'auto' },
          })

          const line = accentLineRef.current
          if (line) {
            const len = line.getTotalLength ? line.getTotalLength() : 200
            gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
            tl.to(line, { strokeDashoffset: 0, duration: 0.4, ease: EASE_DRAFT }, 0)
          }

          tl.fromTo(
            mockBodyRef.current,
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: EASE_DRAFT },
            0.1
          )
        }, card)
        return () => ctx.revert()
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (mockBodyRef.current) gsap.set(mockBodyRef.current, { clipPath: 'inset(0 0% 0 0)' })
        if (accentLineRef.current) gsap.set(accentLineRef.current, { strokeDashoffset: 0 })
      })
    },
    { scope: cardRef }
  )

  // Expandable details: animate height via GSAP.
  useGSAP(
    () => {
      const panel = detailsRef.current
      if (!panel) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (open) {
          gsap.set(panel, { height: 'auto', opacity: 1 })
          gsap.from(panel, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
        } else {
          gsap.to(panel, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', overwrite: 'auto' })
        }
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(panel, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 })
      })
    },
    { dependencies: [open], scope: cardRef }
  )

  const detailsId = `details-${project.id}`

  return (
    <article
      ref={cardRef}
      className="group relative mb-[120px] max-lg:mb-[80px] last:mb-0 rounded-2xl p-6 lg:p-10 transition-[border-color,box-shadow] duration-300"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', transformStyle: 'preserve-3d' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lift), var(--shadow-accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <svg className="mb-6 block" width="80" height="2" viewBox="0 0 80 2" fill="none" aria-hidden="true">
        <line ref={accentLineRef} x1="0" y1="1" x2="80" y2="1" stroke="var(--accent)" strokeWidth="1" />
      </svg>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <MonoLabel className="text-[var(--muted)] mb-3 block">SHEET / {project.id}</MonoLabel>

          <h3 className="font-['Clash_Display'] font-semibold text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[1.1] text-[var(--paper)] mb-4">
            {project.name}
          </h3>

          <p className="text-[1rem] text-[var(--muted)] mb-6 leading-[1.5]">{project.desc}</p>

          <TechStack stack={project.stack} />

          <ProjectActions name={project.name} url={project.current ? null : project.url} />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailsId}
            data-cursor="view"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-['JetBrains_Mono'] text-[0.8rem] tracking-[0.04em] uppercase text-[var(--accent)]"
          >
            {open ? 'Hide case study' : 'View case study'}
            <span className="inline-block transition-transform duration-200" style={{ transform: open ? 'rotate(45deg)' : 'none' }}>
              +
            </span>
          </button>
        </div>

        <div>
          <BrowserMockup ref={mockBodyRef} url={project.url} accent={project.accent}>
            <div
              ref={(n) => {
                visualRef.current = n
                revealRef.current = n
              }}
              className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
              style={{
                background: `radial-gradient(120% 120% at 30% 20%, ${project.accent}33, transparent 60%), var(--surface)`,
              }}
            >
              {project.image ? (
                <img
                  src={project.image}
                  alt={`${project.name} — ${project.desc}`}
                  width={1440}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="text-center">
                  <div
                    className="font-['Clash_Display'] font-bold leading-none"
                    style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: 'var(--paper)' }}
                  >
                    {project.initials}
                  </div>
                  <MonoLabel className="mt-3 text-[var(--muted)]">{project.name}</MonoLabel>
                </div>
              )}
            </div>
          </BrowserMockup>
        </div>
      </div>

      <div
        id={detailsId}
        ref={detailsRef}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
        className="text-[1rem] text-[var(--paper)] leading-[1.6] space-y-3"
      >
        <div className="pt-8">
          <p><strong className="font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] text-[var(--muted)]">Problem:</strong> {project.problem}</p>
          <p><strong className="font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] text-[var(--muted)]">Approach:</strong> {project.approach}</p>
          <p className="text-[var(--accent)]"><strong className="font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] text-[var(--muted)]">Result:</strong> {project.result}</p>
        </div>
      </div>
    </article>
  )
}
