import { useState, useEffect } from 'react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassTab } from '@/components/ui/GlassControls'
import { useStopwatch, useCountdown } from '@/hooks/useTimer'
import { formatDuration } from '@/utils/format'
import { Play, Pause, RotateCcw, Flag } from 'lucide-react'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

const QUICK = [1, 5, 10, 30]

function playBeep() {
  try {
    const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
    osc.onended = () => ctx.close()
  } catch {
    /* audio not available */
  }
}

function requestNotificationPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  } catch {
    /* notifications not available */
  }
}

function notifyFinished() {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CAR TOOLS', { body: 'Timer finished.' })
    }
  } catch {
    /* ignore */
  }
}

function StopwatchPanel() {
  const { elapsed, running, start, pause, reset, lap } = useStopwatch()
  const [laps, setLaps] = useState<number[]>([])

  const addLap = () => setLaps((prev) => [...prev, lap()])

  return (
    <GlassSurface
      variant="panel"
      glow
      className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-lg p-8"
    >
      <div className="tnum font-extralight leading-none tracking-tight text-white text-7xl sm:text-8xl">
        {formatDuration(elapsed / 1000)}
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {!running ? (
          <GlassButton variant="primary" size="lg" onClick={start}>
            <Play className="h-6 w-6" strokeWidth={1.8} /> Start
          </GlassButton>
        ) : (
          <GlassButton variant="secondary" size="lg" onClick={pause}>
            <Pause className="h-6 w-6" strokeWidth={1.8} /> Pause
          </GlassButton>
        )}
        <GlassButton variant="secondary" size="lg" onClick={addLap}>
          <Flag className="h-6 w-6" strokeWidth={1.8} /> Lap
        </GlassButton>
        <GlassButton
          variant="ghost"
          size="lg"
          onClick={() => {
            reset()
            setLaps([])
          }}
        >
          <RotateCcw className="h-6 w-6" strokeWidth={1.8} /> Reset
        </GlassButton>
      </div>

      {laps.length > 0 && (
        <div className="grid w-full max-w-xs grid-cols-2 gap-2">
          {laps.map((l, i) => (
            <div
              key={i}
              className="glass-soft flex items-center justify-between rounded-md px-4 py-3 text-sm"
            >
              <span className="font-medium tracking-wide text-muted">LAP {i + 1}</span>
              <span className="tnum text-white/90">{formatDuration(l / 1000)}</span>
            </div>
          ))}
        </div>
      )}
    </GlassSurface>
  )
}

function CountdownPanel() {
  const { remaining, running, finished, start, pause, reset, setDuration } = useCountdown(300)
  const [custom, setCustom] = useState('')
  const [activePreset, setActivePreset] = useState<number | null>(5)
  const [durationMs, setDurationMs] = useState(300_000)

  useEffect(() => {
    if (finished) {
      playBeep()
      notifyFinished()
    }
  }, [finished])

  const applyPreset = (m: number) => {
    setDuration(m * 60)
    setDurationMs(m * 60_000)
    setActivePreset(m)
  }

  const applyCustom = () => {
    const v = parseInt(custom, 10)
    if (v > 0) {
      setDuration(v * 60)
      setDurationMs(v * 60_000)
      setActivePreset(null)
    }
  }

  const progress = durationMs > 0 ? Math.min(1, Math.max(0, remaining / durationMs)) : 0
  const RING_R = 110
  const RING_C = 2 * Math.PI * RING_R

  return (
    <GlassSurface
      variant="panel"
      glow
      className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-lg p-8"
    >
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 240 240" className="h-64 w-64">
          <circle
            cx="120"
            cy="120"
            r={RING_R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="120"
            cy="120"
            r={RING_R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            transform="rotate(-90 120 120)"
            style={{
              filter: 'drop-shadow(0 0 6px var(--accent))',
              transition: 'stroke-dashoffset 0.2s linear',
            }}
          />
        </svg>
        <div className="tnum absolute font-extralight leading-none tracking-tight text-white text-6xl">
          {formatDuration(remaining / 1000)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {QUICK.map((m) => {
          const active = activePreset === m
          return (
            <GlassButton
              key={m}
              variant={active ? 'primary' : 'secondary'}
              size="md"
              accent="purple"
              className={active ? 'glow-accent' : ''}
              onClick={() => applyPreset(m)}
            >
              {m}m
            </GlassButton>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          placeholder="MIN"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="glass-soft h-[60px] w-28 rounded-md px-4 text-center text-white outline-none"
        />
        <GlassButton variant="secondary" onClick={applyCustom}>
          Set
        </GlassButton>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {!running ? (
          <GlassButton
            variant="primary"
            size="lg"
            disabled={remaining <= 0}
            onClick={() => {
              requestNotificationPermission()
              start()
            }}
          >
            <Play className="h-6 w-6" strokeWidth={1.8} /> Start
          </GlassButton>
        ) : (
          <GlassButton variant="secondary" size="lg" onClick={pause}>
            <Pause className="h-6 w-6" strokeWidth={1.8} /> Pause
          </GlassButton>
        )}
        <GlassButton variant="ghost" size="lg" onClick={reset}>
          <RotateCcw className="h-6 w-6" strokeWidth={1.8} /> Reset
        </GlassButton>
      </div>
    </GlassSurface>
  )
}

export default function Timer() {
  const [tab, setTab] = useState<'stopwatch' | 'countdown'>('stopwatch')
  return (
    <ToolPage title="TIMER" accent="purple">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-2">
        <GlassTab
          accent="purple"
          tabs={[
            { id: 'stopwatch', label: 'STOPWATCH' },
            { id: 'countdown', label: 'COUNTDOWN' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'stopwatch' | 'countdown')}
        />
        {tab === 'stopwatch' ? <StopwatchPanel /> : <CountdownPanel />}
      </div>
    </ToolPage>
  )
}
