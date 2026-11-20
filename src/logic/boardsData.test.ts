import { describe, expect, it } from 'vitest';
import { ALL_BOARDS, BOARDS_BY_ID, filterBoards } from '../data/boards';
import { ROLES_BY_ID, ROLE_LIST } from '../data/roles';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  getNightSteps,
  resolveNight,
  validateRoleAssignment,
} from './index';

describe('全量 142 板子與 128 角色資料完整性驗證', () => {
  it('成功載入全部 142 個不重複板子與 128 個不重複角色', () => {
    expect(ALL_BOARDS).toHaveLength(142);
    expect(Object.keys(BOARDS_BY_ID)).toHaveLength(142);
    expect(ROLE_LIST).toHaveLength(128);
    expect(Object.keys(ROLES_BY_ID)).toHaveLength(128);

    // 驗證人數分類分佈完全符合 SPEC.md
    expect(filterBoards(ALL_BOARDS, '6', '')).toHaveLength(4);
    expect(filterBoards(ALL_BOARDS, '7', '')).toHaveLength(1);
    expect(filterBoards(ALL_BOARDS, '8', '')).toHaveLength(2);
    expect(filterBoards(ALL_BOARDS, '9', '')).toHaveLength(6);
    expect(filterBoards(ALL_BOARDS, '10', '')).toHaveLength(33);
    expect(filterBoards(ALL_BOARDS, '12', '')).toHaveLength(93);
    expect(filterBoards(ALL_BOARDS, 'multi', '')).toHaveLength(3);
  });

  it('全部 142 個板子的角色配置加總、角色參考與三段式台詞皆合法完整', () => {
    const qaBoards = ALL_BOARDS.filter((b) => b.qaList.length > 0);
    expect(qaBoards.length).toBeGreaterThanOrEqual(77);

    for (const board of ALL_BOARDS) {
      const allSlots = [
        ...board.composition.wolf,
        ...board.composition.good,
        ...(board.composition.thirdParty ?? []),
      ];
      expect(allSlots.length).toBeGreaterThan(0);

      for (const slot of allSlots) {
        expect(slot.count).toBeGreaterThan(0);
        expect(ROLES_BY_ID[slot.roleId]).toBeDefined();
      }

      const totalPoolCount = allSlots.reduce((sum, slot) => sum + slot.count, 0);
      if (!board.isFlexibleComposition) {
        expect(totalPoolCount).toBe(board.playerCount);
      } else {
        expect(totalPoolCount).toBeGreaterThan(0);
      }

      const firstNight = getNightSteps(board, 1);
      const nextNight = getNightSteps(board, 2);
      expect(firstNight.length).toBeGreaterThan(0);
      expect(nextNight.length).toBeGreaterThan(0);

      for (const step of [...firstNight, ...nextNight]) {
        expect(step.openPrompt.trim().length).toBeGreaterThan(0);
        expect(step.actionPrompt.trim().length).toBeGreaterThan(0);
        expect(step.closePrompt.trim().length).toBeGreaterThan(0);
        for (const rId of step.actorRoleIds) {
          expect(ROLES_BY_ID[rId]).toBeDefined();
        }
      }
    }
  });

  it('全部 142 個板子皆可正常配齊角色並跑完第一晚與第二晚夜間結算不報錯', () => {
    for (const board of ALL_BOARDS) {
      const wolfPool: string[] = [];
      for (const slot of board.composition.wolf) {
        for (let i = 0; i < slot.count; i += 1) wolfPool.push(slot.roleId);
      }
      const otherPool: string[] = [];
      for (const slot of [...board.composition.good, ...(board.composition.thirdParty ?? [])]) {
        for (let i = 0; i < slot.count; i += 1) otherPool.push(slot.roleId);
      }

      let assignedRoles: string[] = [];
      if (wolfPool.length + otherPool.length >= board.playerCount) {
        const neededOthers = Math.max(0, board.playerCount - wolfPool.length);
        assignedRoles = [...wolfPool, ...otherPool.slice(0, neededOthers)].slice(
          0,
          board.playerCount,
        );
      } else {
        assignedRoles = [...wolfPool, ...otherPool];
        while (assignedRoles.length < board.playerCount) {
          assignedRoles.push(otherPool[0] ?? 'villager');
        }
      }

      const seats = createInitialSeats(board.playerCount).map((seat, idx) => ({
        ...seat,
        roleId: assignedRoles[idx],
      }));

      const validation = validateRoleAssignment(board, seats);
      expect(validation.valid, `板子 ${board.name} 驗證失敗：${validation.errors.join(' ')}`).toBe(
        true,
      );

      const mechSeat = seats.find((s) => s.roleId === 'mech_wolf');
      const nonMechSeat = seats.find((s) => s.roleId !== 'mech_wolf')!;
      const night1Draft = {
        ...createEmptyNightDraft(1),
        ...(mechSeat ? { mechWolfLearnTarget: nonMechSeat.seatNumber } : {}),
      };

      const night1Res = resolveNight({
        seats,
        round: 1,
        draft: night1Draft,
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(night1Res.seats).toHaveLength(board.playerCount);

      const night2Res = resolveNight({
        seats: night1Res.seats,
        round: 2,
        draft: createEmptyNightDraft(2),
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: night1Res.witchAntidoteUsed,
        witchPoisonUsed: night1Res.witchPoisonUsed,
        lastGuardedSeat: night1Res.lastGuardedSeat,
        mechWolfState: night1Res.mechWolfState,
        pendingSelfExplodeSeat: null,
      });

      expect(night2Res.seats).toHaveLength(board.playerCount);
    }
  });
});
