import { getRoleById } from '../data/roles';
import { findAliveNeighbors } from './inspectionRoles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  DeathReason,
  InterferenceRuntimeState,
  PlayerSeat,
  RuleOverrides,
} from './types';

export function createInitialInterferenceState(): InterferenceRuntimeState {
  return {
    magicianSwappedSeats: [],
    wolfWarlockSwappedSeats: [],
    tricksterSwappedSeats: [],
    activeTricksterVoteSwap: null,
    lastTroublemakerTarget: null,
    troublemakerJoinedWolfTeam: false,
    lastTimeEclipseTarget: null,
    timeEclipseUsed: false,
    lastPenguinTarget: null,
    foxCubUsed: false,
    activeMutedSeat: null,
    lastMedusaTarget: null,
    activePetrifiedSeat: null,
    silentNightMentorAmplifyUsed: false,
    silentNightMentorWeakenUsed: false,
    silentNightMentorJoinedWolfTeam: false,
    daylightScholarAmplifyUsed: false,
    daylightScholarWeakenUsed: false,
    fortuneTellerUsed: false,
    lastRadiantEarlTarget: null,
    lastSocialiteTarget: null,
    lastEnchanterTarget: null,
    lastBlackBatTarget: null,
    blackBatReflectUsed: false,
    lastDarkNightEnvoyTarget: null,
    alchemyFogUsed: false,
    alchemySnakeUsed: false,
    alchemySnakePendingVictimSeat: null,
    awakenedWitchAntidoteUsed: false,
    awakenedWitchPoisonsUsed: 0,
    awakenedWitchUsedHelpers: [],
  };
}

export function cloneInterferenceState(state: InterferenceRuntimeState): InterferenceRuntimeState {
  return {
    ...state,
    magicianSwappedSeats: [...state.magicianSwappedSeats],
    wolfWarlockSwappedSeats: [...state.wolfWarlockSwappedSeats],
    tricksterSwappedSeats: [...(state.tricksterSwappedSeats ?? [])],
    activeTricksterVoteSwap: state.activeTricksterVoteSwap
      ? [...state.activeTricksterVoteSwap]
      : null,
    awakenedWitchUsedHelpers: [...state.awakenedWitchUsedHelpers],
  };
}

// =========================
// 1. 魔術師（magician）、狼術師（wolf_warlock）、詭術師（trickster_wolf）
// =========================

export function isSameSwapPair(
  pairA: [number, number] | null,
  pairB: [number, number] | null,
): boolean {
  if (!pairA || !pairB) return false;
  return (
    (pairA[0] === pairB[0] && pairA[1] === pairB[1]) ||
    (pairA[0] === pairB[1] && pairA[1] === pairB[0])
  );
}

/** 依單組交換對（a, b）將目標座號對調 */
export function applySingleSwap(
  seatNumber: number | null,
  pair: [number, number] | null,
): number | null {
  if (seatNumber === null || !pair) return seatNumber;
  if (seatNumber === pair[0]) return pair[1];
  if (seatNumber === pair[1]) return pair[0];
  return seatNumber;
}

/** 依序套用多組交換對（魔術師 → 狼術師） */
export function applyTargetSwaps(
  seatNumber: number | null,
  pairs: Array<[number, number] | null>,
): number | null {
  let current = seatNumber;
  for (const pair of pairs) {
    current = applySingleSwap(current, pair);
  }
  return current;
}

export function canMagicianSwap(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  pair: [number | null, number | null] | undefined,
): ActionCheckResult {
  const magician = seats.find(
    (s) => s.roleId === 'magician' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!magician) {
    return { allowed: false, reason: '場上沒有存活的魔術師' };
  }
  if (!pair || (pair[0] === null && pair[1] === null)) {
    return { allowed: true };
  }
  if (pair[0] === null || pair[1] === null) {
    return { allowed: false, reason: '魔術師必須選擇兩位不同玩家交換，或選擇空換' };
  }
  if (pair[0] === pair[1]) {
    return { allowed: false, reason: '不可選擇同一位玩家進行交換' };
  }
  const usedSet = new Set(state.magicianSwappedSeats);
  for (const num of [pair[0], pair[1]]) {
    if (usedSet.has(num)) {
      return { allowed: false, reason: `${num} 號整局已被魔術師交換過，不可重複交換` };
    }
    const seat = seats.find((s) => s.seatNumber === num);
    if (!seat || !seat.isAlive) {
      return { allowed: false, reason: `交換目標 ${num} 號不存在或已出局` };
    }
  }
  return { allowed: true };
}

