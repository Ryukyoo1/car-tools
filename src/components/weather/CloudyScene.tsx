interface SceneProps {
  reduced: boolean
}

const CLOUDS = [
  { top: '16%', left: '2%', size: '58vh', dur: 58, delay: 0, opacity: 0.12 },
  { top: '44%', left: '22%', size: '46vh', dur: 74, delay: -22, opacity: 0.08 },
  { top: '66%', left: '52%', size: '62vh', dur: 90, delay: -46, opacity: 0.07 },
]

// Overcast scene: deep grey-blue sky with large, slow, low-opacity cloud masses.
// Clouds are soft radial gradients (no blur filter) for car-screen performance.
export function CloudyScene({ reduced }: SceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0C1622 0%, #111C2A 55%, #16222F 100%)',
        }}
      />
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${reduced ? '' : 'drift'}`}
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            background: `radial-gradient(closest-side, rgba(255,255,255,${c.opacity}), rgba(255,255,255,0) 75%)`,
          }}
        />
      ))}
    </div>
  )
}
