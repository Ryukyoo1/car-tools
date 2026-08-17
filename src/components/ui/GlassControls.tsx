import { type ReactNode } from 'react'
import { ACCENT_CLASS, type AccentName } from './GlassButton'

/* ----------------------------- GlassSlider ----------------------------- */
export interface GlassSliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  accent?: AccentName
  label?: string
  className?: string
}

export function GlassSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  accent = 'blue',
  label,
  className = '',
}: GlassSliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm text-secondary">
          <span>{label}</span>
          <span className="tnum text-white/80">{Math.round(value)}</span>
        </div>
      )}
      <input
        type="range"
        className="glass-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
        }}
        // accent color for the filled track
        data-accent={accent}
      />
      <style>{`.glass-range[data-accent="${accent}"]{--accent:var(--accent-${accent})}`}</style>
    </div>
  )
}

/* ----------------------------- GlassToggle ----------------------------- */
export interface GlassToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  accent?: AccentName
}

export function GlassToggle({ checked, onChange, label, accent = 'blue' }: GlassToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[60px] w-full items-center justify-between gap-4 rounded-md glass px-5 text-left ${
        accent ? ACCENT_CLASS[accent] : ''
      }`}
    >
      <span className="text-base text-white/90">{label}</span>
      <span
        className={`relative h-8 w-[52px] flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-accent-soft border border-accent' : 'bg-white/10 border border-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[24px]' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

/* ------------------------------ GlassTab ------------------------------- */
export interface GlassTabProps {
  tabs: { id: string; label: ReactNode }[]
  active: string
  onChange: (id: string) => void
  accent?: AccentName
  className?: string
}

export function GlassTab({ tabs, active, onChange, accent = 'blue', className = '' }: GlassTabProps) {
  return (
    <div className={`inline-flex gap-1 rounded-md glass p-1 ${accent ? ACCENT_CLASS[accent] : ''} ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`min-h-[52px] rounded-[14px] px-5 text-base font-medium transition-colors ${
            active === t.id ? 'bg-accent-soft text-white' : 'text-white/60 hover:text-white/80'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
