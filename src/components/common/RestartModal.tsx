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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/78 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-strong bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[18px] font-semibold leading-6 text-primary">
            {confirmClearAllStep ? '確認全部清空' : '重開新局'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="關閉"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[14px] text-secondary hover:bg-elevated hover:text-primary"
          >
            ✕
          </button>
        </div>

        {confirmClearAllStep ? (
          <div className="mt-3 space-y-3">
            <p className="text-[14px] leading-5 text-secondary">
              將清除板子、玩家暱稱、對局紀錄與筆記，此操作不可逆。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearAllStep(false)}
                className="min-h-12 flex-1 rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
              >
                返回
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClearAllStep(false);
                  onRestartClearAll();
                }}
                className="min-h-12 flex-1 rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary hover:opacity-90"
              >
                全部清空
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setConfirmClearAllStep(false);
                onRestartKeepNicknames();
              }}
              className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              {hasSelectedBoard ? '保留板子與暱稱重開' : '保留暱稱重開'}
            </button>

            <button
              type="button"
              onClick={() => setConfirmClearAllStep(true)}
              className="min-h-12 w-full rounded-md border border-wolf-border bg-wolf-tint px-4 text-[14px] font-semibold text-wolf transition hover:opacity-90"
            >
              全部清空並重開
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
