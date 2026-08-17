import { useEffect, useRef } from 'react'

interface SceneProps {
  reduced: boolean
}

export type RainVariant = 'rain' | 'heavy' | 'snow'

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  opacity: number
}

// Canvas-based precipitation. Uses a capped device-pixel-ratio and a single RAF
// loop so it stays light on embedded / car-head-unit browsers.
export function RainCanvas({ variant = 'rain', reduced }: { variant?: RainVariant; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let raf = 0
    let drops: Drop[] = []
    // Cap particles for low CPU/GPU on embedded head units (spec: ≤ 50).
    const count = variant === 'snow' ? 40 : variant === 'heavy' ? 50 : 38

    const init = (w: number, h: number) => {
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: variant === 'snow' ? 1.4 : (variant === 'heavy' ? 14 : 10) + Math.random() * 8,
        speed: variant === 'snow' ? 0.4 + Math.random() * 0.6 : (variant === 'heavy' ? 9 : 6) + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.35,
      }))
    }

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init(w, h)
    }

    const render = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      for (const d of drops) {
        if (variant === 'snow') {
          ctx.beginPath()
          ctx.fillStyle = `rgba(222,232,246,${d.opacity})`
          ctx.arc(d.x, d.y, d.len, 0, Math.PI * 2)
          ctx.fill()
          d.y += d.speed
          d.x += Math.sin(d.y / 40) * 0.3
          if (d.y > h + 5) {
            d.y = -5
            d.x = Math.random() * w
          }
        } else {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(174,194,224,${d.opacity})`
          ctx.lineWidth = variant === 'heavy' ? 1.6 : 1.2
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - 1, d.y + d.len)
          ctx.stroke()
          d.y += d.speed
          if (d.y > h) {
            d.y = -d.len
            d.x = Math.random() * w
          }
        }
      }
    }

    const loop = () => {
      render()
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    if (reduced) render()
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [variant, reduced])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}

interface RainSceneProps extends SceneProps {
  variant?: RainVariant
}

// Rain / drizzle scene: deep blue-black sky with thin, slow, randomized rain.
export function RainScene({ reduced, variant = 'rain' }: RainSceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #060B16 0%, #0A1322 55%, #0D1A2C 100%)',
        }}
      />
      <RainCanvas variant={variant} reduced={reduced} />
    </div>
  )
}
