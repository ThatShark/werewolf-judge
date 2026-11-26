import { getRoleById } from '../data/roles';
import { isSeatEffectiveWolf } from './factionHelpers';
import { syncMechWolfTeamStatus } from './mechWolf';
import type {
  ActionCheckResult,
  MaskedDelayedDeathResult,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  TreasureMasterAffiliation,
  TreasureMasterRuntimeState,
} from './types';
import { checkVictory } from './victory';

export function createInitialTreasureMasterState(): TreasureMasterRuntimeState {
  return {
    bottomCards: [],
    affiliation: null,
    hasJoinedWolfTeam: false,
    lastChosenCardRoleId: null,
    currentNightCardRoleId: null,
    pendingExileDeathNextNight: false,
  };
}

export function findTreasureMasterSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'treasure_master');
}

/**
 * 檢核盜寶大師首夜三張底牌是否符合原文規則並計算陣營歸屬：
 * - 不存在雙神盜寶狼、雙平民盜寶狼：只要含狼牌，必為「1 狼 + 1 神 + 1 平民」，歸屬狼人陣營（wolf）。
 * - 好人盜寶（不含狼牌）必為「雙神一民」（歸屬神職邊 god）或「雙民一神」（歸屬平民邊 villager）。
 */
export function validateTreasureMasterBottomCards(
  bottomCards: string[],
): ActionCheckResult & { affiliation: TreasureMasterAffiliation } {
  if (bottomCards.length !== 3) {
    return {
      allowed: false,
      reason: '盜寶大師首夜底牌必須正好為 3 張身分牌',
      affiliation: null,
    };
  }

  let wolfCount = 0;
  let godCount = 0;
  let villagerCount = 0;

  for (const roleId of bottomCards) {
    const role = getRoleById(roleId);
    if (!role) {
      return {
        allowed: false,
        reason: `底牌包含不存在的角色 ID：${roleId}`,
        affiliation: null,
      };
    }
    if (role.faction === 'wolf') wolfCount += 1;
    else if (role.category === 'god') godCount += 1;
    else if (role.category === 'villager') villagerCount += 1;
  }

  if (wolfCount > 0) {
    if (wolfCount === 1 && godCount === 1 && villagerCount === 1) {
      return { allowed: true, affiliation: 'wolf' };
    }
    return {
      allowed: false,
      reason: '盜寶狼底牌必須為一狼一神一平民（不存在雙神盜寶狼或雙平民盜寶狼）',
      affiliation: null,
    };
  }

  if (godCount === 2 && villagerCount === 1) {
    return { allowed: true, affiliation: 'god' };
  }
  if (villagerCount === 2 && godCount === 1) {
    return { allowed: true, affiliation: 'villager' };
  }

  return {
    allowed: false,
    reason: '好人盜寶底牌必須為雙神一民或雙民一神',
    affiliation: null,
  };
}

/**
 * 以三張合法底牌初始化盜寶大師狀態。
 */
export function initTreasureMasterBottomCards(bottomCards: string[]): TreasureMasterRuntimeState {
  const check = validateTreasureMasterBottomCards(bottomCards);
  if (!check.allowed) {
    throw new Error(check.reason ?? '盜寶大師底牌配置不合法');
  }
  return {
    ...createInitialTreasureMasterState(),
    bottomCards: [...bottomCards],
    affiliation: check.affiliation,
  };
}

/**
 * 檢核盜寶大師當晚選擇的底牌技能是否合法：
 * - 必須屬於三張底牌之一
 * - 連續兩晚不能選擇相同技能
 */
export function canTreasureMasterChooseCard(
  state: TreasureMasterRuntimeState,
  seats: PlayerSeat[],
  cardRoleId: string | null,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const tm = findTreasureMasterSeat(seats);
  if (!tm || !tm.isAlive) {
    return { allowed: false, reason: '場上沒有存活的盜寶大師' };
  }
  if (cardRoleId === null) {
    if (options.allowSkip || state.bottomCards.length === 0) {
      return { allowed: true };
    }
    return { allowed: false, reason: '盜寶大師每晚必須選擇一張底牌技能' };
  }
  if (state.bottomCards.length > 0 && !state.bottomCards.includes(cardRoleId)) {
    return { allowed: false, reason: '所選技能不屬於盜寶大師的三張底牌' };
  }
  if (state.lastChosenCardRoleId !== null && state.lastChosenCardRoleId === cardRoleId) {
    return { allowed: false, reason: '盜寶大師連續兩晚不可選擇相同技能' };
  }
  return { allowed: true };
}

