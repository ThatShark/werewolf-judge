import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { countAliveFactions } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SheriffBadgeTransferCard } from '../common/SheriffBadgeTransferCard';
import { DayBurstSkillsPanel } from '../day/DayBurstSkillsPanel';
import { ExileVotePanel } from '../day/ExileVotePanel';
import { SheriffElectionPanel } from '../day/SheriffElectionPanel';
import { SpeakingTimerPanel } from '../day/SpeakingTimerPanel';

export function DayVoteScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const dayHistory = useGameStore((s) => s.dayHistory);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const pendingShooters = useGameStore((s) => s.pendingShooters);

  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const advanceToNextNight = useGameStore((s) => s.advanceToNextNight);

  const board = getBoardById(selectedBoardId);
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [confirmNextNightOpen, setConfirmNextNightOpen] = useState(false);
  const [showFactionCounts, setShowFactionCounts] = useState(false);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const factionCounts = useMemo(
    () => countAliveFactions(seats, ruleOverrides),
    [seats, ruleOverrides],
  );
  const todayEvents = useMemo(
    () => dayHistory.find((d) => d.round === round)?.events ?? [],
    [dayHistory, round],
  );

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const hasBlockingPendingAction = hasPendingShooters || hasPendingBadgeTransfer;

  return (
    <div className="space-y-4 pb-28">
      {/* 1. 自動抽取發言順序 ＋ 動態加減秒數計時器 */}
      <SpeakingTimerPanel />

      {/* 2. 場上存活、法官統計與今日事件 */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300">
            目前存活人數：{aliveSeats.length} / {seats.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeatDrawerOpen(true)}
              className="min-h-12 rounded-xl border border-indigo-400/40 bg-indigo-950/50 px-3 text-xs font-bold text-indigo-200 hover:bg-indigo-900/50"
            >
              👥 座位總覽 / 手動標記
            </button>
            <button
              type="button"
              onClick={() => setShowFactionCounts((prev) => !prev)}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-300"
            >
              {showFactionCounts ? '隱藏統計' : '法官統計'}
            </button>
          </div>
        </div>

        {showFactionCounts && (
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 py-2">
              <div className="text-rose-300">狼人</div>
              <div className="text-base font-extrabold text-rose-100">
                {factionCounts.wolves}
              </div>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 py-2">
              <div className="text-indigo-300">神職</div>
              <div className="text-base font-extrabold text-indigo-100">
                {factionCounts.gods}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 py-2">
              <div className="text-emerald-300">平民</div>
              <div className="text-base font-extrabold text-emerald-100">
                {factionCounts.villagers}
              </div>
            </div>
          </div>
        )}

        {todayEvents.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-slate-800 pt-2.5 text-xs text-amber-200">
            <div className="font-bold text-slate-400">今日事件紀錄：</div>
            {todayEvents.map((evt, idx) => (
              <div key={idx}>• {evt}</div>
            ))}
          </div>
        )}
      </section>

      {/* 3. 待結算開槍與警徽移交（優先顯示） */}
      {pendingShooters.map((shooter) => (
        <PendingShooterCard
          key={shooter.seatNumber}
          shooter={shooter}
          seats={seats}
          onShoot={triggerShoot}
          onSkip={skipShoot}
        />
      ))}

      {sheriffState.pendingBadgeTransferFrom !== null && (
        <SheriffBadgeTransferCard
          fromSeat={sheriffState.pendingBadgeTransferFrom}
          seats={seats}
          onTransfer={transferSheriffBadge}
          onDestroy={destroySheriffBadge}
        />
      )}

      {/* 4. 警長競選面板 */}
      <SheriffElectionPanel disabled={hasBlockingPendingAction} />

      {/* 5. 逐票放逐投票紀錄器 */}
      <ExileVotePanel disabled={hasBlockingPendingAction} />

      {/* 6. 白天突發技能與狼人自爆區 */}
      <DayBurstSkillsPanel disabled={hasBlockingPendingAction} />

      {/* 結束白天進入下一晚 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={hasBlockingPendingAction}
            onClick={() => setConfirmNextNightOpen(true)}
            className={`min-h-12 w-full rounded-xl px-5 py-3.5 text-base font-extrabold transition ${
              hasBlockingPendingAction
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:scale-[0.99]'
            }`}
          >
            {hasPendingShooters
              ? '請先結算開槍 / 壓槍後再入夜'
              : hasPendingBadgeTransfer
                ? '請先完成警徽移交 / 撕毀後再入夜'
                : `🌙 結束第 ${round} 天 ➜ 進入第 ${round + 1} 晚`}
          </button>
        </div>
      </div>

      {/* 二次確認：入夜 */}
      <ConfirmModal
        open={confirmNextNightOpen}
        title={`進入第 ${round + 1} 晚？`}
        description="確定結束白天討論與投票並進入下一個夜晚？"
        confirmLabel={`進入第 ${round + 1} 晚`}
        tone="primary"
        onConfirm={() => {
          setConfirmNextNightOpen(false);
          advanceToNextNight();
        }}
        onCancel={() => setConfirmNextNightOpen(false)}
      />

      <SeatStatusDrawer
        open={seatDrawerOpen}
        board={board}
        onClose={() => setSeatDrawerOpen(false)}
      />
    </div>
  );
}
