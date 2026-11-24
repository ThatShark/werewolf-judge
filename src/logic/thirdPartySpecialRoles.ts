import { ROLES_BY_ID } from '../data/roles';
import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  GameWinner,
  MediumSkillType,
  PandoraBoxItem,
  PlayerSeat,
  ThirdPartySpecialRuntimeState,
  VictoryResult,
} from './types';

export function createInitialThirdPartySpecialState(): ThirdPartySpecialRuntimeState {
  return {
    pandoraRemainingBoxes: ['knife', 'poison', 'hope_light', 'day_gun', 'day_gun'],
    pandoraGiftHistory: [],
    pandoraKnifeUsed: false,
    pandoraHopeLightWinner: null,
    sleepingBeautySeat: null,
    sleepingBeautyAwakened: false,
    sleepingSeats: [],
    nineTailsMarkedSeats: [],
    nineTailsJoinedTeam: false,
    baiZeHeirSeat: null,
    baiZeHeirRoleType: null,
    dancerVisitedSeats: [],
    maskedWolfJoinedTeam: false,
    maskedWolfLastCheckSeat: null,
    maskedWolfLastAlterSeat: null,
    crowLastCursedSeat: null,
    crowActiveCursedSeat: null,
    miracleMerchantUsed: false,
    miracleLuckySeat: null,
    miracleLuckyItem: null,
    miracleLuckyItemUsed: false,
    blackMarketMerchantUsed: false,
    blackMarketLuckySeat: null,
    blackMarketLuckyItem: null,
    blackMarketLuckyItemUsed: false,
    superBlackMarketUsed: false,
    superBlackMarketGifts: [],
    superBlackMarketTurnedWolf: false,
    superBlackMarketJoinedTeam: false,
    evilMerchantGunHolderSeat: null,
    evilMerchantPoisonHolderSeat: null,
    evilMerchantDisabled: false,
    mediumChanneledDeadSeats: [],
    mediumInheritedHeirs: [],
    butlerServedSeats: [],
    butlerActiveTeaSeat: null,
    butlerActiveVoteBonusSeat: null,
    butlerDayProtectedSeat: null,
    wolfMaidJoinedTeam: false,
    wolfMaidServedSeats: [],
    wolfMaidActiveTeaSeat: null,
    wolfMaidActiveVotePenaltySeat: null,
  };
}

export function cloneThirdPartySpecialState(
  state?: ThirdPartySpecialRuntimeState,
): ThirdPartySpecialRuntimeState {
  const base = state ?? createInitialThirdPartySpecialState();
  return {
    ...base,
    pandoraRemainingBoxes: [...base.pandoraRemainingBoxes],
    pandoraGiftHistory: base.pandoraGiftHistory.map((item) => ({ ...item })),
    sleepingSeats: [...base.sleepingSeats],
    nineTailsMarkedSeats: [...base.nineTailsMarkedSeats],
    dancerVisitedSeats: [...base.dancerVisitedSeats],
    superBlackMarketGifts: base.superBlackMarketGifts.map((item) => ({ ...item })),
    mediumChanneledDeadSeats: [...base.mediumChanneledDeadSeats],
    mediumInheritedHeirs: base.mediumInheritedHeirs.map((item) => ({ ...item })),
    butlerServedSeats: [...base.butlerServedSeats],
    wolfMaidServedSeats: [...base.wolfMaidServedSeats],
  };
}

/** 判斷角色在舞池／一般陣營認定上是否為狼人 */
function isEffectiveWolf(
  seat: PlayerSeat,
  state?: ThirdPartySpecialRuntimeState,
): boolean {
  if (seat.roleId === 'super_black_market_merchant' && state?.superBlackMarketTurnedWolf) {
    return true;
  }
  return isSeatWolfFaction(seat);
}

// ============================================================================
// 1. 潘朵拉（pandora）
// ============================================================================

export function canPandoraGift(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
  item?: PandoraBoxItem,
): ActionCheckResult {
  if (state.pandoraRemainingBoxes.length === 0) {
    return { allowed: false, reason: '潘朵拉的 5 個魔盒已全部贈送完畢。' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '僅能贈送魔盒給存活玩家。' };
  }
  if (state.pandoraGiftHistory.some((g) => g.seat === targetSeat)) {
    return { allowed: false, reason: '每位玩家整局只能獲贈一次潘朵拉魔盒。' };
  }
  if (item && !state.pandoraRemainingBoxes.includes(item)) {
    return { allowed: false, reason: '魔盒中已無該項道具。' };
  }
  return { allowed: true };
}

