import { getRoleById } from '../data/roles';
import { applyWolfBeautyCharmDeath } from './advancedRoles';
import { syncMechWolfTeamStatus } from './mechWolf';
import type {
  DayExileResult,
  DeathReason,
  KnightDuelResult,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  SelfExplodeResult,
  ShootEligibility,
  ShootResolutionResult,
  WhiteWolfKingExplodeResult,
} from './types';
import { checkVictory } from './victory';

const HUNTER_SHOOTABLE_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'milk_pierce',
  'wolf_king_shoot',
  'exiled',
  'mech_wolf_kill',
]);

const WOLF_KING_SHOOTABLE_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'hunter_shoot',
  'milk_pierce',
  'exiled',
]);

export function checkCanShoot(
  seats: PlayerSeat[],
  shooterSeat: number,
  deathReason: DeathReason,
): ShootEligibility | null {
  const shooter = seats.find((seat) => seat.seatNumber === shooterSeat);
  if (!shooter || (shooter.roleId !== 'hunter' && shooter.roleId !== 'wolf_king')) {
    return null;
  }

  if (shooter.roleId === 'hunter') {
    if (deathReason === 'witch_poison' || deathReason === 'mech_wolf_poison') {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人被毒殺，無法開槍',
      };
    }
    if (HUNTER_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: true,
        reason: '獵人符合開槍條件，可開槍帶走一名存活玩家或選擇壓槍',
      };
    }
    return {
      seatNumber: shooterSeat,
      roleId: 'hunter',
      canShoot: false,
      reason: '不符合獵人開槍條件',
    };
  }

  // wolf_king
  if (deathReason === 'self_explode') {
    return {
      seatNumber: shooterSeat,
      roleId: 'wolf_king',
      canShoot: false,
      reason: '狼王自爆，無法開槍',
    };
  }
  if (deathReason === 'witch_poison' || deathReason === 'mech_wolf_poison') {
    return {
      seatNumber: shooterSeat,
      roleId: 'wolf_king',
      canShoot: false,
      reason: '狼王被毒殺，無法開槍',
    };
  }

  const otherAliveWolves = seats.filter((seat) => {
    if (seat.seatNumber === shooterSeat || !seat.isAlive) return false;
    const role = getRoleById(seat.roleId);
    return role?.faction === 'wolf';
  });

  if (otherAliveWolves.length === 0) {
    return {
      seatNumber: shooterSeat,
      roleId: 'wolf_king',
      canShoot: false,
      reason: '狼王作為最後一隻狼出局，無法開槍',
    };
  }

  if (WOLF_KING_SHOOTABLE_REASONS.has(deathReason)) {
    return {
      seatNumber: shooterSeat,
      roleId: 'wolf_king',
      canShoot: true,
      reason: '狼王符合開槍條件，可開槍帶走一名存活玩家或選擇壓槍',
    };
  }

  return {
    seatNumber: shooterSeat,
    roleId: 'wolf_king',
    canShoot: false,
    reason: '不符合狼王開槍條件',
  };
}

export function resolveShoot(
  seats: PlayerSeat[],
  shooterSeat: number,
  targetSeat: number,
  shooterDeathReason: DeathReason,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  activeCharmedSeat: number | null = null,
): ShootResolutionResult {
  const eligibility = checkCanShoot(seats, shooterSeat, shooterDeathReason);
  if (!eligibility || !eligibility.canShoot) {
    throw new Error(eligibility?.reason ?? '該玩家無法開槍');
  }
  if (shooterSeat === targetSeat) {
    throw new Error('不可對自己開槍');
  }

  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    throw new Error('開槍目標不存在或已出局');
  }

  const shootReason: 'hunter_shoot' | 'wolf_king_shoot' =
    eligibility.roleId === 'hunter' ? 'hunter_shoot' : 'wolf_king_shoot';

  let updatedSeats = seats.map((seat) =>
    seat.seatNumber === targetSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: shootReason,
          deathRound: round,
        }
      : seat,
  );

  // 若開槍帶走狼美人，前一晚魅惑對象跟著殉情（且無法發動技能）
  const charmResult = applyWolfBeautyCharmDeath(
    updatedSeats,
    targetSeat,
    shootReason,
    activeCharmedSeat,
    round,
  );
  updatedSeats = charmResult.seats;

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(
    updatedSeats,
    charmResult.charmedDeathSeat !== null
      ? { ...ruleOverrides, wolfKillPriority: true }
      : ruleOverrides,
  );
  const chainedShootEligibility =
    victory.winner === null ? checkCanShoot(updatedSeats, targetSeat, shootReason) : null;

  return {
    seats: updatedSeats,
    shooterSeat,
    targetSeat,
    deathReason: shootReason,
    charmedDeathSeat: charmResult.charmedDeathSeat,
    chainedShootEligibility,
    mechWolfState: nextMechWolfState,
    victory,
  };
}

