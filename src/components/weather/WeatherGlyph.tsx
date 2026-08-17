import type { WeatherCondition } from '@/types/weather'

interface GlyphProps {
  condition: WeatherCondition
  size?: number
  className?: string
}

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  return {
    x1: 50 + Math.cos(a) * 19,
    y1: 50 + Math.sin(a) * 19,
    x2: 50 + Math.cos(a) * 27,
    y2: 50 + Math.sin(a) * 27,
  }
})

function Sun() {
  return (
    <g>
      <circle cx="50" cy="50" r="13" fill="currentColor" />
      {RAYS.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function Cloud({ opacity = 1 }: { opacity?: number }) {
  return (
    <g fill="currentColor" opacity={opacity}>
      <circle cx="38" cy="55" r="14" />
      <circle cx="55" cy="47" r="19" />
      <circle cx="69" cy="57" r="13" />
      <rect x="30" y="55" width="46" height="16" rx="8" />
    </g>
  )
}

function Drops({ count, heavy }: { count: number; heavy?: boolean }) {
  const xs = [34, 46, 58, 70]
  return (
    <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      {Array.from({ length: count }).map((_, i) => {
        const x = xs[i % xs.length]
        return <line key={i} x1={x} y1={heavy ? 74 : 76} x2={x - 3} y2={heavy ? 88 : 86} />
      })}
    </g>
  )
}

function SnowDots() {
  const xs = [36, 50, 64]
  return (
    <g fill="currentColor">
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={i % 2 === 0 ? 80 : 84} r="2.6" />
      ))}
    </g>
  )
}

function Lightning() {
  return <path d="M55 70 L45 86 H54 L48 100 L66 80 H55 Z" fill="currentColor" />
}

function FogLines() {
  return (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.85">
      <line x1="24" y1="74" x2="76" y2="74" />
      <line x1="20" y1="84" x2="80" y2="84" />
      <line x1="28" y1="92" x2="72" y2="92" />
    </g>
  )
}

function Moon() {
  return (
    <g>
      <path
        d="M64 28 a24 24 0 1 0 0 44 a17 17 0 1 1 0 -44 Z"
        fill="currentColor"
      />
      <g fill="currentColor" opacity="0.9">
        <path d="M30 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
        <path d="M36 60 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4 Z" />
      </g>
    </g>
  )
}

// Unified, emoji-free weather glyph. Used in the hero, hourly and daily panels.
export function WeatherGlyph({ condition, size = 96, className }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-hidden="true"
      fill="none"
    >
      {condition === 'sunny' && <Sun />}
      {condition === 'partly-cloudy' && (
        <g>
          <g transform="translate(-6 -8) scale(0.62)">
            <Sun />
          </g>
          <g transform="translate(8 14)">
            <Cloud />
          </g>
        </g>
      )}
      {condition === 'cloudy' && <Cloud />}
      {condition === 'fog' && (
        <g>
          <g transform="translate(0 -6)">
            <Cloud opacity={0.85} />
          </g>
          <g transform="translate(0 6)">
            <FogLines />
          </g>
        </g>
      )}
      {condition === 'rain' && (
        <g>
          <Cloud />
          <Drops count={3} />
        </g>
      )}
      {condition === 'heavy-rain' && (
        <g>
          <Cloud />
          <Drops count={4} heavy />
        </g>
      )}
      {condition === 'storm' && (
        <g>
          <Cloud />
          <Lightning />
        </g>
      )}
      {condition === 'snow' && (
        <g>
          <Cloud />
          <SnowDots />
        </g>
      )}
      {condition === 'night' && <Moon />}
    </svg>
  )
}
