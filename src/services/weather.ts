// Weather service. UI never talks to a provider directly — it talks to `weatherProvider`.
// Swap the exported provider to change the data source (Open-Meteo / WeatherAPI / OpenWeather)
// without touching any component.
//
// Current provider: Open-Meteo — free, no API key required, CORS-enabled.
// Network / permission failures surface as WeatherError; the app never fabricates data.
import type { WeatherData, WeatherCondition, HourlyWeather, DailyWeather } from '@/types/weather'
import type { GeocodeResult } from '@/types'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
// Keyless client-side reverse geocoder (CORS-friendly, best-effort only).
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

export class WeatherError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeatherError'
  }
}

/** Map a WMO weather interpretation code to our internal condition enum. */
export function conditionFromCode(code: number, isDay = true): WeatherCondition {
  if (!isDay && (code === 0 || code === 1 || code === 2 || code === 3)) return 'night'
  if (code === 0 || code === 1) return 'sunny'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'rain'
  if (code >= 61 && code <= 65) return code === 65 ? 'heavy-rain' : 'rain'
  if (code === 66 || code === 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return code === 82 ? 'heavy-rain' : 'rain'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

export interface WeatherProvider {
  id: string
  getWeather(
    lat: number,
    lon: number,
    opts?: { name?: string; signal?: AbortSignal },
  ): Promise<WeatherData>
  geocodeCity(query: string, signal?: AbortSignal): Promise<GeocodeResult[]>
  reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<GeocodeResult | null>
}

interface RawHourly {
  time: string[]
  temperature_2m?: (number | null)[]
  weather_code?: (number | null)[]
  precipitation_probability?: (number | null)[]
  is_day?: (number | null)[]
}

interface RawDaily {
  time: string[]
  weather_code?: (number | null)[]
  temperature_2m_max?: (number | null)[]
  temperature_2m_min?: (number | null)[]
}

class OpenMeteoProvider implements WeatherProvider {
  id = 'open-meteo'

  async getWeather(
    lat: number,
    lon: number,
    opts: { name?: string; signal?: AbortSignal } = {},
  ): Promise<WeatherData> {
    const url =
      `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,' +
      'wind_speed_10m,wind_direction_10m,uv_index,visibility,is_day' +
      '&hourly=temperature_2m,weather_code,precipitation_probability,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
      '&wind_speed_unit=kmh&timezone=auto&forecast_hours=24&forecast_days=5'

    let res: Response
    try {
      res = await fetch(url, { signal: opts.signal })
    } catch {
      throw new WeatherError('Weather service unavailable.')
    }
    if (!res.ok) throw new WeatherError('Weather service unavailable.')
    const data = (await res.json()) as {
      current?: Record<string, number>
      hourly?: RawHourly
      daily?: RawDaily
    }
    const cur = data.current
    if (!cur) throw new WeatherError('Weather data missing.')

    const isDay = cur.is_day === 1
    const condition = conditionFromCode(cur.weather_code, isDay)

    const hourly = this.mapHourly(data.hourly)
    const daily = this.mapDaily(data.daily)

    const visibilityM = cur.visibility
    return {
      location: opts.name?.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      latitude: lat,
      longitude: lon,
      temperature: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      condition,
      code: cur.weather_code,
      isDay,
      humidity: cur.relative_humidity_2m != null ? Math.round(cur.relative_humidity_2m) : null,
      windSpeed: cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : null,
      windDirection: cur.wind_direction_10m != null ? Math.round(cur.wind_direction_10m) : null,
      uvIndex: cur.uv_index != null ? Math.round(cur.uv_index) : null,
      visibility: visibilityM != null ? Math.round(visibilityM / 100) / 10 : null,
      sunrise: null,
      sunset: null,
      hourly,
      daily,
      fetchedAt: Date.now(),
      isCached: false,
    }
  }

  private mapHourly(raw?: RawHourly): HourlyWeather[] {
    if (!raw || !raw.time || raw.time.length === 0) return []
    const len = raw.time.length
    const now = Date.now()
    // Start at the current/next hour so the curve reads left-to-right into the future.
    let start = 0
    for (let i = 0; i < len; i++) {
      if (Date.parse(raw.time[i]) >= now - 30 * 60 * 1000) {
        start = i
        break
      }
    }
    const out: HourlyWeather[] = []
    const count = Math.min(24, len - start)
    for (let i = 0; i < count; i++) {
      const idx = start + i
      const code = raw.weather_code?.[idx] ?? 3
      const isDay = (raw.is_day?.[idx] ?? 1) === 1
      out.push({
        time: Date.parse(raw.time[idx]),
        temperature: Math.round(raw.temperature_2m?.[idx] ?? 0),
        condition: conditionFromCode(code, isDay),
        code,
        precipitationProbability:
          raw.precipitation_probability?.[idx] == null
            ? null
            : Math.round(raw.precipitation_probability[idx] as number),
        isDay,
      })
    }
    return out
  }

  private mapDaily(raw?: RawDaily): DailyWeather[] {
    if (!raw || !raw.time || raw.time.length === 0) return []
    const out: DailyWeather[] = []
    for (let i = 0; i < raw.time.length; i++) {
      const code = raw.weather_code?.[i] ?? 3
      out.push({
        time: Date.parse(raw.time[i]),
        condition: conditionFromCode(code, true),
        code,
        tempMax: Math.round(raw.temperature_2m_max?.[i] ?? 0),
        tempMin: Math.round(raw.temperature_2m_min?.[i] ?? 0),
      })
    }
    return out
  }

  async geocodeCity(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
    let res: Response
    try {
      res = await fetch(url, { signal })
    } catch {
      throw new WeatherError('Geocoding service unavailable.')
    }
    if (!res.ok) throw new WeatherError('Geocoding service unavailable.')
    const data = (await res.json()) as {
      results?: Array<{
        name: string
        latitude: number
        longitude: number
        country_code?: string
        admin1?: string
      }>
    }
    return (data.results ?? []).map((r) => ({
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country_code,
      admin: r.admin1,
    }))
  }

  async reverseGeocode(
    lat: number,
    lon: number,
    signal?: AbortSignal,
  ): Promise<GeocodeResult | null> {
    const url = `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) return null
      const d = (await res.json()) as {
        city?: string
        locality?: string
        principalSubdivision?: string
        countryName?: string
      }
      const name =
        d.city || d.locality || d.principalSubdivision || d.countryName || 'Current Location'
      return {
        name,
        lat,
        lon,
        country: d.countryName,
        admin: d.principalSubdivision,
      }
    } catch {
      return null
    }
  }
}

export const weatherProvider: WeatherProvider = new OpenMeteoProvider()

// Backwards-compatible thin wrappers (used by Home header etc.)
export function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  return weatherProvider.getWeather(lat, lon, { signal })
}

export function geocodeCity(name: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  return weatherProvider.geocodeCity(name, signal)
}
