import { beforeEach, describe, expect, it, vi } from 'vitest';

// 在 Node 測試環境透過 vi.hoisted 提前注入記憶體版 localStorage 供 Zustand persist 使用
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

import { GAME_STORAGE_KEY, useGameStore } from './gameStore';

const CLASSIC_ROLES = [
  'wolf',
  'wolf',
  'wolf',
  'wolf',
  'villager',
  'villager',
  'villager',
  'villager',
  'seer',
  'witch',
  'hunter',
  'idiot',
];

describe('Zustand GameStore 與 Persist 持久化', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().restartGame({ keepNicknames: false });
  });

  it('支援完整開局、夜間結算、持久化寫入 localStorage 與 rehydrate 還原', async () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    store.setSeatNickname(1, '阿明');
    store.setSeatNickname(5, '小美');

    // 未分配完角色時不可開局
    expect(useGameStore.getState().startGame().ok).toBe(false);

    // 分配全部 12 名角色
    CLASSIC_ROLES.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    expect(useGameStore.getState().startGame().ok).toBe(true);
    expect(useGameStore.getState().phase).toBe('night');

    // 第一晚狼刀 5 號，女巫不救
    useGameStore.getState().updateNightDraft({ wolfTarget: 5 });
    useGameStore.getState().finishNight();

    expect(useGameStore.getState().phase).toBe('day_announcement');
    expect(useGameStore.getState().seats[4].isAlive).toBe(false);
    expect(useGameStore.getState().nightHistory).toHaveLength(1);

    // 驗證已同步寫入 localStorage
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.savedNicknames['1']).toBe('阿明');
    expect(parsed.state.savedNicknames['5']).toBe('小美');
    expect(parsed.state.phase).toBe('day_announcement');

    // 模擬頁面重整：保存目前持久化快照、清空記憶體狀態後寫回快照並呼叫 rehydrate
    const snapshot = raw!;
    useGameStore.getState().restartGame({ keepNicknames: false });
    expect(useGameStore.getState().phase).toBe('board_select');

    localStorage.setItem(GAME_STORAGE_KEY, snapshot);
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().phase).toBe('day_announcement');
    expect(useGameStore.getState().round).toBe(1);
    expect(useGameStore.getState().seats[0].nickname).toBe('阿明');
  });

  it('支援「保留暱稱重開」與「全部清空重開」', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    store.setSeatNickname(1, '阿明');
    store.setSeatNickname(2, '小美');
    CLASSIC_ROLES.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    useGameStore.getState().startGame();
    useGameStore.getState().updateNightDraft({ wolfTarget: 5 });
    useGameStore.getState().finishNight();

    // 1. 保留暱稱重開
    useGameStore.getState().restartGame({ keepNicknames: true });
    const keptState = useGameStore.getState();
    expect(keptState.phase).toBe('seat_setup');
    expect(keptState.selectedBoardId).toBe('12p-classic');
    expect(keptState.savedNicknames[1]).toBe('阿明');
    expect(keptState.savedNicknames[2]).toBe('小美');
    expect(keptState.seats[0].nickname).toBe('阿明');
    expect(keptState.seats[0].roleId).toBeNull();
    expect(keptState.seats[4].isAlive).toBe(true);
    expect(keptState.nightHistory).toEqual([]);

    // 2. 全部清空重開
    useGameStore.getState().restartGame({ keepNicknames: false });
    const clearedState = useGameStore.getState();
    expect(clearedState.phase).toBe('board_select');
    expect(clearedState.selectedBoardId).toBeNull();
    expect(clearedState.savedNicknames).toEqual({});
    expect(clearedState.seats).toEqual([]);
  });

  it('Store 層支援狼人自爆直接進入下一晚並於次晚點刀後死亡', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    CLASSIC_ROLES.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    useGameStore.getState().startGame();
    useGameStore.getState().updateNightDraft({ wolfTarget: 5 });
    useGameStore.getState().finishNight();
    useGameStore.getState().proceedToDayVote();

    // 1 號狼人白天自爆
    const explode = useGameStore.getState().selfExplode(1);
    expect(explode.allowed).toBe(true);
    expect(useGameStore.getState().phase).toBe('night');
    expect(useGameStore.getState().round).toBe(2);
    expect(useGameStore.getState().pendingSelfExplodeSeat).toBe(1);
    expect(useGameStore.getState().seats[0].isAlive).toBe(true);

    // 第 2 晚點刀 6 號後，1 號與 6 號同時於天亮死亡
    useGameStore.getState().updateNightDraft({ wolfTarget: 6 });
    useGameStore.getState().finishNight();
    expect(useGameStore.getState().seats[0].isAlive).toBe(false);
    expect(useGameStore.getState().seats[0].deathReason).toBe('self_explode');
    expect(useGameStore.getState().seats[5].isAlive).toBe(false);
    expect(useGameStore.getState().pendingSelfExplodeSeat).toBeNull();
  });
});
