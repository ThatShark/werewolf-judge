import { getRoleById } from '../data/roles';
import { getPsychicCheckResult, getSeerCheckResult } from './mechWolf';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  AwakenedDreamCheckOutcome,
  AwakenedSeerCheckOutcome,
  DeathReason,
  DemonWolfCheckOutcome,
  ExiledRecord,
  FoxCheckOutcome,
  GargoyleRuntimeState,
  GravekeeperExileOutcome,
  MechWolfRuntimeState,
  MoonSpiritHowlResult,
  NightActionDraft,
  NineTailedFoxResult,
  PlayerSeat,
  PsychicCheckOutcome,
  PumpkinGhostRuntimeState,
  SeerCheckOutcome,
  SeniorVillagerRevealResult,
  SuperGravekeeperRuntimeState,
  TreasureMasterRuntimeState,
} from './types';

// =========================
// 初始狀態工廠
// =========================

export function createInitialGargoyleState(): GargoyleRuntimeState {
  return {
    hasJoinedWolfTeam: false,
    checkHistory: [],
  };
}

export function createInitialPumpkinGhostState(): PumpkinGhostRuntimeState {
  return {
    hasInherited: false,
    inheritedHistory: [],
  };
}

export function createInitialSuperGravekeeperState(): SuperGravekeeperRuntimeState {
  return {
    heirSeat: null,
    heirInherited: false,
    superGravekeeperSeat: null,
  };
}

// =========================
// 共用輔助函式（鄰居與偽裝）
// =========================

/** 依座號環狀尋找指定座位左右最近且存活的兩名鄰居 */
export function findAliveNeighbors(
  seats: PlayerSeat[],
  centerSeatNumber: number,
): { leftNeighbor: PlayerSeat | null; rightNeighbor: PlayerSeat | null } {
  const ordered = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const total = ordered.length;
  const centerIdx = ordered.findIndex((s) => s.seatNumber === centerSeatNumber);
  if (centerIdx === -1 || total <= 1) {
    return { leftNeighbor: null, rightNeighbor: null };
  }

  let leftNeighbor: PlayerSeat | null = null;
  for (let offset = 1; offset < total; offset += 1) {
    const candidate = ordered[(centerIdx - offset + total) % total];
    if (candidate.isAlive && candidate.seatNumber !== centerSeatNumber) {
      leftNeighbor = candidate;
      break;
    }
  }

  let rightNeighbor: PlayerSeat | null = null;
  for (let offset = 1; offset < total; offset += 1) {
    const candidate = ordered[(centerIdx + offset) % total];
    if (candidate.isAlive && candidate.seatNumber !== centerSeatNumber) {
      rightNeighbor = candidate;
      break;
    }
  }

  return { leftNeighbor, rightNeighbor };
}

/** 判斷南瓜鬼目前是否處於石像鬼存活前的預言家金水偽裝期 */
export function isPumpkinGhostSeerDisguised(seats: PlayerSeat[]): boolean {
  const gargoyle = seats.find((s) => s.roleId === 'gargoyle');
  return Boolean(gargoyle && gargoyle.isAlive);
}

/** 判斷角色在預言家系陣營查驗下是否顯示為好人（含雪狼、隱狼、混血兒、咒狐、石像鬼存活時之南瓜鬼） */
export function isSeerFactionGood(seats: PlayerSeat[], targetSeat: number): boolean | null {
  const outcome = getSeerCheckResult(seats, targetSeat);
  if (!outcome) return null;
  return outcome.faction === 'good';
}

// =========================
// 1. 覺醒預言家（awakened_seer）
// =========================

export function findAwakenedSeerSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'awakened_seer');
}

/**
 * 覺醒預言家每晚查驗 2 名存活玩家（可包含自己，含自己等同單驗另一人）：
 * - 兩位在陣營查驗下皆為好人（含隱狼／雪狼／混血兒／咒狐）→ 'double_good'（雙金水）
 * - 至少一位為狼人 → 'suspected_wolf'（疑似狼人）
 */
export function getAwakenedSeerCheckResult(
  seats: PlayerSeat[],
  targetSeats: [number, number],
): AwakenedSeerCheckOutcome | null {
  const [seatA, seatB] = targetSeats;
  const resA = getSeerCheckResult(seats, seatA);
  const resB = getSeerCheckResult(seats, seatB);
  if (!resA || !resB) return null;

  const bothGood = resA.faction === 'good' && resB.faction === 'good';
  return {
    targetSeats: [seatA, seatB],
    result: bothGood ? 'double_good' : 'suspected_wolf',
  };
}

