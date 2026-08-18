// Unified localStorage wrapper. All persistence goes through here.
import type { ParkingRecord, UserSettings, AmbientSettings } from '@/types'
import type { WeatherData } from '@/types/weather'

const KEYS = {
  parkingRecords: 'parkingRecords',
  userSettings: 'userSettings',
  ambientSettings: 'ambientSettings',
  weatherCache: 'weatherCache',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / unavailable storage — never crash the app.
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultElectricityPrice: 0.65,
  defaultBatteryCapacity: 60,
  lastLat: null,
  lastLon: null,
  lastCity: null,
  tempUnit: 'C',
  speedUnit: 'kmh',
}

const DEFAULT_AMBIENT = {
  timer: 0 as number,
  lastTrackId: null as string | null,
}

export const storage = {
  getParkingRecords(): ParkingRecord[] {
    const list = read<ParkingRecord[]>(KEYS.parkingRecords, [])
    return Array.isArray(list) ? list : []
  },

  saveParkingRecord(record: ParkingRecord): ParkingRecord[] {
    const list = [record, ...this.getParkingRecords()].slice(0, 10)
    write(KEYS.parkingRecords, list)
    return list
  },

  deleteParkingRecord(id: string): ParkingRecord[] {
    const list = this.getParkingRecords().filter((r) => r.id !== id)
    write(KEYS.parkingRecords, list)
    return list
  },

  getUserSettings(): UserSettings {
    return { ...DEFAULT_SETTINGS, ...read<UserSettings>(KEYS.userSettings, DEFAULT_SETTINGS) }
  },

  saveUserSettings(patch: Partial<UserSettings>): UserSettings {
    const current = { ...this.getUserSettings(), ...patch }
    write(KEYS.userSettings, current)
    return current
  },

  getAmbientSettings(): AmbientSettings {
    const stored = read<Partial<AmbientSettings>>(KEYS.ambientSettings, {})
    return {
      timer: (stored.timer as AmbientSettings['timer']) ?? DEFAULT_AMBIENT.timer,
      lastTrackId: typeof stored.lastTrackId === 'string' ? stored.lastTrackId : DEFAULT_AMBIENT.lastTrackId,
    }
  },

  saveAmbientSettings(patch: Partial<AmbientSettings>): AmbientSettings {
    const current = { ...this.getAmbientSettings(), ...patch }
    write(KEYS.ambientSettings, current)
    return current
  },

  // ---- Weather cache -------------------------------------------------------
  // Keyed by a coarse lat/lon grid so nearby coordinates share a snapshot.
  weatherCacheKey(lat: number, lon: number): string {
    return `${lat.toFixed(1)},${lon.toFixed(1)}`
  },

  getWeatherCache(key: string): WeatherData | null {
    const all = read<Record<string, WeatherData>>(KEYS.weatherCache, {})
    return all[key] ?? null
  },

  saveWeatherCache(key: string, data: WeatherData): void {
    const all = read<Record<string, WeatherData>>(KEYS.weatherCache, {})
    all[key] = data
    // Keep at most 12 locations cached to bound storage.
    const keys = Object.keys(all)
    if (keys.length > 12) {
      const oldest = keys
        .sort((a, b) => (all[a].fetchedAt ?? 0) - (all[b].fetchedAt ?? 0))
        .slice(0, keys.length - 12)
      for (const k of oldest) delete all[k]
    }
    write(KEYS.weatherCache, all)
  },
}
