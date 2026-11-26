import { useState } from 'react';
import { getRoleById } from '../../data/roles';
import type { PlayerSeat } from '../../logic/types';
import type { PendingShooter } from '../../store/gameStore';
import { ConfirmModal } from './ConfirmModal';
import { formatSeatDisplay, formatSeatNum, formatSeatShort } from './displayHelpers';

interface PendingShooterCardProps {
  shooter: PendingShooter;
  seats: PlayerSeat[];
  onShoot: (shooterSeat: number, targetSeat: number) => void;
  onAwakenedHunterShoot?: (shooterSeat: number, direction: 'left' | 'right') => void;
  onSkip: (shooterSeat: number) => void;
}

export function PendingShooterCard({
  shooter,
  seats,
  onShoot,
  onAwakenedHunterShoot,
  onSkip,
}: PendingShooterCardProps) {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'shoot' | 'skip' | 'left' | 'right' | null>(
    null,
  );

  const roleLabel =
    shooter.roleId === 'wolf_king'
      ? '狼王'
      : shooter.roleId === 'awakened_wolf_king'
        ? '覺醒狼王'
        : shooter.roleId === 'awakened_hunter'
          ? '覺醒獵人'
          : shooter.roleId === 'lucky_gun'
            ? '幸運兒（槍）'
            : shooter.roleId === 'wolf_gun'
              ? '受贈狼槍'
              : shooter.roleId === 'evil_merchant_gun'
                ? '邪惡商人槍'
                : shooter.roleId === 'grey_wolf_gun'
                  ? '灰太狼偷槍'
                  : shooter.roleId === 'pandora_day_gun'
                    ? '潘朵拉手槍'
                    : '獵人';
  const shotsRemaining = shooter.shotsRemaining ?? 1;
  const isAwakenedHunterDir = shooter.roleId === 'awakened_hunter' && Boolean(onAwakenedHunterShoot);
  const aliveTargets = seats.filter((s) => s.isAlive && s.seatNumber !== shooter.seatNumber);
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedTarget);

  return (
    <div className="space-y-3 rounded-lg border border-strong bg-surface p-4">
      <div className="flex items-center justify-between gap-2 border-l-2 border-wolf pl-3">
        <div>
          <div className="text-[12px] font-semibold text-wolf">開槍結算</div>
          <h3 className="text-[18px] font-semibold leading-6 text-primary tabular-nums">
            {formatSeatNum(shooter.seatNumber)} 號（{roleLabel}）
          </h3>
        </div>
        {shotsRemaining > 1 && (
          <span className="rounded-md bg-wolf-tint px-2.5 py-1 text-[12px] font-semibold text-wolf tabular-nums">
            剩餘 {shotsRemaining} 槍
          </span>
        )}
      </div>

      {isAwakenedHunterDir ? (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction('left')}
              className="min-h-12 rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary hover:opacity-90"
            >
              向左開槍
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction('right')}
              className="min-h-12 rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary hover:opacity-90"
            >
              向右開槍
            </button>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction('skip')}
            className="min-h-12 w-full rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
          >
            壓槍
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            {aliveTargets.map((seat) => {
              const active = selectedTarget === seat.seatNumber;
              const targetRole = getRoleById(seat.roleId);
              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  onClick={() =>
                    setSelectedTarget((prev) => (prev === seat.seatNumber ? null : seat.seatNumber))
                  }
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-md px-2.5 text-left transition ${
                    active
                      ? 'border-selected-wolf bg-wolf-tint text-primary'
                      : 'border border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-6 shrink-0 text-[14px] font-semibold tabular-nums">
                      {formatSeatNum(seat.seatNumber)}
                    </span>
                    <span className="truncate text-[12px] text-secondary">
                      {seat.nickname.trim() || `${seat.seatNumber}號`}
                    </span>
                  </div>
                  {targetRole && (
                    <span className="shrink-0 text-[12px] text-muted">{targetRole.name}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmAction('skip')}
              className="min-h-12 shrink-0 rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              壓槍
            </button>
            <button
              type="button"
              disabled={selectedTarget === null}
              onClick={() => setConfirmAction('shoot')}
              className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
                selectedTarget !== null
                  ? 'bg-wolf text-primary hover:opacity-90'
                  : 'cursor-not-allowed bg-elevated text-muted'
              }`}
            >
              {selectedSeatObj ? `開槍帶走 ${formatSeatShort(selectedSeatObj)}` : '選擇開槍目標'}
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmAction === 'shoot' && selectedTarget !== null}
        title="確認開槍"
        description={
          selectedSeatObj
            ? `${shooter.seatNumber} 號（${roleLabel}）開槍帶走 ${formatSeatDisplay(selectedSeatObj)}。`
            : undefined
        }
        confirmLabel="確認開槍"
        tone="danger"
        onConfirm={() => {
          if (selectedTarget !== null) {
            onShoot(shooter.seatNumber, selectedTarget);
            setSelectedTarget(null);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction === 'left' || confirmAction === 'right'}
        title="確認方向開槍"
        description={`${shooter.seatNumber} 號（${roleLabel}）向${confirmAction === 'left' ? '左' : '右'}側開槍擊殺最近存活狼人。`}
        confirmLabel="確認開槍"
        tone="danger"
        onConfirm={() => {
          if (onAwakenedHunterShoot && (confirmAction === 'left' || confirmAction === 'right')) {
            onAwakenedHunterShoot(shooter.seatNumber, confirmAction);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction === 'skip'}
        title="確認壓槍"
        description={`${shooter.seatNumber} 號（${roleLabel}）放棄本次開槍。`}
        confirmLabel="確認壓槍"
        tone="warning"
        onConfirm={() => {
          onSkip(shooter.seatNumber);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
