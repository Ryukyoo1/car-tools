import { useCallback, useEffect, useRef, useState } from 'react'
import { ambientEngine } from '@/services/audio'
import { storage } from '@/services/storage'
import { AMBIENT_TRACKS, formatDuration } from '@/components/ambient/SourceMeta'
import type { AmbientTrack, TimerMinutes } from '@/types/ambient'

const FADE_AT = 10 // seconds before the sleep timer ends we begin ducking

export interface UseAmbient {
  supported: boolean
  playing: boolean
  currentTrack: AmbientTrack | null
  timer: TimerMinutes
  remaining: number
  remainingLabel: string
  timerFading: boolean
  needsResume: boolean
  playTrack: (track: AmbientTrack) => void
  togglePlay: () => void
  setTimer: (minutes: TimerMinutes) => void
  clearTimer: () => void
  resume: () => void
}

export function useAmbient(): UseAmbient {
  const initial = storage.getAmbientSettings()
  const initialTrack = AMBIENT_TRACKS.find((t) => t.id === initial.lastTrackId) ?? AMBIENT_TRACKS[0]

  const [currentTrack, setCurrentTrack] = useState<AmbientTrack | null>(null)
  const [playing, setPlaying] = useState(false)
  const [timer, setTimerState] = useState<TimerMinutes>(initial.timer)
  const [remaining, setRemaining] = useState(0)
  const [needsResume, setNeedsResume] = useState(false)
  const fadedRef = useRef(false)
  const lastTickRef = useRef(0)

  const supported = ambientEngine.isSupported()

  // ---- Persistence ----------------------------------------------------------
  useEffect(() => {
    storage.saveAmbientSettings({ timer, lastTrackId: currentTrack?.id ?? null })
  }, [timer, currentTrack])

  // ---- Sleep timer countdown (timestamp-based, survives background tabs) -----
  useEffect(() => {
    if (!playing || timer === 0) {
      lastTickRef.current = 0
      fadedRef.current = false
      if (timer === 0) setRemaining(0)
      return
    }
    if (remaining <= 0) setRemaining(timer * 60)
    const id = window.setInterval(() => {
      const now = Date.now()
      if (!lastTickRef.current) lastTickRef.current = now
      const dt = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      setRemaining((prev) => {
        const next = Math.max(0, prev - dt)
        if (next > 0 && next <= FADE_AT && !fadedRef.current) {
          fadedRef.current = true
          ambientEngine.fadeOut(FADE_AT, () => {
            setPlaying(false)
            setCurrentTrack(null)
            setTimerState(0)
          })
        }
        if (next <= 0) {
          window.clearInterval(id)
          setPlaying(false)
          setCurrentTrack(null)
          setTimerState(0)
        }
        return next
      })
    }, 250)
    return () => window.clearInterval(id)
  }, [playing, timer])

  // ---- Engine lifecycle -----------------------------------------------------
  useEffect(() => {
    return () => {
      ambientEngine.stop()
    }
  }, [])

  const playTrack = useCallback(
    async (track: AmbientTrack) => {
      if (currentTrack?.id === track.id && playing) {
        ambientEngine.stop()
        setPlaying(false)
        return
      }
      const ok = await ambientEngine.resume()
      if (!ok) {
        setNeedsResume(true)
        return
      }
      setNeedsResume(false)
      const started = await ambientEngine.play(track)
      if (started) {
        setCurrentTrack(track)
        setPlaying(true)
      }
    },
    [currentTrack, playing],
  )

  const togglePlay = useCallback(async () => {
    if (playing) {
      ambientEngine.stop()
      setPlaying(false)
      return
    }
    const track = currentTrack ?? initialTrack
    const ok = await ambientEngine.resume()
    if (!ok) {
      setNeedsResume(true)
      return
    }
    setNeedsResume(false)
    const started = await ambientEngine.play(track)
    if (started) {
      setCurrentTrack(track)
      setPlaying(true)
    }
  }, [playing, currentTrack, initialTrack])

  const setTimer = useCallback((minutes: TimerMinutes) => {
    setTimerState(minutes)
    setRemaining(minutes > 0 ? minutes * 60 : 0)
    fadedRef.current = false
    lastTickRef.current = 0
  }, [])

  const clearTimer = useCallback(() => {
    setTimerState(0)
    setRemaining(0)
    fadedRef.current = false
    lastTickRef.current = 0
  }, [])

  const resume = useCallback(() => {
    void ambientEngine.resume().then((ok) => {
      setNeedsResume(!ok)
      if (ok && currentTrack) {
        void ambientEngine.play(currentTrack).then((started) => {
          setPlaying(started)
        })
      }
    })
  }, [currentTrack])

  return {
    supported,
    playing,
    currentTrack,
    timer,
    remaining,
    remainingLabel: formatDuration(remaining),
    timerFading: fadedRef.current,
    needsResume,
    playTrack,
    togglePlay,
    setTimer,
    clearTimer,
    resume,
  }
}
