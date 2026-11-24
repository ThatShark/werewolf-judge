import { useState } from 'react';
import { getRoleById } from '../../data/roles';
import type { PlayerSeat } from '../../logic/types';
import { ConfirmModal } from './ConfirmModal';
import { formatSeatDisplay, formatSeatNum, formatSeatShort } from './displayHelpers';

interface SheriffBadgeTransferCardProps {
  fromSeat: number;
  seats: PlayerSeat[];
  onTransfer: (targetSeat: number) => void;
  onDestroy: () => void;
}

export function SheriffBadgeTransferCard({
  fromSeat,
  seats,
  onTransfer,
  onDestroy,
}: SheriffBadgeTransferCardProps) {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'transfer' | 'destroy' | null>(null);

  const aliveTargets = seats.filter((s) => s.isAlive && s.seatNumber !== fromSeat);
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedTarget);

  return (
    <section className="space-y-3 rounded-lg border border-strong bg-surface p-4">
      <div className="border-l-2 border-sheriff pl-3">
        <div className="text-[12px] font-semibold text-sheriff">警徽交接</div>
        <h3 className="text-[18px] font-semibold leading-6 text-primary tabular-nums">
          {formatSeatNum(fromSeat)} 號警長出局
        </h3>
      </div>

      {aliveTargets.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {aliveTargets.map((seat) => {
            const active = selectedTarget === seat.seatNumber;
            const role = getRoleById(seat.roleId);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                onClick={() =>
                  setSelectedTarget((prev) => (prev === seat.seatNumber ? null : seat.seatNumber))
                }
                className={`flex min-h-12 items-center justify-between gap-2 rounded-md px-2.5 text-left transition ${
                  active
                    ? 'border-selected-sheriff bg-sheriff-tint text-primary'
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
                {role && <span className="shrink-0 text-[12px] text-muted">{role.name}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setConfirmAction('destroy')}
          className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-4 text-[14px] font-semibold text-wolf hover:opacity-90"
        >
          撕毀警徽
        </button>
        <button
          type="button"
          disabled={selectedTarget === null}
          onClick={() => setConfirmAction('transfer')}
          className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
            selectedTarget !== null
              ? 'bg-sheriff text-inverse hover:opacity-90'
              : 'cursor-not-allowed bg-elevated text-muted'
          }`}
        >
          {selectedSeatObj ? `移交給 ${formatSeatShort(selectedSeatObj)}` : '選擇接任座位'}
        </button>
      </div>

      <ConfirmModal
        open={confirmAction === 'transfer' && selectedTarget !== null}
        title="確認移交警徽"
        description={
          selectedSeatObj
            ? `${fromSeat} 號將警徽移交給 ${formatSeatDisplay(selectedSeatObj)}。`
            : undefined
        }
        confirmLabel="確認移交"
        tone="warning"
        onConfirm={() => {
          if (selectedTarget !== null) {
            onTransfer(selectedTarget);
            setSelectedTarget(null);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction === 'destroy'}
        title="確認撕毀警徽"
        description={`${fromSeat} 號撕毀警徽，本局後續將無警長。`}
        confirmLabel="確認撕毀"
        tone="danger"
        onConfirm={() => {
          onDestroy();
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </section>
  );
}
