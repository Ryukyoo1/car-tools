import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ACCENT_CLASS, type AccentName } from '@/components/ui/GlassButton'

export interface ToolCardProps {
  /** Stable id used as the React key in the parent grid. */
  id: string
  to: string
  icon: LucideIcon
  title: string
  subtitle: string
  accent: AccentName
  /** Weather / Charging / Parking read slightly warmer via a stronger tint. */
  emphasized?: boolean
}

/**
 * A single cell of the home 3×3 grid.
 *
 * One material (glass), one accent glow, no emoji. The icon + name are the only
 * content, so the grid reads as a calm utility surface — no live status line
 * competing with the labels.
 */
export function ToolCard({
  id,
  to,
  icon: Icon,
  title,
  subtitle,
  accent,
  emphasized = false,
}: ToolCardProps) {
  const navigate = useNavigate()
  const tint = emphasized
    ? 'color-mix(in srgb, var(--accent) 11%, transparent)'
    : 'color-mix(in srgb, var(--accent) 6%, transparent)'

  return (
    <motion.button
      type="button"
      onClick={() => navigate(to)}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      aria-label={`${title} — ${subtitle}`}
      className={`group relative flex aspect-square w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-tile border border-white/[0.07] bg-white/[0.035] p-4 text-left transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_24px_-8px_var(--accent)] ${ACCENT_CLASS[accent]}`}
    >
      {/* Very subtle accent gradient so the card "has a little color" */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-tile"
        style={{ background: `radial-gradient(130% 100% at 50% 0%, ${tint}, transparent 58%)` }}
      />
      {/* Hairline accent across the top for the emphasized trio */}
      {emphasized && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 45%, transparent), transparent)' }}
        />
      )}

      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent opacity-60 shadow-[0_0_18px_-12px_var(--accent)] transition-[opacity,box-shadow,transform] duration-200 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:shadow-[0_0_32px_-6px_var(--accent)]">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>

      <div className="relative text-center leading-tight">
        <div className="text-[18px] font-medium text-white">{title}</div>
        <div className="mt-0.5 text-[12px] text-white/55">{subtitle}</div>
      </div>
    </motion.button>
  )
}
