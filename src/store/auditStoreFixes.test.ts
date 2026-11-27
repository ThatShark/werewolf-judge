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
  createInitialConversionState,
  createInitialFinalBatchState,
  createInitialSeats,
  createInitialThirdPartySpecialState,
  createInitialWolfGirlState,
} from '../logic';
import { useGameStore } from './gameStore';

function setupRoles(boardId: string, roles: string[]) {
  const store = useGameStore.getState();
  store.selectBoard(boardId);
  const seats = createInitialSeats(roles.length).map((s, idx) => ({
    ...s,
    roleId: roles[idx],
    isAlive: true,
  }));
  useGameStore.setState({
    seats,
    phase: 'night',
    round: 1,
    currentStepIndex: 0,
  });
}

describe('Batch C：Store 持久化與全量流程接線驗證', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().restartGame({ keepNicknames: false });
  });

  it('dealOnlineRoles 自動為盜賊板／盜寶大師板寫入底牌狀態且不重複', () => {
    useGameStore.getState().selectBoard('12p-cupid-thief');
    const resThief = useGameStore.getState().dealOnlineRoles(() => 0.42);
    expect(resThief.ok).toBe(true);
    const sThief = useGameStore.getState();
    expect(sThief.thiefBottomCards).toHaveLength(2);
    expect(sThief.conversionState?.thiefBottomCards).toHaveLength(2);

    useGameStore.getState().selectBoard('12p-treasure-master');
    const resTm = useGameStore.getState().dealOnlineRoles(() => 0.23);
    expect(resTm.ok).toBe(true);
    expect(useGameStore.getState().treasureMasterState?.bottomCards).toHaveLength(3);
  });

  it('finishNight 完整持久化 poisonerPoisonUsed、wolfGirlState 與入夜前快照，並支援白夜使者回溯', () => {
    setupRoles('12p-classic', [
      'wolf',
      'wolf',
      'poisoner',
      'white_night_envoy',
      'villager',
      'villager',
    ]);
    useGameStore.setState({
      round: 2,
      ruleOverrides: { ...useGameStore.getState().ruleOverrides, enableSheriff: false },
      wolfGirlState: {
        ...createInitialWolfGirlState(),
        confessedSeat: 5,
        confessSuccess: true,
        alignedWithWolf: true,
      },
    });

    useGameStore.getState().updateNightDraft({
      round: 2,
      wolfTarget: 6,
      poisonerTarget: 5,
    });
    useGameStore.getState().finishNight();

    const afterNight = useGameStore.getState();
    expect(afterNight.poisonerPoisonUsed).toBe(true);
    expect(afterNight.wolfGirlState?.confessedSeat).toBe(5);
    expect(afterNight.seats[4].isAlive).toBe(false);
    expect(afterNight.seats[5].isAlive).toBe(false);
    expect(afterNight.preNightSnapshot).toBeTruthy();

    // 白夜使者回溯：還原所有昨晚出局者、回到夜晚第 0 步並鎖定已用一次
    const rewind = useGameStore.getState().triggerWhiteNightRewind();
    expect(rewind.allowed).toBe(true);
    const afterRewind = useGameStore.getState();
    expect(afterRewind.phase).toBe('night');
    expect(afterRewind.seats[4].isAlive).toBe(true);
    expect(afterRewind.seats[5].isAlive).toBe(true);
    expect(afterRewind.poisonerPoisonUsed).toBe(false);
    expect(afterRewind.finalBatchState?.whiteNightEnvoyUsed).toBe(true);
  });

  it('submitExileVotes 套用禁票／加減票／烏鴉詛咒，寫入 exiledHistory，並可被定序王子復活重投', () => {
    setupRoles('12p-classic', [
      'wolf',
      'villager',
      'villager',
      'sequence_prince',
      'seer',
      'witch',
    ]);
    // 2 號平民曾被覺醒石像鬼轉化；1 號開槓禁票、3 號管家 +1、4 號狼僕 -1、1 號被烏鴉詛咒 +1
    useGameStore.setState((s) => ({
      phase: 'day_vote',
      dayStage: 'exile_vote',
      seats: s.seats.map((seat) =>
        seat.seatNumber === 2
          ? { ...seat, statuses: { ...seat.statuses, convertedByAwakenedGargoyle: true } }
          : seat,
      ),
      conversionState: {
        ...createInitialConversionState(),
        awakenedGargoyleConvertedSeat: 2,
      },
      finalBatchState: {
        ...createInitialFinalBatchState(),
        contrarianSilencedVoterSeat: 1,
      },
      thirdPartySpecialState: {
        ...createInitialThirdPartySpecialState(),
        butlerActiveVoteBonusSeat: 3,
        wolfMaidActiveVotePenaltySeat: 4,
        crowActiveCursedSeat: 2,
      },
    }));

    // 1(禁票)投票時應拋出奪票錯誤
    expect(() =>
      useGameStore.getState().submitExileVotes({
        1: 6,
        2: 6,
        3: 2,
        4: 6,
        5: 6,
        6: 2,
      }),
    ).toThrow('奪票');

    // 排除被奪票之 1 號後計票：2->6, 3(+1 -> 2票)->2, 4(-1 -> 0票)->6, 5->6, 6->2
    // 2 號得票 = 3(2票)+6(1票)+烏鴉(+1) = 4；6 號得票 = 2(1票)+5(1票) = 2
    const tally = useGameStore.getState().submitExileVotes({
      2: 6,
      3: 2,
      4: 6,
      5: 6,
      6: 2,
    });
    expect(tally.outcome).toBe('exile');
    expect(tally.record.electedSeat).toBe(2);

    const afterExile = useGameStore.getState();
    expect(afterExile.seats[1].isAlive).toBe(false);
    expect(afterExile.exiledHistory).toHaveLength(1);
    expect(afterExile.exiledHistory?.[0].convertedByAwakenedGargoyle).toBe(true);
    expect(afterExile.exiledHistory?.[0].effectiveFaction).toBe('wolf');

    // 定序王子翻牌：復活 2 號並清除方才放逐紀錄
    const revote = useGameStore.getState().triggerSequencePrinceRevote();
    expect(revote.allowed).toBe(true);
    const afterRevote = useGameStore.getState();
    expect(afterRevote.seats[1].isAlive).toBe(true);
    expect(afterRevote.exiledHistory).toHaveLength(0);
    expect(afterRevote.exileResolvedToday).toBeNull();
    expect(afterRevote.finalBatchState?.sequencePrinceUsed).toBe(true);
  });

  it('triggerShoot 支援雙槍遞減 shotsRemaining；白澤延遲死亡；警上競選期間禁止騎士決鬥', () => {
    setupRoles('12p-classic', [
      'wolf_king',
      'wolf',
      'knight',
      'seer',
      'villager',
      'villager',
    ]);
    useGameStore.setState((s) => ({
      phase: 'day_announcement',
      dayStage: 'sheriff_election',
      seats: s.seats.map((seat) =>
        seat.seatNumber === 5
          ? { ...seat, statuses: { ...seat.statuses, baiZeDelayedDeath: true } }
          : seat,
      ),
      pendingShooters: [
        {
          seatNumber: 1,
          roleId: 'wolf_king',
          canShoot: true,
          reason: '雙槍',
          shotsRemaining: 2,
          deathReason: 'exiled',
        },
      ],
    }));

    // 警上階段騎士不可決鬥
    const duelDuringSheriff = useGameStore.getState().knightDuel(3, 2);
    expect(duelDuringSheriff.allowed).toBe(false);

    // 第 1 槍帶走 4 號：剩餘 1 槍仍應留在 pendingShooters
    useGameStore.getState().triggerShoot(1, 4);
    expect(useGameStore.getState().seats[3].isAlive).toBe(false);
    expect(useGameStore.getState().pendingShooters).toHaveLength(1);
    expect(useGameStore.getState().pendingShooters[0].shotsRemaining).toBe(1);

    // 第 2 槍帶走 6 號：清空 pendingShooters
    useGameStore.getState().triggerShoot(1, 6);
    expect(useGameStore.getState().seats[5].isAlive).toBe(false);
    expect(useGameStore.getState().pendingShooters).toHaveLength(0);

    // 白澤延遲死亡結算淘汰 5 號
    useGameStore.getState().triggerBaiZeDelayedDeath();
    expect(useGameStore.getState().seats[4].isAlive).toBe(false);
    expect(useGameStore.getState().seats[4].deathReason).toBe('bai_ze_delayed_death');
  });
});
