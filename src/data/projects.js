import { SITE } from '../config/site'

export const PROJECTS = [
  {
    id: 'A.01',
    name: 'Fuel Studios',
    initials: 'FS',
    desc: "Client site for a marketing agency — an animation-led brand presence",
    problem: 'A marketing agency needed a site as sharp as the work it ships: clear positioning and confident motion from the first scroll.',
    approach: 'Designed and built a fully custom, scroll-choreographed landing page with launch-ready setup (social previews, structured data, sitemap) and deployed it live.',
    result: 'A live production site at fuelstudios.in.',
    stack: ['React', 'Tailwind', 'GSAP', 'ScrollTrigger'],
    image: '/work/fuel.webp',
    url: 'https://fuelstudios.in',
    accent: '#FF5A1F',
  },
  {
    id: 'A.02',
    name: 'Straw Hat Studios',
    initials: 'SH',
    desc: "Our own studio site — the page you're on, built end to end",
    problem: 'A new studio needed a site that proves its pitch on its own: premium, fast, and clear to a prospect who lands on it cold.',
    approach: 'Designed and built from a single brand system: a WebGL hero, scroll-choreographed sections and a transparent pricing section.',
    result: "The live site you're on — our own build, end to end.",
    stack: ['React', 'Tailwind', 'GSAP', 'Three.js'],
    image: '/work/shstudios.webp',
    url: SITE.url,
    current: true,
    accent: '#FF5A1F',
  },
]
