import { getRoleById } from '../data/roles';
import type {
  AmbientAudioSettings,
  BoardDefinition,
  ClaimSeatRoleResult,
  HostModeConfig,
  HostModeDescriptor,
  MechWolfRuntimeState,
  NightActionDraft,
  NightStepScript,
  OnlineJudgeSettings,
  PlayerSeat,
  RoleAssignmentValidation,
  RoleSlot,
  RuleOverrides,
  SheriffState,
  StepClaimRoleStatus,
  StepClaimSummary,
} from './types';

export const DEFAULT_RULE_OVERRIDES: RuleOverrides = {
  witchSelfSave: 'first_night_only',
  idiotNeedsExtraKill: false,
  mechWolfForceLearnNight1: true,
  wolfKillPriority: true,
  victoryMode: 'slaughter_side',
  enableSheriff: true,
  badgeSwallowRule: 'single_explode',
  noSheriffDeadDirection: 'clockwise',
  sheriffUseDeadSideOnDeath: false,
  hybridCountsAsVillager: false,
};

export const DEFAULT_HOST_MODE: HostModeConfig = {
  judgeMode: 'physical_judge',
  dealMode: 'physical_deal',
  controlMode: 'central_control',
};

export const DEFAULT_ONLINE_JUDGE_SETTINGS: OnlineJudgeSettings = {
  ttsEnabled: true,
  ttsRate: 1.0,
  stepBufferSeconds: 3,
};

export function clampOnlineJudgeSettings(
  current: OnlineJudgeSettings,
  partial: Partial<OnlineJudgeSettings>,
): OnlineJudgeSettings {
  const rawRate = partial.ttsRate !== undefined ? partial.ttsRate : current.ttsRate;
  const clampedRate = Number.isFinite(rawRate)
    ? Math.round(Math.min(2.0, Math.max(0.5, rawRate)) * 10) / 10
    : DEFAULT_ONLINE_JUDGE_SETTINGS.ttsRate;

  const rawBuffer =
    partial.stepBufferSeconds !== undefined ? partial.stepBufferSeconds : current.stepBufferSeconds;
  const clampedBuffer = Number.isFinite(rawBuffer)
    ? Math.round(Math.min(15, Math.max(0, rawBuffer)))
    : DEFAULT_ONLINE_JUDGE_SETTINGS.stepBufferSeconds;

  return {
    ttsEnabled: partial.ttsEnabled !== undefined ? partial.ttsEnabled : current.ttsEnabled,
    ttsRate: clampedRate,
    stepBufferSeconds: clampedBuffer,
  };
}

export const DEFAULT_AMBIENT_AUDIO_SETTINGS: AmbientAudioSettings = {
  presetId: 'none',
  customFileName: null,
  volume: 0.4,
  autoPlayAtNight: true,
};

export function getHostModeDescriptor(hostMode: HostModeConfig): HostModeDescriptor {
  const { judgeMode, dealMode, controlMode } = hostMode;

  if (judgeMode === 'physical_judge') {
    if (dealMode === 'physical_deal' && controlMode === 'central_control') {
      return {
        modeNumber: 1,
        milestone: 'A',
        availableInStandalone: true,
        shortTitle: '實體法官 · 實體發牌 · 中央操作',
        description:
          '由遊戲外法官操作裝置，第一晚各角色睜眼時即時認領座號，首夜結束未認領者自動判為平民。',
      };
    }
    if (dealMode === 'online_deal' && controlMode === 'central_control') {
      return {
        modeNumber: 2,
        milestone: 'A',
        availableInStandalone: true,
        shortTitle: '實體法官 · 線上發牌 · 中央操作',
        description:
          '系統隨機發牌，開局前依序由 1 號至 N 號傳閱裝置確認並隱藏身分，夜間與白天由法官操作主持。',
      };
    }
    if (dealMode === 'physical_deal' && controlMode === 'multi_device') {
      return {
        modeNumber: 3,
        milestone: 'B',
        availableInStandalone: false,
        shortTitle: '實體法官 · 實體發牌 · 多點操作',
        description:
          '第一晚各角色睜眼時由玩家在各自手機認領座號並操作技能；法官保有上帝視角並負責口頭主持（Milestone B 開放）。',
      };
    }
    return {
      modeNumber: 4,
      milestone: 'B',
      availableInStandalone: false,
      shortTitle: '實體法官 · 線上發牌 · 多點操作',
      description:
        '系統發牌至各玩家手機，夜晚由玩家在各自裝置操作技能與接收資訊；法官保有上帝視角並口頭主持（Milestone B 開放）。',
    };
  }

  if (dealMode === 'physical_deal' && controlMode === 'central_control') {
    return {
      modeNumber: 5,
      milestone: 'A',
      availableInStandalone: true,
      shortTitle: '線上法官 · 實體發牌 · 中央操作',
      description:
        '全員下場遊玩，裝置語音引導流程；第一晚各角色睜眼時至中央裝置認領座號與操作技能，未認領者自動補平民。',
    };
  }
  if (dealMode === 'online_deal' && controlMode === 'central_control') {
    return {
      modeNumber: 6,
      milestone: 'A',
      availableInStandalone: true,
      shortTitle: '線上法官 · 線上發牌 · 中央操作',
      description:
        '開局前裝置傳閱一輪讓 1～N 號確認並隱藏身分；夜晚由裝置語音主持，玩家依序睜眼在中央裝置操作技能。',
    };
  }
  if (dealMode === 'physical_deal' && controlMode === 'multi_device') {
    return {
      modeNumber: 7,
      milestone: 'B',
      availableInStandalone: false,
      shortTitle: '線上法官 · 實體發牌 · 多點操作',
      description:
        '中央裝置負責語音提醒與公開資訊展示，第一晚由玩家在各自手機認領座號、操作技能與投票（Milestone B 開放）。',
    };
  }
  return {
    modeNumber: 8,
    milestone: 'B',
    availableInStandalone: false,
    shortTitle: '線上法官 · 線上發牌 · 多點操作',
    description:
      '系統發牌至各玩家手機，中央裝置負責語音引導與流程推進，所有玩家在各自手機操作技能與投票（Milestone B 開放）。',
  };
}

