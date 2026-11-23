/**
 * Web Speech API（window.speechSynthesis）語音播報引擎。
 * 用於「線上法官」模式自動念出睜眼、引導與閉眼提示，並在無支援環境下安全降級。
 */

export interface SpeakOptions {
  enabled: boolean;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

class TtsEngine {
  private lastSpokenText = '';

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
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

  speak(text: string, options: SpeakOptions): void {
    const cleaned = text.trim();
    if (!cleaned) return;
    this.lastSpokenText = cleaned;

    if (!options.enabled || !this.isSupported()) {
      options.onEnd?.();
      return;
    }

    try {
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

  replay(options: SpeakOptions): void {
    if (!this.lastSpokenText) return;
    this.speak(this.lastSpokenText, options);
  }

  cancel(): void {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // 忽略瀏覽器語音取消異常
    }
  }
}

export const ttsEngine = new TtsEngine();
