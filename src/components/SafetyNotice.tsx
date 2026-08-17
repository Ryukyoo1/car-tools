import { AlertTriangle } from 'lucide-react'

// Reminder shown on screens that require text input or complex interaction.
export function SafetyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-accent bg-accent-soft p-4 text-sm text-white/80">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <p>For your safety, use this feature only when parked.</p>
    </div>
  )
}
