import type { LucideIcon } from 'lucide-react'
import { CloudRain, Waves, Trees, Flame, Coffee, Car } from 'lucide-react'
import type { AmbientSource } from '@/types/ambient'

export interface SourceTheme {
  // Background gradient (top -> bottom). Deep, low-saturation automotive tones.
  from: string
  to: string
  // Accent used for glows / active ring (kept muted, never a loud brand color).
  accent: string
  glow: string
}

export interface SourceMeta {
  source: AmbientSource
  label: string // English primary
  zh: string // Chinese secondary
  Icon: LucideIcon
  theme: SourceTheme
}

export const SOURCE_META: Record<AmbientSource, SourceMeta> = {
  rain: {
    source: 'rain',
    label: 'Rain',
    zh: '雨声',
    Icon: CloudRain,
    theme: { from: '#0A1424', to: '#0E1C30', accent: '#5B9BD5', glow: 'rgba(91,155,213,0.16)' },
  },
  ocean: {
    source: 'ocean',
    label: 'Ocean',
    zh: '海浪',
    Icon: Waves,
    theme: { from: '#06141C', to: '#0A2230', accent: '#4FB0C6', glow: 'rgba(79,176,198,0.16)' },
  },
  forest: {
    source: 'forest',
    label: 'Forest',
    zh: '森林',
    Icon: Trees,
    theme: { from: '#0A160F', to: '#102018', accent: '#5FA463', glow: 'rgba(95,164,99,0.16)' },
  },
  fireplace: {
    source: 'fireplace',
    label: 'Fireplace',
    zh: '壁炉',
    Icon: Flame,
    theme: { from: '#1A0E08', to: '#2A140A', accent: '#E8743B', glow: 'rgba(232,116,59,0.22)' },
  },
  cafe: {
    source: 'cafe',
    label: 'Cafe',
    zh: '咖啡厅',
    Icon: Coffee,
    theme: { from: '#1A130A', to: '#241810', accent: '#D9A05B', glow: 'rgba(217,160,91,0.20)' },
  },
  road: {
    source: 'road',
    label: 'Road',
    zh: '公路',
    Icon: Car,
    theme: { from: '#060912', to: '#0A0F1C', accent: '#6C7BD6', glow: 'rgba(108,123,214,0.18)' },
  },
}

export const SOURCE_ORDER: AmbientSource[] = ['rain', 'ocean', 'forest', 'fireplace', 'cafe', 'road']

export const DEFAULT_LAYER_VOLUME = 0.7
export const MAX_LAYERS = 3
