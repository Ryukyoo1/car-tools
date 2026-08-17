import { useState, useEffect, useCallback } from 'react'

/** Generic localStorage-backed state. Falls back gracefully if storage is unavailable. */
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw != null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  }, [key, value])

  const set = useCallback((v: T | ((prev: T) => T)) => setValue(v), [])
  return [value, set]
}
