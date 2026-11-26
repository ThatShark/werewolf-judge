import { useMemo, useState } from 'react';
import { ttsEngine } from '../../audio/ttsEngine';
import { getRoleById } from '../../data/roles';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  formatFactionLabel,
  formatSeatNum,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

export function PassAndRevealScreen() {
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const onlineJudgeSettings = useGameStore((s) => s.onlineJudgeSettings);
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

  const nextUnconfirmedSeat = useMemo(
    () => seats.find((seat) => !confirmedSet.has(seat.seatNumber)) ?? null,
    [seats, confirmedSet],
  );

  const activeSeat = useMemo(() => {
    if (overrideSeatNumber !== null) {
      return seats.find((seat) => seat.seatNumber === overrideSeatNumber) ?? nextUnconfirmedSeat;
    }
    return nextUnconfirmedSeat;
  }, [overrideSeatNumber, seats, nextUnconfirmedSeat]);

  const allConfirmed =
    seats.length > 0 && confirmedSeats.length >= seats.length && !overrideSeatNumber;
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
      setNotice('已重新洗牌。');
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
    setNotice(`請交給 ${formatSeatNum(pendingRecheckSeat)} 號重看。`);
  };

  const handleStartFirstNight = () => {
    if (hostMode.judgeMode === 'online_judge') {
      ttsEngine.unlockAudio();
      if (onlineJudgeSettings.ttsEnabled) {
        ttsEngine.startKeepAlive();
      }
    }
    const res = completePassAndReveal();
    if (!res.ok && res.reason) {
      setNotice(res.reason);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 頂部極簡進度列 */}
      <section className="shrink-0 space-y-2 border-b border-subtle pb-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-semibold leading-6 text-primary">傳閱底牌</h1>
          <span className="text-[14px] font-semibold tabular-nums text-sheriff">
            {confirmedSeats.length} / {seats.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {seats.map((seat) => {
            const isConfirmed = confirmedSet.has(seat.seatNumber);
            const isCurrent = activeSeat?.seatNumber === seat.seatNumber;
            return (
              <span
                key={seat.seatNumber}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[12px] font-semibold tabular-nums ${
                  isCurrent
                    ? 'bg-sheriff text-inverse'
                    : isConfirmed
                      ? 'border border-good-border bg-good-tint text-good'
                      : 'border border-subtle bg-surface text-muted'
                }`}
              >
                {formatSeatNum(seat.seatNumber)}
              </span>
            );
          })}
        </div>

        {notice && (
          <div className="border-l-2 border-sheriff bg-surface px-3 py-1.5 text-[12px] text-sheriff">
            {notice}
          </div>
        )}
      </section>

      {/* 中央底牌區 */}
      <section className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
        {allConfirmed ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-good-border bg-surface p-6 text-center">
            <div className="text-[12px] font-semibold tracking-widest text-good">
              準備就緒
            </div>
            <h2 className="mt-2 text-[18px] font-semibold tabular-nums text-primary">
              全體 {seats.length} 位玩家已確認
            </h2>
            <button
              type="button"
              onClick={handleStartFirstNight}
              className="mt-6 min-h-12 w-full max-w-xs rounded-md bg-good px-6 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              進入第一夜
            </button>
          </div>
        ) : activeSeat && !isCardVisible ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-subtle bg-surface p-6 text-center">
            <div className="text-[14px] font-semibold tracking-wide text-secondary">
              請將手機交給
            </div>
            <div className="mt-3 text-[36px] font-bold leading-none tabular-nums text-sheriff">
              {formatSeatNum(activeSeat.seatNumber)}
            </div>
            {activeSeat.nickname.trim() && (
              <div className="mt-2 text-[14px] font-medium text-primary">
                {activeSeat.nickname.trim()}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCardVisible(true)}
              className="mt-6 min-h-12 w-full max-w-xs rounded-md bg-sheriff px-6 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              查看底牌
            </button>
          </div>
        ) : activeSeat ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-strong bg-surface p-6 text-center">
            <div className="flex items-center gap-2 text-[12px] tabular-nums text-secondary">
              <span>{formatSeatNum(activeSeat.seatNumber)} 號</span>
              {activeRole && (
                <span
                  className={`rounded-md border px-2 py-0.5 font-semibold ${getRoleBadgeClasses(activeRole.id)}`}
                >
                  {formatFactionLabel(activeRole.faction)}
                </span>
              )}
            </div>

            <div className="mt-4 text-[36px] font-bold leading-tight tracking-tight text-primary">
              {activeRole?.name ?? activeSeat.roleId ?? '未分配'}
            </div>

            <button
              type="button"
              onClick={handleConfirmAndHide}
              className="mt-6 min-h-12 w-full max-w-xs rounded-md bg-sheriff px-6 text-[14px] font-semibold text-inverse transition hover:opacity-90"
            >
              確認並隱藏
            </button>
          </div>
        ) : null}
      </section>

      {/* 底部極簡線框工具列 */}
      <footer className="grid shrink-0 grid-cols-3 gap-1.5 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={returnToLobby}
          className="min-h-12 rounded-md border border-subtle bg-surface px-2 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          返回大廳
        </button>
        <button
          type="button"
          onClick={() => setRecheckPickerOpen(true)}
          className="min-h-12 rounded-md border border-subtle bg-surface px-2 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          指定重看
        </button>
        <button
          type="button"
          onClick={() => setConfirmRedealOpen(true)}
          className="min-h-12 rounded-md border border-wolf-border bg-wolf-tint px-2 text-[12px] font-semibold text-wolf"
        >
          重新發牌
        </button>
      </footer>

      <ConfirmModal
        open={confirmRedealOpen}
        title="重新隨機發牌"
        description="將重新洗牌並重置所有座位的確認進度。"
        confirmLabel="確認重發"
        tone="danger"
        onConfirm={handleRedeal}
        onCancel={() => setConfirmRedealOpen(false)}
      />

      <ConfirmModal
        open={recheckPickerOpen}
        title="指定座號重看"
        confirmLabel={
          pendingRecheckSeat !== null
            ? `讓 ${formatSeatNum(pendingRecheckSeat)} 號重看`
            : '請選擇座號'
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
        <div className="grid grid-cols-4 gap-1.5">
          {seats.map((seat) => {
            const selected = pendingRecheckSeat === seat.seatNumber;
            return (
              <button
                key={seat.seatNumber}
                type="button"
                onClick={() => setPendingRecheckSeat(seat.seatNumber)}
                className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
                  selected
                    ? 'bg-sheriff text-inverse'
                    : 'border border-subtle bg-canvas text-secondary hover:border-strong'
                }`}
              >
                {formatSeatNum(seat.seatNumber)}
              </button>
            );
          })}
        </div>
      </ConfirmModal>
    </div>
  );
}
