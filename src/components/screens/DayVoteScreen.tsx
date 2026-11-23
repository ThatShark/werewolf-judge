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
    electionActive || (round === 1 && ruleOverrides.enableSheriff && sheriffState.status === 'not_started');

  const [activeTab, setActiveTab] = useState<DayTaskTab>(() =>
    needsSheriffTab ? 'sheriff' : 'speaking',
  );
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [confirmNextNightOpen, setConfirmNextNightOpen] = useState(false);

  // 當雙爆首爆延續隔天進入 voting 時，自動聚焦警長分頁
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
    { id: 'sheriff', label: '👮 警長', highlight: needsSheriffTab },
    { id: 'speaking', label: '🎤 發言', highlight: currentSpeakerSeat !== null },
    { id: 'vote', label: '🗳️ 投票', highlight: exilePkCandidates.length > 0 },
    { id: 'skills', label: '⚡ 技能/爆' },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 緊湊座位狀態網格 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        currentSpeakerSeat={currentSpeakerSeat}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {forceContinueAfterVictory && (
        <div className="shrink-0 rounded-xl border border-amber-400/45 bg-amber-950/35 px-3 py-1.5 text-[11px] font-bold text-amber-200">
          ⚖️ 法官強制繼續中（已解除自動勝負鎖定）
        </div>
      )}

      {/* 2. 中央任務切換 Tab 列 */}
      <nav
        aria-label="白天任務工作台分頁"
        className="grid shrink-0 grid-cols-4 gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-h-11 rounded-xl px-1.5 text-xs font-extrabold transition active:scale-[0.98] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.highlight && !isActive && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. 中央單一任務工作區（嚴格鎖在 100dvh 內，不產生主畫面滾輪） */}
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

      {/* 4. 底部固定操作列：勝負覆蓋 ＋ 結束白天入夜 */}
      <div className="flex shrink-0 items-center gap-2 border-t border-slate-800 pt-2">
        <button
          type="button"
          onClick={() => setVictoryModalOpen(true)}
          className="min-h-12 shrink-0 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800 active:scale-[0.98]"
        >
          ⚖️ 勝負覆蓋
        </button>
        <button
          type="button"
          disabled={hasBlockingPendingAction}
          onClick={() => setConfirmNextNightOpen(true)}
          className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-extrabold transition ${
            hasBlockingPendingAction
              ? 'cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:scale-[0.99]'
          }`}
        >
          {hasPendingShooters
            ? '請先結算開槍 / 壓槍'
            : hasPendingBadgeTransfer
              ? '請先移交 / 撕毀警徽'
              : `🌙 結束第 ${round} 天 ➜ 第 ${round + 1} 晚`}
        </button>
      </div>

      {/* 高優先級自動彈窗：待結算開槍與警徽移交／撕毀 */}
      {hasBlockingPendingAction && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
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

      <ManualVictoryModal
        open={victoryModalOpen}
        onSelectOverride={(kind) => overrideVictory(kind)}
        onClose={() => setVictoryModalOpen(false)}
      />
    </div>
  );
}
