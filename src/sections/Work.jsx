import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT, DURATION_REVEAL } from '../lib/easings'
import SectionTransition from '../components/SectionTransition'
import ProjectShowcase from '../components/ProjectShowcase'
import { PROJECTS } from '../data/projects'

export default function Work() {
  const headlineRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DURATION_REVEAL, ease: EASE_DRAFT, scrollTrigger: { trigger: headlineRef.current, start: 'top 85%', once: true } }
        )
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(headlineRef.current, { opacity: 1, y: 0 })
      })
    },
    { scope: headlineRef }
  )

  return (
    <SectionTransition
      index={1}
      id="work"
      bg="var(--bg)"
      className="py-[160px] max-lg:py-[80px] px-6 lg:px-10"
    >
      <div className="max-w-[1400px] mx-auto">
        <h2
          ref={headlineRef}
          data-reveal
          className="font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] mb-16 max-lg:mb-10"
        >
          Selected Work
        </h2>

        {PROJECTS.map((project) => (
          <ProjectShowcase key={project.id} project={project} />
        ))}
      </div>
    </SectionTransition>
  )
}
