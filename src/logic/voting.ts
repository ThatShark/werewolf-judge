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
}

function roundVoteScore(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 取得白天放逐投票具投票權的座位清單：
 * 所有存活玩家，自動排除「已翻牌免死之白痴」。
 */
export function getEligibleExileVoters(seats: PlayerSeat[]): number[] {
  return seats
    .filter((seat) => seat.isAlive && !(seat.roleId === 'idiot' && seat.idiotRevealed))
    .map((seat) => seat.seatNumber)
    .sort((a, b) => a - b);
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
  } = input;

  const eligibleVoters = new Set(getEligibleExileVoters(seats));
  const aliveSeatSet = new Set(seats.filter((s) => s.isAlive).map((s) => s.seatNumber));
  const pkSet = pkCandidates.length > 0 ? new Set(pkCandidates) : null;

  const totals: Record<number, number> = {};
  const votersByTarget: Record<number, number[]> = {};
  const abstainers: number[] = [];

  for (const [voterKey, targetSeat] of Object.entries(votes)) {
    const voterSeat = Number(voterKey);
    if (!eligibleVoters.has(voterSeat)) {
      const seatObj = seats.find((s) => s.seatNumber === voterSeat);
      if (seatObj?.roleId === 'idiot' && seatObj.idiotRevealed) {
        throw new Error(`${voterSeat} 號（白痴）已翻牌免死，失去放逐投票權`);
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

    const weight = sheriffSeat !== null && voterSeat === sheriffSeat ? sheriffVoteWeight : 1;
    totals[targetSeat] = roundVoteScore((totals[targetSeat] ?? 0) + weight);
    votersByTarget[targetSeat] = [...(votersByTarget[targetSeat] ?? []), voterSeat];
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
