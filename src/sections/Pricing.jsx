import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SplitType from 'split-type'
import { gsap, getLenis } from '../lib/gsap'
import { EASE_DRAFT, EASE_SNAP } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import Button from '../components/Button'
import SectionTransition from '../components/SectionTransition'

// ─────────────────────────────────────────────────────────────────────────
// Pricing content — names, prices and features live here only.
// ─────────────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: '01',
    label: 'PKG / 01-02',
    name: 'Build',
    priceFrom: '$600',
    priceTag: 'ONE-TIME',
    tagline: 'A custom website, built and launched end to end.',
    items: [
      'Custom design, up to 5 pages',
      'Mobile-first, responsive build',
      'Fast load times, clean accessible code',
      'Contact form and analytics setup',
      'Domain and hosting setup included (domain registered in your name)',
      'Launch, handover and 14 days of post-launch fixes',
    ],
    cta: 'Start Build',
    package: 'build',
    featured: false,
  },
  {
    id: '02',
    label: 'PKG / 02-02',
    recommended: 'RECOMMENDED',
    name: 'Build + Support',
    priceFrom: '$800',
    priceTag: 'ONE-TIME',
    tagline: 'Everything in Build, plus 3 months of hands-on support after launch.',
    lead: 'Everything in Build',
    items: [
      '3 months of post-launch support',
      'Up to 2 hours of edits per month',
      '48-hour response time',
      'Hosting and uptime checks',
      'Bug fixes and security updates',
      'Optional renewal after 3 months',
    ],
    cta: 'Start Build + Support',
    package: 'build-support',
    featured: true,
  },
]

const CUSTOM = {
  label: 'CUSTOM',
  text: "More pages, e-commerce, integrations or a one-off build? Tell us what you need and we'll scope it.",
  cta: 'Request a Quote',
  package: 'custom',
}

const FOOTNOTE =
  'Domain renewal is billed yearly by the registrar. Final pricing depends on scope.'

const HAIRLINE = { backgroundColor: 'var(--line)' }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getContactTarget = () => document.getElementById('contact')

/** Small L-shaped registration ticks at each corner of a card. */
function CornerTicks({ color }) {
  const tick = {
    position: 'absolute',
    width: 12,
    height: 12,
    borderStyle: 'solid',
    borderWidth: 0,
    borderColor: color,
    pointerEvents: 'none',
  }
  return (
    <span aria-hidden="true">
      <span style={{ ...tick, top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...tick, top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 }} />
      <span style={{ ...tick, bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <span style={{ ...tick, bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 }} />
    </span>
  )
}

function PackageCard({ pkg, onSelect }) {
  const { featured } = pkg
  const border = featured ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)'
  const borderHover = featured ? '#FF7A47' : 'rgba(255, 255, 255, 0.22)'
  const bulletColor = featured ? 'var(--accent)' : 'var(--muted)'

  const setHoverState = (el, active) => {
    el.style.borderColor = active ? borderHover : border
    el.style.transform =
      active && !prefersReducedMotion() ? 'translateY(-2px)' : 'translateY(0)'
  }

  // Button spreads props after its own style, so a style override turns the
  // primary variant into a filled-at-rest CTA without changing the component.
  const ctaProps = featured
    ? {
        style: {
          border: '1px solid var(--accent)',
          backgroundColor: 'var(--accent)',
          color: 'var(--bg)',
        },
      }
    : {}

  return (
    <div
      data-pricing-reveal
      className="relative flex flex-col p-6 sm:p-8"
      style={{
        border: `1px solid ${border}`,
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 300ms ease, transform 300ms ease',
      }}
      onMouseEnter={(e) => setHoverState(e.currentTarget, true)}
      onMouseLeave={(e) => setHoverState(e.currentTarget, false)}
      onFocusCapture={(e) => setHoverState(e.currentTarget, true)}
      onBlurCapture={(e) => setHoverState(e.currentTarget, false)}
    >
      {featured && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 90, 31, 0.12), rgba(255, 90, 31, 0))',
          }}
        />
      )}

      <CornerTicks color={featured ? 'rgba(255, 90, 31, 0.9)' : 'rgba(255, 255, 255, 0.3)'} />

      <div className="relative flex items-start justify-between gap-3">
        <MonoLabel className="text-[var(--muted)]">{pkg.label}</MonoLabel>
        {pkg.recommended && (
          <MonoLabel
            className="shrink-0 px-2 py-1"
            style={{
              fontSize: '0.625rem',
              color: 'var(--accent)',
              border: '1px solid rgba(255, 90, 31, 0.45)',
            }}
          >
            {pkg.recommended}
          </MonoLabel>
        )}
      </div>

      <h3 className="relative mt-5 font-['Clash_Display'] text-[clamp(1.5rem,2.5vw,2rem)] font-semibold leading-[1.1] text-[var(--paper)]">
        {pkg.name}
      </h3>

      <div className="relative mt-5 flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <MonoLabel className="text-[var(--muted)]" style={{ fontSize: '0.65rem' }}>
            From
          </MonoLabel>
          <p
            className="font-['Clash_Display'] text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-[0.9]"
            style={{ color: featured ? 'var(--accent)' : 'var(--paper)' }}
          >
            {pkg.priceFrom}
          </p>
        </div>
        <MonoLabel
          className="mb-1 px-2 py-1 text-[var(--muted)]"
          style={{ fontSize: '0.65rem', border: '1px solid var(--line)' }}
        >
          {pkg.priceTag}
        </MonoLabel>
      </div>

      <p className="relative mt-4 text-[0.9375rem] leading-[1.55] text-[var(--muted)]">
        {pkg.tagline}
      </p>

      <div aria-hidden="true" className="mt-6 h-px w-full shrink-0" style={HAIRLINE} />

      {pkg.lead && (
        <MonoLabel className="mt-6 text-[var(--paper)]">{pkg.lead}</MonoLabel>
      )}

      <ul className={`flex-1 space-y-3 ${pkg.lead ? 'mt-3' : 'mt-6'}`}>
        {pkg.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-[0.875rem] leading-[1.5] text-[var(--muted)]"
          >
            <span
              aria-hidden="true"
              className="mt-[0.45rem] block h-1.5 w-1.5 shrink-0"
              style={{ backgroundColor: bulletColor }}
            />
            {item}
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="mt-6 h-px w-full shrink-0" style={HAIRLINE} />

      <div className="mt-6">
        <Button
          href="#contact"
          variant={featured ? 'primary' : 'secondary'}
          onClick={onSelect}
          className={`w-full ${
            featured ? 'hover:brightness-110 focus-visible:[outline-color:var(--paper)]' : ''
          }`}
          {...ctaProps}
        >
          {pkg.cta}
        </Button>
      </div>
    </div>
  )
}

