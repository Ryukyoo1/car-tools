import { useEffect, useState } from 'react'
import { formatClock } from '@/utils/format'

export function LiveClock() {
  const [time, setTime] = useState(() => formatClock())
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatClock()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return <span className="tabular-nums">{time}</span>
}
