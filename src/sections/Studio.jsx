import { lazy, Suspense, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import SectionTransition from '../components/SectionTransition'
import StatGrid from '../components/StatGrid'
import AchievementGrid from '../components/AchievementGrid'
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
      bg="var(--bg)"
      className="py-[160px] max-lg:py-[80px] px-6 lg:px-10"
    >
      <div ref={sectionRef} className="max-w-[1400px] mx-auto space-y-[120px] max-lg:space-y-16">
        {/* Studio Mission */}
        <div className="max-w-[60ch]">
          <div className="studio-reveal" style={{ opacity: 0 }}>
            <BlockLabel>STUDIO / 01</BlockLabel>
          </div>
          <h2 className="studio-reveal font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] mb-8" style={{ opacity: 0 }}>
            We build websites that belong on the internet — designed, engineered, and shipped by one studio.
          </h2>
          <div className="space-y-4 text-[1.125rem] text-[var(--muted)] leading-[1.6]">
            <p className="studio-reveal" style={{ opacity: 0 }}>
              No handoffs between design and development. No template debt. No "we'll fix it later." Every project ships with design, front-end build, and technical SEO done by the same hands — so the final product works as a growth asset, not a brochure.
            </p>
            <p className="studio-reveal" style={{ opacity: 0 }}>
              We work with founders and teams who see their website as infrastructure worth investing in. If that sounds like you, let's talk.
            </p>
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
                I started Straw Hat Studios after five years of building websites for small businesses — from local shops to funded startups — and seeing the same gap repeatedly: design agencies that don't code, developers who don't design, and SEO treated as an afterthought.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                I built this studio to close that gap. Every project ships with design, front-end engineering, and technical SEO done by the same hands — no handoffs, no template debt, no "we'll fix it later."
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                The name comes from a simple belief: the best work happens when you're willing to wear the hat, get in the arena, and ship. No spectators.
              </p>
              <p className="studio-reveal" style={{ opacity: 0 }}>
                Before founding the studio, I shipped a scientific journal platform (Indicus Zoologica), built a custom CRM adopted by a sales team (Pyngyn), and delivered a motion-led brand site for a marketing agency (Fuel Studios). Self-taught, B.E. Electronics & Communication — but the real education was shipping.
              </p>
            </div>
          </div>

          {/* 3D ID Card — desktop only */}
          <div className="hidden lg:block w-[800px] h-[1000px] shrink-0 studio-reveal" style={{ opacity: 0, overflow: 'visible' }}>
            {canRender3D() && (
              <Suspense fallback={null}>
                <IDCardScene />
              </Suspense>
            )}
          </div>
        </div>

        {/* Animated statistics */}
        <div className="studio-reveal" style={{ opacity: 0 }}>
          <BlockLabel as="h3">BY THE NUMBERS</BlockLabel>
          <StatGrid />
        </div>

        {/* Achievements */}
        <div className="studio-reveal" style={{ opacity: 0 }}>
          <BlockLabel as="h3">SELECTED ACHIEVEMENTS</BlockLabel>
          <AchievementGrid />
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