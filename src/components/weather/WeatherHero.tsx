import type { WeatherData, TempUnit } from '@/types/weather'
import { WeatherGlyph } from './WeatherGlyph'
import { conditionLabel, formatTemp } from '@/utils/weather'

interface Props {
  data: WeatherData
  tempUnit: TempUnit
}

// The hero is intentionally NOT a glass panel — it sits directly on the weather
// scene so the temperature reads as an overlay on the environment (Apple-Weather
// / Tesla HMI style). It is the single largest visual element on the page.
export function WeatherHero({ data, tempUnit }: Props) {
  const label = conditionLabel(data.condition)
  const feels = formatTemp(data.feelsLike, tempUnit)
  const today = data.daily[0]
  const raining =
    data.condition === 'rain' ||
    data.condition === 'heavy-rain' ||
    data.condition === 'storm' ||
    (data.hourly[0]?.precipitationProbability ?? 0) >= 40

  return (
    <div className="flex select-none flex-col items-center text-center">
      <WeatherGlyph
        condition={data.condition}
        size={108}
        className="mb-1 text-white/95 drop-shadow-[0_10px_50px_rgba(255,255,255,0.22)]"
      />

      <div className="leading-[0.82]">
        <span className="tnum text-[clamp(88px,11vw,128px)] font-light tracking-[-0.05em] text-white">
          {formatTemp(data.temperature, tempUnit)}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-medium text-white">{label.zh}</span>
        <span className="text-base font-light text-white/55">{label.en}</span>
      </div>

      <div className="mt-2 text-sm text-white/70">
        体感 <span className="tnum tabular-nums text-white/90">{feels}</span>
        {raining && <span className="ml-2 text-white/55">· 降雨中</span>}
      </div>

      {today && (
        <div className="mt-1.5 text-xs tracking-wide text-white/45">
          今日最高 {formatTemp(today.tempMax, tempUnit)}
          <span className="mx-1.5 text-white/25">·</span>
          最低 {formatTemp(today.tempMin, tempUnit)}
        </div>
      )}
    </div>
  )
}
