import { useMemo } from 'react'

interface WaveformBarsProps {
  seed: string
  playing?: boolean
  accent: string
  barCount?: number
}

export function WaveformBars({ seed, playing, accent, barCount = 44 }: WaveformBarsProps) {
  const bars = useMemo(() => {
    const list: number[] = []
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i)
    const rng = (i: number) => {
      const x = Math.sin(hash + i * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < barCount; i++) {
      list.push(0.25 + rng(i) * 0.75)
    }
    return list
  }, [seed, barCount])

  return (
    <div className="flex h-9 items-center gap-[2px] overflow-hidden">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] shrink-0 rounded-full transition-all duration-300"
          style={{
            height: `${Math.round(h * 100)}%`,
            background: playing ? accent : 'rgba(255,255,255,0.22)',
            opacity: playing ? 0.9 : 0.7,
            animation: playing ? `waveform-pulse 0.7s ease-in-out ${i * 0.03}s infinite alternate` : undefined,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  )
}