export const DEFAULT_SPEAK_DURATION_SEC = 90;

export function createInitialMechWolfState(): MechWolfRuntimeState {
  return {
    learnedFromSeat: null,
    learnedRoleId: null,
    hasJoinedWolfTeam: false,
    usedLearnedOneShotSkill: false,
    lastGuardedSeat: null,
  };
}

export function createInitialSheriffState(): SheriffState {
  return {
    status: 'not_started',
    sheriffSeat: null,
    badgeStatus: 'none',
    candidates: [],
    withdrawnSeats: [],
    pkCandidates: [],
    voteRounds: [],
    pendingBadgeTransferFrom: null,
    explodeCountDuringElection: 0,
  };
}

export function createEmptyNightDraft(round: number): NightActionDraft {
  return {
    round,
    guardTarget: null,
    wolfTarget: null,
    witchUseAntidote: false,
    witchPoisonTarget: null,
    poisonerTarget: null,
    seerCheckTarget: null,
    psychicCheckTarget: null,
    mechWolfLearnTarget: null,
    mechWolfSkillTarget: null,
    wolfBeautyCharmTarget: null,
    dreamCatcherTarget: null,
    wolfGirlConfessTarget: null,
    treasureMasterCardRoleId: null,
    nightmareFearTarget: null,
    hybridIdolTarget: null,
    seedWolfInfectTarget: null,
  };
}

export function createInitialSeats(
  playerCount: number,
  savedNicknames: Record<number, string> = {},
): PlayerSeat[] {
  return Array.from({ length: playerCount }, (_, index) => {
    const seatNumber = index + 1;
    return {
      seatNumber,
      nickname: savedNicknames[seatNumber] ?? '',
      roleId: null,
      isAlive: true,
    };
  });
}

export function getBoardExpectedRoleCounts(board: BoardDefinition): Record<string, number> {
  const expected: Record<string, number> = {};
  const allSlots: RoleSlot[] = [
    ...board.composition.wolf,
    ...board.composition.good,
    ...(board.composition.thirdParty ?? []),
  ];
  for (const slot of allSlots) {
    expected[slot.roleId] = (expected[slot.roleId] ?? 0) + slot.count;
  }
  return expected;
}

export function isValidPlayerCountForBoard(board: BoardDefinition, count: number): boolean {
  if (board.presetPlayerCounts && board.presetPlayerCounts.length > 0) {
    return board.presetPlayerCounts.includes(count);
  }
  if (board.playerCountRange) {
    return count >= board.playerCountRange[0] && count <= board.playerCountRange[1];
  }
  return count === board.playerCount;
}

