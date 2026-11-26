/**
 * Web Speech API（window.speechSynthesis）語音播報引擎。
 * 用於「線上法官」模式自動念出睜眼、引導與閉眼提示，並在無支援環境下安全降級。
 *
 * iOS Safari 防攔截強化：
 * 1. `unlockAudio()` 須於使用者點擊手勢內同步呼叫，以喚醒 AudioContext 並預熱 speechSynthesis。
 * 2. `startKeepAlive()` / `stopKeepAlive()` 於夜間維持極低音量 Web Audio 通道活躍，
 *    避免 iOS Safari 在連續自動播報時中斷或靜音語音佇列。
 */

export interface SpeakOptions {
  enabled: boolean;
  rate?: number;
  /** 播放前暖機緩衝毫秒數（例如 300ms 防止「天黑請閉眼」首字被截斷） */
  warmupDelayMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface SpeakSequenceItem {
  text: string;
  /** 該段念完後停頓的毫秒數（再念下一段或觸發整體 onEnd） */
  delayAfterMs?: number;
}

class TtsEngine {
  private lastSpokenText = '';
  private unlocked = false;
  private previewTimerId: ReturnType<typeof setTimeout> | null = null;
  private warmupTimerId: ReturnType<typeof setTimeout> | null = null;
  private sequenceTimerId: ReturnType<typeof setTimeout> | null = null;
  private sequenceToken = 0;

