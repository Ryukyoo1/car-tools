import { useEffect, useRef } from 'react'

interface SceneProps {
  reduced: boolean
}

interface Ember {
  x: number
  y: number
  vy: number
  vx: number
  r: number
  life: number
  opacity: number
}

// Rising embers — low particle count, slow rise, warm tones.
export function FireplaceScene({ reduced }: SceneProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let raf = 0
    let embers: Ember[] = []
    const count = 30

    const reset = (w: number, h: number, e?: Ember): Ember => ({
      x: w * (0.35 + Math.random() * 0.3),
      y: h * (0.78 + Math.random() * 0.12),
      vy: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
      life: 1,
      opacity: 0.4 + Math.random() * 0.5,
      ...(e ?? {}),
    })

    const init = (w: number, h: number) => {
      embers = Array.from({ length: count }, () => reset(w, h))
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
      for (const e of embers) {
        e.y -= e.vy
        e.x += e.vx
        e.life -= 0.004
        if (e.y < h * 0.3 || e.life <= 0) {
          Object.assign(e, reset(w, h))
          continue
        }
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,${150 + Math.floor(Math.random() * 60)},80,${e.opacity * e.life})`
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
        ctx.fill()
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
  }, [reduced])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#1A0E08 0%,#2A140A 55%,#1C0E07 100%)' }}
    >
      {/* Warm hearth glow */}
      <div
        className={`absolute bottom-[6%] left-1/2 h-[60%] w-[70%] -translate-x-1/2 rounded-full ${reduced ? '' : 'ember-flicker'}`}
        style={{ background: 'radial-gradient(circle, rgba(232,116,59,0.30), rgba(232,116,59,0.05) 55%, transparent 75%)' }}
      />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
    </div>
  )
}
