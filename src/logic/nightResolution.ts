import {
  applyWolfBeautyCharmDeath,
  canDreamCatcherDream,
  canWolfBeautyCharm,
  evaluateBearRoar,
} from './advancedRoles';
import {
  canAnubisScale,
  canAssassinAssassinate,
  canAwakenedIdiotShield,
  canAwakenedWolfBeautyCharm,
  canAwakenedWolfKingGiveGun,
  canBeeWildHuntSting,
  canBigBadWolfExtraKill,
  canBigGreyWolfKill,
  canDemonHunterHunt,
  canNightNobleChooseServant,
  canPerseusExecute,
  canScarletAttach,
  canWardenTrade,
  canWolfRavenClawKill,
  canWolfYoungerBrotherAwakenedKill,
  cloneCombatState,
  createInitialCombatState,
  evaluateAnubisScaleWins,
  evaluateWardenTrade,
  findRustySwordCounterTarget,
  isDemonHunterImmuneToPoison,
  isOldRascalDelayableDeath,
  syncAnubisTeamStatus,
  syncBigGreyWolfTeamStatus,
  syncScarletWolfKingTeamStatus,
  syncWolfBrothersState,
  syncWolfRavenClawTeamStatus,
} from './combatRoles';
import {
  canAwakenedGargoyleConvert,
  canCupidLink,
  canGhostBrideChoose,
  canJackRipperKill,
  canJackRipperSelectFanatic,
  canPuppetChoose,
  canScentPhantomLink,
  canThiefChooseCard,
  canTwinsGuard,
  canXuXianBind,
  canZombieInfect,
  cloneConversionState,
  createInitialConversionState,
  evaluateCupidAffiliation,
  isJackSecondIdentityBoard,
  syncConversionOnDeaths,
} from './conversionRoles';
import {
  addNineTailsMark,
  advanceSleepSpread,
  applyPandoraGift,
  areAllAliveWolvesAsleep,
  canCrowCurse,
  canDancerPickFloor,
  canMediumChannel,
  canPandoraKnifeHolderAttack,
  clearBaiZeMarks,
  cloneThirdPartySpecialState,
  createInitialThirdPartySpecialState,
  getChannelableSkillForRole,
  isLuckySkillAllowedOnRound,
  isSeatAsleep,
  resolveDancerFloor,
  resolveExoticPrinceCheck,
  syncBatch5LoneWolfTeamStatus,
} from './thirdPartySpecialRoles';
import {
  canEclipseMaidDevour,
  canGreyWolfBossSteal,
  canHappySheepAct,
  canPhantomWolfActivateInvincible,
  canPoliceDogAct,
  canWolvesIdentifyLittleGirl,
  cloneFinalBatchState,
  createInitialFinalBatchState,
  syncFinalBatchLoneWolfTeamStatus,
} from './finalBatchRoles';
import { checkCanShoot } from './dayResolution';
import {
  canAwakenedDreamCatcherDream,
  canDemonWolfCheck,
  canSuperGravekeeperChooseHeir,
  createInitialGargoyleState,
  createInitialPumpkinGhostState,
  createInitialSuperGravekeeperState,
  doesPureWhiteKillTarget,
  doesWolfWitchKillTarget,
  evaluateAwakenedDreamTargetActed,
  evaluateMoonSpiritHowl,
  evaluateNineTailedFoxTails,
  evaluateSeniorVillagerReveal,
  findAwakenedDreamCatcherSeat,
  findDemonWolfSeat,
  findGargoyleSeat,
  findGravekeeperSeat,
  findPumpkinGhostSeat,
  findSuperGravekeeperSeat,
  getAwakenedSeerCheckResult,
  getDemonWolfCheckResult,
  getDrunkSeerCheckResult,
  getFoolSeerCheckResult,
  getFoxCheckResult,
  getGargoyleCheckResult,
  getGravekeeperExileResult,
  getLanternSeerCheckResult,
  getPumpkinGhostCheckResult,
  getPureWhiteCheckResult,
  getWolfWitchCheckResult,
  isCursedFoxSeat,
  syncGargoyleTeamStatus,
  syncPumpkinGhostInheritance,
  syncSuperGravekeeperInheritance,
} from './inspectionRoles';
import {
  applyTargetSwaps,
  canAlchemyWitchUseFog,
  canAwakenedWitchUseAntidote,
  canAwakenedWitchUsePoison,
  canBlackBatShield,
  canDarkNightEnvoyShield,
  canDaylightScholarAct,
  canEnchanterBewitch,
  canFortuneTellerMark,
  canFoxCubCharm,
  canMagicianSwap,
  canMedusaPetrify,
  canMuteElderMute,
  canPenguinFreeze,
  canRadiantEarlShield,
  canSilentNightMentorAct,
  canSocialiteFavor,
  canTimeEclipseLock,
  canTricksterWolfSwap,
  canTroublemakerPrank,
  canWolfWarlockSwap,
  cloneInterferenceState,
  createInitialInterferenceState,
  getFortuneTellerAllowedKillSeats,
  isSameSwapPair,
  isWarWolfImmuneToDeath,
  resolveMentorScholarInteraction,
  shouldWhiteCatSurviveDeath,
  syncSilentNightMentorTeamStatus,
  syncTroublemakerTeamStatus,
} from './interferenceRoles';
import {
  applyMechWolfLearn,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  findMechWolfSeat,
  getPsychicCheckResult,
  getSeerCheckResult,
  syncMechWolfTeamStatus,
} from './mechWolf';
import {
  applyHybridChooseIdol,
  canHybridChooseIdol,
  canNightmareFear,
  canSeedWolfInfect,
  createInitialHiddenWolfState,
  createInitialHybridState,
  createInitialSeedWolfState,
  findEvilKnightSeat,
  findHybridSeat,
  findNightmareSeat,
  isSeatWolfFaction,
  syncHiddenWolfTeamStatus,
  syncHybridAffiliation,
} from './topFiveRoles';
import {
  applyTreasureMasterCardChoice,
  canTreasureMasterChooseCard,
  createInitialTreasureMasterState,
  findTreasureMasterSeat,
  syncTreasureMasterTeamStatus,
} from './treasureMaster';
import type {
  ActionCheckResult,
  DeathReason,
  NightDeathRecord,
  NightResolutionInput,
  NightResolutionResult,
  PlayerSeat,
  RuleOverrides,
  ShootEligibility,
  TreasureMasterRuntimeState,
  VictoryResult,
} from './types';
import { checkVictory } from './victory';
import {
  applyWolfGirlConfess,
  canWolfGirlConfess,
  createInitialWolfGirlState,
  findWolfGirlSeat,
} from './wolfGirl';

export function canGuardTarget(
  lastGuardedSeat: number | null,
  targetSeat: number | null,
  seats: PlayerSeat[],
): ActionCheckResult {
  const guard = seats.find((seat) => seat.roleId === 'guard' && seat.isAlive);
  if (!guard) {
    return { allowed: false, reason: '場上沒有存活的守衛' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (lastGuardedSeat === targetSeat) {
    return { allowed: false, reason: '守衛不可連續兩晚守護同一名玩家' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '守護目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canWitchUseAntidote(
  seats: PlayerSeat[],
  round: number,
  wolfTarget: number | null,
  witchAntidoteUsed: boolean,
  ruleOverrides: RuleOverrides,
): ActionCheckResult {
  const witch = seats.find((seat) => seat.roleId === 'witch' && seat.isAlive);
  if (!witch) {
    return { allowed: false, reason: '場上沒有存活的女巫' };
  }
  if (witchAntidoteUsed) {
    return { allowed: false, reason: '女巫解藥已使用完畢' };
  }
  if (wolfTarget === null) {
    return { allowed: false, reason: '今晚狼人空刀，無須使用解藥' };
  }
  const target = seats.find((seat) => seat.seatNumber === wolfTarget);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '狼刀目標不存在或已出局' };
  }

  if (wolfTarget === witch.seatNumber) {
    if (ruleOverrides.witchSelfSave === 'never') {
      return { allowed: false, reason: '本局規則禁止女巫自救' };
    }
    if (ruleOverrides.witchSelfSave === 'first_night_only' && round > 1) {
      return { allowed: false, reason: '本局規則僅允許女巫於第一晚自救' };
    }
  }

  return { allowed: true };
}

export function canWitchUsePoison(
  seats: PlayerSeat[],
  witchUseAntidote: boolean,
  witchPoisonTarget: number | null,
  witchPoisonUsed: boolean,
): ActionCheckResult {
  const witch = seats.find((seat) => seat.roleId === 'witch' && seat.isAlive);
  if (!witch) {
    return { allowed: false, reason: '場上沒有存活的女巫' };
  }
  if (witchPoisonTarget === null) {
    return { allowed: true };
  }
  if (witchUseAntidote) {
    return { allowed: false, reason: '女巫解藥與毒藥不可在同一晚同時使用' };
  }
  if (witchPoisonUsed) {
    return { allowed: false, reason: '女巫毒藥已使用完畢' };
  }
  const target = seats.find((seat) => seat.seatNumber === witchPoisonTarget);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '毒殺目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canPoisonerUsePoison(
  seats: PlayerSeat[],
  poisonerTarget: number | null,
  poisonerPoisonUsed: boolean,
): ActionCheckResult {
  const poisoner = seats.find((seat) => seat.roleId === 'poisoner' && seat.isAlive);
  if (!poisoner) {
    return { allowed: false, reason: '場上沒有存活的毒師' };
  }
  if (poisonerTarget === null) {
    return { allowed: true };
  }
  if (poisonerPoisonUsed) {
    return { allowed: false, reason: '毒師毒藥已使用完畢' };
  }
  const target = seats.find((seat) => seat.seatNumber === poisonerTarget);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '毒殺目標不存在或已出局' };
  }
  return { allowed: true };
}

const MASKED_DELAYABLE_NIGHT_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'witch_poison',
  'poisoner_poison',
  'mech_wolf_poison',
  'mech_wolf_kill',
  'milk_pierce',
  'dream_catcher_consecutive',
  'dream_catcher_link',
]);

function killSeat(
  seats: PlayerSeat[],
  deaths: NightDeathRecord[],
  seatNumber: number,
  reason: DeathReason,
  round: number,
  maskedDelayedSeats: number[] = [],
  treasureMasterState?: TreasureMasterRuntimeState,
  whiteCatRevealedSeats: number[] = [],
): PlayerSeat[] {
  const existing = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!existing || !existing.isAlive) {
    return seats;
  }

  // 戰狼免疫所有神職技能傷害、獵魔人免疫女巫毒藥
  if (isWarWolfImmuneToDeath(existing, reason) || isDemonHunterImmuneToPoison(existing, reason)) {
    return seats;
  }

  // 老流氓被女巫／毒師毒殺進入延遲死亡（隔天發言結束後才出局）
  if (isOldRascalDelayableDeath(existing, reason)) {
    return seats.map((seat) =>
      seat.seatNumber === seatNumber ? { ...seat, oldRascalDelayedDeath: true } : seat,
    );
  }

  // 白貓任何原因出局皆可翻牌免死一次（延遲至下一次放逐結束後才正式出局）
  const whiteCatCheck = shouldWhiteCatSurviveDeath(existing, reason);
  if (whiteCatCheck.survive) {
    if (whiteCatCheck.newlyRevealed && !whiteCatRevealedSeats.includes(seatNumber)) {
      whiteCatRevealedSeats.push(seatNumber);
    }
    return seats.map((seat) =>
      seat.seatNumber === seatNumber ? { ...seat, whiteCatRevealed: true } : seat,
    );
  }

  // 蒙面人（或當晚切換為蒙面人的盜寶大師）夜間遭毒／攝／狼刀時進入負傷延遲死亡狀態，當晚不死
  const isMaskedActive =
    existing.roleId === 'masked_villager' ||
    (existing.roleId === 'treasure_master' &&
      treasureMasterState?.currentNightCardRoleId === 'masked_villager');

  if (isMaskedActive && MASKED_DELAYABLE_NIGHT_REASONS.has(reason)) {
    if (!maskedDelayedSeats.includes(seatNumber)) {
      maskedDelayedSeats.push(seatNumber);
    }
    return seats.map((seat) =>
      seat.seatNumber === seatNumber
        ? {
            ...seat,
            maskedDelayedDeath: true,
            maskedDelayedDeathReason: seat.maskedDelayedDeathReason ?? reason,
          }
        : seat,
    );
  }

  deaths.push({ seat: seatNumber, reason });
  return seats.map((seat) =>
    seat.seatNumber === seatNumber
      ? {
          ...seat,
          isAlive: false,
          deathReason: reason,
          deathRound: round,
        }
      : seat,
  );
}