// =========================
// 2. 燈影預言家（lantern_seer）
// =========================

export function findLanternSeerSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'lantern_seer');
}

/**
 * 燈影預言家查驗結果與真實預言家完全相反：
 * - 真實為好人（金水）→ 顯示狼人（查殺）
 * - 真實為狼人（查殺）→ 顯示好人（金水）
 */
export function getLanternSeerCheckResult(
  seats: PlayerSeat[],
  targetSeat: number,
): SeerCheckOutcome | null {
  const realOutcome = getSeerCheckResult(seats, targetSeat);
  if (!realOutcome) return null;
  return {
    targetSeat,
    faction: realOutcome.faction === 'good' ? 'wolf' : 'good',
  };
}

// =========================
// 3. 酒鬼預言家（drunk_seer）
// =========================

export function findDrunkSeerSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'drunk_seer');
}

/**
 * 酒鬼預言家每晚查驗結果為隨機（或由法官手動指定金水／查殺）。
 */
export function getDrunkSeerCheckResult(
  seats: PlayerSeat[],
  targetSeat: number,
  options: {
    manualOverride?: 'good' | 'wolf' | null;
    rng?: () => number;
  } = {},
): SeerCheckOutcome | null {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.roleId) return null;
  if (options.manualOverride === 'good' || options.manualOverride === 'wolf') {
    return { targetSeat, faction: options.manualOverride };
  }
  const rng = options.rng ?? Math.random;
  return {
    targetSeat,
    faction: rng() < 0.5 ? 'good' : 'wolf',
  };
}

// =========================
// 4. 愚言家（fool_seer）與鐵好人（iron_good）
// =========================

export function findFoolSeerSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'fool_seer');
}

export function getFoolSeerCheckResult(
  seats: PlayerSeat[],
  targetSeat: number,
): SeerCheckOutcome | null {
  return getSeerCheckResult(seats, targetSeat);
}

/** 檢核愚言家或鐵好人是否可於白天翻牌自曝 */
export function canGoodSelfExplode(seats: PlayerSeat[], seatNumber: number): ActionCheckResult {
  const seat = seats.find((s) => s.seatNumber === seatNumber);
  if (!seat || !seat.isAlive) {
    return { allowed: false, reason: '玩家不存在或已出局' };
  }
  if (seat.roleId !== 'fool_seer' && seat.roleId !== 'iron_good') {
    return { allowed: false, reason: '只有愚言家與鐵好人可在白天發動好人自曝' };
  }
  if (seat.infectedBySeedWolf) {
    return { allowed: false, reason: '已被種狼感染轉化為狼人，請使用狼人自爆' };
  }
  return { allowed: true };
}

// =========================
// 5. 狐狸（fox）
// =========================

export function findFoxSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'fox');
}

/**
 * 狐狸每晚查驗指定存活目標及其左右兩側存活鄰居（共 3 人，若場上人數不足則取實際不重複存活者）：
 * - 三人中只要包含至少 1 名狼人陣營（含感染者）→ hasWolf = true, lostAbility = false
 * - 三人皆非狼人 → hasWolf = false, lostAbility = true（永久失去查驗功能）
 */
export function getFoxCheckResult(
  seats: PlayerSeat[],
  centerSeat: number,
  alreadyLostAbility: boolean,
): FoxCheckOutcome | null {
  if (alreadyLostAbility) {
    return null;
  }
  const center = seats.find((s) => s.seatNumber === centerSeat && s.isAlive);
  if (!center) return null;

  const { leftNeighbor, rightNeighbor } = findAliveNeighbors(seats, centerSeat);
  const seatNumbers = Array.from(
    new Set(
      [leftNeighbor?.seatNumber, center.seatNumber, rightNeighbor?.seatNumber].filter(
        (n): n is number => typeof n === 'number',
      ),
    ),
  );

  const hasWolf = seatNumbers.some((num) => {
    const s = seats.find((seat) => seat.seatNumber === num);
    return s ? isSeatWolfFaction(s) : false;
  });

  return {
    centerSeat,
    checkedSeats: seatNumbers,
    hasWolf,
    lostAbility: !hasWolf,
  };
}

// =========================
// 6. 咒狐（cursed_fox）與雪狼（snow_wolf）
// =========================

