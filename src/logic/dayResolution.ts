import { applyWolfBeautyCharmDeath } from './advancedRoles';
import {
  isBloodMoonLastWolfExileSurvive,
  isOldRascalDelayableDeath,
} from './combatRoles';
import { isSeatEffectiveWolf } from './factionHelpers';
import { canGoodSelfExplode, isDemonWolfNightShootImmune } from './inspectionRoles';
import { isPhantomWolfInvincible } from './finalBatchRoles';
import {
  applyTargetSwaps,
  isWarWolfImmuneToDeath,
  shouldWhiteCatSurviveDeath,
} from './interferenceRoles';
import { syncMechWolfTeamStatus } from './mechWolf';
import {
  isEvilKnightNightShootImmune,
  isSeatWolfFaction,
} from './topFiveRoles';
import { findLuckyGiftForSeat, isSeatAsleep } from './thirdPartySpecialRoles';
import {
  isTreasureMasterLastWolfMasked,
  syncTreasureMasterTeamStatus,
} from './treasureMaster';
import type {
  CombatRuntimeState,
  ConversionRuntimeState,
  DayExileResult,
  DeathReason,
  FinalBatchRuntimeState,
  GoodSelfExplodeResult,
  InterferenceRuntimeState,
  KnightDuelResult,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  SelfExplodeResult,
  ShootEligibility,
  ShootResolutionResult,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
  VictoryCheckOptions,
  WhiteWolfKingExplodeResult,
} from './types';
import { checkVictory } from './victory';

const HUNTER_SHOOTABLE_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'milk_pierce',
  'hunter_shoot',
  'wolf_king_shoot',
  'pandora_day_gun',
  'awakened_hunter_shoot',
  'awakened_wolf_king_shoot',
  'exiled',
  'mech_wolf_kill',
  'socialite_link',
  'enchanter_substitute',
  'enchanter_consecutive',
]);

const WOLF_KING_SHOOTABLE_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'hunter_shoot',
  'wolf_king_shoot',
  'pandora_day_gun',
  'awakened_hunter_shoot',
  'awakened_wolf_king_shoot',
  'milk_pierce',
  'exiled',
  'socialite_link',
  'enchanter_substitute',
  'enchanter_consecutive',
]);

const POISON_DEATH_REASONS: ReadonlySet<DeathReason> = new Set([
  'witch_poison',
  'poisoner_poison',
  'mech_wolf_poison',
  'awakened_witch_poison',
  'pandora_poison',
]);

