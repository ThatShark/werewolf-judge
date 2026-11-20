import { useMemo, useState } from 'react';
import { ALL_BOARDS, filterBoards } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import type { PlayerCountFilter, RuleOverrides, WitchSelfSaveRule } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { RULE_TOGGLE_META, getRoleBadgeClasses } from '../common/displayHelpers';

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

const WITCH_SELF_SAVE_OPTIONS: Array<{ value: WitchSelfSaveRule; label: string }> = [
  { value: 'first_night_only', label: '僅首夜可自救' },
  { value: 'never', label: '全程不可自救' },
  { value: 'always', label: '全程可自救' },
];

export function BoardSelectScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const selectBoard = useGameStore((s) => s.selectBoard);
  const updateRuleOverrides = useGameStore((s) => s.updateRuleOverrides);

  const [countFilter, setCountFilter] = useState<PlayerCountFilter | 'all'>('all');
  const [query, setQuery] = useState('');
  const [previewBoardId, setPreviewBoardId] = useState<string>(
    selectedBoardId ?? ALL_BOARDS[0]?.id ?? '',
  );

  const filteredBoards = useMemo(
    () => filterBoards(ALL_BOARDS, countFilter, query),
    [countFilter, query],
  );

  const activeBoard = useMemo(() => {
    const matched = filteredBoards.find((b) => b.id === previewBoardId);
    return matched ?? filteredBoards[0] ?? null;
  }, [filteredBoards, previewBoardId]);

  const renderRuleToggle = (toggleKey: keyof RuleOverrides) => {
    const meta = RULE_TOGGLE_META[toggleKey];

    if (toggleKey === 'witchSelfSave') {
      return (
        <div
          key={toggleKey}
          className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
        >
          <div className="text-sm font-bold text-slate-100">{meta.label}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {WITCH_SELF_SAVE_OPTIONS.map((opt) => {
              const active = ruleOverrides.witchSelfSave === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ witchSelfSave: opt.value })}
                  className={`min-h-12 rounded-xl border px-2 py-2 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (toggleKey === 'victoryMode') {
      return (
        <div
          key={toggleKey}
          className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
        >
          <div className="text-sm font-bold text-slate-100">{meta.label}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{meta.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { value: 'slaughter_side', label: '屠邊（預設）' },
                { value: 'slaughter_all', label: '屠城' },
              ] as const
            ).map((opt) => {
              const active = ruleOverrides.victoryMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateRuleOverrides({ victoryMode: opt.value })}
                  className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const boolValue = ruleOverrides[toggleKey];
    return (
      <button
        key={toggleKey}
        type="button"
        onClick={() => updateRuleOverrides({ [toggleKey]: !boolValue })}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-left transition hover:border-slate-700"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-100">{meta.label}</div>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{meta.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
            boolValue
              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
              : 'border-slate-700 bg-slate-800 text-slate-400'
          }`}
        >
          {boolValue ? '開啟' : '關閉'}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5 pb-28">
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div>
          <h1 className="text-lg font-bold text-slate-50">選擇板子與開局規則</h1>
          <p className="mt-1 text-xs text-slate-400">
            支援人數篩選與關鍵字（板子名稱、別名、角色名）即時搜尋。
          </p>
        </div>

        {/* 人數篩選標籤列 */}
        <div className="flex flex-wrap gap-2">
          {COUNT_FILTERS.map((filter) => {
            const active = countFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCountFilter(filter.value)}
                className={`min-h-12 rounded-xl border px-3.5 text-sm font-bold transition active:scale-[0.98] ${
                  active
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* 關鍵字搜尋框 */}
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋板子或角色（例：鏡隱迷蹤、黑狼王、通靈師）"
            className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 pr-16 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1.5 min-h-9 rounded-lg bg-slate-800 px-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              清除
            </button>
          )}
        </div>
      </section>

      {/* 板子清單 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-300">
            符合條件的板子（{filteredBoards.length}）
          </h2>
        </div>

        {filteredBoards.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
            <p className="text-sm font-semibold text-slate-300">
              沒有符合「{query || countFilter}」的板子
            </p>
            <button
              type="button"
              onClick={() => {
                setCountFilter('all');
                setQuery('');
              }}
              className="mt-3 min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              重設篩選條件
            </button>
          </div>
        ) : (
          <div
            className={`space-y-2.5 ${
              filteredBoards.length > 4
                ? 'max-h-[46dvh] overflow-y-auto pr-1'
                : ''
            }`}
          >
            {filteredBoards.map((board) => {
              const isSelected = activeBoard?.id === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => setPreviewBoardId(board.id)}
                  className={`min-h-12 w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                    isSelected
                      ? 'border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-50">{board.name}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {[
                          ...board.composition.wolf,
                          ...board.composition.good,
                          ...(board.composition.thirdParty ?? []),
                        ].map((slot) => {
                          const role = getRoleById(slot.roleId);
                          return (
                            <span
                              key={slot.roleId}
                              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(slot.roleId)}`}
                            >
                              {role?.name ?? slot.roleId} ×{slot.count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {board.playerCountRange
                          ? `${board.playerCountRange[0]}~${board.playerCountRange[1]} 人局`
                          : `${board.playerCount} 人局`}
                      </span>
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                          board.automationLevel === 'full'
                            ? 'border-emerald-500/35 bg-emerald-950/50 text-emerald-300'
                            : 'border-indigo-500/35 bg-indigo-950/50 text-indigo-300'
                        }`}
                      >
                        {board.automationLevel === 'full' ? '⚡ 自動結算' : '🎙️ 台詞+手動輔助'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 選定板子詳細預覽與規則微調 */}
      {activeBoard && (
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
          <div className="border-b border-slate-800 pb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              板子預覽與開局設定
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-50">{activeBoard.name}</h2>
          </div>

          {/* 配置明細 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              陣營與身分配置（共 {activeBoard.playerCount} 人）
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3">
                <div className="text-xs font-bold text-rose-300">狼人陣營</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeBoard.composition.wolf.map((slot) => (
                    <span
                      key={slot.roleId}
                      className="rounded-lg border border-rose-500/30 bg-rose-950/60 px-2.5 py-1 text-xs font-semibold text-rose-100"
                    >
                      {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3">
                <div className="text-xs font-bold text-emerald-300">好人陣營</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeBoard.composition.good.map((slot) => (
                    <span
                      key={slot.roleId}
                      className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-slate-100"
                    >
                      {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                    </span>
                  ))}
                </div>
              </div>
              {activeBoard.composition.thirdParty &&
                activeBoard.composition.thirdParty.length > 0 && (
                  <div className="sm:col-span-2 rounded-xl border border-amber-500/25 bg-amber-950/20 p-3">
                    <div className="text-xs font-bold text-amber-300">第三方 / 特殊陣營</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {activeBoard.composition.thirdParty.map((slot) => (
                        <span
                          key={slot.roleId}
                          className="rounded-lg border border-amber-500/35 bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-100"
                        >
                          {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            {activeBoard.compositionNote && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-3 py-2 text-xs leading-relaxed text-amber-200">
                💡 {activeBoard.compositionNote}
              </div>
            )}
          </div>

          {/* 睜眼順序預覽 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              夜間睜眼順序
            </h3>
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-amber-300">第一晚：</span>
                <span className="text-slate-200">
                  {activeBoard.nightSchedule.firstNight
                    .map((step) => step.actorLabel)
                    .join(' ➜ ')}
                </span>
              </div>
              <div>
                <span className="font-bold text-indigo-300">第二晚起：</span>
                <span className="text-slate-200">
                  {activeBoard.nightSchedule.subsequentNights
                    .map((step) => step.actorLabel)
                    .join(' ➜ ')}
                </span>
              </div>
            </div>
          </div>

          {/* 規則微調開關 */}
          {activeBoard.supportedRuleToggles.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                規則微調開關
              </h3>
              <div className="space-y-2.5">
                {activeBoard.supportedRuleToggles.map((toggleKey) =>
                  renderRuleToggle(toggleKey),
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 固定底部確認按鈕 */}
      {activeBoard && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
          <div className="mx-auto max-w-lg">
            <button
              type="button"
              onClick={() => selectBoard(activeBoard.id)}
              className="min-h-12 w-full rounded-xl bg-amber-500 px-5 py-3.5 text-base font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.99]"
            >
              確認板子並設定座位（{activeBoard.playerCount} 人）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