export function validateRoleAssignment(
  board: BoardDefinition,
  seats: PlayerSeat[],
): RoleAssignmentValidation {
  const errors: string[] = [];
  const missingRoles: Record<string, number> = {};
  const extraRoles: Record<string, number> = {};

  if (!isValidPlayerCountForBoard(board, seats.length)) {
    errors.push(`座位數量不符：需要 ${board.playerCount} 人，目前為 ${seats.length} 人。`);
  }

  const expectedCounts = getBoardExpectedRoleCounts(board);
  const actualCounts: Record<string, number> = {};
  const unassignedSeats: number[] = [];

  for (const seat of seats) {
    if (!seat.roleId) {
      unassignedSeats.push(seat.seatNumber);
      continue;
    }
    actualCounts[seat.roleId] = (actualCounts[seat.roleId] ?? 0) + 1;
  }

  if (unassignedSeats.length > 0) {
    errors.push(`尚有未分配身分的座位：${unassignedSeats.join('、')} 號。`);
  }

  const allRoleIds = new Set([...Object.keys(expectedCounts), ...Object.keys(actualCounts)]);
  const allowScalingCounts = Boolean(
    board.presetPlayerCounts?.length || board.playerCountRange,
  );

  for (const roleId of allRoleIds) {
    const expected = expectedCounts[roleId] ?? 0;
    const actual = actualCounts[roleId] ?? 0;
    const roleName = getRoleById(roleId)?.name ?? roleId;

    if (board.isFlexibleComposition) {
      if (expected === 0 && actual > 0) {
        extraRoles[roleId] = actual;
        errors.push(`${roleName} 不屬於本板子可選角色。`);
      } else if (!allowScalingCounts && actual > expected) {
        extraRoles[roleId] = actual - expected;
        errors.push(`${roleName} 人數超出：最多 ${expected} 名，目前 ${actual} 名。`);
      }
      continue;
    }

    if (actual < expected) {
      missingRoles[roleId] = expected - actual;
      errors.push(`${roleName} 人數不足：需 ${expected} 名，目前 ${actual} 名。`);
    } else if (actual > expected) {
      extraRoles[roleId] = actual - expected;
      errors.push(`${roleName} 人數超出：需 ${expected} 名，目前 ${actual} 名。`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingRoles,
    extraRoles,
  };
}

export function getNightSteps(board: BoardDefinition, round: number): NightStepScript[] {
  return round <= 1 ? board.nightSchedule.firstNight : board.nightSchedule.subsequentNights;
}

/**
 * 實體發牌開局檢核：
 * 允許所有或部分座位 roleId 為 null（將於第一晚動態認領並在首夜結束自動補平民），
 * 僅攔截人數不符、非法角色或人數超額。
 */
export function validatePhysicalDealSetup(
  board: BoardDefinition,
  seats: PlayerSeat[],
): RoleAssignmentValidation {
  const errors: string[] = [];
  const missingRoles: Record<string, number> = {};
  const extraRoles: Record<string, number> = {};

  if (!isValidPlayerCountForBoard(board, seats.length)) {
    errors.push(`座位數量不符：需要 ${board.playerCount} 人，目前為 ${seats.length} 人。`);
  }

  const expectedCounts = getBoardExpectedRoleCounts(board);
  const actualCounts: Record<string, number> = {};
  for (const seat of seats) {
    if (seat.roleId) {
      actualCounts[seat.roleId] = (actualCounts[seat.roleId] ?? 0) + 1;
    }
  }

  const allowScalingCounts = Boolean(
    board.presetPlayerCounts?.length || board.playerCountRange,
  );

  for (const [roleId, actual] of Object.entries(actualCounts)) {
    const expected = expectedCounts[roleId] ?? 0;
    const roleName = getRoleById(roleId)?.name ?? roleId;

    if (expected === 0) {
      extraRoles[roleId] = actual;
      errors.push(`${roleName} 不屬於本板子配置角色。`);
    } else if (!allowScalingCounts && actual > expected) {
      extraRoles[roleId] = actual - expected;
      errors.push(`${roleName} 人數超出：最多 ${expected} 名，目前 ${actual} 名。`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingRoles,
    extraRoles,
  };
}

/**
 * 實體發牌模式：第一晚角色睜眼時動態認領座號（防重複指派與人數超額）。
 * 若 roleId 為 null，則解除該座位的認領狀態。
 */
export function claimSeatRole(
  board: BoardDefinition,
  seats: PlayerSeat[],
  seatNumber: number,
  roleId: string | null,
): ClaimSeatRoleResult {
  const targetSeat = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!targetSeat) {
    return { ok: false, reason: `找不到 ${seatNumber} 號座位。`, seats };
  }

  if (roleId === null) {
    return {
      ok: true,
      seats: seats.map((seat) =>
        seat.seatNumber === seatNumber ? { ...seat, roleId: null } : seat,
      ),
    };
  }

  if (targetSeat.roleId === roleId) {
    return { ok: true, seats };
  }

  if (targetSeat.roleId !== null) {
    const existingRoleName = getRoleById(targetSeat.roleId)?.name ?? targetSeat.roleId;
    return {
      ok: false,
      reason: `${seatNumber} 號已認領為「${existingRoleName}」，請先解除原身分再重新指派。`,
      seats,
    };
  }

  const expectedCounts = getBoardExpectedRoleCounts(board);
  const expected = expectedCounts[roleId] ?? 0;
  const roleName = getRoleById(roleId)?.name ?? roleId;
  const allowScalingCounts = Boolean(
    board.presetPlayerCounts?.length || board.playerCountRange,
  );

  if (expected === 0) {
    return {
      ok: false,
      reason: `「${roleName}」不屬於本板子配置角色。`,
      seats,
    };
  }

  const currentCount = seats.filter((seat) => seat.roleId === roleId).length;
  if (!allowScalingCounts && currentCount >= expected) {
    return {
      ok: false,
      reason: `「${roleName}」人數已達上限（${expected} 名），無法再認領。`,
      seats,
    };
  }

  return {
    ok: true,
    seats: seats.map((seat) =>
      seat.seatNumber === seatNumber ? { ...seat, roleId } : seat,
    ),
  };
}

/**
 * 實體發牌模式：計算第一晚指定步驟中各角色的應配人數、已認領座號與完成狀態。
 */
export function getStepClaimSummary(
  board: BoardDefinition,
  seats: PlayerSeat[],
  actorRoleIds: string[],
): StepClaimSummary {
  const expectedCounts = getBoardExpectedRoleCounts(board);
  const allowScalingCounts = Boolean(
    board.presetPlayerCounts?.length || board.playerCountRange,
  );
  const uniqueRoleIds = Array.from(new Set(actorRoleIds));

  const roles: StepClaimRoleStatus[] = [];
  for (const roleId of uniqueRoleIds) {
    const expectedCount = expectedCounts[roleId] ?? 0;
    if (expectedCount <= 0) continue;
    const claimedSeats = seats
      .filter((seat) => seat.roleId === roleId)
      .map((seat) => seat.seatNumber)
      .sort((a, b) => a - b);
    const remainingCount = Math.max(0, expectedCount - claimedSeats.length);
    roles.push({
      roleId,
      expectedCount,
      claimedSeats,
      remainingCount,
    });
  }

  const totalExpected = roles.reduce((sum, r) => sum + r.expectedCount, 0);
  const totalClaimed = roles.reduce((sum, r) => sum + r.claimedSeats.length, 0);
  const requiresClaiming = roles.length > 0;
  const isComplete = !requiresClaiming
    ? true
    : board.isFlexibleComposition || allowScalingCounts
      ? totalClaimed > 0
      : roles.every((r) => r.remainingCount === 0);

  return {
    roles,
    requiresClaiming,
    isComplete,
    totalExpected,
    totalClaimed,
  };
}

/**
 * 實體發牌模式：取得目前尚未認領身分（roleId === null）的座號清單。
 */
export function getUnclaimedSeatNumbers(seats: PlayerSeat[]): number[] {
  return seats
    .filter((seat) => seat.roleId === null)
    .map((seat) => seat.seatNumber)
    .sort((a, b) => a - b);
}

/**
 * 實體發牌模式：第一晚結束結算時，自動將所有尚未認領身分（roleId === null）的座位設為 'villager'（平民）。
 */
export function finalizePhysicalDealVillagers(seats: PlayerSeat[]): PlayerSeat[] {
  return seats.map((seat) =>
    seat.roleId === null ? { ...seat, roleId: 'villager' } : seat,
  );
}

/**
 * 線上發牌模式：依板子配置隨機洗牌並分配身分至所有座位（支援注入 rng 供單元測試驗證）。
 */
export function dealRandomRoles(
  board: BoardDefinition,
  seats: PlayerSeat[],
  rng: () => number = Math.random,
): PlayerSeat[] {
  const wolfPool: string[] = [];
  for (const slot of board.composition.wolf) {
    for (let i = 0; i < slot.count; i += 1) {
      wolfPool.push(slot.roleId);
    }
  }

  const otherPool: string[] = [];
  for (const slot of [...board.composition.good, ...(board.composition.thirdParty ?? [])]) {
    for (let i = 0; i < slot.count; i += 1) {
      otherPool.push(slot.roleId);
    }
  }

  const shuffle = (arr: string[]) => {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  let pool: string[] = [];
  if (board.name.includes('獵殺潛狼')) {
    const wolfCount = seats.length === 12 ? 4 : seats.length === 10 ? 3 : 2;
    const hunterCount = Math.max(0, seats.length - wolfCount);
    pool = [
      ...Array<string>(wolfCount).fill('wolf'),
      ...Array<string>(hunterCount).fill('hunter'),
    ];
  } else if (wolfPool.length + otherPool.length >= seats.length) {
    shuffle(otherPool);
    const neededOthers = Math.max(0, seats.length - wolfPool.length);
    pool = [...wolfPool, ...otherPool.slice(0, neededOthers)].slice(0, seats.length);
  } else {
    pool = [...wolfPool, ...otherPool];
    const fillerRole = otherPool[0] ?? 'villager';
    while (pool.length < seats.length) {
      pool.push(fillerRole);
    }
  }

  shuffle(pool);

  return seats.map((seat, idx) => ({
    ...seat,
    roleId: pool[idx] ?? null,
  }));
}