export function findCursedFoxSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'cursed_fox');
}

export function isCursedFoxSeat(seat: PlayerSeat | undefined): boolean {
  return Boolean(seat && seat.roleId === 'cursed_fox');
}

export function isSnowWolfSeat(seat: PlayerSeat | undefined): boolean {
  return Boolean(seat && seat.roleId === 'snow_wolf');
}

// =========================
// 7. 石像鬼（gargoyle）與南瓜鬼（pumpkin_ghost）
// =========================

export function findGargoyleSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'gargoyle');
}

export function findPumpkinGhostSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'pumpkin_ghost');
}

export function getGargoyleCheckResult(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  treasureMasterState?: TreasureMasterRuntimeState,
): PsychicCheckOutcome | null {
  return getPsychicCheckResult(seats, mechWolfState, targetSeat, treasureMasterState);
}

export function shouldGargoyleJoinWolfTeam(
  seats: PlayerSeat[],
  gargoyleState: GargoyleRuntimeState,
): boolean {
  if (gargoyleState.hasJoinedWolfTeam) return true;
  const gargoyle = findGargoyleSeat(seats);
  if (!gargoyle || !gargoyle.isAlive) return false;

  const hasAliveOtherWolf = seats.some((seat) => {
    if (!seat.isAlive || seat.roleId === 'gargoyle') return false;
    return isSeatWolfFaction(seat);
  });
  return !hasAliveOtherWolf;
}

export function syncGargoyleTeamStatus(
  seats: PlayerSeat[],
  gargoyleState: GargoyleRuntimeState,
): GargoyleRuntimeState {
  const hasJoinedWolfTeam = shouldGargoyleJoinWolfTeam(seats, gargoyleState);
  if (hasJoinedWolfTeam === gargoyleState.hasJoinedWolfTeam) {
    return gargoyleState;
  }
  return {
    ...gargoyleState,
    hasJoinedWolfTeam,
  };
}

/** 同步南瓜鬼繼承狀態：石像鬼出局後，南瓜鬼繼承石像鬼過去全部查驗紀錄並獲得驗人能力 */
export function syncPumpkinGhostInheritance(
  seats: PlayerSeat[],
  gargoyleState: GargoyleRuntimeState,
  pumpkinGhostState: PumpkinGhostRuntimeState,
): PumpkinGhostRuntimeState {
  const pumpkinGhost = findPumpkinGhostSeat(seats);
  const gargoyle = findGargoyleSeat(seats);
  if (!pumpkinGhost || !gargoyle) return pumpkinGhostState;

  if (!gargoyle.isAlive && !pumpkinGhostState.hasInherited) {
    return {
      hasInherited: true,
      inheritedHistory: [...gargoyleState.checkHistory],
    };
  }
  return pumpkinGhostState;
}

export function getPumpkinGhostCheckResult(
  seats: PlayerSeat[],
  pumpkinGhostState: PumpkinGhostRuntimeState,
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  treasureMasterState?: TreasureMasterRuntimeState,
): PsychicCheckOutcome | null {
  if (!pumpkinGhostState.hasInherited) return null;
  return getPsychicCheckResult(seats, mechWolfState, targetSeat, treasureMasterState);
}

// =========================
// 8. 狼巫（wolf_witch）與純白之女（pure_white_maiden）
// =========================

export function findWolfWitchSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'wolf_witch');
}

export function findPureWhiteMaidenSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'pure_white_maiden');
}

export function getWolfWitchCheckResult(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  treasureMasterState?: TreasureMasterRuntimeState,
): PsychicCheckOutcome | null {
  return getPsychicCheckResult(seats, mechWolfState, targetSeat, treasureMasterState);
}

/** 狼巫第二晚起查驗到純白之女，則隔天純白之女死亡 */
export function doesWolfWitchKillTarget(
  seats: PlayerSeat[],
  targetSeat: number,
  round: number,
): boolean {
  if (round < 2) return false;
  const target = seats.find((s) => s.seatNumber === targetSeat);
  return Boolean(target && target.isAlive && target.roleId === 'pure_white_maiden');
}

export function getPureWhiteCheckResult(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  treasureMasterState?: TreasureMasterRuntimeState,
): PsychicCheckOutcome | null {
  return getPsychicCheckResult(seats, mechWolfState, targetSeat, treasureMasterState);
}

