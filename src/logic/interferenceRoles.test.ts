import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialInterferenceState,
  createInitialMechWolfState,
  resolveAlchemySnakeRevive,
  resolveDayExile,
  resolveKnightDuel,
  resolveNight,
  resolveSelfExplode,
  resolveShoot,
  resolveWhiteCatDelayedDeath,
  tallyExileVotes,
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

describe('第 2 批：干擾、封鎖、目標交換與特殊守護類角色（21 角色）', () => {
  it('魔術師（magician）、狼術師（wolf_warlock）與詭術師（trickster_wolf）：目標對調、整局限一次與同換抵銷、隔天換票', () => {
    const seats = makeSeats(['magician', 'villager', 'seer', 'wolf', 'trickster_wolf', 'witch']);

    // 魔術師換 2 & 3：狼刀 2 實際死 3；預言家驗 2 實際驗 3（seer -> good）
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        magicianSwapPair: [2, 3],
        wolfTarget: 2,
        seerCheckTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[1].isAlive).toBe(true);
    expect(n1.seats[2].isAlive).toBe(false);
    expect(n1.seerResult?.targetSeat).toBe(3);

    // 整局每號碼僅能交換一次
    expect(() =>
      resolveNight({
        seats,
        round: 2,
        draft: { ...createEmptyNightDraft(2), magicianSwapPair: [2, 6] },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        interferenceState: n1.interferenceState,
      }),
    ).toThrow('不可重複交換');

    // 魔術師與詭術師換相同 2 號（2, 3）→ 相互抵銷，狼刀 2 仍死 2，隔天不換票
    const cancelRes = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        magicianSwapPair: [2, 3],
        tricksterSwapPair: [3, 2],
        wolfTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(cancelRes.seats[1].isAlive).toBe(false);
    expect(cancelRes.interferenceState.activeTricksterVoteSwap).toBeNull();

    // 詭術師單獨換 2 & 4 → 白天投票 2 號得 2 票、4 號得 0 票，對調後 4 號出局
    const trickRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), tricksterSwapPair: [2, 4] },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    const tally = tallyExileVotes({
      seats: trickRes.seats,
      votes: { 1: 2, 3: 2 },
      tricksterVoteSwap: trickRes.interferenceState.activeTricksterVoteSwap,
    });
    expect(tally.record.electedSeat).toBe(4);

    // 詭術師整局每個號碼牌只能交換一次（跨夜也不可重複選取已交換過的號碼）
    expect(() =>
      resolveNight({
        seats: trickRes.seats,
        round: 2,
        draft: { ...createEmptyNightDraft(2), tricksterSwapPair: [2, 6] },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        interferenceState: trickRes.interferenceState,
      }),
    ).toThrow('不可重複交換');

    // 第 2 夜可選擇尚未交換過的 1 & 6，且隔兩夜仍不可再選第 1 夜已換過的 2 號
    const trickRes2 = resolveNight({
      seats: trickRes.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), tricksterSwapPair: [1, 6] },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      interferenceState: trickRes.interferenceState,
    });
    expect(() =>
      resolveNight({
        seats: trickRes2.seats,
        round: 3,
        draft: { ...createEmptyNightDraft(3), tricksterSwapPair: [2, 3] },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        interferenceState: trickRes2.interferenceState,
      }),
    ).toThrow('不可重複交換');

    // 狼術師單獨換 2 & 3：狼刀 2 實際死 3
    const warlockSeats = makeSeats(['wolf_warlock', 'villager', 'seer', 'witch']);
    const wRes = resolveNight({
      seats: warlockSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfWarlockSwapPair: [2, 3], wolfTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(wRes.seats[1].isAlive).toBe(true);
    expect(wRes.seats[2].isAlive).toBe(false);
  });

  it('搗蛋鬼（troublemaker_wolf）與蝕時狼妃（time_eclipse_consort）：技能反彈自己、守衛連自守死、狼妃一次性封鎖', () => {
    const seats = makeSeats([
      'troublemaker_wolf',
      'guard',
      'witch',
      'wolf',
      'time_eclipse_consort',
      'villager',
    ]);

    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

    // 搗蛋鬼耍寶守衛，守衛原本上晚已自守 → 今晚被耍寶自守連兩晚，守衛出局
    const tmRes = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), troublemakerTarget: 2, guardTarget: 6 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: 2,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(tmRes.seats[1].isAlive).toBe(false);
    expect(tmRes.seats[1].deathReason).toBe('troublemaker_self_guard');

    // 蝕時狼妃封鎖 4 號：女巫毒 4 號 → 反彈毒死女巫自己，且封鎖生效一次後失效
    const teRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), timeEclipseTarget: 4, witchPoisonTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(teRes.seats[2].isAlive).toBe(false); // 女巫自毒
    expect(teRes.seats[3].isAlive).toBe(true); // 4 號存活
    expect(teRes.interferenceState.timeEclipseUsed).toBe(true);
  });

  it('企鵝（penguin）、子狐（fox_cub）、禁言長老（mute_elder）與梅杜莎（medusa）：冰凍封刀、魅惑封刀、禁言、石化反彈毒與禁投票', () => {
    const seats = makeSeats([
      'penguin',
      'fox_cub',
      'mute_elder',
      'medusa',
      'wolf',
      'witch',
      'idiot',
    ]);

    // 企鵝冰凍狼人 5 號 → 狼隊全體空刀；禁言長老禁言 7 號；梅杜莎石化 7 號（白痴）
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        penguinFreezeTarget: 5,
        wolfTarget: 6,
        muteElderTarget: 7,
        medusaPetrifyTarget: 7,
        witchPoisonTarget: 7, // 女巫毒被石化的 7 號 → 反彈女巫死
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[5].isAlive).toBe(false);
    expect(n1.seats[5].deathReason).toBe('medusa_poison_reflect');
    expect(n1.seats[6].isAlive).toBe(true);
    expect(n1.seats[6].statuses.muted).toBe(true);
    expect(n1.seats[6].statuses.petrified).toBe(true);

    // 石化中的 7 號（白痴）不可投票且放逐不可翻牌
    expect(() => tallyExileVotes({ seats: n1.seats, votes: { 7: 4 } })).toThrow('石化');
    const exileIdiot = resolveDayExile(
      n1.seats,
      7,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(exileIdiot.idiotRevealed).toBe(false);
    expect(exileIdiot.seats[6].isAlive).toBe(false);

    // 子狐第 2 晚魅惑狼人 → 狼隊空刀且技能消耗
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), foxCubCharmTarget: 5, wolfTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[0].isAlive).toBe(true);
    expect(n2.interferenceState.foxCubUsed).toBe(true);
  });

  it('寂夜導師（silent_night_mentor）與白晝學者（daylight_scholar）：衝突致死、同選小狼導師死、女巫削弱仍可用解藥', () => {
    const seats = makeSeats(['silent_night_mentor', 'daylight_scholar', 'witch', 'wolf', 'villager']);

    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

    // 同晚對 5 號施放技能 → 5 號死亡
    const clashRes = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        silentNightMentorMode: 'amplify',
        silentNightMentorTarget: 5,
        daylightScholarMode: 'weaken',
        daylightScholarTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(clashRes.seats[4].isAlive).toBe(false);
    expect(clashRes.seats[4].deathReason).toBe('mentor_scholar_clash');

    // Q&A：女巫被削弱僅禁毒，仍可使用解藥救活 5 號
    const weakenWitchRes = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        silentNightMentorMode: 'weaken',
        silentNightMentorTarget: 3,
        wolfTarget: 5,
        witchUseAntidote: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(weakenWitchRes.seats[4].isAlive).toBe(true);
    expect(weakenWitchRes.witchAntidoteUsed).toBe(true);
  });

  it('占卜師（fortune_teller）與煉金魔女（alchemy_witch）：限刀驗證、未明之霧禁空刀、法老之蛇救活', () => {
    const seats = makeSeats([
      'fortune_teller',
      'alchemy_witch',
      'wolf',
      'villager',
      'villager',
      'seer',
      'guard',
    ]);

    // 占卜師標記 1 號（鄰居為 6 號與 2 號）→ 狼刀 4 號被阻擋
    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), fortuneTellerMarkTarget: 1, wolfTarget: 4 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      }),
    ).toThrow('占卜師已發動標記');

    // 煉金魔女未明之霧指定 [4, 5, 6] → 不可空刀；刀 4 號成功且法老之蛇記錄待救目標
    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), alchemyFogTargets: [4, 5, 6], wolfTarget: null },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      }),
    ).toThrow('不可空刀');

    const fogRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), alchemyFogTargets: [4, 5, 6], wolfTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(fogRes.seats[3].isAlive).toBe(false);
    expect(fogRes.interferenceState.alchemySnakePendingVictimSeat).toBe(4);

    // 法老之蛇救活 4 號
    const revive = resolveAlchemySnakeRevive(fogRes.seats, 4);
    expect(revive.allowed).toBe(true);
    expect(revive.seats[3].isAlive).toBe(true);
  });

  it('流光伯爵（radiant_earl）、名媛（socialite）、蠱惑師（enchanter）、黑蝙蝠（black_bat）、黑夜使者（dark_night_envoy）', () => {
    const seats = makeSeats([
      'radiant_earl',
      'socialite',
      'enchanter',
      'black_bat',
      'dark_night_envoy',
      'wolf',
      'seer',
      'witch',
      'dream_catcher',
      'villager',
    ]);

    // 流光伯爵第 2 晚庇護 10 號，免疫攝夢連夢致死；黑蝙蝠庇護 6 號，預言家驗 6 號被反彈死亡；黑夜使者庇護 4 號，女巫毒 4 號被反殺
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        radiantEarlTarget: 10,
        dreamCatcherTarget: 10,
        blackBatTarget: 6,
        seerCheckTarget: 6,
        darkNightEnvoyTarget: 4,
        witchPoisonTarget: 4,
        socialiteTarget: 9,
        wolfTarget: 9, // 名媛寵幸 9 號被狼刀 → 轉空刀，9 號存活
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      lastDreamTarget: 10,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[9].isAlive).toBe(true); // 流光免疫連夢
    expect(n2.seats[8].isAlive).toBe(true); // 名媛寵幸防狼刀
    expect(n2.seats[6].isAlive).toBe(false); // 預言家被黑蝙蝠反彈
    expect(n2.seats[6].deathReason).toBe('black_bat_reflect');
    expect(n2.seats[7].isAlive).toBe(false); // 女巫被黑夜使者反殺
    expect(n2.seats[7].deathReason).toBe('dark_night_envoy_counter');

    // 蠱惑師當晚被狼刀 → 由被蠱惑者（10 號）代替出局，蠱惑師存活
    const encRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), enchanterTarget: 10, wolfTarget: 3 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(encRes.seats[2].isAlive).toBe(true);
    expect(encRes.seats[9].isAlive).toBe(false);
    expect(encRes.seats[9].deathReason).toBe('enchanter_substitute');
  });

  it('覺醒女巫（awakened_witch）、白貓（white_cat）與戰狼（war_wolf）：協助者投票投毒、白貓翻牌免死延遲結算、戰狼免疫神職傷害', () => {
    const seats = makeSeats(['awakened_witch', 'white_cat', 'war_wolf', 'knight', 'hunter', 'villager']);

    // 覺醒女巫第 1 瓶毒選 1 位協助者，協助者同意毒殺白貓 → 白貓翻牌免死
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        awakenedWitchPoisonTarget: 2,
        awakenedWitchHelpers: [1],
        awakenedWitchHelpersApproved: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      interferenceState: createInitialInterferenceState(),
    });
    expect(n1.seats[1].isAlive).toBe(true);
    expect(n1.seats[1].statuses.whiteCatRevealed).toBe(true);
    expect(n1.interferenceState.awakenedWitchPoisonsUsed).toBe(1);

    // 放逐階段結束後白貓延遲死亡
    const catEnd = resolveWhiteCatDelayedDeath(
      n1.seats,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(catEnd.eliminatedSeat).toBe(2);
    expect(catEnd.seats[1].isAlive).toBe(false);

    // 戰狼免疫獵人開槍與騎士決鬥，但可被白天放逐出局
    const shootWarWolf = resolveShoot(
      seats,
      5,
      3,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(shootWarWolf.targetSurvived).toBe(true);
    expect(shootWarWolf.seats[2].isAlive).toBe(true);

    const duelWarWolf = resolveKnightDuel(
      seats,
      4,
      3,
      false,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(duelWarWolf.eliminatedSeat).toBeNull();
    expect(duelWarWolf.seats[2].isAlive).toBe(true);

    const exileWarWolf = resolveDayExile(
      seats,
      3,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(exileWarWolf.seats[2].isAlive).toBe(false);
  });
});
