import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { checkCanShoot, isSheriffElectionActive, shouldNightDeathHaveLastWords } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { InlineCountdownTimer } from '../common/InlineCountdownTimer';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SheriffBadgeTransferCard } from '../common/SheriffBadgeTransferCard';
import { SlideDrawer } from '../common/SlideDrawer';
import {
  formatDeathReason,
  formatSeatNum,
  getRoleBadgeClasses,
} from '../common/displayHelpers';
import { CompactSeatStatusGrid } from '../day/CompactSeatStatusGrid';
import { DayBurstSkillsPanel } from '../day/DayBurstSkillsPanel';
import { DayStageStepper } from '../day/DayStageStepper';
import { ManualVictoryModal } from '../day/ManualVictoryModal';
import { NightStatusBanners } from '../day/NightStatusBanners';
import { SheriffElectionPanel } from '../day/SheriffElectionPanel';
import { SpeakingTimerPanel } from '../day/SpeakingTimerPanel';

/**
 * 白天前三階段（嚴格依序推進）：
 * 階段一：警長競選（僅首日且有警長，或雙爆首爆隔日續選；在報死訊之前）
 * 階段二：公布昨晚死訊 ＋ 首夜遺言 ＋ 警徽交接 ＋ 死亡技能（開槍）
 * 階段三：白天發言階段（警左／警右、單死死左／死右、無警長自動生成）
 */
