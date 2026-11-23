import type { MouseEvent } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';

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
      className={`fixed inset-0 z-40 flex h-dvh w-full flex-col justify-between bg-black px-6 py-8 text-slate-100 select-none ${
        mode === 'blackout' ? 'cursor-pointer' : ''
      }`}
    >
      {/* 頂部語音控制列 */}
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
        <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-bold tracking-wider text-slate-400">
          第 {round} 晚 · 線上法官防窺模式
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stopAnd(onToggleTts)}
            className={`min-h-12 rounded-xl border px-3 text-xs font-bold transition active:scale-[0.98] ${
              ttsEnabled
                ? 'border-indigo-500/40 bg-indigo-950/60 text-indigo-200'
                : 'border-slate-800 bg-slate-950 text-slate-500'
            }`}
          >
            {ttsEnabled ? '🔊 語音開' : '🔇 已靜音'}
          </button>
          <button
            type="button"
            disabled={!ttsEnabled || !ttsSupported}
            onClick={stopAnd(onReplayTts)}
            className="min-h-12 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs font-bold text-slate-300 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🔁 重播
          </button>
        </div>
      </div>

      {/* 中央全黑防窺核心提示 */}
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {mode === 'blackout' && (
          <>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-4xl">
              👁️
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400/90">
              防窺過渡畫面
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              請【{actorLabel}】睜眼
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              確認其他玩家皆已閉眼後，點擊螢幕任意處亮起操作介面
            </p>
            <div className="mt-8 rounded-2xl border border-amber-400/50 bg-amber-500/15 px-6 py-3.5 text-base font-extrabold text-amber-200">
              點擊螢幕亮起操作盤
            </div>
          </>
        )}

        {mode === 'buffer' && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              閉眼緩衝中
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-100">
              請【{actorLabel}】閉眼
            </h2>
            <div className="mt-6 flex h-28 w-28 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-950 text-5xl font-black tabular-nums text-amber-300">
              {bufferRemainingSec}
            </div>
            <p className="mt-5 text-sm text-slate-400">
              {isLastStep
                ? '緩衝結束後將宣告天亮'
                : '緩衝結束後將自動喚醒下一位角色'}
            </p>
            <button
              type="button"
              onClick={stopAnd(onSkipBuffer)}
              className="mt-7 min-h-12 rounded-xl border border-slate-800 bg-slate-950 px-5 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:bg-slate-900"
            >
              立即繼續 →
            </button>
          </>
        )}

        {mode === 'dawn' && (
          <>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-4xl">
              🌅
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              第 {round} 晚結束
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">天亮了，請全員睜眼</h2>
            <p className="mt-3 text-sm text-slate-400">
              所有夜間角色皆已閉眼完成行動，點擊下方按鈕進入天亮結算。
            </p>
            <button
              type="button"
              onClick={stopAnd(onConfirmDawn)}
              className="mt-8 min-h-14 w-full rounded-2xl bg-emerald-500 px-6 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              公佈昨夜結果 ➜ 天亮結算
            </button>
          </>
        )}
      </div>

      {/* 底部提示 */}
      <div className="mx-auto w-full max-w-lg text-center text-[11px] text-slate-600">
        {!ttsSupported && ttsEnabled
          ? '此瀏覽器不支援語音播報，請依畫面提示進行。'
          : '全黑防窺畫面可避免前後角色交接時偷看操作紀錄'}
      </div>
    </div>
  );
}
