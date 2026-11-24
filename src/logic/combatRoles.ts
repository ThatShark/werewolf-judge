import { getRoleById } from '../data/roles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  CombatRuntimeState,
  DeathReason,
  PlayerSeat,
  RuleOverrides,
  VictoryResult,
} from './types';
import { checkVictory } from './victory';

export function createInitialCombatState(): CombatRuntimeState {
  return {
    wolfRavenClawJoinedTeam: false,
    wolfRavenClawInvincibleUsed: false,
    bigGreyWolfJoinedTeam: false,
    bigGreyWolfKillUsed: false,
    wolfBrotherDiedRound: null,
    wolfYoungerBrotherAwakenedKillUsed: false,
    wolfYoungerBrotherJoinedTeam: false,
    beeWildHuntLostAbility: false,
    perseusExecuteUsed: false,
    anubisJoinedTeam: false,
    anubisUsedSeats: [],
    bloodMoonSealActiveTonight: false,
    bloodMoonPendingExileDeathNextNight: false,
    pufferfishBombUsed: false,
    pufferfishWolfKilledToday: false,
    awakenedWolfKingGuns: 2,
    wolfDistributedGuns: {},
    awakenedWolfBeautyLastCharmRound: null,
    awakenedWolfBeautyActiveCharmSeat: null,
    awakenedWolfBeautySubstituteUsed: false,
    scarletWolfKingJoinedTeam: false,
    scarletAttachedSeats: [],
    nightNobleServantSeat: null,
    awakenedIdiotSecretActive: true,
    rustySwordKilledRound: null,
    rustySwordTriggered: false,
    wardenTradedSeats: [],
  };
}

export function cloneCombatState(state: CombatRuntimeState): CombatRuntimeState {
  return {
    ...state,
    anubisUsedSeats: [...state.anubisUsedSeats],
    wolfDistributedGuns: { ...state.wolfDistributedGuns },
    scarletAttachedSeats: [...state.scarletAttachedSeats],
    wardenTradedSeats: [...state.wardenTradedSeats],
  };
}

// =========================
// 1. 獵魔人（demon_hunter）
// =========================

export function canDemonHunterHunt(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const dh = seats.find((s) => s.roleId === 'demon_hunter' && s.isAlive && !s.infectedBySeedWolf);
  if (!dh) return { allowed: false, reason: '場上沒有存活的獵魔人' };
  if (targetSeat === null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '獵魔人自第二晚起才可發動狩獵' };
  if (targetSeat === dh.seatNumber) return { allowed: false, reason: '獵魔人不可狩獵自己' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '狩獵目標不存在或已出局' };
  return { allowed: true };
}

/** 獵魔人免疫女巫毒藥 */
export function isDemonHunterImmuneToPoison(seat: PlayerSeat | undefined, reason: DeathReason): boolean {
  if (!seat || seat.roleId !== 'demon_hunter' || seat.infectedBySeedWolf) return false;
  return reason === 'witch_poison' || reason === 'awakened_witch_poison';
}

// =========================
// 2. 狼鴉之爪（wolf_raven_claw）
// =========================

export function syncWolfRavenClawTeamStatus(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
): boolean {
  if (state.wolfRavenClawJoinedTeam) return true;
  const claw = seats.find((s) => s.roleId === 'wolf_raven_claw');
  if (!claw || !claw.isAlive) return false;
  const aliveWolves = seats.filter((s) => s.isAlive && isSeatWolfFaction(s));
  return aliveWolves.length <= 2;
}

