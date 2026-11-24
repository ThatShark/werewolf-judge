import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { checkCanShoot, getSmallestDeadSeat } from '../../logic';
import type { SpeakingOrderMode } from '../../logic/types';
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
  const dailyRandomDirection = useGameStore((s) => s.dailyRandomDirection);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const speakingMeta = useGameStore((s) => s.speakingMeta);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const rerollDailyRandomDirection = useGameStore((s) => s.rerollDailyRandomDirection);
  const generateSpeakingOrder = useGameStore((s) => s.generateSpeakingOrder);
  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const proceedToDayVote = useGameStore((s) => s.proceedToDayVote);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [selectedDeadAnchor, setSelectedDeadAnchor] = useState<number | null>(null);
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

  const activeSheriffSeat = useMemo(() => {
    if (sheriffState.badgeStatus !== 'active' || sheriffState.sheriffSeat === null) return null;
    const sheriffObj = seats.find((s) => s.seatNumber === sheriffState.sheriffSeat);
    return sheriffObj?.isAlive ? sheriffObj.seatNumber : null;
  }, [sheriffState, seats]);

  const effectiveDeadAnchor = useMemo(() => {
    if (selectedDeadAnchor !== null && nightDeadSeats.includes(selectedDeadAnchor)) {
      return selectedDeadAnchor;
    }
    return getSmallestDeadSeat(nightDeadSeats);
  }, [selectedDeadAnchor, nightDeadSeats]);

  const handleLockSpeakingOrder = (mode: SpeakingOrderMode) => {
    if (mode === 'dead_left' || mode === 'dead_right') {
      if (effectiveDeadAnchor === null) return;
      generateSpeakingOrder({ mode, referenceDeadSeat: effectiveDeadAnchor });
      return;
    }
    if (mode === 'sheriff_left' || mode === 'sheriff_right') {
      if (activeSheriffSeat === null) return;
      generateSpeakingOrder({ mode });
      return;
    }
    generateSpeakingOrder({ mode: 'random' });
  };

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

        {/* 白天一早決定發言方向與順序（今日隨機順／逆時針 ＋ 死左死右／警左警右一鍵鎖定） */}
        <section className="space-y-2.5 rounded-lg border border-subtle bg-surface p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-secondary">今日隨機方向</span>
              <span className="rounded-md border border-sheriff-border bg-sheriff-tint px-2.5 py-0.5 text-[13px] font-semibold text-sheriff">
                {dailyRandomDirection === 'clockwise' ? '↻ 順時針' : '↺ 逆時針'}
              </span>
            </div>
            <button
              type="button"
              onClick={rerollDailyRandomDirection}
              className="min-h-9 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
            >
              重抽方向
            </button>
          </div>

          {nightDeadSeats.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
              <span className="text-secondary">基準死者</span>
              {nightDeadSeats.map((seatNum) => (
                <button
                  key={seatNum}
                  type="button"
                  onClick={() => setSelectedDeadAnchor(seatNum)}
                  className={`min-h-9 rounded-md px-2.5 font-semibold tabular-nums ${
                    effectiveDeadAnchor === seatNum
                      ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                      : 'border border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {formatSeatNum(seatNum)} 號
                </button>
              ))}
            </div>
          )}

          {/* 依死訊／警長狀態呈現明確方向按鈕 */}
          <div className="space-y-1.5">
            {nightDeadSeats.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLockSpeakingOrder('dead_left')}
                  className={`min-h-12 rounded-md px-3 text-[13px] font-semibold transition ${
                    speakingMeta?.mode === 'dead_left'
                      ? 'border-selected-wolf bg-wolf-tint text-primary'
                      : 'border border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  死左（順時針）
                </button>
                <button
                  type="button"
                  onClick={() => handleLockSpeakingOrder('dead_right')}
                  className={`min-h-12 rounded-md px-3 text-[13px] font-semibold transition ${
                    speakingMeta?.mode === 'dead_right'
                      ? 'border-selected-wolf bg-wolf-tint text-primary'
                      : 'border border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  死右（逆時針）
                </button>
              </div>
            )}

            {activeSheriffSeat !== null && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLockSpeakingOrder('sheriff_left')}
                  className={`min-h-12 rounded-md px-3 text-[13px] font-semibold transition ${
                    speakingMeta?.mode === 'sheriff_left'
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  警左（順時針）
                </button>
                <button
                  type="button"
                  onClick={() => handleLockSpeakingOrder('sheriff_right')}
                  className={`min-h-12 rounded-md px-3 text-[13px] font-semibold transition ${
                    speakingMeta?.mode === 'sheriff_right'
                      ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                      : 'border border-subtle bg-canvas text-primary hover:border-strong'
                  }`}
                >
                  警右（逆時針）
                </button>
              </div>
            )}

            {nightDeadSeats.length === 0 && activeSheriffSeat === null && (
              <button
                type="button"
                onClick={() => handleLockSpeakingOrder('random')}
                className={`min-h-12 w-full rounded-md px-3 text-[13px] font-semibold transition ${
                  speakingMeta?.mode === 'random'
                    ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                    : 'border border-subtle bg-canvas text-primary hover:border-strong'
                }`}
              >
                平安夜無警長 · 一鍵抽選發言順序
              </button>
            )}
          </div>

          {/* 鎖定之完整發言順序列表（直接帶入後續發言計時器） */}
          {speakingQueue.length > 0 && (
            <div className="space-y-1.5 border-t border-subtle pt-2">
              <div className="flex items-center justify-between text-[12px] text-secondary">
                <span className="font-semibold text-good">
                  已鎖定發言順序（
                  {speakingMeta?.mode === 'dead_left'
                    ? '死左'
                    : speakingMeta?.mode === 'dead_right'
                      ? '死右'
                      : speakingMeta?.mode === 'sheriff_left'
                        ? '警左'
                        : speakingMeta?.mode === 'sheriff_right'
                          ? '警右'
                          : '隨機'}
                  ）
                </span>
                <span className="tabular-nums">共 {speakingQueue.length} 位</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {speakingQueue.map((seatNum, idx) => (
                  <span
                    key={`${seatNum}-${idx}`}
                    className="inline-flex h-7 items-center rounded-md border border-subtle bg-canvas px-2 text-[12px] font-semibold tabular-nums text-primary"
                  >
                    {formatSeatNum(seatNum)}
                    {speakingMeta?.sheriffLastSeat === seatNum ? '警' : ''}
                  </span>
                ))}
              </div>
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