/**
 * 純白之女第二晚起查驗到狼人陣營則使對方出局：
 * - 驗機械狼（Q&A）：尚未學習或學到狼人陣營則出局；學到好人陣營則僅顯示所學身分且不出局
 * - 驗咒狐：顯示咒狐且不出局
 * - 驗被種狼感染者：視為狼人陣營，出局
 */
export function doesPureWhiteKillTarget(
  seats: PlayerSeat[],
  mechWolfState: MechWolfRuntimeState,
  targetSeat: number,
  round: number,
): boolean {
  if (round < 2) return false;
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return false;
  if (target.roleId === 'cursed_fox') return false;
  if (target.infectedBySeedWolf) return true;

  if (target.roleId === 'mech_wolf') {
    if (!mechWolfState.learnedRoleId) return true;
    const learnedRole = getRoleById(mechWolfState.learnedRoleId);
    return learnedRole?.faction === 'wolf';
  }

  return isSeatWolfFaction(target);
}

// =========================
// 9. 惡魔（demon_wolf）
// =========================

export function findDemonWolfSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'demon_wolf');
}

const DEMON_WOLF_NIGHT_SHOOT_REASONS: ReadonlySet<DeathReason> = new Set([
  'wolf_kill',
  'milk_pierce',
  'mech_wolf_kill',
  'pure_white_check_kill',
  'wolf_witch_check_kill',
]);

/** 惡魔免疫所有夜間傷害（毒藥、夜死獵人開槍） */
export function isDemonWolfNightShootImmune(
  target: PlayerSeat,
  shooterRoleId: 'hunter' | 'wolf_king',
  shooterDeathReason: DeathReason,
): boolean {
  if (target.roleId !== 'demon_wolf') return false;
  if (shooterRoleId !== 'hunter') return false;
  return DEMON_WOLF_NIGHT_SHOOT_REASONS.has(shooterDeathReason);
}

/** 檢核惡魔查驗目標（不可查狼隊友） */
export function canDemonWolfCheck(
  seats: PlayerSeat[],
  targetSeat: number | null,
): ActionCheckResult {
  const demonWolf = seats.find((s) => s.roleId === 'demon_wolf' && s.isAlive);
  if (!demonWolf) {
    return { allowed: false, reason: '場上沒有存活的惡魔' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '查驗目標不存在或已出局' };
  }
  if (isSeatWolfFaction(target)) {
    return { allowed: false, reason: '惡魔僅能查驗狼隊以外的玩家' };
  }
  return { allowed: true };
}

/** 惡魔查驗非狼玩家：僅得知「神職（god）」或「平民（villager）」，不知道具體身分 */
export function getDemonWolfCheckResult(
  seats: PlayerSeat[],
  targetSeat: number,
): DemonWolfCheckOutcome | null {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.roleId || isSeatWolfFaction(target)) return null;
  const role = getRoleById(target.roleId);
  if (!role) return null;
  return {
    targetSeat,
    roleType: role.category === 'god' ? 'god' : 'villager',
  };
}

// =========================
// 10. 守墓人（gravekeeper）與超級守墓人（super_gravekeeper）
// =========================

export function findGravekeeperSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'gravekeeper');
}

export function findSuperGravekeeperSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'super_gravekeeper');
}

/** 依規則判定被放逐紀錄在守墓人／超級守墓人眼中的陣營（隱狼／南瓜鬼／雪狼／石像鬼／感染者→狼；咒狐→好人） */
export function getGravekeeperFactionForRecord(record: ExiledRecord): 'wolf' | 'good' {
  if (record.infectedBySeedWolf) return 'wolf';
  if (!record.roleId) return 'good';
  if (record.roleId === 'cursed_fox') return 'good';
  const role = getRoleById(record.roleId);
  return role?.faction === 'wolf' ? 'wolf' : 'good';
}

/** 取得第 round 晚（對應第 round - 1 天放逐）之守墓人查驗結果 */
export function getGravekeeperExileResult(
  exiledHistory: ExiledRecord[],
  round: number,
): GravekeeperExileOutcome {
  if (round < 2) {
    return {
      exiledSeat: null,
      faction: null,
      summary: '第一晚尚無放逐紀錄',
    };
  }
  const previousDayRound = round - 1;
  const record = [...exiledHistory].reverse().find((r) => r.round === previousDayRound);
  if (!record) {
    return {
      exiledSeat: null,
      faction: null,
      summary: `第 ${previousDayRound} 天無放逐出局玩家`,
    };
  }
  const faction = getGravekeeperFactionForRecord(record);
  return {
    exiledSeat: record.seatNumber,
    faction,
    summary: `第 ${previousDayRound} 天被放逐之 ${record.seatNumber} 號為「${
      faction === 'wolf' ? '狼人陣營' : '好人陣營'
    }」`,
  };
}

