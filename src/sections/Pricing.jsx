import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { EASE_DRAFT, EASE_SNAP } from '../lib/easings'
import MonoLabel from '../components/MonoLabel'
import Button from '../components/Button'
import SectionTransition from '../components/SectionTransition'

const PACKAGES = [
  {
    id: '01',
    tier: 'Foundation',
    price: '$3,500',
    target: 'Early-stage & local businesses needing a professional web presence',
    includes: [
      '5-page custom design',
      'Design system (colors, type, components)',
      'React + Tailwind build',
      'Technical SEO foundation',
      'Core Web Vitals ≥ 90',
      'WCAG AA accessibility',
      'Vercel deploy + analytics',
      '30-day post-launch support',
    ],
    accent: 'var(--accent)',
  },
  {
    id: '02',
    tier: 'Growth',
    price: '$7,500',
    target: 'Scaling businesses needing conversion-focused sites',
    includes: [
      'Everything in Foundation',
      'Up to 12 pages / dynamic sections',
      'CMS integration',
      'Advanced GSAP motion system',
      'Conversion patterns & funnels',
      'Full SEO audit + implementation',
      'A/B-ready component variants',
      '60-day support + 1 retainer month',
    ],
    accent: '#4F7CFF',
  },
  {
    id: '03',
    tier: 'Retainer',
    price: '$2,500/mo',
    target: 'Ongoing partnership — treat the site as a growth asset',
    includes: [
      'Monthly performance & SEO monitoring',
      'Quarterly design/build sprints',
      'Priority bug fixes & security updates',
      'Analytics review + insights',
      'Unlimited minor content edits',
      'Direct Slack/email access',
      'Roll-over unused hours (max 2 mo)',
      '3-month minimum, then month-to-month',
    ],
    accent: '#00C494',
  },
]

function PackageCard({ pkg }) {
  return (
    <div
      className="pricing-card group relative p-8 flex flex-col gap-6"
      style={{
        border: `1px solid var(--line)`,
        backgroundColor: 'var(--surface)',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = pkg.accent
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Blueprint label */}
      <MonoLabel className="text-[var(--muted)]">PKG / {pkg.id}–03</MonoLabel>

      {/* Tier name */}
      <h3
        className="font-['Clash_Display'] font-semibold text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.1] text-[var(--paper)]"
      >
        {pkg.tier}
      </h3>

      {/* Price */}
      <p
        className="font-['Clash_Display'] font-bold text-[clamp(2rem,3vw,3rem)] leading-[1]"
        style={{ color: pkg.accent }}
      >
        {pkg.price}
      </p>

      {/* Target */}
      <p className="text-[0.875rem] text-[var(--muted)] leading-[1.5]">
        {pkg.target}
      </p>

      {/* Includes list */}
      <ul className="flex-1 space-y-3">
        {pkg.includes.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[0.875rem] text-[var(--muted)] leading-[1.5]">
            <span
              className="mt-1.5 block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: pkg.accent }}
            />
            {item}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-4">
        <Button href="#contact" variant={pkg.id === '02' ? 'primary' : 'secondary'}>
          {pkg.id === '03' ? 'Discuss Retainer' : `Start ${pkg.tier}`}
        </Button>
      </div>
    </div>
  )
}

export default function Pricing() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: EASE_DRAFT, scrollTrigger: { trigger: headlineRef.current, start: 'top 85%', once: true } }
        )

        gsap.fromTo(
          section.querySelectorAll('.pricing-card'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE_SNAP, stagger: 0.12, scrollTrigger: { trigger: section, start: 'top 70%', once: true } }
        )
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(headlineRef.current, { opacity: 1, y: 0 })
        gsap.set(section.querySelectorAll('.pricing-card'), { opacity: 1, y: 0 })
      })
    },
    { scope: sectionRef }
  )

  return (
    <SectionTransition
      index={4}
      id="pricing"
      bg="var(--bg)"
      className="py-[160px] max-lg:py-[80px] px-6 lg:px-10"
    >
      <div ref={sectionRef} className="max-w-[1400px] mx-auto">
        <h2
          ref={headlineRef}
          className="font-['Clash_Display'] font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1] text-[var(--paper)] mb-16 max-lg:mb-10"
          style={{ opacity: 0 }}
        >
          Services & Pricing
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </SectionTransition>
  )
}