import { type ReactNode } from 'react'

/**
 * Fixed 3×3 tool grid for the car HMI home screen.
 * Square cells; the surface always holds nine cells and missing tools leave
 * an empty slot rather than collapsing the layout. The ~600px width keeps the
 * three square rows inside a 720p viewport.
 *
 * The grid stays centered and intentionally does NOT fill the whole width —
 * it reads as a control surface floating in the cabin, not a dashboard.
 */
export function ToolGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[600px] grid-cols-3 gap-4 content-center">
      {children}
    </div>
  )
}
