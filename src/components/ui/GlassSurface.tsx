import { forwardRef, type HTMLAttributes } from 'react'

type Variant = 'surface' | 'panel' | 'card' | 'tile' | 'soft'

const VARIANT_CLASS: Record<Variant, string> = {
  surface: 'glass',
  panel: 'glass-strong',
  card: 'glass',
  tile: 'glass',
  soft: 'glass-soft',
}

const VARIANT_RADIUS: Record<Variant, string> = {
  surface: 'rounded-md',
  panel: 'rounded-lg',
  card: 'rounded-md',
  tile: 'rounded-tile',
  soft: 'rounded-md',
}

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  /** Adds an accent-colored glow (uses the active --accent). */
  glow?: boolean
  as?: 'div' | 'section' | 'article' | 'aside'
}

/**
 * The single glass container every surface in CAR TOOLS is built from.
 * Surfaces, panels, cards and tiles are all the same material — only the
 * radius and strength differ. Never hand-roll a glass background in a page.
 */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ variant = 'surface', glow = false, as = 'div', className = '', children, ...rest }, ref) => {
    const Tag = as as 'div'
    return (
      <Tag
        ref={ref}
        className={`${VARIANT_CLASS[variant]} ${VARIANT_RADIUS[variant]} ${
          glow ? 'glow-accent' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </Tag>
    )
  }
)

GlassSurface.displayName = 'GlassSurface'

/** Large content panel — the workhorse of every tool page. */
export function GlassPanel(props: GlassSurfaceProps) {
  return <GlassSurface variant="panel" {...props} />
}

/** Medium glass card — stats, lists, settings rows. */
export function GlassCard(props: GlassSurfaceProps) {
  return <GlassSurface variant="card" {...props} />
}

/** Tool tile — home grid cell. */
export function GlassTile(props: GlassSurfaceProps) {
  return <GlassSurface variant="tile" {...props} />
}
