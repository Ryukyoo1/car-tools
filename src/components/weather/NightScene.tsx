import { useMemo } from 'react'

interface SceneProps {
  reduced: boolean
}

function useStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 72}%`,
        size: 1 + Math.random() * 1.6,
        opacity: 0.3 + Math.random() * 0.6,
        twinkle: Math.random() > 0.5,
        delay: `${Math.random() * 4}s`,
      })),
    [count],
  )
}

// Night scene: near-black sky, a glowing moon, scattered stars, and one faint cloud.
export function NightScene({ reduced }: SceneProps) {
  const stars = useStars(26)

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020617 0%, #050B1A 55%, #07101F 100%)',
        }}
      />
      {/* Moon glow, upper-right */}
      <div
        className="absolute right-[14%] top-[14%] h-[26vh] w-[26vh] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(225,232,255,0.30), rgba(200,212,255,0.08) 45%, transparent 70%)',
        }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-white ${s.twinkle && !reduced ? 'twinkle' : ''}`}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: s.delay,
          }}
        />
      ))}
      {/* Faint drifting cloud */}
      <div
        className={`absolute left-[8%] top-[60%] h-[28vh] w-[60vh] rounded-full ${
          reduced ? '' : 'drift'
        }`}
        style={{
          animationDuration: '95s',
          background:
            'radial-gradient(closest-side, rgba(255,255,255,0.05), rgba(255,255,255,0) 75%)',
        }}
      />
    </div>
  )
}
