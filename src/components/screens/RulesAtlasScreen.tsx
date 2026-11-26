import { useMemo, useState } from 'react';
import { ALL_BOARDS, filterBoards } from '../../data/boards';
import { ROLE_LIST, getRoleById } from '../../data/roles';
import type { BoardDefinition, PlayerCountFilter, RoleCategory } from '../../logic/types';
import { SlideDrawer } from '../common/SlideDrawer';
import { formatBoardRoleList, getRoleBadgeClasses } from '../common/displayHelpers';

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
  wolf: '狼人',
  god: '神職',
  villager: '平民',
  third_party: '第三方',
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
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="shrink-0 space-y-2">
        <div className="grid grid-cols-2 gap-1 rounded-md border border-subtle bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab('boards')}
            className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
              tab === 'boards' ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            板子 ({ALL_BOARDS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('roles')}
            className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
              tab === 'roles' ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            角色 ({ROLE_LIST.length})
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'boards' ? '搜尋板子名稱或角色...' : '搜尋角色名稱、別名或技能...'}
          aria-label="搜尋規則圖鑑"
          className="min-h-12 w-full rounded-md border border-subtle bg-surface px-3 text-[14px] text-primary placeholder:text-muted focus:border-sheriff focus:outline-none"
        />

        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {tab === 'boards'
            ? COUNT_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCountFilter(item.value)}
                  className={`min-h-10 shrink-0 rounded-md px-3 text-[12px] font-semibold transition ${
                    countFilter === item.value
                      ? 'bg-sheriff text-inverse'
                      : 'border border-subtle bg-surface text-secondary hover:border-strong'
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
                  className={`min-h-10 shrink-0 rounded-md px-3 text-[12px] font-semibold transition ${
                    roleFilter === item.value
                      ? 'bg-sheriff text-inverse'
                      : 'border border-subtle bg-surface text-secondary hover:border-strong'
                  }`}
                >
                  {item.label}
                </button>
              ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-subtle overflow-y-auto rounded-lg border border-subtle bg-surface">
        {tab === 'boards' ? (
          filteredBoards.length === 0 ? (
            <div className="p-6 text-center text-[14px] text-muted">無符合條件的板子</div>
          ) : (
            filteredBoards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => setSelectedBoard(board)}
                className="flex min-h-14 w-full flex-col gap-1 px-3 py-2.5 text-left transition hover:bg-elevated"
              >
                <span className="truncate text-[14px] font-semibold text-primary">
                  {board.name}
                </span>
                <div className="line-clamp-2 text-[12px] leading-4 text-secondary">
                  {formatBoardRoleList(board)}
                </div>
              </button>
            ))
          )
        ) : filteredRoles.length === 0 ? (
          <div className="p-6 text-center text-[14px] text-muted">無符合條件的角色</div>
        ) : (
          filteredRoles.map((role) => {
            const isFlipped = Boolean(flippedRoleIds[role.id]);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRoleFlip(role.id)}
                aria-expanded={isFlipped}
                className="w-full px-3 py-3 text-left transition hover:bg-elevated/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[12px] font-semibold ${getRoleBadgeClasses(role.id)}`}
                    >
                      {role.name}
                    </span>
                    <span className="text-[12px] text-muted">{CATEGORY_LABELS[role.category]}</span>
                  </div>
                  <span className="text-[12px] text-secondary">{isFlipped ? '收合' : '展開'}</span>
                </div>

                {isFlipped ? (
                  <div className="mt-2 space-y-2 border-l-2 border-subtle pl-3">
                    {role.aliases.length > 0 && (
                      <div className="text-[12px] text-muted">別名：{role.aliases.join(' / ')}</div>
                    )}
                    <p className="whitespace-pre-line text-[14px] leading-5 text-primary">
                      {role.description}
                    </p>
                    {role.warnings && role.warnings.length > 0 && (
                      <ul className="space-y-1 text-[12px] text-sheriff">
                        {role.warnings.map((w, idx) => (
                          <li key={idx}>• {w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="mt-1.5 line-clamp-1 text-[12px] text-secondary">
                    {role.description}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>

      <SlideDrawer
        open={Boolean(selectedBoard)}
        onClose={() => setSelectedBoard(null)}
        title={selectedBoard?.name ?? '板子詳情'}
        placement="bottom"
      >
        {selectedBoard && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5 text-[12px]">
              {[
                ...selectedBoard.composition.wolf,
                ...selectedBoard.composition.good,
                ...(selectedBoard.composition.thirdParty ?? []),
              ].map((slot) => (
                <span
                  key={slot.roleId}
                  className={`rounded-md border px-2 py-0.5 font-semibold ${getRoleBadgeClasses(slot.roleId)}`}
                >
                  {getRoleById(slot.roleId)?.name ?? slot.roleId} ×{slot.count}
                </span>
              ))}
            </div>

            {selectedBoard.compositionNote && (
              <div className="border-l-2 border-sheriff pl-3 text-[12px] text-secondary">
                {selectedBoard.compositionNote}
              </div>
            )}

            <div className="space-y-1.5 border-t border-subtle pt-3 text-[12px]">
              <div>
                <span className="font-semibold text-sheriff">首夜：</span>
                <span className="text-primary">
                  {selectedBoard.nightSchedule.firstNight.map((s) => s.actorLabel).join(' → ')}
                </span>
              </div>
              <div>
                <span className="font-semibold text-secondary">次夜：</span>
                <span className="text-secondary">
                  {selectedBoard.nightSchedule.subsequentNights
                    .map((s) => s.actorLabel)
                    .join(' → ')}
                </span>
              </div>
            </div>

            {selectedBoard.qaList.length > 0 && (
              <div className="divide-y divide-subtle border-t border-subtle pt-2">
                {selectedBoard.qaList.map((qa) => (
                  <div key={qa.id} className="py-2.5">
                    <div className="text-[14px] font-semibold text-primary">Q：{qa.question}</div>
                    <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-secondary">
                      A：{qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
