import type { AmbientPresetId } from '../logic/types';

type PlaybackListener = (playing: boolean) => void;

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private activeSources: Array<AudioBufferSourceNode | OscillatorNode> = [];

  private customAudioUrl: string | null = null;
  private customAudioEl: HTMLAudioElement | null = null;

  private playing = false;
  private currentPreset: AmbientPresetId = 'none';
  private currentVolume = 0.4;
  private listeners = new Set<PlaybackListener>();
  private previewTimerId: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.playing);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitState() {
    for (const listener of this.listeners) {
      listener(this.playing);
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  hasCustomAudio(): boolean {
    return Boolean(this.customAudioUrl);
  }

  setCustomFile(file: File): string {
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl = null;
    }
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
      this.customAudioUrl = null;
    }
    this.customAudioUrl = URL.createObjectURL(file);
    return file.name;
  }

  setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.currentVolume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped * 0.6, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = clamped;
    }
  }

  stop() {
    if (this.previewTimerId !== null) {
      clearTimeout(this.previewTimerId);
      this.previewTimerId = null;
    }

    for (const src of this.activeSources) {
      try {
        src.stop();
      } catch {
        // already stopped
      }
      try {
        src.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeSources = [];

    for (const node of this.activeNodes) {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeNodes = [];

    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
    }

    if (this.playing) {
      this.playing = false;
      this.emitState();
    }
  }

  play(presetId: AmbientPresetId, volume: number = this.currentVolume): boolean {
    this.stop();
    this.currentPreset = presetId;
    this.currentVolume = Math.max(0, Math.min(1, volume));

    if (presetId === 'none' || typeof window === 'undefined') {
      return false;
    }

    if (presetId === 'custom') {
      if (!this.customAudioUrl) {
        return false;
      }
      const audio = new Audio(this.customAudioUrl);
      audio.loop = true;
      audio.volume = this.currentVolume;
      this.customAudioEl = audio;
      void audio.play().catch(() => {
        this.playing = false;
        this.emitState();
      });
      this.playing = true;
      this.emitState();
      return true;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return false;
    }

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // autoplay policy may block until user gesture
      });
    }

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = this.currentVolume * 0.6;
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;
    this.activeNodes.push(masterGain);

    if (presetId === 'white_noise') {
      this.buildWhiteNoise(ctx, masterGain);
    } else if (presetId === 'pink_noise') {
      this.buildPinkNoise(ctx, masterGain);
    } else if (presetId === 'rain') {
      this.buildRain(ctx, masterGain);
    } else if (presetId === 'campfire') {
      this.buildCampfire(ctx, masterGain);
    }

    this.playing = true;
    this.emitState();
    return true;
  }

  /**
   * 試聽一小段白噪音，於指定毫秒（預設 3 秒）後自動停止。
   */
  previewShort(
    presetId: AmbientPresetId,
    volume: number = this.currentVolume,
    durationMs = 3000,
  ): boolean {
    const started = this.play(presetId, volume);
    if (!started) return false;
    this.previewTimerId = setTimeout(() => {
      this.previewTimerId = null;
      this.stop();
    }, durationMs);
    return true;
  }

  getCurrentPreset(): AmbientPresetId {
    return this.currentPreset;
  }

  private createNoiseBuffer(
    ctx: AudioContext,
    durationSec: number,
    fill: (data: Float32Array) => void,
  ): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    fill(data);
    return buffer;
  }

  private buildWhiteNoise(ctx: AudioContext, output: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 3, (data) => {
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }
    });
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;

    source.connect(filter);
    filter.connect(output);
    source.start();

    this.activeSources.push(source);
    this.activeNodes.push(filter);
  }

  private buildPinkNoise(ctx: AudioContext, output: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 4, (data) => {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(output);
    source.start();

    this.activeSources.push(source);
  }

  private buildRain(ctx: AudioContext, output: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 5, (data) => {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.06;
        b1 = 0.985 * b1 + white * 0.09;
        b2 = 0.95 * b2 + white * 0.16;
        data[i] = (b0 + b1 + b2 + white * 0.25) * 0.18;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1100;
    bandpass.Q.value = 0.45;

    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.85;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.14;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.15;

    lfo.connect(lfoDepth);
    lfoDepth.connect(swellGain.gain);

    source.connect(bandpass);
    bandpass.connect(swellGain);
    swellGain.connect(output);

    source.start();
    lfo.start();

    this.activeSources.push(source, lfo);
    this.activeNodes.push(bandpass, swellGain, lfoDepth);
  }

  private buildCampfire(ctx: AudioContext, output: GainNode) {
    // 1. 暖色低頻火焰底噪（Brown noise）
    const rumbleBuffer = this.createNoiseBuffer(ctx, 4, (data) => {
      let lastOut = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 2.8;
      }
    });
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 260;

    rumbleSource.connect(lowpass);
    lowpass.connect(output);
    rumbleSource.start();

    // 2. 隨機柴火劈啪聲（稀疏短脈衝 + 高通）
    const crackleBuffer = this.createNoiseBuffer(ctx, 4, (data) => {
      for (let i = 0; i < data.length; i += 1) {
        if (Math.random() < 0.0018) {
          data[i] = (Math.random() * 2 - 1) * 0.9;
        } else {
          data[i] = 0;
        }
      }
    });
    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1800;

    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.45;

    crackleSource.connect(highpass);
    highpass.connect(crackleGain);
    crackleGain.connect(output);
    crackleSource.start();

    this.activeSources.push(rumbleSource, crackleSource);
    this.activeNodes.push(lowpass, highpass, crackleGain);
  }
}

export const ambientAudioEngine = new AmbientAudioEngine();
