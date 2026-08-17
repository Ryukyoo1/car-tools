// Weather domain types for the Dynamic Weather tool.
// The UI only ever speaks these types — it never sees provider-specific payloads.

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy-rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'night'

export interface HourlyWeather {
  /** Unix epoch milliseconds */
  time: number
  temperature: number
  condition: WeatherCondition
  code: number
  precipitationProbability: number | null
  isDay: boolean
}

export interface DailyWeather {
  /** Unix epoch milliseconds (start of day, local) */
  time: number
  condition: WeatherCondition
  code: number
  tempMax: number
  tempMin: number
}

export interface WeatherData {
  /** Human-readable place name, e.g. "Zhuhai, Guangdong" */
  location: string
  latitude: number
  longitude: number
  temperature: number
  feelsLike: number
  condition: WeatherCondition
  code: number
  isDay: boolean
  humidity: number | null
  windSpeed: number | null
  windDirection: number | null
  uvIndex: number | null
  /** Kilometers */
  visibility: number | null
  sunrise: number | null
  sunset: number | null
  hourly: HourlyWeather[]
  daily: DailyWeather[]
  /** Epoch ms when this snapshot was produced */
  fetchedAt: number
  /** True when served from cache because a fresh request failed */
  isCached: boolean
}

export type TempUnit = 'C' | 'F'
export type SpeedUnit = 'kmh' | 'mph'
