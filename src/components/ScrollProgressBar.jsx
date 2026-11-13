import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export default function ScrollProgressBar() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        onUpdate: (self) => {
          gsap.set(bar, { scaleX: self.progress })
        },
      })
    }, bar)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: 'var(--accent)',
        transformOrigin: '0% 50%',
        transform: 'scaleX(0)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
