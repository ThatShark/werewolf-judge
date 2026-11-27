import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canNightmareFear,
  checkVictory,
  createEmptyNightDraft,
  createInitialHiddenWolfState,
  createInitialHybridState,
  createInitialMechWolfState,
  createInitialSeats,
  createInitialSeedWolfState,
  getPsychicCheckResult,
  getSeerCheckResult,
  resolveDayExile,
  resolveNight,
  resolveSelfExplode,
  resolveShoot,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return createInitialSeats(roles.length).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('1. 夢魘（nightmare）全自動規則結算測試', () => {
  it('首夜恐懼狼隊友導致整晚狼隊空刀；第二晚起禁止恐懼狼隊友且不可連恐同一人', () => {
    const seats = makeSeats(['nightmare', 'wolf', 'seer', 'witch', 'guard', 'villager']);

    // 首夜恐懼 2 號小狼 → 狼隊強制空刀（6 號平民存活）
    const night1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nightmareFearTarget: 2,
        wolfTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    expect(night1.deaths).toHaveLength(0);
    expect(night1.seats.find((s) => s.seatNumber === 6)?.isAlive).toBe(true);
    expect(night1.lastFearedSeat).toBe(2);

    // 第二晚禁止恐懼狼隊友（2 號）
    const checkWolfRound2 = canNightmareFear(night1.seats, 3, 2, 2);
    expect(checkWolfRound2.allowed).toBe(false);
    expect(checkWolfRound2.reason).toContain('狼隊友');

    // 第二晚禁止連續兩晚恐懼同一人
    const checkConsecutive = canNightmareFear(night1.seats, 3, 3, 2);
    expect(checkConsecutive.allowed).toBe(false);
    expect(checkConsecutive.reason).toContain('連續兩晚');
  });

  it('恐懼預言家／女巫／守衛／熊時當晚技能無效且不消耗女巫藥水', () => {
    // 1) 恐懼女巫：解藥無效（狼刀 6 號成功）且不消耗解藥
    const seats1 = makeSeats(['nightmare', 'wolf', 'seer', 'witch', 'guard', 'villager']);
    const resWitch = resolveNight({
      seats: seats1,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nightmareFearTarget: 4, // 恐懼女巫
        wolfTarget: 6,
        witchUseAntidote: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(resWitch.witchAntidoteUsed).toBe(false);
    expect(resWitch.deaths).toEqual([{ seat: 6, reason: 'wolf_kill' }]);

    // 2) 恐懼預言家：當晚無法查驗（seerResult 為 null）
    const resSeer = resolveNight({
      seats: seats1,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nightmareFearTarget: 3, // 恐懼預言家
        seerCheckTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(resSeer.seerResult).toBeNull();

    // 3) 恐懼守衛：守護 6 號無效，狼刀 6 號成功且 lastGuardedSeat 重置
    const resGuard = resolveNight({
      seats: seats1,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nightmareFearTarget: 5, // 恐懼守衛
        guardTarget: 6,
        wolfTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: 6,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(resGuard.deaths).toEqual([{ seat: 6, reason: 'wolf_kill' }]);
    expect(resGuard.lastGuardedSeat).toBeNull();

    // 4) 恐懼熊：即使旁邊坐狼，隔天也不咆哮
    const seatsBear = makeSeats(['nightmare', 'bear', 'wolf', 'villager', 'villager', 'seer']);
    const resBear = resolveNight({
      seats: seatsBear,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        nightmareFearTarget: 2, // 恐懼熊
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(resBear.bearRoar?.roared).toBe(false);
  });

  it('恐懼攝夢人重置連夢紀錄（第 1、3 晚夢同一人不死）；恐懼獵人夜死禁開槍但白天放逐可開槍', () => {
    const seats = makeSeats(['nightmare', 'wolf', 'dream_catcher', 'hunter', 'villager', 'villager']);

    // 第 1 晚：攝夢人夢 5 號
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), dreamCatcherTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.lastDreamTarget).toBe(5);

    // 第 2 晚：夢魘恐懼攝夢人（3 號）→ lastDreamTarget 重置為 null
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        nightmareFearTarget: 3,
        dreamCatcherTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      lastDreamTarget: n1.lastDreamTarget,
      lastFearedSeat: n1.lastFearedSeat,
    });
    expect(n2.lastDreamTarget).toBeNull();
    expect(n2.deaths).toHaveLength(0);

    // 第 3 晚：攝夢人再夢 5 號，因第 2 晚被恐懼中斷，不觸發連夢致死；同晚恐懼並狼刀獵人（4 號）→ 獵人夜死無法開槍
    const n3 = resolveNight({
      seats: n2.seats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        nightmareFearTarget: 4, // 恐懼獵人
        dreamCatcherTarget: 5,
        wolfTarget: 4, // 狼刀獵人
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      lastDreamTarget: n2.lastDreamTarget,
      lastFearedSeat: n2.lastFearedSeat,
    });
    expect(n3.seats.find((s) => s.seatNumber === 5)?.isAlive).toBe(true);
    const hunterElig = n3.shootEligibilities.find((e) => e.seatNumber === 4);
    expect(hunterElig?.canShoot).toBe(false);

    // 若獵人於白天被放逐，仍可正常開槍
    const exileRes = resolveDayExile(seats, 4, 1, DEFAULT_RULE_OVERRIDES, createInitialMechWolfState());
    expect(exileRes.shootEligibility?.canShoot).toBe(true);
  });
});

describe('2. 惡靈騎士（evil_knight）全自動規則結算測試', () => {
  it('惡靈騎士不可自刀、不可自爆', () => {
    const seats = makeSeats(['evil_knight', 'wolf', 'seer', 'witch', 'hunter', 'villager']);

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
    ).toThrow('惡靈騎士不可自刀');

    const explode = resolveSelfExplode(seats, 1);
    expect(explode.allowed).toBe(false);
    expect(explode.reason).toContain('惡靈騎士不可自爆');
  });

  it('免疫女巫毒藥並觸發一次性反傷（守衛不可擋反傷）；反傷消耗後不再觸發', () => {
    const seats = makeSeats(['evil_knight', 'wolf', 'seer', 'witch', 'guard', 'villager']);

    // 第 1 晚：女巫毒惡靈騎士（守衛守女巫亦無法擋反傷）→ 惡靈存活、女巫反傷死亡
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 4, // 守女巫
        witchPoisonTarget: 1, // 毒惡靈騎士
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    expect(n1.seats.find((s) => s.seatNumber === 1)?.isAlive).toBe(true);
    expect(n1.deaths).toEqual([{ seat: 4, reason: 'evil_knight_counter' }]);
    expect(n1.evilKnightCounterUsed).toBe(true);

    // 第 2 晚：預言家查驗惡靈騎士 → 反傷已用盡，預言家存活且驗出狼人
    const n2 = resolveNight({
      seats: n1.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        seerCheckTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: n1.witchAntidoteUsed,
      witchPoisonUsed: n1.witchPoisonUsed,
      lastGuardedSeat: n1.lastGuardedSeat,
      mechWolfState: n1.mechWolfState,
      pendingSelfExplodeSeat: null,
      evilKnightCounterUsed: n1.evilKnightCounterUsed,
    });

    expect(n2.seerResult).toEqual({ targetSeat: 1, faction: 'wolf' });
    expect(n2.deaths).toHaveLength(0);
    expect(n2.seats.find((s) => s.seatNumber === 3)?.isAlive).toBe(true);
  });

  it('同晚女巫與預言家同毒同驗惡靈騎士，依板子順序由先行動者遭到反傷', () => {
    const seats = makeSeats(['evil_knight', 'wolf', 'seer', 'witch', 'villager', 'villager']);

    // 預設女巫先於預言家 → 女巫反傷出局，預言家存活
    const witchFirst = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        witchPoisonTarget: 1,
        seerCheckTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seerActsBeforeWitch: false,
    });
    expect(witchFirst.deaths).toEqual([{ seat: 4, reason: 'evil_knight_counter' }]);
    expect(witchFirst.seats.find((s) => s.seatNumber === 3)?.isAlive).toBe(true);

    // 若板子為預言家先於女巫 → 預言家反傷出局，女巫存活
    const seerFirst = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        witchPoisonTarget: 1,
        seerCheckTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seerActsBeforeWitch: true,
    });
    expect(seerFirst.deaths).toEqual([{ seat: 3, reason: 'evil_knight_counter' }]);
    expect(seerFirst.seats.find((s) => s.seatNumber === 4)?.isAlive).toBe(true);
  });

  it('免疫夜間倒牌獵人開槍，但白天被放逐的獵人可以開槍帶走惡靈騎士', () => {
    const seats = makeSeats(['evil_knight', 'wolf', 'hunter', 'villager', 'villager', 'seer']);

    // 獵人夜間被狼刀出局後開槍打惡靈騎士 → 免疫無效
    const nightDeadSeats = seats.map((s) =>
      s.seatNumber === 3 ? { ...s, isAlive: false, deathReason: 'wolf_kill' as const } : s,
    );
    const nightShoot = resolveShoot(
      nightDeadSeats,
      3,
      1,
      'wolf_kill',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(nightShoot.targetSurvived).toBe(true);
    expect(nightShoot.seats.find((s) => s.seatNumber === 1)?.isAlive).toBe(true);

    // 獵人白天被放逐後開槍打惡靈騎士 → 正常帶走
    const exiledDeadSeats = seats.map((s) =>
      s.seatNumber === 3 ? { ...s, isAlive: false, deathReason: 'exiled' as const } : s,
    );
    const dayShoot = resolveShoot(
      exiledDeadSeats,
      3,
      1,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(dayShoot.targetSurvived).toBeUndefined();
    expect(dayShoot.seats.find((s) => s.seatNumber === 1)?.isAlive).toBe(false);
  });
});

describe('3. 混血兒（hybrid）全自動規則結算測試', () => {
  it('首夜選榜樣綁定陣營、預言家查驗恆金水、不計入狼人數量與預設不計入屠邊', () => {
    const seats = makeSeats(['wolf', 'hybrid', 'seer', 'villager', 'villager', 'witch']);

    // 首夜混血兒選 1 號小狼為榜樣
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        hybridIdolTarget: 1,
        seerCheckTarget: 2, // 預言家驗混血兒
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      hybridState: createInitialHybridState(),
    });

    expect(n1.hybridState).toEqual({ idolSeat: 1, alignedFaction: 'wolf' });
    expect(n1.seerResult).toEqual({ targetSeat: 2, faction: 'good' });

    // 好人淘汰 1 號小狼後直接獲勝（無須淘汰狼混 2 號）
    const afterExileWolf = resolveDayExile(
      n1.seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(afterExileWolf.victory.winner).toBe('good');

    // 預設 hybridCountsAsVillager = false：所有平民（4、5 號）出局即屠民（即使 2 號混血兒存活）
    const noVillagers = n1.seats.map((s) =>
      s.seatNumber === 4 || s.seatNumber === 5 ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(noVillagers, DEFAULT_RULE_OVERRIDES).winner).toBe('wolf');

    // 若開啟 hybridCountsAsVillager = true（12 人局規則）：2 號混血兒仍存活，尚未屠民
    expect(
      checkVictory(noVillagers, { ...DEFAULT_RULE_OVERRIDES, hybridCountsAsVillager: true }).winner,
    ).toBeNull();
  });
});

