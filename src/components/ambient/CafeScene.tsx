interface SceneProps {
  reduced: boolean
}

// Warm cafe ambience: amber gradient, slow bokeh orbs, faint film grain.
export function CafeScene({ reduced }: SceneProps) {
  const orbs = [
    { left: '18%', top: '28%', size: 220, color: 'rgba(217,160,91,0.20)' },
    { left: '68%', top: '18%', size: 160, color: 'rgba(240,190,120,0.16)' },
    { left: '78%', top: '62%', size: 260, color: 'rgba(200,140,80,0.18)' },
    { left: '30%', top: '70%', size: 180, color: 'rgba(230,180,110,0.14)' },
  ]
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#1A130A 0%,#241810 55%,#1C150C 100%)' }}
    >
      {orbs.map((o, i) => (
        <span
          key={i}
          className={`absolute rounded-full blur-2xl ${reduced ? '' : 'bokeh-float'}`}
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            background: o.color,
            animationDelay: `${i * 3}s`,
          }}
        />
      ))}
      {/* Faint grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
