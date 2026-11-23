import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createInitialSeats,
  generateNoSheriffDeadSpeakingOrder,
  generateSpeakingOrder,
  resolveDaySpeakingRule,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(count: number, deadSeats: number[] = []): PlayerSeat[] {
  const deadSet = new Set(deadSeats);
  return createInitialSeats(count).map((seat) => ({
    ...seat,
    isAlive: !deadSet.has(seat.seatNumber),
  }));
}

function makeFixedRng(values: number[]): () => number {
  let idx = 0;
  return () => {
    const val = values[idx] ?? 0;
    idx += 1;
    return val;
  };
}

describe('發言順序自動抽取引擎（src/logic/speakingOrder.ts）', () => {
  it('隨機模式：全體存活平安夜可抽出起始座位與順／逆時針方向，並自動跳過已出局玩家', () => {
    // 1..8 號，3 號與 7 號出局 -> 存活：[1, 2, 4, 5, 6, 8]
    const seats = makeSeats(8, [3, 7]);

    // rng 第一次 0.5 -> index 3 (5 號)；第二次 0.2 -> clockwise
    const cw = generateSpeakingOrder(seats, {
      mode: 'random',
      rng: makeFixedRng([0.5, 0.2]),
    });
    expect(cw.direction).toBe('clockwise');
    expect(cw.startSeat).toBe(5);
    expect(cw.sheriffLastSeat).toBeNull();
    expect(cw.queue).toEqual([5, 6, 8, 1, 2, 4]);

    // rng 第一次 0.5 -> index 3 (5 號)；第二次 0.8 -> counterclockwise
    const ccw = generateSpeakingOrder(seats, {
      mode: 'random',
      rng: makeFixedRng([0.5, 0.8]),
    });
    expect(ccw.direction).toBe('counterclockwise');
    expect(ccw.startSeat).toBe(5);
    expect(ccw.queue).toEqual([5, 4, 2, 1, 8, 6]);
  });

  it('隨機模式：警上候選人發言僅在候選名單中抽取並自動過濾已出局者', () => {
    const seats = makeSeats(12, [9]);
    // 上警名單 [2, 5, 9(已死), 11] -> 存活候選 [2, 5, 11]
    // rng 第一次 0.4 -> index 1 (5 號)；第二次 0.1 -> clockwise
    const result = generateSpeakingOrder(seats, {
      mode: 'random',
      candidateSeats: [2, 5, 9, 11],
      rng: makeFixedRng([0.4, 0.1]),
    });
    expect(result.startSeat).toBe(5);
    expect(result.direction).toBe('clockwise');
    expect(result.queue).toEqual([5, 11, 2]);
  });

  it('警長指定模式：警左／警右自動跳過死人並將警長排於最後一位（歸票位）', () => {
    // 1..6 號，2 號出局，警長為 4 號
    const seats = makeSeats(6, [2]);

    const sheriffLeft = generateSpeakingOrder(seats, {
      mode: 'sheriff_left',
      sheriffSeat: 4,
    });
    expect(sheriffLeft.direction).toBe('clockwise');
    expect(sheriffLeft.sheriffLastSeat).toBe(4);
    expect(sheriffLeft.queue).toEqual([5, 6, 1, 3, 4]);

    const sheriffRight = generateSpeakingOrder(seats, {
      mode: 'sheriff_right',
      sheriffSeat: 4,
    });
    expect(sheriffRight.direction).toBe('counterclockwise');
    expect(sheriffRight.sheriffLastSeat).toBe(4);
    expect(sheriffRight.queue).toEqual([3, 1, 6, 5, 4]);
  });

  it('死左／死右模式（含多死指定基準死者）：有警長時自動將警長移至最後一位歸票', () => {
    // 1..8 號，昨夜雙死：2 號與 6 號，警長為 4 號
    const seats = makeSeats(8, [2, 6]);

    // 法官指定 6 號為基準死者，走死左（順時針）：7 -> 8 -> 1 -> 3 -> 5 -> 警長 4 壓軸
    const deadLeft = generateSpeakingOrder(seats, {
      mode: 'dead_left',
      referenceDeadSeat: 6,
      sheriffSeat: 4,
    });
    expect(deadLeft.direction).toBe('clockwise');
    expect(deadLeft.anchorSeat).toBe(6);
    expect(deadLeft.sheriffLastSeat).toBe(4);
    expect(deadLeft.queue).toEqual([7, 8, 1, 3, 5, 4]);

    // 法官指定 2 號為基準死者，走死右（逆時針）：1 -> 8 -> 7 -> 5 -> 3 -> 警長 4 壓軸
    const deadRight = generateSpeakingOrder(seats, {
      mode: 'dead_right',
      referenceDeadSeat: 2,
      sheriffSeat: 4,
    });
    expect(deadRight.direction).toBe('counterclockwise');
    expect(deadRight.queue).toEqual([1, 8, 7, 5, 3, 4]);
  });

  it('無警長之死左／死右模式與錯誤參數檢核', () => {
    const seats = makeSeats(6, [3]);

    const noSheriffDeadLeft = generateSpeakingOrder(seats, {
      mode: 'dead_left',
      referenceDeadSeat: 3,
      sheriffSeat: null,
    });
    expect(noSheriffDeadLeft.sheriffLastSeat).toBeNull();
    expect(noSheriffDeadLeft.queue).toEqual([4, 5, 6, 1, 2]);

    expect(() =>
      generateSpeakingOrder(seats, { mode: 'sheriff_left', sheriffSeat: 3 }),
    ).toThrow(/不存在或已出局/);
    expect(() =>
      generateSpeakingOrder(seats, { mode: 'dead_left', referenceDeadSeat: null }),
    ).toThrow(/基準死者/);
  });

  it('無警長死訊發言方向房規：從座號最小死者依 noSheriffDeadDirection（順／逆時針）開始發言', () => {
    // 1..8 號，昨夜 6 號與 2 號死亡 -> 座號最小死者為 2 號
    const seats = makeSeats(8, [6, 2]);

    const cwRule = resolveDaySpeakingRule({
      seats,
      nightDeadSeats: [6, 2],
      sheriffSeat: null,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, noSheriffDeadDirection: 'clockwise' },
    });
    expect(cwRule.defaultDeadAnchor).toBe(2);
    expect(cwRule.noSheriffDeadMode).toBe('dead_left');

    const cwOrder = generateNoSheriffDeadSpeakingOrder(seats, [6, 2], 'clockwise');
    expect(cwOrder.anchorSeat).toBe(2);
    expect(cwOrder.direction).toBe('clockwise');
    expect(cwOrder.queue).toEqual([3, 4, 5, 7, 8, 1]);

    const ccwRule = resolveDaySpeakingRule({
      seats,
      nightDeadSeats: [6, 2],
      sheriffSeat: null,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, noSheriffDeadDirection: 'counterclockwise' },
    });
    expect(ccwRule.defaultDeadAnchor).toBe(2);
    expect(ccwRule.noSheriffDeadMode).toBe('dead_right');

    const ccwOrder = generateNoSheriffDeadSpeakingOrder(seats, [6, 2], 'counterclockwise');
    expect(ccwOrder.anchorSeat).toBe(2);
    expect(ccwOrder.direction).toBe('counterclockwise');
    expect(ccwOrder.queue).toEqual([1, 8, 7, 5, 4, 3]);
  });

  it('有警長死左／死右房規：有死訊時優先提供死左／死右，平安夜自動切回警左／警右', () => {
    const seatsWithDeath = makeSeats(8, [5]);
    const deadSideRec = resolveDaySpeakingRule({
      seats: seatsWithDeath,
      nightDeadSeats: [5],
      sheriffSeat: 3,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, sheriffUseDeadSideOnDeath: true },
    });
    expect(deadSideRec.recommendedModes).toEqual(['dead_left', 'dead_right']);
    expect(deadSideRec.defaultDeadAnchor).toBe(5);

    const peacefulSeats = makeSeats(8, []);
    const peacefulRec = resolveDaySpeakingRule({
      seats: peacefulSeats,
      nightDeadSeats: [],
      sheriffSeat: 3,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, sheriffUseDeadSideOnDeath: true },
    });
    expect(peacefulRec.recommendedModes).toEqual(['sheriff_left', 'sheriff_right']);
    expect(peacefulRec.defaultDeadAnchor).toBeNull();
  });
});
