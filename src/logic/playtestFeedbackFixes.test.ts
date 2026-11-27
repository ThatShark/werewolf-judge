import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_RULE_OVERRIDES,
  DEFAULT_SPEAK_DURATION_SEC,
  SHERIFF_SPEAK_DURATION_SEC,
  assignAllVotesToCandidate,
  clearVotesForCandidate,
  createEmptyNightDraft,
  createInitialMechWolfState,
  formatChineseDay,
  formatChineseNight,
  getEligibleExileVoters,
  getExilePkSpeakingOrder,
  getExitResolutionStage,
  resolveNight,
  shouldNightDeathHaveLastWords,
  tallyExileVotes,
  toChineseNumeral,
} from './index';
import type { PlayerSeat } from './types';
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
  return roles.map((roleId, idx) => ({
    seatNumber: idx + 1,
    nickname: '',
    roleId,
    isAlive: true,
    statuses: {},
  }));
}

describe('實測回饋全面修正規則與流程驗證', () => {
  describe('1. 中文天數與晚數格式化', () => {
    it('將 D1 / N1 轉為中文第一天 / 第一晚並支援十位數以上', () => {
      expect(toChineseNumeral(1)).toBe('一');
      expect(toChineseNumeral(10)).toBe('十');
      expect(toChineseNumeral(11)).toBe('十一');
      expect(toChineseNumeral(20)).toBe('二十');
      expect(formatChineseDay(1)).toBe('第一天');
      expect(formatChineseNight(1)).toBe('第一晚');
      expect(formatChineseDay(2)).toBe('第二天');
      expect(formatChineseNight(3)).toBe('第三晚');
    });
  });

  describe('2. 一晚死亡名單強制依座號由小到大排序', () => {
    it('即使狼刀高座號（11號）且女巫毒殺低座號（2號），結算 deaths 一律按座號升冪排列', () => {
      const seats = buildClassic12Seats();
      const draft = {
        ...createEmptyNightDraft(1),
        wolfTarget: 11,
        witchPoisonTarget: 2,
      };
      const result = resolveNight({
        seats,
        round: 1,
        draft,
        ruleOverrides: DEFAULT_RULE_OVERRIDES,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        lastGuardedSeat: null,
        mechWolfState: createInitialMechWolfState(),
        pendingSelfExplodeSeat: null,
      });

      expect(result.deaths.map((d) => d.seat)).toEqual([2, 11]);
      expect(result.deaths[0]).toEqual({ seat: 2, reason: 'witch_poison' });
      expect(result.deaths[1]).toEqual({ seat: 11, reason: 'wolf_kill' });
    });
  });

  describe('3. 出局結算順序：先結算技能／移交警徽，再發表遺言', () => {
    it('有待開槍或待移交警徽時，必須鎖定在 skills_and_badge 階段', () => {
      expect(
        getExitResolutionStage({
          pendingShootersCount: 1,
          hasPendingBadgeTransfer: false,
          hasLastWords: true,
        }),
      ).toBe('skills_and_badge');

      expect(
        getExitResolutionStage({
          pendingShootersCount: 0,
          hasPendingBadgeTransfer: true,
          hasLastWords: true,
        }),
      ).toBe('skills_and_badge');
    });

    it('所有技能與警徽結算完畢後，首夜死者與白天放逐者進入 last_words，次夜夜死直接 done', () => {
      expect(
        getExitResolutionStage({
          pendingShootersCount: 0,
          hasPendingBadgeTransfer: false,
          hasLastWords: shouldNightDeathHaveLastWords(1),
        }),
      ).toBe('last_words');

      expect(
        getExitResolutionStage({
          pendingShootersCount: 0,
          hasPendingBadgeTransfer: false,
          hasLastWords: shouldNightDeathHaveLastWords(2),
        }),
      ).toBe('done');
    });
  });

  describe('4. 警長票重（+0.5 / +1 票）與全票／全取消計算', () => {
    it('警長投票加權支援 1.5 票（預設）與 2 票（多1票）', () => {
      const seats = buildClassic12Seats();
      const votes = { 5: 1, 9: 2, 10: 2 };

      const tally15 = tallyExileVotes({
        seats,
        votes,
        sheriffSeat: 5,
        sheriffVoteWeight: 1.5,
      });
      expect(tally15.record.totals[1]).toBe(1.5);
      expect(tally15.record.totals[2]).toBe(2);
      expect(tally15.outcome).toBe('exile');
      expect(tally15.record.electedSeat).toBe(2);

      const tally20 = tallyExileVotes({
        seats,
        votes,
        sheriffSeat: 5,
        sheriffVoteWeight: 2,
      });
      expect(tally20.record.totals[1]).toBe(2);
      expect(tally20.record.totals[2]).toBe(2);
      expect(tally20.outcome).toBe('tie');
      expect(tally20.record.tiedSeats).toEqual([1, 2]);
    });

    it('全票自動含警長加權，全取消可一鍵清空該候選人所有得票且保留他人票', () => {
      const seats = buildClassic12Seats();
      const eligible = getEligibleExileVoters(seats);
      const allForOne = assignAllVotesToCandidate(eligible, 1);

      const tally = tallyExileVotes({
        seats,
        votes: allForOne,
        sheriffSeat: 5,
        sheriffVoteWeight: 2,
      });
      // 11 位其他玩家投票，其中 5 號警長計 2 票 => 10 + 2 = 12 票
      expect(tally.record.totals[1]).toBe(12);

      const mixed = { ...allForOne, 9: 2 };
      const cleared = clearVotesForCandidate(mixed, 1);
      expect(cleared[5]).toBeNull();
      expect(cleared[9]).toBe(2);
    });
  });

  describe('5. 放逐投票平票 PK 完整流程（先逆序發言 → 非 PK 重投 → 再平票無人出局）', () => {
    beforeEach(() => {
      useGameStore.getState().dissolveRoom();
    });

    it('純規則層：PK 發言依當天白天發言順序逆序，PK 投票鎖定排除 PK 候選人', () => {
      const seats = buildClassic12Seats();
      const dayOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
      expect(getExilePkSpeakingOrder(dayOrder, [2, 5, 9])).toEqual([2, 9, 5]);

      const pkVoters = getEligibleExileVoters(seats, [2, 5]);
      expect(pkVoters).not.toContain(2);
      expect(pkVoters).not.toContain(5);
      expect(pkVoters.length).toBe(10);

      // 若 PK 候選人違規投票應拋錯攔截
      expect(() =>
        tallyExileVotes({
          seats,
          votes: { 2: 5, 3: 5 },
          pkCandidates: [2, 5],
          roundIndex: 2,
        }),
      ).toThrow('PK 投票階段禁止投票');
    });

    it('Store 整合：首輪平票進入 pk_speaking 逆序發言 → advanceExilePkToVoting → 再平票判定平安日', () => {
      const store = useGameStore.getState();
      store.selectBoard('12p-classic');
      store.updateHostMode({ dealMode: 'online_deal', judgeMode: 'physical_judge' });
      store.updateRuleOverrides({ enableSheriff: false, sheriffVoteWeight: 2 });
      store.dealOnlineRoles(() => 0.1);
      store.startGame();
      useGameStore.getState().seats.forEach((s) => {
        useGameStore.getState().confirmPassRevealSeat(s.seatNumber);
      });
      useGameStore.getState().completePassAndReveal();
      useGameStore.getState().finishNight();
      useGameStore.getState().proceedToDaySpeaking();
      useGameStore.getState().generateSpeakingOrder({ mode: 'random', rng: () => 0 });
      const dayQueue = [...useGameStore.getState().speakingQueue];
      useGameStore.getState().proceedToDayVote();

      // 首輪平票：1 號 vs 2 號各得 2 票
      const r1 = useGameStore.getState().submitExileVotes({
        3: 1,
        4: 1,
        5: 2,
        6: 2,
      });
      expect(r1.outcome).toBe('tie');

      const afterTie = useGameStore.getState();
      expect(afterTie.exilePkCandidates).toEqual([1, 2]);
      expect(afterTie.exilePkStage).toBe('pk_speaking');
      expect(afterTie.exilePkSpeakingOrder).toEqual(getExilePkSpeakingOrder(dayQueue, [1, 2]));

      // PK 發言完畢 → 進入 PK 重投
      useGameStore.getState().advanceExilePkToVoting();
      expect(useGameStore.getState().exilePkStage).toBe('pk_voting');

      // 非 PK 玩家重投，再次平票 → 平安日無人出局
      const r2 = useGameStore.getState().submitExileVotes({
        3: 1,
        4: 2,
      });
      expect(r2.outcome).toBe('no_exile');
      expect(useGameStore.getState().exilePkStage).toBe('none');
      expect(useGameStore.getState().exilePkCandidates).toEqual([]);
      expect(useGameStore.getState().exileResolvedToday?.outcome).toBe('no_exile');
    });

    it('白天發言預設一般玩家 120s、警長 150s，且支援 prevSpeaker / nextSpeaker 自動帶入', () => {
      expect(DEFAULT_SPEAK_DURATION_SEC).toBe(120);
      expect(SHERIFF_SPEAK_DURATION_SEC).toBe(150);

      const store = useGameStore.getState();
      store.selectBoard('12p-classic');
      store.updateHostMode({ dealMode: 'online_deal', judgeMode: 'physical_judge' });
      store.dealOnlineRoles(() => 0.1);
      store.startGame();
      useGameStore.getState().seats.forEach((s) => {
        useGameStore.getState().confirmPassRevealSeat(s.seatNumber);
      });
      useGameStore.getState().completePassAndReveal();
      useGameStore.getState().finishNight();

      // 1 號單獨上警當選警長
      useGameStore.getState().startSheriffElection([1]);
      useGameStore.getState().proceedToDeathAnnouncement();
      useGameStore.getState().proceedToDaySpeaking();
      useGameStore.getState().generateSpeakingOrder({ mode: 'sheriff_left' });

      // 警左：2..12, 最後一位為警長 1 號
      const state0 = useGameStore.getState();
      expect(state0.speakingQueue[0]).toBe(2);
      expect(state0.remainingSeconds).toBe(120);

      // 一路切換到最後一位警長
      for (let i = 0; i < state0.speakingQueue.length - 1; i += 1) {
        useGameStore.getState().nextSpeaker();
      }
      const atSheriff = useGameStore.getState();
      expect(atSheriff.speakingQueue[atSheriff.currentSpeakerIndex]).toBe(1);
      expect(atSheriff.remainingSeconds).toBe(150);

      // 切回上一位一般玩家，自動恢復 120s
      useGameStore.getState().prevSpeaker();
      const backToNormal = useGameStore.getState();
      expect(backToNormal.speakingQueue[backToNormal.currentSpeakerIndex]).toBe(12);
      expect(backToNormal.remainingSeconds).toBe(120);
    });
  });
});
