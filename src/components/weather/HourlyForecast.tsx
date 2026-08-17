import type { HourlyWeather, TempUnit } from '@/types/weather'
import { WeatherGlyph } from './WeatherGlyph'
import { formatTemp, hourLabel } from '@/utils/weather'

interface Props {
  hourly: HourlyWeather[]
  tempUnit: TempUnit
  className?: string
}

const VISIBLE = 12

// A light, borderless horizontal timeline. No chart, no rain bar — just the
// next 12 hours. The current hour gets a subtle glass highlight; everything
// else stays transparent. Scrolls horizontally with a hidden scrollbar.
export function HourlyForecast({ hourly, tempUnit, className = '' }: Props) {
  const hours = hourly.slice(0, VISIBLE)
  if (hours.length === 0) return null

  return (
    <section className={`flex w-full flex-col items-center ${className}`}>
      <div className="mb-3 flex items-center justify-center gap-3 px-1">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-white/65">HOURLY</h2>
        <span className="text-xs text-white/40">未来 12 小时</span>
      </div>

      <div className="flex w-full justify-center">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {hours.map((h, i) => {
            const now = i === 0
            return (
              <div
                key={i}
                className={`flex min-w-[62px] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 ${
                  now ? 'bg-white/[0.025]' : 'bg-transparent'
                }`}
              >
                <span className={`text-xs tabular-nums ${now ? 'text-white/85' : 'text-white/55'}`}>
                  {now ? 'Now' : hourLabel(h.time)}
                </span>
                <WeatherGlyph condition={h.condition} size={30} className="text-white/90" />
                <span className="text-base font-light tabular-nums text-white">
                  {formatTemp(h.temperature, tempUnit)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
