import { describe, expect, it } from 'vitest';
import {
  createInitialSeats,
  destroySheriffBadge,
  getEligibleExileVoters,
  getEligibleSheriffVoters,
  handleSheriffElectionExplode,
  isSheriffElectionActive,
  resolveSheriffVoteRound,
  resumeDeferredSheriffElection,
  startSheriffElection,
  swallowSheriffBadge,
  syncSheriffBadgeOnDeaths,
  tallyExileVotes,
  toggleVoterForCandidate,
  transferSheriffBadge,
  votesByCandidateToByVoter,
  votesByVoterToByCandidate,
  withdrawSheriffCandidate,
} from './index';
import type { PlayerSeat } from './types';

function make12Seats(): PlayerSeat[] {
  const roles = [
    'wolf',
    'wolf',
    'wolf',
    'wolf',
    'villager',
    'villager',
    'villager',
    'villager',
    'seer',
    'witch',
    'hunter',
    'idiot',
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('白天完整行為與投票紀錄系統（警長競選／吞警徽／放逐計票）', () => {
  it('警長競選：上警、退水（失警下投票權）、平票 PK 與最終當選', () => {
    const seats = make12Seats();

    // 1、5、9 號上警
    let sheriff = startSheriffElection(seats, [9, 1, 5]);
    expect(isSheriffElectionActive(sheriff)).toBe(true);
    expect(sheriff.candidates).toEqual([1, 5, 9]);

    // 5 號退水 -> 失去警下投票權
    sheriff = withdrawSheriffCandidate(sheriff, 5);
    expect(sheriff.candidates).toEqual([1, 9]);
    expect(sheriff.withdrawnSeats).toEqual([5]);
    const voters = getEligibleSheriffVoters(sheriff, seats);
    expect(voters).not.toContain(1);
    expect(voters).not.toContain(5);
    expect(voters).not.toContain(9);
    expect(voters).toHaveLength(9);

    // 退水者若嘗試投票應被阻擋
    expect(() => resolveSheriffVoteRound(sheriff, seats, { 5: 9 })).toThrow(/不具警下投票權/);

    // 第一輪警下投票：1 號與 9 號 4:4 平票，12 號棄票 -> 進入 PK
    const round1 = resolveSheriffVoteRound(sheriff, seats, {
      2: 1,
      3: 1,
      4: 1,
      6: 1,
      7: 9,
      8: 9,
      10: 9,
      11: 9,
      12: null,
    });
    expect(round1.outcome).toBe('pk');
    expect(round1.record.tiedSeats).toEqual([1, 9]);
    expect(round1.record.abstainers).toEqual([12]);
    expect(round1.sheriffState.pkCandidates).toEqual([1, 9]);

    // PK 輪投票：9 號 5:4 勝出當選警長
    const round2 = resolveSheriffVoteRound(round1.sheriffState, seats, {
      2: 1,
      3: 1,
      4: 1,
      6: 1,
      7: 9,
      8: 9,
      10: 9,
      11: 9,
      12: 9,
    });
    expect(round2.outcome).toBe('elected');
    expect(round2.sheriffState.sheriffSeat).toBe(9);
    expect(round2.sheriffState.badgeStatus).toBe('active');
    expect(round2.sheriffState.voteRounds).toHaveLength(2);
  });

  it('警長競選：退水到僅餘 1 人自動當選；警上自爆吞警徽；警長出局移交與撕毀警徽', () => {
    const seats = make12Seats();

    // 僅餘 1 人留警自動當選
    let sheriff = startSheriffElection(seats, [1, 9]);
    sheriff = withdrawSheriffCandidate(sheriff, 1);
    expect(sheriff.status).toBe('elected');
    expect(sheriff.sheriffSeat).toBe(9);

    // 模擬警長 9 號出局 -> 待移交狀態
    const seatsAfterDeath = seats.map((s) =>
      s.seatNumber === 9 ? { ...s, isAlive: false } : s,
    );
    sheriff = syncSheriffBadgeOnDeaths(sheriff, seatsAfterDeath);
    expect(sheriff.pendingBadgeTransferFrom).toBe(9);

    // 移交警徽給 10 號
    sheriff = transferSheriffBadge(sheriff, seatsAfterDeath, 10);
    expect(sheriff.sheriffSeat).toBe(10);
    expect(sheriff.pendingBadgeTransferFrom).toBeNull();
    expect(sheriff.badgeStatus).toBe('active');

    // 撕毀警徽
    const destroyed = destroySheriffBadge(sheriff);
    expect(destroyed.sheriffSeat).toBeNull();
    expect(destroyed.badgeStatus).toBe('destroyed');

    // 警上階段吞警徽
    const activeElection = startSheriffElection(seats, [1, 5, 9]);
    const swallowed = swallowSheriffBadge(activeElection);
    expect(swallowed.status).toBe('swallowed');
    expect(swallowed.badgeStatus).toBe('swallowed');
    expect(swallowed.sheriffSeat).toBeNull();
  });

  it('放逐投票明細：自動排除已翻牌白痴、套用警長 1.5 票與烏鴉額外 +1 票接口', () => {
    // 12 號為已翻牌免死的白痴（失去投票權），9 號為警長
    const seats = make12Seats().map((seat) =>
      seat.seatNumber === 12 ? { ...seat, statuses: { ...seat.statuses, idiotRevealed: true } } : seat,
    );

    const eligible = getEligibleExileVoters(seats);
    expect(eligible).not.toContain(12);
    expect(eligible).toHaveLength(11);

    // 若已翻牌白痴嘗試投票應報錯
    expect(() =>
      tallyExileVotes({
        seats,
        votes: { 12: 1 },
      }),
    ).toThrow(/已翻牌免死/);

    // 警長 9 號投 1 號（1.5 票），另 1 人投 1 號（共 2.5 票）；
    // 2 號獲 2 票 + 烏鴉額外 +1 票（共 3 票）-> 2 號最高票放逐
    const tally = tallyExileVotes({
      seats,
      sheriffSeat: 9,
      votes: {
        9: 1,
        10: 1,
        5: 2,
        6: 2,
        7: null,
      },
      extraVotes: { 2: 1 },
    });

    expect(tally.outcome).toBe('exile');
    expect(tally.record.totals[1]).toBe(2.5);
    expect(tally.record.totals[2]).toBe(3);
    expect(tally.record.extraVotes).toEqual({ 2: 1 });
    expect(tally.record.electedSeat).toBe(2);
    expect(tally.record.abstainers).toEqual([7]);
  });

  it('放逐投票：平票進入 PK、PK 輪限定候選人、二次平票平安日', () => {
    const seats = make12Seats();

    const round1 = tallyExileVotes({
      seats,
      votes: { 5: 1, 6: 1, 7: 2, 8: 2 },
      roundIndex: 1,
    });
    expect(round1.outcome).toBe('tie');
    expect(round1.record.tiedSeats).toEqual([1, 2]);

    // PK 輪不可投給非 PK 候選人
    expect(() =>
      tallyExileVotes({
        seats,
        votes: { 5: 3 },
        pkCandidates: [1, 2],
        roundIndex: 2,
      }),
    ).toThrow(/PK 名單/);

    // PK 輪再次平票 -> 平安日（no_exile）
    const round2 = tallyExileVotes({
      seats,
      votes: { 5: 1, 6: 2 },
      pkCandidates: [1, 2],
      roundIndex: 2,
    });
    expect(round2.outcome).toBe('no_exile');
    expect(round2.record.electedSeat).toBeNull();
  });

  it('單爆／雙爆吞警徽狀態機：首爆延後至隔日直進投票、二爆正式吞警徽', () => {
    const seats = make12Seats();

    // 單爆吞警徽：首爆即吞
    const singleStart = startSheriffElection(seats, [1, 2, 9]);
    const singleExplode = handleSheriffElectionExplode(singleStart, 'single_explode');
    expect(singleExplode.swallowed).toBe(true);
    expect(singleExplode.deferred).toBe(false);
    expect(singleExplode.sheriffState.status).toBe('swallowed');
    expect(singleExplode.sheriffState.badgeStatus).toBe('swallowed');
    expect(singleExplode.sheriffState.explodeCountDuringElection).toBe(1);

    // 雙爆吞警徽：第 1 次自爆 -> deferred_after_first_explode
    const doubleStart = startSheriffElection(seats, [1, 2, 9, 10]);
    const firstExplode = handleSheriffElectionExplode(doubleStart, 'double_explode');
    expect(firstExplode.swallowed).toBe(false);
    expect(firstExplode.deferred).toBe(true);
    expect(firstExplode.sheriffState.status).toBe('deferred_after_first_explode');
    expect(firstExplode.sheriffState.explodeCountDuringElection).toBe(1);

    // 隔天天亮：1 號自爆狼已出局，候選人自動縮減為 [2, 9, 10]，直接跳過發言進入 voting
    const nextDaySeats = seats.map((s) => (s.seatNumber === 1 ? { ...s, isAlive: false } : s));
    const resumed = resumeDeferredSheriffElection(firstExplode.sheriffState, nextDaySeats);
    expect(resumed.resumed).toBe(true);
    expect(resumed.outcome).toBe('voting');
    expect(resumed.sheriffState.status).toBe('voting');
    expect(resumed.sheriffState.candidates).toEqual([2, 9, 10]);

    // 隔天於 voting 階段再發生第 2 次自爆 -> 正式吞警徽
    const secondExplode = handleSheriffElectionExplode(resumed.sheriffState, 'double_explode');
    expect(secondExplode.swallowed).toBe(true);
    expect(secondExplode.deferred).toBe(false);
    expect(secondExplode.sheriffState.status).toBe('swallowed');
    expect(secondExplode.sheriffState.badgeStatus).toBe('swallowed');
    expect(secondExplode.sheriffState.explodeCountDuringElection).toBe(2);

    // 邊界：隔天天亮僅餘 1 名存活候選人 -> 自動當選警長
    const onlyOneAliveSeats = seats.map((s) =>
      [1, 2, 10].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    const autoElected = resumeDeferredSheriffElection(firstExplode.sheriffState, onlyOneAliveSeats);
    expect(autoElected.outcome).toBe('elected');
    expect(autoElected.sheriffState.status).toBe('elected');
    expect(autoElected.sheriffState.sheriffSeat).toBe(9);
  });

  it('中央雙模式投票等價性：逐人記錄（by_voter）與依候選人唱票（by_candidate）產出完全一致的計票結果', () => {
    const seats = make12Seats();
    // 12 號白痴已翻牌（自動排除投票權），9 號為警長（1.5 票）
    seats[11].statuses.idiotRevealed = true;
    const eligibleVoters = getEligibleExileVoters(seats);
    const candidateSeats = seats.filter((s) => s.isAlive).map((s) => s.seatNumber);

    // 方式一：逐人記錄
    const byVoterVotes: Record<number, number | null> = {
      1: 9,
      2: null,
      3: 1,
      4: 9,
      5: 1,
      6: 1,
      7: null,
      8: 1,
      9: 1, // 警長 1.5 票
      10: 9,
      11: 1,
    };

    // 方式二：透過 toggleVoterForCandidate 依候選人勾選建構相同票型
    let toggledDraft: Record<number, number | null> = {};
    for (const v of eligibleVoters) toggledDraft[v] = null;
    for (const voter of [3, 5, 6, 8, 9, 11]) {
      toggledDraft = toggleVoterForCandidate(toggledDraft, 1, voter);
    }
    for (const voter of [1, 4, 10]) {
      toggledDraft = toggleVoterForCandidate(toggledDraft, 9, voter);
    }
    // 額外測試取消勾選再改投（7 號先投 9 號再取消變棄票）
    toggledDraft = toggleVoterForCandidate(toggledDraft, 9, 7);
    toggledDraft = toggleVoterForCandidate(toggledDraft, 9, 7);

    // 雙向轉換驗證
    const grouped = votesByVoterToByCandidate(byVoterVotes, candidateSeats);
    expect(grouped[1]).toEqual([3, 5, 6, 8, 9, 11]);
    expect(grouped[9]).toEqual([1, 4, 10]);

    const convertedBack = votesByCandidateToByVoter(
      { ...grouped, 1: [...grouped[1], 12] }, // 刻意混入無投票權的 12 號白痴，應自動排除
      eligibleVoters,
    );
    expect(convertedBack).toEqual(byVoterVotes);
    expect(toggledDraft).toEqual(byVoterVotes);

    const tallyByVoter = tallyExileVotes({
      seats,
      votes: byVoterVotes,
      sheriffSeat: 9,
      extraVotes: { 9: 1 }, // 烏鴉 +1 票
    });
    const tallyByCandidate = tallyExileVotes({
      seats,
      votes: convertedBack,
      sheriffSeat: 9,
      extraVotes: { 9: 1 },
    });

    expect(tallyByCandidate).toEqual(tallyByVoter);
    expect(tallyByCandidate.outcome).toBe('exile');
    expect(tallyByCandidate.record.electedSeat).toBe(1);
    expect(tallyByCandidate.record.totals[1]).toBe(6.5);
    expect(tallyByCandidate.record.totals[9]).toBe(4);
    expect(tallyByCandidate.record.abstainers).toEqual([2, 7]);
  });
});
