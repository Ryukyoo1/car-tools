import { useState } from 'react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { Spinner } from '@/components/Spinner'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useStopwatch } from '@/hooks/useTimer'
import { formatDuration, formatRelativeDay, formatTimeOfDay } from '@/utils/format'
import { storage } from '@/services/storage'
import { openNavigation } from '@/services/navigation'
import type { ParkingRecord } from '@/types'
import { MapPin, Navigation, Trash2, Play, Pause, RotateCcw, Save } from 'lucide-react'

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function Parking() {
  const geo = useGeolocation()
  const timer = useStopwatch()
  const [records, setRecords] = useState<ParkingRecord[]>(() => storage.getParkingRecords())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const saveLocation = async () => {
    setGeoError(null)
    setSaving(true)
    try {
      const coords = await geo.getCurrent()
      const record: ParkingRecord = {
        id: makeId(),
        lat: coords.lat,
        lon: coords.lon,
        timestamp: Date.now(),
        note: note.trim(),
      }
      setRecords(storage.saveParkingRecord(record))
      setNote('')
      if (!timer.running) timer.start()
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : 'Unable to get location.')
    } finally {
      setSaving(false)
    }
  }

  const remove = (id: string) => setRecords(storage.deleteParkingRecord(id))

  return (
    <ToolPage title="PARKING" accent="amber">
      <div className="mx-auto w-full max-w-md space-y-5 py-2">
        {/* Save location */}
        <GlassSurface variant="card" className="p-5">
          <div className="mb-3 flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5 text-accent" strokeWidth={1.8} />
            <h2 className="text-lg font-medium">Parking Location</h2>
          </div>
          <SafetyNotice />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="B2 · A区 · 23号"
            className="glass-soft mt-3 h-[60px] w-full rounded-md px-4 text-lg text-white outline-none focus:border-white/30"
          />
          <GlassButton
            variant="primary"
            size="lg"
            className="mt-3 w-full"
            onClick={saveLocation}
            disabled={saving || geo.loading}
          >
            {saving || geo.loading ? <Spinner size={22} /> : <Save className="h-6 w-6" strokeWidth={1.8} />}
            Save Location
          </GlassButton>
          {geoError && <p className="mt-2 text-sm text-accent">{geoError}</p>}
        </GlassSurface>

        {/* Parking timer */}
        <GlassSurface variant="card" className="p-5 text-center">
          <h2 className="mb-2 text-lg font-medium text-white">Parking Timer</h2>
          <div className="py-4 text-5xl font-light tnum text-white sm:text-6xl">
            {formatDuration(timer.elapsed / 1000)}
          </div>
          <div className="flex justify-center gap-3">
            {!timer.running ? (
              <GlassButton variant="secondary" size="lg" onClick={timer.start}>
                <Play className="h-6 w-6" strokeWidth={1.8} /> Start
              </GlassButton>
            ) : (
              <GlassButton variant="secondary" size="lg" onClick={timer.pause}>
                <Pause className="h-6 w-6" strokeWidth={1.8} /> Pause
              </GlassButton>
            )}
            <GlassButton variant="ghost" size="lg" onClick={timer.reset}>
              <RotateCcw className="h-6 w-6" strokeWidth={1.8} /> Reset
            </GlassButton>
          </div>
        </GlassSurface>

        {/* Recent records */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-white">Recent</h2>
          {records.length === 0 ? (
            <GlassSurface variant="card" className="p-8 text-center">
              <p className="text-white/80">No parking records</p>
              <p className="mt-1 text-sm text-muted">Save your parking location to see it here.</p>
            </GlassSurface>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <GlassSurface key={r.id} variant="card" className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">
                      {formatRelativeDay(r.timestamp)} · {formatTimeOfDay(r.timestamp)}
                    </span>
                    <button
                      onClick={() => remove(r.id)}
                      aria-label="Delete"
                      className="flex h-[60px] w-[60px] items-center justify-center rounded-full glass text-white/50 transition-colors hover:bg-white/[0.08] hover:text-accent"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.8} />
                    </button>
                  </div>
                  <p className="mt-1 truncate text-lg text-white">{r.note || 'Parked location'}</p>
                  <GlassButton variant="secondary" className="mt-3 w-full" onClick={() => openNavigation(r)}>
                    <Navigation className="h-5 w-5" strokeWidth={1.8} /> Navigate
                  </GlassButton>
                </GlassSurface>
              ))}
            </div>
          )}
        </section>
      </div>
    </ToolPage>
  )
}
