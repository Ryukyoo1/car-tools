import { useState } from 'react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScreenRuler } from '@/components/measure/ScreenRuler'
import { Ruler, ArrowRight, Car } from 'lucide-react'
import { UNIT_OPTIONS, UNIT_LABELS, convertUnit, type UnitCategory } from '@/utils/units'
import { formatNumber } from '@/utils/format'
import { VEHICLE_SCREENS, ppiOf } from '@/data/vehicleScreens'

const CATEGORIES: { id: UnitCategory; label: string }[] = [
  { id: 'distance', label: 'Distance' },
  { id: 'speed', label: 'Speed' },
  { id: 'temperature', label: 'Temp' },
  { id: 'energy', label: 'Energy' },
  { id: 'power', label: 'Power' },
]

function UnitSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass-soft h-[60px] w-full rounded-md px-4 text-lg text-white outline-none focus:border-white/30"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0b1118]">
          {o}
        </option>
      ))}
    </select>
  )
}

function Converter() {
  const [category, setCategory] = useState<UnitCategory>('distance')
  const [value, setValue] = useState('1')
  const options = UNIT_OPTIONS[category]
  const [from, setFrom] = useState(options[0])
  const [to, setTo] = useState(options[1])

  const switchCategory = (c: UnitCategory) => {
    const opts = UNIT_OPTIONS[c]
    setCategory(c)
    setFrom(opts[0])
    setTo(opts[1])
  }

  const numeric = parseFloat(value)
  const result = convertUnit(category, numeric, from, to)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex items-center gap-2 text-white">
        <Ruler className="h-5 w-5 text-accent" strokeWidth={1.8} />
        <h2 className="text-lg font-medium">{UNIT_LABELS[category]} Converter</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <GlassButton
            key={c.id}
            size="sm"
            variant={category === c.id ? 'primary' : 'secondary'}
            onClick={() => switchCategory(c.id)}
          >
            {c.label}
          </GlassButton>
        ))}
      </div>

      <GlassSurface variant="card" className="p-5">
        <label className="mb-1 block text-xs text-secondary">Value</label>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="glass-soft h-[60px] w-full rounded-md px-4 text-2xl tnum text-white outline-none focus:border-white/30"
        />

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-secondary">From</label>
            <UnitSelect value={from} options={options} onChange={setFrom} />
          </div>
          <ArrowRight className="mb-4 h-5 w-5 text-muted" strokeWidth={1.8} />
          <div>
            <label className="mb-1 block text-xs text-secondary">To</label>
            <UnitSelect value={to} options={options} onChange={setTo} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-md border border-accent bg-accent-soft px-5 py-5">
          <span className="text-sm text-secondary">
            {Number.isFinite(numeric) ? formatNumber(numeric) : '--'} {from}
          </span>
          <ArrowRight className="h-4 w-4 text-accent" strokeWidth={2} />
          <span className="tnum text-2xl font-semibold text-accent">
            {Number.isFinite(result) ? formatNumber(result) : '--'} {to}
          </span>
        </div>
      </GlassSurface>
    </div>
  )
}

function ScreenRulerTab() {
  const [vehicleId, setVehicleId] = useState(VEHICLE_SCREENS[0].id)
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')

  const selected = VEHICLE_SCREENS.find((v) => v.id === vehicleId)!
  const ppi = ppiOf(selected)

  return (
    <div className="space-y-5">
      {/* Ruler — full width, no extra info */}
      <ScreenRuler ppi={ppi} unit={unit} />

      {/* Vehicle + unit selector — below the ruler */}
      <GlassSurface variant="card" className="mx-auto w-full max-w-2xl p-5">
        <label className="mb-2 flex items-center gap-1.5 text-xs text-secondary">
          <Car className="h-3.5 w-3.5" /> 车型
        </label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="glass-soft h-12 w-full rounded-md px-3 text-sm text-white outline-none focus:border-white/30"
        >
          {VEHICLE_SCREENS.map((v) => (
            <option key={v.id} value={v.id} className="bg-[#0b1118]">
              Tesla {v.model} · {Math.round(ppiOf(v))} PPI
            </option>
          ))}
        </select>

        <div className="mt-4 flex gap-2">
          <GlassButton
            size="sm"
            variant={unit === 'cm' ? 'primary' : 'secondary'}
            onClick={() => setUnit('cm')}
            className="flex-1"
          >
            厘米 (cm)
          </GlassButton>
          <GlassButton
            size="sm"
            variant={unit === 'in' ? 'primary' : 'secondary'}
            onClick={() => setUnit('in')}
            className="flex-1"
          >
            英寸 (in)
          </GlassButton>
        </div>
      </GlassSurface>
    </div>
  )
}

export default function Measure() {
  const [tab, setTab] = useState<'convert' | 'ruler'>('convert')

  return (
    <ToolPage title="MEASURE" accent="cyan">
      <div className="mx-auto w-full max-w-7xl space-y-5 py-2">
        <div className="mx-auto flex max-w-2xl gap-2">
          <GlassButton
            size="sm"
            variant={tab === 'convert' ? 'primary' : 'secondary'}
            onClick={() => setTab('convert')}
            className="flex-1"
          >
            换算
          </GlassButton>
          <GlassButton
            size="sm"
            variant={tab === 'ruler' ? 'primary' : 'secondary'}
            onClick={() => setTab('ruler')}
            className="flex-1"
          >
            屏幕尺子
          </GlassButton>
        </div>

        {tab === 'convert' ? <Converter /> : <ScreenRulerTab />}
      </div>
    </ToolPage>
  )
}
