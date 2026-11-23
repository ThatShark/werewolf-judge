import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_AMBIENT_AUDIO_SETTINGS,
  DEFAULT_HOST_MODE,
  DEFAULT_RULE_OVERRIDES,
  DEFAULT_SPEAK_DURATION_SEC,
  claimSeatRole as claimSeatRoleLogic,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  createInitialSheriffState,
  dealRandomRoles,
  destroySheriffBadge as destroySheriffBadgeLogic,
  finalizePhysicalDealVillagers,
  generateSpeakingOrder as generateSpeakingOrderLogic,
  getNightSteps,
  isSheriffElectionActive,
  isValidPlayerCountForBoard,
  resolveDayExile,
  resolveKnightDuel,
  resolveNight,
  resolveSelfExplode,
  resolveSheriffVoteRound,
  resolveShoot,
  resolveWhiteWolfKingExplode,
  startSheriffElection as startSheriffElectionLogic,
  swallowSheriffBadge,
  syncSheriffBadgeOnDeaths,
  tallyExileVotes,
  toggleSeatAliveManually,
  transferSheriffBadge as transferSheriffBadgeLogic,
  validatePhysicalDealSetup,
  validateRoleAssignment,
  withdrawSheriffCandidate as withdrawSheriffCandidateLogic,
} from '../logic';
import type { SheriffVoteResolution } from '../logic/sheriff';
import type {
  AmbientAudioSettings,
  DayStructuredEvent,
  DeathReason,
  ExileVoteTallyResult,
  Faction,
  GameState,
  HostModeConfig,
  KnightDuelResult,
  NightActionDraft,
  RuleOverrides,
  ShootEligibility,
  SpeakingOrderOptions,
  SpeakingOrderResult,
  WhiteWolfKingExplodeResult,
} from '../logic/types';

export const GAME_STORAGE_KEY = 'werewolf-judge-storage';

export type AppView = 'home' | 'join_room' | 'rules_atlas' | 'about' | 'game';

export interface PendingShooter extends ShootEligibility {
  deathReason: DeathReason;
}

export interface SubmitExileVotesOptions {
  extraVotes?: Record<number, number>;
  sheriffVoteWeight?: number;
}

export interface GameStore extends GameState {
  activeView: AppView;
  pendingShooters: PendingShooter[];

  setActiveView: (view: AppView) => void;

  selectBoard: (boardId: string) => void;
  goToBoardSelect: () => void;
  setBoardPlayerCount: (playerCount: number) => void;
  updateHostMode: (partial: Partial<HostModeConfig>) => void;
  updateAmbientAudio: (partial: Partial<AmbientAudioSettings>) => void;
  updateRuleOverrides: (partial: Partial<RuleOverrides>) => void;
  setSeatNickname: (seatNumber: number, nickname: string) => void;
  clearSavedNicknames: () => void;
  assignRole: (seatNumber: number, roleId: string | null) => void;
  claimSeatRole: (seatNumber: number, roleId: string | null) => { ok: boolean; reason?: string };
  dealOnlineRoles: (rng?: () => number) => { ok: boolean; errors: string[] };
  confirmPassRevealSeat: (seatNumber: number) => void;
  resetPassRevealSeat: (seatNumber: number) => void;
  completePassAndReveal: () => { ok: boolean; reason?: string };
  returnToLobby: () => void;
  startGame: () => { ok: boolean; errors: string[] };

  updateNightDraft: (partial: Partial<NightActionDraft>) => void;
  nextNightStep: () => void;
  prevNightStep: () => void;
  finishNight: () => void;

  /** 自動發言順序與單人倒數計時 */
  setDefaultSpeakDuration: (seconds: number) => void;
  generateSpeakingOrder: (options: SpeakingOrderOptions) => SpeakingOrderResult;
  nextSpeaker: () => void;
  adjustSpeakerTime: (deltaSeconds: number) => void;
  tickSpeakerTimer: () => void;
  resetSpeakingOrder: () => void;

  /** 警長競選與警徽交接 */
  startSheriffElection: (candidateSeats: number[]) => void;
  withdrawSheriffCandidate: (seatNumber: number) => void;
  submitSheriffVotes: (votes: Record<number, number | null>) => SheriffVoteResolution;
  transferSheriffBadge: (targetSeat: number) => void;
  destroySheriffBadge: () => void;

  /** 天亮開槍與白天階段 */
  triggerShoot: (shooterSeat: number, targetSeat: number) => void;
  skipShoot: (shooterSeat: number) => void;
  proceedToDayVote: () => void;

