import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

export interface GlassModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  /** Hide the default close button (e.g. when an explicit action exists). */
  hideClose?: boolean
}

/** Fullscreen-ish glass modal with a backdrop blur. */
export function GlassModal({ open, onClose, title, children, hideClose }: GlassModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-strong relative z-10 w-full max-w-xl rounded-t-lg sm:rounded-lg p-6 sm:p-8 max-h-[88vh] overflow-y-auto no-scrollbar"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {(title || !hideClose) && (
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="text-xl font-medium text-white">{title}</div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-10 w-10 items-center justify-center rounded-full glass text-white/70 hover:bg-white/[0.08]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
