import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_AMBIENT_AUDIO_SETTINGS,
  DEFAULT_HOST_MODE,
  DEFAULT_ONLINE_JUDGE_SETTINGS,
  DEFAULT_RULE_OVERRIDES,
  DEFAULT_SPEAK_DURATION_SEC,
  applyPandoraGift,
  canWhiteNightEnvoyRewind,
  checkVictory,
  claimSeatRole as claimSeatRoleLogic,
  clampOnlineJudgeSettings,
  cloneThirdPartySpecialState,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialConversionState,
  createInitialFinalBatchState,
  createInitialThirdPartySpecialState,
  createInitialGargoyleState,
  createInitialHiddenWolfState,
  createInitialHybridState,
  createInitialInterferenceState,
  createInitialMechWolfState,
  createInitialNotebookState,
  createInitialPumpkinGhostState,
  createInitialSeats,
  createInitialSeedWolfState,
  createInitialSheriffState,
  createInitialSuperGravekeeperState,
  createInitialWolfGirlState,
  createManualVictoryResult,
  dealRandomRoles,
  destroySheriffBadge as destroySheriffBadgeLogic,
  finalizePhysicalDealVillagers,
  generateSpeakingOrder as generateSpeakingOrderLogic,
  getDefaultRuleOverridesForBoard,
  getNightSteps,
  handleSheriffElectionExplode,
  isValidPlayerCountForBoard,
  resolveAlchemySnakeRevive,
  resolveAvengerAssassinate,
  resolveAwakenedHunterDirectionShoot,
  resolveBaiZeInherit,
  resolveContrarianDebate,
  resolveDayExile,
  resolveDetectiveCollectiveAccusation,
  resolveDetectiveExecute,
  resolveDetectiveReveal,
  resolveGoodSelfExplode,
  resolveKnightDuel,
  resolveMaskedVillagerDelayedDeath,
  resolveNight,
  resolveNineTailsHunt,
  resolveOldRascalDelayedDeath,
  resolvePandoraHopeLight,
  resolvePufferfishExplode,
  resolveSelfExplode,
  resolveSequencePrinceRevote,
  resolveSheriffVoteRound,
  resolveShoot,
  resolveWhiteCatDelayedDeath,
  resolveWhiteWolfKingExplode,
  resolveWolfGirlExplode,
  resumeDeferredSheriffElection,
  setNotebookGridCell as setNotebookGridCellLogic,
  shouldTriggerAutoVictory,
  startSheriffElection as startSheriffElectionLogic,
  syncGargoyleTeamStatus,
  syncBatch5LoneWolfTeamStatus,
  syncConversionOnDeaths,
  syncPumpkinGhostInheritance,
  syncSheriffBadgeOnDeaths,
  syncSuperGravekeeperInheritance,
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
  GameState,
  PandoraBoxItem,
  GameWinner,
  GoodSelfExplodeResult,
  HostModeConfig,
  KnightDuelResult,
  ManualVictoryOverrideKind,
  NightActionDraft,
  NotebookMode,
  OnlineJudgeSettings,
  RuleOverrides,
  ShootEligibility,
  SpeakingOrderOptions,
  SpeakingOrderResult,
  VoteInputMode,
  WhiteWolfKingExplodeResult,
} from '../logic/types';

export const GAME_STORAGE_KEY = 'werewolf-judge-storage';
export const MAX_UNDO_STEPS = 10;

export type AppView = 'home' | 'join_room' | 'rules_atlas' | 'about' | 'game';

export interface PendingShooter extends ShootEligibility {
  deathReason: DeathReason;
}

export interface SubmitExileVotesOptions {
  extraVotes?: Record<number, number>;
  sheriffVoteWeight?: number;
}

export type UndoSnapshotData = Pick<
  GameState,
  | 'phase'
  | 'round'
  | 'seats'
  | 'passRevealConfirmedSeats'
  | 'currentStepIndex'
  | 'currentNightDraft'
  | 'witchAntidoteUsed'
  | 'witchPoisonUsed'
  | 'lastGuardedSeat'
  | 'mechWolfState'
  | 'pendingSelfExplodeSeat'
  | 'lastCharmedSeat'
  | 'activeCharmedSeat'
  | 'lastDreamTarget'
  | 'knightDuelUsed'
  | 'lastBearRoar'
  | 'lastFearedSeat'
  | 'evilKnightCounterUsed'
  | 'hybridState'
  | 'seedWolfState'
  | 'hiddenWolfState'
  | 'gargoyleState'
  | 'pumpkinGhostState'
  | 'superGravekeeperState'
  | 'foxLostAbility'
  | 'exiledHistory'
  | 'lastAwakenedDreamTarget'
  | 'lastMoonSpiritHowl'
  | 'lastNineTailedFoxResult'
  | 'lastSeniorVillagerReveal'
  | 'interferenceState'
  | 'combatState'
  | 'conversionState'
  | 'thirdPartySpecialState'
  | 'finalBatchState'
  | 'speakingQueue'
  | 'currentSpeakerIndex'
  | 'speakingMeta'
  | 'remainingSeconds'
  | 'sheriffState'
  | 'exilePkCandidates'
  | 'nightHistory'
  | 'dayHistory'
  | 'winner'
  | 'winReason'
  | 'forceContinueAfterVictory'
  | 'preGameOverPhase'
> & {
  pendingShooters: PendingShooter[];
};

export interface UndoSnapshot {
  label: string;
  data: UndoSnapshotData;
}

export interface GameStore extends GameState {
  activeView: AppView;
  pendingShooters: PendingShooter[];
  /** 純記憶體撤銷堆疊（最多保留 10 步，不寫入 localStorage） */
  undoStack: UndoSnapshot[];

  setActiveView: (view: AppView) => void;
  undoLastStep: () => { ok: boolean; undoneLabel?: string };

