import type { LucideIcon } from 'lucide-react'
import { Droplets, Wind, Sun, Eye } from 'lucide-react'
import type { WeatherData, SpeedUnit } from '@/types/weather'
import { formatWind, windDirectionLabel } from '@/utils/weather'

interface Item {
  icon: LucideIcon
  label: string
  value: string
  sub: string
}

function uvLevel(uv: number): string {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

// A single, quiet information bar (dashboard-instrument style) with hairline
// dividers — NOT four separate cards.
export function WeatherStats({ data, speedUnit }: { data: WeatherData; speedUnit: SpeedUnit }) {
  const items: Item[] = []
  if (data.humidity != null)
    items.push({ icon: Droplets, label: 'Humidity', value: `${data.humidity}%`, sub: '湿度' })
  if (data.windSpeed != null) {
    const dir = data.windDirection != null ? `${windDirectionLabel(data.windDirection)} ` : ''
    items.push({ icon: Wind, label: 'Wind', value: formatWind(data.windSpeed, speedUnit), sub: `${dir}风速` })
  }
  if (data.uvIndex != null)
    items.push({ icon: Sun, label: 'UV Index', value: `${data.uvIndex}`, sub: uvLevel(data.uvIndex) })
  if (data.visibility != null)
    items.push({ icon: Eye, label: 'Visibility', value: `${data.visibility} km`, sub: '能见度' })
  if (items.length === 0) return null

  return (
    <div className="flex w-full items-stretch justify-center">
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex flex-1 flex-col items-center justify-center px-2 py-3 text-center sm:px-6 ${
            i > 0 ? 'border-l border-white/10' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            <it.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
            {it.label}
          </div>
          <div className="tnum mt-1.5 text-2xl font-light tabular-nums text-white sm:text-3xl">
            {it.value}
          </div>
          <div className="mt-0.5 text-xs text-white/45">{it.sub}</div>
        </div>
      ))}
    </div>
  )
}
