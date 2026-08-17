import { RotateCw } from 'lucide-react'
import type { TimerMinutes } from '@/types/ambient'

interface TimerControlProps {
  timer: TimerMinutes
  onSet: (minutes: TimerMinutes) => void
  remainingLabel: string
  active: boolean
  onClear: () => void
  accent: string
}

const OPTIONS: { label: string; value: TimerMinutes }[] = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '60m', value: 60 },
  { label: '90m', value: 90 },
  { label: '∞', value: 0 },
]

// Sleep timer. Shows a live countdown while playing; ends with a 10s fade-out.
export function TimerControl({ timer, onSet, remainingLabel, active, onClear, accent }: TimerControlProps) {
  return (
    <div className="glass rounded-3xl px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm tracking-wide text-white/60">SLEEP TIMER</span>
        {active && (
          <div className="flex items-center gap-2">
            <span className="tabular-nums text-lg font-semibold text-white">{remainingLabel}</span>
            <button
              onClick={onClear}
              aria-label="Cancel timer"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const selected = timer === o.value
          return (
            <button
              key={o.value}
              onClick={() => onSet(o.value)}
              aria-label={`Set timer ${o.label}`}
              className="min-h-[52px] min-w-[60px] rounded-2xl border px-4 text-base font-medium transition-colors"
              style={
                selected
                  ? { background: accent, borderColor: accent, color: '#0a0a0a' }
                  : { borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
