// Shimmer-style loading placeholder that mirrors the new centered layout.
// No "Loading..." text — just quiet placeholder blocks.
export function WeatherSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1080px] animate-pulse flex-col items-center gap-9 py-10">
      <div className="flex flex-col items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-white/10" />
        <div className="h-28 w-56 rounded-2xl bg-white/10" />
        <div className="h-5 w-32 rounded-lg bg-white/10" />
      </div>
      <div className="flex w-full gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 min-w-[62px] flex-1 rounded-2xl bg-white/10" />
        ))}
      </div>
      <div className="flex w-full gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 flex-1 rounded-2xl bg-white/10" />
        ))}
      </div>
      <div className="flex w-full gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 flex-1 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  )
}
