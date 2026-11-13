// ─────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all deploy-specific strings.
// Swap these placeholders once and every consumer updates:
//   • index.html  (title/description/OG/Twitter/canonical/JSON-LD)  ← injected at build
//   • public/robots.txt + public/sitemap.xml                        ← injected at build
//   • src/sections/Contact.jsx (email + social links)               ← imported
//   • src/data/projects.js (GitHub base)                            ← imported
// No build-plugin restart needed for the imported consumers (HMR); the
// HTML/robots/sitemap injection applies on the next `vite build` / dev start.
// ─────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: 'Straw Hat Studios',
  domain: 'strawhatstudios.com',
  url: 'https://strawhatstudios.com/',
  email: 'hello@strawhatstudios.com',
  github: 'https://github.com/dileepveeraa',
  linkedin: 'https://linkedin.com/in/dileepveeraa',
  ogImage: 'https://strawhatstudios.com/og-cover.svg',
  title: 'Straw Hat Studios — Web Design, Front-End & SEO',
  description:
    'Straw Hat Studios builds fast, accessible, SEO-ready websites — design, front-end build, and technical SEO, end to end. One studio, full build, zero handoffs.',
  descriptionShort:
    'Design, front-end build, and technical SEO — one studio, full build, zero handoffs.',
}

export default SITE
