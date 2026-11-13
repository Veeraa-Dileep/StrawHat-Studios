import { forwardRef, useEffect, useRef } from 'react'

/**
 * Lightweight canvas 2D particle + floating-light system.
 * - One rAF loop, capped particle count, DPR-aware (<=2).
 * - Exposes start/stop/setIdle/setPointer via the forwarded ref API.
 * - Particles drift; those near the pointer are gently repelled (interactive).
 * - Draws small drifting particles + a few larger soft "floating lights".
 * - No DOM nodes; compositor-friendly; paused when offscreen/idle/reduced-motion.
 */
const Particles = forwardRef(function Particles({ count = 42, className = '' }, apiRef) {
  const canvasRef = useRef(null)
  const localApi = useRef({ stop: () => {}, start: () => {}, setIdle: () => {}, setPointer: () => {} })
  const getApi = () => (apiRef && typeof apiRef === 'object' ? apiRef : localApi)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    // Low-end / touch devices: fewer particles, smaller lights, lighter DPR.
    const lowPower = isTouch
    const dprCap = lowPower ? 1.5 : 2
    const particleCount = lowPower ? Math.round(count * 0.5) : count
    const lightScale = lowPower ? 0.6 : 1
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    let w = 0
    let h = 0

    const pointer = { x: -9999, y: -9999, active: false }
    const REPEL_RADIUS = 120
    const REPEL_FORCE = 0.6

    const particles = []
    const lights = []

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      particles.length = 0
      lights.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.6,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          a: Math.random() * 0.35 + 0.1,
          ox: 0, oy: 0,
        })
      }
      // A few floating lights (large, slow, soft).
      for (let i = 0; i < 3; i++) {
        lights.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.random() * 90 + 70) * lightScale,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          hue: i % 2 === 0 ? '255,90,31' : '120,150,255',
        })
      }
    }

    resize()
    seed()

    let raf = null
    let running = false
    let idle = false

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Floating lights (soft radial gradients).
      for (const l of lights) {
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
        g.addColorStop(0, `rgba(${l.hue},0.10)`)
        g.addColorStop(1, `rgba(${l.hue},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2)
        ctx.fill()
        if (!idle) {
          l.x += l.vx
          l.y += l.vy
          if (l.x < -l.r) l.x = w + l.r
          if (l.x > w + l.r) l.x = -l.r
          if (l.y < -l.r) l.y = h + l.r
          if (l.y > h + l.r) l.y = -l.r
        }
      }

      // Particles (with pointer repulsion).
      ctx.fillStyle = 'rgba(242,240,235,1)'
      for (const p of particles) {
        if (!idle && pointer.active && !prefersReduced) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
            p.x += (dx / dist) * f * 4
            p.y += (dy / dist) * f * 4
          }
        }
        if (!idle) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0
        }
        ctx.globalAlpha = p.a
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Idle throttle: render ~12fps when idle.
      if (idle) {
        raf = setTimeout(() => (raf = requestAnimationFrame(draw)), 80)
      } else {
        raf = requestAnimationFrame(draw)
      }
    }

    const loop = () => {
      if (running) draw()
    }

    const api = getApi()
    api.current = {
      stop: () => {
        running = false
        if (raf) {
          cancelAnimationFrame(raf)
          clearTimeout(raf)
          raf = null
        }
      },
      start: () => {
        if (running || prefersReduced) return
        running = true
        raf = requestAnimationFrame(loop)
      },
      setIdle: (v) => {
        idle = v
      },
      setPointer: (x, y) => {
        pointer.x = x
        pointer.y = y
        pointer.active = true
      },
    }

    const onResize = () => {
      resize()
      seed()
    }
    window.addEventListener('resize', onResize)

    const onPointerMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    if (!isTouch) {
      window.addEventListener('mousemove', onPointerMove)
      window.addEventListener('mouseleave', onPointerLeave)
    }

    // Reduced motion: paint one static frame, no loop.
    if (prefersReduced) {
      draw()
      api.current = { ...api.current, stop: () => {} }
    } else {
      api.current.start()
    }

    return () => {
      api.current.stop()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [count])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
})

export default Particles
