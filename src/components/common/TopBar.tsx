import type { BoardDefinition, GamePhase } from '../../logic/types';
import type { AppView } from '../../store/gameStore';
import { PHASE_LABELS } from './displayHelpers';

interface TopBarProps {
  activeView: AppView;
  phase: GamePhase;
  round: number;
  board?: BoardDefinition;
  onGoHome: () => void;
  onOpenQA: () => void;
  onOpenNotebook: () => void;
  onOpenHistory: () => void;
  onOpenRestart: () => void;
}

const VIEW_TITLES: Record<Exclude<AppView, 'game' | 'home'>, { title: string; badge: string }> = {
  join_room: { title: '加入房間', badge: '連線大廳' },
  rules_atlas: { title: '板子與角色圖鑑', badge: '142 板子 · 128 角色' },
  about: { title: '關於本網站', badge: '專案資訊' },
};

export function TopBar({
  activeView,
  phase,
  round,
  board,
  onGoHome,
  onOpenQA,
  onOpenNotebook,
  onOpenHistory,
  onOpenRestart,
}: TopBarProps) {
  const isGame = activeView === 'game';
  const showQA = isGame && Boolean(board);
  const isNight = isGame && phase === 'night';
  const viewMeta =
    activeView !== 'game' && activeView !== 'home' ? VIEW_TITLES[activeView] : null;

  return (
    <header className="shrink-0 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-3 py-2 md:max-w-2xl">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onGoHome}
            aria-label="返回主頁"
            className="min-h-12 shrink-0 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-slate-100 active:scale-[0.98]"
          >
            ← 主頁
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-slate-100">
                {viewMeta ? viewMeta.title : board ? board.name : '狼人殺法官輔助'}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-amber-300">
                {viewMeta ? viewMeta.badge : PHASE_LABELS[phase]}
              </span>
              {isGame &&
                (phase === 'night' || phase === 'day_announcement' || phase === 'day_vote') && (
                  <span>
                    第 {round} {phase === 'night' ? '晚' : '天'}
                  </span>
                )}
            </div>
          </div>
        </div>

        {isGame && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenNotebook}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 active:scale-[0.98]"
            >
              筆記
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 active:scale-[0.98]"
            >
              紀錄
            </button>
            {showQA && (
              <button
                type="button"
                onClick={onOpenQA}
                className={`min-h-12 rounded-xl border px-2.5 text-xs font-bold transition active:scale-[0.98] ${
                  isNight
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-200 shadow-xs shadow-amber-500/10 hover:bg-amber-500/30'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Q&amp;A
              </button>
            )}
            <button
              type="button"
              onClick={onOpenRestart}
              className="min-h-12 rounded-xl border border-rose-500/40 bg-rose-950/50 px-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-900/60 active:scale-[0.98]"
            >
              重開
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
