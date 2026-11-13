import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

/**
 * Shared <Canvas> wrapper for all 3D scenes.
 * Performance-first:
 *  - dpr capped [1, 1.75] (retina burn is the #1 GPU cost)
 *  - antialias off (bloom + soft shapes hide edges anyway)
 *  - high-performance GPU hint, alpha canvas (page bg shows through)
 *  - AdaptiveDpr/AdaptiveEvents auto-throttle under load
 *  - frameloop switches to "never" when the canvas is offscreen (IntersectionObserver),
 *    so a scrolled-past scene costs zero GPU.
 */
export default function Scene3D({ children, camera, className = '', ...props }) {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '120px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={camera || { position: [0, 0, 6], fov: 45 }}
        {...props}
      >
        <Suspense fallback={null}>{children}</Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}
