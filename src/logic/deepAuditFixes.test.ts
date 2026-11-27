import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  checkCanShoot,
  checkVictory,
  createEmptyNightDraft,
  createInitialConversionState,
  createInitialInterferenceState,
  createInitialMechWolfState,
  createInitialThirdPartySpecialState,
  evaluateBearRoar,
  getBatch5ExileExtraVotes,
  getDefaultRuleOverridesForBoard,
  isSeatEffectiveWolf,
  resolveDayExile,
  resolveDetectiveCollectiveAccusation,
  resolveNight,
  resolveSelfExplode,
  syncConversionOnDeaths,
} from './index';
import type { PlayerSeat } from './types';

function makeSeat(
  seatNumber: number,
  roleId: string,
  extra: Partial<PlayerSeat> = {},
): PlayerSeat {
  return {
    seatNumber,
    nickname: `${seatNumber}號`,
    roleId,
    isAlive: true,
    statuses: {},
    ...extra,
  };
}

describe('深度規則體檢修復驗證（開膛手傑克雙板、睡美人獨勝、多變體與 Q&A 邊界）', () => {
  it('開膛手傑克板子 A（主身分版）：第 1 晚即可直接殺人、可被守衛擋下、無視女巫解藥，且剩單一性別獨勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf', { gender: 'male' }),
      makeSeat(2, 'guard', { gender: 'male' }),
      makeSeat(3, 'witch', { gender: 'male' }),
      makeSeat(4, 'jack_the_ripper', { gender: 'male' }),
      makeSeat(5, 'villager', { gender: 'female' }),
      makeSeat(6, 'seer', { gender: 'female' }),
      makeSeat(7, 'villager', { gender: 'male' }),
    ];

    // 1. 第 1 晚傑克直接刀 5 號（無守衛守護），即使女巫對狼刀 6 號用解藥，5 號仍死於傑克
    const night1 = resolveNight({
      seats,
      round: 1,
      boardId: '12p-jack-the-ripper',
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 6,
        wolfTarget: 6,
        jackRipperKillTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: createInitialConversionState(),
    });
    expect(night1.deaths).toContainEqual({ seat: 5, reason: 'jack_ripper_kill' });
    expect(night1.seats.find((s) => s.seatNumber === 6)?.isAlive).toBe(true);
    expect(night1.victory.winner).toBeNull(); // 仍有 6 號女性存活

    // 2. 第 2 晚：守衛守護 6 號可擋下開膛手傑克之刀
    const night2Guarded = resolveNight({
      seats: night1.seats,
      round: 2,
      boardId: '12p-jack-the-ripper',
      draft: {
        ...createEmptyNightDraft(2),
        guardTarget: 6,
        jackRipperKillTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: night1.conversionState,
    });
    expect(night2Guarded.seats.find((s) => s.seatNumber === 6)?.isAlive).toBe(true);

    // 3. 第 3 晚：傑克擊殺最後一位女性 6 號 → 場上僅剩男性，開膛手傑克（第三方）獲勝！
    const night3Win = resolveNight({
      seats: night2Guarded.seats,
      round: 3,
      boardId: '12p-jack-the-ripper',
      draft: {
        ...createEmptyNightDraft(3),
        guardTarget: 2,
        jackRipperKillTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: 6,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: night2Guarded.conversionState,
    });
    expect(night3Win.victory.winner).toBe('third_party');
    expect(night3Win.victory.winReason).toContain('單一性別');
  });

  it('開膛手傑克板子 B（第二身分版）：首夜選狂熱粉、任一方死後傑克出局仍可殺、已出局偵探集結指證成功則第三方失敗', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf', { gender: 'male', secondRoleId: 'detective' }),
      makeSeat(2, 'guard', { gender: 'male', secondRoleId: 'detective' }),
      makeSeat(3, 'villager', { gender: 'male', secondRoleId: 'jack_the_ripper' }),
      makeSeat(4, 'villager', { gender: 'male', secondRoleId: 'detective' }),
      makeSeat(5, 'seer', { gender: 'female', secondRoleId: 'detective' }),
      makeSeat(6, 'witch', { gender: 'female', secondRoleId: 'detective' }),
    ];

    // 第一晚：傑克（3 號）選 4 號偵探為狂熱粉，4 號偵探身分自動失效
    const n1 = resolveNight({
      seats,
      round: 1,
      boardId: '12p-jack-the-ripper-2',
      draft: {
        ...createEmptyNightDraft(1),
        jackRipperFanaticTarget: 4,
        wolfTarget: 3, // 狼人刀死開膛手傑克 3 號 → 解鎖擊殺！
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: createInitialConversionState(),
    });
    expect(n1.conversionState?.jackRipperFanaticSeat).toBe(4);
    expect(n1.seats.find((s) => s.seatNumber === 4)?.secondRoleId).toBe('fanatic');
    expect(n1.seats.find((s) => s.seatNumber === 3)?.isAlive).toBe(false);
    expect(n1.conversionState?.jackRipperKillUnlocked).toBe(true);

    // 第二晚：傑克已出局但已解鎖，仍可擊殺 5 號女性
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      boardId: '12p-jack-the-ripper-2',
      draft: {
        ...createEmptyNightDraft(2),
        wolfTarget: 2, // 狼人再刀死 2 號偵探（此時已出局偵探有 2 號與 5 號共 2 位）
        jackRipperKillTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      conversionState: n1.conversionState,
    });
    expect(n2.seats.find((s) => s.seatNumber === 5)?.isAlive).toBe(false);

    // 白天：已出局偵探（2 號、5 號共 2 人）集結指證：若只 0 人同意則失敗，1 人同意（≥半數）指證 3 號成功 → 第三方陣營失敗
    const failAgree = resolveDetectiveCollectiveAccusation(n2.seats, n2.conversionState!, 3, 0);
    expect(failAgree.allowed).toBe(false);

    const accuseOk = resolveDetectiveCollectiveAccusation(n2.seats, n2.conversionState!, 3, 1);
    expect(accuseOk.allowed).toBe(true);
    expect(accuseOk.success).toBe(true);
    expect(accuseOk.state.jackRipperThirdPartyDefeated).toBe(true);

    // 即使之後最後一位女性 6 號也出局，因為偵探已指證成功，開膛手傑克不可再獲勝
    const onlyMalesLeft = n2.seats.map((s) =>
      s.seatNumber === 6 ? { ...s, isAlive: false, deathReason: 'exiled' as const } : s,
    );
    const v = checkVictory(onlyMalesLeft, DEFAULT_RULE_OVERRIDES, undefined, {
      conversionState: accuseOk.state,
      boardId: '12p-jack-the-ripper-2',
    });
    expect(v.winner).not.toBe('third_party');
  });

  it('睡美人獨立勝利覆蓋：好人或狼人達標時若睡美人仍存活且未被驗醒，由睡美人單獨獲勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf', { isAlive: false, deathReason: 'exiled' }),
      makeSeat(2, 'villager', { isAlive: true }),
      makeSeat(3, 'seer', { isAlive: true }),
    ];
    const tpState = {
      ...createInitialThirdPartySpecialState(),
      sleepingBeautySeat: 2,
      sleepingBeautyAwakened: false,
    };

    const winSleeping = checkVictory(seats, DEFAULT_RULE_OVERRIDES, undefined, {
      thirdPartySpecialState: tpState,
    });
    expect(winSleeping.winner).toBe('third_party');
    expect(winSleeping.winReason).toContain('睡美人');

    // 若已被異族王子驗醒，則回歸好人勝利
    const winAwakened = checkVictory(seats, DEFAULT_RULE_OVERRIDES, undefined, {
      thirdPartySpecialState: { ...tpState, sleepingBeautyAwakened: true },
    });
    expect(winAwakened.winner).toBe('good');
  });

  it('白天放逐傳遞 conversionState 並正確同步野孩子變狼與情侶殉情', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wild_child'),
      makeSeat(3, 'villager'),
      makeSeat(4, 'seer'),
    ];
    const conv = {
      ...createInitialConversionState(),
      wildChildIdolSeat: 3,
      wildChildTurnedWolf: true,
      cupidLovers: [1, 4] as [number, number],
      cupidAffiliation: 'third_party' as const,
    };
    expect(isSeatEffectiveWolf(seats[1], { conversionState: conv })).toBe(true);

    // 白天放逐 1 號狼人，雖然原生狼死光，但野孩子已變狼，好人尚未獲勝；且 4 號情侶殉情導致屠神 → 狼人勝
    const exileRes = resolveDayExile(
      seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
      null,
      undefined,
      undefined,
      { conversionState: conv },
    );
    expect(exileRes.victory.winner).toBeNull(); // 野孩子仍是狼，好人還沒贏
    const synced = syncConversionOnDeaths(exileRes.seats, conv, 1);
    expect(synced.seats.find((s) => s.seatNumber === 4)?.isAlive).toBe(false);
    const finalVictory = checkVictory(synced.seats, DEFAULT_RULE_OVERRIDES, undefined, {
      conversionState: synced.state,
    });
    expect(finalVictory.winner).toBe('wolf');
  });

  it('戰狼全板不可自爆、獵人局任意出局皆可開槍、烏鴉自動加票與預設規則對齊', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'war_wolf'),
      makeSeat(2, 'hunter', { isAlive: false, deathReason: 'witch_poison' }),
      makeSeat(3, 'villager'),
    ];
    const explodeCheck = resolveSelfExplode(seats, 1);
    expect(explodeCheck.allowed).toBe(false);
    expect(explodeCheck.reason).toContain('戰狼');

    const hunterClassic = checkCanShoot(seats, 2, 'witch_poison');
    expect(hunterClassic?.canShoot).toBe(false);
    const hunterFun = checkCanShoot(seats, 2, 'witch_poison', { boardId: 'multi-hunter' });
    expect(hunterFun?.canShoot).toBe(true);

    const crowVotes = getBatch5ExileExtraVotes({
      ...createInitialThirdPartySpecialState(),
      crowActiveCursedSeat: 3,
    });
    expect(crowVotes[3]).toBe(1);

    expect(getDefaultRuleOverridesForBoard('12p-hybrid').hybridCountsAsVillager).toBe(true);
    expect(getDefaultRuleOverridesForBoard('multi-avenger-shadow').idiotNeedsExtraKill).toBe(true);
    expect(getDefaultRuleOverridesForBoard('12p-cupid').victoryMode).toBe('slaughter_all');
  });

  it('邱比特奇緣 Q&A #5/#6（蝕時狼妃封鎖守衛反彈自守與不奶穿）與風聲諜影熊咆哮涵蓋轉化者', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'time_eclipse_consort'),
      makeSeat(2, 'guard'),
      makeSeat(3, 'witch'),
      makeSeat(4, 'villager'),
      makeSeat(5, 'dream_catcher'),
      makeSeat(6, 'bear'),
      makeSeat(7, 'villager', { statuses: { convertedByAwakenedGargoyle: true } }),
    ];

    // 狼刀 4 號（被蝕時狼妃封鎖），守衛守 4 號被反彈為自守，女巫救 4 號 → 4 號不奶穿存活！且 lastGuardedSeat 記原目標 4 號
    const res = resolveNight({
      seats,
      round: 1,
      boardId: '12p-cupid',
      draft: {
        ...createEmptyNightDraft(1),
        timeEclipseTarget: 4,
        guardTarget: 4,
        wolfTarget: 4,
        witchUseAntidote: true,
        dreamCatcherTarget: 4,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      interferenceState: createInitialInterferenceState(),
    });
    expect(res.seats.find((s) => s.seatNumber === 4)?.isAlive).toBe(true);
    expect(res.lastGuardedSeat).toBe(4); // 次晚可自守，但不可再守 4 號

    // 熊右鄰 7 號為覺醒石像鬼轉化者 → 熊咆哮
    const bearRes = evaluateBearRoar(seats, createInitialMechWolfState());
    expect(bearRes?.roared).toBe(true);
  });
});