export function applyTreasureMasterCardChoice(
  state: TreasureMasterRuntimeState,
  cardRoleId: string | null,
): TreasureMasterRuntimeState {
  if (cardRoleId === null) {
    return { ...state };
  }
  return {
    ...state,
    lastChosenCardRoleId: cardRoleId,
    currentNightCardRoleId: cardRoleId,
  };
}

/**
 * 判斷盜寶狼是否應入狼隊帶刀：
 * - 必須是盜寶狼（affiliation === 'wolf'）且仍存活
 * - 場上所有其他狼人皆已淘汰
 */
export function shouldTreasureMasterJoinWolfTeam(
  seats: PlayerSeat[],
  state: TreasureMasterRuntimeState,
): boolean {
  if (state.affiliation !== 'wolf') return false;
  if (state.hasJoinedWolfTeam) return true;
  const tm = findTreasureMasterSeat(seats);
  if (!tm || !tm.isAlive) return false;

  const hasAliveOtherWolf = seats.some((seat) => {
    if (!seat.isAlive || seat.roleId === 'treasure_master') return false;
    return isSeatEffectiveWolf(seat);
  });

  return !hasAliveOtherWolf;
}

export function syncTreasureMasterTeamStatus(
  seats: PlayerSeat[],
  state: TreasureMasterRuntimeState,
): TreasureMasterRuntimeState {
  const hasJoinedWolfTeam = shouldTreasureMasterJoinWolfTeam(seats, state);
  if (hasJoinedWolfTeam === state.hasJoinedWolfTeam) {
    return state;
  }
  return {
    ...state,
    hasJoinedWolfTeam,
  };
}

/**
 * 判斷被放逐目標是否為「最後一狼且當晚切換為蒙面人的盜寶蒙面狼」：
 * 若成立，白天被放逐時暫時不死，可在隔夜再刀一人後才正式死亡（類似血月使徒）。
 */
export function isTreasureMasterLastWolfMasked(
  seats: PlayerSeat[],
  targetSeat: number,
  state?: TreasureMasterRuntimeState,
): boolean {
  if (!state || state.affiliation !== 'wolf') return false;
  if (state.currentNightCardRoleId !== 'masked_villager') return false;
  if (state.pendingExileDeathNextNight) return false;

  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive || target.roleId !== 'treasure_master') return false;

  const otherAliveWolves = seats.filter((seat) => {
    if (!seat.isAlive || seat.seatNumber === targetSeat) return false;
    return isSeatEffectiveWolf(seat);
  });

  return otherAliveWolves.length === 0;
}

/**
 * 蒙面人於第二天白天發言結束後觸發正式死亡（解除負傷狀態並重算勝負）。
 */
export function resolveMaskedVillagerDelayedDeath(
  seats: PlayerSeat[],
  seatNumber: number,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  treasureMasterState?: TreasureMasterRuntimeState,
): MaskedDelayedDeathResult {
  const target = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!target || !target.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      seats,
      eliminatedSeat: null,
      mechWolfState,
      treasureMasterState,
      victory: { winner: null, winReason: null },
    };
  }
  if (!target.maskedDelayedDeath) {
    return {
      allowed: false,
      reason: '該玩家目前未處於蒙面人負傷延遲死亡狀態',
      seats,
      eliminatedSeat: null,
      mechWolfState,
      treasureMasterState,
      victory: { winner: null, winReason: null },
    };
  }

  const deathReason = target.maskedDelayedDeathReason ?? 'masked_delayed_death';
  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === seatNumber
      ? {
          ...seat,
          isAlive: false,
          deathReason,
          deathRound: round,
          maskedDelayedDeath: false,
        }
      : seat,
  );

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const nextTreasureMasterState = treasureMasterState
    ? syncTreasureMasterTeamStatus(updatedSeats, treasureMasterState)
    : undefined;
  const victory = checkVictory(updatedSeats, ruleOverrides, nextTreasureMasterState);

  return {
    allowed: true,
    seats: updatedSeats,
    eliminatedSeat: seatNumber,
    mechWolfState: nextMechWolfState,
    treasureMasterState: nextTreasureMasterState,
    victory,
  };
}
