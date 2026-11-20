import { useState } from 'react';
import { getRoleById } from '../../data/roles';
import type { PlayerSeat } from '../../logic/types';
import type { PendingShooter } from '../../store/gameStore';
import { ConfirmModal } from './ConfirmModal';
import { formatDeathReason, formatSeatDisplay, formatSeatShort } from './displayHelpers';

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

  const shooterSeatObj = seats.find((s) => s.seatNumber === shooter.seatNumber);
  const roleLabel = shooter.roleId === 'hunter' ? '獵人' : '狼王';
  const aliveTargets = seats.filter(
    (s) => s.isAlive && s.seatNumber !== shooter.seatNumber,
  );
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedTarget);

  return (
    <div className="space-y-3 rounded-2xl border border-amber-500/50 bg-amber-950/25 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded-lg bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
            ✅ 可開槍
          </span>
          <h3 className="mt-1.5 text-base font-extrabold text-amber-100">
            {shooterSeatObj
              ? formatSeatDisplay(shooterSeatObj)
              : `${shooter.seatNumber} 號`}{' '}
            （{roleLabel}）
          </h3>
          <p className="mt-0.5 text-xs text-slate-300">
            出局原因：{formatDeathReason(shooter.deathReason)} · {shooter.reason}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300">選擇開槍帶走目標：</div>
        <div className="grid grid-cols-3 gap-2">
          {aliveTargets.map((seat) => {
            const active = selectedTarget === seat.seatNumber;
            const targetRole = getRoleById(seat.roleId);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                onClick={() =>
                  setSelectedTarget((prev) =>
                    prev === seat.seatNumber ? null : seat.seatNumber,
                  )
                }
                className={`min-h-12 rounded-xl border p-2 text-left transition active:scale-[0.98] ${
                  active
                    ? 'border-rose-400 bg-rose-500/25 text-rose-100 ring-2 ring-rose-400/40'
                    : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="text-sm font-extrabold">{seat.seatNumber} 號</div>
                <div className="truncate text-[11px] text-slate-400">
                  {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                </div>
                {targetRole && (
                  <div className="mt-0.5 text-[10px] text-slate-400">{targetRole.name}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          disabled={selectedTarget === null}
          onClick={() => setConfirmAction('shoot')}
          className={`min-h-12 flex-1 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            selectedTarget !== null
              ? 'bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.99]'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          {selectedSeatObj
            ? `🔫 開槍帶走 ${formatSeatShort(selectedSeatObj)}`
            : '請先點選開槍目標'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmAction('skip')}
          className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700 active:scale-[0.99]"
        >
          壓槍不開
        </button>
      </div>

      <ConfirmModal
        open={confirmAction === 'shoot' && selectedTarget !== null}
        title="確認發動開槍技能？"
        description={
          selectedSeatObj
            ? `${shooter.seatNumber} 號（${roleLabel}）將開槍帶走 ${formatSeatDisplay(selectedSeatObj)}，此操作不可逆。`
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
        title="確認壓槍不開？"
        description={`${shooter.seatNumber} 號（${roleLabel}）將放棄本次開槍機會。`}
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
