import { useEffect, useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { isSheriffElectionActive } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SheriffBadgeTransferCard } from '../common/SheriffBadgeTransferCard';
import { CompactSeatStatusGrid } from '../day/CompactSeatStatusGrid';
import { DayBurstSkillsPanel } from '../day/DayBurstSkillsPanel';
import { ExileVotePanel } from '../day/ExileVotePanel';
import { ManualVictoryModal } from '../day/ManualVictoryModal';
import { SheriffElectionPanel } from '../day/SheriffElectionPanel';
import { SpeakingTimerPanel } from '../day/SpeakingTimerPanel';

type DayTaskTab = 'sheriff' | 'speaking' | 'vote' | 'skills';

export function DayVoteScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const exilePkCandidates = useGameStore((s) => s.exilePkCandidates);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const currentSpeakerIndex = useGameStore((s) => s.currentSpeakerIndex);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const advanceToNextNight = useGameStore((s) => s.advanceToNextNight);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const board = getBoardById(selectedBoardId);
  const electionActive = isSheriffElectionActive(sheriffState);
  const needsSheriffTab =
    electionActive ||
    (round === 1 && ruleOverrides.enableSheriff && sheriffState.status === 'not_started');

  const [activeTab, setActiveTab] = useState<DayTaskTab>(() =>
    needsSheriffTab ? 'sheriff' : 'speaking',
  );
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [confirmNextNightOpen, setConfirmNextNightOpen] = useState(false);

  useEffect(() => {
    if (sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1) {
      setActiveTab('sheriff');
    }
  }, [sheriffState.status, sheriffState.explodeCountDuringElection]);

  const currentSpeakerSeat = useMemo(
    () => (currentSpeakerIndex < speakingQueue.length ? speakingQueue[currentSpeakerIndex] : null),
    [currentSpeakerIndex, speakingQueue],
  );

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const hasBlockingPendingAction = hasPendingShooters || hasPendingBadgeTransfer;

  const tabs: Array<{ id: DayTaskTab; label: string; highlight?: boolean }> = [
    { id: 'sheriff', label: '警長', highlight: needsSheriffTab },
    { id: 'speaking', label: '發言', highlight: currentSpeakerSeat !== null },
    { id: 'vote', label: '投票', highlight: exilePkCandidates.length > 0 },
    { id: 'skills', label: '技能/爆' },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 左右對稱雙欄緊湊座位條 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        currentSpeakerSeat={currentSpeakerSeat}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {forceContinueAfterVictory && (
        <div className="shrink-0 border-l-2 border-sheriff bg-sheriff-tint px-3 py-1 text-[12px] font-semibold text-sheriff">
          法官強制繼續中
        </div>
      )}

      {/* 2. 中央分頁列（去 Emoji，純文字 ＋ 6px 琥珀點） */}
      <nav
        aria-label="白天任務分頁"
        className="grid shrink-0 grid-cols-4 gap-1 rounded-md border border-subtle bg-surface p-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-h-10 rounded-md px-1 text-[12px] font-semibold transition ${
                isActive ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
              {tab.highlight && !isActive && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sheriff" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. 中央單一任務工作區 */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        {activeTab === 'sheriff' && (
          <SheriffElectionPanel
            disabled={hasBlockingPendingAction}
            onSwitchToSpeaking={() => setActiveTab('speaking')}
          />
        )}
        {activeTab === 'speaking' && <SpeakingTimerPanel />}
        {activeTab === 'vote' && <ExileVotePanel disabled={hasBlockingPendingAction} />}
        {activeTab === 'skills' && <DayBurstSkillsPanel disabled={hasBlockingPendingAction} />}
      </div>

      {/* 4. 底部固定操作列（投票分頁由 ExileVotePanel 掌握唯一主按鈕；其餘分頁顯示入夜主按鈕） */}
      <footer className="flex shrink-0 items-center gap-2 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={() => setVictoryModalOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          勝負
        </button>
        <button
          type="button"
          disabled={hasBlockingPendingAction}
          onClick={() => setConfirmNextNightOpen(true)}
          className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
            hasBlockingPendingAction
              ? 'cursor-not-allowed bg-elevated text-muted'
              : activeTab === 'vote'
                ? 'border border-subtle bg-surface text-primary hover:border-strong'
                : 'bg-sheriff text-inverse hover:opacity-90'
          }`}
        >
          {hasPendingShooters
            ? '請先結算開槍'
            : hasPendingBadgeTransfer
              ? '請先交接警徽'
              : `進入第 ${round + 1} 晚`}
        </button>
      </footer>

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
