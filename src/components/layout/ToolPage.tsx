import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Clock } from './Clock'
import { IconButton, ACCENT_CLASS, type AccentName } from '@/components/ui/GlassButton'

export interface ToolPageProps {
  /** Display name, e.g. "WEATHER". */
  title: string
  accent?: AccentName
  children: ReactNode
  /** Extra element rendered on the right of the nav (defaults to the clock). */
  navRight?: ReactNode
  /** Removes the scroll container so full-bleed scenes (weather/ambient) can fill. */
  bleed?: boolean
  /** Hides the default top nav. Pages that bring their own header (Weather) can use this. */
  hideNav?: boolean
  /** Optional full-page backdrop rendered behind the nav and content. */
  backdrop?: ReactNode
  /** Override the --accent CSS variable with a custom color (hex/rgb/etc). */
  accentColor?: string
}

/**
 * Unified tool shell: a consistent top nav (back · title · clock) and a
 * content region. Every tool page wraps its content in <ToolPage /> so the
 * navigation, accent and spacing stay identical across the app.
 */
export function ToolPage({ title, accent = 'blue', children, navRight, bleed = false, hideNav = false, backdrop, accentColor }: ToolPageProps) {
  const navigate = useNavigate()
  return (
    <div
      className={`page-bg relative flex h-[100dvh] flex-col ${ACCENT_CLASS[accent]}`}
      style={accentColor ? ({ '--accent': accentColor } as React.CSSProperties) : undefined}
    >
      {backdrop && (
        <div className="absolute inset-0 z-0" aria-hidden>
          {backdrop}
        </div>
      )}
      {!hideNav && (
        <header className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
          <IconButton accent={accent} label="Back to CAR TOOLS" onClick={() => navigate('/')}>
            <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
          </IconButton>

          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-base font-medium tracking-[0.2em] text-white/80 sm:text-lg">
            {title}
          </h1>

          <div className="text-right">
            {navRight ?? <Clock withDate={false} timeClassName="text-2xl sm:text-3xl" />}
          </div>
        </header>
      )}

      {bleed ? (
        <div className="relative z-10 flex-1">{children}</div>
      ) : (
        <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-8">{children}</div>
      )}
    </div>
  )
}
