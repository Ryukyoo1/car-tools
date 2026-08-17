interface SceneProps {
  reduced: boolean
}

// Dark forest ambience: tree silhouettes, slow drifting fog, faint light points.
export function ForestScene({ reduced }: SceneProps) {
  const trees = [60, 110, 80, 140, 95, 120, 70, 100, 130, 85, 115, 75]
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0A160F 0%,#102018 60%,#0B1A12 100%)' }}
    >
      {/* Drifting fog layers */}
      <div
        className={`absolute inset-0 ${reduced ? '' : 'drift-slow'}`}
        style={{
          background:
            'radial-gradient(40% 30% at 30% 40%, rgba(120,160,130,0.10), transparent 70%), radial-gradient(50% 35% at 75% 55%, rgba(90,130,100,0.08), transparent 70%)',
        }}
      />

      {/* Faint light points */}
      {[
        [22, 30, 2],
        [68, 22, 3],
        [82, 40, 2],
        [40, 50, 2],
        [12, 60, 1.5],
        [90, 64, 2],
      ].map(([x, y, r], i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-emerald-200/70 ${reduced ? '' : 'twinkle'}`}
          style={{ left: `${x}%`, top: `${y}%`, width: `${r}px`, height: `${r}px`, animationDelay: `${i * 0.6}s` }}
        />
      ))}

      {/* Tree silhouette skyline */}
      <svg className="absolute bottom-0 left-0 h-[42%] w-full" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden>
        {trees.map((h, i) => {
          const x = (i / (trees.length - 1)) * 1200
          const base = 300
          const w = 70
          return (
            <polygon
              key={i}
              points={`${x},${base} ${x - w / 2},${base} ${x},${base - h} ${x + w / 2},${base}`}
              fill="#07120C"
              opacity={0.92}
            />
          )
        })}
        <rect x="0" y="280" width="1200" height="20" fill="#06100B" />
      </svg>
    </div>
  )
}
