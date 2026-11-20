import { describe, expect, it } from 'vitest';
import { BOARDS_BY_ID, MVP_BOARDS, filterBoards, getBoardById } from '../data/boards';
import { ROLES_BY_ID } from '../data/roles';
import {
  createInitialSeats,
  getNightSteps,
  validateRoleAssignment,
} from './setup';

describe('MVP 板子靜態資料與發牌驗證', () => {
  it('包含 3 個 MVP 板子且所有角色 ID 皆存在於角色字典中', () => {
    expect(MVP_BOARDS).toHaveLength(3);
    expect(Object.keys(BOARDS_BY_ID)).toEqual([
      '12p-classic',
      '12p-wolf-king-guard',
      '10p-mech-wolf-psychic',
    ]);

    for (const board of MVP_BOARDS) {
      const allSlots = [
        ...board.composition.wolf,
        ...board.composition.good,
        ...(board.composition.thirdParty ?? []),
      ];
      const totalPlayers = allSlots.reduce((sum, slot) => sum + slot.count, 0);
      expect(totalPlayers).toBe(board.playerCount);

      for (const slot of allSlots) {
        expect(ROLES_BY_ID[slot.roleId]).toBeDefined();
      }
      expect(board.qaList.length).toBeGreaterThan(0);
    }
  });

  it('板子人數篩選與關鍵字（含別名）搜尋運作正常', () => {
    expect(filterBoards(MVP_BOARDS, '12', '')).toHaveLength(2);
    expect(filterBoards(MVP_BOARDS, '10', '')).toHaveLength(1);
    expect(filterBoards(MVP_BOARDS, 'all', '鏡隱迷蹤').map((b) => b.id)).toEqual([
      '10p-mech-wolf-psychic',
    ]);
    expect(filterBoards(MVP_BOARDS, 'all', '黑狼王').map((b) => b.id)).toEqual([
      '12p-wolf-king-guard',
    ]);
  });

  it('能依第一晚與第二晚之後正確切換夜間睜眼順序', () => {
    const classic = getBoardById('12p-classic')!;
    expect(getNightSteps(classic, 1).map((s) => s.actorLabel)).toEqual([
      '狼人',
      '女巫',
      '預言家',
      '獵人',
      '白痴',
    ]);
    expect(getNightSteps(classic, 2).map((s) => s.actorLabel)).toEqual([
      '狼人',
      '女巫',
      '預言家',
      '獵人',
    ]);

    const mech = getBoardById('10p-mech-wolf-psychic')!;
    expect(getNightSteps(mech, 1).map((s) => s.actorLabel)).toEqual([
      '機械狼',
      '守衛',
      '狼人',
      '女巫',
      '通靈師',
      '機械狼',
    ]);
    expect(getNightSteps(mech, 2).map((s) => s.actorLabel)).toEqual([
      '守衛',
      '機械狼',
      '狼人',
      '女巫',
      '通靈師',
    ]);
  });

  it('發牌驗證能正確攔截未配齊、缺配與溢配，配齊時通過', () => {
    const classic = getBoardById('12p-classic')!;
    const seats = createInitialSeats(12, { 1: '阿明', 2: '小美' });
    expect(seats[0].nickname).toBe('阿明');
    expect(seats[1].nickname).toBe('小美');
    expect(seats[2].nickname).toBe('');

    // 全未配
    const emptyResult = validateRoleAssignment(classic, seats);
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.missingRoles.wolf).toBe(4);

    // 溢配（5 隻狼，少 1 平民）
    const rolesOverflow = [
      'wolf',
      'wolf',
      'wolf',
      'wolf',
      'wolf',
      'villager',
      'villager',
      'villager',
      'seer',
      'witch',
      'hunter',
      'idiot',
    ];
    const overflowSeats = seats.map((s, idx) => ({ ...s, roleId: rolesOverflow[idx] }));
    const overflowResult = validateRoleAssignment(classic, overflowSeats);
    expect(overflowResult.valid).toBe(false);
    expect(overflowResult.extraRoles.wolf).toBe(1);
    expect(overflowResult.missingRoles.villager).toBe(1);

    // 完整配齊
    const validRoles = [
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
    const validSeats = seats.map((s, idx) => ({ ...s, roleId: validRoles[idx] }));
    const validResult = validateRoleAssignment(classic, validSeats);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toEqual([]);
  });
});
