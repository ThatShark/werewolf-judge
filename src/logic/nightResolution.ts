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
    nextLastGuardedSeat = effectiveGuardTarget;
    trackBlackBatTarget(aliveGuard.seatNumber, effectiveGuardTarget);
  }

  // 2.5 攝夢人行動檢核（若被夢魘恐懼則無法攝夢且重置連夢紀錄；被種狼感染則失能）
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
    dreamTarget = requestedDreamTarget;
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

  if (
    effectiveWolfTarget !== null &&
    !isDreamProtected(effectiveWolfTarget) &&
    !isSpecialNightImmune(effectiveWolfTarget) &&
    !wolfTargetIsCursedFox
  ) {
    const guardedByNormal = hasAliveGuard && effectiveGuardTarget === effectiveWolfTarget;
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
    const wolfPhaseVictory = checkVictory(updatedSeats, ruleOverrides, nextTreasureMasterState);
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
    const eligibility = checkCanShoot(updatedSeats, record.seat, record.reason, { fearedSeat });
    if (eligibility) {
      shootEligibilities.push(eligibility);
    }
  }

  const bearRoar = evaluateBearRoar(updatedSeats, nextMechWolfState, fearedSeat);
  const seniorVillagerReveal = evaluateSeniorVillagerReveal(updatedSeats, round);
  const victory = checkVictory(
    updatedSeats,
    hadWolfBeautyCharmDeath ? { ...ruleOverrides, wolfKillPriority: true } : ruleOverrides,
    nextTreasureMasterState,
    { cursedFoxDiedThisResolution: cursedFoxDiedTonight },
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
