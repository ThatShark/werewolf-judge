import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  checkCanShoot,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  createInitialThirdPartySpecialState,
  isLuckySkillAllowedOnRound,
  pickRandomDirection,
  resolveKnightDuel,
  resolveNight,
  resolveSelfExplode,
  resolveShoot,
  resolveWhiteWolfKingExplode,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return createInitialSeats(roles.length).map((s, idx) => ({
    ...s,
    roleId: roles[idx],
  }));
}

describe('實測流程與規則修復驗證（自爆即時死亡／連鎖開槍／幸運兒首夜／隨機方向）', () => {
  it('狼人自爆即刻死亡，不可再成為騎士決鬥或獵人開槍目標', () => {
    const seats = makeSeats([
      'wolf',
      'wolf',
      'villager',
      'villager',
      'knight',
      'hunter',
      'seer',
    ]);

    const explode = resolveSelfExplode(seats, 1, undefined, {
      round: 1,
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      mechWolfState: createInitialMechWolfState(),
    });
    expect(explode.allowed).toBe(true);
    expect(explode.pendingSelfExplodeSeat).toBeNull();
    expect(explode.seats?.[0].isAlive).toBe(false);
    expect(explode.seats?.[0].deathReason).toBe('self_explode');

    // 騎士不可再決鬥已自爆死亡的 1 號狼人
    const duel = resolveKnightDuel(
      explode.seats!,
      5,
      1,
      false,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(duel.allowed).toBe(false);
    expect(duel.reason).toContain('已出局');

    // 獵人不可再開槍指定已自爆死亡的 1 號狼人
    expect(() =>
      resolveShoot(
        explode.seats!,
        6,
        1,
        'exiled',
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      ),
    ).toThrow('已出局');
  });

  it('連鎖開槍：白狼王自爆帶走獵人、潘朵拉手槍射殺覺醒獵人、獵人與狼王互射皆可連鎖排入開槍', () => {
    // 1. 白狼王自爆帶走獵人 -> 獵人可連鎖開槍
    const seatsA = makeSeats([
      'white_wolf_king',
      'wolf',
      'villager',
      'villager',
      'hunter',
      'seer',
    ]);
    const wwk = resolveWhiteWolfKingExplode(
      seatsA,
      1,
      5,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(wwk.allowed).toBe(true);
    expect(wwk.seats[0].isAlive).toBe(false);
    expect(wwk.seats[4].isAlive).toBe(false);
    expect(wwk.chainedShootEligibility?.canShoot).toBe(true);
    expect(wwk.chainedShootEligibility?.seatNumber).toBe(5);
    expect(wwk.chainedShootEligibility?.roleId).toBe('hunter');

    // 2. 潘朵拉手槍射殺覺醒獵人 -> 覺醒獵人可連鎖開槍
    const seatsB = makeSeats(['wolf', 'wolf', 'villager', 'villager', 'awakened_hunter', 'seer']);
    const afterPandora = seatsB.map((s) =>
      s.seatNumber === 5
        ? { ...s, isAlive: false, deathReason: 'pandora_day_gun' as const, deathRound: 1 }
        : s,
    );
    const awkCheck = checkCanShoot(afterPandora, 5, 'pandora_day_gun');
    expect(awkCheck?.canShoot).toBe(true);
    expect(awkCheck?.roleId).toBe('awakened_hunter');

    // 3. 獵人射殺狼王（場上尚有其他存活狼）-> 狼王可連鎖反開槍
    const seatsC = makeSeats(['wolf_king', 'wolf', 'villager', 'villager', 'hunter', 'seer']);
    const hunterDead = seatsC.map((s) =>
      s.seatNumber === 5 ? { ...s, isAlive: false, deathReason: 'exiled' as const } : s,
    );
    const shootRes = resolveShoot(
      hunterDead,
      5,
      1,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(shootRes.seats[0].isAlive).toBe(false);
    expect(shootRes.chainedShootEligibility?.canShoot).toBe(true);
    expect(shootRes.chainedShootEligibility?.roleId).toBe('wolf_king');
  });

  it('幸運兒第一晚可用技能預設值與首夜結算限制（黑市全關、奇蹟全開、超級黑市僅開槍）', () => {
    // 預設值檢查
    expect(isLuckySkillAllowedOnRound('blackMarket', 'seer_check', 1, DEFAULT_RULE_OVERRIDES)).toBe(
      false,
    );
    expect(
      isLuckySkillAllowedOnRound('blackMarket', 'witch_poison', 1, DEFAULT_RULE_OVERRIDES),
    ).toBe(false);
    expect(isLuckySkillAllowedOnRound('blackMarket', 'hunter_gun', 1, DEFAULT_RULE_OVERRIDES)).toBe(
      false,
    );

    expect(isLuckySkillAllowedOnRound('miracle', 'seer_check', 1, DEFAULT_RULE_OVERRIDES)).toBe(
      true,
    );
    expect(isLuckySkillAllowedOnRound('miracle', 'witch_poison', 1, DEFAULT_RULE_OVERRIDES)).toBe(
      true,
    );
    expect(isLuckySkillAllowedOnRound('miracle', 'guard_shield', 1, DEFAULT_RULE_OVERRIDES)).toBe(
      true,
    );

    expect(
      isLuckySkillAllowedOnRound('superBlackMarket', 'seer_check', 1, DEFAULT_RULE_OVERRIDES),
    ).toBe(false);
    expect(
      isLuckySkillAllowedOnRound('superBlackMarket', 'witch_poison', 1, DEFAULT_RULE_OVERRIDES),
    ).toBe(false);
    expect(
      isLuckySkillAllowedOnRound('superBlackMarket', 'hunter_gun', 1, DEFAULT_RULE_OVERRIDES),
    ).toBe(true);

    // 次夜（round 2）一律開放
    expect(
      isLuckySkillAllowedOnRound('blackMarket', 'witch_poison', 2, DEFAULT_RULE_OVERRIDES),
    ).toBe(true);

    // 實際夜間結算驗證：黑市幸運兒預設首夜不可用毒；奇蹟幸運兒預設首夜可用毒
    const seats = makeSeats([
      'wolf',
      'wolf',
      'black_market_merchant',
      'miracle_merchant',
      'villager',
      'villager',
      'seer',
    ]);
    const tpInit = createInitialThirdPartySpecialState();
    const n1BlackMarket = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        blackMarketTarget: 5,
        blackMarketItem: 'witch_poison',
        luckyItemActorSeat: 5,
        luckyItemTargetSeat: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      thirdPartySpecialState: tpInit,
    });
    // 黑市幸運兒首夜預設不可用毒 -> 2 號存活且道具尚未消耗
    expect(n1BlackMarket.seats[1].isAlive).toBe(true);
    expect(n1BlackMarket.thirdPartySpecialState.blackMarketLuckyItemUsed).toBe(false);

    const n1Miracle = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        miracleMerchantTarget: 6,
        miracleMerchantItem: 'witch_poison',
        luckyItemActorSeat: 6,
        luckyItemTargetSeat: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      thirdPartySpecialState: tpInit,
    });
    // 奇蹟幸運兒首夜預設可用毒 -> 2 號中毒出局且道具已消耗
    expect(n1Miracle.seats[1].isAlive).toBe(false);
    expect(n1Miracle.thirdPartySpecialState.miracleLuckyItemUsed).toBe(true);
  });

  it('pickRandomDirection 依 rng 正確回傳順時針或逆時針', () => {
    expect(pickRandomDirection(() => 0.2)).toBe('clockwise');
    expect(pickRandomDirection(() => 0.8)).toBe('counterclockwise');
  });
});