export function applyPandoraGift(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
  item: PandoraBoxItem,
  round: number,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  state: ThirdPartySpecialRuntimeState;
  poisonedSeat: number | null;
} {
  const check = canPandoraGift(seats, state, targetSeat, item);
  if (!check.allowed) {
    return {
      allowed: false,
      reason: check.reason,
      seats,
      state,
      poisonedSeat: null,
    };
  }
  const nextState = cloneThirdPartySpecialState(state);
  const idx = nextState.pandoraRemainingBoxes.indexOf(item);
  nextState.pandoraRemainingBoxes.splice(idx, 1);

  const target = seats.find((s) => s.seatNumber === targetSeat);
  let poisonedSeat: number | null = null;
  let nextSeats = seats;

  if (item === 'poison') {
    nextState.pandoraGiftHistory.push({ seat: targetSeat, item, used: true });
    // 潘朵拉免疫此毒傷害，其餘人開啟即刻出局且無技能
    if (target && target.roleId !== 'pandora') {
      poisonedSeat = targetSeat;
      nextSeats = seats.map((s) =>
        s.seatNumber === targetSeat
          ? { ...s, isAlive: false, deathReason: 'pandora_poison', deathRound: round }
          : s,
      );
    }
  } else {
    nextState.pandoraGiftHistory.push({ seat: targetSeat, item, used: false });
  }

  return {
    allowed: true,
    seats: nextSeats,
    state: nextState,
    poisonedSeat,
  };
}

export function canPandoraKnifeHolderAttack(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  holderSeat: number,
): ActionCheckResult {
  const entry = state.pandoraGiftHistory.find(
    (g) => g.seat === holderSeat && g.item === 'knife' && !g.used,
  );
  if (!entry) {
    return { allowed: false, reason: '該玩家未持有未使用之潘朵拉魔盒刀。' };
  }
  const holder = seats.find((s) => s.seatNumber === holderSeat);
  if (!holder || !holder.isAlive) {
    return { allowed: false, reason: '持刀玩家已出局。' };
  }
  if (holder.roleId === 'pandora' && state.pandoraRemainingBoxes.length > 0) {
    return {
      allowed: false,
      reason: '潘朵拉自己開出魔盒刀時，須待 5 個魔盒全部贈送完畢後方可使用。',
    };
  }
  return { allowed: true };
}

export function hasPandoraDayGun(
  state: ThirdPartySpecialRuntimeState,
  seatNumber: number,
): boolean {
  return state.pandoraGiftHistory.some(
    (g) => g.seat === seatNumber && g.item === 'day_gun' && !g.used,
  );
}

