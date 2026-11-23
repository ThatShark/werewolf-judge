import { useEffect } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: 'release', listener: () => void) => void;
}

type WakeLockLike = {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
};

function getNavigatorWakeLock(): WakeLockLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as Navigator & { wakeLock?: WakeLockLike };
  return nav.wakeLock;
}

/**
 * 螢幕防休眠（Screen Wake Lock API）管理工具。
 * 用於夜間主持、傳閱看牌與白天投票階段防止房主手機自動鎖屏休眠。
 * 不支援 Wake Lock 或遭系統拒絕時安全降級，不中斷遊戲流程。
 */
class WakeLockManager {
  private sentinel: WakeLockSentinelLike | null = null;
  private wanted = false;
  private visibilityListenerBound = false;

  isSupported(): boolean {
    return typeof getNavigatorWakeLock()?.request === 'function';
  }

  private handleVisibilityChange = () => {
    if (
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      this.wanted &&
      (!this.sentinel || this.sentinel.released)
    ) {
      void this.acquire();
    }
  };

  private bindVisibilityListener() {
    if (this.visibilityListenerBound || typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.visibilityListenerBound = true;
  }

  private unbindVisibilityListener() {
    if (!this.visibilityListenerBound || typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.visibilityListenerBound = false;
  }

  async acquire(): Promise<boolean> {
    this.wanted = true;
    this.bindVisibilityListener();

    if (!this.isSupported()) {
      return false;
    }
    if (this.sentinel && !this.sentinel.released) {
      return true;
    }

    try {
      const wakeLock = getNavigatorWakeLock();
      if (!wakeLock) return false;
      const sentinel = await wakeLock.request('screen');
      if (!this.wanted) {
        await sentinel.release().catch(() => {});
        return false;
      }
      this.sentinel = sentinel;
      sentinel.addEventListener?.('release', () => {
        if (this.sentinel === sentinel) {
          this.sentinel = null;
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async release(): Promise<void> {
    this.wanted = false;
    this.unbindVisibilityListener();

    if (!this.sentinel) return;
    const current = this.sentinel;
    this.sentinel = null;
    try {
      if (!current.released) {
        await current.release();
      }
    } catch {
      // 忽略瀏覽器釋放異常
    }
  }
}

export const wakeLockManager = new WakeLockManager();

/**
 * React Hook：當 active 為 true 時自動申請螢幕防休眠，為 false 或卸載時自動釋放。
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) {
      void wakeLockManager.release();
      return;
    }
    void wakeLockManager.acquire();
    return () => {
      void wakeLockManager.release();
    };
  }, [active]);
}
