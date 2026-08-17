import { motion } from 'framer-motion'
import { Gauge, X } from 'lucide-react'
import { PlayButton } from './PlayButton'
import { VolumeControl } from './VolumeControl'
import { TimerControl } from './TimerControl'
import type { SourceMeta } from './SourceMeta'
import type { TimerMinutes } from '@/types/ambient'

interface DriveModeProps {
  meta: SourceMeta
  playing: boolean
  onTogglePlay: () => void
  master: number
  onMaster: (v: number) => void
  timer: TimerMinutes
  onSetTimer: (m: TimerMinutes) => void
  remainingLabel: string
  timerActive: boolean
  onClearTimer: () => void
  onExit: () => void
}

// Distraction-minimised mode: only the essentials, oversized for one-hand use.
export function DriveMode({
  meta,
  playing,
  onTogglePlay,
  master,
  onMaster,
  timer,
  onSetTimer,
  remainingLabel,
  timerActive,
  onClearTimer,
  onExit,
}: DriveModeProps) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-widest text-white/70">
          <Gauge className="h-5 w-5" /> DRIVE MODE
        </span>
        <button
          onClick={onExit}
          aria-label="Exit drive mode"
          className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <div className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{meta.label}</div>
          <div className="mt-1 text-base text-white/55">{meta.zh}</div>
        </div>

        <PlayButton playing={playing} onToggle={onTogglePlay} accent={meta.theme.accent} label={meta.label} />

        <div className="w-full max-w-md">
          <VolumeControl value={master} onChange={onMaster} accent={meta.theme.accent} />
        </div>

        <div className="w-full max-w-md">
          <TimerControl
            timer={timer}
            onSet={onSetTimer}
            remainingLabel={remainingLabel}
            active={timerActive}
            onClear={onClearTimer}
            accent={meta.theme.accent}
          />
        </div>
      </div>
    </motion.div>
  )
}