/** 希望之光：若使用者是場上最後一民／最後一神／最後一狼／最後一第三方，所屬陣營立刻獲勝 */
export function resolvePandoraHopeLight(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  actorSeat: number,
): {
  allowed: boolean;
  reason?: string;
  state: ThirdPartySpecialRuntimeState;
  triggeredWinner: GameWinner | null;
} {
  const entryIdx = state.pandoraGiftHistory.findIndex(
    (g) => g.seat === actorSeat && g.item === 'hope_light' && !g.used,
  );
  if (entryIdx < 0) {
    return { allowed: false, reason: '該玩家未持有未使用之希望之光。', state, triggeredWinner: null };
  }
  const actor = seats.find((s) => s.seatNumber === actorSeat);
  if (!actor || !actor.isAlive || !actor.roleId) {
    return { allowed: false, reason: '玩家已出局，無法發動希望之光。', state, triggeredWinner: null };
  }

  const nextState = cloneThirdPartySpecialState(state);
  nextState.pandoraGiftHistory[entryIdx].used = true;

  const aliveSeats = seats.filter((s) => s.isAlive);
  const role = ROLES_BY_ID[actor.roleId];
  let triggeredWinner: GameWinner | null = null;

  if (isEffectiveWolf(actor, nextState)) {
    const aliveWolves = aliveSeats.filter((s) => isEffectiveWolf(s, nextState));
    if (aliveWolves.length === 1 && aliveWolves[0].seatNumber === actorSeat) {
      triggeredWinner = 'wolf';
    }
  } else if (role?.faction === 'third_party') {
    const aliveThird = aliveSeats.filter(
      (s) => s.roleId && ROLES_BY_ID[s.roleId]?.faction === 'third_party',
    );
    if (aliveThird.length === 1 && aliveThird[0].seatNumber === actorSeat) {
      triggeredWinner = 'third_party';
    }
  } else if (role?.category === 'villager') {
    const aliveVillagers = aliveSeats.filter(
      (s) => !isEffectiveWolf(s, nextState) && s.roleId && ROLES_BY_ID[s.roleId]?.category === 'villager',
    );
    if (aliveVillagers.length === 1 && aliveVillagers[0].seatNumber === actorSeat) {
      triggeredWinner = 'good';
    }
  } else if (role?.category === 'god') {
    const aliveGods = aliveSeats.filter(
      (s) => !isEffectiveWolf(s, nextState) && s.roleId && ROLES_BY_ID[s.roleId]?.category === 'god',
    );
    if (aliveGods.length === 1 && aliveGods[0].seatNumber === actorSeat) {
      triggeredWinner = 'good';
    }
  }

  if (triggeredWinner) {
    nextState.pandoraHopeLightWinner = triggeredWinner;
  }

  return {
    allowed: true,
    state: nextState,
    triggeredWinner,
  };
}

/** 潘朵拉與第 5 批優先勝利判定（優先於一般好人／狼人屠邊） */
export function checkThirdPartySpecialVictory(
  seats: PlayerSeat[],
  state?: ThirdPartySpecialRuntimeState,
): VictoryResult {
  if (!state) return { winner: null, winReason: null };

  // 1. 潘朵拉獨立勝利（與其他陣營同達標時優先判潘朵拉勝）
  const pandoraSeat = seats.find((s) => s.roleId === 'pandora');
  if (pandoraSeat?.isAlive) {
    const aliveSeats = seats.filter((s) => s.isAlive);
    // 條件 2：其他人全滅，僅剩潘朵拉存活
    if (aliveSeats.length === 1 && aliveSeats[0].seatNumber === pandoraSeat.seatNumber) {
      return {
        winner: 'third_party',
        winReason: '全場僅剩潘朵拉存活，潘朵拉（第三方）優先獲得勝利！',
      };
    }
    // 條件 1：5 個魔盒全部送出，且所有除潘朵拉以外的獲贈者都死亡
    if (state.pandoraRemainingBoxes.length === 0) {
      const otherRecipients = state.pandoraGiftHistory.filter(
        (g) => g.seat !== pandoraSeat.seatNumber,
      );
      const allOthersDead =
        otherRecipients.length > 0 &&
        otherRecipients.every((g) => {
          const seat = seats.find((s) => s.seatNumber === g.seat);
          return !seat || !seat.isAlive;
        });
      if (allOthersDead) {
        return {
          winner: 'third_party',
          winReason: '潘朵拉魔盒已全數送出且其餘獲贈者全數出局，潘朵拉（第三方）優先獲得勝利！',
        };
      }
    }
  }

  // 條件 3：希望之光即時勝利（含潘朵拉或他陣營持有者）
  if (state.pandoraHopeLightWinner) {
    const label =
      state.pandoraHopeLightWinner === 'third_party'
        ? '潘朵拉（第三方）'
        : state.pandoraHopeLightWinner === 'wolf'
          ? '狼人陣營'
          : '好人陣營';
    return {
      winner: state.pandoraHopeLightWinner,
      winReason: `玩家使用潘朵拉「希望之光」達成最後一人條件，${label}立即獲得勝利！`,
    };
  }

  return { winner: null, winReason: null };
}

// ============================================================================
// 2. 睡美人（sleeping_beauty） & 異族王子（exotic_prince）
// ============================================================================

