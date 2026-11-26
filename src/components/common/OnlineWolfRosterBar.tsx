import { getRoleById } from '../../data/roles';
import type { PlayerSeat } from '../../logic/types';
import { formatSeatNum } from './displayHelpers';

interface OnlineWolfRosterBarProps {
  seats: PlayerSeat[];
}

/**
 * 線上法官模式常駐「狼隊名單（座號＋具體角色身分）」橫條。
 */
export function OnlineWolfRosterBar({ seats }: OnlineWolfRosterBarProps) {
  const wolfSeats = seats
    .filter((seat) => {
      if (!seat.roleId) return false;
      const role = getRoleById(seat.roleId);
      return role?.faction === 'wolf';
    })
    .sort((a, b) => a.seatNumber - b.seatNumber);

  if (wolfSeats.length === 0) return null;

  return (
    <section
      aria-label="本局狼隊名單"
      className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-l-2 border-wolf bg-surface px-2.5 py-1.5 text-[12px] leading-4"
    >
      <span className="shrink-0 font-semibold text-wolf">狼隊</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {wolfSeats.map((seat) => {
          const roleName = getRoleById(seat.roleId)?.name ?? seat.roleId ?? '狼人';
          return (
            <span
              key={seat.seatNumber}
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold tabular-nums ${
                seat.isAlive
                  ? 'border-wolf-border bg-wolf-tint text-primary'
                  : 'border-subtle bg-canvas text-muted line-through'
              }`}
            >
              <span className={seat.isAlive ? 'text-wolf' : 'text-muted'}>
                {formatSeatNum(seat.seatNumber)}
              </span>
              <span>{roleName}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
