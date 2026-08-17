// Formatting helpers

export function formatClock(date: Date = new Date()): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Format milliseconds into HH:MM:SS */
export function formatDuration(totalMs: number): string {
  const s = Math.max(0, Math.floor(totalMs / 1000))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '--'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export function formatRelativeDay(timestamp: number): string {
  const now = new Date()
  const d = new Date(timestamp)
  const sameDay =
    now.getFullYear() === d.getFullYear() &&
    now.getMonth() === d.getMonth() &&
    now.getDate() === d.getDate()
  if (sameDay) return 'Today'
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  const isYest =
    yest.getFullYear() === d.getFullYear() &&
    yest.getMonth() === d.getMonth() &&
    yest.getDate() === d.getDate()
  if (isYest) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
