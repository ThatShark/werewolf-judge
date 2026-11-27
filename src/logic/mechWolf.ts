import { getRoleById } from '../data/roles';
import { isSeatEffectiveWolf } from './factionHelpers';
import type {
  ActionCheckResult,
  ConversionRuntimeState,
  MechWolfRuntimeState,
  PlayerSeat,
  PsychicCheckOutcome,
  RuleOverrides,
  SeerCheckOutcome,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
} from './types';

export function findMechWolfSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'mech_wolf');
}

export function canMechWolfLearn(
  seats: PlayerSeat[],
  targetSeat: number | null,
  ruleOverrides: RuleOverrides,
  round: number,
): ActionCheckResult {
  const mechWolf = findMechWolfSeat(seats);
  if (!mechWolf || !mechWolf.isAlive) {
    return { allowed: false, reason: '場上沒有存活的機械狼' };
  }
  if (round !== 1) {
    return { allowed: false, reason: '機械狼僅能在第一晚選擇學習對象' };
  }
  if (targetSeat === null) {
    if (ruleOverrides.mechWolfForceLearnNight1) {
      return { allowed: false, reason: '本局規則規定機械狼第一晚必須學習一名玩家' };
    }
    return { allowed: true };
  }
  if (targetSeat === mechWolf.seatNumber) {
    return { allowed: false, reason: '機械狼不可學習自己' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '學習目標不存在或已出局' };
  }
  return { allowed: true };
}

export function applyMechWolfLearn(
  mechWolfState: MechWolfRuntimeState,
  seats: PlayerSeat[],
  targetSeat: number | null,
): MechWolfRuntimeState {
  if (targetSeat === null) {
    return { ...mechWolfState };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.roleId) {
    return { ...mechWolfState };
  }
  return {
    ...mechWolfState,
    learnedFromSeat: targetSeat,
    learnedRoleId: target.roleId,
  };
}

export function getPsychicCheckResult(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  treasureMasterState?: TreasureMasterRuntimeState,
): PsychicCheckOutcome | null {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.roleId) return null;

  if (target.roleId === 'mech_wolf' && mechWolfState.learnedRoleId) {
    return {
      targetSeat,
      perceivedRoleId: mechWolfState.learnedRoleId,
    };
  }

  if (target.roleId === 'treasure_master' && treasureMasterState?.currentNightCardRoleId) {
    return {
      targetSeat,
      perceivedRoleId: treasureMasterState.currentNightCardRoleId,
    };
  }

  return {
    targetSeat,
    perceivedRoleId: target.roleId,
  };
}

export function getSeerCheckResult(
  seats: PlayerSeat[],
  targetSeat: number,
  options: {
    conversionState?: ConversionRuntimeState;
    thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  } = {},
): SeerCheckOutcome | null {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.roleId) return null;

  // 被種狼感染轉化、被覺醒石像鬼轉化、被傀儡狼傀儡化者、轉狼的超級黑市／野孩子／覺醒孤獨少女／繼承狼影子，以及白蛇／許仙被預言家查驗皆為狼人（查殺）
  if (
    target.statuses.infectedBySeedWolf ||
    target.statuses.convertedByAwakenedGargoyle ||
    target.statuses.isPuppetized ||
    target.roleId === 'white_snake_seer' ||
    target.roleId === 'xu_xian_phantom' ||
    (target.roleId === 'super_black_market_merchant' &&
      options.thirdPartySpecialState?.superBlackMarketTurnedWolf) ||
    (target.roleId === 'wild_child' && options.conversionState?.wildChildTurnedWolf) ||
    (target.roleId === 'awakened_lonely_girl' &&
      (options.conversionState?.awakenedLonelyGirlStatus === 'wolf' ||
        (options.conversionState?.awakenedLonelyGirlStatus === 'inherited' &&
          getRoleById(options.conversionState.awakenedLonelyGirlInheritedRoleId)?.faction ===
            'wolf'))) ||
    (target.roleId === 'shadow' &&
      options.conversionState?.shadowInheritedRoleId &&
      getRoleById(options.conversionState.shadowInheritedRoleId)?.faction === 'wolf')
  ) {
    return {
      targetSeat,
      faction: 'wolf',
    };
  }

  // 隱狼、雪狼、混血兒、咒狐、邱比特與潘朵拉被預言家查驗恆為好人（金水）
  if (
    target.roleId === 'hidden_wolf' ||
    target.roleId === 'snow_wolf' ||
    target.roleId === 'hybrid' ||
    target.roleId === 'cursed_fox' ||
    target.roleId === 'cupid' ||
    target.roleId === 'pandora'
  ) {
    return {
      targetSeat,
      faction: 'good',
    };
  }

  // 南瓜鬼在石像鬼死前被預言家查驗為金水，石像鬼死後轉為查殺
  if (target.roleId === 'pumpkin_ghost') {
    const gargoyle = seats.find((s) => s.roleId === 'gargoyle');
    return {
      targetSeat,
      faction: gargoyle && gargoyle.isAlive ? 'good' : 'wolf',
    };
  }

  // 狼弟在狼兄死前被預言家查驗恆為金水
  if (target.roleId === 'wolf_younger_brother') {
    const wolfBrother = seats.find((s) => s.roleId === 'wolf_brother');
    return {
      targetSeat,
      faction: wolfBrother && wolfBrother.isAlive ? 'good' : 'wolf',
    };
  }

  const role = getRoleById(target.roleId);
  if (!role) return null;

  return {
    targetSeat,
    faction: role.faction === 'wolf' ? 'wolf' : 'good',
  };
}

