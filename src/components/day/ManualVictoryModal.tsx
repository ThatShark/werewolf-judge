import type { ManualVictoryOverrideKind } from '../../logic/types';

interface ManualVictoryModalProps {
  open: boolean;
  onSelectOverride: (kind: ManualVictoryOverrideKind) => void;
  onClose: () => void;
}

const OVERRIDE_OPTIONS: Array<{
  kind: ManualVictoryOverrideKind;
  title: string;
  description: string;
  className: string;
}> = [
  {
    kind: 'good_surrender',
    title: '🏳️ 宣告好人交牌（狼人陣營勝）',
    description: '好人陣營認輸交牌，立即結算狼人陣營勝利。',
    className: 'border-rose-500/45 bg-rose-950/40 text-rose-100 hover:bg-rose-900/50',
  },
  {
    kind: 'wolf_surrender',
    title: '🏳️ 宣告狼人交牌（好人陣營勝）',
    description: '狼人陣營認輸交牌，立即結算好人陣營勝利。',
    className: 'border-emerald-500/45 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50',
  },
  {
    kind: 'force_draw',
    title: '🤝 強制結束（判定平局）',
    description: '因特殊房規或中斷對局，立即強制結束並判定平局。',
    className: 'border-amber-400/45 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Judge Override · 法官手動勝負覆蓋
          </span>
          <h2 className="mt-0.5 text-lg font-extrabold text-slate-50">
            手動宣判對局結果
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            用於交牌認輸、特殊房規或中斷強制結算；進入結算畫面後仍可點擊「法官強制繼續」返回對局。
          </p>
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
              className={`min-h-14 w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${opt.className}`}
            >
              <div className="text-sm font-extrabold">{opt.title}</div>
              <div className="mt-0.5 text-[11px] opacity-80">{opt.description}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-bold text-slate-200 hover:bg-slate-700"
        >
          取消返回
        </button>
      </div>
    </div>
  );
}