  selectBoard: (boardId: string) => void;
  goToBoardSelect: () => void;
  setBoardPlayerCount: (playerCount: number) => void;
  updateHostMode: (partial: Partial<HostModeConfig>) => void;
  updateOnlineJudgeSettings: (partial: Partial<OnlineJudgeSettings>) => void;
  updateAmbientAudio: (partial: Partial<AmbientAudioSettings>) => void;
  updateRuleOverrides: (partial: Partial<RuleOverrides>) => void;
  setSeatNickname: (seatNumber: number, nickname: string) => void;
  setSeatGender: (seatNumber: number, gender: 'male' | 'female' | undefined) => void;
  setSeatSecondRole: (
    seatNumber: number,
    secondRoleId: 'jack_the_ripper' | 'fanatic' | 'detective' | null,
  ) => void;
  randomizeJackSetup: () => void;
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
  setVoteInputMode: (mode: VoteInputMode) => void;
  submitExileVotes: (
    votes: Record<number, number | null>,
    options?: SubmitExileVotesOptions,
  ) => ExileVoteTallyResult;
  exilePlayer: (targetSeat: number) => void;
  selfExplode: (wolfSeat: number) => {
    allowed: boolean;
    reason?: string;
    swallowedBadge?: boolean;
    deferredBadge?: boolean;
  };
  goodSelfExplode: (actorSeat: number) => GoodSelfExplodeResult & {
    swallowedBadge?: boolean;
    deferredBadge?: boolean;
  };
  whiteWolfKingExplode: (
    wolfSeat: number,
    targetSeat: number | null,
  ) => WhiteWolfKingExplodeResult & { swallowedBadge?: boolean; deferredBadge?: boolean };
  knightDuel: (knightSeat: number, targetSeat: number) => KnightDuelResult;
  reviveWithAlchemySnake: (victimSeat: number) => { allowed: boolean; reason?: string };
  triggerWhiteCatDelayedDeath: () => void;
  pufferfishExplode: (voterSeats: number[]) => { allowed: boolean; reason?: string; killedSeats?: number[] };
  awakenedHunterShoot: (hunterSeat: number, direction: 'left' | 'right') => { allowed: boolean; killedSeat?: number | null };
  triggerOldRascalDelayedDeath: () => void;
  avengerAssassinate: (targetSeat: number) => { allowed: boolean; reason?: string; killedSeat?: number | null };
  /** 第 5 批：潘朵拉白天贈盒／希望之光／九尾獵殺時刻／白澤繼承人 */
  pandoraDayGift: (
    targetSeat: number,
    item: PandoraBoxItem,
  ) => { allowed: boolean; reason?: string; poisonedSeat?: number | null };
  usePandoraHopeLight: (
    actorSeat: number,
  ) => { allowed: boolean; reason?: string; triggeredWinner?: string | null };
  triggerNineTailsHunt: () => { success: boolean; eliminatedSeats: number[] };
  setBaiZeHeir: (heirSeat: number) => { allowed: boolean; reason?: string };
  /** 第 6 批：定序王子重投／槓精開槓／偵探翻牌處決／白夜使者回溯 */
  triggerSequencePrinceRevote: () => { allowed: boolean; reason?: string };
  resolveContrarianVote: (
    targetSeat: number,
    majorityPassed: boolean,
  ) => { allowed: boolean; reason?: string; silencedVoterSeat?: number | null };
  triggerDetectiveReveal: () => { allowed: boolean; reason?: string };
  detectiveExecutePlayer: (
    targetSeat: number,
  ) => { allowed: boolean; reason?: string; targetWasWolf?: boolean };
  triggerWhiteNightRewind: () => { allowed: boolean; reason?: string };
  /** 開膛手傑克第二身分板：已出局偵探集結指證 */
  detectiveCollectiveAccuse: (
    accusedSeat: number,
    agreeCount: number,
  ) => { allowed: boolean; reason?: string; success?: boolean };
  /** 潘朵拉魔盒白天手槍 */
  usePandoraDayGun: (
    actorSeat: number,
    targetSeat: number,
  ) => { allowed: boolean; reason?: string };
  /** 狼女孩白天自爆（帶走告白對象或分手） */
  wolfGirlExplode: (
    wolfGirlSeat: number,
    options?: { voidExileVote?: boolean },
  ) => { allowed: boolean; reason?: string; breakupDeathSeat?: number | null };
  /** 蒙面平民延遲死亡結算 */
  triggerMaskedVillagerDelayedDeath: (
    seatNumber: number,
  ) => { allowed: boolean; reason?: string };
  advanceToNextNight: () => void;

  toggleSeatAlive: (seatNumber: number, options?: { reason?: DeathReason }) => void;
  declareWinner: (winner: GameWinner, winReason: string) => void;
  overrideVictory: (kind: ManualVictoryOverrideKind, customReason?: string) => void;
  forceContinueGame: () => void;

  /** 玩家雙模式筆記本 */
  setNotebookMode: (mode: NotebookMode) => void;
  setNotebookFreeformText: (text: string) => void;
  setNotebookGridCell: (stageKey: string, seatNumber: number, value: string) => void;
  clearNotebook: (scope?: 'all' | 'freeform' | 'grid') => void;

  restartGame: (options: { keepNicknames: boolean }) => void;
  dissolveRoom: () => void;
}

function finalizeDayDeathSync(
  state: GameState,
  seatsAfterAction: GameState['seats'],
  options: {
    wolfKillPriorityOverride?: boolean;
    conversionStateOverride?: GameState['conversionState'];
    thirdPartySpecialStateOverride?: GameState['thirdPartySpecialState'];
  } = {},
) {
  const convSync = syncConversionOnDeaths(
    seatsAfterAction,
    options.conversionStateOverride ?? state.conversionState ?? createInitialConversionState(),
    state.round,
  );
  const nextThirdPartySpecialState = syncBatch5LoneWolfTeamStatus(
    convSync.seats,
    options.thirdPartySpecialStateOverride ??
      state.thirdPartySpecialState ??
      createInitialThirdPartySpecialState(),
  );
  const effectiveRules = options.wolfKillPriorityOverride
    ? { ...state.ruleOverrides, wolfKillPriority: true }
    : state.ruleOverrides;
  const victory = checkVictory(convSync.seats, effectiveRules, state.treasureMasterState, {
    conversionState: convSync.state,
    thirdPartySpecialState: nextThirdPartySpecialState,
    boardId: state.selectedBoardId ?? undefined,
  });
  return {
    seats: convSync.seats,
    conversionState: convSync.state,
    thirdPartySpecialState: nextThirdPartySpecialState,
    linkedDeaths: convSync.linkedDeaths,
    victory,
  };
}

function createInitialGameState(): GameState & {
  activeView: AppView;
  pendingShooters: PendingShooter[];
  undoStack: UndoSnapshot[];
} {
  return {
    activeView: 'home',
    phase: 'board_select',
    round: 1,
    selectedBoardId: null,
    hostMode: { ...DEFAULT_HOST_MODE },
    onlineJudgeSettings: { ...DEFAULT_ONLINE_JUDGE_SETTINGS },
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
    lastFearedSeat: null,
    evilKnightCounterUsed: false,
    hybridState: createInitialHybridState(),
    seedWolfState: createInitialSeedWolfState(),
    hiddenWolfState: createInitialHiddenWolfState(),
    gargoyleState: createInitialGargoyleState(),
    pumpkinGhostState: createInitialPumpkinGhostState(),
    superGravekeeperState: createInitialSuperGravekeeperState(),
    foxLostAbility: false,
    exiledHistory: [],
    lastAwakenedDreamTarget: null,
    lastMoonSpiritHowl: null,
    lastNineTailedFoxResult: null,
    lastSeniorVillagerReveal: null,
    interferenceState: createInitialInterferenceState(),
    combatState: createInitialCombatState(),
    conversionState: createInitialConversionState(),
    thirdPartySpecialState: createInitialThirdPartySpecialState(),
    finalBatchState: createInitialFinalBatchState(),
    speakingQueue: [],
    currentSpeakerIndex: 0,
    speakingMeta: null,
    defaultSpeakDurationSec: DEFAULT_SPEAK_DURATION_SEC,
    remainingSeconds: DEFAULT_SPEAK_DURATION_SEC,
    sheriffState: createInitialSheriffState(),
    exilePkCandidates: [],
    voteInputMode: 'by_voter',
    notebook: createInitialNotebookState(),
    nightHistory: [],
    dayHistory: [],
    winner: null,
    winReason: null,
    forceContinueAfterVictory: false,
    preGameOverPhase: null,
    pendingShooters: [],
    undoStack: [],
  };
}

