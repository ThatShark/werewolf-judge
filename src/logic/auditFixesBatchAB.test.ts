import { describe, expect, it } from 'vitest';
import { getBoardById } from '../data/boards';
import { getRoleById } from '../data/roles';
import {
  DEFAULT_RULE_OVERRIDES,
  canThiefChooseCard,
  checkCanShoot,
  checkVictory,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialConversionState,
  createInitialInterferenceState,
  createInitialMechWolfState,
  createInitialSeats,
  createInitialThirdPartySpecialState,
  dealBoardRolesWithBottomCards,
  evaluateNightStepLockState,
  getDefaultRuleOverridesForBoard,
  getGravekeeperExileResult,
  isFirstNightNoWolfKillBoard,
  isSeatAsleep,
  isSeatEffectiveWolf,
  resolveNight,
  resolveWhiteWolfKingExplode,
  syncConversionOnDeaths,
} from './index';
import type { ExiledRecord, PlayerSeat } from './types';

function makeSeats(roles: string[]): PlayerSeat[] {
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: `${idx + 1}號`,
    roleId,
    isAlive: true,
  }));
}

describe('Batch A & B 規格對帳修復與零測試角色完整行為斷言', () => {
  describe('【零行為測試補齊】1. 百變狼王（chameleon_wolf_king）', () => {
    it('首夜變身為目標神職底牌並寫入 chameleonOriginalRoleId，同時保留狼人陣營判定', () => {
      const seats = makeSeats([
        'chameleon_wolf_king',
        'wolf',
        'seer',
        'witch',
        'villager',
        'villager',
      ]);

      const n1 = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          chameleonWolfTarget: 3, // 變身為 3 號預言家
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(n1.seats[0].roleId).toBe('seer');
      expect(n1.conversionState.chameleonWolfSeat).toBe(1);
      expect(n1.conversionState.chameleonOriginalRoleId).toBe('chameleon_wolf_king');
      expect(
        isSeatEffectiveWolf(n1.seats[0], { conversionState: n1.conversionState }),
      ).toBe(true);

      // 若原小狼(2)死亡，變身後之百變狼王仍計入存活狼人並接管入隊
      const afterWolfDead = n1.seats.map((s) =>
        s.seatNumber === 2 ? { ...s, isAlive: false, deathReason: 'exiled' as const } : s,
      );
      const synced = syncConversionOnDeaths(afterWolfDead, n1.conversionState, 2);
      expect(synced.state.chameleonJoinedTeam).toBe(true);

      // 好人不可提前因「場上看似無狼」而獲勝
      const v = checkVictory(afterWolfDead, DEFAULT_RULE_OVERRIDES, undefined, {
        conversionState: synced.state,
      });
      expect(v.winner).toBeNull();
    });
  });

  describe('【零行為測試補齊】2. 邪惡商人（evil_merchant）', () => {
    it('首夜贈槍給隊友；次夜僅於昨日有非帶槍狼死亡時可改贈毒藥，毒殺後商人永久失能', () => {
      const seats = makeSeats([
        'evil_merchant',
        'wolf',
        'seer',
        'witch',
        'villager',
        'villager',
      ]);

      // 第 1 晚贈獵人槍給 2 號小狼（禁止贈給自己）
      const n1SelfAttempt = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          evilMerchantTarget: 1,
          evilMerchantGiftType: 'hunter_gun',
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1SelfAttempt.thirdPartySpecialState.evilMerchantGunHolderSeat).toBeNull();

      const n1 = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          evilMerchantTarget: 2,
          evilMerchantGiftType: 'hunter_gun',
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1.thirdPartySpecialState.evilMerchantGunHolderSeat).toBe(2);

      // 第 2 晚若「昨日無非帶槍狼死亡」，邪惡商人不可改贈毒藥
      const n2Blocked = resolveNight({
        seats: n1.seats,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          evilMerchantTarget: 2,
          evilMerchantGiftType: 'witch_poison',
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        thirdPartySpecialState: {
          ...n1.thirdPartySpecialState,
          evilMerchantLastDayNoGunWolfDied: false,
        },
      });
      expect(n2Blocked.thirdPartySpecialState.evilMerchantPoisonHolderSeat).toBeNull();

      // 第 2 晚若標記 evilMerchantLastDayNoGunWolfDied: true，則可改贈毒藥且後續可下毒並永久失能
      const n2Gift = resolveNight({
        seats: n1.seats,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          evilMerchantTarget: 2,
          evilMerchantGiftType: 'witch_poison',
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        thirdPartySpecialState: {
          ...n1.thirdPartySpecialState,
          evilMerchantLastDayNoGunWolfDied: true,
        },
      });
      expect(n2Gift.thirdPartySpecialState.evilMerchantGunHolderSeat).toBeNull();
      expect(n2Gift.thirdPartySpecialState.evilMerchantPoisonHolderSeat).toBe(2);

      const n3Poison = resolveNight({
        seats: n2Gift.seats,
        round: 3,
        draft: {
          ...createEmptyNightDraft(3),
          evilMerchantPoisonActionTarget: 3,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        thirdPartySpecialState: n2Gift.thirdPartySpecialState,
      });
      expect(n3Poison.seats[2].isAlive).toBe(false);
      expect(n3Poison.seats[2].deathReason).toBe('evil_merchant_poison');
      expect(n3Poison.thirdPartySpecialState.evilMerchantDisabled).toBe(true);
    });
  });

  describe('【零行為測試補齊】3. 睡美人（sleeping_beauty）與外族王子（exotic_prince）', () => {
    it('首夜選枕邊人、次夜雙向擴散；全狼沉睡使女巫不見刀口；外族王子免疫睡眠且查中即喚醒', () => {
      const seats = makeSeats([
        'sleeping_beauty',
        'wolf',
        'witch',
        'exotic_prince',
        'villager',
        'villager',
      ]);

      // 第 1 晚選 2 號唯一狼為沉睡中心 → 全狼沉睡，狼刀於女巫看刀口前失效（即使用解藥也必因空刀報錯或無效）
      const n1 = resolveNight({
        seats,
        round: 1,
        draft: {
          ...createEmptyNightDraft(1),
          sleepingBeautyPickSeat: 2,
          wolfTarget: 5,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1.thirdPartySpecialState.sleepingSeats).toEqual([2]);
      expect(n1.seats[4].isAlive).toBe(true);

      // 驗證全狼沉睡導致狼隊步驟於 nightValidation 被鎖死
      const wolfStepLock = evaluateNightStepLockState({
        step: {
          stepId: 's-wolf',
          actorLabel: '狼人',
          openPrompt: '',
          actionPrompt: '',
          closePrompt: '',
          actionType: 'wolf_kill',
          actorRoleIds: ['wolf'],
        },
        round: 1,
        seats,
        draft: { ...createEmptyNightDraft(1), sleepingBeautyPickSeat: 2 },
        isClaimStage: false,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        foxLostAbility: false,
        pumpkinGhostState: { hasInherited: false, inheritedHistory: [] },
        combatState: createInitialCombatState(),
        thirdPartySpecialState: n1.thirdPartySpecialState,
      });
      expect(wolfStepLock.locked).toBe(true);

      // 第 2 晚擴散為 [1, 2, 3]（3 號女巫陷入沉睡），但 4 號外族王子查驗 2 號喚醒睡美人
      const n2Wake = resolveNight({
        seats: n1.seats,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          exoticPrinceCheckTarget: 2,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        thirdPartySpecialState: n1.thirdPartySpecialState,
      });
      expect(n2Wake.exoticPrinceResult).toEqual({ targetSeat: 2, foundSleepingBeauty: true });
      expect(n2Wake.thirdPartySpecialState.sleepingBeautyAwakened).toBe(true);
      expect(n2Wake.thirdPartySpecialState.sleepingSeats).toEqual([]);
      expect(isSeatAsleep(n2Wake.seats, n2Wake.thirdPartySpecialState, 4)).toBe(false);
    });
  });

  describe('【零行為測試補齊】4. 盜賊（thief）', () => {
    it('邱比特盜賊板發牌必含盜賊且 2 張底牌絕不同時為雙狼；首夜選牌強制選狼與交換底牌', () => {
      const board = getBoardById('12p-cupid-thief')!;
      expect(board).toBeDefined();
      const baseSeats = createInitialSeats(board.playerCount);
      const dealt = dealBoardRolesWithBottomCards(board, baseSeats, () => 0.37);

      expect(dealt.seats.some((s) => s.roleId === 'thief')).toBe(true);
      expect(dealt.thiefBottomCards).toHaveLength(2);
      const bothWolves = dealt.thiefBottomCards.every(
        (r) => getRoleById(r)?.faction === 'wolf',
      );
      expect(bothWolves).toBe(false);

      // 驗證底牌含狼時強制選狼規則
      expect(canThiefChooseCard(['wolf', 'villager'], 'villager').allowed).toBe(false);
      expect(canThiefChooseCard(['wolf', 'villager'], 'wolf').allowed).toBe(true);

      const thiefGameSeats = makeSeats([
        'thief',
        'cupid',
        'wolf',
        'seer',
        'villager',
        'villager',
      ]);
      const initConv = {
        ...createInitialConversionState(),
        thiefBottomCards: ['wolf', 'hunter'],
      };
      const n1 = resolveNight({
        seats: thiefGameSeats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), thiefChosenRoleId: 'wolf' },
        ruleOverrides: getDefaultRuleOverridesForBoard('12p-cupid-thief'),
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        conversionState: initConv,
      });
      expect(n1.seats[0].roleId).toBe('wolf');
      expect(n1.conversionState.thiefChosenRoleId).toBe('wolf');
    });
  });

  describe('【Batch A & B 核心規格落差鎖定測試】', () => {
    it('Setup 房規預設與板子首夜無刀／角色分類修正', () => {
      expect(getDefaultRuleOverridesForBoard('10p-board-15uqrqo').hybridCountsAsVillager).toBe(true);
      expect(getDefaultRuleOverridesForBoard('12p-board-1hfx9f2').hybridCountsAsVillager).toBe(true);
      expect(getDefaultRuleOverridesForBoard('12p-board-1hlxijo').witchSelfSave).toBe('always');
      expect(getDefaultRuleOverridesForBoard('12p-fool-seer').badgeSwallowRule).toBe('single_explode');
      expect(getDefaultRuleOverridesForBoard('12p-cupid-thief').victoryMode).toBe('slaughter_all');

      expect(isFirstNightNoWolfKillBoard(getBoardById('12p-wolf-girl'))).toBe(true);
      expect(isFirstNightNoWolfKillBoard(getBoardById('12p-treasure-master'))).toBe(true);
      expect(getRoleById('twins')?.category).toBe('villager');
      expect(getRoleById('exotic_prince')?.category).toBe('villager');
    });

    it('白狼王自爆帶走獵人時一般獵人禁反槍；覺醒獵人獨立判定；狼王＋超黑獵槍雙槍為 2 槍', () => {
      const seats = makeSeats([
        'white_wolf_king',
        'hunter',
        'awakened_hunter',
        'wolf_king',
        'villager',
        'witch',
      ]);
      const explode = resolveWhiteWolfKingExplode(
        seats,
        1,
        2,
        1,
        DEFAULT_RULE_OVERRIDES,
        createInitialMechWolfState(),
      );
      expect(explode.chainedShootEligibility?.canShoot).toBe(false);

      const ahShoot = checkCanShoot(seats, 3, 'wolf_kill', { round: 1, ruleOverrides: DEFAULT_RULE_OVERRIDES });
      expect(ahShoot?.roleId).toBe('awakened_hunter');
      expect(ahShoot?.canShoot).toBe(true);

      const doubleGun = checkCanShoot(seats, 4, 'exiled', {
        round: 2,
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        thirdPartySpecialState: {
          ...createInitialThirdPartySpecialState(),
          superBlackMarketGifts: [{ seat: 4, item: 'hunter_gun', used: false }],
        },
      });
      expect(doubleGun?.shotsRemaining).toBe(2);
    });

    it('第三方防截胡：人狼戀／白蛇許仙／鬼魂新娘仍存活時不提前讓狼隊或好人屠邊獲勝', () => {
      const loversAlive = makeSeats([
        'cupid',
        'wolf',
        'villager',
        'seer',
        'villager',
      ]).map((s) => (s.seatNumber === 4 ? { ...s, isAlive: false } : s));
      const conv = {
        ...createInitialConversionState(),
        cupidLovers: [2, 3] as [number, number],
        cupidAffiliation: 'third_party' as const,
      };
      // 所有神職(4)已出局，若無第三方防截胡會誤判狼人屠神勝
      const v = checkVictory(loversAlive, DEFAULT_RULE_OVERRIDES, undefined, {
        conversionState: conv,
      });
      expect(v.winner).toBeNull();
    });

    it('覺醒石像鬼轉化機械狼／混血兒靜默無效；轉化平民保留原始好人佔位且守墓人見狼', () => {
      const seats = makeSeats([
        'awakened_gargoyle',
        'wolf',
        'mech_wolf',
        'villager',
        'seer',
        'witch',
      ]);
      const n1Fail = resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), awakenedGargoyleConvertTarget: 3, mechWolfLearnTarget: 5 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1Fail.seats[2].convertedByAwakenedGargoyle).toBeFalsy();

      const n1ConvertVillager = resolveNight({
        seats: n1Fail.seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), awakenedGargoyleConvertTarget: 4 },
        ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, mechWolfForceLearnNight1: false },
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1ConvertVillager.seats[3].convertedByAwakenedGargoyle).toBe(true);
      // 場上唯一平民被轉化為狼人後，仍保留原始平民邊存在判定並觸發狼人屠民勝（不因轉化而漏判屠邊）
      const v = checkVictory(n1ConvertVillager.seats, DEFAULT_RULE_OVERRIDES, undefined, {
        conversionState: n1ConvertVillager.conversionState,
      });
      expect(v.winner).toBe('wolf');

      // 守墓人對該被轉化平民之放逐紀錄應查見狼人陣營
      const exiled: ExiledRecord[] = [
        { round: 1, seatNumber: 4, roleId: 'villager', convertedByAwakenedGargoyle: true },
      ];
      expect(getGravekeeperExileResult(exiled, 2).faction).toBe('wolf');
    });

    it('狼鴉穿流光盾／阿努比斯穿夢遊者／沙龍夢咒同中死／柏修斯殺梅杜莎不觸發石化連帶', () => {
      // 狼鴉之爪穿透流光盾 + 阿努比斯穿透攝夢人（狼 > 神）
      const s1 = makeSeats([
        'wolf_raven_claw',
        'anubis',
        'radiant_earl',
        'dream_catcher',
        'villager',
        'wolf',
      ]);
      const deadPre = s1.map((s) => (s.seatNumber === 6 ? { ...s, isAlive: false } : s));
      const n2 = resolveNight({
        seats: deadPre,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          radiantEarlTarget: 5,
          wolfRavenClawKillTarget: 5,
          dreamCatcherTarget: 3,
          anubisDeadSeat: 6,
          anubisAliveSeat: 3,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n2.seats[4].isAlive).toBe(false); // 5 號被狼鴉穿透流光盾擊殺
      expect(n2.seats[2].isAlive).toBe(false); // 3 號被阿努比斯穿透夢遊保護擊殺

      // 沙龍之夜：夢中咒狐被狼刀必死
      const salonSeats = makeSeats([
        'wolf',
        'dream_catcher',
        'cursed_fox',
        'seer',
        'villager',
        'villager',
      ]);
      const salonNight = resolveNight({
        seats: salonSeats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), wolfTarget: 3, dreamCatcherTarget: 3 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
        boardId: '12p-salon-night',
      });
      expect(salonNight.seats[2].isAlive).toBe(false);

      // 柏修斯處決梅杜莎不觸發石化連帶死亡
      const pmSeats = makeSeats([
        'medusa',
        'perseus',
        'villager',
        'wolf',
        'witch',
        'seer',
      ]);
      const pmNight = resolveNight({
        seats: pmSeats,
        round: 2,
        draft: {
          ...createEmptyNightDraft(2),
          medusaPetrifyTarget: 3,
          perseusExecuteTarget: 1,
        },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(pmNight.seats[0].isAlive).toBe(false);
      expect(pmNight.seats[2].isAlive).toBe(true);
    });

    it('傀儡預言家查驗反轉／管家與狼僕同目標抵消／削弱女巫解藥解鎖／蝕時狼妃不鎖全步驟', () => {
      const seats = makeSeats([
        'puppet_wolf',
        'seer',
        'butler',
        'wolf_maid',
        'witch',
        'wolf',
      ]);
      // 預言家成為傀儡後驗 6 號狼應反轉為好人
      const n1 = resolveNight({
        seats,
        round: 1,
        draft: { ...createEmptyNightDraft(1), puppetTarget: 2, seerCheckTarget: 6 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n1.seerResult?.faction).toBe('good');

      // 第 2 晚管家與狼僕同上茶給 5 號女巫，互抵無效（女巫不死）
      const n2 = resolveNight({
        seats: n1.seats,
        round: 2,
        draft: { ...createEmptyNightDraft(2), butlerTeaTarget: 5, wolfMaidTeaTarget: 5 },
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });
      expect(n2.seats[4].isAlive).toBe(true);

      // 被寂夜導師削弱之女巫（解藥未用）不應整個步驟被鎖死
      const weakenedWitchEval = evaluateNightStepLockState({
        step: {
          stepId: 's-witch',
          actorLabel: '女巫',
          openPrompt: '',
          actionPrompt: '',
          closePrompt: '',
          actionType: 'witch_action',
          actorRoleIds: ['witch'],
        },
        round: 1,
        seats,
        draft: {
          ...createEmptyNightDraft(1),
          silentNightMentorMode: 'weaken',
          silentNightMentorTarget: 5,
        },
        isClaimStage: false,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        foxLostAbility: false,
        pumpkinGhostState: { hasInherited: false, inheritedHistory: [] },
        combatState: createInitialCombatState(),
      });
      expect(weakenedWitchEval.locked).toBe(false);
      expect(weakenedWitchEval.modifierNotice).toContain('解藥');

      // 蝕時狼妃封鎖不應直接鎖死整個 UI 步驟
      const eclipseEval = evaluateNightStepLockState({
        step: {
          stepId: 's-seer',
          actorLabel: '預言家',
          openPrompt: '',
          actionPrompt: '',
          closePrompt: '',
          actionType: 'seer_check',
          actorRoleIds: ['seer'],
        },
        round: 1,
        seats,
        draft: { ...createEmptyNightDraft(1), timeEclipseTarget: 2 },
        isClaimStage: false,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        foxLostAbility: false,
        pumpkinGhostState: { hasInherited: false, inheritedHistory: [] },
        combatState: createInitialCombatState(),
        interferenceState: createInitialInterferenceState(),
      });
      expect(eclipseEval.locked).toBe(false);
    });
  });
});
