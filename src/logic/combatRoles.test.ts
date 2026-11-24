import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialMechWolfState,
  getSeerCheckResult,
  resolveAwakenedHunterDirectionShoot,
  resolveDayExile,
  resolveNight,
  resolveOldRascalDelayedDeath,
  resolvePufferfishExplode,
  resolveSelfExplode,
  resolveShoot,
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

describe('第 3 批：免疫、反傷、額外傷害與特殊擊殺類角色（21 角色）', () => {
  it('獵魔人（demon_hunter）與夜之貴族（night_noble）：免疫女巫毒、狩狼殺狼、狩好自死、狩夜僕抵消', () => {
    const seats = makeSeats(['demon_hunter', 'night_noble', 'wolf', 'witch', 'villager', 'villager']);

    // 女巫毒獵魔人無效；獵魔人第 2 晚狩獵小狼 3 號 → 3 號出局；夜之貴族選 5 號當夜僕 → 5 號出局
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        witchPoisonTarget: 1,
        demonHunterTarget: 3,
        nightNobleServantTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[0].isAlive).toBe(true);
    expect(n2.seats[2].isAlive).toBe(false);
    expect(n2.seats[2].deathReason).toBe('demon_hunter_kill');
    expect(n2.seats[4].isAlive).toBe(false);
    expect(n2.seats[4].deathReason).toBe('night_noble_servant_death');

    // 獵魔人狩獵當晚夜僕 6 號 → 互相抵消，雙方不死
    const cancelRes = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        demonHunterTarget: 6,
        nightNobleServantTarget: 6,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(cancelRes.seats[0].isAlive).toBe(true);
    expect(cancelRes.seats[5].isAlive).toBe(true);

    // 獵魔人誤狩好人 5 號 → 獵魔人出局
    const backfireRes = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), demonHunterTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(backfireRes.seats[0].isAlive).toBe(false);
    expect(backfireRes.seats[0].deathReason).toBe('demon_hunter_backfire');
  });

  it('狼鴉之爪（wolf_raven_claw）、刺客（assassin_wolf）、大野狼（big_bad_wolf）與大灰狼（big_grey_wolf）', () => {
    // 狼鴉之爪存活狼 <= 2 入隊並擁無敵刀
    const clawSeats = makeSeats(['wolf_raven_claw', 'wolf', 'guard', 'villager', 'villager']);
    expect(resolveSelfExplode(clawSeats, 1).allowed).toBe(false);
    const clawRes = resolveNight({
      seats: clawSeats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), guardTarget: 4, wolfRavenClawKillTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(clawRes.seats[3].isAlive).toBe(false);
    expect(clawRes.combatState.wolfRavenClawInvincibleUsed).toBe(true);

    // 刺客猜錯身分 → 當晚狼隊空刀；猜對 → 目標刺殺出局
    const assSeats = makeSeats(['assassin_wolf', 'seer', 'villager', 'villager']);
    const missRes = resolveNight({
      seats: assSeats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        assassinTarget: 2,
        assassinGuessedRoleId: 'witch',
        wolfTarget: 3,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(missRes.seats[1].isAlive).toBe(true);
    expect(missRes.seats[2].isAlive).toBe(true);

    const hitRes = resolveNight({
      seats: assSeats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        assassinTarget: 2,
        assassinGuessedRoleId: 'seer',
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(hitRes.seats[1].isAlive).toBe(false);
    expect(hitRes.seats[1].deathReason).toBe('assassin_wolf_kill');

    // 大野狼全狼存活可額外刀；大灰狼第 2 晚起單獨擊殺（限 1 次）
    const bbwSeats = makeSeats(['big_bad_wolf', 'big_grey_wolf', 'villager', 'villager', 'seer', 'witch']);
    const bbwRes = resolveNight({
      seats: bbwSeats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), bigBadWolfKillTarget: 3, bigGreyWolfKillTarget: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(bbwRes.seats[2].isAlive).toBe(false);
    expect(bbwRes.seats[3].isAlive).toBe(false);
    expect(bbwRes.combatState.bigGreyWolfKillUsed).toBe(true);
  });

  it('狼兄（wolf_brother）與狼弟（wolf_younger_brother）：狼兄死前驗金水、狼兄死後覺醒無敵刀且下晚才入隊', () => {
    const seats = makeSeats(['wolf_brother', 'wolf_younger_brother', 'seer', 'guard', 'villager', 'villager']);
    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);
    expect(getSeerCheckResult(seats, 2)?.faction).toBe('good');

    // 狼兄第 1 輪出局後，預言家驗狼弟轉為查殺；第 2 晚狼弟發動覺醒無敵刀無視守衛且當晚尚未入隊
    seats[0].isAlive = false;
    seats[0].deathRound = 1;
    expect(getSeerCheckResult(seats, 2)?.faction).toBe('wolf');

    const n2 = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), guardTarget: 5, wolfYoungerBrotherKillTarget: 5 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[4].isAlive).toBe(false);
    expect(n2.combatState.wolfYoungerBrotherAwakenedKillUsed).toBe(true);
    expect(n2.combatState.wolfYoungerBrotherJoinedTeam).toBe(false);
  });

  it('蜂之狂獵（bee_wild_hunt）、珀爾修斯（perseus）與阿努比斯（anubis）', () => {
    const seats = makeSeats(['bee_wild_hunt', 'perseus', 'anubis', 'medusa', 'wolf', 'villager', 'villager']);

    // 蜂之狂獵刺兩狼 → 兩人出局；刺兩好人 → 永久失能
    const beeHit = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), beeWildHuntTargets: [3, 5] },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(beeHit.seats[2].isAlive).toBe(false);
    expect(beeHit.seats[4].isAlive).toBe(false);

    const beeMiss = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), beeWildHuntTargets: [6, 7] },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(beeMiss.combatState.beeWildHuntLostAbility).toBe(true);

    // 珀爾修斯處決被梅杜莎石化的 6 號 → 6 號與珀爾修斯一同出局
    const persRes = resolveNight({
      seats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), medusaPetrifyTarget: 6, perseusExecuteTarget: 6 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(persRes.seats[5].isAlive).toBe(false);
    expect(persRes.seats[1].isAlive).toBe(false);
    expect(persRes.seats[1].deathReason).toBe('perseus_petrify_backfire');

    // 阿努比斯天平：神(1號出局) > 民(7號存活) → 7 號出局
    const anuSeats = makeSeats(['seer', 'anubis', 'wolf', 'villager', 'villager']);
    anuSeats[0].isAlive = false;
    const anuRes = resolveNight({
      seats: anuSeats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), anubisDeadSeat: 1, anubisAliveSeat: 4 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(anuRes.seats[3].isAlive).toBe(false);
    expect(anuRes.seats[3].deathReason).toBe('anubis_scale_kill');
  });

  it('血月使徒（blood_moon_apostle）、河豚（pufferfish）、老流氓（old_rascal）與鏽劍騎士（rusty_sword_knight）', () => {
    // 血月使徒作為最後一狼被放逐免死；血月自爆封印當晚好人技能
    const bmSeats = makeSeats(['blood_moon_apostle', 'witch', 'villager', 'villager']);
    const bmExile = resolveDayExile(
      bmSeats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(bmExile.seats[0].isAlive).toBe(true);
    expect(bmExile.seats[0].bloodMoonExileSurvived).toBe(true);

    const bmSealed = resolveNight({
      seats: bmSeats,
      round: 2,
      draft: { ...createEmptyNightDraft(2), wolfTarget: 3, witchUseAntidote: true },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      combatState: { ...createInitialCombatState(), bloodMoonSealActiveTonight: true },
    });
    expect(bmSealed.seats[2].isAlive).toBe(false); // 女巫解藥被血月封印

    // 河豚翻牌炸死投票玩家
    const pfSeats = makeSeats(['pufferfish', 'wolf', 'villager', 'villager']);
    const pfRes = resolvePufferfishExplode(pfSeats, [2, 3], false, 1, DEFAULT_RULE_OVERRIDES);
    expect(pfRes.allowed).toBe(true);
    expect(pfRes.killedSeats).toEqual([2, 3]);
    expect(pfRes.seats[1].isAlive).toBe(false);

    // 老流氓被獵人射殺／女巫毒殺延遲至隔日發言後出局
    const orSeats = makeSeats(['old_rascal', 'hunter', 'wolf', 'villager']);
    const shootOr = resolveShoot(
      orSeats,
      2,
      1,
      'exiled',
      1,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(shootOr.targetSurvived).toBe(true);
    expect(shootOr.seats[0].oldRascalDelayedDeath).toBe(true);
    const orEnd = resolveOldRascalDelayedDeath(
      shootOr.seats,
      2,
      DEFAULT_RULE_OVERRIDES,
      createInitialMechWolfState(),
    );
    expect(orEnd.eliminatedSeat).toBe(1);
    expect(orEnd.seats[0].isAlive).toBe(false);

    // 鏽劍騎士第 1 晚被狼刀，第 2 晚天亮左側最近狼人（1 號）反殺死亡
    const rskSeats = makeSeats(['wolf', 'rusty_sword_knight', 'villager', 'villager', 'witch']);
    const rskN1 = resolveNight({
      seats: rskSeats,
      round: 1,
      draft: { ...createEmptyNightDraft(1), wolfTarget: 2 },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(rskN1.combatState.rustySwordKilledRound).toBe(1);
    const rskN2 = resolveNight({
      seats: rskN1.seats,
      round: 2,
      draft: createEmptyNightDraft(2),
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      combatState: rskN1.combatState,
    });
    expect(rskN2.seats[0].isAlive).toBe(false);
    expect(rskN2.seats[0].deathReason).toBe('rusty_sword_counter');
  });

  it('覺醒狼王、覺醒狼美人、覺醒獵人、猩紅狼王、覺醒白痴與典獄長', () => {
    const seats = makeSeats([
      'awakened_wolf_king',
      'wolf',
      'awakened_wolf_beauty',
      'awakened_hunter',
      'scarlet_wolf_king',
      'awakened_idiot',
      'warden_wolf',
      'villager',
      'villager',
      'witch',
    ]);

    // 覺醒狼王分槍給 2 號小狼；覺醒白痴秘密之身護 8 號（未受傷改護自己，狼刀 6 號被秘密之身抵擋）；
    // 覺醒狼美人魅惑 9 號，女巫毒 3 號由 9 號替死；典獄長讓 8 & 10 交易（一交易一背叛 → 交易者 8 號出局）
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        awakenedWolfKingGiveGunTarget: 2,
        awakenedIdiotShieldTarget: 10,
        wolfTarget: 6,
        awakenedWolfBeautyCharmTarget: 9,
        witchPoisonTarget: 3,
        scarletAttachTarget: 8,
        wardenTradePair: [8, 10],
        wardenTradeChoices: ['trade', 'betray'],
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.combatState.awakenedWolfKingGuns).toBe(1);
    expect(n2.combatState.wolfDistributedGuns[2]).toBe(1);
    expect(n2.seats[5].isAlive).toBe(true); // 覺醒白痴秘密之身護己抵擋狼刀
    expect(n2.combatState.awakenedIdiotSecretActive).toBe(false);
    expect(n2.seats[2].isAlive).toBe(true); // 覺醒狼美人由 9 號替死
    expect(n2.seats[8].isAlive).toBe(false);
    expect(n2.seats[8].deathReason).toBe('awakened_wolf_beauty_substitute');
    expect(n2.seats[7].isAlive).toBe(false); // 典獄長交易者 8 號出局
    expect(n2.seats[7].deathReason).toBe('warden_trade_death');

    // 覺醒獵人（4 號）向右開槍擊殺最近狼人（5 號猩紅狼王）
    const ahShoot = resolveAwakenedHunterDirectionShoot(
      seats,
      4,
      'right',
      2,
      DEFAULT_RULE_OVERRIDES,
    );
    expect(ahShoot.killedSeat).toBe(5);
    expect(ahShoot.seats[4].isAlive).toBe(false);
  });
});
