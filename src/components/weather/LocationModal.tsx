import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import type { GeocodeResult } from '@/types'
import type { TempUnit, SpeedUnit } from '@/types/weather'

interface Props {
  open: boolean
  onClose: () => void
  onSearch: (query: string) => void
  results: GeocodeResult[]
  searching: boolean
  onPick: (r: GeocodeResult) => void
  onUseLocation: () => void
  locating: boolean
  tempUnit: TempUnit
  speedUnit: SpeedUnit
  onTempUnit: (u: TempUnit) => void
  onSpeedUnit: (u: SpeedUnit) => void
  error?: string | null
}

export function LocationModal({
  open,
  onClose,
  onSearch,
  results,
  searching,
  onPick,
  onUseLocation,
  locating,
  tempUnit,
  speedUnit,
  onTempUnit,
  onSpeedUnit,
  error,
}: Props) {
  const [query, setQuery] = useState('')

  return (
    <Modal open={open} onClose={onClose} title="位置与单位">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-[60px] flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4">
            <Search className="h-5 w-5 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
              placeholder="搜索城市 (珠海 / Zhuhai)"
              aria-label="搜索城市"
              className="h-full flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/40"
            />
          </div>
          <Button onClick={() => onSearch(query)} disabled={searching} aria-label="搜索">
            {searching ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
          </Button>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="no-scrollbar max-h-48 space-y-2 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onPick(r)}
              className="flex min-h-[60px] w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/10"
            >
              <span className="text-white">{r.name}</span>
              <span className="text-sm text-white/50">{r.admin ?? r.country}</span>
            </button>
          ))}
        </div>

        <Button variant="secondary" className="w-full" onClick={onUseLocation} disabled={locating}>
          <MapPin className="h-5 w-5" />
          {locating ? '定位中…' : '使用我的位置'}
        </Button>

        <div className="space-y-3 border-t border-white/10 pt-4">
          <div>
            <div className="mb-2 text-sm text-white/60">温度单位</div>
            <div className="flex gap-2">
              {(['C', 'F'] as TempUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onTempUnit(u)}
                  className={`min-h-[60px] flex-1 rounded-2xl border text-lg transition-colors ${
                    tempUnit === u
                      ? 'border-white/40 bg-white/15 text-white'
                      : 'border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {u === 'C' ? '°C' : '°F'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-white/60">风速单位</div>
            <div className="flex gap-2">
              {(['kmh', 'mph'] as SpeedUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onSpeedUnit(u)}
                  className={`min-h-[60px] flex-1 rounded-2xl border text-lg transition-colors ${
                    speedUnit === u
                      ? 'border-white/40 bg-white/15 text-white'
                      : 'border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {u === 'kmh' ? 'km/h' : 'mph'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
