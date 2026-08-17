import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Stopwatch based on real timestamps (performance.now) so it stays accurate even if the
 * tab/process is backgrounded and setInterval/rAF is throttled.
 */
export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0) // ms
  const [running, setRunning] = useState(false)
  const startRef = useRef(0)
  const baseRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    const now = performance.now()
    setElapsed(baseRef.current + (now - startRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    if (running) return
    startRef.current = performance.now()
    setRunning(true)
  }, [running])

  const pause = useCallback(() => {
    if (!running) return
    baseRef.current += performance.now() - startRef.current
    setElapsed(baseRef.current)
    setRunning(false)
  }, [running])

  const reset = useCallback(() => {
    baseRef.current = 0
    setElapsed(0)
    setRunning(false)
  }, [])

  const lap = useCallback(() => baseRef.current + (performance.now() - startRef.current), [])

  useEffect(() => {
    if (!running) return
    startRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running, tick])

  return { elapsed, running, start, pause, reset, lap }
}

/**
 * Countdown based on a fixed end timestamp. Survives backgrounding because remaining time
 * is recomputed from the wall clock on every tick and on visibility changes.
 */
export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds * 1000) // ms
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const endRef = useRef(0)
  const totalRef = useRef(initialSeconds * 1000)

  const setDuration = useCallback((seconds: number) => {
    totalRef.current = seconds * 1000
    setRemaining(seconds * 1000)
    setFinished(false)
    setRunning(false)
  }, [])

  const start = useCallback(() => {
    if (remaining <= 0) return
    endRef.current = performance.now() + remaining
    setRunning(true)
  }, [remaining])

  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRemaining(totalRef.current)
    setFinished(false)
    setRunning(false)
  }, [])

  useEffect(() => {
    if (!running) return
    const compute = () => {
      const left = endRef.current - performance.now()
      if (left <= 0) {
        setRemaining(0)
        setRunning(false)
        setFinished(true)
      } else {
        setRemaining(left)
      }
    }
    const id = window.setInterval(compute, 200)
    const onVisibility = () => compute()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [running])

  return { remaining, running, finished, start, pause, reset, setDuration }
}