export function canWolfRavenClawKill(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const claw = seats.find((s) => s.roleId === 'wolf_raven_claw' && s.isAlive);
  if (!claw) return { allowed: false, reason: '場上沒有存活的狼鴉之爪' };
  if (targetSeat === null) return { allowed: true };
  if (!state.wolfRavenClawJoinedTeam) {
    return { allowed: false, reason: '狼鴉之爪須待存活狼人數小於等於 2 入隊後才可使用無敵刀' };
  }
  if (state.wolfRavenClawInvincibleUsed) {
    return { allowed: false, reason: '狼鴉之爪的無敵刀整局僅能使用一次' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '無敵刀目標不存在或已出局' };
  return { allowed: true };
}

// =========================
// 3. 刺客（assassin_wolf）
// =========================

export function canAssassinAssassinate(
  seats: PlayerSeat[],
  targetSeat: number | null,
  guessedRoleId: string | null | undefined,
  round: number,
): ActionCheckResult {
  const assassin = seats.find((s) => s.roleId === 'assassin_wolf' && s.isAlive);
  if (!assassin) return { allowed: false, reason: '場上沒有存活的刺客' };
  if (targetSeat === null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '刺客自第二晚起才可發動刺殺' };
  if (!guessedRoleId) return { allowed: false, reason: '刺客必須同時猜測目標的準確角色身分' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '刺殺目標不存在或已出局' };
  return { allowed: true };
}

// =========================
// 4. 大野狼（big_bad_wolf）與大灰狼（big_grey_wolf）
// =========================

export function canBigBadWolfExtraKill(
  seats: PlayerSeat[],
  targetSeat: number | null,
): ActionCheckResult {
  const bbw = seats.find((s) => s.roleId === 'big_bad_wolf' && s.isAlive);
  if (!bbw) return { allowed: false, reason: '場上沒有存活的大野狼' };
  if (targetSeat === null) return { allowed: true };
  const anyDeadWolf = seats.some((s) => !s.isAlive && isSeatWolfFaction(s));
  if (anyDeadWolf) {
    return { allowed: false, reason: '已有狼人陣營出局，大野狼失去額外刀能力' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '額外刀目標不存在或已出局' };
  return { allowed: true };
}

export function syncBigGreyWolfTeamStatus(seats: PlayerSeat[], state: CombatRuntimeState): boolean {
  if (state.bigGreyWolfJoinedTeam) return true;
  const bgw = seats.find((s) => s.roleId === 'big_grey_wolf');
  if (!bgw || !bgw.isAlive) return false;
  const hasOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'big_grey_wolf' && isSeatWolfFaction(s),
  );
  return !hasOtherWolf;
}

export function canBigGreyWolfKill(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
  round: number,
  fortuneAllowedSeats: number[] | null = null,
): ActionCheckResult {
  const bgw = seats.find((s) => s.roleId === 'big_grey_wolf' && s.isAlive);
  if (!bgw) return { allowed: false, reason: '場上沒有存活的大灰狼' };
  if (targetSeat === null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '大灰狼自第二晚起才可發動單獨擊殺' };
  if (state.bigGreyWolfKillUsed) return { allowed: false, reason: '大灰狼單獨擊殺整局僅能使用一次' };
  if (fortuneAllowedSeats && !fortuneAllowedSeats.includes(targetSeat)) {
    return {
      allowed: false,
      reason: `占卜師已發動標記，大灰狼僅能從 ${fortuneAllowedSeats.join('、')} 號中擊殺`,
    };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '擊殺目標不存在或已出局' };
  return { allowed: true };
}

// =========================
// 5. 狼兄（wolf_brother）與狼弟（wolf_younger_brother）
// =========================

/** 狼兄存活時，狼弟被預言家查驗恆為金水 */
export function isWolfYoungerBrotherSeerDisguised(seats: PlayerSeat[]): boolean {
  const brother = seats.find((s) => s.roleId === 'wolf_brother');
  return Boolean(brother && brother.isAlive);
}

/**
 * 同步狼兄死亡回合與狼弟覺醒／入隊狀態（Q&A：狼兄死後第一晚僅覺醒無敵刀，下一晚才正式入狼隊）
 */
export function syncWolfBrothersState(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  round: number,
): CombatRuntimeState {
  const brother = seats.find((s) => s.roleId === 'wolf_brother');
  if (!brother) return state;
  let wolfBrotherDiedRound = state.wolfBrotherDiedRound;
  if (!brother.isAlive && wolfBrotherDiedRound === null) {
    wolfBrotherDiedRound = brother.deathRound ?? round;
  }
  const wolfYoungerBrotherJoinedTeam =
    state.wolfYoungerBrotherJoinedTeam ||
    (wolfBrotherDiedRound !== null && round > wolfBrotherDiedRound + 1);
  if (
    wolfBrotherDiedRound === state.wolfBrotherDiedRound &&
    wolfYoungerBrotherJoinedTeam === state.wolfYoungerBrotherJoinedTeam
  ) {
    return state;
  }
  return {
    ...state,
    wolfBrotherDiedRound,
    wolfYoungerBrotherJoinedTeam,
  };
}

export function canWolfYoungerBrotherAwakenedKill(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const yb = seats.find((s) => s.roleId === 'wolf_younger_brother' && s.isAlive);
  if (!yb) return { allowed: false, reason: '場上沒有存活的狼弟' };
  if (targetSeat === null) return { allowed: true };
  if (state.wolfBrotherDiedRound === null) {
    return { allowed: false, reason: '狼兄尚未出局，狼弟尚未覺醒' };
  }
  if (state.wolfYoungerBrotherAwakenedKillUsed) {
    return { allowed: false, reason: '狼弟覺醒無敵刀僅能使用一次' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '覺醒刀目標不存在或已出局' };
  return { allowed: true };
}

// =========================
// 6. 蜂之狂獵（bee_wild_hunt）、珀爾修斯（perseus）、阿努比斯（anubis）
// =========================

export function canBeeWildHuntSting(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targets: [number | null, number | null] | undefined,
  round: number,
): ActionCheckResult {
  const bee = seats.find((s) => s.roleId === 'bee_wild_hunt' && s.isAlive && !s.infectedBySeedWolf);
  if (!bee) return { allowed: false, reason: '場上沒有存活的蜂之狂獵' };
  if (!targets || (targets[0] === null && targets[1] === null)) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '蜂之狂獵自第二晚起才可發動蜂刺' };
  if (state.beeWildHuntLostAbility) return { allowed: false, reason: '蜂之狂獵已永久失去技能' };
  if (targets[0] === null || targets[1] === null) {
    return { allowed: false, reason: '蜂之狂獵須選擇兩名存活目標（可選同一人）' };
  }
  for (const num of [targets[0], targets[1]]) {
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

export function canPerseusExecute(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const perseus = seats.find((s) => s.roleId === 'perseus' && s.isAlive && !s.infectedBySeedWolf);
  if (!perseus) return { allowed: false, reason: '場上沒有存活的珀爾修斯' };
  if (targetSeat === null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '珀爾修斯自第二晚起才可發動處決' };
  if (state.perseusExecuteUsed) return { allowed: false, reason: '珀爾修斯處決技能整局僅能使用一次' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '處決目標不存在或已出局' };
  return { allowed: true };
}

export function syncAnubisTeamStatus(seats: PlayerSeat[], state: CombatRuntimeState): boolean {
  if (state.anubisJoinedTeam) return true;
  const anubis = seats.find((s) => s.roleId === 'anubis');
  if (!anubis || !anubis.isAlive) return false;
  const hasOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'anubis' && isSeatWolfFaction(s),
  );
  return !hasOtherWolf;
}

export function canAnubisScale(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  deadSeat: number | null | undefined,
  aliveSeat: number | null | undefined,
  round: number,
): ActionCheckResult {
  const anubis = seats.find((s) => s.roleId === 'anubis' && s.isAlive);
  if (!anubis) return { allowed: false, reason: '場上沒有存活的阿努比斯' };
  if (deadSeat == null && aliveSeat == null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '阿努比斯自第二晚起才可使用天平' };
  if (deadSeat == null || aliveSeat == null) {
    return { allowed: false, reason: '阿努比斯須選擇 1 位已出局玩家（左側）與 1 位存活玩家（右側）' };
  }
  const deadObj = seats.find((s) => s.seatNumber === deadSeat);
  const aliveObj = seats.find((s) => s.seatNumber === aliveSeat);
  if (!deadObj || deadObj.isAlive) return { allowed: false, reason: '天平左側須為已出局玩家' };
  if (!aliveObj || !aliveObj.isAlive) return { allowed: false, reason: '天平右側須為存活玩家' };
  if (state.anubisUsedSeats.includes(deadSeat) || state.anubisUsedSeats.includes(aliveSeat)) {
    return { allowed: false, reason: '每名玩家整局僅能被置於天平一次' };
  }
  return { allowed: true };
}

/** 阿努比斯天平比較：神 > 民；民 > 狼；狼 > 神 */
export function evaluateAnubisScaleWins(leftSeat: PlayerSeat, rightSeat: PlayerSeat): boolean {
  const getSide = (s: PlayerSeat): 'god' | 'villager' | 'wolf' => {
    if (isSeatWolfFaction(s)) return 'wolf';
    const role = getRoleById(s.roleId);
    return role?.category === 'god' ? 'god' : 'villager';
  };
  const left = getSide(leftSeat);
  const right = getSide(rightSeat);
  return (
    (left === 'god' && right === 'villager') ||
    (left === 'villager' && right === 'wolf') ||
    (left === 'wolf' && right === 'god')
  );
}

// =========================
// 7. 血月使徒（blood_moon_apostle）、河豚（pufferfish）、老流氓（old_rascal）、鏽劍騎士（rusty_sword_knight）
// =========================

export function isBloodMoonLastWolfExileSurvive(seats: PlayerSeat[], targetSeat: number): boolean {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive || target.roleId !== 'blood_moon_apostle') return false;
  if (target.bloodMoonExileSurvived) return false;
  const otherAliveWolves = seats.filter(
    (s) => s.isAlive && s.seatNumber !== targetSeat && isSeatWolfFaction(s),
  );
  return otherAliveWolves.length === 0;
}

/**
 * 河豚白天放逐投票翻牌炸死所有投給河豚的玩家（整局限 1 次）：
 * 排除：沒有投票給河豚、或唯一投票者為已翻牌白貓。
 */
export function resolvePufferfishExplode(
  seats: PlayerSeat[],
  voterSeatsForPufferfish: number[],
  pufferfishBombUsed: boolean,
  round: number,
  ruleOverrides: RuleOverrides,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  killedSeats: number[];
  victory: VictoryResult;
} {
  const puffer = seats.find((s) => s.roleId === 'pufferfish' && s.isAlive && !s.infectedBySeedWolf);
  if (!puffer) {
    return { allowed: false, reason: '場上沒有存活的河豚', seats, killedSeats: [], victory: { winner: null, winReason: null } };
  }
  if (pufferfishBombUsed) {
    return { allowed: false, reason: '河豚翻牌技能整局僅能使用一次', seats, killedSeats: [], victory: { winner: null, winReason: null } };
  }
  const uniqueVoters = Array.from(new Set(voterSeatsForPufferfish)).filter((num) => {
    const s = seats.find((seat) => seat.seatNumber === num);
    return Boolean(s && s.isAlive && !(s.roleId === 'white_cat' && s.whiteCatRevealed));
  });
  if (uniqueVoters.length === 0) {
    return { allowed: false, reason: '沒有可被炸死的投票玩家，河豚無法翻牌', seats, killedSeats: [], victory: { winner: null, winReason: null } };
  }
  const killSet = new Set(uniqueVoters);
  const updatedSeats = seats.map((s) =>
    killSet.has(s.seatNumber)
      ? { ...s, isAlive: false, deathReason: 'pufferfish_explode' as const, deathRound: round }
      : s,
  );
  const victory = checkVictory(updatedSeats, ruleOverrides);
  return {
    allowed: true,
    seats: updatedSeats,
    killedSeats: uniqueVoters,
    victory,
  };
}

/** 老流氓被毒／被獵人射殺時延遲至第二天發言後出局 */
export function isOldRascalDelayableDeath(
  seat: PlayerSeat | undefined,
  reason: DeathReason,
): boolean {
  if (!seat || seat.roleId !== 'old_rascal' || seat.infectedBySeedWolf) return false;
  return (
    reason === 'witch_poison' ||
    reason === 'awakened_witch_poison' ||
    reason === 'poisoner_poison' ||
    reason === 'hunter_shoot'
  );
}

/** 尋找指定座位指定方向（left = 逆時針遞減 / right = 順時針遞增）最近的一位存活狼人 */
export function findNearestAliveWolfInDirection(
  seats: PlayerSeat[],
  originSeatNumber: number,
  direction: 'left' | 'right',
): PlayerSeat | null {
  const ordered = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const total = ordered.length;
  const idx = ordered.findIndex((s) => s.seatNumber === originSeatNumber);
  if (idx === -1 || total <= 1) return null;

  for (let offset = 1; offset < total; offset += 1) {
    const pos = direction === 'left' ? (idx - offset + total) % total : (idx + offset) % total;
    const candidate = ordered[pos];
    if (candidate.isAlive && isSeatWolfFaction(candidate)) {
      return candidate;
    }
  }
  return null;
}

/** 鏽劍騎士被狼刀殺死下一晚天亮，左邊最近存活狼人死亡 */
export function findRustySwordCounterTarget(seats: PlayerSeat[]): PlayerSeat | null {
  const rsk = seats.find((s) => s.roleId === 'rusty_sword_knight');
  if (!rsk) return null;
  return findNearestAliveWolfInDirection(seats, rsk.seatNumber, 'left');
}

// =========================
// 8. 覺醒狼王（awakened_wolf_king）、覺醒狼美人（awakened_wolf_beauty）、
//    覺醒獵人（awakened_hunter）、猩紅狼王（scarlet_wolf_king）、
//    夜之貴族（night_noble）、覺醒白痴（awakened_idiot）、典獄長（warden_wolf）
// =========================

export function canAwakenedWolfKingGiveGun(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const awk = seats.find((s) => s.roleId === 'awakened_wolf_king' && s.isAlive);
  if (!awk) return { allowed: false, reason: '場上沒有存活的覺醒狼王' };
  if (targetSeat === null) return { allowed: true };
  if (state.awakenedWolfKingGuns <= 0) {
    return { allowed: false, reason: '覺醒狼王已沒有剩餘的槍可分配' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive || target.roleId !== 'wolf') {
    return { allowed: false, reason: '覺醒狼王僅能分槍給存活的小狼' };
  }
  return { allowed: true };
}

export function canAwakenedWolfBeautyCharm(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const awb = seats.find((s) => s.roleId === 'awakened_wolf_beauty' && s.isAlive);
  if (!awb) return { allowed: false, reason: '場上沒有存活的覺醒狼美人' };
  if (targetSeat === null) return { allowed: true };
  if (state.awakenedWolfBeautySubstituteUsed) {
    return { allowed: false, reason: '覺醒狼美人替死技能已觸發並失效' };
  }
  if (
    state.awakenedWolfBeautyLastCharmRound !== null &&
    round - state.awakenedWolfBeautyLastCharmRound < 2
  ) {
    return { allowed: false, reason: '覺醒狼美人須每隔一晚才能再次魅惑' };
  }
  if (targetSeat === awb.seatNumber) return { allowed: false, reason: '覺醒狼美人不可魅惑自己' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '魅惑目標不存在或已出局' };
  return { allowed: true };
}

/** 覺醒獵人死亡方向開槍：擊殺指定方向最近的一位存活狼人（夜槍可破覺醒狼美人替死） */
export function resolveAwakenedHunterDirectionShoot(
  seats: PlayerSeat[],
  hunterSeat: number,
  direction: 'left' | 'right',
  round: number,
  ruleOverrides: RuleOverrides,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  killedSeat: number | null;
  victory: VictoryResult;
} {
  const hunter = seats.find((s) => s.seatNumber === hunterSeat);
  if (!hunter || hunter.roleId !== 'awakened_hunter') {
    return { allowed: false, reason: '該玩家並非覺醒獵人', seats, killedSeat: null, victory: { winner: null, winReason: null } };
  }
  const targetWolf = findNearestAliveWolfInDirection(seats, hunterSeat, direction);
  if (!targetWolf) {
    return {
      allowed: true,
      seats: seats.map((s) => ({ ...s })),
      killedSeat: null,
      victory: checkVictory(seats, ruleOverrides),
    };
  }
  const updatedSeats = seats.map((s) =>
    s.seatNumber === targetWolf.seatNumber
      ? {
          ...s,
          isAlive: false,
          deathReason: 'awakened_hunter_shoot' as const,
          deathRound: round,
        }
      : s,
  );
  return {
    allowed: true,
    seats: updatedSeats,
    killedSeat: targetWolf.seatNumber,
    victory: checkVictory(updatedSeats, ruleOverrides),
  };
}

export function syncScarletWolfKingTeamStatus(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
): boolean {
  if (state.scarletWolfKingJoinedTeam) return true;
  const swk = seats.find((s) => s.roleId === 'scarlet_wolf_king');
  if (!swk || !swk.isAlive) return false;
  const hasOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'scarlet_wolf_king' && isSeatWolfFaction(s),
  );
  return !hasOtherWolf;
}

export function canScarletAttach(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const swk = seats.find((s) => s.roleId === 'scarlet_wolf_king' && s.isAlive);
  if (!swk) return { allowed: false, reason: '場上沒有存活的猩紅狼王' };
  if (targetSeat === null) return { allowed: true };
  if (state.scarletAttachedSeats.length >= 3) {
    return { allowed: false, reason: '猩紅狼王最多只能附著三名玩家' };
  }
  if (state.scarletAttachedSeats.includes(targetSeat)) {
    return { allowed: false, reason: `${targetSeat} 號已被附著猩紅之子` };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '附著目標不存在或已出局' };
  return { allowed: true };
}

export function canNightNobleChooseServant(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const noble = seats.find((s) => s.roleId === 'night_noble' && s.isAlive);
  if (!noble) return { allowed: false, reason: '場上沒有存活的夜之貴族' };
  if (targetSeat === null) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '夜之貴族自第二晚起才可選擇夜僕' };
  if (state.nightNobleServantSeat !== null) {
    const currentServant = seats.find((s) => s.seatNumber === state.nightNobleServantSeat);
    if (currentServant?.isAlive) {
      return { allowed: false, reason: '現有夜僕尚未出局，不可選擇新夜僕' };
    }
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '夜僕目標不存在或已出局' };
  return { allowed: true };
}

