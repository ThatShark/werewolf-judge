import { formatChineseDay, formatChineseNight } from '../../logic';
import type { BoardDefinition, GamePhase } from '../../logic/types';
import type { AppView } from '../../store/gameStore';
import { PHASE_LABELS } from './displayHelpers';

interface TopBarProps {
  activeView: AppView;
  phase: GamePhase;
  round: number;
  board?: BoardDefinition;
  canUndoDayAction?: boolean;
  onUndoDayAction?: () => void;
  onGoHome: () => void;
  onOpenQA: () => void;
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
  canUndoDayAction = false,
  onUndoDayAction,
  onGoHome,
  onOpenQA,
  onOpenHistory,
  onOpenRestart,
}: TopBarProps) {
  const isGame = activeView === 'game';
  const isActiveMatch =
    isGame &&
    (phase === 'pass_and_reveal' ||
      phase === 'night' ||
      phase === 'day_announcement' ||
      phase === 'day_vote' ||
      phase === 'game_over');
  const showQA = isGame && Boolean(board);
  const showHistory = isActiveMatch;
  const showRestart = isActiveMatch;
  const viewTitle =
    activeView !== 'game' && activeView !== 'home' ? VIEW_TITLES[activeView] : null;

  const roundCode =
    isGame && (phase === 'night' || phase === 'day_announcement' || phase === 'day_vote')
      ? phase === 'night'
        ? formatChineseNight(round)
        : formatChineseDay(round)
      : null;

  return (
    <header className="safe-pt shrink-0 border-b border-subtle bg-surface">
      <div className="mx-auto flex h-[52px] max-w-lg items-center justify-between gap-2 px-2 md:max-w-2xl">
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
            {isActiveMatch && canUndoDayAction && onUndoDayAction && (
              <button
                type="button"
                onClick={onUndoDayAction}
                className="min-h-11 rounded-md px-2 text-[12px] font-semibold text-sheriff transition hover:bg-sheriff-tint"
              >
                撤銷上一步
              </button>
            )}
            {showHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="min-h-11 rounded-md px-2 text-[12px] font-medium text-secondary transition hover:bg-elevated hover:text-primary"
              >
                紀錄
              </button>
            )}
            {showQA && (
              <button
                type="button"
                onClick={onOpenQA}
                className="min-h-11 rounded-md px-2 text-[12px] font-medium text-secondary transition hover:bg-elevated hover:text-primary"
              >
                規則
              </button>
            )}
            {showRestart && (
              <button
                type="button"
                onClick={onOpenRestart}
                className="min-h-11 rounded-md px-2 text-[12px] font-medium text-wolf transition hover:bg-wolf-tint"
              >
                重開
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
