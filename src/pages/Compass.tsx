import { Compass as CompassIcon, Navigation } from 'lucide-react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { useCompass } from '@/hooks/useCompass'

const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

function getDirection(deg: number): string {
  return POINTS[Math.round(deg / 45) % 8]
}

export default function Compass() {
  const { heading, available, needsPermission, error, requestPermission } = useCompass()

  if (!available) {
    return (
      <ToolPage title="COMPASS" accent="blue">
        <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
          <GlassSurface variant="card" className="flex flex-col items-center gap-4 p-8">
            <CompassIcon className="h-12 w-12 text-accent" strokeWidth={1.5} />
            <h2 className="text-lg font-medium text-white">Compass unavailable</h2>
            <p className="max-w-xs text-base text-secondary">
              {error ?? 'Orientation sensor unavailable.'}
            </p>
          </GlassSurface>
        </div>
      </ToolPage>
    )
  }

  const deg = heading ?? 0
  const displayDeg = heading != null ? Math.round(deg) : null
  const displayDir = heading != null ? getDirection(deg) : '—'

  return (
    <ToolPage title="COMPASS" accent="blue">
      <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-6">
        {needsPermission && (
          <GlassButton
            variant="primary"
            size="lg"
            onClick={requestPermission}
            className="w-full max-w-sm"
          >
            <Navigation className="h-6 w-6" strokeWidth={1.8} />
            Enable Compass
          </GlassButton>
        )}

        {error && !needsPermission && (
          <p className="text-center text-base text-secondary">{error}</p>
        )}

        <GlassSurface
          variant="panel"
          glow={heading != null}
          className="relative aspect-square w-[64vw] max-w-[340px] rounded-full"
        >
          {/* 8-point bezel labels */}
          {POINTS.map((p, i) => (
            <div
              key={p}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <span
                className={`mt-4 text-sm font-medium ${
                  i === 0 ? 'text-white' : 'text-secondary'
                }`}
                style={{ transform: `rotate(${-i * 45}deg)` }}
              >
                {p}
              </span>
            </div>
          ))}

          {/* Rotating needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="h-[76%] w-[76%]">
              <polygon points="50,6 43,50 57,50" style={{ fill: 'var(--accent)' }} />
              <polygon points="50,94 43,50 57,50" fill="rgba(255,255,255,0.42)" />
              <circle cx="50" cy="50" r="5" fill="#ffffff" />
            </svg>
          </div>
        </GlassSurface>

        {/* Hero readout */}
        <div className="text-center">
          <div className="tnum text-6xl font-light leading-none text-white sm:text-7xl">
            {displayDeg != null ? `${displayDeg}°` : '—'}
          </div>
          <div className="mt-2 text-xl font-medium text-accent">{displayDir}</div>
        </div>
      </div>
    </ToolPage>
  )
}