describe('4. 種狼（seed_wolf）全自動規則結算測試', () => {
  it('整局限一次狼刀轉感染：女巫顯示空刀、目標轉狼且當晚立即失去技能、被驗查殺並可自爆', () => {
    const seats = makeSeats(['seed_wolf', 'wolf', 'seer', 'witch', 'villager', 'villager']);

    // 第 1 晚種狼感染 3 號預言家
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        seedWolfInfectTarget: 3,
        seerCheckTarget: 1, // 預言家當晚已被感染失能
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seedWolfState: createInitialSeedWolfState(),
    });

    expect(n1.deaths).toHaveLength(0);
    expect(n1.seedWolfState).toEqual({ infectUsed: true, infectedSeat: 3 });
    expect(n1.seats.find((s) => s.seatNumber === 3)?.statuses.infectedBySeedWolf).toBe(true);
    // 被感染的預言家當晚即失去查驗技能
    expect(n1.seerResult).toBeNull();
    // 若後續再查驗 3 號為查殺，且 3 號可以自爆
    expect(getSeerCheckResult(n1.seats, 3)).toEqual({ targetSeat: 3, faction: 'wolf' });
    expect(resolveSelfExplode(n1.seats, 3).allowed).toBe(true);

    // 若種狼發動感染時女巫嘗試用解藥（女巫應看到空刀），會被阻擋
    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          wolfTarget: 5,
          seedWolfInfectTarget: 5,
          witchUseAntidote: true,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        seedWolfState: createInitialSeedWolfState(),
      }),
    ).toThrow('空刀');
  });

  it('守衛守護感染目標可擋下感染；感染隱狼會使其回歸狼隊並被驗為查殺；感染最後一神即時屠神', () => {
    // 1) 守衛擋感染（京城版 Q&A）
    const seatsGuard = makeSeats(['seed_wolf', 'wolf', 'guard', 'seer', 'villager', 'villager']);
    const guardedRes = resolveNight({
      seats: seatsGuard,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 4,
        seedWolfInfectTarget: 4,
        seerCheckTarget: 1,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seedWolfState: createInitialSeedWolfState(),
    });
    expect(guardedRes.seedWolfState).toEqual({ infectUsed: true, infectedSeat: null });
    expect(guardedRes.seats.find((s) => s.seatNumber === 4)?.statuses.infectedBySeedWolf).toBeFalsy();
    expect(guardedRes.seerResult).toEqual({ targetSeat: 1, faction: 'wolf' });

    // 2) 感染隱狼（娛百版 Q&A）→ 隱狼轉查殺且可自爆
    const seatsHidden = makeSeats(['seed_wolf', 'hidden_wolf', 'seer', 'villager', 'villager', 'witch']);
    const hiddenRes = resolveNight({
      seats: seatsHidden,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        seedWolfInfectTarget: 2,
        seerCheckTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seedWolfState: createInitialSeedWolfState(),
    });
    expect(hiddenRes.seerResult).toEqual({ targetSeat: 2, faction: 'wolf' });
    expect(resolveSelfExplode(hiddenRes.seats, 2).allowed).toBe(true);

    // 3) 感染場上唯一神職 → 即時更新屠邊人數並觸發狼人屠神勝利
    const seatsLastGod = makeSeats(['seed_wolf', 'seer', 'villager', 'villager']);
    const winRes = resolveNight({
      seats: seatsLastGod,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        seedWolfInfectTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      seedWolfState: createInitialSeedWolfState(),
    });
    expect(winRes.victory.winner).toBe('wolf');
    expect(winRes.victory.winReason).toContain('屠神');
  });
});

