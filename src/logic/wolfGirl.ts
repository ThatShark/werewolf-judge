import { getRoleById } from '../data/roles';
import { syncMechWolfTeamStatus } from './mechWolf';
import type {
  ActionCheckResult,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  WolfGirlExplodeResult,
  WolfGirlRuntimeState,
} from './types';
import { checkVictory } from './victory';

export function createInitialWolfGirlState(): WolfGirlRuntimeState {
  return {
    confessedSeat: null,
    confessSuccess: null,
    alignedWithWolf: false,
  };
}

export function findWolfGirlSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'wolf_girl');
}

/**
 * 檢核狼女孩第一晚表白目標是否合法：
 * - 狼女孩必須存活且為第一晚（round === 1）
 * - 必須選擇一名非狼人存活玩家（不可選自己、不可選小狼等狼陣營）
 */
export function canWolfGirlConfess(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const wolfGirl = findWolfGirlSeat(seats);
  if (!wolfGirl || !wolfGirl.isAlive) {
    return { allowed: false, reason: '場上沒有存活的狼女孩' };
  }
  if (round !== 1) {
    return { allowed: false, reason: '狼女孩僅能在第一晚選擇表白對象' };
  }
  if (targetSeat === null) {
    if (options.allowSkip) {
      return { allowed: true };
    }
    return { allowed: false, reason: '狼女孩第一晚必須選擇一名非狼人玩家表白' };
  }
  if (targetSeat === wolfGirl.seatNumber) {
    return { allowed: false, reason: '狼女孩不可向自己表白' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '表白目標不存在或已出局' };
  }
  const targetRole = getRoleById(target.roleId);
  if (targetRole?.faction === 'wolf') {
    return { allowed: false, reason: '狼女孩必須選擇非狼人玩家表白' };
  }
  return { allowed: true };
}

/**
 * 套用狼女孩首夜表白結果：
 * - 若被表白者為平民（category === 'villager'）：表白成功，勝利條件與狼隊相同，但身分仍維持平民。
 * - 若被表白者為神職：表白失敗，陣營、技能與勝利條件不變。
 */
export function applyWolfGirlConfess(
  state: WolfGirlRuntimeState,
  seats: PlayerSeat[],
  targetSeat: number | null,
): WolfGirlRuntimeState {
  if (targetSeat === null) {
    return { ...state };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.roleId) {
    return { ...state };
  }
  const targetRole = getRoleById(target.roleId);
  const isVillager = targetRole?.category === 'villager';

  return {
    confessedSeat: targetSeat,
    confessSuccess: isVillager,
    alignedWithWolf: isVillager,
  };
}

/**
 * 狼女孩自爆觸發「愛情破裂」：
 * - 可於白天發言階段任意時候，或是放逐投票結束後（即使狼女孩為最高票出局）翻牌自爆。
 * - 之前的表白對象（不論平民或神職）若仍存活則直接出局（deathReason: 'wolf_girl_breakup'），且無法發動技能。
 * - 本輪放逐投票直接作廢，強制進入夜晚；狼女孩於當晚完成點刀後才正式死亡（pendingSelfExplodeSeat）。
 */
export function resolveWolfGirlExplode(
  seats: PlayerSeat[],
  wolfGirlSeat: number,
  wolfGirlState: WolfGirlRuntimeState,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  options: { voidExileVote?: boolean } = {},
): WolfGirlExplodeResult {
  const wolfGirl = seats.find((seat) => seat.seatNumber === wolfGirlSeat);
  if (!wolfGirl || !wolfGirl.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      seats,
      wolfGirlSeat,
      breakupDeathSeat: null,
      voidedExileVote: false,
      pendingSelfExplodeSeat: null,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  if (wolfGirl.roleId !== 'wolf_girl') {
    return {
      allowed: false,
      reason: '僅狼女孩可發動愛情破裂自爆技能',
      seats,
      wolfGirlSeat,
      breakupDeathSeat: null,
      voidedExileVote: false,
      pendingSelfExplodeSeat: null,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  let updatedSeats = seats.map((seat) =>
    seat.seatNumber === wolfGirlSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'self_explode' as const,
          deathRound: round,
        }
      : { ...seat },
  );
  let breakupDeathSeat: number | null = null;

  if (wolfGirlState.confessedSeat !== null) {
    const confessed = updatedSeats.find((s) => s.seatNumber === wolfGirlState.confessedSeat);
    if (confessed && confessed.isAlive) {
      breakupDeathSeat = confessed.seatNumber;
      updatedSeats = updatedSeats.map((seat) =>
        seat.seatNumber === breakupDeathSeat
          ? {
              ...seat,
              isAlive: false,
              deathReason: 'wolf_girl_breakup' as const,
              deathRound: round,
            }
          : seat,
      );
    }
  }

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides);

  return {
    allowed: true,
    seats: updatedSeats,
    wolfGirlSeat,
    breakupDeathSeat,
    voidedExileVote: options.voidExileVote ?? true,
    pendingSelfExplodeSeat: null,
    mechWolfState: nextMechWolfState,
    victory,
  };
}