export function resolveDayExile(
  seats: PlayerSeat[],
  targetSeat: number,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  activeCharmedSeat: number | null = null,
): DayExileResult {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    throw new Error('放逐目標不存在或已出局');
  }

  // 白痴白天首次被放逐：翻牌免死並失去投票權
  if (target.roleId === 'idiot' && !target.idiotRevealed) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            idiotRevealed: true,
          }
        : seat,
    );

    const victory = checkVictory(updatedSeats, ruleOverrides);
    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: true,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      victory,
    };
  }

  let updatedSeats = seats.map((seat) =>
    seat.seatNumber === targetSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'exiled' as const,
          deathRound: round,
        }
      : seat,
  );

  // 若放逐出局者為狼美人，前一晚魅惑對象跟著殉情（無技能）
  const charmResult = applyWolfBeautyCharmDeath(
    updatedSeats,
    targetSeat,
    'exiled',
    activeCharmedSeat,
    round,
  );
  updatedSeats = charmResult.seats;

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const shootEligibility = checkCanShoot(updatedSeats, targetSeat, 'exiled');
  const victory = checkVictory(
    updatedSeats,
    charmResult.charmedDeathSeat !== null
      ? { ...ruleOverrides, wolfKillPriority: true }
      : ruleOverrides,
  );

  return {
    seats: updatedSeats,
    exiledSeat: targetSeat,
    idiotRevealed: false,
    charmedDeathSeat: charmResult.charmedDeathSeat,
    shootEligibility,
    mechWolfState: nextMechWolfState,
    victory,
  };
}