export function canSuperGravekeeperChooseHeir(
  seats: PlayerSeat[],
  targetSeat: number | null,
): ActionCheckResult {
  const sg = seats.find((s) => s.roleId === 'super_gravekeeper' && s.isAlive);
  if (!sg) {
    return { allowed: false, reason: '場上沒有存活的超級守墓人' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (targetSeat === sg.seatNumber) {
    return { allowed: false, reason: '超級守墓人不可選擇自己作為繼承者' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '繼承者目標不存在或已出局' };
  }
  return { allowed: true };
}

/**
 * 同步超級守墓人繼承狀態：
 * 當超級守墓人出局時，若最新選定的繼承者為存活的好人陣營（非狼且非感染者），則繼承者接手墓地查驗並得知全部歷史紀錄與超級守墓人座號。
 */
export function syncSuperGravekeeperInheritance(
  seats: PlayerSeat[],
  state: SuperGravekeeperRuntimeState,
): SuperGravekeeperRuntimeState {
  const sg = findSuperGravekeeperSeat(seats);
  if (!sg) return state;

  const baseState: SuperGravekeeperRuntimeState =
    state.superGravekeeperSeat === sg.seatNumber
      ? state
      : { ...state, superGravekeeperSeat: sg.seatNumber };

  if (sg.isAlive || baseState.heirInherited || baseState.heirSeat === null) {
    return baseState;
  }

  const heir = seats.find((s) => s.seatNumber === baseState.heirSeat);
  if (!heir || !heir.isAlive || isSeatWolfFaction(heir)) {
    return baseState;
  }

  const heirRole = getRoleById(heir.roleId);
  if (heirRole?.faction !== 'good') {
    return baseState;
  }

  return {
    ...baseState,
    heirInherited: true,
  };
}

// =========================
// 11. 月靈狼（moon_spirit_wolf）
// =========================

export function findMoonSpiritWolfSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'moon_spirit_wolf');
}

/**
 * 月靈狼每晚在狼隊行動前感知左右兩側存活玩家是否含神職（category === 'god'）：
 * - 被夢魘恐懼則不嗥叫
 * - 任一存活鄰居為未感染之神職則嗥叫
 */
export function evaluateMoonSpiritHowl(
  seats: PlayerSeat[],
  fearedSeat: number | null = null,
): MoonSpiritHowlResult {
  const moonSpirit = findMoonSpiritWolfSeat(seats);
  if (!moonSpirit) {
    return {
      moonSpiritSeat: null,
      alive: false,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      howled: false,
      reason: '本局未配置月靈狼',
    };
  }
  if (!moonSpirit.isAlive) {
    return {
      moonSpiritSeat: moonSpirit.seatNumber,
      alive: false,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      howled: false,
      reason: '月靈狼已出局，今晚不會嗥叫',
    };
  }
  if (fearedSeat !== null && fearedSeat === moonSpirit.seatNumber) {
    return {
      moonSpiritSeat: moonSpirit.seatNumber,
      alive: true,
      leftNeighborSeat: null,
      rightNeighborSeat: null,
      howled: false,
      reason: '月靈狼今晚遭夢魘恐懼，不會嗥叫',
    };
  }

  const { leftNeighbor, rightNeighbor } = findAliveNeighbors(seats, moonSpirit.seatNumber);
  const isGodNeighbor = (seat: PlayerSeat | null): boolean => {
    if (!seat || !seat.roleId || seat.infectedBySeedWolf) return false;
    const role = getRoleById(seat.roleId);
    return role?.category === 'god';
  };

  const howled = isGodNeighbor(leftNeighbor) || isGodNeighbor(rightNeighbor);
  const leftLabel = leftNeighbor ? `${leftNeighbor.seatNumber}號` : '無';
  const rightLabel = rightNeighbor ? `${rightNeighbor.seatNumber}號` : '無';

  return {
    moonSpiritSeat: moonSpirit.seatNumber,
    alive: true,
    leftNeighborSeat: leftNeighbor?.seatNumber ?? null,
    rightNeighborSeat: rightNeighbor?.seatNumber ?? null,
    howled,
    reason: howled
      ? `月靈狼嗥叫（存活鄰居 ${leftLabel}、${rightLabel} 中含神職）`
      : `月靈狼未嗥叫（存活鄰居 ${leftLabel}、${rightLabel} 皆無神職）`,
  };
}