function captureUndoSnapshot(state: GameStore, label: string): UndoSnapshot {
  const raw: UndoSnapshotData = {
    phase: state.phase,
    round: state.round,
    seats: state.seats,
    passRevealConfirmedSeats: state.passRevealConfirmedSeats,
    currentStepIndex: state.currentStepIndex,
    currentNightDraft: state.currentNightDraft,
    witchAntidoteUsed: state.witchAntidoteUsed,
    witchPoisonUsed: state.witchPoisonUsed,
    lastGuardedSeat: state.lastGuardedSeat,
    mechWolfState: state.mechWolfState,
    pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
    lastCharmedSeat: state.lastCharmedSeat,
    activeCharmedSeat: state.activeCharmedSeat,
    lastDreamTarget: state.lastDreamTarget,
    knightDuelUsed: state.knightDuelUsed,
    lastBearRoar: state.lastBearRoar,
    lastFearedSeat: state.lastFearedSeat,
    evilKnightCounterUsed: state.evilKnightCounterUsed,
    hybridState: state.hybridState,
    seedWolfState: state.seedWolfState,
    hiddenWolfState: state.hiddenWolfState,
    gargoyleState: state.gargoyleState,
    pumpkinGhostState: state.pumpkinGhostState,
    superGravekeeperState: state.superGravekeeperState,
    foxLostAbility: state.foxLostAbility,
    exiledHistory: state.exiledHistory,
    lastAwakenedDreamTarget: state.lastAwakenedDreamTarget,
    lastMoonSpiritHowl: state.lastMoonSpiritHowl,
    lastNineTailedFoxResult: state.lastNineTailedFoxResult,
    lastSeniorVillagerReveal: state.lastSeniorVillagerReveal,
    interferenceState: state.interferenceState,
    combatState: state.combatState,
    conversionState: state.conversionState,
    thirdPartySpecialState: state.thirdPartySpecialState,
    finalBatchState: state.finalBatchState,
    speakingQueue: state.speakingQueue,
    currentSpeakerIndex: state.currentSpeakerIndex,
    speakingMeta: state.speakingMeta,
    remainingSeconds: state.remainingSeconds,
    sheriffState: state.sheriffState,
    exilePkCandidates: state.exilePkCandidates,
    nightHistory: state.nightHistory,
    dayHistory: state.dayHistory,
    winner: state.winner,
    winReason: state.winReason,
    forceContinueAfterVictory: state.forceContinueAfterVictory,
    preGameOverPhase: state.preGameOverPhase,
    pendingShooters: state.pendingShooters,
  };
  return {
    label,
    data: JSON.parse(JSON.stringify(raw)) as UndoSnapshotData,
  };
}

