import type { ExileVoteTallyResult, PlayerSeat, VoteRoundRecord } from './types';

export interface TallyExileVotesInput {
  seats: PlayerSeat[];
  /** voterSeat -> targetSeat | null（棄票） */
  votes: Record<number, number | null>;
  /** 當前持有有效警徽的警長座位（存活時套用警長歸票權重） */
  sheriffSeat?: number | null;
  /** 警長歸票權重，預設 1.5 票 */
  sheriffVoteWeight?: number;
  /** 預留額外票數接口（如烏鴉詛咒目標額外 +1 票） */
  extraVotes?: Record<number, number>;
  /** 若為平票 PK 輪，限定僅能投給 PK 名單中的座位 */
  pkCandidates?: number[];
  /** 第幾輪投票（1=首輪，2+=PK 輪） */
  roundIndex?: number;
  /** 詭術師昨晚交換之兩位玩家號碼（隔天白天放逐票數對調） */
  tricksterVoteSwap?: [number, number] | null;
  /** 槓精白天開槓過半後，本輪失去放逐投票權之座號 */
  silencedVoterSeat?: number | null;
  /** 管家上茶給平民：當天放逐投票 +1 票權 */
  butlerVoteBonusSeat?: number | null;
  /** 狼僕上茶給平民：當天放逐投票 -1 票權（警長餘 0.5 票） */
  wolfMaidVotePenaltySeat?: number | null;
}

