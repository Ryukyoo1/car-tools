import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { LiveClock } from './LiveClock'
import { formatTopDate } from '@/utils/weather'

interface TopBarProps {
  locationName: string
  onOpenLocation: () => void
}

// "Zhuhai, Guangdong" → { city: "Zhuhai", region: "Guangdong" }
// "Zhuhai, Guangdong, China" → { city: "Zhuhai", region: "Guangdong · China" }
function splitLocation(name: string): { city: string; region: string } {
  if (!name) return { city: '选择城市', region: 'Select location' }
  const idx = name.indexOf(',')
  if (idx === -1) return { city: name, region: '' }
  const city = name.slice(0, idx).trim()
  const region = name
    .slice(idx + 1)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' · ')
  return { city, region }
}

// Lightweight, mostly-transparent header. No heavy card — just the back affordance,
// the place (two-tier), and the live clock.
export function TopBar({ locationName, onOpenLocation }: TopBarProps) {
  const navigate = useNavigate()
  const { city, region } = splitLocation(locationName)
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
      <button
        onClick={() => navigate('/')}
        aria-label="返回 TOOLS"
        className="flex min-h-[60px] items-center gap-2 rounded-xl px-2 -ml-2 text-white/75 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.6} />
        <span className="text-sm font-light tracking-wide">TOOLS</span>
      </button>

      <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center text-center">
        <span className="max-w-[38vw] truncate text-xl font-medium text-white sm:text-2xl">{city}</span>
        {region && <span className="text-xs text-white/45">{region}</span>}
      </div>

      <div className="flex items-center gap-3 text-right">
        <div className="text-2xl font-light tabular-nums text-white/90 sm:text-3xl">
          <LiveClock />
        </div>
        <div className="hidden text-xs text-white/50 sm:block">{formatTopDate()}</div>
        <button
          onClick={onOpenLocation}
          aria-label="位置设置"
          className="flex min-h-[60px] min-w-[60px] items-center justify-center rounded-2xl transition-colors hover:bg-white/5"
        >
          <MapPin className="h-6 w-6 text-white/80" />
        </button>
      </div>
    </header>
  )
}
