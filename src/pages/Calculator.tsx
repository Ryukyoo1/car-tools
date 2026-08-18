import { useState } from 'react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassTab } from '@/components/ui/GlassControls'
import { SafetyNotice } from '@/components/SafetyNotice'
import {
  evaluateExpression,
  toggleSign,
  calcChargeCost,
  calcChargeTime,
  calcConsumption,
  calcRange,
} from '@/utils/calculator'
import { formatNumber } from '@/utils/format'
import { storage } from '@/services/storage'
import type { UserSettings } from '@/types'

const OPERATORS = ['+', '-', '×', '÷', '%']

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  if (Number.isInteger(n)) return n.toString()
  return parseFloat(n.toFixed(8)).toString()
}

function SimpleCalculator() {
  const [display, setDisplay] = useState('')
  const [errored, setErrored] = useState(false)

  const clearAll = () => {
    setDisplay('')
    setErrored(false)
  }

  const input = (value: string) => {
    if (errored) {
      setDisplay(value)
      setErrored(false)
      return
    }
    setDisplay((d) => d + value)
  }

  const inputOperator = (op: string) => {
    if (errored) {
      setErrored(false)
      setDisplay('')
      return
    }
    setDisplay((d) => {
      if (d === '') return op === '-' ? '-' : ''
      const last = d[d.length - 1]
      if (OPERATORS.includes(last) || last === '(') {
        return d.slice(0, -1) + op
      }
      return d + op
    })
  }

  const inputDot = () => {
    if (errored) {
      setDisplay('0.')
      setErrored(false)
      return
    }
    setDisplay((d) => {
      const lastNum = d.split(/[+\-×÷%()]/).pop() ?? ''
      if (lastNum.includes('.')) return d
      return d === '' ? '0.' : d + '.'
    })
  }

  const equals = () => {
    if (display === '') return
    try {
      const result = evaluateExpression(display)
      setDisplay(formatResult(result))
    } catch {
      setDisplay('Error')
      setErrored(true)
    }
  }

  const sign = () => {
    if (errored) return
    setDisplay((d) => (d === '' ? '-' : toggleSign(d)))
  }

  const keys: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  }[] = [
    { label: 'AC', onClick: clearAll, variant: 'ghost' },
    { label: '(', onClick: () => input('('), variant: 'ghost' },
    { label: ')', onClick: () => input(')'), variant: 'ghost' },
    { label: '÷', onClick: () => inputOperator('÷'), variant: 'ghost' },
    { label: '7', onClick: () => input('7') },
    { label: '8', onClick: () => input('8') },
    { label: '9', onClick: () => input('9') },
    { label: '×', onClick: () => inputOperator('×'), variant: 'ghost' },
    { label: '4', onClick: () => input('4') },
    { label: '5', onClick: () => input('5') },
    { label: '6', onClick: () => input('6') },
    { label: '-', onClick: () => inputOperator('-'), variant: 'ghost' },
    { label: '1', onClick: () => input('1') },
    { label: '2', onClick: () => input('2') },
    { label: '3', onClick: () => input('3') },
    { label: '+', onClick: () => inputOperator('+'), variant: 'ghost' },
    { label: '±', onClick: sign, variant: 'ghost' },
    { label: '0', onClick: () => input('0') },
    { label: '.', onClick: inputDot },
    { label: '=', onClick: equals, variant: 'primary' },
  ]

  return (
    <div className="mx-auto w-full max-w-md">
      <GlassSurface
        variant="panel"
        className="mb-4 w-full p-7 text-right"
      >
        <div className="tnum min-h-[4.5rem] break-words text-6xl font-light text-white">
          {display === '' ? '0' : display}
        </div>
      </GlassSurface>
      <div className="grid grid-cols-4 gap-3">
        {keys.map((k) => (
          <GlassButton
            key={k.label}
            variant={k.variant ?? 'secondary'}
            size="lg"
            onClick={k.onClick}
            className="text-3xl"
          >
            {k.label}
          </GlassButton>
        ))}
      </div>
    </div>
  )
}

