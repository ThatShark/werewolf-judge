import { describe, expect, it } from 'vitest';
import {
  createInitialSeats,
  destroySheriffBadge,
  getEligibleExileVoters,
  getEligibleSheriffVoters,
  isSheriffElectionActive,
  resolveSheriffVoteRound,
  startSheriffElection,
  swallowSheriffBadge,
  syncSheriffBadgeOnDeaths,
  tallyExileVotes,
  transferSheriffBadge,
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
      seat.seatNumber === 12 ? { ...seat, idiotRevealed: true } : seat,
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
});
