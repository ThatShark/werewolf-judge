import { getRoleById } from '../data/roles';
import { findAliveNeighbors } from './inspectionRoles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  ConversionRuntimeState,
  DeathReason,
  PlayerSeat,
  VictoryResult,
} from './types';

export function createInitialConversionState(): ConversionRuntimeState {
  return {
    cupidLovers: null,
    cupidAffiliation: null,
    ghostBrideGroomSeat: null,
    ghostBrideWitnessSeat: null,
    scentPhantomChain: null,
    scentPhantomTriggered: false,
    scentPhantomJoinedTeam: false,
    twinsDeadRound: null,
    twinsGuardUsed: false,
    whiteSnakeUnlockedAttack: false,
    xuXianLastBoundPair: null,
    xuXianActiveBoundPair: null,
    xuXianTriggered: false,
    xuXianThirdPartyInstantWin: false,
    awakenedGargoyleConvertedSeat: null,
    awakenedLonelyGirlIdolSeat: null,
    awakenedLonelyGirlStatus: 'good',
    awakenedLonelyGirlInheritedRoleId: null,
    wildChildIdolSeat: null,
    wildChildTurnedWolf: false,
    shadowMasterSeat: null,
    shadowInheritedRoleId: null,
    shadowAvengerThirdParty: false,
    avengerAlignedFaction: null,
    avengerInstantWin: false,
    puppetSeat: null,
    zombieInfectedSeats: [],
    chameleonWolfSeat: null,
    chameleonJoinedTeam: false,
    thiefBottomCards: [],
    thiefChosenRoleId: null,
    jackRipperFanaticSeat: null,
    jackRipperKillUnlocked: false,
    jackRipperDetAccusationUsed: false,
    jackRipperThirdPartyDefeated: false,
  };
}

export function cloneConversionState(state: ConversionRuntimeState): ConversionRuntimeState {
  return {
    ...state,
    cupidLovers: state.cupidLovers ? [...state.cupidLovers] : null,
    scentPhantomChain: state.scentPhantomChain ? [...state.scentPhantomChain] : null,
    xuXianLastBoundPair: state.xuXianLastBoundPair ? [...state.xuXianLastBoundPair] : null,
    xuXianActiveBoundPair: state.xuXianActiveBoundPair ? [...state.xuXianActiveBoundPair] : null,
    zombieInfectedSeats: [...state.zombieInfectedSeats],
    thiefBottomCards: [...state.thiefBottomCards],
  };
}

/** 判斷座位是否與任意狼人陣營玩家相鄰（覺醒石像鬼／傀儡狼首夜轉化限制） */
export function isAdjacentToWolf(seats: PlayerSeat[], targetSeatNumber: number): boolean {
  const { leftNeighbor, rightNeighbor } = findAliveNeighbors(seats, targetSeatNumber);
  return Boolean(
    (leftNeighbor && isSeatWolfFaction(leftNeighbor)) ||
      (rightNeighbor && isSeatWolfFaction(rightNeighbor)),
  );
}

// =========================
// 1. 邱比特（cupid）與鬼魂新娘（ghost_bride）
// =========================

