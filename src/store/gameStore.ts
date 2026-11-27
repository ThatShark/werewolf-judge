import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_AMBIENT_AUDIO_SETTINGS,
  DEFAULT_HOST_MODE,
  DEFAULT_ONLINE_JUDGE_SETTINGS,
  DEFAULT_RULE_OVERRIDES,
  DEFAULT_SPEAK_DURATION_SEC,
  SHERIFF_SPEAK_DURATION_SEC,
  addNineTailsMark,
  advanceSheriffPkToVoting as advanceSheriffPkToVotingLogic,
  advanceSheriffToVoting as advanceSheriffToVotingLogic,
  applyPandoraGift,
  canWhiteNightEnvoyRewind,
  checkCanShoot,
  checkVictory,
  claimSeatRole as claimSeatRoleLogic,
  clampOnlineJudgeSettings,
  cloneLuckyFirstNightSkills,
  cloneThirdPartySpecialState,
  createEmptyNightDraft,
  createInitialCombatState,
  createInitialConversionState,
  createInitialFinalBatchState,
  createInitialThirdPartySpecialState,
  createInitialTreasureMasterState,
  createInitialGargoyleState,
  createInitialHiddenWolfState,
  createInitialHybridState,
  createInitialInterferenceState,
  createInitialMechWolfState,
  createInitialPumpkinGhostState,
  createInitialSeats,
  createInitialSeedWolfState,
  createInitialSheriffState,
  createInitialSuperGravekeeperState,
  createInitialWolfGirlState,
  createManualVictoryResult,
  dealBoardRolesWithBottomCards,
  destroySheriffBadge as destroySheriffBadgeLogic,
  finalizePhysicalDealVillagers,
  formatChineseDay,
  generateSpeakingOrder as generateSpeakingOrderLogic,
  getDefaultRuleOverridesForBoard,
  getExilePkSpeakingOrder,
  getNightSteps,
  getSeatEffectiveFaction,
  getSheriffPkSpeakingOrder,
  handleSheriffElectionExplode,
  isFirstNightNoWolfKillBoard,
  isSeatEffectiveWolf,
  isSheriffElectionActive,
  isValidPlayerCountForBoard,
  mergeRuleOverrides,
  normalizePlayerSeats,
  pickRandomDirection,
  resolveAlchemySnakeRevive,
  resolveAvengerAssassinate,
  resolveAwakenedHunterDirectionShoot,
  resolveBaiZeDelayedDeath,
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
  setSheriffInitialSpeakingOrder,
  shouldEndNightEarly,
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
  DayStage,
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
  OnlineJudgeSettings,
  RuleOverrides,
  SheriffState,
  ShootEligibility,
  SpeakingOrderOptions,
  SpeakingOrderResult,
  VictoryResult,
  VoteInputMode,
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

export type GameSnapshotData = Pick<
  GameState,
  | 'phase'
  | 'dayStage'
  | 'round'
  | 'seats'
  | 'passRevealConfirmedSeats'
  | 'currentStepIndex'
  | 'currentNightDraft'
  | 'witchAntidoteUsed'
  | 'witchPoisonUsed'
  | 'poisonerPoisonUsed'
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
  | 'treasureMasterState'
  | 'wolfGirlState'
  | 'thiefBottomCards'
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
  | 'exilePkStage'
  | 'exilePkSpeakingOrder'
  | 'pendingNightAnnouncement'
  | 'exileResolvedToday'
  | 'nightHistory'
  | 'dayHistory'
  | 'winner'
  | 'winReason'
  | 'forceContinueAfterVictory'
  | 'preGameOverPhase'
> & {
  pendingShooters: PendingShooter[];
};

export interface GameStore extends GameState {
  activeView: AppView;
  pendingShooters: PendingShooter[];
  /** 若白狼王自爆帶走可開槍角色，待所有連鎖開槍結算後自動進入黑夜 */
  enterNightAfterPendingShooters: boolean;

  setActiveView: (view: AppView) => void;

  goToHostSetup: () => void;
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
  checkEarlyNightVictory: () => boolean;
  finishNight: () => void;

  /** 自動發言順序與單人倒數計時 */
  setDefaultSpeakDuration: (seconds: number) => void;
  generateSpeakingOrder: (options: SpeakingOrderOptions) => SpeakingOrderResult;
  nextSpeaker: () => void;
  prevSpeaker: () => void;
  adjustSpeakerTime: (deltaSeconds: number) => void;
  tickSpeakerTimer: () => void;
  resetSpeakingOrder: () => void;

  /** 警長競選與警徽交接 */
  startSheriffElection: (candidateSeats: number[]) => void;
  advanceSheriffToVoting: () => void;
  advanceSheriffPkToVoting: () => void;
  withdrawSheriffCandidate: (seatNumber: number) => void;
  submitSheriffVotes: (votes: Record<number, number | null>) => SheriffVoteResolution;
  transferSheriffBadge: (targetSeat: number) => void;
  destroySheriffBadge: () => void;

  /** 天亮開槍與白天四階段嚴格推進 */
  triggerShoot: (shooterSeat: number, targetSeat: number) => void;
  skipShoot: (shooterSeat: number) => void;
  proceedToDeathAnnouncement: () => void;
  proceedToDaySpeaking: () => void;
  proceedToDayVote: () => void;

  /** 白天放逐投票明細與突發技能 */
  setVoteInputMode: (mode: VoteInputMode) => void;
  advanceExilePkToVoting: () => void;
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
  /** 第 5 批：潘朵拉白天贈盒／希望之光／九尾獵殺時刻／白澤繼承人／白澤延遲出局 */
  pandoraDayGift: (
    targetSeat: number,
    item: PandoraBoxItem,
  ) => { allowed: boolean; reason?: string; poisonedSeat?: number | null };
  usePandoraHopeLight: (
    actorSeat: number,
  ) => { allowed: boolean; reason?: string; triggeredWinner?: string | null };
  triggerNineTailsHunt: () => { success: boolean; eliminatedSeats: number[] };
  setBaiZeHeir: (heirSeat: number) => { allowed: boolean; reason?: string };
  triggerBaiZeDelayedDeath: () => void;
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
  const prevAliveSeats = new Set(state.seats.filter((s) => s.isAlive).map((s) => s.seatNumber));
  const noGunWolfDied = convSync.seats.some((s) => {
    if (s.isAlive || !prevAliveSeats.has(s.seatNumber)) return false;
    const isWolf = isSeatEffectiveWolf(s, {
      conversionState: convSync.state,
      thirdPartySpecialState: nextThirdPartySpecialState,
    });
    if (!isWolf) return false;
    const hasGunRole =
      s.roleId === 'wolf_king' ||
      s.roleId === 'white_wolf_king' ||
      s.roleId === 'awakened_wolf_king';
    const hasEvilGun = nextThirdPartySpecialState.evilMerchantGunHolderSeat === s.seatNumber;
    return !hasGunRole && !hasEvilGun;
  });
  if (noGunWolfDied) {
    nextThirdPartySpecialState.evilMerchantLastDayNoGunWolfDied = true;
  }

  const nextGargoyleState = syncGargoyleTeamStatus(
    convSync.seats,
    state.gargoyleState ?? createInitialGargoyleState(),
  );
  const nextPumpkinGhostState = syncPumpkinGhostInheritance(
    convSync.seats,
    nextGargoyleState,
    state.pumpkinGhostState ?? createInitialPumpkinGhostState(),
  );
  const nextSuperGravekeeperState = syncSuperGravekeeperInheritance(
    convSync.seats,
    state.superGravekeeperState ?? createInitialSuperGravekeeperState(),
  );
  const effectiveRules = options.wolfKillPriorityOverride
    ? { ...state.ruleOverrides, wolfKillPriority: true }
    : state.ruleOverrides;
  const victory = checkVictory(convSync.seats, effectiveRules, state.treasureMasterState, {
    conversionState: convSync.state,
    thirdPartySpecialState: nextThirdPartySpecialState,
    wolfGirlState: state.wolfGirlState,
    boardId: state.selectedBoardId ?? undefined,
  });
  return {
    seats: convSync.seats,
    conversionState: convSync.state,
    thirdPartySpecialState: nextThirdPartySpecialState,
    gargoyleState: nextGargoyleState,
    pumpkinGhostState: nextPumpkinGhostState,
    superGravekeeperState: nextSuperGravekeeperState,
    linkedDeaths: convSync.linkedDeaths,
    victory,
  };
}

/**
 * 白天「綁票」自動判狼勝檢查輔助：
 * 僅在白天且無未決開槍者、無未決警徽移交、且非警長競選進行中時觸發檢查。
 */
function evaluateDayTieLockVictory(params: {
  baseVictory: VictoryResult;
  seats: GameState['seats'];
  ruleOverrides: RuleOverrides;
  treasureMasterState?: GameState['treasureMasterState'];
  conversionState?: GameState['conversionState'];
  thirdPartySpecialState?: GameState['thirdPartySpecialState'];
  wolfGirlState?: GameState['wolfGirlState'];
  combatState?: GameState['combatState'];
  sheriffState: SheriffState;
  pendingShootersCount: number;
  selectedBoardId?: string | null;
}): VictoryResult {
  if (params.baseVictory.winner !== null) return params.baseVictory;
  if (params.pendingShootersCount > 0) return params.baseVictory;
  if (params.sheriffState.pendingBadgeTransferFrom !== null) return params.baseVictory;
  if (isSheriffElectionActive(params.sheriffState)) return params.baseVictory;
  return checkVictory(params.seats, params.ruleOverrides, params.treasureMasterState, {
    conversionState: params.conversionState,
    thirdPartySpecialState: params.thirdPartySpecialState,
    wolfGirlState: params.wolfGirlState,
    boardId: params.selectedBoardId ?? undefined,
    checkDayVoteTieLock: true,
    sheriffState: params.sheriffState,
    combatState: params.combatState,
  });
}