describe('5. 隱狼（hidden_wolf）全自動規則結算測試', () => {
  it('預言家驗金水、通靈師驗隱狼、不可自爆、其他狼全滅自動入隊且好人須淘汰隱狼才獲勝', () => {
    const seats = makeSeats(['wolf', 'hidden_wolf', 'seer', 'psychic', 'villager', 'villager']);

    // 查驗與自爆規則
    expect(getSeerCheckResult(seats, 2)).toEqual({ targetSeat: 2, faction: 'good' });
    expect(getPsychicCheckResult(seats, createInitialMechWolfState(), 2)).toEqual({
      targetSeat: 2,
      perceivedRoleId: 'hidden_wolf',
    });
    expect(resolveSelfExplode(seats, 2).allowed).toBe(false);

    // 首夜 1 號小狼仍存活 → 隱狼尚未入隊
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: createEmptyNightDraft(1),
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      hiddenWolfState: createInitialHiddenWolfState(),
    });
    expect(n1.hiddenWolfState.hasJoinedWolfTeam).toBe(false);

    // 1 號小狼遭放逐出局 → 好人尚未獲勝（因 2 號隱狼仍存活）；當晚隱狼自動入狼隊帶刀
    const afterExileWolf = resolveDayExile(
      n1.seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(afterExileWolf.victory.winner).toBeNull();

    const n2 = resolveNight({
      seats: afterExileWolf.seats,
      round: 2,
      draft: createEmptyNightDraft(2),
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      hiddenWolfState: n1.hiddenWolfState,
    });
    expect(n2.hiddenWolfState.hasJoinedWolfTeam).toBe(true);

    // 2 號隱狼出局後好人才正式獲勝
    const afterExileHidden = resolveDayExile(
      n2.seats,
      2,
      2,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(afterExileHidden.victory.winner).toBe('good');
  });
});
