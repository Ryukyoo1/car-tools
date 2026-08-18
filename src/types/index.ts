// Shared domain types for CAR TOOLS

export interface ParkingRecord {
  id: string
  lat: number
  lon: number
  timestamp: number
  note: string
}

export interface UserSettings {
  defaultElectricityPrice: number
  defaultBatteryCapacity: number
  lastLat: number | null
  lastLon: number | null
  lastCity: string | null
  tempUnit: 'C' | 'F'
  speedUnit: 'kmh' | 'mph'
}

export type MapProvider = 'google' | 'apple' | 'amap'

export type {
  AmbientCategory,
  AmbientTrack,
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
