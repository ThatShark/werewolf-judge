import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canThiefChooseCard,
  createEmptyNightDraft,
  createInitialMechWolfState,
  getSeerCheckResult,
  resolveAvengerAssassinate,
  resolveDayExile,
  resolveNight,
  resolveSelfExplode,
  syncConversionOnDeaths,
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

describe('第 4 批：死亡連帶、首夜認主、換牌與陣營轉換類角色（17 角色）', () => {
  it('邱比特（cupid）與鬼魂新娘（ghost_bride）：人狼戀第三方歸屬、殉情連帶與屠城勝利', () => {
    const seats = makeSeats(['cupid', 'wolf', 'villager', 'seer', 'villager']);
    expect(getSeerCheckResult(seats, 1)?.faction).toBe('good');

    // 首夜連 2 號（狼）與 3 號（民）→ 人狼戀第三方；同時狼刀 3 號 → 2 號殉情
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), cupidLoversPair: [2, 3], wolfTarget: 3 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.conversionState.cupidAffiliation).toBe('third_party');
    expect(n1.seats[2].isAlive).toBe(false);
    expect(n1.seats[1].isAlive).toBe(false);
    expect(n1.seats[1].deathReason).toBe('cupid_lover_link');

    // 鬼魂新娘首夜選 2 號新郎、3 號證婚人；若場上僅剩此三人存活 → 第三方屠城勝
    const gbSeats = makeSeats(['ghost_bride', 'villager', 'seer', 'wolf']);
    const gbN1 = resolveNight({
      seats: gbSeats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        ghostBrideGroomTarget: 2,
        ghostBrideWitnessTarget: 3,
        wolfTarget: 4, // 狼自刀 → 場上只剩新娘＋新郎＋證婚人
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(gbN1.victory.winner).toBe('third_party');
  });

  it('尋香魅影（scent_phantom）與雙子（twins）：鏈子殉情限一次、雙子同生共死與隔晚守護', () => {
    const seats = makeSeats(['scent_phantom', 'twins', 'twins', 'wolf', 'villager', 'villager']);
    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

    // 尋香魅影鏈 5 & 6，狼刀 5 → 6 號殉情且鏈子標記已觸發
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), scentPhantomChainPair: [5, 6], wolfTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[4].isAlive).toBe(false);
    expect(n1.seats[5].isAlive).toBe(false);
    expect(n1.conversionState.scentPhantomTriggered).toBe(true);

    // 雙子 2 號被刀 → 3 號跟隨出局；下一晚雙子共同守護 5 號擋住狼刀
    const twN1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(twN1.seats[1].isAlive).toBe(false);
    expect(twN1.seats[2].isAlive).toBe(false);
    expect(twN1.conversionState.twinsDeadRound).toBe(1);

    const twN2 = resolveNight({
      seats: twN1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), twinsGuardTarget: 5, wolfTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: twN1.conversionState,
    });
    expect(twN2.seats[4].isAlive).toBe(true);
    expect(twN2.conversionState.twinsGuardUsed).toBe(true);
  });

  it('白蛇預言家（white_snake_seer）與許仙尋香魅影（xu_xian_phantom）：預言家驗狼、驗中解鎖靈襲、綁定雙死第三方直接勝', () => {
    const seats = makeSeats(['white_snake_seer', 'xu_xian_phantom', 'wolf', 'villager', 'villager']);
    expect(getSeerCheckResult(seats, 1)?.faction).toBe('wolf');
    expect(getSeerCheckResult(seats, 2)?.faction).toBe('wolf');

    // 第 1 晚白蛇驗 2 號（許仙）解鎖靈襲；許仙綁 1 & 2 且狼刀 1 號 → 雙死觸發第三方直接獲勝
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        whiteSnakeTarget: 2,
        xuXianBindPair: [1, 2],
        wolfTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.conversionState.whiteSnakeUnlockedAttack).toBe(true);
    expect(n1.conversionState.xuXianThirdPartyInstantWin).toBe(true);
    expect(n1.victory.winner).toBe('third_party');
  });

  it('覺醒石像鬼（awakened_gargoyle）、覺醒孤獨少女（awakened_lonely_girl）與野孩子（wild_child）：相鄰轉化、偶像放逐變狼／夜死繼承', () => {
    const seats = makeSeats([
      'awakened_gargoyle',
      'villager',
      'awakened_lonely_girl',
      'wild_child',
      'seer',
      'witch',
    ]);

    // 覺醒石像鬼首夜轉化隔壁 2 號（平民）；覺醒孤獨少女選 5 號為偶像；野孩子選 6 號為榜樣
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        awakenedGargoyleConvertTarget: 2,
        awakenedLonelyGirlIdolTarget: 5,
        wildChildIdolTarget: 6,
        wolfTarget: 6, // 6 號夜死 → 野孩子立即變身狼人
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[1].convertedByAwakenedGargoyle).toBe(true);
    expect(getSeerCheckResult(n1.seats, 2)?.faction).toBe('wolf');
    expect(n1.conversionState.wildChildTurnedWolf).toBe(true);

    // 白天放逐 5 號（覺醒孤獨少女偶像）→ 覺醒孤獨少女變身為狼人
    const exile5 = resolveDayExile(
      n1.seats,
      5,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    const synced = syncConversionOnDeaths(exile5.seats, n1.conversionState, 1);
    expect(synced.state.awakenedLonelyGirlStatus).toBe('wolf');
  });

  it('影子（shadow）、復仇者（avenger）、傀儡（puppet_wolf）、殭屍（zombie）、百變狼王、盜賊與開膛手傑克', () => {
    // 影子選 4 號（狼）為主人 → 復仇者對立歸屬好人；復仇者出局刺中未變身影子 → 復仇者獨自勝利
    const shSeats = makeSeats(['shadow', 'avenger', 'villager', 'wolf', 'seer']);
    const shN1 = resolveNight({
      seats: shSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), shadowMasterTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(shN1.conversionState.avengerAlignedFaction).toBe('good');
    const avRes = resolveAvengerAssassinate(shN1.seats, shN1.conversionState, 1, 1);
    expect(avRes.instantVictory.winner).toBe('third_party');

    // 傀儡首夜選隔壁 2 號 → 2 號被預言家驗查殺
    const pupSeats = makeSeats(['puppet_wolf', 'villager', 'seer', 'witch']);
    const pupN1 = resolveNight({
      seats: pupSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), puppetTarget: 2, seerCheckTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(pupN1.seats[1].isPuppetized).toBe(true);
    expect(pupN1.seerResult?.faction).toBe('wolf');

    // 殭屍每晚感染 2 人（場上其他存活皆被感染 → 殭屍單獨獲勝）
    const zSeats = makeSeats(['zombie', 'villager', 'wolf']);
    const zN1 = resolveNight({
      seats: zSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), zombieInfectTargets: [2, 3] },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(zN1.victory.winner).toBe('third_party');

    // 盜賊選牌：含狼必選狼、雙狼重開
    expect(canThiefChooseCard(['wolf', 'villager'], 'villager').allowed).toBe(false);
    expect(canThiefChooseCard(['wolf', 'villager'], 'wolf').allowed).toBe(true);
    expect(canThiefChooseCard(['wolf', 'wolf_king'], 'wolf').allowed).toBe(false);

    // 開膛手傑克選 2 號為狂熱粉，2 號出局後解鎖擊殺
    const jSeats = makeSeats(['jack_the_ripper', 'fanatic', 'wolf', 'villager', 'villager']);
    const jN1 = resolveNight({
      seats: jSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), jackRipperFanaticTarget: 2, wolfTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(jN1.conversionState.jackRipperKillUnlocked).toBe(true);
    const jN2 = resolveNight({
      seats: jN1.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), jackRipperKillTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: jN1.conversionState,
    });
    expect(jN2.seats[3].isAlive).toBe(false);
    expect(jN2.seats[3].deathReason).toBe('jack_ripper_kill');
  });
});
