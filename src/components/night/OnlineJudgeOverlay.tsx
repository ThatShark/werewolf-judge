import type { MouseEvent } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { formatChineseNight } from '../../logic';
import type { SeatTouchConfirmView } from '../../logic';
import { formatSeatNum } from '../common/displayHelpers';

export type OnlineJudgeOverlayMode =
  | 'night_intro'
  | 'blackout'
  | 'buffer'
  | 'touch_confirm_blackout'
  | 'touch_confirm_reveal'
  | 'dawn';

interface OnlineJudgeOverlayProps {
  mode: OnlineJudgeOverlayMode;
  round: number;
  actorLabel: string;
  bufferRemainingSec: number;
  isLastStep: boolean;
  ttsEnabled: boolean;
  ttsSupported: boolean;
  /** 結尾台詞文字（如「要上警的玩家請舉手，三秒後天亮，三、二、一」） */
  dawnText?: string;
  /** 結尾倒數中當前數字（3 / 2 / 1 / null） */
  dawnCountdownDigit?: number | null;
  /** 輪流睜眼確認附加身分：目前座號與總數 */
  touchConfirmSeat?: number | null;
  touchConfirmIndex?: number;
  touchConfirmTotal?: number;
  touchConfirmTitle?: string;
  touchConfirmView?: SeatTouchConfirmView | null;
  onWakeScreen: () => void;
  onSkipBuffer: () => void;
  onWakeTouchConfirm?: () => void;
  onCloseTouchConfirm?: () => void;
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
  dawnText,
  dawnCountdownDigit,
  touchConfirmSeat,
  touchConfirmIndex = 0,
  touchConfirmTotal = 0,
  touchConfirmTitle,
  touchConfirmView,
  onWakeScreen,
  onSkipBuffer,
  onWakeTouchConfirm,
  onCloseTouchConfirm,
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
    if (mode === 'touch_confirm_blackout') {
      onWakeTouchConfirm?.();
    } else {
      onWakeScreen();
    }
  };

  const isTapToWakeMode = mode === 'blackout' || mode === 'touch_confirm_blackout';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'night_intro'
          ? '天黑請閉眼'
          : mode === 'blackout'
            ? `請 ${actorLabel} 睜眼`
            : mode === 'buffer'
              ? '閉眼緩衝倒數'
              : mode === 'touch_confirm_blackout' && touchConfirmSeat != null
                ? `${formatSeatNum(touchConfirmSeat)} 號請睜眼`
                : mode === 'touch_confirm_reveal'
                  ? '確認附加身分'
                  : '天亮倒數'
      }
      onClick={isTapToWakeMode ? handleBlackoutClick : undefined}
      className={`fixed inset-0 z-40 flex h-dvh w-full select-none flex-col justify-between bg-blackout px-5 py-6 text-primary ${
        isTapToWakeMode ? 'cursor-pointer' : ''
      }`}
    >
      {/* 頂部語音控制列 */}
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
        <span className="text-[12px] font-semibold tabular-nums text-muted">
          {formatChineseNight(round)} ·{' '}
          {mode === 'touch_confirm_blackout' || mode === 'touch_confirm_reveal'
            ? `${touchConfirmTitle ?? '輪流確認'} (${touchConfirmIndex + 1}/${touchConfirmTotal})`
            : '防窺模式'}
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
        {mode === 'night_intro' && (
          <>
            <p className="text-[12px] font-semibold tracking-widest text-sheriff">
              {formatChineseNight(round)}
            </p>
            <h2 className="mt-3 text-[28px] font-bold tracking-tight text-primary">天黑請閉眼</h2>
            <div className="mt-6 text-[56px] font-bold leading-none tabular-nums text-sheriff">
              {String(bufferRemainingSec).padStart(2, '0')}
            </div>
            <p className="mt-4 text-[12px] text-secondary">即將喚醒首位行動角色</p>
            <button
              type="button"
              onClick={stopAnd(onSkipBuffer)}
              className="mt-6 min-h-12 rounded-md border border-subtle bg-surface px-5 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              立即繼續 →
            </button>
          </>
        )}

        {mode === 'blackout' && (
          <>
            <p className="text-[12px] font-semibold tracking-widest text-sheriff">請睜眼</p>
            <h2 className="mt-3 text-[24px] font-bold tracking-tight text-primary">
              請【{actorLabel}】睜眼
            </h2>
            <div className="mt-8 w-full rounded-md border border-sheriff-border bg-sheriff-tint px-6 py-3.5 text-[14px] font-semibold text-sheriff">
              點擊螢幕任意處開始操作
            </div>
          </>
        )}

        {mode === 'touch_confirm_blackout' && touchConfirmSeat != null && (
          <>
            <p className="text-[12px] font-semibold tracking-widest text-third">
              {touchConfirmTitle ?? '附加身分確認'}
            </p>
            <div className="mt-3 text-[44px] font-bold leading-none tabular-nums text-sheriff">
              {formatSeatNum(touchConfirmSeat)} 號
            </div>
            <h2 className="mt-2 text-[20px] font-semibold text-primary">請睜眼確認狀態</h2>
            <div className="mt-8 w-full rounded-md border border-sheriff-border bg-sheriff-tint px-6 py-3.5 text-[14px] font-semibold text-sheriff">
              點擊螢幕任意處查看
            </div>
          </>
        )}

        {mode === 'touch_confirm_reveal' && touchConfirmSeat != null && touchConfirmView && (
          <>
            <p className="text-[12px] font-semibold tabular-nums text-secondary">
              {formatSeatNum(touchConfirmSeat)} 號 · {touchConfirmTitle ?? '附加身分確認'}
            </p>
            <h2
              className={`mt-4 text-[28px] font-bold tracking-tight ${
                touchConfirmView.hasStatus ? 'text-sheriff' : 'text-primary'
              }`}
            >
              {touchConfirmView.headline}
            </h2>
            <p className="mt-2 text-[14px] text-secondary">{touchConfirmView.subline}</p>
            <button
              type="button"
              onClick={stopAnd(() => onCloseTouchConfirm?.())}
              className="mt-8 min-h-12 w-full rounded-md bg-sheriff px-6 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              確認並閉眼
            </button>
          </>
        )}

        {mode === 'buffer' && (
          <>
            <p className="text-[12px] font-semibold tracking-widest text-muted">請閉眼</p>
            <h2 className="mt-2 text-[18px] font-semibold text-primary">
              請【{actorLabel}】閉眼
            </h2>
            <div className="mt-6 text-[56px] font-bold leading-none tabular-nums text-sheriff">
              {String(bufferRemainingSec).padStart(2, '0')}
            </div>
            <p className="mt-4 text-[12px] text-secondary">
              {isLastStep ? '即將宣告天亮' : '即將喚醒下一位'}
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
            <h2 className="mt-2 text-[22px] font-bold leading-snug text-primary">
              {dawnText ?? '三秒後天亮，三、二、一'}
            </h2>
            {dawnCountdownDigit != null && (
              <div className="mt-5 text-[56px] font-bold leading-none tabular-nums text-good">
                {dawnCountdownDigit}
              </div>
            )}
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
