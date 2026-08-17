// Tesla infotainment screen specs, used to calibrate an on-screen ruler.
// PPI (pixels per inch) = hypot(widthPx, heightPx) / diagonalInches
// On-screen ruler maps 1 real inch -> (PPI / devicePixelRatio) CSS px,
// so it lines up with a physical object when viewed on that Tesla's screen.

export interface VehicleScreen {
  id: string
  model: string
  diagonalIn: number
  widthPx: number
  heightPx: number
}

export function ppiOf(v: VehicleScreen): number {
  return Math.hypot(v.widthPx, v.heightPx) / v.diagonalIn
}

export const VEHICLE_SCREENS: VehicleScreen[] = [
  { id: 'tesla-3y', model: 'Model 3 / Y', diagonalIn: 15.0, widthPx: 1920, heightPx: 1200 },
  { id: 'tesla-sx', model: 'Model S / X', diagonalIn: 17.0, widthPx: 2200, heightPx: 1300 },
  { id: 'tesla-ct', model: 'Cybertruck', diagonalIn: 18.5, widthPx: 2200, heightPx: 1280 },
]