/** 首夜設定或次夜起向左右擴散一格（不跳過空座／死座） */
export function advanceSleepSpread(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  round: number,
  pickedSeat?: number | null,
): ThirdPartySpecialRuntimeState {
  const nextState = cloneThirdPartySpecialState(state);
  if (nextState.sleepingBeautyAwakened) {
    nextState.sleepingSeats = [];
    return nextState;
  }

  const totalSeats = seats.length;
  if (totalSeats === 0) return nextState;

  if (round === 1 && pickedSeat != null) {
    const target = seats.find((s) => s.seatNumber === pickedSeat);
    // 若抽中異族王子為睡美人，則本場沒有睡美人
    if (!target || target.roleId === 'exotic_prince') {
      nextState.sleepingBeautySeat = null;
      nextState.sleepingSeats = [];
      return nextState;
    }
    nextState.sleepingBeautySeat = pickedSeat;
    nextState.sleepingSeats = [pickedSeat];
    return nextState;
  }

  if (round >= 2 && nextState.sleepingBeautySeat != null) {
    const spreadRadius = round - 1;
    const center = nextState.sleepingBeautySeat;
    const sleepingSet = new Set<number>(nextState.sleepingSeats);
    sleepingSet.add(center);
    for (let d = 1; d <= spreadRadius; d += 1) {
      const left = ((center - 1 - d) % totalSeats + totalSeats) % totalSeats + 1;
      const right = ((center - 1 + d) % totalSeats) + 1;
      sleepingSet.add(left);
      sleepingSet.add(right);
    }
    nextState.sleepingSeats = Array.from(sleepingSet).sort((a, b) => a - b);
  }

  return nextState;
}

export function isSeatAsleep(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState | undefined,
  seatNumber: number,
): boolean {
  if (!state || state.sleepingBeautyAwakened) return false;
  const seat = seats.find((s) => s.seatNumber === seatNumber);
  if (!seat || seat.roleId === 'exotic_prince') return false;
  return state.sleepingSeats.includes(seatNumber);
}

export function areAllAliveWolvesAsleep(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState | undefined,
): boolean {
  if (!state || state.sleepingBeautyAwakened || state.sleepingSeats.length === 0) {
    return false;
  }
  const aliveWolves = seats.filter((s) => s.isAlive && isEffectiveWolf(s, state));
  if (aliveWolves.length === 0) return false;
  return aliveWolves.every((w) => isSeatAsleep(seats, state, w.seatNumber));
}

export function resolveExoticPrinceCheck(
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
): { foundSleepingBeauty: boolean; state: ThirdPartySpecialRuntimeState } {
  const nextState = cloneThirdPartySpecialState(state);
  if (nextState.sleepingBeautySeat === targetSeat && !nextState.sleepingBeautyAwakened) {
    nextState.sleepingBeautyAwakened = true;
    nextState.sleepingSeats = [];
    return { foundSleepingBeauty: true, state: nextState };
  }
  return { foundSleepingBeauty: false, state: nextState };
}

// ============================================================================
// 3. 九尾（nine_tails_wolf） & 白澤（bai_ze）
// ============================================================================

export function addNineTailsMark(
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
): ThirdPartySpecialRuntimeState {
  const nextState = cloneThirdPartySpecialState(state);
  if (!nextState.nineTailsMarkedSeats.includes(targetSeat)) {
    nextState.nineTailsMarkedSeats.push(targetSeat);
  }
  return nextState;
}

export function clearBaiZeMarks(
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
): ThirdPartySpecialRuntimeState {
  const nextState = cloneThirdPartySpecialState(state);
  nextState.nineTailsMarkedSeats = nextState.nineTailsMarkedSeats.filter((n) => n !== targetSeat);
  return nextState;
}

export function resolveNineTailsHunt(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  round: number,
): {
  success: boolean;
  eliminatedSeats: number[];
  seats: PlayerSeat[];
  groupACount: number;
  groupBCount: number;
} {
  const nineTails = seats.find((s) => s.roleId === 'nine_tails_wolf' && s.isAlive);
  if (!nineTails) {
    return { success: false, eliminatedSeats: [], seats, groupACount: 0, groupBCount: 0 };
  }

  const aliveSeats = seats.filter((s) => s.isAlive);
  const groupA = new Set<number>([nineTails.seatNumber]);
  for (const s of aliveSeats) {
    if (state.nineTailsMarkedSeats.includes(s.seatNumber)) {
      groupA.add(s.seatNumber);
    }
  }
  const groupB = aliveSeats.filter((s) => !groupA.has(s.seatNumber));

  if (groupA.size > groupB.length) {
    const eliminatedSeats = groupB.map((s) => s.seatNumber);
    const nextSeats = seats.map((s) =>
      eliminatedSeats.includes(s.seatNumber)
        ? { ...s, isAlive: false, deathReason: 'nine_tails_hunt' as const, deathRound: round }
        : s,
    );
    return {
      success: true,
      eliminatedSeats,
      seats: nextSeats,
      groupACount: groupA.size,
      groupBCount: groupB.length,
    };
  }

  return {
    success: false,
    eliminatedSeats: [],
    seats,
    groupACount: groupA.size,
    groupBCount: groupB.length,
  };
}

