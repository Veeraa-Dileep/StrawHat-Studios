// ─────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all deploy-specific strings.
// Swap these placeholders once and every consumer updates:
//   • index.html  (title/description/OG/Twitter/canonical/JSON-LD)  ← injected at build
//   • public/robots.txt + public/sitemap.xml                        ← injected at build
//   • src/sections/Contact.jsx (email + social links)               ← imported
//   • src/data/projects.js (project links)                          ← imported
// No build-plugin restart needed for the imported consumers (HMR); the
// HTML/robots/sitemap injection applies on the next `vite build` / dev start.
// ─────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: 'Straw Hat Studios',
  domain: 'thestrawhatstudios.com',
  url: 'https://thestrawhatstudios.com/',
  email: 'strawhatstudios25@gmail.com',
  linkedin: 'https://linkedin.com/in/dileepveeraa',
  ogImage: 'https://thestrawhatstudios.com/og-cover.png',
  title: 'Straw Hat Studios — Websites for Consultants & Coaches',
  description:
    'Custom websites for independent consultants, fractional executives and coaches — designed, built and launched end to end, domain and hosting included.',
  descriptionShort:
    'Custom websites for consultants, fractional executives and coaches — one studio, full build, zero handoffs.',
}

export default SITE
