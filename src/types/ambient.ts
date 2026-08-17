// Domain types for the Ambient soundscape tool.

export type AmbientSource = 'rain' | 'ocean' | 'forest' | 'fireplace' | 'cafe' | 'road'

export type TimerMinutes = 0 | 15 | 30 | 60 | 90

export interface AmbientLayer {
  source: AmbientSource
  volume: number // 0..1
}

export interface AmbientPreset {
  id: string
  name: string
  subtitle: string
  layers: AmbientLayer[]
}

export interface AmbientSettings {
  master: number // 0..1
  layers: AmbientLayer[] // last-used mix (restored on refresh, not auto-played)
  timer: TimerMinutes
  presetId: string | null
  favorites: AmbientPreset[]
}