  // Web Audio keep-alive（防止 iOS Safari 夜間語音通道進入休眠）
  private keepAliveCtx: AudioContext | null = null;
  private keepAliveSource: AudioBufferSourceNode | null = null;
  private keepAliveGain: GainNode | null = null;
  private keepAliveRunning = false;

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  /**
   * 須在使用者手勢（onClick / onTouchStart）內同步呼叫。
   * 同步喚醒 Web Audio AudioContext 並以靜音空白 utterance 解鎖 iOS Safari speechSynthesis。
   */
  unlockAudio(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!this.keepAliveCtx) {
          this.keepAliveCtx = new AudioCtx();
        }
        if (this.keepAliveCtx.state === 'suspended') {
          void this.keepAliveCtx.resume().catch(() => {});
        }
      }
    } catch {
      // 忽略無 AudioContext 環境
    }

    if (this.isSupported()) {
      try {
        // 預載語音清單（iOS Safari 首次呼叫 getVoices 需先觸發載入）
        window.speechSynthesis.getVoices();
        if (!this.unlocked && !window.speechSynthesis.speaking) {
          const primer = new window.SpeechSynthesisUtterance('');
          primer.volume = 0;
          primer.lang = 'zh-TW';
          window.speechSynthesis.speak(primer);
        }
      } catch {
        // 忽略語音預熱異常
      }
    }

    this.unlocked = true;
  }

  /**
   * 啟動夜間靜音 Web Audio 通道保活（建議在進入夜間的使用者手勢內呼叫）。
   */
  startKeepAlive(): void {
    if (typeof window === 'undefined' || this.keepAliveRunning) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.keepAliveCtx) {
        this.keepAliveCtx = new AudioCtx();
      }
      if (this.keepAliveCtx.state === 'suspended') {
        void this.keepAliveCtx.resume().catch(() => {});
      }

      const ctx = this.keepAliveCtx;
      // 1 秒靜音緩衝區循環播放，極低耗電但可讓 iOS 維持音訊 Session 活躍
      const buffer = ctx.createBuffer(1, Math.max(1, ctx.sampleRate), ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = 0.0001;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      this.keepAliveSource = source;
      this.keepAliveGain = gain;
      this.keepAliveRunning = true;
    } catch {
      // 忽略瀏覽器保活異常
    }
  }

  /**
   * 停止夜間靜音保活，釋放音訊資源。
   */
  stopKeepAlive(): void {
    if (!this.keepAliveRunning) return;
    try {
      this.keepAliveSource?.stop();
    } catch {
      // already stopped
    }
    try {
      this.keepAliveSource?.disconnect();
      this.keepAliveGain?.disconnect();
    } catch {
      // ignore
    }
    this.keepAliveSource = null;
    this.keepAliveGain = null;
    this.keepAliveRunning = false;
  }

  private pickChineseVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;
      const zhTW = voices.find((v) => v.lang.toLowerCase().includes('zh-tw'));
      if (zhTW) return zhTW;
      const zhHant = voices.find((v) => v.lang.toLowerCase().includes('zh-hant'));
      if (zhHant) return zhHant;
      const zhAny = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
      return zhAny ?? null;
    } catch {
      return null;
    }
  }

  private clearTimers(): void {
    if (this.previewTimerId !== null) {
      clearTimeout(this.previewTimerId);
      this.previewTimerId = null;
    }
    if (this.warmupTimerId !== null) {
      clearTimeout(this.warmupTimerId);
      this.warmupTimerId = null;
    }
    if (this.sequenceTimerId !== null) {
      clearTimeout(this.sequenceTimerId);
      this.sequenceTimerId = null;
    }
  }

  private speakImmediate(cleaned: string, options: SpeakOptions): void {
    try {
      if (this.keepAliveCtx?.state === 'suspended') {
        void this.keepAliveCtx.resume().catch(() => {});
      }
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'zh-TW';
      utterance.rate = Math.min(2.0, Math.max(0.5, options.rate ?? 1.0));
      const voice = this.pickChineseVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.onstart = () => options.onStart?.();
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
      window.speechSynthesis.speak(utterance);
    } catch {
      options.onEnd?.();
    }
  }

  speak(text: string, options: SpeakOptions): void {
    const cleaned = text.trim();
    if (!cleaned) return;
    this.lastSpokenText = cleaned;
    this.sequenceToken += 1;
    this.clearTimers();

    if (!options.enabled || !this.isSupported()) {
      options.onEnd?.();
      return;
    }

    const warmupDelayMs = Math.max(0, options.warmupDelayMs ?? 0);
    if (warmupDelayMs > 0) {
      try {
        if (this.keepAliveCtx?.state === 'suspended') {
          void this.keepAliveCtx.resume().catch(() => {});
        }
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      this.warmupTimerId = setTimeout(() => {
        this.warmupTimerId = null;
        this.speakImmediate(cleaned, options);
      }, warmupDelayMs);
      return;
    }

    this.speakImmediate(cleaned, options);
  }

  /**
   * 依序播報多段語音並於每段間精準停頓（例如天亮前「三、二、一」每秒倒數）。
   */
  speakSequence(
    items: SpeakSequenceItem[],
    options: Omit<SpeakOptions, 'onStart'> & { onItemStart?: (index: number) => void },
  ): void {
    this.sequenceToken += 1;
    const token = this.sequenceToken;
    this.clearTimers();

    if (items.length === 0) {
      options.onEnd?.();
      return;
    }

    this.lastSpokenText = items.map((i) => i.text.trim()).filter(Boolean).join('，');

    const runStep = (idx: number) => {
      if (token !== this.sequenceToken) return;
      if (idx >= items.length) {
        options.onEnd?.();
        return;
      }
      const item = items[idx];
      options.onItemStart?.(idx);

      const proceedNext = () => {
        if (token !== this.sequenceToken) return;
        const delayMs = Math.max(0, item.delayAfterMs ?? 0);
        if (delayMs > 0) {
          this.sequenceTimerId = setTimeout(() => {
            this.sequenceTimerId = null;
            runStep(idx + 1);
          }, delayMs);
        } else {
          runStep(idx + 1);
        }
      };

      if (!options.enabled || !this.isSupported()) {
        proceedNext();
        return;
      }

      const warmup = idx === 0 ? Math.max(0, options.warmupDelayMs ?? 0) : 0;
      if (warmup > 0) {
        this.warmupTimerId = setTimeout(() => {
          this.warmupTimerId = null;
          if (token !== this.sequenceToken) return;
          this.speakImmediate(item.text.trim(), {
            enabled: true,
            rate: options.rate,
            onEnd: proceedNext,
          });
        }, warmup);
      } else {
        this.speakImmediate(item.text.trim(), {
          enabled: true,
          rate: options.rate,
          onEnd: proceedNext,
        });
      }
    };

    runStep(0);
  }

  /**
   * 專用於使用者手勢（onClick）內：同步解鎖 iOS 語音通道、開啟夜間保活並立刻播報。
   */
  speakFromGesture(text: string, options: SpeakOptions): void {
    this.unlockAudio();
    if (options.enabled) {
      this.startKeepAlive();
    }
    this.speak(text, options);
  }

  replay(options: SpeakOptions): void {
    if (!this.lastSpokenText) return;
    this.speakFromGesture(this.lastSpokenText, options);
  }

  /**
   * 試聽一小段語音播報（預設最長 3 秒後自動停止），供開局前測試音量與語速。
   */
  previewShort(
    options: Omit<SpeakOptions, 'enabled'> & { enabled?: boolean; sampleText?: string },
    durationMs = 3000,
  ): void {
    if (this.previewTimerId !== null) {
      clearTimeout(this.previewTimerId);
      this.previewTimerId = null;
    }
    const text = options.sampleText ?? '天黑請閉眼，狼人請睜眼。';
    this.speakFromGesture(text, {
      enabled: options.enabled ?? true,
      rate: options.rate,
      onStart: options.onStart,
      onEnd: () => {
        if (this.previewTimerId !== null) {
          clearTimeout(this.previewTimerId);
          this.previewTimerId = null;
        }
        options.onEnd?.();
      },
    });
    this.previewTimerId = setTimeout(() => {
      this.previewTimerId = null;
      this.cancel();
      options.onEnd?.();
    }, durationMs);
  }

  cancel(): void {
    this.sequenceToken += 1;
    this.clearTimers();
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // 忽略瀏覽器語音取消異常
    }
  }
}

export const ttsEngine = new TtsEngine();