export function canWolfWarlockSwap(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  pair: [number | null, number | null] | undefined,
): ActionCheckResult {
  const warlock = seats.find((s) => s.roleId === 'wolf_warlock' && s.isAlive);
  if (!warlock) {
    return { allowed: false, reason: '場上沒有存活的狼術師' };
  }
  if (!pair || (pair[0] === null && pair[1] === null)) {
    return { allowed: true };
  }
  if (pair[0] === null || pair[1] === null) {
    return { allowed: false, reason: '狼術師必須選擇兩位不同玩家交換，或選擇空換' };
  }
  if (pair[0] === pair[1]) {
    return { allowed: false, reason: '不可選擇同一位玩家進行交換' };
  }
  const usedSet = new Set(state.wolfWarlockSwappedSeats);
  for (const num of [pair[0], pair[1]]) {
    if (usedSet.has(num)) {
      return { allowed: false, reason: `${num} 號整局已被狼術師交換過，不可重複交換` };
    }
    const seat = seats.find((s) => s.seatNumber === num);
    if (!seat || !seat.isAlive) {
      return { allowed: false, reason: `交換目標 ${num} 號不存在或已出局` };
    }
  }
  return { allowed: true };
}

export function canTricksterWolfSwap(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  pair: [number | null, number | null] | undefined,
): ActionCheckResult {
  const trickster = seats.find((s) => s.roleId === 'trickster_wolf' && s.isAlive);
  if (!trickster) {
    return { allowed: false, reason: '場上沒有存活的詭術師' };
  }
  if (!pair || (pair[0] === null && pair[1] === null)) {
    return { allowed: true };
  }
  if (pair[0] === null || pair[1] === null) {
    return { allowed: false, reason: '詭術師必須選擇兩位不同玩家交換，或選擇空換' };
  }
  if (pair[0] === pair[1]) {
    return { allowed: false, reason: '不可選擇同一位玩家進行交換' };
  }
  const usedSet = new Set(state.tricksterSwappedSeats ?? []);
  for (const num of [pair[0], pair[1]]) {
    if (usedSet.has(num)) {
      return { allowed: false, reason: `${num} 號整局已被詭術師交換過，不可重複交換` };
    }
    const seat = seats.find((s) => s.seatNumber === num);
    if (!seat || !seat.isAlive) {
      return { allowed: false, reason: `交換目標 ${num} 號不存在或已出局` };
    }
  }
  return { allowed: true };
}

// =========================
// 2. 搗蛋鬼（troublemaker_wolf）與蝕時狼妃（time_eclipse_consort）
// =========================

export function canTroublemakerPrank(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const tm = seats.find((s) => s.roleId === 'troublemaker_wolf' && s.isAlive);
  if (!tm) {
    return { allowed: false, reason: '場上沒有存活的搗蛋鬼' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (targetSeat === tm.seatNumber) {
    return { allowed: false, reason: '搗蛋鬼不可對自己使用耍寶技能' };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '搗蛋鬼不可連續兩晚對同一位玩家耍寶' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '耍寶目標不存在或已出局' };
  }
  return { allowed: true };
}

export function syncTroublemakerTeamStatus(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
): boolean {
  if (state.troublemakerJoinedWolfTeam) return true;
  const tm = seats.find((s) => s.roleId === 'troublemaker_wolf');
  if (!tm || !tm.isAlive) return false;
  const hasAliveOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'troublemaker_wolf' && isSeatWolfFaction(s),
  );
  return !hasAliveOtherWolf;
}

