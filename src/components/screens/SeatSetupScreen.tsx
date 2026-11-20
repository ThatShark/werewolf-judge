import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { getBoardExpectedRoleCounts, validateRoleAssignment } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { getRoleBadgeClasses } from '../common/displayHelpers';

const CLEAR_ROLE_TOOL = '__CLEAR__';

export function SeatSetupScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const setBoardPlayerCount = useGameStore((s) => s.setBoardPlayerCount);
  const setSeatNickname = useGameStore((s) => s.setSeatNickname);
  const assignRole = useGameStore((s) => s.assignRole);
  const startGame = useGameStore((s) => s.startGame);

  const board = getBoardById(selectedBoardId);

  const [selectedRoleTool, setSelectedRoleTool] = useState<string | null>(null);
  const [hideRoles, setHideRoles] = useState(false);
  const [revealedSeats, setRevealedSeats] = useState<Record<number, boolean>>({});
  const [startError, setStartError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const expectedCounts = useMemo(
    () => (board ? getBoardExpectedRoleCounts(board) : {}),
    [board],
  );

  const actualCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const seat of seats) {
      if (seat.roleId) {
        counts[seat.roleId] = (counts[seat.roleId] ?? 0) + 1;
      }
    }
    return counts;
  }, [seats]);

  const roleOrder = useMemo(() => {
    if (!board) return [];
    return [
      ...board.composition.wolf,
      ...board.composition.good,
      ...(board.composition.thirdParty ?? []),
    ].map((slot) => slot.roleId);
  }, [board]);

  const validation = useMemo(() => {
    if (!board) return null;
    return validateRoleAssignment(board, seats);
  }, [board, seats]);

  if (!board || !validation) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-300">
        找不到板子資料，請透過右上角「重開新局」重新選擇板子。
      </div>
    );
  }

  const handleRandomDeal = () => {
    const wolfPool: string[] = [];
    for (const slot of board.composition.wolf) {
      for (let i = 0; i < slot.count; i += 1) {
        wolfPool.push(slot.roleId);
      }
    }
    const otherPool: string[] = [];
    for (const slot of [...board.composition.good, ...(board.composition.thirdParty ?? [])]) {
      for (let i = 0; i < slot.count; i += 1) {
        otherPool.push(slot.roleId);
      }
    }

    const shuffle = (arr: string[]) => {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };

    let pool: string[] = [];
    if (board.name.includes('獵殺潛狼')) {
      const wolfCount = seats.length === 12 ? 4 : seats.length === 10 ? 3 : 2;
      const hunterCount = seats.length - wolfCount;
      pool = [
        ...Array<string>(wolfCount).fill('wolf'),
        ...Array<string>(hunterCount).fill('hunter'),
      ];
    } else if (wolfPool.length + otherPool.length >= seats.length) {
      shuffle(otherPool);
      const neededOthers = Math.max(0, seats.length - wolfPool.length);
      pool = [...wolfPool, ...otherPool.slice(0, neededOthers)].slice(0, seats.length);
    } else {
      pool = [...wolfPool, ...otherPool];
      const fillerRole = otherPool[0] ?? 'villager';
      while (pool.length < seats.length) {
        pool.push(fillerRole);
      }
    }

    shuffle(pool);
    seats.forEach((seat, idx) => {
      assignRole(seat.seatNumber, pool[idx] ?? null);
    });
    setHideRoles(true);
    setRevealedSeats({});
    setStartError(null);
    setStatusNotice('已完成隨機發牌並預設隱藏身分，點擊座位「偷看」按鈕可單獨確認。');
  };

  const handleClearAllRoles = () => {
    seats.forEach((seat) => {
      assignRole(seat.seatNumber, null);
    });
    setRevealedSeats({});
    setStatusNotice('已清空所有座位身分。');
  };

  const handleSeatAssignClick = (seatNumber: number) => {
    if (!selectedRoleTool) {
      setStatusNotice('請先從上方「手動指派角色」選擇要指派的身分，或點選一鍵隨機發牌。');
      return;
    }
    if (selectedRoleTool === CLEAR_ROLE_TOOL) {
      assignRole(seatNumber, null);
      setStartError(null);
      return;
    }
    assignRole(seatNumber, selectedRoleTool);
    setStartError(null);
  };

  const toggleSeatReveal = (seatNumber: number) => {
    setRevealedSeats((prev) => ({
      ...prev,
      [seatNumber]: !prev[seatNumber],
    }));
  };

  const handleStartGame = () => {
    const result = startGame();
    if (!result.ok) {
      setStartError(result.errors.join(' '));
    }
  };

  return (
    <div className="space-y-5 pb-28">
      {/* 快速操作與防偷看控制 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-50">座位暱稱與身分分配</h1>
            <p className="mt-1 text-xs text-slate-400">
              點擊輸入框可編輯玩家暱稱（空白預設顯示「N 號玩家」），配齊全場身分後即可開局。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleRandomDeal}
            className="min-h-12 rounded-xl border border-indigo-400/50 bg-indigo-500/20 px-3 py-2.5 text-sm font-bold text-indigo-200 transition hover:bg-indigo-500/30 active:scale-[0.98]"
          >
            🎲 一鍵隨機發牌
          </button>
          <button
            type="button"
            onClick={() => {
              setHideRoles((prev) => !prev);
              setRevealedSeats({});
            }}
            className={`min-h-12 rounded-xl border px-3 py-2.5 text-sm font-bold transition active:scale-[0.98] ${
              hideRoles
                ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {hideRoles ? '🙈 目前：隱藏身分' : '👁️ 目前：顯示身分'}
          </button>
        </div>

        {board.presetPlayerCounts && board.presetPlayerCounts.length > 0 && (
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-xs font-bold text-slate-300">選擇本局玩家人數</div>
            <div className="flex flex-wrap gap-2">
              {board.presetPlayerCounts.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setBoardPlayerCount(cnt);
                    setStartError(null);
                  }}
                  className={`min-h-12 min-w-14 rounded-xl border px-3 text-sm font-extrabold transition ${
                    seats.length === cnt
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cnt} 人
                </button>
              ))}
            </div>
          </div>
        )}

        {board.compositionNote && (
          <div className="rounded-xl border border-amber-500/35 bg-amber-950/25 px-3 py-2 text-xs leading-relaxed text-amber-200">
            💡 {board.compositionNote}
          </div>
        )}

        {statusNotice && (
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-amber-200">
            {statusNotice}
          </div>
        )}
      </section>

      {/* 手動指派角色計數器 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">
            手動指派角色（點選角色後再點座位）
          </h2>
          <button
            type="button"
            onClick={handleClearAllRoles}
            className="min-h-10 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            全部清空
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {roleOrder.map((roleId) => {
            const role = getRoleById(roleId);
            const expected = expectedCounts[roleId] ?? 0;
            const actual = actualCounts[roleId] ?? 0;
            const isActive = selectedRoleTool === roleId;
            const isFull = actual === expected;
            const isOver = actual > expected;

            return (
              <button
                key={roleId}
                type="button"
                onClick={() =>
                  setSelectedRoleTool((prev) => (prev === roleId ? null : roleId))
                }
                className={`min-h-12 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition active:scale-[0.98] ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400/40'
                    : getRoleBadgeClasses(roleId)
                }`}
              >
                <span>{role?.name ?? roleId}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-extrabold ${
                    isOver
                      ? 'bg-rose-500 text-white'
                      : isFull
                        ? 'bg-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950/60 text-slate-200'
                  }`}
                >
                  {actual}/{expected}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setSelectedRoleTool((prev) =>
                prev === CLEAR_ROLE_TOOL ? null : CLEAR_ROLE_TOOL,
              )
            }
            className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-bold transition active:scale-[0.98] ${
              selectedRoleTool === CLEAR_ROLE_TOOL
                ? 'border-rose-400 bg-rose-500/25 text-rose-100 ring-2 ring-rose-400/40'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ✕ 清除單格
          </button>
        </div>
      </section>

      {/* 1 ~ N 號座位列表 */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-300">
            座位清單（1 ~ {seats.length} 號）
          </h2>
          <span className="text-xs text-slate-400">
            已配置 {seats.filter((s) => Boolean(s.roleId)).length} / {seats.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {seats.map((seat) => {
            const role = getRoleById(seat.roleId);
            const isSeatRevealed = !hideRoles || Boolean(revealedSeats[seat.seatNumber]);

            return (
              <div
                key={seat.seatNumber}
                className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2.5"
              >
                <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-base font-extrabold text-amber-300">
                  {seat.seatNumber}
                </div>

                <input
                  type="text"
                  value={seat.nickname}
                  onChange={(e) => setSeatNickname(seat.seatNumber, e.target.value)}
                  placeholder={`${seat.seatNumber} 號玩家`}
                  aria-label={`${seat.seatNumber} 號玩家暱稱`}
                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />

                {hideRoles && seat.roleId && (
                  <button
                    type="button"
                    onClick={() => toggleSeatReveal(seat.seatNumber)}
                    className="min-h-12 shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
                    title="偷看或隱藏此座位身分"
                  >
                    {isSeatRevealed ? '隱藏' : '偷看'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSeatAssignClick(seat.seatNumber)}
                  className={`min-h-12 min-w-[6.5rem] shrink-0 rounded-xl border px-3 text-xs font-bold transition active:scale-[0.98] ${
                    !seat.roleId
                      ? 'border-dashed border-slate-600 bg-slate-950/60 text-slate-400 hover:border-amber-400/60'
                      : isSeatRevealed
                        ? getRoleBadgeClasses(seat.roleId)
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  {!seat.roleId
                    ? selectedRoleTool && selectedRoleTool !== CLEAR_ROLE_TOOL
                      ? `指派：${getRoleById(selectedRoleTool)?.name ?? ''}`
                      : '未指派'
                    : isSeatRevealed
                      ? role?.name ?? seat.roleId
                      : '🔒 已發牌'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 配置檢查訊息 */}
      {(!validation.valid || startError) && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/35 p-3.5 text-xs leading-relaxed text-rose-200">
          <div className="font-bold text-rose-300">尚未完成身分配置：</div>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
          {startError && <p className="mt-2 font-semibold">{startError}</p>}
        </div>
      )}

      {/* 進入第一夜大按鈕 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={!validation.valid}
            onClick={handleStartGame}
            className={`min-h-12 w-full rounded-xl px-5 py-3.5 text-base font-extrabold transition ${
              validation.valid
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.99]'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            }`}
          >
            {validation.valid ? '🌙 進入第一夜' : '請先配齊所有角色才能開局'}
          </button>
        </div>
      </div>
    </div>
  );
}