export function resolveSelfExplode(
  seats: PlayerSeat[],
  wolfSeat: number,
): SelfExplodeResult {
  const player = seats.find((seat) => seat.seatNumber === wolfSeat);
  if (!player || !player.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'mech_wolf') {
    return {
      allowed: false,
      reason: '機械狼全程不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'wolf_beauty') {
    return {
      allowed: false,
      reason: '狼美人不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  const role = getRoleById(player.roleId);
  if (!role || role.faction !== 'wolf') {
    return {
      allowed: false,
      reason: '僅狼人陣營可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  return {
    allowed: true,
    pendingSelfExplodeSeat: wolfSeat,
  };
}

/**
 * 白狼王白天自爆帶走一名存活玩家（被帶走者無法發動技能，強制進入夜晚；白狼王於當晚點刀後死亡）。
 */
export function resolveWhiteWolfKingExplode(
  seats: PlayerSeat[],
  wolfSeat: number,
  targetSeat: number | null,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  activeCharmedSeat: number | null = null,
): WhiteWolfKingExplodeResult {
  const wolf = seats.find((seat) => seat.seatNumber === wolfSeat);
  if (!wolf || !wolf.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      seats,
      wolfSeat,
      targetSeat,
      charmedDeathSeat: null,
      pendingSelfExplodeSeat: null,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  if (wolf.roleId !== 'white_wolf_king') {
    return {
      allowed: false,
      reason: '僅白狼王可發動自爆帶人技能',
      seats,
      wolfSeat,
      targetSeat,
      charmedDeathSeat: null,
      pendingSelfExplodeSeat: null,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  let updatedSeats = seats.map((seat) => ({ ...seat }));
  let charmedDeathSeat: number | null = null;

  if (targetSeat !== null) {
    if (targetSeat === wolfSeat) {
      return {
        allowed: false,
        reason: '白狼王不可指定自己作為帶走目標',
        seats,
        wolfSeat,
        targetSeat,
        charmedDeathSeat: null,
        pendingSelfExplodeSeat: null,
        mechWolfState,
        victory: { winner: null, winReason: null },
      };
    }
    const target = updatedSeats.find((seat) => seat.seatNumber === targetSeat);
    if (!target || !target.isAlive) {
      return {
        allowed: false,
        reason: '帶走目標不存在或已出局',
        seats,
        wolfSeat,
        targetSeat,
        charmedDeathSeat: null,
        pendingSelfExplodeSeat: null,
        mechWolfState,
        victory: { winner: null, winReason: null },
      };
    }

    updatedSeats = updatedSeats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: false,
            deathReason: 'white_wolf_king_explode' as const,
            deathRound: round,
          }
        : seat,
    );

    const charmResult = applyWolfBeautyCharmDeath(
      updatedSeats,
      targetSeat,
      'white_wolf_king_explode',
      activeCharmedSeat,
      round,
    );
    updatedSeats = charmResult.seats;
    charmedDeathSeat = charmResult.charmedDeathSeat;
  }

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides);

  return {
    allowed: true,
    seats: updatedSeats,
    wolfSeat,
    targetSeat,
    charmedDeathSeat,
    pendingSelfExplodeSeat: wolfSeat,
    mechWolfState: nextMechWolfState,
    victory,
  };
}

/**
 * 騎士白天翻牌決鬥一名存活玩家（整局限一次）：
 * - 撞狼：對方即時出局（knight_duel）且不能發動死亡技能（狼王不開槍、狼美人不殉情），未結束則直接入夜。
 * - 撞好人（或非狼）：騎士以死謝罪（knight_duel_fail），未結束則繼續白天流程。
 */
export function resolveKnightDuel(
  seats: PlayerSeat[],
  knightSeat: number,
  targetSeat: number,
  knightDuelUsed: boolean,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
): KnightDuelResult {
  const knight = seats.find((seat) => seat.seatNumber === knightSeat);
  if (!knight || !knight.isAlive) {
    return {
      allowed: false,
      reason: '騎士不存在或已出局',
      seats,
      knightSeat,
      targetSeat,
      targetWasWolf: false,
      eliminatedSeat: null,
      deathReason: null,
      enterNightImmediately: false,
      knightDuelUsed,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }
  if (knight.roleId !== 'knight') {
    return {
      allowed: false,
      reason: '僅騎士可發動翻牌決鬥',
      seats,
      knightSeat,
      targetSeat,
      targetWasWolf: false,
      eliminatedSeat: null,
      deathReason: null,
      enterNightImmediately: false,
      knightDuelUsed,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }
  if (knightDuelUsed) {
    return {
      allowed: false,
      reason: '騎士本局已使用過決鬥技能',
      seats,
      knightSeat,
      targetSeat,
      targetWasWolf: false,
      eliminatedSeat: null,
      deathReason: null,
      enterNightImmediately: false,
      knightDuelUsed,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }
  if (targetSeat === knightSeat) {
    return {
      allowed: false,
      reason: '騎士不可與自己決鬥',
      seats,
      knightSeat,
      targetSeat,
      targetWasWolf: false,
      eliminatedSeat: null,
      deathReason: null,
      enterNightImmediately: false,
      knightDuelUsed,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return {
      allowed: false,
      reason: '決鬥目標不存在或已出局',
      seats,
      knightSeat,
      targetSeat,
      targetWasWolf: false,
      eliminatedSeat: null,
      deathReason: null,
      enterNightImmediately: false,
      knightDuelUsed,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  const targetRole = getRoleById(target.roleId);
  const targetWasWolf = targetRole?.faction === 'wolf';
  const eliminatedSeat = targetWasWolf ? targetSeat : knightSeat;
  const deathReason: 'knight_duel' | 'knight_duel_fail' = targetWasWolf
    ? 'knight_duel'
    : 'knight_duel_fail';

  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === eliminatedSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason,
          deathRound: round,
        }
      : seat,
  );

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides);

  return {
    allowed: true,
    seats: updatedSeats,
    knightSeat,
    targetSeat,
    targetWasWolf,
    eliminatedSeat,
    deathReason,
    enterNightImmediately: targetWasWolf && victory.winner === null,
    knightDuelUsed: true,
    mechWolfState: nextMechWolfState,
    victory,
  };
}
