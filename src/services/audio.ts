// Procedural ambient audio engine.
//
// All soundscapes are synthesised with the Web Audio API (filtered noise + gentle
// LFO modulation), so the tool works fully offline with zero bundled media and no
// licensing concerns. Each source is an independent GainNode feeding a master bus
// through a limiter, which lets the UI mix up to three layers with independent
// volumes and cross-fade smoothly.
import type { AmbientSource } from '@/types/ambient'

export const DEFAULT_LAYER_VOLUME = 0.7
export const MAX_LAYERS = 3

type NoiseType = 'white' | 'pink' | 'brown'

interface SourceConfig {
  noise: NoiseType
  filterType: BiquadFilterType
  frequency: number
  q: number
  gain: number // base gain at full user volume
  lfoRate?: number
  lfoDepth?: number
}

const PRESETS: Record<AmbientSource, SourceConfig> = {
  rain: { noise: 'white', filterType: 'highpass', frequency: 1200, q: 0.6, gain: 0.4, lfoRate: 0.08, lfoDepth: 0.15 },
  ocean: { noise: 'brown', filterType: 'lowpass', frequency: 500, q: 0.3, gain: 0.55, lfoRate: 0.1, lfoDepth: 0.6 },
  forest: { noise: 'pink', filterType: 'bandpass', frequency: 2000, q: 0.8, gain: 0.32, lfoRate: 0.05, lfoDepth: 0.1 },
  fireplace: { noise: 'brown', filterType: 'lowpass', frequency: 400, q: 0.4, gain: 0.5, lfoRate: 4, lfoDepth: 0.25 },
  cafe: { noise: 'pink', filterType: 'lowpass', frequency: 800, q: 0.5, gain: 0.38, lfoRate: 0.2, lfoDepth: 0.1 },
  road: { noise: 'brown', filterType: 'lowpass', frequency: 220, q: 0.3, gain: 0.5, lfoRate: 0.15, lfoDepth: 0.25 },
}

interface ActiveLayer {
  source: AudioBufferSourceNode
  filter: BiquadFilterNode
  gain: GainNode
  lfo?: OscillatorNode
  lfoGain?: GainNode
  config: SourceConfig
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

const FADE = 0.5 // seconds for layer add/remove crossfade
const RAMP = 0.05 // time constant for small volume changes

class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private layers = new Map<AmbientSource, ActiveLayer>()
  private buffers = new Map<NoiseType, AudioBuffer>()
  private masterVolume = 0.7
  private fadeTimer: number | null = null

  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window.AudioContext || (window as WebkitWindow).webkitAudioContext)
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext
      if (!Ctor) throw new Error('Web Audio API is not supported.')
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = this.masterVolume
      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -8
      limiter.knee.value = 12
      limiter.ratio.value = 12
      limiter.attack.value = 0.003
      limiter.release.value = 0.25
      master.connect(limiter)
      limiter.connect(ctx.destination)
      this.ctx = ctx
      this.master = master
      this.limiter = limiter
    }
    return this.ctx
  }

  /** Resume the context after a user gesture. Returns true when running. */
  async resume(): Promise<boolean> {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        /* will surface as isSuspended() === true */
      }
    }
    return ctx.state === 'running'
  }

  isSuspended(): boolean {
    return this.ctx?.state === 'suspended'
  }

  private getNoiseBuffer(type: NoiseType): AudioBuffer {
    const existing = this.buffers.get(type)
    if (existing) return existing
    const ctx = this.ensureContext()
    // 3s loop — long enough to avoid any perceptible repetition in noise.
    const length = Math.floor(ctx.sampleRate * 3)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'white') {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }
    } else {
      let last = 0
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 3.5
      }
    }
    this.buffers.set(type, buffer)
    return buffer
  }

  /** Start a source (if not already) and fade its gain to base * volume. */
  setLayer(source: AmbientSource, volume: number): void {
    const ctx = this.ensureContext()
    let layer = this.layers.get(source)
    const cfg = PRESETS[source]
    const target = cfg.gain * volume

    if (!layer) {
      const buffer = this.getNoiseBuffer(cfg.noise)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = cfg.filterType
      filter.frequency.value = cfg.frequency
      filter.Q.value = cfg.q

      const gain = ctx.createGain()
      gain.gain.value = 0 // start silent, fade in
      gain.connect(this.master as GainNode)

      src.connect(filter)
      filter.connect(gain)

      let lfo: OscillatorNode | undefined
      let lfoGain: GainNode | undefined
      if (cfg.lfoRate && cfg.lfoDepth) {
        lfo = ctx.createOscillator()
        lfo.frequency.value = cfg.lfoRate
        lfoGain = ctx.createGain()
        lfoGain.gain.value = cfg.gain * cfg.lfoDepth
        lfo.connect(lfoGain)
        lfoGain.connect(gain.gain)
        lfo.start()
      }

      src.start()
      layer = { source: src, filter, gain, lfo, lfoGain, config: cfg }
      this.layers.set(source, layer)
    }

    layer.gain.gain.setTargetAtTime(Math.max(0.0001, target), ctx.currentTime, RAMP)
  }

  /** Fade a layer out and stop it. */
  removeLayer(source: AmbientSource): void {
    const layer = this.layers.get(source)
    if (!layer || !this.ctx) return
    const t = this.ctx.currentTime
    layer.gain.gain.cancelScheduledValues(t)
    layer.gain.gain.setTargetAtTime(0.0001, t, FADE / 3)
    const stopAt = (FADE + 0.1) * 1000
    window.setTimeout(() => {
      try {
        layer.source.stop()
      } catch {
        /* already stopped */
      }
      try {
        layer.lfo?.stop()
      } catch {
        /* already stopped */
      }
      this.layers.delete(source)
    }, stopAt)
    // Mark as removing immediately so concurrent calls don't double-schedule.
    this.layers.delete(source)
  }

  setLayerVolume(source: AmbientSource, volume: number): void {
    const layer = this.layers.get(source)
    if (!layer || !this.ctx) return
    const target = layer.config.gain * volume
    layer.gain.gain.setTargetAtTime(Math.max(0.0001, target), this.ctx.currentTime, RAMP)
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, RAMP)
    }
  }

  stopAll(): void {
    if (this.fadeTimer) {
      window.clearTimeout(this.fadeTimer)
      this.fadeTimer = null
    }
    for (const source of Array.from(this.layers.keys())) this.removeLayer(source)
    // Restore master gain: a timer fade-out may have ramped it toward 0, and we
    // don't want the next playback to start silent.
    this.setMasterVolume(this.masterVolume)
  }

  /** Gradually duck everything to silence over `seconds`, then stop. */
  fadeOutAll(seconds: number, onDone?: () => void): void {
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, seconds / 3)
    }
    if (this.fadeTimer) window.clearTimeout(this.fadeTimer)
    this.fadeTimer = window.setTimeout(() => {
      this.stopAll()
      // Restore master gain so the next playback is at the user's chosen level.
      this.setMasterVolume(this.masterVolume)
      onDone?.()
    }, seconds * 1000 + 80)
  }

  getActiveSources(): AmbientSource[] {
    return Array.from(this.layers.keys())
  }

  dispose(): void {
    this.stopAll()
    try {
      void this.ctx?.close()
    } catch {
      /* ignore */
    }
    this.ctx = null
    this.master = null
    this.limiter = null
  }
}

export const ambientEngine = new AmbientEngine()
