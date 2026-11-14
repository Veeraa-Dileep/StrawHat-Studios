import { lazy, Suspense, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import SectionTransition from '../components/SectionTransition'
import SkillsBoard from '../components/SkillsBoard'
import { canRender3D } from '../lib/capabilities'

const IDCardScene = lazy(() => import('../three/IDCardScene'))

function BlockLabel({ children, as = 'span' }) {
  return (
    <MonoLabel as={as} className="text-[var(--muted)] mb-8 block">
      {children}
    </MonoLabel>
  )
}

export default function Studio() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          section.querySelectorAll('.studio-reveal').forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 28, filter: 'blur(14px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: EASE_DRAFT, scrollTrigger: { trigger: el, start: 'top 82%', once: true } }
            )
          })
        }, section)
        return () => ctx.revert()
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(section.querySelectorAll('.studio-reveal'), { opacity: 1, y: 0, filter: 'blur(0px)' })
      })
    },
    { scope: sectionRef }
  )

  return (
    <SectionTransition
      index={4}
      id="studio"
      bg="var(--bg)"
      className="py-[160px] max-lg:py-[80px] px-6 lg:px-10"
    >
      <div ref={sectionRef} className="max-w-[1400px] mx-auto space-y-[120px] max-lg:space-y-16">
        {/* Studio Mission */}
        <div className="max-lg:max-w-[60ch]">
          <div className="studio-reveal" style={{ opacity: 0 }}>
            <BlockLabel>STUDIO / 01</BlockLabel>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <h2 className="studio-reveal font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] mb-8 lg:mb-0" style={{ opacity: 0 }}>
              A website that carries your reputation — designed, built and launched by one studio.
            </h2>
            <div className="space-y-4 text-[1.125rem] text-[var(--muted)] leading-[1.6]">
              <p className="studio-reveal" style={{ opacity: 0 }}>
                Prospects look you up before they ever book a call. We build the site that holds up in that moment: clear about what you do, credible at a glance, and fast on every device. Design, build, domain and hosting are handled by the same hands, so there's nothing to coordinate and nothing to chase.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                We work with independent consultants, fractional executives, coaches and other expert-led practices. If your work is your reputation, let's talk.
              </p>
            </div>
          </div>
        </div>

        {/* Founder Note with 3D ID Card */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Founder text */}
          <div className="flex-1 max-w-[60ch] border-l-2 border-[var(--accent)] pl-8 -ml-2">
            <div className="studio-reveal" style={{ opacity: 0 }}>
              <BlockLabel>FOUNDER / 01</BlockLabel>
            </div>
            <h3 className="studio-reveal font-['Clash_Display'] font-semibold text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.1] text-[var(--paper)] mb-6" style={{ opacity: 0 }}>
              Dileep Veeraa — Founder
            </h3>
            <div className="space-y-4 text-[1.125rem] text-[var(--muted)] leading-[1.6]">
              <p className="studio-reveal" style={{ opacity: 0 }}>
                I'm Dileep. I trained as a chemical engineer, taught myself to build for the web, and haven't stopped shipping since — a scientific journal platform, a custom CRM a sales team now runs on, and the site for a marketing agency, Fuel Studios.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                I started Straw Hat Studios for people whose work speaks louder than their website does: consultants, coaches and independent experts who are excellent at what they do and tired of a site that undersells it.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                Here, one person owns the whole job — design, build, launch, domain and hosting. No agency layers, no handoffs, and you always know who you're talking to.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                The name is a belief I work by: put the hat on, get in the arena, and ship.
              </p>
            </div>
          </div>

          {/* 3D ID Card — desktop only */}
          <div className="hidden lg:block w-[800px] h-[1000px] shrink-0 lg:-mb-[420px] studio-reveal" style={{ opacity: 0, overflow: 'visible' }}>
            {canRender3D() && (
              <Suspense fallback={null}>
                <IDCardScene />
              </Suspense>
            )}
          </div>
        </div>

        {/* Interactive skills */}
        <div className="studio-reveal" style={{ opacity: 0 }}>
          <BlockLabel as="h3">CAPABILITIES</BlockLabel>
          <SkillsBoard />
        </div>
      </div>
    </SectionTransition>
  )
}