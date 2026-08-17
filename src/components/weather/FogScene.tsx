interface SceneProps {
  reduced: boolean
}

const BANDS = [
  { top: '20%', opacity: 0.16, dur: 80, delay: 0 },
  { top: '48%', opacity: 0.12, dur: 100, delay: -30 },
  { top: '72%', opacity: 0.1, dur: 120, delay: -60 },
]

// Fog scene: grey-blue sky with several slow, diffuse fog bands drifting sideways.
export function FogScene({ reduced }: SceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #1A2230 0%, #1E2734 55%, #232C39 100%)',
        }}
      />
      {BANDS.map((b, i) => (
        <div
          key={i}
          className={`absolute left-[-20%] right-[-20%] h-[34vh] ${reduced ? '' : 'fog-drift'}`}
          style={{
            top: b.top,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            background: `radial-gradient(60% 100% at 50% 50%, rgba(214,224,236,${b.opacity}), rgba(214,224,236,0) 70%)`,
          }}
        />
      ))}
    </div>
  )
}
