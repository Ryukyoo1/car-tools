interface SceneProps {
  reduced: boolean
}

// Night-drive ambience: a perspective road with a scrolling centre line, glowing
// edges converging at a distant horizon glow, and passing light streaks. CSS-only
// so it stays light on embedded car browsers. Motion is disabled under reduced-motion.
export function RoadScene({ reduced }: SceneProps) {
  const edge = 'rgba(140,160,220,0.35)'
  const dashBg = 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.85) 0 26px, transparent 26px 64px)'
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(180deg,#060912 0%,#0A0F1C 52%,#05080F 100%)' }}>
      {/* Distant horizon glow */}
      <div
        className={`absolute left-1/2 top-[34%] h-[26%] w-[40%] -translate-x-1/2 rounded-full ${reduced ? '' : 'glow-pulse'}`}
        style={{ background: 'radial-gradient(circle, rgba(108,123,214,0.28), transparent 70%)' }}
      />

      {/* Road surface */}
      <div className="absolute bottom-0 left-0 h-[58%] w-full" style={{ clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0% 100%)', background: 'linear-gradient(180deg, rgba(20,26,42,0.2), rgba(10,14,26,0.85))' }} />

      {/* Left & right glowing edges */}
      <div className="absolute bottom-0 left-0 h-[58%] w-full" style={{ clipPath: 'polygon(43% 0, 45% 0, 2% 100%, 0% 100%)', background: edge }} />
      <div className="absolute bottom-0 left-0 h-[58%] w-full" style={{ clipPath: 'polygon(55% 0, 57% 0, 100% 100%, 98% 100%)', background: edge }} />

      {/* Scrolling centre dashes */}
      <div
        className={`absolute bottom-0 left-0 h-[58%] w-full ${reduced ? '' : 'road-scroll'}`}
        style={{ clipPath: 'polygon(49.2% 0, 50.8% 0, 52% 100%, 48% 100%)', backgroundImage: dashBg, backgroundSize: '100% 64px' }}
      />

      {/* Passing light streaks */}
      <div className={`absolute bottom-[20%] left-[6%] h-[2px] w-[18%] rounded-full bg-amber-300/40 blur-[3px] ${reduced ? '' : 'drift-slow'}`} />
      <div className={`absolute bottom-[28%] right-[8%] h-[2px] w-[14%] rounded-full bg-rose-300/40 blur-[3px] ${reduced ? '' : 'drift-slow'}`} style={{ animationDelay: '6s' }} />
      <div className={`absolute bottom-[38%] left-[10%] h-[2px] w-[10%] rounded-full bg-sky-200/30 blur-[3px] ${reduced ? '' : 'drift-slow'}`} style={{ animationDelay: '12s' }} />
    </div>
  )
}
