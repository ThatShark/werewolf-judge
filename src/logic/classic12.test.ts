import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canWitchUseAntidote,
  checkCanShoot,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  resolveDayExile,
  resolveNight,
  resolveSelfExplode,
} from './index';
import type { PlayerSeat, RuleOverrides } from './types';

function createClassic12Seats(): PlayerSeat[] {
  const roles = [
    'wolf',     // 1
    'wolf',     // 2
    'wolf',     // 3
    'wolf',     // 4
    'villager', // 5
    'villager', // 6
    'villager', // 7
    'villager', // 8
    'seer',     // 9
    'witch',    // 10
    'hunter',   // 11
    'idiot',    // 12
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('MVP 板子 1：12 人局 - 經典', () => {
  it('基本夜結算：狼刀致死、女巫解藥救回成平安夜', () => {
    const seats = createClassic12Seats();

    // 狼刀 5 號，女巫不救
    const killRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 5, seerCheckTarget: 1 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(killRes.deaths).toEqual([{ seat: 5, reason: 'wolf_kill' }]);
    expect(killRes.seats[4].isAlive).toBe(false);
    expect(killRes.seerResult).toEqual({ targetSeat: 1, faction: 'wolf' });

    // 狼刀 5 號，女巫開解藥 -> 平安夜
    const saveRes = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 5, witchUseAntidote: true },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(saveRes.deaths).toEqual([]);
    expect(saveRes.seats[4].isAlive).toBe(true);
    expect(saveRes.witchAntidoteUsed).toBe(true);
  });

  it('女巫解藥與毒藥不可在同一晚同時使用', () => {
    const seats = createClassic12Seats();
    expect(() =>
      resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          wolfTarget: 5,
          witchUseAntidote: true,
          witchPoisonTarget: 1,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      }),
    ).toThrow('女巫解藥與毒藥不可在同一晚同時使用');
  });

  it('女巫自救受 witchSelfSave 三種規則開關控制', () => {
    const seats = createClassic12Seats(); // 10 號為女巫

    // first_night_only：第一晚可自救、第二晚不可
    const firstOnly: RuleOverrides = { ...DEFAULT_RULE_OVERRIDES, witchSelfSave: 'first_night_only' };
    expect(canWitchUseAntidote(seats, 1, 10, false, firstOnly).allowed).toBe(true);
    expect(canWitchUseAntidote(seats, 2, 10, false, firstOnly).allowed).toBe(false);

    // never：第一晚也不可自救
    const neverSave: RuleOverrides = { ...DEFAULT_RULE_OVERRIDES, witchSelfSave: 'never' };
    expect(canWitchUseAntidote(seats, 1, 10, false, neverSave).allowed).toBe(false);

    // always：第二晚仍可自救
    const alwaysSave: RuleOverrides = { ...DEFAULT_RULE_OVERRIDES, witchSelfSave: 'always' };
    expect(canWitchUseAntidote(seats, 2, 10, false, alwaysSave).allowed).toBe(true);
  });

  it('獵人開槍判定：被狼刀或放逐可開槍；被女巫毒殺不可開槍', () => {
    const seats = createClassic12Seats(); // 11 號為獵人

    // 被狼刀可開槍
    const wolfKillHunter = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 11 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(wolfKillHunter.shootEligibilities).toHaveLength(1);
    expect(wolfKillHunter.shootEligibilities[0].canShoot).toBe(true);

    // 被女巫毒殺不可開槍
    const poisonHunter = resolveNight({
      seats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 5, witchPoisonTarget: 11 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    const hunterEligibility = poisonHunter.shootEligibilities.find((e) => e.seatNumber === 11);
    expect(hunterEligibility?.canShoot).toBe(false);

    // 白天放逐可開槍
    const exileHunter = resolveDayExile(
      seats,
      11,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(exileHunter.shootEligibility?.canShoot).toBe(true);
    expect(checkCanShoot(exileHunter.seats, 11, 'exiled')?.canShoot).toBe(true);
  });

  it('白痴翻牌免死與 idiotNeedsExtraKill 追刀開關判定', () => {
    // 情境：預言家(9)、女巫(10)、獵人(11)皆已死，僅剩白痴(12)存活
    const seats = createClassic12Seats().map((seat) =>
      [9, 10, 11].includes(seat.seatNumber) ? { ...seat, isAlive: false } : seat,
    );

    // idiotNeedsExtraKill = false（預設）：白痴被放逐翻牌免死後，直接判狼人屠神勝利
    const noExtraKillRule: RuleOverrides = {
      ...DEFAULT_RULE_OVERRIDES,
      idiotNeedsExtraKill: false,
    };
    const resNoExtra = resolveDayExile(
      seats,
      12,
      2,
      noExtraKillRule,
      createInitialMechWolfState(),
    );
    expect(resNoExtra.idiotRevealed).toBe(true);
    expect(resNoExtra.seats[11].isAlive).toBe(true);
    expect(resNoExtra.seats[11].idiotRevealed).toBe(true);
    expect(resNoExtra.victory.winner).toBe('wolf');

    // idiotNeedsExtraKill = true：白痴翻牌免死後仍算存活神職，尚未判屠神，須追刀才贏
    const needExtraKillRule: RuleOverrides = {
      ...DEFAULT_RULE_OVERRIDES,
      idiotNeedsExtraKill: true,
    };
    const resNeedExtra = resolveDayExile(
      seats,
      12,
      2,
      needExtraKillRule,
      createInitialMechWolfState(),
    );
    expect(resNeedExtra.idiotRevealed).toBe(true);
    expect(resNeedExtra.seats[11].isAlive).toBe(true);
    expect(resNeedExtra.victory.winner).toBeNull();

    // 夜晚狼人追刀白痴 -> 判狼人屠神勝利
    const killIdiotNight = resolveNight({
      seats: resNeedExtra.seats,
      round: 3,
      draft: { ...createEmptyNightDraft(3), wolfTarget: 12 },
      ruleOverrides: needExtraKillRule,
      witchAntidoteUsed: true,
      witchPoisonUsed: true,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(killIdiotNight.seats[11].isAlive).toBe(false);
    expect(killIdiotNight.victory.winner).toBe('wolf');
  });

  it('狼人白天自爆強制入夜，且自爆狼於當晚點刀後才正式死亡', () => {
    const seats = createClassic12Seats(); // 1 號為小狼

    const explode = resolveSelfExplode(seats, 1);
    expect(explode.allowed).toBe(true);
    expect(explode.pendingSelfExplodeSeat).toBe(1);
    // 自爆當下不直接標記死亡
    expect(seats[0].isAlive).toBe(true);

    // 進入當晚完成點刀 5 號後，1 號才正式因 self_explode 死亡
    const nightAfterExplode = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), wolfTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: true,
      witchPoisonUsed: true,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: explode.pendingSelfExplodeSeat,
    });
    expect(nightAfterExplode.pendingSelfExplodeSeat).toBeNull();
    expect(nightAfterExplode.seats[0].isAlive).toBe(false);
    expect(nightAfterExplode.seats[0].deathReason).toBe('self_explode');
    expect(nightAfterExplode.deaths).toEqual([
      { seat: 5, reason: 'wolf_kill' },
      { seat: 1, reason: 'self_explode' },
    ]);
  });
});
