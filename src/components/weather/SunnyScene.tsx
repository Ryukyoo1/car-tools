interface SceneProps {
  reduced: boolean
}

// Clear-day scene: deep blue → blue-grey sky with a soft, slowly pulsing sun glow.
export function SunnyScene({ reduced }: SceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 14%, rgba(255,214,150,0.22), transparent 46%), linear-gradient(180deg, #0B1B33 0%, #0E2238 55%, #123048 100%)',
        }}
      />
      <div
        className={`absolute left-1/2 top-[12%] h-[46vh] w-[46vh] -translate-x-1/2 rounded-full ${
          reduced ? '' : 'sun-pulse'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(255,226,176,0.40), rgba(255,210,150,0.10) 45%, transparent 70%)',
        }}
      />
    </div>
  )
}