// =========================
// 12. 九尾狐（nine_tailed_fox）
// =========================

export function findNineTailedFoxSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'nine_tailed_fox');
}

/**
 * 計算九尾狐剩餘尾巴數：
 * - 初始 9 條尾巴
 * - 依 Q&A：僅計算「已公布死亡」的玩家（deathRound < currentRound，不含當晚尚未公布之死訊）
 * - 神職死亡 -2 條、平民死亡 -1 條、狼人死亡不扣
 * - 剩餘 <= 0 條時，九尾狐當晚死亡
 */
export function evaluateNineTailedFoxTails(
  seats: PlayerSeat[],
  currentRound: number,
): NineTailedFoxResult {
  const foxSeat = findNineTailedFoxSeat(seats);
  if (!foxSeat) {
    return {
      seatNumber: null,
      alive: false,
      tailsRemaining: 0,
      diedFromNoTails: false,
      reason: '本局未配置九尾狐',
    };
  }

  let lostTails = 0;
  for (const seat of seats) {
    if (seat.isAlive) continue;
    // 當晚尚未公布之死訊（deathRound === currentRound）不計入九尾狐當晚尾巴計算
    if (seat.deathRound !== undefined && seat.deathRound >= currentRound) continue;
    if (!seat.roleId) continue;
    const role = getRoleById(seat.roleId);
    if (!role || role.faction === 'wolf') continue;
    if (role.category === 'god') {
      lostTails += 2;
    } else if (role.category === 'villager') {
      lostTails += 1;
    }
  }

  const tailsRemaining = Math.max(0, 9 - lostTails);
  const diedFromNoTails = foxSeat.isAlive && tailsRemaining === 0;

  return {
    seatNumber: foxSeat.seatNumber,
    alive: foxSeat.isAlive,
    tailsRemaining,
    diedFromNoTails,
    reason: diedFromNoTails
      ? '九尾狐已失去全部 9 條尾巴，今晚出局'
      : `九尾狐剩餘 ${tailsRemaining} 條尾巴（累計已損失 ${lostTails} 條）`,
  };
}

// =========================
// 13. 高級平民（senior_villager）
// =========================

export function findSeniorVillagerSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'senior_villager');
}

/**
 * 高級平民規則：第一天死訊後直接公布高級平民身分，若第一夜即被種狼感染則不公布。
 */
export function evaluateSeniorVillagerReveal(
  seats: PlayerSeat[],
  round: number,
): SeniorVillagerRevealResult {
  const senior = findSeniorVillagerSeat(seats);
  if (!senior) {
    return { seatNumber: null, revealed: false, reason: '本局未配置高級平民' };
  }
  if (round !== 1) {
    return {
      seatNumber: senior.seatNumber,
      revealed: false,
      reason: '僅於第一天死訊後公布高級平民身分',
    };
  }
  if (senior.infectedBySeedWolf) {
    return {
      seatNumber: senior.seatNumber,
      revealed: false,
      reason: '高級平民於第一夜遭種狼感染，天亮不公布身分',
    };
  }
  return {
    seatNumber: senior.seatNumber,
    revealed: true,
    reason: `第一天死訊後公布：${senior.seatNumber} 號為高級平民`,
  };
}

// =========================
// 14. 覺醒攝夢人（awakened_dream_catcher）
// =========================

export function findAwakenedDreamCatcherSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find((s) => s.roleId === 'awakened_dream_catcher');
}

export function canAwakenedDreamCatcherDream(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
  options: { allowSkip?: boolean } = {},
): ActionCheckResult {
  const adc = seats.find(
    (s) => s.roleId === 'awakened_dream_catcher' && s.isAlive && !s.infectedBySeedWolf,
  );
  if (!adc) {
    return { allowed: false, reason: '場上沒有存活的覺醒攝夢人' };
  }
  if (targetSeat === null) {
    if (options.allowSkip) return { allowed: true };
    return { allowed: false, reason: '覺醒攝夢人每晚必須選擇一名自己以外的存活玩家成為夢語者' };
  }
  if (targetSeat === adc.seatNumber) {
    return { allowed: false, reason: '覺醒攝夢人不可選擇自己成為夢語者' };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '覺醒攝夢人不可連續兩晚選擇同一名夢語者' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '夢語者目標不存在或已出局' };
  }
  return { allowed: true };
}

