import { getRoleById } from '../data/roles';
import type {
  ActionCheckResult,
  DeathReason,
  Faction,
  HiddenWolfRuntimeState,
  HybridRuntimeState,
  PlayerSeat,
  SeedWolfRuntimeState,
} from './types';

export function createInitialHybridState(): HybridRuntimeState {
  return {
    idolSeat: null,
    alignedFaction: null,
  };
}

export function createInitialSeedWolfState(): SeedWolfRuntimeState {
  return {
    infectUsed: false,
    infectedSeat: null,
  };
}

export function createInitialHiddenWolfState(): HiddenWolfRuntimeState {
  return {
    hasJoinedWolfTeam: false,
  };
}

/** 判斷該座位目前是否屬於狼人陣營（含被種狼感染轉化為狼人者） */
export function isSeatWolfFaction(seat: PlayerSeat): boolean {
  if (seat.infectedBySeedWolf) return true;
  if (!seat.roleId) return false;
  const role = getRoleById(seat.roleId);
  return role?.faction === 'wolf';
}

// =========================
// 1. 夢魘（nightmare）
// =========================

export function findNightmareSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'nightmare');
}

/**
 * 檢核夢魘當晚恐懼目標是否合法：
 * - 夢魘必須存活
 * - 不可恐懼自己
 * - 不可連續兩晚恐懼同一人
 * - 首夜（round === 1）尚未認狼隊友，可恐懼任何非己存活玩家（含狼隊友，誤恐則整晚狼隊空刀）
 * - 第二晚起（round >= 2）不可恐懼狼隊友
 */
export function canNightmareFear(
  seats: PlayerSeat[],
  lastFearedSeat: number | null,
  targetSeat: number | null,
  round: number,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const nightmare = seats.find((seat) => seat.roleId === 'nightmare' && seat.isAlive);
  if (!nightmare) {
    return { allowed: false, reason: '場上沒有存活的夢魘' };
  }
  if (targetSeat === null) {
    if (options.allowSkip) {
      return { allowed: true };
    }
    return { allowed: true };
  }
  if (targetSeat === nightmare.seatNumber) {
    return { allowed: false, reason: '夢魘不可恐懼自己' };
  }
  if (lastFearedSeat !== null && lastFearedSeat === targetSeat) {
    return { allowed: false, reason: '夢魘不可連續兩晚恐懼同一名玩家' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '恐懼目標不存在或已出局' };
  }
  if (round >= 2 && isSeatWolfFaction(target)) {
    return { allowed: false, reason: '第二晚起夢魘不可恐懼狼隊友' };
  }
  return { allowed: true };
}

// =========================
// 2. 惡靈騎士（evil_knight）
// =========================

export function findEvilKnightSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'evil_knight');
}

const NIGHT_SHOOT_DEATH_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'milk_pierce',
  'mech_wolf_kill',
]);

/**
 * 判斷惡靈騎士是否免疫此次獵人開槍：
 * - 晚上被狼殺（含奶穿／機械狼刀）出局的獵人對惡靈騎士開槍屬於夜間傷害，對惡靈騎士無效。
 * - 白天被放逐出局的獵人開槍不屬於夜間傷害，可以帶走惡靈騎士。
 */
export function isEvilKnightNightShootImmune(
  target: PlayerSeat,
  shooterRoleId: 'hunter' | 'wolf_king',
  shooterDeathReason: DeathReason,
): boolean {
  if (target.roleId !== 'evil_knight') return false;
  if (shooterRoleId !== 'hunter') return false;
  return NIGHT_SHOOT_DEATH_REASONS.has(shooterDeathReason);
}

// =========================
// 3. 混血兒（hybrid）
// =========================

export function findHybridSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'hybrid');
}

/**
 * 檢核混血兒首夜選擇榜樣是否合法：
 * - 混血兒必須存活且為第一晚（round === 1）
 * - 必須選擇自己以外的一名存活玩家
 */
export function canHybridChooseIdol(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const hybrid = seats.find((seat) => seat.roleId === 'hybrid' && seat.isAlive);
  if (!hybrid) {
    return { allowed: false, reason: '場上沒有存活的混血兒' };
  }
  if (round !== 1) {
    return { allowed: false, reason: '混血兒僅能在第一晚選擇榜樣' };
  }
  if (targetSeat === null) {
    if (options.allowSkip) {
      return { allowed: true };
    }
    return { allowed: false, reason: '混血兒第一晚必須選擇一名自己以外的存活玩家作為榜樣' };
  }
  if (targetSeat === hybrid.seatNumber) {
    return { allowed: false, reason: '混血兒不可選擇自己作為榜樣' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '榜樣目標不存在或已出局' };
  }
  return { allowed: true };
}

