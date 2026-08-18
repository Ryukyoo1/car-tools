import type { LucideIcon } from 'lucide-react'
import { CloudRain, Waves, Trees, Flame, Coffee, Car } from 'lucide-react'
import type { AmbientCategory, AmbientTrack } from '@/types/ambient'

export interface SourceTheme {
  from: string
  to: string
  accent: string
  glow: string
}

export interface CategoryMeta {
  category: AmbientCategory
  label: string
  zh: string
  Icon: LucideIcon
  theme: SourceTheme
}

export const CATEGORY_META: Record<AmbientCategory, CategoryMeta> = {
  rain: {
    category: 'rain',
    label: 'Rain',
    zh: '雨声',
    Icon: CloudRain,
    theme: { from: '#0A1424', to: '#0E1C30', accent: '#5B9BD5', glow: 'rgba(91,155,213,0.16)' },
  },
  ocean: {
    category: 'ocean',
    label: 'Ocean',
    zh: '海浪',
    Icon: Waves,
    theme: { from: '#06141C', to: '#0A2230', accent: '#4FB0C6', glow: 'rgba(79,176,198,0.16)' },
  },
  forest: {
    category: 'forest',
    label: 'Forest',
    zh: '森林',
    Icon: Trees,
    theme: { from: '#0A160F', to: '#102018', accent: '#5FA463', glow: 'rgba(95,164,99,0.16)' },
  },
  fireplace: {
    category: 'fireplace',
    label: 'Fireplace',
    zh: '壁炉',
    Icon: Flame,
    theme: { from: '#1A0E08', to: '#2A140A', accent: '#E8743B', glow: 'rgba(232,116,59,0.22)' },
  },
  cafe: {
    category: 'cafe',
    label: 'Cafe',
    zh: '咖啡厅',
    Icon: Coffee,
    theme: { from: '#1A130A', to: '#241810', accent: '#D9A05B', glow: 'rgba(217,160,91,0.20)' },
  },
  road: {
    category: 'road',
    label: 'Road',
    zh: '公路',
    Icon: Car,
    theme: { from: '#060912', to: '#0A0F1C', accent: '#6C7BD6', glow: 'rgba(108,123,214,0.18)' },
  },
}

export const CATEGORY_ORDER: AmbientCategory[] = ['rain', 'ocean', 'forest', 'fireplace', 'cafe', 'road']

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'rain-relaxing',
    category: 'rain',
    title: 'Relaxing Rain',
    artist: 'DRAGON-STUDIO',
    file: 'rain.mp3',
    duration: 765,
    tags: ['雨声', '自然', '水'],
  },
  {
    id: 'rain-thunder',
    category: 'rain',
    title: 'Gentle Rain',
    artist: 'DRAGON-STUDIO',
    file: 'rain-thunder.mp3',
    duration: 600,
    tags: ['雷雨', '雨声', '自然'],
  },
  {
    id: 'ocean-waves',
    category: 'ocean',
    title: 'Ocean Waves',
    artist: 'Google Sounds',
    file: 'ocean.mp3',
    duration: 232,
    tags: ['海浪', '自然', '海滩'],
  },
  {
    id: 'forest-wind',
    category: 'forest',
    title: 'Forest Wind',
    artist: 'Synthesized',
    duration: 0,
    tags: ['森林', '风声', '鸟鸣'],
  },
  {
    id: 'fireplace-crackle',
    category: 'fireplace',
    title: 'Fireplace',
    artist: 'Synthesized',
    duration: 0,
    tags: ['壁炉', '柴火', '噼啪'],
  },
  {
    id: 'cafe-murmur',
    category: 'cafe',
    title: 'Coffee Shop',
    artist: 'Google Sounds',
    file: 'cafe.mp3',
    duration: 160,
    tags: ['咖啡厅', '人群', '休闲'],
  },
  {
    id: 'road-summer',
    category: 'road',
    title: 'Suburban Road',
    artist: 'Google Sounds',
    file: 'road.mp3',
    duration: 226,
    tags: ['公路', '车辆', '城市'],
  },
]

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}