function pushUndo(state: GameStore, label: string): UndoSnapshot[] {
  const next = [...state.undoStack, captureUndoSnapshot(state, label)];
  return next.length > MAX_UNDO_STEPS ? next.slice(next.length - MAX_UNDO_STEPS) : next;
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

      undoLastStep: () => {
        const state = get();
        if (state.undoStack.length === 0) {
          return { ok: false };
        }
        const lastSnapshot = state.undoStack[state.undoStack.length - 1];
        const remainingStack = state.undoStack.slice(0, -1);
        set({
          ...lastSnapshot.data,
          undoStack: remainingStack,
        });
        return { ok: true, undoneLabel: lastSnapshot.label };
      },

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
          onlineJudgeSettings,
          ambientAudio,
          ruleOverrides,
        } = get();
        set({
          ...createInitialGameState(),
          activeView,
          selectedBoardId: board.id,
          phase: 'seat_setup',
          hostMode: { ...hostMode },
          onlineJudgeSettings: { ...onlineJudgeSettings },
          ambientAudio: { ...ambientAudio },
          ruleOverrides: {
            ...ruleOverrides,
            ...getDefaultRuleOverridesForBoard(board.id),
          },
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

      updateOnlineJudgeSettings: (partial) => {
        set((state) => ({
          onlineJudgeSettings: clampOnlineJudgeSettings(state.onlineJudgeSettings, partial),
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

      setSeatGender: (seatNumber, gender) => {
        set((state) => ({
          seats: state.seats.map((seat) =>
            seat.seatNumber === seatNumber ? { ...seat, gender } : seat,
          ),
        }));
      },

      setSeatSecondRole: (seatNumber, secondRoleId) => {
        set((state) => ({
          seats: state.seats.map((seat) => {
            if (seat.seatNumber === seatNumber) {
              return { ...seat, secondRoleId };
            }
            // 開膛手傑克第二身分全場僅限 1 位，若指定新座位為傑克，原傑克退回偵探
            if (secondRoleId === 'jack_the_ripper' && seat.secondRoleId === 'jack_the_ripper') {
              return { ...seat, secondRoleId: 'detective' };
            }
            return seat;
          }),
        }));
      },

      randomizeJackSetup: () => {
        set((state) => {
          const total = state.seats.length;
          if (total === 0) return {};
          const half = Math.floor(total / 2);
          const genders: Array<'male' | 'female'> = [
            ...Array.from({ length: half }, () => 'male' as const),
            ...Array.from({ length: total - half }, () => 'female' as const),
          ];
          for (let i = genders.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [genders[i], genders[j]] = [genders[j], genders[i]];
          }
          const isSecondId = state.selectedBoardId === '12p-jack-the-ripper-2';
          const jackIdx = isSecondId ? Math.floor(Math.random() * total) : -1;
          return {
            seats: state.seats.map((seat, idx) => ({
              ...seat,
              gender: genders[idx],
              ...(isSecondId
                ? { secondRoleId: idx === jackIdx ? ('jack_the_ripper' as const) : ('detective' as const) }
                : {}),
            })),
          };
        });
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
        const state = get();
        const { selectedBoardId, seats } = state;
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, reason: '尚未選擇板子' };
        }
        const result = claimSeatRoleLogic(board, seats, seatNumber, roleId);
        if (!result.ok) {
          return { ok: false, reason: result.reason };
        }
        set({
          seats: result.seats,
          undoStack: pushUndo(state, `認領 ${seatNumber} 號身分`),
        });
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
          forceContinueAfterVictory: false,
          preGameOverPhase: null,
          pendingShooters: [],
          passRevealConfirmedSeats: [],
          undoStack: [],
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
          undoStack: pushUndo(state, '記錄夜間行動'),
        }));
      },

      nextNightStep: () => {
        const state = get();
        const { selectedBoardId, round, currentStepIndex } = state;
        const board = getBoardById(selectedBoardId);
        if (!board) return;
        const steps = getNightSteps(board, round);
        if (currentStepIndex < steps.length - 1) {
          set({
            currentStepIndex: currentStepIndex + 1,
            undoStack: pushUndo(state, '切換夜間步驟'),
          });
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

        const board = getBoardById(state.selectedBoardId);
        const nightSteps = board ? getNightSteps(board, state.round) : [];
        const seerIdx = nightSteps.findIndex((s) => s.actionType === 'seer_check');
        const witchIdx = nightSteps.findIndex((s) => s.actionType === 'witch_action');
        const seerActsBeforeWitch = seerIdx !== -1 && witchIdx !== -1 && seerIdx < witchIdx;

        const result = resolveNight({
          seats: resolvedInputSeats,
          round: state.round,
          draft: state.currentNightDraft,
          ruleOverrides: state.ruleOverrides,
          boardId: state.selectedBoardId ?? undefined,
          witchAntidoteUsed: state.witchAntidoteUsed,
          witchPoisonUsed: state.witchPoisonUsed,
          lastGuardedSeat: state.lastGuardedSeat,
          mechWolfState: state.mechWolfState,
          pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
          lastCharmedSeat: state.lastCharmedSeat,
          lastDreamTarget: state.lastDreamTarget,
          lastFearedSeat: state.lastFearedSeat ?? null,
          evilKnightCounterUsed: state.evilKnightCounterUsed ?? false,
          seerActsBeforeWitch,
          hybridState: state.hybridState ?? createInitialHybridState(),
          seedWolfState: state.seedWolfState ?? createInitialSeedWolfState(),
          hiddenWolfState: state.hiddenWolfState ?? createInitialHiddenWolfState(),
          gargoyleState: state.gargoyleState ?? createInitialGargoyleState(),
          pumpkinGhostState: state.pumpkinGhostState ?? createInitialPumpkinGhostState(),
          superGravekeeperState:
            state.superGravekeeperState ?? createInitialSuperGravekeeperState(),
          foxLostAbility: state.foxLostAbility ?? false,
          exiledHistory: state.exiledHistory ?? [],
          lastAwakenedDreamTarget: state.lastAwakenedDreamTarget ?? null,
          interferenceState: state.interferenceState ?? createInitialInterferenceState(),
          combatState: state.combatState ?? createInitialCombatState(),
          conversionState: state.conversionState ?? createInitialConversionState(),
          thirdPartySpecialState:
            state.thirdPartySpecialState ?? createInitialThirdPartySpecialState(),
          finalBatchState: state.finalBatchState ?? createInitialFinalBatchState(),
        });

        const deathMap = new Map(result.deaths.map((d) => [d.seat, d.reason]));
        const pendingShooters: PendingShooter[] = result.shootEligibilities
          .filter((item) => item.canShoot)
          .map((item) => ({
            ...item,
            deathReason: deathMap.get(item.seatNumber) ?? 'wolf_kill',
          }));

        const syncedSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, result.seats);
        const resumedElection = resumeDeferredSheriffElection(syncedSheriffState, result.seats);
        const nextSheriffState = resumedElection.sheriffState;

        let nextDayHistory = state.dayHistory;
        if (resumedElection.resumed) {
          if (resumedElection.outcome === 'voting') {
            const summary = `雙爆吞警徽首爆延續：跳過警上發言，直接進入退水與警下投票（候選人：${nextSheriffState.candidates.join('、')} 號）`;
            nextDayHistory = appendDayEvent(nextDayHistory, state.round, summary, {
              type: 'sheriff_signup',
              summary,
            });
          } else if (
            resumedElection.outcome === 'elected' &&
            nextSheriffState.sheriffSeat !== null
          ) {
            const summary = `雙爆吞警徽首爆延續：僅餘 ${nextSheriffState.sheriffSeat} 號存活候選人，自動當選警長`;
            nextDayHistory = appendDayEvent(nextDayHistory, state.round, summary, {
              type: 'sheriff_elected',
              summary,
              targetSeat: nextSheriffState.sheriffSeat,
            });
          } else if (resumedElection.outcome === 'no_sheriff') {
            const summary = '雙爆吞警徽首爆延續：已無存活上警候選人，本局無警長';
            nextDayHistory = appendDayEvent(nextDayHistory, state.round, summary, {
              type: 'sheriff_no_winner',
              summary,
            });
          }
        }

        const triggerGameOver = shouldTriggerAutoVictory(
          result.victory,
          state.forceContinueAfterVictory,
        );

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
          lastFearedSeat: result.lastFearedSeat,
          evilKnightCounterUsed: result.evilKnightCounterUsed,
          hybridState: result.hybridState,
          seedWolfState: result.seedWolfState,
          hiddenWolfState: result.hiddenWolfState,
          gargoyleState: result.gargoyleState,
          pumpkinGhostState: result.pumpkinGhostState,
          superGravekeeperState: result.superGravekeeperState,
          foxLostAbility: result.foxLostAbility,
          lastAwakenedDreamTarget: result.lastAwakenedDreamTarget,
          lastMoonSpiritHowl: result.moonSpiritHowl,
          lastNineTailedFoxResult: result.nineTailedFoxResult,
          lastSeniorVillagerReveal: result.seniorVillagerReveal,
          interferenceState: result.interferenceState,
          combatState: result.combatState,
          conversionState: result.conversionState,
          thirdPartySpecialState: result.thirdPartySpecialState,
          finalBatchState: result.finalBatchState,
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
              moonSpiritHowl: result.moonSpiritHowl,
              nineTailedFoxResult: result.nineTailedFoxResult,
              seniorVillagerReveal: result.seniorVillagerReveal,
            },
          ],
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: triggerGameOver ? result.victory.winner : null,
          winReason: triggerGameOver ? result.victory.winReason : null,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'day_announcement',
          undoStack: pushUndo(state, `結束第 ${state.round} 晚`),
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
          undoStack: pushUndo(state, '警長上警報名'),
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
          undoStack: pushUndo(state, `${seatNumber} 號警上退水`),
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
          undoStack: pushUndo(state, '警長投票計票'),
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
          undoStack: pushUndo(state, `移交警徽給 ${targetSeat} 號`),
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
          undoStack: pushUndo(state, '撕毀警徽'),
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

        const synced = finalizeDayDeathSync(state, result.seats, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          pendingShooters: remainingShooters,
          dayHistory: nextDayHistory,
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase:
            triggerGameOver && (state.phase === 'day_announcement' || state.phase === 'day_vote')
              ? state.phase
              : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `${shooterSeat} 號開槍帶走 ${targetSeat} 號`),
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
          undoStack: pushUndo(state, `${shooterSeat} 號壓槍不開`),
        }));
      },

      proceedToDayVote: () => {
        set((state) => ({
          phase: state.winner ? 'game_over' : 'day_vote',
          undoStack: pushUndo(state, '進入白天討論與投票'),
        }));
      },

      setVoteInputMode: (mode) => {
        set({ voteInputMode: mode });
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
          tricksterVoteSwap: state.interferenceState?.activeTricksterVoteSwap ?? null,
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
            undoStack: pushUndo(state, '放逐投票計票（平票 PK）'),
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
            undoStack: pushUndo(state, '放逐投票計票（平安日）'),
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

        const triggerGameOver = shouldTriggerAutoVictory(
          exileResult.victory,
          state.forceContinueAfterVictory,
        );

        const pendingShooters: PendingShooter[] =
          exileResult.shootEligibility?.canShoot && !triggerGameOver
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
          winner: triggerGameOver ? exileResult.victory.winner : state.winner,
          winReason: triggerGameOver ? exileResult.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `放逐投票計票（${targetSeat} 號）`),
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

        const triggerGameOver = shouldTriggerAutoVictory(
          result.victory,
          state.forceContinueAfterVictory,
        );

        const pendingShooters: PendingShooter[] =
          result.shootEligibility?.canShoot && !triggerGameOver
            ? [{ ...result.shootEligibility, deathReason: 'exiled' }]
            : [];

        const exiledSeatObj = state.seats.find((s) => s.seatNumber === targetSeat);
        const nextExiledHistory =
          !result.idiotRevealed && !result.treasureMasterMaskedSurvived && exiledSeatObj
            ? [
                ...(state.exiledHistory ?? []),
                {
                  round: state.round,
                  seatNumber: targetSeat,
                  roleId: exiledSeatObj.roleId,
                  infectedBySeedWolf: exiledSeatObj.infectedBySeedWolf,
                },
              ]
            : (state.exiledHistory ?? []);
        const nextGargoyleState = syncGargoyleTeamStatus(
          result.seats,
          state.gargoyleState ?? createInitialGargoyleState(),
        );
        const nextPumpkinGhostState = syncPumpkinGhostInheritance(
          result.seats,
          nextGargoyleState,
          state.pumpkinGhostState ?? createInitialPumpkinGhostState(),
        );
        const nextSuperGravekeeperState = syncSuperGravekeeperInheritance(
          result.seats,
          state.superGravekeeperState ?? createInitialSuperGravekeeperState(),
        );
        const synced = finalizeDayDeathSync(state, result.seats, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const finalSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const finalTriggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          gargoyleState: nextGargoyleState,
          pumpkinGhostState: nextPumpkinGhostState,
          superGravekeeperState: nextSuperGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          exiledHistory: nextExiledHistory,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: finalSheriffState,
          exilePkCandidates: [],
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: finalTriggerGameOver ? synced.victory.winner : state.winner,
          winReason: finalTriggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: finalTriggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: finalTriggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `放逐 ${targetSeat} 號`),
        });
      },

      goodSelfExplode: (actorSeat) => {
        const state = get();
        const result = resolveGoodSelfExplode(
          state.seats,
          actorSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );
        if (!result.allowed) {
          return result;
        }

        const explodeBadge = handleSheriffElectionExplode(
          state.sheriffState,
          state.ruleOverrides.badgeSwallowRule,
        );
        const swallowedBadge = explodeBadge.swallowed;
        const deferredBadge = explodeBadge.deferred;
        const nextSheriffState = syncSheriffBadgeOnDeaths(explodeBadge.sheriffState, result.seats);

        const triggerGameOver = shouldTriggerAutoVictory(
          result.victory,
          state.forceContinueAfterVictory,
        );
        const nextRound = state.round + 1;
        const badgeNote = swallowedBadge
          ? '（警上自曝吞警徽）'
          : deferredBadge
            ? '（雙爆吞警徽首爆，隔天續選）'
            : '';
        const summary = `${actorSeat} 號翻牌自曝出局並強制進入第 ${nextRound} 晚${badgeNote}`;
        const nextDayHistory = appendDayEvent(state.dayHistory, state.round, summary, {
          type: 'good_self_explode',
          summary,
          actorSeat,
        });

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          sheriffState: nextSheriffState,
          dayHistory: nextDayHistory,
          exilePkCandidates: [],
          pendingShooters: [],
          round: triggerGameOver ? state.round : nextRound,
          currentStepIndex: 0,
          currentNightDraft: triggerGameOver
            ? state.currentNightDraft
            : createEmptyNightDraft(nextRound),
          winner: triggerGameOver ? result.victory.winner : state.winner,
          winReason: triggerGameOver ? result.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'night',
          undoStack: pushUndo(state, `${actorSeat} 號好人自曝`),
        });

        return {
          ...result,
          swallowedBadge,
          deferredBadge,
        };
      },

      reviveWithAlchemySnake: (victimSeat) => {
        const state = get();
        const curInt = state.interferenceState ?? createInitialInterferenceState();
        if (curInt.alchemySnakeUsed) {
          return { allowed: false, reason: '法老之蛇整局僅能使用一次' };
        }
        const res = resolveAlchemySnakeRevive(state.seats, victimSeat);
        if (!res.allowed) {
          return { allowed: false, reason: res.reason };
        }
        const summary = `煉金魔女發動「法老之蛇」救活 ${victimSeat} 號`;
        set({
          seats: res.seats,
          interferenceState: {
            ...curInt,
            alchemySnakeUsed: true,
            alchemySnakePendingVictimSeat: null,
          },
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: victimSeat,
          }),
          undoStack: pushUndo(state, `法老之蛇救活 ${victimSeat} 號`),
        });
        return { allowed: true };
      },

      triggerWhiteCatDelayedDeath: () => {
        const state = get();
        const res = resolveWhiteCatDelayedDeath(
          state.seats,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );
        if (res.eliminatedSeat === null) return;
        const triggerGameOver = shouldTriggerAutoVictory(
          res.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `放逐階段結束：已翻牌之白貓（${res.eliminatedSeat} 號）正式出局`;
        set({
          seats: res.seats,
          mechWolfState: res.mechWolfState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, res.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: res.eliminatedSeat,
          }),
          winner: triggerGameOver ? res.victory.winner : state.winner,
          winReason: triggerGameOver ? res.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `白貓延遲出局（${res.eliminatedSeat} 號）`),
        });
      },

      pufferfishExplode: (voterSeats) => {
        const state = get();
        const curCombat = state.combatState ?? createInitialCombatState();
        const res = resolvePufferfishExplode(
          state.seats,
          voterSeats,
          curCombat.pufferfishBombUsed,
          state.round,
          state.ruleOverrides,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `河豚翻牌炸死投票玩家：${res.killedSeats.join('、')} 號`;
        set({
          seats: synced.seats,
          combatState: { ...curCombat, pufferfishBombUsed: true },
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, '河豚翻牌炸票'),
        });
        return { allowed: true, killedSeats: res.killedSeats };
      },

      awakenedHunterShoot: (hunterSeat, direction) => {
        const state = get();
        const res = resolveAwakenedHunterDirectionShoot(
          state.seats,
          hunterSeat,
          direction,
          state.round,
          state.ruleOverrides,
        );
        if (!res.allowed) return { allowed: false };
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const dirLabel = direction === 'left' ? '左' : '右';
        const summary =
          res.killedSeat !== null
            ? `覺醒獵人（${hunterSeat} 號）向${dirLabel}開槍帶走最近狼人 ${res.killedSeat} 號`
            : `覺醒獵人（${hunterSeat} 號）向${dirLabel}開槍未命中存活狼人`;
        set({
          seats: synced.seats,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'hunter_shoot',
            summary,
            actorSeat: hunterSeat,
            targetSeat: res.killedSeat,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `覺醒獵人向${dirLabel}開槍`),
        });
        return { allowed: true, killedSeat: res.killedSeat };
      },

      triggerOldRascalDelayedDeath: () => {
        const state = get();
        const res = resolveOldRascalDelayedDeath(
          state.seats,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );
        if (res.eliminatedSeat === null) return;
        const triggerGameOver = shouldTriggerAutoVictory(
          res.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `老流氓（${res.eliminatedSeat} 號）延遲死亡正式出局`;
        set({
          seats: res.seats,
          mechWolfState: res.mechWolfState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, res.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: res.eliminatedSeat,
          }),
          winner: triggerGameOver ? res.victory.winner : state.winner,
          winReason: triggerGameOver ? res.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `老流氓延遲出局（${res.eliminatedSeat} 號）`),
        });
      },

      avengerAssassinate: (targetSeat) => {
        const state = get();
        const res = resolveAvengerAssassinate(
          state.seats,
          state.conversionState ?? createInitialConversionState(),
          targetSeat,
          state.round,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const synced = finalizeDayDeathSync(state, res.seats, {
          conversionStateOverride: res.state,
        });
        const finalVictory =
          res.instantVictory.winner !== null ? res.instantVictory : synced.victory;
        const triggerGameOver = shouldTriggerAutoVictory(
          finalVictory,
          state.forceContinueAfterVictory,
        );
        const summary =
          finalVictory.winner !== null && res.instantVictory.winner !== null
            ? res.instantVictory.winReason ?? '復仇者獨自勝利'
            : res.killedSeat !== null
              ? `復仇者出局刺殺對立陣營 ${res.killedSeat} 號`
              : `復仇者刺殺 ${targetSeat} 號（同陣營，目標存活）`;
        set({
          seats: synced.seats,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
          }),
          winner: triggerGameOver ? finalVictory.winner : state.winner,
          winReason: triggerGameOver ? finalVictory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `復仇者刺殺 ${targetSeat} 號`),
        });
        return { allowed: true, killedSeat: res.killedSeat };
      },

      pandoraDayGift: (targetSeat, item) => {
        const state = get();
        const res = applyPandoraGift(
          state.seats,
          state.thirdPartySpecialState ?? createInitialThirdPartySpecialState(),
          targetSeat,
          item,
          state.round,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const syncedState = syncBatch5LoneWolfTeamStatus(res.seats, res.state);
        const victory = checkVictory(res.seats, state.ruleOverrides, undefined, {
          conversionState: state.conversionState,
          thirdPartySpecialState: syncedState,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          victory,
          state.forceContinueAfterVictory,
        );
        const summary =
          res.poisonedSeat != null
            ? `潘朵拉白天贈送魔盒給 ${targetSeat} 號，開出毒藥立即出局`
            : `潘朵拉白天贈送魔盒給 ${targetSeat} 號`;
        set({
          seats: res.seats,
          thirdPartySpecialState: syncedState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
          }),
          winner: triggerGameOver ? victory.winner : state.winner,
          winReason: triggerGameOver ? victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `潘朵拉贈送魔盒給 ${targetSeat} 號`),
        });
        return { allowed: true, poisonedSeat: res.poisonedSeat };
      },

      usePandoraHopeLight: (actorSeat) => {
        const state = get();
        const res = resolvePandoraHopeLight(
          state.seats,
          state.thirdPartySpecialState ?? createInitialThirdPartySpecialState(),
          actorSeat,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const victory = checkVictory(state.seats, state.ruleOverrides, undefined, {
          conversionState: state.conversionState,
          thirdPartySpecialState: res.state,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          victory,
          state.forceContinueAfterVictory,
        );
        const summary = res.triggeredWinner
          ? `${actorSeat} 號使用潘朵拉「希望之光」觸發勝利！`
          : `${actorSeat} 號使用潘朵拉「希望之光」（未達最後一人條件，未觸發勝利）`;
        set({
          thirdPartySpecialState: res.state,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            actorSeat,
          }),
          winner: triggerGameOver ? victory.winner : state.winner,
          winReason: triggerGameOver ? victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `${actorSeat} 號使用希望之光`),
        });
        return { allowed: true, triggeredWinner: res.triggeredWinner };
      },

      triggerNineTailsHunt: () => {
        const state = get();
        const tpState = state.thirdPartySpecialState ?? createInitialThirdPartySpecialState();
        const res = resolveNineTailsHunt(state.seats, tpState, state.round);
        if (!res.success) {
          return { success: false, eliminatedSeats: [] };
        }
        const syncedState = syncBatch5LoneWolfTeamStatus(res.seats, tpState);
        const victory = checkVictory(res.seats, state.ruleOverrides, undefined, {
          conversionState: state.conversionState,
          thirdPartySpecialState: syncedState,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          victory,
          state.forceContinueAfterVictory,
        );
        const summary = `九尾發動「獵殺時刻」成功（A=${res.groupACount} > B=${res.groupBCount}），B 方 ${res.eliminatedSeats.join('、')} 號全員出局並立刻入夜！`;
        set({
          seats: res.seats,
          thirdPartySpecialState: syncedState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
          }),
          winner: triggerGameOver ? victory.winner : state.winner,
          winReason: triggerGameOver ? victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'night',
          round: triggerGameOver ? state.round : state.round + 1,
          currentStepIndex: triggerGameOver ? state.currentStepIndex : 0,
          currentNightDraft: triggerGameOver
            ? state.currentNightDraft
            : createEmptyNightDraft(state.round + 1),
          undoStack: pushUndo(state, '九尾獵殺時刻成功'),
        });
        return { success: true, eliminatedSeats: res.eliminatedSeats };
      },

      setBaiZeHeir: (heirSeat) => {
        const state = get();
        const res = resolveBaiZeInherit(
          state.seats,
          state.thirdPartySpecialState ?? createInitialThirdPartySpecialState(),
          heirSeat,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const summary =
          res.heirType === 'villager'
            ? `白澤指定 ${heirSeat} 號為繼承人（平民轉為神／民雙陣營）`
            : res.heirType === 'god'
              ? `白澤指定 ${heirSeat} 號為繼承人（神職夜死延遲至下一放逐結束後生效）`
              : `白澤指定 ${heirSeat} 號為繼承人（狼人陣營，無事發生）`;
        set({
          seats: res.seats,
          thirdPartySpecialState: res.state,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: heirSeat,
          }),
          undoStack: pushUndo(state, `白澤指定繼承人 ${heirSeat} 號`),
        });
        return { allowed: true };
      },

      triggerSequencePrinceRevote: () => {
        const state = get();
        const res = resolveSequencePrinceRevote(
          state.seats,
          state.finalBatchState ?? createInitialFinalBatchState(),
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const summary = '定序王子翻牌發動技能：全員再發言一次並重新進行放逐投票！';
        set({
          finalBatchState: res.state,
          exilePkCandidates: [],
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
          }),
          undoStack: pushUndo(state, '定序王子翻牌重新投票'),
        });
        return { allowed: true };
      },

      resolveContrarianVote: (targetSeat, majorityPassed) => {
        const state = get();
        const res = resolveContrarianDebate(
          state.seats,
          state.finalBatchState ?? createInitialFinalBatchState(),
          targetSeat,
          majorityPassed,
          state.sheriffState.sheriffSeat,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const summary = majorityPassed
          ? `槓精對 ${targetSeat} 號開槓投票過半：${targetSeat} 號中止發言並失去本輪投票權${res.newSheriffSeat !== state.sheriffState.sheriffSeat ? '，警徽移交給槓精' : ''}`
          : `槓精對 ${targetSeat} 號開槓未過半：槓精失去本輪投票權`;
        set({
          finalBatchState: res.state,
          sheriffState:
            res.newSheriffSeat !== state.sheriffState.sheriffSeat
              ? { ...state.sheriffState, sheriffSeat: res.newSheriffSeat, badgeStatus: 'active' }
              : state.sheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
          }),
          undoStack: pushUndo(state, `槓精開槓（${targetSeat} 號）`),
        });
        return { allowed: true, silencedVoterSeat: res.silencedVoterSeat };
      },

      triggerDetectiveReveal: () => {
        const state = get();
        const res = resolveDetectiveReveal(
          state.seats,
          state.finalBatchState ?? createInitialFinalBatchState(),
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const summary = `偵探（${res.detectiveSeat} 號）主動翻牌搶奪警徽！今日全體狼人無法自爆。`;
        set({
          finalBatchState: res.state,
          sheriffState: {
            ...state.sheriffState,
            status: 'elected',
            sheriffSeat: res.detectiveSeat,
            badgeStatus: 'active',
          },
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            actorSeat: res.detectiveSeat,
          }),
          undoStack: pushUndo(state, '偵探翻牌搶奪警徽'),
        });
        return { allowed: true };
      },

      detectiveExecutePlayer: (targetSeat) => {
        const state = get();
        const res = resolveDetectiveExecute(
          state.seats,
          state.finalBatchState ?? createInitialFinalBatchState(),
          targetSeat,
          state.round,
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = res.targetSurvivedInvincible
          ? `偵探處決 ${targetSeat} 號，但目標處於怪盜狼王無敵狀態免死！（警犬今晚激活）`
          : `偵探處決 ${targetSeat} 號出局（警犬今晚激活${res.targetWasWolf ? '查驗' : '撕咬'}技能）`;
        set({
          seats: synced.seats,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          finalBatchState: res.state,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `偵探處決 ${targetSeat} 號`),
        });
        return { allowed: true, targetWasWolf: res.targetWasWolf };
      },

      triggerWhiteNightRewind: () => {
        const state = get();
        const fbState = state.finalBatchState ?? createInitialFinalBatchState();
        const check = canWhiteNightEnvoyRewind(state.seats, fbState, state.round);
        if (!check.allowed) return { allowed: false, reason: check.reason };
        // 從 undoStack 中尋找最近一次夜間結算前的快照（或還原前一晚死者並重回上一晚）
        const nightSnapIdx = [...state.undoStack]
          .reverse()
          .findIndex((entry) => entry.label.includes('夜晚') || entry.label.includes('結算'));
        if (nightSnapIdx !== -1) {
          const targetEntry = state.undoStack[state.undoStack.length - 1 - nightSnapIdx];
          const snap = targetEntry.data;
          set({
            ...snap,
            phase: 'night',
            currentStepIndex: 0,
            currentNightDraft: createEmptyNightDraft(snap.round),
            finalBatchState: {
              ...(snap.finalBatchState ?? createInitialFinalBatchState()),
              whiteNightEnvoyUsed: true,
            },
            undoStack: pushUndo(state, '白夜使者時間回溯重跑上一晚'),
          });
          return { allowed: true };
        }
        // 若無快照則直接復活當晚出局者並回到當晚第 0 步
        const restoredSeats = state.seats.map((s) =>
          !s.isAlive && s.deathRound === state.round
            ? { ...s, isAlive: true, deathReason: undefined, deathRound: undefined }
            : s,
        );
        set({
          seats: restoredSeats,
          phase: 'night',
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(state.round),
          finalBatchState: { ...fbState, whiteNightEnvoyUsed: true },
          undoStack: pushUndo(state, '白夜使者時間回溯重跑上一晚'),
        });
        return { allowed: true };
      },

      selfExplode: (wolfSeat) => {
        const state = get();
        const result = resolveSelfExplode(state.seats, wolfSeat, state.finalBatchState);
        if (!result.allowed) {
          return { allowed: false, reason: result.reason };
        }

        const explodeBadge = handleSheriffElectionExplode(
          state.sheriffState,
          state.ruleOverrides.badgeSwallowRule,
        );
        const swallowedBadge = explodeBadge.swallowed;
        const deferredBadge = explodeBadge.deferred;
        const nextSheriffState = explodeBadge.sheriffState;

        const nextRound = state.round + 1;
        const explodingPlayer = state.seats.find((s) => s.seatNumber === wolfSeat);
        const isBloodMoonExplode = explodingPlayer?.roleId === 'blood_moon_apostle';
        const curCombat = state.combatState ?? createInitialCombatState();
        const nextCombatState = isBloodMoonExplode
          ? { ...curCombat, bloodMoonSealActiveTonight: true }
          : curCombat;
        const explodeSummary = isBloodMoonExplode
          ? `${wolfSeat} 號（血月使徒）自爆，封印今晚所有好人技能並強制進入第 ${nextRound} 晚`
          : `${wolfSeat} 號狼人自爆，強制進入第 ${nextRound} 晚（當晚點刀後正式死亡）`;
        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, explodeSummary, {
          type: 'self_explode',
          summary: explodeSummary,
          actorSeat: wolfSeat,
        });

        if (swallowedBadge) {
          const swallowSummary =
            state.ruleOverrides.badgeSwallowRule === 'double_explode'
              ? '警上階段發生第二次狼人自爆，正式吞警徽（本局無警長）'
              : '警上階段發生狼人自爆，吞警徽（本局無警長）';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, swallowSummary, {
            type: 'sheriff_swallowed',
            summary: swallowSummary,
            actorSeat: wolfSeat,
          });
        } else if (deferredBadge) {
          const deferSummary =
            '雙爆吞警徽：警上首次狼人自爆入夜，隔天天亮將跳過警上發言直接進入退水與警下投票';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, deferSummary, {
            type: 'sheriff_deferred_explode',
            summary: deferSummary,
            actorSeat: wolfSeat,
          });
        }

        set({
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          combatState: nextCombatState,
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
          undoStack: pushUndo(state, `${wolfSeat} 號狼人自爆`),
        });

        return { allowed: true, swallowedBadge, deferredBadge };
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
          return { ...result, swallowedBadge: false, deferredBadge: false };
        }

        const explodeBadge = handleSheriffElectionExplode(
          state.sheriffState,
          state.ruleOverrides.badgeSwallowRule,
        );
        const swallowedBadge = explodeBadge.swallowed;
        const deferredBadge = explodeBadge.deferred;
        const synced = finalizeDayDeathSync(state, result.seats, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const nextSheriffState = syncSheriffBadgeOnDeaths(explodeBadge.sheriffState, synced.seats);

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
          const swallowSummary =
            state.ruleOverrides.badgeSwallowRule === 'double_explode'
              ? '警上階段白狼王觸發第二次自爆，正式吞警徽（本局無警長）'
              : '警上階段白狼王自爆，吞警徽（本局無警長）';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, swallowSummary, {
            type: 'sheriff_swallowed',
            summary: swallowSummary,
            actorSeat: wolfSeat,
          });
        } else if (deferredBadge) {
          const deferSummary =
            '雙爆吞警徽：警上首次白狼王自爆入夜，隔天天亮將跳過警上發言直接進入退水與警下投票';
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, deferSummary, {
            type: 'sheriff_deferred_explode',
            summary: deferSummary,
            actorSeat: wolfSeat,
          });
        }

        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );

        if (triggerGameOver) {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            winner: synced.victory.winner,
            winReason: synced.victory.winReason,
            preGameOverPhase: 'day_vote',
            phase: 'game_over',
            undoStack: pushUndo(state, `${wolfSeat} 號白狼王自爆`),
          });
        } else {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
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
            undoStack: pushUndo(state, `${wolfSeat} 號白狼王自爆`),
          });
        }

        return { ...result, swallowedBadge, deferredBadge };
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

        const synced = finalizeDayDeathSync(state, result.seats);
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const killedWolfBeauty =
          result.targetWasWolf &&
          state.seats.find((s) => s.seatNumber === targetSeat)?.roleId === 'wolf_beauty';

        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );

        if (triggerGameOver) {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            knightDuelUsed: true,
            activeCharmedSeat: killedWolfBeauty ? null : state.activeCharmedSeat,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            winner: synced.victory.winner,
            winReason: synced.victory.winReason,
            preGameOverPhase: 'day_vote',
            phase: 'game_over',
            undoStack: pushUndo(state, `騎士決鬥 ${targetSeat} 號`),
          });
        } else if (result.enterNightImmediately) {
          const nextRound = state.round + 1;
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
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
            undoStack: pushUndo(state, `騎士決鬥 ${targetSeat} 號`),
          });
        } else {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            knightDuelUsed: true,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            undoStack: pushUndo(state, `騎士決鬥 ${targetSeat} 號`),
          });
        }

        return result;
      },

      detectiveCollectiveAccuse: (accusedSeat, agreeCount) => {
        const state = get();
        const res = resolveDetectiveCollectiveAccusation(
          state.seats,
          state.conversionState ?? createInitialConversionState(),
          accusedSeat,
          agreeCount,
        );
        if (!res.allowed) {
          return { allowed: false, reason: res.reason };
        }
        const summary = res.success
          ? `已出局偵探集結（${agreeCount}/${res.deadDetectiveCount} 人同意）指證 ${accusedSeat} 號為開膛手傑克成功！第三方陣營失敗。`
          : `已出局偵探集結（${agreeCount}/${res.deadDetectiveCount} 人同意）指證 ${accusedSeat} 號失敗（目標並非開膛手傑克）。`;
        set({
          conversionState: res.state,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: accusedSeat,
          }),
          undoStack: pushUndo(state, `偵探集結指證 ${accusedSeat} 號`),
        });
        return { allowed: true, success: res.success };
      },

      usePandoraDayGun: (actorSeat, targetSeat) => {
        const state = get();
        const curTp = state.thirdPartySpecialState ?? createInitialThirdPartySpecialState();
        const entryIdx = curTp.pandoraGiftHistory.findIndex(
          (g) => g.seat === actorSeat && g.item === 'day_gun' && !g.used,
        );
        if (entryIdx < 0) {
          return { allowed: false, reason: '該玩家未持有未使用的潘朵拉白天手槍' };
        }
        const actor = state.seats.find((s) => s.seatNumber === actorSeat && s.isAlive);
        if (!actor) {
          return { allowed: false, reason: '持槍玩家已出局' };
        }
        if (actorSeat === targetSeat) {
          return { allowed: false, reason: '不可對自己開槍' };
        }
        const target = state.seats.find((s) => s.seatNumber === targetSeat && s.isAlive);
        if (!target) {
          return { allowed: false, reason: '目標玩家不存在或已出局' };
        }
        const nextTp = cloneThirdPartySpecialState(curTp);
        nextTp.pandoraGiftHistory[entryIdx].used = true;
        const seatsAfter = state.seats.map((s) =>
          s.seatNumber === targetSeat
            ? { ...s, isAlive: false, deathReason: 'pandora_day_gun' as const, deathRound: state.round }
            : s,
        );
        const synced = finalizeDayDeathSync(state, seatsAfter, {
          thirdPartySpecialStateOverride: nextTp,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `${actorSeat} 號使用潘朵拉魔盒「白天手槍」擊殺 ${targetSeat} 號出局`;
        set({
          seats: synced.seats,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'hunter_shoot',
            summary,
            actorSeat,
            targetSeat,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `${actorSeat} 號使用潘朵拉白天手槍`),
        });
        return { allowed: true };
      },

      wolfGirlExplode: (wolfGirlSeat, options) => {
        const state = get();
        const curWolfGirl = state.wolfGirlState ?? createInitialWolfGirlState();
        const res = resolveWolfGirlExplode(
          state.seats,
          wolfGirlSeat,
          curWolfGirl,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          options,
        );
        if (!res.allowed) {
          return { allowed: false, reason: res.reason };
        }
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary =
          res.breakupDeathSeat !== null
            ? `${wolfGirlSeat} 號（狼女孩）白天自爆分手，帶走伴侶 ${res.breakupDeathSeat} 號並進入黑夜`
            : `${wolfGirlSeat} 號（狼女孩）白天自爆，強制進入黑夜`;
        const nextRound = state.round + 1;
        set({
          seats: synced.seats,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          pendingSelfExplodeSeat: res.pendingSelfExplodeSeat,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'self_explode',
            summary,
            actorSeat: wolfGirlSeat,
            targetSeat: res.breakupDeathSeat,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'night',
          ...(triggerGameOver
            ? {}
            : {
                round: nextRound,
                currentStepIndex: 0,
                currentNightDraft: createEmptyNightDraft(nextRound),
                speakingQueue: [],
                currentSpeakerIndex: 0,
                speakingMeta: null,
                remainingSeconds: state.defaultSpeakDurationSec,
                exilePkCandidates: [],
                pendingShooters: [],
              }),
          undoStack: pushUndo(state, `${wolfGirlSeat} 號狼女孩自爆`),
        });
        return { allowed: true, breakupDeathSeat: res.breakupDeathSeat };
      },

      triggerMaskedVillagerDelayedDeath: (seatNumber) => {
        const state = get();
        const res = resolveMaskedVillagerDelayedDeath(
          state.seats,
          seatNumber,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.treasureMasterState,
        );
        if (!res.allowed) {
          return { allowed: false, reason: res.reason };
        }
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `蒙面平民（${seatNumber} 號）延遲死亡正式出局`;
        set({
          seats: synced.seats,
          mechWolfState: res.mechWolfState,
          treasureMasterState: res.treasureMasterState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: seatNumber,
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
          undoStack: pushUndo(state, `蒙面平民延遲出局（${seatNumber} 號）`),
        });
        return { allowed: true };
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
          undoStack: pushUndo(state, `進入第 ${nextRound} 晚`),
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
          state.treasureMasterState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            boardId: state.selectedBoardId ?? undefined,
          },
        );
        const eventText = result.becameAlive
          ? `法官手動調整：${seatNumber} 號恢復為存活狀態`
          : `法官手動標記：${seatNumber} 號出局`;

        const synced = result.becameAlive
          ? {
              seats: result.seats,
              conversionState: state.conversionState ?? createInitialConversionState(),
              thirdPartySpecialState:
                state.thirdPartySpecialState ?? createInitialThirdPartySpecialState(),
            }
          : finalizeDayDeathSync(state, result.seats);
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: nextSheriffState,
          pendingShooters: result.becameAlive
            ? state.pendingShooters
            : state.pendingShooters.filter((s) => s.seatNumber !== seatNumber),
          dayHistory: appendDayEvent(state.dayHistory, state.round, eventText, {
            type: 'manual_judge',
            summary: eventText,
            targetSeat: seatNumber,
          }),
          undoStack: pushUndo(state, `手動調整 ${seatNumber} 號存活狀態`),
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
          preGameOverPhase:
            state.phase === 'day_announcement' || state.phase === 'day_vote'
              ? state.phase
              : state.preGameOverPhase,
          phase: 'game_over',
          undoStack: pushUndo(state, '宣告勝負'),
        });
      },

      overrideVictory: (kind, customReason) => {
        const result = createManualVictoryResult(kind, customReason);
        if (!result.winner) return;
        get().declareWinner(result.winner, result.winReason ?? '法官手動宣告勝負');
      },

      forceContinueGame: () => {
        const state = get();
        const resumePhase = state.preGameOverPhase ?? 'day_vote';
        const summary = '法官手動覆蓋：解除勝負結束鎖定，強制繼續對局';
        set({
          forceContinueAfterVictory: true,
          winner: null,
          winReason: null,
          phase: resumePhase,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'victory_override_continue',
            summary,
          }),
          undoStack: pushUndo(state, '強制繼續對局'),
        });
      },

      setNotebookMode: (mode) => {
        set((state) => ({
          notebook: {
            ...state.notebook,
            mode,
          },
        }));
      },

      setNotebookFreeformText: (text) => {
        set((state) => ({
          notebook: {
            ...state.notebook,
            freeformText: text,
          },
        }));
      },

      setNotebookGridCell: (stageKey, seatNumber, value) => {
        set((state) => ({
          notebook: setNotebookGridCellLogic(state.notebook, stageKey, seatNumber, value),
        }));
      },

      clearNotebook: (scope = 'all') => {
        set((state) => {
          if (scope === 'freeform') {
            return {
              notebook: {
                ...state.notebook,
                freeformText: '',
              },
            };
          }
          if (scope === 'grid') {
            return {
              notebook: {
                ...state.notebook,
                gridCells: {},
              },
            };
          }
          return {
            notebook: createInitialNotebookState(state.notebook.mode),
          };
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
            onlineJudgeSettings: { ...state.onlineJudgeSettings },
            ambientAudio: { ...state.ambientAudio },
            ruleOverrides: { ...state.ruleOverrides },
            voteInputMode: state.voteInputMode,
            notebook: createInitialNotebookState(state.notebook.mode),
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

      dissolveRoom: () => {
        set({
          ...createInitialGameState(),
          activeView: 'home',
        });
      },
    }),
    {
      name: GAME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { undoStack: _undoStack, ...persisted } = state;
        return persisted;
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<GameStore>;
        return {
          ...currentState,
          ...persisted,
          undoStack: [],
          hostMode: {
            ...DEFAULT_HOST_MODE,
            ...(persisted.hostMode ?? {}),
          },
          onlineJudgeSettings: clampOnlineJudgeSettings(
            DEFAULT_ONLINE_JUDGE_SETTINGS,
            persisted.onlineJudgeSettings ?? {},
          ),
          ambientAudio: {
            ...DEFAULT_AMBIENT_AUDIO_SETTINGS,
            ...(persisted.ambientAudio ?? {}),
          },
          ruleOverrides: {
            ...DEFAULT_RULE_OVERRIDES,
            ...(persisted.ruleOverrides ?? {}),
          },
          sheriffState: {
            ...createInitialSheriffState(),
            ...(persisted.sheriffState ?? {}),
          },
          notebook: {
            ...createInitialNotebookState(),
            ...(persisted.notebook ?? {}),
            gridCells: persisted.notebook?.gridCells ?? {},
          },
          voteInputMode: persisted.voteInputMode ?? 'by_voter',
          forceContinueAfterVictory: persisted.forceContinueAfterVictory ?? false,
          preGameOverPhase: persisted.preGameOverPhase ?? null,
          passRevealConfirmedSeats: persisted.passRevealConfirmedSeats ?? [],
        };
      },
    },
  ),
);
