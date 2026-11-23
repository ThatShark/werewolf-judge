import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  formatFactionLabel,
  formatSeatDisplay,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

export function PassAndRevealScreen() {
  const seats = useGameStore((s) => s.seats);
  const confirmedSeats = useGameStore((s) => s.passRevealConfirmedSeats);
  const dealOnlineRoles = useGameStore((s) => s.dealOnlineRoles);
  const confirmPassRevealSeat = useGameStore((s) => s.confirmPassRevealSeat);
  const resetPassRevealSeat = useGameStore((s) => s.resetPassRevealSeat);
  const completePassAndReveal = useGameStore((s) => s.completePassAndReveal);
  const returnToLobby = useGameStore((s) => s.returnToLobby);

  const [isCardVisible, setIsCardVisible] = useState(false);
  const [overrideSeatNumber, setOverrideSeatNumber] = useState<number | null>(null);
  const [confirmRedealOpen, setConfirmRedealOpen] = useState(false);
  const [recheckPickerOpen, setRecheckPickerOpen] = useState(false);
  const [pendingRecheckSeat, setPendingRecheckSeat] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const confirmedSet = useMemo(() => new Set(confirmedSeats), [confirmedSeats]);

  const nextUnconfirmedSeat = useMemo(() => {
    return seats.find((seat) => !confirmedSet.has(seat.seatNumber)) ?? null;
  }, [seats, confirmedSet]);

  const activeSeat = useMemo(() => {
    if (overrideSeatNumber !== null) {
      return seats.find((seat) => seat.seatNumber === overrideSeatNumber) ?? nextUnconfirmedSeat;
    }
    return nextUnconfirmedSeat;
  }, [overrideSeatNumber, seats, nextUnconfirmedSeat]);

  const allConfirmed = seats.length > 0 && confirmedSeats.length >= seats.length && !overrideSeatNumber;
  const activeRole = activeSeat ? getRoleById(activeSeat.roleId) : undefined;

  const handleConfirmAndHide = () => {
    if (!activeSeat) return;
    confirmPassRevealSeat(activeSeat.seatNumber);
    setIsCardVisible(false);
    setOverrideSeatNumber(null);
    setNotice(null);
  };

  const handleRedeal = () => {
    const res = dealOnlineRoles();
    setConfirmRedealOpen(false);
    setIsCardVisible(false);
    setOverrideSeatNumber(null);
    if (res.ok) {
      setNotice('已重新隨機發牌，請從 1 號開始依序傳閱確認身分。');
    } else {
      setNotice(res.errors.join(' '));
    }
  };

  const handleConfirmRecheck = () => {
    if (pendingRecheckSeat === null) return;
    resetPassRevealSeat(pendingRecheckSeat);
    setOverrideSeatNumber(pendingRecheckSeat);
    setIsCardVisible(false);
    setPendingRecheckSeat(null);
    setRecheckPickerOpen(false);
    setNotice(`請將裝置交給 ${pendingRecheckSeat} 號玩家重新確認身分。`);
  };

  const handleStartFirstNight = () => {
    const res = completePassAndReveal();
    if (!res.ok && res.reason) {
      setNotice(res.reason);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* 頂部進度列 */}
      <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm font-extrabold text-slate-50">傳閱確認身分</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              依序由 1 號至 {seats.length} 號單獨查看，確認後自動隱藏。
            </p>
          </div>
          <span className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-extrabold text-amber-200">
            已確認 {confirmedSeats.length} / {seats.length}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {seats.map((seat) => {
            const isConfirmed = confirmedSet.has(seat.seatNumber);
            const isCurrent = activeSeat?.seatNumber === seat.seatNumber;
            return (
              <span
                key={seat.seatNumber}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-xs font-extrabold transition ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : isConfirmed
                      ? 'border-emerald-500/45 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
              >
                {seat.seatNumber}
              </span>
            );
          })}
        </div>

        {notice && (
          <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-200">
            {notice}
          </div>
        )}
      </section>

      {/* 中央互動卡片區 */}
      <section className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
        {allConfirmed ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900 p-6 text-center shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl">
              ✅
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-emerald-200">
              全體 {seats.length} 位玩家皆已確認身分
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              請將裝置交還給法官或放回桌面中央，點擊下方按鈕即可進入第一晚。
            </p>
            <button
              type="button"
              onClick={handleStartFirstNight}
              className="mt-6 min-h-14 w-full max-w-xs rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              🌙 進入第一夜
            </button>
          </div>
        ) : activeSeat && !isCardVisible ? (
          /* 待機防窺遮罩 */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/95 p-6 text-center shadow-2xl">
            <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
              防窺待機畫面
            </span>
            <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/50 bg-slate-950 text-3xl font-black text-amber-300">
              {activeSeat.seatNumber}
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-slate-50">
              請將裝置交給 {formatSeatDisplay(activeSeat)}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              確認周圍沒有其他玩家偷看後，點擊下方按鈕查看本局身分。
            </p>
            <button
              type="button"
              onClick={() => setIsCardVisible(true)}
              className="mt-6 min-h-14 w-full max-w-xs rounded-2xl bg-amber-500 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.98]"
            >
              👁️ 點擊查看身分
            </button>
          </div>
        ) : activeSeat ? (
          /* 角色卡片與技能簡介 */
          <div className="flex min-h-0 flex-col justify-between rounded-3xl border border-indigo-500/40 bg-slate-900 p-5 shadow-2xl">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {formatSeatDisplay(activeSeat)} 的本局身分
                </span>
                {activeRole && (
                  <span
                    className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${getRoleBadgeClasses(activeRole.id)}`}
                  >
                    {formatFactionLabel(activeRole.faction)}
                  </span>
                )}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div className="text-3xl font-black tracking-tight text-slate-50">
                  {activeRole?.name ?? activeSeat.roleId ?? '未分配'}
                </div>
                {activeRole?.aliases && activeRole.aliases.length > 0 && (
                  <div className="mt-1 text-xs text-slate-400">
                    別名：{activeRole.aliases.join(' / ')}
                  </div>
                )}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="text-xs font-bold text-amber-300">技能與職責</div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                  {activeRole?.description ?? '請依照本板子規則進行遊戲。'}
                </p>
                {activeRole?.warnings && activeRole.warnings.length > 0 && (
                  <ul className="mt-2.5 space-y-1 border-t border-slate-800 pt-2 text-xs leading-relaxed text-rose-200">
                    {activeRole.warnings.map((w, idx) => (
                      <li key={idx}>⚠️ {w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmAndHide}
              className="mt-4 min-h-14 w-full shrink-0 rounded-2xl bg-indigo-500 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 active:scale-[0.98]"
            >
              🙈 確認並隱藏身分
            </button>
          </div>
        ) : null}
      </section>

      {/* 底部常駐防呆按鈕列 */}
      <footer className="shrink-0 grid grid-cols-3 gap-2 border-t border-slate-800 pt-2.5">
        <button
          type="button"
          onClick={returnToLobby}
          className="min-h-12 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800 active:scale-[0.98]"
        >
          ← 返回大廳
        </button>
        <button
          type="button"
          onClick={() => setRecheckPickerOpen(true)}
          className="min-h-12 rounded-xl border border-sky-500/40 bg-sky-950/40 px-2.5 text-xs font-bold text-sky-200 transition hover:bg-sky-900/50 active:scale-[0.98]"
        >
          🔍 指定重看
        </button>
        <button
          type="button"
          onClick={() => setConfirmRedealOpen(true)}
          className="min-h-12 rounded-xl border border-rose-500/40 bg-rose-950/40 px-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-900/50 active:scale-[0.98]"
        >
          🎲 重新發牌
        </button>
      </footer>

      {/* 重新隨機發牌二次確認 */}
      <ConfirmModal
        open={confirmRedealOpen}
        title="確定要重新隨機發牌？"
        description="將重新打亂所有玩家的身分配置，並重置全部座位的傳閱確認進度（從 1 號重新開始）。"
        confirmLabel="確定重新發牌"
        tone="danger"
        onConfirm={handleRedeal}
        onCancel={() => setConfirmRedealOpen(false)}
      />

      {/* 指定號碼重新查看選擇與確認 */}
      <ConfirmModal
        open={recheckPickerOpen}
        title="指定號碼重新查看身分"
        description="請點選忘記身分的玩家座號，確認後將切換回該座號的防窺待機畫面。"
        confirmLabel={
          pendingRecheckSeat !== null
            ? `讓 ${pendingRecheckSeat} 號重新查看`
            : '請先選擇座號'
        }
        tone="warning"
        onConfirm={() => {
          if (pendingRecheckSeat !== null) {
            handleConfirmRecheck();
          }
        }}
        onCancel={() => {
          setRecheckPickerOpen(false);
          setPendingRecheckSeat(null);
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {seats.map((seat) => {
            const selected = pendingRecheckSeat === seat.seatNumber;
            return (
              <button
                key={seat.seatNumber}
                type="button"
                onClick={() => setPendingRecheckSeat(seat.seatNumber)}
                className={`min-h-12 rounded-xl border text-sm font-extrabold transition ${
                  selected
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {seat.seatNumber} 號
              </button>
            );
          })}
        </div>
      </ConfirmModal>
    </div>
  );
}