export default function Pricing() {
  const sectionRef = useRef(null)
  const gridRef = useRef(null)
  const headlineRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const headline = headlineRef.current
        let split

        // SplitType word reveal for the heading (same pattern as Hero).
        if (headline) {
          split = new SplitType(headline, { types: 'lines,words', tagName: 'span' })
          gsap.fromTo(
            split.words,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: EASE_DRAFT,
              stagger: 0.04,
              scrollTrigger: { trigger: headline, start: 'top 85%', once: true },
            }
          )
        }

        // Staggered fade-up of the two cards and the custom strip.
        gsap.fromTo(
          section.querySelectorAll('[data-pricing-reveal]'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: EASE_SNAP,
            stagger: 0.12,
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
          }
        )

        return () => {
          if (split) split.revert()
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(section.querySelectorAll('[data-pricing-reveal]'), { opacity: 1, y: 0 })
      })

      return () => mm.revert()
    },
    { scope: sectionRef }
  )

  const handleSelect = (packageId) => (e) => {
    e.preventDefault()
    window.dispatchEvent(
      new CustomEvent('pricing:select-package', { detail: { package: packageId } })
    )

    const target = getContactTarget()
    if (!target) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.1 })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SectionTransition
      index={3}
      id="pricing"
      bg="var(--bg)"
      className="py-[160px] max-lg:py-[80px] px-6 lg:px-10"
    >
      <div ref={sectionRef} className="mx-auto max-w-[960px]">
        <h2
          ref={headlineRef}
          className="font-['Clash_Display'] text-[clamp(2rem,3.5vw,3.5rem)] font-semibold leading-[1.05] text-[var(--paper)]"
        >
          Services &amp; Pricing
        </h2>

        <p className="mt-5 max-w-[48ch] text-[1rem] leading-[1.6] text-[var(--muted)]">
          Fixed starting prices. Final scope is tailored to your project.
        </p>

        <div ref={gridRef} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onSelect={handleSelect(pkg.package)} />
          ))}
        </div>

        <div
          data-pricing-reveal
          className="mt-6 flex flex-col gap-5 p-6 sm:p-7 md:flex-row md:items-center md:gap-8"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <MonoLabel className="shrink-0" style={{ color: 'var(--accent)' }}>
            {CUSTOM.label}
          </MonoLabel>
          <p className="flex-1 text-[0.9375rem] leading-[1.55] text-[var(--muted)]">
            {CUSTOM.text}
          </p>
          <Button
            href="#contact"
            variant="secondary"
            onClick={handleSelect(CUSTOM.package)}
            className="w-full shrink-0 md:w-auto"
          >
            {CUSTOM.cta}
          </Button>
        </div>

        <p className="mt-6 font-['JetBrains_Mono'] text-[0.7rem] leading-[1.6] text-[var(--muted)]">
          {FOOTNOTE}
        </p>
      </div>
    </SectionTransition>
  )
}
