import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT, EASE_SMOOTH } from '../lib/easings'

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const lineTopRef = useRef(null)
  const lineBottomRef = useRef(null)
  const lineLeftRef = useRef(null)
  const lineRightRef = useRef(null)
  const counterRef = useRef(null)
  const labelRef = useRef(null)
  const panelRef = useRef(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDone(true)
      onComplete?.()
      return
    }

    const counterObj = { val: 0 }
    const lines = [lineTopRef.current, lineBottomRef.current, lineLeftRef.current, lineRightRef.current]

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          setDone(true)
          onComplete?.()
        },
      })

      gsap.set(lines, { scaleX: (i) => (i < 2 ? 0 : 1), scaleY: (i) => (i < 2 ? 1 : 0) })

      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: EASE_DRAFT }
      )

      tl.to(
        lines,
        { scaleX: 1, scaleY: 1, duration: 0.6, ease: EASE_DRAFT, stagger: 0.06 },
        '<0.1'
      )

      tl.to(
        counterObj,
        {
          val: 100,
          duration: 1.0,
          ease: EASE_SMOOTH,
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.floor(counterObj.val)).padStart(3, '0')
            }
          },
        },
        '<'
      )

      tl.to(panelRef.current, { opacity: 0, duration: 0.3, ease: EASE_DRAFT }, '+=0.15')

      tl.to(
        root,
        { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power4.inOut' },
        '<0.05'
      )
    }, root)

    return () => ctx.revert()
  }, [onComplete])

  if (done) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[20000] flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg)', clipPath: 'inset(0 0 0% 0)' }}
      aria-hidden="true"
    >
      <div ref={panelRef} className="relative flex flex-col items-center">
        <div className="relative flex flex-col items-center px-10 py-8">
          <div
            ref={labelRef}
            className="font-['JetBrains_Mono'] text-[0.7rem] tracking-[0.08em] uppercase"
            style={{ color: 'var(--muted)', opacity: 0 }}
          >
            Drafting the page
          </div>

          <div
            ref={counterRef}
            className="font-['Clash_Display'] font-semibold text-[3rem] leading-none mt-3"
            style={{ color: 'var(--paper)' }}
          >
            000
          </div>

          <div
            ref={lineTopRef}
            className="absolute top-0 left-0 w-full"
            style={{ height: '1px', backgroundColor: 'var(--accent)', transformOrigin: '0% 50%' }}
          />
          <div
            ref={lineBottomRef}
            className="absolute bottom-0 left-0 w-full"
            style={{ height: '1px', backgroundColor: 'var(--accent)', transformOrigin: '100% 50%' }}
          />
          <div
            ref={lineLeftRef}
            className="absolute top-0 left-0 h-full"
            style={{ width: '1px', backgroundColor: 'var(--accent)', transformOrigin: '50% 0%' }}
          />
          <div
            ref={lineRightRef}
            className="absolute top-0 right-0 h-full"
            style={{ width: '1px', backgroundColor: 'var(--accent)', transformOrigin: '50% 100%' }}
          />
        </div>
      </div>
    </div>
  )
}
