import { useEffect, useState } from 'react'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

export interface ClockProps {
  /** Show the secondary date line (FRI · AUG 14). */
  withDate?: boolean
  className?: string
  timeClassName?: string
  dateClassName?: string
}

/** Live local clock — used in the home header and tool top-nav. */
export function Clock({ withDate = true, className = '', timeClassName = '', dateClassName = '' }: ClockProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')
  const dateLine = `${WEEKDAYS[now.getDay()]} · ${MONTHS[now.getMonth()]} ${now.getDate()}`

  return (
    <div className={className}>
      <div className={`tnum font-light tracking-tight text-white ${timeClassName}`}>
        {hh}:{mm}
      </div>
      {withDate && (
        <div className={`tnum text-white/45 ${dateClassName}`}>{dateLine}</div>
      )}
    </div>
  )
}
