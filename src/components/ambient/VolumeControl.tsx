import { Volume2 } from 'lucide-react'

interface VolumeControlProps {
  value: number // 0..1
  onChange: (value: number) => void
  accent: string
}

// Master volume with a large, touch-friendly slider (60px hit area).
export function VolumeControl({ value, onChange, accent }: VolumeControlProps) {
  return (
    <div className="glass flex items-center gap-4 rounded-3xl px-5 py-4">
      <Volume2 className="h-6 w-6 shrink-0 text-white/70" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Master volume"
        className="h-[60px] w-full cursor-pointer"
        style={{ accentColor: accent }}
      />
      <span className="w-12 shrink-0 text-right text-lg font-medium tabular-nums text-white">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}
