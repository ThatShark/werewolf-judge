/**
 * 使用瀏覽器原生 Web Audio API 合成柔和雙音提示音（倒數計時歸零時自動播放）。
 * 零外部音檔依賴，於離線與測試環境中安全降級為靜音。
 */
export function playSoftTimerChime(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.0001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    };

    // 柔和雙音鐘聲（A5 -> E6）
    playTone(880, 0, 0.35, 0.14);
    playTone(1318.5, 0.22, 0.55, 0.12);

    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1000);
  } catch {
    // 忽略自動播放政策或無音效裝置環境錯誤
  }
}