export function canTimeEclipseLock(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const consort = seats.find((s) => s.roleId === 'time_eclipse_consort' && s.isAlive);
  if (!consort) {
    return { allowed: false, reason: '場上沒有存活的蝕時狼妃' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (state.timeEclipseUsed) {
    return { allowed: false, reason: '蝕時狼妃的封鎖技能已生效過一次並失效' };
  }
  if (state.lastTimeEclipseTarget !== null && state.lastTimeEclipseTarget === targetSeat) {
    return { allowed: false, reason: '蝕時狼妃不可連續兩晚封鎖同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '封鎖目標不存在或已出局' };
  }
  return { allowed: true };
}

// =========================
// 3. 企鵝（penguin）、子狐（fox_cub）、禁言長老（mute_elder）、梅杜莎（medusa）
// =========================

export function canPenguinFreeze(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const penguin = seats.find((s) => s.roleId === 'penguin' && s.isAlive && !s.statuses.infectedBySeedWolf);
  if (!penguin) {
    return { allowed: false, reason: '場上沒有存活的企鵝' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '企鵝不可連續兩晚冰凍同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '冰凍目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canFoxCubCharm(
  seats: PlayerSeat[],
  foxCubUsed: boolean,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const foxCub = seats.find((s) => s.roleId === 'fox_cub' && s.isAlive && !s.statuses.infectedBySeedWolf);
  if (!foxCub) {
    return { allowed: false, reason: '場上沒有存活的子狐' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (round < 2) {
    return { allowed: false, reason: '子狐自第二晚起才可發動魅惑技能' };
  }
  if (foxCubUsed) {
    return { allowed: false, reason: '子狐的魅惑技能整局僅能使用一次' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '魅惑目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canMuteElderMute(
  seats: PlayerSeat[],
  targetSeat: number | null,
): ActionCheckResult {
  const elder = seats.find((s) => s.roleId === 'mute_elder' && s.isAlive && !s.statuses.infectedBySeedWolf);
  if (!elder) {
    return { allowed: false, reason: '場上沒有存活的禁言長老' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '禁言目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canMedusaPetrify(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const medusa = seats.find((s) => s.roleId === 'medusa' && s.isAlive);
  if (!medusa) {
    return { allowed: false, reason: '場上沒有存活的梅杜莎' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (targetSeat === medusa.seatNumber) {
    return { allowed: false, reason: '梅杜莎不可石化自己' };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '梅杜莎不可連續兩晚石化同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '石化目標不存在或已出局' };
  }
  return { allowed: true };
}

// =========================
// 4. 寂夜導師（silent_night_mentor）與白晝學者（daylight_scholar）
// =========================

export function canSilentNightMentorAct(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  mode: 'amplify' | 'weaken' | null | undefined,
  targetSeat: number | null | undefined,
  round: number,
): ActionCheckResult {
  const mentor = seats.find((s) => s.roleId === 'silent_night_mentor' && s.isAlive);
  if (!mentor) {
    return { allowed: false, reason: '場上沒有存活的寂夜導師' };
  }
  if (!mode || targetSeat === null || targetSeat === undefined) {
    return { allowed: true };
  }
  if (round < 2) {
    return { allowed: false, reason: '寂夜導師自第二晚起才可使用增幅或削弱' };
  }
  if (mode === 'amplify' && state.silentNightMentorAmplifyUsed) {
    return { allowed: false, reason: '寂夜導師的增幅技能已使用完畢' };
  }
  if (mode === 'weaken' && state.silentNightMentorWeakenUsed) {
    return { allowed: false, reason: '寂夜導師的削弱技能已使用完畢' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '技能目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canDaylightScholarAct(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  mode: 'amplify' | 'weaken' | null | undefined,
  targetSeat: number | null | undefined,
  round: number,
): ActionCheckResult {
  const scholar = seats.find(
    (s) => s.roleId === 'daylight_scholar' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!scholar) {
    return { allowed: false, reason: '場上沒有存活的白晝學者' };
  }
  if (!mode || targetSeat === null || targetSeat === undefined) {
    return { allowed: true };
  }
  if (round < 2) {
    return { allowed: false, reason: '白晝學者自第二晚起才可使用增幅或削弱' };
  }
  if (mode === 'amplify' && state.daylightScholarAmplifyUsed) {
    return { allowed: false, reason: '白晝學者的增幅技能已使用完畢' };
  }
  if (mode === 'weaken' && state.daylightScholarWeakenUsed) {
    return { allowed: false, reason: '白晝學者的削弱技能已使用完畢' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '技能目標不存在或已出局' };
  }
  return { allowed: true };
}

export function syncSilentNightMentorTeamStatus(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
): boolean {
  if (state.silentNightMentorJoinedWolfTeam) return true;
  const mentor = seats.find((s) => s.roleId === 'silent_night_mentor');
  if (!mentor || !mentor.isAlive) return false;
  const hasAliveOtherWolf = seats.some(
    (s) => s.isAlive && s.roleId !== 'silent_night_mentor' && isSeatWolfFaction(s),
  );
  return !hasAliveOtherWolf;
}

/**
 * 結算寂夜導師與白晝學者的衝突與互免規則：
 * 1. 寂夜導師與白晝學者彼此免疫增幅與削弱
 * 2. 同晚對同一人施放技能 → 該目標技能維持不變，但隔天死亡
 * 3. 同晚皆對小狼施放技能（不需同一位）→ 狼人技能維持不變，但隔天寂夜導師死亡
 */
export function resolveMentorScholarInteraction(
  seats: PlayerSeat[],
  mentorAction: { mode: 'amplify' | 'weaken'; targetSeat: number } | null,
  scholarAction: { mode: 'amplify' | 'weaken'; targetSeat: number } | null,
): {
  effectiveMentor: { mode: 'amplify' | 'weaken'; targetSeat: number } | null;
  effectiveScholar: { mode: 'amplify' | 'weaken'; targetSeat: number } | null;
  clashDeathSeat: number | null;
} {
  const filterImmune = (action: { mode: 'amplify' | 'weaken'; targetSeat: number } | null) => {
    if (!action) return null;
    const seat = seats.find((s) => s.seatNumber === action.targetSeat);
    if (seat?.roleId === 'silent_night_mentor' || seat?.roleId === 'daylight_scholar') {
      return null;
    }
    return action;
  };

  const m = filterImmune(mentorAction);
  const sc = filterImmune(scholarAction);

  if (m && sc) {
    if (m.targetSeat === sc.targetSeat) {
      return {
        effectiveMentor: null,
        effectiveScholar: null,
        clashDeathSeat: m.targetSeat,
      };
    }
    const mSeat = seats.find((s) => s.seatNumber === m.targetSeat);
    const scSeat = seats.find((s) => s.seatNumber === sc.targetSeat);
    if (mSeat?.roleId === 'wolf' && scSeat?.roleId === 'wolf') {
      const mentorSeat = seats.find((s) => s.roleId === 'silent_night_mentor' && s.isAlive);
      return {
        effectiveMentor: null,
        effectiveScholar: null,
        clashDeathSeat: mentorSeat?.seatNumber ?? null,
      };
    }
  }

  return {
    effectiveMentor: m,
    effectiveScholar: sc,
    clashDeathSeat: null,
  };
}

// =========================
// 5. 占卜師（fortune_teller）與煉金魔女（alchemy_witch）
// =========================

export function canFortuneTellerMark(
  seats: PlayerSeat[],
  fortuneTellerUsed: boolean,
  targetSeat: number | null,
): ActionCheckResult {
  const ft = seats.find(
    (s) => s.roleId === 'fortune_teller' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!ft) {
    return { allowed: false, reason: '場上沒有存活的占卜師' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (fortuneTellerUsed) {
    return { allowed: false, reason: '占卜師的標記技能整局僅能發動一次' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '標記目標不存在或已出局' };
  }
  return { allowed: true };
}

/** 取得占卜師標記後，當晚狼隊僅能擊殺的 3 個座號（標記號碼與其左右兩側） */
export function getFortuneTellerAllowedKillSeats(
  seats: PlayerSeat[],
  markedSeat: number,
): number[] {
  const { leftNeighbor, rightNeighbor } = findAliveNeighbors(seats, markedSeat);
  return Array.from(
    new Set(
      [leftNeighbor?.seatNumber, markedSeat, rightNeighbor?.seatNumber].filter(
        (n): n is number => typeof n === 'number',
      ),
    ),
  );
}

export function canAlchemyWitchUseFog(
  seats: PlayerSeat[],
  alchemyFogUsed: boolean,
  targets: number[] | undefined,
): ActionCheckResult {
  const aw = seats.find((s) => s.roleId === 'alchemy_witch' && s.isAlive && !s.statuses.infectedBySeedWolf);
  if (!aw) {
    return { allowed: false, reason: '場上沒有存活的煉金魔女' };
  }
  if (!targets || targets.length === 0) {
    return { allowed: true };
  }
  if (alchemyFogUsed) {
    return { allowed: false, reason: '未明之霧整局僅能使用一次' };
  }
  const unique = Array.from(new Set(targets));
  if (unique.length !== 3) {
    return { allowed: false, reason: '未明之霧必須指定三位不同的存活玩家' };
  }
  for (const num of unique) {
    const seat = seats.find((s) => s.seatNumber === num);
    if (!seat || !seat.isAlive) {
      return { allowed: false, reason: `目標 ${num} 號不存在或已出局` };
    }
  }
  return { allowed: true };
}

// =========================
// 6. 流光伯爵（radiant_earl）、名媛（socialite）、蠱惑師（enchanter）、
//    黑蝙蝠（black_bat）、黑夜使者（dark_night_envoy）
// =========================

export function canRadiantEarlShield(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
  round: number,
): ActionCheckResult {
  const earl = seats.find(
    (s) => s.roleId === 'radiant_earl' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!earl) {
    return { allowed: false, reason: '場上沒有存活的流光伯爵' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (round < 2) {
    return { allowed: false, reason: '流光伯爵自第二晚起才可使用流光庇護' };
  }
  if (targetSeat === earl.seatNumber) {
    return { allowed: false, reason: '流光伯爵不可庇護自己' };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '流光伯爵不可連續兩晚庇護同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '庇護目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canSocialiteFavor(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const socialite = seats.find(
    (s) => s.roleId === 'socialite' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!socialite) {
    return { allowed: false, reason: '場上沒有存活的名媛' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '名媛不可連續兩晚寵幸同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '寵幸目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canEnchanterBewitch(
  seats: PlayerSeat[],
  targetSeat: number | null,
): ActionCheckResult {
  const enchanter = seats.find(
    (s) => s.roleId === 'enchanter' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!enchanter) {
    return { allowed: false, reason: '場上沒有存活的蠱惑師' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (targetSeat === enchanter.seatNumber) {
    return { allowed: false, reason: '蠱惑師不可蠱惑自己' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '蠱惑目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canBlackBatShield(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  targetSeat: number | null,
): ActionCheckResult {
  const bat = seats.find((s) => s.roleId === 'black_bat' && s.isAlive);
  if (!bat) {
    return { allowed: false, reason: '場上沒有存活的黑蝙蝠' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (state.blackBatReflectUsed) {
    return { allowed: false, reason: '黑蝙蝠的反彈庇護已生效過一次，無法再次使用' };
  }
  if (state.lastBlackBatTarget !== null && state.lastBlackBatTarget === targetSeat) {
    return { allowed: false, reason: '黑蝙蝠不可連續兩晚庇護同一名玩家' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '庇護目標不存在或已出局' };
  }
  return { allowed: true };
}

export function canDarkNightEnvoyShield(
  seats: PlayerSeat[],
  lastTarget: number | null,
  targetSeat: number | null,
): ActionCheckResult {
  const envoy = seats.find((s) => s.roleId === 'dark_night_envoy' && s.isAlive);
  if (!envoy) {
    return { allowed: false, reason: '場上沒有存活的黑夜使者' };
  }
  if (targetSeat === null) {
    return { allowed: true };
  }
  if (lastTarget !== null && lastTarget === targetSeat) {
    return { allowed: false, reason: '黑夜使者不可連續兩晚庇護同一位狼人' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '庇護目標不存在或已出局' };
  }
  if (!isSeatWolfFaction(target)) {
    return { allowed: false, reason: '黑夜使者僅能庇護狼人陣營玩家' };
  }
  return { allowed: true };
}

// =========================
// 7. 覺醒女巫（awakened_witch）
// =========================

export function canAwakenedWitchUseAntidote(
  seats: PlayerSeat[],
  round: number,
  wolfTarget: number | null,
  antidoteUsed: boolean,
  ruleOverrides: RuleOverrides,
): ActionCheckResult {
  const aw = seats.find(
    (s) => s.roleId === 'awakened_witch' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!aw) return { allowed: false, reason: '場上沒有存活的覺醒女巫' };
  if (antidoteUsed) return { allowed: false, reason: '覺醒女巫解藥已使用完畢' };
  if (wolfTarget === null) return { allowed: false, reason: '今晚狼人空刀，無須使用解藥' };
  if (wolfTarget === aw.seatNumber) {
    if (ruleOverrides.witchSelfSave === 'never') {
      return { allowed: false, reason: '本局規則禁止女巫自救' };
    }
    if (ruleOverrides.witchSelfSave === 'first_night_only' && round > 1) {
      return { allowed: false, reason: '本局規則僅允許女巫於第一晚自救' };
    }
  }
  return { allowed: true };
}

export function canAwakenedWitchUsePoison(
  seats: PlayerSeat[],
  state: InterferenceRuntimeState,
  useAntidote: boolean,
  poisonTarget: number | null,
  helpers: number[] = [],
): ActionCheckResult {
  const aw = seats.find(
    (s) => s.roleId === 'awakened_witch' && s.isAlive && !s.statuses.infectedBySeedWolf,
  );
  if (!aw) return { allowed: false, reason: '場上沒有存活的覺醒女巫' };
  if (poisonTarget === null) return { allowed: true };
  if (useAntidote) return { allowed: false, reason: '解藥與毒藥不可在同一晚同時使用' };
  if (state.awakenedWitchPoisonsUsed >= 3) {
    return { allowed: false, reason: '覺醒女巫三瓶毒藥已全數用盡' };
  }
  const target = seats.find((s) => s.seatNumber === poisonTarget);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '毒殺目標不存在或已出局' };
  }
  const requiredHelpers = state.awakenedWitchPoisonsUsed + 1;
  const uniqueHelpers = Array.from(new Set(helpers));
  if (uniqueHelpers.length !== requiredHelpers) {
    return {
      allowed: false,
      reason: `第 ${requiredHelpers} 瓶毒藥需選擇 ${requiredHelpers} 位不重複的協助者`,
    };
  }
  const usedHelperSet = new Set(state.awakenedWitchUsedHelpers);
  for (const h of uniqueHelpers) {
    if (usedHelperSet.has(h)) {
      return { allowed: false, reason: `${h} 號先前已擔任過協助者，不可重複選擇` };
    }
    const hSeat = seats.find((s) => s.seatNumber === h);
    if (!hSeat || !hSeat.isAlive) {
      return { allowed: false, reason: `協助者 ${h} 號不存在或已出局` };
    }
  }
  return { allowed: true };
}

// =========================
// 8. 戰狼（war_wolf）與白貓（white_cat）
// =========================

const GOD_SKILL_DEATH_REASONS: ReadonlySet<DeathReason> = new Set([
  'witch_poison',
  'awakened_witch_poison',
  'poisoner_poison',
  'hunter_shoot',
  'knight_duel',
  'pure_white_check_kill',
  'dream_catcher_consecutive',
  'dream_catcher_link',
  'awakened_dream_catcher_kill',
  'demon_hunter_kill',
  'socialite_link',
  'awakened_hunter_shoot',
]);

/** 戰狼免疫所有神職技能傷害，只能透過白天放逐投票出局 */
export function isWarWolfImmuneToDeath(seat: PlayerSeat | undefined, reason: DeathReason): boolean {
  if (!seat || seat.roleId !== 'war_wolf') return false;
  return GOD_SKILL_DEATH_REASONS.has(reason);
}

/** 判斷白貓是否觸發首次死亡翻牌免死（已翻牌期間亦免疫任何死亡，直到下次放逐結束） */
export function shouldWhiteCatSurviveDeath(
  seat: PlayerSeat | undefined,
  reason: DeathReason,
): { survive: boolean; newlyRevealed: boolean } {
  if (!seat || seat.roleId !== 'white_cat' || seat.statuses.infectedBySeedWolf) {
    return { survive: false, newlyRevealed: false };
  }
  if (reason === 'white_cat_delayed_death' || reason === 'manual_judge') {
    return { survive: false, newlyRevealed: false };
  }
  if (seat.statuses.whiteCatRevealed) {
    return { survive: true, newlyRevealed: false };
  }
  return { survive: true, newlyRevealed: true };
}

/** 判斷一個角色是否為神職（用於蝕時狼妃反彈判定） */
export function isGodRoleSeat(seat: PlayerSeat | undefined): boolean {
  if (!seat || !seat.roleId || seat.statuses.infectedBySeedWolf) return false;
  const role = getRoleById(seat.roleId);
  return role?.category === 'god';
}