function createInitialGameState(): GameState & {
  activeView: AppView;
  pendingShooters: PendingShooter[];
  enterNightAfterPendingShooters: boolean;
} {
  return {
    activeView: 'home',
    phase: 'host_setup',
    dayStage: 'death_announcement',
    round: 1,
    selectedBoardId: null,
    hostMode: { ...DEFAULT_HOST_MODE },
    onlineJudgeSettings: { ...DEFAULT_ONLINE_JUDGE_SETTINGS },
    ambientAudio: { ...DEFAULT_AMBIENT_AUDIO_SETTINGS },
    ruleOverrides: {
      ...DEFAULT_RULE_OVERRIDES,
      luckyFirstNightSkills: cloneLuckyFirstNightSkills(),
    },
    seats: [],
    passRevealConfirmedSeats: [],
    savedNicknames: {},
    currentStepIndex: 0,
    currentNightDraft: createEmptyNightDraft(1),
    witchAntidoteUsed: false,
    witchPoisonUsed: false,
    poisonerPoisonUsed: false,
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
    treasureMasterState: createInitialTreasureMasterState(),
    wolfGirlState: createInitialWolfGirlState(),
    thiefBottomCards: [],
    nightStartSnapshot: null,
    preExileSnapshot: null,
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
    dailyRandomDirection: 'clockwise',
    speakingQueue: [],
    currentSpeakerIndex: 0,
    speakingMeta: null,
    defaultSpeakDurationSec: DEFAULT_SPEAK_DURATION_SEC,
    remainingSeconds: DEFAULT_SPEAK_DURATION_SEC,
    sheriffState: createInitialSheriffState(),
    exilePkCandidates: [],
    exilePkStage: 'none',
    exilePkSpeakingOrder: [],
    pendingNightAnnouncement: null,
    exileResolvedToday: null,
    voteInputMode: 'by_voter',
    nightHistory: [],
    dayHistory: [],
    winner: null,
    winReason: null,
    forceContinueAfterVictory: false,
    preGameOverPhase: null,
    pendingShooters: [],
    enterNightAfterPendingShooters: false,
  };
}

function hasWhiteNightEnvoy(state: Pick<GameStore, 'selectedBoardId' | 'seats'>): boolean {
  if (state.seats.some((s) => s.roleId === 'white_night_envoy')) return true;
  const board = getBoardById(state.selectedBoardId);
  if (!board) return false;
  return [
    ...board.composition.wolf,
    ...board.composition.good,
    ...(board.composition.thirdParty ?? []),
  ].some((slot) => slot.roleId === 'white_night_envoy');
}

function captureGameSnapshot(state: GameStore): GameSnapshotData {
  const raw: GameSnapshotData = {
    phase: state.phase,
    dayStage: state.dayStage,
    round: state.round,
    seats: state.seats,
    passRevealConfirmedSeats: state.passRevealConfirmedSeats,
    currentStepIndex: state.currentStepIndex,
    currentNightDraft: state.currentNightDraft,
    witchAntidoteUsed: state.witchAntidoteUsed,
    witchPoisonUsed: state.witchPoisonUsed,
    poisonerPoisonUsed: state.poisonerPoisonUsed ?? false,
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
    treasureMasterState: state.treasureMasterState ?? createInitialTreasureMasterState(),
    wolfGirlState: state.wolfGirlState ?? createInitialWolfGirlState(),
    thiefBottomCards: state.thiefBottomCards ?? [],
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
    exilePkStage: state.exilePkStage ?? 'none',
    exilePkSpeakingOrder: state.exilePkSpeakingOrder ?? [],
    pendingNightAnnouncement: state.pendingNightAnnouncement ?? null,
    exileResolvedToday: state.exileResolvedToday ?? null,
    nightHistory: state.nightHistory,
    dayHistory: state.dayHistory,
    winner: state.winner,
    winReason: state.winReason,
    forceContinueAfterVictory: state.forceContinueAfterVictory,
    preGameOverPhase: state.preGameOverPhase,
    pendingShooters: state.pendingShooters,
  };
  return JSON.parse(JSON.stringify(raw)) as GameSnapshotData;
}

