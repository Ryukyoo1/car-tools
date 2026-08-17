import { useEffect, useState } from 'react'
import { formatClock } from '@/utils/format'
import { fetchWeather } from '@/services/weather'
import { storage } from '@/services/storage'

// Home top bar: live clock + temperature (from the last known location, if any).
export function Header() {
  const [clock, setClock] = useState(() => formatClock())
  const [temp, setTemp] = useState<string>('--°C')

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const settings = storage.getUserSettings()
    if (settings.lastLat == null || settings.lastLon == null) return
    let cancelled = false
    fetchWeather(settings.lastLat, settings.lastLon)
      .then((w) => {
        if (!cancelled) setTemp(`${w.temperature}°C`)
      })
      .catch(() => {
        if (!cancelled) setTemp('--°C')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">CAR TOOLS</span>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-semibold tabular-nums text-white/90 sm:text-3xl">{clock}</span>
        <span className="text-xl font-medium tabular-nums text-white/70 sm:text-2xl">{temp}</span>
      </div>
    </div>
  )
}
