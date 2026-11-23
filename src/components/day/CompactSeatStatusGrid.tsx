import type { PlayerSeat, SheriffState } from '../../logic/types';
import { splitSeatsIntoSymmetricColumns } from '../common/displayHelpers';

interface CompactSeatStatusGridProps {
  seats: PlayerSeat[];
  sheriffState: SheriffState;
  nightDeadSeats?: number[];
  currentSpeakerSeat?: number | null;
  onOpenSeatDrawer?: () => void;
}

export function CompactSeatStatusGrid({
  seats,
  sheriffState,
  nightDeadSeats = [],
  currentSpeakerSeat = null,
  onOpenSeatDrawer,
}: CompactSeatStatusGridProps) {
  const nightDeadSet = new Set(nightDeadSeats);
  const aliveCount = seats.filter((s) => s.isAlive).length;
  const activeSheriffSeat =
    sheriffState.badgeStatus === 'active' ? sheriffState.sheriffSeat : null;

  const { left: leftSeats, right: rightSeats } = splitSeatsIntoSymmetricColumns(seats);

  const renderSeatButton = (seat: PlayerSeat) => {
    const isSheriff = activeSheriffSeat === seat.seatNumber;
    const isNightDead = nightDeadSet.has(seat.seatNumber);
    const isSpeaking = currentSpeakerSeat === seat.seatNumber;
    const isIdiotRevealed = Boolean(seat.roleId === 'idiot' && seat.idiotRevealed);

    return (
      <button
        key={seat.seatNumber}
        type="button"
        onClick={onOpenSeatDrawer}
        className={`flex min-h-12 w-full items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 text-left transition active:scale-[0.98] ${
          isSpeaking
            ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/60'
            : isNightDead
              ? 'border-rose-500/70 bg-rose-950/50 text-rose-200'
              : !seat.isAlive
                ? 'border-slate-800/80 bg-slate-950/60 text-slate-500 opacity-60'
                : isSheriff
                  ? 'border-amber-400/60 bg-amber-950/35 text-amber-100'
                  : 'border-slate-800 bg-slate-950/90 text-slate-200 hover:border-slate-700'
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`shrink-0 text-sm font-extrabold tabular-nums ${
              !seat.isAlive ? 'line-through' : ''
            }`}
          >
            {seat.seatNumber}號
          </span>
          <span className="truncate text-[11px] text-slate-400">
            {seat.nickname.trim() || `${seat.seatNumber}號玩家`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-xs">
          {isSheriff && <span title="警長">👮</span>}
          {isSpeaking && <span title="發言中">🎤</span>}
          {isIdiotRevealed && <span title="白痴已翻牌">🃏</span>}
          {!seat.isAlive && <span title="已出局">💀</span>}
        </div>
      </button>
    );
  };

  return (
    <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-300">
            存活 {aliveCount}/{seats.length}
          </span>
          {activeSheriffSeat !== null ? (
            <span className="rounded-md border border-amber-400/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-200">
              👮 {activeSheriffSeat}號
            </span>
          ) : sheriffState.badgeStatus === 'swallowed' ? (
            <span className="rounded-md border border-rose-500/40 bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-bold text-rose-200">
              💥 吞警徽
            </span>
          ) : sheriffState.badgeStatus === 'destroyed' ? (
            <span className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
              🗑️ 撕警徽
            </span>
          ) : sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1 ? (
            <span className="rounded-md border border-amber-400/40 bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
              ⚠️ 首爆續選
            </span>
          ) : null}
        </div>
        {onOpenSeatDrawer && (
          <button
            type="button"
            onClick={onOpenSeatDrawer}
            className="min-h-10 rounded-lg border border-indigo-400/40 bg-indigo-950/50 px-2.5 text-[11px] font-bold text-indigo-200 hover:bg-indigo-900/50 active:scale-[0.98]"
          >
            👥 座位 / 手動
          </button>
        )}
      </div>

      {/* 左右對稱雙欄座位（左 1~半數、右 半數+1~N） */}
      <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto pr-0.5">
        <div className="flex flex-col gap-1.5">{leftSeats.map(renderSeatButton)}</div>
        <div className="flex flex-col gap-1.5">{rightSeats.map(renderSeatButton)}</div>
      </div>
    </section>
  );
}
