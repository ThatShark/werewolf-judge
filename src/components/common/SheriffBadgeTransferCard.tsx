import { useState } from 'react';
import { getRoleById } from '../../data/roles';
import type { PlayerSeat } from '../../logic/types';
import { ConfirmModal } from './ConfirmModal';
import { formatSeatDisplay, formatSeatShort, getRoleBadgeClasses } from './displayHelpers';

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

  const fromSeatObj = seats.find((s) => s.seatNumber === fromSeat);
  const aliveTargets = seats.filter((s) => s.isAlive && s.seatNumber !== fromSeat);
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedTarget);

  return (
    <section className="space-y-3 rounded-2xl border border-amber-400/50 bg-amber-950/25 p-4 shadow-lg">
      <div>
        <span className="inline-block rounded-lg bg-amber-500/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
          👮 警長出局 · 警徽交接
        </span>
        <h3 className="mt-1.5 text-base font-extrabold text-amber-100">
          {fromSeatObj ? formatSeatDisplay(fromSeatObj) : `${fromSeat} 號`} 出局，請選擇移交或撕毀警徽
        </h3>
        <p className="mt-0.5 text-xs text-slate-300">
          警長可選擇將警徽移交給一名存活玩家（繼承 1.5 票與歸票權），或撕毀警徽使本局後續無警長。
        </p>
      </div>

      {aliveTargets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300">選擇移交警徽目標：</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {aliveTargets.map((seat) => {
              const active = selectedTarget === seat.seatNumber;
              const role = getRoleById(seat.roleId);
              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  onClick={() =>
                    setSelectedTarget((prev) =>
                      prev === seat.seatNumber ? null : seat.seatNumber,
                    )
                  }
                  className={`min-h-14 rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                    active
                      ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400/40'
                      : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="text-sm font-extrabold">{seat.seatNumber} 號</div>
                  <div className="truncate text-[11px] text-slate-400">
                    {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
                  </div>
                  {role && (
                    <span
                      className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold ${getRoleBadgeClasses(role.id)}`}
                    >
                      {role.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          disabled={selectedTarget === null}
          onClick={() => setConfirmAction('transfer')}
          className={`min-h-12 flex-1 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            selectedTarget !== null
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.99]'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          {selectedSeatObj
            ? `👮 移交警徽給 ${formatSeatShort(selectedSeatObj)}`
            : '請先點選接任警徽座位'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmAction('destroy')}
          className="min-h-12 rounded-xl border border-rose-500/45 bg-rose-950/50 px-4 py-3 text-sm font-extrabold text-rose-200 transition hover:bg-rose-900/60 active:scale-[0.99]"
        >
          撕毀警徽（流失）
        </button>
      </div>

      <ConfirmModal
        open={confirmAction === 'transfer' && selectedTarget !== null}
        title="確認移交警徽？"
        description={
          selectedSeatObj
            ? `${fromSeat} 號將把警徽移交給 ${formatSeatDisplay(selectedSeatObj)}，此操作不可逆。`
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
        title="確認撕毀警徽？"
        description={`${fromSeat} 號選擇撕毀警徽，本局後續將無警長與 1.5 票歸票權，確定執行？`}
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
