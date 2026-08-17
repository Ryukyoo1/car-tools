import type { AmbientPreset } from '@/types/ambient'

// Built-in soundscape presets (one-tap mixes).
export const DEFAULT_PRESETS: AmbientPreset[] = [
  {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    subtitle: 'Rain + Forest',
    layers: [
      { source: 'rain', volume: 0.8 },
      { source: 'forest', volume: 0.2 },
    ],
  },
  {
    id: 'coffee',
    name: 'Coffee',
    subtitle: 'Cafe + Rain',
    layers: [
      { source: 'cafe', volume: 0.7 },
      { source: 'rain', volume: 0.3 },
    ],
  },
  {
    id: 'night-drive',
    name: 'Night Drive',
    subtitle: 'Road + Rain',
    layers: [
      { source: 'road', volume: 0.7 },
      { source: 'rain', volume: 0.3 },
    ],
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    subtitle: 'Ocean + Rain',
    layers: [
      { source: 'ocean', volume: 0.8 },
      { source: 'rain', volume: 0.2 },
    ],
  },
]

// Seconds -> mm:ss (or hh:mm:ss if long). Used for the sleep timer display.
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}
