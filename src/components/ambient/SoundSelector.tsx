import { SOURCE_META, SOURCE_ORDER } from './SourceMeta'
import type { AmbientSource } from '@/types/ambient'

interface SoundSelectorProps {
  active: Set<AmbientSource>
  primary: AmbientSource
  onToggle: (source: AmbientSource) => void
}

// Horizontal palette of all soundscapes. Tap to add/remove from the live mix.
export function SoundSelector({ active, primary, onToggle }: SoundSelectorProps) {
  return (
    <div className="glass rounded-3xl px-5 py-5">
      <div className="mb-4 px-1 text-sm tracking-wide text-white/60">SOUNDS</div>
      <div className="flex flex-wrap justify-center gap-4">
        {SOURCE_ORDER.map((source) => {
          const meta = SOURCE_META[source]
          const isActive = active.has(source)
          const isPrimary = primary === source
          const Icon = meta.Icon
          return (
            <button
              key={source}
              onClick={() => onToggle(source)}
              aria-label={`${isActive ? 'Remove' : 'Add'} ${meta.label}`}
              aria-pressed={isActive}
              className="flex min-h-[84px] w-24 flex-col items-center justify-center gap-2 rounded-2xl border transition-colors"
              style={
                isActive
                  ? { borderColor: meta.theme.accent, background: isPrimary ? `${meta.theme.accent}33` : `${meta.theme.accent}22` }
                  : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }
              }
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={isActive ? { background: meta.theme.accent, color: '#0a0a0a' } : { color: 'rgba(255,255,255,0.75)' }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.7} />
              </span>
              <span
                className="text-xs font-medium"
                style={isActive ? { color: meta.theme.accent } : { color: 'rgba(255,255,255,0.8)' }}
              >
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
