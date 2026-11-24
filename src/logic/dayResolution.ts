import { getRoleById } from '../data/roles';
import { applyWolfBeautyCharmDeath } from './advancedRoles';
import {
  isBloodMoonLastWolfExileSurvive,
  isOldRascalDelayableDeath,
} from './combatRoles';
import { canGoodSelfExplode, isDemonWolfNightShootImmune } from './inspectionRoles';
import { isPhantomWolfInvincible } from './finalBatchRoles';
import {
  isWarWolfImmuneToDeath,
  shouldWhiteCatSurviveDeath,
} from './interferenceRoles';
import { syncMechWolfTeamStatus } from './mechWolf';
import {
  isEvilKnightNightShootImmune,
  isSeatWolfFaction,
} from './topFiveRoles';
import {
  isTreasureMasterLastWolfMasked,
  syncTreasureMasterTeamStatus,
} from './treasureMaster';
import type {
  DayExileResult,
  DeathReason,
  FinalBatchRuntimeState,
  GoodSelfExplodeResult,
  KnightDuelResult,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  SelfExplodeResult,
  ShootEligibility,
  ShootResolutionResult,
  TreasureMasterRuntimeState,
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
  options: { fearedSeat?: number | null } = {},
): ShootEligibility | null {
  const shooter = seats.find((seat) => seat.seatNumber === shooterSeat);
  if (!shooter || (shooter.roleId !== 'hunter' && shooter.roleId !== 'wolf_king')) {
    return null;
  }

  // 被種狼感染轉化為狼人後失去原有神職技能（不可開槍）
  if (shooter.infectedBySeedWolf && shooter.roleId === 'hunter') {
    return {
      seatNumber: shooterSeat,
      roleId: 'hunter',
      canShoot: false,
      reason: '獵人已被種狼感染失去原有技能，無法開槍',
    };
  }

  if (shooter.roleId === 'hunter') {
    if (
      options.fearedSeat === shooterSeat &&
      deathReason !== 'exiled' &&
      deathReason !== 'wolf_king_shoot'
    ) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人昨晚遭夢魘恐懼，晚上倒牌無法開槍',
      };
    }
    if (
      deathReason === 'witch_poison' ||
      deathReason === 'poisoner_poison' ||
      deathReason === 'mech_wolf_poison'
    ) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人被毒殺，無法開槍',
      };
    }
    if (deathReason === 'wolf_girl_breakup') {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人因愛情破裂出局，無法開槍',
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
  if (
    deathReason === 'witch_poison' ||
    deathReason === 'poisoner_poison' ||
    deathReason === 'mech_wolf_poison'
  ) {
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

  // 惡靈騎士／惡魔免疫夜間傷害、戰狼免疫所有神職傷害、白貓翻牌免死
  const whiteCatCheck = shouldWhiteCatSurviveDeath(target, shootReason);
  if (
    isEvilKnightNightShootImmune(target, eligibility.roleId, shooterDeathReason) ||
    isDemonWolfNightShootImmune(target, eligibility.roleId, shooterDeathReason) ||
    isWarWolfImmuneToDeath(target, shootReason) ||
    whiteCatCheck.survive
  ) {
    const survivedSeats = whiteCatCheck.newlyRevealed
      ? seats.map((seat) =>
          seat.seatNumber === targetSeat ? { ...seat, whiteCatRevealed: true } : { ...seat },
        )
      : seats.map((seat) => ({ ...seat }));
    const victory = checkVictory(survivedSeats, ruleOverrides);
    return {
      seats: survivedSeats,
      shooterSeat,
      targetSeat,
      deathReason: shootReason,
      targetSurvived: true,
      charmedDeathSeat: null,
      chainedShootEligibility: null,
      mechWolfState,
      victory,
    };
  }

  // 老流氓被獵人射殺進入負傷延遲死亡狀態（隔天發言結束後才出局）
  if (isOldRascalDelayableDeath(target, shootReason)) {
    const delayedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat ? { ...seat, oldRascalDelayedDeath: true } : { ...seat },
    );
    return {
      seats: delayedSeats,
      shooterSeat,
      targetSeat,
      deathReason: shootReason,
      targetSurvived: true,
      charmedDeathSeat: null,
      chainedShootEligibility: null,
      mechWolfState,
      victory: checkVictory(delayedSeats, ruleOverrides),
    };
  }

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
  treasureMasterState?: TreasureMasterRuntimeState,
  finalBatchState?: FinalBatchRuntimeState,
): DayExileResult {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    throw new Error('放逐目標不存在或已出局');
  }

  // 怪盜狼王處於「無敵」期間免疫公投放逐出局
  if (isPhantomWolfInvincible(target, finalBatchState)) {
    return {
      seats: seats.map((s) => ({ ...s })),
      exiledSeat: targetSeat,
      idiotRevealed: false,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      treasureMasterState,
      victory: { winner: null, winReason: null },
    };
  }

  // 盜寶蒙面狼作為最後一狼切換成蒙面人並被放逐時，暫時不死且可於隔夜再刀一人（類似血月使徒）
  if (isTreasureMasterLastWolfMasked(seats, targetSeat, treasureMasterState)) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            treasureMasterMaskedExileSurvived: true,
          }
        : seat,
    );
    const nextTreasureMasterState: TreasureMasterRuntimeState | undefined = treasureMasterState
      ? {
          ...treasureMasterState,
          hasJoinedWolfTeam: true,
          pendingExileDeathNextNight: true,
        }
      : undefined;

    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: false,
      treasureMasterMaskedSurvived: true,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      treasureMasterState: nextTreasureMasterState,
      victory: { winner: null, winReason: null },
    };
  }

  // 血月使徒作為最後一狼被放逐：翻牌免死並存活至下個天亮後出局
  if (isBloodMoonLastWolfExileSurvive(seats, targetSeat)) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? { ...seat, isAlive: true, bloodMoonExileSurvived: true }
        : seat,
    );
    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: false,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      treasureMasterState,
      victory: { winner: null, winReason: null },
    };
  }

  // 白貓任何原因出局皆可翻牌免疫本次死亡（已翻牌期間亦免疫公投出局，至下次放逐結束才正式死亡）
  const whiteCatExileCheck = shouldWhiteCatSurviveDeath(target, 'exiled');
  if (whiteCatExileCheck.survive) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            whiteCatRevealed: true,
          }
        : seat,
    );
    const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState);
    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: false,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      treasureMasterState,
      victory,
    };
  }

  // 白痴／覺醒白痴白天首次被放逐：翻牌免死並失去投票權（若已被種狼感染或遭梅杜莎石化則無法翻牌）
  if (
    (target.roleId === 'idiot' || target.roleId === 'awakened_idiot') &&
    !target.idiotRevealed &&
    !target.infectedBySeedWolf &&
    !target.petrified
  ) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            idiotRevealed: true,
          }
        : seat,
    );

    const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState);
    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: true,
      charmedDeathSeat: null,
      shootEligibility: null,
      mechWolfState,
      treasureMasterState,
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

  // 若放逐出局者為梅杜莎（非自爆），被石化的玩家跟隨出局
  if (target.roleId === 'medusa') {
    const petrifiedSeat = updatedSeats.find((s) => s.isAlive && s.petrified);
    if (petrifiedSeat) {
      updatedSeats = updatedSeats.map((s) =>
        s.seatNumber === petrifiedSeat.seatNumber
          ? {
              ...s,
              isAlive: false,
              deathReason: 'medusa_petrify_link' as const,
              deathRound: round,
            }
          : s,
      );
    }
  }

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
  const nextTreasureMasterState = treasureMasterState
    ? syncTreasureMasterTeamStatus(updatedSeats, treasureMasterState)
    : undefined;
  const shootEligibility = checkCanShoot(updatedSeats, targetSeat, 'exiled');
  const victory = checkVictory(
    updatedSeats,
    charmResult.charmedDeathSeat !== null
      ? { ...ruleOverrides, wolfKillPriority: true }
      : ruleOverrides,
    nextTreasureMasterState,
  );

  return {
    seats: updatedSeats,
    exiledSeat: targetSeat,
    idiotRevealed: false,
    charmedDeathSeat: charmResult.charmedDeathSeat,
    shootEligibility,
    mechWolfState: nextMechWolfState,
    treasureMasterState: nextTreasureMasterState,
    victory,
  };
}

