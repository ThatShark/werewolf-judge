import { useMemo, useState } from 'react';
import { ALL_BOARDS, filterBoards } from '../../data/boards';
import type { PlayerCountFilter } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { QADrawer } from '../common/QADrawer';
import { formatBoardRoleList } from '../common/displayHelpers';

const COUNT_FILTERS: Array<{ value: PlayerCountFilter | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: '6', label: '6人' },
  { value: '7', label: '7人' },
  { value: '8', label: '8人' },
  { value: '9', label: '9人' },
  { value: '10', label: '10人' },
  { value: '12', label: '12人' },
  { value: 'multi', label: '多人' },
];

export function BoardSelectScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const selectBoard = useGameStore((s) => s.selectBoard);
  const goToHostSetup = useGameStore((s) => s.goToHostSetup);

  const [countFilter, setCountFilter] = useState<PlayerCountFilter | 'all'>('all');
  const [query, setQuery] = useState('');
  const [previewBoardId, setPreviewBoardId] = useState<string>(
    selectedBoardId ?? ALL_BOARDS[0]?.id ?? '',
  );
  const [qaOpen, setQaOpen] = useState(false);

  const filteredBoards = useMemo(
    () => filterBoards(ALL_BOARDS, countFilter, query),
    [countFilter, query],
  );

  const activeBoard = useMemo(() => {
    const matched = filteredBoards.find((b) => b.id === previewBoardId);
    return matched ?? filteredBoards[0] ?? null;
  }, [filteredBoards, previewBoardId]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 篩選與搜尋列 */}
      <section className="shrink-0 space-y-2">
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {COUNT_FILTERS.map((filter) => {
            const active = countFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCountFilter(filter.value)}
                className={`min-h-11 shrink-0 rounded-md px-3 text-[12px] font-semibold transition ${
                  active
                    ? 'bg-sheriff text-inverse'
                    : 'border border-subtle bg-surface text-secondary hover:border-strong hover:text-primary'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋板子或角色名..."
            className="min-h-12 w-full rounded-md border border-subtle bg-surface px-3 pr-14 text-[14px] text-primary placeholder:text-muted focus:border-sheriff focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1.5 min-h-9 rounded-md px-2.5 text-[12px] font-medium text-secondary hover:bg-elevated hover:text-primary"
            >
              清除
            </button>
          )}
        </div>
      </section>

      {/* 板子清單（板子名稱 ＋ 人數 ＋ 具體角色配置清單） */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-subtle bg-surface">
        <div className="flex shrink-0 items-center justify-between border-b border-subtle px-3 py-2 text-[12px] text-secondary">
          <span>步驟 2 / 2 · 選擇板子</span>
          <span className="tabular-nums">{filteredBoards.length}</span>
        </div>

        {filteredBoards.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <p className="text-[14px] text-secondary">無符合條件的板子</p>
            <button
              type="button"
              onClick={() => {
                setCountFilter('all');
                setQuery('');
              }}
              className="mt-3 min-h-11 rounded-md border border-subtle bg-canvas px-4 text-[12px] font-medium text-primary hover:border-strong"
            >
              重設篩選
            </button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 divide-y divide-subtle overflow-y-auto">
            {filteredBoards.map((board) => {
              const isSelected = activeBoard?.id === board.id;
              const countLabel = board.playerCountRange
                ? `${board.playerCountRange[0]}~${board.playerCountRange[1]}人`
                : `${board.playerCount}人`;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => setPreviewBoardId(board.id)}
                  className={`flex min-h-14 w-full flex-col gap-1 px-3 py-2.5 text-left transition ${
                    isSelected
                      ? 'border-l-2 border-sheriff bg-elevated'
                      : 'hover:bg-elevated/50'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={`truncate text-[14px] font-semibold ${
                        isSelected ? 'text-primary' : 'text-primary/90'
                      }`}
                    >
                      {board.name}
                    </span>
                    <span
                      className={`shrink-0 text-[12px] font-semibold tabular-nums ${
                        isSelected ? 'text-sheriff' : 'text-muted'
                      }`}
                    >
                      {countLabel}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-[12px] leading-4 text-secondary">
                    {formatBoardRoleList(board)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 底部固定操作區：返回模式 ＋ 規則/Q&A 線框 ＋ 單一實心主按鈕 */}
      {activeBoard && (
        <footer className="flex shrink-0 items-center gap-2 border-t border-subtle pt-2">
          <button
            type="button"
            onClick={goToHostSetup}
            className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3 text-[13px] font-medium text-secondary transition hover:border-strong hover:text-primary"
          >
            模式
          </button>
          <button
            type="button"
            onClick={() => setQaOpen(true)}
            className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3.5 text-[14px] font-medium text-secondary transition hover:border-strong hover:text-primary"
          >
            規則/Q&amp;A
          </button>
          <button
            type="button"
            onClick={() => selectBoard(activeBoard.id)}
            className="min-h-12 flex-1 rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
          >
            進入房間（{activeBoard.playerCount}人）
          </button>
        </footer>
      )}

      <QADrawer
        open={qaOpen}
        board={activeBoard ?? undefined}
        ruleOverrides={ruleOverrides}
        onClose={() => setQaOpen(false)}
      />
    </div>
  );
}
