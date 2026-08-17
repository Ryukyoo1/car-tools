import { AnimatePresence, motion } from 'framer-motion'
import type { AmbientSource } from '@/types/ambient'
import { RainScene } from './RainScene'
import { OceanScene } from './OceanScene'
import { ForestScene } from './ForestScene'
import { FireplaceScene } from './FireplaceScene'
import { CafeScene } from './CafeScene'
import { RoadScene } from './RoadScene'

interface AmbientSceneProps {
  source: AmbientSource
  reduced: boolean
}

// Full-bleed animated backdrop. The right sub-scene is chosen by the active
// sound and crossfaded when the source changes, so the page *becomes* the sound.
export function AmbientScene({ source, reduced }: AmbientSceneProps) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <AnimatePresence>
        <motion.div
          key={source}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}
        >
          {source === 'rain' && <RainScene reduced={reduced} />}
          {source === 'ocean' && <OceanScene reduced={reduced} />}
          {source === 'forest' && <ForestScene reduced={reduced} />}
          {source === 'fireplace' && <FireplaceScene reduced={reduced} />}
          {source === 'cafe' && <CafeScene reduced={reduced} />}
          {source === 'road' && <RoadScene reduced={reduced} />}
        </motion.div>
      </AnimatePresence>
      {/* Vignette keeps foreground text/controls legible over any scene. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 38%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}
