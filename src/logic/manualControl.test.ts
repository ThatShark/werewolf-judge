import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createInitialMechWolfState,
  createInitialSeats,
  createManualVictoryResult,
  shouldTriggerAutoVictory,
  toggleSeatAliveManually,
} from './index';

describe('法官手動切換存活／出局狀態（manualControl）', () => {
  it('可將存活玩家手動標記出局並可還原為存活', () => {
    const roles = ['wolf', 'wolf', 'villager', 'villager', 'seer', 'hunter'];
    const seats = createInitialSeats(6).map((s, idx) => ({ ...s, roleId: roles[idx] }));

    const deadRes = toggleSeatAliveManually(
      seats,
      3,
      2,
      createInitialMechWolfState(),
      DEFAULT_RULE_OVERRIDES,
    );
    expect(deadRes.becameAlive).toBe(false);
    expect(deadRes.seats[2].isAlive).toBe(false);
    expect(deadRes.seats[2].deathReason).toBe('manual_judge');
    expect(deadRes.seats[2].deathRound).toBe(2);

    const reviveRes = toggleSeatAliveManually(
      deadRes.seats,
      3,
      2,
      deadRes.mechWolfState,
      DEFAULT_RULE_OVERRIDES,
    );
    expect(reviveRes.becameAlive).toBe(true);
    expect(reviveRes.seats[2].isAlive).toBe(true);
    expect(reviveRes.seats[2].deathReason).toBeUndefined();
    expect(reviveRes.seats[2].deathRound).toBeUndefined();
  });

  it('手動標記最後一隻小狼出局時會同步更新機械狼入隊狀態', () => {
    const roles = ['wolf', 'mech_wolf', 'villager', 'villager', 'psychic', 'witch'];
    const seats = createInitialSeats(6).map((s, idx) => ({ ...s, roleId: roles[idx] }));

    const res = toggleSeatAliveManually(
      seats,
      1,
      2,
      createInitialMechWolfState(),
      DEFAULT_RULE_OVERRIDES,
    );
    expect(res.seats[0].isAlive).toBe(false);
    expect(res.mechWolfState.hasJoinedWolfTeam).toBe(true);
    expect(res.victory.winner).toBeNull();
  });

  it('法官手動勝負覆蓋與強制繼續鎖定判斷', () => {
    expect(createManualVictoryResult('good_surrender')).toEqual({
      winner: 'wolf',
      winReason: '法官手動覆蓋：好人陣營交牌，狼人陣營勝利',
    });
    expect(createManualVictoryResult('wolf_surrender')).toEqual({
      winner: 'good',
      winReason: '法官手動覆蓋：狼人陣營交牌，好人陣營勝利',
    });
    expect(createManualVictoryResult('force_draw')).toEqual({
      winner: 'draw',
      winReason: '法官手動覆蓋：強制結束，本局判定平局',
    });

    const autoWin = { winner: 'wolf' as const, winReason: '屠民勝利' };
    expect(shouldTriggerAutoVictory(autoWin, false)).toBe(true);
    expect(shouldTriggerAutoVictory(autoWin, true)).toBe(false);
    expect(shouldTriggerAutoVictory({ winner: null, winReason: null }, false)).toBe(false);
  });
});
