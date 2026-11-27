import { describe, expect, it } from 'vitest';
import { getBoardById } from '../data/boards';
import {
  createInitialMechWolfState,
  createInitialPumpkinGhostState,
  getAwakenedSeerCheckResult,
  getDemonWolfCheckResult,
  getDrunkSeerCheckResult,
  getFoolSeerCheckResult,
  getGargoyleCheckResult,
  getLanternSeerCheckResult,
  getNightSteps,
  getPsychicCheckResult,
  getPumpkinGhostCheckResult,
  getPureWhiteCheckResult,
  getSeerCheckResult,
  getWolfWitchCheckResult,
  isSoloIdentityConfirmStep,
  resolveUnclaimedRoleFallback,
} from './index';
import type { PlayerSeat } from './types';

function makeSeat(seatNumber: number, roleId: string | null): PlayerSeat {
  return {
    seatNumber,
    nickname: '',
    roleId,
    isAlive: true,
    secondRoleId: null,
    statuses: {},
  };
}

describe('實體發牌首夜查驗未認領座位（roleId === null）與線上發牌跳過單人確認步驟', () => {
  it('陣營查驗系（預言家／覺醒／愚言／燈影／酒鬼）查驗未認領平民座位絕不回傳 null', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'seer'),
      makeSeat(3, null), // 實體發牌第一晚尚未認領的平民座位
      makeSeat(4, null),
    ];

    expect(getSeerCheckResult(seats, 3)).toEqual({ targetSeat: 3, faction: 'good' });
    expect(getSeerCheckResult(seats, 1)).toEqual({ targetSeat: 1, faction: 'wolf' });
    expect(getAwakenedSeerCheckResult(seats, [3, 4])).toEqual({
      targetSeats: [3, 4],
      result: 'double_good',
    });
    expect(getAwakenedSeerCheckResult(seats, [1, 3])).toEqual({
      targetSeats: [1, 3],
      result: 'suspected_wolf',
    });
    expect(getFoolSeerCheckResult(seats, 3)).toEqual({ targetSeat: 3, faction: 'good' });
    expect(getLanternSeerCheckResult(seats, 3)).toEqual({ targetSeat: 3, faction: 'wolf' });
    expect(getDrunkSeerCheckResult(seats, 3, { manualOverride: 'good' })).toEqual({
      targetSeat: 3,
      faction: 'good',
    });
    expect(getDrunkSeerCheckResult(seats, 3, { rng: () => 0.1 })).toEqual({
      targetSeat: 3,
      faction: 'good',
    });
  });

  it('具體身分／類別查驗系（通靈師／純白／石像鬼／狼巫／南瓜鬼／惡魔）查驗未認領座位自動視為平民（無平民板子唯一推斷）', () => {
    const seats: PlayerSeat[] = [
      makeSeat(1, 'wolf'),
      makeSeat(2, 'psychic'),
      makeSeat(3, null), // 實體發牌第一晚未認領平民
    ];
    const mech = createInitialMechWolfState();
    const pumpkinInherited = { ...createInitialPumpkinGhostState(), hasInherited: true };

    expect(getPsychicCheckResult(seats, mech, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });
    expect(getPureWhiteCheckResult(seats, mech, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });
    expect(getGargoyleCheckResult(seats, mech, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });
    expect(getWolfWitchCheckResult(seats, mech, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });
    expect(getPumpkinGhostCheckResult(seats, pumpkinInherited, mech, 3)).toEqual({
      targetSeat: 3,
      perceivedRoleId: 'villager',
    });
    expect(getDemonWolfCheckResult(seats, 3)).toEqual({
      targetSeat: 3,
      roleType: 'villager',
    });

    // 無平民板子（10 人局 - 雲端追蹤）：其他角色全認領完畢後，唯一未認領座位自動推斷為純白之女
    const cloudBoard = getBoardById('10p-board-15uqrqo')!;
    const cloudSeats: PlayerSeat[] = [
      makeSeat(1, 'hybrid'),
      makeSeat(2, 'cursed_fox'),
      makeSeat(3, 'mech_wolf'),
      makeSeat(4, 'wolf_beauty'),
      makeSeat(5, 'witch'),
      makeSeat(6, 'seer'),
      makeSeat(7, 'awakened_seer'),
      makeSeat(8, 'hunter'),
      makeSeat(9, 'psychic'),
      makeSeat(10, null), // 最後唯一未認領座位必定為純白之女
    ];
    const fallback = resolveUnclaimedRoleFallback(cloudBoard, cloudSeats);
    expect(fallback).toBe('pure_white_maiden');
    expect(
      getPsychicCheckResult(cloudSeats, mech, 10, undefined, {
        fallbackUnclaimedRoleId: fallback,
      }),
    ).toEqual({
      targetSeat: 10,
      perceivedRoleId: 'pure_white_maiden',
    });
  });

  it('線上發牌（online_deal）自動跳過單人身分確認 confirm_only 步驟，但保留多人互認／關係告知步驟', () => {
    // 經典 12 人局：白痴 confirm_only 在線上發牌應被跳過
    const classic = getBoardById('12p-classic')!;
    const physicalSteps = getNightSteps(classic, 1, 'physical_deal');
    const onlineSteps = getNightSteps(classic, 1, 'online_deal');
    expect(physicalSteps.some((s) => s.actorRoleIds.includes('idiot'))).toBe(true);
    expect(onlineSteps.some((s) => s.actorRoleIds.includes('idiot'))).toBe(false);

    // 石像鬼守墓人：首夜石像鬼(confirm_only) 與守墓人(confirm_only) 線上發牌跳過，保留末步石像鬼查驗
    const gargoyleBoard = getBoardById('12p-gargoyle-gravekeeper')!;
    const gargoyleOnline = getNightSteps(gargoyleBoard, 1, 'online_deal');
    expect(gargoyleOnline.some((s) => s.actionType === 'confirm_only')).toBe(false);
    expect(gargoyleOnline.some((s) => s.actionType === 'gargoyle_check')).toBe(true);

    // 盜寶大師：首夜蒙面人(confirm_only) 跳過，但「狼人(wolf, wolf_king)」多人互認保留
    const treasureBoard = getBoardById('12p-treasure-master')!;
    const treasureOnline = getNightSteps(treasureBoard, 1, 'online_deal');
    expect(treasureOnline.some((s) => s.actorRoleIds.includes('masked_villager'))).toBe(false);
    expect(
      treasureOnline.some(
        (s) => s.actionType === 'confirm_only' && s.actorRoleIds.includes('wolf'),
      ),
    ).toBe(true);

    // 驗證多人互認／關係告知步驟不會被誤判為單人身分確認
    expect(
      isSoloIdentityConfirmStep({
        stepId: 's1',
        actorLabel: '情侶',
        actorRoleIds: [],
        actionType: 'confirm_only',
        openPrompt: '情侶請睜眼',
        actionPrompt: '請確認彼此',
        closePrompt: '情侶請閉眼',
      }),
    ).toBe(false);
    expect(
      isSoloIdentityConfirmStep({
        stepId: 's2',
        actorLabel: '狼兄、狼弟',
        actorRoleIds: ['wolf_brother', 'wolf_younger_brother'],
        actionType: 'confirm_only',
        openPrompt: '狼兄、狼弟請睜眼',
        actionPrompt: '狼兄、狼弟請相認',
        closePrompt: '狼兄、狼弟請閉眼',
      }),
    ).toBe(false);
    expect(
      isSoloIdentityConfirmStep({
        stepId: 's3',
        actorLabel: '雙子',
        actorRoleIds: ['twins'],
        actionType: 'confirm_only',
        openPrompt: '雙子請睜眼',
        actionPrompt: '雙子請相認',
        closePrompt: '雙子請閉眼',
      }),
    ).toBe(false);
    expect(
      isSoloIdentityConfirmStep({
        stepId: 's4',
        actorLabel: '所有感染者',
        actorRoleIds: [],
        actionType: 'confirm_only',
        openPrompt: '所有感染者請睜眼',
        actionPrompt: '(確認目前感染者有誰)',
        closePrompt: '所有感染者請閉眼',
      }),
    ).toBe(false);
    expect(
      isSoloIdentityConfirmStep({
        stepId: 's5',
        actorLabel: '白痴',
        actorRoleIds: ['idiot'],
        actionType: 'confirm_only',
        openPrompt: '白痴請睜眼',
        actionPrompt: '(確認白痴是誰)',
        closePrompt: '白痴請閉眼',
      }),
    ).toBe(true);
  });
});