export function resolveBaiZeInherit(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  heirSeat: number,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  state: ThirdPartySpecialRuntimeState;
  heirType: 'villager' | 'god' | 'wolf' | null;
} {
  const heir = seats.find((s) => s.seatNumber === heirSeat);
  if (!heir || !heir.isAlive || !heir.roleId) {
    return { allowed: false, reason: '白澤繼承人必須為存活玩家。', seats, state, heirType: null };
  }
  const nextState = cloneThirdPartySpecialState(state);
  nextState.baiZeHeirSeat = heirSeat;

  if (isEffectiveWolf(heir, nextState)) {
    nextState.baiZeHeirRoleType = 'wolf';
    return { allowed: true, seats, state: nextState, heirType: 'wolf' };
  }

  const role = ROLES_BY_ID[heir.roleId];
  if (role?.category === 'villager') {
    nextState.baiZeHeirRoleType = 'villager';
    const nextSeats = seats.map((s) =>
      s.seatNumber === heirSeat ? { ...s, baiZeDualFaction: true } : s,
    );
    return { allowed: true, seats: nextSeats, state: nextState, heirType: 'villager' };
  }

  nextState.baiZeHeirRoleType = 'god';
  return { allowed: true, seats, state: nextState, heirType: 'god' };
}

// ============================================================================
// 4. 舞者（dancer） & 假面（masked_wolf）
// ============================================================================

export function canDancerPickFloor(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  round: number,
  targets: number[],
): ActionCheckResult {
  if (round < 2) {
    return { allowed: false, reason: '舞者自第二晚起才可發動技能。' };
  }
  const eligible = seats.filter(
    (s) => s.isAlive && !state.dancerVisitedSeats.includes(s.seatNumber),
  );
  if (eligible.length < 3) {
    return { allowed: false, reason: '剩餘未進過舞池的存活玩家不足 3 人，無法發動。' };
  }
  const unique = Array.from(new Set(targets));
  if (unique.length !== 3) {
    return { allowed: false, reason: '舞者每晚須選擇 3 名不同存活玩家進入舞池。' };
  }
  for (const num of unique) {
    if (!eligible.some((s) => s.seatNumber === num)) {
      return { allowed: false, reason: `${num} 號已出局或曾進入過舞池，不可重複選擇。` };
    }
  }
  return { allowed: true };
}

export function resolveDancerFloor(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  targets: number[],
  maskedWolfAlterSeat: number | null,
): {
  eliminatedSeat: number | null;
  immuneToWolfKillSeats: number[];
} {
  const dancerSeat = seats.find((s) => s.roleId === 'dancer' && s.isAlive)?.seatNumber ?? null;
  const immuneToWolfKillSeats =
    dancerSeat != null && targets.includes(dancerSeat) ? [...targets] : [];

  const wolfGroup: number[] = [];
  const goodGroup: number[] = [];

  for (const seatNum of targets) {
    const seat = seats.find((s) => s.seatNumber === seatNum);
    if (!seat) continue;
    let isWolf = isEffectiveWolf(seat, state);
    if (maskedWolfAlterSeat === seatNum) {
      isWolf = !isWolf;
    }
    if (isWolf) {
      wolfGroup.push(seatNum);
    } else {
      goodGroup.push(seatNum);
    }
  }

  if (wolfGroup.length === 1 && goodGroup.length === 2) {
    return { eliminatedSeat: wolfGroup[0], immuneToWolfKillSeats };
  }
  if (goodGroup.length === 1 && wolfGroup.length === 2) {
    return { eliminatedSeat: goodGroup[0], immuneToWolfKillSeats };
  }
  return { eliminatedSeat: null, immuneToWolfKillSeats };
}

