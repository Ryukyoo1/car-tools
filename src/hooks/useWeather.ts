import { useCallback, useEffect, useRef, useState } from 'react'
import { weatherProvider, WeatherError } from '@/services/weather'
import { storage } from '@/services/storage'
import type { WeatherData } from '@/types/weather'

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error'

const CURRENT_TTL = 10 * 60 * 1000 // 10 min — current weather caching window

interface WeatherState {
  data: WeatherData | null
  status: WeatherStatus
  error: string | null
  /** True when the visible data is served from cache because a refresh failed. */
  stale: boolean
  refetch: () => void
}

// Cache-first weather loader: shows the last successful snapshot instantly,
// then refreshes in the background (or only if the cache is older than TTL).
export function useWeather(lat: number, lon: number, name: string): WeatherState {
  const [data, setData] = useState<WeatherData | null>(null)
  const [status, setStatus] = useState<WeatherStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [nonce, setNonce] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const key = storage.weatherCacheKey(lat, lon)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Guard: never fetch the (0,0) "null island" before real coordinates exist.
    if (lat === 0 && lon === 0) {
      setStatus('idle')
      setError(null)
      setStale(false)
      return () => controller.abort()
    }

    const cached = storage.getWeatherCache(key)
    const fresh = cached != null && Date.now() - cached.fetchedAt < CURRENT_TTL

    if (cached) {
      setData({ ...cached, isCached: !fresh })
      setStatus('success')
      setError(null)
      setStale(!fresh)
    } else {
      setStatus('loading')
      setError(null)
      setStale(false)
    }

    // Skip network entirely if the cache is still fresh.
    if (fresh) return () => controller.abort()

    let cancelled = false
    weatherProvider
      .getWeather(lat, lon, { name, signal: controller.signal })
      .then((result) => {
        if (cancelled) return
        storage.saveWeatherCache(key, result)
        setData({ ...result, isCached: false })
        setStatus('success')
        setError(null)
        setStale(false)
      })
      .catch((e: unknown) => {
        if (cancelled || controller.signal.aborted) return
        const msg = e instanceof WeatherError ? e.message : 'Weather service unavailable.'
        if (cached) {
          // Keep showing the cached snapshot but flag it as stale.
          setData({ ...cached, isCached: true })
          setStatus('success')
          setStale(true)
          setError(null)
        } else {
          setStatus('error')
          setError(msg)
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [lat, lon, name, key, nonce])

  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  return { data, status, error, stale, refetch }
}
