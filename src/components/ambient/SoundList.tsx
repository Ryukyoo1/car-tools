import { useMemo } from 'react'
import { Play, Pause } from 'lucide-react'
import { CATEGORY_META, CATEGORY_ORDER, AMBIENT_TRACKS, formatDuration } from './SourceMeta'
import { WaveformBars } from './WaveformBars'
import type { AmbientCategory, AmbientTrack } from '@/types/ambient'

interface SoundListProps {
  currentTrack: AmbientTrack | null
  playing: boolean
  onPlay: (track: AmbientTrack) => void
  activeCategory: AmbientCategory | null
}

export function SoundList({ currentTrack, playing, onPlay, activeCategory }: SoundListProps) {
  const byCategory = useMemo(() => {
    const map = new Map<AmbientCategory, AmbientTrack[]>()
    for (const track of AMBIENT_TRACKS) {
      const list = map.get(track.category) ?? []
      list.push(track)
      map.set(track.category, list)
    }
    return map
  }, [])

  const categories = activeCategory ? [activeCategory] : CATEGORY_ORDER

  return (
    <section className="glass rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-3 text-sm tracking-wide text-white/60">SELECT SOUND</div>
      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const meta = CATEGORY_META[category]
          const tracks = byCategory.get(category) ?? []
          if (tracks.length === 0) return null
          const Icon = meta.Icon
          return (
            <div key={category}>
              <div className="mb-2 flex items-center gap-2 px-1 text-white/80">
                <Icon className="h-4 w-4" style={{ color: meta.theme.accent }} strokeWidth={1.8} />
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-xs text-white/40">{meta.zh}</span>
              </div>
              <div className="space-y-2">
                {tracks.map((track) => {
                  const isActive = currentTrack?.id === track.id && playing
                  return (
                    <button
                      key={track.id}
                      onClick={() => onPlay(track)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.14] sm:gap-4 sm:px-4"
                      style={isActive ? { borderColor: `${meta.theme.accent}50`, background: `${meta.theme.accent}10` } : undefined}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors sm:h-12 sm:w-12"
                        style={
                          isActive
                            ? { background: meta.theme.accent, color: '#0a0a0a' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }
                        }
                      >
                        {isActive ? (
                          <Pause className="h-5 w-5" strokeWidth={1.8} />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5" strokeWidth={1.8} />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-sm font-medium text-white">{track.title}</span>
                          <span className="hidden shrink-0 text-xs text-white/45 sm:inline">{track.artist}</span>
                        </div>
                        <div className="mt-2">
                          <WaveformBars seed={track.id} playing={isActive} accent={meta.theme.accent} />
                        </div>
                      </div>

                      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs tabular-nums text-white/60">
                          {track.duration > 0 ? formatDuration(track.duration) : '∞'}
                        </span>
                        <div className="flex max-w-[160px] flex-wrap justify-end gap-1">
                          {track.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
