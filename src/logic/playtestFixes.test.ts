import { describe, expect, it } from 'vitest';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_ONLINE_JUDGE_SETTINGS,
  DEFAULT_RULE_OVERRIDES,
  advanceSheriffPkToVoting,
  advanceSheriffToVoting,
  canWitchUseAntidote,
  canWitchUsePoison,
  clampOnlineJudgeSettings,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialMechWolfState,
  getBoardRoleIdSet,
  getSheriffPkSpeakingOrder,
  resolveNight,
  resolveSelfExplode,
  resolveSheriffVoteRound,
  resolveWhiteWolfKingExplode,
  resolveWolfGirlExplode,
  setSheriffInitialSpeakingOrder,
  shouldEndNightEarly,
  startSheriffElection,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: `${idx + 1}號`,
    roleId,
    isAlive: true,
    statuses: {},
  }));
}

describe('實測修正規則單元測試（警長 PK 逆序、禁自爆、血月封印、女巫單次消耗、夜中提前勝負）', () => {
  it('警長平票 PK 應嚴格依「上警發言順序的逆序」排列平票候選人', () => {
    const seats = makeSeats([
      'wolf',
      'wolf',
      'wolf',
      'wolf',
      'seer',
      'witch',
      'hunter',
      'idiot',
      'villager',
      'villager',
      'villager',
      'villager',
    ]);

    let sheriff = startSheriffElection(seats, [2, 5, 7, 10]);
    expect(sheriff.status).toBe('speaking');
    // 假設上警隨機發言順序為 5 -> 7 -> 10 -> 2
    sheriff = setSheriffInitialSpeakingOrder(sheriff, [5, 7, 10, 2]);
    sheriff = advanceSheriffToVoting(sheriff);
    expect(sheriff.status).toBe('voting');

    // 警下投票：5 號與 2 號各得 2 票平票
    const res = resolveSheriffVoteRound(sheriff, seats, {
      1: 5,
      3: 5,
      4: 2,
      6: 2,
      8: null,
      9: null,
      11: null,
      12: null,
    });
    expect(res.outcome).toBe('pk');
    expect(res.sheriffState.status).toBe('pk_speaking');
    expect(res.sheriffState.pkCandidates).toEqual([2, 5]);

    // 原始順序中 5 先於 2，因此 PK 逆序必須為 [2, 5]
    const pkOrder = getSheriffPkSpeakingOrder(
      res.sheriffState.initialSpeakingOrder,
      res.sheriffState.pkCandidates,
    );
    expect(pkOrder).toEqual([2, 5]);

    // PK 發言完畢推進至 PK 投票，且再次平票則警徽流失
    const pkVotingState = advanceSheriffPkToVoting(res.sheriffState);
    expect(pkVotingState.status).toBe('pk_voting');
    const pkRes = resolveSheriffVoteRound(pkVotingState, seats, {
      1: 5,
      3: 2,
      4: null,
      6: null,
    });
    expect(pkRes.outcome).toBe('no_sheriff');
    expect(pkRes.sheriffState.badgeStatus).toBe('none');
  });

  it('進入白天放逐投票階段後禁止一般狼人與白狼王自爆，但狼女孩（wolf_girl）例外允許', () => {
    const seats = makeSeats([
      'wolf',
      'white_wolf_king',
      'wolf_girl',
      'seer',
      'witch',
      'villager',
      'villager',
      'villager',
    ]);

    // 階段四（放逐投票）一般狼人禁自爆
    const wolfExplodeInVote = resolveSelfExplode(seats, 1, undefined, {
      round: 1,
      inExileVoteStage: true,
    });
    expect(wolfExplodeInVote.allowed).toBe(false);
    expect(wolfExplodeInVote.reason).toContain('放逐投票');

    // 階段四（放逐投票）白狼王禁自爆
    const wwkExplodeInVote = resolveWhiteWolfKingExplode(
      seats,
      2,
      4,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
      null,
      undefined,
      undefined,
      { inExileVoteStage: true },
    );
    expect(wwkExplodeInVote.allowed).toBe(false);
    expect(wwkExplodeInVote.reason).toContain('放逐投票');

    // 狼女孩在放逐投票階段仍可例外自爆並作廢放逐投票
    const wgRes = resolveWolfGirlExplode(
      seats,
      3,
      { confessedSeat: 6, confessSuccess: true, alignedWithWolf: true },
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
      { voidExileVote: true },
    );
    expect(wgRes.allowed).toBe(true);
    expect(wgRes.voidedExileVote).toBe(true);
  });

  it('血月使徒自爆後封印當晚所有好人神職技能（女巫解藥／毒藥與守衛守護皆無效）', () => {
    const seats = makeSeats([
      'blood_moon_apostle',
      'wolf',
      'seer',
      'witch',
      'guard',
      'villager',
      'villager',
      'villager',
    ]);
    // 血月使徒白天自爆出局並開啟當晚封印
    seats[0].isAlive = false;
    seats[0].deathReason = 'self_explode';

    const draft = {
      ...createEmptyNightDraft(2),
      wolfTarget: 6,
      witchUseAntidote: true,
      guardTarget: 6,
    };

    const nightRes = resolveNight({
      seats,
      round: 2,
      draft,
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      combatState: { ...createInitialCombatState(), bloodMoonSealActiveTonight: true },
    });

    // 6 號在血月封印下無法被救活或守護，必須死亡，且女巫解藥未被消耗
    expect(nightRes.seats[5].isAlive).toBe(false);
    expect(nightRes.witchAntidoteUsed).toBe(false);
    expect(nightRes.combatState.bloodMoonSealActiveTonight).toBe(false);
  });

  it('女巫解藥與毒藥各自全場限用一次、用完鎖死且同晚不可雙開', () => {
    const seats = makeSeats(['wolf', 'wolf', 'witch', 'seer', 'villager', 'villager']);

    // 解藥已用完 -> 永久不可再用
    expect(canWitchUseAntidote(seats, 2, 4, true, DEFAULT_RULE_OVERRIDES).allowed).toBe(false);
    // 毒藥已用完 -> 永久不可再用
    expect(canWitchUsePoison(seats, false, 1, true).allowed).toBe(false);
    // 同晚已用解藥 -> 不可再開毒藥
    expect(canWitchUsePoison(seats, true, 1, false).allowed).toBe(false);
    // 正常使用毒藥
    expect(canWitchUsePoison(seats, false, 1, false).allowed).toBe(true);
  });

  it('夜晚中途觸發勝負：無後續救人步驟時立即提前天亮；尚有可用女巫解藥時不提前誤判', () => {
    // 僅剩 1 狼（1 號）與 1 神（3 號預言家）與 2 民（4、5 號）
    const seats = makeSeats(['wolf', 'witch', 'seer', 'villager', 'villager']);
    // 假設女巫（2 號）已出局，狼刀最後一神 3 號（屠邊成立）
    seats[1].isAlive = false;
    const draft = { ...createEmptyNightDraft(3), wolfTarget: 3 };

    const earlyRes = shouldEndNightEarly(
      {
        seats,
        round: 3,
        draft,
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: true,
        witchPoisonUsed: true,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      },
      [
        { actionType: 'seer_check', actorRoleIds: ['seer'] },
        { actionType: 'hunter_gesture', actorRoleIds: ['hunter'] },
      ],
    );
    expect(earlyRes.shouldEndEarly).toBe(true);
    expect(earlyRes.victory.winner).toBe('wolf');

    // 若女巫（2 號）存活且仍有解藥，且尚未輪到 witch_action，則不可提前天亮
    seats[1].isAlive = true;
    const waitWitchRes = shouldEndNightEarly(
      {
        seats,
        round: 3,
        draft,
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      },
      [{ actionType: 'witch_action', actorRoleIds: ['witch'] }],
    );
    expect(waitWitchRes.shouldEndEarly).toBe(false);
  });

  it('動態條件房規輔助 getBoardRoleIdSet 與語音閉眼→睜眼間隔 clamp 正確運作', () => {
    const classic12 = getBoardById('12p-classic');
    const roleIds = getBoardRoleIdSet(classic12);
    expect(roleIds.has('witch')).toBe(true);
    expect(roleIds.has('mech_wolf')).toBe(false);
    expect(roleIds.has('black_market_merchant')).toBe(false);

    const clamped = clampOnlineJudgeSettings(DEFAULT_ONLINE_JUDGE_SETTINGS, {
      closeToOpenDelaySeconds: 20,
      stepBufferSeconds: -2,
    });
    expect(clamped.closeToOpenDelaySeconds).toBe(15);
    expect(clamped.stepBufferSeconds).toBe(0);
  });
});