/**
 * 依據榜樣目前之所屬陣營（含榜樣被種狼感染轉化為狼人）計算混血兒綁定陣營。
 */
export function getSeatEffectiveFaction(seat: PlayerSeat): Faction | null {
  if (seat.infectedBySeedWolf) return 'wolf';
  if (!seat.roleId) return null;
  const role = getRoleById(seat.roleId);
  return role?.faction ?? null;
}

export function applyHybridChooseIdol(
  state: HybridRuntimeState,
  seats: PlayerSeat[],
  targetSeat: number | null,
): HybridRuntimeState {
  if (targetSeat === null) {
    return { ...state };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target) {
    return { ...state };
  }
  const alignedFaction = getSeatEffectiveFaction(target);
  return {
    idolSeat: targetSeat,
    alignedFaction,
  };
}

/**
 * 依據場上最新座位狀態同步混血兒榜樣所屬陣營（例如榜樣後續被種狼感染轉狼時即時更新）。
 */
export function syncHybridAffiliation(
  state: HybridRuntimeState,
  seats: PlayerSeat[],
): HybridRuntimeState {
  if (state.idolSeat === null) return state;
  const idol = seats.find((seat) => seat.seatNumber === state.idolSeat);
  if (!idol) return state;
  const nextFaction = getSeatEffectiveFaction(idol);
  if (nextFaction === state.alignedFaction) return state;
  return {
    ...state,
    alignedFaction: nextFaction,
  };
}

// =========================
// 4. 種狼（seed_wolf）
// =========================

export function findSeedWolfSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'seed_wolf');
}

/**
 * 檢核種狼當晚是否可發動感染技能（整局限一次，使當晚狼刀改為感染）：
 * - 種狼必須存活且尚未使用感染
 * - 目標須為存活玩家，且不可為已屬於狼隊之隊友（但允許感染不入狼隊的隱狼，依娛百版 Q&A）
 */
export function canSeedWolfInfect(
  seats: PlayerSeat[],
  seedWolfState: SeedWolfRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  if (targetSeat === null) {
    return { allowed: true };
  }
  const seedWolf = seats.find((seat) => seat.roleId === 'seed_wolf' && seat.isAlive);
  if (!seedWolf) {
    return { allowed: false, reason: '場上沒有存活的種狼' };
  }
  if (seedWolfState.infectUsed) {
    return { allowed: false, reason: '種狼的感染技能每局僅能使用一次' };
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '感染目標不存在或已出局' };
  }
  if (target.seatNumber === seedWolf.seatNumber) {
    return { allowed: false, reason: '種狼不可感染自己' };
  }
  if (target.infectedBySeedWolf) {
    return { allowed: false, reason: '該玩家已被感染為狼人' };
  }
  const targetRole = getRoleById(target.roleId);
  if (targetRole?.faction === 'wolf' && target.roleId !== 'hidden_wolf') {
    return { allowed: false, reason: '種狼不可感染已知的狼隊友' };
  }
  return { allowed: true };
}

// =========================
// 5. 隱狼（hidden_wolf）
// =========================

export function findHiddenWolfSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((seat) => seat.roleId === 'hidden_wolf');
}

/**
 * 判斷隱狼是否應自動入狼隊並獲得狼刀權限：
 * - 隱狼必須存活（且未被種狼感染提前入隊，若被感染則視同已入隊）
 * - 場上所有其他狼人陣營玩家皆已淘汰（若尚有未入隊機械狼等其他存活狼人，依雲端探查 Q&A 不可提前帶刀）
 */
export function shouldHiddenWolfJoinWolfTeam(
  seats: PlayerSeat[],
  state: HiddenWolfRuntimeState,
): boolean {
  if (state.hasJoinedWolfTeam) return true;
  const hiddenWolf = findHiddenWolfSeat(seats);
  if (!hiddenWolf || !hiddenWolf.isAlive) return false;
  if (hiddenWolf.infectedBySeedWolf) return true;

  const hasAliveOtherWolf = seats.some((seat) => {
    if (!seat.isAlive || seat.seatNumber === hiddenWolf.seatNumber) return false;
    return isSeatWolfFaction(seat);
  });

  return !hasAliveOtherWolf;
}

export function syncHiddenWolfTeamStatus(
  seats: PlayerSeat[],
  state: HiddenWolfRuntimeState,
): HiddenWolfRuntimeState {
  const hasJoinedWolfTeam = shouldHiddenWolfJoinWolfTeam(seats, state);
  if (hasJoinedWolfTeam === state.hasJoinedWolfTeam) {
    return state;
  }
  return {
    ...state,
    hasJoinedWolfTeam,
  };
}
