import { useCallback, useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { weatherProvider } from '@/services/weather'

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error'

export interface ResolvedLocation {
  lat: number
  lon: number
  name: string
}

// Wraps the raw geolocation hook with reverse-geocoding so the UI gets a
// human-readable place name. Failures are non-fatal — the caller decides fallback.
export function useLocation() {
  const geo = useGeolocation()
  const [name, setName] = useState<string | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  const request = useCallback(async (): Promise<ResolvedLocation> => {
    setStatus('locating')
    try {
      const coords = await geo.getCurrent()
      const rev = await weatherProvider.reverseGeocode(coords.lat, coords.lon).catch(() => null)
      const placeName = rev?.name ?? 'Current Location'
      setName(placeName)
      setStatus('ready')
      return { lat: coords.lat, lon: coords.lon, name: placeName }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Location unavailable'
      setStatus(msg.includes('denied') ? 'denied' : 'error')
      throw e
    }
  }, [geo])

  const setManual = useCallback((loc: ResolvedLocation) => {
    setName(loc.name)
    setStatus('ready')
  }, [])

  return { ...geo, name, status, request, setManual }
}
