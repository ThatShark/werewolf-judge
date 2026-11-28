import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMap = new Map<string, string>();
vi.hoisted(() => {
  const mockStorage: Storage = {
    get length() {
      return storageMap.size;
    },
    clear: () => storageMap.clear(),
    getItem: (key: string) => storageMap.get(key) ?? null,
    key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
    removeItem: (key: string) => {
      storageMap.delete(key);
    },
    setItem: (key: string, value: string) => {
      storageMap.set(key, value);
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
});

import { getBoardById } from '../data/boards';
import {
  createInitialCombatState,
  createInitialConversionState,
  createInitialSheriffState,
  getNightSteps,
} from '../logic';
import { useGameStore } from './gameStore';

function setupClassic12Physical() {
  const store = useGameStore.getState();
  store.dissolveRoom();
  store.updateHostMode({
    judgeMode: 'physical_judge',
    dealMode: 'physical_deal',
    controlMode: 'central_control',
  });
  store.selectBoard('12p-classic');
  const roles = [
    'wolf',
    'wolf',
    'wolf',
    'wolf',
    'seer',
    'witch',
    'hunter',
    'idiot',
    'villager',
    'villager',
    'villager',
    'villager',
  ];
  roles.forEach((roleId, idx) => {
    useGameStore.getState().assignRole(idx + 1, roleId);
  });
  const res = useGameStore.getState().startGame();
  expect(res.ok).toBe(true);
}

describe('外科手術式修補驗證（單步回溯、警徽優先入夜、開局歸零、延遲合併）', () => {
  beforeEach(() => {
    storageMap.clear();
    useGameStore.getState().dissolveRoom();
  });

  it('夜間從女巫退回狼人時，自動清空女巫解藥/毒藥與狼人刀口草稿', () => {
    setupClassic12Physical();
    const board = getBoardById('12p-classic')!;
    const steps = getNightSteps(board, 1, 'physical_deal');
    const wolfIdx = steps.findIndex((s) => s.actionType === 'wolf_kill');
    const witchIdx = steps.findIndex((s) => s.actionType === 'witch_action');
    expect(wolfIdx).toBeGreaterThanOrEqual(0);
    expect(witchIdx).toBe(wolfIdx + 1);

    useGameStore.setState({ currentStepIndex: wolfIdx });
    useGameStore.getState().updateNightDraft({ wolfTarget: 9 });
    useGameStore.getState().nextNightStep();
    expect(useGameStore.getState().currentStepIndex).toBe(witchIdx);

    useGameStore.getState().updateNightDraft({ witchUseAntidote: true, witchPoisonTarget: 10 });
    useGameStore.getState().prevNightStep();

    const after = useGameStore.getState();
    expect(after.currentStepIndex).toBe(wolfIdx);
    expect(after.currentNightDraft.witchUseAntidote).toBe(false);
    expect(after.currentNightDraft.witchPoisonTarget).toBeNull();
    expect(after.currentNightDraft.wolfTarget).toBeNull();
  });

  it('白天單一角色行為可撤銷 1 步，撤銷後立即清空快照且跨階段自動清除', () => {
    setupClassic12Physical();
    useGameStore.setState({
      phase: 'day_vote',
      dayStage: 'exile_vote',
      lastDayActionSnapshot: null,
    });

    // 放逐 9 號後可撤銷
    useGameStore.getState().exilePlayer(9);
    expect(useGameStore.getState().seats.find((s) => s.seatNumber === 9)?.isAlive).toBe(false);
    expect(useGameStore.getState().exileResolvedToday?.seat).toBe(9);
    expect(useGameStore.getState().lastDayActionSnapshot).not.toBeNull();

    // 執行撤銷上一步：9 號恢復存活、鎖定解除、快照清為 null（不可連按兩次）
    const undone = useGameStore.getState().undoLastDayAction();
    expect(undone).toBe(true);
    expect(useGameStore.getState().seats.find((s) => s.seatNumber === 9)?.isAlive).toBe(true);
    expect(useGameStore.getState().exileResolvedToday).toBeNull();
    expect(useGameStore.getState().lastDayActionSnapshot).toBeNull();
    expect(useGameStore.getState().undoLastDayAction()).toBe(false);

    // 再次放逐並進入下一夜：跨階段後快照自動清空
    useGameStore.getState().exilePlayer(10);
    expect(useGameStore.getState().lastDayActionSnapshot).not.toBeNull();
    useGameStore.getState().advanceToNextNight();
    expect(useGameStore.getState().phase).toBe('night');
    expect(useGameStore.getState().lastDayActionSnapshot).toBeNull();
  });

  it('警長被白狼王自爆帶走時，優先停留等待移交警徽，移交完成後再自動進入黑夜', () => {
    setupClassic12Physical();
    const seats = useGameStore.getState().seats.map((s) =>
      s.seatNumber === 1 ? { ...s, roleId: 'white_wolf_king' } : s,
    );
    useGameStore.setState({
      phase: 'day_announcement',
      dayStage: 'speaking',
      round: 1,
      seats,
      sheriffState: {
        ...createInitialSheriffState(),
        badgeStatus: 'active',
        sheriffSeat: 5, // 5 號預言家為警長
      },
    });

    const res = useGameStore.getState().whiteWolfKingExplode(1, 5);
    expect(res.allowed).toBe(true);

    // 必須停留在白天等待 5 號移交警徽，不可直接切入黑夜
    const waiting = useGameStore.getState();
    expect(waiting.phase).toBe('day_announcement');
    expect(waiting.sheriffState.pendingBadgeTransferFrom).toBe(5);
    expect(waiting.enterNightAfterPendingShooters).toBe(true);

    // 移交警徽給 9 號後，自動銜接進入第 2 晚
    useGameStore.getState().transferSheriffBadge(9);
    const afterTransfer = useGameStore.getState();
    expect(afterTransfer.sheriffState.sheriffSeat).toBe(9);
    expect(afterTransfer.sheriffState.pendingBadgeTransferFrom).toBeNull();
    expect(afterTransfer.phase).toBe('night');
    expect(afterTransfer.round).toBe(2);
    expect(afterTransfer.enterNightAfterPendingShooters).toBe(false);
  });

  it('startGame 跨局重開會徹底清空前局殘留的角色狀態（含 conversionState / combatState / exiledHistory）', () => {
    setupClassic12Physical();
    useGameStore.setState({
      conversionState: {
        ...createInitialConversionState(),
        wildChildIdolSeat: 2,
      },
      combatState: {
        ...createInitialCombatState(),
        awakenedWolfBeautySubstituteUsed: true,
      },
      exiledHistory: [{ round: 1, seatNumber: 9, roleId: 'villager' }],
      enterNightAfterPendingShooters: true,
    });

    useGameStore.getState().returnToLobby();
    const res = useGameStore.getState().startGame();
    expect(res.ok).toBe(true);

    const next = useGameStore.getState();
    expect(next.conversionState?.wildChildIdolSeat).toBeNull();
    expect(next.combatState?.awakenedWolfBeautySubstituteUsed).toBe(false);
    expect(next.exiledHistory).toEqual([]);
    expect(next.enterNightAfterPendingShooters).toBe(false);
    expect(next.lastDayActionSnapshot).toBeNull();
  });

  it('proceedToDeathAnnouncement 使用合併死亡而非覆蓋，保留警上階段的座位調整', () => {
    setupClassic12Physical();
    const currentSeats = useGameStore.getState().seats;
    const deferredSeats = currentSeats.map((s) =>
      s.seatNumber === 9 ? { ...s, isAlive: false, deathReason: 'wolf_kill' as const, deathRound: 1 } : s,
    );
    const mutatedDuringElection = currentSeats.map((s) =>
      s.seatNumber === 5 ? { ...s, nickname: '警上新暱稱' } : s,
    );

    useGameStore.setState({
      phase: 'day_announcement',
      dayStage: 'sheriff_election',
      seats: mutatedDuringElection,
      pendingNightAnnouncement: {
        seats: deferredSeats,
        pendingShooters: [],
        victory: { winner: null, winReason: null },
      },
    });

    useGameStore.getState().proceedToDeathAnnouncement();
    const after = useGameStore.getState();
    expect(after.pendingNightAnnouncement).toBeNull();
    expect(after.seats.find((s) => s.seatNumber === 9)?.isAlive).toBe(false);
    expect(after.seats.find((s) => s.seatNumber === 5)?.nickname).toBe('警上新暱稱');
  });
});