export function resolveSelfExplode(
  seats: PlayerSeat[],
  wolfSeat: number,
  finalBatchState?: FinalBatchRuntimeState,
): SelfExplodeResult {
  const player = seats.find((seat) => seat.seatNumber === wolfSeat);
  if (!player || !player.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      pendingSelfExplodeSeat: null,
    };
  }

  if (finalBatchState?.detectiveRevealedToday) {
    return {
      allowed: false,
      reason: '偵探今日已翻牌，當天狼人無法自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (
    player.roleId === 'phantom_wolf_king' &&
    (!finalBatchState?.phantomWolfInvincibleUsed || finalBatchState.phantomWolfInvincibleActive)
  ) {
    return {
      allowed: false,
      reason: '怪盜狼王於「無敵」技能使用並失效前方可自爆',
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

  if (player.roleId === 'evil_knight') {
    return {
      allowed: false,
      reason: '惡靈騎士不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'hidden_wolf' && !player.infectedBySeedWolf) {
    return {
      allowed: false,
      reason: '隱狼不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'gargoyle') {
    return {
      allowed: false,
      reason: '石像鬼不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'demon_wolf') {
    return {
      allowed: false,
      reason: '惡魔不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'troublemaker_wolf') {
    return {
      allowed: false,
      reason: '搗蛋鬼不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  if (player.roleId === 'silent_night_mentor') {
    return {
      allowed: false,
      reason: '寂夜導師不可自爆',
      pendingSelfExplodeSeat: null,
    };
  }

  const nonExplodableCombatRoles: Record<string, string> = {
    wolf_raven_claw: '狼鴉之爪不可自爆',
    big_grey_wolf: '大灰狼不可自爆',
    wolf_brother: '狼兄不可自爆',
    anubis: '阿努比斯不可自爆',
    awakened_wolf_beauty: '覺醒狼美人不可自爆',
    scarlet_wolf_king: '猩紅狼王不可自爆',
    scent_phantom: '尋香魅影不可自爆',
    puppet_wolf: '傀儡不可自爆',
    chameleon_wolf_king: '百變狼王不可自爆',
    nine_tails_wolf: '九尾不可自爆',
    masked_wolf: '假面不可自爆',
    evil_merchant: '邪惡商人不可自爆',
    wolf_maid: '狼僕不可自爆',
    super_black_market_merchant: '超級黑市商人不可自爆',
    eclipse_maid: '蝕日侍女不可自爆',
    grey_wolf_boss: '灰太狼不可自爆',
  };
  if (player.roleId && nonExplodableCombatRoles[player.roleId]) {
    return {
      allowed: false,
      reason: nonExplodableCombatRoles[player.roleId],
      pendingSelfExplodeSeat: null,
    };
  }

  if (!isSeatWolfFaction(player)) {
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
 * 愚言家／鐵好人白天翻牌自曝：立即淘汰自己並強制進入夜晚（上警期間會計入吞警徽）。
 */
export function resolveGoodSelfExplode(
  seats: PlayerSeat[],
  actorSeat: number,
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  treasureMasterState?: TreasureMasterRuntimeState,
): GoodSelfExplodeResult {
  const check = canGoodSelfExplode(seats, actorSeat);
  if (!check.allowed) {
    return {
      allowed: false,
      reason: check.reason,
      seats: seats.map((s) => ({ ...s })),
      actorSeat,
      enterNightImmediately: false,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === actorSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'good_self_explode' as const,
          deathRound: round,
        }
      : seat,
  );

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState);

  return {
    allowed: true,
    seats: updatedSeats,
    actorSeat,
    enterNightImmediately: victory.winner === null,
    mechWolfState: nextMechWolfState,
    victory,
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
  if (knight.roleId !== 'knight' || knight.infectedBySeedWolf) {
    return {
      allowed: false,
      reason: knight.infectedBySeedWolf ? '騎士已被種狼感染失去決鬥技能' : '僅騎士可發動翻牌決鬥',
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

  const targetWasWolf = isSeatWolfFaction(target);
  const warWolfImmune = targetWasWolf && isWarWolfImmuneToDeath(target, 'knight_duel');
  const eliminatedSeat = warWolfImmune ? null : targetWasWolf ? targetSeat : knightSeat;
  const deathReason: 'knight_duel' | 'knight_duel_fail' | null = warWolfImmune
    ? null
    : targetWasWolf
      ? 'knight_duel'
      : 'knight_duel_fail';

  const updatedSeats =
    eliminatedSeat !== null && deathReason !== null
      ? seats.map((seat) =>
          seat.seatNumber === eliminatedSeat
            ? {
                ...seat,
                isAlive: false,
                deathReason,
                deathRound: round,
              }
            : seat,
        )
      : seats.map((seat) => ({ ...seat }));

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
    enterNightImmediately: targetWasWolf && !warWolfImmune && victory.winner === null,
    knightDuelUsed: true,
    mechWolfState: nextMechWolfState,
    victory,
  };
}

/**
 * 白貓翻牌免死延遲結算：於下一次放逐階段結束後正式淘汰已翻牌之白貓。
 */
export function resolveWhiteCatDelayedDeath(
  seats: PlayerSeat[],
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  treasureMasterState?: TreasureMasterRuntimeState,
): {
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: ReturnType<typeof checkVictory>;
} {
  const revealedCat = seats.find((s) => s.isAlive && s.roleId === 'white_cat' && s.whiteCatRevealed);
  if (!revealedCat) {
    return {
      seats: seats.map((s) => ({ ...s })),
      eliminatedSeat: null,
      mechWolfState,
      victory: checkVictory(seats, ruleOverrides, treasureMasterState),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === revealedCat.seatNumber
      ? {
          ...s,
          isAlive: false,
          whiteCatRevealed: false,
          deathReason: 'white_cat_delayed_death' as const,
          deathRound: round,
        }
      : s,
  );
  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState);
  return {
    seats: updatedSeats,
    eliminatedSeat: revealedCat.seatNumber,
    mechWolfState: nextMechWolfState,
    victory,
  };
}

/**
 * 煉金魔女法老之蛇救活昨夜出局玩家（整局限 1 次，於隔天發言階段結束後發動）。
 */
export function resolveAlchemySnakeRevive(
  seats: PlayerSeat[],
  victimSeat: number,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
} {
  const victim = seats.find((s) => s.seatNumber === victimSeat);
  if (!victim || victim.isAlive) {
    return { allowed: false, reason: '目標不存在或仍存活，無法使用法老之蛇救活', seats };
  }
  return {
    allowed: true,
    seats: seats.map((s) =>
      s.seatNumber === victimSeat
        ? {
            ...s,
            isAlive: true,
            deathReason: undefined,
            deathRound: undefined,
          }
        : s,
    ),
  };
}

/**
 * 老流氓延遲死亡結算（被女巫毒殺或獵人射殺後，於第二天發言結束後正式死亡）。
 */
export function resolveOldRascalDelayedDeath(
  seats: PlayerSeat[],
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  treasureMasterState?: TreasureMasterRuntimeState,
): {
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: ReturnType<typeof checkVictory>;
} {
  const delayed = seats.find((s) => s.isAlive && s.oldRascalDelayedDeath);
  if (!delayed) {
    return {
      seats: seats.map((s) => ({ ...s })),
      eliminatedSeat: null,
      mechWolfState,
      victory: checkVictory(seats, ruleOverrides, treasureMasterState),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === delayed.seatNumber
      ? {
          ...s,
          isAlive: false,
          oldRascalDelayedDeath: false,
          deathReason: 'old_rascal_delayed_death' as const,
          deathRound: round,
        }
      : s,
  );
  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  return {
    seats: updatedSeats,
    eliminatedSeat: delayed.seatNumber,
    mechWolfState: nextMechWolfState,
    victory: checkVictory(updatedSeats, ruleOverrides, treasureMasterState),
  };
}
