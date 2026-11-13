import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { EASE_SMOOTH, EASE_DRAFT } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import Button from '../components/Button'
import SectionTransition from '../components/SectionTransition'
import { canRender3D } from '../lib/capabilities'
import { SITE } from '../config/site'

// Holographic sphere backdrop — lazy + gated (never loads on mobile/reduced-motion).
const ContactScene = lazy(() => import('../three/ContactScene'))

function ContactBackdrop3D() {
  const [use3D, setUse3D] = useState(false)
  useEffect(() => {
    setUse3D(canRender3D())
  }, [])
  if (!use3D) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      style={{ opacity: 0.9 }}
    >
      <Suspense fallback={null}>
        <ContactScene />
      </Suspense>
    </div>
  )
}

export default function Contact() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const methodRef = useRef(null)
  const ctaRef = useRef(null)
  const footerRef = useRef(null)
  const gridLinesRef = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const mm = gsap.matchMedia()

    // Contact's language: SVG GRID DRAW + SCALE-IN CTA (distinct from others).
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
          defaults: { overwrite: 'auto' },
        })

        gridLinesRef.current.forEach((line, i) => {
          if (line) {
            const length = line.getTotalLength ? line.getTotalLength() : 200
            gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
            tl.to(line, { strokeDashoffset: 0, duration: 0.4, ease: EASE_DRAFT, delay: i * 0.03 }, 0)
          }
        })

        tl.fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE_DRAFT }, 0.3)
        tl.fromTo(methodRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE_DRAFT }, 0.5)
        tl.fromTo(ctaRef.current, { opacity: 0, scale: 0.92, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: EASE_SMOOTH }, 0.65)
        tl.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE_DRAFT }, 0.85)
      }, section)
      return () => ctx.revert()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(
        [headlineRef.current, methodRef.current, ctaRef.current, footerRef.current, ...gridLinesRef.current],
        { opacity: 1, y: 0, scale: 1, strokeDashoffset: 0 }
      )
    })

    return () => mm.revert()
  }, [])

  return (
    <SectionTransition
      index={5}
      bg="var(--bg)"
      className="relative min-h-[100svh] flex flex-col items-center justify-center py-[160px] max-lg:py-[80px] px-6"
    >
      <div ref={sectionRef} className="contents">
        <ContactBackdrop3D />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
          style={{ opacity: 0.05 }}
          aria-hidden="true"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              ref={(el) => { gridLinesRef.current[i] = el }}
              x1={`${(100 / 12) * (i + 1)}%`}
              y1="0"
              x2={`${(100 / 12) * (i + 1)}%`}
              y2="100%"
              stroke="var(--line)"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="text-center relative z-10" style={{ maxWidth: '800px' }}>
          <h2
            ref={headlineRef}
            className="font-['Clash_Display'] font-bold text-[clamp(2.75rem,7.5vw,7.5rem)] leading-[0.95] text-[var(--paper)] mb-8"
          >
            Let's build something.
          </h2>

          <p
            ref={methodRef}
            className="text-[1.125rem] text-[var(--muted)] mb-8"
          >
            {SITE.email}
          </p>

          <div ref={ctaRef}>
            <Button href={`mailto:${SITE.email}`}>Start a conversation</Button>
          </div>
        </div>

        <footer
          ref={footerRef}
          className="absolute bottom-6 left-6 right-6 flex justify-between items-center max-w-[1400px] mx-auto max-lg:static max-lg:mt-16 max-lg:justify-center max-lg:gap-10"
        >
          <MonoLabel className="text-[var(--muted)]">
            END / 01.00
          </MonoLabel>

          <div className="flex gap-2 max-lg:gap-4">
            <a
              href={SITE.github}
              aria-label="GitHub profile"
              className="inline-flex min-h-[44px] items-center font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.08em] text-[var(--muted)] uppercase hover:text-[var(--accent)] transition-colors duration-200 px-2"
            >
              GitHub
            </a>
            <a
              href={SITE.linkedin}
              aria-label="LinkedIn profile"
              className="inline-flex min-h-[44px] items-center font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.08em] text-[var(--muted)] uppercase hover:text-[var(--accent)] transition-colors duration-200 px-2"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </SectionTransition>
  )
}