  /** 白天放逐投票明細與突發技能 */
  submitExileVotes: (
    votes: Record<number, number | null>,
    options?: SubmitExileVotesOptions,
  ) => ExileVoteTallyResult;
  exilePlayer: (targetSeat: number) => void;
  selfExplode: (wolfSeat: number) => { allowed: boolean; reason?: string; swallowedBadge?: boolean };
  whiteWolfKingExplode: (
    wolfSeat: number,
    targetSeat: number | null,
  ) => WhiteWolfKingExplodeResult & { swallowedBadge?: boolean };
  knightDuel: (knightSeat: number, targetSeat: number) => KnightDuelResult;
  advanceToNextNight: () => void;

  toggleSeatAlive: (seatNumber: number, options?: { reason?: DeathReason }) => void;
  declareWinner: (winner: Faction, winReason: string) => void;

  restartGame: (options: { keepNicknames: boolean }) => void;
}

function createInitialGameState(): GameState & {
  activeView: AppView;
  pendingShooters: PendingShooter[];
} {
  return {
    activeView: 'home',
    phase: 'board_select',
    round: 1,
    selectedBoardId: null,
    hostMode: { ...DEFAULT_HOST_MODE },
    ambientAudio: { ...DEFAULT_AMBIENT_AUDIO_SETTINGS },
    ruleOverrides: { ...DEFAULT_RULE_OVERRIDES },
    seats: [],
    passRevealConfirmedSeats: [],
    savedNicknames: {},
    currentStepIndex: 0,
    currentNightDraft: createEmptyNightDraft(1),
    witchAntidoteUsed: false,
    witchPoisonUsed: false,
    lastGuardedSeat: null,
    mechWolfState: createInitialMechWolfState(),
    pendingSelfExplodeSeat: null,
    lastCharmedSeat: null,
    activeCharmedSeat: null,
    lastDreamTarget: null,
    knightDuelUsed: false,
    lastBearRoar: null,
    speakingQueue: [],
    currentSpeakerIndex: 0,
    speakingMeta: null,
    defaultSpeakDurationSec: DEFAULT_SPEAK_DURATION_SEC,
    remainingSeconds: DEFAULT_SPEAK_DURATION_SEC,
    sheriffState: createInitialSheriffState(),
    exilePkCandidates: [],
    nightHistory: [],
    dayHistory: [],
    winner: null,
    winReason: null,
    pendingShooters: [],
  };
}

