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
  subtitle,
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
      className={`fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-xs ${
        isRight ? 'items-stretch justify-end' : 'items-end justify-center'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`flex flex-col border-slate-700 bg-slate-900 shadow-2xl ${
          isRight
            ? 'h-full w-full max-w-md border-l'
            : 'max-h-[85dvh] w-full max-w-lg rounded-t-3xl border-t border-x md:max-w-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
          <div className="min-w-0">
            {subtitle && (
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {subtitle}
              </p>
            )}
            <h2 className="truncate text-lg font-bold text-slate-50">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 min-w-12 shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-[0.98]"
          >
            關閉
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
