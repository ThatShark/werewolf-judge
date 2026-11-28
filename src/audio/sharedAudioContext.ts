/**
 * 全站共用的單一 Web Audio AudioContext 管理器。
 * 避免 iOS Safari 多組 AudioContext 互搶 AVAudioSession、計時器回呼無手勢靜音，
 * 並自動監聽 statechange / visibilitychange 於 suspended 或 interrupted 狀態下喚醒。
 */

type ExtendedAudioContextState = AudioContextState | 'interrupted';

let sharedCtx: AudioContext | null = null;
let listenersBound = false;

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return ctor ?? null;
}

function tryResume(ctx: AudioContext): void {
  const state = ctx.state as ExtendedAudioContextState;
  if (state === 'suspended' || state === 'interrupted') {
    void ctx.resume().catch(() => {
      // 忽略尚未解鎖自動播放時的異常
    });
  }
}

function bindResumeListeners(ctx: AudioContext): void {
  if (listenersBound || typeof document === 'undefined') return;
  listenersBound = true;

  ctx.addEventListener?.('statechange', () => {
    const state = ctx.state as ExtendedAudioContextState;
    if (state === 'interrupted' && document.visibilityState === 'visible') {
      tryResume(ctx);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && sharedCtx) {
      tryResume(sharedCtx);
    }
  });
}

export function getSharedAudioContext(): AudioContext | null {
  const AudioCtx = getAudioContextCtor();
  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === 'closed') {
    try {
      sharedCtx = new AudioCtx();
      listenersBound = false;
      bindResumeListeners(sharedCtx);
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

export function resumeSharedAudioContext(): AudioContext | null {
  const ctx = getSharedAudioContext();
  if (!ctx) return null;
  tryResume(ctx);
  return ctx;
}