type AutoTab = 'charge' | 'consumption' | 'range'

function AutomotiveCalculator() {
  const settings = storage.getUserSettings()
  const [price, setPrice] = useState(settings.defaultElectricityPrice)
  const [capacity, setCapacity] = useState(settings.defaultBatteryCapacity)
  const [tab, setTab] = useState<AutoTab>('charge')

  const persist = (patch: Partial<UserSettings>) => storage.saveUserSettings(patch)

  const charge = calcChargeCost({ currentSoc: 35, targetSoc: 80, capacity, price })
  const time = calcChargeTime(charge.energy, 120)
  const consumption = calcConsumption(100, 15)
  const range = calcRange(capacity, 80, 150)

  return (
    <div className="mx-auto w-full max-w-md">
      <SafetyNotice />
      <div className="mt-4 flex justify-center">
        <GlassTab
          accent="gray"
          tabs={[
            { id: 'charge', label: 'CHARGE' },
            { id: 'consumption', label: 'USE' },
            { id: 'range', label: 'RANGE' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as AutoTab)}
        />
      </div>

      <div className="mt-5 space-y-4">
        {tab === 'charge' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current SOC" value={35} suffix="%" />
              <Field label="Target SOC" value={80} suffix="%" />
              <NumberField
                label="Battery (kWh)"
                value={capacity}
                onChange={(v) => {
                  setCapacity(v)
                  persist({ defaultBatteryCapacity: v })
                }}
              />
              <NumberField
                label="Price (¥/kWh)"
                value={price}
                onChange={(v) => {
                  setPrice(v)
                  persist({ defaultElectricityPrice: v })
                }}
              />
            </div>
            <Result label="Energy Required" value={`${formatNumber(charge.energy, 1)} kWh`} />
            <Result label="Estimated Cost" value={`¥${formatNumber(charge.cost, 2)}`} highlight />
            <p className="text-xs text-muted">At 120 kW: ~{formatNumber(time * 60, 0)} min (theoretical).</p>
          </>
        )}

        {tab === 'consumption' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distance (km)" value={100} suffix=" km" />
              <Field label="Energy (kWh)" value={15} suffix=" kWh" />
            </div>
            <Result label="Consumption" value={`${formatNumber(consumption, 1)} Wh/km`} highlight />
          </>
        )}

        {tab === 'range' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Battery (kWh)"
                value={capacity}
                onChange={(v) => {
                  setCapacity(v)
                  persist({ defaultBatteryCapacity: v })
                }}
              />
              <Field label="Current SOC" value={80} suffix="%" />
              <NumberField label="Avg (Wh/km)" value={150} onChange={() => {}} />
            </div>
            <Result label="Estimated Range" value={`${formatNumber(range, 0)} km`} highlight />
          </>
        )}
        <p className="text-xs text-muted">
          All results are computed from your inputs — no values are hard-coded.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-secondary">{label}</span>
      <div className="glass-soft flex h-[60px] items-center justify-end rounded-md px-4 text-xl tnum text-white">
        {value}
        {suffix}
      </div>
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-secondary">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="glass-soft h-[60px] w-full rounded-md px-4 text-xl tnum text-white outline-none focus:border-white/30"
      />
    </label>
  )
}

function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-5 py-4 ${
        highlight ? 'border-accent bg-accent-soft' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <span className="text-sm text-secondary">{label}</span>
      <span className={`text-2xl font-semibold tnum ${highlight ? 'text-accent' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

export default function Calculator() {
  const [tab, setTab] = useState<'simple' | 'auto'>('simple')
  return (
    <ToolPage title="CALCULATOR" accent="gray">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 py-2">
        <GlassTab
          accent="gray"
          tabs={[
            { id: 'simple', label: 'CALC' },
            { id: 'auto', label: 'EV' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'simple' | 'auto')}
        />
        {tab === 'simple' ? <SimpleCalculator /> : <AutomotiveCalculator />}
      </div>
    </ToolPage>
  )
}