export function DayAnnouncementScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const dayStage = useGameStore((s) => s.dayStage);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const lastBearRoar = useGameStore((s) => s.lastBearRoar);
  const lastMoonSpiritHowl = useGameStore((s) => s.lastMoonSpiritHowl ?? null);
  const lastSeniorVillagerReveal = useGameStore((s) => s.lastSeniorVillagerReveal ?? null);
  const interferenceState = useGameStore((s) => s.interferenceState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const finalBatchState = useGameStore((s) => s.finalBatchState);
  const combatState = useGameStore((s) => s.combatState);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const currentSpeakerIndex = useGameStore((s) => s.currentSpeakerIndex);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const reviveWithAlchemySnake = useGameStore((s) => s.reviveWithAlchemySnake);
  const triggerWhiteCatDelayedDeath = useGameStore((s) => s.triggerWhiteCatDelayedDeath);
  const triggerOldRascalDelayedDeath = useGameStore((s) => s.triggerOldRascalDelayedDeath);
  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const proceedToDeathAnnouncement = useGameStore((s) => s.proceedToDeathAnnouncement);
  const proceedToDaySpeaking = useGameStore((s) => s.proceedToDaySpeaking);
  const proceedToDayVote = useGameStore((s) => s.proceedToDayVote);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [burstDrawerOpen, setBurstDrawerOpen] = useState(false);
  const [delayedSkillsDrawerOpen, setDelayedSkillsDrawerOpen] = useState(false);
  // 防法官唸錯鐵律：預設隱藏真實死因，點擊該列或圖示才顯示
  const [revealedDeathKeys, setRevealedDeathKeys] = useState<Record<string, boolean>>({});

  const board = getBoardById(selectedBoardId);
  const isOnlineJudge = hostMode.judgeMode === 'online_judge';

  const latestNight = useMemo(
    () => nightHistory.find((entry) => entry.round === round) ?? nightHistory[nightHistory.length - 1],
    [nightHistory, round],
  );

  const deaths = latestNight?.deaths ?? [];
  const nightDeadSeats = useMemo(
    () => Array.from(new Set(deaths.map((d) => d.seat))).sort((a, b) => a - b),
    [deaths],
  );
  const bearRoar = latestNight?.bearRoar ?? lastBearRoar;

  const showSheriffStage =
    (round === 1 && ruleOverrides.enableSheriff) ||
    dayStage === 'sheriff_election' ||
    (sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1);

  const currentSpeakerSeat = useMemo(
    () => (currentSpeakerIndex < speakingQueue.length ? speakingQueue[currentSpeakerIndex] : null),
    [currentSpeakerIndex, speakingQueue],
  );

  const disabledShootInfos = useMemo(() => {
    if (isOnlineJudge) return [];
    return deaths
      .map((death) => {
        const eligibility = checkCanShoot(seats, death.seat, death.reason);
        if (!eligibility || eligibility.canShoot) return null;
        return { ...eligibility, deathReason: death.reason };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [deaths, seats, isOnlineJudge]);

  const canAlchemySnakeRevive =
    !isOnlineJudge &&
    Boolean(interferenceState) &&
    !interferenceState?.alchemySnakeUsed &&
    interferenceState?.alchemySnakePendingVictimSeat !== null;
  const hasWhiteCatPending = seats.some(
    (s) => s.isAlive && s.roleId === 'white_cat' && s.whiteCatRevealed,
  );
  const hasOldRascalPending = seats.some((s) => s.isAlive && s.oldRascalDelayedDeath);
  const delayedSkillCount =
    (canAlchemySnakeRevive ? 1 : 0) +
    (hasWhiteCatPending ? 1 : 0) +
    (hasOldRascalPending ? 1 : 0);

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const isSheriffStageStillPending =
    dayStage === 'sheriff_election' &&
    (sheriffState.status === 'not_started' || isSheriffElectionActive(sheriffState));

  const toggleRevealDeath = (key: string) => {
    if (isOnlineJudge) return;
    setRevealedDeathKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 底部單一主按鈕配置（嚴格依序推進）
  const primaryAction = (() => {
    if (dayStage === 'sheriff_election') {
      return {
        label: isSheriffStageStillPending ? '請先完成警長競選' : '進入死訊公告 →',
        disabled: isSheriffStageStillPending,
        onClick: proceedToDeathAnnouncement,
      };
    }
    if (dayStage === 'death_announcement') {
      return {
        label: hasPendingShooters
          ? '請先結算開槍'
          : hasPendingBadgeTransfer
            ? '請先交接警徽'
            : '進入白天發言 →',
        disabled: hasPendingShooters || hasPendingBadgeTransfer,
        onClick: proceedToDaySpeaking,
      };
    }
    return {
      label: hasPendingShooters
        ? '請先結算開槍'
        : hasPendingBadgeTransfer
          ? '請先交接警徽'
          : '進入放逐投票 →',
      disabled: hasPendingShooters || hasPendingBadgeTransfer,
      onClick: proceedToDayVote,
    };
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部緊湊雙欄座位網格 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        nightDeadSeats={dayStage === 'sheriff_election' ? [] : nightDeadSeats}
        currentSpeakerSeat={dayStage === 'speaking' ? currentSpeakerSeat : null}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {/* 2. 白天四階段嚴格進度條 */}
      <DayStageStepper currentStage={dayStage} showSheriffStage={showSheriffStage} />

      {/* 3. 單行狀態膠囊列（報死訊後顯示） */}
      {dayStage !== 'sheriff_election' && (
        <NightStatusBanners
          isOnlineJudge={isOnlineJudge}
          interferenceState={interferenceState}
          thirdPartySpecialState={thirdPartySpecialState}
          finalBatchState={finalBatchState}
        />
      )}

      {/* 4. 中央單階段主工作區 */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {forceContinueAfterVictory && (
          <div className="border-l-2 border-sheriff bg-sheriff-tint px-3 py-1.5 text-[12px] font-semibold text-sheriff">
            已解除自動勝負鎖定（法官強制繼續中）
          </div>
        )}

        {/* 階段一：警長競選（在報死訊之前） */}
        {dayStage === 'sheriff_election' && (
          <SheriffElectionPanel disabled={hasPendingShooters || hasPendingBadgeTransfer} />
        )}

        {/* 階段二：公布昨晚死訊 ＋ 首夜遺言與死亡技能 */}
        {dayStage === 'death_announcement' && (
          <>
            {/* 防法官唸錯鐵律：主公告大字只顯示「昨晚死亡：X 號、Y 號」或「昨晚平安夜」，預設隱藏死因 */}
            <section className="rounded-lg border border-subtle bg-surface p-3.5">
              {deaths.length === 0 ? (
                <div className="border-l-2 border-good pl-3">
                  <div className="text-[12px] font-semibold text-good">D{round} 昨晚死訊</div>
                  <h1 className="mt-0.5 text-[18px] font-semibold leading-6 text-primary">
                    昨晚平安夜
                  </h1>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="border-l-2 border-wolf pl-3">
                    <div className="text-[12px] font-semibold text-wolf">D{round} 昨晚死訊</div>
                    <h1 className="mt-0.5 text-[18px] font-semibold leading-6 tabular-nums text-primary">
                      昨晚死亡：{deaths.map((d) => `${formatSeatNum(d.seat)} 號`).join('、')}
                    </h1>
                  </div>

                  {shouldNightDeathHaveLastWords(round) ? (
                    <div className="space-y-2">
                      <div className="border-l-2 border-sheriff bg-sheriff-tint px-3 py-1.5 text-[12px] font-semibold text-sheriff tabular-nums">
                        首夜遺言：請 {deaths.map((d) => `${formatSeatNum(d.seat)} 號`).join('、')} 發表遺言
                      </div>
                      <InlineCountdownTimer title="首夜死者遺言倒數" />
                    </div>
                  ) : (
                    <div className="border-l-2 border-subtle bg-canvas px-3 py-1.5 text-[12px] font-medium text-secondary">
                      第 {round} 晚夜死無遺言（處理完警徽／死亡技能後直接進入白天發言）
                    </div>
                  )}

                  {!isOnlineJudge && (
                    <div className="divide-y divide-subtle border-t border-subtle pt-1">
                      {deaths.map((death) => {
                        const key = `${death.seat}-${death.reason}`;
                        const seat = seats.find((s) => s.seatNumber === death.seat);
                        const role = getRoleById(seat?.roleId ?? null);
                        const isRevealed = Boolean(revealedDeathKeys[key]);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleRevealDeath(key)}
                            className="flex min-h-11 w-full items-center justify-between gap-2 py-2 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="w-6 shrink-0 text-[14px] font-semibold tabular-nums text-wolf">
                                {formatSeatNum(death.seat)}
                              </span>
                              <span className="truncate text-[14px] text-primary">
                                {seat?.nickname.trim() || `${death.seat}號`}
                              </span>
                              {isRevealed && role && (
                                <span
                                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[12px] font-medium ${getRoleBadgeClasses(role.id)}`}
                                >
                                  {role.name}
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 text-[12px] text-muted">
                              {isRevealed ? (
                                <span className="text-wolf">{formatDeathReason(death.reason)}</span>
                              ) : (
                                <span title="點擊檢視法官視角死因">ⓘ 死因</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 公共宣告資訊（熊咆哮／月靈狼／高級平民／猩紅／河豚） */}
            {bearRoar && (
              <div
                className={`border-l-2 bg-surface px-3 py-2 text-[14px] font-semibold ${
                  bearRoar.roared ? 'border-sheriff text-sheriff' : 'border-good text-good'
                }`}
              >
                {bearRoar.roared ? '昨晚熊咆哮了' : '昨晚熊沒有咆哮'}
              </div>
            )}

            {lastMoonSpiritHowl && lastMoonSpiritHowl.moonSpiritSeat !== null && (
              <div className="border-l-2 border-third bg-surface px-3 py-2 text-[14px] font-semibold text-third">
                {lastMoonSpiritHowl.howled ? '昨夜月靈狼嗥叫了' : '昨夜月靈狼沒有嗥叫'}
              </div>
            )}

            {lastSeniorVillagerReveal && lastSeniorVillagerReveal.seatNumber !== null && round === 1 && (
              <div className="border-l-2 border-good bg-surface px-3 py-2 text-[14px] font-semibold text-primary tabular-nums">
                {lastSeniorVillagerReveal.revealed
                  ? `公開宣布：${formatSeatNum(lastSeniorVillagerReveal.seatNumber)} 號為高級平民`
                  : '本日不公布高級平民'}
              </div>
            )}

            {combatState && combatState.scarletAttachedSeats.length > 0 && (
              <div className="border-l-2 border-wolf bg-surface px-3 py-2 text-[12px] text-wolf tabular-nums">
                猩紅附著：{combatState.scarletAttachedSeats.map(formatSeatNum).join('、')} 號
              </div>
            )}

            {combatState?.pufferfishWolfKilledToday && (
              <div className="border-l-2 border-sheriff bg-surface px-3 py-2 text-[12px] text-sheriff">
                河豚翻牌：今日狼美人魅惑失效
              </div>
            )}

            {/* 延遲技能整合入口 */}
            {delayedSkillCount > 0 && (
              <button
                type="button"
                onClick={() => setDelayedSkillsDrawerOpen(true)}
                className="flex min-h-12 w-full items-center justify-between rounded-md border border-sheriff-border bg-sheriff-tint px-3.5 text-[14px] font-semibold text-sheriff"
              >
                <span>⚡ 延遲死亡技能（{delayedSkillCount} 項可用）</span>
                <span className="text-[12px]">展開 →</span>
              </button>
            )}

            {/* 警長昨夜出局之警徽交接／撕毀 */}
            {sheriffState.pendingBadgeTransferFrom !== null && (
              <SheriffBadgeTransferCard
                fromSeat={sheriffState.pendingBadgeTransferFrom}
                seats={seats}
                onTransfer={transferSheriffBadge}
                onDestroy={destroySheriffBadge}
              />
            )}

            {/* 禁開槍提示（法官視角） */}
            {disabledShootInfos.length > 0 && (
              <div className="space-y-1.5">
                {disabledShootInfos.map((info) => {
                  const roleLabel =
                    info.roleId === 'wolf_king'
                      ? '狼王'
                      : info.roleId === 'awakened_hunter'
                        ? '覺醒獵人'
                        : info.roleId === 'lucky_gun'
                          ? '幸運兒（槍）'
                          : '獵人';
                  return (
                    <div
                      key={info.seatNumber}
                      className="border-l-2 border-wolf bg-surface px-3 py-2 text-[12px] text-secondary tabular-nums"
                    >
                      <span className="font-semibold text-wolf">
                        {formatSeatNum(info.seatNumber)} 號（{roleLabel}）不可開槍
                      </span>
                      <span> · {info.reason}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 可開槍結算（支援連鎖開槍） */}
            {pendingShooters.map((shooter) => (
              <PendingShooterCard
                key={shooter.seatNumber}
                shooter={shooter}
                seats={seats}
                onShoot={triggerShoot}
                onSkip={skipShoot}
              />
            ))}
          </>
        )}

        {/* 階段三：白天發言階段 */}
        {dayStage === 'speaking' && <SpeakingTimerPanel />}
      </div>

      {/* 5. 底部操作列：勝負線框 ＋ 自爆/技能線框（投票前開放） ＋ 單一實心主按鈕 */}
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
          onClick={() => setBurstDrawerOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-3 text-[12px] font-semibold text-wolf hover:opacity-90"
        >
          自爆/技能
        </button>
        <button
          type="button"
          disabled={primaryAction.disabled}
          onClick={primaryAction.onClick}
          className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
            primaryAction.disabled
              ? 'cursor-not-allowed bg-elevated text-muted'
              : 'bg-sheriff text-inverse hover:opacity-90'
          }`}
        >
          {primaryAction.label}
        </button>
      </footer>

      {/* 階段一～三通用：狼人自爆與日間突發技能抽屜 */}
      <SlideDrawer
        open={burstDrawerOpen}
        onClose={() => setBurstDrawerOpen(false)}
        title="自爆與日間技能"
        placement="bottom"
      >
        <DayBurstSkillsPanel
          disabled={hasPendingShooters || hasPendingBadgeTransfer}
          inExileVoteStage={false}
        />
      </SlideDrawer>

      {/* 延遲技能整合抽屜 */}
      <SlideDrawer
        open={delayedSkillsDrawerOpen}
        onClose={() => setDelayedSkillsDrawerOpen(false)}
        title="觸發延遲技能"
        placement="bottom"
      >
        <div className="divide-y divide-subtle">
          {canAlchemySnakeRevive && interferenceState && (
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="text-[14px] font-medium text-primary tabular-nums">
                法老之蛇救活 {formatSeatNum(interferenceState.alchemySnakePendingVictimSeat!)} 號
              </div>
              <button
                type="button"
                onClick={() => {
                  reviveWithAlchemySnake(interferenceState.alchemySnakePendingVictimSeat!);
                  setDelayedSkillsDrawerOpen(false);
                }}
                className="min-h-11 shrink-0 rounded-md bg-good px-3.5 text-[12px] font-semibold text-inverse"
              >
                發動救活
              </button>
            </div>
          )}

          {hasWhiteCatPending && (
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="text-[14px] font-medium text-primary">白貓翻牌延遲出局</div>
              <button
                type="button"
                onClick={() => {
                  triggerWhiteCatDelayedDeath();
                  setDelayedSkillsDrawerOpen(false);
                }}
                className="min-h-11 shrink-0 rounded-md bg-wolf px-3.5 text-[12px] font-semibold text-primary"
              >
                結算出局
              </button>
            </div>
          )}

          {hasOldRascalPending && (
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="text-[14px] font-medium text-primary">老流氓負傷延遲出局</div>
              <button
                type="button"
                onClick={() => {
                  triggerOldRascalDelayedDeath();
                  setDelayedSkillsDrawerOpen(false);
                }}
                className="min-h-11 shrink-0 rounded-md bg-wolf px-3.5 text-[12px] font-semibold text-primary"
              >
                結算出局
              </button>
            </div>
          )}
        </div>
      </SlideDrawer>

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
