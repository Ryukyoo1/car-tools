// Domain types for the Ambient soundscape tool.

export type AmbientCategory = 'rain' | 'ocean' | 'forest' | 'fireplace' | 'cafe' | 'road'

export interface AmbientTrack {
  id: string
  category: AmbientCategory
  title: string
  artist: string
  /** Bundled recording in `public/audio`. Omit for synthesized tracks. */
  file?: string
  duration: number // seconds
  tags: string[]
}

export type TimerMinutes = 0 | 15 | 30 | 60 | 90

export interface AmbientSettings {
  timer: TimerMinutes
  lastTrackId: string | null
}
