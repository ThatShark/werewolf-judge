import { isSeatWolfFaction } from './topFiveRoles';
import type {
  ActionCheckResult,
  FinalBatchRuntimeState,
  PlayerSeat,
} from './types';

export function createInitialFinalBatchState(): FinalBatchRuntimeState {
  return {
    eclipseMaidJoinedTeam: false,
    eclipseMaidDevouredSeatTonight: null,
    greyWolfBossJoinedTeam: false,
    greyWolfBossStolenSeats: [],
    greyWolfBossBorrowedHunterGun: false,
    happySheepLastProtectSeat: null,
    happySheepLastAntiTheftSeat: null,
    phantomWolfInvincibleUsed: false,
    phantomWolfInvincibleActive: false,
    sequencePrinceUsed: false,
    contrarianUsed: false,
    contrarianSilencedVoterSeat: null,
    detectiveRevealedToday: false,
    detectiveUsed: false,
    policeDogActivatedRound: null,
    policeDogMode: null,
    policeDogUsed: false,
    whiteNightEnvoyUsed: false,
    littleGirlIdentifyUsed: false,
  };
}

export function cloneFinalBatchState(
  state?: FinalBatchRuntimeState,
): FinalBatchRuntimeState {
  const base = state ?? createInitialFinalBatchState();
  return {
    ...base,
    greyWolfBossStolenSeats: [...base.greyWolfBossStolenSeats],
  };
}

/** 羊駝／兔兔：與平民相同之基礎平民邊角色 */
export function isAnimalVillagerRole(roleId: string | null): boolean {
  return roleId === 'alpaca' || roleId === 'bunny';
}

/** 小小灰：與小狼相同之基礎狼人角色 */
export function isLittleGreyWolfRole(roleId: string | null): boolean {
  return roleId === 'little_grey_wolf';
}

// ============================================================================
// 1. 蝕日侍女（eclipse_maid）
// ============================================================================

export function canEclipseMaidDevour(
  seats: PlayerSeat[],
  round: number,
  targetSeat: number,
): ActionCheckResult {
  if (round < 2) {
    return { allowed: false, reason: '蝕日侍女自第二晚起才可發動吞噬技能。' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '僅能吞噬存活玩家。' };
  }
  if (isSeatWolfFaction(target)) {
    return { allowed: false, reason: '蝕日侍女僅能吞噬非狼人陣營的玩家。' };
  }
  return { allowed: true };
}

// ============================================================================
// 2. 灰太狼（grey_wolf_boss） & 喜羊羊（happy_sheep）
// ============================================================================

export function canGreyWolfBossSteal(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  targetSeat: number,
): ActionCheckResult {
  const actor = seats.find((s) => s.roleId === 'grey_wolf_boss' && s.isAlive);
  if (!actor) {
    return { allowed: false, reason: '場上沒有存活的灰太狼。' };
  }
  if (targetSeat === actor.seatNumber) {
    return { allowed: false, reason: '灰太狼不可偷取自己。' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '僅能偷取存活玩家。' };
  }
  if (state.greyWolfBossStolenSeats.includes(targetSeat)) {
    return { allowed: false, reason: '每位玩家整局只能被灰太狼偷取一次。' };
  }
  return { allowed: true };
}

export function canHappySheepAct(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  mode: 'guard' | 'anti_theft',
  targetSeat: number,
): ActionCheckResult {
  const actor = seats.find((s) => s.roleId === 'happy_sheep' && s.isAlive);
  if (!actor) {
    return { allowed: false, reason: '場上沒有存活的喜羊羊。' };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    return { allowed: false, reason: '僅能對存活玩家使用防盜或守護。' };
  }
  if (targetSeat === actor.seatNumber) {
    if (
      state.happySheepLastProtectSeat === targetSeat ||
      state.happySheepLastAntiTheftSeat === targetSeat
    ) {
      return { allowed: false, reason: '喜羊羊不可連續兩晚對自己重複使用相同技能。' };
    }
    return { allowed: true };
  }
  if (mode === 'guard' && state.happySheepLastProtectSeat === targetSeat) {
    return { allowed: false, reason: '喜羊羊不可連續兩晚守護同一位玩家。' };
  }
  if (mode === 'anti_theft' && state.happySheepLastAntiTheftSeat === targetSeat) {
    return { allowed: false, reason: '喜羊羊不可連續兩晚對同一位玩家防盜。' };
  }
  return { allowed: true };
}

