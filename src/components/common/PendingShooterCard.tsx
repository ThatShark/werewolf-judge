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
  onSkip: (shooterSeat: number) => void;
}

export function PendingShooterCard({
  shooter,
  seats,
  onShoot,
  onSkip,
}: PendingShooterCardProps) {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'shoot' | 'skip' | null>(null);

  const roleLabel =
    shooter.roleId === 'wolf_king'
      ? '狼王'
      : shooter.roleId === 'awakened_hunter'
        ? '覺醒獵人'
        : shooter.roleId === 'lucky_gun'
          ? '幸運兒（槍）'
          : '獵人';
  const aliveTargets = seats.filter((s) => s.isAlive && s.seatNumber !== shooter.seatNumber);
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedTarget);

  return (
    <div className="space-y-3 rounded-lg border border-strong bg-surface p-4">
      <div className="border-l-2 border-wolf pl-3">
        <div className="text-[12px] font-semibold text-wolf">開槍結算</div>
        <h3 className="text-[18px] font-semibold leading-6 text-primary tabular-nums">
          {formatSeatNum(shooter.seatNumber)} 號（{roleLabel}）
        </h3>
      </div>

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
