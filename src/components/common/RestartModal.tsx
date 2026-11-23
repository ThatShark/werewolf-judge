import { useState } from 'react';

interface RestartModalProps {
  open: boolean;
  hasSelectedBoard: boolean;
  onRestartKeepNicknames: () => void;
  onRestartClearAll: () => void;
  onCancel: () => void;
}

export function RestartModal({
  open,
  hasSelectedBoard,
  onRestartKeepNicknames,
  onRestartClearAll,
  onCancel,
}: RestartModalProps) {
  const [confirmClearAllStep, setConfirmClearAllStep] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setConfirmClearAllStep(false);
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-amber-400">
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
          <h2 className="text-lg font-bold text-slate-50">
            {confirmClearAllStep ? '二次確認：全部清空並重開？' : '確認重開新局？'}
          </h2>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {confirmClearAllStep
            ? '⚠️ 此操作不可逆，將徹底清除目前板子、所有玩家暱稱、對局紀錄與筆記，確定要全部清空嗎？'
            : '此操作將清除目前進行中的對局進度、夜間行動與死亡紀錄。請選擇重開方式：'}
        </p>

        {confirmClearAllStep ? (
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmClearAllStep(false);
                onRestartClearAll();
              }}
              className="min-h-12 w-full rounded-xl bg-rose-600 px-4 py-3 text-base font-extrabold text-white transition hover:bg-rose-500 active:scale-[0.99]"
            >
              確認全部清空並重開
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearAllStep(false)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-[0.99]"
            >
              返回上一層
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmClearAllStep(false);
                onRestartKeepNicknames();
              }}
              className="min-h-12 w-full rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-left transition hover:bg-amber-500/25 active:scale-[0.99]"
            >
              <div className="text-base font-bold text-amber-300">保留上一局暱稱並重開</div>
              <div className="mt-0.5 text-xs text-slate-300">
                {hasSelectedBoard
                  ? '保留當前板子與各座位玩家暱稱，重置身分與回合紀錄。'
                  : '保留已儲存的座位暱稱，回到開局選板子畫面。'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConfirmClearAllStep(true)}
              className="min-h-12 w-full rounded-xl border border-rose-500/40 bg-rose-600/20 px-4 py-3 text-left transition hover:bg-rose-600/30 active:scale-[0.99]"
            >
              <div className="text-base font-bold text-rose-300">全部清空並重開</div>
              <div className="mt-0.5 text-xs text-slate-300">
                清除所有玩家暱稱、板子與對局資料，回到乾淨開局狀態（需二次確認）。
              </div>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-[0.99]"
            >
              取消（繼續當前對局）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
