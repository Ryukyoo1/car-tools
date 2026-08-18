import { useEffect, useMemo, useRef, useState } from 'react'

type Unit = 'cm' | 'in'

interface Props {
  /** Physical pixels-per-inch of the selected vehicle screen. */
  ppi: number
  unit: Unit
}

const HEIGHT = 200
const LABEL_MARGIN = 36
const BASELINE = 168
const MAJOR_TOP = 48
const MED_TOP = 100
const MIN_TOP = 134
const LABEL_Y = 24

/**
 * A full-width, static on-screen ruler calibrated to the selected vehicle's
 * screen PPI. Drag the marker line to measure a specific length.
 */
export function ScreenRuler({ ppi, unit }: Props) {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const pxPerInch = ppi / dpr
  const pxPerCm = pxPerInch / 2.54
  const pxPerUnit = unit === 'cm' ? pxPerCm : pxPerInch

  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalUnits = width / pxPerUnit

  const ticks = useMemo(() => {
    if (!width) return []
    const minor = pxPerUnit >= 16 ? 0.1 : 0.5
    const out: { x: number; top: number; label?: string }[] = []
    const count = Math.floor(totalUnits / minor)
    for (let i = 0; i <= count; i++) {
      const u = i * minor
      const rounded = Math.round(u / minor) * minor
      const isMajor = Math.abs(rounded - Math.round(rounded)) < 1e-6
      const isMed = !isMajor && Math.abs(rounded * 2 - Math.round(rounded * 2)) < 1e-6
      const top = isMajor ? MAJOR_TOP : isMed ? MED_TOP : MIN_TOP
      out.push({
        x: u * pxPerUnit,
        top,
        label: isMajor ? String(Math.round(u)) : undefined,
      })
    }
    return out
  }, [width, pxPerUnit, totalUnits])

  const [marker, setMarker] = useState(0)
  const dragging = useRef(false)

  const setFromClient = (clientX: number) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(width, clientX - rect.left))
    setMarker(x)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setFromClient(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromClient(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  const measured = marker / pxPerUnit

  return (
    <div ref={wrapRef} className="select-none">
      <div
        className="relative cursor-ew-resize touch-none border-y border-white/10 bg-black/30"
        style={{ height: HEIGHT }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <svg width={width || '100%'} height={HEIGHT} className="block">
          <line
            x1={0}
            y1={BASELINE}
            x2={width}
            y2={BASELINE}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1}
          />
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x}
              y1={t.top}
              x2={t.x}
              y2={BASELINE}
              stroke={t.label ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'}
              strokeWidth={t.label ? 1.5 : 1}
            />
          ))}
          {ticks.map((t, i) =>
            t.label ? (
              <text
                key={`l${i}`}
                x={t.x}
                y={LABEL_Y}
                fill="rgba(255,255,255,0.9)"
                fontSize={18}
                textAnchor={t.x < 12 ? 'start' : 'middle'}
                fontWeight={600}
              >
                {t.label}
              </text>
            ) : null,
          )}
        </svg>

        {/* Draggable measurement marker — plain white line, value below.
            Container is centered on the marker coordinate so the 1px line
            aligns exactly with the tick, regardless of the label width. */}
        <div
          className="pointer-events-none absolute top-0 z-10 flex flex-col items-center"
          style={{ left: marker, height: HEIGHT, transform: 'translateX(-50%)' }}
        >
          <div className="w-px flex-1 bg-white/80" />
          <div className="mb-2 text-base font-semibold tabular-nums text-white">
            {measured.toFixed(unit === 'cm' ? 1 : 2)} {unit}
          </div>
        </div>
      </div>
    </div>
  )
}
