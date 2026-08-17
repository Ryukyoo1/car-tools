import { useCallback, useEffect, useRef, useState } from 'react'
import { ambientEngine } from '@/services/audio'
import { storage } from '@/services/storage'
import { DEFAULT_LAYER_VOLUME, MAX_LAYERS } from '@/components/ambient/SourceMeta'
import { DEFAULT_PRESETS, formatClock } from '@/utils/ambient'
import type {
  AmbientLayer,
  AmbientPreset,
  AmbientSource,
  TimerMinutes,
} from '@/types/ambient'

const FADE_AT = 10 // seconds before the sleep timer ends we begin ducking

export interface UseAmbient {
  supported: boolean
  playing: boolean
  layers: AmbientLayer[]
  draft: AmbientLayer[]
  primary: AmbientSource
  mixCount: number
  master: number
  timer: TimerMinutes
  remaining: number
  remainingLabel: string
  timerFading: boolean
  needsResume: boolean
  favorites: AmbientPreset[]
  presetId: string | null
  defaultPresets: AmbientPreset[]
  togglePlay: () => void
  toggleSource: (source: AmbientSource) => void
  changeLayerVolume: (source: AmbientSource, volume: number) => void
  setMaster: (volume: number) => void
  setTimer: (minutes: TimerMinutes) => void
  clearTimer: () => void
  loadPreset: (preset: AmbientPreset) => void
  saveFavorite: (name: string) => void
  deleteFavorite: (id: string) => void
  resume: () => void
}

export function useAmbient(): UseAmbient {
  const initial = storage.getAmbientSettings()
  const initialDraft =
    initial.layers.length > 0 ? initial.layers : [{ source: 'rain' as AmbientSource, volume: DEFAULT_LAYER_VOLUME }]

  const [layers, setLayers] = useState<AmbientLayer[]>([])
  const [draft, setDraft] = useState<AmbientLayer[]>(initialDraft)
  const [master, setMasterState] = useState(initial.master)
  const [timer, setTimerState] = useState<TimerMinutes>(initial.timer)
  const [remaining, setRemaining] = useState(0)
  const [needsResume, setNeedsResume] = useState(false)
  const [favorites, setFavorites] = useState<AmbientPreset[]>(initial.favorites)
  const [presetId, setPresetId] = useState<string | null>(initial.presetId)

  const [supported] = useState<boolean>(ambientEngine.isSupported())
  const fadedRef = useRef(false)
  const lastTickRef = useRef(0)
  const playing = layers.length > 0

  // ---- Persistence ----------------------------------------------------------
  useEffect(() => {
    storage.saveAmbientSettings({ layers: draft, master, timer, presetId, favorites })
  }, [draft, master, timer, presetId, favorites])

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
          ambientEngine.fadeOutAll(FADE_AT)
        }
        if (next <= 0) {
          window.clearInterval(id)
          ambientEngine.stopAll()
          setLayers([])
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
      ambientEngine.stopAll()
    }
  }, [])

  const applyLayers = useCallback((next: AmbientLayer[]) => {
    next.forEach((l) => ambientEngine.setLayer(l.source, l.volume))
    setLayers(next)
    setDraft(next)
  }, [])

  const togglePlay = useCallback(() => {
    if (layers.length > 0) {
      ambientEngine.stopAll()
      setLayers([])
      return
    }
    const start = draft.length > 0 ? draft : [{ source: 'rain' as AmbientSource, volume: DEFAULT_LAYER_VOLUME }]
    void ambientEngine.resume().then((ok) => {
      if (!ok) {
        setNeedsResume(true)
        return
      }
      setNeedsResume(false)
      applyLayers(start)
    })
  }, [layers.length, draft, applyLayers])

  const toggleSource = useCallback(
    (source: AmbientSource) => {
      const existing = layers.find((l) => l.source === source)
      if (existing) {
        ambientEngine.removeLayer(source)
        const next = layers.filter((l) => l.source !== source)
        setLayers(next)
        if (next.length) setDraft(next)
        return
      }
      void ambientEngine.resume().then((ok) => {
        if (!ok) {
          setNeedsResume(true)
          return
        }
        setNeedsResume(false)
        let next = [...layers]
        if (next.length >= MAX_LAYERS) {
          const removed = next.shift()
          if (removed) ambientEngine.removeLayer(removed.source)
        }
        next.push({ source, volume: DEFAULT_LAYER_VOLUME })
        ambientEngine.setLayer(source, DEFAULT_LAYER_VOLUME)
        setLayers(next)
        setDraft(next)
      })
    },
    [layers],
  )

  const changeLayerVolume = useCallback(
    (source: AmbientSource, volume: number) => {
      ambientEngine.setLayerVolume(source, volume)
      const next = layers.map((l) => (l.source === source ? { ...l, volume } : l))
      setLayers(next)
      setDraft(next)
    },
    [layers],
  )

  const setMaster = useCallback((volume: number) => {
    ambientEngine.setMasterVolume(volume)
    setMasterState(volume)
  }, [])

  const setTimer = useCallback((minutes: TimerMinutes) => {
    setTimerState(minutes)
    fadedRef.current = false
    lastTickRef.current = 0
    setRemaining(minutes > 0 ? minutes * 60 : 0)
  }, [])

  const clearTimer = useCallback(() => {
    setTimerState(0)
    setRemaining(0)
    fadedRef.current = false
    lastTickRef.current = 0
  }, [])

  const loadPreset = useCallback(
    (preset: AmbientPreset) => {
      void ambientEngine.resume().then((ok) => {
        if (!ok) {
          setNeedsResume(true)
          return
        }
        setNeedsResume(false)
        ambientEngine.stopAll()
        const next = preset.layers.map((l) => ({ ...l }))
        applyLayers(next)
        setPresetId(preset.id)
      })
    },
    [applyLayers],
  )

  const saveFavorite = useCallback(
    (name: string) => {
      if (draft.length === 0) return
      const preset: AmbientPreset = {
        id: `fav-${Date.now()}`,
        name: name.trim() || 'My Mix',
        subtitle: draft.map((l) => l.source).join(' + '),
        layers: draft.map((l) => ({ ...l })),
      }
      setFavorites((prev) => [preset, ...prev].slice(0, 10))
      setPresetId(preset.id)
    },
    [draft],
  )

  const deleteFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id))
    setPresetId((cur) => (cur === id ? null : cur))
  }, [])

  const resume = useCallback(() => {
    void ambientEngine.resume().then((ok) => {
      setNeedsResume(!ok)
      if (ok && layers.length > 0) applyLayers(layers)
    })
  }, [layers, applyLayers])

  const primary: AmbientSource = layers[0]?.source ?? draft[0]?.source ?? 'rain'

  return {
    supported,
    playing,
    layers,
    draft,
    primary,
    mixCount: layers.length,
    master,
    timer,
    remaining,
    remainingLabel: formatClock(remaining),
    timerFading: fadedRef.current,
    needsResume,
    favorites,
    presetId,
    defaultPresets: DEFAULT_PRESETS,
    togglePlay,
    toggleSource,
    changeLayerVolume,
    setMaster,
    setTimer,
    clearTimer,
    loadPreset,
    saveFavorite,
    deleteFavorite,
    resume,
  }
}
