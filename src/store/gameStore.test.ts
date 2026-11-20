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

import { ALL_BOARDS } from '../data/boards';
import { GAME_STORAGE_KEY, useGameStore } from './gameStore';
import { buildGameReplayText } from '../components/common/displayHelpers';

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

  it('支援進階 confirm_only 板子與彈性人數調整及法官手動切換存活狀態', () => {
    const lianliankan = ALL_BOARDS.find((b) => b.name.includes('連連看'))!;
    expect(lianliankan).toBeDefined();

    useGameStore.getState().selectBoard(lianliankan.id);
    const roles = [
      'scent_phantom',
      'scent_phantom',
      'scent_phantom',
      'scent_phantom',
      'scent_phantom',
      'scent_phantom',
      'demon_hunter',
      'demon_hunter',
      'demon_hunter',
      'demon_hunter',
    ];
    roles.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    expect(useGameStore.getState().startGame().ok).toBe(true);

    // 跑完第一晚所有 confirm_only 步驟並結算
    for (let i = 0; i < lianliankan.nightSchedule.firstNight.length - 1; i += 1) {
      useGameStore.getState().nextNightStep();
    }
    useGameStore.getState().finishNight();
    expect(useGameStore.getState().phase).toBe('day_announcement');

    // 法官手動標記 7 號出局再還原
    useGameStore.getState().toggleSeatAlive(7);
    expect(useGameStore.getState().seats[6].isAlive).toBe(false);
    expect(useGameStore.getState().seats[6].deathReason).toBe('manual_judge');

    useGameStore.getState().toggleSeatAlive(7);
    expect(useGameStore.getState().seats[6].isAlive).toBe(true);

    // 彈性人數板子（獵殺潛狼 6 -> 10 人）切換
    const huntBoard = ALL_BOARDS.find((b) => b.name.includes('獵殺潛狼'))!;
    useGameStore.getState().selectBoard(huntBoard.id);
    expect(useGameStore.getState().seats).toHaveLength(6);
    useGameStore.getState().setBoardPlayerCount(10);
    expect(useGameStore.getState().seats).toHaveLength(10);

    // 手動宣告第三方勝利
    useGameStore.getState().declareWinner('third_party', '特殊勝利條件達成');
    expect(useGameStore.getState().phase).toBe('game_over');
    expect(useGameStore.getState().winner).toBe('third_party');
  });

  it('Store 層支援發言順序抽取、下一位發言、即時加減秒數（+10s/-10s）與持久化', async () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    CLASSIC_ROLES.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    useGameStore.getState().startGame();
    useGameStore.getState().updateNightDraft({ wolfTarget: 5 });
    useGameStore.getState().finishNight();

    // 調整預設發言時間為 120 秒
    useGameStore.getState().setDefaultSpeakDuration(120);
    expect(useGameStore.getState().defaultSpeakDurationSec).toBe(120);
    expect(useGameStore.getState().remainingSeconds).toBe(120);

    // 警長競選：9 號當選警長
    useGameStore.getState().startSheriffElection([9]);
    expect(useGameStore.getState().sheriffState.sheriffSeat).toBe(9);

    // 生成「死左（基準死者 5 號）」發言佇列，警長 9 號應排在最後一位
    const order = useGameStore.getState().generateSpeakingOrder({
      mode: 'dead_left',
      referenceDeadSeat: 5,
    });
    expect(order.queue[0]).toBe(6);
    expect(order.queue[order.queue.length - 1]).toBe(9);
    expect(order.queue).not.toContain(5);
    expect(useGameStore.getState().currentSpeakerIndex).toBe(0);

    // 倒數與即時加減秒數（+10s / -10s）
    useGameStore.getState().tickSpeakerTimer();
    expect(useGameStore.getState().remainingSeconds).toBe(119);
    useGameStore.getState().adjustSpeakerTime(10);
    expect(useGameStore.getState().remainingSeconds).toBe(129);
    useGameStore.getState().adjustSpeakerTime(-10);
    expect(useGameStore.getState().remainingSeconds).toBe(119);

    // 切換下一位發言 -> 重置為 120 秒
    useGameStore.getState().nextSpeaker();
    expect(useGameStore.getState().currentSpeakerIndex).toBe(1);
    expect(useGameStore.getState().remainingSeconds).toBe(120);

    // 確認發言佇列已寫入當日復盤紀錄與 localStorage
    const day1 = useGameStore.getState().dayHistory.find((d) => d.round === 1);
    expect(day1?.events.some((evt) => evt.includes('發言順序') && evt.includes('死左'))).toBe(true);

    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.state.speakingQueue).toEqual(order.queue);
    expect(parsed.state.currentSpeakerIndex).toBe(1);
    expect(parsed.state.defaultSpeakDurationSec).toBe(120);
  });

  it('Store 層支援警上自爆吞警徽、放逐投票明細（烏鴉+1票接口）與白痴翻牌寫入復盤時間軸', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    CLASSIC_ROLES.forEach((roleId, idx) => {
      useGameStore.getState().assignRole(idx + 1, roleId);
    });
    useGameStore.getState().startGame();
    useGameStore.getState().updateNightDraft({ wolfTarget: null });
    useGameStore.getState().finishNight();

    // 1、9 號上警 -> 1 號狼人於警上自爆 -> 自動吞警徽並強制進入第 2 晚
    useGameStore.getState().startSheriffElection([1, 9]);
    const explode = useGameStore.getState().selfExplode(1);
    expect(explode.allowed).toBe(true);
    expect(explode.swallowedBadge).toBe(true);
    expect(useGameStore.getState().sheriffState.status).toBe('swallowed');
    expect(useGameStore.getState().sheriffState.badgeStatus).toBe('swallowed');
    expect(useGameStore.getState().phase).toBe('night');
    expect(useGameStore.getState().round).toBe(2);

    // 第 2 晚平安夜（1 號自爆狼死亡）
    useGameStore.getState().updateNightDraft({ wolfTarget: null });
    useGameStore.getState().finishNight();
    useGameStore.getState().proceedToDayVote();

    // 白天放逐投票：12 號（白痴）靠烏鴉 +1 票成為最高票 -> 觸發翻牌免死並記錄於結構化事件
    const voteRes = useGameStore.getState().submitExileVotes(
      { 2: 12, 3: 12, 5: 2, 6: 2 },
      { extraVotes: { 12: 1 } },
    );
    expect(voteRes.outcome).toBe('exile');
    expect(voteRes.record.electedSeat).toBe(12);
    expect(useGameStore.getState().seats[11].isAlive).toBe(true);
    expect(useGameStore.getState().seats[11].idiotRevealed).toBe(true);

    const day2 = useGameStore.getState().dayHistory.find((d) => d.round === 2);
    expect(day2?.structuredEvents?.some((e) => e.type === 'idiot_reveal')).toBe(true);

    // 驗證一鍵複製戰報包含吞警徽與逐票明細
    const replay = buildGameReplayText(useGameStore.getState());
    expect(replay).toContain('警上自爆吞警徽');
    expect(replay).toContain('12 號：3 票（2 號、3 號；額外 +1 票）');
  });
});
