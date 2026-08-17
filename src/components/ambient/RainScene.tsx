import { useEffect, useRef } from 'react'

interface SceneProps {
  reduced: boolean
}

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  opacity: number
}

// Canvas rain — calm, slow and sparse so it stays unobtrusive on a car screen.
export function RainScene({ reduced }: SceneProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let raf = 0
    let drops: Drop[] = []
    const count = 42

    const init = (w: number, h: number) => {
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 8 + Math.random() * 10,
        speed: 4 + Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.3,
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
        ctx.beginPath()
        ctx.strokeStyle = `rgba(150,180,214,${d.opacity})`
        ctx.lineWidth = 1.1
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 0.8, d.y + d.len)
        ctx.stroke()
        d.y += d.speed
        if (d.y > h) {
          d.y = -d.len
          d.x = Math.random() * w
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
  }, [reduced])

  return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0A1424 0%,#0E1C30 60%,#0B1726 100%)' }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
    </div>
  )
}
