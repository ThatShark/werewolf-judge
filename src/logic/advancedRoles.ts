import { getRoleById } from '../data/roles';
import type {
  ActionCheckResult,
  BearRoarResult,
  DeathReason,
  MechWolfRuntimeState,
  PlayerSeat,
} from './types';

/**
 * 檢查狼美人魅惑目標是否合法：
 * - 狼美人必須存活
 * - 不可魅惑自己
 * - 不可連續兩晚魅惑同一人
 * - 不可魅惑老流氓（old_rascal）
 */
export function canWolfBeautyCharm(
  seats: PlayerSeat[],
  lastCharmedSeat: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const wolfBeauty = seats.find((seat) => seat.roleId === 'wolf_beauty' && seat.isAlive);
  if (!wolfBeauty) {
    return { allowed: false, reason: '場上沒有存活的狼美人' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (targetSeat === wolfBeauty.seatNumber) {
    return { allowed: false, reason: '狼美人不可魅惑自己' };
  }
  if (lastCharmedSeat === targetSeat) {
    return { allowed: false, reason: '狼美人不可連續兩晚魅惑同一名玩家' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '魅惑目標不存在或已出局' };
  }
  if (target.roleId === 'old_rascal') {
    return { allowed: false, reason: '老流氓免疫狼美人魅惑' };
  }
  return { allowed: true };
}

export interface WolfBeautyCharmDeathResult {
  seats: PlayerSeat[];
  charmedDeathSeat: number | null;
}

/**
 * 狼美人出局時判定魅惑對象是否跟著殉情：
 * - 除非是因為與騎士決鬥而死（knight_duel），狼美人以任何方式淘汰（含最後一狼出局），
 *   前一晚被魅惑的存活對象皆跟著殉情（wolf_beauty_charm），且無法發動技能。
 */
export function applyWolfBeautyCharmDeath(
  seats: PlayerSeat[],
  wolfBeautySeat: number,
  wolfBeautyDeathReason: DeathReason,
  activeCharmedSeat: number | null,
  round: number,
): WolfBeautyCharmDeathResult {
  const wolfBeauty = seats.find((seat) => seat.seatNumber === wolfBeautySeat);
  if (!wolfBeauty || wolfBeauty.roleId !== 'wolf_beauty') {
    return { seats, charmedDeathSeat: null };
  }

  if (wolfBeautyDeathReason === 'knight_duel') {
    return { seats, charmedDeathSeat: null };
  }

  if (activeCharmedSeat === null) {
    return { seats, charmedDeathSeat: null };
  }

  const charmed = seats.find((seat) => seat.seatNumber === activeCharmedSeat);
  if (!charmed || !charmed.isAlive) {
    return { seats, charmedDeathSeat: null };
  }

  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === activeCharmedSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'wolf_beauty_charm' as const,
          deathRound: round,
        }
      : seat,
  );

  return {
    seats: updatedSeats,
    charmedDeathSeat: activeCharmedSeat,
  };
}

/**
 * 檢查攝夢人攝夢目標是否合法：
 * - 攝夢人必須存活
 * - 每晚強制選擇一名自己以外的存活玩家（除非場上無其他存活玩家）
 */
export function canDreamCatcherDream(
  seats: PlayerSeat[],
  targetSeat: number | null,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const dreamCatcher = seats.find((seat) => seat.roleId === 'dream_catcher' && seat.isAlive);
  if (!dreamCatcher) {
    return { allowed: false, reason: '場上沒有存活的攝夢人' };
  }

  const otherAlivePlayers = seats.filter(
    (seat) => seat.isAlive && seat.seatNumber !== dreamCatcher.seatNumber,
  );

  if (targetSeat === null) {
    if (options.allowSkip || otherAlivePlayers.length === 0) {
      return { allowed: true };
    }
    return { allowed: false, reason: '攝夢人每晚必須選擇一名自己以外的存活玩家成為夢遊者' };
  }

  if (targetSeat === dreamCatcher.seatNumber) {
    return { allowed: false, reason: '攝夢人不可選擇自己成為夢遊者' };
  }

  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '攝夢目標不存在或已出局' };
  }

  return { allowed: true };
}

