import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialGargoyleState,
  createInitialMechWolfState,
  createInitialPumpkinGhostState,
  createInitialSuperGravekeeperState,
  evaluateMoonSpiritHowl,
  evaluateNineTailedFoxTails,
  evaluateSeniorVillagerReveal,
  getAwakenedSeerCheckResult,
  getDemonWolfCheckResult,
  getDrunkSeerCheckResult,
  getFoxCheckResult,
  getGravekeeperExileResult,
  getLanternSeerCheckResult,
  getSeerCheckResult,
  resolveGoodSelfExplode,
  resolveNight,
  resolveSelfExplode,
  resolveShoot,
  syncGargoyleTeamStatus,
  syncPumpkinGhostInheritance,
  syncSuperGravekeeperInheritance,
} from './index';
import type { ExiledRecord, PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: `${idx + 1}號`,
    roleId,
    isAlive: true,
  }));
}

describe('第 1 批：查驗與資訊感知類角色規則引擎（19 角色）', () => {
  it('覺醒預言家（awakened_seer）：雙好人為雙金水、含狼為疑似狼人、可查自己且隱狼/雪狼計好人', () => {
    const seats = makeSeats([
      'awakened_seer',
      'villager',
      'wolf',
      'snow_wolf',
      'hidden_wolf',
      'cursed_fox',
    ]);

    expect(getAwakenedSeerCheckResult(seats, [1, 2])?.result).toBe('double_good');
    expect(getAwakenedSeerCheckResult(seats, [2, 3])?.result).toBe('suspected_wolf');
    expect(getAwakenedSeerCheckResult(seats, [1, 4])?.result).toBe('double_good'); // 雪狼計好人
    expect(getAwakenedSeerCheckResult(seats, [1, 5])?.result).toBe('double_good'); // 隱狼計好人
    expect(getAwakenedSeerCheckResult(seats, [2, 6])?.result).toBe('double_good'); // 咒狐計好人
  });

  it('燈影預言家（lantern_seer）：查驗結果與真實預言家完全相反', () => {
    const seats = makeSeats(['seer', 'lantern_seer', 'villager', 'wolf', 'snow_wolf']);

    expect(getSeerCheckResult(seats, 3)?.faction).toBe('good');
    expect(getLanternSeerCheckResult(seats, 3)?.faction).toBe('wolf');

    expect(getSeerCheckResult(seats, 4)?.faction).toBe('wolf');
    expect(getLanternSeerCheckResult(seats, 4)?.faction).toBe('good');

    // 雪狼在真實預言家眼中為金水，故燈影預言家反轉為查殺
    expect(getLanternSeerCheckResult(seats, 5)?.faction).toBe('wolf');
  });

  it('酒鬼預言家（drunk_seer）：支援隨機結果與法官手動覆寫', () => {
    const seats = makeSeats(['drunk_seer', 'villager', 'wolf']);

    expect(getDrunkSeerCheckResult(seats, 2, { rng: () => 0.1 })?.faction).toBe('good');
    expect(getDrunkSeerCheckResult(seats, 2, { rng: () => 0.9 })?.faction).toBe('wolf');
    expect(getDrunkSeerCheckResult(seats, 3, { manualOverride: 'good' })?.faction).toBe('good');
    expect(getDrunkSeerCheckResult(seats, 2, { manualOverride: 'wolf' })?.faction).toBe('wolf');
  });

  it('愚言家（fool_seer）與鐵好人（iron_good）：夜間查驗與白天翻牌自曝強制入夜', () => {
    const seats = makeSeats(['fool_seer', 'iron_good', 'villager', 'wolf', 'witch']);

    const nightRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), foolSeerCheckTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(nightRes.foolSeerResult?.faction).toBe('wolf');

    const explodeRes = resolveGoodSelfExplode(
      seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(explodeRes.allowed).toBe(true);
    expect(explodeRes.enterNightImmediately).toBe(true);
    expect(explodeRes.seats[0].isAlive).toBe(false);
    expect(explodeRes.seats[0].deathReason).toBe('good_self_explode');

    const ironRes = resolveGoodSelfExplode(
      seats,
      2,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(ironRes.allowed).toBe(true);
    expect(ironRes.seats[1].isAlive).toBe(false);

    // 普通平民不可使用好人自曝
    const villagerRes = resolveGoodSelfExplode(
      seats,
      3,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(villagerRes.allowed).toBe(false);
  });

  it('狐狸（fox）：查驗目標與左右存活鄰居，三人皆好人則永久失能', () => {
    const seats = makeSeats(['fox', 'villager', 'witch', 'guard', 'wolf']);

    // 查 4 號：鄰居為 3 號（witch）、5 號（wolf）→ 含狼，保留能力
    const hitWolf = getFoxCheckResult(seats, 4, false);
    expect(hitWolf?.hasWolf).toBe(true);
    expect(hitWolf?.lostAbility).toBe(false);

    // 查 2 號：鄰居為 1 號（fox）、3 號（witch）→ 全好人，永久失能
    const allGood = getFoxCheckResult(seats, 2, false);
    expect(allGood?.hasWolf).toBe(false);
    expect(allGood?.lostAbility).toBe(true);

    // 失能後不可再查驗
    expect(getFoxCheckResult(seats, 4, true)).toBeNull();
  });

  it('雪狼（snow_wolf）：預言家驗金水、通靈師驗雪狼、可自爆', () => {
    const seats = makeSeats(['snow_wolf', 'seer', 'psychic', 'villager']);
    expect(getSeerCheckResult(seats, 1)?.faction).toBe('good');
    expect(resolveSelfExplode(seats, 1).allowed).toBe(true);
  });

  it('咒狐（cursed_fox）：免疫狼刀、被預言家/覺醒預言家驗死、攝夢保護不死、結算存活或同死單獨勝', () => {
    const seats = makeSeats(['cursed_fox', 'seer', 'wolf', 'villager', 'dream_catcher']);

    // 狼刀咒狐無效
    const res1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(res1.seats[0].isAlive).toBe(true);

    // 預言家查驗咒狐顯示好人且咒狐死亡
    const res2 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), seerCheckTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(res2.seerResult?.faction).toBe('good');
    expect(res2.seats[0].isAlive).toBe(false);
    expect(res2.seats[0].deathReason).toBe('cursed_fox_checked');

    // 攝夢人保護咒狐時，預言家驗咒狐不會死
    const res3 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), seerCheckTarget: 1, dreamCatcherTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(res3.seats[0].isAlive).toBe(true);

    // 雲端探查 Q&A：最後一民被刀且咒狐同晚被驗死 → 咒狐單獨勝
    const res4 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 4, seerCheckTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(res4.victory.winner).toBe('third_party');
  });

  it('石像鬼（gargoyle）與南瓜鬼（pumpkin_ghost）：入隊、金水轉查殺、繼承歷史查驗紀錄與驗人', () => {
    const seats = makeSeats(['gargoyle', 'pumpkin_ghost', 'seer', 'witch', 'villager']);

    // 石像鬼不可自爆
    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);
    // 石像鬼存活時，預言家驗南瓜鬼為金水、驗石像鬼為查殺
    expect(getSeerCheckResult(seats, 2)?.faction).toBe('good');
    expect(getSeerCheckResult(seats, 1)?.faction).toBe('wolf');

    // 第 1 晚石像鬼查 4 號（witch），同時女巫毒死石像鬼
    const res1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), gargoyleCheckTarget: 4, witchPoisonTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(res1.gargoyleResult?.perceivedRoleId).toBe('witch');
    expect(res1.gargoyleState.checkHistory).toHaveLength(1);
    expect(res1.pumpkinGhostState.hasInherited).toBe(true);
    expect(res1.pumpkinGhostState.inheritedHistory[0].perceivedRoleId).toBe('witch');

    // 石像鬼死後，預言家驗南瓜鬼轉為查殺；南瓜鬼可發動具體底牌查驗
    expect(getSeerCheckResult(res1.seats, 2)?.faction).toBe('wolf');
    const res2 = resolveNight({
      seats: res1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), pumpkinGhostCheckTarget: 3 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: true,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      gargoyleState: res1.gargoyleState,
      pumpkinGhostState: res1.pumpkinGhostState,
    });
    expect(res2.pumpkinGhostResult?.perceivedRoleId).toBe('seer');

    // 其他狼全滅時石像鬼自動入隊
    const soloGargoyleSeats = makeSeats(['gargoyle', 'wolf', 'villager', 'seer']);
    soloGargoyleSeats[1].isAlive = false;
    const synced = syncGargoyleTeamStatus(soloGargoyleSeats, createInitialGargoyleState());
    expect(synced.hasJoinedWolfTeam).toBe(true);
    expect(
      syncPumpkinGhostInheritance(soloGargoyleSeats, synced, createInitialPumpkinGhostState())
        .hasInherited,
    ).toBe(false);
  });

  it('狼巫（wolf_witch）與純白之女（pure_white_maiden）：首夜只驗不殺、第 2 晚起驗殺、同晚互驗狼刀在先、純白驗機械狼', () => {
    const seats = makeSeats(['wolf_witch', 'pure_white_maiden', 'villager', 'villager']);

    // 第 1 晚互驗皆不出局
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfWitchCheckTarget: 2, pureWhiteCheckTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.deaths).toHaveLength(0);
    expect(n1.wolfWitchResult?.perceivedRoleId).toBe('pure_white_maiden');
    expect(n1.pureWhiteResult?.perceivedRoleId).toBe('wolf_witch');

    // 第 2 晚同晚互驗（最後一狼狼巫 vs 最後一神純白之女）→ Q&A：狼刀在先判狼人勝
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), wolfWitchCheckTarget: 2, pureWhiteCheckTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[0].isAlive).toBe(false);
    expect(n2.seats[1].isAlive).toBe(false);
    expect(n2.victory.winner).toBe('wolf');

    // 雲端探查 Q&A：純白之女第 2 晚驗已學習平民的機械狼 → 顯示平民且不出局
    const mechSeats = makeSeats(['pure_white_maiden', 'mech_wolf', 'villager', 'wolf']);
    const mechState = { ...createInitialMechWolfState(), learnedFromSeat: 3, learnedRoleId: 'villager' };
    const nMech = resolveNight({
      seats: mechSeats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), pureWhiteCheckTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: mechState,
      pendingSelfExplodeSeat: null,
    });
    expect(nMech.pureWhiteResult?.perceivedRoleId).toBe('villager');
    expect(nMech.seats[1].isAlive).toBe(true);
  });

  it('惡魔（demon_wolf）：不可自刀自爆、查驗神/民、免疫夜毒與夜死獵人開槍（白天放逐獵人可帶走）', () => {
    const seats = makeSeats(['demon_wolf', 'witch', 'hunter', 'villager']);

    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);
    expect(getDemonWolfCheckResult(seats, 2)?.roleType).toBe('god');
    expect(getDemonWolfCheckResult(seats, 4)?.roleType).toBe('villager');

    // 惡魔免疫女巫毒藥
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), witchPoisonTarget: 1, demonWolfCheckTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[0].isAlive).toBe(true);
    expect(n1.demonWolfResult?.roleType).toBe('god');

    // 不可自刀
    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), wolfTarget: 1 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      }),
    ).toThrow('惡魔不可自刀');

    // 夜死獵人開槍射惡魔無效；白天放逐獵人開槍射惡魔有效
    const nightShoot = resolveShoot(
      seats,
      3,
      1,
      'wolf_kill',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(nightShoot.targetSurvived).toBe(true);
    expect(nightShoot.seats[0].isAlive).toBe(true);

    const dayShoot = resolveShoot(
      seats,
      3,
      1,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(dayShoot.targetSurvived).toBeUndefined();
    expect(dayShoot.seats[0].isAlive).toBe(false);
  });

  it('守墓人（gravekeeper）與超級守墓人（super_gravekeeper）：第 2 晚查放逐陣營（隱狼/南瓜鬼為狼、咒狐為好）與好人繼承', () => {
    const exiledHistory: ExiledRecord[] = [
      { round: 1, seatNumber: 2, roleId: 'pumpkin_ghost' },
      { round: 2, seatNumber: 3, roleId: 'cursed_fox' },
    ];
    expect(getGravekeeperExileResult(exiledHistory, 1).faction).toBeNull();
    expect(getGravekeeperExileResult(exiledHistory, 2).faction).toBe('wolf');
    expect(getGravekeeperExileResult(exiledHistory, 3).faction).toBe('good');

    const seats = makeSeats(['super_gravekeeper', 'villager', 'wolf']);
    seats[0].isAlive = false;
    const state = { ...createInitialSuperGravekeeperState(), heirSeat: 2 };
    const synced = syncSuperGravekeeperInheritance(seats, state);
    expect(synced.heirInherited).toBe(true);
    expect(synced.superGravekeeperSeat).toBe(1);

    // 若繼承者為狼人則不觸發繼承
    const wolfHeir = syncSuperGravekeeperInheritance(seats, {
      ...createInitialSuperGravekeeperState(),
      heirSeat: 3,
    });
    expect(wolfHeir.heirInherited).toBe(false);
  });

  it('月靈狼（moon_spirit_wolf）：左右存活鄰居含神職則嗥叫，被夢魘恐懼則不嗥叫', () => {
    const seats = makeSeats(['villager', 'moon_spirit_wolf', 'witch', 'wolf']);
    expect(evaluateMoonSpiritHowl(seats, null).howled).toBe(true);
    expect(evaluateMoonSpiritHowl(seats, 2).howled).toBe(false); // 遭夢魘恐懼

    // 3 號神職出局後，左右存活鄰居變成 1 號（民）與 4 號（狼）→ 不嗥叫
    seats[2].isAlive = false;
    expect(evaluateMoonSpiritHowl(seats, null).howled).toBe(false);
  });

  it('九尾狐（nine_tailed_fox）：僅計已公布死亡（不含當晚未公布死訊），神 -2、民 -1、歸零出局', () => {
    const seats = makeSeats([
      'nine_tailed_fox',
      'seer',
      'witch',
      'hunter',
      'guard',
      'villager',
      'wolf',
    ]);
    // 假設第 1 輪已公布 4 神 1 民死亡（4*2 + 1 = 9 條尾巴全失）
    seats[1].isAlive = false;
    seats[1].deathRound = 1;
    seats[2].isAlive = false;
    seats[2].deathRound = 1;
    seats[3].isAlive = false;
    seats[3].deathRound = 1;
    seats[4].isAlive = false;
    seats[4].deathRound = 1;
    seats[5].isAlive = false;
    seats[5].deathRound = 1;

    // 第 1 晚本身還沒公布死訊 → 剩餘 9 條
    expect(evaluateNineTailedFoxTails(seats, 1).tailsRemaining).toBe(9);
    // 第 2 晚已公布 → 歸零且死亡
    const n2 = evaluateNineTailedFoxTails(seats, 2);
    expect(n2.tailsRemaining).toBe(0);
    expect(n2.diedFromNoTails).toBe(true);
  });

  it('高級平民（senior_villager）：第一天死訊後公布，首夜被種狼感染則不公布', () => {
    const seats = makeSeats(['senior_villager', 'seed_wolf', 'villager', 'witch']);
    expect(evaluateSeniorVillagerReveal(seats, 1).revealed).toBe(true);
    expect(evaluateSeniorVillagerReveal(seats, 2).revealed).toBe(false);

    seats[0].infectedBySeedWolf = true;
    expect(evaluateSeniorVillagerReveal(seats, 1).revealed).toBe(false);
  });

  it('覺醒攝夢人（awakened_dream_catcher）：夢語免疫夜傷且不奶穿、行動偵測（守墓人必動/獵民不動）、第 2 晚可夢語出局且封槍', () => {
    const seats = makeSeats(['awakened_dream_catcher', 'hunter', 'gravekeeper', 'wolf', 'witch']);

    // 第 1 晚夢語獵人（無行動），同時狼刀獵人＋女巫救獵人 → Q&A 不奶穿，獵人存活
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        awakenedDreamTarget: 2,
        wolfTarget: 2,
        witchUseAntidote: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[1].isAlive).toBe(true);
    expect(n1.awakenedDreamResult?.didActTonight).toBe(false);

    // 第 2 晚改夢語守墓人（必有行動）並選擇夢語出局
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        awakenedDreamTarget: 3,
        awakenedDreamKillTarget: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: true,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      lastAwakenedDreamTarget: n1.lastAwakenedDreamTarget,
    });
    expect(n2.awakenedDreamResult?.didActTonight).toBe(true);
    expect(n2.seats[2].isAlive).toBe(false);
    expect(n2.seats[2].deathReason).toBe('awakened_dream_catcher_kill');
  });
});
