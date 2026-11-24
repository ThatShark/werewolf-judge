import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  canHappySheepAct,
  canPhantomWolfActivateInvincible,
  canWhiteNightEnvoyRewind,
  checkVictory,
  createEmptyNightDraft,
  createInitialFinalBatchState,
  createInitialMechWolfState,
  isAnimalVillagerRole,
  isLittleGreyWolfRole,
  resolveContrarianDebate,
  resolveDayExile,
  resolveDetectiveExecute,
  resolveDetectiveReveal,
  resolveNight,
  resolveSelfExplode,
  resolveSequencePrinceRevote,
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

describe('第 6 批（最終收官戰）：最後 13 個角色 100% 全制霸測試', () => {
  it('蝕日侍女：不可自爆、第二晚起吞女巫奪毒並封鎖女巫毒藥、吞獵魔人狩狼殺狼且免疫毒藥', () => {
    const seats = makeSeats([
      'eclipse_maid',
      'wolf',
      'witch',
      'demon_hunter',
      'villager',
      'villager',
    ]);
    expect(resolveSelfExplode(seats, 1).allowed).toBe(false);

    // 第 2 晚：蝕日侍女吞噬 3 號女巫，封鎖女巫對 2 號的毒，轉而毒殺 5 號平民
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        witchPoisonTarget: 2,
        eclipseMaidDevourTarget: 3,
        eclipseMaidUseSkillTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.seats[1].isAlive).toBe(true); // 2 號小狼未被原女巫毒死
    expect(n2.deaths.some((d) => d.seat === 5 && d.reason === 'eclipse_maid_kill')).toBe(true);
    expect(n2.witchPoisonUsed).toBe(true);
  });

  it('灰太狼、喜羊羊、小小灰、羊駝與兔兔：防盜阻斷偷竊、對自己同時防盜＋守護、羊駝與兔兔屬平民邊', () => {
    expect(isAnimalVillagerRole('alpaca')).toBe(true);
    expect(isAnimalVillagerRole('bunny')).toBe(true);
    expect(isLittleGreyWolfRole('little_grey_wolf')).toBe(true);

    const seats = makeSeats([
      'little_grey_wolf',
      'grey_wolf_boss',
      'happy_sheep',
      'witch',
      'alpaca',
      'bunny',
    ]);
    expect(resolveSelfExplode(seats, 1).allowed).toBe(true);
    expect(resolveSelfExplode(seats, 2).allowed).toBe(false);

    // 第 2 晚：喜羊羊對 1 號小小灰防盜，阻斷灰太狼偷取 1 號狼刀；同時不可連兩晚對 1 號防盜
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        wolfTarget: 5,
        happySheepMode: 'anti_theft',
        happySheepTarget: 1,
        greyWolfBossStealTarget: 1,
        greyWolfBossUseSkillTarget: 4,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n2.deaths.some((d) => d.seat === 5 && d.reason === 'wolf_kill')).toBe(true);
    expect(n2.seats[3].isAlive).toBe(true); // 偷竊被防盜阻斷，女巫未被灰太狼擊殺
    expect(canHappySheepAct(n2.seats, n2.finalBatchState, 'anti_theft', 1).allowed).toBe(false);

    // 羊駝(5)與兔兔(6)全滅 -> 狼隊屠民獲勝
    const allVillagersDead = n2.seats.map((s) =>
      s.seatNumber === 6 ? { ...s, isAlive: false } : s,
    );
    expect(checkVictory(allVillagersDead, DEFAULT_RULE_OVERRIDES).winner).toBe('wolf');
  });

  it('怪盜狼王、偵探與警犬：無敵期間免疫夜毒與白天放逐且禁自爆、偵探翻牌當日禁自爆並處決激活警犬撕咬', () => {
    const seats = makeSeats([
      'phantom_wolf_king',
      'wolf',
      'detective',
      'police_dog',
      'witch',
      'villager',
      'villager',
    ]);
    // 未使用無敵前不可自爆
    expect(resolveSelfExplode(seats, 1, createInitialFinalBatchState()).allowed).toBe(false);
    expect(canPhantomWolfActivateInvincible(seats, createInitialFinalBatchState()).allowed).toBe(true);

    // 第 1 晚：怪盜狼王開無敵，免疫女巫毒藥
    const n1 = resolveNight({
      seats,
      round: 1,
      draft: {
        ...createEmptyNightDraft(1),
        witchPoisonTarget: 1,
        phantomWolfActivateInvincible: true,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
    });
    expect(n1.seats[0].isAlive).toBe(true);
    expect(n1.finalBatchState.phantomWolfInvincibleActive).toBe(true);

    // 白天放逐怪盜狼王亦免死
    const exileRes = resolveDayExile(
      n1.seats,
      1,
      1,
      DEFAULT_RULE_OVERRIDES,
      n1.mechWolfState,
      null,
      undefined,
      n1.finalBatchState,
    );
    expect(exileRes.seats[0].isAlive).toBe(true);

    // 偵探翻牌 -> 當天全體狼人禁自爆；接著處決 6 號好人 -> 激活警犬第 2 晚撕咬
    const rev = resolveDetectiveReveal(exileRes.seats, n1.finalBatchState);
    expect(rev.allowed).toBe(true);
    expect(resolveSelfExplode(exileRes.seats, 2, rev.state).allowed).toBe(false);

    const exec = resolveDetectiveExecute(exileRes.seats, rev.state, 6, 1);
    expect(exec.allowed).toBe(true);
    expect(exec.seats[5].isAlive).toBe(false);
    expect(exec.state.policeDogMode).toBe('bite');

    // 第 2 晚：怪盜狼王無敵自動失效，警犬發動撕咬咬死 2 號小狼
    const n2 = resolveNight({
      seats: exec.seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        policeDogTarget: 2,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: n1.witchAntidoteUsed,
      witchPoisonUsed: n1.witchPoisonUsed,
      lastGuardedSeat: n1.lastGuardedSeat,
      mechWolfState: n1.mechWolfState,
      pendingSelfExplodeSeat: null,
      finalBatchState: exec.state,
    });
    expect(n2.finalBatchState.phantomWolfInvincibleActive).toBe(false);
    expect(n2.deaths.some((d) => d.seat === 2 && d.reason === 'police_dog_bite')).toBe(true);
    // 無敵失效後，怪盜狼王可自爆
    expect(resolveSelfExplode(n2.seats, 1, n2.finalBatchState).allowed).toBe(true);
  });

  it('定序王子、槓精、白夜使者與小女孩：單次重投、開槓奪警徽、次日起可回溯、狼隊指認小女孩代死', () => {
    const seats = makeSeats([
      'wolf',
      'sequence_prince',
      'contrarian',
      'white_night_envoy',
      'little_girl',
      'villager',
      'villager',
    ]);
    const st0 = createInitialFinalBatchState();

    // 定序王子僅能發動一次
    const sp1 = resolveSequencePrinceRevote(seats, st0);
    expect(sp1.allowed).toBe(true);
    expect(resolveSequencePrinceRevote(seats, sp1.state).allowed).toBe(false);

    // 槓精開槓過半且目標為警長 -> 警徽移交給槓精（3 號），目標失去本輪投票權
    const con = resolveContrarianDebate(seats, sp1.state, 1, true, 1);
    expect(con.allowed).toBe(true);
    expect(con.silencedVoterSeat).toBe(1);
    expect(con.newSheriffSeat).toBe(3);

    // 白夜使者首日不可回溯，第 2 天起可回溯
    expect(canWhiteNightEnvoyRewind(seats, con.state, 1).allowed).toBe(false);
    expect(canWhiteNightEnvoyRewind(seats, con.state, 2).allowed).toBe(true);

    // 第 2 晚：狼隊刀 6 號但指認 5 號小女孩成功 -> 6 號存活、5 號小女孩代死
    const n2 = resolveNight({
      seats,
      round: 2,
      draft: {
        ...createEmptyNightDraft(2),
        wolfTarget: 6,
        littleGirlIdentifyTarget: 5,
      },
      ruleOverrides: DEFAULT_RULE_OVERRIDES,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      lastGuardedSeat: null,
      mechWolfState: createInitialMechWolfState(),
      pendingSelfExplodeSeat: null,
      finalBatchState: con.state,
    });
    expect(n2.seats[5].isAlive).toBe(true); // 6 號免死
    expect(n2.deaths.some((d) => d.seat === 5 && d.reason === 'little_girl_caught')).toBe(true);
  });
});