export function resolveNight(input: NightResolutionInput): NightResolutionResult {
  const {
    seats: initialSeats,
    round,
    draft,
    ruleOverrides,
    witchAntidoteUsed,
    witchPoisonUsed,
    poisonerPoisonUsed = false,
    lastGuardedSeat,
    mechWolfState,
    pendingSelfExplodeSeat,
    lastCharmedSeat = null,
    lastDreamTarget = null,
    wolfGirlState = createInitialWolfGirlState(),
    treasureMasterState = createInitialTreasureMasterState(),
    firstNightNoWolfKill = false,
    lastFearedSeat = null,
    evilKnightCounterUsed = false,
    seerActsBeforeWitch = false,
    hybridState = createInitialHybridState(),
    seedWolfState = createInitialSeedWolfState(),
    hiddenWolfState = createInitialHiddenWolfState(),
    gargoyleState = createInitialGargoyleState(),
    pumpkinGhostState = createInitialPumpkinGhostState(),
    superGravekeeperState = createInitialSuperGravekeeperState(),
    foxLostAbility = false,
    exiledHistory = [],
    lastAwakenedDreamTarget = null,
    interferenceState = createInitialInterferenceState(),
    combatState = createInitialCombatState(),
    conversionState = createInitialConversionState(),
    thirdPartySpecialState = createInitialThirdPartySpecialState(),
    finalBatchState = createInitialFinalBatchState(),
    rng,
  } = input;

  if (firstNightNoWolfKill && round === 1 && draft.wolfTarget !== null) {
    throw new Error('此板子第一夜狼人無刀');
  }

  let updatedSeats: PlayerSeat[] = initialSeats.map((seat) => ({
    ...seat,
    petrified: false,
    muted: false,
  }));
  let nextMechWolfState = { ...mechWolfState };
  let nextWolfGirlState = { ...wolfGirlState };
  let nextTreasureMasterState = {
    ...treasureMasterState,
    bottomCards: [...treasureMasterState.bottomCards],
  };
  let nextHybridState = { ...hybridState };
  let nextSeedWolfState = { ...seedWolfState };
  let nextHiddenWolfState = { ...hiddenWolfState };
  let nextGargoyleState = {
    ...gargoyleState,
    checkHistory: [...gargoyleState.checkHistory],
  };
  let nextPumpkinGhostState = {
    ...pumpkinGhostState,
    inheritedHistory: [...pumpkinGhostState.inheritedHistory],
  };
  let nextSuperGravekeeperState = { ...superGravekeeperState };
  const nextInterferenceState = cloneInterferenceState(interferenceState);
  nextInterferenceState.activeMutedSeat = null;
  nextInterferenceState.activePetrifiedSeat = null;
  nextInterferenceState.activeTricksterVoteSwap = null;
  nextInterferenceState.alchemySnakePendingVictimSeat = null;
  let nextCombatState = cloneCombatState(combatState);
  const bloodMoonSealedGood = nextCombatState.bloodMoonSealActiveTonight;
  nextCombatState.bloodMoonSealActiveTonight = false;
  nextCombatState.pufferfishWolfKilledToday = false;
  const prevScarletAttached = [...nextCombatState.scarletAttachedSeats];
  nextCombatState = syncWolfBrothersState(updatedSeats, nextCombatState, round);
  nextCombatState.wolfRavenClawJoinedTeam = syncWolfRavenClawTeamStatus(
    updatedSeats,
    nextCombatState,
  );
  nextCombatState.bigGreyWolfJoinedTeam = syncBigGreyWolfTeamStatus(updatedSeats, nextCombatState);
  nextCombatState.anubisJoinedTeam = syncAnubisTeamStatus(updatedSeats, nextCombatState);
  nextCombatState.scarletWolfKingJoinedTeam = syncScarletWolfKingTeamStatus(
    updatedSeats,
    nextCombatState,
  );
  let nextConversionState = cloneConversionState(conversionState);
  let nextThirdPartySpecialState = cloneThirdPartySpecialState(thirdPartySpecialState);
  nextThirdPartySpecialState.crowActiveCursedSeat = null;
  nextThirdPartySpecialState.butlerActiveTeaSeat = null;
  nextThirdPartySpecialState.butlerActiveVoteBonusSeat = null;
  nextThirdPartySpecialState.butlerDayProtectedSeat = null;
  nextThirdPartySpecialState.wolfMaidActiveTeaSeat = null;
  nextThirdPartySpecialState.wolfMaidActiveVotePenaltySeat = null;
  // 睡美人睡眠擴散與異族王子喚醒
  nextThirdPartySpecialState = advanceSleepSpread(
    updatedSeats,
    nextThirdPartySpecialState,
    round,
    draft.sleepingBeautyPickSeat,
  );
  if (
    round >= 2 &&
    draft.exoticPrinceCheckTarget != null &&
    updatedSeats.some((s) => s.roleId === 'exotic_prince' && s.isAlive)
  ) {
    const wakeOutcome = resolveExoticPrinceCheck(
      nextThirdPartySpecialState,
      draft.exoticPrinceCheckTarget,
    );
    nextThirdPartySpecialState = wakeOutcome.state;
  }
  const allWolvesAsleepTonight = areAllAliveWolvesAsleep(updatedSeats, nextThirdPartySpecialState);
  let nextFinalBatchState = cloneFinalBatchState(finalBatchState);
  nextFinalBatchState.phantomWolfInvincibleActive = false;
  nextFinalBatchState.detectiveRevealedToday = false;
  nextFinalBatchState.contrarianSilencedVoterSeat = null;
  nextFinalBatchState.eclipseMaidDevouredSeatTonight = null;
  nextFinalBatchState.greyWolfBossBorrowedHunterGun = false;

  // 怪盜狼王無敵發動（持續至下次入夜前）
  if (
    draft.phantomWolfActivateInvincible &&
    canPhantomWolfActivateInvincible(updatedSeats, nextFinalBatchState).allowed
  ) {
    nextFinalBatchState.phantomWolfInvincibleUsed = true;
    nextFinalBatchState.phantomWolfInvincibleActive = true;
  }

  // 喜羊羊防盜／守護（對自己視為同時防盜＋守護）
  let happySheepGuardedSeat: number | null = null;
  let happySheepAntiTheftSeat: number | null = null;
  if (draft.happySheepTarget != null && draft.happySheepMode) {
    const sheepActor = updatedSeats.find((s) => s.roleId === 'happy_sheep' && s.isAlive);
    if (
      sheepActor &&
      canHappySheepAct(updatedSeats, nextFinalBatchState, draft.happySheepMode, draft.happySheepTarget)
        .allowed
    ) {
      if (draft.happySheepTarget === sheepActor.seatNumber) {
        happySheepGuardedSeat = sheepActor.seatNumber;
        happySheepAntiTheftSeat = sheepActor.seatNumber;
        nextFinalBatchState.happySheepLastProtectSeat = sheepActor.seatNumber;
        nextFinalBatchState.happySheepLastAntiTheftSeat = sheepActor.seatNumber;
      } else if (draft.happySheepMode === 'guard') {
        happySheepGuardedSeat = draft.happySheepTarget;
        nextFinalBatchState.happySheepLastProtectSeat = draft.happySheepTarget;
      } else {
        happySheepAntiTheftSeat = draft.happySheepTarget;
        nextFinalBatchState.happySheepLastAntiTheftSeat = draft.happySheepTarget;
      }
    }
  }
  let nextFoxLostAbility = foxLostAbility;
  let nextLastAwakenedDreamTarget: number | null = lastAwakenedDreamTarget;
  let nextWitchAntidoteUsed = witchAntidoteUsed;
  let nextWitchPoisonUsed = witchPoisonUsed;
  let nextPoisonerPoisonUsed = poisonerPoisonUsed;
  let nextLastGuardedSeat = lastGuardedSeat;
  let nextLastCharmedSeat = lastCharmedSeat;
  let nextActiveCharmedSeat: number | null = null;
  let nextLastDreamTarget: number | null = lastDreamTarget;
  let nextLastFearedSeat: number | null = lastFearedSeat;
  let nextEvilKnightCounterUsed = evilKnightCounterUsed;
  const deaths: NightDeathRecord[] = [];
  const maskedDelayedSeats: number[] = [];
  const whiteCatRevealedSeats: number[] = [];

  // 入夜前同步前一日白天出局觸發的繼承狀態（石像鬼→南瓜鬼、超級守墓人→繼承者）
  nextGargoyleState = syncGargoyleTeamStatus(updatedSeats, nextGargoyleState);
  nextPumpkinGhostState = syncPumpkinGhostInheritance(
    updatedSeats,
    nextGargoyleState,
    nextPumpkinGhostState,
  );
  nextSuperGravekeeperState = syncSuperGravekeeperInheritance(
    updatedSeats,
    nextSuperGravekeeperState,
  );

  // 0. 夢魘每晚優先睜眼恐懼（首夜可誤恐狼隊友導致整晚空刀；次夜起不可恐懼狼隊友）
  let fearedSeat: number | null = null;
  const aliveNightmare = findNightmareSeat(updatedSeats);
  if (aliveNightmare?.isAlive && draft.nightmareFearTarget !== undefined) {
    const fearCheck = canNightmareFear(
      updatedSeats,
      lastFearedSeat,
      draft.nightmareFearTarget,
      round,
      { allowSkip: true },
    );
    if (!fearCheck.allowed) {
      throw new Error(fearCheck.reason);
    }
    fearedSeat = draft.nightmareFearTarget ?? null;
    nextLastFearedSeat = fearedSeat;
  }

  const fearedSeatObj =
    fearedSeat !== null ? updatedSeats.find((s) => s.seatNumber === fearedSeat) : undefined;
  const wolfTeamFeared = Boolean(fearedSeatObj && isSeatWolfFaction(fearedSeatObj));

  // === 第 2 批階段 1：前置封鎖、冰凍、石化、增削與限刀 ===
  let penguinFrozenSeat: number | null = null;
  if (draft.penguinFreezeTarget !== undefined) {
    const alivePenguin = updatedSeats.find(
      (s) => s.roleId === 'penguin' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (alivePenguin && fearedSeat !== alivePenguin.seatNumber) {
      const check = canPenguinFreeze(
        updatedSeats,
        nextInterferenceState.lastPenguinTarget,
        draft.penguinFreezeTarget ?? null,
      );
      if (!check.allowed) throw new Error(check.reason);
      penguinFrozenSeat = draft.penguinFreezeTarget ?? null;
      nextInterferenceState.lastPenguinTarget = penguinFrozenSeat;
    }
  }
  const penguinFrozeWolf = Boolean(
    penguinFrozenSeat !== null &&
      isSeatWolfFaction(
        updatedSeats.find((s) => s.seatNumber === penguinFrozenSeat) ?? {
          seatNumber: -1,
          nickname: '',
          roleId: null,
          isAlive: false,
        },
      ),
  );

  let foxCubCharmedSeat: number | null = null;
  if (draft.foxCubCharmTarget !== undefined && draft.foxCubCharmTarget !== null) {
    const aliveFoxCub = updatedSeats.find(
      (s) => s.roleId === 'fox_cub' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (aliveFoxCub && fearedSeat !== aliveFoxCub.seatNumber) {
      const check = canFoxCubCharm(
        updatedSeats,
        nextInterferenceState.foxCubUsed,
        draft.foxCubCharmTarget,
        round,
      );
      if (!check.allowed) throw new Error(check.reason);
      foxCubCharmedSeat = draft.foxCubCharmTarget;
      nextInterferenceState.foxCubUsed = true;
    }
  }
  const foxCubCharmedWolf = Boolean(
    foxCubCharmedSeat !== null &&
      isSeatWolfFaction(
        updatedSeats.find((s) => s.seatNumber === foxCubCharmedSeat) ?? {
          seatNumber: -1,
          nickname: '',
          roleId: null,
          isAlive: false,
        },
      ),
  );

  let medusaPetrifiedSeat: number | null = null;
  const aliveMedusa = updatedSeats.find((s) => s.roleId === 'medusa' && s.isAlive);
  if (aliveMedusa && draft.medusaPetrifyTarget !== undefined) {
    const check = canMedusaPetrify(
      updatedSeats,
      nextInterferenceState.lastMedusaTarget,
      draft.medusaPetrifyTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    medusaPetrifiedSeat = draft.medusaPetrifyTarget ?? null;
    nextInterferenceState.lastMedusaTarget = medusaPetrifiedSeat;
    nextInterferenceState.activePetrifiedSeat = medusaPetrifiedSeat;
    if (medusaPetrifiedSeat !== null) {
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === medusaPetrifiedSeat ? { ...s, petrified: true } : s,
      );
    }
  }

  // 寂夜導師與白晝學者（增幅／削弱＋衝突結算）
  let mentorReq: { mode: 'amplify' | 'weaken'; targetSeat: number } | null = null;
  if (draft.silentNightMentorMode && draft.silentNightMentorTarget != null) {
    const check = canSilentNightMentorAct(
      updatedSeats,
      nextInterferenceState,
      draft.silentNightMentorMode,
      draft.silentNightMentorTarget,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    if (draft.silentNightMentorMode === 'amplify') {
      nextInterferenceState.silentNightMentorAmplifyUsed = true;
    } else {
      nextInterferenceState.silentNightMentorWeakenUsed = true;
    }
    mentorReq = { mode: draft.silentNightMentorMode, targetSeat: draft.silentNightMentorTarget };
  }

  let scholarReq: { mode: 'amplify' | 'weaken'; targetSeat: number } | null = null;
  if (draft.daylightScholarMode && draft.daylightScholarTarget != null) {
    const check = canDaylightScholarAct(
      updatedSeats,
      nextInterferenceState,
      draft.daylightScholarMode,
      draft.daylightScholarTarget,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    if (draft.daylightScholarMode === 'amplify') {
      nextInterferenceState.daylightScholarAmplifyUsed = true;
    } else {
      nextInterferenceState.daylightScholarWeakenUsed = true;
    }
    scholarReq = { mode: draft.daylightScholarMode, targetSeat: draft.daylightScholarTarget };
  }

  const mentorScholarOutcome = resolveMentorScholarInteraction(
    updatedSeats,
    mentorReq,
    scholarReq,
  );
  const weakenedSeats = new Set<number>();
  if (mentorScholarOutcome.effectiveMentor?.mode === 'weaken') {
    weakenedSeats.add(mentorScholarOutcome.effectiveMentor.targetSeat);
  }
  if (mentorScholarOutcome.effectiveScholar?.mode === 'weaken') {
    weakenedSeats.add(mentorScholarOutcome.effectiveScholar.targetSeat);
  }
  const wolfTeamWeakened = Array.from(weakenedSeats).some((seatNum) => {
    const s = updatedSeats.find((seat) => seat.seatNumber === seatNum);
    return Boolean(s && isSeatWolfFaction(s));
  });

  // 占卜師 3 格限刀 & 煉金魔女未明之霧 3 人限刀（且禁空刀）
  let fortuneAllowedSeats: number[] | null = null;
  if (draft.fortuneTellerMarkTarget !== undefined && draft.fortuneTellerMarkTarget !== null) {
    const check = canFortuneTellerMark(
      updatedSeats,
      nextInterferenceState.fortuneTellerUsed,
      draft.fortuneTellerMarkTarget,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextInterferenceState.fortuneTellerUsed = true;
    fortuneAllowedSeats = getFortuneTellerAllowedKillSeats(
      updatedSeats,
      draft.fortuneTellerMarkTarget,
    );
  }

  let alchemyFogAllowedSeats: number[] | null = null;
  if (draft.alchemyFogTargets && draft.alchemyFogTargets.length > 0) {
    const check = canAlchemyWitchUseFog(
      updatedSeats,
      nextInterferenceState.alchemyFogUsed,
      draft.alchemyFogTargets,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextInterferenceState.alchemyFogUsed = true;
    alchemyFogAllowedSeats = Array.from(new Set(draft.alchemyFogTargets));
  }

  // === 第 2 批階段 2：目標交換（魔術師／狼術師／詭術師）與反彈轉移（搗蛋鬼／蝕時狼妃／黑蝙蝠／黑夜使者） ===
  let rawMagicianPair: [number, number] | null = null;
  if (draft.magicianSwapPair) {
    const check = canMagicianSwap(updatedSeats, nextInterferenceState, draft.magicianSwapPair);
    if (!check.allowed) throw new Error(check.reason);
    if (draft.magicianSwapPair[0] !== null && draft.magicianSwapPair[1] !== null) {
      rawMagicianPair = [draft.magicianSwapPair[0], draft.magicianSwapPair[1]];
    }
  }

  let rawTricksterPair: [number, number] | null = null;
  if (draft.tricksterSwapPair) {
    const check = canTricksterWolfSwap(
      updatedSeats,
      nextInterferenceState,
      draft.tricksterSwapPair,
    );
    if (!check.allowed) throw new Error(check.reason);
    if (draft.tricksterSwapPair[0] !== null && draft.tricksterSwapPair[1] !== null) {
      rawTricksterPair = [draft.tricksterSwapPair[0], draft.tricksterSwapPair[1]];
    }
  }

  const magicianTricksterCancelled = isSameSwapPair(rawMagicianPair, rawTricksterPair);
  const effectiveMagicianPair = magicianTricksterCancelled ? null : rawMagicianPair;
  const effectiveTricksterPair = magicianTricksterCancelled ? null : rawTricksterPair;
  if (rawMagicianPair) {
    nextInterferenceState.magicianSwappedSeats.push(rawMagicianPair[0], rawMagicianPair[1]);
  }
  nextInterferenceState.lastTricksterPair = rawTricksterPair;
  nextInterferenceState.activeTricksterVoteSwap = effectiveTricksterPair;

  let effectiveWolfWarlockPair: [number, number] | null = null;
  if (draft.wolfWarlockSwapPair) {
    const check = canWolfWarlockSwap(
      updatedSeats,
      nextInterferenceState,
      draft.wolfWarlockSwapPair,
    );
    if (!check.allowed) throw new Error(check.reason);
    if (draft.wolfWarlockSwapPair[0] !== null && draft.wolfWarlockSwapPair[1] !== null) {
      effectiveWolfWarlockPair = [draft.wolfWarlockSwapPair[0], draft.wolfWarlockSwapPair[1]];
      nextInterferenceState.wolfWarlockSwappedSeats.push(
        effectiveWolfWarlockPair[0],
        effectiveWolfWarlockPair[1],
      );
    }
  }

  const swapNightTarget = (seatNum: number | null): number | null =>
    applyTargetSwaps(seatNum, [effectiveMagicianPair, effectiveWolfWarlockPair]);

  let troublemakerPrankedSeat: number | null = null;
  if (draft.troublemakerTarget !== undefined) {
    const check = canTroublemakerPrank(
      updatedSeats,
      nextInterferenceState.lastTroublemakerTarget,
      draft.troublemakerTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    troublemakerPrankedSeat = draft.troublemakerTarget ?? null;
    nextInterferenceState.lastTroublemakerTarget = troublemakerPrankedSeat;
  }

  let timeEclipseLockedSeat: number | null = null;
  if (draft.timeEclipseTarget !== undefined) {
    const check = canTimeEclipseLock(
      updatedSeats,
      nextInterferenceState,
      draft.timeEclipseTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    timeEclipseLockedSeat = draft.timeEclipseTarget ?? null;
    nextInterferenceState.lastTimeEclipseTarget = timeEclipseLockedSeat;
  }

  let blackBatShieldSeat: number | null = null;
  if (draft.blackBatTarget !== undefined) {
    const check = canBlackBatShield(
      updatedSeats,
      nextInterferenceState,
      draft.blackBatTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    blackBatShieldSeat = draft.blackBatTarget ?? null;
    nextInterferenceState.lastBlackBatTarget = blackBatShieldSeat;
  }

  let darkNightEnvoyShieldSeat: number | null = null;
  if (draft.darkNightEnvoyTarget !== undefined) {
    const check = canDarkNightEnvoyShield(
      updatedSeats,
      nextInterferenceState.lastDarkNightEnvoyTarget,
      draft.darkNightEnvoyTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    darkNightEnvoyShieldSeat = draft.darkNightEnvoyTarget ?? null;
    nextInterferenceState.lastDarkNightEnvoyTarget = darkNightEnvoyShieldSeat;
  }

  // === 第 2 批階段 3：特殊守護（流光伯爵／名媛／蠱惑師） ===
  let radiantShieldSeat: number | null = null;
  if (draft.radiantEarlTarget !== undefined) {
    const check = canRadiantEarlShield(
      updatedSeats,
      nextInterferenceState.lastRadiantEarlTarget,
      draft.radiantEarlTarget ?? null,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    radiantShieldSeat = draft.radiantEarlTarget ?? null;
    nextInterferenceState.lastRadiantEarlTarget = radiantShieldSeat;
  }

  let socialiteFavoredSeat: number | null = null;
  const aliveSocialite = updatedSeats.find(
    (s) => s.roleId === 'socialite' && s.isAlive && !s.infectedBySeedWolf,
  );
  if (
    aliveSocialite &&
    fearedSeat !== aliveSocialite.seatNumber &&
    penguinFrozenSeat !== aliveSocialite.seatNumber &&
    draft.socialiteTarget !== undefined
  ) {
    const check = canSocialiteFavor(
      updatedSeats,
      nextInterferenceState.lastSocialiteTarget,
      draft.socialiteTarget ?? null,
    );
    if (!check.allowed) throw new Error(check.reason);
    socialiteFavoredSeat = draft.socialiteTarget ?? null;
    nextInterferenceState.lastSocialiteTarget = socialiteFavoredSeat;
  }

  let enchanterTargetSeat: number | null = null;
  let enchanterConsecutiveDeath = false;
  const aliveEnchanter = updatedSeats.find(
    (s) => s.roleId === 'enchanter' && s.isAlive && !s.infectedBySeedWolf,
  );
  if (
    aliveEnchanter &&
    fearedSeat !== aliveEnchanter.seatNumber &&
    penguinFrozenSeat !== aliveEnchanter.seatNumber &&
    draft.enchanterTarget !== undefined
  ) {
    const check = canEnchanterBewitch(updatedSeats, draft.enchanterTarget ?? null);
    if (!check.allowed) throw new Error(check.reason);
    enchanterTargetSeat = draft.enchanterTarget ?? null;
    if (
      enchanterTargetSeat !== null &&
      nextInterferenceState.lastEnchanterTarget === enchanterTargetSeat
    ) {
      enchanterConsecutiveDeath = true;
    }
    nextInterferenceState.lastEnchanterTarget = enchanterTargetSeat;
  }

  // === 第 3 批前置技能：刺客／典獄長／覺醒白痴／覺醒狼美人／猩紅狼王／覺醒狼王 ===
  let assassinKillTarget: number | null = null;
  let assassinMissedBlockWolf = false;
  if (draft.assassinTarget !== undefined && draft.assassinTarget !== null) {
    const check = canAssassinAssassinate(
      updatedSeats,
      draft.assassinTarget,
      draft.assassinGuessedRoleId,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    const targetObj = updatedSeats.find((s) => s.seatNumber === draft.assassinTarget);
    if (targetObj?.roleId === draft.assassinGuessedRoleId) {
      assassinKillTarget = draft.assassinTarget;
    } else {
      assassinMissedBlockWolf = true;
    }
  }

  let wardenImmuneSeats: number[] = [];
  let wardenKilledSeat: number | null = null;
  if (draft.wardenTradePair && draft.wardenTradePair[0] !== null && draft.wardenTradePair[1] !== null) {
    const check = canWardenTrade(updatedSeats, nextCombatState, draft.wardenTradePair, round);
    if (!check.allowed) throw new Error(check.reason);
    const wardenSeat = updatedSeats.find((s) => s.roleId === 'warden_wolf' && s.isAlive);
    if (wardenSeat) {
      const pair: [number, number] = [draft.wardenTradePair[0], draft.wardenTradePair[1]];
      nextCombatState.wardenTradedSeats.push(pair[0], pair[1]);
      const outcome = evaluateWardenTrade(
        wardenSeat.seatNumber,
        pair,
        draft.wardenTradeChoices ?? ['trade', 'trade'],
      );
      wardenImmuneSeats = outcome.immuneSeats;
      wardenKilledSeat = outcome.killedSeat;
    }
  }

  let awakenedIdiotShieldTarget: number | null = null;
  const aliveAwakenedIdiot = updatedSeats.find(
    (s) => s.roleId === 'awakened_idiot' && s.isAlive && !s.infectedBySeedWolf,
  );
  if (
    aliveAwakenedIdiot &&
    !bloodMoonSealedGood &&
    draft.awakenedIdiotShieldTarget !== undefined &&
    draft.awakenedIdiotShieldTarget !== null
  ) {
    const check = canAwakenedIdiotShield(
      updatedSeats,
      nextCombatState,
      draft.awakenedIdiotShieldTarget,
    );
    if (!check.allowed) throw new Error(check.reason);
    awakenedIdiotShieldTarget = draft.awakenedIdiotShieldTarget;
  }

  const aliveAwakenedWolfBeauty = updatedSeats.find(
    (s) => s.roleId === 'awakened_wolf_beauty' && s.isAlive,
  );
  if (
    aliveAwakenedWolfBeauty &&
    draft.awakenedWolfBeautyCharmTarget !== undefined &&
    draft.awakenedWolfBeautyCharmTarget !== null
  ) {
    const check = canAwakenedWolfBeautyCharm(
      updatedSeats,
      nextCombatState,
      draft.awakenedWolfBeautyCharmTarget,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.awakenedWolfBeautyActiveCharmSeat = draft.awakenedWolfBeautyCharmTarget;
    nextCombatState.awakenedWolfBeautyLastCharmRound = round;
  }

  if (draft.scarletAttachTarget !== undefined && draft.scarletAttachTarget !== null) {
    const check = canScarletAttach(updatedSeats, nextCombatState, draft.scarletAttachTarget);
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.scarletAttachedSeats.push(draft.scarletAttachTarget);
  }

  if (
    draft.awakenedWolfKingGiveGunTarget !== undefined &&
    draft.awakenedWolfKingGiveGunTarget !== null
  ) {
    const check = canAwakenedWolfKingGiveGun(
      updatedSeats,
      nextCombatState,
      draft.awakenedWolfKingGiveGunTarget,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.awakenedWolfKingGuns -= 1;
    const t = draft.awakenedWolfKingGiveGunTarget;
    nextCombatState.wolfDistributedGuns[t] = (nextCombatState.wolfDistributedGuns[t] ?? 0) + 1;
  }

  // === 第 4 批前置：盜賊／邱比特／鬼魂新娘／尋香魅影／雙子守護／覺醒石像鬼／覺醒孤獨少女／野孩子／影子／傀儡／殭屍／百變狼王／開膛手傑克／白蛇／許仙 ===
  if (round === 1 && draft.thiefChosenRoleId) {
    const check = canThiefChooseCard(nextConversionState.thiefBottomCards, draft.thiefChosenRoleId);
    if (!check.allowed) throw new Error(check.reason);
    nextConversionState.thiefChosenRoleId = draft.thiefChosenRoleId;
    updatedSeats = updatedSeats.map((s) =>
      s.roleId === 'thief' ? { ...s, roleId: draft.thiefChosenRoleId! } : s,
    );
  }

  if (draft.cupidLoversPair && draft.cupidLoversPair[0] !== null && draft.cupidLoversPair[1] !== null) {
    const check = canCupidLink(updatedSeats, draft.cupidLoversPair, round);
    if (!check.allowed) throw new Error(check.reason);
    const pair: [number, number] = [draft.cupidLoversPair[0], draft.cupidLoversPair[1]];
    nextConversionState.cupidLovers = pair;
    nextConversionState.cupidAffiliation = evaluateCupidAffiliation(updatedSeats, pair);
  }

  if (draft.ghostBrideGroomTarget != null || draft.ghostBrideWitnessTarget != null) {
    const check = canGhostBrideChoose(
      updatedSeats,
      draft.ghostBrideGroomTarget,
      draft.ghostBrideWitnessTarget,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    if (draft.ghostBrideGroomTarget != null) {
      nextConversionState.ghostBrideGroomSeat = draft.ghostBrideGroomTarget;
    }
    if (draft.ghostBrideWitnessTarget != null) {
      nextConversionState.ghostBrideWitnessSeat = draft.ghostBrideWitnessTarget;
    }
  }

  if (
    draft.scentPhantomChainPair &&
    draft.scentPhantomChainPair[0] !== null &&
    draft.scentPhantomChainPair[1] !== null
  ) {
    const check = canScentPhantomLink(updatedSeats, nextConversionState, draft.scentPhantomChainPair);
    if (!check.allowed) throw new Error(check.reason);
    nextConversionState.scentPhantomChain = [
      draft.scentPhantomChainPair[0],
      draft.scentPhantomChainPair[1],
    ];
  }

  let twinsGuardedSeat: number | null = null;
  if (draft.twinsGuardTarget !== undefined && draft.twinsGuardTarget !== null) {
    const check = canTwinsGuard(updatedSeats, nextConversionState, draft.twinsGuardTarget, round);
    if (!check.allowed) throw new Error(check.reason);
    twinsGuardedSeat = draft.twinsGuardTarget;
    nextConversionState.twinsGuardUsed = true;
  }

  if (draft.awakenedGargoyleConvertTarget !== undefined && draft.awakenedGargoyleConvertTarget !== null) {
    const check = canAwakenedGargoyleConvert(updatedSeats, draft.awakenedGargoyleConvertTarget, round);
    if (!check.allowed) throw new Error(check.reason);
    nextConversionState.awakenedGargoyleConvertedSeat = draft.awakenedGargoyleConvertTarget;
    updatedSeats = updatedSeats.map((s) =>
      s.seatNumber === draft.awakenedGargoyleConvertTarget
        ? { ...s, convertedByAwakenedGargoyle: true }
        : s,
    );
  }

  if (round === 1 && draft.awakenedLonelyGirlIdolTarget != null) {
    nextConversionState.awakenedLonelyGirlIdolSeat = draft.awakenedLonelyGirlIdolTarget;
  }
  if (round === 1 && draft.wildChildIdolTarget != null) {
    nextConversionState.wildChildIdolSeat = draft.wildChildIdolTarget;
  }
  if (round === 1 && draft.shadowMasterTarget != null) {
    nextConversionState.shadowMasterSeat = draft.shadowMasterTarget;
    const master = updatedSeats.find((s) => s.seatNumber === draft.shadowMasterTarget);
    if (master?.roleId === 'avenger') {
      nextConversionState.shadowAvengerThirdParty = true;
      nextConversionState.avengerAlignedFaction = 'third_party';
    } else if (master) {
      nextConversionState.avengerAlignedFaction = isSeatWolfFaction(master) ? 'good' : 'wolf';
    }
  }

  if (draft.puppetTarget !== undefined && draft.puppetTarget !== null) {
    const check = canPuppetChoose(updatedSeats, draft.puppetTarget, round);
    if (!check.allowed) throw new Error(check.reason);
    nextConversionState.puppetSeat = draft.puppetTarget;
    updatedSeats = updatedSeats.map((s) =>
      s.seatNumber === draft.puppetTarget ? { ...s, isPuppetized: true } : s,
    );
  }

  if (draft.chameleonWolfTarget != null) {
    nextConversionState.chameleonWolfSeat = draft.chameleonWolfTarget;
  }

  if (
    round === 1 &&
    isJackSecondIdentityBoard(updatedSeats, input.boardId) &&
    draft.jackRipperFanaticTarget !== undefined &&
    draft.jackRipperFanaticTarget !== null
  ) {
    const check = canJackRipperSelectFanatic(
      updatedSeats,
      draft.jackRipperFanaticTarget,
      round,
      input.boardId,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextConversionState.jackRipperFanaticSeat = draft.jackRipperFanaticTarget;
    // 被選為狂熱粉的偵探，原偵探身分自動失效
    updatedSeats = updatedSeats.map((s) =>
      s.seatNumber === draft.jackRipperFanaticTarget ? { ...s, secondRoleId: 'fanatic' } : s,
    );
  }

  if (draft.zombieInfectTargets && draft.zombieInfectTargets.length > 0) {
    const check = canZombieInfect(updatedSeats, nextConversionState, draft.zombieInfectTargets);
    if (!check.allowed) throw new Error(check.reason);
    const uniqueZ = Array.from(new Set(draft.zombieInfectTargets));
    nextConversionState.zombieInfectedSeats.push(...uniqueZ);
    updatedSeats = updatedSeats.map((s) =>
      uniqueZ.includes(s.seatNumber) ? { ...s, infectedByZombie: true } : s,
    );
  }

  if (draft.xuXianBindPair && draft.xuXianBindPair[0] !== null && draft.xuXianBindPair[1] !== null) {
    const check = canXuXianBind(updatedSeats, nextConversionState, draft.xuXianBindPair);
    if (!check.allowed) throw new Error(check.reason);
    const pair: [number, number] = [draft.xuXianBindPair[0], draft.xuXianBindPair[1]];
    nextConversionState.xuXianActiveBoundPair = pair;
    nextConversionState.xuXianLastBoundPair = pair;
  }

  const isSeatBlockedByInterference = (seatNum: number): boolean => {
    const s = updatedSeats.find((seat) => seat.seatNumber === seatNum);
    if (bloodMoonSealedGood && s && !isSeatWolfFaction(s)) return true;
    return (
      fearedSeat === seatNum ||
      penguinFrozenSeat === seatNum ||
      medusaPetrifiedSeat === seatNum ||
      weakenedSeats.has(seatNum)
    );
  };

  const wolfTeamBlocked =
    wolfTeamFeared ||
    penguinFrozeWolf ||
    foxCubCharmedWolf ||
    wolfTeamWeakened ||
    assassinMissedBlockWolf;

  const isSpecialNightImmune = (seatNum: number): boolean =>
    (radiantShieldSeat !== null && seatNum === radiantShieldSeat) ||
    (darkNightEnvoyShieldSeat !== null && seatNum === darkNightEnvoyShieldSeat) ||
    wardenImmuneSeats.includes(seatNum);

  /** 若為神職技能作用於蝕時狼妃封鎖目標，或被搗蛋鬼耍寶，將目標反彈至施法者自身 */
  const redirectSkillTarget = (
    actorSeatNum: number,
    rawTarget: number | null,
    options: { isGodSkill?: boolean; allowTimeEclipse?: boolean } = {},
  ): number | null => {
    if (rawTarget === null) return null;
    let target = swapNightTarget(rawTarget);
    if (troublemakerPrankedSeat !== null && troublemakerPrankedSeat === actorSeatNum) {
      target = actorSeatNum;
    }
    if (
      options.isGodSkill &&
      options.allowTimeEclipse !== false &&
      timeEclipseLockedSeat !== null &&
      !nextInterferenceState.timeEclipseUsed &&
      target === timeEclipseLockedSeat
    ) {
      nextInterferenceState.timeEclipseUsed = true;
      target = actorSeatNum;
    }
    return target;
  };

  /** 記錄當晚對黑蝙蝠庇護目標施放技能的施法者（依順序反彈首位施法者） */
  const blackBatCasters: number[] = [];
  const trackBlackBatTarget = (actorSeatNum: number, targetSeatNum: number | null) => {
    if (
      blackBatShieldSeat !== null &&
      !nextInterferenceState.blackBatReflectUsed &&
      targetSeatNum === blackBatShieldSeat &&
      !blackBatCasters.includes(actorSeatNum)
    ) {
      blackBatCasters.push(actorSeatNum);
    }
  };

  const doKill = (seatNum: number, reason: DeathReason) => {
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      seatNum,
      reason,
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
      whiteCatRevealedSeats,
    );
  };

  // 0.5 混血兒第一晚選擇榜樣（依原文規則，夢魘恐懼混血兒無效）
  const aliveHybrid = findHybridSeat(updatedSeats);
  if (round === 1 && aliveHybrid?.isAlive && draft.hybridIdolTarget !== undefined) {
    const hybridCheck = canHybridChooseIdol(updatedSeats, draft.hybridIdolTarget, round, {
      allowSkip: true,
    });
    if (!hybridCheck.allowed) {
      throw new Error(hybridCheck.reason);
    }
    nextHybridState = applyHybridChooseIdol(nextHybridState, updatedSeats, draft.hybridIdolTarget);
  }

  // 1. 機械狼第一晚學習（在通靈師查驗前執行，使當晚通靈師查驗即可反映所學身分）
  const aliveMechWolf = findMechWolfSeat(updatedSeats);
  if (round === 1 && aliveMechWolf?.isAlive) {
    const learnCheck = canMechWolfLearn(
      updatedSeats,
      draft.mechWolfLearnTarget,
      ruleOverrides,
      round,
    );
    if (!learnCheck.allowed) {
      throw new Error(learnCheck.reason);
    }
    nextMechWolfState = applyMechWolfLearn(
      nextMechWolfState,
      updatedSeats,
      draft.mechWolfLearnTarget,
    );
  }

  // 1.5 狼女孩第一晚表白（在與狼隊見面前睜眼，必須選擇非狼人玩家）
  const aliveWolfGirl = findWolfGirlSeat(updatedSeats);
  if (round === 1 && aliveWolfGirl?.isAlive && draft.wolfGirlConfessTarget !== undefined) {
    const confessCheck = canWolfGirlConfess(updatedSeats, draft.wolfGirlConfessTarget, round, {
      allowSkip: true,
    });
    if (!confessCheck.allowed) {
      throw new Error(confessCheck.reason);
    }
    nextWolfGirlState = applyWolfGirlConfess(
      nextWolfGirlState,
      updatedSeats,
      draft.wolfGirlConfessTarget,
    );
  }

  // 1.6 盜寶大師每晚選擇底牌技能（不可連續兩晚選同技能；在通靈師查驗前套用）
  const aliveTreasureMaster = findTreasureMasterSeat(updatedSeats);
  if (aliveTreasureMaster?.isAlive && draft.treasureMasterCardRoleId !== undefined) {
    const tmCheck = canTreasureMasterChooseCard(
      nextTreasureMasterState,
      updatedSeats,
      draft.treasureMasterCardRoleId,
      { allowSkip: true },
    );
    if (!tmCheck.allowed) {
      throw new Error(tmCheck.reason);
    }
    nextTreasureMasterState = applyTreasureMasterCardChoice(
      nextTreasureMasterState,
      draft.treasureMasterCardRoleId,
    );
  }

  // 2. 守衛行動檢核（若守衛被夢魘恐懼／企鵝冰凍／梅杜莎石化／削弱／種狼感染則當晚無法守護；受搗蛋鬼／魔術師／蝕時狼妃影響轉移）
  const aliveGuard = updatedSeats.find(
    (seat) => seat.roleId === 'guard' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const guardFeared = Boolean(aliveGuard && isSeatBlockedByInterference(aliveGuard.seatNumber));
  const hasAliveGuard = Boolean(aliveGuard && !guardFeared);
  let effectiveGuardTarget: number | null = null;
  let guardTroublemakerSelfGuardDeath = false;
  if (guardFeared) {
    nextLastGuardedSeat = null;
  } else if (hasAliveGuard && aliveGuard) {
    const guardCheck = canGuardTarget(lastGuardedSeat, draft.guardTarget, updatedSeats);
    if (!guardCheck.allowed) {
      throw new Error(guardCheck.reason);
    }
    const redirectedGuard = redirectSkillTarget(aliveGuard.seatNumber, draft.guardTarget, {
      isGodSkill: true,
    });
    // 搗蛋鬼耍寶：若守衛因耍寶而連續兩晚自守，守衛出局
    if (
      troublemakerPrankedSeat === aliveGuard.seatNumber &&
      draft.guardTarget !== null &&
      lastGuardedSeat === aliveGuard.seatNumber
    ) {
      guardTroublemakerSelfGuardDeath = true;
    }
    effectiveGuardTarget = redirectedGuard;
    // 邱比特奇緣 Q&A #5：守衛守護被蝕時狼妃封鎖的目標反彈為自守時，次晚仍可自守，但不可再守原本點擊的封鎖目標
    nextLastGuardedSeat =
      timeEclipseLockedSeat !== null && draft.guardTarget === timeEclipseLockedSeat
        ? draft.guardTarget
        : effectiveGuardTarget;
    trackBlackBatTarget(aliveGuard.seatNumber, effectiveGuardTarget);
  }

  // 2.5 攝夢人行動檢核（若被夢魘恐懼則無法攝夢且重置連夢紀錄；被種狼感染則失能；受蝕時狼妃封鎖依板子區分無效或自攝）
  const aliveDreamCatcher = updatedSeats.find(
    (seat) => seat.roleId === 'dream_catcher' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const dreamCatcherFeared = Boolean(
    aliveDreamCatcher && fearedSeat === aliveDreamCatcher.seatNumber,
  );
  let dreamTarget: number | null = null;
  if (dreamCatcherFeared) {
    nextLastDreamTarget = null;
  } else if (aliveDreamCatcher) {
    const requestedDreamTarget = draft.dreamCatcherTarget ?? null;
    const dreamCheck = canDreamCatcherDream(updatedSeats, requestedDreamTarget, {
      allowSkip: true,
    });
    if (!dreamCheck.allowed) {
      throw new Error(dreamCheck.reason);
    }
    if (
      timeEclipseLockedSeat !== null &&
      requestedDreamTarget === timeEclipseLockedSeat &&
      !nextInterferenceState.timeEclipseUsed
    ) {
      nextInterferenceState.timeEclipseUsed = true;
      // 沙龍之夜：攝夢人攝夢被封鎖目標視為攝夢自己；邱比特奇緣等其餘板子：攝夢無效
      dreamTarget =
        input.boardId === '12p-salon-night' ? aliveDreamCatcher.seatNumber : null;
    } else {
      dreamTarget = requestedDreamTarget;
    }
    nextLastDreamTarget = dreamTarget;
  }

  // 2.55 覺醒攝夢人行動檢核（不可連選、不可選自己、免疫夜間傷害、不奶穿；被夢魘恐懼則重置）
  const aliveAwakenedDreamCatcher = findAwakenedDreamCatcherSeat(updatedSeats);
  const awakenedDreamActive = Boolean(
    aliveAwakenedDreamCatcher &&
      aliveAwakenedDreamCatcher.isAlive &&
      !aliveAwakenedDreamCatcher.infectedBySeedWolf,
  );
  const awakenedDreamFeared = Boolean(
    awakenedDreamActive &&
      aliveAwakenedDreamCatcher &&
      fearedSeat === aliveAwakenedDreamCatcher.seatNumber,
  );
  let awakenedDreamTarget: number | null = null;
  if (awakenedDreamFeared) {
    nextLastAwakenedDreamTarget = null;
  } else if (awakenedDreamActive && draft.awakenedDreamTarget !== undefined) {
    const reqAwakenedDream = draft.awakenedDreamTarget ?? null;
    const adcCheck = canAwakenedDreamCatcherDream(
      updatedSeats,
      lastAwakenedDreamTarget,
      reqAwakenedDream,
      { allowSkip: true },
    );
    if (!adcCheck.allowed) {
      throw new Error(adcCheck.reason);
    }
    awakenedDreamTarget = reqAwakenedDream;
    nextLastAwakenedDreamTarget = awakenedDreamTarget;
  }

  // 月靈狼每晚狼隊行動前感知左右存活鄰居是否含神職
  const moonSpiritHowl = evaluateMoonSpiritHowl(updatedSeats, fearedSeat);

  // 2.6 狼美人行動檢核（不可自刀、不可連魅；被恐懼則無法魅惑）
  const aliveWolfBeauty = updatedSeats.find(
    (seat) => seat.roleId === 'wolf_beauty' && seat.isAlive,
  );
  const wolfBeautyFeared = Boolean(
    aliveWolfBeauty &&
      (isSeatBlockedByInterference(aliveWolfBeauty.seatNumber) ||
        foxCubCharmedSeat === aliveWolfBeauty.seatNumber),
  );
  if (aliveWolfBeauty) {
    if (!wolfTeamBlocked && draft.wolfTarget === aliveWolfBeauty.seatNumber) {
      throw new Error('狼美人不可自刀');
    }
    if (wolfBeautyFeared) {
      nextLastCharmedSeat = null;
      nextActiveCharmedSeat = null;
    } else {
      const requestedCharmTarget = draft.wolfBeautyCharmTarget ?? null;
      const charmCheck = canWolfBeautyCharm(updatedSeats, lastCharmedSeat, requestedCharmTarget);
      if (!charmCheck.allowed) {
        throw new Error(charmCheck.reason);
      }
      nextLastCharmedSeat = requestedCharmTarget;
      nextActiveCharmedSeat = requestedCharmTarget;
    }
  }

  const isDreamProtected = (seatNumber: number): boolean =>
    (dreamTarget !== null && seatNumber === dreamTarget) ||
    (awakenedDreamTarget !== null && seatNumber === awakenedDreamTarget);

  // 3. 機械狼第二晚起學習技能檢核
  let mechGuardTarget: number | null = null;
  let mechExtraKillTarget: number | null = null;
  let mechPoisonTarget: number | null = null;
  let mechPsychicTarget: number | null = null;

  if (
    round >= 2 &&
    aliveMechWolf?.isAlive &&
    fearedSeat !== aliveMechWolf.seatNumber &&
    nextMechWolfState.learnedRoleId
  ) {
    const skillCheck = canMechWolfUseLearnedSkill(
      nextMechWolfState,
      updatedSeats,
      draft.mechWolfSkillTarget,
      round,
    );
    if (!skillCheck.allowed) {
      throw new Error(skillCheck.reason);
    }

    switch (nextMechWolfState.learnedRoleId) {
      case 'guard':
        mechGuardTarget = draft.mechWolfSkillTarget;
        nextMechWolfState.lastGuardedSeat = draft.mechWolfSkillTarget;
        break;
      case 'wolf':
        mechExtraKillTarget = draft.mechWolfSkillTarget;
        break;
      case 'witch':
        mechPoisonTarget = draft.mechWolfSkillTarget;
        break;
      case 'psychic':
        mechPsychicTarget = draft.mechWolfSkillTarget;
        break;
      default:
        break;
    }
  }

  // 3.5 惡靈騎士／惡魔／梅杜莎不可自刀、限刀驗證（占卜師／煉金魔女）、搗蛋鬼轉刀、魔術師換刀、名媛空刀 & 種狼感染
  let rawWolfTarget: number | null = wolfTeamBlocked ? null : draft.wolfTarget;

  // 占卜師限刀：當晚狼隊僅能從標記號碼與其左右兩側 3 人中選擇
  if (fortuneAllowedSeats && rawWolfTarget !== null && !fortuneAllowedSeats.includes(rawWolfTarget)) {
    throw new Error(
      `占卜師已發動標記，當晚狼隊僅能從 ${fortuneAllowedSeats.join('、')} 號中選擇擊殺目標`,
    );
  }
  // 煉金魔女未明之霧：當晚普通狼刀僅能從指定 3 人中選擇，且不可空刀
  if (alchemyFogAllowedSeats) {
    if (!wolfTeamBlocked && rawWolfTarget === null) {
      throw new Error('煉金魔女已發動未明之霧，當晚狼隊不可空刀');
    }
    if (rawWolfTarget !== null && !alchemyFogAllowedSeats.includes(rawWolfTarget)) {
      throw new Error(
        `煉金魔女已發動未明之霧，當晚狼隊僅能從 ${alchemyFogAllowedSeats.join('、')} 號中選擇擊殺目標`,
      );
    }
  }

  // 搗蛋鬼耍寶到狼隊成員：狼刀轉為該名被耍寶之狼人自刀
  if (
    rawWolfTarget !== null &&
    troublemakerPrankedSeat !== null &&
    isSeatWolfFaction(
      updatedSeats.find((s) => s.seatNumber === troublemakerPrankedSeat) ?? {
        seatNumber: -1,
        nickname: '',
        roleId: null,
        isAlive: false,
      },
    )
  ) {
    rawWolfTarget = troublemakerPrankedSeat;
  }

  let effectiveWolfTarget: number | null = swapNightTarget(rawWolfTarget);
  const aliveEvilKnight = findEvilKnightSeat(updatedSeats);
  if (
    aliveEvilKnight?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveEvilKnight.seatNumber &&
    rawWolfTarget === aliveEvilKnight.seatNumber
  ) {
    throw new Error('惡靈騎士不可自刀');
  }
  const aliveDemonWolf = findDemonWolfSeat(updatedSeats);
  if (
    aliveDemonWolf?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveDemonWolf.seatNumber &&
    rawWolfTarget === aliveDemonWolf.seatNumber
  ) {
    throw new Error('惡魔不可自刀');
  }
  if (
    aliveMedusa?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveMedusa.seatNumber &&
    rawWolfTarget === aliveMedusa.seatNumber
  ) {
    throw new Error('梅杜莎不可自刀');
  }
  if (
    aliveAwakenedWolfBeauty?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveAwakenedWolfBeauty.seatNumber &&
    rawWolfTarget === aliveAwakenedWolfBeauty.seatNumber
  ) {
    throw new Error('覺醒狼美人不可自刀');
  }

  // 名媛寵幸保護：只要名媛不死且寵幸者被狼刀，視為空刀（女巫不見刀口、種狼無法感染、目標不死）
  const socialiteBlockedWolfKill = Boolean(
    aliveSocialite?.isAlive &&
      socialiteFavoredSeat !== null &&
      effectiveWolfTarget !== null &&
      effectiveWolfTarget === socialiteFavoredSeat &&
      effectiveWolfTarget !== aliveSocialite.seatNumber,
  );
  if (socialiteBlockedWolfKill) {
    effectiveWolfTarget = null;
  }

  const requestedSeedInfectTarget =
    wolfTeamBlocked || socialiteBlockedWolfKill ? null : (draft.seedWolfInfectTarget ?? null);
  if (requestedSeedInfectTarget !== null) {
    const infectCheck = canSeedWolfInfect(
      updatedSeats,
      nextSeedWolfState,
      requestedSeedInfectTarget,
    );
    if (!infectCheck.allowed) {
      throw new Error(infectCheck.reason);
    }
    nextSeedWolfState.infectUsed = true;
    // 種狼開啟感染時，當晚狼刀改為感染，女巫看到空刀
    effectiveWolfTarget = null;

    const infectGuarded =
      (hasAliveGuard && effectiveGuardTarget === requestedSeedInfectTarget) ||
      mechGuardTarget === requestedSeedInfectTarget ||
      isDreamProtected(requestedSeedInfectTarget);

    if (!infectGuarded) {
      updatedSeats = updatedSeats.map((seat) =>
        seat.seatNumber === requestedSeedInfectTarget
          ? {
              ...seat,
              infectedBySeedWolf: true,
            }
          : seat,
      );
      nextSeedWolfState.infectedSeat = requestedSeedInfectTarget;
      nextHybridState = syncHybridAffiliation(nextHybridState, updatedSeats);
    }
  }

  // 4. 女巫行動檢核（解毒互斥 + 自救限制；Q&A：被白晝學者／寂夜導師削弱僅禁毒、仍可用解藥）
  const activeWitch = updatedSeats.find(
    (seat) => seat.roleId === 'witch' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const witchHardBlocked =
    !activeWitch ||
    bloodMoonSealedGood ||
    fearedSeat === activeWitch.seatNumber ||
    penguinFrozenSeat === activeWitch.seatNumber ||
    medusaPetrifiedSeat === activeWitch.seatNumber;
  const witchPoisonWeakened = Boolean(activeWitch && weakenedSeats.has(activeWitch.seatNumber));
  const effectiveWitchUseAntidote = witchHardBlocked ? false : draft.witchUseAntidote;
  const rawWitchPoisonTarget =
    witchHardBlocked || witchPoisonWeakened ? null : draft.witchPoisonTarget;
  const effectiveWitchPoisonTarget =
    activeWitch && rawWitchPoisonTarget !== null
      ? redirectSkillTarget(activeWitch.seatNumber, rawWitchPoisonTarget, { isGodSkill: true })
      : null;
  if (activeWitch && effectiveWitchPoisonTarget !== null) {
    trackBlackBatTarget(activeWitch.seatNumber, effectiveWitchPoisonTarget);
  }

  if (effectiveWitchUseAntidote && rawWitchPoisonTarget !== null) {
    throw new Error('女巫解藥與毒藥不可在同一晚同時使用');
  }
  if (effectiveWitchUseAntidote) {
    const antidoteCheck = canWitchUseAntidote(
      updatedSeats,
      round,
      effectiveWolfTarget,
      witchAntidoteUsed,
      ruleOverrides,
    );
    if (!antidoteCheck.allowed) {
      throw new Error(antidoteCheck.reason);
    }
    nextWitchAntidoteUsed = true;
  }
  if (rawWitchPoisonTarget !== null) {
    const poisonCheck = canWitchUsePoison(
      updatedSeats,
      effectiveWitchUseAntidote,
      rawWitchPoisonTarget,
      witchPoisonUsed,
    );
    if (!poisonCheck.allowed) {
      throw new Error(poisonCheck.reason);
    }
    nextWitchPoisonUsed = true;
  }

  // 4.2 覺醒女巫行動檢核（1 解藥 + 3 瓶需協助者投票同意之毒藥）
  const activeAwakenedWitch = updatedSeats.find(
    (seat) => seat.roleId === 'awakened_witch' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const awBlocked =
    !activeAwakenedWitch || isSeatBlockedByInterference(activeAwakenedWitch.seatNumber);
  const effectiveAwUseAntidote = awBlocked ? false : Boolean(draft.awakenedWitchUseAntidote);
  const rawAwPoisonTarget = awBlocked ? null : (draft.awakenedWitchPoisonTarget ?? null);
  let effectiveAwPoisonTarget: number | null = null;
  if (effectiveAwUseAntidote) {
    const check = canAwakenedWitchUseAntidote(
      updatedSeats,
      round,
      effectiveWolfTarget,
      nextInterferenceState.awakenedWitchAntidoteUsed,
      ruleOverrides,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextInterferenceState.awakenedWitchAntidoteUsed = true;
  }
  if (rawAwPoisonTarget !== null && activeAwakenedWitch) {
    const helpers = draft.awakenedWitchHelpers ?? [];
    const check = canAwakenedWitchUsePoison(
      updatedSeats,
      nextInterferenceState,
      effectiveAwUseAntidote,
      rawAwPoisonTarget,
      helpers,
    );
    if (!check.allowed) throw new Error(check.reason);
    // 無論協助者是否反對，皆消耗一次毒藥與協助者名額
    nextInterferenceState.awakenedWitchPoisonsUsed += 1;
    nextInterferenceState.awakenedWitchUsedHelpers.push(...helpers);
    if (draft.awakenedWitchHelpersApproved !== false) {
      effectiveAwPoisonTarget = redirectSkillTarget(
        activeAwakenedWitch.seatNumber,
        rawAwPoisonTarget,
        { isGodSkill: true },
      );
      trackBlackBatTarget(activeAwakenedWitch.seatNumber, effectiveAwPoisonTarget);
    }
  }

  // 4.5 毒師行動檢核（僅 1 瓶毒藥；被恐懼或被感染則無法用毒）
  const activePoisoner = updatedSeats.find(
    (seat) => seat.roleId === 'poisoner' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const poisonerBlocked = !activePoisoner || fearedSeat === activePoisoner.seatNumber;
  const requestedPoisonerTarget = poisonerBlocked ? null : (draft.poisonerTarget ?? null);
  if (requestedPoisonerTarget !== null) {
    const poisonerCheck = canPoisonerUsePoison(
      updatedSeats,
      requestedPoisonerTarget,
      poisonerPoisonUsed,
    );
    if (!poisonerCheck.allowed) {
      throw new Error(poisonerCheck.reason);
    }
    nextPoisonerPoisonUsed = true;
  }

  // 5. 狼刀階段結算（含夢遊者／咒狐免疫狼刀、同守同救奶穿、機械狼雙刀、自爆狼點刀後死亡、盜寶蒙面狼放逐免死隔夜點刀後死亡）
  const wolfTargetSeatObj =
    effectiveWolfTarget !== null
      ? updatedSeats.find((s) => s.seatNumber === effectiveWolfTarget)
      : undefined;
  const wolfTargetIsCursedFox = isCursedFoxSeat(wolfTargetSeatObj);

  const anyAntidoteUsed = effectiveWitchUseAntidote || effectiveAwUseAntidote;

  if (allWolvesAsleepTonight) {
    effectiveWolfTarget = null;
  }

  const luckyShieldSeat =
    draft.luckyItemActorSeat != null &&
    draft.luckyItemTargetSeat != null &&
    nextThirdPartySpecialState.miracleLuckySeat === draft.luckyItemActorSeat &&
    nextThirdPartySpecialState.miracleLuckyItem === 'guard_shield' &&
    !nextThirdPartySpecialState.miracleLuckyItemUsed &&
    isLuckySkillAllowedOnRound('miracle', 'guard_shield', round, ruleOverrides)
      ? draft.luckyItemTargetSeat
      : null;

  const mediumShieldEntry =
    draft.mediumSkillActionSeat != null && draft.mediumSkillTargetSeat != null
      ? nextThirdPartySpecialState.mediumInheritedHeirs.find(
          (h) =>
            h.heirSeat === draft.mediumSkillActionSeat &&
            h.skill === 'guard_shield' &&
            !h.used &&
            h.receivedRound < round,
        )
      : undefined;
  const mediumShieldSeat = mediumShieldEntry ? (draft.mediumSkillTargetSeat ?? null) : null;

  if (
    effectiveWolfTarget !== null &&
    !isDreamProtected(effectiveWolfTarget) &&
    !isSpecialNightImmune(effectiveWolfTarget) &&
    !wolfTargetIsCursedFox
  ) {
    const guardedByNormal =
      (hasAliveGuard && effectiveGuardTarget === effectiveWolfTarget) ||
      twinsGuardedSeat === effectiveWolfTarget ||
      luckyShieldSeat === effectiveWolfTarget ||
      mediumShieldSeat === effectiveWolfTarget ||
      happySheepGuardedSeat === effectiveWolfTarget ||
      (draft.butlerGuardSecondTarget != null &&
        draft.butlerGuardSecondTarget === effectiveWolfTarget);
    const guardedByMech = mechGuardTarget === effectiveWolfTarget;
    const isGuarded = guardedByNormal || guardedByMech;

    if (anyAntidoteUsed && isGuarded) {
      doKill(effectiveWolfTarget, 'milk_pierce');
    } else if (!anyAntidoteUsed && !isGuarded) {
      doKill(effectiveWolfTarget, 'wolf_kill');
    }
  }

  if (mechExtraKillTarget !== null && !isDreamProtected(mechExtraKillTarget)) {
    const guardedByNormal = hasAliveGuard && effectiveGuardTarget === mechExtraKillTarget;
    if (!guardedByNormal) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        mechExtraKillTarget,
        'mech_wolf_kill',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

  if (pendingSelfExplodeSeat !== null) {
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      pendingSelfExplodeSeat,
      'self_explode',
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
    );
  }

  if (nextTreasureMasterState.pendingExileDeathNextNight && aliveTreasureMaster?.isAlive) {
    nextTreasureMasterState.pendingExileDeathNextNight = false;
    doKill(aliveTreasureMaster.seatNumber, 'treasure_master_exile_delayed');
  }

  // 血月使徒最後一狼被放逐免死：隔夜復仇刀後正式出局
  const survivedBloodMoon = updatedSeats.find(
    (s) => s.isAlive && s.roleId === 'blood_moon_apostle' && s.bloodMoonExileSurvived,
  );
  if (survivedBloodMoon) {
    nextCombatState.bloodMoonPendingExileDeathNextNight = false;
    doKill(survivedBloodMoon.seatNumber, 'blood_moon_exile_delayed');
  }

  // 第 3 批狼陣營額外刀口（刺客刺殺／狼鴉之爪無敵刀／狼弟覺醒無敵刀／大灰狼單刀／大野狼額外刀／阿努比斯天平／典獄長交易）
  if (assassinKillTarget !== null && !isDreamProtected(assassinKillTarget) && !isSpecialNightImmune(assassinKillTarget)) {
    doKill(assassinKillTarget, 'assassin_wolf_kill');
  }

  if (draft.wolfRavenClawKillTarget !== undefined && draft.wolfRavenClawKillTarget !== null) {
    const check = canWolfRavenClawKill(updatedSeats, nextCombatState, draft.wolfRavenClawKillTarget);
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.wolfRavenClawInvincibleUsed = true;
    if (!isDreamProtected(draft.wolfRavenClawKillTarget) && !isSpecialNightImmune(draft.wolfRavenClawKillTarget)) {
      doKill(draft.wolfRavenClawKillTarget, 'wolf_raven_claw_kill');
    }
  }

  if (
    draft.wolfYoungerBrotherKillTarget !== undefined &&
    draft.wolfYoungerBrotherKillTarget !== null
  ) {
    const check = canWolfYoungerBrotherAwakenedKill(
      updatedSeats,
      nextCombatState,
      draft.wolfYoungerBrotherKillTarget,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.wolfYoungerBrotherAwakenedKillUsed = true;
    if (
      !isDreamProtected(draft.wolfYoungerBrotherKillTarget) &&
      !isSpecialNightImmune(draft.wolfYoungerBrotherKillTarget)
    ) {
      doKill(draft.wolfYoungerBrotherKillTarget, 'wolf_younger_brother_kill');
    }
  }

  if (draft.bigGreyWolfKillTarget !== undefined && draft.bigGreyWolfKillTarget !== null) {
    const check = canBigGreyWolfKill(
      updatedSeats,
      nextCombatState,
      draft.bigGreyWolfKillTarget,
      round,
      fortuneAllowedSeats,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.bigGreyWolfKillUsed = true;
    if (
      !isDreamProtected(draft.bigGreyWolfKillTarget) &&
      !isSpecialNightImmune(draft.bigGreyWolfKillTarget)
    ) {
      doKill(draft.bigGreyWolfKillTarget, 'big_grey_wolf_kill');
    }
  }

  if (draft.bigBadWolfKillTarget !== undefined && draft.bigBadWolfKillTarget !== null) {
    const check = canBigBadWolfExtraKill(updatedSeats, draft.bigBadWolfKillTarget);
    if (!check.allowed) throw new Error(check.reason);
    if (
      !isDreamProtected(draft.bigBadWolfKillTarget) &&
      !isSpecialNightImmune(draft.bigBadWolfKillTarget) &&
      !(hasAliveGuard && effectiveGuardTarget === draft.bigBadWolfKillTarget)
    ) {
      doKill(draft.bigBadWolfKillTarget, 'big_bad_wolf_kill');
    }
  }

  if (draft.anubisDeadSeat != null && draft.anubisAliveSeat != null) {
    const check = canAnubisScale(
      updatedSeats,
      nextCombatState,
      draft.anubisDeadSeat,
      draft.anubisAliveSeat,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.anubisUsedSeats.push(draft.anubisDeadSeat, draft.anubisAliveSeat);
    const deadObj = updatedSeats.find((s) => s.seatNumber === draft.anubisDeadSeat)!;
    const aliveObj = updatedSeats.find((s) => s.seatNumber === draft.anubisAliveSeat)!;
    const anubisSeat = updatedSeats.find((s) => s.roleId === 'anubis' && s.isAlive);
    if (evaluateAnubisScaleWins(deadObj, aliveObj)) {
      if (!isDreamProtected(aliveObj.seatNumber) && !isSpecialNightImmune(aliveObj.seatNumber)) {
        doKill(aliveObj.seatNumber, 'anubis_scale_kill');
      }
    } else if (anubisSeat) {
      doKill(anubisSeat.seatNumber, 'anubis_scale_backfire');
    }
  }

  if (wardenKilledSeat !== null) {
    doKill(wardenKilledSeat, 'warden_trade_death');
  }

  // 6. 查驗資訊（預言家 / 通靈師 / 機械狼學通靈師；若遭夢魘恐懼或當晚被種狼感染則無法查驗）
  const seerSeatObj = initialSeats.find(
    (seat) => seat.roleId === 'seer' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const seerInfectedTonight = Boolean(
    seerSeatObj &&
      updatedSeats.find((s) => s.seatNumber === seerSeatObj.seatNumber)?.infectedBySeedWolf,
  );
  const seerBlocked =
    !seerSeatObj || isSeatBlockedByInterference(seerSeatObj.seatNumber) || seerInfectedTonight;
  const effectiveSeerTarget =
    seerBlocked || !seerSeatObj
      ? null
      : redirectSkillTarget(seerSeatObj.seatNumber, draft.seerCheckTarget, { isGodSkill: true });
  if (seerSeatObj && effectiveSeerTarget !== null) {
    trackBlackBatTarget(seerSeatObj.seatNumber, effectiveSeerTarget);
  }
  const seerResult =
    effectiveSeerTarget !== null ? getSeerCheckResult(updatedSeats, effectiveSeerTarget) : null;

  const psychicSeatObj = initialSeats.find(
    (seat) => seat.roleId === 'psychic' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const psychicInfectedTonight = Boolean(
    psychicSeatObj &&
      updatedSeats.find((s) => s.seatNumber === psychicSeatObj.seatNumber)?.infectedBySeedWolf,
  );
  const psychicBlocked =
    !psychicSeatObj || fearedSeat === psychicSeatObj.seatNumber || psychicInfectedTonight;
  const effectivePsychicTarget = psychicBlocked ? null : draft.psychicCheckTarget;
  const psychicResult =
    effectivePsychicTarget !== null
      ? getPsychicCheckResult(
          updatedSeats,
          nextMechWolfState,
          effectivePsychicTarget,
          nextTreasureMasterState,
        )
      : null;

  const mechWolfPsychicResult =
    mechPsychicTarget !== null
      ? getPsychicCheckResult(
          updatedSeats,
          nextMechWolfState,
          mechPsychicTarget,
          nextTreasureMasterState,
        )
      : null;

  // 6.5 第 1 批查驗與資訊感知類角色結算
  const isRoleBlocked = (roleId: string): { seat: PlayerSeat | undefined; blocked: boolean } => {
    const seatObj = initialSeats.find(
      (s) => s.roleId === roleId && s.isAlive && !s.infectedBySeedWolf,
    );
    const infectedTonight = Boolean(
      seatObj && updatedSeats.find((s) => s.seatNumber === seatObj.seatNumber)?.infectedBySeedWolf,
    );
    return {
      seat: seatObj,
      blocked: !seatObj || fearedSeat === seatObj.seatNumber || infectedTonight,
    };
  };

  // 覺醒預言家（雙目標陣營查驗）
  const awakenedSeerCheck = isRoleBlocked('awakened_seer');
  const rawAwakenedTargets = draft.awakenedSeerTargets;
  const effectiveAwakenedSeerTargets: [number, number] | null =
    !awakenedSeerCheck.blocked &&
    rawAwakenedTargets &&
    rawAwakenedTargets[0] !== null &&
    rawAwakenedTargets[1] !== null
      ? [rawAwakenedTargets[0], rawAwakenedTargets[1]]
      : null;
  const awakenedSeerResult = effectiveAwakenedSeerTargets
    ? getAwakenedSeerCheckResult(updatedSeats, effectiveAwakenedSeerTargets)
    : null;

  // 燈影預言家（相反結果陣營查驗）
  const lanternSeerCheck = isRoleBlocked('lantern_seer');
  const effectiveLanternTarget = lanternSeerCheck.blocked
    ? null
    : (draft.lanternSeerCheckTarget ?? null);
  const lanternSeerResult =
    effectiveLanternTarget !== null
      ? getLanternSeerCheckResult(updatedSeats, effectiveLanternTarget)
      : null;

  // 酒鬼預言家（隨機或法官手動覆寫結果）
  const drunkSeerCheck = isRoleBlocked('drunk_seer');
  const effectiveDrunkTarget = drunkSeerCheck.blocked
    ? null
    : (draft.drunkSeerCheckTarget ?? null);
  const drunkSeerResult =
    effectiveDrunkTarget !== null
      ? getDrunkSeerCheckResult(updatedSeats, effectiveDrunkTarget, {
          manualOverride: draft.drunkSeerManualResult ?? null,
          rng,
        })
      : null;

  // 愚言家（標準陣營查驗）
  const foolSeerCheck = isRoleBlocked('fool_seer');
  const effectiveFoolTarget = foolSeerCheck.blocked ? null : (draft.foolSeerCheckTarget ?? null);
  const foolSeerResult =
    effectiveFoolTarget !== null ? getFoolSeerCheckResult(updatedSeats, effectiveFoolTarget) : null;

  // 狐狸（目標＋左右鄰居 3 人查驗，全好人永久失能）
  const foxCheck = isRoleBlocked('fox');
  const effectiveFoxTarget =
    foxCheck.blocked || nextFoxLostAbility ? null : (draft.foxCheckTarget ?? null);
  const foxResult =
    effectiveFoxTarget !== null
      ? getFoxCheckResult(updatedSeats, effectiveFoxTarget, nextFoxLostAbility)
      : null;
  if (foxResult?.lostAbility) {
    nextFoxLostAbility = true;
  }

  // 石像鬼（具體底牌查驗＋歷史紀錄保存供南瓜鬼繼承）
  const gargoyleSeatObj = findGargoyleSeat(initialSeats);
  const gargoyleBlocked =
    !gargoyleSeatObj || !gargoyleSeatObj.isAlive || fearedSeat === gargoyleSeatObj.seatNumber;
  const effectiveGargoyleTarget = gargoyleBlocked ? null : (draft.gargoyleCheckTarget ?? null);
  const gargoyleResult =
    effectiveGargoyleTarget !== null
      ? getGargoyleCheckResult(
          updatedSeats,
          nextMechWolfState,
          effectiveGargoyleTarget,
          nextTreasureMasterState,
        )
      : null;
  if (gargoyleResult) {
    nextGargoyleState.checkHistory.push({
      round,
      targetSeat: gargoyleResult.targetSeat,
      perceivedRoleId: gargoyleResult.perceivedRoleId,
    });
  }

  // 狼巫（具體底牌查驗，第 2 晚起驗純白之女致死）
  const wolfWitchSeatObj = initialSeats.find((s) => s.roleId === 'wolf_witch' && s.isAlive);
  const wolfWitchBlocked = !wolfWitchSeatObj || fearedSeat === wolfWitchSeatObj.seatNumber;
  const effectiveWolfWitchTarget = wolfWitchBlocked ? null : (draft.wolfWitchCheckTarget ?? null);
  const wolfWitchResult =
    effectiveWolfWitchTarget !== null
      ? getWolfWitchCheckResult(
          updatedSeats,
          nextMechWolfState,
          effectiveWolfWitchTarget,
          nextTreasureMasterState,
        )
      : null;

  // 純白之女（具體底牌查驗，第 2 晚起驗狼人致死）
  const pureWhiteCheck = isRoleBlocked('pure_white_maiden');
  const effectivePureWhiteTarget = pureWhiteCheck.blocked
    ? null
    : (draft.pureWhiteCheckTarget ?? null);
  const pureWhiteResult =
    effectivePureWhiteTarget !== null
      ? getPureWhiteCheckResult(
          updatedSeats,
          nextMechWolfState,
          effectivePureWhiteTarget,
          nextTreasureMasterState,
        )
      : null;

  // 惡魔（非狼目標神職／平民查驗）
  const demonWolfBlocked =
    !aliveDemonWolf || !aliveDemonWolf.isAlive || fearedSeat === aliveDemonWolf.seatNumber;
  const effectiveDemonWolfTarget = demonWolfBlocked ? null : (draft.demonWolfCheckTarget ?? null);
  let demonWolfResult = null;
  if (effectiveDemonWolfTarget !== null) {
    const demonCheck = canDemonWolfCheck(updatedSeats, effectiveDemonWolfTarget);
    if (!demonCheck.allowed) {
      throw new Error(demonCheck.reason);
    }
    demonWolfResult = getDemonWolfCheckResult(updatedSeats, effectiveDemonWolfTarget);
  }

  // 南瓜鬼（石像鬼出局繼承後可查驗具體底牌）
  const pumpkinGhostSeatObj = findPumpkinGhostSeat(initialSeats);
  const pumpkinGhostBlocked =
    !pumpkinGhostSeatObj ||
    !pumpkinGhostSeatObj.isAlive ||
    !nextPumpkinGhostState.hasInherited ||
    fearedSeat === pumpkinGhostSeatObj.seatNumber;
  const effectivePumpkinGhostTarget = pumpkinGhostBlocked
    ? null
    : (draft.pumpkinGhostCheckTarget ?? null);
  const pumpkinGhostResult =
    effectivePumpkinGhostTarget !== null
      ? getPumpkinGhostCheckResult(
          updatedSeats,
          nextPumpkinGhostState,
          nextMechWolfState,
          effectivePumpkinGhostTarget,
          nextTreasureMasterState,
        )
      : null;

  // 守墓人／超級守墓人（墓地放逐陣營資訊＋超級守墓人選繼承者）
  const hasGravekeeperRole = Boolean(
    findGravekeeperSeat(initialSeats) || findSuperGravekeeperSeat(initialSeats),
  );
  const gravekeeperResult = hasGravekeeperRole
    ? getGravekeeperExileResult(exiledHistory, round)
    : null;

  const superGravekeeperCheck = isRoleBlocked('super_gravekeeper');
  if (!superGravekeeperCheck.blocked && draft.superGravekeeperHeirTarget !== undefined) {
    const heirCheck = canSuperGravekeeperChooseHeir(
      updatedSeats,
      draft.superGravekeeperHeirTarget ?? null,
    );
    if (!heirCheck.allowed) {
      throw new Error(heirCheck.reason);
    }
    nextSuperGravekeeperState.heirSeat = draft.superGravekeeperHeirTarget ?? null;
    if (superGravekeeperCheck.seat) {
      nextSuperGravekeeperState.superGravekeeperSeat = superGravekeeperCheck.seat.seatNumber;
    }
  }

  // 7. 狼刀在先判定：若狼刀階段（含種狼感染轉化）已達狼人勝利條件，直接判狼人勝利（優先於女巫與毒師毒藥）
  if (ruleOverrides.wolfKillPriority) {
    const wolfPhaseVictory = checkVictory(updatedSeats, ruleOverrides, nextTreasureMasterState, {
      conversionState: nextConversionState,
      thirdPartySpecialState: nextThirdPartySpecialState,
      boardId: input.boardId,
    });
    if (wolfPhaseVictory.winner === 'wolf' || wolfPhaseVictory.winner === 'third_party') {
      nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, nextMechWolfState);
      nextTreasureMasterState = syncTreasureMasterTeamStatus(updatedSeats, nextTreasureMasterState);
      nextHiddenWolfState = syncHiddenWolfTeamStatus(updatedSeats, nextHiddenWolfState);
      nextHybridState = syncHybridAffiliation(nextHybridState, updatedSeats);
      nextGargoyleState = syncGargoyleTeamStatus(updatedSeats, nextGargoyleState);
      nextPumpkinGhostState = syncPumpkinGhostInheritance(
        updatedSeats,
        nextGargoyleState,
        nextPumpkinGhostState,
      );
      nextSuperGravekeeperState = syncSuperGravekeeperInheritance(
        updatedSeats,
        nextSuperGravekeeperState,
      );
      return {
        seats: updatedSeats,
        deaths,
        witchAntidoteUsed: nextWitchAntidoteUsed,
        witchPoisonUsed: nextWitchPoisonUsed,
        poisonerPoisonUsed: nextPoisonerPoisonUsed,
        lastGuardedSeat: nextLastGuardedSeat,
        mechWolfState: nextMechWolfState,
        pendingSelfExplodeSeat: null,
        lastCharmedSeat: nextLastCharmedSeat,
        activeCharmedSeat: nextActiveCharmedSeat,
        lastDreamTarget: nextLastDreamTarget,
        wolfGirlState: nextWolfGirlState,
        treasureMasterState: nextTreasureMasterState,
        lastFearedSeat: nextLastFearedSeat,
        evilKnightCounterUsed: nextEvilKnightCounterUsed,
        hybridState: nextHybridState,
        seedWolfState: nextSeedWolfState,
        hiddenWolfState: nextHiddenWolfState,
        gargoyleState: nextGargoyleState,
        pumpkinGhostState: nextPumpkinGhostState,
        superGravekeeperState: nextSuperGravekeeperState,
        foxLostAbility: nextFoxLostAbility,
        lastAwakenedDreamTarget: nextLastAwakenedDreamTarget,
        interferenceState: nextInterferenceState,
        combatState: nextCombatState,
        conversionState: nextConversionState,
        thirdPartySpecialState: nextThirdPartySpecialState,
        finalBatchState: nextFinalBatchState,
        whiteCatRevealedSeats,
        maskedDelayedSeats,
        bearRoar: evaluateBearRoar(updatedSeats, nextMechWolfState, fearedSeat),
        moonSpiritHowl,
        nineTailedFoxResult: evaluateNineTailedFoxTails(updatedSeats, round),
        seniorVillagerReveal: evaluateSeniorVillagerReveal(updatedSeats, round),
        seerResult,
        psychicResult,
        mechWolfPsychicResult,
        awakenedSeerResult,
        lanternSeerResult,
        drunkSeerResult,
        foolSeerResult,
        foxResult,
        gargoyleResult,
        wolfWitchResult,
        pureWhiteResult,
        demonWolfResult,
        pumpkinGhostResult,
        gravekeeperResult,
        awakenedDreamResult: null,
        shootEligibilities: [],
        victory: wolfPhaseVictory,
      };
    }
  }

  // 8. 毒藥階段結算（普通守衛不防毒；機械狼學守衛之機械盾可防毒藥；夢遊者、惡靈騎士與惡魔免疫夜間毒藥）
  const isEvilKnightSeat = (seatNumber: number): boolean =>
    Boolean(aliveEvilKnight?.isAlive && seatNumber === aliveEvilKnight.seatNumber);
  const isDemonWolfSeat = (seatNumber: number): boolean =>
    Boolean(aliveDemonWolf?.isAlive && seatNumber === aliveDemonWolf.seatNumber);

  const witchTargetedEvilKnight =
    effectiveWitchPoisonTarget !== null && isEvilKnightSeat(effectiveWitchPoisonTarget);
  const seerTargetedEvilKnight =
    effectiveSeerTarget !== null && isEvilKnightSeat(effectiveSeerTarget);

  if (
    effectiveWitchPoisonTarget !== null &&
    !isDreamProtected(effectiveWitchPoisonTarget) &&
    !isSpecialNightImmune(effectiveWitchPoisonTarget) &&
    !witchTargetedEvilKnight &&
    !isDemonWolfSeat(effectiveWitchPoisonTarget)
  ) {
    // 梅杜莎石化反彈女巫毒藥
    if (medusaPetrifiedSeat !== null && effectiveWitchPoisonTarget === medusaPetrifiedSeat && activeWitch) {
      doKill(activeWitch.seatNumber, 'medusa_poison_reflect');
    } else {
      const blockedByMechShield = mechGuardTarget === effectiveWitchPoisonTarget;
      if (!blockedByMechShield) {
        doKill(effectiveWitchPoisonTarget, 'witch_poison');
      }
    }
  }

  if (
    effectiveAwPoisonTarget !== null &&
    !isDreamProtected(effectiveAwPoisonTarget) &&
    !isSpecialNightImmune(effectiveAwPoisonTarget) &&
    !isEvilKnightSeat(effectiveAwPoisonTarget) &&
    !isDemonWolfSeat(effectiveAwPoisonTarget)
  ) {
    if (medusaPetrifiedSeat !== null && effectiveAwPoisonTarget === medusaPetrifiedSeat && activeAwakenedWitch) {
      doKill(activeAwakenedWitch.seatNumber, 'medusa_poison_reflect');
    } else {
      doKill(effectiveAwPoisonTarget, 'awakened_witch_poison');
    }
  }

  if (
    requestedPoisonerTarget !== null &&
    !isDreamProtected(requestedPoisonerTarget) &&
    !isEvilKnightSeat(requestedPoisonerTarget) &&
    !isDemonWolfSeat(requestedPoisonerTarget)
  ) {
    const blockedByMechShield = mechGuardTarget === requestedPoisonerTarget;
    if (!blockedByMechShield) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        requestedPoisonerTarget,
        'poisoner_poison',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

  if (mechPoisonTarget !== null) {
    nextMechWolfState.usedLearnedOneShotSkill = true;
    if (
      !isDreamProtected(mechPoisonTarget) &&
      !isEvilKnightSeat(mechPoisonTarget) &&
      !isDemonWolfSeat(mechPoisonTarget)
    ) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        mechPoisonTarget,
        'mech_wolf_poison',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

  // 8.2 惡靈騎士一次性反傷結算（同晚同毒同驗則先行動者遭到反傷；守衛無法擋反傷）
  if (
    aliveEvilKnight?.isAlive &&
    !nextEvilKnightCounterUsed &&
    (witchTargetedEvilKnight || seerTargetedEvilKnight)
  ) {
    let counterVictimSeat: number | null = null;
    if (witchTargetedEvilKnight && seerTargetedEvilKnight) {
      counterVictimSeat = seerActsBeforeWitch
        ? (seerSeatObj?.seatNumber ?? null)
        : (activeWitch?.seatNumber ?? null);
    } else if (witchTargetedEvilKnight) {
      counterVictimSeat = activeWitch?.seatNumber ?? null;
    } else if (seerTargetedEvilKnight) {
      counterVictimSeat = seerSeatObj?.seatNumber ?? null;
    }

    if (counterVictimSeat !== null) {
      nextEvilKnightCounterUsed = true;
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        counterVictimSeat,
        'evil_knight_counter',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

  // 8.3 第 1 批查驗致死與被動結算（狼巫驗殺純白之女、純白之女驗殺狼人、咒狐被陣營驗死、九尾狐無尾死、覺醒攝夢人夢語出局）
  let cursedFoxDiedTonight = false;

  if (
    effectiveWolfWitchTarget !== null &&
    doesWolfWitchKillTarget(updatedSeats, effectiveWolfWitchTarget, round) &&
    !isDreamProtected(effectiveWolfWitchTarget)
  ) {
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      effectiveWolfWitchTarget,
      'wolf_witch_check_kill',
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
    );
  }

  if (
    effectivePureWhiteTarget !== null &&
    doesPureWhiteKillTarget(updatedSeats, nextMechWolfState, effectivePureWhiteTarget, round) &&
    !isDreamProtected(effectivePureWhiteTarget)
  ) {
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      effectivePureWhiteTarget,
      'pure_white_check_kill',
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
    );
  }

  // 咒狐被預言家／覺醒預言家／愚言家查驗致死（被攝夢／覺醒攝夢保護者不死）
  const factionCheckedSeats = new Set<number>();
  if (effectiveSeerTarget !== null) factionCheckedSeats.add(effectiveSeerTarget);
  if (effectiveFoolTarget !== null) factionCheckedSeats.add(effectiveFoolTarget);
  if (effectiveAwakenedSeerTargets) {
    factionCheckedSeats.add(effectiveAwakenedSeerTargets[0]);
    factionCheckedSeats.add(effectiveAwakenedSeerTargets[1]);
  }
  for (const checkedSeatNum of factionCheckedSeats) {
    const seatObj = updatedSeats.find((s) => s.seatNumber === checkedSeatNum);
    if (seatObj?.isAlive && isCursedFoxSeat(seatObj) && !isDreamProtected(checkedSeatNum)) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        checkedSeatNum,
        'cursed_fox_checked',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
      cursedFoxDiedTonight = true;
    }
  }

  // 九尾狐當晚最後檢查剩餘尾巴（僅計算前幾回合已公布死亡，不含當晚尚未公布之死訊）
  const nineTailedFoxResult = evaluateNineTailedFoxTails(updatedSeats, round);
  if (nineTailedFoxResult.diedFromNoTails && nineTailedFoxResult.seatNumber !== null) {
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      nineTailedFoxResult.seatNumber,
      'nine_tailed_fox_no_tails',
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
    );
  }

  // 覺醒攝夢人當晚最後判定夢語者是否行動，第二晚起可選擇使其出局（無法發動技能）
  let awakenedDreamResult = null;
  if (awakenedDreamActive && !awakenedDreamFeared && awakenedDreamTarget !== null) {
    awakenedDreamResult = evaluateAwakenedDreamTargetActed(
      initialSeats,
      awakenedDreamTarget,
      draft,
      round,
      fearedSeat,
    );
    if (awakenedDreamResult.killedByDream) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        awakenedDreamTarget,
        'awakened_dream_catcher_kill',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

  // 8.5 攝夢人連夢致死與夜死牽連共死（出局之夢遊者無法發動技能；流光伯爵庇護可免疫連夢與共死）
  if (aliveDreamCatcher && dreamTarget !== null) {
    const isConsecutiveDream = lastDreamTarget !== null && dreamTarget === lastDreamTarget;
    const dreamCatcherNow = updatedSeats.find(
      (seat) => seat.seatNumber === aliveDreamCatcher.seatNumber,
    );
    const dreamCatcherDiedTonight = dreamCatcherNow ? !dreamCatcherNow.isAlive : false;

    if (isConsecutiveDream) {
      if (darkNightEnvoyShieldSeat !== null && dreamTarget === darkNightEnvoyShieldSeat) {
        doKill(aliveDreamCatcher.seatNumber, 'dark_night_envoy_counter');
      } else if (!isSpecialNightImmune(dreamTarget)) {
        doKill(dreamTarget, 'dream_catcher_consecutive');
      }
    } else if (dreamCatcherDiedTonight && !isSpecialNightImmune(dreamTarget)) {
      doKill(dreamTarget, 'dream_catcher_link');
    }
  }

  // 8.55 第 2 批反傷、衝突、替死、連帶與禁言結算
  if (guardTroublemakerSelfGuardDeath && aliveGuard) {
    doKill(aliveGuard.seatNumber, 'troublemaker_self_guard');
  }

  if (mentorScholarOutcome.clashDeathSeat !== null) {
    doKill(mentorScholarOutcome.clashDeathSeat, 'mentor_scholar_clash');
  }

  // 黑蝙蝠一次性反彈：首位對被庇護者施放技能的玩家死亡
  if (blackBatCasters.length > 0 && !nextInterferenceState.blackBatReflectUsed) {
    nextInterferenceState.blackBatReflectUsed = true;
    doKill(blackBatCasters[0], 'black_bat_reflect');
  }

  // 黑夜使者庇護反殺：反殺當晚所有對被庇護狼人查驗或潑毒的玩家
  if (darkNightEnvoyShieldSeat !== null) {
    if (effectiveSeerTarget === darkNightEnvoyShieldSeat && seerSeatObj) {
      doKill(seerSeatObj.seatNumber, 'dark_night_envoy_counter');
    }
    if (effectiveWitchPoisonTarget === darkNightEnvoyShieldSeat && activeWitch) {
      doKill(activeWitch.seatNumber, 'dark_night_envoy_counter');
    }
    if (effectiveAwPoisonTarget === darkNightEnvoyShieldSeat && activeAwakenedWitch) {
      doKill(activeAwakenedWitch.seatNumber, 'dark_night_envoy_counter');
    }
  }

  // 蠱惑師替死與連蠱致死
  if (aliveEnchanter && enchanterTargetSeat !== null) {
    const enchanterDeathIdx = deaths.findIndex((d) => d.seat === aliveEnchanter.seatNumber);
    if (enchanterDeathIdx !== -1) {
      deaths.splice(enchanterDeathIdx, 1);
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === aliveEnchanter.seatNumber
          ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
          : s,
      );
      doKill(enchanterTargetSeat, 'enchanter_substitute');
    } else if (enchanterConsecutiveDeath) {
      doKill(enchanterTargetSeat, 'enchanter_consecutive');
    }
  }

  // 名媛夜死或被種狼感染 → 寵幸者殉情（仍可發動技能）
  if (aliveSocialite && socialiteFavoredSeat !== null) {
    const socialiteNow = updatedSeats.find((s) => s.seatNumber === aliveSocialite.seatNumber);
    if (socialiteNow && (!socialiteNow.isAlive || socialiteNow.infectedBySeedWolf)) {
      doKill(socialiteFavoredSeat, 'socialite_link');
    }
  }

  // 梅杜莎夜死 → 石化者跟隨出局
  if (aliveMedusa && medusaPetrifiedSeat !== null) {
    const medusaNow = updatedSeats.find((s) => s.seatNumber === aliveMedusa.seatNumber);
    if (medusaNow && !medusaNow.isAlive) {
      doKill(medusaPetrifiedSeat, 'medusa_petrify_link');
    }
  }

  // 禁言長老禁言標記
  if (draft.muteElderTarget !== undefined && draft.muteElderTarget !== null) {
    const aliveMuteElder = updatedSeats.find(
      (s) => s.roleId === 'mute_elder' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (aliveMuteElder && !isSeatBlockedByInterference(aliveMuteElder.seatNumber)) {
      const check = canMuteElderMute(updatedSeats, draft.muteElderTarget);
      if (!check.allowed) throw new Error(check.reason);
      nextInterferenceState.activeMutedSeat = draft.muteElderTarget;
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === draft.muteElderTarget ? { ...s, muted: true } : s,
      );
    }
  }

  // 煉金魔女法老之蛇待救目標紀錄
  const aliveAlchemyWitch = updatedSeats.find(
    (s) => s.roleId === 'alchemy_witch' && s.isAlive && !s.infectedBySeedWolf,
  );
  if (aliveAlchemyWitch && !nextInterferenceState.alchemySnakeUsed && deaths.length > 0) {
    nextInterferenceState.alchemySnakePendingVictimSeat = deaths[0].seat;
  }

  nextInterferenceState.troublemakerJoinedWolfTeam = syncTroublemakerTeamStatus(
    updatedSeats,
    nextInterferenceState,
  );
  nextInterferenceState.silentNightMentorJoinedWolfTeam = syncSilentNightMentorTeamStatus(
    updatedSeats,
    nextInterferenceState,
  );

  // 8.58 第 3 批好人擊殺、夜僕抵消、鏽劍反殺、秘密之身、覺醒狼美替死與猩紅之子連帶
  // 夜之貴族選擇夜僕
  if (draft.nightNobleServantTarget !== undefined && draft.nightNobleServantTarget !== null) {
    const check = canNightNobleChooseServant(
      updatedSeats,
      nextCombatState,
      draft.nightNobleServantTarget,
      round,
    );
    if (!check.allowed) throw new Error(check.reason);
    nextCombatState.nightNobleServantSeat = draft.nightNobleServantTarget;
  }

  // 獵魔人狩獵（血月封印時無效；狩到夜僕抵消夜僕雙方不死；狩狼殺狼、狩好人自死）
  if (
    !bloodMoonSealedGood &&
    draft.demonHunterTarget !== undefined &&
    draft.demonHunterTarget !== null
  ) {
    const aliveDh = updatedSeats.find(
      (s) => s.roleId === 'demon_hunter' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (aliveDh && !isSeatBlockedByInterference(aliveDh.seatNumber)) {
      const check = canDemonHunterHunt(updatedSeats, draft.demonHunterTarget, round);
      if (!check.allowed) throw new Error(check.reason);
      if (
        nextCombatState.nightNobleServantSeat !== null &&
        draft.demonHunterTarget === nextCombatState.nightNobleServantSeat
      ) {
        nextCombatState.nightNobleServantSeat = null;
      } else {
        const targetObj = updatedSeats.find((s) => s.seatNumber === draft.demonHunterTarget);
        if (targetObj && isSeatWolfFaction(targetObj)) {
          if (!isDreamProtected(targetObj.seatNumber) && !isSpecialNightImmune(targetObj.seatNumber)) {
            doKill(targetObj.seatNumber, 'demon_hunter_kill');
          }
        } else {
          doKill(aliveDh.seatNumber, 'demon_hunter_backfire');
        }
      }
    }
  }

  // 未被獵魔人抵消之夜僕於隔天天亮出局
  if (nextCombatState.nightNobleServantSeat !== null) {
    const servantNum = nextCombatState.nightNobleServantSeat;
    nextCombatState.nightNobleServantSeat = null;
    if (!isDreamProtected(servantNum) && !isSpecialNightImmune(servantNum)) {
      doKill(servantNum, 'night_noble_servant_death');
    }
  }

  // 蜂之狂獵雙刺（皆狼同出局、皆好永久失能）
  if (
    !bloodMoonSealedGood &&
    draft.beeWildHuntTargets &&
    draft.beeWildHuntTargets[0] !== null &&
    draft.beeWildHuntTargets[1] !== null
  ) {
    const aliveBee = updatedSeats.find(
      (s) => s.roleId === 'bee_wild_hunt' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (aliveBee && !isSeatBlockedByInterference(aliveBee.seatNumber)) {
      const check = canBeeWildHuntSting(
        updatedSeats,
        nextCombatState,
        draft.beeWildHuntTargets,
        round,
      );
      if (!check.allowed) throw new Error(check.reason);
      const t1 = updatedSeats.find((s) => s.seatNumber === draft.beeWildHuntTargets![0])!;
      const t2 = updatedSeats.find((s) => s.seatNumber === draft.beeWildHuntTargets![1])!;
      const w1 = isSeatWolfFaction(t1);
      const w2 = isSeatWolfFaction(t2);
      if (w1 && w2) {
        doKill(t1.seatNumber, 'bee_wild_hunt_kill');
        if (t2.seatNumber !== t1.seatNumber) {
          doKill(t2.seatNumber, 'bee_wild_hunt_kill');
        }
      } else if (!w1 && !w2) {
        nextCombatState.beeWildHuntLostAbility = true;
      }
    }
  }

  // 珀爾修斯處決（免疫石化；處決到被石化者一同出局）
  if (
    !bloodMoonSealedGood &&
    draft.perseusExecuteTarget !== undefined &&
    draft.perseusExecuteTarget !== null
  ) {
    const alivePerseus = updatedSeats.find(
      (s) => s.roleId === 'perseus' && s.isAlive && !s.infectedBySeedWolf,
    );
    if (alivePerseus && fearedSeat !== alivePerseus.seatNumber) {
      const check = canPerseusExecute(
        updatedSeats,
        nextCombatState,
        draft.perseusExecuteTarget,
        round,
      );
      if (!check.allowed) throw new Error(check.reason);
      nextCombatState.perseusExecuteUsed = true;
      doKill(draft.perseusExecuteTarget, 'perseus_execute');
      if (medusaPetrifiedSeat !== null && draft.perseusExecuteTarget === medusaPetrifiedSeat) {
        doKill(alivePerseus.seatNumber, 'perseus_petrify_backfire');
      }
    }
  }

  // 鏽劍騎士被狼刀殺死下一晚天亮，左邊最近存活狼人死亡
  if (
    nextCombatState.rustySwordKilledRound !== null &&
    round === nextCombatState.rustySwordKilledRound + 1 &&
    !nextCombatState.rustySwordTriggered
  ) {
    nextCombatState.rustySwordTriggered = true;
    const leftWolf = findRustySwordCounterTarget(updatedSeats);
    if (leftWolf) {
      doKill(leftWolf.seatNumber, 'rusty_sword_counter');
    }
  }
  const rskDeath = deaths.find(
    (d) =>
      d.reason === 'wolf_kill' &&
      updatedSeats.find((s) => s.seatNumber === d.seat)?.roleId === 'rusty_sword_knight',
  );
  if (rskDeath && nextCombatState.rustySwordKilledRound === null) {
    nextCombatState.rustySwordKilledRound = round;
  }

  // 河豚吃狼刀：白天翻牌使當天狼美人魅惑失效
  const pufferWolfDeath = deaths.find(
    (d) =>
      d.reason === 'wolf_kill' &&
      updatedSeats.find((s) => s.seatNumber === d.seat)?.roleId === 'pufferfish',
  );
  if (pufferWolfDeath) {
    nextCombatState.pufferfishWolfKilledToday = true;
    nextActiveCharmedSeat = null;
  }

  // 猩紅之子：已公布附著玩家成為神職技能目標時夜間出局
  if (prevScarletAttached.length > 0) {
    const godSkillTargets = new Set<number>(
      [
        effectiveGuardTarget,
        effectiveWitchPoisonTarget,
        effectiveAwPoisonTarget,
        effectiveSeerTarget,
        effectivePsychicTarget,
        draft.demonHunterTarget ?? null,
      ].filter((n): n is number => n !== null),
    );
    for (const attachedSeat of prevScarletAttached) {
      if (godSkillTargets.has(attachedSeat)) {
        doKill(attachedSeat, 'scarlet_child_trigger');
      }
    }
  }

  // 覺醒白痴秘密之身：保護目標抵擋一次死亡；若目標未受傷則改護自己
  if (aliveAwakenedIdiot && awakenedIdiotShieldTarget !== null && nextCombatState.awakenedIdiotSecretActive) {
    const targetDeathIdx = deaths.findIndex((d) => d.seat === awakenedIdiotShieldTarget);
    if (targetDeathIdx !== -1) {
      deaths.splice(targetDeathIdx, 1);
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === awakenedIdiotShieldTarget
          ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
          : s,
      );
      nextCombatState.awakenedIdiotSecretActive = false;
    } else {
      const selfDeathIdx = deaths.findIndex((d) => d.seat === aliveAwakenedIdiot.seatNumber);
      if (selfDeathIdx !== -1) {
        deaths.splice(selfDeathIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === aliveAwakenedIdiot.seatNumber
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
        nextCombatState.awakenedIdiotSecretActive = false;
      }
    }
  }

  // 覺醒狼美人替死：首次出局時由被魅惑者代替死亡
  if (
    aliveAwakenedWolfBeauty &&
    !nextCombatState.awakenedWolfBeautySubstituteUsed &&
    nextCombatState.awakenedWolfBeautyActiveCharmSeat !== null
  ) {
    const awbDeathIdx = deaths.findIndex((d) => d.seat === aliveAwakenedWolfBeauty.seatNumber);
    if (awbDeathIdx !== -1) {
      deaths.splice(awbDeathIdx, 1);
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === aliveAwakenedWolfBeauty.seatNumber
          ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
          : s,
      );
      nextCombatState.awakenedWolfBeautySubstituteUsed = true;
      doKill(nextCombatState.awakenedWolfBeautyActiveCharmSeat, 'awakened_wolf_beauty_substitute');
    }
  }

  // 猩紅狼王出局：所有被附著「猩紅之子」的玩家一同出局
  const scarletWolfSeat = updatedSeats.find((s) => s.roleId === 'scarlet_wolf_king');
  if (scarletWolfSeat && deaths.some((d) => d.seat === scarletWolfSeat.seatNumber)) {
    for (const attached of nextCombatState.scarletAttachedSeats) {
      if (attached !== scarletWolfSeat.seatNumber) {
        doKill(attached, 'scarlet_wolf_link');
      }
    }
  }

  // 同步第 3 批入隊狀態
  nextCombatState = syncWolfBrothersState(updatedSeats, nextCombatState, round);
  nextCombatState.wolfRavenClawJoinedTeam = syncWolfRavenClawTeamStatus(
    updatedSeats,
    nextCombatState,
  );
  nextCombatState.bigGreyWolfJoinedTeam = syncBigGreyWolfTeamStatus(updatedSeats, nextCombatState);
  nextCombatState.anubisJoinedTeam = syncAnubisTeamStatus(updatedSeats, nextCombatState);
  nextCombatState.scarletWolfKingJoinedTeam = syncScarletWolfKingTeamStatus(
    updatedSeats,
    nextCombatState,
  );

  // 8.6 狼美人夜死殉情結算（魅惑對象跟著殉情且無法發動技能）
  let hadWolfBeautyCharmDeath = false;
  if (aliveWolfBeauty) {
    const wolfBeautyDeath = deaths.find((d) => d.seat === aliveWolfBeauty.seatNumber);
    if (wolfBeautyDeath) {
      const charmOutcome = applyWolfBeautyCharmDeath(
        updatedSeats,
        aliveWolfBeauty.seatNumber,
        wolfBeautyDeath.reason,
        nextActiveCharmedSeat,
        round,
      );
      if (charmOutcome.charmedDeathSeat !== null) {
        updatedSeats = charmOutcome.seats;
        deaths.push({ seat: charmOutcome.charmedDeathSeat, reason: 'wolf_beauty_charm' });
        nextActiveCharmedSeat = null;
        hadWolfBeautyCharmDeath = true;
      }
    }
  }

  // 8.65 第 4 批第三方額外擊殺（白蛇靈襲／許仙靈襲／開膛手傑克擊殺）與全量殉情／轉化同步
  if (draft.whiteSnakeTarget != null) {
    const aliveWhiteSnake = updatedSeats.find((s) => s.roleId === 'white_snake_seer' && s.isAlive);
    if (aliveWhiteSnake) {
      if (!nextConversionState.whiteSnakeUnlockedAttack) {
        const t = updatedSeats.find((s) => s.seatNumber === draft.whiteSnakeTarget);
        if (t?.roleId === 'xu_xian_phantom') {
          nextConversionState.whiteSnakeUnlockedAttack = true;
        }
      } else {
        doKill(draft.whiteSnakeTarget, 'white_snake_kill');
      }
    }
  }

  if (draft.xuXianKillTarget != null) {
    const aliveXuXian = updatedSeats.find((s) => s.roleId === 'xu_xian_phantom' && s.isAlive);
    const hasAliveWolf = updatedSeats.some((s) => s.isAlive && isSeatWolfFaction(s));
    if (aliveXuXian && !hasAliveWolf) {
      doKill(draft.xuXianKillTarget, 'xu_xian_kill');
    }
  }

  if (draft.jackRipperKillTarget != null) {
    const jackKillCheck = canJackRipperKill(
      updatedSeats,
      nextConversionState,
      draft.jackRipperKillTarget,
      round,
      input.boardId,
    );
    if (jackKillCheck.allowed) {
      // 守衛可守護玩家免受開膛手傑克殺害；女巫解藥則無法救開膛手傑克之刀
      const guardedFromJack =
        hasAliveGuard && effectiveGuardTarget === draft.jackRipperKillTarget;
      if (!guardedFromJack) {
        doKill(draft.jackRipperKillTarget, 'jack_ripper_kill');
      }
    }
  }

  const convSync = syncConversionOnDeaths(updatedSeats, nextConversionState, round);
  updatedSeats = convSync.seats;
  nextConversionState = convSync.state;
  for (const ld of convSync.linkedDeaths) {
    deaths.push(ld);
  }

  // 8.68 第 5 批：第三方獨立勝利、標記收集、舞池、烏鴉、商人贈禮、通靈者、管家／狼僕與睡美人封鎖
  // 8.68a 潘朵拉夜間贈盒與魔盒刀
  if (
    draft.pandoraGiftTarget != null &&
    draft.pandoraGiftItem &&
    updatedSeats.some((s) => s.roleId === 'pandora' && s.isAlive)
  ) {
    const giftRes = applyPandoraGift(
      updatedSeats,
      nextThirdPartySpecialState,
      draft.pandoraGiftTarget,
      draft.pandoraGiftItem,
      round,
    );
    if (giftRes.allowed) {
      updatedSeats = giftRes.seats;
      nextThirdPartySpecialState = giftRes.state;
      if (giftRes.poisonedSeat != null) {
        deaths.push({ seat: giftRes.poisonedSeat, reason: 'pandora_poison' });
      }
    }
  }

  if (draft.pandoraKnifeTarget != null) {
    const knifeEntry = nextThirdPartySpecialState.pandoraGiftHistory.find(
      (g) => g.item === 'knife' && !g.used,
    );
    if (
      knifeEntry &&
      canPandoraKnifeHolderAttack(updatedSeats, nextThirdPartySpecialState, knifeEntry.seat).allowed
    ) {
      knifeEntry.used = true;
      nextThirdPartySpecialState.pandoraKnifeUsed = true;
      doKill(draft.pandoraKnifeTarget, 'pandora_knife');
    }
  }

  // 8.68b 九尾標記 & 白澤清除標記
  if (
    draft.nineTailsMarkTarget != null &&
    updatedSeats.some((s) => s.roleId === 'nine_tails_wolf' && s.isAlive)
  ) {
    nextThirdPartySpecialState = addNineTailsMark(
      nextThirdPartySpecialState,
      draft.nineTailsMarkTarget,
    );
  }
  if (
    draft.baiZeClearTarget != null &&
    updatedSeats.some((s) => s.roleId === 'bai_ze' && s.isAlive)
  ) {
    nextThirdPartySpecialState = clearBaiZeMarks(
      nextThirdPartySpecialState,
      draft.baiZeClearTarget,
    );
  }

  // 8.68c 假面改判 & 舞者舞池結算（舞者在舞池中，三人均免疫狼刀）
  let maskedAlterSeatTonight: number | null = null;
  if (
    round >= 2 &&
    updatedSeats.some((s) => s.roleId === 'masked_wolf' && s.isAlive)
  ) {
    if (
      draft.maskedWolfCheckTarget != null &&
      draft.maskedWolfCheckTarget !== nextThirdPartySpecialState.maskedWolfLastCheckSeat
    ) {
      nextThirdPartySpecialState.maskedWolfLastCheckSeat = draft.maskedWolfCheckTarget;
    }
    if (
      draft.maskedWolfAlterTarget != null &&
      draft.maskedWolfAlterTarget !== nextThirdPartySpecialState.maskedWolfLastAlterSeat
    ) {
      maskedAlterSeatTonight = draft.maskedWolfAlterTarget;
      nextThirdPartySpecialState.maskedWolfLastAlterSeat = draft.maskedWolfAlterTarget;
    }
  }

  if (
    draft.dancerFloorTargets &&
    draft.dancerFloorTargets.length === 3 &&
    initialSeats.some((s) => s.roleId === 'dancer' && s.isAlive) &&
    canDancerPickFloor(initialSeats, nextThirdPartySpecialState, round, draft.dancerFloorTargets).allowed
  ) {
    for (const num of draft.dancerFloorTargets) {
      if (!nextThirdPartySpecialState.dancerVisitedSeats.includes(num)) {
        nextThirdPartySpecialState.dancerVisitedSeats.push(num);
      }
    }
    const floorOutcome = resolveDancerFloor(
      initialSeats,
      nextThirdPartySpecialState,
      draft.dancerFloorTargets,
      maskedAlterSeatTonight,
    );
    // 若舞者在舞池中，舞池 3 人免疫當晚狼刀
    for (const immSeat of floorOutcome.immuneToWolfKillSeats) {
      const wIdx = deaths.findIndex((d) => d.seat === immSeat && d.reason === 'wolf_kill');
      if (wIdx !== -1) {
        deaths.splice(wIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === immSeat
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
    }
    if (floorOutcome.eliminatedSeat != null) {
      doKill(floorOutcome.eliminatedSeat, 'dance_out');
    }
  }

  // 8.68d 烏鴉詛咒
  if (
    draft.crowCurseTarget != null &&
    initialSeats.some((s) => s.roleId === 'crow' && s.isAlive) &&
    canCrowCurse(initialSeats, nextThirdPartySpecialState, draft.crowCurseTarget).allowed
  ) {
    nextThirdPartySpecialState.crowActiveCursedSeat = draft.crowCurseTarget;
    nextThirdPartySpecialState.crowLastCursedSeat = draft.crowCurseTarget;
  }

  // 8.68e 奇蹟商人 & 黑市商人 & 超級黑市商人 & 邪惡商人
  const aliveMiracle = updatedSeats.find((s) => s.roleId === 'miracle_merchant' && s.isAlive);
  if (
    aliveMiracle &&
    !nextThirdPartySpecialState.miracleMerchantUsed &&
    draft.miracleMerchantTarget != null &&
    draft.miracleMerchantTarget !== aliveMiracle.seatNumber &&
    draft.miracleMerchantItem
  ) {
    nextThirdPartySpecialState.miracleMerchantUsed = true;
    const lucky = updatedSeats.find((s) => s.seatNumber === draft.miracleMerchantTarget);
    if (lucky && isSeatWolfFaction(lucky)) {
      if (!isDreamProtected(aliveMiracle.seatNumber)) {
        doKill(aliveMiracle.seatNumber, 'merchant_backfire');
      }
    } else if (lucky) {
      nextThirdPartySpecialState.miracleLuckySeat = lucky.seatNumber;
      nextThirdPartySpecialState.miracleLuckyItem = draft.miracleMerchantItem;
    }
  }

  const aliveBlackMarket = updatedSeats.find(
    (s) => s.roleId === 'black_market_merchant' && s.isAlive,
  );
  if (
    aliveBlackMarket &&
    !nextThirdPartySpecialState.blackMarketMerchantUsed &&
    draft.blackMarketTarget != null &&
    draft.blackMarketTarget !== aliveBlackMarket.seatNumber &&
    draft.blackMarketItem
  ) {
    nextThirdPartySpecialState.blackMarketMerchantUsed = true;
    const lucky = updatedSeats.find((s) => s.seatNumber === draft.blackMarketTarget);
    if (lucky && isSeatWolfFaction(lucky)) {
      if (!isDreamProtected(aliveBlackMarket.seatNumber)) {
        doKill(aliveBlackMarket.seatNumber, 'merchant_backfire');
      }
    } else if (lucky) {
      nextThirdPartySpecialState.blackMarketLuckySeat = lucky.seatNumber;
      nextThirdPartySpecialState.blackMarketLuckyItem = draft.blackMarketItem;
    }
  }

  const aliveSuperBlackMarket = updatedSeats.find(
    (s) => s.roleId === 'super_black_market_merchant' && s.isAlive,
  );
  if (
    aliveSuperBlackMarket &&
    !nextThirdPartySpecialState.superBlackMarketUsed &&
    draft.superBlackMarketTargets
  ) {
    const entries: Array<{ item: 'seer_check' | 'witch_poison' | 'hunter_gun'; seat: number }> = [];
    if (draft.superBlackMarketTargets.seer_check != null) {
      entries.push({ item: 'seer_check', seat: draft.superBlackMarketTargets.seer_check });
    }
    if (draft.superBlackMarketTargets.witch_poison != null) {
      entries.push({ item: 'witch_poison', seat: draft.superBlackMarketTargets.witch_poison });
    }
    if (draft.superBlackMarketTargets.hunter_gun != null) {
      entries.push({ item: 'hunter_gun', seat: draft.superBlackMarketTargets.hunter_gun });
    }
    if (entries.length === 3) {
      nextThirdPartySpecialState.superBlackMarketUsed = true;
      nextThirdPartySpecialState.superBlackMarketGifts = entries.map((e) => ({
        seat: e.seat,
        item: e.item,
        used: false,
      }));
      const allGood = entries.every((e) => {
        const seatObj = updatedSeats.find((s) => s.seatNumber === e.seat);
        return seatObj != null && !isSeatWolfFaction(seatObj);
      });
      if (allGood) {
        nextThirdPartySpecialState.superBlackMarketTurnedWolf = true;
      }
    }
  }

  // 幸運兒使用道具（毒藥／盾／查驗，依房規 luckyFirstNightSkills 管制第一晚是否可用）
  if (draft.luckyItemActorSeat != null && draft.luckyItemTargetSeat != null) {
    if (
      nextThirdPartySpecialState.miracleLuckySeat === draft.luckyItemActorSeat &&
      nextThirdPartySpecialState.miracleLuckyItem &&
      !nextThirdPartySpecialState.miracleLuckyItemUsed &&
      isLuckySkillAllowedOnRound(
        'miracle',
        nextThirdPartySpecialState.miracleLuckyItem,
        round,
        ruleOverrides,
      )
    ) {
      if (nextThirdPartySpecialState.miracleLuckyItem === 'witch_poison') {
        doKill(draft.luckyItemTargetSeat, 'witch_poison');
      }
      nextThirdPartySpecialState.miracleLuckyItemUsed = true;
    } else if (
      nextThirdPartySpecialState.blackMarketLuckySeat === draft.luckyItemActorSeat &&
      nextThirdPartySpecialState.blackMarketLuckyItem &&
      !nextThirdPartySpecialState.blackMarketLuckyItemUsed &&
      isLuckySkillAllowedOnRound(
        'blackMarket',
        nextThirdPartySpecialState.blackMarketLuckyItem,
        round,
        ruleOverrides,
      )
    ) {
      if (nextThirdPartySpecialState.blackMarketLuckyItem === 'witch_poison') {
        doKill(draft.luckyItemTargetSeat, 'witch_poison');
      }
      nextThirdPartySpecialState.blackMarketLuckyItemUsed = true;
    } else {
      const superGiftIdx = nextThirdPartySpecialState.superBlackMarketGifts.findIndex(
        (g) =>
          g.seat === draft.luckyItemActorSeat &&
          !g.used &&
          isLuckySkillAllowedOnRound('superBlackMarket', g.item, round, ruleOverrides),
      );
      if (superGiftIdx >= 0) {
        const gift = nextThirdPartySpecialState.superBlackMarketGifts[superGiftIdx];
        if (gift.item === 'witch_poison') {
          doKill(draft.luckyItemTargetSeat, 'witch_poison');
        }
        nextThirdPartySpecialState.superBlackMarketGifts[superGiftIdx] = {
          ...gift,
          used: true,
        };
      }
    }
  }

  // 邪惡商人贈禮
  if (
    !nextThirdPartySpecialState.evilMerchantDisabled &&
    draft.evilMerchantTarget != null &&
    updatedSeats.some((s) => s.roleId === 'evil_merchant' && s.isAlive)
  ) {
    const giftType = draft.evilMerchantGiftType ?? (round === 1 ? 'hunter_gun' : 'witch_poison');
    if (giftType === 'hunter_gun') {
      nextThirdPartySpecialState.evilMerchantGunHolderSeat = draft.evilMerchantTarget;
    } else if (giftType === 'witch_poison') {
      nextThirdPartySpecialState.evilMerchantGunHolderSeat = null;
      nextThirdPartySpecialState.evilMerchantPoisonHolderSeat = draft.evilMerchantTarget;
    }
  }

  // 8.68f 通靈者通靈與繼承技能結算
  const aliveMedium = updatedSeats.find((s) => s.roleId === 'medium' && s.isAlive);
  if (
    aliveMedium &&
    draft.mediumDeadSeat != null &&
    draft.mediumHeirSeat != null &&
    canMediumChannel(
      updatedSeats,
      nextThirdPartySpecialState,
      aliveMedium.seatNumber,
      draft.mediumDeadSeat,
      draft.mediumHeirSeat,
    ).allowed
  ) {
    const deadObj = updatedSeats.find((s) => s.seatNumber === draft.mediumDeadSeat);
    const skill = getChannelableSkillForRole(deadObj?.roleId ?? null);
    nextThirdPartySpecialState.mediumChanneledDeadSeats.push(draft.mediumDeadSeat);
    if (skill) {
      nextThirdPartySpecialState.mediumInheritedHeirs.push({
        heirSeat: draft.mediumHeirSeat,
        fromDeadSeat: draft.mediumDeadSeat,
        skill,
        receivedRound: round,
        used: false,
      });
    }
  }

  if (draft.mediumSkillActionSeat != null && draft.mediumSkillTargetSeat != null) {
    const heirEntry = nextThirdPartySpecialState.mediumInheritedHeirs.find(
      (h) =>
        h.heirSeat === draft.mediumSkillActionSeat && !h.used && h.receivedRound < round,
    );
    if (heirEntry) {
      heirEntry.used = true;
      if (heirEntry.skill === 'wolf_kill') {
        const targetProtected =
          anyAntidoteUsed && effectiveWolfTarget === draft.mediumSkillTargetSeat
            ? true
            : (hasAliveGuard && effectiveGuardTarget === draft.mediumSkillTargetSeat) ||
              mediumShieldSeat === draft.mediumSkillTargetSeat;
        if (!targetProtected) {
          doKill(draft.mediumSkillTargetSeat, 'medium_knife');
        }
      } else if (heirEntry.skill === 'witch_poison') {
        doKill(draft.mediumSkillTargetSeat, 'witch_poison');
      }
    }
  }

  // 8.68g 管家 & 狼僕上茶結算（第二晚起，每人限一次）
  if (
    round >= 2 &&
    draft.butlerTeaTarget != null &&
    updatedSeats.some((s) => s.roleId === 'butler' && s.isAlive) &&
    !nextThirdPartySpecialState.butlerServedSeats.includes(draft.butlerTeaTarget)
  ) {
    nextThirdPartySpecialState.butlerServedSeats.push(draft.butlerTeaTarget);
    const targetObj = updatedSeats.find((s) => s.seatNumber === draft.butlerTeaTarget);
    const accepted =
      targetObj?.roleId === 'wolf_maid' ||
      targetObj?.roleId === 'villager' ||
      draft.butlerTeaAccepted !== false;
    if (targetObj && accepted) {
      nextThirdPartySpecialState.butlerActiveTeaSeat = targetObj.seatNumber;
      if (targetObj.roleId === 'villager') {
        nextThirdPartySpecialState.butlerActiveVoteBonusSeat = targetObj.seatNumber;
      } else if (targetObj.roleId === 'seer' && seerResult?.faction === 'wolf') {
        doKill(seerResult.targetSeat, 'butler_seer_kill');
      } else if (targetObj.roleId === 'wolf') {
        // 小狼接管家茶：當晚少一刀（撤銷本晚 wolf_kill）
        const wkIdx = deaths.findIndex((d) => d.reason === 'wolf_kill');
        if (wkIdx !== -1) {
          const rescued = deaths[wkIdx].seat;
          deaths.splice(wkIdx, 1);
          updatedSeats = updatedSeats.map((s) =>
            s.seatNumber === rescued
              ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
              : s,
          );
        }
      } else if (targetObj.roleId === 'guard' && effectiveGuardTarget != null) {
        nextThirdPartySpecialState.butlerDayProtectedSeat = effectiveGuardTarget;
      }
    }
  }

  if (
    round >= 2 &&
    draft.wolfMaidTeaTarget != null &&
    initialSeats.some((s) => s.roleId === 'wolf_maid' && s.isAlive) &&
    !nextThirdPartySpecialState.wolfMaidServedSeats.includes(draft.wolfMaidTeaTarget)
  ) {
    nextThirdPartySpecialState.wolfMaidServedSeats.push(draft.wolfMaidTeaTarget);
    const targetObj = updatedSeats.find((s) => s.seatNumber === draft.wolfMaidTeaTarget);
    const accepted =
      targetObj?.roleId === 'butler' ||
      targetObj?.roleId === 'villager' ||
      draft.wolfMaidTeaAccepted !== false;
    if (targetObj && accepted) {
      nextThirdPartySpecialState.wolfMaidActiveTeaSeat = targetObj.seatNumber;
      if (targetObj.roleId === 'villager') {
        nextThirdPartySpecialState.wolfMaidActiveVotePenaltySeat = targetObj.seatNumber;
      } else if (targetObj.roleId === 'seer' || targetObj.roleId === 'witch') {
        doKill(targetObj.seatNumber, 'wolf_maid_tea_kill');
      } else if (targetObj.roleId === 'guard' && effectiveGuardTarget != null) {
        doKill(effectiveGuardTarget, 'wolf_maid_tea_kill');
      } else if (targetObj.roleId === 'wolf' && draft.wolfMaidExtraKillTarget != null) {
        doKill(draft.wolfMaidExtraKillTarget, 'wolf_kill');
      }
    }
  }

  // 8.68h 睡美人睡眠狀態封鎖（女巫毒失敗、禁言長老無效）
  const witchSeatObj = updatedSeats.find((s) => s.roleId === 'witch');
  if (witchSeatObj && isSeatAsleep(updatedSeats, nextThirdPartySpecialState, witchSeatObj.seatNumber)) {
    const wpIdx = deaths.findIndex((d) => d.reason === 'witch_poison');
    if (wpIdx !== -1) {
      const rescued = deaths[wpIdx].seat;
      deaths.splice(wpIdx, 1);
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === rescued
          ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
          : s,
      );
    }
  }
  const muteElderObj = updatedSeats.find((s) => s.roleId === 'mute_elder');
  if (muteElderObj && isSeatAsleep(updatedSeats, nextThirdPartySpecialState, muteElderObj.seatNumber)) {
    nextInterferenceState.activeMutedSeat = null;
    updatedSeats = updatedSeats.map((s) => (s.muted ? { ...s, muted: false } : s));
  }

  // 8.68i 白澤神職繼承人夜死延遲至下一白天放逐投票結束後（若為最後一神則不延遲）
  if (
    nextThirdPartySpecialState.baiZeHeirRoleType === 'god' &&
    nextThirdPartySpecialState.baiZeHeirSeat != null
  ) {
    const heirSeatNum = nextThirdPartySpecialState.baiZeHeirSeat;
    const heirDeathIdx = deaths.findIndex((d) => d.seat === heirSeatNum);
    if (heirDeathIdx !== -1) {
      const otherAliveGods = updatedSeats.some(
        (s) =>
          s.isAlive &&
          s.seatNumber !== heirSeatNum &&
          s.roleId != null &&
          !isSeatWolfFaction(s) &&
          (s.baiZeDualFaction ||
            (s.roleId !== 'villager' &&
              s.roleId !== 'senior_villager' &&
              s.roleId !== 'old_rascal' &&
              s.roleId !== 'masked_villager')),
      );
      if (otherAliveGods) {
        deaths.splice(heirDeathIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === heirSeatNum
            ? {
                ...s,
                isAlive: true,
                deathReason: undefined,
                deathRound: undefined,
                baiZeDelayedDeath: true,
              }
            : s,
        );
      }
    }
  }

  nextThirdPartySpecialState = syncBatch5LoneWolfTeamStatus(
    updatedSeats,
    nextThirdPartySpecialState,
  );

  // 8.69 第 6 批：蝕日侍女、灰太狼、小女孩、警犬與怪盜狼王無敵結算
  // 8.69a 小女孩：第二晚起狼隊指認小女孩，指認成功由小女孩代替原狼刀目標死亡
  if (
    draft.littleGirlIdentifyTarget != null &&
    canWolvesIdentifyLittleGirl(round, nextFinalBatchState).allowed
  ) {
    nextFinalBatchState.littleGirlIdentifyUsed = true;
    const identifiedSeat = updatedSeats.find(
      (s) => s.seatNumber === draft.littleGirlIdentifyTarget,
    );
    if (identifiedSeat?.roleId === 'little_girl') {
      const wkIdx = deaths.findIndex((d) => d.reason === 'wolf_kill');
      if (wkIdx !== -1) {
        const rescuedSeat = deaths[wkIdx].seat;
        deaths.splice(wkIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === rescuedSeat
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
      doKill(identifiedSeat.seatNumber, 'little_girl_caught');
    }
  }

  // 8.69b 蝕日侍女：第二晚起吞噬非狼玩家並使用其技能
  const aliveEclipseMaid = initialSeats.find((s) => s.roleId === 'eclipse_maid' && s.isAlive);
  if (
    aliveEclipseMaid &&
    draft.eclipseMaidDevourTarget != null &&
    canEclipseMaidDevour(initialSeats, round, draft.eclipseMaidDevourTarget).allowed
  ) {
    nextFinalBatchState.eclipseMaidDevouredSeatTonight = draft.eclipseMaidDevourTarget;
    const devoured = initialSeats.find((s) => s.seatNumber === draft.eclipseMaidDevourTarget);
    if (devoured?.roleId === 'witch' && !witchPoisonUsed) {
      // 吞女巫：封鎖原女巫毒、蝕日侍女改用毒藥
      const wpIdx = deaths.findIndex((d) => d.reason === 'witch_poison');
      if (wpIdx !== -1) {
        const rescued = deaths[wpIdx].seat;
        deaths.splice(wpIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === rescued
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
      if (draft.eclipseMaidUseSkillTarget != null) {
        doKill(draft.eclipseMaidUseSkillTarget, 'eclipse_maid_kill');
        nextWitchPoisonUsed = true;
      }
    } else if (devoured?.roleId === 'demon_hunter') {
      // 吞獵魔人：蝕日侍女當晚免疫女巫毒藥；狩狼殺狼、狩好自死
      const maidPoisonIdx = deaths.findIndex(
        (d) => d.seat === aliveEclipseMaid.seatNumber && d.reason === 'witch_poison',
      );
      if (maidPoisonIdx !== -1) {
        deaths.splice(maidPoisonIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === aliveEclipseMaid.seatNumber
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
      if (draft.eclipseMaidUseSkillTarget != null) {
        const huntTarget = initialSeats.find((s) => s.seatNumber === draft.eclipseMaidUseSkillTarget);
        if (huntTarget && isSeatWolfFaction(huntTarget)) {
          doKill(huntTarget.seatNumber, 'eclipse_maid_kill');
        } else if (huntTarget) {
          doKill(aliveEclipseMaid.seatNumber, 'eclipse_maid_kill');
        }
      }
    } else if (devoured?.roleId === 'cursed_fox') {
      // 吞咒狐：蝕日侍女當晚免狼刀
      const maidWolfIdx = deaths.findIndex(
        (d) => d.seat === aliveEclipseMaid.seatNumber && d.reason === 'wolf_kill',
      );
      if (maidWolfIdx !== -1) {
        deaths.splice(maidWolfIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === aliveEclipseMaid.seatNumber
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
    } else if (
      devoured?.roleId === 'miracle_merchant' &&
      draft.eclipseMaidUseSkillTarget != null
    ) {
      const mTarget = initialSeats.find((s) => s.seatNumber === draft.eclipseMaidUseSkillTarget);
      if (mTarget && isSeatWolfFaction(mTarget)) {
        doKill(aliveEclipseMaid.seatNumber, 'merchant_backfire');
      }
    }
  }

  // 8.69c 灰太狼：每晚偷取技能（受喜羊羊防盜阻斷，每人整局限偷一次）
  if (
    draft.greyWolfBossStealTarget != null &&
    canGreyWolfBossSteal(initialSeats, nextFinalBatchState, draft.greyWolfBossStealTarget).allowed
  ) {
    nextFinalBatchState.greyWolfBossStolenSeats.push(draft.greyWolfBossStealTarget);
    const blockedByAntiTheft = happySheepAntiTheftSeat === draft.greyWolfBossStealTarget;
    const targetObj = initialSeats.find((s) => s.seatNumber === draft.greyWolfBossStealTarget);
    if (!blockedByAntiTheft && targetObj) {
      if ((targetObj.roleId === 'wolf' || targetObj.roleId === 'little_grey_wolf') && round >= 2) {
        // 次夜起偷小狼：狼隊當晚無刀，改由灰太狼代刀
        const wkIdx = deaths.findIndex((d) => d.reason === 'wolf_kill');
        if (wkIdx !== -1) {
          const rescued = deaths[wkIdx].seat;
          deaths.splice(wkIdx, 1);
          updatedSeats = updatedSeats.map((s) =>
            s.seatNumber === rescued
              ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
              : s,
          );
        }
        if (draft.greyWolfBossUseSkillTarget != null) {
          doKill(draft.greyWolfBossUseSkillTarget, 'grey_wolf_steal_kill');
        }
      } else if (targetObj.roleId === 'witch' && !witchPoisonUsed) {
        if (draft.greyWolfBossUseSkillTarget != null) {
          doKill(draft.greyWolfBossUseSkillTarget, 'grey_wolf_steal_kill');
          nextWitchPoisonUsed = true;
        }
      } else if (targetObj.roleId === 'hunter') {
        nextFinalBatchState.greyWolfBossBorrowedHunterGun = true;
      }
    }
  }

  // 8.69d 警犬：偵探處決後當晚激活（處決好人→撕咬、處決狼人→查驗）
  if (
    draft.policeDogTarget != null &&
    canPoliceDogAct(initialSeats, nextFinalBatchState, round).allowed
  ) {
    nextFinalBatchState.policeDogUsed = true;
    if (nextFinalBatchState.policeDogMode === 'bite') {
      doKill(draft.policeDogTarget, 'police_dog_bite');
    }
  }

  // 8.69e 怪盜狼王無敵：免疫一切夜間死亡
  if (nextFinalBatchState.phantomWolfInvincibleActive) {
    const phantomSeat = updatedSeats.find((s) => s.roleId === 'phantom_wolf_king');
    if (phantomSeat) {
      const pIdx = deaths.findIndex((d) => d.seat === phantomSeat.seatNumber);
      if (pIdx !== -1) {
        deaths.splice(pIdx, 1);
        updatedSeats = updatedSeats.map((s) =>
          s.seatNumber === phantomSeat.seatNumber
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
      }
    }
  }

  nextFinalBatchState = syncFinalBatchLoneWolfTeamStatus(updatedSeats, nextFinalBatchState);

  // 9. 更新機械狼／盜寶大師／隱狼／石像鬼入隊狀態、南瓜鬼／超級守墓人繼承、混血兒榜樣同步、開槍資格、熊咆哮與最終勝負
  nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, nextMechWolfState);
  nextTreasureMasterState = syncTreasureMasterTeamStatus(updatedSeats, nextTreasureMasterState);
  nextHiddenWolfState = syncHiddenWolfTeamStatus(updatedSeats, nextHiddenWolfState);
  nextHybridState = syncHybridAffiliation(nextHybridState, updatedSeats);
  nextGargoyleState = syncGargoyleTeamStatus(updatedSeats, nextGargoyleState);
  nextPumpkinGhostState = syncPumpkinGhostInheritance(
    updatedSeats,
    nextGargoyleState,
    nextPumpkinGhostState,
  );
  nextSuperGravekeeperState = syncSuperGravekeeperInheritance(
    updatedSeats,
    nextSuperGravekeeperState,
  );

  const shootEligibilities: ShootEligibility[] = [];
  for (const record of deaths) {
    const eligibility = checkCanShoot(updatedSeats, record.seat, record.reason, {
      fearedSeat,
      round,
      ruleOverrides,
      thirdPartySpecialState: nextThirdPartySpecialState,
    });
    if (eligibility) {
      if (
        eligibility.roleId === 'hunter' &&
        isSeatAsleep(updatedSeats, nextThirdPartySpecialState, record.seat)
      ) {
        shootEligibilities.push({
          ...eligibility,
          canShoot: false,
          reason: '獵人處於睡美人睡眠狀態，無法開槍',
        });
      } else {
        shootEligibilities.push(eligibility);
      }
    }
  }

  const bearSeatObj = updatedSeats.find((s) => s.roleId === 'bear');
  const rawBearRoar = evaluateBearRoar(updatedSeats, nextMechWolfState, fearedSeat);
  const bearRoar =
    rawBearRoar &&
    bearSeatObj &&
    isSeatAsleep(updatedSeats, nextThirdPartySpecialState, bearSeatObj.seatNumber)
      ? { ...rawBearRoar, roared: false, reason: '熊處於睡美人睡眠狀態，永遠不會咆哮' }
      : rawBearRoar;
  const seniorVillagerReveal = evaluateSeniorVillagerReveal(updatedSeats, round);
  const victory = checkVictory(
    updatedSeats,
    hadWolfBeautyCharmDeath ? { ...ruleOverrides, wolfKillPriority: true } : ruleOverrides,
    nextTreasureMasterState,
    {
      cursedFoxDiedThisResolution: cursedFoxDiedTonight,
      conversionState: nextConversionState,
      thirdPartySpecialState: nextThirdPartySpecialState,
    },
  );

  return {
    seats: updatedSeats,
    deaths,
    witchAntidoteUsed: nextWitchAntidoteUsed,
    witchPoisonUsed: nextWitchPoisonUsed,
    poisonerPoisonUsed: nextPoisonerPoisonUsed,
    lastGuardedSeat: nextLastGuardedSeat,
    mechWolfState: nextMechWolfState,
    pendingSelfExplodeSeat: null,
    lastCharmedSeat: nextLastCharmedSeat,
    activeCharmedSeat: nextActiveCharmedSeat,
    lastDreamTarget: nextLastDreamTarget,
    wolfGirlState: nextWolfGirlState,
    treasureMasterState: nextTreasureMasterState,
    lastFearedSeat: nextLastFearedSeat,
    evilKnightCounterUsed: nextEvilKnightCounterUsed,
    hybridState: nextHybridState,
    seedWolfState: nextSeedWolfState,
    hiddenWolfState: nextHiddenWolfState,
    gargoyleState: nextGargoyleState,
    pumpkinGhostState: nextPumpkinGhostState,
    superGravekeeperState: nextSuperGravekeeperState,
    foxLostAbility: nextFoxLostAbility,
    lastAwakenedDreamTarget: nextLastAwakenedDreamTarget,
    interferenceState: nextInterferenceState,
    combatState: nextCombatState,
    conversionState: nextConversionState,
    thirdPartySpecialState: nextThirdPartySpecialState,
    finalBatchState: nextFinalBatchState,
    whiteCatRevealedSeats,
    maskedDelayedSeats,
    bearRoar,
    moonSpiritHowl,
    nineTailedFoxResult,
    seniorVillagerReveal,
    seerResult,
    psychicResult,
    mechWolfPsychicResult,
    awakenedSeerResult,
    lanternSeerResult,
    drunkSeerResult,
    foolSeerResult,
    foxResult,
    gargoyleResult,
    wolfWitchResult,
    pureWhiteResult,
    demonWolfResult,
    pumpkinGhostResult,
    gravekeeperResult,
    awakenedDreamResult,
    shootEligibilities,
    victory,
  };
}

/** 夜間可逆轉死亡（救人／守護／保護）之步驟 actionType 集合 */
const LIFE_SAVING_NIGHT_ACTION_TYPES: ReadonlySet<string> = new Set([
  'witch_action',
  'awakened_witch_action',
  'guard_protect',
  'dream_catcher_dream',
  'awakened_dream_catcher_dream',
  'radiant_earl_shield',
  'black_bat_shield',
  'dark_night_envoy_shield',
  'alchemy_witch_snake',
  'twins_guard',
  'happy_sheep_action',
  'awakened_idiot_shield',
  'magician_swap',
]);

/**
 * 夜間中途提前勝負檢核：
 * 在夜間任一步驟結算後預演當前草稿，若已達成陣營勝利條件（victory.winner !== null）
 * 且剩餘未執行的夜間步驟中已無任何存活且仍可逆轉死亡的救人／守護步驟，
 * 則立即結束剩餘夜間步驟並直接進入天亮結算。
 */
export function shouldEndNightEarly(
  input: NightResolutionInput,
  remainingSteps: Array<{ actionType: string; actorRoleIds: string[] }>,
): { shouldEndEarly: boolean; victory: VictoryResult } {
  // 若當晚仍有尚未執行的存活救人／守護步驟（且未被血月封印），不可提前結束，避免剝奪女巫救人或守衛守護機會
  const bloodMoonSealed = Boolean(input.combatState?.bloodMoonSealActiveTonight);
  const hasPendingLifeSavingStep = remainingSteps.some((step) => {
    if (!LIFE_SAVING_NIGHT_ACTION_TYPES.has(step.actionType)) return false;
    if (bloodMoonSealed) return false;
    if (step.actionType === 'witch_action' && input.witchAntidoteUsed) return false;
    if (
      step.actionType === 'awakened_witch_action' &&
      input.interferenceState?.awakenedWitchAntidoteUsed
    ) {
      return false;
    }
    if (step.actorRoleIds.length === 0) return true;
    return input.seats.some(
      (s) => s.isAlive && s.roleId !== null && step.actorRoleIds.includes(s.roleId),
    );
  });

  if (hasPendingLifeSavingStep) {
    return { shouldEndEarly: false, victory: { winner: null, winReason: null } };
  }

  try {
    const preview = resolveNight(input);
    if (preview.victory.winner !== null) {
      return { shouldEndEarly: true, victory: preview.victory };
    }
  } catch {
    // 草稿尚未完整填寫某些必選欄位時，安全不提前結束
  }

  return { shouldEndEarly: false, victory: { winner: null, winReason: null } };
}