/**
 * 判斷夢語者當晚是否有行動：
 * 1. 守墓人／超級守墓人晚上必定有行動
 * 2. 獵人與平民晚上視為沒有行動
 * 3. 其他角色依當晚實際行動草稿判定（如狼隊有開刀／女巫有用藥／預言家有查驗等）
 */
export function evaluateAwakenedDreamTargetActed(
  seats: PlayerSeat[],
  targetSeat: number,
  draft: NightActionDraft,
  round: number,
  fearedSeat: number | null = null,
): AwakenedDreamCheckOutcome {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  const killedByDream = round >= 2 && Boolean(draft.awakenedDreamKillTarget);
  if (!target || !target.roleId) {
    return {
      targetSeat,
      didActTonight: false,
      killedByDream,
      reason: '目標不存在或無身分',
    };
  }

  if (fearedSeat !== null && fearedSeat === targetSeat) {
    return {
      targetSeat,
      didActTonight: false,
      killedByDream,
      reason: `${targetSeat} 號當晚遭夢魘恐懼，無行動`,
    };
  }

  // 明確規則例外
  if (target.roleId === 'gravekeeper' || target.roleId === 'super_gravekeeper') {
    return {
      targetSeat,
      didActTonight: true,
      killedByDream,
      reason: `${targetSeat} 號為守墓人系角色，晚上必定有行動`,
    };
  }
  if (
    target.roleId === 'hunter' ||
    target.roleId === 'villager' ||
    target.roleId === 'senior_villager' ||
    target.roleId === 'iron_good'
  ) {
    return {
      targetSeat,
      didActTonight: false,
      killedByDream,
      reason: `${targetSeat} 號為獵人／平民，晚上視為沒有行動`,
    };
  }

  let didAct = false;
  switch (target.roleId) {
    case 'witch':
      didAct = draft.witchUseAntidote || draft.witchPoisonTarget !== null;
      break;
    case 'poisoner':
      didAct = draft.poisonerTarget != null;
      break;
    case 'guard':
      didAct = draft.guardTarget !== null;
      break;
    case 'seer':
      didAct = draft.seerCheckTarget !== null;
      break;
    case 'psychic':
      didAct = draft.psychicCheckTarget !== null;
      break;
    case 'awakened_seer':
      didAct = Boolean(
        draft.awakenedSeerTargets &&
          draft.awakenedSeerTargets[0] !== null &&
          draft.awakenedSeerTargets[1] !== null,
      );
      break;
    case 'lantern_seer':
      didAct = draft.lanternSeerCheckTarget != null;
      break;
    case 'drunk_seer':
      didAct = draft.drunkSeerCheckTarget != null;
      break;
    case 'fool_seer':
      didAct = draft.foolSeerCheckTarget != null;
      break;
    case 'fox':
      didAct = draft.foxCheckTarget != null;
      break;
    case 'gargoyle':
      didAct = draft.gargoyleCheckTarget != null;
      break;
    case 'wolf_witch':
      didAct = draft.wolfTarget !== null || draft.wolfWitchCheckTarget != null;
      break;
    case 'pure_white_maiden':
      didAct = draft.pureWhiteCheckTarget != null;
      break;
    case 'demon_wolf':
      didAct = draft.wolfTarget !== null || draft.demonWolfCheckTarget != null;
      break;
    case 'pumpkin_ghost':
      didAct = draft.wolfTarget !== null || draft.pumpkinGhostCheckTarget != null;
      break;
    case 'dream_catcher':
      didAct = draft.dreamCatcherTarget != null;
      break;
    case 'nightmare':
      didAct = draft.nightmareFearTarget != null || draft.wolfTarget !== null;
      break;
    case 'wolf_beauty':
      didAct = draft.wolfBeautyCharmTarget != null || draft.wolfTarget !== null;
      break;
    default: {
      // 狼人陣營有參與狼刀或感染則視為有行動
      if (isSeatWolfFaction(target)) {
        didAct = draft.wolfTarget !== null || draft.seedWolfInfectTarget != null;
      }
      break;
    }
  }

  return {
    targetSeat,
    didActTonight: didAct,
    killedByDream,
    reason: didAct ? `${targetSeat} 號今晚有行動` : `${targetSeat} 號今晚沒有行動`,
  };
}
