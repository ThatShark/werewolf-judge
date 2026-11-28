import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  clearNightStepDraftFields,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialFinalBatchState,
  createInitialMechWolfState,
  createInitialThirdPartySpecialState,
  resolveDayExile,
  resolveNight,
} from './index';
import type { PlayerSeat } from './types';

function makeSeat(seatNumber: number, roleId: string, isAlive = true): PlayerSeat {
  return {
    seatNumber,
    nickname: `${seatNumber}號`,
    roleId,
    isAlive,
    statuses: {
      idiotRevealed: false,
    },
  };
}

describe('clearNightStepDraftFields', () => {
  it('從女巫退回狼人時可精準清空女巫解藥/毒藥與狼刀草稿，不影響其他無關欄位', () => {
    const draft = {
      ...createEmptyNightDraft(1),
      guardTarget: 2,
      wolfTarget: 3,
      witchUseAntidote: true,
      witchPoisonTarget: 5,
      seerCheckTarget: 6,
    };

    const afterWitchClear = clearNightStepDraftFields(draft, { actionType: 'witch_action' });
    expect(afterWitchClear.witchUseAntidote).toBe(false);
    expect(afterWitchClear.witchPoisonTarget).toBeNull();
    expect(afterWitchClear.wolfTarget).toBe(3);
    expect(afterWitchClear.guardTarget).toBe(2);

    const afterWolfClear = clearNightStepDraftFields(afterWitchClear, { actionType: 'wolf_kill' });
    expect(afterWolfClear.wolfTarget).toBeNull();
    expect(afterWolfClear.guardTarget).toBe(2);
    expect(afterWolfClear.seerCheckTarget).toBe(6);
  });
});

describe('狀態機邏輯修補：狼刀早退防護與覺醒狼美人放逐消耗', () => {
  it('resolveNight Step 7 狼刀在先不會因舞者舞池免刀目標而誤判提前狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'dancer'),
      makeSeat(3, 'seer'),
      makeSeat(4, 'villager'),
      makeSeat(5, 'villager'),
    ];
    const draft = {
      ...createEmptyNightDraft(2),
      wolfTarget: 3,
      dancerFloorTargets: [2, 3, 4],
    };

    const result = resolveNight({
      seats,
      draft,
      round: 2,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, wolfKillPriority: true },
      thirdPartySpecialState: createInitialThirdPartySpecialState(),
    });

    // 3 號（唯一神職）在舞者舞池中免疫狼刀，不應誤判狼勝
    expect(result.seats.find((s) => s.seatNumber === 3)?.isAlive).toBe(true);
    expect(result.victory.winner).toBeNull();
  });

  it('resolveNight Step 7 狼刀在先不會在小女孩成功替死保護最後神職時誤判提前狼勝', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'seer'),
      makeSeat(3, 'little_girl'),
      makeSeat(4, 'villager'),
      makeSeat(5, 'villager'),
    ];
    const draft = {
      ...createEmptyNightDraft(2),
      wolfTarget: 2,
      littleGirlIdentifyTarget: 3,
    };

    const result = resolveNight({
      seats,
      draft,
      round: 2,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, wolfKillPriority: true },
      finalBatchState: createInitialFinalBatchState(),
    });

    // 2 號預言家被小女孩替死救下，3 號小女孩陣亡，場上仍有神與民，不應提前判狼勝
    expect(result.seats.find((s) => s.seatNumber === 2)?.isAlive).toBe(true);
    expect(result.seats.find((s) => s.seatNumber === 3)?.isAlive).toBe(false);
    expect(result.victory.winner).toBeNull();
  });

  it('resolveDayExile 覺醒狼美人首次放逐替死後會標記 awakenedWolfBeautySubstituteUsed = true', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'awakened_wolf_beauty'),
      makeSeat(2, 'villager'),
      makeSeat(3, 'seer'),
      makeSeat(4, 'villager'),
    ];
    const combatState = {
      ...createInitialCombatState(),
      awakenedWolfBeautyActiveCharmSeat: 2,
      awakenedWolfBeautySubstituteUsed: false,
    };

    const res = resolveDayExile(
      seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
      null,
      undefined,
      undefined,
      undefined,
      { combatState },
    );

    expect(res.awakenedWolfBeautySubstitutedSeat).toBe(2);
    expect(res.combatState?.awakenedWolfBeautySubstituteUsed).toBe(true);
    expect(res.combatState?.awakenedWolfBeautyActiveCharmSeat).toBeNull();
  });
});
