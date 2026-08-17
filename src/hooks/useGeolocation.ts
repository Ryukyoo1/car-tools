import { useState, useCallback } from 'react'

export interface GeoState {
  coords: { lat: number; lon: number } | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ coords: null, loading: false, error: null })

  const getCurrent = useCallback(() => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not available.'
        setState({ coords: null, loading: false, error: msg })
        reject(new Error(msg))
        return
      }
      setState((s) => ({ ...s, loading: true, error: null }))
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
          setState({ coords, loading: false, error: null })
          resolve(coords)
        },
        (err) => {
          let msg = 'Location unavailable.'
          if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied.'
          else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location position unavailable.'
          else if (err.code === err.TIMEOUT) msg = 'Location request timed out.'
          setState({ coords: null, loading: false, error: msg })
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }, [])

  return { ...state, getCurrent }
}
