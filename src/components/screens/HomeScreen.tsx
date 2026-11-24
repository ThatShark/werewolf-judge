import type { GamePhase } from '../../logic/types';
import { PHASE_LABELS } from '../common/displayHelpers';

interface HomeScreenProps {
  hasActiveGame: boolean;
  currentPhase: GamePhase;
  selectedBoardName?: string;
  onHost: () => void;
  onJoin: () => void;
  onRules: () => void;
  onAbout: () => void;
}

export function HomeScreen({
  hasActiveGame,
  currentPhase,
  selectedBoardName,
  onHost,
  onJoin,
  onRules,
  onAbout,
}: HomeScreenProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col justify-between px-4 py-6 md:max-w-2xl md:py-10">
      <header className="shrink-0 border-l-2 border-sheriff pl-3 pt-2">
        <div className="text-[12px] font-semibold uppercase tracking-widest text-secondary">
          WEREWOLF JUDGE CONSOLE
        </div>
        <h1 className="mt-1 text-[18px] font-semibold leading-6 text-primary">狼人殺法官輔助</h1>
        {hasActiveGame && (
          <p className="mt-1 truncate text-[12px] text-sheriff">
            進行中：{selectedBoardName ?? '已選板子'} · {PHASE_LABELS[currentPhase]}
          </p>
        )}
      </header>

      <nav aria-label="主頁功能入口" className="my-auto flex w-full flex-col gap-2.5 py-6">
        <button
          type="button"
          onClick={onHost}
          className="flex min-h-14 w-full items-center justify-between rounded-md bg-sheriff px-4 text-left text-[14px] font-semibold text-inverse transition hover:opacity-90"
        >
          <span>{hasActiveGame ? '繼續主持對局' : '主持開局'}</span>
          <span className="text-[12px] font-semibold">→</span>
        </button>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onJoin}
            className="flex min-h-12 items-center justify-between rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-primary transition hover:border-strong hover:bg-elevated"
          >
            <span>加入房間</span>
            <span className="text-[12px] text-muted">→</span>
          </button>

          <button
            type="button"
            onClick={onRules}
            className="flex min-h-12 items-center justify-between rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-primary transition hover:border-strong hover:bg-elevated"
          >
            <span>規則圖鑑</span>
            <span className="text-[12px] text-muted">→</span>
          </button>

          <button
            type="button"
            onClick={onAbout}
            className="flex min-h-12 items-center justify-between rounded-md border border-subtle bg-surface px-4 text-[14px] font-medium text-primary transition hover:border-strong hover:bg-elevated"
          >
            <span>關於</span>
            <span className="text-[12px] text-muted">→</span>
          </button>
        </div>
      </nav>

      <footer className="shrink-0 text-[12px] tabular-nums text-muted">
        142 板子 · 128 角色 · 本機自動保存
      </footer>
    </div>
  );
}
