import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

interface PlayButtonProps {
  playing: boolean
  onToggle: () => void
  accent: string
  label: string
}

// Large circular transport control. Minimum 88px tap target for car screens.
export function PlayButton({ playing, onToggle, accent, label }: PlayButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      whileTap={{ scale: 0.95 }}
      className="glass flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28"
      style={{ boxShadow: `0 0 50px ${accent}40, 0 10px 40px rgba(0,0,0,0.35)` }}
    >
      {playing ? (
        <Pause className="h-10 w-10 text-white" strokeWidth={1.8} />
      ) : (
        <Play className="ml-1 h-10 w-10 text-white" strokeWidth={1.8} />
      )}
    </motion.button>
  )
}
