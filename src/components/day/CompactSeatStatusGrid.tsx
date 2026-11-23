import type { PlayerSeat, SheriffState } from '../../logic/types';

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

  const gridColsClass =
    seats.length <= 8
      ? 'grid-cols-4'
      : seats.length <= 10
        ? 'grid-cols-5'
        : 'grid-cols-6';

  return (
    <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
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
            className="min-h-8 rounded-lg border border-indigo-400/40 bg-indigo-950/50 px-2.5 text-[11px] font-bold text-indigo-200 hover:bg-indigo-900/50 active:scale-[0.98]"
          >
            👥 座位 / 手動
          </button>
        )}
      </div>

      <div className={`grid ${gridColsClass} gap-1.5`}>
        {seats.map((seat) => {
          const isSheriff = activeSheriffSeat === seat.seatNumber;
          const isNightDead = nightDeadSet.has(seat.seatNumber);
          const isSpeaking = currentSpeakerSeat === seat.seatNumber;
          const isIdiotRevealed = Boolean(seat.roleId === 'idiot' && seat.idiotRevealed);

          return (
            <button
              key={seat.seatNumber}
              type="button"
              onClick={onOpenSeatDrawer}
              className={`flex min-h-10 flex-col items-center justify-center rounded-xl border px-1 py-1 text-center transition ${
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
              <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold leading-none">
                <span className={!seat.isAlive ? 'line-through' : ''}>{seat.seatNumber}</span>
                {isSheriff && <span className="text-[10px]">👮</span>}
                {isSpeaking && <span className="text-[10px]">🎤</span>}
                {isIdiotRevealed && <span className="text-[10px]">🃏</span>}
                {!seat.isAlive && <span className="text-[10px]">💀</span>}
              </div>
              {seat.nickname.trim() && (
                <span className="mt-0.5 max-w-full truncate text-[9px] leading-tight text-slate-400">
                  {seat.nickname.trim()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