export function canCupidLink(
  seats: PlayerSeat[],
  pair: [number | null, number | null] | undefined,
  round: number,
): ActionCheckResult {
  const cupid = seats.find((s) => s.roleId === 'cupid' && s.isAlive);
  if (!cupid) return { allowed: false, reason: '場上沒有存活的邱比特' };
  if (!pair || (pair[0] === null && pair[1] === null)) return { allowed: true };
  if (round !== 1) return { allowed: false, reason: '邱比特僅於第一晚連線情侶' };
  if (pair[0] === null || pair[1] === null || pair[0] === pair[1]) {
    return { allowed: false, reason: '邱比特必須選擇兩名不同的存活玩家成為情侶' };
  }
  for (const num of [pair[0], pair[1]]) {
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `情侶目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

/** 依情侶雙方陣營決定邱比特陣營歸屬（雙好→good、雙狼→wolf、一好一狼→third_party） */
export function evaluateCupidAffiliation(
  seats: PlayerSeat[],
  pair: [number, number],
): 'good' | 'wolf' | 'third_party' {
  const seatA = seats.find((s) => s.seatNumber === pair[0]);
  const seatB = seats.find((s) => s.seatNumber === pair[1]);
  const aWolf = Boolean(seatA && isSeatWolfFaction(seatA));
  const bWolf = Boolean(seatB && isSeatWolfFaction(seatB));
  if (aWolf && bWolf) return 'wolf';
  if (!aWolf && !bWolf) return 'good';
  return 'third_party';
}

export function canGhostBrideChoose(
  seats: PlayerSeat[],
  groomSeat: number | null | undefined,
  witnessSeat: number | null | undefined,
  round: number,
): ActionCheckResult {
  const bride = seats.find((s) => s.roleId === 'ghost_bride' && s.isAlive);
  if (!bride) return { allowed: false, reason: '場上沒有存活的鬼魂新娘' };
  if (groomSeat == null && witnessSeat == null) return { allowed: true };
  if (round !== 1) return { allowed: false, reason: '鬼魂新娘僅於第一晚選擇新郎與證婚人' };
  if (groomSeat != null) {
    if (groomSeat === bride.seatNumber) return { allowed: false, reason: '新郎不可為鬼魂新娘自己' };
    const g = seats.find((s) => s.seatNumber === groomSeat);
    if (!g || !g.isAlive) return { allowed: false, reason: '新郎目標不存在或已出局' };
  }
  if (witnessSeat != null) {
    if (witnessSeat === bride.seatNumber || witnessSeat === groomSeat) {
      return { allowed: false, reason: '證婚人不可與新娘或新郎重複' };
    }
    const w = seats.find((s) => s.seatNumber === witnessSeat);
    if (!w || !w.isAlive) return { allowed: false, reason: '證婚人目標不存在或已出局' };
  }
  return { allowed: true };
}

// =========================
// 2. 尋香魅影（scent_phantom）與雙子（twins）
// =========================

export function canScentPhantomLink(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  pair: [number | null, number | null] | undefined,
): ActionCheckResult {
  const sp = seats.find((s) => s.roleId === 'scent_phantom' && s.isAlive);
  if (!sp) return { allowed: false, reason: '場上沒有存活的尋香魅影' };
  if (!pair || (pair[0] === null && pair[1] === null)) return { allowed: true };
  if (state.scentPhantomTriggered) {
    return { allowed: false, reason: '尋香魅影鏈子已觸發過一次，無法再使用' };
  }
  if (pair[0] === null || pair[1] === null || pair[0] === pair[1]) {
    return { allowed: false, reason: '尋香魅影須選擇兩名不同的存活玩家形成鏈子' };
  }
  for (const num of [pair[0], pair[1]]) {
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `鏈子目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

export function syncScentPhantomTeamStatus(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
): boolean {
  if (state.scentPhantomJoinedTeam) return true;
  const sp = seats.find((s) => s.roleId === 'scent_phantom');
  if (!sp || !sp.isAlive) return false;
  const hasOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'scent_phantom' && isSeatWolfFaction(s),
  );
  return !hasOtherWolf;
}

export function canTwinsGuard(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  if (targetSeat === null) return { allowed: true };
  if (state.twinsDeadRound === null || round !== state.twinsDeadRound + 1) {
    return { allowed: false, reason: '雙子僅能於出局後的下一晚共同守護一名玩家' };
  }
  if (state.twinsGuardUsed) {
    return { allowed: false, reason: '雙子亡語守護僅能使用一次' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '守護目標不存在或已出局' };
  return { allowed: true };
}

// =========================
// 3. 白蛇預言家（white_snake_seer）與許仙尋香魅影（xu_xian_phantom）
// =========================

export function canXuXianBind(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  pair: [number | null, number | null] | undefined,
): ActionCheckResult {
  const xx = seats.find((s) => s.roleId === 'xu_xian_phantom' && s.isAlive);
  if (!xx) return { allowed: false, reason: '場上沒有存活的許仙尋香魅影' };
  if (!pair || (pair[0] === null && pair[1] === null)) return { allowed: true };
  if (state.xuXianTriggered) {
    return { allowed: false, reason: '許仙綁定鏈已觸發過一次，無法再使用' };
  }
  if (pair[0] === null || pair[1] === null || pair[0] === pair[1]) {
    return { allowed: false, reason: '許仙須選擇兩名不同存活玩家綁定' };
  }
  const prev = new Set(state.xuXianLastBoundPair ?? []);
  for (const num of [pair[0], pair[1]]) {
    if (prev.has(num)) {
      return { allowed: false, reason: `許仙不可連續兩晚綁定重複玩家（${num} 號）` };
    }
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `綁定目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

// =========================
// 4. 覺醒石像鬼（awakened_gargoyle）、覺醒孤獨少女（awakened_lonely_girl）、
//    野孩子（wild_child）、影子（shadow）、復仇者（avenger）、傀儡（puppet_wolf）、
//    殭屍（zombie）、百變狼王（chameleon_wolf_king）、盜賊（thief）、開膛手傑克（jack_the_ripper）與狂熱粉（fanatic）
// =========================

export function canAwakenedGargoyleConvert(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const ag = seats.find((s) => s.roleId === 'awakened_gargoyle' && s.isAlive);
  if (!ag) return { allowed: false, reason: '場上沒有存活的覺醒石像鬼' };
  if (targetSeat === null) return { allowed: true };
  if (round !== 1) return { allowed: false, reason: '覺醒石像鬼僅能在第一晚轉化玩家' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '轉化目標不存在或已出局' };
  if (isSeatWolfFaction(target)) return { allowed: false, reason: '覺醒石像鬼僅能轉化好人陣營玩家' };
  if (!isAdjacentToWolf(seats, targetSeat)) {
    return { allowed: false, reason: '覺醒石像鬼轉化目標必須位於狼隊隔壁' };
  }
  return { allowed: true };
}

export function canPuppetChoose(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const puppetWolf = seats.find((s) => s.roleId === 'puppet_wolf' && s.isAlive);
  if (!puppetWolf) return { allowed: false, reason: '場上沒有存活的傀儡板子配置' };
  if (targetSeat === null) return { allowed: true };
  if (round !== 1) return { allowed: false, reason: '傀儡僅於首夜開刀前指定' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '傀儡目標不存在或已出局' };
  if (isSeatWolfFaction(target)) return { allowed: false, reason: '不可選擇狼人作為傀儡' };
  if (!isAdjacentToWolf(seats, targetSeat)) {
    return { allowed: false, reason: '傀儡目標必須與狼人相鄰' };
  }
  return { allowed: true };
}

export function canZombieInfect(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  targets: number[] | undefined,
): ActionCheckResult {
  const zombie = seats.find((s) => s.roleId === 'zombie' && s.isAlive);
  if (!zombie) return { allowed: false, reason: '場上沒有存活的殭屍' };
  if (!targets || targets.length === 0) return { allowed: true };
  const unique = Array.from(new Set(targets));
  if (unique.length > 2) return { allowed: false, reason: '殭屍每晚最多感染兩位玩家' };
  for (const num of unique) {
    if (num === zombie.seatNumber) return { allowed: false, reason: '殭屍不可感染自己' };
    if (state.zombieInfectedSeats.includes(num)) {
      return { allowed: false, reason: `${num} 號已被殭屍感染過` };
    }
    const s = seats.find((seat) => seat.seatNumber === num);
    if (!s || !s.isAlive) return { allowed: false, reason: `感染目標 ${num} 號不存在或已出局` };
  }
  return { allowed: true };
}

export function canThiefChooseCard(
  bottomCards: string[],
  chosenRoleId: string | null | undefined,
): ActionCheckResult {
  if (!chosenRoleId) return { allowed: true };
  if (bottomCards.length !== 2) {
    return { allowed: false, reason: '盜賊須有兩張剩餘底牌可供選擇' };
  }
  const bothWolves = bottomCards.every((r) => getRoleById(r)?.faction === 'wolf');
  if (bothWolves) {
    return { allowed: false, reason: '兩張底牌皆為狼人，依規則此局須重開' };
  }
  if (!bottomCards.includes(chosenRoleId)) {
    return { allowed: false, reason: '所選角色不在兩張底牌中' };
  }
  const hasWolfCard = bottomCards.some((r) => getRoleById(r)?.faction === 'wolf');
  const chosenIsWolf = getRoleById(chosenRoleId)?.faction === 'wolf';
  if (hasWolfCard && !chosenIsWolf) {
    return { allowed: false, reason: '底牌中含狼人時，盜賊必須選擇狼人' };
  }
  return { allowed: true };
}

/** 判斷是否為「開膛手傑克 (第二身分)」板子 */
export function isJackSecondIdentityBoard(seats: PlayerSeat[], boardId?: string): boolean {
  if (boardId === '12p-jack-the-ripper-2') return true;
  if (boardId === '12p-jack-the-ripper') return false;
  return seats.some(
    (s) => s.secondRoleId === 'jack_the_ripper' || s.secondRoleId === 'detective',
  );
}

/** 尋找開膛手傑克座位（相容主身分板與第二身分板） */
export function findJackRipperSeat(seats: PlayerSeat[]): PlayerSeat | undefined {
  return seats.find(
    (s) => s.roleId === 'jack_the_ripper' || s.secondRoleId === 'jack_the_ripper',
  );
}

export function canJackRipperSelectFanatic(
  seats: PlayerSeat[],
  targetSeat: number | null,
  round: number,
  boardId?: string,
): ActionCheckResult {
  if (!isJackSecondIdentityBoard(seats, boardId)) {
    return { allowed: false, reason: '主身分版開膛手傑克無狂熱粉機制，每晚直接擊殺' };
  }
  const jack = findJackRipperSeat(seats);
  if (!jack || !jack.isAlive) return { allowed: false, reason: '場上沒有存活的開膛手傑克' };
  if (targetSeat === null) return { allowed: true };
  if (round !== 1) return { allowed: false, reason: '開膛手傑克僅於第一晚指定狂熱粉' };
  if (targetSeat === jack.seatNumber) return { allowed: false, reason: '不可選擇自己為狂熱粉' };
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) return { allowed: false, reason: '狂熱粉目標不存在或已出局' };
  return { allowed: true };
}

/**
 * 檢核開膛手傑克夜間擊殺：
 * - 板子 A（主身分版 12p-jack-the-ripper）：每晚（含第一晚）必須擊殺自己以外 1 位存活玩家（傑克須存活）
 * - 板子 B（第二身分版 12p-jack-the-ripper-2）：須狂熱粉或開膛手傑克任一方死亡解鎖後，無論傑克出局與否皆可擊殺自己以外 1 位存活玩家
 */
export function canJackRipperKill(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  targetSeat: number | null,
  round: number,
  boardId?: string,
): ActionCheckResult {
  const isSecondId = isJackSecondIdentityBoard(seats, boardId);
  const jack = findJackRipperSeat(seats);
  if (!jack) return { allowed: false, reason: '場上沒有開膛手傑克' };
  if (state.jackRipperThirdPartyDefeated) {
    return { allowed: false, reason: '偵探已指證開膛手傑克成功，第三方陣營已失敗' };
  }

  if (isSecondId) {
    if (!state.jackRipperKillUnlocked) {
      return {
        allowed: false,
        reason: '須待開膛手傑克或狂熱粉任一方死亡後，後續夜晚方可發動擊殺',
      };
    }
    if (round < 2 && !state.jackRipperKillUnlocked) {
      return { allowed: false, reason: '第一晚僅能指定狂熱粉，尚未解鎖擊殺' };
    }
  } else {
    if (!jack.isAlive) {
      return { allowed: false, reason: '開膛手傑克已出局，無法擊殺' };
    }
  }

  if (targetSeat === null) {
    return isSecondId
      ? { allowed: true }
      : { allowed: false, reason: '開膛手傑克每晚必須選擇一位目標擊殺，不可空刀' };
  }
  if (targetSeat === jack.seatNumber) {
    return { allowed: false, reason: '開膛手傑克不可擊殺自己' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '擊殺目標不存在或已出局' };
  }
  return { allowed: true };
}

/**
 * 第二身分板「已出局偵探集結指證開膛手傑克」：
 * - 所有已出局的偵探（不含被轉為狂熱粉者）須達 2 人以上，且至少半數同意集結才能指證（整場僅限 1 次）
 * - 指證成功 → 第三方陣營失敗（jackRipperThirdPartyDefeated = true）
 */
export function resolveDetectiveCollectiveAccusation(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  accusedSeat: number,
  agreeCount: number,
): {
  allowed: boolean;
  reason?: string;
  success: boolean;
  deadDetectiveCount: number;
  requiredAgreeCount: number;
  state: ConversionRuntimeState;
} {
  if (state.jackRipperDetAccusationUsed) {
    return {
      allowed: false,
      reason: '已出局偵探整場僅擁有一次集結指證開膛手傑克的機會',
      success: false,
      deadDetectiveCount: 0,
      requiredAgreeCount: 0,
      state,
    };
  }
  const deadDetectives = seats.filter(
    (s) =>
      !s.isAlive &&
      s.secondRoleId === 'detective' &&
      s.seatNumber !== state.jackRipperFanaticSeat,
  );
  const deadDetectiveCount = deadDetectives.length;
  const requiredAgreeCount = Math.ceil(deadDetectiveCount / 2);
  if (deadDetectiveCount < 2) {
    return {
      allowed: false,
      reason: `已出局偵探目前僅 ${deadDetectiveCount} 人，須滿足 2 人以上方可集結指證`,
      success: false,
      deadDetectiveCount,
      requiredAgreeCount: 2,
      state,
    };
  }
  if (agreeCount < requiredAgreeCount) {
    return {
      allowed: false,
      reason: `目前同意人數（${agreeCount} 人）未達半數門檻（至少 ${requiredAgreeCount} 人）`,
      success: false,
      deadDetectiveCount,
      requiredAgreeCount,
      state,
    };
  }
  const accused = seats.find((s) => s.seatNumber === accusedSeat);
  if (!accused) {
    return {
      allowed: false,
      reason: '指證目標座位不存在',
      success: false,
      deadDetectiveCount,
      requiredAgreeCount,
      state,
    };
  }

  const nextState = cloneConversionState(state);
  nextState.jackRipperDetAccusationUsed = true;
  const success =
    accused.secondRoleId === 'jack_the_ripper' || accused.roleId === 'jack_the_ripper';
  if (success) {
    nextState.jackRipperThirdPartyDefeated = true;
  }
  return {
    allowed: true,
    success,
    deadDetectiveCount,
    requiredAgreeCount,
    state: nextState,
  };
}

/** 同步認主／轉化類角色於有玩家死亡後的狀態轉移（野孩子、覺醒孤獨少女、影子、傑克狂熱粉） */
export function syncConversionOnDeaths(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  round: number,
): {
  seats: PlayerSeat[];
  state: ConversionRuntimeState;
  linkedDeaths: Array<{ seat: number; reason: DeathReason }>;
} {
  let updatedSeats = seats.map((s) => ({ ...s }));
  const nextState = cloneConversionState(state);
  const linkedDeaths: Array<{ seat: number; reason: DeathReason }> = [];

  const killLinked = (seatNum: number, reason: DeathReason) => {
    const existing = updatedSeats.find((s) => s.seatNumber === seatNum);
    if (!existing || !existing.isAlive) return;
    updatedSeats = updatedSeats.map((s) =>
      s.seatNumber === seatNum
        ? { ...s, isAlive: false, deathReason: reason, deathRound: round }
        : s,
    );
    linkedDeaths.push({ seat: seatNum, reason });
  };

  // 1. 邱比特情侶殉情
  if (nextState.cupidLovers) {
    const [a, b] = nextState.cupidLovers;
    const seatA = updatedSeats.find((s) => s.seatNumber === a);
    const seatB = updatedSeats.find((s) => s.seatNumber === b);
    if (seatA && !seatA.isAlive && seatB?.isAlive) killLinked(b, 'cupid_lover_link');
    if (seatB && !seatB.isAlive && seatA?.isAlive) killLinked(a, 'cupid_lover_link');
  }

  // 2. 鬼魂新娘與新郎殉情
  if (nextState.ghostBrideGroomSeat !== null) {
    const bride = updatedSeats.find((s) => s.roleId === 'ghost_bride');
    const groom = updatedSeats.find((s) => s.seatNumber === nextState.ghostBrideGroomSeat);
    if (bride && !bride.isAlive && groom?.isAlive) killLinked(groom.seatNumber, 'ghost_bride_link');
    if (groom && !groom.isAlive && bride?.isAlive) killLinked(bride.seatNumber, 'ghost_bride_link');
  }

  // 3. 尋香魅影鏈子殉情（限觸發 1 次）
  if (nextState.scentPhantomChain && !nextState.scentPhantomTriggered) {
    const [a, b] = nextState.scentPhantomChain;
    const seatA = updatedSeats.find((s) => s.seatNumber === a);
    const seatB = updatedSeats.find((s) => s.seatNumber === b);
    if (seatA && !seatA.isAlive && seatB?.isAlive) {
      nextState.scentPhantomTriggered = true;
      killLinked(b, 'scent_phantom_link');
    } else if (seatB && !seatB.isAlive && seatA?.isAlive) {
      nextState.scentPhantomTriggered = true;
      killLinked(a, 'scent_phantom_link');
    }
  }

  // 4. 許仙尋香魅影綁定殉情（若綁定自己與白蛇且雙死 → 第三方直接勝）
  if (nextState.xuXianActiveBoundPair && !nextState.xuXianTriggered) {
    const [a, b] = nextState.xuXianActiveBoundPair;
    const seatA = updatedSeats.find((s) => s.seatNumber === a);
    const seatB = updatedSeats.find((s) => s.seatNumber === b);
    let triggered = false;
    if (seatA && !seatA.isAlive && seatB?.isAlive) {
      nextState.xuXianTriggered = true;
      killLinked(b, 'xu_xian_link');
      triggered = true;
    } else if (seatB && !seatB.isAlive && seatA?.isAlive) {
      nextState.xuXianTriggered = true;
      killLinked(a, 'xu_xian_link');
      triggered = true;
    }
    if (triggered) {
      const rolesInPair = new Set([seatA?.roleId, seatB?.roleId]);
      if (rolesInPair.has('xu_xian_phantom') && rolesInPair.has('white_snake_seer')) {
        nextState.xuXianThirdPartyInstantWin = true;
      }
    }
  }

  // 5. 雙子同生共死
  const twinSeats = updatedSeats.filter((s) => s.roleId === 'twins');
  if (twinSeats.length === 2) {
    const [t1, t2] = twinSeats;
    if (!t1.isAlive && t2.isAlive) {
      killLinked(t2.seatNumber, 'twins_link');
      nextState.twinsDeadRound = round;
    } else if (!t2.isAlive && t1.isAlive) {
      killLinked(t1.seatNumber, 'twins_link');
      nextState.twinsDeadRound = round;
    }
  }

  // 6. 白蛇預言家：許仙出局後解鎖靈襲
  const xuXian = updatedSeats.find((s) => s.roleId === 'xu_xian_phantom');
  if (xuXian && !xuXian.isAlive) {
    nextState.whiteSnakeUnlockedAttack = true;
  }

  // 7. 野孩子：榜樣死亡後立即變身狼人
  if (nextState.wildChildIdolSeat !== null && !nextState.wildChildTurnedWolf) {
    const idol = updatedSeats.find((s) => s.seatNumber === nextState.wildChildIdolSeat);
    if (idol && !idol.isAlive) {
      nextState.wildChildTurnedWolf = true;
    }
  }

  // 8. 覺醒孤獨少女：偶像白天被放逐 → 變狼；偶像夜間／非放逐出局 → 繼承偶像身分
  if (nextState.awakenedLonelyGirlIdolSeat !== null && nextState.awakenedLonelyGirlStatus === 'good') {
    const idol = updatedSeats.find((s) => s.seatNumber === nextState.awakenedLonelyGirlIdolSeat);
    if (idol && !idol.isAlive) {
      if (idol.deathReason === 'exiled') {
        nextState.awakenedLonelyGirlStatus = 'wolf';
      } else {
        nextState.awakenedLonelyGirlStatus = 'inherited';
        nextState.awakenedLonelyGirlInheritedRoleId = idol.roleId;
      }
    }
  }

  // 9. 影子：主人出局後繼承主人身分
  if (nextState.shadowMasterSeat !== null && !nextState.shadowInheritedRoleId) {
    const master = updatedSeats.find((s) => s.seatNumber === nextState.shadowMasterSeat);
    if (master && !master.isAlive && !nextState.shadowAvengerThirdParty) {
      nextState.shadowInheritedRoleId = master.roleId;
    }
  }

  // 10. 開膛手傑克／狂熱粉任一方死亡解鎖擊殺（第二身分版）
  const jack = findJackRipperSeat(updatedSeats);
  const fanatic =
    nextState.jackRipperFanaticSeat !== null
      ? updatedSeats.find((s) => s.seatNumber === nextState.jackRipperFanaticSeat)
      : updatedSeats.find((s) => s.secondRoleId === 'fanatic' || s.roleId === 'fanatic');
  if ((jack && !jack.isAlive) || (fanatic && !fanatic.isAlive)) {
    nextState.jackRipperKillUnlocked = true;
  }

  // 11. 尋香魅影與百變狼王入隊同步
  nextState.scentPhantomJoinedTeam = syncScentPhantomTeamStatus(updatedSeats, nextState);
  const cham = updatedSeats.find((s) => s.roleId === 'chameleon_wolf_king');
  if (cham?.isAlive && !nextState.chameleonJoinedTeam) {
    const hasOtherWolf = updatedSeats.some(
      (s) => s.isAlive && s.roleId !== 'chameleon_wolf_king' && isSeatWolfFaction(s),
    );
    if (!hasOtherWolf) nextState.chameleonJoinedTeam = true;
  }

  return { seats: updatedSeats, state: nextState, linkedDeaths };
}

/** 復仇者死亡刺殺結算（選中未變身影子直接獨自勝利；對立陣營倒牌、同陣營不倒牌） */
export function resolveAvengerAssassinate(
  seats: PlayerSeat[],
  state: ConversionRuntimeState,
  targetSeat: number,
  round: number,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  state: ConversionRuntimeState;
  killedSeat: number | null;
  instantVictory: VictoryResult;
} {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return {
      allowed: false,
      reason: '刺殺目標不存在或已出局',
      seats,
      state,
      killedSeat: null,
      instantVictory: { winner: null, winReason: null },
    };
  }
  const nextState = cloneConversionState(state);
  if (target.roleId === 'shadow' && !nextState.shadowInheritedRoleId) {
    nextState.avengerInstantWin = true;
    return {
      allowed: true,
      seats: seats.map((s) => ({ ...s })),
      state: nextState,
      killedSeat: null,
      instantVictory: {
        winner: 'third_party',
        winReason: '復仇者刺中未變身的影子，復仇者單獨獲勝！',
      },
    };
  }

  const targetIsWolf = isSeatWolfFaction(target);
  const isOpposite =
    (nextState.avengerAlignedFaction === 'good' && targetIsWolf) ||
    (nextState.avengerAlignedFaction === 'wolf' && !targetIsWolf);

  if (!isOpposite) {
    return {
      allowed: true,
      seats: seats.map((s) => ({ ...s })),
      state: nextState,
      killedSeat: null,
      instantVictory: { winner: null, winReason: null },
    };
  }

  const updatedSeats = seats.map((s) =>
    s.seatNumber === targetSeat
      ? { ...s, isAlive: false, deathReason: 'avenger_assassinate' as const, deathRound: round }
      : s,
  );
  return {
    allowed: true,
    seats: updatedSeats,
    state: nextState,
    killedSeat: targetSeat,
    instantVictory: { winner: null, winReason: null },
  };
}

/** 檢查第 4 批第三方陣營專屬勝利條件（殭屍全場感染、許仙白蛇雙死、復仇者獨勝、人狼戀／鬼魂新娘／白蛇許仙屠城） */
export function checkConversionThirdPartyVictory(
  seats: PlayerSeat[],
  state?: ConversionRuntimeState,
): VictoryResult {
  // 開膛手傑克單一性別獨立勝利（主身分版與第二身分版共用，若偵探已指證成功則第三方失敗不可獲勝）
  const hasJackRipper = seats.some(
    (s) => s.roleId === 'jack_the_ripper' || s.secondRoleId === 'jack_the_ripper',
  );
  if (hasJackRipper && !state?.jackRipperThirdPartyDefeated) {
    const alive = seats.filter((s) => s.isAlive);
    if (alive.length > 0 && alive.every((s) => s.gender === 'male' || s.gender === 'female')) {
      const genders = new Set(alive.map((s) => s.gender));
      if (genders.size === 1) {
        const onlyGender = alive[0].gender === 'male' ? '男性' : '女性';
        return {
          winner: 'third_party',
          winReason: `場上存活玩家僅剩單一性別（全${onlyGender}），開膛手傑克（第三方）單獨獲勝！`,
        };
      }
    }
  }

  if (!state) return { winner: null, winReason: null };

  if (state.xuXianThirdPartyInstantWin) {
    return {
      winner: 'third_party',
      winReason: '許仙尋香魅影與白蛇預言家透過綁定雙雙出局，第三方陣營直接獲勝！',
    };
  }

  if (state.avengerInstantWin) {
    return {
      winner: 'third_party',
      winReason: '復仇者刺中未變身的影子，復仇者單獨獲勝！',
    };
  }

  // 殭屍單獨獲勝：殭屍存活且場上所有其他存活玩家皆已被感染
  const aliveZombie = seats.find((s) => s.roleId === 'zombie' && s.isAlive);
  if (aliveZombie) {
    const otherAlive = seats.filter((s) => s.isAlive && s.seatNumber !== aliveZombie.seatNumber);
    if (
      otherAlive.length > 0 &&
      otherAlive.every((s) => state.zombieInfectedSeats.includes(s.seatNumber) || s.infectedByZombie)
    ) {
      return {
        winner: 'third_party',
        winReason: '殭屍已感染場上所有存活玩家，第三方陣營（殭屍）單獨獲勝！',
      };
    }
  }

  // 人狼戀（邱比特第三方）／鬼魂新娘三人組／白蛇＋許仙：場上存活者皆為第三方成員時屠城勝
  const aliveSeats = seats.filter((s) => s.isAlive);
  if (aliveSeats.length > 0) {
    if (state.cupidAffiliation === 'third_party' && state.cupidLovers) {
      const cupidSeat = seats.find((s) => s.roleId === 'cupid')?.seatNumber;
      const tpSet = new Set([state.cupidLovers[0], state.cupidLovers[1], ...(cupidSeat ? [cupidSeat] : [])]);
      if (aliveSeats.every((s) => tpSet.has(s.seatNumber))) {
        return {
          winner: 'third_party',
          winReason: '人狼戀第三方陣營屠城獲勝！',
        };
      }
    }
    if (state.ghostBrideGroomSeat !== null) {
      const brideSeat = seats.find((s) => s.roleId === 'ghost_bride')?.seatNumber;
      const tpSet = new Set([
        state.ghostBrideGroomSeat,
        ...(brideSeat ? [brideSeat] : []),
        ...(state.ghostBrideWitnessSeat !== null ? [state.ghostBrideWitnessSeat] : []),
      ]);
      if (aliveSeats.every((s) => tpSet.has(s.seatNumber))) {
        return {
          winner: 'third_party',
          winReason: '鬼魂新娘第三方陣營屠城獲勝！',
        };
      }
    }
    const hasWhiteSnakeOrXuXian = seats.some(
      (s) => s.roleId === 'white_snake_seer' || s.roleId === 'xu_xian_phantom',
    );
    if (
      hasWhiteSnakeOrXuXian &&
      aliveSeats.every((s) => s.roleId === 'white_snake_seer' || s.roleId === 'xu_xian_phantom')
    ) {
      return {
        winner: 'third_party',
        winReason: '白蛇預言家與許仙尋香魅影第三方陣營屠城獲勝！',
      };
    }
  }

  return { winner: null, winReason: null };
}
