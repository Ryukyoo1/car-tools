import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

// Touch-first sizing + the unified glass material. Keeps the same prop API so
// every existing call site (TopBar, LocationModal, weather/ambient sub-views)
// upgrades automatically.
const base =
  'inline-flex items-center justify-center gap-2 font-medium select-none transition-colors disabled:opacity-40 disabled:pointer-events-none'

const sizes: Record<Size, string> = {
  sm: 'min-h-[52px] px-5 text-lg rounded-md',
  md: 'min-h-[60px] px-6 text-lg rounded-md',
  lg: 'min-h-[72px] px-8 text-xl rounded-md',
}

const variants: Record<Variant, string> = {
  primary: 'bg-white text-black hover:bg-white/90',
  secondary: 'glass text-white hover:bg-white/[0.08]',
  ghost: 'bg-transparent text-white/80 hover:bg-white/5',
  danger: 'bg-accent-red text-white hover:bg-accent-red/90',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
