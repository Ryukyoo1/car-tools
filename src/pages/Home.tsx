import {
  Timer,
  Calculator,
  Ruler,
  Flashlight,
  CloudSun,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ToolGrid } from '@/components/layout/ToolGrid'
import { ToolCard } from '@/components/layout/ToolCard'
import { HomeHeader } from '@/components/layout/HomeHeader'
import { SystemStatus } from '@/components/layout/SystemStatus'
import type { AccentName } from '@/components/ui/GlassButton'

type ToolDef = {
  id: string
  to: string
  icon: LucideIcon
  title: string
  subtitle: string
  accent: AccentName
  emphasized?: boolean
}

// Static, data-driven grid definition.
const tools: ToolDef[] = [
  { id: 'timer', to: '/timer', icon: Timer, title: 'Timer', subtitle: '计时器', accent: 'purple' },
  { id: 'calculator', to: '/calculator', icon: Calculator, title: 'Calculator', subtitle: '计算器', accent: 'gray' },
  { id: 'measure', to: '/measure', icon: Ruler, title: 'Measure', subtitle: '测量', accent: 'cyan' },
  { id: 'flashlight', to: '/flashlight', icon: Flashlight, title: 'Flashlight', subtitle: '手电筒', accent: 'yellow' },
  { id: 'weather', to: '/weather', icon: CloudSun, title: 'Weather', subtitle: '天气', accent: 'blue', emphasized: true },
  { id: 'ambient', to: '/ambient', icon: Waves, title: 'Ambient', subtitle: '白噪音', accent: 'indigo' },
]

export default function Home() {
  return (
    <div className="page-bg relative flex h-[100dvh] flex-col overflow-hidden">
      {/* Ambient background glows — 2–3 huge blurred radials at very low opacity.
          They keep the black from feeling dead without ever competing with text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[55vmin] w-[55vmin] rounded-full opacity-50 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(91,156,255,0.10), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 h-[55vmin] w-[55vmin] rounded-full opacity-50 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(126,140,255,0.08), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[44%] h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[110px] ambient-breathe"
        style={{ background: 'radial-gradient(circle, rgba(91,156,255,0.06), transparent 70%)' }}
      />

      <HomeHeader />

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-6 sm:px-12">
        <ToolGrid>
          {tools.map((t) => (
            <ToolCard key={t.id} {...t} />
          ))}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              aria-hidden="true"
              className="aspect-square w-full rounded-tile border border-white/[0.04] bg-white/[0.012]"
            />
          ))}
        </ToolGrid>
      </main>

      <footer className="relative z-10 flex items-end justify-between px-6 pb-6 sm:px-12">
        <a
          href="https://resume.maono1.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-[0.15em] text-white/30 transition-colors hover:text-accent hover:underline"
        >
          may be i need a job. XD
        </a>
        <SystemStatus label="READY" />
      </footer>
    </div>
  )
}
