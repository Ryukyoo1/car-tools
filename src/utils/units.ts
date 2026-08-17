// Unit conversion utilities for the Measure tool.

export type UnitCategory = 'distance' | 'speed' | 'temperature' | 'energy' | 'power'

export const UNIT_OPTIONS: Record<UnitCategory, string[]> = {
  distance: ['km', 'm', 'mile', 'ft'],
  speed: ['km/h', 'mph'],
  temperature: ['°C', '°F'],
  energy: ['kWh', 'Wh'],
  power: ['kW', 'W'],
}

export const UNIT_LABELS: Record<UnitCategory, string> = {
  distance: 'Distance',
  speed: 'Speed',
  temperature: 'Temperature',
  energy: 'Energy',
  power: 'Power',
}

function toMeters(v: number, u: string): number {
  switch (u) {
    case 'km':
      return v * 1000
    case 'm':
      return v
    case 'mile':
      return v * 1609.344
    case 'ft':
      return v * 0.3048
    default:
      return v
  }
}

function convertDistance(v: number, from: string, to: string): number {
  const m = toMeters(v, from)
  switch (to) {
    case 'km':
      return m / 1000
    case 'm':
      return m
    case 'mile':
      return m / 1609.344
    case 'ft':
      return m / 0.3048
    default:
      return m
  }
}

function convertSpeed(v: number, from: string, to: string): number {
  const ms = from === 'km/h' ? v / 3.6 : v * 0.44704
  return to === 'km/h' ? ms * 3.6 : ms / 0.44704
}

function convertTemp(v: number, from: string, to: string): number {
  if (from === to) return v
  const c = from === '°C' ? v : (v - 32) * (5 / 9)
  return to === '°C' ? c : c * (9 / 5) + 32
}

function convertEnergy(v: number, from: string, to: string): number {
  const wh = from === 'kWh' ? v * 1000 : v
  return to === 'kWh' ? wh / 1000 : wh
}

function convertPower(v: number, from: string, to: string): number {
  const w = from === 'kW' ? v * 1000 : v
  return to === 'kW' ? w / 1000 : w
}

export function convertUnit(category: UnitCategory, value: number, from: string, to: string): number {
  if (!Number.isFinite(value)) return NaN
  switch (category) {
    case 'distance':
      return convertDistance(value, from, to)
    case 'speed':
      return convertSpeed(value, from, to)
    case 'temperature':
      return convertTemp(value, from, to)
    case 'energy':
      return convertEnergy(value, from, to)
    case 'power':
      return convertPower(value, from, to)
    default:
      return NaN
  }
}