// ============================================================================
// 5. 烏鴉（crow）
// ============================================================================

export function canCrowCurse(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  targetSeat: number,
): ActionCheckResult {
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '烏鴉僅能詛咒存活玩家。' };
  }
  if (state.crowLastCursedSeat === targetSeat) {
    return { allowed: false, reason: '烏鴉不可連續兩晚詛咒同一位玩家。' };
  }
  if (target.roleId === 'idiot' && target.idiotRevealed) {
    return { allowed: false, reason: '烏鴉不可詛咒已翻牌的白痴。' };
  }
  return { allowed: true };
}

/** 取得當日放逐投票的額外加票／扣票（目前提供烏鴉 +1 票，並可由 UI 呈現管家/狼僕平民票權提醒） */
export function getBatch5ExileExtraVotes(
  state?: ThirdPartySpecialRuntimeState,
): Record<number, number> {
  const extra: Record<number, number> = {};
  if (state?.crowActiveCursedSeat != null) {
    extra[state.crowActiveCursedSeat] = (extra[state.crowActiveCursedSeat] ?? 0) + 1;
  }
  return extra;
}

// ============================================================================
// 6. 商人系列與通靈者（medium）
// ============================================================================

export function getChannelableSkillForRole(roleId: string | null): MediumSkillType | null {
  if (!roleId) return null;
  if (roleId === 'seer') return 'seer_check';
  if (roleId === 'witch') return 'witch_poison';
  if (roleId === 'guard') return 'guard_shield';
  const role = ROLES_BY_ID[roleId];
  if (role?.faction === 'wolf') return 'wolf_kill';
  return null;
}

export function canMediumChannel(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
  actorSeat: number,
  deadSeat: number,
  heirSeat: number,
): ActionCheckResult {
  const dead = seats.find((s) => s.seatNumber === deadSeat);
  if (!dead || dead.isAlive) {
    return { allowed: false, reason: '被通靈對象必須為已死亡玩家。' };
  }
  if (state.mediumChanneledDeadSeats.includes(deadSeat)) {
    return { allowed: false, reason: '每位死亡玩家整局只能被通靈一次。' };
  }
  const heir = seats.find((s) => s.seatNumber === heirSeat);
  if (!heir || !heir.isAlive || heirSeat === actorSeat) {
    return { allowed: false, reason: '繼承者必須為通靈者以外的存活玩家。' };
  }
  if (state.mediumInheritedHeirs.some((h) => h.heirSeat === heirSeat)) {
    return { allowed: false, reason: '每位存活玩家整局只能繼承一次通靈技能。' };
  }
  return { allowed: true };
}

// ============================================================================
// 7. 孤狼入隊同步（九尾／假面／超級黑市變身／狼僕）
// ============================================================================

export function syncBatch5LoneWolfTeamStatus(
  seats: PlayerSeat[],
  state: ThirdPartySpecialRuntimeState,
): ThirdPartySpecialRuntimeState {
  const nextState = cloneThirdPartySpecialState(state);
  const aliveTeamWolves = seats.filter(
    (s) =>
      s.isAlive &&
      isEffectiveWolf(s, nextState) &&
      s.roleId !== 'nine_tails_wolf' &&
      s.roleId !== 'masked_wolf' &&
      s.roleId !== 'wolf_maid' &&
      !(s.roleId === 'super_black_market_merchant' && nextState.superBlackMarketTurnedWolf),
  );

  if (aliveTeamWolves.length === 0) {
    if (seats.some((s) => s.isAlive && s.roleId === 'nine_tails_wolf')) {
      nextState.nineTailsJoinedTeam = true;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'masked_wolf')) {
      nextState.maskedWolfJoinedTeam = true;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'wolf_maid')) {
      nextState.wolfMaidJoinedTeam = true;
    }
    if (
      nextState.superBlackMarketTurnedWolf &&
      seats.some((s) => s.isAlive && s.roleId === 'super_black_market_merchant')
    ) {
      nextState.superBlackMarketJoinedTeam = true;
    }
  }

  return nextState;
}
