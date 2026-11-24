import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  applyPandoraGift,
  canCrowCurse,
  checkVictory,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialThirdPartySpecialState,
  getBatch5ExileExtraVotes,
  getSeerCheckResult,
  resolveBaiZeInherit,
  resolveNight,
  resolveNineTailsHunt,
  resolvePandoraHopeLight,
  resolveSelfExplode,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: `${idx + 1}號`,
    roleId,
    isAlive: true,
  }));
}

describe('第 5 批：第三方獨立勝利、特殊計分與收集／贈禮類角色', () => {
  it('潘朵拉：驗好人、開毒自免他死、魔盒全送且獲贈者全滅優先勝、希望之光最後一人即刻勝', () => {
    const seats = makeSeats([
      'pandora',
      'wolf',
      'villager',
      'villager',
      'seer',
      'witch',
    ]);
    expect(getSeerCheckResult(seats, 1)?.faction).toBe('good');

    let state = createInitialThirdPartySpecialState();
    // 贈給自己開毒：潘朵拉免疫
    const selfPoison = applyPandoraGift(seats, state, 1, 'poison', 1);
    expect(selfPoison.allowed).toBe(true);
    expect(selfPoison.poisonedSeat).toBeNull();
    expect(selfPoison.seats[0].isAlive).toBe(true);
    state = selfPoison.state;

    // 贈送其餘 4 盒給 2, 3, 4, 5 號
    const g2 = applyPandoraGift(selfPoison.seats, state, 2, 'knife', 1);
    const g3 = applyPandoraGift(g2.seats, g2.state, 3, 'day_gun', 2);
    const g4 = applyPandoraGift(g3.seats, g3.state, 4, 'day_gun', 2);
    const g5 = applyPandoraGift(g4.seats, g4.state, 5, 'hope_light', 3);
    expect(g5.state.pandoraRemainingBoxes).toHaveLength(0);

    // 2, 3, 4, 5 號皆死（狼已滅且神未滅，原本會判好人勝），但潘朵拉 5 盒全送且他方獲贈者全死 -> 優先判潘朵拉勝
    const deadOthers = g5.seats.map((s) =>
      [2, 3, 4, 5].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    const v = checkVictory(deadOthers, DEFAULT_RULE_OVERRIDES, undefined, {
      thirdPartySpecialState: g5.state,
    });
    expect(v.winner).toBe('third_party');
    expect(v.winReason).toContain('潘朵拉');

    // 測試希望之光：5 號預言家為最後一神時使用希望之光 -> 好人陣營立即勝
    const onlyOneGodSeats = g5.seats.map((s) =>
      s.seatNumber === 6 ? { ...s, isAlive: false } : s,
    );
    const hopeRes = resolvePandoraHopeLight(onlyOneGodSeats, g5.state, 5);
    expect(hopeRes.allowed).toBe(true);
    expect(hopeRes.triggeredWinner).toBe('good');
  });

  it('睡美人與異族王子：首夜指定與次夜左右擴散、封鎖女巫毒／熊咆哮／獵人槍／全狼空刀、異族王子喚醒清除', () => {
    const seats = makeSeats([
      'wolf',
      'bear',
      'witch',
      'hunter',
      'exotic_prince',
      'villager',
    ]);
    // 第 1 晚指定 2 號（熊）為睡美人 -> 熊處於睡眠狀態不咆哮
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        sleepingBeautyPickSeat: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.thirdPartySpecialState.sleepingSeats).toEqual([2]);
    expect(n1.bearRoar?.roared).toBe(false);

    // 第 2 晚：向左右擴散一格 -> 1, 2, 3 號睡眠；唯一狼 1 號與女巫 3 號都睡眠 -> 狼空刀、女巫毒失敗
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        wolfTarget: 6,
        witchPoisonTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: n1.witchAntidoteUsed,
      witchPoisonUsed: n1.witchPoisonUsed,
      lastGuardedSeat: n1.lastGuardedSeat,
      mechWolfState: n1.mechWolfState,
      pendingSelfExplodeSeat: null,
      thirdPartySpecialState: n1.thirdPartySpecialState,
    });
    expect(n2.thirdPartySpecialState.sleepingSeats).toEqual([1, 2, 3]);
    expect(n2.deaths).toHaveLength(0);

    // 第 3 晚：異族王子查中 2 號睡美人 -> 立即喚醒並清除所有睡眠狀態
    const n3 = resolveNight({
      seats: n2.seats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        exoticPrinceCheckTarget: 2,
        wolfTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: n2.witchAntidoteUsed,
      witchPoisonUsed: n2.witchPoisonUsed,
      lastGuardedSeat: n2.lastGuardedSeat,
      mechWolfState: n2.mechWolfState,
      pendingSelfExplodeSeat: null,
      thirdPartySpecialState: n2.thirdPartySpecialState,
    });
    expect(n3.thirdPartySpecialState.sleepingBeautyAwakened).toBe(true);
    expect(n3.thirdPartySpecialState.sleepingSeats).toEqual([]);
    expect(n3.deaths.some((d) => d.seat === 6 && d.reason === 'wolf_kill')).toBe(true);
  });

  it('九尾與白澤：夜間標記／清除、白天獵殺時刻全滅 B 方、白澤平民繼承人轉神民雙陣營', () => {
    const seats = makeSeats([
      'nine_tails_wolf',
      'bai_ze',
      'villager',
      'villager',
      'seer',
    ]);
    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nineTailsMarkTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.thirdPartySpecialState.nineTailsMarkedSeats).toEqual([3]);

    // 再標記 4 號 -> A={1,3,4} (3人) > B={2,5} (2人) -> 獵殺時刻成功，2與5號立即出局
    const stateWith2Marks = {
      ...n1.thirdPartySpecialState,
      nineTailsMarkedSeats: [3, 4],
    };
    const hunt = resolveNineTailsHunt(n1.seats, stateWith2Marks, 2);
    expect(hunt.success).toBe(true);
    expect(hunt.eliminatedSeats).toEqual([2, 5]);

    // 白澤指定平民 3 號為繼承人 -> 3 號同時計入神職與平民（屠神須連同 3 號淘汰）
    const inh = resolveBaiZeInherit(seats, createInitialThirdPartySpecialState(), 3);
    expect(inh.allowed).toBe(true);
    expect(inh.seats[2].baiZeDualFaction).toBe(true);
    // 若白澤(2)與預言家(5)都出局，因 3 號具神民雙陣營，狼人仍未屠神
    const godsDownExceptDual = inh.seats.map((s) =>
      s.seatNumber === 2 || s.seatNumber === 5 ? { ...s, isAlive: false } : s,
    );
    const v = checkVictory(godsDownExceptDual, DEFAULT_RULE_OVERRIDES);
    expect(v.winner).toBeNull();
  });

  it('舞者、假面與烏鴉：舞池少數出局＋舞者在池免狼刀＋假面改判、烏鴉詛咒不可連選與禁選翻牌白痴', () => {
    const seats = makeSeats([
      'wolf',
      'masked_wolf',
      'dancer',
      'crow',
      'idiot',
      'villager',
    ]);
    seats[4].idiotRevealed = true;
    expect(canCrowCurse(seats, createInitialThirdPartySpecialState(), 5).allowed).toBe(false);

    // 第 2 晚：舞者選 [1(狼), 3(舞者), 6(民)] 進舞池，狼刀 3 號（舞者在舞池中免疫狼刀），假面未改判 -> 1 號少數出局
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        wolfTarget: 3,
        dancerFloorTargets: [1, 3, 6],
        crowCurseTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[2].isAlive).toBe(true); // 舞者免疫狼刀
    expect(n2.deaths.some((d) => d.seat === 1 && d.reason === 'dance_out')).toBe(true);
    expect(getBatch5ExileExtraVotes(n2.thirdPartySpecialState)).toEqual({ 1: 1 });
  });

  it('商人系列、通靈者、管家與狼僕：贈狼反噬、超級黑市三好轉狼、通靈狼刀、管家與狼僕上茶結算', () => {
    // 1) 奇蹟商人贈狼反噬 & 超級黑市商人 3 好轉狼
    const seats1 = makeSeats([
      'wolf',
      'miracle_merchant',
      'super_black_market_merchant',
      'seer',
      'villager',
      'villager',
    ]);
    const n1 = resolveNight({
      seats: seats1,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        miracleMerchantTarget: 1, // 贈給狼人 -> 反噬出局
        miracleMerchantItem: 'seer_check',
        superBlackMarketTargets: {
          seer_check: 4,
          witch_poison: 5,
          hunter_gun: 6,
        },
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.deaths.some((d) => d.seat === 2 && d.reason === 'merchant_backfire')).toBe(true);
    expect(n1.thirdPartySpecialState.superBlackMarketTurnedWolf).toBe(true);

    // 2) 通靈者通靈死亡小狼給平民，次夜平民發動通靈狼刀；管家上茶預言家驗狼致死；狼僕上茶女巫致死
    const seats2 = makeSeats([
      'wolf',
      'wolf_maid',
      'medium',
      'butler',
      'seer',
      'witch',
      'villager',
    ]);
    seats2[0].isAlive = false; // 1 號小狼已死

    const m1 = resolveNight({
      seats: seats2,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        mediumDeadSeat: 1,
        mediumHeirSeat: 7,
        butlerTeaTarget: 5, // 上茶給預言家
        butlerTeaAccepted: true,
        seerCheckTarget: 2, // 預言家驗到狼僕（狼）-> 管家茶觸發擊殺 2 號
        wolfMaidTeaTarget: 6, // 狼僕上茶給女巫 -> 女巫出局
        wolfMaidTeaAccepted: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(m1.deaths.some((d) => d.seat === 2 && d.reason === 'butler_seer_kill')).toBe(true);
    expect(m1.deaths.some((d) => d.seat === 6 && d.reason === 'wolf_maid_tea_kill')).toBe(true);
    expect(m1.thirdPartySpecialState.mediumInheritedHeirs).toHaveLength(1);
    expect(m1.thirdPartySpecialState.mediumInheritedHeirs[0].skill).toBe('wolf_kill');

    // 第 3 晚：7 號發動通靈狼刀擊殺 4 號
    const m2 = resolveNight({
      seats: m1.seats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        mediumSkillActionSeat: 7,
        mediumSkillTargetSeat: 4,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: m1.witchAntidoteUsed,
      witchPoisonUsed: m1.witchPoisonUsed,
      lastGuardedSeat: m1.lastGuardedSeat,
      mechWolfState: m1.mechWolfState,
      pendingSelfExplodeSeat: null,
      thirdPartySpecialState: m1.thirdPartySpecialState,
    });
    expect(m2.deaths.some((d) => d.seat === 4 && d.reason === 'medium_knife')).toBe(true);
  });
});
