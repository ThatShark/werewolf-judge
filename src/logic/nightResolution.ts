import {
  applyWolfBeautyCharmDeath,
  canDreamCatcherDream,
  canWolfBeautyCharm,
  evaluateBearRoar,
} from './advancedRoles';
import { checkCanShoot } from './dayResolution';
import {
  applyMechWolfLearn,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  findMechWolfSeat,
  getPsychicCheckResult,
  getSeerCheckResult,
  syncMechWolfTeamStatus,
} from './mechWolf';
import type {
  ActionCheckResult,
  DeathReason,
  NightDeathRecord,
  NightResolutionInput,
  NightResolutionResult,
  PlayerSeat,
  RuleOverrides,
  ShootEligibility,
} from './types';
import { checkVictory } from './victory';

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

function killSeat(
  seats: PlayerSeat[],
  deaths: NightDeathRecord[],
  seatNumber: number,
  reason: DeathReason,
  round: number,
): PlayerSeat[] {
  const existing = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!existing || !existing.isAlive) {
    return seats;
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
    lastGuardedSeat,
    mechWolfState,
    pendingSelfExplodeSeat,
    lastCharmedSeat = null,
    lastDreamTarget = null,
  } = input;

  let updatedSeats = initialSeats.map((seat) => ({ ...seat }));
  let nextMechWolfState = { ...mechWolfState };
  let nextWitchAntidoteUsed = witchAntidoteUsed;
  let nextWitchPoisonUsed = witchPoisonUsed;
  let nextLastGuardedSeat = lastGuardedSeat;
  let nextLastCharmedSeat = lastCharmedSeat;
  let nextActiveCharmedSeat: number | null = null;
  let nextLastDreamTarget: number | null = lastDreamTarget;
  const deaths: NightDeathRecord[] = [];

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

  // 2. 守衛行動檢核
  const hasAliveGuard = updatedSeats.some((seat) => seat.roleId === 'guard' && seat.isAlive);
  if (hasAliveGuard) {
    const guardCheck = canGuardTarget(lastGuardedSeat, draft.guardTarget, updatedSeats);
    if (!guardCheck.allowed) {
      throw new Error(guardCheck.reason);
    }
    nextLastGuardedSeat = draft.guardTarget;
  }

  // 2.5 攝夢人行動檢核（若未填寫目標則允許跳過以相容純主持台詞板子；填寫時嚴格檢核不可夢自己／死人）
  const aliveDreamCatcher = updatedSeats.find(
    (seat) => seat.roleId === 'dream_catcher' && seat.isAlive,
  );
  let dreamTarget: number | null = null;
  if (aliveDreamCatcher) {
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

  // 2.6 狼美人行動檢核（不可自刀、不可連魅）
  const aliveWolfBeauty = updatedSeats.find(
    (seat) => seat.roleId === 'wolf_beauty' && seat.isAlive,
  );
  if (aliveWolfBeauty) {
    if (draft.wolfTarget === aliveWolfBeauty.seatNumber) {
      throw new Error('狼美人不可自刀');
    }
    const requestedCharmTarget = draft.wolfBeautyCharmTarget ?? null;
    const charmCheck = canWolfBeautyCharm(updatedSeats, lastCharmedSeat, requestedCharmTarget);
    if (!charmCheck.allowed) {
      throw new Error(charmCheck.reason);
    }
    nextLastCharmedSeat = requestedCharmTarget;
    nextActiveCharmedSeat = requestedCharmTarget;
  }

  const isDreamProtected = (seatNumber: number): boolean =>
    dreamTarget !== null && seatNumber === dreamTarget;

  // 3. 機械狼第二晚起學習技能檢核
  let mechGuardTarget: number | null = null;
  let mechExtraKillTarget: number | null = null;
  let mechPoisonTarget: number | null = null;
  let mechPsychicTarget: number | null = null;

  if (round >= 2 && aliveMechWolf?.isAlive && nextMechWolfState.learnedRoleId) {
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

  // 4. 女巫行動檢核（解毒互斥 + 自救限制）
  if (draft.witchUseAntidote && draft.witchPoisonTarget !== null) {
    throw new Error('女巫解藥與毒藥不可在同一晚同時使用');
  }
  if (draft.witchUseAntidote) {
    const antidoteCheck = canWitchUseAntidote(
      updatedSeats,
      round,
      draft.wolfTarget,
      witchAntidoteUsed,
      ruleOverrides,
    );
    if (!antidoteCheck.allowed) {
      throw new Error(antidoteCheck.reason);
    }
    nextWitchAntidoteUsed = true;
  }
  if (draft.witchPoisonTarget !== null) {
    const poisonCheck = canWitchUsePoison(
      updatedSeats,
      draft.witchUseAntidote,
      draft.witchPoisonTarget,
      witchPoisonUsed,
    );
    if (!poisonCheck.allowed) {
      throw new Error(poisonCheck.reason);
    }
    nextWitchPoisonUsed = true;
  }

  // 5. 狼刀階段結算（含夢遊者免疫夜間傷害、同守同救奶穿、機械狼雙刀、自爆狼點刀後死亡）
  if (draft.wolfTarget !== null && !isDreamProtected(draft.wolfTarget)) {
    const guardedByNormal = hasAliveGuard && draft.guardTarget === draft.wolfTarget;
    const guardedByMech = mechGuardTarget === draft.wolfTarget;
    const isGuarded = guardedByNormal || guardedByMech;

    if (draft.witchUseAntidote && isGuarded) {
      updatedSeats = killSeat(updatedSeats, deaths, draft.wolfTarget, 'milk_pierce', round);
    } else if (!draft.witchUseAntidote && !isGuarded) {
      updatedSeats = killSeat(updatedSeats, deaths, draft.wolfTarget, 'wolf_kill', round);
    }
  }

  if (mechExtraKillTarget !== null && !isDreamProtected(mechExtraKillTarget)) {
    const guardedByNormal = hasAliveGuard && draft.guardTarget === mechExtraKillTarget;
    if (!guardedByNormal) {
      updatedSeats = killSeat(updatedSeats, deaths, mechExtraKillTarget, 'mech_wolf_kill', round);
    }
  }

  if (pendingSelfExplodeSeat !== null) {
    updatedSeats = killSeat(updatedSeats, deaths, pendingSelfExplodeSeat, 'self_explode', round);
  }

  // 6. 查驗資訊（預言家 / 通靈師 / 機械狼學通靈師）
  const seerResult =
    draft.seerCheckTarget !== null
      ? getSeerCheckResult(updatedSeats, draft.seerCheckTarget)
      : null;

  const psychicResult =
    draft.psychicCheckTarget !== null
      ? getPsychicCheckResult(updatedSeats, nextMechWolfState, draft.psychicCheckTarget)
      : null;

  const mechWolfPsychicResult =
    mechPsychicTarget !== null
      ? getPsychicCheckResult(updatedSeats, nextMechWolfState, mechPsychicTarget)
      : null;

  // 7. 狼刀在先判定：若狼刀階段已達狼人勝利條件，直接判狼人勝利（優先於女巫毒藥）
  if (ruleOverrides.wolfKillPriority) {
    const wolfPhaseVictory = checkVictory(updatedSeats, ruleOverrides);
    if (wolfPhaseVictory.winner === 'wolf') {
      nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, nextMechWolfState);
      return {
        seats: updatedSeats,
        deaths,
        witchAntidoteUsed: nextWitchAntidoteUsed,
        witchPoisonUsed: nextWitchPoisonUsed,
        lastGuardedSeat: nextLastGuardedSeat,
        mechWolfState: nextMechWolfState,
        pendingSelfExplodeSeat: null,
        lastCharmedSeat: nextLastCharmedSeat,
        activeCharmedSeat: nextActiveCharmedSeat,
        lastDreamTarget: nextLastDreamTarget,
        bearRoar: evaluateBearRoar(updatedSeats, nextMechWolfState),
        seerResult,
        psychicResult,
        mechWolfPsychicResult,
        shootEligibilities: [],
        victory: wolfPhaseVictory,
      };
    }
  }

  // 8. 毒藥階段結算（普通守衛不防毒；機械狼學守衛之機械盾可防女巫毒藥；夢遊者免疫毒藥）
  if (draft.witchPoisonTarget !== null && !isDreamProtected(draft.witchPoisonTarget)) {
    const blockedByMechShield = mechGuardTarget === draft.witchPoisonTarget;
    if (!blockedByMechShield) {
      updatedSeats = killSeat(
        updatedSeats,
        deaths,
        draft.witchPoisonTarget,
        'witch_poison',
        round,
      );
    }
  }

  if (mechPoisonTarget !== null) {
    nextMechWolfState.usedLearnedOneShotSkill = true;
    if (!isDreamProtected(mechPoisonTarget)) {
      updatedSeats = killSeat(updatedSeats, deaths, mechPoisonTarget, 'mech_wolf_poison', round);
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
      );
    } else if (dreamCatcherDiedTonight) {
      updatedSeats = killSeat(updatedSeats, deaths, dreamTarget, 'dream_catcher_link', round);
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

  // 9. 更新機械狼入隊狀態、開槍資格、熊咆哮判定與最終勝負
  nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, nextMechWolfState);

  const shootEligibilities: ShootEligibility[] = [];
  for (const record of deaths) {
    const eligibility = checkCanShoot(updatedSeats, record.seat, record.reason);
    if (eligibility) {
      shootEligibilities.push(eligibility);
    }
  }

  const bearRoar = evaluateBearRoar(updatedSeats, nextMechWolfState);
  const victory = checkVictory(
    updatedSeats,
    hadWolfBeautyCharmDeath ? { ...ruleOverrides, wolfKillPriority: true } : ruleOverrides,
  );

  return {
    seats: updatedSeats,
    deaths,
    witchAntidoteUsed: nextWitchAntidoteUsed,
    witchPoisonUsed: nextWitchPoisonUsed,
    lastGuardedSeat: nextLastGuardedSeat,
    mechWolfState: nextMechWolfState,
    pendingSelfExplodeSeat: null,
    lastCharmedSeat: nextLastCharmedSeat,
    activeCharmedSeat: nextActiveCharmedSeat,
    lastDreamTarget: nextLastDreamTarget,
    bearRoar,
    seerResult,
    psychicResult,
    mechWolfPsychicResult,
    shootEligibilities,
    victory,
  };
}
