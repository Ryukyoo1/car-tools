import { useState, useEffect, useCallback } from 'react'

type DOConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

interface WebkitOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

export interface CompassState {
  heading: number | null
  available: boolean
  needsPermission: boolean
  error: string | null
  requestPermission: () => void
}

export function useCompass(): CompassState {
  const [heading, setHeading] = useState<number | null>(null)
  const [available, setAvailable] = useState(true)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setAvailable(false)
      setError('Orientation sensor unavailable.')
      return
    }

    const ctor = DeviceOrientationEvent as DOConstructor
    if (typeof ctor.requestPermission === 'function') {
      setNeedsPermission(true)
    }

    const handler = (event: DeviceOrientationEvent) => {
      const e = event as WebkitOrientationEvent
      let h: number | null = null
      if (typeof e.webkitCompassHeading === 'number') {
        h = e.webkitCompassHeading
      } else if (e.alpha != null) {
        // alpha is counter-clockwise from north; convert to clockwise compass heading.
        h = (360 - e.alpha) % 360
      }
      if (h != null) {
        setHeading(((h % 360) + 360) % 360)
        setError(null)
      } else {
        setAvailable(false)
        setError('Orientation sensor unavailable.')
      }
    }

    window.addEventListener('deviceorientation', handler)
    window.addEventListener('deviceorientationabsolute', handler)
    return () => {
      window.removeEventListener('deviceorientation', handler)
      window.removeEventListener('deviceorientationabsolute', handler)
    }
  }, [])

  const requestPermission = useCallback(() => {
    const ctor = DeviceOrientationEvent as DOConstructor
    if (typeof ctor.requestPermission !== 'function') return
    ctor
      .requestPermission()
      .then((res) => {
        if (res === 'granted') {
          setNeedsPermission(false)
          setError(null)
        } else {
          setError('Orientation permission denied.')
          setNeedsPermission(false)
        }
      })
      .catch(() => {
        setError('Orientation permission denied.')
        setNeedsPermission(false)
      })
  }, [])

  return { heading, available, needsPermission, error, requestPermission }
}
