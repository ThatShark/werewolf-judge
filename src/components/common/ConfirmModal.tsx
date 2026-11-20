import type { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = '取消',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmStyle =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white'
      : tone === 'warning'
        ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950'
        : 'bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-50">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        )}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base font-semibold text-slate-200 transition active:scale-[0.99] hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-12 flex-1 rounded-xl px-4 py-3 text-base font-bold transition active:scale-[0.99] ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
