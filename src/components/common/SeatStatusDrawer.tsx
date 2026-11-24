import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import { checkVictory } from '../../logic';
import type { BoardDefinition, ManualVictoryOverrideKind } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { formatDeathReason, formatSeatNum, getRoleBadgeClasses } from './displayHelpers';

interface SeatStatusDrawerProps {
  open: boolean;
  board?: BoardDefinition;
  onClose: () => void;
}

export function SeatStatusDrawer({ open, board, onClose }: SeatStatusDrawerProps) {
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const treasureMasterState = useGameStore((s) => s.treasureMasterState);
  const conversionState = useGameStore((s) => s.conversionState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const toggleSeatAlive = useGameStore((s) => s.toggleSeatAlive);
  const declareWinner = useGameStore((s) => s.declareWinner);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const [maskRoles, setMaskRoles] = useState(false);
  const [confirmSeat, setConfirmSeat] = useState<number | null>(null);
  const [showVictoryPanel, setShowVictoryPanel] = useState(false);

  const aliveCount = useMemo(() => seats.filter((s) => s.isAlive).length, [seats]);
  const victoryPreview = useMemo(
    () =>
      checkVictory(seats, ruleOverrides, treasureMasterState, {
        conversionState,
        thirdPartySpecialState,
        boardId: board?.id,
      }),
    [seats, ruleOverrides, treasureMasterState, conversionState, thirdPartySpecialState, board?.id],
  );

  if (!open) return null;

  const confirmTarget = seats.find((s) => s.seatNumber === confirmSeat);
  const hasThirdParty = Boolean(board?.composition.thirdParty?.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/78"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86dvh] w-full max-w-lg flex-col rounded-t-xl border-x border-t border-subtle bg-surface md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-subtle px-4">
          <h2 className="truncate text-[18px] font-semibold leading-6 text-primary tabular-nums">
            座位總覽 {aliveCount}/{seats.length}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setMaskRoles((prev) => !prev)}
              className="min-h-11 rounded-md border border-subtle bg-canvas px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              {maskRoles ? '顯示身分' : '遮罩身分'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[14px] font-semibold text-secondary hover:bg-elevated hover:text-primary"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {victoryPreview.winner && (
            <div className="space-y-2 border-l-2 border-sheriff bg-sheriff-tint px-3 py-2.5">
              <div className="text-[12px] font-semibold text-sheriff">
                偵測到勝利條件：{victoryPreview.winReason}
              </div>
              <button
                type="button"
                onClick={() => {
                  declareWinner(
                    victoryPreview.winner!,
                    victoryPreview.winReason ?? '陣營達成勝利條件',
                  );
                  onClose();
                }}
                className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse hover:opacity-90"
              >
                宣告勝利並復盤
              </button>
            </div>
          )}

          <div className="divide-y divide-subtle">
            {seats.map((seat) => {
              const role = getRoleById(seat.roleId);
              const isConfirming = confirmSeat === seat.seatNumber;

              return (
                <div key={seat.seatNumber} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 shrink-0 text-[14px] font-semibold tabular-nums ${
                          seat.isAlive ? 'text-primary' : 'text-muted line-through'
                        }`}
                      >
                        {formatSeatNum(seat.seatNumber)}
                      </span>
                      <span className="truncate text-[14px] text-primary">
                        {seat.nickname.trim() || `${seat.seatNumber}號`}
                      </span>
                      {!maskRoles && role && (
                        <span
                          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[12px] font-medium ${getRoleBadgeClasses(role.id)}`}
                        >
                          {role.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 pl-8 text-[12px] text-muted tabular-nums">
                      {seat.isAlive
                        ? seat.idiotRevealed
                          ? '存活 · 白痴已翻牌'
                          : '存活'
                        : `第 ${seat.deathRound ?? '?'} 輪 · ${formatDeathReason(seat.deathReason)}`}
                    </div>
                  </div>

                  {!isConfirming ? (
                    <button
                      type="button"
                      onClick={() => setConfirmSeat(seat.seatNumber)}
                      className={`min-h-11 shrink-0 rounded-md border px-3 text-[12px] font-semibold transition ${
                        seat.isAlive
                          ? 'border-wolf-border bg-wolf-tint text-wolf'
                          : 'border-good-border bg-good-tint text-good'
                      }`}
                    >
                      {seat.isAlive ? '標記出局' : '改回存活'}
                    </button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          toggleSeatAlive(seat.seatNumber);
                          setConfirmSeat(null);
                        }}
                        className={`min-h-11 rounded-md px-3 text-[12px] font-semibold ${
                          confirmTarget?.isAlive
                            ? 'bg-wolf text-primary'
                            : 'bg-good text-inverse'
                        }`}
                      >
                        確定
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmSeat(null)}
                        className="min-h-11 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] text-secondary"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-subtle pt-3">
            <button
              type="button"
              onClick={() => setShowVictoryPanel((prev) => !prev)}
              className="min-h-12 w-full rounded-md border border-subtle bg-canvas px-4 text-[14px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              {showVictoryPanel ? '收起手動宣判' : '手動宣判勝負'}
            </button>

            {showVictoryPanel && (
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {(
                  [
                    {
                      kind: 'good_surrender' as ManualVictoryOverrideKind,
                      label: '好人交牌（狼人勝）',
                      style: 'border-wolf-border bg-wolf-tint text-wolf',
                    },
                    {
                      kind: 'wolf_surrender' as ManualVictoryOverrideKind,
                      label: '狼人交牌（好人勝）',
                      style: 'border-good-border bg-good-tint text-good',
                    },
                    {
                      kind: 'force_draw' as ManualVictoryOverrideKind,
                      label: '強制結束（平局）',
                      style: 'border-subtle bg-canvas text-primary',
                    },
                    {
                      kind: 'third_party_win' as ManualVictoryOverrideKind,
                      label: hasThirdParty ? '宣告第三方陣營勝' : '宣告特殊／第三方勝',
                      style: 'border-third-border bg-third-tint text-third',
                    },
                  ]
                ).map((item) => (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() => {
                      overrideVictory(item.kind);
                      onClose();
                    }}
                    className={`min-h-12 rounded-md border px-4 text-left text-[14px] font-semibold transition hover:opacity-90 ${item.style}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
