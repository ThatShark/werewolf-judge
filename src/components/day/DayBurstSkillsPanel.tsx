import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import {
  hasPandoraDayGun,
  isJackSecondIdentityBoard,
  isSheriffElectionActive,
  resolveSelfExplode,
} from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { SlideDrawer } from '../common/SlideDrawer';
import { formatSeatDisplay, formatSeatNum } from '../common/displayHelpers';
import { ExtraDaySkillsSection } from './ExtraDaySkillsSection';

interface DayBurstSkillsPanelProps {
  disabled?: boolean;
  /** 若已進入階段四（放逐投票），徹底禁用一般狼人與白狼王自爆（僅狼女孩 wolf_girl 除外） */
  inExileVoteStage?: boolean;
}

export function DayBurstSkillsPanel({
  disabled = false,
  inExileVoteStage = false,
}: DayBurstSkillsPanelProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const knightDuelUsed = useGameStore((s) => s.knightDuelUsed);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);

  const selfExplode = useGameStore((s) => s.selfExplode);
  const goodSelfExplode = useGameStore((s) => s.goodSelfExplode);
  const whiteWolfKingExplode = useGameStore((s) => s.whiteWolfKingExplode);
  const knightDuel = useGameStore((s) => s.knightDuel);

  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);

  // 普通狼人自爆
  const [selectedExplodeSeat, setSelectedExplodeSeat] = useState<number | null>(null);
  const [confirmExplodeOpen, setConfirmExplodeOpen] = useState(false);
  const [explodeError, setExplodeError] = useState<string | null>(null);

  // 愚言家／鐵好人翻牌自曝
  const [selectedGoodExplodeSeat, setSelectedGoodExplodeSeat] = useState<number | null>(null);
  const [confirmGoodExplodeOpen, setConfirmGoodExplodeOpen] = useState(false);

  // 白狼王自爆帶人
  const [selectedWwkTarget, setSelectedWwkTarget] = useState<number | null>(null);
  const [confirmWwkOpen, setConfirmWwkOpen] = useState(false);

  // 騎士決鬥
  const [selectedKnightTarget, setSelectedKnightTarget] = useState<number | null>(null);
  const [confirmKnightOpen, setConfirmKnightOpen] = useState(false);
  const [knightNotice, setKnightNotice] = useState<string | null>(null);

  const isOnlineJudge = hostMode.judgeMode === 'online_judge';
  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const electionActive = isSheriffElectionActive(sheriffState);

  const willSwallowNow =
    electionActive &&
    (ruleOverrides.badgeSwallowRule === 'single_explode' ||
      sheriffState.explodeCountDuringElection >= 1);

  const aliveWhiteWolfKing = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'white_wolf_king') ?? null,
    [seats],
  );
  const aliveKnight = useMemo(
    () => seats.find((s) => s.isAlive && s.roleId === 'knight') ?? null,
    [seats],
  );
  const aliveGoodExploders = useMemo(
    () =>
      seats.filter(
        (s) =>
          s.isAlive &&
          !s.infectedBySeedWolf &&
          (s.roleId === 'fool_seer' || s.roleId === 'iron_good'),
      ),
    [seats],
  );

  const finalBatchState = useGameStore((s) => s.finalBatchState);
  const interferenceState = useGameStore((s) => s.interferenceState);
  const combatState = useGameStore((s) => s.combatState);
  const conversionState = useGameStore((s) => s.conversionState);

  // 計算整合抽屜內可用技能總數
  const availableSkillCount = useMemo(() => {
    let count = 0;
    if (!isOnlineJudge && aliveKnight && !knightDuelUsed && !electionActive) count += 1;
    if (!isOnlineJudge && !inExileVoteStage && aliveWhiteWolfKing) count += 1;
    if (!isOnlineJudge && aliveGoodExploders.length > 0) count += 1;
    if (isJackSecondIdentityBoard(seats, selectedBoardId ?? undefined)) count += 1;
    if (
      thirdPartySpecialState &&
      aliveSeats.some((s) => hasPandoraDayGun(thirdPartySpecialState, s.seatNumber))
    ) {
      count += 1;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'wolf_girl')) count += 1;
    if (seats.some((s) => s.isAlive && s.maskedDelayedDeath)) count += 1;
    if (seats.some((s) => s.isAlive && s.whiteCatRevealed)) count += 1;
    if (seats.some((s) => s.isAlive && s.oldRascalDelayedDeath)) count += 1;
    if (seats.some((s) => s.isAlive && s.baiZeDelayedDeath)) count += 1;
    if (seats.some((s) => s.isAlive && s.roleId === 'bai_ze')) count += 1;
    if (seats.some((s) => s.isAlive && s.roleId === 'pufferfish') && !combatState?.pufferfishBombUsed) {
      count += 1;
    }
    if (
      seats.some((s) => s.roleId === 'avenger' && !s.isAlive) &&
      !conversionState?.avengerInstantWin
    ) {
      count += 1;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'nine_tails_wolf')) count += 1;
    if (seats.some((s) => s.isAlive && s.roleId === 'detective') && !finalBatchState?.detectiveUsed) {
      count += 1;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'contrarian') && !finalBatchState?.contrarianUsed) {
      count += 1;
    }
    if (
      round >= 2 &&
      seats.some((s) => s.isAlive && s.roleId === 'white_night_envoy') &&
      !finalBatchState?.whiteNightEnvoyUsed
    ) {
      count += 1;
    }
    if (
      seats.some((s) => s.isAlive && s.roleId === 'sequence_prince') &&
      !finalBatchState?.sequencePrinceUsed
    ) {
      count += 1;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'pandora')) count += 1;
    if (
      seats.some((s) => s.isAlive && s.roleId === 'alchemy_witch') &&
      !interferenceState?.alchemySnakeUsed &&
      ((interferenceState?.alchemySnakePendingVictimSeats?.length ?? 0) > 0 ||
        interferenceState?.alchemySnakePendingVictimSeat != null)
    ) {
      count += 1;
    }
    return count;
  }, [
    isOnlineJudge,
    inExileVoteStage,
    electionActive,
    aliveKnight,
    knightDuelUsed,
    aliveWhiteWolfKing,
    aliveGoodExploders.length,
    seats,
    selectedBoardId,
    thirdPartySpecialState,
    aliveSeats,
    round,
    finalBatchState,
    interferenceState,
    combatState,
    conversionState,
  ]);

  const selectedExplodeObj = seats.find((s) => s.seatNumber === selectedExplodeSeat);
  const selectedGoodExplodeObj = seats.find((s) => s.seatNumber === selectedGoodExplodeSeat);
  const selectedWwkTargetObj = seats.find((s) => s.seatNumber === selectedWwkTarget);
  const selectedKnightTargetObj = seats.find((s) => s.seatNumber === selectedKnightTarget);

  const explodeBadgeNotice = electionActive
    ? willSwallowNow
      ? '（將正式吞警徽）'
      : '（雙爆首爆：隔日直進退水投票）'
    : '';

  return (
    <section className="space-y-3">
      {/* 警上自爆規則提示 */}
      {electionActive && (
        <div className="border-l-2 border-sheriff bg-sheriff-tint px-3 py-1.5 text-[12px] font-semibold text-sheriff">
          {willSwallowNow ? '警上自爆將正式吞警徽並入夜' : '雙爆規則首爆：隔日跳過發言直進投票'}
        </div>
      )}

      {/* 外層僅保留：整合技能抽屜入口（若有可用技能）＋ 狼人自爆 */}
      {availableSkillCount > 0 && (
        <button
          type="button"
          onClick={() => setSkillsDrawerOpen(true)}
          className="flex min-h-12 w-full items-center justify-between rounded-md border border-sheriff-border bg-sheriff-tint px-3.5 text-[14px] font-semibold text-sheriff transition hover:opacity-90"
        >
          <span>⚡ 觸發技能（{availableSkillCount} 項可用）</span>
          <span className="text-[12px]">展開 →</span>
        </button>
      )}

      {knightNotice && (
        <div className="border-l-2 border-sheriff bg-surface px-3 py-2 text-[12px] text-sheriff">
          {knightNotice}
        </div>
      )}

      {/* 狼人自爆（階段四：放逐投票徹底禁用，僅狼女孩例外） */}
      {inExileVoteStage ? (
        <div className="border-l-2 border-subtle bg-surface px-3 py-2 text-[12px] text-secondary">
          已進入放逐投票階段，一般狼人不可自爆（僅狼女孩可於上方技能抽屜發動自爆）。
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[14px] font-semibold text-wolf">狼人自爆</div>

          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {aliveSeats.map((seat) => {
              const explodeCheck = resolveSelfExplode(seats, seat.seatNumber);
              const active = selectedExplodeSeat === seat.seatNumber;
              const role = !isOnlineJudge ? getRoleById(seat.roleId) : undefined;
              const seatDisabled = isOnlineJudge ? disabled : !explodeCheck.allowed || disabled;

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  disabled={seatDisabled}
                  onClick={() => {
                    setExplodeError(null);
                    setSelectedExplodeSeat((prev) =>
                      prev === seat.seatNumber ? null : seat.seatNumber,
                    );
                  }}
                  className={`min-h-12 rounded-md px-2.5 py-1.5 text-left transition ${
                    active
                      ? 'border-selected-wolf bg-wolf-tint text-primary'
                      : seatDisabled
                        ? 'cursor-not-allowed border border-subtle bg-canvas opacity-45'
                        : 'border border-subtle bg-surface hover:border-strong'
                  }`}
                >
                  <div className="text-[14px] font-semibold tabular-nums text-primary">
                    {formatSeatNum(seat.seatNumber)}
                  </div>
                  <div className="truncate text-[12px] text-secondary">
                    {role ? role.name : seat.nickname.trim() || `${seat.seatNumber}號`}
                  </div>
                </button>
              );
            })}
          </div>

          {explodeError && (
            <div className="border-l-2 border-wolf bg-wolf-tint px-3 py-1.5 text-[12px] text-wolf">
              {explodeError}
            </div>
          )}

          <button
            type="button"
            disabled={selectedExplodeSeat === null || disabled}
            onClick={() => setConfirmExplodeOpen(true)}
            className={`min-h-12 w-full rounded-md px-4 text-[14px] font-semibold transition ${
              selectedExplodeSeat !== null && !disabled
                ? 'bg-wolf text-primary hover:opacity-90'
                : 'cursor-not-allowed bg-elevated text-muted'
            }`}
          >
            {selectedExplodeObj
              ? `宣告 ${formatSeatNum(selectedExplodeObj.seatNumber)} 號自爆入夜`
              : '選擇自爆狼人'}
          </button>
        </div>
      )}

      {/* 整合技能抽屜 */}
      <SlideDrawer
        open={skillsDrawerOpen}
        onClose={() => setSkillsDrawerOpen(false)}
        title="觸發白天技能"
        placement="bottom"
      >
        <div className="divide-y divide-subtle">
          {/* 騎士翻牌決鬥 */}
          {!isOnlineJudge && aliveKnight && !knightDuelUsed && (
            <div className="space-y-2 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-good">騎士翻牌決鬥</span>
                <span className="text-[12px] tabular-nums text-secondary">
                  騎士 {formatSeatNum(aliveKnight.seatNumber)} 號
                </span>
              </div>
              {electionActive ? (
                <div className="border-l-2 border-sheriff bg-sheriff-tint px-3 py-2 text-[12px] text-sheriff">
                  警長競選階段無法發動騎士決鬥
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-1.5">
                    {aliveSeats
                      .filter((s) => s.seatNumber !== aliveKnight.seatNumber)
                      .map((seat) => {
                        const active = selectedKnightTarget === seat.seatNumber;
                        return (
                          <button
                            key={seat.seatNumber}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              setSelectedKnightTarget((prev) =>
                                prev === seat.seatNumber ? null : seat.seatNumber,
                              )
                            }
                            className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
                              active
                                ? 'border-selected-good bg-good-tint text-good'
                                : 'border border-subtle bg-canvas text-secondary'
                            }`}
                          >
                            {formatSeatNum(seat.seatNumber)}
                          </button>
                        );
                      })}
                  </div>
                  <button
                    type="button"
                    disabled={disabled || selectedKnightTarget === null}
                    onClick={() => setConfirmKnightOpen(true)}
                    className="min-h-12 w-full rounded-md bg-good px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
                  >
                    {selectedKnightTargetObj
                      ? `決鬥 ${formatSeatNum(selectedKnightTargetObj.seatNumber)} 號`
                      : '選擇決鬥目標'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* 白狼王自爆帶人（投票階段禁用） */}
          {!isOnlineJudge && !inExileVoteStage && aliveWhiteWolfKing && (
            <div className="space-y-2 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-wolf">白狼王自爆帶人</span>
                <span className="text-[12px] tabular-nums text-secondary">
                  {formatSeatNum(aliveWhiteWolfKing.seatNumber)} 號
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {aliveSeats
                  .filter((s) => s.seatNumber !== aliveWhiteWolfKing.seatNumber)
                  .map((seat) => {
                    const active = selectedWwkTarget === seat.seatNumber;
                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSelectedWwkTarget((prev) =>
                            prev === seat.seatNumber ? null : seat.seatNumber,
                          )
                        }
                        className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
                          active
                            ? 'border-selected-wolf bg-wolf-tint text-wolf'
                            : 'border border-subtle bg-canvas text-secondary'
                        }`}
                      >
                        {formatSeatNum(seat.seatNumber)}
                      </button>
                    );
                  })}
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setConfirmWwkOpen(true)}
                className="min-h-12 w-full rounded-md bg-wolf px-4 text-[14px] font-semibold text-primary disabled:opacity-40"
              >
                {selectedWwkTargetObj
                  ? `自爆並帶走 ${formatSeatNum(selectedWwkTargetObj.seatNumber)} 號`
                  : '白狼王空爆入夜'}
              </button>
            </div>
          )}

          {/* 愚言家／鐵好人翻牌自曝 */}
          {!isOnlineJudge && aliveGoodExploders.length > 0 && (
            <div className="space-y-2 py-3">
              <span className="text-[14px] font-semibold text-good">愚言家／鐵好人翻牌自曝</span>
              <div className="flex flex-wrap gap-1.5">
                {aliveGoodExploders.map((seat) => {
                  const active = selectedGoodExplodeSeat === seat.seatNumber;
                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setSelectedGoodExplodeSeat((prev) =>
                          prev === seat.seatNumber ? null : seat.seatNumber,
                        )
                      }
                      className={`min-h-11 rounded-md px-3 text-[14px] font-semibold tabular-nums ${
                        active
                          ? 'border-selected-good bg-good-tint text-good'
                          : 'border border-subtle bg-canvas text-secondary'
                      }`}
                    >
                      {formatSeatNum(seat.seatNumber)}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={selectedGoodExplodeSeat === null || disabled}
                onClick={() => setConfirmGoodExplodeOpen(true)}
                className="min-h-12 w-full rounded-md bg-good px-4 text-[14px] font-semibold text-inverse disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
              >
                確認翻牌自曝
              </button>
            </div>
          )}

          {/* 其餘擴充日間技能 */}
          <ExtraDaySkillsSection disabled={disabled} />
        </div>
      </SlideDrawer>

      <ConfirmModal
        open={confirmExplodeOpen && selectedExplodeObj !== undefined}
        title="確認狼人自爆"
        description={
          selectedExplodeObj
            ? `${formatSeatDisplay(selectedExplodeObj)} 自爆並進入第 ${round + 1} 晚${explodeBadgeNotice}。`
            : undefined
        }
        confirmLabel="確認自爆"
        tone="danger"
        onConfirm={() => {
          if (selectedExplodeSeat !== null) {
            const res = selfExplode(selectedExplodeSeat);
            if (!res.allowed) {
              setExplodeError(res.reason ?? '無法自爆');
            } else {
              setSelectedExplodeSeat(null);
            }
          }
          setConfirmExplodeOpen(false);
        }}
        onCancel={() => setConfirmExplodeOpen(false)}
      />

      <ConfirmModal
        open={!isOnlineJudge && confirmWwkOpen && aliveWhiteWolfKing !== null}
        title="確認白狼王自爆"
        description={
          aliveWhiteWolfKing
            ? selectedWwkTargetObj
              ? `${aliveWhiteWolfKing.seatNumber} 號白狼王自爆帶走 ${formatSeatDisplay(selectedWwkTargetObj)}${explodeBadgeNotice}。`
              : `${aliveWhiteWolfKing.seatNumber} 號白狼王空爆入夜${explodeBadgeNotice}。`
            : undefined
        }
        confirmLabel="確認自爆"
        tone="danger"
        onConfirm={() => {
          if (aliveWhiteWolfKing) {
            whiteWolfKingExplode(aliveWhiteWolfKing.seatNumber, selectedWwkTarget);
            setSelectedWwkTarget(null);
            setSkillsDrawerOpen(false);
          }
          setConfirmWwkOpen(false);
        }}
        onCancel={() => setConfirmWwkOpen(false)}
      />

      <ConfirmModal
        open={!isOnlineJudge && confirmGoodExplodeOpen && selectedGoodExplodeObj !== undefined}
        title="確認翻牌自曝"
        description={
          selectedGoodExplodeObj
            ? `${formatSeatDisplay(selectedGoodExplodeObj)} 淘汰並進入第 ${round + 1} 晚${explodeBadgeNotice}。`
            : undefined
        }
        confirmLabel="確認自曝"
        tone="primary"
        onConfirm={() => {
          if (selectedGoodExplodeSeat !== null) {
            goodSelfExplode(selectedGoodExplodeSeat);
            setSelectedGoodExplodeSeat(null);
            setSkillsDrawerOpen(false);
          }
          setConfirmGoodExplodeOpen(false);
        }}
        onCancel={() => setConfirmGoodExplodeOpen(false)}
      />

      <ConfirmModal
        open={
          !isOnlineJudge &&
          confirmKnightOpen &&
          aliveKnight !== null &&
          selectedKnightTargetObj !== undefined
        }
        title="確認騎士決鬥"
        description={
          aliveKnight && selectedKnightTargetObj
            ? `${aliveKnight.seatNumber} 號決鬥 ${formatSeatDisplay(selectedKnightTargetObj)}。`
            : undefined
        }
        confirmLabel="確認決鬥"
        tone="primary"
        onConfirm={() => {
          if (aliveKnight && selectedKnightTarget !== null) {
            const res = knightDuel(aliveKnight.seatNumber, selectedKnightTarget);
            if (!res.allowed) {
              setKnightNotice(res.reason ?? '決鬥失敗');
            } else if (!res.targetWasWolf) {
              setKnightNotice(
                `${formatSeatNum(selectedKnightTarget)} 號為好人，騎士以死謝罪，繼續白天。`,
              );
            }
            setSelectedKnightTarget(null);
            setSkillsDrawerOpen(false);
          }
          setConfirmKnightOpen(false);
        }}
        onCancel={() => setConfirmKnightOpen(false)}
      />
    </section>
  );
}
