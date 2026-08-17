import { motion, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'

export type AccentName =
  | 'blue'
  | 'purple'
  | 'gray'
  | 'amber'
  | 'green'
  | 'cyan'
  | 'yellow'
  | 'indigo'
  | 'red'

export const ACCENT_CLASS: Record<AccentName, string> = {
  blue: 'accent-blue',
  purple: 'accent-purple',
  gray: 'accent-gray',
  amber: 'accent-amber',
  green: 'accent-green',
  cyan: 'accent-cyan',
  yellow: 'accent-yellow',
  indigo: 'accent-indigo',
  red: 'accent-red',
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  accent?: AccentName
  children: ReactNode
}

const BASE =
  'relative inline-flex items-center justify-center gap-2 font-medium select-none ' +
  'rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none'

const SIZES: Record<Size, string> = {
  sm: 'min-h-[52px] px-5 text-base',
  md: 'min-h-[60px] px-6 text-lg',
  lg: 'min-h-[72px] px-8 text-xl',
}

// Pill-width buttons read as the primary automotive action.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-white text-black hover:bg-white/90',
  secondary: 'glass text-white hover:bg-white/[0.08]',
  ghost: 'bg-transparent text-white/80 hover:bg-white/5',
  danger: 'bg-accent-red text-white hover:bg-accent-red/90',
}

export function GlassButton({
  variant = 'secondary',
  size = 'md',
  accent,
  className = '',
  children,
  ...rest
}: GlassButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${accent ? ACCENT_CLASS[accent] : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  accent?: AccentName
  children: ReactNode
  /** Diameter in px — defaults to 60 (car HMI minimum touch target). */
  size?: number
  label: string
}

/** Circular glass icon button. Minimum 60×60 for in-car touch. */
export function IconButton({
  accent,
  size = 60,
  className = '',
  children,
  label,
  ...rest
}: IconButtonProps) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center rounded-full glass text-white/90 hover:bg-white/[0.08] transition-colors ${
        accent ? ACCENT_CLASS[accent] : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