export function canAwakenedIdiotShield(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const ai = seats.find((s) => s.roleId === 'awakened_idiot' && s.isAlive && !s.infectedBySeedWolf);
  if (!ai) return { allowed: false, reason: '場上沒有存活的覺醒白痴' };
  if (targetSeat === null) return { allowed: true };
  if (!state.awakenedIdiotSecretActive) {
    return { allowed: false, reason: '覺醒白痴的秘密之身已失效' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '守護目標不存在或已出局' };
  return { allowed: true };
}

export function canWardenTrade(
  seats: PlayerSeat[],
  state: CombatRuntimeState,
  pair: [number | null, number | null] | undefined,
  round: number,
): ActionCheckResult {
  const warden = seats.find((s) => s.roleId === 'warden_wolf' && s.isAlive);
  if (!warden) return { allowed: false, reason: '場上沒有存活的典獄長' };
  if (!pair || (pair[0] === null && pair[1] === null)) return { allowed: true };
  if (round < 2) return { allowed: false, reason: '典獄長自第二晚起才可發動交易' };
  if (pair[0] === null || pair[1] === null || pair[0] === pair[1]) {
    return { allowed: false, reason: '典獄長須選擇兩名不同的存活玩家進行交易' };
  }
  for (const num of [pair[0], pair[1]]) {
    if (state.wardenTradedSeats.includes(num)) {
      return { allowed: false, reason: `${num} 號已參與過交易，每名玩家僅限一次` };
    }
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `交易目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

/** 典獄長交易結果結算 */
export function evaluateWardenTrade(
  wardenSeat: number,
  pair: [number, number],
  choices: ['trade' | 'betray', 'trade' | 'betray'],
): {
  immuneSeats: number[];
  killedSeat: number | null;
  mutualBetraySwap: [number, number] | null;
} {
  const [a, b] = pair;
  const [choiceA, choiceB] = choices;
  if (a === wardenSeat || b === wardenSeat) {
    const other = a === wardenSeat ? b : a;
    if (choiceA === choiceB) {
      return { immuneSeats: [], killedSeat: wardenSeat, mutualBetraySwap: null };
    }
    return { immuneSeats: [], killedSeat: other, mutualBetraySwap: null };
  }
  if (choiceA === 'trade' && choiceB === 'trade') {
    return { immuneSeats: [a, b], killedSeat: null, mutualBetraySwap: null };
  }
  if (choiceA === 'betray' && choiceB === 'betray') {
    return { immuneSeats: [], killedSeat: null, mutualBetraySwap: [a, b] };
  }
  const traderSeat = choiceA === 'trade' ? a : b;
  return { immuneSeats: [], killedSeat: traderSeat, mutualBetraySwap: null };
}
