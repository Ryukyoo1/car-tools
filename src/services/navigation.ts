// Map / navigation link builder. Supports Google, Apple and Amap (Gaode) without
// hard-coding any single provider.
import type { ParkingRecord, MapProvider } from '@/types'

export function detectProvider(): MapProvider {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua)) return 'apple'
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.includes('zh') || /cn|china/i.test(ua)) return 'amap'
  return 'google'
}

export function buildMapUrl(record: ParkingRecord, provider: MapProvider = detectProvider()): string {
  const label = encodeURIComponent(record.note || 'Parking location')
  switch (provider) {
    case 'apple':
      return `https://maps.apple.com/?daddr=${record.lat},${record.lon}&q=${label}`
    case 'amap':
      // Amap expects longitude,latitude order and WGS84 coordinates.
      return `https://uri.amap.com/marker?position=${record.lon},${record.lat}&name=${label}&src=car-tools&coordinate=wgs84&callnative=1`
    case 'google':
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${record.lat},${record.lon}`
  }
}

export function openNavigation(record: ParkingRecord, provider?: MapProvider): void {
  const url = buildMapUrl(record, provider)
  window.open(url, '_blank', 'noopener')
}
