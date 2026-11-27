import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  advanceSheriffToVoting,
  assignAllVotesToCandidate,
  checkMandatoryNightTarget,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialPumpkinGhostState,
  createInitialSeats,
  evaluateNightStepLockState,
  getEligibleExileVoters,
  getEligibleSheriffVoters,
  resolveSheriffVoteRound,
  shouldNightDeathHaveLastWords,
  startSheriffElection,
  withdrawSheriffCandidate,
} from './index';
import type { NightStepScript, PlayerSeat } from './types';
import { useGameStore } from '../store/gameStore';

function buildClassic12Seats(): PlayerSeat[] {
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
  return createInitialSeats(12).map((s, idx) => ({
    ...s,
    roleId: roles[idx],
  }));
}

describe('實測 16 項 Bug 修復單元測試', () => {
  beforeEach(() => {
    useGameStore.getState().dissolveRoom();
  });

  it('首夜死者可參加警長競選、當選警長，並於公布死訊時正式出局且觸發警徽交接', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    store.updateHostMode({ dealMode: 'online_deal', judgeMode: 'physical_judge' });
    store.updateRuleOverrides({ enableSheriff: true });

    const seats = buildClassic12Seats();
    useGameStore.setState({ seats });
    store.startGame();
    for (let i = 1; i <= 12; i += 1) {
      useGameStore.getState().confirmPassRevealSeat(i);
    }
    expect(useGameStore.getState().completePassAndReveal().ok).toBe(true);

    // 第 1 晚狼刀 5 號（預言家），女巫不救
    useGameStore.getState().updateNightDraft({ wolfTarget: 5, seerCheckTarget: 1 });
    useGameStore.getState().finishNight();

    // 進入白天階段一：警長競選，此時 5 號仍維持存活，可報名上警並當選
    const duringElection = useGameStore.getState();
    expect(duringElection.phase).toBe('day_announcement');
    expect(duringElection.dayStage).toBe('sheriff_election');
    expect(duringElection.seats.find((s) => s.seatNumber === 5)?.isAlive).toBe(true);
    expect(duringElection.pendingNightAnnouncement).not.toBeNull();

    // 僅 5 號上警 → 自動當選警長
    useGameStore.getState().startSheriffElection([5]);
    expect(useGameStore.getState().sheriffState.status).toBe('elected');
    expect(useGameStore.getState().sheriffState.sheriffSeat).toBe(5);
    expect(useGameStore.getState().sheriffState.pendingBadgeTransferFrom).toBeNull();

    // 進入階段二：公布昨晚死訊 → 5 號正式死亡並立即觸發警徽交接
    useGameStore.getState().proceedToDeathAnnouncement();
    const afterAnnounce = useGameStore.getState();
    expect(afterAnnounce.dayStage).toBe('death_announcement');
    expect(afterAnnounce.pendingNightAnnouncement).toBeNull();
    expect(afterAnnounce.seats.find((s) => s.seatNumber === 5)?.isAlive).toBe(false);
    expect(afterAnnounce.sheriffState.pendingBadgeTransferFrom).toBe(5);

    // 5 號移交警徽給 6 號
    useGameStore.getState().transferSheriffBadge(6);
    expect(useGameStore.getState().sheriffState.sheriffSeat).toBe(6);
    expect(useGameStore.getState().sheriffState.pendingBadgeTransferFrom).toBeNull();
  });

  it('警長首輪投票退水者無投票權，進入平票 PK 輪後退水者恢復投票權（僅 PK 候選人不可投）', () => {
    const seats = buildClassic12Seats();
    let sheriff = startSheriffElection(seats, [1, 2, 3]);
    // 3 號退水
    sheriff = withdrawSheriffCandidate(sheriff, 3);
    sheriff = advanceSheriffToVoting(sheriff);

    // 首輪警下投票：1、2（候選人）與 3（退水）皆無投票權
    const round1Voters = getEligibleSheriffVoters(sheriff, seats);
    expect(round1Voters).not.toContain(1);
    expect(round1Voters).not.toContain(2);
    expect(round1Voters).not.toContain(3);
    expect(round1Voters).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // 1 號與 2 號各得 2 票平票進入 PK
    const round1Res = resolveSheriffVoteRound(sheriff, seats, {
      4: 1,
      5: 1,
      6: 2,
      7: 2,
    });
    expect(round1Res.outcome).toBe('pk');
    expect(round1Res.sheriffState.status).toBe('pk_speaking');
    expect(round1Res.sheriffState.pkCandidates).toEqual([1, 2]);

    // PK 輪：原本退水的 3 號恢復投票權，僅平票候選人 1、2 不可投
    const pkVoters = getEligibleSheriffVoters(round1Res.sheriffState, seats);
    expect(pkVoters).toContain(3);
    expect(pkVoters).not.toContain(1);
    expect(pkVoters).not.toContain(2);
    expect(pkVoters).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // 3 號在 PK 輪投給 2 號，應合法結算且 2 號當選
    const pkRes = resolveSheriffVoteRound(
      { ...round1Res.sheriffState, status: 'pk_voting' },
      seats,
      { 3: 2 },
    );
    expect(pkRes.outcome).toBe('elected');
    expect(pkRes.sheriffState.sheriffSeat).toBe(2);
  });

  it('全票快捷計算：除該候選人本人外，所有具投票權玩家全數投給他', () => {
    const seats = buildClassic12Seats();
    seats[0].isAlive = false; // 1 號已出局
    seats[7].statuses.idiotRevealed = true; // 8 號白痴已翻牌無投票權
    seats[8].statuses.petrified = true; // 9 號被石化無投票權

    const eligible = getEligibleExileVoters(seats);
    expect(eligible).toEqual([2, 3, 4, 5, 6, 7, 10, 11, 12]);

    const allVotesFor4 = assignAllVotesToCandidate(eligible, 4);
    expect(allVotesFor4[4]).toBeNull();
    expect(allVotesFor4[2]).toBe(4);
    expect(allVotesFor4[12]).toBe(4);
    expect(allVotesFor4[1]).toBeUndefined();
    expect(allVotesFor4[8]).toBeUndefined();
    expect(allVotesFor4[9]).toBeUndefined();
  });

  it('遺言規則：第一晚夜死有遺言，第二晚起夜死無遺言', () => {
    expect(shouldNightDeathHaveLastWords(1)).toBe(true);
    expect(shouldNightDeathHaveLastWords(2)).toBe(false);
    expect(shouldNightDeathHaveLastWords(3)).toBe(false);
  });

  it('白天放逐後鎖定禁止二輪放逐，且可由定序王子翻牌解鎖重投；入夜後自動清除', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    store.updateHostMode({ dealMode: 'online_deal', judgeMode: 'physical_judge' });
    store.updateRuleOverrides({ enableSheriff: false });

    const seats = buildClassic12Seats();
    seats[11].roleId = 'sequence_prince';
    useGameStore.setState({ seats, phase: 'day_vote', dayStage: 'exile_vote', round: 1 });

    // 投票放逐 9 號
    const res = useGameStore.getState().submitExileVotes({ 5: 9, 6: 9, 7: 9 });
    expect(res.outcome).toBe('exile');
    expect(useGameStore.getState().exileResolvedToday).toMatchObject({
      outcome: 'exile',
      seat: 9,
    });

    // 定序王子翻牌重投 → 解鎖 exileResolvedToday
    const revote = useGameStore.getState().triggerSequencePrinceRevote();
    expect(revote.allowed).toBe(true);
    expect(useGameStore.getState().exileResolvedToday).toBeNull();

    // 再次放逐 10 號後直接入夜 → 進入第 2 晚並重置 exileResolvedToday
    useGameStore.getState().exilePlayer(10);
    expect(useGameStore.getState().exileResolvedToday?.seat).toBe(10);
    useGameStore.getState().advanceToNextNight();
    expect(useGameStore.getState().phase).toBe('night');
    expect(useGameStore.getState().round).toBe(2);
    expect(useGameStore.getState().exileResolvedToday).toBeNull();
  });

  it('多晚（第 1 晚、第 2 晚、第 3 晚）技能對象與查驗結果皆完整保存於 nightHistory 不覆蓋', () => {
    const store = useGameStore.getState();
    store.selectBoard('12p-classic');
    store.updateHostMode({ dealMode: 'online_deal', judgeMode: 'physical_judge' });
    store.updateRuleOverrides({ enableSheriff: false });

    const seats = buildClassic12Seats();
    useGameStore.setState({ seats, phase: 'night', round: 1 });

    // 第 1 晚：狼刀 9、預言家查 1（狼）
    useGameStore.getState().updateNightDraft({ wolfTarget: 9, seerCheckTarget: 1 });
    useGameStore.getState().finishNight();
    useGameStore.getState().advanceToNextNight();

    // 第 2 晚：狼刀 10、預言家查 6（好人）
    useGameStore.getState().updateNightDraft({ wolfTarget: 10, seerCheckTarget: 6 });
    useGameStore.getState().finishNight();
    useGameStore.getState().advanceToNextNight();

    // 第 3 晚：狼刀 11、女巫毒 2、預言家查 2（狼）
    useGameStore.getState().updateNightDraft({
      wolfTarget: 11,
      witchPoisonTarget: 2,
      seerCheckTarget: 2,
    });
    useGameStore.getState().finishNight();

    const history = useGameStore.getState().nightHistory;
    expect(history).toHaveLength(3);
    expect(history[0].round).toBe(1);
    expect(history[0].draft.wolfTarget).toBe(9);
    expect(history[0].draft.seerCheckTarget).toBe(1);
    expect(history[0].seerResult?.faction).toBe('wolf');

    expect(history[1].round).toBe(2);
    expect(history[1].draft.wolfTarget).toBe(10);
    expect(history[1].draft.seerCheckTarget).toBe(6);
    expect(history[1].seerResult?.faction).toBe('good');

    expect(history[2].round).toBe(3);
    expect(history[2].draft.wolfTarget).toBe(11);
    expect(history[2].draft.witchPoisonTarget).toBe(2);
    expect(history[2].seerResult?.faction).toBe('wolf');
  });

  it('雙向防呆：強制使用技能未選滿時阻擋；恐懼／石化／削弱歸零時鎖死所有座位', () => {
    // 1. 機械狼首夜強制學習未選目標 → 阻擋
    const mandatoryCheck = checkMandatoryNightTarget({
      actionType: 'mech_wolf_learn',
      round: 1,
      ruleOverrides: { ...DEFAULT_RULE_OVERRIDES, mechWolfForceLearnNight1: true },
      pendingTarget: null,
      pendingDualTargets: [null, null],
      pendingMultiTargets: [],
    });
    expect(mandatoryCheck.allowed).toBe(false);

    // 2. 狼隊遭夢魘恐懼 → 鎖死所有座位
    const seats = buildClassic12Seats();
    const wolfStep: NightStepScript = {
      stepId: 'wolf',
      actorLabel: '狼人',
      actorRoleIds: ['wolf'],
      actionType: 'wolf_kill',
      openPrompt: '狼人請睜眼',
      actionPrompt: '請選擇擊殺目標',
      closePrompt: '狼人請閉眼',
    };
    const draft = createEmptyNightDraft(1);
    draft.nightmareFearTarget = 1; // 1 號為狼人
    const wolfLock = evaluateNightStepLockState({
      step: wolfStep,
      round: 1,
      seats,
      draft,
      isClaimStage: false,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      foxLostAbility: false,
      pumpkinGhostState: createInitialPumpkinGhostState(),
      combatState: createInitialCombatState(),
    });
    expect(wolfLock.locked).toBe(true);
    expect(wolfLock.reason).toContain('夢魘恐懼');

    // 3. 寂夜導師削弱預言家（5 號）→ 剩餘技能次數 0 次並鎖死所有座位
    const seerStep: NightStepScript = {
      stepId: 'seer',
      actorLabel: '預言家',
      actorRoleIds: ['seer'],
      actionType: 'seer_check',
      openPrompt: '預言家請睜眼',
      actionPrompt: '請查驗一位玩家',
      closePrompt: '預言家請閉眼',
    };
    const weakenDraft = createEmptyNightDraft(2);
    weakenDraft.silentNightMentorMode = 'weaken';
    weakenDraft.silentNightMentorTarget = 5;
    const seerLock = evaluateNightStepLockState({
      step: seerStep,
      round: 2,
      seats,
      draft: weakenDraft,
      isClaimStage: false,
      witchAntidoteUsed: false,
      witchPoisonUsed: false,
      foxLostAbility: false,
      pumpkinGhostState: createInitialPumpkinGhostState(),
      combatState: createInitialCombatState(),
    });
    expect(seerLock.locked).toBe(true);
    expect(seerLock.remainingSkillUses).toBe(0);
    expect(seerLock.reason).toContain('0 次');
  });
});