// ============================================================================
// 3. 怪盜狼王（phantom_wolf_king）
// ============================================================================

export function canPhantomWolfActivateInvincible(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
): ActionCheckResult {
  if (state.phantomWolfInvincibleUsed) {
    return { allowed: false, reason: '怪盜狼王的「無敵」技能整局僅能發動一次。' };
  }
  const actor = seats.find((s) => s.roleId === 'phantom_wolf_king' && s.isAlive);
  if (!actor) {
    return { allowed: false, reason: '場上沒有存活的怪盜狼王。' };
  }
  const aliveWolves = seats.filter((s) => s.isAlive && isSeatWolfFaction(s));
  if (aliveWolves.length <= 1) {
    return { allowed: false, reason: '怪盜狼王作為最後一狼時不可發動「無敵」技能。' };
  }
  return { allowed: true };
}

export function isPhantomWolfInvincible(
  seat: PlayerSeat | undefined,
  state?: FinalBatchRuntimeState,
): boolean {
  return (
    seat?.roleId === 'phantom_wolf_king' &&
    Boolean(state?.phantomWolfInvincibleActive)
  );
}

// ============================================================================
// 4. 定序王子（sequence_prince）
// ============================================================================

export function resolveSequencePrinceRevote(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
): { allowed: boolean; reason?: string; state: FinalBatchRuntimeState } {
  if (state.sequencePrinceUsed) {
    return { allowed: false, reason: '定序王子整場僅能發動一次重新發言與放逐投票。', state };
  }
  const prince = seats.find((s) => s.roleId === 'sequence_prince' && s.isAlive);
  if (!prince) {
    return { allowed: false, reason: '場上沒有存活的定序王子。', state };
  }
  const nextState = cloneFinalBatchState(state);
  nextState.sequencePrinceUsed = true;
  return { allowed: true, state: nextState };
}

// ============================================================================
// 5. 槓精（contrarian）
// ============================================================================

export function resolveContrarianDebate(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  targetSeat: number,
  majorityPassed: boolean,
  currentSheriffSeat: number | null,
): {
  allowed: boolean;
  reason?: string;
  state: FinalBatchRuntimeState;
  silencedVoterSeat: number | null;
  newSheriffSeat: number | null;
} {
  if (state.contrarianUsed) {
    return {
      allowed: false,
      reason: '槓精整場僅能發動一次開槓技能。',
      state,
      silencedVoterSeat: null,
      newSheriffSeat: currentSheriffSeat,
    };
  }
  const contrarian = seats.find((s) => s.roleId === 'contrarian' && s.isAlive);
  if (!contrarian) {
    return {
      allowed: false,
      reason: '場上沒有存活的槓精。',
      state,
      silencedVoterSeat: null,
      newSheriffSeat: currentSheriffSeat,
    };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat && s.isAlive);
  if (!target || targetSeat === contrarian.seatNumber) {
    return {
      allowed: false,
      reason: '開槓目標必須為槓精以外的存活玩家。',
      state,
      silencedVoterSeat: null,
      newSheriffSeat: currentSheriffSeat,
    };
  }

  const nextState = cloneFinalBatchState(state);
  nextState.contrarianUsed = true;
  const silencedVoterSeat = majorityPassed ? targetSeat : contrarian.seatNumber;
  nextState.contrarianSilencedVoterSeat = silencedVoterSeat;
  const newSheriffSeat =
    majorityPassed && currentSheriffSeat === targetSeat
      ? contrarian.seatNumber
      : currentSheriffSeat;

  return {
    allowed: true,
    state: nextState,
    silencedVoterSeat,
    newSheriffSeat,
  };
}

// ============================================================================
// 6. 偵探（detective） & 警犬（police_dog）
// ============================================================================

export function resolveDetectiveReveal(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
): {
  allowed: boolean;
  reason?: string;
  state: FinalBatchRuntimeState;
  detectiveSeat: number | null;
} {
  if (state.detectiveUsed || state.detectiveRevealedToday) {
    return { allowed: false, reason: '偵探已翻牌或已使用技能。', state, detectiveSeat: null };
  }
  const detective = seats.find((s) => s.roleId === 'detective' && s.isAlive);
  if (!detective) {
    return { allowed: false, reason: '場上沒有存活的偵探。', state, detectiveSeat: null };
  }
  const nextState = cloneFinalBatchState(state);
  nextState.detectiveRevealedToday = true;
  return {
    allowed: true,
    state: nextState,
    detectiveSeat: detective.seatNumber,
  };
}

