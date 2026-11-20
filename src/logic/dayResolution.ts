import { getRoleById } from '../data/roles';
import { syncMechWolfTeamStatus } from './mechWolf';
import type {
  DayExileResult,
  DeathReason,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  SelfExplodeResult,
  ShootEligibility,
  ShootResolutionResult,
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

  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === targetSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: shootReason,
          deathRound: round,
        }
      : seat,
  );

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides);
  const chainedShootEligibility =
    victory.winner === null ? checkCanShoot(updatedSeats, targetSeat, shootReason) : null;

  return {
    seats: updatedSeats,
    shooterSeat,
    targetSeat,
    deathReason: shootReason,
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
      shootEligibility: null,
      mechWolfState,
      victory,
    };
  }

  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === targetSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'exiled' as const,
          deathRound: round,
        }
      : seat,
  );

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const shootEligibility = checkCanShoot(updatedSeats, targetSeat, 'exiled');
  const victory = checkVictory(updatedSeats, ruleOverrides);

  return {
    seats: updatedSeats,
    exiledSeat: targetSeat,
    idiotRevealed: false,
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
