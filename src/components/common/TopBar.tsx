import type { BoardDefinition, GamePhase } from '../../logic/types';
import { PHASE_LABELS } from './displayHelpers';

interface TopBarProps {
  phase: GamePhase;
  round: number;
  board?: BoardDefinition;
  onOpenQA: () => void;
  onOpenRestart: () => void;
}

export function TopBar({ phase, round, board, onOpenQA, onOpenRestart }: TopBarProps) {
  const showQA = Boolean(board);
  const isNight = phase === 'night';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-100">
              {board ? board.name : '狼人殺法官輔助'}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-amber-300">
              {PHASE_LABELS[phase]}
            </span>
            {(phase === 'night' || phase === 'day_announcement' || phase === 'day_vote') && (
              <span>
                第 {round} {phase === 'night' ? '晚' : '天'}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showQA && (
            <button
              type="button"
              onClick={onOpenQA}
              className={`min-h-12 rounded-xl border px-3 text-xs font-bold transition active:scale-[0.98] ${
                isNight
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-200 shadow-xs shadow-amber-500/10 hover:bg-amber-500/30'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Q &amp; A 速查
            </button>
          )}
          <button
            type="button"
            onClick={onOpenRestart}
            className="min-h-12 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3 text-xs font-bold text-rose-200 transition hover:bg-rose-900/60 active:scale-[0.98]"
          >
            重開新局
          </button>
        </div>
      </div>
    </header>
  );
}
