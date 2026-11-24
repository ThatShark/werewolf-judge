import type { ManualVictoryOverrideKind } from '../../logic/types';

interface ManualVictoryModalProps {
  open: boolean;
  onSelectOverride: (kind: ManualVictoryOverrideKind) => void;
  onClose: () => void;
}

const OVERRIDE_OPTIONS: Array<{
  kind: ManualVictoryOverrideKind;
  title: string;
  className: string;
}> = [
  {
    kind: 'good_surrender',
    title: '好人交牌（狼人勝）',
    className: 'border-wolf-border bg-wolf-tint text-wolf hover:opacity-90',
  },
  {
    kind: 'wolf_surrender',
    title: '狼人交牌（好人勝）',
    className: 'border-good-border bg-good-tint text-good hover:opacity-90',
  },
  {
    kind: 'force_draw',
    title: '強制結束（平局）',
    className: 'border-subtle bg-canvas text-primary hover:border-strong',
  },
];

export function ManualVictoryModal({
  open,
  onSelectOverride,
  onClose,
}: ManualVictoryModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/78 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm space-y-3 rounded-lg border border-strong bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[18px] font-semibold leading-6 text-primary">手動宣判結果</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[14px] text-secondary hover:bg-elevated hover:text-primary"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {OVERRIDE_OPTIONS.map((opt) => (
            <button
              key={opt.kind}
              type="button"
              onClick={() => {
                onSelectOverride(opt.kind);
                onClose();
              }}
              className={`min-h-12 w-full rounded-md border px-4 text-left text-[14px] font-semibold transition ${opt.className}`}
            >
              {opt.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