function roundVoteScore(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 取得白天放逐投票具投票權的座位清單：
 * 所有存活玩家，自動排除「已翻牌免死之白痴」、「遭梅杜莎石化之玩家」，
 * 以及「平票 PK 輪中進入 PK 的候選人（pkCandidates）」。
 */
export function getEligibleExileVoters(
  seats: PlayerSeat[],
  pkCandidates: number[] = [],
  silencedVoterSeat: number | null = null,
): number[] {
  const pkSet = pkCandidates.length > 0 ? new Set(pkCandidates) : null;
  return seats
    .filter(
      (seat) =>
        seat.isAlive &&
        !((seat.roleId === 'idiot' || seat.roleId === 'awakened_idiot') && seat.statuses.idiotRevealed) &&
        !seat.statuses.petrified &&
        seat.seatNumber !== silencedVoterSeat &&
        (!pkSet || !pkSet.has(seat.seatNumber)),
    )
    .map((seat) => seat.seatNumber)
    .sort((a, b) => a - b);
}

/**
 * 計算放逐平票 PK 發言順序：
 * 嚴格依「當天白天發言順序的逆序」排列平票候選人；
 * 若尚未記錄當天發言順序，則依平票座號降序作為安全後備。
 */
export function getExilePkSpeakingOrder(
  daySpeakingOrder: number[] | undefined,
  pkCandidates: number[],
): number[] {
  if (pkCandidates.length === 0) return [];
  const pkSet = new Set(pkCandidates);
  if (daySpeakingOrder && daySpeakingOrder.length > 0) {
    const filtered = daySpeakingOrder.filter((seat) => pkSet.has(seat));
    const missing = pkCandidates.filter((seat) => !filtered.includes(seat)).sort((a, b) => a - b);
    return [...filtered, ...missing].reverse();
  }
  return [...pkCandidates].sort((a, b) => b - a);
}

/**
 * 統計白天放逐投票明細與自動計票：
 * - 自動排除已翻牌無投票權之白痴（若誤傳則拋錯阻擋）。
 * - 支援警長 1.5 票權重與烏鴉額外 +1 票（extraVotes）接口。
 * - 自動判定唯一最高票放逐（exile）、平票進入 PK（tie）或平安日（no_exile）。
 */
export function tallyExileVotes(input: TallyExileVotesInput): ExileVoteTallyResult {
  const {
    seats,
    votes,
    sheriffSeat = null,
    sheriffVoteWeight = 1.5,
    extraVotes = {},
    pkCandidates = [],
    roundIndex = 1,
    tricksterVoteSwap = null,
    silencedVoterSeat = null,
    butlerVoteBonusSeat = null,
    wolfMaidVotePenaltySeat = null,
  } = input;

  const eligibleVoters = new Set(getEligibleExileVoters(seats, pkCandidates, silencedVoterSeat));
  const aliveSeatSet = new Set(seats.filter((s) => s.isAlive).map((s) => s.seatNumber));
  const pkSet = pkCandidates.length > 0 ? new Set(pkCandidates) : null;

  const totals: Record<number, number> = {};
  const votersByTarget: Record<number, number[]> = {};
  const abstainers: number[] = [];

  for (const [voterKey, targetSeat] of Object.entries(votes)) {
    const voterSeat = Number(voterKey);
    if (!eligibleVoters.has(voterSeat)) {
      if (pkSet && pkSet.has(voterSeat)) {
        throw new Error(`${voterSeat} 號為本輪平票 PK 候選人，PK 投票階段禁止投票`);
      }
      if (silencedVoterSeat !== null && voterSeat === silencedVoterSeat) {
        throw new Error(`${voterSeat} 號遭槓精開槓奪票，本輪無法投票`);
      }
      const seatObj = seats.find((s) => s.seatNumber === voterSeat);
      if ((seatObj?.roleId === 'idiot' || seatObj?.roleId === 'awakened_idiot') && seatObj.statuses.idiotRevealed) {
        throw new Error(`${voterSeat} 號（白痴）已翻牌免死，失去放逐投票權`);
      }
      if (seatObj?.statuses.petrified) {
        throw new Error(`${voterSeat} 號遭梅杜莎石化，本輪無法投票`);
      }
      throw new Error(`${voterSeat} 號不具放逐投票權（不存在或已出局）`);
    }

    if (targetSeat === null) {
      abstainers.push(voterSeat);
      continue;
    }

    if (!aliveSeatSet.has(targetSeat)) {
      throw new Error(`放逐投票目標 ${targetSeat} 號不存在或已出局`);
    }
    if (pkSet && !pkSet.has(targetSeat)) {
      throw new Error(`平票 PK 輪僅能投票給 PK 名單中的玩家（${pkCandidates.join('、')} 號）`);
    }

    let weight = sheriffSeat !== null && voterSeat === sheriffSeat ? sheriffVoteWeight : 1;
    if (butlerVoteBonusSeat !== null && voterSeat === butlerVoteBonusSeat) {
      weight += 1;
    }
    if (wolfMaidVotePenaltySeat !== null && voterSeat === wolfMaidVotePenaltySeat) {
      weight = Math.max(0, weight - 1);
    }
    if (weight > 0) {
      totals[targetSeat] = roundVoteScore((totals[targetSeat] ?? 0) + weight);
      votersByTarget[targetSeat] = [...(votersByTarget[targetSeat] ?? []), voterSeat];
    } else {
      abstainers.push(voterSeat);
    }
  }

  // 疊加額外票數（例如烏鴉詛咒 +1 票）
  const normalizedExtraVotes: Record<number, number> = {};
  for (const [targetKey, bonus] of Object.entries(extraVotes)) {
    if (!bonus || bonus <= 0) continue;
    const targetSeat = Number(targetKey);
    if (!aliveSeatSet.has(targetSeat)) continue;
    if (pkSet && !pkSet.has(targetSeat)) continue;

    normalizedExtraVotes[targetSeat] = roundVoteScore(bonus);
    totals[targetSeat] = roundVoteScore((totals[targetSeat] ?? 0) + bonus);
    if (!votersByTarget[targetSeat]) {
      votersByTarget[targetSeat] = [];
    }
  }

  // 詭術師隔天白天票數對調（僅當兩位玩家皆存活且在投票候選內時對調其總票數與得票來源）
  if (tricksterVoteSwap) {
    const [seatA, seatB] = tricksterVoteSwap;
    const bothValid =
      aliveSeatSet.has(seatA) &&
      aliveSeatSet.has(seatB) &&
      (!pkSet || (pkSet.has(seatA) && pkSet.has(seatB)));
    if (bothValid) {
      const scoreA = totals[seatA] ?? 0;
      const scoreB = totals[seatB] ?? 0;
      const votersA = votersByTarget[seatA] ?? [];
      const votersB = votersByTarget[seatB] ?? [];
      if (scoreA > 0 || scoreB > 0) {
        if (scoreB > 0) {
          totals[seatA] = scoreB;
          votersByTarget[seatA] = votersB;
        } else {
          delete totals[seatA];
          delete votersByTarget[seatA];
        }
        if (scoreA > 0) {
          totals[seatB] = scoreA;
          votersByTarget[seatB] = votersA;
        } else {
          delete totals[seatB];
          delete votersByTarget[seatB];
        }
      }
    }
  }

  abstainers.sort((a, b) => a - b);
  for (const key of Object.keys(votersByTarget)) {
    votersByTarget[Number(key)].sort((a, b) => a - b);
  }

  const maxVotes = Object.values(totals).reduce((max, score) => Math.max(max, score), 0);
  const topSeats =
    maxVotes > 0
      ? Object.entries(totals)
          .filter(([, score]) => score === maxVotes)
          .map(([seat]) => Number(seat))
          .sort((a, b) => a - b)
      : [];

  const record: VoteRoundRecord = {
    roundIndex,
    votes: { ...votes },
    totals,
    votersByTarget,
    abstainers,
    ...(Object.keys(normalizedExtraVotes).length > 0 ? { extraVotes: normalizedExtraVotes } : {}),
    tiedSeats: topSeats.length > 1 ? topSeats : [],
    electedSeat: topSeats.length === 1 ? topSeats[0] : null,
  };

  if (maxVotes === 0) {
    return { outcome: 'no_exile', record };
  }
  if (topSeats.length === 1) {
    return { outcome: 'exile', record };
  }
  if (roundIndex >= 2) {
    return { outcome: 'no_exile', record };
  }
  return { outcome: 'tie', record };
}

/**
 * 將「方式一：逐人記錄（voter -> target | null）」轉換為「方式二：依候選人分組（candidate -> voter[]）」。
 */
export function votesByVoterToByCandidate(
  votes: Record<number, number | null>,
  candidateSeats: number[],
): Record<number, number[]> {
  const result: Record<number, number[]> = {};
  const validCandidates = new Set(candidateSeats);

  for (const cand of candidateSeats) {
    result[cand] = [];
  }

  for (const [voterKey, targetSeat] of Object.entries(votes)) {
    if (targetSeat === null || !validCandidates.has(targetSeat)) continue;
    const voterSeat = Number(voterKey);
    result[targetSeat] = [...(result[targetSeat] ?? []), voterSeat];
  }

  for (const cand of candidateSeats) {
    result[cand].sort((a, b) => a - b);
  }

  return result;
}

/**
 * 將「方式二：依候選人唱票勾選（candidate -> voter[]）」轉換為標準「方式一：逐人記錄（voter -> target | null）」。
 * - 僅保留 eligibleVoters 中的具投票權玩家（自動排除翻牌白痴或出局者）。
 * - 未出現在任何候選人清單中的投票者自動記為 null（棄票）。
 */
export function votesByCandidateToByVoter(
  votersByCandidate: Record<number, number[]>,
  eligibleVoters: number[],
): Record<number, number | null> {
  const eligibleSet = new Set(eligibleVoters);
  const result: Record<number, number | null> = {};

  for (const voter of eligibleVoters) {
    result[voter] = null;
  }

  const sortedCandidates = Object.keys(votersByCandidate)
    .map(Number)
    .sort((a, b) => a - b);

  for (const candidateSeat of sortedCandidates) {
    const voters = votersByCandidate[candidateSeat] ?? [];
    for (const voterSeat of voters) {
      if (!eligibleSet.has(voterSeat)) continue;
      result[voterSeat] = candidateSeat;
    }
  }

  return result;
}

/**
 * 在「方式二：依候選人唱票勾選」模式中，切換某位投票者對指定候選人的投票狀態：
 * - 若該投票者目前已投給 candidateSeat，則取消為 null（棄票）。
 * - 否則將該投票者改投給 candidateSeat（自動移出原先可能勾選的其他候選人）。
 */
export function toggleVoterForCandidate(
  votes: Record<number, number | null>,
  candidateSeat: number,
  voterSeat: number,
): Record<number, number | null> {
  const currentlyPicked = votes[voterSeat] === candidateSeat;
  return {
    ...votes,
    [voterSeat]: currentlyPicked ? null : candidateSeat,
  };
}

/**
 * 「全票」快捷指定：除候選人自己外，場上所有具投票權玩家全數投給該候選人（候選人本人記為 null）。
 */
export function assignAllVotesToCandidate(
  eligibleVoters: number[],
  candidateSeat: number,
): Record<number, number | null> {
  const result: Record<number, number | null> = {};
  for (const voterSeat of eligibleVoters) {
    result[voterSeat] = voterSeat === candidateSeat ? null : candidateSeat;
  }
  return result;
}

/**
 * 「全取消」快捷清除：一鍵清空目前投給 candidateSeat 的所有投票（轉為 null 棄票），
 * 保留投給其他候選人的票。
 */
export function clearVotesForCandidate(
  votes: Record<number, number | null>,
  candidateSeat: number,
): Record<number, number | null> {
  const result: Record<number, number | null> = { ...votes };
  for (const [voterKey, target] of Object.entries(result)) {
    if (target === candidateSeat) {
      result[Number(voterKey)] = null;
    }
  }
  return result;
}
