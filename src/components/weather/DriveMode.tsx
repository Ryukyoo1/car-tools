import { motion } from 'framer-motion'
import { X, AlertTriangle, Eye, Wind, Droplets } from 'lucide-react'
import type { WeatherData, TempUnit } from '@/types/weather'
import { WeatherGlyph } from './WeatherGlyph'
import { conditionLabel, formatTemp, hourLabel } from '@/utils/weather'

interface Props {
  data: WeatherData
  tempUnit: TempUnit
  onExit: () => void
}

// Drive Mode: only the essentials, extra-large, minimal interaction. Hourly,
// multi-day and the detailed chart are intentionally hidden here.
export function DriveMode({ data, tempUnit, onExit }: Props) {
  const label = conditionLabel(data.condition)
  const rainSoon = data.hourly.slice(0, 4).find((h) => (h.precipitationProbability ?? 0) >= 30)
  const dur = 0.4

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dur, ease: 'easeOut' }}
      className="absolute inset-0 z-30 flex flex-col bg-black/35 px-6 py-6 backdrop-blur-md"
    >
      <button
        onClick={onExit}
        aria-label="退出驾驶模式"
        className="absolute right-4 top-4 flex min-h-[64px] min-w-[64px] items-center justify-center rounded-2xl bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-8 w-8" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
        className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
      >
        <span className="text-sm font-medium tracking-[0.28em] text-white/45">DRIVE WEATHER</span>

        <WeatherGlyph
          condition={data.condition}
          size={128}
          className="text-white drop-shadow-[0_8px_40px_rgba(255,255,255,0.2)]"
        />

        <div className="tnum text-[clamp(110px,18vw,220px)] font-extralight leading-none tabular-nums text-white">
          {formatTemp(data.temperature, tempUnit)}
        </div>

        <div className="text-3xl font-medium text-white">
          {label.zh} <span className="text-2xl text-white/60">{label.en}</span>
        </div>
        <div className="text-xl text-white/80">体感 {formatTemp(data.feelsLike, tempUnit)}</div>

        {rainSoon && (
          <div className="mt-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-base text-white/90">
            <AlertTriangle className="h-5 w-5" style={{ color: 'var(--weather-warning)' }} strokeWidth={2} />
            <span>
              {hourLabel(rainSoon.time)} 前后可能有降雨
            </span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-lg text-white/85">
          {data.visibility != null && (
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-white/55" strokeWidth={1.8} />
              能见度 {data.visibility} km
            </span>
          )}
          {data.windSpeed != null && (
            <span className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-white/55" strokeWidth={1.8} />
              风速 {data.windSpeed} km/h
            </span>
          )}
          {data.humidity != null && (
            <span className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-white/55" strokeWidth={1.8} />
              湿度 {data.humidity}%
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
