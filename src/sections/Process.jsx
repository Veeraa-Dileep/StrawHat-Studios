import { useEffect, useRef, useCallback } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { EASE_DRAFT, EASE_SNAP } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import SectionTransition from '../components/SectionTransition'

const STEPS = [
  {
    id: '01',
    title: 'Design',
    desc: 'Wireframes, moodboards and a design system built around your practice and your voice — never a template.',
  },
  {
    id: '02',
    title: 'Build',
    desc: 'Clean, fast code, with motion that serves the content instead of competing with it.',
  },
  {
    id: '03',
    title: 'Test',
    desc: 'Performance, accessibility and device testing before anything goes live, so launch day is uneventful.',
  },
  {
    id: '04',
    title: 'Launch & Support',
    desc: 'Domain and hosting set up in your name, post-launch fixes, and an optional support window if you want us on call.',
  },
]

export default function Process() {
  const sectionRef = useRef(null)
  const pinnedRef = useRef(null)
  const trackRef = useRef(null)
  const tlRef = useRef(null)
  const ctaRef = useRef(null)

  const setupDesktop = useCallback(() => {
    const section = sectionRef.current
    const pinned = pinnedRef.current
    const track = trackRef.current
    if (!section || !pinned || !track) return null

    const panels = track.querySelectorAll('.process-panel')
    if (!panels.length) return null

    // One quickSetter per panel (deg unit) — created once, reused every tick.
    const setPanels = gsap.utils.toArray(panels).map((panel) =>
      gsap.quickSetter(panel, 'rotateY', 'deg')
    )

    const totalWidth = track.scrollWidth

    gsap.set(track, { perspective: 2400 })
    gsap.set(panels, { transformStyle: 'preserve-3d', transformOrigin: 'center center' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: pinned,
        start: 'top top',
        end: () => `+=${totalWidth - window.innerWidth}`,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: () => {
          const viewportCenter = window.innerWidth / 2
          const vw = window.innerWidth

          // Read phase: all rects first, no interleaved writes.
          const angles = setPanels.map((setRotateY, i) => {
            const rect = panels[i].getBoundingClientRect()
            const distance = (rect.left + rect.width / 2 - viewportCenter) / vw
            const t = gsap.utils.clamp(-1, 1, distance)
            return -4 * Math.sign(t) * Math.pow(Math.abs(t), 1.6)
          })

          // Write phase: one quickSetter call per panel.
          setPanels.forEach((setRotateY, i) => setRotateY(angles[i]))
        },
      },
      defaults: { overwrite: 'auto' },
    })

    tl.to(track, {
      x: () => -(totalWidth - window.innerWidth),
      ease: 'none',
    })

    panels.forEach((panel, i) => {
      if (i < panels.length - 1) {
        const connector = panel.querySelector('.process-connector')
        if (connector) {
          ScrollTrigger.create({
            trigger: panel,
            start: 'left 25%',
            end: 'left -25%',
            onEnter: () => {
              gsap.to(connector, {
                scaleX: 1,
                duration: 0.5,
                ease: EASE_DRAFT,
                overwrite: 'auto',
              })
            },
            once: true,
          })
        }
      }
    })

    tl.call(() => {
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.6, ease: EASE_SNAP, overwrite: 'auto' }
        )
      }
    }, [], '>-=0.3')

    return tl
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        tlRef.current = setupDesktop()
      }, section)

      return () => {
        if (tlRef.current) {
          tlRef.current.scrollTrigger?.kill()
          tlRef.current.kill()
          tlRef.current = null
        }
        ctx.revert()
      }
    })

    mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
      const stackedPanels = trackRef.current?.querySelectorAll('.process-panel') || []
      const ctx = gsap.context(() => {
        stackedPanels.forEach((panel) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 80%',
            onEnter: () => {
              gsap.fromTo(
                panel,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: EASE_DRAFT, overwrite: 'auto' }
              )
            },
            once: true,
          })
        })
      }, section)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [setupDesktop])

  return (
    <SectionTransition index={2} id="process" bg="var(--bg)" className="relative">
      <div ref={sectionRef} className="relative">
        <h2 className="sr-only">Process</h2>
        <div ref={pinnedRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex max-lg:flex-col py-[160px] max-lg:py-[80px] px-6 lg:px-10"
          style={{ gap: '0' }}
        >
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="process-panel min-w-full lg:min-w-[80vw] lg:pr-20 max-lg:mb-16 max-lg:last:mb-0 flex flex-col justify-center"
            >
              <MonoLabel className="text-[var(--muted)] mb-6 block">
                STEP / {step.id}–04
              </MonoLabel>

              <h3 className="font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] mb-4">
                {step.title}
              </h3>

              <p className="text-[1.125rem] text-[var(--muted)] leading-[1.6] max-w-[45ch]">
                {step.desc}
              </p>

              <svg
                className="process-connector mt-10 max-lg:hidden"
                width="200"
                height="2"
                viewBox="0 0 200 2"
                style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)' }}
              >
                <line x1="0" y1="1" x2="200" y2="1" stroke="var(--line)" strokeWidth="1" />
              </svg>
            </div>
          ))}

          <div className="process-panel min-w-full lg:min-w-[60vw] flex flex-col justify-center max-lg:pt-8">
            <p
              ref={ctaRef}
              className="font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] max-w-[12ch]"
            >
              Let's build yours.
            </p>
          </div>
        </div>
        </div>
      </div>
    </SectionTransition>
  )
}
