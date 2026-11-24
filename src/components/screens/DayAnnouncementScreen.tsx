import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { checkCanShoot } from '../../logic';
import { useGameStore } from '../../store/gameStore';
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
import { ManualVictoryModal } from '../day/ManualVictoryModal';
import { NightStatusBanners } from '../day/NightStatusBanners';

export function DayAnnouncementScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const lastBearRoar = useGameStore((s) => s.lastBearRoar);
  const lastMoonSpiritHowl = useGameStore((s) => s.lastMoonSpiritHowl ?? null);
  const lastSeniorVillagerReveal = useGameStore((s) => s.lastSeniorVillagerReveal ?? null);
  const interferenceState = useGameStore((s) => s.interferenceState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const finalBatchState = useGameStore((s) => s.finalBatchState);
  const combatState = useGameStore((s) => s.combatState);
  const reviveWithAlchemySnake = useGameStore((s) => s.reviveWithAlchemySnake);
  const triggerWhiteCatDelayedDeath = useGameStore((s) => s.triggerWhiteCatDelayedDeath);
  const triggerOldRascalDelayedDeath = useGameStore((s) => s.triggerOldRascalDelayedDeath);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const proceedToDayVote = useGameStore((s) => s.proceedToDayVote);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  // 防法官唸錯鐵律：預設隱藏真實死因，點擊該列或圖示才顯示
  const [revealedDeathKeys, setRevealedDeathKeys] = useState<Record<string, boolean>>({});

  const board = getBoardById(selectedBoardId);
  const isOnlineJudge = hostMode.judgeMode === 'online_judge';

  const latestNight = useMemo(
    () => nightHistory.find((entry) => entry.round === round) ?? nightHistory[nightHistory.length - 1],
    [nightHistory, round],
  );

  const deaths = latestNight?.deaths ?? [];
  const nightDeadSeats = useMemo(() => deaths.map((d) => d.seat), [deaths]);
  const bearRoar = latestNight?.bearRoar ?? lastBearRoar;

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
  const availableSkillCount =
    (canAlchemySnakeRevive ? 1 : 0) +
    (hasWhiteCatPending ? 1 : 0) +
    (hasOldRascalPending ? 1 : 0);

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const isProceedBlocked = hasPendingShooters || hasPendingBadgeTransfer;
  const isDeferredElectionNext =
    sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1;

  const toggleRevealDeath = (key: string) => {
    if (isOnlineJudge) return;
    setRevealedDeathKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部緊湊雙欄座位網格 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        nightDeadSeats={nightDeadSeats}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {/* 2. 單行狀態膠囊列 */}
      <NightStatusBanners
        isOnlineJudge={isOnlineJudge}
        interferenceState={interferenceState}
        thirdPartySpecialState={thirdPartySpecialState}
        finalBatchState={finalBatchState}
      />

      {/* 3. 中央主公告與待處理事件 */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {forceContinueAfterVictory && (
          <div className="border-l-2 border-sheriff bg-sheriff-tint px-3 py-1.5 text-[12px] font-semibold text-sheriff">
            已解除自動勝負鎖定（法官強制繼續中）
          </div>
        )}

        {/* 防法官唸錯鐵律：主公告大字只顯示「昨晚死亡：X 號、Y 號」或「昨晚平安夜」，預設隱藏死因 */}
        <section className="rounded-lg border border-subtle bg-surface p-3.5">
          {deaths.length === 0 ? (
            <div className="border-l-2 border-good pl-3">
              <div className="text-[12px] font-semibold text-good">D{round} 天亮公告</div>
              <h1 className="mt-0.5 text-[18px] font-semibold leading-6 text-primary">
                昨晚平安夜
              </h1>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="border-l-2 border-wolf pl-3">
                <div className="text-[12px] font-semibold text-wolf">D{round} 天亮公告</div>
                <h1 className="mt-0.5 text-[18px] font-semibold leading-6 tabular-nums text-primary">
                  昨晚死亡：{deaths.map((d) => `${formatSeatNum(d.seat)} 號`).join('、')}
                </h1>
              </div>

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
                            <span title="點擊檢視法官視角死因">ⓘ</span>
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

        {/* 公共宣告資訊（熊咆哮／月靈狼／高級平民／雙爆續選／猩紅／河豚） */}
        {isDeferredElectionNext && (
          <div className="border-l-2 border-sheriff bg-surface px-3 py-2 text-[12px] text-sheriff tabular-nums">
            首爆續選：跳過警上發言，候選人 {sheriffState.candidates.map(formatSeatNum).join('、')}{' '}
            直進退水投票。
          </div>
        )}

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
        {availableSkillCount > 0 && (
          <button
            type="button"
            onClick={() => setSkillsDrawerOpen(true)}
            className="flex min-h-12 w-full items-center justify-between rounded-md border border-sheriff-border bg-sheriff-tint px-3.5 text-[14px] font-semibold text-sheriff"
          >
            <span>⚡ 觸發技能（{availableSkillCount} 項可用）</span>
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
              const roleLabel = info.roleId === 'hunter' ? '獵人' : '狼王';
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

        {/* 可開槍結算 */}
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

      {/* 4. 底部操作列：勝負覆蓋線框 ＋ 單一實心主按鈕 */}
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
          disabled={isProceedBlocked}
          onClick={proceedToDayVote}
          className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
            isProceedBlocked
              ? 'cursor-not-allowed bg-elevated text-muted'
              : 'bg-sheriff text-inverse hover:opacity-90'
          }`}
        >
          {hasPendingShooters
            ? '請先結算開槍'
            : hasPendingBadgeTransfer
              ? '請先交接警徽'
              : '進入白天討論'}
        </button>
      </footer>

      {/* 延遲技能整合抽屜 */}
      <SlideDrawer
        open={skillsDrawerOpen}
        onClose={() => setSkillsDrawerOpen(false)}
        title="觸發技能"
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
                  setSkillsDrawerOpen(false);
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
                  setSkillsDrawerOpen(false);
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
                  setSkillsDrawerOpen(false);
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
