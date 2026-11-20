import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  evaluateBearRoar,
  resolveDayExile,
  resolveKnightDuel,
  resolveNight,
  resolveSelfExplode,
  resolveWhiteWolfKingExplode,
} from './index';
import type { PlayerSeat } from './types';

function makeSeatsWithRoles(roles: string[]): PlayerSeat[] {
  return createInitialSeats(roles.length).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('高頻進階角色自動結算（白狼王／狼美人／騎士／攝夢人／熊）', () => {
  describe('白狼王（white_wolf_king）', () => {
    it('白天自爆帶走獵人時，獵人立即死亡且不可開槍，白狼王延遲至當晚點刀後死亡', () => {
      const seats = makeSeatsWithRoles([
        'white_wolf_king',
        'wolf',
        'villager',
        'villager',
        'hunter',
        'witch',
      ]);

      const res = resolveWhiteWolfKingExplode(
        seats,
        1,
        5,
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      );
      expect(res.allowed).toBe(true);
      expect(res.seats[4].isAlive).toBe(false);
      expect(res.seats[4].deathReason).toBe('white_wolf_king_explode');
      expect(res.seats[0].isAlive).toBe(true);
      expect(res.pendingSelfExplodeSeat).toBe(1);
      expect(res.victory.winner).toBeNull();

      // 當晚點刀 3 號後，1 號白狼王正式死亡
      const night2 = resolveNight({
        seats: res.seats,
        round: 2,
        draft: { ...createEmptyNightDraft(2), wolfTarget: 3 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: res.mechWolfState,
        pendingSelfExplodeSeat: res.pendingSelfExplodeSeat,
      });
      expect(night2.seats[0].isAlive).toBe(false);
      expect(night2.seats[0].deathReason).toBe('self_explode');
    });

    it('白狼王自爆帶走最後一神時立即判定狼人屠神勝利', () => {
      const seats = makeSeatsWithRoles([
        'white_wolf_king',
        'wolf',
        'villager',
        'villager',
        'hunter',
      ]);

      const res = resolveWhiteWolfKingExplode(
        seats,
        1,
        5,
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      );
      expect(res.allowed).toBe(true);
      expect(res.victory.winner).toBe('wolf');
      expect(res.victory.winReason).toContain('屠神');
    });
  });

  describe('狼美人（wolf_beauty）', () => {
    it('不可自爆、不可自刀、不可連續兩晚魅惑同一人', () => {
      const seats = makeSeatsWithRoles([
        'wolf_beauty',
        'wolf',
        'villager',
        'villager',
        'hunter',
        'witch',
      ]);

      // 不可自爆
      expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

      // 不可自刀
      expect(() =>
        resolveNight({
          seats,
          round: 1,
          draft: { ...createEmptyNightDraft(1), wolfTarget: 1, wolfBeautyCharmTarget: 5 },
          ruleOverrides: DEFAULT_RULE_OVERRIDES,
          witchAntidoteUsed: false,
          witchPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
        }),
      ).toThrow(/狼美人不可自刀/);

      // 不可連續兩晚魅惑同一人
      expect(() =>
        resolveNight({
          seats,
          round: 2,
          draft: { ...createEmptyNightDraft(2), wolfTarget: 3, wolfBeautyCharmTarget: 5 },
          ruleOverrides: DEFAULT_RULE_OVERRIDES,
          witchAntidoteUsed: false,
          witchPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
          lastCharmedSeat: 5,
        }),
      ).toThrow(/連續兩晚魅惑/);
    });

    it('夜死（被女巫毒殺）時帶走魅惑對象殉情，且殉情之獵人無法開槍', () => {
      const seats = makeSeatsWithRoles([
        'wolf_beauty',
        'wolf',
        'villager',
        'villager',
        'hunter',
        'witch',
      ]);

      const night = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          wolfTarget: null,
          witchPoisonTarget: 1,
          wolfBeautyCharmTarget: 5,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(night.seats[0].isAlive).toBe(false);
      expect(night.seats[4].isAlive).toBe(false);
      expect(night.seats[4].deathReason).toBe('wolf_beauty_charm');
      // 殉情獵人不可開槍
      const hunterEligibility = night.shootEligibilities.find((s) => s.seatNumber === 5);
      expect(hunterEligibility?.canShoot).toBe(false);
    });

    it('作為最後一狼被白天放逐時，帶走最後一神殉情直接判定狼人獲勝', () => {
      const seats = makeSeatsWithRoles(['wolf_beauty', 'villager', 'villager', 'hunter']);

      const exile = resolveDayExile(
        seats,
        1,
        2,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
        4,
      );

      expect(exile.seats[0].isAlive).toBe(false);
      expect(exile.seats[3].isAlive).toBe(false);
      expect(exile.seats[3].deathReason).toBe('wolf_beauty_charm');
      expect(exile.charmedDeathSeat).toBe(4);
      expect(exile.victory.winner).toBe('wolf');
    });
  });

  describe('騎士（knight）', () => {
    it('撞狼時狼人即時出局且直接入夜（撞狼美人不觸發殉情）', () => {
      const seats = makeSeatsWithRoles([
        'wolf_beauty',
        'wolf',
        'villager',
        'villager',
        'knight',
        'witch',
      ]);

      const duel = resolveKnightDuel(
        seats,
        5,
        1,
        false,
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      );

      expect(duel.allowed).toBe(true);
      expect(duel.targetWasWolf).toBe(true);
      expect(duel.eliminatedSeat).toBe(1);
      expect(duel.deathReason).toBe('knight_duel');
      expect(duel.enterNightImmediately).toBe(true);
      expect(duel.seats[0].isAlive).toBe(false);
      // 狼美人被騎士決鬥出局，不觸發殉情（其他玩家全數存活）
      expect(duel.seats.filter((s) => s.isAlive)).toHaveLength(5);

      // 不可重複使用決鬥
      const secondTry = resolveKnightDuel(
        duel.seats,
        5,
        2,
        duel.knightDuelUsed,
        2,
        DEFAULT_RULE_OVERRIDES,
        duel.mechWolfState,
      );
      expect(secondTry.allowed).toBe(false);
    });

    it('撞好人時騎士自刎，繼續白天流程', () => {
      const seats = makeSeatsWithRoles([
        'wolf',
        'wolf',
        'villager',
        'villager',
        'knight',
        'witch',
      ]);

      const duel = resolveKnightDuel(
        seats,
        5,
        3,
        false,
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      );

      expect(duel.allowed).toBe(true);
      expect(duel.targetWasWolf).toBe(false);
      expect(duel.eliminatedSeat).toBe(5);
      expect(duel.deathReason).toBe('knight_duel_fail');
      expect(duel.enterNightImmediately).toBe(false);
      expect(duel.seats[4].isAlive).toBe(false);
      expect(duel.seats[2].isAlive).toBe(true);
    });
  });

  describe('攝夢人（dream_catcher）', () => {
    it('當晚夢遊者免疫狼刀與女巫毒藥', () => {
      const seats = makeSeatsWithRoles([
        'wolf',
        'wolf',
        'villager',
        'villager',
        'dream_catcher',
        'witch',
      ]);

      const night1 = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          wolfTarget: 3,
          witchPoisonTarget: 3,
          dreamCatcherTarget: 3,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(night1.deaths).toEqual([]);
      expect(night1.seats[2].isAlive).toBe(true);
      expect(night1.lastDreamTarget).toBe(3);
    });

    it('連續兩晚夢同一人導致夢死（無開槍技能）', () => {
      const seats = makeSeatsWithRoles([
        'wolf',
        'wolf',
        'villager',
        'hunter',
        'dream_catcher',
        'witch',
      ]);

      const night2 = resolveNight({
        seats,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          wolfTarget: null,
          dreamCatcherTarget: 4,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        lastDreamTarget: 4,
      });

      expect(night2.seats[3].isAlive).toBe(false);
      expect(night2.seats[3].deathReason).toBe('dream_catcher_consecutive');
      const hunterElig = night2.shootEligibilities.find((s) => s.seatNumber === 4);
      expect(hunterElig?.canShoot).toBe(false);
    });

    it('攝夢人夜死時牽連當晚夢遊者共死（無開槍技能）', () => {
      const seats = makeSeatsWithRoles([
        'wolf',
        'wolf',
        'villager',
        'hunter',
        'dream_catcher',
        'witch',
      ]);

      const night1 = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          wolfTarget: 5, // 刀攝夢人
          dreamCatcherTarget: 4, // 夢獵人
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(night1.seats[4].isAlive).toBe(false);
      expect(night1.seats[3].isAlive).toBe(false);
      expect(night1.seats[3].deathReason).toBe('dream_catcher_link');
      const hunterElig = night1.shootEligibilities.find((s) => s.seatNumber === 4);
      expect(hunterElig?.canShoot).toBe(false);
    });
  });

  describe('熊（bear）', () => {
    it('左右最近存活鄰居含狼時咆哮；鄰居死亡自動跨過；熊死亡不咆哮', () => {
      // 1:bear, 2:villager, 3:wolf, 4:villager, 5:villager, 6:villager
      const seats = makeSeatsWithRoles([
        'bear',
        'villager',
        'wolf',
        'villager',
        'villager',
        'villager',
      ]);

      // 初始：1 號熊左右為 2(民) 與 6(民) -> 不咆哮
      const r1 = evaluateBearRoar(seats, createInitialMechWolfState());
      expect(r1?.roared).toBe(false);
      expect(r1?.leftNeighborSeat).toBe(2);
      expect(r1?.rightNeighborSeat).toBe(6);

      // 2 號出局後：1 號熊左鄰跨過 2 變成 3(狼) -> 咆哮！
      const night1 = resolveNight({
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
      expect(night1.bearRoar?.roared).toBe(true);
      expect(night1.bearRoar?.leftNeighborSeat).toBe(3);
      expect(night1.bearRoar?.rightNeighborSeat).toBe(6);

      // 1 號熊出局 -> 不咆哮
      const seatsBearDead = seats.map((s) =>
        s.seatNumber === 1 ? { ...s, isAlive: false } : s,
      );
      const rDead = evaluateBearRoar(seatsBearDead, createInitialMechWolfState());
      expect(rDead?.bearAlive).toBe(false);
      expect(rDead?.roared).toBe(false);
    });

    it('機械狼學習好人身分後，相鄰於熊不觸發咆哮', () => {
      const seats = makeSeatsWithRoles(['bear', 'mech_wolf', 'villager', 'villager']);
      const unlearned = evaluateBearRoar(seats, createInitialMechWolfState());
      expect(unlearned?.roared).toBe(true);

      const learnedVillager = evaluateBearRoar(seats, {
        ...createInitialMechWolfState(),
        learnedFromSeat: 3,
        learnedRoleId: 'villager',
      });
      expect(learnedVillager?.roared).toBe(false);
    });
  });
});
