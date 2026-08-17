import { useEffect, useState } from 'react'
import { RainCanvas } from './RainScene'

interface SceneProps {
  reduced: boolean
}

// Thunderstorm scene: deep blue/violet sky, heavy rain, and a rare lightning flash
// (every 10–30s, never flickering fast).
export function StormScene({ reduced }: SceneProps) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (reduced) return
    let t1 = 0
    let t2 = 0
    const strike = () => {
      t1 = window.setTimeout(() => {
        setFlash(true)
        t2 = window.setTimeout(() => setFlash(false), 180)
        strike()
      }, 10000 + Math.random() * 20000)
    }
    strike()
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reduced])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0A0A1F 0%, #12122E 55%, #1A1633 100%)',
        }}
      />
      <RainCanvas variant="heavy" reduced={reduced} />
      <div
        className="absolute inset-0"
        style={{
          opacity: flash ? 0.07 : 0,
          transition: 'opacity 160ms ease-out',
          background:
            'radial-gradient(circle at 50% 0%, rgba(220,225,255,0.9), rgba(180,190,255,0.2) 30%, transparent 60%)',
        }}
      />
    </div>
  )
}
