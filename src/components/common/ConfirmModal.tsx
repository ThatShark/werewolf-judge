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
      ? 'bg-wolf text-primary hover:opacity-90'
      : tone === 'warning'
        ? 'bg-sheriff text-inverse hover:opacity-90'
        : 'bg-sheriff text-inverse hover:opacity-90';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/78 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-strong bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-semibold leading-6 text-primary">{title}</h2>
        {description && (
          <p className="mt-2 text-[14px] leading-5 text-secondary">{description}</p>
        )}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 flex-1 rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary transition hover:border-strong hover:text-primary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
