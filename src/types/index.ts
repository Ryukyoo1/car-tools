// Shared domain types for CAR TOOLS

export interface ParkingRecord {
  id: string
  lat: number
  lon: number
  timestamp: number
  note: string
}

export interface TeslaMateConfig {
  /** TeslaMate HTTP API base, e.g. https://your-host/api/v1 */
  baseUrl: string
  /** API key, passed as the `api_key` query parameter */
  apiKey: string
  /** Vehicle id (TeslaMate calls it car_id), usually 1 */
  carId: number
}

export interface UserSettings {
  defaultElectricityPrice: number
  defaultBatteryCapacity: number
  lastLat: number | null
  lastLon: number | null
  lastCity: string | null
  tempUnit: 'C' | 'F'
  speedUnit: 'kmh' | 'mph'
  /** TeslaMate binding; null until the user connects. */
  teslamate: TeslaMateConfig | null
}

export type MapProvider = 'google' | 'apple' | 'amap'

export type {
  AmbientSource,
  AmbientLayer,
  AmbientPreset,
  AmbientSettings,
  TimerMinutes,
} from './ambient'

export interface GeocodeResult {
  name: string
  lat: number
  lon: number
  country?: string
  admin?: string
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  code: number
  condition: string
  description: string
}
