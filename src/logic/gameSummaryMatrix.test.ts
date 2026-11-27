import { describe, expect, it } from 'vitest';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_RULE_OVERRIDES,
  buildGameSummaryMatrix,
  buildSummaryImageFilename,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSheriffState,
  resolveSheriffVoteRound,
  startSheriffElection,
  tallyExileVotes,
  withdrawSheriffCandidate,
} from './index';
import type { DayHistoryEntry, NightHistoryEntry, PlayerSeat } from './types';

function makeSeat(
  seatNumber: number,
  roleId: string,
  overrides: Partial<PlayerSeat> = {},
): PlayerSeat {
  return {
    seatNumber,
    nickname: overrides.nickname ?? '',
    roleId,
    isAlive: overrides.isAlive ?? true,
    deathReason: overrides.deathReason,
    deathRound: overrides.deathRound,
    secondRoleId: overrides.secondRoleId ?? null,
    statuses: { ...(overrides.statuses ?? {}) },
  };
}

describe('buildGameSummaryMatrix', () => {
  it('正確提取警長上警、退水、首輪投票、PK 投票、當選警徽與隱藏無警長局', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'seer', { nickname: '小明' }),
      makeSeat(2, 'witch'),
      makeSeat(3, 'guard'),
      makeSeat(4, 'hunter'),
      makeSeat(5, 'wolf'),
      makeSeat(6, 'wolf'),
      makeSeat(7, 'villager'),
      makeSeat(8, 'villager'),
    ];

    // 1、2、5 上警，2 號退水
    let sheriff = startSheriffElection(seats, [1, 2, 5]);
    sheriff = withdrawSheriffCandidate(sheriff, 2);

    // 首輪警下投票：3,4 投 1；6,7 投 5；8 棄票 → 1、5 平票進 PK
    const r1 = resolveSheriffVoteRound(sheriff, seats, {
      3: 1,
      4: 1,
      6: 5,
      7: 5,
      8: null,
    });
    expect(r1.outcome).toBe('pk');
    expect(r1.record.eligibleVoters).toEqual([3, 4, 6, 7, 8]);

    // PK 投票：2 號退水恢復投票權投 1，3,4 投 1，6 投 5，7,8 棄票 → 1 號當選警長
    const r2 = resolveSheriffVoteRound(r1.sheriffState, seats, {
      2: 1,
      3: 1,
      4: 1,
      6: 5,
      7: null,
      8: null,
    });
    expect(r2.outcome).toBe('elected');
    expect(r2.sheriffState.initialCandidates).toEqual([1, 2, 5]);
    expect(r2.sheriffState.initialElectedSeat).toBe(1);

    const matrix = buildGameSummaryMatrix(
      {
        round: 1,
        seats,
        winner: 'good',
        sheriffState: r2.sheriffState,
        ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: true },
        nightHistory: [],
        dayHistory: [],
      },
      undefined,
      new Date(2026, 10, 27, 20, 35),
    );

    expect(matrix.header.dateTimeText).toBe('2026/11/27 20:35');
    expect(matrix.header.winnerLabel).toBe('好人獲勝');
    expect(matrix.players[0].seatCode).toBe('01');
    expect(matrix.players[0].nickname).toBe('小明');
    expect(matrix.players[1].nickname).toBe('2號');

    expect(matrix.sheriff).not.toBeNull();
    expect(matrix.sheriff!.electedSeat).toBe(1);
    expect(matrix.sheriff!.signUpCells).toEqual(['上警', '退水*', '', '', '上警', '', '', '']);
    expect(matrix.sheriff!.voteRows).toHaveLength(2);
    expect(matrix.sheriff!.voteRows[0].label).toBe('警長投票');
    expect(matrix.sheriff!.voteRows[0].cells).toEqual(['-', '-', '1', '1', '-', '5', '5', 'X']);
    expect(matrix.sheriff!.voteRows[1].label).toBe('警長PK投票');
    expect(matrix.sheriff!.voteRows[1].cells).toEqual(['-', '1', '1', '1', '-', '5', 'X', 'X']);

    // 關閉警長時自動隱藏區塊 B
    const noSheriffMatrix = buildGameSummaryMatrix({
      round: 1,
      seats,
      winner: 'good',
      sheriffState: createInitialSheriffState(),
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: false },
      nightHistory: [],
      dayHistory: [],
    });
    expect(noSheriffMatrix.sheriff).toBeNull();
  });

  it('正確提取多日放逐投票、PK 投票、自爆與白天技能／出局總覽', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'seer', { isAlive: true }),
      makeSeat(2, 'witch', { isAlive: false, deathRound: 1, deathReason: 'wolf_kill' }),
      makeSeat(3, 'hunter', { isAlive: false, deathRound: 2, deathReason: 'white_wolf_king_explode' }),
      makeSeat(4, 'knight', { isAlive: true }),
      makeSeat(5, 'white_wolf_king', { isAlive: false, deathRound: 2, deathReason: 'white_wolf_king_explode' }),
      makeSeat(6, 'wolf', { isAlive: false, deathRound: 1, deathReason: 'exiled' }),
      makeSeat(7, 'villager', { isAlive: true }),
      makeSeat(8, 'villager', { isAlive: false, deathRound: 2, deathReason: 'hunter_shoot' }),
    ];

    const aliveDay1 = seats.map((s) =>
      s.seatNumber === 2 ? { ...s, isAlive: false } : { ...s, isAlive: true },
    );

    // Day 1 首輪平票（5、6 平票）
    const d1Tie = tallyExileVotes({
      seats: aliveDay1,
      votes: { 1: 6, 3: 6, 4: 6, 5: 1, 6: 5, 7: 5, 8: 5 },
      roundIndex: 1,
    });
    // Day 1 PK 輪（6 被放逐）
    const d1Pk = tallyExileVotes({
      seats: aliveDay1,
      votes: { 1: 6, 3: 6, 4: 6, 7: 5, 8: null },
      pkCandidates: [5, 6],
      roundIndex: 2,
    });

    const nightHistory: NightHistoryEntry[] = [
      {
        round: 1,
        draft: { ...createEmptyNightDraft(1), wolfTarget: 2 },
        deaths: [{ seat: 2, reason: 'wolf_kill' }],
      },
      {
        round: 2,
        draft: { ...createEmptyNightDraft(2), wolfTarget: null },
        deaths: [],
      },
    ];

    const dayHistory: DayHistoryEntry[] = [
      {
        round: 1,
        events: ['平票 PK', '放逐 6 號'],
        structuredEvents: [
          { type: 'exile_pk', summary: '平票 PK', voteRecord: d1Tie.record },
          { type: 'exile_vote', summary: '放逐投票', targetSeat: 6, voteRecord: d1Pk.record },
          {
            type: 'exile_result',
            summary: '6 號於白天放逐出局',
            targetSeat: 6,
            eliminatedSeats: [6],
            outcomeTag: 'exile',
          },
        ],
      },
      {
        round: 2,
        events: ['白狼王自爆帶 3', '獵人開槍帶 8'],
        structuredEvents: [
          {
            type: 'white_wolf_king_explode',
            summary: '5 號（白狼王）自爆帶走 3 號',
            actorSeat: 5,
            targetSeat: 3,
            eliminatedSeats: [5, 3],
          },
          {
            type: 'hunter_shoot',
            summary: '3 號（獵人）開槍帶走 8 號',
            actorSeat: 3,
            targetSeat: 8,
            eliminatedSeats: [8],
            outcomeTag: 'shoot_kill',
          },
        ],
      },
    ];

    const matrix = buildGameSummaryMatrix({
      round: 2,
      seats,
      winner: 'good',
      sheriffState: createInitialSheriffState(),
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: false },
      nightHistory,
      dayHistory,
    });

    // Day 1 首輪 + Day 1 PK + Day 2 自爆列
    expect(matrix.dayVoteRows).toHaveLength(3);
    expect(matrix.dayVoteRows[0].label).toBe('Day 1 投票');
    expect(matrix.dayVoteRows[0].cells).toEqual(['6', '-', '6', '6', '1', '5', '5', '5']);
    expect(matrix.dayVoteRows[1].label).toBe('Day 1 PK投票');
    expect(matrix.dayVoteRows[1].cells).toEqual(['6', '-', '6', '6', '-', '-', '5', 'X']);
    expect(matrix.dayVoteRows[2].label).toBe('Day 2 投票');
    expect(matrix.dayVoteRows[2].cells).toEqual(['-', '-', '-', '-', '自爆', '-', '-', '-']);

    // 區塊 E：白天放逐、技能／連帶與出局總覽分離
    expect(matrix.daySummaryColumns).toHaveLength(2);
    expect(matrix.daySummaryColumns[0]).toEqual({
      round: 1,
      label: 'D1',
      exileText: '6',
      daySkillsText: '無',
      eliminatedText: '2、6',
    });
    expect(matrix.daySummaryColumns[1]).toEqual({
      round: 2,
      label: 'D2',
      exileText: 'X',
      daySkillsText: '5爆帶3 / 3帶8',
      eliminatedText: '3、5、8',
    });
  });

  it('夜死連環開槍與白天放逐分離顯示於不同列，平安日白天放逐顯示 X', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'hunter', { isAlive: false, deathRound: 1, deathReason: 'hunter_shoot' }),
      makeSeat(2, 'seer', { isAlive: true }),
      makeSeat(3, 'villager', { isAlive: true }),
      makeSeat(4, 'villager', { isAlive: false, deathRound: 1, deathReason: 'exiled' }),
      makeSeat(5, 'wolf_king', { isAlive: false, deathRound: 1, deathReason: 'wolf_kill' }),
      makeSeat(7, 'wolf', { isAlive: false, deathRound: 1, deathReason: 'hunter_shoot' }),
    ];

    const matrix = buildGameSummaryMatrix({
      round: 2,
      seats,
      winner: 'good',
      sheriffState: createInitialSheriffState(),
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: false },
      nightHistory: [
        {
          round: 1,
          draft: { ...createEmptyNightDraft(1), wolfTarget: 5 },
          deaths: [{ seat: 5, reason: 'wolf_kill' }],
        },
        {
          round: 2,
          draft: { ...createEmptyNightDraft(2), wolfTarget: null },
          deaths: [],
        },
      ],
      dayHistory: [
        {
          round: 1,
          events: ['5 號開槍帶走 1 號', '1 號開槍帶走 7 號', '放逐 4 號'],
          structuredEvents: [
            {
              type: 'wolf_king_shoot',
              summary: '5 號開槍帶走 1 號',
              actorSeat: 5,
              targetSeat: 1,
              eliminatedSeats: [1],
              outcomeTag: 'shoot_kill',
            },
            {
              type: 'hunter_shoot',
              summary: '1 號開槍帶走 7 號',
              actorSeat: 1,
              targetSeat: 7,
              eliminatedSeats: [7],
              outcomeTag: 'shoot_kill',
            },
            {
              type: 'exile_result',
              summary: '4 號於白天放逐出局',
              targetSeat: 4,
              eliminatedSeats: [4],
              outcomeTag: 'exile',
            },
          ],
        },
        {
          round: 2,
          events: ['平安日'],
          structuredEvents: [],
        },
      ],
    });

    expect(matrix.daySummaryColumns[0]).toEqual({
      round: 1,
      label: 'D1',
      exileText: '4',
      daySkillsText: '5帶1 / 1帶7',
      eliminatedText: '1、4、5、7',
    });
    expect(matrix.daySummaryColumns[1]).toEqual({
      round: 2,
      label: 'D2',
      exileText: 'X',
      daySkillsText: '無',
      eliminatedText: '平安',
    });
  });

  it('正確提取多晚動態角色技能簡碼與轉化／感染／第二身分小字加註', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'nightmare'),
      makeSeat(2, 'mech_wolf'),
      makeSeat(3, 'guard'),
      makeSeat(4, 'dream_catcher'),
      makeSeat(5, 'witch'),
      makeSeat(6, 'seer', { statuses: { infectedBySeedWolf: true } }),
      makeSeat(7, 'villager', { secondRoleId: 'jack_the_ripper' }),
      makeSeat(8, 'villager', { statuses: { convertedByAwakenedGargoyle: true } }),
    ];

    const nightHistory: NightHistoryEntry[] = [
      {
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          nightmareFearTarget: 5,
          mechWolfLearnTarget: 3,
          wolfTarget: 6,
          witchUseAntidote: true,
          seerCheckTarget: 7,
          guardTarget: 12,
          dreamCatcherTarget: 4,
        },
        deaths: [],
        mechWolfLearnedRoleId: 'guard',
        seerResult: { targetSeat: 7, faction: 'good' },
      },
      {
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          wolfTarget: null,
          witchPoisonTarget: 1,
          seerCheckTarget: 1,
        },
        deaths: [{ seat: 1, reason: 'witch_poison' }],
        seerResult: { targetSeat: 1, faction: 'wolf' },
      },
    ];

    const matrix = buildGameSummaryMatrix({
      round: 2,
      seats,
      winner: 'wolf',
      sheriffState: createInitialSheriffState(),
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: false },
      mechWolfState: {
        ...createInitialMechWolfState(),
        learnedFromSeat: 3,
        learnedRoleId: 'guard',
      },
      nightHistory,
      dayHistory: [],
    });

    // 檢查轉化／感染／第二身分／機械狼學習小字加註
    expect(matrix.players[1].subNote).toBe('學:守');
    expect(matrix.players[5].subNote).toBe('感染');
    expect(matrix.players[6].subNote).toBe('傑克');
    expect(matrix.players[7].subNote).toBe('轉化');

    // 檢查夜間行動矩陣僅包含本局有的角色且簡碼正確
    expect(matrix.nightMatrix.roundLabels).toEqual(['N1', 'N2']);
    const rowByKey = new Map(matrix.nightMatrix.rows.map((r) => [r.key, r]));
    expect(rowByKey.get('wolf_kill')?.cells).toEqual(['6', '空']);
    expect(rowByKey.get('nightmare')?.cells).toEqual(['恐5', 'X']);
    expect(rowByKey.get('mech_wolf')?.cells).toEqual(['學3守', 'X']);
    expect(rowByKey.get('witch')?.cells).toEqual(['救6', '毒1']);
    expect(rowByKey.get('seer')?.cells).toEqual(['7好', '1狼']);
    expect(rowByKey.get('guard')?.cells).toEqual(['守12', 'X']);
    expect(rowByKey.get('dream_catcher')?.cells).toEqual(['夢4', 'X']);
    // 本局未配置的角色不應出現
    expect(rowByKey.has('demon_hunter')).toBe(false);
    expect(rowByKey.has('happy_sheep')).toBe(false);
  });

  it('檔名格式符合 狼人殺復盤_YYYYMMDD_板子名稱.png 規範', () => {
    const board = getBoardById('12p-nightmare-dream');
    const filename = buildSummaryImageFilename(board?.name ?? '夢魘攝夢', new Date(2026, 10, 27));
    expect(filename).toMatch(/^狼人殺復盤_20261127_.+\.png$/);
  });
});
