import { getRoleById } from '../data/roles';
import type {
  ActionCheckResult,
  MechWolfRuntimeState,
  PlayerSeat,
  PsychicCheckOutcome,
  RuleOverrides,
  SeerCheckOutcome,
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
): SeerCheckOutcome | null {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.roleId) return null;

  // 被種狼感染轉化為狼人者（含被感染的隱狼）被預言家查驗皆為狼人（查殺）
  if (target.infectedBySeedWolf) {
    return {
      targetSeat,
      faction: 'wolf',
    };
  }

  // 隱狼、雪狼、混血兒與咒狐被預言家查驗恆為好人（金水）
  if (
    target.roleId === 'hidden_wolf' ||
    target.roleId === 'snow_wolf' ||
    target.roleId === 'hybrid' ||
    target.roleId === 'cursed_fox'
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
    const role = getRoleById(seat.roleId);
    return role?.faction === 'wolf';
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
      return { allowed: true };

    default:
      return { allowed: false, reason: '所學角色沒有夜間主動技能' };
  }
}
