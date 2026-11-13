import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let tick = null

export function initLenis() {
  if (lenis) {
    lenis.destroy()
  }
  if (tick) {
    gsap.ticker.remove(tick)
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)

  tick = (time) => {
    if (lenis) lenis.raf(time * 1000)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function destroyLenis() {
  if (tick) {
    gsap.ticker.remove(tick)
    tick = null
  }
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
}

export function getLenis() {
  return lenis
}

export { gsap, ScrollTrigger }
