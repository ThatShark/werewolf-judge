import { describe, expect, it } from 'vitest';
import { ALL_BOARDS, BOARDS_BY_ID, MVP_BOARDS, filterBoards, getBoardById } from '../data/boards';
import { ROLES_BY_ID } from '../data/roles';
import {
  DEFAULT_AMBIENT_AUDIO_SETTINGS,
  DEFAULT_HOST_MODE,
  DEFAULT_ONLINE_JUDGE_SETTINGS,
  DEFAULT_RULE_OVERRIDES,
  claimSeatRole,
  clampOnlineJudgeSettings,
  createInitialSeats,
  dealRandomRoles,
  finalizePhysicalDealVillagers,
  getHostModeDescriptor,
  getNightSteps,
  getStepClaimSummary,
  getUnclaimedSeatNumbers,
  validatePhysicalDealSetup,
  validateRoleAssignment,
} from './setup';

describe('MVP 板子靜態資料與發牌驗證', () => {
  it('包含 3 個 MVP 板子且所有角色 ID 皆存在於角色字典中', () => {
    expect(MVP_BOARDS).toHaveLength(3);
    expect(MVP_BOARDS.map((b) => b.id)).toEqual([
      '12p-classic',
      '12p-wolf-king-guard',
      '10p-mech-wolf-psychic',
    ]);
    expect(ALL_BOARDS).toHaveLength(142);
    expect(Object.keys(BOARDS_BY_ID)).toEqual(
      expect.arrayContaining(['12p-classic', '12p-wolf-king-guard', '10p-mech-wolf-psychic']),
    );

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

  it('新增房規預設值與 3D 主持矩陣（8 種模式）正確定義', () => {
    expect(DEFAULT_RULE_OVERRIDES.enableSheriff).toBe(true);
    expect(DEFAULT_RULE_OVERRIDES.badgeSwallowRule).toBe('single_explode');
    expect(DEFAULT_RULE_OVERRIDES.noSheriffDeadDirection).toBe('clockwise');
    expect(DEFAULT_RULE_OVERRIDES.sheriffUseDeadSideOnDeath).toBe(false);

    expect(DEFAULT_HOST_MODE).toEqual({
      judgeMode: 'physical_judge',
      dealMode: 'physical_deal',
      controlMode: 'central_control',
    });
    expect(DEFAULT_AMBIENT_AUDIO_SETTINGS).toEqual({
      presetId: 'none',
      customFileName: null,
      volume: 0.4,
      autoPlayAtNight: true,
    });

    const mode1 = getHostModeDescriptor(DEFAULT_HOST_MODE);
    expect(mode1.modeNumber).toBe(1);
    expect(mode1.availableInStandalone).toBe(true);

    const mode2 = getHostModeDescriptor({
      judgeMode: 'physical_judge',
      dealMode: 'online_deal',
      controlMode: 'central_control',
    });
    expect(mode2.modeNumber).toBe(2);
    expect(mode2.availableInStandalone).toBe(true);

    const mode5 = getHostModeDescriptor({
      judgeMode: 'online_judge',
      dealMode: 'physical_deal',
      controlMode: 'central_control',
    });
    expect(mode5.modeNumber).toBe(5);
    expect(mode5.availableInStandalone).toBe(true);

    const mode6 = getHostModeDescriptor({
      judgeMode: 'online_judge',
      dealMode: 'online_deal',
      controlMode: 'central_control',
    });
    expect(mode6.modeNumber).toBe(6);
    expect(mode6.availableInStandalone).toBe(true);

    const mode4 = getHostModeDescriptor({
      judgeMode: 'physical_judge',
      dealMode: 'online_deal',
      controlMode: 'multi_device',
    });
    expect(mode4.modeNumber).toBe(4);
    expect(mode4.milestone).toBe('B');
    expect(mode4.availableInStandalone).toBe(false);

    const mode8 = getHostModeDescriptor({
      judgeMode: 'online_judge',
      dealMode: 'online_deal',
      controlMode: 'multi_device',
    });
    expect(mode8.modeNumber).toBe(8);
    expect(mode8.milestone).toBe('B');
    expect(mode8.availableInStandalone).toBe(false);
  });

  it('實體發牌首夜動態認領（防重複指派與超額）＋未認領自動補平民', () => {
    const classic = getBoardById('12p-classic')!;
    let seats = createInitialSeats(12);

    // 開局全為 null 可通過實體發牌開局檢核
    expect(validatePhysicalDealSetup(classic, seats).valid).toBe(true);

    // 1~4 號認領狼人
    for (const num of [1, 2, 3, 4]) {
      const res = claimSeatRole(classic, seats, num, 'wolf');
      expect(res.ok).toBe(true);
      seats = res.seats;
    }

    // 第 5 隻狼超額 -> 攔截
    const overWolf = claimSeatRole(classic, seats, 5, 'wolf');
    expect(overWolf.ok).toBe(false);
    expect(overWolf.reason).toContain('上限');

    // 1 號已認領狼人 -> 不可重複指派為預言家
    const duplicateSeat = claimSeatRole(classic, seats, 1, 'seer');
    expect(duplicateSeat.ok).toBe(false);
    expect(duplicateSeat.reason).toContain('已認領');

    // 非本板子角色（如守衛）-> 攔截
    const invalidRole = claimSeatRole(classic, seats, 9, 'guard');
    expect(invalidRole.ok).toBe(false);
    expect(invalidRole.reason).toContain('不屬於本板子');

    // 正常認領四神（9~12 號）
    seats = claimSeatRole(classic, seats, 9, 'seer').seats;
    seats = claimSeatRole(classic, seats, 10, 'witch').seats;
    seats = claimSeatRole(classic, seats, 11, 'hunter').seats;
    seats = claimSeatRole(classic, seats, 12, 'idiot').seats;

    // 解除認領（null）後可重新認領
    const cleared = claimSeatRole(classic, seats, 9, null);
    expect(cleared.ok).toBe(true);
    expect(cleared.seats[8].roleId).toBeNull();
    seats = claimSeatRole(classic, cleared.seats, 9, 'seer').seats;

    // 第一晚結束結算時，5~8 號未認領自動補為平民
    const finalized = finalizePhysicalDealVillagers(seats);
    expect(finalized.slice(4, 8).every((s) => s.roleId === 'villager')).toBe(true);
    expect(validateRoleAssignment(classic, finalized).valid).toBe(true);
  });

  it('線上發牌隨機洗牌能產出完全符合板子配置的角色分布', () => {
    const classic = getBoardById('12p-classic')!;
    const seats = createInitialSeats(12);
    let seed = 0.25;
    const deterministicRng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const dealt = dealRandomRoles(classic, seats, deterministicRng);
    expect(validateRoleAssignment(classic, dealt).valid).toBe(true);
    expect(dealt.filter((s) => s.roleId === 'wolf')).toHaveLength(4);
    expect(dealt.filter((s) => s.roleId === 'villager')).toHaveLength(4);
    expect(dealt.filter((s) => s.roleId === 'seer')).toHaveLength(1);
    expect(dealt.filter((s) => s.roleId === 'witch')).toHaveLength(1);
    expect(dealt.filter((s) => s.roleId === 'hunter')).toHaveLength(1);
    expect(dealt.filter((s) => s.roleId === 'idiot')).toHaveLength(1);
  });

  it('線上法官設定（OnlineJudgeSettings）預設值與邊界夾值（clamp）正確', () => {
    expect(DEFAULT_ONLINE_JUDGE_SETTINGS).toEqual({
      ttsEnabled: true,
      ttsRate: 1.0,
      stepBufferSeconds: 3,
    });

    const clampedLow = clampOnlineJudgeSettings(DEFAULT_ONLINE_JUDGE_SETTINGS, {
      ttsEnabled: false,
      ttsRate: 0.1,
      stepBufferSeconds: -5,
    });
    expect(clampedLow).toEqual({
      ttsEnabled: false,
      ttsRate: 0.5,
      stepBufferSeconds: 0,
    });

    const clampedHigh = clampOnlineJudgeSettings(clampedLow, {
      ttsRate: 3.45,
      stepBufferSeconds: 99.6,
    });
    expect(clampedHigh).toEqual({
      ttsEnabled: false,
      ttsRate: 2.0,
      stepBufferSeconds: 15,
    });
  });

  it('首夜步驟動態認領摘要（getStepClaimSummary）支援多角色步驟與已認領自動完成', () => {
    const wolfKingBoard = getBoardById('12p-wolf-king-guard')!;
    let seats = createInitialSeats(12);

    // 狼人(狼王) 步驟需要 wolf×3 + wolf_king×1
    const beforeWolf = getStepClaimSummary(wolfKingBoard, seats, ['wolf', 'wolf_king']);
    expect(beforeWolf.requiresClaiming).toBe(true);
    expect(beforeWolf.isComplete).toBe(false);
    expect(beforeWolf.totalExpected).toBe(4);
    expect(beforeWolf.totalClaimed).toBe(0);
    expect(getUnclaimedSeatNumbers(seats)).toHaveLength(12);

    seats = claimSeatRole(wolfKingBoard, seats, 1, 'wolf').seats;
    seats = claimSeatRole(wolfKingBoard, seats, 2, 'wolf').seats;
    seats = claimSeatRole(wolfKingBoard, seats, 3, 'wolf').seats;
    const partialWolf = getStepClaimSummary(wolfKingBoard, seats, ['wolf', 'wolf_king']);
    expect(partialWolf.isComplete).toBe(false);
    expect(partialWolf.roles.find((r) => r.roleId === 'wolf')?.remainingCount).toBe(0);
    expect(partialWolf.roles.find((r) => r.roleId === 'wolf_king')?.remainingCount).toBe(1);

    seats = claimSeatRole(wolfKingBoard, seats, 4, 'wolf_king').seats;
    const fullWolf = getStepClaimSummary(wolfKingBoard, seats, ['wolf', 'wolf_king']);
    expect(fullWolf.isComplete).toBe(true);
    expect(fullWolf.totalClaimed).toBe(4);
    expect(getUnclaimedSeatNumbers(seats)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);

    // 機械狼第一晚二次睜眼時，若首步已認領完成則自動判定 isComplete === true
    const mechBoard = getBoardById('10p-mech-wolf-psychic')!;
    let mechSeats = createInitialSeats(10);
    mechSeats = claimSeatRole(mechBoard, mechSeats, 3, 'mech_wolf').seats;
    const mechSummary = getStepClaimSummary(mechBoard, mechSeats, ['mech_wolf']);
    expect(mechSummary.isComplete).toBe(true);
    expect(mechSummary.roles[0].claimedSeats).toEqual([3]);
  });
});
