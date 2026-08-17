import type { DailyWeather, TempUnit } from '@/types/weather'
import { WeatherGlyph } from './WeatherGlyph'
import { formatTemp, dayLabel } from '@/utils/weather'

interface Props {
  daily: DailyWeather[]
  tempUnit: TempUnit
  className?: string
}

// Bottom strip — five days in a row. Today gets a subtle glass highlight; the
// rest stay transparent. No per-day cards.
export function DailyForecast({ daily, tempUnit, className = '' }: Props) {
  if (daily.length === 0) return null
  return (
    <section className={`w-full ${className}`}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-white/65">5 DAY FORECAST</h2>
        <span className="text-xs text-white/40">未来 5 天</span>
      </div>
      <div className="flex items-stretch justify-between gap-2">
        {daily.map((d, i) => {
          const today = i === 0
          return (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center gap-2 rounded-2xl px-1 py-3 ${
                today ? 'bg-white/[0.06] ring-1 ring-white/12' : ''
              }`}
            >
              <span className={`text-xs ${today ? 'text-white/85' : 'text-white/50'}`}>
                {dayLabel(d.time, i)}
              </span>
              <WeatherGlyph condition={d.condition} size={32} className="text-white/90" />
              <span className="text-sm font-semibold tabular-nums text-white">
                {formatTemp(d.tempMax, tempUnit)}
              </span>
              <span className="text-xs tabular-nums text-white/45">{formatTemp(d.tempMin, tempUnit)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
