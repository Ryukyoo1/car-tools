import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, RotateCw, MapPin } from 'lucide-react'
import { WeatherScene } from '@/components/weather/WeatherScene'
import { TopBar } from '@/components/weather/TopBar'
import { WeatherHero } from '@/components/weather/WeatherHero'
import { WeatherStats } from '@/components/weather/WeatherStats'
import { HourlyForecast } from '@/components/weather/HourlyForecast'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { DriveMode } from '@/components/weather/DriveMode'
import { WeatherSkeleton } from '@/components/weather/WeatherSkeleton'
import { LocationModal } from '@/components/weather/LocationModal'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassButton } from '@/components/ui/GlassButton'
import { useLocation } from '@/hooks/useLocation'
import { useWeather } from '@/hooks/useWeather'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { storage } from '@/services/storage'
import { weatherProvider, WeatherError } from '@/services/weather'
import type { GeocodeResult } from '@/types'
import type { TempUnit, SpeedUnit, WeatherData } from '@/types/weather'
import { relativeTime } from '@/utils/weather'

interface Resolved {
  lat: number
  lon: number
  name: string
}

export default function Weather() {
  const reduced = usePrefersReducedMotion()
  const loc = useLocation()

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState('')
  const [driveMode, setDriveMode] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const settings = storage.getUserSettings()
  const [tempUnit, setTempUnit] = useState<TempUnit>(settings.tempUnit)
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(settings.speedUnit)

  const applyResolved = (r: Resolved) => {
    setCoords({ lat: r.lat, lon: r.lon })
    setLocationName(r.name)
    storage.saveUserSettings({ lastLat: r.lat, lastLon: r.lon, lastCity: r.name })
    setModalOpen(false)
  }

  // Initial location: URL deep-link → last used → device geolocation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paramCity = params.get('city')?.trim()
    const paramLat = parseFloat(params.get('lat') || '')
    const paramLon = parseFloat(params.get('lon') || '')

    if (paramCity && !Number.isNaN(paramLat) && !Number.isNaN(paramLon)) {
      applyResolved({ lat: paramLat, lon: paramLon, name: paramCity })
      return
    }

    const s = storage.getUserSettings()
    if (s.lastLat != null && s.lastLon != null) {
      setCoords({ lat: s.lastLat, lon: s.lastLon })
      if (s.lastCity) setLocationName(s.lastCity)
      else {
        weatherProvider
          .reverseGeocode(s.lastLat, s.lastLon)
          .then((r) => r && setLocationName(r.name))
          .catch(() => {})
      }
      return
    }
    loc
      .request()
      .then(applyResolved)
      .catch(() => {
        /* denied / unavailable → user picks a city via the modal */
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const weather = useWeather(coords?.lat ?? 0, coords?.lon ?? 0, locationName)

  const handleSearch = async (q: string) => {
    if (!q.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      const res = await weatherProvider.geocodeCity(q.trim())
      setSearchResults(res)
      if (res.length === 0) setSearchError('未找到匹配的城市 / No matching city')
    } catch (e) {
      setSearchError(e instanceof WeatherError ? e.message : '搜索失败 / Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handlePick = (r: GeocodeResult) => {
    const name = `${r.name}${r.admin ? ', ' + r.admin : r.country ? ', ' + r.country : ''}`
    applyResolved({ lat: r.lat, lon: r.lon, name })
    setSearchResults([])
  }

  const handleUseLocation = () => {
    setSearchError(null)
    loc
      .request()
      .then(applyResolved)
      .catch(() => setSearchError('定位失败，请选择城市 / Location unavailable'))
  }

  const changeTemp = (u: TempUnit) => {
    setTempUnit(u)
    storage.saveUserSettings({ tempUnit: u })
  }
  const changeSpeed = (u: SpeedUnit) => {
    setSpeedUnit(u)
    storage.saveUserSettings({ speedUnit: u })
  }

  const openModal = () => {
    setSearchResults([])
    setSearchError(null)
    setModalOpen(true)
  }

  return (
    <ToolPage title="WEATHER" accent="blue" bleed hideNav>
      {coords && (
        <WeatherScene
          condition={weather.data?.condition ?? 'partly-cloudy'}
          isDay={weather.data?.isDay ?? true}
          reduced={reduced}
        />
      )}

      <div className="relative z-10 flex h-full flex-col">
        <TopBar locationName={locationName} onOpenLocation={openModal} />

        {!coords ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <h1 className="text-3xl font-light text-white">Dynamic Weather</h1>
            <p className="text-secondary">
              {loc.status === 'locating' ? '正在定位… / Locating…' : '选择城市以查看天气 / Select a location'}
            </p>
            <GlassButton variant="primary" onClick={openModal}>
              <MapPin className="h-5 w-5" strokeWidth={1.8} /> 选择位置
            </GlassButton>
          </div>
        ) : (
          <div className="no-scrollbar flex-1 overflow-y-auto lg:overflow-hidden">
            {weather.status === 'error' ? (
              <div className="glass mx-auto mt-10 max-w-md rounded-lg p-8 text-center">
                <p className="text-xl font-light text-white">Weather unavailable</p>
                <p className="mt-2 text-sm text-secondary">
                  Please check your connection.
                  <br />
                  {weather.error}
                </p>
                <GlassButton variant="primary" className="mt-5" onClick={weather.refetch}>
                  <RotateCw className="h-5 w-5" strokeWidth={1.8} /> Retry
                </GlassButton>
              </div>
            ) : weather.status === 'loading' && !weather.data ? (
              <div className="mx-auto max-w-[1080px]">
                <WeatherSkeleton />
              </div>
            ) : weather.data ? (
              <div className="mx-auto flex min-h-full max-w-[1080px] flex-col justify-center gap-7 px-4 py-6 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.55, ease: 'easeOut' }}
                >
                  <WeatherHero data={weather.data} tempUnit={tempUnit} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: 'easeOut', delay: 0.05 }}
                  className="w-full"
                >
                  <HourlyForecast hourly={weather.data.hourly} tempUnit={tempUnit} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: 'easeOut', delay: 0.1 }}
                  className="w-full"
                >
                  <WeatherStats data={weather.data} speedUnit={speedUnit} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: 'easeOut', delay: 0.15 }}
                  className="w-full"
                >
                  <DailyForecast daily={weather.data.daily} tempUnit={tempUnit} />
                </motion.div>

                {weather.stale && (
                  <p className="text-center text-xs text-white/45">{relativeTime(weather.data.fetchedAt)}</p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {weather.data && coords && (
          <button
            onClick={() => setDriveMode(true)}
            aria-label="进入驾驶模式"
            className="glass-soft absolute bottom-5 right-5 z-20 flex h-12 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-semibold tracking-wide text-white/90 transition-colors hover:bg-white/10"
          >
            <Gauge className="h-4 w-4" /> DRIVE MODE
          </button>
        )}
      </div>

      <AnimatePresence>
        {driveMode && weather.data && (
          <DriveMode data={weather.data} tempUnit={tempUnit} onExit={() => setDriveMode(false)} />
        )}
      </AnimatePresence>

      <LocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSearch={handleSearch}
        results={searchResults}
        searching={searching}
        onPick={handlePick}
        onUseLocation={handleUseLocation}
        locating={loc.status === 'locating'}
        tempUnit={tempUnit}
        speedUnit={speedUnit}
        onTempUnit={changeTemp}
        onSpeedUnit={changeSpeed}
        error={searchError}
      />
    </ToolPage>
  )
}
