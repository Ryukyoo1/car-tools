import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface ToolCardProps {
  to: string
  icon: LucideIcon
  title: string
  subtitle: string
}

export function ToolCard({ to, icon: Icon, title, subtitle }: ToolCardProps) {
  const navigate = useNavigate()
  return (
    <motion.button
      onClick={() => navigate(to)}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-card p-4 transition-colors hover:bg-card-hover sm:p-6"
    >
      <Icon className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={1.5} />
      <div className="text-center">
        <div className="text-lg font-semibold text-white sm:text-xl">{title}</div>
        <div className="mt-0.5 text-xs text-white/60 sm:text-sm">{subtitle}</div>
      </div>
    </motion.button>
  )
}
