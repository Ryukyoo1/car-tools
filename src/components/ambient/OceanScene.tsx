interface SceneProps {
  reduced: boolean
}

// Build a seamless sine wave path across double width (period 500px) so a
// -50% translate loops perfectly. Filled down to the baseline.
function wavePath(amp: number, mid: number, width = 2000, height = 220, wavelength = 500): string {
  const step = 50
  let d = `M 0 ${height} L 0 ${mid + amp * Math.sin(0)}`
  for (let x = 0; x <= width; x += step) {
    const y = mid + amp * Math.sin((2 * Math.PI * x) / wavelength)
    d += ` L ${x} ${y.toFixed(1)}`
  }
  d += ` L ${width} ${height} Z`
  return d
}

function WaveLayer({ amp, color, opacity, duration, reduced }: { amp: number; color: string; opacity: number; duration: number; reduced: boolean }) {
  return (
    <svg
      className="absolute bottom-0 left-0 h-[40%] w-[200%]"
      viewBox="0 0 2000 220"
      preserveAspectRatio="none"
      style={reduced ? undefined : { animation: `wave-scroll ${duration}s linear infinite` }}
      aria-hidden
    >
      <path d={wavePath(amp, 70, 2000, 220)} fill={color} opacity={opacity} />
    </svg>
  )
}

// Layered, slow-moving ocean swells with parallax depth.
export function OceanScene({ reduced }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#06141C 0%,#0A2230 55%,#0C2A3A 100%)' }}
    >
      <div
        className="absolute left-1/2 top-[12%] h-1/2 w-1/2 -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(79,176,198,0.18), transparent 70%)' }}
      />
      <WaveLayer amp={26} color="#0E3346" opacity={0.9} duration={26} reduced={reduced} />
      <WaveLayer amp={18} color="#15566B" opacity={0.7} duration={18} reduced={reduced} />
      <WaveLayer amp={12} color="#2C7E96" opacity={0.5} duration={12} reduced={reduced} />
    </div>
  )
}