export function resolveDetectiveExecute(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  targetSeat: number,
  round: number,
): {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  state: FinalBatchRuntimeState;
  targetWasWolf: boolean;
  targetSurvivedInvincible: boolean;
} {
  if (state.detectiveUsed) {
    return {
      allowed: false,
      reason: '偵探整場僅能發動一次處決。',
      seats,
      state,
      targetWasWolf: false,
      targetSurvivedInvincible: false,
    };
  }
  const target = seats.find((s) => s.seatNumber === targetSeat && s.isAlive);
  if (!target) {
    return {
      allowed: false,
      reason: '處決目標不存在或已出局。',
      seats,
      state,
      targetWasWolf: false,
      targetSurvivedInvincible: false,
    };
  }

  const nextState = cloneFinalBatchState(state);
  nextState.detectiveUsed = true;
  nextState.detectiveRevealedToday = true;
  const targetWasWolf = isSeatWolfFaction(target);

  // 警犬於偵探處決後的「當晚」（round + 1）激活：處決好人→撕咬、處決狼人→查驗
  nextState.policeDogActivatedRound = round + 1;
  nextState.policeDogMode = targetWasWolf ? 'check' : 'bite';

  if (isPhantomWolfInvincible(target, nextState)) {
    return {
      allowed: true,
      seats,
      state: nextState,
      targetWasWolf,
      targetSurvivedInvincible: true,
    };
  }

  const nextSeats = seats.map((s) =>
    s.seatNumber === targetSeat
      ? { ...s, isAlive: false, deathReason: 'detective_execute' as const, deathRound: round }
      : s,
  );
  return {
    allowed: true,
    seats: nextSeats,
    state: nextState,
    targetWasWolf,
    targetSurvivedInvincible: false,
  };
}

export function canPoliceDogAct(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  round: number,
): ActionCheckResult {
  if (state.policeDogUsed) {
    return { allowed: false, reason: '警犬技能已使用。' };
  }
  if (state.policeDogActivatedRound !== round || !state.policeDogMode) {
    return { allowed: false, reason: '警犬僅於偵探處決後的當晚激活技能。' };
  }
  const dog = seats.find((s) => s.roleId === 'police_dog' && s.isAlive);
  if (!dog) {
    return { allowed: false, reason: '場上沒有存活的警犬。' };
  }
  return { allowed: true };
}

// ============================================================================
// 7. 白夜使者（white_night_envoy） & 小女孩（little_girl）
// ============================================================================

export function canWhiteNightEnvoyRewind(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
  round: number,
): ActionCheckResult {
  if (round < 2) {
    return { allowed: false, reason: '白夜使者自第二天起才可發動時間回溯。' };
  }
  if (state.whiteNightEnvoyUsed) {
    return { allowed: false, reason: '白夜使者整場僅能發動一次技能。' };
  }
  if (!seats.some((s) => s.roleId === 'white_night_envoy' && s.isAlive)) {
    return { allowed: false, reason: '場上沒有存活的白夜使者。' };
  }
  return { allowed: true };
}

export function canWolvesIdentifyLittleGirl(
  round: number,
  state: FinalBatchRuntimeState,
): ActionCheckResult {
  if (round < 2) {
    return { allowed: false, reason: '狼人自第二晚起才可指認小女孩。' };
  }
  if (state.littleGirlIdentifyUsed) {
    return { allowed: false, reason: '狼隊指認小女孩的機會整局僅限一次。' };
  }
  return { allowed: true };
}

// ============================================================================
// 8. 孤狼入隊同步（蝕日侍女／灰太狼）
// ============================================================================

export function syncFinalBatchLoneWolfTeamStatus(
  seats: PlayerSeat[],
  state: FinalBatchRuntimeState,
): FinalBatchRuntimeState {
  const nextState = cloneFinalBatchState(state);
  const aliveTeamWolves = seats.filter(
    (s) =>
      s.isAlive &&
      isSeatWolfFaction(s) &&
      s.roleId !== 'eclipse_maid' &&
      s.roleId !== 'grey_wolf_boss',
  );
  if (aliveTeamWolves.length === 0) {
    if (seats.some((s) => s.isAlive && s.roleId === 'eclipse_maid')) {
      nextState.eclipseMaidJoinedTeam = true;
    }
    if (seats.some((s) => s.isAlive && s.roleId === 'grey_wolf_boss')) {
      nextState.greyWolfBossJoinedTeam = true;
    }
  }
  return nextState;
}
