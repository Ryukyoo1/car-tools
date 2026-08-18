import { Clock } from '@/components/layout/Clock'
import { SystemStatus } from '@/components/layout/SystemStatus'

/**
 * Home header — brand lockup on the left, live clock + vehicle context on the
 * right. No nav bar, no buttons. Just identity and time.
 */
export function HomeHeader() {
  return (
    <header className="relative z-10 flex items-start justify-between gap-4 px-6 pt-8 sm:px-12 sm:pt-9">
      <div>
        <h1 className="text-[28px] font-medium leading-none tracking-tight text-white sm:text-[30px]">
          TOOLS
        </h1>
        <p className="mt-2 text-[11px] font-medium tracking-[0.18em] text-white/35">
          IN-CAR UTILITIES
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <Clock
          timeClassName="text-[34px] leading-none tracking-tight text-white sm:text-[36px]"
          dateClassName="text-right text-[12px] tracking-[0.08em] text-white/45"
        />
        <SystemStatus label="READY" />
      </div>
    </header>
  )
}
