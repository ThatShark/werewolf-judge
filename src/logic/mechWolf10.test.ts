import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canMechWolfLearn,
  canMechWolfUseLearnedSkill,
  checkVictory,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  getPsychicCheckResult,
  resolveDayExile,
  resolveNight,
  resolveSelfExplode,
} from './index';
import type { PlayerSeat, RuleOverrides } from './types';

function createMechWolf10Seats(): PlayerSeat[] {
  const roles = [
    'wolf',      // 1
    'wolf',      // 2
    'mech_wolf', // 3
    'villager',  // 4
    'villager',  // 5
    'villager',  // 6
    'villager',  // 7
    'psychic',   // 8
    'witch',     // 9
    'guard',     // 10
  ];
  return createInitialSeats(10).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('MVP 板子 3：10 人局 - 機械狼通靈師 / 鏡隱迷蹤', () => {
  it('首夜學習機制：不可學自己，且受 mechWolfForceLearnNight1 開關控制', () => {
    const seats = createMechWolf10Seats(); // 3 號為機械狼

    // 不可學習自己
    expect(canMechWolfLearn(seats, 3, DEFAULT_RULE_OVERRIDES, 1).allowed).toBe(false);
    // 預設 mechWolfForceLearnNight1 = true -> 不可跳過（null）
    expect(canMechWolfLearn(seats, null, DEFAULT_RULE_OVERRIDES, 1).allowed).toBe(false);
    // 學習其他人（例如 10 號守衛）允許
    expect(canMechWolfLearn(seats, 10, DEFAULT_RULE_OVERRIDES, 1).allowed).toBe(true);

    // 關閉首夜強制學習 -> 可跳過
    const optionalLearnRule: RuleOverrides = {
      ...DEFAULT_RULE_OVERRIDES,
      mechWolfForceLearnNight1: false,
    };
    expect(canMechWolfLearn(seats, null, optionalLearnRule, 1).allowed).toBe(true);
  });

  it('通靈師查驗身分變化：學習前顯示機械狼，學習後動態顯示所學對象身分', () => {
    const seats = createMechWolf10Seats();
    const initialMechState = createInitialMechWolfState();

    // 學習前查驗 3 號 -> 顯示 'mech_wolf'
    expect(getPsychicCheckResult(seats, initialMechState, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'mech_wolf',
    });

    // 第一晚機械狼學習 4 號（平民），通靈師當晚查驗 3 號 -> 顯示 'villager'
    const night1LearnVillager = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        mechWolfLearnTarget: 4,
        psychicCheckTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: initialMechState,
      pendingSelfExplodeSeat: null,
    });
    expect(night1LearnVillager.mechWolfState.learnedRoleId).toBe('villager');
    expect(night1LearnVillager.psychicResult).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });

    // 第一晚機械狼學習 10 號（守衛），通靈師查驗 3 號 -> 顯示 'guard'
    const night1LearnGuard = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        mechWolfLearnTarget: 10,
        psychicCheckTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: initialMechState,
      pendingSelfExplodeSeat: null,
    });
    expect(night1LearnGuard.psychicResult).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'guard',
    });
  });

  it('機械狼學到女巫：僅獲得 1 瓶毒藥（無解藥），使用後標記消耗不可再用', () => {
    const seats = createMechWolf10Seats();

    const night1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), mechWolfLearnTarget: 9 }, // 學女巫
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(night1.mechWolfState.learnedRoleId).toBe('witch');

    // 第二晚使用毒藥毒殺 8 號（通靈師）
    const night2 = resolveNight({
      seats: night1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), mechWolfSkillTarget: 8 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: night1.mechWolfState,
      pendingSelfExplodeSeat: null,
    });
    expect(night2.deaths).toEqual([{ seat: 8, reason: 'mech_wolf_poison' }]);
    expect(night2.mechWolfState.usedLearnedOneShotSkill).toBe(true);

    // 第三晚不可再次使用毒藥
    expect(
      canMechWolfUseLearnedSkill(night2.mechWolfState, night2.seats, 4, 3).allowed,
    ).toBe(false);
  });

  it('機械狼學到守衛：機械盾可擋女巫毒藥，且仍受不可連守限制', () => {
    const seats = createMechWolf10Seats();

    const night1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), mechWolfLearnTarget: 10 }, // 學守衛
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    // 第二晚機械狼盾 1 號小狼，女巫同晚毒 1 號 -> 機械盾成功擋住毒藥！
    const night2 = resolveNight({
      seats: night1.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        mechWolfSkillTarget: 1,
        witchPoisonTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: night1.mechWolfState,
      pendingSelfExplodeSeat: null,
    });
    expect(night2.deaths).toEqual([]);
    expect(night2.seats[0].isAlive).toBe(true);
    expect(night2.witchPoisonUsed).toBe(true);
    expect(night2.mechWolfState.lastGuardedSeat).toBe(1);

    // 第三晚機械狼不可連守 1 號
    expect(
      canMechWolfUseLearnedSkill(night2.mechWolfState, night2.seats, 1, 3).allowed,
    ).toBe(false);
    // 可改守自己或空守
    expect(
      canMechWolfUseLearnedSkill(night2.mechWolfState, night2.seats, 3, 3).allowed,
    ).toBe(true);
    expect(
      canMechWolfUseLearnedSkill(night2.mechWolfState, night2.seats, null, 3).allowed,
    ).toBe(true);
  });

  it('機械狼學到小狼：須等所有小狼皆淘汰入隊後才解鎖雙刀', () => {
    const seats = createMechWolf10Seats();

    const night1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), mechWolfLearnTarget: 1 }, // 學小狼
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(night1.mechWolfState.hasJoinedWolfTeam).toBe(false);

    // 小狼仍存活時，無法開啟額外刀口
    expect(
      canMechWolfUseLearnedSkill(night1.mechWolfState, night1.seats, 4, 2).allowed,
    ).toBe(false);

    // 1 號與 2 號小狼先後出局 -> 機械狼自動入隊
    const day1Exile = resolveDayExile(
      night1.seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      night1.mechWolfState,
    );
    expect(day1Exile.mechWolfState.hasJoinedWolfTeam).toBe(false);

    const day2Exile = resolveDayExile(
      day1Exile.seats,
      2,
      2,
      DEFAULT_RULE_OVERRIDES,
      day1Exile.mechWolfState,
    );
    expect(day2Exile.mechWolfState.hasJoinedWolfTeam).toBe(true);
    // 機械狼仍存活，好人尚未勝利
    expect(day2Exile.victory.winner).toBeNull();

    // 入隊後當晚雙刀：狼刀 4 號 + 機械狼額外刀 5 號
    const doubleKillNight = resolveNight({
      seats: day2Exile.seats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        wolfTarget: 4,
        mechWolfSkillTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: true,
      witchPoisonUsed: true,
      lastGuardedSeat: null,
      mechWolfState: day2Exile.mechWolfState,
      pendingSelfExplodeSeat: null,
    });
    expect(doubleKillNight.deaths).toEqual([
      { seat: 4, reason: 'wolf_kill' },
      { seat: 5, reason: 'mech_wolf_kill' },
    ]);
  });

  it('機械狼學到通靈師：第二晚起每晚可查驗真實身分', () => {
    const seats = createMechWolf10Seats();
    const night1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), mechWolfLearnTarget: 8 }, // 學通靈師
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    const night2 = resolveNight({
      seats: night1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), mechWolfSkillTarget: 9 }, // 查 9 號女巫
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: night1.mechWolfState,
      pendingSelfExplodeSeat: null,
    });
    expect(night2.mechWolfPsychicResult).toEqual({
      targetSeat: 9,
      perceivedRoleId: 'witch',
    });
  });

  it('機械狼全程不可自爆，且好人須淘汰所有小狼與機械狼才獲勝', () => {
    const seats = createMechWolf10Seats(); // 3 號機械狼

    const explodeRes = resolveSelfExplode(seats, 3);
    expect(explodeRes.allowed).toBe(false);
    expect(explodeRes.reason).toContain('機械狼');

    // 小狼 1、2 號皆死但機械狼 3 號存活 -> 尚未分出勝負
    const smallWolvesDead = seats.map((s) =>
      [1, 2].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(smallWolvesDead, DEFAULT_RULE_OVERRIDES).winner).toBeNull();

    // 機械狼 3 號也出局 -> 好人勝利
    const allWolvesDead = smallWolvesDead.map((s) =>
      s.seatNumber === 3 ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(allWolvesDead, DEFAULT_RULE_OVERRIDES).winner).toBe('good');
  });
});
