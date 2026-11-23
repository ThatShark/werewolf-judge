import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canPoisonerUsePoison,
  canWolfGirlConfess,
  checkCanShoot,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  createInitialWolfGirlState,
  resolveNight,
  resolveWolfGirlExplode,
} from './index';
import type { PlayerSeat } from './types';

function createWolfGirl12Seats(): PlayerSeat[] {
  const roles = [
    'wolf',      // 1
    'wolf',      // 2
    'wolf',      // 3
    'wolf_girl', // 4
    'villager',  // 5
    'villager',  // 6
    'villager',  // 7
    'villager',  // 8
    'seer',      // 9
    'poisoner',  // 10
    'hunter',    // 11
    'guard',     // 12
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('12 人局 - 狼女孩（狼女孩／毒師／首夜無刀完整邊界測試）', () => {
  it('WG-01：首夜狼人無刀板子，第一晚不可傳入狼刀目標', () => {
    const seats = createWolfGirl12Seats();

    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), wolfTarget: 5, wolfGirlConfessTarget: 5 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        firstNightNoWolfKill: true,
      }),
    ).toThrow('此板子第一夜狼人無刀');
  });

  it('WG-02 ~ WG-05：狼女孩首夜表白目標限制、表白平民成功／神職失敗與預言家查驗', () => {
    const seats = createWolfGirl12Seats();

    // 不可跳過、不可表白自己、不可表白小狼、不可在第二晚表白
    expect(canWolfGirlConfess(seats, null, 1).allowed).toBe(false);
    expect(canWolfGirlConfess(seats, 4, 1).allowed).toBe(false);
    expect(canWolfGirlConfess(seats, 1, 1).allowed).toBe(false);
    expect(canWolfGirlConfess(seats, 5, 2).allowed).toBe(false);

    // 表白平民（5 號）-> 成功，與狼隊同勝但身分維持平民，預言家仍驗出好人
    const confessVillager = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        wolfGirlConfessTarget: 5,
        seerCheckTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      firstNightNoWolfKill: true,
    });

    expect(confessVillager.wolfGirlState).toEqual({
      confessedSeat: 5,
      confessSuccess: true,
      alignedWithWolf: true,
    });
    expect(confessVillager.seerResult).toEqual({ targetSeat: 5, faction: 'good' });

    // 表白神職（11 號獵人）-> 失敗，陣營與勝利條件不變
    const confessGod = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        wolfGirlConfessTarget: 11,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      firstNightNoWolfKill: true,
    });

    expect(confessGod.wolfGirlState).toEqual({
      confessedSeat: 11,
      confessSuccess: false,
      alignedWithWolf: false,
    });
  });

  it('WG-06 & WG-07：狼女孩白天或放逐投票最高票後自爆觸發「愛情破裂」，帶走表白對象（獵人不可開槍）且作廢放逐', () => {
    const seats = createWolfGirl12Seats();

    // 第一晚狼女孩表白 11 號獵人（表白失敗，但仍為先前表白對象）
    const night1 = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfGirlConfessTarget: 11 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      firstNightNoWolfKill: true,
    });

    // 白天放逐投票結束後（即使狼女孩最高票），狼女孩自爆觸發愛情破裂
    const explode = resolveWolfGirlExplode(
      night1.seats,
      4,
      night1.wolfGirlState,
      1,
      DEFAULT_RULE_OVERRIDES,
      night1.mechWolfState,
      { voidExileVote: true },
    );

    expect(explode.allowed).toBe(true);
    expect(explode.voidedExileVote).toBe(true);
    expect(explode.breakupDeathSeat).toBe(11);
    expect(explode.pendingSelfExplodeSeat).toBe(4);
    // 11 號獵人因愛情破裂直接出局且無法開槍
    expect(explode.seats[10].isAlive).toBe(false);
    expect(explode.seats[10].deathReason).toBe('wolf_girl_breakup');
    expect(checkCanShoot(explode.seats, 11, 'wolf_girl_breakup')?.canShoot).toBe(false);
    // 狼女孩尚未立即死亡，待第二晚點刀後正式死亡
    expect(explode.seats[3].isAlive).toBe(true);

    const night2 = resolveNight({
      seats: explode.seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), wolfTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: explode.mechWolfState,
      pendingSelfExplodeSeat: explode.pendingSelfExplodeSeat,
      wolfGirlState: night1.wolfGirlState,
    });

    expect(night2.seats[3].isAlive).toBe(false);
    expect(night2.seats[3].deathReason).toBe('self_explode');
  });

  it('WG-11：狼女孩自爆觸發愛情破裂直接帶走最後一神時，立即判狼人屠神勝利', () => {
    // 場上僅剩 11 號獵人為最後一神
    const seats = createWolfGirl12Seats().map((seat) =>
      [9, 10, 12].includes(seat.seatNumber) ? { ...seat, isAlive: false } : seat,
    );
    const wolfGirlState = {
      ...createInitialWolfGirlState(),
      confessedSeat: 11,
      confessSuccess: false,
      alignedWithWolf: false,
    };

    const explode = resolveWolfGirlExplode(
      seats,
      4,
      wolfGirlState,
      2,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );

    expect(explode.allowed).toBe(true);
    expect(explode.breakupDeathSeat).toBe(11);
    expect(explode.victory.winner).toBe('wolf');
    expect(explode.victory.winReason).toContain('屠神');
  });

  it('WG-08 ~ WG-10：毒師僅一瓶毒藥、毒殺獵人不可開槍、守衛不防毒、且遵守狼刀在先', () => {
    const seats = createWolfGirl12Seats();

    // 守衛守 11 號獵人，但毒師毒 11 號 -> 守衛不防毒，獵人死亡且不可開槍，毒藥耗盡
    const night1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 11,
        poisonerTarget: 11,
        wolfGirlConfessTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      poisonerPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      firstNightNoWolfKill: true,
    });

    expect(night1.poisonerPoisonUsed).toBe(true);
    expect(night1.deaths).toEqual([{ seat: 11, reason: 'poisoner_poison' }]);
    const hunterShoot = night1.shootEligibilities.find((s) => s.seatNumber === 11);
    expect(hunterShoot?.canShoot).toBe(false);

    // 第二晚毒藥已耗盡不可再用
    expect(canPoisonerUsePoison(night1.seats, 1, night1.poisonerPoisonUsed).allowed).toBe(false);

    // 狼刀在先：最後 1 狼（1 號）刀殺最後 1 平民（5 號），同晚毒師毒殺最後 1 狼 -> 仍判狼人屠民勝利
    const endgameSeats = createWolfGirl12Seats().map((seat) =>
      [2, 3, 4, 6, 7, 8].includes(seat.seatNumber) ? { ...seat, isAlive: false } : seat,
    );
    const wolfPriorityRes = resolveNight({
      seats: endgameSeats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        wolfTarget: 5,
        poisonerTarget: 1,
      },
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, wolfKillPriority: true },
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      poisonerPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    expect(wolfPriorityRes.victory.winner).toBe('wolf');
    expect(wolfPriorityRes.victory.winReason).toContain('屠民');
  });
});
