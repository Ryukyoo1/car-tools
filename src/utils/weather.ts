// Weather-specific formatting & presentation helpers.
import type { WeatherCondition, TempUnit, SpeedUnit } from '@/types/weather'

export interface ConditionLabel {
  zh: string
  en: string
}

export const CONDITION_LABELS: Record<WeatherCondition, ConditionLabel> = {
  sunny: { zh: '晴', en: 'Sunny' },
  'partly-cloudy': { zh: '多云', en: 'Partly Cloudy' },
  cloudy: { zh: '阴', en: 'Cloudy' },
  rain: { zh: '小雨', en: 'Light Rain' },
  'heavy-rain': { zh: '大雨', en: 'Heavy Rain' },
  storm: { zh: '雷暴', en: 'Thunderstorm' },
  snow: { zh: '雪', en: 'Snow' },
  fog: { zh: '雾', en: 'Fog' },
  night: { zh: '晴夜', en: 'Clear Night' },
}

export function conditionLabel(condition: WeatherCondition): ConditionLabel {
  return CONDITION_LABELS[condition]
}

const cToF = (c: number): number => (c * 9) / 5 + 32

export function formatTemp(value: number, unit: TempUnit): string {
  const v = unit === 'F' ? cToF(value) : value
  return `${Math.round(v)}°`
}

export function formatWind(kmh: number, unit: SpeedUnit): string {
  const v = unit === 'mph' ? kmh * 0.621371 : kmh
  return `${Math.round(v)} ${unit === 'mph' ? 'mph' : 'km/h'}`
}

export function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

/** "Updated just now" / "Updated 8 min ago" */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Updated just now'
  if (min < 60) return `Updated ${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Updated ${hr} h ago`
  return `Updated ${Math.floor(hr / 24)} d ago`
}

export function formatTopDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Short hour label like "16:00" from epoch ms. */
export function hourLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function dayLabel(ts: number, index: number): string {
  if (index === 0) return 'Today'
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short' })
}
