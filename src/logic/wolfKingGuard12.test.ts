import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canGuardTarget,
  checkCanShoot,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  resolveDayExile,
  resolveNight,
  resolveShoot,
} from './index';
import type { PlayerSeat } from './types';

function createWolfKingGuard12Seats(): PlayerSeat[] {
  const roles = [
    'wolf',      // 1
    'wolf',      // 2
    'wolf',      // 3
    'wolf_king', // 4
    'villager',  // 5
    'villager',  // 6
    'villager',  // 7
    'villager',  // 8
    'seer',      // 9
    'witch',     // 10
    'hunter',    // 11
    'guard',     // 12
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('MVP 板子 2：12 人局 - 狼王守衛', () => {
  it('同守同救奶穿：守衛守護 A 且狼刀 A 且女巫救 A -> A 死亡（milk_pierce）', () => {
    const seats = createWolfKingGuard12Seats();

    const res = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 5,
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

    expect(res.deaths).toEqual([{ seat: 5, reason: 'milk_pierce' }]);
    expect(res.seats[4].isAlive).toBe(false);
    expect(res.seats[4].deathReason).toBe('milk_pierce');
  });

  it('守衛連守限制：不可連守同一人，允許空守與自守', () => {
    const seats = createWolfKingGuard12Seats(); // 12 號守衛

    // 第一晚自守成功
    expect(canGuardTarget(null, 12, seats).allowed).toBe(true);
    // 第二晚不可連守 12 號
    expect(canGuardTarget(12, 12, seats).allowed).toBe(false);
    // 第二晚可空守或改守他人
    expect(canGuardTarget(12, null, seats).allowed).toBe(true);
    expect(canGuardTarget(12, 9, seats).allowed).toBe(true);

    // 執行 resolveNight 連守直接拋錯
    expect(() =>
      resolveNight({
        seats,
        round: 2,
        draft: { ...createEmptyNightDraft(2), guardTarget: 12, wolfTarget: 5 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: true,
        witchPoisonUsed: true,
        lastGuardedSeat: 12,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      }),
    ).toThrow('守衛不可連續兩晚守護同一名玩家');
  });

  it('守衛防禦範圍：可擋狼刀，但不可擋女巫毒藥', () => {
    const seats = createWolfKingGuard12Seats();

    // 守衛守 9 號，狼刀 9 號 -> 平安夜
    const blockWolf = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), guardTarget: 9, wolfTarget: 9 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(blockWolf.deaths).toEqual([]);

    // 守衛守 4 號，女巫毒 4 號 -> 4 號仍被毒死
    const cannotBlockPoison = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 4,
        wolfTarget: null,
        witchPoisonTarget: 4,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(cannotBlockPoison.deaths).toEqual([{ seat: 4, reason: 'witch_poison' }]);
    expect(cannotBlockPoison.seats[3].isAlive).toBe(false);
  });

  it('狼王開槍狀態機：自刀/被獵人槍/奶穿/放逐可開槍；被毒/自爆/最後一狼不可開槍', () => {
    const seats = createWolfKingGuard12Seats(); // 4 號為狼王

    // 場上仍有其他狼時：自刀、被獵人槍、奶穿、放逐皆可開槍
    expect(checkCanShoot(seats, 4, 'wolf_kill')?.canShoot).toBe(true);
    expect(checkCanShoot(seats, 4, 'hunter_shoot')?.canShoot).toBe(true);
    expect(checkCanShoot(seats, 4, 'milk_pierce')?.canShoot).toBe(true);
    expect(checkCanShoot(seats, 4, 'exiled')?.canShoot).toBe(true);

    // 被毒殺、自爆不可開槍
    expect(checkCanShoot(seats, 4, 'witch_poison')?.canShoot).toBe(false);
    expect(checkCanShoot(seats, 4, 'self_explode')?.canShoot).toBe(false);

    // 若 1、2、3 號小狼皆出局，狼王作為最後一狼被放逐 -> 不可開槍
    const onlyWolfKingLeft = seats.map((s) =>
      [1, 2, 3].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    const exileLastWolf = resolveDayExile(
      onlyWolfKingLeft,
      4,
      3,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(exileLastWolf.shootEligibility?.canShoot).toBe(false);
    expect(exileLastWolf.victory.winner).toBe('good');
  });

  it('獵人開槍狀態機與獵人↔狼王連鎖開槍', () => {
    const seats = createWolfKingGuard12Seats(); // 4 號狼王，11 號獵人

    // 獵人被奶穿可開槍
    const hunterMilkPierce = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        guardTarget: 11,
        wolfTarget: 11,
        witchUseAntidote: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(hunterMilkPierce.shootEligibilities[0]).toMatchObject({
      seatNumber: 11,
      roleId: 'hunter',
      canShoot: true,
    });

    // 獵人開槍帶走狼王(4) -> 狼王（非最後一狼）獲得連鎖開槍資格
    const shootWolfKing = resolveShoot(
      hunterMilkPierce.seats,
      11,
      4,
      'milk_pierce',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(shootWolfKing.seats[3].isAlive).toBe(false);
    expect(shootWolfKing.chainedShootEligibility).toMatchObject({
      seatNumber: 4,
      roleId: 'wolf_king',
      canShoot: true,
    });

    // 反向：狼王被放逐開槍帶走獵人(11) -> 獵人可連鎖開槍
    const exileWolfKing = resolveDayExile(
      seats,
      4,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    const wolfKingShootsHunter = resolveShoot(
      exileWolfKing.seats,
      4,
      11,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(wolfKingShootsHunter.chainedShootEligibility).toMatchObject({
      seatNumber: 11,
      roleId: 'hunter',
      canShoot: true,
    });
  });

  it('狼刀在先原則：狼刀已達成屠邊時，即使女巫同晚毒殺最後一狼仍判狼人勝利', () => {
    // 場上僅剩最後 1 狼（1 號）與最後 1 平民（5 號），神職全在
    const seats = createWolfKingGuard12Seats().map((seat) =>
      [2, 3, 4, 6, 7, 8].includes(seat.seatNumber) ? { ...seat, isAlive: false } : seat,
    );

    const res = resolveNight({
      seats,
      round: 4,
      draft: {
        ...createEmptyNightDraft(4),
        wolfTarget: 5,       // 狼刀最後一名平民 -> 達成屠民
        witchPoisonTarget: 1, // 女巫同晚毒殺最後一隻狼
      },
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, wolfKillPriority: true },
      witchAntidoteUsed: true,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });

    expect(res.victory.winner).toBe('wolf');
    expect(res.victory.winReason).toContain('屠民');
  });
});
