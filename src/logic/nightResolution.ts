import {
  applyWolfBeautyCharmDeath,
  canDreamCatcherDream,
  canWolfBeautyCharm,
  evaluateBearRoar,
} from './advancedRoles';
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
): PlayerSeat[] {
  const existing = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!existing || !existing.isAlive) {
    return seats;
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
    rng,
  } = input;

  if (firstNightNoWolfKill && round === 1 && draft.wolfTarget !== null) {
    throw new Error('此板子第一夜狼人無刀');
  }

  let updatedSeats = initialSeats.map((seat) => ({ ...seat }));
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

  // 2. 守衛行動檢核（若守衛被夢魘恐懼或被種狼感染則當晚無法守護）
  const aliveGuard = updatedSeats.find(
    (seat) => seat.roleId === 'guard' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const guardFeared = Boolean(aliveGuard && fearedSeat === aliveGuard.seatNumber);
  const hasAliveGuard = Boolean(aliveGuard && !guardFeared);
  let effectiveGuardTarget: number | null = null;
  if (guardFeared) {
    nextLastGuardedSeat = null;
  } else if (hasAliveGuard) {
    const guardCheck = canGuardTarget(lastGuardedSeat, draft.guardTarget, updatedSeats);
    if (!guardCheck.allowed) {
      throw new Error(guardCheck.reason);
    }
    effectiveGuardTarget = draft.guardTarget;
    nextLastGuardedSeat = draft.guardTarget;
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
  const wolfBeautyFeared = Boolean(aliveWolfBeauty && fearedSeat === aliveWolfBeauty.seatNumber);
  if (aliveWolfBeauty) {
    if (!wolfTeamFeared && draft.wolfTarget === aliveWolfBeauty.seatNumber) {
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

  // 3.5 惡靈騎士／惡魔不可自刀 & 種狼感染（於狼刀階段執行：女巫顯示空刀、守衛可擋感染、被感染者當晚即失能）
  let effectiveWolfTarget: number | null = wolfTeamFeared ? null : draft.wolfTarget;
  const aliveEvilKnight = findEvilKnightSeat(updatedSeats);
  if (
    aliveEvilKnight?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveEvilKnight.seatNumber
  ) {
    throw new Error('惡靈騎士不可自刀');
  }
  const aliveDemonWolf = findDemonWolfSeat(updatedSeats);
  if (
    aliveDemonWolf?.isAlive &&
    effectiveWolfTarget !== null &&
    effectiveWolfTarget === aliveDemonWolf.seatNumber
  ) {
    throw new Error('惡魔不可自刀');
  }

  const requestedSeedInfectTarget = wolfTeamFeared ? null : (draft.seedWolfInfectTarget ?? null);
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

  // 4. 女巫行動檢核（解毒互斥 + 自救限制；若女巫遭恐懼或當晚被種狼感染則無法用藥且不耗藥）
  const activeWitch = updatedSeats.find(
    (seat) => seat.roleId === 'witch' && seat.isAlive && !seat.infectedBySeedWolf,
  );
  const witchBlocked = !activeWitch || fearedSeat === activeWitch.seatNumber;
  const effectiveWitchUseAntidote = witchBlocked ? false : draft.witchUseAntidote;
  const effectiveWitchPoisonTarget = witchBlocked ? null : draft.witchPoisonTarget;

  if (effectiveWitchUseAntidote && effectiveWitchPoisonTarget !== null) {
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
  if (effectiveWitchPoisonTarget !== null) {
    const poisonCheck = canWitchUsePoison(
      updatedSeats,
      effectiveWitchUseAntidote,
      effectiveWitchPoisonTarget,
      witchPoisonUsed,
    );
    if (!poisonCheck.allowed) {
      throw new Error(poisonCheck.reason);
    }
    nextWitchPoisonUsed = true;
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

  if (
    effectiveWolfTarget !== null &&
    !isDreamProtected(effectiveWolfTarget) &&
    !wolfTargetIsCursedFox
  ) {
    const guardedByNormal = hasAliveGuard && effectiveGuardTarget === effectiveWolfTarget;
    const guardedByMech = mechGuardTarget === effectiveWolfTarget;
    const isGuarded = guardedByNormal || guardedByMech;

    if (effectiveWitchUseAntidote && isGuarded) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        effectiveWolfTarget,
        'milk_pierce',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    } else if (!effectiveWitchUseAntidote && !isGuarded) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        effectiveWolfTarget,
        'wolf_kill',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
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
    updatedSeats = killSeat(
      updatedSeats,
      deaths,
      aliveTreasureMaster.seatNumber,
      'treasure_master_exile_delayed',
      round,
      maskedDelayedSeats,
      nextTreasureMasterState,
    );
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
    !seerSeatObj || fearedSeat === seerSeatObj.seatNumber || seerInfectedTonight;
  const effectiveSeerTarget = seerBlocked ? null : draft.seerCheckTarget;
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
    !witchTargetedEvilKnight &&
    !isDemonWolfSeat(effectiveWitchPoisonTarget)
  ) {
    const blockedByMechShield = mechGuardTarget === effectiveWitchPoisonTarget;
    if (!blockedByMechShield) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        effectiveWitchPoisonTarget,
        'witch_poison',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
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

  // 8.5 攝夢人連夢致死與夜死牽連共死（出局之夢遊者無法發動技能）
  if (aliveDreamCatcher && dreamTarget !== null) {
    const isConsecutiveDream = lastDreamTarget !== null && dreamTarget === lastDreamTarget;
    const dreamCatcherNow = updatedSeats.find(
      (seat) => seat.seatNumber === aliveDreamCatcher.seatNumber,
    );
    const dreamCatcherDiedTonight = dreamCatcherNow ? !dreamCatcherNow.isAlive : false;

    if (isConsecutiveDream) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        dreamTarget,
        'dream_catcher_consecutive',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    } else if (dreamCatcherDiedTonight) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        dreamTarget,
        'dream_catcher_link',
        round,
        maskedDelayedSeats,
        nextTreasureMasterState,
      );
    }
  }

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
