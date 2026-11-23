import { useMemo, useState } from 'react';
import { ALL_BOARDS, filterBoards } from '../../data/boards';
import { ROLE_LIST, getRoleById } from '../../data/roles';
import type { BoardDefinition, PlayerCountFilter, RoleCategory } from '../../logic/types';
import { SlideDrawer } from '../common/SlideDrawer';
import { getRoleBadgeClasses } from '../common/displayHelpers';

type AtlasTab = 'boards' | 'roles';

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

const ROLE_FILTERS: Array<{ value: RoleCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'wolf', label: '狼人' },
  { value: 'god', label: '神職' },
  { value: 'villager', label: '平民' },
  { value: 'third_party', label: '第三方' },
];

const CATEGORY_LABELS: Record<RoleCategory, string> = {
  wolf: '狼人陣營',
  god: '好人神職',
  villager: '好人平民',
  third_party: '第三方陣營',
};

export function RulesAtlasScreen() {
  const [tab, setTab] = useState<AtlasTab>('boards');
  const [query, setQuery] = useState('');
  const [countFilter, setCountFilter] = useState<PlayerCountFilter | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<RoleCategory | 'all'>('all');
  const [selectedBoard, setSelectedBoard] = useState<BoardDefinition | null>(null);
  const [flippedRoleIds, setFlippedRoleIds] = useState<Record<string, boolean>>({});

  const filteredBoards = useMemo(
    () => filterBoards(ALL_BOARDS, countFilter, query),
    [countFilter, query],
  );

  const filteredRoles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ROLE_LIST.filter((role) => {
      if (roleFilter !== 'all' && role.category !== roleFilter) {
        return false;
      }
      if (!normalized) return true;
      const haystack = [role.name, ...role.aliases, role.description].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [roleFilter, query]);

  const toggleRoleFlip = (roleId: string) => {
    setFlippedRoleIds((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 雙分頁切換 + 搜尋 + 篩選區（固定不捲動） */}
      <div className="shrink-0 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setTab('boards')}
            className={`min-h-12 rounded-xl text-sm font-bold transition ${
              tab === 'boards'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            板子一覽 ({ALL_BOARDS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('roles')}
            className={`min-h-12 rounded-xl text-sm font-bold transition ${
              tab === 'roles'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            角色圖鑑 ({ROLE_LIST.length})
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === 'boards'
              ? '搜尋板子名稱或別名（如：鏡隱迷蹤、狼王守衛）'
              : '搜尋角色名稱、別名或技能（如：黑狼王、預言家）'
          }
          aria-label="搜尋規則圖鑑"
          className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tab === 'boards'
            ? COUNT_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCountFilter(item.value)}
                  className={`min-h-12 shrink-0 rounded-xl border px-3 text-xs font-bold transition ${
                    countFilter === item.value
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))
            : ROLE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRoleFilter(item.value)}
                  className={`min-h-12 shrink-0 rounded-xl border px-3 text-xs font-bold transition ${
                    roleFilter === item.value
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
        </div>
      </div>

      {/* 內部局部捲動清單區 */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 pb-2">
        {tab === 'boards' ? (
          filteredBoards.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
              找不到符合條件的板子，請嘗試其他關鍵字或人數篩選。
            </div>
          ) : (
            filteredBoards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => setSelectedBoard(board)}
                className="flex min-h-16 w-full flex-col gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 text-left transition hover:border-emerald-500/50 hover:bg-slate-800/90 active:scale-[0.99]"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-100">{board.name}</span>
                  <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    {board.playerCountRange
                      ? `${board.playerCountRange[0]}~${board.playerCountRange[1]}人`
                      : `${board.playerCount}人`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {board.keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[11px] text-slate-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )
        ) : filteredRoles.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
            找不到符合條件的角色，請嘗試其他關鍵字或陣營篩選。
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isFlipped = Boolean(flippedRoleIds[role.id]);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRoleFlip(role.id)}
                aria-expanded={isFlipped}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-left transition hover:border-emerald-500/40 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${getRoleBadgeClasses(role.id)}`}
                    >
                      {role.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {CATEGORY_LABELS[role.category]}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-emerald-400">
                    {isFlipped ? '收合 ▲' : '點擊翻面 ▼'}
                  </span>
                </div>

                {role.aliases.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    別名：{role.aliases.join('、')}
                  </p>
                )}

                {isFlipped ? (
                  <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                      {role.description}
                    </p>
                    {role.warnings && role.warnings.length > 0 && (
                      <ul className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-950/25 p-3">
                        {role.warnings.map((w, idx) => (
                          <li key={idx} className="text-xs leading-relaxed text-amber-300">
                            • {w}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {role.description}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* 板子完整詳情抽屜 */}
      <SlideDrawer
        open={Boolean(selectedBoard)}
        onClose={() => setSelectedBoard(null)}
        title={selectedBoard?.name ?? '板子詳情'}
        subtitle="Board Details"
        placement="bottom"
      >
        {selectedBoard && (
          <div className="space-y-5 pb-4">
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                角色配置
              </h3>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-rose-300">狼人：</span>
                  {selectedBoard.composition.wolf.map((slot) => (
                    <span
                      key={slot.roleId}
                      className="rounded-lg bg-rose-950/70 px-2 py-0.5 text-xs text-rose-200"
                    >
                      {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-emerald-300">好人：</span>
                  {selectedBoard.composition.good.map((slot) => (
                    <span
                      key={slot.roleId}
                      className="rounded-lg bg-emerald-950/70 px-2 py-0.5 text-xs text-emerald-200"
                    >
                      {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                    </span>
                  ))}
                </div>
                {selectedBoard.composition.thirdParty &&
                  selectedBoard.composition.thirdParty.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-violet-300">第三方：</span>
                      {selectedBoard.composition.thirdParty.map((slot) => (
                        <span
                          key={slot.roleId}
                          className="rounded-lg bg-violet-950/70 px-2 py-0.5 text-xs text-violet-200"
                        >
                          {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                        </span>
                      ))}
                    </div>
                  )}
                {selectedBoard.compositionNote && (
                  <p className="border-t border-slate-800 pt-2 text-xs leading-relaxed text-amber-300">
                    {selectedBoard.compositionNote}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                第一晚睜眼順序
              </h3>
              <ol className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-200">
                {selectedBoard.nightSchedule.firstNight.map((step, i) => (
                  <li key={step.stepId} className="leading-relaxed">
                    <span className="font-bold text-amber-300">{i + 1}. {step.actorLabel}：</span>
                    <span className="text-slate-300">{step.actionPrompt}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                常見 Q &amp; A
              </h3>
              {selectedBoard.qaList.length === 0 ? (
                <p className="text-xs text-slate-400">此板子無額外 Q&amp;A 條目。</p>
              ) : (
                selectedBoard.qaList.map((qa) => (
                  <div
                    key={qa.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                  >
                    <h4 className="whitespace-pre-line text-sm font-bold text-slate-100">
                      Q：{qa.question}
                    </h4>
                    <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-300">
                      A：{qa.answer}
                    </p>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
