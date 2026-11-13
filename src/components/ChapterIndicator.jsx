import { useScrollStage } from '../context/ScrollStage'

export default function ChapterIndicator() {
  const { sections, activeIndex } = useScrollStage()
  if (!sections.length) return null

  return (
    <div
      aria-hidden="true"
      className="group fixed right-6 top-1/2 -translate-y-1/2 z-[9000] hidden lg:flex flex-col items-end gap-4 pointer-events-auto"
    >
      <span
        className="font-['JetBrains_Mono'] text-[0.65rem] tracking-[0.12em] text-[var(--muted)] mb-1"
        style={{ writingMode: 'vertical-rl' }}
      >
        CHAPTER
      </span>

      <div className="flex flex-col items-end gap-3">
        {sections.map((s, i) => {
          const active = i === activeIndex
          return (
            <div key={s.id} className="relative flex items-center justify-end">
              <span
                className="pointer-events-none absolute right-[calc(100%+0.75rem)] whitespace-nowrap font-['JetBrains_Mono'] text-[0.6rem] tracking-[0.1em] uppercase opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}
              >
                {s.label}
              </span>
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: active ? '10px' : '6px',
                  height: active ? '10px' : '6px',
                  backgroundColor: active ? 'var(--accent)' : 'var(--line)',
                }}
              />
            </div>
          )
        })}
      </div>

      <span className="font-['JetBrains_Mono'] text-[0.65rem] tracking-[0.12em] text-[var(--accent)] mt-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {String(activeIndex + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
      </span>
    </div>
  )
}
