import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import { checkVictory } from '../../logic';
import type { BoardDefinition, ManualVictoryOverrideKind } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { formatDeathReason, formatSeatDisplay, getRoleBadgeClasses } from './displayHelpers';

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl border-t border-x border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Seat Overview · 手動標記輔助
            </p>
            <h2 className="truncate text-lg font-bold text-slate-50">
              座位總覽（存活 {aliveCount} / {seats.length}）
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMaskRoles((prev) => !prev)}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              {maskRoles ? '👁️ 顯示' : '🙈 遮罩'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 min-w-12 rounded-xl border border-slate-700 bg-slate-800 px-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              關閉
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-xs leading-relaxed text-slate-300">
            當特殊／進階角色（如攝夢人夢死、魔術師交換、獵魔人、殉情或騎士決鬥等）造成玩家出局或狀態異動時，可於此快速切換存活／出局。
          </div>

          {victoryPreview.winner && (
            <div className="rounded-2xl border border-amber-500/45 bg-amber-950/35 p-3.5 text-xs">
              <div className="font-bold text-amber-200">
                系統偵測到勝利條件：{victoryPreview.winReason}
              </div>
              <button
                type="button"
                onClick={() => {
                  declareWinner(victoryPreview.winner!, victoryPreview.winReason ?? '陣營達成勝利條件');
                  onClose();
                }}
                className="mt-2.5 min-h-12 w-full rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 hover:bg-amber-400"
              >
                確認宣告勝利並進入復盤
              </button>
            </div>
          )}

          <div className="space-y-2">
            {seats.map((seat) => {
              const role = getRoleById(seat.roleId);
              const isConfirming = confirmSeat === seat.seatNumber;

              return (
                <div
                  key={seat.seatNumber}
                  className={`rounded-2xl border p-3 transition ${
                    seat.isAlive
                      ? 'border-slate-800 bg-slate-950/80'
                      : 'border-rose-900/50 bg-rose-950/20 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-50">
                          {formatSeatDisplay(seat)}
                        </span>
                        {!maskRoles && role && (
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${getRoleBadgeClasses(role.id)}`}
                          >
                            {role.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {seat.isAlive
                          ? seat.idiotRevealed
                            ? '● 存活（白痴已翻牌免死／無投票權）'
                            : '● 存活中'
                          : `✕ 已出局（第 ${seat.deathRound ?? '?'} 輪 · ${formatDeathReason(seat.deathReason)}）`}
                      </div>
                    </div>

                    {!isConfirming ? (
                      <button
                        type="button"
                        onClick={() => setConfirmSeat(seat.seatNumber)}
                        className={`min-h-12 shrink-0 rounded-xl border px-3.5 text-xs font-extrabold transition active:scale-[0.98] ${
                          seat.isAlive
                            ? 'border-rose-500/45 bg-rose-950/50 text-rose-200 hover:bg-rose-900/50'
                            : 'border-emerald-500/45 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/50'
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
                          className={`min-h-12 rounded-xl px-3 text-xs font-extrabold ${
                            confirmTarget?.isAlive
                              ? 'bg-rose-600 text-white hover:bg-rose-500'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                        >
                          確定{confirmTarget?.isAlive ? '出局' : '復活'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmSeat(null)}
                          className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-2.5 text-xs font-bold text-slate-300"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 進階／第三方手動宣判勝負入口 */}
          <div className="border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setShowVictoryPanel((prev) => !prev)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              {showVictoryPanel ? '收起手動宣判勝負' : '🏁 手動宣判遊戲結束（特殊／第三方勝利）'}
            </button>

            {showVictoryPanel && (
              <div className="mt-2.5 grid grid-cols-1 gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                {(
                  [
                    {
                      kind: 'good_surrender' as ManualVictoryOverrideKind,
                      label: '🏳️ 宣告好人交牌（狼人陣營勝）',
                      style: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
                    },
                    {
                      kind: 'wolf_surrender' as ManualVictoryOverrideKind,
                      label: '🏳️ 宣告狼人交牌（好人陣營勝）',
                      style: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
                    },
                    {
                      kind: 'force_draw' as ManualVictoryOverrideKind,
                      label: '🤝 強制結束（判定平局）',
                      style: 'border-amber-400/40 bg-amber-950/40 text-amber-200',
                    },
                    {
                      kind: 'third_party_win' as ManualVictoryOverrideKind,
                      label: hasThirdParty
                        ? '🦊 宣告：第三方陣營勝利'
                        : '🦊 宣告：第三方／特殊勝利',
                      style: 'border-indigo-400/40 bg-indigo-950/40 text-indigo-200',
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
                    className={`min-h-12 rounded-xl border px-4 text-sm font-bold transition hover:brightness-110 ${item.style}`}
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
