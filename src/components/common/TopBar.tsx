import type { BoardDefinition, GamePhase } from '../../logic/types';
import type { AppView } from '../../store/gameStore';
import { PHASE_LABELS } from './displayHelpers';

interface TopBarProps {
  activeView: AppView;
  phase: GamePhase;
  round: number;
  board?: BoardDefinition;
  canUndo?: boolean;
  undoLabel?: string;
  onUndo?: () => void;
  onGoHome: () => void;
  onOpenQA: () => void;
  onOpenNotebook: () => void;
  onOpenHistory: () => void;
  onOpenRestart: () => void;
}

const VIEW_TITLES: Record<Exclude<AppView, 'game' | 'home'>, string> = {
  join_room: '加入房間',
  rules_atlas: '規則圖鑑',
  about: '關於',
};

export function TopBar({
  activeView,
  phase,
  round,
  board,
  canUndo = false,
  undoLabel,
  onUndo,
  onGoHome,
  onOpenQA,
  onOpenNotebook,
  onOpenHistory,
  onOpenRestart,
}: TopBarProps) {
  const isGame = activeView === 'game';
  const showQA = isGame && Boolean(board);
  const viewTitle =
    activeView !== 'game' && activeView !== 'home' ? VIEW_TITLES[activeView] : null;

  const roundCode =
    isGame && (phase === 'night' || phase === 'day_announcement' || phase === 'day_vote')
      ? `${phase === 'night' ? 'N' : 'D'}${round}`
      : null;

  return (
    <header className="h-[52px] shrink-0 border-b border-subtle bg-surface">
      <div className="mx-auto flex h-full max-w-lg items-center justify-between gap-2 px-2 md:max-w-2xl">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            onClick={onGoHome}
            aria-label="返回主頁"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-[14px] font-semibold text-secondary transition hover:bg-elevated hover:text-primary active:bg-elevated"
          >
            ←
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-semibold leading-5 text-primary">
                {viewTitle ?? (board ? board.name : '狼人殺法官')}
              </span>
              {roundCode && (
                <span className="shrink-0 text-[12px] font-semibold tabular-nums text-sheriff">
                  {roundCode}
                </span>
              )}
            </div>
            {isGame && (
              <div className="truncate text-[12px] leading-4 text-secondary">
                {PHASE_LABELS[phase]}
              </div>
            )}
          </div>
        </div>

        {isGame && (
          <div className="flex shrink-0 items-center gap-0.5">
            {canUndo && onUndo && (
              <button
                type="button"
                onClick={onUndo}
                title={undoLabel ? `撤銷：${undoLabel}` : '撤銷上一步'}
                aria-label="撤銷上一步"
                className="min-h-11 rounded-md border border-sheriff-border bg-sheriff-tint px-2.5 text-[12px] font-semibold text-sheriff transition hover:bg-elevated"
              >
                撤銷
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNotebook}
              className="min-h-11 rounded-md px-2 text-[12px] font-medium text-secondary transition hover:bg-elevated hover:text-primary"
            >
              筆記
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-11 rounded-md px-2 text-[12px] font-medium text-secondary transition hover:bg-elevated hover:text-primary"
            >
              紀錄
            </button>
            {showQA && (
              <button
                type="button"
                onClick={onOpenQA}
                className="min-h-11 rounded-md px-2 text-[12px] font-medium text-secondary transition hover:bg-elevated hover:text-primary"
              >
                規則
              </button>
            )}
            <button
              type="button"
              onClick={onOpenRestart}
              className="min-h-11 rounded-md px-2 text-[12px] font-medium text-wolf transition hover:bg-wolf-tint"
            >
              重開
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