function appendDayEvent(
  dayHistory: GameState['dayHistory'],
  round: number,
  event: string,
  structured?: DayStructuredEvent,
): GameState['dayHistory'] {
  const existingIndex = dayHistory.findIndex((entry) => entry.round === round);
  if (existingIndex === -1) {
    return [
      ...dayHistory,
      {
        round,
        events: [event],
        ...(structured ? { structuredEvents: [structured] } : {}),
      },
    ];
  }
  return dayHistory.map((entry, idx) =>
    idx === existingIndex
      ? {
          ...entry,
          events: [...entry.events, event],
          ...(structured
            ? { structuredEvents: [...(entry.structuredEvents ?? []), structured] }
            : {}),
        }
      : entry,
  );
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialGameState(),

      setActiveView: (view) => set({ activeView: view }),

      selectBoard: (boardId) => {
        const board = getBoardById(boardId);
        if (!board) {
          throw new Error(`找不到板子：${boardId}`);
        }
        const {
          activeView,
          savedNicknames,
          defaultSpeakDurationSec,
          hostMode,
          ambientAudio,
          ruleOverrides,
        } = get();
        set({
          ...createInitialGameState(),
          activeView,
          selectedBoardId: board.id,
          phase: 'seat_setup',
          hostMode: { ...hostMode },
          ambientAudio: { ...ambientAudio },
          ruleOverrides: { ...ruleOverrides },
          savedNicknames,
          seats: createInitialSeats(board.playerCount, savedNicknames),
          defaultSpeakDurationSec,
          remainingSeconds: defaultSpeakDurationSec,
        });
      },

      goToBoardSelect: () => {
        set({ phase: 'board_select' });
      },

      setBoardPlayerCount: (playerCount) => {
        const { selectedBoardId, savedNicknames } = get();
        const board = getBoardById(selectedBoardId);
        if (!board || !isValidPlayerCountForBoard(board, playerCount)) {
          return;
        }
        set({
          seats: createInitialSeats(playerCount, savedNicknames),
          passRevealConfirmedSeats: [],
        });
      },

      updateHostMode: (partial) => {
        set((state) => ({
          hostMode: {
            ...state.hostMode,
            ...partial,
          },
        }));
      },

      updateAmbientAudio: (partial) => {
        set((state) => ({
          ambientAudio: {
            ...state.ambientAudio,
            ...partial,
          },
        }));
      },

      updateRuleOverrides: (partial) => {
        set((state) => ({
          ruleOverrides: {
            ...state.ruleOverrides,
            ...partial,
          },
        }));
      },

      setSeatNickname: (seatNumber, nickname) => {
        set((state) => ({
          savedNicknames: {
            ...state.savedNicknames,
            [seatNumber]: nickname,
          },
          seats: state.seats.map((seat) =>
            seat.seatNumber === seatNumber ? { ...seat, nickname } : seat,
          ),
        }));
      },

      clearSavedNicknames: () => {
        set((state) => ({
          savedNicknames: {},
          seats: state.seats.map((seat) => ({ ...seat, nickname: '' })),
        }));
      },

      assignRole: (seatNumber, roleId) => {
        set((state) => ({
          seats: state.seats.map((seat) =>
            seat.seatNumber === seatNumber ? { ...seat, roleId } : seat,
          ),
        }));
      },

      claimSeatRole: (seatNumber, roleId) => {
        const { selectedBoardId, seats } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, reason: '尚未選擇板子' };
        }
        const result = claimSeatRoleLogic(board, seats, seatNumber, roleId);
        if (!result.ok) {
          return { ok: false, reason: result.reason };
        }
        set({ seats: result.seats });
        return { ok: true };
      },

      dealOnlineRoles: (rng) => {
        const { selectedBoardId, seats } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, errors: ['尚未選擇板子'] };
        }
        const dealtSeats = dealRandomRoles(board, seats, rng);
        const validation = validateRoleAssignment(board, dealtSeats);
        if (!validation.valid) {
          return { ok: false, errors: validation.errors };
        }
        set({
          seats: dealtSeats,
          passRevealConfirmedSeats: [],
        });
        return { ok: true, errors: [] };
      },

      confirmPassRevealSeat: (seatNumber) => {
        set((state) => {
          if (state.passRevealConfirmedSeats.includes(seatNumber)) {
            return state;
          }
          return {
            passRevealConfirmedSeats: [...state.passRevealConfirmedSeats, seatNumber].sort(
              (a, b) => a - b,
            ),
          };
        });
      },

      resetPassRevealSeat: (seatNumber) => {
        set((state) => ({
          passRevealConfirmedSeats: state.passRevealConfirmedSeats.filter(
            (s) => s !== seatNumber,
          ),
        }));
      },

      completePassAndReveal: () => {
        const { seats, passRevealConfirmedSeats } = get();
        const unconfirmed = seats
          .map((s) => s.seatNumber)
          .filter((num) => !passRevealConfirmedSeats.includes(num));
        if (unconfirmed.length > 0) {
          return {
            ok: false,
            reason: `尚有 ${unconfirmed.join('、')} 號玩家尚未確認身分`,
          };
        }
        set({
          phase: 'night',
          round: 1,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(1),
        });
        return { ok: true };
      },

      returnToLobby: () => {
        set({
          phase: 'seat_setup',
          passRevealConfirmedSeats: [],
        });
      },

      startGame: () => {
        const { selectedBoardId, seats, hostMode, defaultSpeakDurationSec } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, errors: ['尚未選擇板子'] };
        }

        if (hostMode.controlMode === 'multi_device') {
          return {
            ok: false,
            errors: ['多點連線大廳將於 Milestone B 開放，請切換為「中央操作」以開始單機對局。'],
          };
        }

        const baseRuntimeReset = {
          round: 1,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(1),
          witchAntidoteUsed: false,
          witchPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
          lastCharmedSeat: null,
          activeCharmedSeat: null,
          lastDreamTarget: null,
          knightDuelUsed: false,
          lastBearRoar: null,
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: defaultSpeakDurationSec,
          sheriffState: createInitialSheriffState(),
          exilePkCandidates: [],
          nightHistory: [],
          dayHistory: [],
          winner: null,
          winReason: null,
          pendingShooters: [],
          passRevealConfirmedSeats: [],
        };

        if (hostMode.dealMode === 'physical_deal') {
          const physicalCheck = validatePhysicalDealSetup(board, seats);
          if (!physicalCheck.valid) {
            return { ok: false, errors: physicalCheck.errors };
          }
          set({
            ...baseRuntimeReset,
            phase: 'night',
          });
          return { ok: true, errors: [] };
        }

        // online_deal × central_control：若尚未完整發牌則自動隨機洗牌，開局先進入 pass_and_reveal
        const existingCheck = validateRoleAssignment(board, seats);
        const finalSeats = existingCheck.valid ? seats : dealRandomRoles(board, seats);
        const validation = validateRoleAssignment(board, finalSeats);
        if (!validation.valid) {
          return { ok: false, errors: validation.errors };
        }

        set({
          ...baseRuntimeReset,
          seats: finalSeats,
          phase: 'pass_and_reveal',
        });
        return { ok: true, errors: [] };
      },

      updateNightDraft: (partial) => {
        set((state) => ({
          currentNightDraft: {
            ...state.currentNightDraft,
            ...partial,
          },
        }));
      },

      nextNightStep: () => {
        const { selectedBoardId, round, currentStepIndex } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) return;
        const steps = getNightSteps(board, round);
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        }
      },

      prevNightStep: () => {
        set((state) => ({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        }));
      },

      finishNight: () => {
        const state = get();
        const resolvedInputSeats =
          state.round === 1 && state.hostMode.dealMode === 'physical_deal'
            ? finalizePhysicalDealVillagers(state.seats)
            : state.seats;

        const result = resolveNight({
          seats: resolvedInputSeats,
          round: state.round,
          draft: state.currentNightDraft,
          ruleOverrides: state.ruleOverrides,
          witchAntidoteUsed: state.witchAntidoteUsed,
          witchPoisonUsed: state.witchPoisonUsed,
          lastGuardedSeat: state.lastGuardedSeat,
          mechWolfState: state.mechWolfState,
          pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
          lastCharmedSeat: state.lastCharmedSeat,
          lastDreamTarget: state.lastDreamTarget,
        });

        const deathMap = new Map(result.deaths.map((d) => [d.seat, d.reason]));
        const pendingShooters: PendingShooter[] = result.shootEligibilities
          .filter((item) => item.canShoot)
          .map((item) => ({
            ...item,
            deathReason: deathMap.get(item.seatNumber) ?? 'wolf_kill',
          }));

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);

        set({
          seats: result.seats,
          witchAntidoteUsed: result.witchAntidoteUsed,
          witchPoisonUsed: result.witchPoisonUsed,
          lastGuardedSeat: result.lastGuardedSeat,
          mechWolfState: result.mechWolfState,
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          lastCharmedSeat: result.lastCharmedSeat,
          activeCharmedSeat: result.activeCharmedSeat,
          lastDreamTarget: result.lastDreamTarget,
          lastBearRoar: result.bearRoar,
          sheriffState: nextSheriffState,
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
          exilePkCandidates: [],
          nightHistory: [
            ...state.nightHistory,
            {
              round: state.round,
              draft: { ...state.currentNightDraft },
              deaths: result.deaths,
              bearRoar: result.bearRoar,
            },
          ],
          pendingShooters,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : 'day_announcement',
        });
      },

      setDefaultSpeakDuration: (seconds) => {
        const safeSeconds = Math.max(10, Math.round(seconds));
        set({
          defaultSpeakDurationSec: safeSeconds,
          remainingSeconds: safeSeconds,
        });
      },

      generateSpeakingOrder: (options) => {
        const state = get();
        const sheriffSeat =
          options.sheriffSeat !== undefined
            ? options.sheriffSeat
            : state.sheriffState.badgeStatus === 'active'
              ? state.sheriffState.sheriffSeat
              : null;

        const result = generateSpeakingOrderLogic(state.seats, {
          ...options,
          sheriffSeat,
        });

        const modeLabels: Record<SpeakingOrderOptions['mode'], string> = {
          random: '隨機抽取',
          sheriff_left: '警左',
          sheriff_right: '警右',
          dead_left: '死左',
          dead_right: '死右',
        };
        const dirLabel = result.direction === 'clockwise' ? '順時針' : '逆時針';
        const anchorNote =
          (result.mode === 'dead_left' || result.mode === 'dead_right') &&
          result.anchorSeat !== null
            ? `·基準 ${result.anchorSeat} 號`
            : '';
        const summary = `發言順序（${modeLabels[result.mode]}${anchorNote}·${dirLabel}）：${result.queue
          .map((s) => `${s} 號`)
          .join(' → ')}`;

        set({
          speakingQueue: result.queue,
          currentSpeakerIndex: 0,
          speakingMeta: result,
          remainingSeconds: state.defaultSpeakDurationSec,
          dayHistory:
            result.queue.length > 0
              ? appendDayEvent(state.dayHistory, state.round, summary)
              : state.dayHistory,
        });

        return result;
      },

      nextSpeaker: () => {
        set((state) => {
          if (state.speakingQueue.length === 0) return state;
          const nextIndex = Math.min(state.currentSpeakerIndex + 1, state.speakingQueue.length);
          return {
            currentSpeakerIndex: nextIndex,
            remainingSeconds: state.defaultSpeakDurationSec,
          };
        });
      },

      adjustSpeakerTime: (deltaSeconds) => {
        set((state) => ({
          remainingSeconds: Math.max(0, state.remainingSeconds + deltaSeconds),
        }));
      },

      tickSpeakerTimer: () => {
        set((state) => ({
          remainingSeconds: Math.max(0, state.remainingSeconds - 1),
        }));
      },

      resetSpeakingOrder: () => {
        set((state) => ({
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
        }));
      },

      startSheriffElection: (candidateSeats) => {
        const state = get();
        const nextSheriffState = startSheriffElectionLogic(state.seats, candidateSeats);

        let summary = '';
        let eventType: DayStructuredEvent['type'] = 'sheriff_signup';
        if (nextSheriffState.status === 'no_sheriff') {
          summary = '警長競選：無人上警，本局無警長';
          eventType = 'sheriff_no_winner';
        } else if (nextSheriffState.status === 'elected') {
          summary = `警長競選：僅 ${nextSheriffState.sheriffSeat} 號上警，自動當選警長`;
          eventType = 'sheriff_elected';
        } else {
          summary = `警長競選：上警名單為 ${nextSheriffState.candidates.join('、')} 號`;
        }

        set({
          sheriffState: nextSheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: eventType,
            summary,
            targetSeat: nextSheriffState.sheriffSeat,
          }),
        });
      },

      withdrawSheriffCandidate: (seatNumber) => {
        const state = get();
        const nextSheriffState = withdrawSheriffCandidateLogic(state.sheriffState, seatNumber);

        let nextDayHistory = appendDayEvent(
          state.dayHistory,
          state.round,
          `${seatNumber} 號退水`,
          {
            type: 'sheriff_withdraw',
            summary: `${seatNumber} 號退水`,
            actorSeat: seatNumber,
          },
        );

        if (nextSheriffState.status === 'elected' && nextSheriffState.sheriffSeat !== null) {
          const electedSummary = `${nextSheriffState.sheriffSeat} 號為唯一留警候選人，自動當選警長`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, electedSummary, {
            type: 'sheriff_elected',
            summary: electedSummary,
            targetSeat: nextSheriffState.sheriffSeat,
          });
        } else if (nextSheriffState.status === 'no_sheriff') {
          const noWinnerSummary = '所有上警候選人皆已退水，本局無警長';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, noWinnerSummary, {
            type: 'sheriff_no_winner',
            summary: noWinnerSummary,
          });
        }

        set({
          sheriffState: nextSheriffState,
          dayHistory: nextDayHistory,
        });
      },

      submitSheriffVotes: (votes) => {
        const state = get();
        const resolution = resolveSheriffVoteRound(state.sheriffState, state.seats, votes);

        let summary = '';
        let eventType: DayStructuredEvent['type'] = 'sheriff_vote';
        if (resolution.outcome === 'elected') {
          summary = `警長投票結果：${resolution.record.electedSeat} 號當選警長`;
          eventType = 'sheriff_elected';
        } else if (resolution.outcome === 'pk') {
          summary = `警長投票平票：${resolution.record.tiedSeats.join('、')} 號進入 PK`;
          eventType = 'sheriff_vote';
        } else {
          summary = '警長投票流局：本局無警長';
          eventType = 'sheriff_no_winner';
        }

        set({
          sheriffState: resolution.sheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: eventType,
            summary,
            targetSeat: resolution.record.electedSeat,
            voteRecord: resolution.record,
          }),
        });

        return resolution;
      },

      transferSheriffBadge: (targetSeat) => {
        const state = get();
        const fromSeat = state.sheriffState.pendingBadgeTransferFrom ?? state.sheriffState.sheriffSeat;
        const nextSheriffState = transferSheriffBadgeLogic(
          state.sheriffState,
          state.seats,
          targetSeat,
        );
        const summary = `${fromSeat} 號移交警徽給 ${targetSeat} 號`;

        set({
          sheriffState: nextSheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'badge_transfer',
            summary,
            actorSeat: fromSeat,
            targetSeat,
          }),
        });
      },

      destroySheriffBadge: () => {
        const state = get();
        const fromSeat = state.sheriffState.pendingBadgeTransferFrom ?? state.sheriffState.sheriffSeat;
        const nextSheriffState = destroySheriffBadgeLogic(state.sheriffState);
        const summary = `${fromSeat} 號撕毀警徽，本局後續無警長`;

        set({
          sheriffState: nextSheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'badge_destroy',
            summary,
            actorSeat: fromSeat,
          }),
        });
      },

      triggerShoot: (shooterSeat, targetSeat) => {
        const state = get();
        const shooter = state.pendingShooters.find((s) => s.seatNumber === shooterSeat);
        if (!shooter) {
          throw new Error(`座位 ${shooterSeat} 號目前無開槍資格`);
        }

        const result = resolveShoot(
          state.seats,
          shooterSeat,
          targetSeat,
          shooter.deathReason,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
        );

        const remainingShooters = state.pendingShooters.filter(
          (s) => s.seatNumber !== shooterSeat,
        );
        if (result.chainedShootEligibility?.canShoot) {
          remainingShooters.push({
            ...result.chainedShootEligibility,
            deathReason: result.deathReason,
          });
        }

        const actorLabel = shooter.roleId === 'hunter' ? '獵人' : '狼王';
        const shootSummary = `${shooterSeat} 號（${actorLabel}）開槍帶走 ${targetSeat} 號`;
        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, shootSummary, {
          type: shooter.roleId === 'hunter' ? 'hunter_shoot' : 'wolf_king_shoot',
          summary: shootSummary,
          actorSeat: shooterSeat,
          targetSeat,
        });

        if (result.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${result.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: result.charmedDeathSeat,
          });
        }

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          pendingShooters: remainingShooters,
          dayHistory: nextDayHistory,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : state.phase,
        });
      },

      skipShoot: (shooterSeat) => {
        set((state) => ({
          pendingShooters: state.pendingShooters.filter((s) => s.seatNumber !== shooterSeat),
          dayHistory: appendDayEvent(
            state.dayHistory,
            state.round,
            `${shooterSeat} 號選擇壓槍不開`,
          ),
        }));
      },

      proceedToDayVote: () => {
        set((state) => ({
          phase: state.winner ? 'game_over' : 'day_vote',
        }));
      },

      submitExileVotes: (votes, options = {}) => {
        const state = get();
        const isPkRound = state.exilePkCandidates.length > 0;
        const activeSheriffSeat =
          state.sheriffState.badgeStatus === 'active' ? state.sheriffState.sheriffSeat : null;

        const tally = tallyExileVotes({
          seats: state.seats,
          votes,
          sheriffSeat: activeSheriffSeat,
          sheriffVoteWeight: options.sheriffVoteWeight ?? 1.5,
          extraVotes: options.extraVotes,
          pkCandidates: state.exilePkCandidates,
          roundIndex: isPkRound ? 2 : 1,
        });

        if (tally.outcome === 'tie') {
          const summary = `放逐投票平票：${tally.record.tiedSeats.join('、')} 號進入 PK`;
          set({
            exilePkCandidates: tally.record.tiedSeats,
            dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
              type: 'exile_pk',
              summary,
              voteRecord: tally.record,
            }),
          });
          return tally;
        }

        if (tally.outcome === 'no_exile' || tally.record.electedSeat === null) {
          const summary = isPkRound
            ? '放逐 PK 投票再次平票，本日無人出局（平安日）'
            : '放逐投票無人得票，本日無人出局（平安日）';
          set({
            exilePkCandidates: [],
            dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
              type: 'exile_vote',
              summary,
              voteRecord: tally.record,
            }),
          });
          return tally;
        }

        const targetSeat = tally.record.electedSeat;
        const voteSummary = `放逐投票結果：${targetSeat} 號最高票（${tally.record.totals[targetSeat]} 票）`;
        const exileResult = resolveDayExile(
          state.seats,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
        );

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, voteSummary, {
          type: 'exile_vote',
          summary: voteSummary,
          targetSeat,
          voteRecord: tally.record,
        });

        const outcomeText = exileResult.idiotRevealed
          ? `${targetSeat} 號（白痴）被放逐投票投出，翻牌免死並失去投票權`
          : `${targetSeat} 號於白天放逐出局`;
        nextDayHistory = appendDayEvent(nextDayHistory, state.round, outcomeText, {
          type: exileResult.idiotRevealed ? 'idiot_reveal' : 'exile_result',
          summary: outcomeText,
          targetSeat,
        });

        if (exileResult.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${exileResult.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: exileResult.charmedDeathSeat,
          });
        }

        const pendingShooters: PendingShooter[] =
          exileResult.shootEligibility?.canShoot && !exileResult.victory.winner
            ? [{ ...exileResult.shootEligibility, deathReason: 'exiled' }]
            : [];

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, exileResult.seats);

        set({
          seats: exileResult.seats,
          mechWolfState: exileResult.mechWolfState,
          activeCharmedSeat:
            exileResult.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          exilePkCandidates: [],
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: exileResult.victory.winner,
          winReason: exileResult.victory.winReason,
          phase: exileResult.victory.winner ? 'game_over' : state.phase,
        });

        return tally;
      },

      exilePlayer: (targetSeat) => {
        const state = get();
        const result = resolveDayExile(
          state.seats,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
        );

        const eventText = result.idiotRevealed
          ? `${targetSeat} 號（白痴）被放逐投票投出，翻牌免死並失去投票權`
          : `${targetSeat} 號於白天放逐出局`;

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, eventText, {
          type: result.idiotRevealed ? 'idiot_reveal' : 'exile_result',
          summary: eventText,
          targetSeat,
        });

        if (result.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${result.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: result.charmedDeathSeat,
          });
        }

        const pendingShooters: PendingShooter[] =
          result.shootEligibility?.canShoot && !result.victory.winner
            ? [{ ...result.shootEligibility, deathReason: 'exiled' }]
            : [];

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          exilePkCandidates: [],
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : state.phase,
        });
      },

      selfExplode: (wolfSeat) => {
        const state = get();
        const result = resolveSelfExplode(state.seats, wolfSeat);
        if (!result.allowed) {
          return { allowed: false, reason: result.reason };
        }

        const swallowedBadge = isSheriffElectionActive(state.sheriffState);
        const nextSheriffState = swallowedBadge
          ? swallowSheriffBadge(state.sheriffState)
          : state.sheriffState;

        const nextRound = state.round + 1;
        const explodeSummary = `${wolfSeat} 號狼人自爆，強制進入第 ${nextRound} 晚（當晚點刀後正式死亡）`;
        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, explodeSummary, {
          type: 'self_explode',
          summary: explodeSummary,
          actorSeat: wolfSeat,
        });

        if (swallowedBadge) {
          const swallowSummary = '警上階段發生狼人自爆，吞警徽（本局無警長）';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, swallowSummary, {
            type: 'sheriff_swallowed',
            summary: swallowSummary,
            actorSeat: wolfSeat,
          });
        }

        set({
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          sheriffState: nextSheriffState,
          dayHistory: nextDayHistory,
          round: nextRound,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(nextRound),
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
          exilePkCandidates: [],
          pendingShooters: [],
          phase: 'night',
        });

        return { allowed: true, swallowedBadge };
      },

      whiteWolfKingExplode: (wolfSeat, targetSeat) => {
        const state = get();
        const result = resolveWhiteWolfKingExplode(
          state.seats,
          wolfSeat,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
        );

        if (!result.allowed) {
          return { ...result, swallowedBadge: false };
        }

        const swallowedBadge = isSheriffElectionActive(state.sheriffState);
        let nextSheriffState = swallowedBadge
          ? swallowSheriffBadge(state.sheriffState)
          : state.sheriffState;
        nextSheriffState = syncSheriffBadgeOnDeaths(nextSheriffState, result.seats);

        const nextRound = state.round + 1;
        const summary =
          targetSeat !== null
            ? `${wolfSeat} 號（白狼王）自爆並帶走 ${targetSeat} 號`
            : `${wolfSeat} 號（白狼王）自爆，強制進入第 ${nextRound} 晚`;

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, summary, {
          type: 'white_wolf_king_explode',
          summary,
          actorSeat: wolfSeat,
          targetSeat,
        });

        if (swallowedBadge) {
          const swallowSummary = '警上階段白狼王自爆，吞警徽（本局無警長）';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, swallowSummary, {
            type: 'sheriff_swallowed',
            summary: swallowSummary,
            actorSeat: wolfSeat,
          });
        }

        if (result.victory.winner) {
          set({
            seats: result.seats,
            mechWolfState: result.mechWolfState,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            winner: result.victory.winner,
            winReason: result.victory.winReason,
            phase: 'game_over',
          });
        } else {
          set({
            seats: result.seats,
            mechWolfState: result.mechWolfState,
            pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            round: nextRound,
            currentStepIndex: 0,
            currentNightDraft: createEmptyNightDraft(nextRound),
            speakingQueue: [],
            currentSpeakerIndex: 0,
            speakingMeta: null,
            remainingSeconds: state.defaultSpeakDurationSec,
            exilePkCandidates: [],
            pendingShooters: [],
            phase: 'night',
          });
        }

        return { ...result, swallowedBadge };
      },

      knightDuel: (knightSeat, targetSeat) => {
        const state = get();
        const result = resolveKnightDuel(
          state.seats,
          knightSeat,
          targetSeat,
          state.knightDuelUsed,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );

        if (!result.allowed) {
          return result;
        }

        const summary = result.targetWasWolf
          ? `${knightSeat} 號（騎士）翻牌決鬥 ${targetSeat} 號成功（撞狼），${targetSeat} 號出局並直接入夜`
          : `${knightSeat} 號（騎士）翻牌決鬥 ${targetSeat} 號失敗（撞好人），${knightSeat} 號以死謝罪`;

        const nextDayHistory = appendDayEvent(state.dayHistory, state.round, summary, {
          type: 'knight_duel',
          summary,
          actorSeat: knightSeat,
          targetSeat,
        });

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);
        const killedWolfBeauty =
          result.targetWasWolf &&
          state.seats.find((s) => s.seatNumber === targetSeat)?.roleId === 'wolf_beauty';

        if (result.victory.winner) {
          set({
            seats: result.seats,
            mechWolfState: result.mechWolfState,
            knightDuelUsed: true,
            activeCharmedSeat: killedWolfBeauty ? null : state.activeCharmedSeat,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            winner: result.victory.winner,
            winReason: result.victory.winReason,
            phase: 'game_over',
          });
        } else if (result.enterNightImmediately) {
          const nextRound = state.round + 1;
          set({
            seats: result.seats,
            mechWolfState: result.mechWolfState,
            knightDuelUsed: true,
            activeCharmedSeat: killedWolfBeauty ? null : state.activeCharmedSeat,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            round: nextRound,
            currentStepIndex: 0,
            currentNightDraft: createEmptyNightDraft(nextRound),
            speakingQueue: [],
            currentSpeakerIndex: 0,
            speakingMeta: null,
            remainingSeconds: state.defaultSpeakDurationSec,
            exilePkCandidates: [],
            pendingShooters: [],
            phase: 'night',
          });
        } else {
          set({
            seats: result.seats,
            mechWolfState: result.mechWolfState,
            knightDuelUsed: true,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
          });
        }

        return result;
      },

      advanceToNextNight: () => {
        const state = get();
        if (state.winner) return;
        const nextRound = state.round + 1;
        set({
          round: nextRound,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(nextRound),
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
          exilePkCandidates: [],
          pendingShooters: [],
          phase: 'night',
        });
      },

      toggleSeatAlive: (seatNumber, options) => {
        const state = get();
        const result = toggleSeatAliveManually(
          state.seats,
          seatNumber,
          state.round,
          state.mechWolfState,
          state.ruleOverrides,
          options?.reason ?? 'manual_judge',
        );
        const eventText = result.becameAlive
          ? `法官手動調整：${seatNumber} 號恢復為存活狀態`
          : `法官手動標記：${seatNumber} 號出局`;

        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          sheriffState: nextSheriffState,
          pendingShooters: result.becameAlive
            ? state.pendingShooters
            : state.pendingShooters.filter((s) => s.seatNumber !== seatNumber),
          dayHistory: appendDayEvent(state.dayHistory, state.round, eventText, {
            type: 'manual_judge',
            summary: eventText,
            targetSeat: seatNumber,
          }),
          ...(result.becameAlive && state.winner ? { winner: null, winReason: null } : {}),
        });
      },

      declareWinner: (winner, winReason) => {
        const state = get();
        const summary = `法官宣告勝負：${winReason}`;
        set({
          winner,
          winReason,
          pendingShooters: [],
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'declare_winner',
            summary,
          }),
          phase: 'game_over',
        });
      },

      restartGame: ({ keepNicknames }) => {
        const state = get();
        if (keepNicknames) {
          const board = getBoardById(state.selectedBoardId);
          set({
            ...createInitialGameState(),
            activeView: state.activeView,
            selectedBoardId: board ? board.id : null,
            hostMode: { ...state.hostMode },
            ambientAudio: { ...state.ambientAudio },
            ruleOverrides: { ...state.ruleOverrides },
            savedNicknames: { ...state.savedNicknames },
            defaultSpeakDurationSec: state.defaultSpeakDurationSec,
            remainingSeconds: state.defaultSpeakDurationSec,
            seats: board ? createInitialSeats(board.playerCount, state.savedNicknames) : [],
            phase: board ? 'seat_setup' : 'board_select',
          });
          return;
        }

        set({
          ...createInitialGameState(),
          activeView: state.activeView,
        });
      },
    }),
    {
      name: GAME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<GameStore>;
        return {
          ...currentState,
          ...persisted,
          hostMode: {
            ...DEFAULT_HOST_MODE,
            ...(persisted.hostMode ?? {}),
          },
          ambientAudio: {
            ...DEFAULT_AMBIENT_AUDIO_SETTINGS,
            ...(persisted.ambientAudio ?? {}),
          },
          ruleOverrides: {
            ...DEFAULT_RULE_OVERRIDES,
            ...(persisted.ruleOverrides ?? {}),
          },
          passRevealConfirmedSeats: persisted.passRevealConfirmedSeats ?? [],
        };
      },
    },
  ),
);
