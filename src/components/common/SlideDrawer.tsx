import { useEffect, type ReactNode } from 'react';

export interface SlideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  placement?: 'bottom' | 'right';
  children: ReactNode;
}

export function SlideDrawer({
  open,
  onClose,
  title,
  placement = 'bottom',
  children,
}: SlideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isRight = placement === 'right';

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/78 ${
        isRight ? 'items-stretch justify-end' : 'items-end justify-center'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`flex flex-col border-subtle bg-surface ${
          isRight
            ? 'h-full w-full max-w-md border-l'
            : 'max-h-[85dvh] w-full max-w-lg rounded-t-xl border-x border-t md:max-w-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-subtle px-4">
          <h2 className="truncate text-[18px] font-semibold leading-6 text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-[14px] font-semibold text-secondary transition hover:bg-elevated hover:text-primary"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
