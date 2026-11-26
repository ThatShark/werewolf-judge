import type { MouseEvent } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { formatChineseNight } from '../../logic';

export type OnlineJudgeOverlayMode = 'blackout' | 'buffer' | 'dawn';

interface OnlineJudgeOverlayProps {
  mode: OnlineJudgeOverlayMode;
  round: number;
  actorLabel: string;
  bufferRemainingSec: number;
  isLastStep: boolean;
  ttsEnabled: boolean;
  ttsSupported: boolean;
  onWakeScreen: () => void;
  onSkipBuffer: () => void;
  onConfirmDawn: () => void;
  onToggleTts: () => void;
  onReplayTts: () => void;
}

export function OnlineJudgeOverlay({
  mode,
  round,
  actorLabel,
  bufferRemainingSec,
  isLastStep,
  ttsEnabled,
  ttsSupported,
  onWakeScreen,
  onSkipBuffer,
  onConfirmDawn,
  onToggleTts,
  onReplayTts,
}: OnlineJudgeOverlayProps) {
  const stopAnd = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    ttsEngine.unlockAudio();
    if (ttsEnabled) {
      ttsEngine.startKeepAlive();
    }
    fn();
  };

  const handleBlackoutClick = () => {
    ttsEngine.unlockAudio();
    if (ttsEnabled) {
      ttsEngine.startKeepAlive();
    }
    onWakeScreen();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'blackout'
          ? `請 ${actorLabel} 睜眼`
          : mode === 'buffer'
            ? '閉眼緩衝倒數'
            : '天亮了'
      }
      onClick={mode === 'blackout' ? handleBlackoutClick : undefined}
      className={`fixed inset-0 z-40 flex h-dvh w-full select-none flex-col justify-between bg-blackout px-5 py-6 text-primary ${
        mode === 'blackout' ? 'cursor-pointer' : ''
      }`}
    >
      {/* 頂部語音控制列 */}
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
        <span className="text-[12px] font-semibold tabular-nums text-muted">
          {formatChineseNight(round)} · 防窺模式
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={stopAnd(onToggleTts)}
            className={`min-h-11 rounded-md border px-3 text-[12px] font-semibold transition ${
              ttsEnabled
                ? 'border-good-border bg-good-tint text-good'
                : 'border-subtle bg-surface text-muted'
            }`}
          >
            {ttsEnabled ? '語音開' : '靜音'}
          </button>
          <button
            type="button"
            disabled={!ttsEnabled || !ttsSupported}
            onClick={stopAnd(onReplayTts)}
            className="min-h-11 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary transition hover:border-strong hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            重播
          </button>
        </div>
      </div>

      {/* 中央全黑防窺核心提示 */}
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        {mode === 'blackout' && (
          <>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-sheriff">
              WAKE UP
            </p>
            <h2 className="mt-3 text-[24px] font-bold tracking-tight text-primary">
              請【{actorLabel}】睜眼
            </h2>
            <div className="mt-8 w-full rounded-md border border-sheriff-border bg-sheriff-tint px-6 py-3.5 text-[14px] font-semibold text-sheriff">
              點擊螢幕任意處開始操作
            </div>
          </>
        )}

        {mode === 'buffer' && (
          <>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted">
              CLOSE EYES
            </p>
            <h2 className="mt-2 text-[18px] font-semibold text-primary">
              請【{actorLabel}】閉眼
            </h2>
            <div className="mt-6 text-[56px] font-bold leading-none tabular-nums text-sheriff">
              {String(bufferRemainingSec).padStart(2, '0')}
            </div>
            <p className="mt-4 text-[12px] text-secondary">
              {isLastStep ? '即將宣告天亮' : '即將喚醒下一位角色'}
            </p>
            <button
              type="button"
              onClick={stopAnd(onSkipBuffer)}
              className="mt-6 min-h-12 rounded-md border border-subtle bg-surface px-5 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              立即繼續 →
            </button>
          </>
        )}

        {mode === 'dawn' && (
          <>
            <p className="text-[12px] font-semibold tracking-widest text-good">
              {formatChineseNight(round)}結束
            </p>
            <h2 className="mt-2 text-[24px] font-bold text-primary">天亮了，全員睜眼</h2>
            <button
              type="button"
              onClick={stopAnd(onConfirmDawn)}
              className="mt-8 min-h-12 w-full rounded-md bg-good px-6 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              進入天亮結算
            </button>
          </>
        )}
      </div>

      {/* 底部極簡提示 */}
      <div className="mx-auto w-full max-w-lg text-center text-[12px] text-muted">
        {!ttsSupported && ttsEnabled ? '瀏覽器不支援語音播報' : '全黑防窺遮罩'}
      </div>
    </div>
  );
}
