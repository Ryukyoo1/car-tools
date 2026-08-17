import { AnimatePresence, motion } from 'framer-motion'
import type { WeatherCondition } from '@/types/weather'
import { SunnyScene } from './SunnyScene'
import { CloudyScene } from './CloudyScene'
import { RainScene, type RainVariant } from './RainScene'
import { StormScene } from './StormScene'
import { FogScene } from './FogScene'
import { NightScene } from './NightScene'

type SceneKey = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'night'

function sceneKeyFor(condition: WeatherCondition, isDay: boolean): SceneKey {
  if (!isDay && (condition === 'sunny' || condition === 'partly-cloudy' || condition === 'cloudy')) {
    return 'night'
  }
  switch (condition) {
    case 'sunny':
      return 'sunny'
    case 'partly-cloudy':
    case 'cloudy':
      return 'cloudy'
    case 'fog':
      return 'fog'
    case 'rain':
    case 'heavy-rain':
    case 'snow':
      return 'rain'
    case 'storm':
      return 'storm'
    default:
      return 'cloudy'
  }
}

function rainVariantFor(condition: WeatherCondition): RainVariant {
  if (condition === 'snow') return 'snow'
  if (condition === 'heavy-rain') return 'heavy'
  return 'rain'
}

interface WeatherSceneProps {
  condition: WeatherCondition
  isDay: boolean
  reduced: boolean
}

// Dynamic background that picks the right scene and crossfades between them.
export function WeatherScene({ condition, isDay, reduced }: WeatherSceneProps) {
  const key = sceneKeyFor(condition, isDay)
  return (
    <div className="absolute inset-0">
      <AnimatePresence>
        <motion.div
          key={key}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: 'easeInOut' }}
        >
          {key === 'sunny' && <SunnyScene reduced={reduced} />}
          {key === 'cloudy' && <CloudyScene reduced={reduced} />}
          {key === 'rain' && <RainScene reduced={reduced} variant={rainVariantFor(condition)} />}
          {key === 'storm' && <StormScene reduced={reduced} />}
          {key === 'fog' && <FogScene reduced={reduced} />}
          {key === 'night' && <NightScene reduced={reduced} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
