import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE } from './src/config/site.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Injects all deploy-specific SEO strings into index.html from src/config/site.js,
 * and regenerates public/robots.txt + public/sitemap.xml on build. One-line swap.
 */
function siteConfigPlugin() {
  return {
    name: 'site-config-inject',
    transformIndexHtml(html) {
      const jsonld = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: SITE.name,
        url: SITE.url,
        email: SITE.email,
        description: 'Web design, front-end development, and technical SEO for small businesses.',
        areaServed: 'Worldwide',
        makesOffer: [
          { '@type': 'Offer', name: 'Web Design' },
          { '@type': 'Offer', name: 'Front-End Development' },
          { '@type': 'Offer', name: 'Technical SEO' },
        ],
        sameAs: [SITE.github, SITE.linkedin],
      })

      return html
        .replace(/%SITE_TITLE%/g, SITE.title)
        .replace(/%SITE_DESCRIPTION%/g, SITE.description)
        .replace(/%SITE_DESCRIPTION_SHORT%/g, SITE.descriptionShort)
        .replace(/%SITE_URL%/g, SITE.url)
        .replace(/%SITE_OG_IMAGE%/g, SITE.ogImage)
        .replace(/%SITE_JSONLD%/g, jsonld)
    },
    buildStart() {
      const pub = resolve(__dirname, 'public')
      mkdirSync(pub, { recursive: true })
      writeFileSync(
        resolve(pub, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}sitemap.xml\n`
      )
      const today = new Date().toISOString().slice(0, 10)
      writeFileSync(
        resolve(pub, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), siteConfigPlugin()],
  build: {
    // Keep the heavy, conditionally-loaded 3D chunks OUT of <head> modulepreload
    // so mobile / reduced-motion / no-WebGL visitors never download Three.js.
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((d) => !/(^|\/)(three|r3f|ogl|rapier)-/.test(d)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Pin Vite/Rollup internal helpers (incl. __vitePreload) to the
          // always-loaded react chunk. Otherwise Rollup can park them inside the
          // heavy three chunk, forcing every page to download Three.js for a
          // shared helper. The preload-helper id is a virtual module ("\0vite/preload-helper").
          if (id.includes('preload-helper') || id.includes('commonjsHelpers')) return 'react'
          if (!id.includes('node_modules')) return
          // React runtime stays in its own always-loaded chunk so it is never
          // pulled into the heavy r3f chunk (which would drag three onto mobile).
          if (/[\\/]react(-dom)?[\\/]|[\\/]react[\\/]jsx-runtime/.test(id)) return 'react'
          if (id.includes('scheduler')) return 'react'
          if (id.includes('ogl')) return 'ogl'
          if (id.includes('three')) return 'three'
          if (id.includes('rapier') || id.includes('dimforge')) return 'rapier'
          if (
            id.includes('@react-three') ||
            id.includes('postprocessing') ||
            id.includes('@react-spring') ||
            id.includes('zustand') ||
            id.includes('maath') ||
            id.includes('suspend-react') ||
            id.includes('its-fine')
          )
            return 'r3f'
          if (id.includes('@gsap') || id.includes('/gsap/') || id.endsWith('gsap')) return 'gsap'
          if (id.includes('lenis')) return 'lenis'
          if (id.includes('split-type')) return 'text'
        },
      },
    },
  },
})
