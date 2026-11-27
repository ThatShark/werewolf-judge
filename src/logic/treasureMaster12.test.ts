import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canTreasureMasterChooseCard,
  checkVictory,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  initTreasureMasterBottomCards,
  resolveDayExile,
  resolveMaskedVillagerDelayedDeath,
  resolveNight,
  validateTreasureMasterBottomCards,
} from './index';
import type { PlayerSeat } from './types';

function createTreasureMaster12Seats(): PlayerSeat[] {
  const roles = [
    'wolf',            // 1
    'wolf',            // 2
    'wolf_king',       // 3
    'villager',        // 4
    'villager',        // 5
    'villager',        // 6
    'villager',        // 7
    'psychic',         // 8
    'poisoner',        // 9
    'hunter',          // 10
    'dream_catcher',   // 11
    'treasure_master', // 12 (底牌例：wolf, masked_villager, villager)
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

function createSeatsWithMaskedVillager(): PlayerSeat[] {
  const roles = [
    'wolf',            // 1
    'wolf',            // 2
    'wolf_king',       // 3
    'villager',        // 4
    'villager',        // 5
    'villager',        // 6
    'psychic',         // 7
    'poisoner',        // 8
    'hunter',          // 9
    'dream_catcher',   // 10
    'masked_villager', // 11
    'treasure_master', // 12
  ];
  return createInitialSeats(12).map((seat, idx) => ({
    ...seat,
    roleId: roles[idx],
  }));
}

describe('12 人局 - 盜寶大師（盜寶大師／蒙面人／毒師／攝夢人／通靈師完整邊界測試）', () => {
  it('TM-06：盜寶大師 3 底牌規則檢核與陣營／屠邊歸屬（不存在雙神盜寶狼或雙民盜寶狼）', () => {
    // 盜寶狼：必為 1狼1神1民 -> wolf
    expect(validateTreasureMasterBottomCards(['wolf', 'masked_villager', 'villager'])).toEqual({
      allowed: true,
      affiliation: 'wolf',
    });
    // 禁止雙神盜寶狼、雙民盜寶狼
    expect(validateTreasureMasterBottomCards(['wolf', 'masked_villager', 'hunter']).allowed).toBe(
      false,
    );
    expect(validateTreasureMasterBottomCards(['wolf', 'villager', 'villager']).allowed).toBe(false);

    // 好人盜寶：雙神一民 -> god；雙民一神 -> villager
    expect(validateTreasureMasterBottomCards(['hunter', 'masked_villager', 'villager'])).toEqual({
      allowed: true,
      affiliation: 'god',
    });
    expect(validateTreasureMasterBottomCards(['villager', 'villager', 'masked_villager'])).toEqual({
      allowed: true,
      affiliation: 'villager',
    });

    // 驗證屠邊勝負：好人盜寶（雙神一民 = 神邊）仍存活時，其餘神職全滅不算屠神
    const goodGodTmState = initTreasureMasterBottomCards(['hunter', 'masked_villager', 'villager']);
    const otherGodsDead = createTreasureMaster12Seats().map((s) =>
      [8, 9, 10, 11].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(otherGodsDead, DEFAULT_RULE_OVERRIDES, goodGodTmState).winner).toBeNull();

    // 好人盜寶（雙神一民）也出局後才判屠神
    const allGodsDead = otherGodsDead.map((s) =>
      s.seatNumber === 12 ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(allGodsDead, DEFAULT_RULE_OVERRIDES, goodGodTmState).winner).toBe('wolf');

    // 盜寶狼（1狼1神1民 = 狼邊）：原狼全滅但盜寶狼仍存活 -> 好人尚未獲勝
    const wolfTmState = initTreasureMasterBottomCards(['wolf', 'masked_villager', 'villager']);
    const originalWolvesDead = createTreasureMaster12Seats().map((s) =>
      [1, 2, 3].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(originalWolvesDead, DEFAULT_RULE_OVERRIDES, wolfTmState).winner).toBeNull();
  });

  it('TM-02 & TM-08：盜寶大師連續兩晚不可選相同底牌，且通靈師查驗反映其當晚所選底牌身分', () => {
    const seats = createTreasureMaster12Seats();
    const tmState = initTreasureMasterBottomCards(['wolf', 'masked_villager', 'villager']);

    // 第一晚選 masked_villager，通靈師驗 12 號顯示 masked_villager
    const night1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        dreamCatcherTarget: 4,
        treasureMasterCardRoleId: 'masked_villager',
        psychicCheckTarget: 12,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      treasureMasterState: tmState,
      firstNightNoWolfKill: true,
    });

    expect(night1.psychicResult).toEqual({ targetSeat: 12, perceivedRoleId: 'masked_villager' });
    expect(night1.treasureMasterState.lastChosenCardRoleId).toBe('masked_villager');

    // 第二晚不可連續再選 masked_villager
    expect(
      canTreasureMasterChooseCard(night1.treasureMasterState, night1.seats, 'masked_villager')
        .allowed,
    ).toBe(false);
    // 改選 villager 合法
    expect(
      canTreasureMasterChooseCard(night1.treasureMasterState, night1.seats, 'villager').allowed,
    ).toBe(true);
  });

  it('TM-03 & TM-04：夢遊者免疫毒師毒藥；毒師毒殺狼王封鎖開槍', () => {
    const seats = createTreasureMaster12Seats();

    // 攝夢人夢 3 號狼王，毒師同晚毒 3 號 -> 夢遊者免疫夜間傷害，狼王存活
    const protectedByDream = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        dreamCatcherTarget: 3,
        poisonerTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      firstNightNoWolfKill: true,
    });
    expect(protectedByDream.deaths).toEqual([]);
    expect(protectedByDream.seats[2].isAlive).toBe(true);
    expect(protectedByDream.poisonerPoisonUsed).toBe(true);

    // 未被夢遊保護時，毒師毒 3 號狼王 -> 狼王出局且無法開槍
    const poisonedWolfKing = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        dreamCatcherTarget: 4,
        poisonerTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(poisonedWolfKing.deaths).toEqual([{ seat: 3, reason: 'poisoner_poison' }]);
    const wkShoot = poisonedWolfKing.shootEligibilities.find((s) => s.seatNumber === 3);
    expect(wkShoot?.canShoot).toBe(false);
  });

  it('TM-05：蒙面人夜間被狼刀／毒師毒／攝夢連夢時當晚不死，延遲至第二天發言後死亡才觸發屠神', () => {
    // 場上僅剩 11 號蒙面人為最後一神
    const seats = createSeatsWithMaskedVillager().map((s) =>
      [7, 8, 9, 10].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    const wolfTmState = initTreasureMasterBottomCards(['wolf', 'hunter', 'villager']);

    // 第二晚狼刀 11 號蒙面人 -> 進入負傷延遲死亡，天亮仍存活、不觸發屠神
    const night2 = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), wolfTarget: 11 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      treasureMasterState: wolfTmState,
    });

    expect(night2.deaths).toEqual([]);
    expect(night2.maskedDelayedSeats).toEqual([11]);
    expect(night2.seats[10].isAlive).toBe(true);
    expect(night2.seats[10].statuses.maskedDelayedDeath).toBe(true);
    expect(night2.victory.winner).toBeNull();

    // 第二天白天蒙面人發言結束後正式死亡 -> 觸發狼人屠神勝利
    const delayedDeath = resolveMaskedVillagerDelayedDeath(
      night2.seats,
      11,
      2,
      DEFAULT_RULE_OVERRIDES,
      night2.mechWolfState,
      night2.treasureMasterState,
    );

    expect(delayedDeath.allowed).toBe(true);
    expect(delayedDeath.eliminatedSeat).toBe(11);
    expect(delayedDeath.seats[10].isAlive).toBe(false);
    expect(delayedDeath.victory.winner).toBe('wolf');
    expect(delayedDeath.victory.winReason).toContain('屠神');
  });

  it('TM-07 & TM-09：原狼全滅後盜寶狼入隊；盜寶蒙面狼為最後一狼被放逐時暫時不死並可隔夜再刀一人', () => {
    // 原狼 1, 2, 3 全數出局，12 號為盜寶狼（底牌含 masked_villager）
    const seats = createTreasureMaster12Seats().map((s) =>
      [1, 2, 3].includes(s.seatNumber) ? { ...s, isAlive: false } : s,
    );
    const wolfTmState = initTreasureMasterBottomCards(['wolf', 'masked_villager', 'villager']);

    // 第二晚盜寶狼選擇 masked_villager 且完成入隊同步
    const night2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        treasureMasterCardRoleId: 'masked_villager',
        wolfTarget: 4,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      treasureMasterState: wolfTmState,
    });

    expect(night2.treasureMasterState.hasJoinedWolfTeam).toBe(true);
    expect(night2.treasureMasterState.currentNightCardRoleId).toBe('masked_villager');

    // 白天放逐 12 號盜寶蒙面狼 -> 暫時不死，不立即判好人勝
    const exile = resolveDayExile(
      night2.seats,
      12,
      2,
      DEFAULT_RULE_OVERRIDES,
      night2.mechWolfState,
      null,
      night2.treasureMasterState,
    );

    expect(exile.treasureMasterMaskedSurvived).toBe(true);
    expect(exile.seats[11].isAlive).toBe(true);
    expect(exile.victory.winner).toBeNull();
    expect(exile.treasureMasterState?.pendingExileDeathNextNight).toBe(true);

    // 隔夜（第三晚）可再刀一人（例如 5 號平民），點刀後盜寶蒙面狼正式死亡
    const night3 = resolveNight({
      seats: exile.seats,
      round: 3,
      draft: {
        ...createEmptyNightDraft(3),
        treasureMasterCardRoleId: 'villager',
        wolfTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: exile.mechWolfState,
      pendingSelfExplodeSeat: null,
      treasureMasterState: exile.treasureMasterState,
    });

    expect(night3.deaths).toEqual([
      { seat: 5, reason: 'wolf_kill' },
      { seat: 12, reason: 'treasure_master_exile_delayed' },
    ]);
    expect(night3.seats[11].isAlive).toBe(false);
    expect(night3.victory.winner).toBe('good');
  });
});
