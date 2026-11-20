import { createInitialSheriffState } from './setup';
import type { PlayerSeat, SheriffState, VoteRoundRecord } from './types';

const ACTIVE_ELECTION_STATUSES: ReadonlySet<SheriffState['status']> = new Set([
  'sign_up',
  'speaking',
  'voting',
  'pk_speaking',
  'pk_voting',
]);

export function isSheriffElectionActive(state: SheriffState): boolean {
  return ACTIVE_ELECTION_STATUSES.has(state.status);
}

/**
 * 開啟警長競選並記錄上警名單：
 * - 0 人上警：本局無警長（no_sheriff）
 * - 1 人上警：直接自動當選警長（elected）
 * - 2 人以上：進入警上發言階段（speaking）
 */
export function startSheriffElection(
  seats: PlayerSeat[],
  candidateSeats: number[],
): SheriffState {
  const uniqueCandidates = Array.from(new Set(candidateSeats)).sort((a, b) => a - b);

  for (const seatNumber of uniqueCandidates) {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    if (!seat || !seat.isAlive) {
      throw new Error(`上警座位 ${seatNumber} 號不存在或已出局`);
    }
  }

  const base = createInitialSheriffState();

  if (uniqueCandidates.length === 0) {
    return {
      ...base,
      status: 'no_sheriff',
      badgeStatus: 'none',
    };
  }

  if (uniqueCandidates.length === 1) {
    return {
      ...base,
      status: 'elected',
      sheriffSeat: uniqueCandidates[0],
      badgeStatus: 'active',
      candidates: uniqueCandidates,
    };
  }

  return {
    ...base,
    status: 'speaking',
    candidates: uniqueCandidates,
  };
}

/**
 * 記錄上警候選人退水：
 * - 退水者移入 withdrawnSeats，失去警下投票權。
 * - 若退水後僅餘 1 名候選人，自動當選警長；若 0 名候選人，進入無警長狀態。
 */
export function withdrawSheriffCandidate(
  state: SheriffState,
  seatNumber: number,
): SheriffState {
  if (!isSheriffElectionActive(state)) {
    throw new Error('目前不在警長競選階段，無法退水');
  }
  if (!state.candidates.includes(seatNumber)) {
    throw new Error(`${seatNumber} 號目前不在上警候選名單中`);
  }

  const remainingCandidates = state.candidates.filter((s) => s !== seatNumber);
  const nextWithdrawn = Array.from(new Set([...state.withdrawnSeats, seatNumber])).sort(
    (a, b) => a - b,
  );
  const nextPkCandidates = state.pkCandidates.filter((s) => s !== seatNumber);

  if (remainingCandidates.length === 0) {
    return {
      ...state,
      status: 'no_sheriff',
      sheriffSeat: null,
      badgeStatus: 'none',
      candidates: [],
      withdrawnSeats: nextWithdrawn,
      pkCandidates: [],
    };
  }

  if (remainingCandidates.length === 1) {
    return {
      ...state,
      status: 'elected',
      sheriffSeat: remainingCandidates[0],
      badgeStatus: 'active',
      candidates: remainingCandidates,
      withdrawnSeats: nextWithdrawn,
      pkCandidates: [],
    };
  }

  return {
    ...state,
    candidates: remainingCandidates,
    withdrawnSeats: nextWithdrawn,
    pkCandidates: nextPkCandidates,
  };
}

/**
 * 取得具警下投票權之座位清單：存活且未曾上警（排除目前候選人與已退水玩家）。
 */
export function getEligibleSheriffVoters(
  state: SheriffState,
  seats: PlayerSeat[],
): number[] {
  const excluded = new Set([...state.candidates, ...state.withdrawnSeats]);
  return seats
    .filter((seat) => seat.isAlive && !excluded.has(seat.seatNumber))
    .map((seat) => seat.seatNumber)
    .sort((a, b) => a - b);
}

export interface SheriffVoteResolution {
  sheriffState: SheriffState;
  record: VoteRoundRecord;
  outcome: 'elected' | 'pk' | 'no_sheriff';
}

/**
 * 結算一輪警下投票（含首次投票與平票 PK 投票）。
 */
