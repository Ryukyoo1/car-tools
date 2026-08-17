interface SystemStatusProps {
  /** Status word — READY / ONLINE / OFFLINE. Kept short. */
  label?: string
  className?: string
}

/**
 * Tiny vehicle-context indicator — a calm LED dot plus a word.
 * Not a button, not a card. Reads as ambient system state.
 */
export function SystemStatus({ label = 'READY', className = '' }: SystemStatusProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/30" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_8px_0_rgba(255,255,255,0.5)]" />
      </span>
      <span className="text-[10px] font-medium tracking-[0.18em] text-white/40">{label}</span>
    </span>
  )
}
