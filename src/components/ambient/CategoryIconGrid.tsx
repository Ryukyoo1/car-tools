import { CATEGORY_META, CATEGORY_ORDER } from './SourceMeta'
import type { AmbientCategory } from '@/types/ambient'

interface CategoryIconGridProps {
  activeCategory: AmbientCategory | null
  onSelect: (category: AmbientCategory | null) => void
}

export function CategoryIconGrid({ activeCategory, onSelect }: CategoryIconGridProps) {
  return (
    <section className="glass rounded-3xl px-5 py-4">
      <div className="mb-3 text-sm tracking-wide text-white/60">SOUNDS</div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category]
          const Icon = meta.Icon
          const active = activeCategory === category
          return (
            <button
              key={category}
              onClick={() => onSelect(active ? null : category)}
              aria-label={meta.label}
              className="group flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border transition-all"
              style={
                active
                  ? {
                      background: meta.theme.accent,
                      borderColor: meta.theme.accent,
                      color: '#0a0a0a',
                      boxShadow: `0 0 28px ${meta.theme.glow}`,
                    }
                  : {
                      borderColor: 'rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.75)',
                      background: 'rgba(255,255,255,0.03)',
                    }
              }
            >
              <Icon className="h-6 w-6" strokeWidth={1.7} />
              <span className="text-[11px] font-medium tracking-wide">{meta.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