export function resolveSheriffVoteRound(
  state: SheriffState,
  seats: PlayerSeat[],
  votes: Record<number, number | null>,
): SheriffVoteResolution {
  if (!isSheriffElectionActive(state)) {
    throw new Error('目前不在警長競選階段，無法進行警下投票');
  }

  const eligibleVoters = new Set(getEligibleSheriffVoters(state, seats));
  const isPkRound = state.pkCandidates.length > 0;
  const validTargets = isPkRound ? state.pkCandidates : state.candidates;
  const validTargetSet = new Set(validTargets);

  const totals: Record<number, number> = {};
  const votersByTarget: Record<number, number[]> = {};
  for (const target of validTargets) {
    totals[target] = 0;
    votersByTarget[target] = [];
  }
  const abstainers: number[] = [];

  for (const [voterKey, targetSeat] of Object.entries(votes)) {
    const voterSeat = Number(voterKey);
    if (!eligibleVoters.has(voterSeat)) {
      throw new Error(`${voterSeat} 號不具警下投票權（可能已出局、為上警候選人或已退水）`);
    }
    if (targetSeat === null) {
      abstainers.push(voterSeat);
      continue;
    }
    if (!validTargetSet.has(targetSeat)) {
      throw new Error(`投票目標 ${targetSeat} 號不是本輪有效警長候選人`);
    }
    totals[targetSeat] = (totals[targetSeat] ?? 0) + 1;
    votersByTarget[targetSeat] = [...(votersByTarget[targetSeat] ?? []), voterSeat];
  }

  abstainers.sort((a, b) => a - b);
  for (const key of Object.keys(votersByTarget)) {
    votersByTarget[Number(key)].sort((a, b) => a - b);
  }

  const maxVotes = Object.values(totals).reduce((max, count) => Math.max(max, count), 0);
  const topSeats =
    maxVotes > 0
      ? Object.entries(totals)
          .filter(([, count]) => count === maxVotes)
          .map(([seat]) => Number(seat))
          .sort((a, b) => a - b)
      : [];

  const roundIndex = state.voteRounds.length + 1;
  const record: VoteRoundRecord = {
    roundIndex,
    votes: { ...votes },
    totals,
    votersByTarget,
    abstainers,
    tiedSeats: topSeats.length > 1 ? topSeats : [],
    electedSeat: topSeats.length === 1 ? topSeats[0] : null,
  };

  const nextVoteRounds = [...state.voteRounds, record];

  if (maxVotes === 0) {
    return {
      outcome: 'no_sheriff',
      record,
      sheriffState: {
        ...state,
        status: 'no_sheriff',
        sheriffSeat: null,
        badgeStatus: 'none',
        pkCandidates: [],
        voteRounds: nextVoteRounds,
      },
    };
  }

  if (topSeats.length === 1) {
    return {
      outcome: 'elected',
      record,
      sheriffState: {
        ...state,
        status: 'elected',
        sheriffSeat: topSeats[0],
        badgeStatus: 'active',
        pkCandidates: [],
        voteRounds: nextVoteRounds,
      },
    };
  }

  // 平票：若已在 PK 輪再次平票，則警徽流失（本局無警長）；否則進入 PK
  if (isPkRound) {
    return {
      outcome: 'no_sheriff',
      record,
      sheriffState: {
        ...state,
        status: 'no_sheriff',
        sheriffSeat: null,
        badgeStatus: 'none',
        pkCandidates: [],
        voteRounds: nextVoteRounds,
      },
    };
  }

  return {
    outcome: 'pk',
    record,
    sheriffState: {
      ...state,
      status: 'pk_speaking',
      pkCandidates: topSeats,
      voteRounds: nextVoteRounds,
    },
  };
}

/**
 * 警上階段發生狼人自爆：自動判定吞警徽（本局無警長）。
 */
export function swallowSheriffBadge(state: SheriffState): SheriffState {
  return {
    ...state,
    status: 'swallowed',
    sheriffSeat: null,
    badgeStatus: 'swallowed',
    pkCandidates: [],
    pendingBadgeTransferFrom: null,
  };
}

/**
 * 檢查現任警長是否已出局；若出局且警徽仍有效，標記待移交／撕毀狀態。
 */
export function syncSheriffBadgeOnDeaths(
  state: SheriffState,
  seats: PlayerSeat[],
): SheriffState {
  if (state.badgeStatus !== 'active' || state.sheriffSeat === null) {
    return state;
  }
  const sheriff = seats.find((seat) => seat.seatNumber === state.sheriffSeat);
  if (sheriff && !sheriff.isAlive && state.pendingBadgeTransferFrom === null) {
    return {
      ...state,
      pendingBadgeTransferFrom: state.sheriffSeat,
    };
  }
  return state;
}

/**
 * 警長出局後移交警徽給指定存活玩家。
 */
export function transferSheriffBadge(
  state: SheriffState,
  seats: PlayerSeat[],
  targetSeat: number,
): SheriffState {
  if (state.badgeStatus !== 'active' || state.sheriffSeat === null) {
    throw new Error('目前場上沒有有效警徽可移交');
  }
  if (targetSeat === state.sheriffSeat) {
    throw new Error('不可將警徽移交給原警長自己');
  }
  const target = seats.find((seat) => seat.seatNumber === targetSeat);
  if (!target || !target.isAlive) {
    throw new Error(`移交目標 ${targetSeat} 號不存在或已出局`);
  }

  return {
    ...state,
    status: 'elected',
    sheriffSeat: targetSeat,
    badgeStatus: 'active',
    pendingBadgeTransferFrom: null,
  };
}

/**
 * 警長出局後撕毀警徽。
 */
export function destroySheriffBadge(state: SheriffState): SheriffState {
  if (state.badgeStatus !== 'active') {
    throw new Error('目前場上沒有有效警徽可撕毀');
  }

  return {
    ...state,
    sheriffSeat: null,
    badgeStatus: 'destroyed',
    pendingBadgeTransferFrom: null,
  };
}
