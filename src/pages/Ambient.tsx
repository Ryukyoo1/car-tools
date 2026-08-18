import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, Volume2, AlertTriangle } from 'lucide-react'
import { AmbientScene } from '@/components/ambient/AmbientScene'
import { PlayButton } from '@/components/ambient/PlayButton'
import { TimerControl } from '@/components/ambient/TimerControl'
import { SoundList } from '@/components/ambient/SoundList'
import { CategoryIconGrid } from '@/components/ambient/CategoryIconGrid'
import { DriveMode } from '@/components/ambient/DriveMode'
import { CATEGORY_META } from '@/components/ambient/SourceMeta'
import { ToolPage } from '@/components/layout/ToolPage'
import { Spinner } from '@/components/Spinner'
import { useAmbient } from '@/hooks/useAmbient'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { AmbientCategory, TimerMinutes } from '@/types/ambient'

const SAFETY_KEY = 'ambientSafetySeen'

export default function Ambient() {
  const reduced = usePrefersReducedMotion()
  const ambient = useAmbient()

  const [driveMode, setDriveMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<AmbientCategory>('rain')
  const [showSafety, setShowSafety] = useState(() => {
    try {
      return localStorage.getItem(SAFETY_KEY) !== '1'
    } catch {
      return false
    }
  })
  const loadingTimer = useRef<number | null>(null)

  const current = ambient.currentTrack
  const category = current?.category ?? activeCategory ?? 'rain'
  const meta = CATEGORY_META[category]
  const accent = meta.theme.accent

  useEffect(() => {
    if (ambient.playing || ambient.needsResume) setLoading(false)
  }, [ambient.playing, ambient.needsResume])

  const handleTogglePlay = () => {
    if (!ambient.playing) {
      setLoading(true)
      if (loadingTimer.current) window.clearTimeout(loadingTimer.current)
      loadingTimer.current = window.setTimeout(() => setLoading(false), 1500)
    }
    ambient.togglePlay()
  }

  const dismissSafety = () => {
    setShowSafety(false)
    try {
      localStorage.setItem(SAFETY_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (!ambient.supported) {
    return (
      <ToolPage title="AMBIENT" accent="indigo">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <Volume2 className="h-12 w-12 text-white/40" strokeWidth={1.8} />
          <h2 className="text-xl font-light text-white">Audio unavailable</h2>
          <p className="max-w-sm text-secondary">
            Your browser does not support the Web Audio API required for ambient sounds.
          </p>
        </div>
      </ToolPage>
    )
  }

  return (
    <ToolPage
      title="AMBIENT"
      accent="indigo"
      accentColor={accent}
      backdrop={<AmbientScene source={category} reduced={reduced} />}
      bleed
    >
      <div
        className="relative z-10 flex h-full flex-col p-4 lg:flex-row lg:gap-5 lg:p-6"
        style={{ '--accent': accent } as { [key: string]: string }}
      >
        {/* Left: big player identity + transport */}
        <section className="glass flex shrink-0 flex-col items-center justify-center rounded-3xl px-6 py-8 lg:w-[38%] lg:py-0">
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-10">
            <div className="text-center">
              <div
                className="text-5xl font-light tracking-tight text-white sm:text-6xl"
                style={{ textShadow: `0 0 40px ${meta.theme.glow}` }}
              >
                {meta.label}
              </div>
              <div className="mt-1 text-base text-white/55">{meta.zh}</div>
            </div>

            <div className="relative">
              <PlayButton playing={ambient.playing} onToggle={handleTogglePlay} accent={accent} label={meta.label} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                  <Spinner size={32} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right: timer + category icons + sound list */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-0 py-0 no-scrollbar lg:px-0 lg:py-0">
          {showSafety && (
            <button
              onClick={dismissSafety}
              className="flex items-start gap-3 rounded-2xl border border-accent bg-accent-soft p-3 text-left text-sm text-white/80"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.8} />
              <span>
                Use only when parked. Tap to dismiss.
                <span className="ml-1 text-white/50">仅在停车时使用。</span>
              </span>
            </button>
          )}

          <TimerControl
            timer={ambient.timer}
            onSet={(m: TimerMinutes) => ambient.setTimer(m)}
            remainingLabel={ambient.remainingLabel}
            active={ambient.timer > 0 && ambient.playing}
            onClear={ambient.clearTimer}
            accent={accent}
          />

          <CategoryIconGrid activeCategory={activeCategory} onSelect={setActiveCategory} />

          <SoundList
            currentTrack={ambient.currentTrack}
            playing={ambient.playing}
            onPlay={ambient.playTrack}
            activeCategory={activeCategory}
          />

          {/* Spacer to keep drive-mode button clear */}
          <div className="h-20 lg:h-0" />
        </div>

        {/* Drive mode entry */}
        <button
          onClick={() => setDriveMode(true)}
          aria-label="Enter drive mode"
          className="glass absolute bottom-5 right-5 flex min-h-[60px] items-center gap-2 rounded-full px-5 text-sm font-semibold tracking-wide text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Gauge className="h-5 w-5" /> DRIVE MODE
        </button>
      </div>

      {/* Resume overlay */}
      <AnimatePresence>
        {ambient.needsResume && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={ambient.resume}
          >
            <Volume2 className="h-12 w-12 text-accent" strokeWidth={1.8} />
            <p className="text-lg font-medium text-white">Tap to resume audio</p>
            <p className="text-sm text-white/55">点击以恢复声音</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drive mode overlay */}
      <AnimatePresence>
        {driveMode && (
          <DriveMode
            meta={meta}
            currentTitle={current?.title}
            playing={ambient.playing}
            onTogglePlay={ambient.togglePlay}
            timer={ambient.timer}
            onSetTimer={ambient.setTimer}
            remainingLabel={ambient.remainingLabel}
            timerActive={ambient.timer > 0 && ambient.playing}
            onClearTimer={ambient.clearTimer}
            onExit={() => setDriveMode(false)}
          />
        )}
      </AnimatePresence>
    </ToolPage>
  )
}