function isSeatWolfForBear(seat: PlayerSeat, mechWolfState: MechWolfRuntimeState): boolean {
  if (seat.infectedBySeedWolf) return true;
  if (!seat.roleId) return false;
  if (seat.roleId === 'mech_wolf') {
    if (!mechWolfState.learnedRoleId) {
      return true;
    }
    const learnedRole = getRoleById(mechWolfState.learnedRoleId);
    return learnedRole?.faction === 'wolf';
  }
  const role = getRoleById(seat.roleId);
  return role?.faction === 'wolf';
}

/**
 * 天亮自動判定熊是否咆哮：
 * - 若場上無熊，回傳 null。
 * - 若熊已出局、已被種狼感染失去技能，或當晚遭夢魘恐懼，回傳 roared = false。
 * - 若熊存活，沿順時針（左）與逆時針（右）尋找最近依然存活的兩名鄰居，
 *   只要其中至少一人屬於狼人陣營（含被種狼感染者；機械狼已學習好人身分則視同好人），熊即咆哮。
 */
export function evaluateBearRoar(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  fearedSeat: number | null = null,
): BearRoarResult | null {
  const sortedSeats = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const bearIndex = sortedSeats.findIndex((seat) => seat.roleId === 'bear');
  if (bearIndex === -1) {
    return null;
  }

  const bear = sortedSeats[bearIndex];
  if (!bear.isAlive) {
    return {
      bearSeat: bear.seatNumber,
      bearAlive: false,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      roared: false,
      reason: '熊已出局，天亮不會咆哮',
    };
  }
  if (bear.infectedBySeedWolf) {
    return {
      bearSeat: bear.seatNumber,
      bearAlive: true,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      roared: false,
      reason: '熊已被種狼感染失去原有技能，天亮不會咆哮',
    };
  }
  if (fearedSeat !== null && bear.seatNumber === fearedSeat) {
    return {
      bearSeat: bear.seatNumber,
      bearAlive: true,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      roared: false,
      reason: '熊昨晚遭夢魘恐懼，天亮不會咆哮',
    };
  }

  const total = sortedSeats.length;
  let leftNeighbor: PlayerSeat | null = null;
  let rightNeighbor: PlayerSeat | null = null;

  for (let offset = 1; offset < total; offset += 1) {
    const candidate = sortedSeats[(bearIndex + offset) % total];
    if (candidate.isAlive) {
      leftNeighbor = candidate;
      break;
    }
  }

  for (let offset = 1; offset < total; offset += 1) {
    const candidate = sortedSeats[(bearIndex - offset + total * 2) % total];
    if (candidate.isAlive) {
      rightNeighbor = candidate;
      break;
    }
  }

  const leftIsWolf = leftNeighbor ? isSeatWolfForBear(leftNeighbor, mechWolfState) : false;
  const rightIsWolf = rightNeighbor ? isSeatWolfForBear(rightNeighbor, mechWolfState) : false;
  const roared = leftIsWolf || rightIsWolf;

  const neighborDesc = `左鄰 ${leftNeighbor?.seatNumber ?? '無'} 號、右鄰 ${rightNeighbor?.seatNumber ?? '無'} 號`;

  return {
    bearSeat: bear.seatNumber,
    bearAlive: true,
    leftNeighborSeat: leftNeighbor?.seatNumber ?? null,
    rightNeighborSeat: rightNeighbor?.seatNumber ?? null,
    roared,
    reason: roared
      ? `熊咆哮了（${neighborDesc} 中存在狼人陣營）`
      : `熊沒有咆哮（${neighborDesc} 皆非狼人陣營）`,
  };
}
