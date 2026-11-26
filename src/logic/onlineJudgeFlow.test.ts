import { describe, expect, it } from 'vitest';
import { ALL_BOARDS, getBoardById } from '../data/boards';
import { getRoleById } from '../data/roles';
import {
  buildNightEndSpeech,
  buildNightStartSpeech,
  buildStepCloseSpeech,
  buildStepOpenSpeech,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialThirdPartySpecialState,
  getDefaultRuleOverridesForBoard,
  getSeatTouchConfirmView,
  getTouchConfirmEventAfterStep,
  getTouchConfirmSeatOrder,
  resolveActiveLuckyActorForNight,
  resolveNight,
} from './index';
import type { PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: `${idx + 1}號`,
    roleId,
    isAlive: true,
  }));
}

describe('線上法官語音台詞與輪流認身分資訊隔離', () => {
  it('開頭固定播報「天黑請閉眼」；結尾依第一晚與警長房規切換台詞', () => {
    expect(buildNightStartSpeech()).toBe('天黑請閉眼');

    const r1Sheriff = buildNightEndSpeech(1, true);
    expect(r1Sheriff.introText).toBe('要上警的玩家請舉手，三秒後天亮');
    expect(r1Sheriff.countdown).toEqual(['三', '二', '一']);
    expect(r1Sheriff.fullText).toBe('要上警的玩家請舉手，三秒後天亮，三、二、一');

    const r1NoSheriff = buildNightEndSpeech(1, false);
    expect(r1NoSheriff.introText).toBe('三秒後天亮');
    expect(r1NoSheriff.fullText).toBe('三秒後天亮，三、二、一');

    const r2Sheriff = buildNightEndSpeech(2, true);
    expect(r2Sheriff.introText).toBe('三秒後天亮');
    expect(r2Sheriff.fullText).toBe('三秒後天亮，三、二、一');
  });

  it('睜眼與閉眼台詞僅保留角色睜閉眼，不包含中間操作提示', () => {
    const step = {
      actorLabel: '預言家',
      openPrompt: '預言家請睜眼',
      actionPrompt: '請選擇你要查驗的玩家',
      closePrompt: '預言家請閉眼',
    };
    expect(buildStepOpenSpeech(step)).toBe('預言家請睜眼');
    expect(buildStepCloseSpeech(step)).toBe('預言家請閉眼');
    expect(buildStepOpenSpeech(step)).not.toContain('請選擇');
  });

  it('商人贈禮後觸發 1..N 號輪流確認，且嚴格資訊隔離（不揭露禮物內容）', () => {
    const seats = makeSeats(['wolf', 'wolf', 'miracle_merchant', 'villager', 'villager', 'seer']);
    const draft = {
      ...createEmptyNightDraft(1),
      miracleMerchantTarget: 4,
      miracleMerchantItem: 'witch_poison' as const,
    };

    const order = getTouchConfirmSeatOrder(seats);
    expect(order).toEqual([1, 2, 3, 4, 5, 6]);

    const evt = getTouchConfirmEventAfterStep({ actionType: 'miracle_merchant_gift' }, draft, 1);
    expect(evt).not.toBeNull();
    expect(evt!.affectedSeats).toEqual([4]);

    const luckyView = getSeatTouchConfirmView(4, evt!);
    expect(luckyView.hasStatus).toBe(true);
    expect(luckyView.headline).toBe('你是幸運兒');
    expect(luckyView.headline + luckyView.subline).not.toContain('毒');
    expect(luckyView.headline + luckyView.subline).not.toContain('查驗');
    expect(luckyView.headline + luckyView.subline).not.toContain('盾');

    const otherView = getSeatTouchConfirmView(2, evt!);
    expect(otherView.hasStatus).toBe(false);
    expect(otherView.headline).toBe('你沒有獲得附加身分');
  });

  it('邱比特連線後觸發輪流確認，且情侶畫面絕不揭露另一半座號', () => {
    const draft = {
      ...createEmptyNightDraft(1),
      cupidLoversPair: [3, 7] as [number, number],
    };
    const evt = getTouchConfirmEventAfterStep({ actionType: 'cupid_link' }, draft, 1);
    expect(evt).not.toBeNull();
    expect(evt!.affectedSeats).toEqual([3, 7]);

    const lover3 = getSeatTouchConfirmView(3, evt!);
    expect(lover3.hasStatus).toBe(true);
    expect(lover3.headline).toBe('你成為了情侶');
    expect(lover3.headline + lover3.subline).not.toContain('7');
    expect(lover3.headline + lover3.subline).not.toContain('07');
  });
});

describe('兩狼局自動預設單爆吞警徽與首夜幸運兒技能解鎖', () => {
  it('所有 2 狼板子預設 badgeSwallowRule 為 single_explode，3 狼及以上維持 double_explode', () => {
    const twoWolfBoards = ALL_BOARDS.filter(
      (b) => b.composition.wolf.reduce((sum, s) => sum + s.count, 0) === 2,
    );
    expect(twoWolfBoards.length).toBeGreaterThan(0);
    for (const board of twoWolfBoards) {
      expect(getDefaultRuleOverridesForBoard(board.id).badgeSwallowRule).toBe('single_explode');
    }

    const classic12 = getBoardById('12p-classic');
    expect(classic12).toBeDefined();
    expect(getDefaultRuleOverridesForBoard(classic12!.id).badgeSwallowRule).toBe('double_explode');
  });

  it('第一晚奇蹟商人贈予盾牌且房規勾選首夜可用時，幸運兒可正確綁定座號並於首夜成功擋刀', () => {
    const seats = makeSeats([
      'wolf',
      'wolf',
      'wolf',
      'miracle_merchant',
      'villager',
      'villager',
      'seer',
      'witch',
      'hunter',
      'villager',
    ]);
    const ruleOverrides = getDefaultRuleOverridesForBoard('10p-miracle-merchant');
    const state = createInitialThirdPartySpecialState();
    const draft = {
      ...createEmptyNightDraft(1),
      wolfTarget: 5,
      miracleMerchantTarget: 5,
      miracleMerchantItem: 'guard_shield' as const,
    };

    const active = resolveActiveLuckyActorForNight(draft, state, 1, ruleOverrides);
    expect(active).toEqual({
      actorSeat: 5,
      source: 'miracle',
      item: 'guard_shield',
      allowedThisRound: true,
    });

    const resolved = resolveNight({
      round: 1,
      seats,
      draft: {
        ...draft,
        luckyItemActorSeat: active!.actorSeat,
        luckyItemTargetSeat: 5,
      },
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      ruleOverrides,
      thirdPartySpecialState: state,
    });

    expect(resolved.deaths.some((d) => d.seat === 5)).toBe(false);
    expect(resolved.seats.find((s) => s.seatNumber === 5)?.isAlive).toBe(true);
    expect(resolved.thirdPartySpecialState?.miracleLuckyItemUsed).toBe(true);
  });

  it('開膛手傑克角色百科完整包含主身分版與第二身分版（含狂熱粉與偵探集結指證）', () => {
    const jack = getRoleById('jack_the_ripper');
    expect(jack).toBeDefined();
    expect(jack!.description).toContain('主身分版');
    expect(jack!.description).toContain('第二身分版');
    expect(jack!.description).toContain('狂熱粉');
    expect(jack!.description).toContain('偵探集結指證');
  });
});
