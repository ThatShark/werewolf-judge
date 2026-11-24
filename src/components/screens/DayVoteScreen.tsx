import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SheriffBadgeTransferCard } from '../common/SheriffBadgeTransferCard';
import { SlideDrawer } from '../common/SlideDrawer';
import { CompactSeatStatusGrid } from '../day/CompactSeatStatusGrid';
import { DayBurstSkillsPanel } from '../day/DayBurstSkillsPanel';
import { DayStageStepper } from '../day/DayStageStepper';
import { ExileVotePanel } from '../day/ExileVotePanel';
import { ManualVictoryModal } from '../day/ManualVictoryModal';

/**
 * 白天階段四：放逐投票階段（嚴格獨立畫面）
 * - 徹底禁用一般狼人與白狼王自爆（僅狼女孩 wolf_girl 除外）。
 * - 專注於放逐計票、PK 投票與放逐後開槍／警徽交接結算。
 */
export function DayVoteScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const advanceToNextNight = useGameStore((s) => s.advanceToNextNight);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const board = getBoardById(selectedBoardId);

  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [confirmNextNightOpen, setConfirmNextNightOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const hasBlockingPendingAction = hasPendingShooters || hasPendingBadgeTransfer;

  const hasAliveWolfGirl = useMemo(
    () => seats.some((s) => s.isAlive && s.roleId === 'wolf_girl'),
    [seats],
  );

  const showSheriffStage = round === 1 && ruleOverrides.enableSheriff;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 左右對稱雙欄緊湊座位條 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {/* 2. 白天四階段嚴格進度條（鎖定在階段四：放逐投票） */}
      <DayStageStepper currentStage="exile_vote" showSheriffStage={showSheriffStage} />

      {forceContinueAfterVictory && (
        <div className="shrink-0 border-l-2 border-sheriff bg-sheriff-tint px-3 py-1 text-[12px] font-semibold text-sheriff">
          法官強制繼續中
        </div>
      )}

      {/* 3. 中央單一任務工作區：放逐計票 */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        <ExileVotePanel disabled={hasBlockingPendingAction} />
      </div>

      {/* 4. 底部固定操作列 */}
      <footer className="flex shrink-0 items-center gap-2 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={() => setVictoryModalOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          勝負
        </button>
        {hasAliveWolfGirl && (
          <button
            type="button"
            onClick={() => setSkillsDrawerOpen(true)}
            className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-3 text-[12px] font-semibold text-wolf hover:opacity-90"
          >
            狼女孩自爆
          </button>
        )}
        <button
          type="button"
          disabled={hasBlockingPendingAction}
          onClick={() => setConfirmNextNightOpen(true)}
          className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
            hasBlockingPendingAction
              ? 'cursor-not-allowed bg-elevated text-muted'
              : 'border border-subtle bg-surface text-primary hover:border-strong'
          }`}
        >
          {hasPendingShooters
            ? '請先結算開槍'
            : hasPendingBadgeTransfer
              ? '請先交接警徽'
              : `進入第 ${round + 1} 晚`}
        </button>
      </footer>

      {/* 投票階段特殊技能抽屜（一般狼人與白狼王自爆已禁用，僅保留狼女孩例外與合法日間技） */}
      <SlideDrawer
        open={skillsDrawerOpen}
        onClose={() => setSkillsDrawerOpen(false)}
        title="投票階段特殊技能"
        placement="bottom"
      >
        <DayBurstSkillsPanel disabled={hasBlockingPendingAction} inExileVoteStage={true} />
      </SlideDrawer>

      {/* 高優先級阻塞彈窗：開槍與警徽交接 */}
      {hasBlockingPendingAction && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/78 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[86dvh] w-full max-w-lg space-y-3 overflow-y-auto">
            {sheriffState.pendingBadgeTransferFrom !== null && (
              <SheriffBadgeTransferCard
                fromSeat={sheriffState.pendingBadgeTransferFrom}
                seats={seats}
                onTransfer={transferSheriffBadge}
                onDestroy={destroySheriffBadge}
              />
            )}
            {pendingShooters.map((shooter) => (
              <PendingShooterCard
                key={shooter.seatNumber}
                shooter={shooter}
                seats={seats}
                onShoot={triggerShoot}
                onSkip={skipShoot}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmNextNightOpen}
        title={`進入第 ${round + 1} 晚`}
        description="確定結束白天並進入下一個夜晚？"
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

      <ManualVictoryModal
        open={victoryModalOpen}
        onSelectOverride={(kind) => overrideVictory(kind)}
        onClose={() => setVictoryModalOpen(false)}
      />
    </div>
  );
}