function mergePendingNightDeaths(
  seats: GameState['seats'],
  pending: GameState['pendingNightAnnouncement'],
): GameState['seats'] {
  if (!pending) return seats;
  const deadBySeat = new Map(
    pending.seats.filter((s) => !s.isAlive).map((s) => [s.seatNumber, s]),
  );
  if (deadBySeat.size === 0) return seats;
  return seats.map((seat) => {
    if (!seat.isAlive) return seat;
    const deferredDead = deadBySeat.get(seat.seatNumber);
    if (!deferredDead) return seat;
    return {
      ...seat,
      isAlive: false,
      deathReason: deferredDead.deathReason,
      deathRound: deferredDead.deathRound,
    };
  });
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

      goToHostSetup: () => {
        set({ phase: 'host_setup' });
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
          ruleOverrides: mergeRuleOverrides(state.ruleOverrides, partial),
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
        });
        return { ok: true };
      },

      dealOnlineRoles: (rng) => {
        const state = get();
        const { selectedBoardId, seats } = state;
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, errors: ['尚未選擇板子'] };
        }
        const dealt = dealBoardRolesWithBottomCards(board, seats, rng);
        const validation = validateRoleAssignment(board, dealt.seats);
        if (!validation.valid) {
          return { ok: false, errors: validation.errors };
        }
        set({
          seats: dealt.seats,
          passRevealConfirmedSeats: [],
          thiefBottomCards: dealt.thiefBottomCards,
          treasureMasterState: {
            ...createInitialTreasureMasterState(),
            bottomCards: dealt.treasureMasterBottomCards,
          },
          conversionState: {
            ...(state.conversionState ?? createInitialConversionState()),
            thiefBottomCards: dealt.thiefBottomCards,
          },
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
        const state = get();
        const { seats, passRevealConfirmedSeats } = state;
        const unconfirmed = seats
          .map((s) => s.seatNumber)
          .filter((num) => !passRevealConfirmedSeats.includes(num));
        if (unconfirmed.length > 0) {
          return {
            ok: false,
            reason: `尚有 ${unconfirmed.join('、')} 號玩家尚未確認身分`,
          };
        }
        const nextNightPatch = {
          phase: 'night' as const,
          round: 1,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(1),
        };
        set({
          ...nextNightPatch,
          nightStartSnapshot: hasWhiteNightEnvoy(state)
            ? captureGameSnapshot({ ...state, ...nextNightPatch })
            : null,
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
        const state = get();
        const { selectedBoardId, seats, hostMode, defaultSpeakDurationSec } = state;
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
          poisonerPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
          lastCharmedSeat: null,
          activeCharmedSeat: null,
          lastDreamTarget: null,
          knightDuelUsed: false,
          lastBearRoar: null,
          wolfGirlState: createInitialWolfGirlState(),
          nightStartSnapshot: null,
          preExileSnapshot: null,
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: defaultSpeakDurationSec,
          sheriffState: createInitialSheriffState(),
          exilePkCandidates: [],
          exilePkStage: 'none' as const,
          exilePkSpeakingOrder: [],
          pendingNightAnnouncement: null,
          exileResolvedToday: null,
          nightHistory: [],
          dayHistory: [],
          winner: null,
          winReason: null,
          forceContinueAfterVictory: false,
          preGameOverPhase: null,
          pendingShooters: [],
          passRevealConfirmedSeats: [],
        };

        if (hostMode.dealMode === 'physical_deal') {
          const physicalCheck = validatePhysicalDealSetup(board, seats);
          if (!physicalCheck.valid) {
            return { ok: false, errors: physicalCheck.errors };
          }
          const nightEntry = {
            ...baseRuntimeReset,
            treasureMasterState: createInitialTreasureMasterState(),
            thiefBottomCards: [],
            phase: 'night' as const,
          };
          set({
            ...nightEntry,
            nightStartSnapshot: hasWhiteNightEnvoy(state)
              ? captureGameSnapshot({ ...state, ...nightEntry })
              : null,
          });
          return { ok: true, errors: [] };
        }

        // online_deal × central_control：若尚未完整發牌則自動隨機洗牌，開局先進入 pass_and_reveal
        const existingCheck = validateRoleAssignment(board, seats);
        const dealtBundle = existingCheck.valid ? null : dealBoardRolesWithBottomCards(board, seats);
        const finalSeats = dealtBundle ? dealtBundle.seats : seats;
        const validation = validateRoleAssignment(board, finalSeats);
        if (!validation.valid) {
          return { ok: false, errors: validation.errors };
        }

        const finalThiefBottomCards = dealtBundle
          ? dealtBundle.thiefBottomCards
          : (state.thiefBottomCards ?? []);
        const finalTreasureMasterState = dealtBundle
          ? {
              ...createInitialTreasureMasterState(),
              bottomCards: dealtBundle.treasureMasterBottomCards,
            }
          : (state.treasureMasterState ?? createInitialTreasureMasterState());

        set({
          ...baseRuntimeReset,
          seats: finalSeats,
          thiefBottomCards: finalThiefBottomCards,
          treasureMasterState: finalTreasureMasterState,
          conversionState: {
            ...(state.conversionState ?? createInitialConversionState()),
            thiefBottomCards: finalThiefBottomCards,
          },
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
        const state = get();
        const { selectedBoardId, round, currentStepIndex } = state;
        const board = getBoardById(selectedBoardId);
        if (!board) return;
        const steps = getNightSteps(board, round);
        if (currentStepIndex < steps.length - 1) {
          set({
            currentStepIndex: currentStepIndex + 1,
          });
        }
      },

      prevNightStep: () => {
        set((state) => ({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        }));
      },

      checkEarlyNightVictory: () => {
        const state = get();
        if (state.phase !== 'night' || state.forceContinueAfterVictory) return false;
        // 實體發牌第一晚需先完成所有角色認領，不於中途提前結束
        if (state.round === 1 && state.hostMode.dealMode === 'physical_deal') return false;
        const board = getBoardById(state.selectedBoardId);
        if (!board) return false;
        const steps = getNightSteps(board, state.round);
        const remainingSteps = steps.slice(state.currentStepIndex + 1);
        const seerIdx = steps.findIndex((s) => s.actionType === 'seer_check');
        const witchIdx = steps.findIndex((s) => s.actionType === 'witch_action');
        const seerActsBeforeWitch = seerIdx !== -1 && witchIdx !== -1 && seerIdx < witchIdx;

        const check = shouldEndNightEarly(
          {
            seats: state.seats,
            round: state.round,
            draft: state.currentNightDraft,
            ruleOverrides: state.ruleOverrides,
            boardId: state.selectedBoardId ?? undefined,
            firstNightNoWolfKill: isFirstNightNoWolfKillBoard(board),
            witchAntidoteUsed: state.witchAntidoteUsed,
            witchPoisonUsed: state.witchPoisonUsed,
            poisonerPoisonUsed: state.poisonerPoisonUsed ?? false,
            lastGuardedSeat: state.lastGuardedSeat,
            mechWolfState: state.mechWolfState,
            pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
            lastCharmedSeat: state.lastCharmedSeat,
            lastDreamTarget: state.lastDreamTarget,
            wolfGirlState: state.wolfGirlState ?? createInitialWolfGirlState(),
            treasureMasterState: state.treasureMasterState ?? createInitialTreasureMasterState(),
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
          },
          remainingSteps,
        );
        return check.shouldEndEarly;
      },

      finishNight: () => {
        const state = get();
        const nightStartSnapshot = hasWhiteNightEnvoy(state)
          ? (state.nightStartSnapshot ?? captureGameSnapshot(state))
          : null;
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
          firstNightNoWolfKill: isFirstNightNoWolfKillBoard(board),
          witchAntidoteUsed: state.witchAntidoteUsed,
          witchPoisonUsed: state.witchPoisonUsed,
          poisonerPoisonUsed: state.poisonerPoisonUsed ?? false,
          lastGuardedSeat: state.lastGuardedSeat,
          mechWolfState: state.mechWolfState,
          pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
          lastCharmedSeat: state.lastCharmedSeat,
          lastDreamTarget: state.lastDreamTarget,
          wolfGirlState: state.wolfGirlState ?? createInitialWolfGirlState(),
          treasureMasterState: state.treasureMasterState ?? createInitialTreasureMasterState(),
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

        const needsSheriffStage =
          (state.round === 1 &&
            state.ruleOverrides.enableSheriff &&
            nextSheriffState.status === 'not_started') ||
          (nextSheriffState.status === 'voting' && nextSheriffState.explodeCountDuringElection === 1);
        const initialDayStage: DayStage = needsSheriffStage
          ? 'sheriff_election'
          : 'death_announcement';

        // 首夜若進入警長競選且尚未分出勝負：首夜死者於競選期間仍視為在場，待「公布昨晚死訊」時才正式宣告死亡並觸發警徽交接
        const deferNightDeaths =
          !shouldTriggerAutoVictory(result.victory, state.forceContinueAfterVictory) &&
          state.round === 1 &&
          initialDayStage === 'sheriff_election' &&
          state.ruleOverrides.enableSheriff &&
          nextSheriffState.status === 'not_started';

        // 早晨死訊正式公布且無待開槍／待移交警徽／待選警長時，檢查白天綁票狼勝
        const finalVictory =
          !deferNightDeaths && !needsSheriffStage
            ? evaluateDayTieLockVictory({
                baseVictory: result.victory,
                seats: result.seats,
                ruleOverrides: state.ruleOverrides,
                treasureMasterState: result.treasureMasterState,
                conversionState: result.conversionState,
                thirdPartySpecialState: result.thirdPartySpecialState,
                wolfGirlState: result.wolfGirlState,
                combatState: result.combatState,
                sheriffState: nextSheriffState,
                pendingShootersCount: pendingShooters.length,
                selectedBoardId: state.selectedBoardId,
              })
            : result.victory;

        const triggerGameOver = shouldTriggerAutoVictory(
          finalVictory,
          state.forceContinueAfterVictory,
        );

        const nextNightEntry = {
          round: state.round,
          draft: JSON.parse(JSON.stringify(state.currentNightDraft)) as NightActionDraft,
          deaths: result.deaths,
          bearRoar: result.bearRoar,
          moonSpiritHowl: result.moonSpiritHowl,
          nineTailedFoxResult: result.nineTailedFoxResult,
          seniorVillagerReveal: result.seniorVillagerReveal,
          seerResult: result.seerResult,
          psychicResult: result.psychicResult,
          mechWolfPsychicResult: result.mechWolfPsychicResult,
          awakenedSeerResult: result.awakenedSeerResult,
          lanternSeerResult: result.lanternSeerResult,
          drunkSeerResult: result.drunkSeerResult,
          foolSeerResult: result.foolSeerResult,
          foxResult: result.foxResult,
          gargoyleResult: result.gargoyleResult,
          wolfWitchResult: result.wolfWitchResult,
          pureWhiteResult: result.pureWhiteResult,
          demonWolfResult: result.demonWolfResult,
          pumpkinGhostResult: result.pumpkinGhostResult,
          gravekeeperResult: result.gravekeeperResult,
          awakenedDreamResult: result.awakenedDreamResult,
          exoticPrinceResult: result.exoticPrinceResult ?? null,
          luckySeerResult: result.luckySeerResult ?? null,
          eclipseMaidCheckResult: result.eclipseMaidCheckResult ?? null,
          greyWolfBossSeerResult: result.greyWolfBossSeerResult ?? null,
          policeDogResult: result.policeDogResult ?? null,
          littleGirlResult: result.littleGirlResult ?? null,
          mediumResult: result.mediumResult ?? null,
          mechWolfLearnedRoleId:
            state.currentNightDraft.mechWolfLearnTarget !== null
              ? result.mechWolfState.learnedRoleId
              : null,
          maskedWolfCheckResult: result.maskedWolfCheckResult ?? null,
          mediumSeerResult: result.mediumSeerResult ?? null,
        };
        const nextNightHistory = [
          ...state.nightHistory.filter((entry) => entry.round !== state.round),
          nextNightEntry,
        ].sort((a, b) => a.round - b.round);

        set({
          seats: deferNightDeaths ? resolvedInputSeats : result.seats,
          witchAntidoteUsed: result.witchAntidoteUsed,
          witchPoisonUsed: result.witchPoisonUsed,
          poisonerPoisonUsed: result.poisonerPoisonUsed,
          lastGuardedSeat: result.lastGuardedSeat,
          mechWolfState: result.mechWolfState,
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          lastCharmedSeat: result.lastCharmedSeat,
          activeCharmedSeat: result.activeCharmedSeat,
          lastDreamTarget: result.lastDreamTarget,
          wolfGirlState: result.wolfGirlState,
          treasureMasterState: result.treasureMasterState,
          nightStartSnapshot,
          preExileSnapshot: null,
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
          dailyRandomDirection: pickRandomDirection(),
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
          exilePkCandidates: [],
          exilePkStage: 'none',
          exilePkSpeakingOrder: [],
          exileResolvedToday: null,
          pendingNightAnnouncement: deferNightDeaths
            ? {
                seats: result.seats,
                pendingShooters,
                victory: result.victory,
              }
            : null,
          enterNightAfterPendingShooters: false,
          nightHistory: nextNightHistory,
          dayHistory: nextDayHistory,
          pendingShooters: deferNightDeaths ? [] : pendingShooters,
          winner: !deferNightDeaths && triggerGameOver ? finalVictory.winner : null,
          winReason: !deferNightDeaths && triggerGameOver ? finalVictory.winReason : null,
          preGameOverPhase:
            !deferNightDeaths && triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: !deferNightDeaths && triggerGameOver ? 'game_over' : 'day_announcement',
          dayStage: initialDayStage,
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

        const firstSpeakerSeat = result.queue[0] ?? null;
        const isFirstSpeakerSheriff =
          firstSpeakerSeat !== null &&
          state.sheriffState.badgeStatus === 'active' &&
          state.sheriffState.sheriffSeat === firstSpeakerSeat;
        const firstDuration = isFirstSpeakerSheriff
          ? SHERIFF_SPEAK_DURATION_SEC
          : state.defaultSpeakDurationSec;

        set({
          speakingQueue: result.queue,
          currentSpeakerIndex: 0,
          speakingMeta: result,
          remainingSeconds: firstDuration,
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
          const nextSeat = nextIndex < state.speakingQueue.length ? state.speakingQueue[nextIndex] : null;
          const isNextSheriff =
            nextSeat !== null &&
            state.sheriffState.badgeStatus === 'active' &&
            state.sheriffState.sheriffSeat === nextSeat;
          return {
            currentSpeakerIndex: nextIndex,
            remainingSeconds: isNextSheriff
              ? SHERIFF_SPEAK_DURATION_SEC
              : state.defaultSpeakDurationSec,
          };
        });
      },

      prevSpeaker: () => {
        set((state) => {
          if (state.speakingQueue.length === 0) return state;
          const prevIndex = Math.max(0, state.currentSpeakerIndex - 1);
          const prevSeat = prevIndex < state.speakingQueue.length ? state.speakingQueue[prevIndex] : null;
          const isPrevSheriff =
            prevSeat !== null &&
            state.sheriffState.badgeStatus === 'active' &&
            state.sheriffState.sheriffSeat === prevSeat;
          return {
            currentSpeakerIndex: prevIndex,
            remainingSeconds: isPrevSheriff
              ? SHERIFF_SPEAK_DURATION_SEC
              : state.defaultSpeakDurationSec,
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
        let nextSheriffState = startSheriffElectionLogic(state.seats, candidateSeats);
        let nextSpeakingQueue = state.speakingQueue;
        let nextSpeakingMeta = state.speakingMeta;

        let summary = '';
        let eventType: DayStructuredEvent['type'] = 'sheriff_signup';
        if (nextSheriffState.status === 'no_sheriff') {
          summary = '警長競選：無人上警，本局無警長';
          eventType = 'sheriff_no_winner';
        } else if (nextSheriffState.status === 'elected') {
          summary = `警長競選：僅 ${nextSheriffState.sheriffSeat} 號上警，自動當選警長`;
          eventType = 'sheriff_elected';
        } else {
          // 步驟 B：自動隨機抽取上警發言順序並記錄，供平票 PK 逆序使用
          const speakingOrder = generateSpeakingOrderLogic(state.seats, {
            mode: 'random',
            candidateSeats: nextSheriffState.candidates,
          });
          nextSheriffState = setSheriffInitialSpeakingOrder(nextSheriffState, speakingOrder.queue);
          nextSpeakingQueue = speakingOrder.queue;
          nextSpeakingMeta = speakingOrder;
          summary = `警長競選：上警名單為 ${nextSheriffState.candidates.join('、')} 號`;
        }

        set({
          sheriffState: nextSheriffState,
          speakingQueue: nextSpeakingQueue,
          currentSpeakerIndex: 0,
          speakingMeta: nextSpeakingMeta,
          remainingSeconds: state.defaultSpeakDurationSec,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: eventType,
            summary,
            targetSeat: nextSheriffState.sheriffSeat,
          }),
        });
      },

      advanceSheriffToVoting: () => {
        set((state) => ({
          sheriffState: advanceSheriffToVotingLogic(state.sheriffState),
        }));
      },

      advanceSheriffPkToVoting: () => {
        set((state) => ({
          sheriffState: advanceSheriffPkToVotingLogic(state.sheriffState),
        }));
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

        let nextThirdPartySpecialState =
          state.thirdPartySpecialState ?? createInitialThirdPartySpecialState();
        const aliveNineTails = state.seats.find(
          (s) => s.roleId === 'nine_tails_wolf' && s.isAlive,
        );
        if (aliveNineTails) {
          for (const [voterStr, targetSeat] of Object.entries(votes)) {
            if (targetSeat === aliveNineTails.seatNumber) {
              nextThirdPartySpecialState = addNineTailsMark(
                nextThirdPartySpecialState,
                Number(voterStr),
              );
            }
          }
        }

        let nextSpeakingQueue = state.speakingQueue;
        let nextSpeakingMeta = state.speakingMeta;

        let summary = '';
        let eventType: DayStructuredEvent['type'] = 'sheriff_vote';
        if (resolution.outcome === 'elected') {
          summary = `警長投票結果：${resolution.record.electedSeat} 號當選警長`;
          eventType = 'sheriff_elected';
        } else if (resolution.outcome === 'pk') {
          const pkOrder = getSheriffPkSpeakingOrder(
            resolution.sheriffState.initialSpeakingOrder,
            resolution.sheriffState.pkCandidates,
          );
          nextSpeakingQueue = pkOrder;
          nextSpeakingMeta = {
            mode: 'random',
            direction: state.speakingMeta?.direction === 'clockwise' ? 'counterclockwise' : 'clockwise',
            startSeat: pkOrder[0] ?? null,
            anchorSeat: pkOrder[0] ?? null,
            sheriffLastSeat: null,
            queue: pkOrder,
          };
          summary = `警長投票平票：${resolution.record.tiedSeats.join('、')} 號進入 PK（逆序發言：${pkOrder.join(' → ')}）`;
          eventType = 'sheriff_vote';
        } else {
          summary = '警長投票流局：本局無警長';
          eventType = 'sheriff_no_winner';
        }

        set({
          sheriffState: resolution.sheriffState,
          thirdPartySpecialState: nextThirdPartySpecialState,
          speakingQueue: nextSpeakingQueue,
          currentSpeakerIndex: 0,
          speakingMeta: nextSpeakingMeta,
          remainingSeconds: state.defaultSpeakDurationSec,
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
        const tieVictory = evaluateDayTieLockVictory({
          baseVictory: { winner: null, winReason: null },
          seats: state.seats,
          ruleOverrides: state.ruleOverrides,
          treasureMasterState: state.treasureMasterState,
          conversionState: state.conversionState,
          thirdPartySpecialState: state.thirdPartySpecialState,
          wolfGirlState: state.wolfGirlState,
          combatState: state.combatState,
          sheriffState: nextSheriffState,
          pendingShootersCount: state.pendingShooters.length,
          selectedBoardId: state.selectedBoardId,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          tieVictory,
          state.forceContinueAfterVictory,
        );

        set({
          sheriffState: nextSheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'badge_transfer',
            summary,
            actorSeat: fromSeat,
            targetSeat,
          }),
          winner: triggerGameOver ? tieVictory.winner : state.winner,
          winReason: triggerGameOver ? tieVictory.winReason : state.winReason,
          preGameOverPhase:
            triggerGameOver && (state.phase === 'day_announcement' || state.phase === 'day_vote')
              ? state.phase
              : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
        });
      },

      destroySheriffBadge: () => {
        const state = get();
        const fromSeat = state.sheriffState.pendingBadgeTransferFrom ?? state.sheriffState.sheriffSeat;
        const nextSheriffState = destroySheriffBadgeLogic(state.sheriffState);
        const summary = `${fromSeat} 號撕毀警徽，本局後續無警長`;
        const tieVictory = evaluateDayTieLockVictory({
          baseVictory: { winner: null, winReason: null },
          seats: state.seats,
          ruleOverrides: state.ruleOverrides,
          treasureMasterState: state.treasureMasterState,
          conversionState: state.conversionState,
          thirdPartySpecialState: state.thirdPartySpecialState,
          wolfGirlState: state.wolfGirlState,
          combatState: state.combatState,
          sheriffState: nextSheriffState,
          pendingShootersCount: state.pendingShooters.length,
          selectedBoardId: state.selectedBoardId,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          tieVictory,
          state.forceContinueAfterVictory,
        );

        set({
          sheriffState: nextSheriffState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'badge_destroy',
            summary,
            actorSeat: fromSeat,
          }),
          winner: triggerGameOver ? tieVictory.winner : state.winner,
          winReason: triggerGameOver ? tieVictory.winReason : state.winReason,
          preGameOverPhase:
            triggerGameOver && (state.phase === 'day_announcement' || state.phase === 'day_vote')
              ? state.phase
              : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
          state.treasureMasterState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
          {
            combatState: state.combatState,
            finalBatchState: state.finalBatchState,
            interferenceState: state.interferenceState,
          },
        );

        const shotsLeft = (shooter.shotsRemaining ?? 1) - 1;
        const remainingShooters: PendingShooter[] =
          shotsLeft > 0
            ? state.pendingShooters.map((s) =>
                s.seatNumber === shooterSeat ? { ...s, shotsRemaining: shotsLeft } : s,
              )
            : state.pendingShooters.filter((s) => s.seatNumber !== shooterSeat);
        if (
          result.chainedShootEligibility?.canShoot &&
          !remainingShooters.some((s) => s.seatNumber === result.chainedShootEligibility!.seatNumber)
        ) {
          remainingShooters.push({
            ...result.chainedShootEligibility,
            deathReason: result.deathReason,
          });
        }

        const actorLabel =
          shooter.roleId === 'wolf_king'
            ? '狼王'
            : shooter.roleId === 'awakened_wolf_king'
              ? '覺醒狼王'
              : shooter.roleId === 'awakened_hunter'
                ? '覺醒獵人'
                : shooter.roleId === 'lucky_gun'
                  ? '幸運兒（槍）'
                  : shooter.roleId === 'evil_merchant_gun'
                    ? '邪惡商人（槍）'
                    : shooter.roleId === 'grey_wolf_gun'
                      ? '灰太狼（槍）'
                      : shooter.roleId === 'wolf_gun'
                        ? '覺醒狼王（贈槍）'
                        : shooter.roleId === 'pandora_day_gun'
                          ? '潘朵拉（手槍）'
                          : '獵人';
        const shootSummary = `${shooterSeat} 號（${actorLabel}）開槍帶走 ${targetSeat} 號`;
        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, shootSummary, {
          type:
            shooter.roleId === 'wolf_king' || shooter.roleId === 'awakened_wolf_king'
              ? 'wolf_king_shoot'
              : 'hunter_shoot',
          summary: shootSummary,
          actorSeat: shooterSeat,
          targetSeat,
          eliminatedSeats: result.targetSurvived ? [] : [targetSeat],
          outcomeTag: result.targetSurvived ? 'shoot_survived' : 'shoot_kill',
        });

        if (result.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${result.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: result.charmedDeathSeat,
            eliminatedSeats: [result.charmedDeathSeat],
          });
        }

        const seatsWithDeferred = mergePendingNightDeaths(
          result.seats,
          state.pendingNightAnnouncement,
        );
        const synced = finalizeDayDeathSync(state, seatsWithDeferred, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const finalVictory = evaluateDayTieLockVictory({
          baseVictory: synced.victory,
          seats: synced.seats,
          ruleOverrides: state.ruleOverrides,
          treasureMasterState: state.treasureMasterState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          wolfGirlState: state.wolfGirlState,
          combatState: state.combatState,
          sheriffState: nextSheriffState,
          pendingShootersCount: remainingShooters.length,
          selectedBoardId: state.selectedBoardId,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          finalVictory,
          state.forceContinueAfterVictory,
        );
        const shouldEnterNightNow =
          !triggerGameOver &&
          state.enterNightAfterPendingShooters &&
          remainingShooters.length === 0;
        const nextRound = shouldEnterNightNow ? state.round + 1 : state.round;

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          pendingShooters: remainingShooters,
          enterNightAfterPendingShooters:
            triggerGameOver || shouldEnterNightNow ? false : state.enterNightAfterPendingShooters,
          dayHistory: nextDayHistory,
          winner: triggerGameOver ? finalVictory.winner : state.winner,
          winReason: triggerGameOver ? finalVictory.winReason : state.winReason,
          preGameOverPhase:
            triggerGameOver && (state.phase === 'day_announcement' || state.phase === 'day_vote')
              ? state.phase
              : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : shouldEnterNightNow ? 'night' : state.phase,
          ...(shouldEnterNightNow
            ? {
                round: nextRound,
                currentStepIndex: 0,
                currentNightDraft: createEmptyNightDraft(nextRound),
                speakingQueue: [],
                currentSpeakerIndex: 0,
                speakingMeta: null,
                remainingSeconds: state.defaultSpeakDurationSec,
                exilePkCandidates: [],
              }
            : {}),
        });
      },

      skipShoot: (shooterSeat) => {
        set((state) => {
          const remainingShooters = state.pendingShooters.filter(
            (s) => s.seatNumber !== shooterSeat,
          );
          const tieVictory = evaluateDayTieLockVictory({
            baseVictory: { winner: null, winReason: null },
            seats: state.seats,
            ruleOverrides: state.ruleOverrides,
            treasureMasterState: state.treasureMasterState,
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            combatState: state.combatState,
            sheriffState: state.sheriffState,
            pendingShootersCount: remainingShooters.length,
            selectedBoardId: state.selectedBoardId,
          });
          const triggerGameOver = shouldTriggerAutoVictory(
            tieVictory,
            state.forceContinueAfterVictory,
          );
          const shouldEnterNightNow =
            !triggerGameOver &&
            state.enterNightAfterPendingShooters &&
            remainingShooters.length === 0;
          const nextRound = shouldEnterNightNow ? state.round + 1 : state.round;
          return {
            pendingShooters: remainingShooters,
            enterNightAfterPendingShooters:
              triggerGameOver || shouldEnterNightNow
                ? false
                : state.enterNightAfterPendingShooters,
            dayHistory: appendDayEvent(
              state.dayHistory,
              state.round,
              `${shooterSeat} 號選擇壓槍不開`,
            ),
            winner: triggerGameOver ? tieVictory.winner : state.winner,
            winReason: triggerGameOver ? tieVictory.winReason : state.winReason,
            preGameOverPhase:
              triggerGameOver && (state.phase === 'day_announcement' || state.phase === 'day_vote')
                ? state.phase
                : state.preGameOverPhase,
            phase: triggerGameOver ? 'game_over' : shouldEnterNightNow ? 'night' : state.phase,
            ...(shouldEnterNightNow
              ? {
                  round: nextRound,
                  currentStepIndex: 0,
                  currentNightDraft: createEmptyNightDraft(nextRound),
                  speakingQueue: [],
                  currentSpeakerIndex: 0,
                  speakingMeta: null,
                  remainingSeconds: state.defaultSpeakDurationSec,
                  exilePkCandidates: [],
                }
              : {}),
          };
        });
      },

      proceedToDeathAnnouncement: () => {
        set((state) => {
          const pending = state.pendingNightAnnouncement;
          if (!pending) {
            return {
              dayStage: 'death_announcement' as const,
              speakingQueue: [],
              currentSpeakerIndex: 0,
              speakingMeta: null,
              remainingSeconds: state.defaultSpeakDurationSec,
            };
          }

          const appliedSeats = pending.seats;
          const syncedSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, appliedSeats);
          const finalVictory = evaluateDayTieLockVictory({
            baseVictory: pending.victory,
            seats: appliedSeats,
            ruleOverrides: state.ruleOverrides,
            treasureMasterState: state.treasureMasterState,
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            combatState: state.combatState,
            sheriffState: syncedSheriffState,
            pendingShootersCount: pending.pendingShooters.length,
            selectedBoardId: state.selectedBoardId,
          });
          const triggerGameOver = shouldTriggerAutoVictory(
            finalVictory,
            state.forceContinueAfterVictory,
          );

          return {
            seats: appliedSeats,
            pendingShooters: pending.pendingShooters,
            sheriffState: syncedSheriffState,
            pendingNightAnnouncement: null,
            dayStage: 'death_announcement' as const,
            speakingQueue: [],
            currentSpeakerIndex: 0,
            speakingMeta: null,
            remainingSeconds: state.defaultSpeakDurationSec,
            winner: triggerGameOver ? finalVictory.winner : state.winner,
            winReason: triggerGameOver ? finalVictory.winReason : state.winReason,
            preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
            phase: triggerGameOver ? 'game_over' : state.phase,
          };
        });
      },

      proceedToDaySpeaking: () => {
        set((state) => ({
          dayStage: 'speaking',
          speakingQueue: [],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
        }));
      },

      proceedToDayVote: () => {
        set((state) => ({
          phase: state.winner ? 'game_over' : 'day_vote',
          dayStage: 'exile_vote',
        }));
      },

      setVoteInputMode: (mode) => {
        set({ voteInputMode: mode });
      },

      advanceExilePkToVoting: () => {
        set((state) => {
          if (state.exilePkStage !== 'pk_speaking') return state;
          return {
            exilePkStage: 'pk_voting' as const,
          };
        });
      },

      submitExileVotes: (votes, options = {}) => {
        const state = get();
        const isPkRound = state.exilePkCandidates.length > 0;
        const activeSheriffSeat =
          state.sheriffState.badgeStatus === 'active' ? state.sheriffState.sheriffSeat : null;

        const mergedExtraVotes: Record<number, number> = { ...(options.extraVotes ?? {}) };
        const crowSeat = state.thirdPartySpecialState?.crowActiveCursedSeat;
        if (crowSeat != null) {
          mergedExtraVotes[crowSeat] = (mergedExtraVotes[crowSeat] ?? 0) + 1;
        }

        const tally = tallyExileVotes({
          seats: state.seats,
          votes,
          sheriffSeat: activeSheriffSeat,
          sheriffVoteWeight:
            options.sheriffVoteWeight ?? state.ruleOverrides.sheriffVoteWeight ?? 1.5,
          extraVotes: mergedExtraVotes,
          pkCandidates: state.exilePkCandidates,
          roundIndex: isPkRound ? 2 : 1,
          tricksterVoteSwap: state.interferenceState?.activeTricksterVoteSwap ?? null,
          silencedVoterSeat: state.finalBatchState?.contrarianSilencedVoterSeat ?? null,
          butlerVoteBonusSeat: state.thirdPartySpecialState?.butlerActiveVoteBonusSeat ?? null,
          wolfMaidVotePenaltySeat: state.thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat ?? null,
        });

        if (tally.outcome === 'tie') {
          const dayOrder =
            state.speakingMeta?.queue && state.speakingMeta.queue.length > 0
              ? state.speakingMeta.queue
              : state.speakingQueue;
          const pkOrder = getExilePkSpeakingOrder(dayOrder, tally.record.tiedSeats);
          const summary = `${formatChineseDay(state.round)} 放逐投票平票：${tally.record.tiedSeats.join('、')} 號進入平票 PK（逆序發言：${pkOrder.join(' → ')}）`;
          set({
            exilePkCandidates: tally.record.tiedSeats,
            exilePkStage: 'pk_speaking',
            exilePkSpeakingOrder: pkOrder,
            dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
              type: 'exile_pk',
              summary,
              voteRecord: tally.record,
            }),
          });
          return tally;
        }

        if (tally.outcome === 'no_exile' || tally.record.electedSeat === null) {
          const isAllAbstain = Object.keys(tally.record.totals).length === 0;
          const summary = isPkRound
            ? isAllAbstain
              ? `${formatChineseDay(state.round)} 放逐投票（平票 PK）：全員棄票，本日無人出局（平安日）`
              : `${formatChineseDay(state.round)} 放逐投票（平票 PK）：再次平票，本日無人出局（平安日）`
            : `${formatChineseDay(state.round)} 放逐投票：全員棄票，本日無人出局（平安日）`;
          set({
            exilePkCandidates: [],
            exilePkStage: 'none',
            exilePkSpeakingOrder: [],
            exileResolvedToday: {
              outcome: 'no_exile',
              seat: null,
              summary,
            },
            dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
              type: 'exile_vote',
              summary,
              voteRecord: tally.record,
            }),
          });
          return tally;
        }

        const preExileSnapshot = captureGameSnapshot(state);
        const targetSeat = tally.record.electedSeat;
        const voteSummary = isPkRound
          ? `${formatChineseDay(state.round)} 放逐投票（平票 PK）：${targetSeat} 號最高票（${tally.record.totals[targetSeat]} 票）`
          : `${formatChineseDay(state.round)} 放逐投票：${targetSeat} 號最高票（${tally.record.totals[targetSeat]} 票）`;
        const exileResult = resolveDayExile(
          state.seats,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
          state.treasureMasterState,
          state.finalBatchState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
          {
            combatState: state.combatState,
            boardId: state.selectedBoardId ?? undefined,
          },
        );

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, voteSummary, {
          type: 'exile_vote',
          summary: voteSummary,
          targetSeat,
          voteRecord: tally.record,
        });

        const targetDiedInExile =
          !exileResult.idiotRevealed &&
          !exileResult.treasureMasterMaskedSurvived &&
          exileResult.seats.find((s) => s.seatNumber === targetSeat)?.isAlive === false;

        const outcomeText = exileResult.idiotRevealed
          ? `${targetSeat} 號（白痴）被放逐投票投出，翻牌免死並失去投票權`
          : `${targetSeat} 號於白天放逐出局`;
        nextDayHistory = appendDayEvent(nextDayHistory, state.round, outcomeText, {
          type: exileResult.idiotRevealed ? 'idiot_reveal' : 'exile_result',
          summary: outcomeText,
          targetSeat,
          eliminatedSeats: targetDiedInExile ? [targetSeat] : [],
          outcomeTag: exileResult.idiotRevealed
            ? 'idiot_reveal'
            : targetDiedInExile
              ? 'exile'
              : 'exile_survived',
        });

        if (exileResult.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${exileResult.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: exileResult.charmedDeathSeat,
            eliminatedSeats: [exileResult.charmedDeathSeat],
          });
        }

        const exiledSeatObj = state.seats.find((s) => s.seatNumber === targetSeat);
        const nextExiledHistory =
          targetDiedInExile && exiledSeatObj
            ? [
                ...(state.exiledHistory ?? []),
                {
                  round: state.round,
                  seatNumber: targetSeat,
                  roleId: exiledSeatObj.roleId,
                  infectedBySeedWolf: exiledSeatObj.statuses.infectedBySeedWolf,
                  convertedByAwakenedGargoyle: exiledSeatObj.statuses.convertedByAwakenedGargoyle,
                  effectiveFaction:
                    getSeatEffectiveFaction(exiledSeatObj, state.conversionState) ?? undefined,
                },
              ]
            : (state.exiledHistory ?? []);

        const seatsWithDeferred = mergePendingNightDeaths(
          exileResult.seats,
          state.pendingNightAnnouncement,
        );
        const synced = finalizeDayDeathSync(state, seatsWithDeferred, {
          wolfKillPriorityOverride: exileResult.charmedDeathSeat !== null,
        });
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const baseTriggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const pendingShooters: PendingShooter[] =
          exileResult.shootEligibility?.canShoot && !baseTriggerGameOver
            ? [{ ...exileResult.shootEligibility, deathReason: 'exiled' }]
            : [];
        const finalVictory = evaluateDayTieLockVictory({
          baseVictory: synced.victory,
          seats: synced.seats,
          ruleOverrides: state.ruleOverrides,
          treasureMasterState: state.treasureMasterState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          wolfGirlState: state.wolfGirlState,
          combatState: state.combatState,
          sheriffState: nextSheriffState,
          pendingShootersCount: pendingShooters.length,
          selectedBoardId: state.selectedBoardId,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          finalVictory,
          state.forceContinueAfterVictory,
        );

        set({
          seats: synced.seats,
          mechWolfState: exileResult.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          exiledHistory: nextExiledHistory,
          preExileSnapshot,
          activeCharmedSeat:
            exileResult.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: nextSheriffState,
          exilePkCandidates: [],
          exilePkStage: 'none',
          exilePkSpeakingOrder: [],
          exileResolvedToday: {
            outcome: exileResult.idiotRevealed
              ? 'idiot_revealed'
              : exileResult.treasureMasterMaskedSurvived
                ? 'survived'
                : 'exile',
            seat: targetSeat,
            summary: outcomeText,
          },
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: triggerGameOver ? finalVictory.winner : state.winner,
          winReason: triggerGameOver ? finalVictory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
        });

        return tally;
      },

      exilePlayer: (targetSeat) => {
        const state = get();
        const preExileSnapshot = captureGameSnapshot(state);
        const result = resolveDayExile(
          state.seats,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.activeCharmedSeat,
          state.treasureMasterState,
          state.finalBatchState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
          {
            combatState: state.combatState,
            boardId: state.selectedBoardId ?? undefined,
          },
        );

        const targetDiedInExile =
          !result.idiotRevealed &&
          !result.treasureMasterMaskedSurvived &&
          result.seats.find((s) => s.seatNumber === targetSeat)?.isAlive === false;

        const eventText = result.idiotRevealed
          ? `${targetSeat} 號（白痴）被放逐投票投出，翻牌免死並失去投票權`
          : `${targetSeat} 號於白天放逐出局`;

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, eventText, {
          type: result.idiotRevealed ? 'idiot_reveal' : 'exile_result',
          summary: eventText,
          targetSeat,
          eliminatedSeats: targetDiedInExile ? [targetSeat] : [],
          outcomeTag: result.idiotRevealed
            ? 'idiot_reveal'
            : targetDiedInExile
              ? 'exile'
              : 'exile_survived',
        });

        if (result.charmedDeathSeat !== null) {
          const charmSummary = `${targetSeat} 號（狼美人）出局，${result.charmedDeathSeat} 號殉情出局`;
          nextDayHistory = appendDayEvent(nextDayHistory, state.round, charmSummary, {
            type: 'wolf_beauty_charm_death',
            summary: charmSummary,
            actorSeat: targetSeat,
            targetSeat: result.charmedDeathSeat,
            eliminatedSeats: [result.charmedDeathSeat],
          });
        }

        const exiledSeatObj = state.seats.find((s) => s.seatNumber === targetSeat);
        const nextExiledHistory =
          targetDiedInExile && exiledSeatObj
            ? [
                ...(state.exiledHistory ?? []),
                {
                  round: state.round,
                  seatNumber: targetSeat,
                  roleId: exiledSeatObj.roleId,
                  infectedBySeedWolf: exiledSeatObj.statuses.infectedBySeedWolf,
                  convertedByAwakenedGargoyle: exiledSeatObj.statuses.convertedByAwakenedGargoyle,
                  effectiveFaction:
                    getSeatEffectiveFaction(exiledSeatObj, state.conversionState) ?? undefined,
                },
              ]
            : (state.exiledHistory ?? []);
        const seatsWithDeferred = mergePendingNightDeaths(
          result.seats,
          state.pendingNightAnnouncement,
        );
        const synced = finalizeDayDeathSync(state, seatsWithDeferred, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const finalSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);
        const baseFinalTriggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const pendingShooters: PendingShooter[] =
          result.shootEligibility?.canShoot && !baseFinalTriggerGameOver
            ? [{ ...result.shootEligibility, deathReason: 'exiled' }]
            : [];
        const finalVictory = evaluateDayTieLockVictory({
          baseVictory: synced.victory,
          seats: synced.seats,
          ruleOverrides: state.ruleOverrides,
          treasureMasterState: state.treasureMasterState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          wolfGirlState: state.wolfGirlState,
          combatState: state.combatState,
          sheriffState: finalSheriffState,
          pendingShootersCount: pendingShooters.length,
          selectedBoardId: state.selectedBoardId,
        });
        const finalTriggerGameOver = shouldTriggerAutoVictory(
          finalVictory,
          state.forceContinueAfterVictory,
        );

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          exiledHistory: nextExiledHistory,
          preExileSnapshot,
          activeCharmedSeat:
            result.charmedDeathSeat !== null ? null : state.activeCharmedSeat,
          sheriffState: finalSheriffState,
          exilePkCandidates: [],
          exilePkStage: 'none',
          exilePkSpeakingOrder: [],
          exileResolvedToday: {
            outcome: result.idiotRevealed
              ? 'idiot_revealed'
              : result.treasureMasterMaskedSurvived
                ? 'survived'
                : 'exile',
            seat: targetSeat,
            summary: eventText,
          },
          dayHistory: nextDayHistory,
          pendingShooters,
          winner: finalTriggerGameOver ? finalVictory.winner : state.winner,
          winReason: finalTriggerGameOver ? finalVictory.winReason : state.winReason,
          preGameOverPhase: finalTriggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: finalTriggerGameOver ? 'game_over' : state.phase,
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
        const synced = finalizeDayDeathSync(state, result.seats);
        const nextSheriffState = syncSheriffBadgeOnDeaths(explodeBadge.sheriffState, synced.seats);

        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
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
          eliminatedSeats: [actorSeat],
        });

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: nextSheriffState,
          dayHistory: nextDayHistory,
          exilePkCandidates: [],
          pendingShooters: [],
          round: triggerGameOver ? state.round : nextRound,
          currentStepIndex: 0,
          currentNightDraft: triggerGameOver
            ? state.currentNightDraft
            : createEmptyNightDraft(nextRound),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'night',
        });

        return {
          ...result,
          seats: synced.seats,
          victory: synced.victory,
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
        const pendingSeats =
          curInt.alchemySnakePendingVictimSeats && curInt.alchemySnakePendingVictimSeats.length > 0
            ? curInt.alchemySnakePendingVictimSeats
            : curInt.alchemySnakePendingVictimSeat != null
              ? [curInt.alchemySnakePendingVictimSeat]
              : [];
        if (pendingSeats.length > 0 && !pendingSeats.includes(victimSeat)) {
          return { allowed: false, reason: '法老之蛇僅能救活當晚倒牌的目標玩家' };
        }
        const res = resolveAlchemySnakeRevive(state.seats, victimSeat);
        if (!res.allowed) {
          return { allowed: false, reason: res.reason };
        }
        const remainingPending = pendingSeats.filter((s) => s !== victimSeat);
        const summary = `煉金魔女發動「法老之蛇」救活 ${victimSeat} 號`;
        set({
          seats: res.seats,
          interferenceState: {
            ...curInt,
            alchemySnakeUsed: true,
            alchemySnakePendingVictimSeat: remainingPending[0] ?? null,
            alchemySnakePendingVictimSeats: remainingPending,
          },
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: victimSeat,
          }),
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
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `放逐階段結束：已翻牌之白貓（${res.eliminatedSeat} 號）正式出局`;
        set({
          seats: synced.seats,
          mechWolfState: res.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: res.eliminatedSeat,
            eliminatedSeats: [res.eliminatedSeat],
            outcomeTag: 'white_cat_delayed_death',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            eliminatedSeats: res.killedSeats,
            outcomeTag: 'pufferfish_explode',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
          state.treasureMasterState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
          state.finalBatchState,
        );
        if (!res.allowed) return { allowed: false };
        const synced = finalizeDayDeathSync(state, res.seats);
        const remainingShooters = state.pendingShooters.filter(
          (s) => s.seatNumber !== hunterSeat,
        );
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const shouldEnterNightNow =
          !triggerGameOver &&
          state.enterNightAfterPendingShooters &&
          remainingShooters.length === 0;
        const nextRound = shouldEnterNightNow ? state.round + 1 : state.round;
        const dirLabel = direction === 'left' ? '左' : '右';
        const summary =
          res.killedSeat !== null
            ? `覺醒獵人（${hunterSeat} 號）向${dirLabel}開槍帶走最近狼人 ${res.killedSeat} 號`
            : `覺醒獵人（${hunterSeat} 號）向${dirLabel}開槍未命中存活狼人`;
        set({
          seats: synced.seats,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          pendingShooters: remainingShooters,
          enterNightAfterPendingShooters:
            triggerGameOver || shouldEnterNightNow ? false : state.enterNightAfterPendingShooters,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'hunter_shoot',
            summary,
            actorSeat: hunterSeat,
            targetSeat: res.killedSeat,
            eliminatedSeats: res.killedSeat !== null ? [res.killedSeat] : [],
            outcomeTag: 'awakened_hunter_shoot',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : shouldEnterNightNow ? 'night' : state.phase,
          ...(shouldEnterNightNow
            ? {
                round: nextRound,
                currentStepIndex: 0,
                currentNightDraft: createEmptyNightDraft(nextRound),
                speakingQueue: [],
                currentSpeakerIndex: 0,
                speakingMeta: null,
                remainingSeconds: state.defaultSpeakDurationSec,
                exilePkCandidates: [],
              }
            : {}),
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
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `老流氓（${res.eliminatedSeat} 號）延遲死亡正式出局`;
        set({
          seats: synced.seats,
          mechWolfState: res.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: res.eliminatedSeat,
            eliminatedSeats: [res.eliminatedSeat],
            outcomeTag: 'old_rascal_delayed_death',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
            eliminatedSeats: res.killedSeat !== null ? [res.killedSeat] : [],
            outcomeTag: 'avenger_assassinate',
          }),
          winner: triggerGameOver ? finalVictory.winner : state.winner,
          winReason: triggerGameOver ? finalVictory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
        const synced = finalizeDayDeathSync(state, res.seats, {
          thirdPartySpecialStateOverride: res.state,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary =
          res.poisonedSeat != null
            ? `潘朵拉白天贈送魔盒給 ${targetSeat} 號，開出毒藥立即出局`
            : `潘朵拉白天贈送魔盒給 ${targetSeat} 號`;
        set({
          seats: synced.seats,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
            eliminatedSeats: res.poisonedSeat != null ? [res.poisonedSeat] : [],
            outcomeTag: 'pandora_day_gift',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
        const victory = checkVictory(state.seats, state.ruleOverrides, state.treasureMasterState, {
          conversionState: state.conversionState,
          thirdPartySpecialState: res.state,
          wolfGirlState: state.wolfGirlState,
          boardId: state.selectedBoardId ?? undefined,
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
        const synced = finalizeDayDeathSync(state, res.seats, {
          thirdPartySpecialStateOverride: tpState,
        });
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const nextRound = state.round + 1;
        const summary = `九尾發動「獵殺時刻」成功（A=${res.groupACount} > B=${res.groupBCount}），B 方 ${res.eliminatedSeats.join('、')} 號全員出局並立刻入夜！`;
        set({
          seats: synced.seats,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            eliminatedSeats: res.eliminatedSeats,
            outcomeTag: 'nine_tails_hunt',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : 'night',
          round: triggerGameOver ? state.round : nextRound,
          currentStepIndex: triggerGameOver ? state.currentStepIndex : 0,
          currentNightDraft: triggerGameOver
            ? state.currentNightDraft
            : createEmptyNightDraft(nextRound),
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
        });
        return { allowed: true };
      },

      triggerBaiZeDelayedDeath: () => {
        const state = get();
        const res = resolveBaiZeDelayedDeath(
          state.seats,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
          state.treasureMasterState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
        );
        if (res.eliminatedSeat === null) return;
        const synced = finalizeDayDeathSync(state, res.seats);
        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );
        const summary = `白澤延遲死亡結算：神職繼承人 ${res.eliminatedSeat} 號於放逐階段後正式出局`;
        set({
          seats: synced.seats,
          mechWolfState: res.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: res.eliminatedSeat,
            eliminatedSeats: [res.eliminatedSeat],
            outcomeTag: 'bai_ze_delayed_death',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
        });
      },

      triggerSequencePrinceRevote: () => {
        const state = get();
        const res = resolveSequencePrinceRevote(
          state.seats,
          state.finalBatchState ?? createInitialFinalBatchState(),
        );
        if (!res.allowed) return { allowed: false, reason: res.reason };
        const summary = '定序王子翻牌發動技能：撤銷方才放逐、全員再發言一次並重新進行放逐投票！';
        const preSnap = state.preExileSnapshot as GameSnapshotData | null | undefined;
        if (preSnap) {
          set({
            seats: preSnap.seats,
            mechWolfState: preSnap.mechWolfState,
            gargoyleState: preSnap.gargoyleState,
            pumpkinGhostState: preSnap.pumpkinGhostState,
            superGravekeeperState: preSnap.superGravekeeperState,
            conversionState: preSnap.conversionState,
            thirdPartySpecialState: preSnap.thirdPartySpecialState,
            exiledHistory: preSnap.exiledHistory,
            activeCharmedSeat: preSnap.activeCharmedSeat,
            sheriffState: preSnap.sheriffState,
            pendingShooters: preSnap.pendingShooters,
            winner: null,
            winReason: null,
            phase: 'day_vote',
            preExileSnapshot: null,
            finalBatchState: {
              ...res.state,
              sequencePrinceUsed: true,
            },
            exilePkCandidates: [],
            exilePkStage: 'none',
            exilePkSpeakingOrder: [],
            exileResolvedToday: null,
            dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
              type: 'manual_judge',
              summary,
            }),
          });
          return { allowed: true };
        }
        set({
          finalBatchState: res.state,
          exilePkCandidates: [],
          exilePkStage: 'none',
          exilePkSpeakingOrder: [],
          exileResolvedToday: null,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            outcomeTag: 'sequence_prince_revote',
          }),
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
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          finalBatchState: res.state,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat,
            eliminatedSeats: res.targetSurvivedInvincible ? [] : [targetSeat],
            outcomeTag: 'detective_execute',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_announcement' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
        });
        return { allowed: true, targetWasWolf: res.targetWasWolf };
      },

      triggerWhiteNightRewind: () => {
        const state = get();
        const fbState = state.finalBatchState ?? createInitialFinalBatchState();
        const check = canWhiteNightEnvoyRewind(state.seats, fbState, state.round);
        if (!check.allowed) return { allowed: false, reason: check.reason };
        const nightStartSnap = state.nightStartSnapshot as GameSnapshotData | null | undefined;
        if (nightStartSnap) {
          set({
            ...nightStartSnap,
            phase: 'night',
            currentStepIndex: 0,
            currentNightDraft: createEmptyNightDraft(nightStartSnap.round),
            nightStartSnapshot: null,
            preExileSnapshot: null,
            finalBatchState: {
              ...(nightStartSnap.finalBatchState ?? createInitialFinalBatchState()),
              whiteNightEnvoyUsed: true,
            },
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
        });
        return { allowed: true };
      },

      selfExplode: (wolfSeat) => {
        const state = get();
        const result = resolveSelfExplode(state.seats, wolfSeat, state.finalBatchState, {
          round: state.round,
          ruleOverrides: state.ruleOverrides,
          mechWolfState: state.mechWolfState,
          treasureMasterState: state.treasureMasterState,
          inExileVoteStage: state.dayStage === 'exile_vote' || state.phase === 'day_vote',
        });
        if (!result.allowed) {
          return { allowed: false, reason: result.reason };
        }

        const explodeBadge = handleSheriffElectionExplode(
          state.sheriffState,
          state.ruleOverrides.badgeSwallowRule,
        );
        const swallowedBadge = explodeBadge.swallowed;
        const deferredBadge = explodeBadge.deferred;
        const seatsAfterExplode = mergePendingNightDeaths(
          result.seats ?? state.seats,
          state.pendingNightAnnouncement,
        );
        const synced = finalizeDayDeathSync(state, seatsAfterExplode);
        const nextSheriffState = syncSheriffBadgeOnDeaths(explodeBadge.sheriffState, synced.seats);

        const nextRound = state.round + 1;
        const explodingPlayer = state.seats.find((s) => s.seatNumber === wolfSeat);
        const isBloodMoonExplode = explodingPlayer?.roleId === 'blood_moon_apostle';
        const curCombat = state.combatState ?? createInitialCombatState();
        const nextCombatState = isBloodMoonExplode
          ? { ...curCombat, bloodMoonSealActiveTonight: true }
          : curCombat;
        const explodeSummary = isBloodMoonExplode
          ? `${wolfSeat} 號（血月使徒）自爆即刻出局，封印今晚所有好人技能並強制進入第 ${nextRound} 晚`
          : `${wolfSeat} 號狼人自爆即刻出局，直接進入第 ${nextRound} 晚`;
        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, explodeSummary, {
          type: 'self_explode',
          summary: explodeSummary,
          actorSeat: wolfSeat,
          eliminatedSeats: [wolfSeat],
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

        const triggerGameOver = shouldTriggerAutoVictory(
          synced.victory,
          state.forceContinueAfterVictory,
        );

        if (triggerGameOver) {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState ?? state.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            pendingSelfExplodeSeat: null,
            combatState: nextCombatState,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            enterNightAfterPendingShooters: false,
            winner: synced.victory.winner,
            winReason: synced.victory.winReason,
            preGameOverPhase: 'day_vote',
            phase: 'game_over',
          });
        } else {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState ?? state.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            pendingSelfExplodeSeat: null,
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
            exileResolvedToday: null,
            pendingNightAnnouncement: null,
            pendingShooters: [],
            enterNightAfterPendingShooters: false,
            phase: 'night',
          });
        }

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
          state.treasureMasterState,
          { thirdPartySpecialState: state.thirdPartySpecialState },
          { inExileVoteStage: state.dayStage === 'exile_vote' || state.phase === 'day_vote' },
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
        const seatsWithDeferred = mergePendingNightDeaths(
          result.seats,
          state.pendingNightAnnouncement,
        );
        const synced = finalizeDayDeathSync(state, seatsWithDeferred, {
          wolfKillPriorityOverride: result.charmedDeathSeat !== null,
        });
        const nextSheriffState = syncSheriffBadgeOnDeaths(explodeBadge.sheriffState, synced.seats);

        const nextRound = state.round + 1;
        const summary =
          targetSeat !== null
            ? `${wolfSeat} 號（白狼王）自爆即刻出局並帶走 ${targetSeat} 號`
            : `${wolfSeat} 號（白狼王）自爆即刻出局，強制進入第 ${nextRound} 晚`;

        let nextDayHistory = appendDayEvent(state.dayHistory, state.round, summary, {
          type: 'white_wolf_king_explode',
          summary,
          actorSeat: wolfSeat,
          targetSeat,
          eliminatedSeats: [
            wolfSeat,
            ...(targetSeat !== null ? [targetSeat] : []),
            ...(result.charmedDeathSeat !== null ? [result.charmedDeathSeat] : []),
          ],
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

        const chainedShooter =
          !triggerGameOver && result.chainedShootEligibility?.canShoot
            ? [
                {
                  ...result.chainedShootEligibility,
                  deathReason: 'white_wolf_king_explode' as const,
                },
              ]
            : [];

        if (triggerGameOver) {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            pendingSelfExplodeSeat: null,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: [],
            enterNightAfterPendingShooters: false,
            winner: synced.victory.winner,
            winReason: synced.victory.winReason,
            preGameOverPhase: 'day_vote',
            phase: 'game_over',
          });
        } else if (chainedShooter.length > 0) {
          // 被白狼王自爆帶走者可連鎖開槍：先停留在白天結算開槍，結算完成後自動入夜
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            pendingSelfExplodeSeat: null,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
            pendingShooters: chainedShooter,
            enterNightAfterPendingShooters: true,
          });
        } else {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            pendingSelfExplodeSeat: null,
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
            enterNightAfterPendingShooters: false,
            phase: 'night',
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
          state.treasureMasterState,
          {
            conversionState: state.conversionState,
            thirdPartySpecialState: state.thirdPartySpecialState,
            wolfGirlState: state.wolfGirlState,
            boardId: state.selectedBoardId ?? undefined,
          },
          {
            inSheriffElection: state.dayStage === 'sheriff_election',
            finalBatchState: state.finalBatchState,
            combatState: state.combatState,
          },
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
          eliminatedSeats: result.eliminatedSeat !== null ? [result.eliminatedSeat] : [],
          outcomeTag: result.targetWasWolf ? 'knight_hit' : 'knight_miss',
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
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
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
          });
        } else if (result.enterNightImmediately) {
          const nextRound = state.round + 1;
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
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
          });
        } else {
          set({
            seats: synced.seats,
            mechWolfState: result.mechWolfState,
            gargoyleState: synced.gargoyleState,
            pumpkinGhostState: synced.pumpkinGhostState,
            superGravekeeperState: synced.superGravekeeperState,
            conversionState: synced.conversionState,
            thirdPartySpecialState: synced.thirdPartySpecialState,
            knightDuelUsed: true,
            sheriffState: nextSheriffState,
            dayHistory: nextDayHistory,
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
        const chainedEligibility = !triggerGameOver
          ? checkCanShoot(synced.seats, targetSeat, 'pandora_day_gun', {
              round: state.round,
              ruleOverrides: state.ruleOverrides,
              thirdPartySpecialState: synced.thirdPartySpecialState,
              combatState: state.combatState,
              finalBatchState: state.finalBatchState,
              conversionState: synced.conversionState,
              boardId: state.selectedBoardId ?? undefined,
            })
          : null;
        const nextPendingShooters =
          chainedEligibility?.canShoot &&
          !state.pendingShooters.some((s) => s.seatNumber === chainedEligibility.seatNumber)
            ? [
                ...state.pendingShooters,
                {
                  ...chainedEligibility,
                  deathReason: 'pandora_day_gun' as const,
                },
              ]
            : state.pendingShooters;
        const summary = `${actorSeat} 號使用潘朵拉魔盒「白天手槍」擊殺 ${targetSeat} 號出局`;
        set({
          seats: synced.seats,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          pendingShooters: nextPendingShooters,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'hunter_shoot',
            summary,
            actorSeat,
            targetSeat,
            eliminatedSeats: [targetSeat],
            outcomeTag: 'pandora_day_gun',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
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
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          pendingSelfExplodeSeat: res.pendingSelfExplodeSeat,
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'self_explode',
            summary,
            actorSeat: wolfGirlSeat,
            targetSeat: res.breakupDeathSeat,
            eliminatedSeats: [
              wolfGirlSeat,
              ...(res.breakupDeathSeat !== null ? [res.breakupDeathSeat] : []),
            ],
            outcomeTag: 'wolf_girl_explode',
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
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
          conversionState: synced.conversionState,
          thirdPartySpecialState: synced.thirdPartySpecialState,
          sheriffState: syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats),
          dayHistory: appendDayEvent(state.dayHistory, state.round, summary, {
            type: 'manual_judge',
            summary,
            targetSeat: seatNumber,
            eliminatedSeats: [seatNumber],
            outcomeTag: 'masked_delayed_death',
          }),
          winner: triggerGameOver ? synced.victory.winner : state.winner,
          winReason: triggerGameOver ? synced.victory.winReason : state.winReason,
          preGameOverPhase: triggerGameOver ? 'day_vote' : state.preGameOverPhase,
          phase: triggerGameOver ? 'game_over' : state.phase,
        });
        return { allowed: true };
      },

      advanceToNextNight: () => {
        const state = get();
        if (state.winner) return;
        const nextRound = state.round + 1;
        const nextNightPatch = {
          round: nextRound,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(nextRound),
          speakingQueue: [] as number[],
          currentSpeakerIndex: 0,
          speakingMeta: null,
          remainingSeconds: state.defaultSpeakDurationSec,
          exilePkCandidates: [] as number[],
          exilePkStage: 'none' as const,
          exilePkSpeakingOrder: [] as number[],
          exileResolvedToday: null,
          pendingNightAnnouncement: null,
          pendingShooters: [] as PendingShooter[],
          phase: 'night' as const,
        };
        set({
          ...nextNightPatch,
          nightStartSnapshot: hasWhiteNightEnvoy(state)
            ? captureGameSnapshot({ ...state, ...nextNightPatch })
            : null,
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
              gargoyleState: state.gargoyleState ?? createInitialGargoyleState(),
              pumpkinGhostState: state.pumpkinGhostState ?? createInitialPumpkinGhostState(),
              superGravekeeperState:
                state.superGravekeeperState ?? createInitialSuperGravekeeperState(),
            }
          : finalizeDayDeathSync(state, result.seats);
        const nextSheriffState = syncSheriffBadgeOnDeaths(state.sheriffState, synced.seats);

        set({
          seats: synced.seats,
          mechWolfState: result.mechWolfState,
          gargoyleState: synced.gargoyleState,
          pumpkinGhostState: synced.pumpkinGhostState,
          superGravekeeperState: synced.superGravekeeperState,
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
            eliminatedSeats: result.becameAlive ? [] : [seatNumber],
            outcomeTag: result.becameAlive ? 'manual_revive' : 'manual_eliminate',
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
          preGameOverPhase:
            state.phase === 'day_announcement' || state.phase === 'day_vote'
              ? state.phase
              : state.preGameOverPhase,
          phase: 'game_over',
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
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<GameStore>;
        const normalizeSnapshotSeats = (snap: unknown): unknown => {
          if (!snap || typeof snap !== 'object') return snap ?? null;
          const record = snap as Record<string, unknown>;
          if (!Array.isArray(record.seats)) return snap;
          return { ...record, seats: normalizePlayerSeats(record.seats) };
        };
        return {
          ...currentState,
          ...persisted,
          seats: normalizePlayerSeats(persisted.seats ?? currentState.seats),
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
          ruleOverrides: mergeRuleOverrides(DEFAULT_RULE_OVERRIDES, persisted.ruleOverrides),
          dailyRandomDirection: persisted.dailyRandomDirection ?? 'clockwise',
          dayStage:
            persisted.dayStage ??
            (persisted.phase === 'day_vote' ? 'exile_vote' : 'death_announcement'),
          enterNightAfterPendingShooters: persisted.enterNightAfterPendingShooters ?? false,
          sheriffState: {
            ...createInitialSheriffState(),
            ...(persisted.sheriffState ?? {}),
          },
          voteInputMode: persisted.voteInputMode ?? 'by_voter',
          pendingNightAnnouncement: persisted.pendingNightAnnouncement
            ? {
                ...persisted.pendingNightAnnouncement,
                seats: normalizePlayerSeats(persisted.pendingNightAnnouncement.seats),
              }
            : null,
          nightStartSnapshot: normalizeSnapshotSeats(persisted.nightStartSnapshot),
          preExileSnapshot: normalizeSnapshotSeats(persisted.preExileSnapshot),
          exileResolvedToday: persisted.exileResolvedToday ?? null,
          forceContinueAfterVictory: persisted.forceContinueAfterVictory ?? false,
          preGameOverPhase: persisted.preGameOverPhase ?? null,
          passRevealConfirmedSeats: persisted.passRevealConfirmedSeats ?? [],
        };
      },
    },
  ),
);
