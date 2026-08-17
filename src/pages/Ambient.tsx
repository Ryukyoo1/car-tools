import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { AmbientScene } from '@/components/ambient/AmbientScene'
import { PlayButton } from '@/components/ambient/PlayButton'
import { VolumeControl } from '@/components/ambient/VolumeControl'
import { TimerControl } from '@/components/ambient/TimerControl'
import { SoundSelector } from '@/components/ambient/SoundSelector'
import { Mixer } from '@/components/ambient/Mixer'
import { PresetSelector } from '@/components/ambient/PresetSelector'
import { DriveMode } from '@/components/ambient/DriveMode'
import { SOURCE_META } from '@/components/ambient/SourceMeta'
import { ToolPage } from '@/components/layout/ToolPage'
import { Spinner } from '@/components/Spinner'
import { useAmbient } from '@/hooks/useAmbient'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { AmbientSource, TimerMinutes } from '@/types/ambient'

const SAFETY_KEY = 'ambientSafetySeen'

export default function Ambient() {
  const reduced = usePrefersReducedMotion()
  const ambient = useAmbient()

  const [driveMode, setDriveMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSafety, setShowSafety] = useState(() => {
    try {
      return localStorage.getItem(SAFETY_KEY) !== '1'
    } catch {
      return false
    }
  })
  const loadingTimer = useRef<number | null>(null)

  const meta = SOURCE_META[ambient.primary]
  const accent = meta.theme.accent
  const activeSet = new Set<AmbientSource>(ambient.layers.map((l) => l.source))

  // Clear the brief "starting" state once playback begins or resume is needed.
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

  // ---- Unsupported browser -----------------------------------------------
  if (!ambient.supported) {
    return (
      <ToolPage title="AMBIENT" accent="indigo">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <VolumeX className="h-12 w-12 text-accent" strokeWidth={1.8} />
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
      accentColor={meta.theme.accent}
      backdrop={<AmbientScene source={ambient.primary} reduced={reduced} />}
      bleed
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 no-scrollbar lg:flex-row lg:gap-6 lg:overflow-hidden lg:px-8">
          {/* Hero column: sound identity + transport + master volume */}
          <section className="flex flex-col items-center justify-center gap-6 lg:w-[40%] lg:shrink-0">
            <div className="text-center">
              <div className="text-5xl font-light tracking-tight text-white sm:text-6xl">{meta.label}</div>
              <div className="mt-1 text-base text-white/55">{meta.zh}</div>
              {ambient.mixCount > 1 && (
                <div
                  className="mx-auto mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  Mixing {ambient.mixCount} sounds
                </div>
              )}
            </div>

            <div className="relative">
              <PlayButton playing={ambient.playing} onToggle={handleTogglePlay} accent={accent} label={meta.label} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                  <Spinner size={32} />
                </div>
              )}
            </div>

            <div className="w-full max-w-sm">
              <VolumeControl value={ambient.master} onChange={ambient.setMaster} accent={accent} />
            </div>
          </section>

          {/* Controls column: timer, sources, mixer, presets */}
          <section className="flex flex-col gap-4 no-scrollbar lg:flex-1 lg:overflow-y-auto lg:pb-2">
            {showSafety && (
              <button
                onClick={dismissSafety}
                className="flex items-start gap-3 rounded-md border border-accent bg-accent-soft p-3 text-left text-sm text-white/80"
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

            <SoundSelector active={activeSet} primary={ambient.primary} onToggle={ambient.toggleSource} />

            <Mixer
              layers={ambient.layers}
              onChangeVolume={ambient.changeLayerVolume}
              onRemove={ambient.toggleSource}
              primary={ambient.primary}
            />

            <PresetSelector
              presets={ambient.defaultPresets}
              favorites={ambient.favorites}
              activeId={ambient.presetId}
              canSave={ambient.draft.length > 0}
              onLoad={ambient.loadPreset}
              onSave={ambient.saveFavorite}
              onDelete={ambient.deleteFavorite}
            />
          </section>
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

      {/* Resume overlay (autoplay policy blocked the AudioContext) */}
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
            playing={ambient.playing}
            onTogglePlay={ambient.togglePlay}
            master={ambient.master}
            onMaster={ambient.setMaster}
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
