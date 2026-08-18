// Ambient audio engine — single-track, no mixing.
//
// Real field recordings are bundled in `public/audio/*.mp3` and played as looping
// stereo sources. Forest and fireplace fall back to synthesis when no real
// recording is provided.
import type { AmbientCategory, AmbientTrack } from '@/types/ambient'

export const DEFAULT_LAYER_VOLUME = 0.7
export const MAX_LAYERS = 3

type NoiseType = 'white' | 'pink' | 'brown'
type EventType = 'rain' | 'waves' | 'birds' | 'fire' | 'clinks' | 'none'

interface VoiceDef {
  noise: NoiseType
  filterType: BiquadFilterType
  freq: number
  q: number
  gain: number
  lfoRate?: number
  lfoDepth?: number
  /** Stereo position, -1 (hard left) … 1 (hard right). */
  pan?: number
}

interface SourceDef {
  /** Real recording in public/audio, e.g. 'rain.mp3'. */
  file?: string
  voices: VoiceDef[]
  event: EventType
}

const SOURCE_DEFS: Record<AmbientCategory, SourceDef> = {
  rain: {
    file: 'rain.mp3',
    voices: [
      { noise: 'brown', filterType: 'lowpass', freq: 260, q: 0.4, gain: 0.18, pan: -0.3 },
      { noise: 'white', filterType: 'bandpass', freq: 1600, q: 0.7, gain: 0.16, lfoRate: 0.2, lfoDepth: 0.25, pan: 0.3 },
    ],
    event: 'rain',
  },
  ocean: {
    file: 'ocean.mp3',
    voices: [
      { noise: 'brown', filterType: 'lowpass', freq: 520, q: 0.3, gain: 0.42, lfoRate: 0.09, lfoDepth: 0.6, pan: -0.2 },
      { noise: 'white', filterType: 'bandpass', freq: 700, q: 0.5, gain: 0.05, lfoRate: 0.09, lfoDepth: 0.6, pan: 0.2 },
    ],
    event: 'waves',
  },
  forest: {
    file: undefined,
    voices: [
      { noise: 'brown', filterType: 'lowpass', freq: 480, q: 0.3, gain: 0.16, lfoRate: 0.08, lfoDepth: 0.5, pan: -0.2 },
      { noise: 'pink', filterType: 'bandpass', freq: 1600, q: 0.5, gain: 0.06, lfoRate: 0.05, lfoDepth: 0.3, pan: 0.25 },
    ],
    event: 'birds',
  },
  fireplace: {
    file: undefined,
    voices: [
      { noise: 'brown', filterType: 'lowpass', freq: 220, q: 0.4, gain: 0.2, pan: -0.1 },
    ],
    event: 'fire',
  },
  cafe: {
    file: 'cafe.mp3',
    voices: [
      { noise: 'pink', filterType: 'lowpass', freq: 800, q: 0.5, gain: 0.22, lfoRate: 0.15, lfoDepth: 0.12, pan: -0.35 },
      { noise: 'white', filterType: 'bandpass', freq: 2200, q: 0.7, gain: 0.03, pan: 0.15 },
    ],
    event: 'clinks',
  },
  road: {
    file: 'road.mp3',
    voices: [
      { noise: 'brown', filterType: 'lowpass', freq: 160, q: 0.3, gain: 0.4, pan: 0 },
      { noise: 'white', filterType: 'bandpass', freq: 3200, q: 0.5, gain: 0.06, lfoRate: 0.1, lfoDepth: 0.2, pan: 0.4 },
    ],
    event: 'none',
  },
}

interface ActiveVoice {
  src: AudioBufferSourceNode
  gain: GainNode
  panner?: StereoPannerNode
  lfo?: OscillatorNode
  lfoGain?: GainNode
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

const FADE = 0.5
const RAMP = 0.05
const PLAYBACK_VOLUME = 1.0

class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private dryBus: GainNode | null = null
  private reverbSend: ConvolverNode | null = null
  private noiseBuffers = new Map<NoiseType, AudioBuffer>()
  private fileBuffers = new Map<string, AudioBuffer>()
  private filePromises = new Map<string, Promise<AudioBuffer | null>>()
  private current: {
    track: AmbientTrack
    kind: 'file' | 'synth'
    fileSrc?: AudioBufferSourceNode
    fileGain?: GainNode
    voices: ActiveVoice[]
  } | null = null
  private schedulerId: number | null = null

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
      master.gain.value = PLAYBACK_VOLUME

      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -8
      limiter.knee.value = 12
      limiter.ratio.value = 12
      limiter.attack.value = 0.003
      limiter.release.value = 0.25