export function shouldMechWolfJoinWolfTeam(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
): boolean {
  if (mechWolfState.hasJoinedWolfTeam) return true;
  const mechWolf = findMechWolfSeat(seats);
  if (!mechWolf || !mechWolf.isAlive) return false;

  const hasAliveOtherWolf = seats.some((seat) => {
    if (!seat.isAlive || seat.roleId === 'mech_wolf') return false;
    return isSeatEffectiveWolf(seat);
  });

  return !hasAliveOtherWolf;
}

export function syncMechWolfTeamStatus(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
): MechWolfRuntimeState {
  const hasJoinedWolfTeam = shouldMechWolfJoinWolfTeam(seats, mechWolfState);
  if (hasJoinedWolfTeam === mechWolfState.hasJoinedWolfTeam) {
    return mechWolfState;
  }
  return {
    ...mechWolfState,
    hasJoinedWolfTeam,
  };
}

export function canMechWolfUseLearnedSkill(
  mechWolfState: MechWolfRuntimeState,
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const mechWolf = findMechWolfSeat(seats);
  if (!mechWolf || !mechWolf.isAlive) {
    return { allowed: false, reason: '場上沒有存活的機械狼' };
  }
  if (round < 2) {
    return { allowed: false, reason: '機械狼學習的技能自第二晚起才可使用' };
  }
  if (!mechWolfState.learnedRoleId) {
    return { allowed: false, reason: '機械狼尚未學習任何技能' };
  }

  // 不使用技能（null）一律允許
  if (targetSeat === null) {
    return { allowed: true };
  }

  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '技能目標不存在或已出局' };
  }

  switch (mechWolfState.learnedRoleId) {
    case 'witch':
      if (mechWolfState.usedLearnedOneShotSkill) {
        return { allowed: false, reason: '機械狼學到的毒藥已使用完畢' };
      }
      return { allowed: true };

    case 'guard':
      if (mechWolfState.lastGuardedSeat === targetSeat) {
        return { allowed: false, reason: '機械狼學到守衛技能仍不可連續兩晚守護同一人' };
      }
      return { allowed: true };

    case 'wolf':
      if (!mechWolfState.hasJoinedWolfTeam) {
        return { allowed: false, reason: '機械狼學到小狼的額外刀口須等所有小狼皆淘汰、入隊後才能開啟' };
      }
      return { allowed: true };

    case 'psychic':
    case 'seer':
    case 'awakened_seer':
    case 'pure_white_maiden':
      return { allowed: true };

    case 'hunter':
      if (mechWolfState.usedLearnedOneShotSkill) {
        return { allowed: false, reason: '機械狼學到的獵人開槍技能已使用完畢' };
      }
      return { allowed: true };

    case 'wolf_beauty':
      if (targetSeat === mechWolf.seatNumber) {
        return { allowed: false, reason: '不可魅惑自己' };
      }
      if (mechWolfState.lastGuardedSeat === targetSeat) {
        return { allowed: false, reason: '機械狼學到狼美人技能不可連續兩晚魅惑同一人' };
      }
      return { allowed: true };

    case 'dream_catcher':
      if (targetSeat === mechWolf.seatNumber) {
        return { allowed: false, reason: '機械狼學到攝夢人不可對自己攝夢' };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: '所學角色沒有夜間主動技能' };
  }
}
