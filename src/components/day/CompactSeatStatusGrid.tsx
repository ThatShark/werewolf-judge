import type { PlayerSeat, SheriffState } from '../../logic/types';
import { formatSeatNum, splitSeatsIntoSymmetricColumns } from '../common/displayHelpers';

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
        className={`flex h-12 w-full items-center justify-between gap-1.5 rounded-md px-2.5 text-left transition ${
          isSpeaking
            ? 'border-selected-sheriff bg-sheriff-tint text-primary'
            : isNightDead
              ? 'border-selected-wolf bg-wolf-tint text-primary'
              : !seat.isAlive
                ? 'border border-subtle bg-canvas text-muted opacity-55'
                : isSheriff
                  ? 'border border-sheriff-border bg-surface text-primary'
                  : 'border border-subtle bg-surface text-primary hover:border-strong'
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`w-6 shrink-0 text-[14px] font-semibold tabular-nums ${
              !seat.isAlive ? 'line-through' : ''
            }`}
          >
            {formatSeatNum(seat.seatNumber)}
          </span>
          <span className="truncate text-[12px] text-secondary">
            {seat.nickname.trim() || `${seat.seatNumber}號`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[12px] font-semibold">
          {isSheriff && <span className="text-sheriff">警</span>}
          {isSpeaking && <span className="text-sheriff">言</span>}
          {isIdiotRevealed && <span className="text-good">翻</span>}
          {!seat.isAlive && <span className="text-muted">死</span>}
        </div>
      </button>
    );
  };

  return (
    <section className="shrink-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2 tabular-nums">
          <span className="font-semibold text-primary">
            存活 {aliveCount}/{seats.length}
          </span>
          {activeSheriffSeat !== null ? (
            <span className="font-semibold text-sheriff">
              警長 {formatSeatNum(activeSheriffSeat)}
            </span>
          ) : sheriffState.badgeStatus === 'swallowed' ? (
            <span className="text-wolf">吞警徽</span>
          ) : sheriffState.badgeStatus === 'destroyed' ? (
            <span className="text-muted">撕警徽</span>
          ) : sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1 ? (
            <span className="text-sheriff">首爆續選</span>
          ) : null}
        </div>
        {onOpenSeatDrawer && (
          <button
            type="button"
            onClick={onOpenSeatDrawer}
            className="min-h-8 rounded-md border border-subtle bg-surface px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
          >
            座位/手動
          </button>
        )}
      </div>

      {/* 左右對稱雙欄座位（無多餘外框） */}
      <div className="grid max-h-[34dvh] grid-cols-2 gap-1.5 overflow-y-auto pr-0.5">
        <div className="flex flex-col gap-1.5">{leftSeats.map(renderSeatButton)}</div>
        <div className="flex flex-col gap-1.5">{rightSeats.map(renderSeatButton)}</div>
      </div>
    </section>
  );
}
