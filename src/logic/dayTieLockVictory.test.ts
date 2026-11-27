import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map<string, string>();
    const memoryStorage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
  }
});

import {
  DEFAULT_RULE_OVERRIDES,
  checkVictory,
  createInitialCombatState,
  createInitialSheriffState,
} from './index';
import type { PlayerSeat, SheriffState } from './types';
import { useGameStore } from '../store/gameStore';

function makeSeat(
  seatNumber: number,
  roleId: string,
  overrides: Partial<PlayerSeat> = {},
): PlayerSeat {
  return {
    seatNumber,
    nickname: overrides.nickname ?? '',
    roleId,
    isAlive: overrides.isAlive ?? true,
    deathReason: overrides.deathReason,
    deathRound: overrides.deathRound,
    secondRoleId: overrides.secondRoleId ?? null,
    statuses: { ...(overrides.statuses ?? {}) },
  };
}

describe('白天「綁票」自動判狼勝規則（checkVictory & gameStore）', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().restartGame({ keepNicknames: false });
  });

  it('3 狼對 3 好人（無好人警徽、無單次多殺神職）於白天自動判狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'wolf'),
      makeSeat(4, 'seer'),
      makeSeat(5, 'witch'),
      makeSeat(6, 'villager'),
    ];

    const res = checkVictory(seats, DEFAULT_RULE_OVERRIDES, undefined, {
      checkDayVoteTieLock: true,
      sheriffState: createInitialSheriffState(),
      combatState: createInitialCombatState(),
    });
    expect(res.winner).toBe('wolf');
    expect(res.winReason).toContain('綁票');
  });

  it('場上有覺醒女巫或覺醒獵人時（2 狼對 2 好人、無好人警徽），仍自動判綁票狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'awakened_witch'),
      makeSeat(4, 'awakened_hunter'),
      makeSeat(5, 'villager', { isAlive: false }),
    ];

    const res = checkVictory(
      seats,
      { ...DEFAULT_RULE_OVERRIDES, victoryMode: 'slaughter_all' },
      undefined,
      {
        checkDayVoteTieLock: true,
        sheriffState: { ...createInitialSheriffState(), badgeStatus: 'destroyed' },
        combatState: createInitialCombatState(),
      },
    );
    expect(res.winner).toBe('wolf');
    expect(res.winReason).toContain('綁票');
  });

  it('好人持有有效警徽時，即使狼好人數相等也不提前判綁票', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'seer'),
      makeSeat(4, 'villager'),
    ];
    const goodSheriff: SheriffState = {
      ...createInitialSheriffState(),
      status: 'elected',
      sheriffSeat: 3,
      badgeStatus: 'active',
    };

    const res = checkVictory(seats, DEFAULT_RULE_OVERRIDES, undefined, {
      checkDayVoteTieLock: true,
      sheriffState: goodSheriff,
      combatState: createInitialCombatState(),
    });
    expect(res.winner).toBeNull();
  });

  it('場上有未失能且未感染的蜂之狂獵（bee_wild_hunt）時不提前判綁票；失能或受感染後即判綁票', () => {
    const baseSeats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'bee_wild_hunt'),
      makeSeat(4, 'villager'),
    ];

    // 未失能且未感染：不判綁票
    const blocked = checkVictory(baseSeats, DEFAULT_RULE_OVERRIDES, undefined, {
      checkDayVoteTieLock: true,
      sheriffState: createInitialSheriffState(),
      combatState: createInitialCombatState(),
    });
    expect(blocked.winner).toBeNull();

    // 蜂之狂獵已永久失能：判綁票狼勝
    const lostAbilityRes = checkVictory(baseSeats, DEFAULT_RULE_OVERRIDES, undefined, {
      checkDayVoteTieLock: true,
      sheriffState: createInitialSheriffState(),
      combatState: { ...createInitialCombatState(), beeWildHuntLostAbility: true },
    });
    expect(lostAbilityRes.winner).toBe('wolf');
    expect(lostAbilityRes.winReason).toContain('綁票');

    // 蜂之狂獵受種狼感染（轉為狼陣營且不再算好人多殺反制）：判狼勝
    const infectedSeats = baseSeats.map((s) =>
      s.seatNumber === 3 ? { ...s, statuses: { ...s.statuses, infectedBySeedWolf: true } } : s,
    );
    const infectedRes = checkVictory(infectedSeats, DEFAULT_RULE_OVERRIDES, undefined, {
      checkDayVoteTieLock: true,
      sheriffState: createInitialSheriffState(),
      combatState: createInitialCombatState(),
    });
    expect(infectedRes.winner).toBe('wolf');
  });

  it('gameStore：警長出局後將警徽移交給狼人（transferSheriffBadge）立即觸發綁票狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'seer', { isAlive: false, deathRound: 2, deathReason: 'wolf_kill' }),
      makeSeat(4, 'witch'),
      makeSeat(5, 'villager'),
    ];
    useGameStore.setState({
      phase: 'day_announcement',
      dayStage: 'death_announcement',
      round: 2,
      seats,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: true },
      sheriffState: {
        ...createInitialSheriffState(),
        status: 'elected',
        sheriffSeat: 3,
        badgeStatus: 'active',
        pendingBadgeTransferFrom: 3,
      },
      pendingShooters: [],
      combatState: createInitialCombatState(),
      winner: null,
      winReason: null,
      forceContinueAfterVictory: false,
    });

    // 將警徽移交給 1 號狼人 → 2 狼對 2 好人且好人無警徽 → 立即判狼綁票勝
    useGameStore.getState().transferSheriffBadge(1);
    const after = useGameStore.getState();
    expect(after.phase).toBe('game_over');
    expect(after.winner).toBe('wolf');
    expect(after.winReason).toContain('綁票');
  });

  it('gameStore：警長出局後撕毀警徽（destroySheriffBadge）立即觸發綁票狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'wolf'),
      makeSeat(3, 'seer', { isAlive: false, deathRound: 2, deathReason: 'wolf_kill' }),
      makeSeat(4, 'awakened_witch'),
      makeSeat(5, 'villager'),
    ];
    useGameStore.setState({
      phase: 'day_announcement',
      dayStage: 'death_announcement',
      round: 2,
      seats,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, enableSheriff: true },
      sheriffState: {
        ...createInitialSheriffState(),
        status: 'elected',
        sheriffSeat: 3,
        badgeStatus: 'active',
        pendingBadgeTransferFrom: 3,
      },
      pendingShooters: [],
      combatState: createInitialCombatState(),
      winner: null,
      winReason: null,
      forceContinueAfterVictory: false,
    });

    useGameStore.getState().destroySheriffBadge();
    const after = useGameStore.getState();
    expect(after.phase).toBe('game_over');
    expect(after.winner).toBe('wolf');
    expect(after.winReason).toContain('綁票');
  });
});