      const dry = ctx.createGain()
      dry.gain.value = 1

      const convolver = ctx.createConvolver()
      convolver.buffer = this.buildImpulse(ctx, 1.6, 2.4)
      const wet = ctx.createGain()
      wet.gain.value = 0.22
      convolver.connect(wet)

      dry.connect(master)
      wet.connect(master)
      master.connect(limiter)
      limiter.connect(ctx.destination)

      this.ctx = ctx
      this.master = master
      this.limiter = limiter
      this.dryBus = dry
      this.reverbSend = convolver
    }
    return this.ctx
  }

  private buildImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate
    const length = Math.floor(rate * seconds)
    const buffer = ctx.createBuffer(2, length, rate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    return buffer
  }

  async resume(): Promise<boolean> {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        /* surface as isSuspended === true */
      }
    }
    return ctx.state === 'running'
  }

  isSuspended(): boolean {
    return this.ctx?.state === 'suspended'
  }

  private getNoiseBuffer(type: NoiseType): AudioBuffer {
    const existing = this.noiseBuffers.get(type)
    if (existing) return existing
    const ctx = this.ensureContext()
    const length = Math.floor(ctx.sampleRate * 3)
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    const left = buffer.getChannelData(0)
    const right = buffer.getChannelData(1)

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        left[i] = Math.random() * 2 - 1
        right[i] = Math.random() * 2 - 1
      }
    } else if (type === 'pink') {
      const fillPink = (data: Float32Array) => {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < data.length; i++) {
          const w = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + w * 0.0555179
          b1 = 0.99332 * b1 + w * 0.0750759
          b2 = 0.969 * b2 + w * 0.153852
          b3 = 0.8665 * b3 + w * 0.3104856
          b4 = 0.55 * b4 + w * 0.5329522
          b5 = -0.7616 * b5 - w * 0.016898
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
          b6 = w * 0.115926
        }
      }
      fillPink(left)
      fillPink(right)
    } else {
      let lastL = 0
      let lastR = 0
      for (let i = 0; i < length; i++) {
        const wl = Math.random() * 2 - 1
        const wr = Math.random() * 2 - 1
        lastL = (lastL + 0.02 * wl) / 1.02
        lastR = (lastR + 0.02 * wr) / 1.02
        left[i] = lastL * 3.5
        right[i] = lastR * 3.5
      }
    }
    this.noiseBuffers.set(type, buffer)
    return buffer
  }

  private loadFile(path: string): Promise<AudioBuffer | null> {
    const cached = this.fileBuffers.get(path)
    if (cached) return Promise.resolve(cached)
    const pending = this.filePromises.get(path)
    if (pending) return pending
    const p = (async () => {
      try {
        const ctx = this.ensureContext()
        const res = await fetch(`/audio/${path}`, { cache: 'force-cache' })
        if (!res.ok) return null
        const arr = await res.arrayBuffer()
        const buf = await ctx.decodeAudioData(arr)
        this.fileBuffers.set(path, buf)
        return buf
      } catch {
        return null
      }
    })()
    this.filePromises.set(path, p)
    return p
  }

  private route(node: AudioNode): void {
    if (this.dryBus) node.connect(this.dryBus)
    if (this.reverbSend) node.connect(this.reverbSend)
  }

  /** Returns true if playback started (or resumed) successfully. */
  async play(track: AmbientTrack): Promise<boolean> {
    const ok = await this.resume()
    if (!ok) return false
    this.stop()

    const def = SOURCE_DEFS[track.category]
    const file = track.file ?? def.file
    if (file) {
      const buffer = await this.loadFile(file)
      if (buffer) {
        this.startFile(track, file)
        return true
      }
    }
    this.startSynth(track)
    return true
  }

  private startFile(track: AmbientTrack, path: string): void {
    const ctx = this.ctx
    if (!ctx) return
    const buffer = this.fileBuffers.get(path)
    if (!buffer) return

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    const gain = ctx.createGain()
    gain.gain.value = 0
    src.connect(gain)
    if (this.dryBus) gain.connect(this.dryBus)
    src.start()

    const t = ctx.currentTime
    gain.gain.setTargetAtTime(PLAYBACK_VOLUME, t, RAMP)

    this.current = { track, kind: 'file', fileSrc: src, fileGain: gain, voices: [] }
  }

  private startSynth(track: AmbientTrack): void {
    const ctx = this.ensureContext()
    const def = SOURCE_DEFS[track.category]
    const voices = def.voices.map((v) => {
      const buffer = this.getNoiseBuffer(v.noise)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = v.filterType
      filter.frequency.value = v.freq
      filter.Q.value = v.q

      const gain = ctx.createGain()
      gain.gain.value = 0
      if (this.dryBus) gain.connect(this.dryBus)

      let panner: StereoPannerNode | undefined
      if (v.pan != null) {
        panner = ctx.createStereoPanner()
        panner.pan.value = v.pan
        filter.connect(panner)
        panner.connect(gain)
      } else {
        filter.connect(gain)
      }

      src.connect(filter)

      let lfo: OscillatorNode | undefined
      let lfoGain: GainNode | undefined
      if (v.lfoRate && v.lfoDepth) {
        lfo = ctx.createOscillator()
        lfo.frequency.value = v.lfoRate
        lfoGain = ctx.createGain()
        lfoGain.gain.value = v.gain * v.lfoDepth
        lfo.connect(lfoGain)
        lfoGain.connect(gain.gain)
        lfo.start()
      }

      src.start()
      return { src, gain, panner, lfo, lfoGain }
    })

    const t = ctx.currentTime
    const per = PLAYBACK_VOLUME / def.voices.length
    voices.forEach((av) => {
      const target = Math.max(0.0001, per)
      av.gain.gain.setTargetAtTime(target, t, RAMP)
    })

    this.current = { track, kind: 'synth', voices }
    this.startScheduler()
  }

  private startScheduler(): void {
    if (this.schedulerId !== null) return
    const tick = () => {
      const ctx = this.ctx
      if (!ctx || !this.current || this.current.kind !== 'synth') return
      this.maybeScheduleEvent(SOURCE_DEFS[this.current.track.category].event)
      this.schedulerId = window.setTimeout(tick, 110)
    }
    this.schedulerId = window.setTimeout(tick, 110)
  }

  private stopScheduler(): void {
    if (this.schedulerId !== null) {
      window.clearTimeout(this.schedulerId)
      this.schedulerId = null
    }
  }

  private maybeScheduleEvent(type: EventType): void {
    if (type === 'rain' && Math.random() < 0.55) this.eventRain()
    else if (type === 'fire' && Math.random() < 0.6) this.eventFire()
    else if (type === 'birds' && Math.random() < 0.13) this.eventBirds()
    else if (type === 'clinks' && Math.random() < 0.04) this.eventClink()
    else if (type === 'waves' && Math.random() < 0.05) this.eventWave()
  }

  private eventRain(): void {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.getNoiseBuffer('white')
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 3000 + Math.random() * 2000
    f.Q.value = 1
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
    src.connect(f); f.connect(g); this.route(g)
    src.start(t); src.stop(t + 0.08)
    this.cleanup(src, [f, g], t + 0.1)
  }

  private eventFire(): void {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const n = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < n; i++) {
      const t0 = t + i * (0.02 + Math.random() * 0.06)
      const src = ctx.createBufferSource()
      src.buffer = this.getNoiseBuffer('white')
      const crack = Math.random() < 0.6
      const f = ctx.createBiquadFilter()
      if (crack) {
        f.type = 'bandpass'
        f.frequency.value = 1600 + Math.random() * 2600
        f.Q.value = 2 + Math.random() * 3
      } else {
        f.type = 'lowpass'
        f.frequency.value = 180 + Math.random() * 200
        f.Q.value = 0.7
      }
      const g = ctx.createGain()
      const amp = crack ? 0.3 : 0.22
      const dur = crack ? 0.025 + Math.random() * 0.02 : 0.05
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(amp, t0 + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      src.connect(f); f.connect(g); this.route(g)
      src.start(t0); src.stop(t0 + dur + 0.02)
      this.cleanup(src, [f, g], t0 + dur + 0.05)
    }
  }

  private eventBirds(): void {
    const ctx = this.ctx
    if (!ctx) return
    const t0 = ctx.currentTime
    const base = 2200 + Math.random() * 1800
    const chirps = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < chirps; i++) {
      const t = t0 + i * (0.06 + Math.random() * 0.06)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const f0 = base * (1 + i * 0.1)
      osc.frequency.setValueAtTime(f0, t)
      osc.frequency.linearRampToValueAtTime(f0 * 1.2, t + 0.04)
      osc.frequency.linearRampToValueAtTime(f0 * 0.95, t + 0.08)
      const vib = ctx.createOscillator()
      vib.frequency.value = 30
      const vibGain = ctx.createGain()
      vibGain.gain.value = 50
      vib.connect(vibGain); vibGain.connect(osc.frequency)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
      osc.connect(g); this.route(g)
      osc.start(t); osc.stop(t + 0.09)
      vib.start(t); vib.stop(t + 0.09)
      this.cleanup(osc, [g, vibGain], t + 0.12)
    }
  }

  private eventClink(): void {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 1800 + Math.random() * 1500
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    osc.connect(g); this.route(g)
    osc.start(t); osc.stop(t + 0.28)
    this.cleanup(osc, [g], t + 0.3)
  }

  private eventWave(): void {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.getNoiseBuffer('brown')
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 700
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.14, t + 0.9)
    g.gain.linearRampToValueAtTime(0.0001, t + 2.1)
    src.connect(f); f.connect(g); this.route(g)
    src.start(t); src.stop(t + 2.2)
    this.cleanup(src, [f, g], t + 2.3)
  }

  private cleanup(node: AudioScheduledSourceNode, extra: AudioNode[], at: number): void {
    const ms = Math.max(0, (at - this.ctx!.currentTime) * 1000) + 50
    window.setTimeout(() => {
      try { node.disconnect() } catch { /* noop */ }
      extra.forEach((n) => { try { n.disconnect() } catch { /* noop */ } })
    }, ms)
  }

  stop(): void {
    if (!this.current || !this.ctx) return
    const t = this.ctx.currentTime
    const c = this.current
    if (c.kind === 'file') {
      c.fileGain?.gain.cancelScheduledValues(t)
      c.fileGain?.gain.setTargetAtTime(0.0001, t, FADE / 3)
      window.setTimeout(() => {
        try { c.fileSrc?.stop() } catch { /* noop */ }
        try { c.fileSrc?.disconnect() } catch { /* noop */ }
        try { c.fileGain?.disconnect() } catch { /* noop */ }
      }, (FADE + 0.2) * 1000)
    } else {
      c.voices.forEach((av) => {
        av.gain.gain.cancelScheduledValues(t)
        av.gain.gain.setTargetAtTime(0.0001, t, FADE / 3)
        try { av.lfo?.stop(t + FADE + 0.1) } catch { /* noop */ }
        window.setTimeout(() => {
          try { av.src.stop() } catch { /* noop */ }
          try { av.src.disconnect() } catch { /* noop */ }
          try { av.panner?.disconnect() } catch { /* noop */ }
          try { av.lfo?.disconnect() } catch { /* noop */ }
          try { av.lfoGain?.disconnect() } catch { /* noop */ }
          try { av.gain.disconnect() } catch { /* noop */ }
        }, (FADE + 0.2) * 1000)
      })
    }
    this.current = null
    this.stopScheduler()
  }

  /** Keep master at unity; volume is handled by the OS / Tesla steering wheel. */
  setMasterVolume(_volume: number): void {
    // Intentionally no-op. The UI no longer exposes a volume control.
  }

  fadeOut(seconds: number, onDone?: () => void): void {
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, seconds / 3)
    }
    window.setTimeout(() => {
      this.stop()
      if (this.ctx && this.master) {
        this.master.gain.setTargetAtTime(PLAYBACK_VOLUME, this.ctx.currentTime, RAMP)
      }
      onDone?.()
    }, seconds * 1000 + 80)
  }

  getCurrentTrack(): AmbientTrack | null {
    return this.current?.track ?? null
  }

  dispose(): void {
    this.stop()
    try { void this.ctx?.close() } catch { /* noop */ }
    this.ctx = null
    this.master = null
    this.limiter = null
    this.dryBus = null
    this.reverbSend = null
  }
}

export const ambientEngine = new AmbientEngine()