export function checkCanShoot(
  seats: PlayerSeat[],
  shooterSeat: number,
  deathReason: DeathReason,
  options: {
    fearedSeat?: number | null;
    boardId?: string;
    round?: number;
    ruleOverrides?: RuleOverrides;
    thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
    combatState?: CombatRuntimeState;
    finalBatchState?: FinalBatchRuntimeState;
    conversionState?: ConversionRuntimeState;
    bloodMoonSealedGood?: boolean;
  } = {},
): ShootEligibility | null {
  const shooter = seats.find((seat) => seat.seatNumber === shooterSeat);
  if (!shooter) {
    return null;
  }

  // 覺醒獵人：獨立判斷（除被種狼感染或傀儡化外，無論何種死因皆可選擇方向開槍）
  if (shooter.roleId === 'awakened_hunter') {
    if (shooter.statuses.infectedBySeedWolf || shooter.statuses.isPuppetized) {
      return {
        seatNumber: shooterSeat,
        roleId: 'awakened_hunter',
        canShoot: false,
        reason: '覺醒獵人已失去原有技能，無法開槍',
      };
    }
    if (isSeatAsleep(seats, options.thirdPartySpecialState, shooterSeat)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'awakened_hunter',
        canShoot: false,
        reason: '覺醒獵人處於沉睡狀態，無法開槍',
      };
    }
    return {
      seatNumber: shooterSeat,
      roleId: 'awakened_hunter',
      canShoot: true,
      reason: '覺醒獵人符合開槍條件，可選擇左／右方向擊殺最近存活狼人',
      shotsRemaining: 1,
    };
  }

  // 灰太狼借走獵人槍：灰太狼出局可開槍，原獵人失槍
  if (shooter.roleId === 'grey_wolf_boss' && options.finalBatchState?.greyWolfBossBorrowedHunterGun) {
    if (deathReason === 'self_explode' || POISON_DEATH_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'grey_wolf_gun',
        canShoot: false,
        reason: '灰太狼借槍被毒殺或自爆，無法開槍',
      };
    }
    if (HUNTER_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'grey_wolf_gun',
        canShoot: true,
        reason: '灰太狼借得獵人槍，可開槍帶走一名存活玩家',
        shotsRemaining: 1,
      };
    }
  }

  // 邪惡商人持槍小狼
  if (
    options.thirdPartySpecialState?.evilMerchantGunHolderSeat === shooterSeat &&
    !options.thirdPartySpecialState.evilMerchantDisabled
  ) {
    if (deathReason === 'self_explode' || POISON_DEATH_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'evil_merchant_gun',
        canShoot: false,
        reason: '持槍小狼自爆或被毒殺，無法開槍',
      };
    }
    if (WOLF_KING_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'evil_merchant_gun',
        canShoot: true,
        reason: '邪惡商人持槍小狼出局，可開槍帶走一名存活玩家',
        shotsRemaining: 1,
      };
    }
  }

  // 潘朵拉日槍（白天被票放逐出局時可額外帶走一名玩家）
  const hasPandoraDayGun = Boolean(
    options.thirdPartySpecialState?.pandoraGiftHistory.some(
      (g) => g.seat === shooterSeat && g.item === 'day_gun' && !g.used,
    ),
  );
  if (hasPandoraDayGun && deathReason === 'exiled') {
    return {
      seatNumber: shooterSeat,
      roleId: 'pandora_day_gun',
      canShoot: true,
      reason: '持有潘朵拉「日槍」且白天被放逐出局，可額外開槍帶走一名存活玩家',
      shotsRemaining: 1,
    };
  }

  // 覺醒狼王分槍給小狼（持有 wolfDistributedGuns）
  const wolfGunCount = options.combatState?.wolfDistributedGuns?.[shooterSeat] ?? 0;
  if (shooter.roleId === 'wolf' && wolfGunCount > 0) {
    if (deathReason === 'self_explode') {
      return {
        seatNumber: shooterSeat,
        roleId: 'wolf_gun',
        canShoot: false,
        reason: '持槍小狼自爆，無法開槍',
      };
    }
    if (POISON_DEATH_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'wolf_gun',
        canShoot: false,
        reason: '持槍小狼被毒殺，無法開槍',
      };
    }
    const otherAliveWolves = seats.filter(
      (seat) =>
        seat.seatNumber !== shooterSeat &&
        seat.isAlive &&
        isSeatEffectiveWolf(seat, {
          conversionState: options.conversionState,
          thirdPartySpecialState: options.thirdPartySpecialState,
        }),
    );
    if (otherAliveWolves.length === 0) {
      return {
        seatNumber: shooterSeat,
        roleId: 'wolf_gun',
        canShoot: false,
        reason: '作為最後一隻狼出局，無法開槍',
      };
    }
    if (WOLF_KING_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'wolf_gun',
        canShoot: true,
        reason: `持槍小狼（${wolfGunCount} 槍）符合開槍條件`,
        shotsRemaining: wolfGunCount,
      };
    }
  }

  const isBuiltInShooter =
    shooter.roleId === 'hunter' ||
    shooter.roleId === 'wolf_king' ||
    shooter.roleId === 'awakened_wolf_king';

  // 若非內建開槍角色，檢查是否為持有「槍」道具之黑市／超級黑市幸運兒
  if (!isBuiltInShooter) {
    const luckyGift = findLuckyGiftForSeat(
      options.thirdPartySpecialState,
      shooterSeat,
      options.round ?? 2,
      options.ruleOverrides,
    );
    if (!luckyGift || luckyGift.item !== 'hunter_gun') {
      return null;
    }
    if (!luckyGift.allowedThisRound) {
      return {
        seatNumber: shooterSeat,
        roleId: 'lucky_gun',
        canShoot: false,
        reason: '依房規，此幸運兒第一晚不可使用槍技能',
      };
    }
    if (options.bloodMoonSealedGood && deathReason !== 'exiled') {
      return {
        seatNumber: shooterSeat,
        roleId: 'lucky_gun',
        canShoot: false,
        reason: '血月封印中，幸運兒昨晚出局無法開槍',
      };
    }
    if (isSeatAsleep(seats, options.thirdPartySpecialState, shooterSeat)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'lucky_gun',
        canShoot: false,
        reason: '幸運兒處於沉睡狀態，無法開槍',
      };
    }
    if (POISON_DEATH_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'lucky_gun',
        canShoot: false,
        reason: '幸運兒被毒殺，無法發動槍技能',
      };
    }
    if (HUNTER_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'lucky_gun',
        canShoot: true,
        reason: '幸運兒持有獵人槍，可開槍帶走一名存活玩家或選擇壓槍',
        shotsRemaining: 1,
      };
    }
    return null;
  }

  // 被種狼感染／傀儡化／灰太狼借槍後失去原有獵人技能（不可開槍）
  if (shooter.roleId === 'hunter') {
    if (shooter.statuses.infectedBySeedWolf || shooter.statuses.isPuppetized) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: shooter.statuses.isPuppetized
          ? '獵人被傀儡化，無法開槍'
          : '獵人已被種狼感染失去原有技能，無法開槍',
      };
    }
    if (options.finalBatchState?.greyWolfBossBorrowedHunterGun) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人的槍已被灰太狼借走，無法開槍',
      };
    }
    if (options.bloodMoonSealedGood && deathReason !== 'exiled') {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '血月封印生效中，獵人昨晚出局無法開槍',
      };
    }
    if (isSeatAsleep(seats, options.thirdPartySpecialState, shooterSeat)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人處於沉睡狀態，無法開槍',
      };
    }
    // 娛樂局「獵殺潛狼 / 獵人局」：只要出局就能開槍
    if (options.boardId === 'multi-hunter') {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: true,
        reason: '獵人局規則：只要出局即可開槍帶走一名存活玩家或選擇壓槍',
        shotsRemaining: 1,
      };
    }
    if (
      options.fearedSeat === shooterSeat &&
      deathReason !== 'exiled' &&
      deathReason !== 'wolf_king_shoot' &&
      deathReason !== 'pandora_day_gun'
    ) {
      return {
        seatNumber: shooterSeat,
        roleId: 'hunter',
        canShoot: false,
        reason: '獵人昨晚遭夢魘恐懼，晚上倒牌無法開槍',
      };
    }
    if (POISON_DEATH_REASONS.has(deathReason)) {
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
        shotsRemaining: 1,
      };
    }
    return {
      seatNumber: shooterSeat,
      roleId: 'hunter',
      canShoot: false,
      reason: '不符合獵人開槍條件',
    };
  }

  // wolf_king / awakened_wolf_king
  const isAwakenedKing = shooter.roleId === 'awakened_wolf_king';
  const kingRoleId = isAwakenedKing ? 'awakened_wolf_king' : 'wolf_king';
  const kingLabel = isAwakenedKing ? '覺醒狼王' : '狼王';

  if (deathReason === 'self_explode') {
    return {
      seatNumber: shooterSeat,
      roleId: kingRoleId,
      canShoot: false,
      reason: `${kingLabel}自爆，無法開槍`,
    };
  }
  if (POISON_DEATH_REASONS.has(deathReason)) {
    return {
      seatNumber: shooterSeat,
      roleId: kingRoleId,
      canShoot: false,
      reason: `${kingLabel}被毒殺，無法開槍`,
    };
  }

  const otherAliveWolves = seats.filter((seat) => {
    if (seat.seatNumber === shooterSeat || !seat.isAlive) return false;
    return isSeatEffectiveWolf(seat, {
      conversionState: options.conversionState,
      thirdPartySpecialState: options.thirdPartySpecialState,
    });
  });

  if (otherAliveWolves.length === 0) {
    return {
      seatNumber: shooterSeat,
      roleId: kingRoleId,
      canShoot: false,
      reason: `${kingLabel}作為最後一隻狼出局，無法開槍`,
    };
  }

  if (isAwakenedKing) {
    const remaining = options.combatState?.awakenedWolfKingGuns ?? 2;
    if (remaining <= 0) {
      return {
        seatNumber: shooterSeat,
        roleId: 'awakened_wolf_king',
        canShoot: false,
        reason: '覺醒狼王槍數已全部分配或耗盡，無法開槍',
      };
    }
    if (WOLF_KING_SHOOTABLE_REASONS.has(deathReason)) {
      return {
        seatNumber: shooterSeat,
        roleId: 'awakened_wolf_king',
        canShoot: true,
        reason: `覺醒狼王符合開槍條件，剩餘 ${remaining} 槍`,
        shotsRemaining: remaining,
      };
    }
    return {
      seatNumber: shooterSeat,
      roleId: 'awakened_wolf_king',
      canShoot: false,
      reason: '不符合覺醒狼王開槍條件',
    };
  }

  if (WOLF_KING_SHOOTABLE_REASONS.has(deathReason)) {
    // 若狼王同時持有超級黑市獵人槍，總計可開 2 槍
    const extraLuckyGun = findLuckyGiftForSeat(
      options.thirdPartySpecialState,
      shooterSeat,
      options.round ?? 2,
      options.ruleOverrides,
    );
    const totalShots = extraLuckyGun?.item === 'hunter_gun' && extraLuckyGun.allowedThisRound ? 2 : 1;
    return {
      seatNumber: shooterSeat,
      roleId: 'wolf_king',
      canShoot: true,
      reason:
        totalShots > 1
          ? '狼王同時持有超級黑市獵槍，可開槍帶走 2 名存活玩家'
          : '狼王符合開槍條件，可開槍帶走一名存活玩家或選擇壓槍',
      shotsRemaining: totalShots,
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
  treasureMasterState?: TreasureMasterRuntimeState,
  victoryOptions?: VictoryCheckOptions,
  extraOptions?: {
    combatState?: CombatRuntimeState;
    finalBatchState?: FinalBatchRuntimeState;
    interferenceState?: InterferenceRuntimeState;
    mechGuardTarget?: number | null;
    boardId?: string;
  },
): ShootResolutionResult {
  const shootCheckOptions = {
    boardId: extraOptions?.boardId ?? victoryOptions?.boardId,
    round,
    ruleOverrides,
    thirdPartySpecialState: victoryOptions?.thirdPartySpecialState,
    combatState: extraOptions?.combatState,
    finalBatchState: extraOptions?.finalBatchState,
    conversionState: victoryOptions?.conversionState,
  };
  const eligibility = checkCanShoot(seats, shooterSeat, shooterDeathReason, shootCheckOptions);
  if (!eligibility || !eligibility.canShoot) {
    throw new Error(eligibility?.reason ?? '該玩家無法開槍');
  }

  // 搗蛋鬼耍寶：若獵人遭耍寶，開槍改為帶走自己（無視自射禁令）
  const isTroublemakerPranked =
    extraOptions?.interferenceState?.activeTroublemakerPrankedSeat === shooterSeat;

  if (shooterSeat === targetSeat && !isTroublemakerPranked) {
    throw new Error('不可對自己開槍');
  }

  // 魔術師／狼術師夜間換位：夜死獵人開槍目標套用交換
  const isNightDeath =
    shooterDeathReason === 'wolf_kill' ||
    shooterDeathReason === 'milk_pierce' ||
    shooterDeathReason === 'mech_wolf_kill';
  let actualTargetSeat = targetSeat;
  if (isTroublemakerPranked) {
    actualTargetSeat = shooterSeat;
  } else if (
    isNightDeath &&
    extraOptions?.interferenceState?.activeNightSwapPairs &&
    extraOptions.interferenceState.activeNightSwapPairs.length > 0
  ) {
    actualTargetSeat =
      applyTargetSwaps(
        targetSeat,
        extraOptions.interferenceState.activeNightSwapPairs,
      ) ?? targetSeat;
  }

  const target = seats.find((seat) => seat.seatNumber === actualTargetSeat);
  if (!isTroublemakerPranked && (!target || !target.isAlive)) {
    throw new Error('開槍目標不存在或已出局');
  }

  const isWolfShot =
    eligibility.roleId === 'wolf_king' ||
    eligibility.roleId === 'awakened_wolf_king' ||
    eligibility.roleId === 'wolf_gun' ||
    eligibility.roleId === 'evil_merchant_gun' ||
    eligibility.roleId === 'grey_wolf_gun';
  const shootReason: 'hunter_shoot' | 'wolf_king_shoot' = isWolfShot
    ? 'wolf_king_shoot'
    : 'hunter_shoot';
  const immuneCheckRoleId: 'hunter' | 'wolf_king' = isWolfShot ? 'wolf_king' : 'hunter';

  // 惡靈騎士／惡魔免疫夜間傷害、戰狼免疫所有神職傷害、怪盜狼王無敵、機械盾擋夜槍、白貓翻牌免死
  const blockedByMechShield =
    isNightDeath && extraOptions?.mechGuardTarget != null && extraOptions.mechGuardTarget === actualTargetSeat;
  const whiteCatCheck = target ? shouldWhiteCatSurviveDeath(target, shootReason) : { survive: false, newlyRevealed: false };
  if (
    target &&
    (isEvilKnightNightShootImmune(target, immuneCheckRoleId, shooterDeathReason) ||
      isDemonWolfNightShootImmune(target, immuneCheckRoleId, shooterDeathReason) ||
      isWarWolfImmuneToDeath(target, shootReason) ||
      isPhantomWolfInvincible(target, extraOptions?.finalBatchState) ||
      blockedByMechShield ||
      whiteCatCheck.survive)
  ) {
    const survivedSeats = whiteCatCheck.newlyRevealed
      ? seats.map((seat) =>
          seat.seatNumber === actualTargetSeat ? { ...seat, statuses: { ...seat.statuses, whiteCatRevealed: true } } : { ...seat },
        )
      : seats.map((seat) => ({ ...seat }));
    const victory = checkVictory(survivedSeats, ruleOverrides, treasureMasterState, victoryOptions);
    return {
      seats: survivedSeats,
      shooterSeat,
      targetSeat: actualTargetSeat,
      deathReason: shootReason,
      targetSurvived: true,
      charmedDeathSeat: null,
      chainedShootEligibility: null,
      mechWolfState,
      victory,
    };
  }

  // 老流氓被獵人射殺進入負傷延遲死亡狀態（隔天發言結束後才出局）
  if (target && isOldRascalDelayableDeath(target, shootReason)) {
    const delayedSeats = seats.map((seat) =>
      seat.seatNumber === actualTargetSeat ? { ...seat, statuses: { ...seat.statuses, oldRascalDelayedDeath: true } } : { ...seat },
    );
    return {
      seats: delayedSeats,
      shooterSeat,
      targetSeat: actualTargetSeat,
      deathReason: shootReason,
      targetSurvived: true,
      charmedDeathSeat: null,
      chainedShootEligibility: null,
      mechWolfState,
      victory: checkVictory(delayedSeats, ruleOverrides, treasureMasterState, victoryOptions),
    };
  }

  let updatedSeats = seats.map((seat) =>
    seat.seatNumber === actualTargetSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: shootReason,
          deathRound: round,
        }
      : seat,
  );

  // 猩紅狼王出局：所有被附著玩家一同出局
  if (target?.roleId === 'scarlet_wolf_king' && extraOptions?.combatState?.scarletAttachedSeats.length) {
    const attachSet = new Set(extraOptions.combatState.scarletAttachedSeats);
    updatedSeats = updatedSeats.map((s) =>
      attachSet.has(s.seatNumber) && s.isAlive
        ? { ...s, isAlive: false, deathReason: 'scarlet_wolf_link' as const, deathRound: round }
        : s,
    );
  }

  // 若開槍帶走狼美人，前一晚魅惑對象跟著殉情（且無法發動技能）
  const charmResult = applyWolfBeautyCharmDeath(
    updatedSeats,
    actualTargetSeat,
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
    treasureMasterState,
    victoryOptions,
  );
  const chainedShootEligibility =
    victory.winner === null && actualTargetSeat !== shooterSeat
      ? checkCanShoot(updatedSeats, actualTargetSeat, shootReason, shootCheckOptions)
      : null;

  return {
    seats: updatedSeats,
    shooterSeat,
    targetSeat: actualTargetSeat,
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
  victoryOptions?: VictoryCheckOptions,
  extraOptions?: {
    combatState?: CombatRuntimeState;
    boardId?: string;
  },
): DayExileResult & {
  awakenedWolfBeautySubstitutedSeat?: number | null;
  awakenedIdiotRevealed?: boolean;
} {
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    throw new Error('放逐目標不存在或已出局');
  }

  // 管家上茶給守衛：首選目標守護至天亮免於白天放逐
  if (victoryOptions?.thirdPartySpecialState?.butlerDayProtectedSeat === targetSeat) {
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

  // 覺醒狼美人白天被放逐：首次翻牌免死並由當晚被魅惑者代替出局
  if (
    target.roleId === 'awakened_wolf_beauty' &&
    extraOptions?.combatState &&
    !extraOptions.combatState.awakenedWolfBeautySubstituteUsed &&
    extraOptions.combatState.awakenedWolfBeautyActiveCharmSeat !== null
  ) {
    const subSeat = extraOptions.combatState.awakenedWolfBeautyActiveCharmSeat;
    const subObj = seats.find((s) => s.seatNumber === subSeat);
    if (subObj && subObj.isAlive) {
      const updatedSeats = seats.map((s) =>
        s.seatNumber === subSeat
          ? {
              ...s,
              isAlive: false,
              deathReason: 'awakened_wolf_beauty_substitute' as const,
              deathRound: round,
            }
          : { ...s },
      );
      const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
      const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);
      return {
        seats: updatedSeats,
        exiledSeat: targetSeat,
        idiotRevealed: false,
        awakenedWolfBeautySubstitutedSeat: subSeat,
        charmedDeathSeat: null,
        shootEligibility: null,
        mechWolfState: nextMechWolfState,
        treasureMasterState,
        victory,
      };
    }
  }

  // 盜寶蒙面狼作為最後一狼切換成蒙面人並被放逐時，暫時不死且可於隔夜再刀一人（類似血月使徒）
  if (isTreasureMasterLastWolfMasked(seats, targetSeat, treasureMasterState)) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            statuses: {
              ...seat.statuses,
              treasureMasterMaskedExileSurvived: true,
            },
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
        ? { ...seat, isAlive: true, statuses: { ...seat.statuses, bloodMoonExileSurvived: true } }
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
            statuses: {
              ...seat.statuses,
              whiteCatRevealed: true,
            },
          }
        : seat,
    );
    const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);
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
    !target.statuses.idiotRevealed &&
    !target.statuses.infectedBySeedWolf &&
    !target.statuses.petrified
  ) {
    const updatedSeats = seats.map((seat) =>
      seat.seatNumber === targetSeat
        ? {
            ...seat,
            isAlive: true,
            statuses: {
              ...seat.statuses,
              idiotRevealed: true,
            },
          }
        : seat,
    );

    const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);
    return {
      seats: updatedSeats,
      exiledSeat: targetSeat,
      idiotRevealed: true,
      awakenedIdiotRevealed: target.roleId === 'awakened_idiot',
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

  // 若放逐出局者為猩紅狼王，所有被附著玩家一同出局
  if (target.roleId === 'scarlet_wolf_king' && extraOptions?.combatState?.scarletAttachedSeats.length) {
    const attachSet = new Set(extraOptions.combatState.scarletAttachedSeats);
    updatedSeats = updatedSeats.map((s) =>
      attachSet.has(s.seatNumber) && s.isAlive
        ? { ...s, isAlive: false, deathReason: 'scarlet_wolf_link' as const, deathRound: round }
        : s,
    );
  }

  // 若放逐出局者為梅杜莎（非自爆），被石化的玩家跟隨出局
  if (target.roleId === 'medusa') {
    const petrifiedSeat = updatedSeats.find((s) => s.isAlive && s.statuses.petrified);
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
  const shootEligibility = checkCanShoot(updatedSeats, targetSeat, 'exiled', {
    boardId: extraOptions?.boardId ?? victoryOptions?.boardId,
    round,
    ruleOverrides,
    thirdPartySpecialState: victoryOptions?.thirdPartySpecialState,
    combatState: extraOptions?.combatState,
    finalBatchState,
    conversionState: victoryOptions?.conversionState,
  });
  const victory = checkVictory(
    updatedSeats,
    charmResult.charmedDeathSeat !== null
      ? { ...ruleOverrides, wolfKillPriority: true }
      : ruleOverrides,
    nextTreasureMasterState,
    victoryOptions,
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
  options?: {
    round?: number;
    ruleOverrides?: RuleOverrides;
    mechWolfState?: MechWolfRuntimeState;
    treasureMasterState?: TreasureMasterRuntimeState;
    victoryOptions?: VictoryCheckOptions;
    /** 若已進入白天「階段四：放逐投票」，禁用一般狼人自爆（僅狼女孩 wolf_girl 例外） */
    inExileVoteStage?: boolean;
  },
): SelfExplodeResult {
  const player = seats.find((seat) => seat.seatNumber === wolfSeat);
  if (!player || !player.isAlive) {
    return {
      allowed: false,
      reason: '該玩家不存在或已出局',
      pendingSelfExplodeSeat: null,
    };
  }

  if (options?.inExileVoteStage && player.roleId !== 'wolf_girl') {
    return {
      allowed: false,
      reason: '已進入放逐投票階段，狼人不可自爆（僅狼女孩除外）',
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

  if (player.roleId === 'hidden_wolf' && !player.statuses.infectedBySeedWolf) {
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
    war_wolf: '戰狼不可自爆',
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

  // 狼人自爆即刻死亡，不可再成為騎士決鬥、開槍等任何後續技能目標
  const updatedSeats = seats.map((seat) =>
    seat.seatNumber === wolfSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'self_explode' as const,
          deathRound: options?.round ?? seat.deathRound,
        }
      : { ...seat },
  );

  const nextMechWolfState = options?.mechWolfState
    ? syncMechWolfTeamStatus(updatedSeats, options.mechWolfState)
    : undefined;
  const victory = options?.ruleOverrides
    ? checkVictory(
        updatedSeats,
        options.ruleOverrides,
        options.treasureMasterState,
        options.victoryOptions,
      )
    : undefined;

  return {
    allowed: true,
    seats: updatedSeats,
    pendingSelfExplodeSeat: null,
    ...(nextMechWolfState ? { mechWolfState: nextMechWolfState } : {}),
    ...(victory ? { victory } : {}),
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
  victoryOptions?: VictoryCheckOptions,
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
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);

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
  treasureMasterState?: TreasureMasterRuntimeState,
  victoryOptions?: VictoryCheckOptions,
  options?: {
    inExileVoteStage?: boolean;
    finalBatchState?: FinalBatchRuntimeState;
    combatState?: CombatRuntimeState;
    boardId?: string;
  },
): WhiteWolfKingExplodeResult {
  if (options?.inExileVoteStage) {
    return {
      allowed: false,
      reason: '已進入放逐投票階段，白狼王不可自爆',
      seats,
      wolfSeat,
      targetSeat,
      charmedDeathSeat: null,
      pendingSelfExplodeSeat: null,
      mechWolfState,
      victory: { winner: null, winReason: null },
    };
  }

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

  // 白狼王自爆即刻死亡，不可再成為任何技能目標
  let updatedSeats = seats.map((seat) =>
    seat.seatNumber === wolfSeat
      ? {
          ...seat,
          isAlive: false,
          deathReason: 'self_explode' as const,
          deathRound: round,
        }
      : { ...seat },
  );
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
        chainedShootEligibility: null,
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
        chainedShootEligibility: null,
        pendingSelfExplodeSeat: null,
        mechWolfState,
        victory: { winner: null, winReason: null },
      };
    }

    const whiteCatCheck = shouldWhiteCatSurviveDeath(target, 'white_wolf_king_explode');
    if (isPhantomWolfInvincible(target, options?.finalBatchState) || whiteCatCheck.survive) {
      if (whiteCatCheck.newlyRevealed) {
        updatedSeats = updatedSeats.map((seat) =>
          seat.seatNumber === targetSeat ? { ...seat, statuses: { ...seat.statuses, whiteCatRevealed: true } } : seat,
        );
      }
    } else {
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

      if (target.roleId === 'scarlet_wolf_king' && options?.combatState?.scarletAttachedSeats.length) {
        const attachSet = new Set(options.combatState.scarletAttachedSeats);
        updatedSeats = updatedSeats.map((s) =>
          attachSet.has(s.seatNumber) && s.isAlive
            ? { ...s, isAlive: false, deathReason: 'scarlet_wolf_link' as const, deathRound: round }
            : s,
        );
      }

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
  }

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);
  const targetActuallyDead =
    targetSeat !== null && !updatedSeats.find((s) => s.seatNumber === targetSeat)?.isAlive;
  const chainedShootEligibility =
    targetSeat !== null && targetActuallyDead && victory.winner === null
      ? checkCanShoot(updatedSeats, targetSeat, 'white_wolf_king_explode', {
          boardId: options?.boardId ?? victoryOptions?.boardId,
          round,
          ruleOverrides,
          thirdPartySpecialState: victoryOptions?.thirdPartySpecialState,
          combatState: options?.combatState,
          finalBatchState: options?.finalBatchState,
          conversionState: victoryOptions?.conversionState,
        })
      : null;

  return {
    allowed: true,
    seats: updatedSeats,
    wolfSeat,
    targetSeat,
    charmedDeathSeat,
    chainedShootEligibility,
    pendingSelfExplodeSeat: null,
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
  treasureMasterState?: TreasureMasterRuntimeState,
  victoryOptions?: VictoryCheckOptions,
  options?: {
    inSheriffElection?: boolean;
    finalBatchState?: FinalBatchRuntimeState;
    combatState?: CombatRuntimeState;
  },
): KnightDuelResult {
  if (options?.inSheriffElection) {
    return {
      allowed: false,
      reason: '警長競選階段不可發動騎士決鬥',
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
  if (knight.roleId !== 'knight' || knight.statuses.infectedBySeedWolf) {
    return {
      allowed: false,
      reason: knight.statuses.infectedBySeedWolf ? '騎士已被種狼感染失去決鬥技能' : '僅騎士可發動翻牌決鬥',
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

  const targetWasWolf = isSeatEffectiveWolf(target, {
    conversionState: victoryOptions?.conversionState,
    thirdPartySpecialState: victoryOptions?.thirdPartySpecialState,
  });
  const warWolfImmune =
    targetWasWolf &&
    (isWarWolfImmuneToDeath(target, 'knight_duel') ||
      isPhantomWolfInvincible(target, options?.finalBatchState));
  const eliminatedSeat = warWolfImmune ? null : targetWasWolf ? targetSeat : knightSeat;
  const deathReason: 'knight_duel' | 'knight_duel_fail' | null = warWolfImmune
    ? null
    : targetWasWolf
      ? 'knight_duel'
      : 'knight_duel_fail';

  let updatedSeats =
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

  if (
    eliminatedSeat === targetSeat &&
    target.roleId === 'scarlet_wolf_king' &&
    options?.combatState?.scarletAttachedSeats.length
  ) {
    const attachSet = new Set(options.combatState.scarletAttachedSeats);
    updatedSeats = updatedSeats.map((s) =>
      attachSet.has(s.seatNumber) && s.isAlive
        ? { ...s, isAlive: false, deathReason: 'scarlet_wolf_link' as const, deathRound: round }
        : s,
    );
  }

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);

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
  victoryOptions?: VictoryCheckOptions,
): {
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: ReturnType<typeof checkVictory>;
} {
  const revealedCat = seats.find((s) => s.isAlive && s.roleId === 'white_cat' && s.statuses.whiteCatRevealed);
  if (!revealedCat) {
    return {
      seats: seats.map((s) => ({ ...s })),
      eliminatedSeat: null,
      mechWolfState,
      victory: checkVictory(seats, ruleOverrides, treasureMasterState, victoryOptions),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === revealedCat.seatNumber
      ? {
          ...s,
          isAlive: false,
          statuses: { ...s.statuses, whiteCatRevealed: false },
          deathReason: 'white_cat_delayed_death' as const,
          deathRound: round,
        }
      : s,
  );
  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);
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
  victoryOptions?: VictoryCheckOptions,
): {
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: ReturnType<typeof checkVictory>;
} {
  const delayed = seats.find((s) => s.isAlive && s.statuses.oldRascalDelayedDeath);
  if (!delayed) {
    return {
      seats: seats.map((s) => ({ ...s })),
      eliminatedSeat: null,
      mechWolfState,
      victory: checkVictory(seats, ruleOverrides, treasureMasterState, victoryOptions),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === delayed.seatNumber
      ? {
          ...s,
          isAlive: false,
          statuses: { ...s.statuses, oldRascalDelayedDeath: false },
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
    victory: checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions),
  };
}

export type ExitResolutionStage = 'skills_and_badge' | 'last_words' | 'done';

/**
 * 出局結算鐵律：「先結算技能／移交警徽，再發表遺言」：
 * - 若仍有待開槍／連鎖開槍技能或警徽移交／撕毀尚未完成，必須鎖定在 'skills_and_badge' 階段。
 * - 所有出局技能與警徽結算完畢後，若有遺言資格（首夜死者或白天放逐者），才進入 'last_words' 階段。
 * - 第二晚起夜死玩家無遺言，技能結算完畢即為 'done'。
 */
export function getExitResolutionStage(input: {
  pendingShootersCount: number;
  hasPendingBadgeTransfer: boolean;
  hasLastWords: boolean;
}): ExitResolutionStage {
  if (input.pendingShootersCount > 0 || input.hasPendingBadgeTransfer) {
    return 'skills_and_badge';
  }
  return input.hasLastWords ? 'last_words' : 'done';
}

/**
 * 白澤神職繼承人延遲死亡結算：於下一個白天放逐投票結束後正式淘汰該繼承人。
 */
export function resolveBaiZeDelayedDeath(
  seats: PlayerSeat[],
  round: number,
  ruleOverrides: RuleOverrides,
  mechWolfState: MechWolfRuntimeState,
  treasureMasterState?: TreasureMasterRuntimeState,
  victoryOptions?: VictoryCheckOptions,
): {
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: ReturnType<typeof checkVictory>;
} {
  const delayed = seats.find((s) => s.isAlive && s.statuses.baiZeDelayedDeath);
  if (!delayed) {
    return {
      seats: seats.map((s) => ({ ...s })),
      eliminatedSeat: null,
      mechWolfState,
      victory: checkVictory(seats, ruleOverrides, treasureMasterState, victoryOptions),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === delayed.seatNumber
      ? {
          ...s,
          isAlive: false,
          statuses: { ...s.statuses, baiZeDelayedDeath: false },
          deathReason: 'bai_ze_delayed_death' as const,
          deathRound: round,
        }
      : s,
  );
  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  return {
    seats: updatedSeats,
    eliminatedSeat: delayed.seatNumber,
    mechWolfState: nextMechWolfState,
    victory: checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions),
  };
}
