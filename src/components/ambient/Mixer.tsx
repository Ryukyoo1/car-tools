import { X } from 'lucide-react'
import { SOURCE_META } from './SourceMeta'
import type { AmbientLayer, AmbientSource } from '@/types/ambient'

interface MixerProps {
  layers: AmbientLayer[]
  onChangeVolume: (source: AmbientSource, volume: number) => void
  onRemove: (source: AmbientSource) => void
  primary: AmbientSource
}

// Live mix of up to 3 layers, each with its own volume and remove control.
export function Mixer({ layers, onChangeVolume, onRemove, primary }: MixerProps) {
  if (layers.length === 0) return null

  return (
    <div className="glass rounded-3xl px-5 py-4">
      <div className="mb-3 px-1 text-sm tracking-wide text-white/60">
        MIX · {layers.length}/3
      </div>
      <div className="space-y-3">
        {layers.map((l) => {
          const meta = SOURCE_META[l.source]
          const Icon = meta.Icon
          return (
            <div key={l.source} className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={primary === l.source ? { background: meta.theme.accent, color: '#0a0a0a' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white">{meta.label}</span>
                  <span className="text-xs text-white/45">{meta.zh}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={l.volume}
                  onChange={(e) => onChangeVolume(l.source, parseFloat(e.target.value))}
                  aria-label={`${meta.label} volume`}
                  className="mt-1 h-9 w-full cursor-pointer"
                  style={{ accentColor: meta.theme.accent }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-white/55">
                {Math.round(l.volume * 100)}%
              </span>
              <button
                onClick={() => onRemove(l.source)}
                aria-label={`Remove ${meta.label}`}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
