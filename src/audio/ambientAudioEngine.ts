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
  private previewFadeTimerId: ReturnType<typeof setTimeout> | null = null;

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
      this.masterGain.gain.setTargetAtTime(clamped * 0.35, this.ctx.currentTime, 0.08);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = clamped * 0.8;
    }
  }

  stop() {
    if (this.previewFadeTimerId !== null) {
      clearTimeout(this.previewFadeTimerId);
      this.previewFadeTimerId = null;
    }
    if (this.previewTimerId !== null) {
      clearTimeout(this.previewTimerId);
      this.previewTimerId = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0, now);
      } catch {
        // ignore gain reset errors
      }
    }
    this.masterGain = null;

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
    const targetGain = this.currentVolume * 0.35;
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, targetGain), ctx.currentTime + 0.25);
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
   * 試聽一小段白噪音，於指定毫秒（預設 3 秒）內淡出並強制停止所有節點。
   */
  previewShort(
    presetId: AmbientPresetId,
    volume: number = this.currentVolume,
    durationMs = 3000,
  ): boolean {
    const started = this.play(presetId, volume);
    if (!started) return false;

    const fadeLeadMs = 120;
    if (durationMs > fadeLeadMs) {
      this.previewFadeTimerId = setTimeout(() => {
        this.previewFadeTimerId = null;
        if (this.masterGain && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(
              Math.max(0.0001, this.masterGain.gain.value),
              now,
            );
            this.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeLeadMs / 1000);
          } catch {
            // ignore fade errors
          }
        }
      }, durationMs - fadeLeadMs);
    }

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

  /**
   * 溫和低頻正弦波提示音（淡入淡出、低增益、無刺耳高頻）。
   */
  playSoftCue(type: 'step' | 'dawn' | 'timer' = 'step'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(
        type === 'dawn' ? 392 : type === 'timer' ? 330 : 293.66,
        now,
      );
      if (type === 'dawn') {
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.22);
      }

      filter.type = 'lowpass';
      filter.frequency.value = 650;

      const peak = Math.min(0.11, Math.max(0.03, this.currentVolume * 0.18));
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore audio context errors
    }
  }

  private buildWhiteNoise(ctx: AudioContext, output: GainNode) {
    // 改為溫和粉紅／棕噪音混合並串接低通濾波，徹底消除刺耳高頻白噪
    const buffer = this.createNoiseBuffer(ctx, 4, (data) => {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let brown = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.05;
        b1 = 0.985 * b1 + white * 0.08;
        b2 = 0.95 * b2 + white * 0.12;
        brown = (brown + 0.02 * white) / 1.02;
        data[i] = ((b0 + b1 + b2) * 0.18 + brown * 1.4) * 0.55;
      }
    });
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.5;

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
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.35) * 0.065;
        b6 = white * 0.115926;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1100;
    lowpass.Q.value = 0.5;

    source.connect(lowpass);
    lowpass.connect(output);
    source.start();

    this.activeSources.push(source);
    this.activeNodes.push(lowpass);
  }

  private buildRain(ctx: AudioContext, output: GainNode) {
    const buffer = this.createNoiseBuffer(ctx, 5, (data) => {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.055;
        b1 = 0.985 * b1 + white * 0.08;
        b2 = 0.95 * b2 + white * 0.13;
        data[i] = (b0 + b1 + b2 + white * 0.12) * 0.15;
      }
    });

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 780;
    lowpass.Q.value = 0.45;

    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.8;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.1;

    lfo.connect(lfoDepth);
    lfoDepth.connect(swellGain.gain);

    source.connect(lowpass);
    lowpass.connect(swellGain);
    swellGain.connect(output);

    source.start();
    lfo.start();

    this.activeSources.push(source, lfo);
    this.activeNodes.push(lowpass, swellGain, lfoDepth);
  }

  private buildCampfire(ctx: AudioContext, output: GainNode) {
    // 1. 暖色低頻火焰底噪（Brown noise）
    const rumbleBuffer = this.createNoiseBuffer(ctx, 4, (data) => {
      let lastOut = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 2.2;
      }
    });
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 220;

    rumbleSource.connect(lowpass);
    lowpass.connect(output);
    rumbleSource.start();

    // 2. 柔和柴火聲（極低增益帶通柔化，避免刺耳爆裂）
    const crackleBuffer = this.createNoiseBuffer(ctx, 4, (data) => {
      for (let i = 0; i < data.length; i += 1) {
        if (Math.random() < 0.0009) {
          data[i] = (Math.random() * 2 - 1) * 0.45;
        } else {
          data[i] = 0;
        }
      }
    });
    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 900;
    bandpass.Q.value = 1.2;

    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.16;

    crackleSource.connect(bandpass);
    bandpass.connect(crackleGain);
    crackleGain.connect(output);
    crackleSource.start();

    this.activeSources.push(rumbleSource, crackleSource);
    this.activeNodes.push(lowpass, bandpass, crackleGain);
  }
}

export const ambientAudioEngine = new AmbientAudioEngine();
