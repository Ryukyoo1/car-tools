import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { Spinner } from '@/components/Spinner'
import { Flashlight as FlashlightIcon, Power } from 'lucide-react'

type Mode = 'loading' | 'bright' | 'torch' | 'unsupported'

export default function Flashlight() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<Mode>('loading')
  const [torchOn, setTorchOn] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (t: 'screen') => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      }
    } catch {
      /* wake lock unavailable — bright screen still works */
    }
  }

  const releaseWakeLock = () => {
    try {
      void wakeLockRef.current?.release()
    } catch {
      /* ignore */
    }
    wakeLockRef.current = null
  }

  const enterBright = () => {
    cleanup()
    setMode('bright')
    void requestWakeLock()
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setMode('bright')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const track = stream.getVideoTracks()[0]
        const caps = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
        if (caps.torch) {
          try {
            await track.applyConstraints({ advanced: [{ torch: true }] as unknown as MediaTrackConstraints['advanced'] })
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              await videoRef.current.play().catch(() => {})
            }
            setTorchOn(true)
            setMode('torch')
          } catch {
            enterBright()
          }
        } else {
          enterBright()
        }
      } catch {
        if (!cancelled) setMode('bright')
      }
    }

    void init()
    return () => {
      cancelled = true
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-acquire the wake lock if the browser drops it when the tab is hidden.
  useEffect(() => {
    const onVisible = () => {
      if (mode === 'bright' && !wakeLockRef.current) void requestWakeLock()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [mode])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] as unknown as MediaTrackConstraints['advanced'] })
      setTorchOn(next)
    } catch {
      /* ignore */
    }
  }

  const exit = () => {
    releaseWakeLock()
    cleanup()
    navigate('/')
  }

  // Bright screen mode — full white overlay at maximum brightness, tap to exit.
  if (mode === 'bright') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-black">
        <button onClick={exit} className="flex flex-col items-center gap-4 p-10" aria-label="Exit flashlight">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-black/50">Max Brightness</span>
          <FlashlightIcon className="h-24 w-24" strokeWidth={1.4} />
          <span className="text-2xl font-semibold">TAP TO EXIT</span>
        </button>
      </div>
    )
  }

  return (
    <ToolPage title="FLASHLIGHT" accent="yellow">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {mode === 'loading' && <Spinner size={36} />}

        {mode === 'torch' && (
          <>
            <GlassSurface variant="panel" className="relative overflow-hidden rounded-lg">
              <video ref={videoRef} playsInline muted className="h-48 w-64 object-cover opacity-40" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <FlashlightIcon
                  className={`h-20 w-20 ${torchOn ? 'text-accent' : 'text-white/40'}`}
                  strokeWidth={1.5}
                />
              </div>
            </GlassSurface>
            <p className="text-secondary">Torch {torchOn ? 'ON' : 'OFF'}</p>
            <GlassButton variant={torchOn ? 'danger' : 'primary'} size="lg" onClick={toggleTorch}>
              <Power className="h-6 w-6" strokeWidth={1.8} /> {torchOn ? 'Turn Off' : 'Turn On'}
            </GlassButton>
            <GlassButton variant="ghost" size="lg" onClick={enterBright}>
              <FlashlightIcon className="h-6 w-6" strokeWidth={1.8} /> Max Bright Screen
            </GlassButton>
          </>
        )}

        {mode === 'unsupported' && (
          <>
            <FlashlightIcon className="h-16 w-16 text-white/40" strokeWidth={1.5} />
            <p className="max-w-sm text-center text-secondary">
              Flashlight control is not available on this device. Use Bright Screen mode instead.
            </p>
            <GlassButton variant="primary" onClick={enterBright}>
              Bright Screen Mode
            </GlassButton>
          </>
        )}
      </div>
    </ToolPage>
  )
}
