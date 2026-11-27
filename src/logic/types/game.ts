import type { RuleOverrides } from './board';
import type {
  DayHistoryEntry,
  ExileResolvedToday,
  SheriffState,
  SpeakingDirection,
  SpeakingOrderResult,
  VoteInputMode,
} from './day';
import type {
  NightActionDraft,
  NightHistoryEntry,
  PendingNightAnnouncement,
} from './night';
import type {
  BearRoarResult,
  CombatRuntimeState,
  ConversionRuntimeState,
  ExiledRecord,
  FinalBatchRuntimeState,
  GargoyleRuntimeState,
  HiddenWolfRuntimeState,
  HybridRuntimeState,
  InterferenceRuntimeState,
  MechWolfRuntimeState,
  MoonSpiritHowlResult,
  NineTailedFoxResult,
  PumpkinGhostRuntimeState,
  SeedWolfRuntimeState,
  SeniorVillagerRevealResult,
  SuperGravekeeperRuntimeState,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
  WolfGirlRuntimeState,
} from './roleStates';
import type { GameWinner, PlayerSeat } from './seat';

/** [V2.0 新增] 玩家雙模式筆記本型別 */
export type NotebookMode = 'freeform' | 'grid';

export interface NotebookStageColumn {
  key: string;
  label: string;
  shortLabel: string;
}

export interface NotebookState {
  mode: NotebookMode;
  freeformText: string;
  /** key: stageKey（如 'pre_game', 'sheriff', 'day_1', 'day_2'），value: Record<seatNumber, string> */
  gridCells: Record<string, Record<number, string>>;
}

/** [V2.0 新增] 法官手動勝負覆蓋類型 */
export type ManualVictoryOverrideKind =
  | 'good_surrender'
  | 'wolf_surrender'
  | 'force_draw'
  | 'good_win'
  | 'wolf_win'
  | 'third_party_win';

/** [V2.0 新增] 主持三大維度（組合成 8 種主持模式） */
export type JudgeMode = 'physical_judge' | 'online_judge';
export type DealMode = 'physical_deal' | 'online_deal';
export type ControlMode = 'central_control' | 'multi_device';

export interface HostModeConfig {
  judgeMode: JudgeMode;
  dealMode: DealMode;
  controlMode: ControlMode;
}

export interface HostModeDescriptor {
  modeNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  milestone: 'A' | 'B';
  availableInStandalone: boolean;
  shortTitle: string;
  description: string;
}

/** [V2.0 新增] 線上法官語音播報（TTS）與防窺緩衝設定 */
export interface OnlineJudgeSettings {
  ttsEnabled: boolean;
  /** 語速（預設 1.0，範圍 0.5 ~ 2.0） */
  ttsRate: number;
  /** 角色行動／已出局假裝等待秒數（預設 5，範圍 0 ~ 30） */
  stepBufferSeconds: number;
  /** 閉眼後等待下一角色睜眼的靜音間隔秒數（預設 3，範圍 0 ~ 15） */
  closeToOpenDelaySeconds: number;
}

/** [V2.0 新增] 夜間白噪音播放器設定 */
export type AmbientPresetId =
  | 'none'
  | 'rain'
  | 'white_noise'
  | 'pink_noise'
  | 'campfire'
  | 'custom';

export interface AmbientAudioSettings {
  presetId: AmbientPresetId;
  customFileName?: string | null;
  volume: number;
  autoPlayAtNight: boolean;
}

export type GamePhase =
  | 'host_setup'
  | 'board_select'
  | 'seat_setup'
  | 'pass_and_reveal'
  | 'night'
  | 'day_announcement'
  | 'day_vote'
  | 'game_over';

/** 白天嚴格四階段（警長競選 → 死訊與遺言技能 → 白天發言 → 放逐投票） */
export type DayStage =
  | 'sheriff_election'
  | 'death_announcement'
  | 'speaking'
  | 'exile_vote';

export interface VictoryResult {
  winner: GameWinner | null;
  winReason: string | null;
}

export interface VictoryCheckOptions {
  cursedFoxDiedThisResolution?: boolean;
  conversionState?: ConversionRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  wolfGirlState?: WolfGirlRuntimeState;
  boardId?: string;
  /** 是否啟用白天「綁票」自動判狼勝檢查（僅於白天死訊／放逐與技能／警徽移交結算完畢後傳入 true） */
  checkDayVoteTieLock?: boolean;
  /** 當前警長狀態（用於檢查好人陣營是否持有有效警徽） */
  sheriffState?: SheriffState;
  /** 戰鬥／特殊擊殺運行時狀態（用於檢查蜂之狂獵是否已失能） */
  combatState?: CombatRuntimeState;
}

export interface GameState {
  phase: GamePhase;
  /** 白天嚴格四階段狀態（持久化於 localStorage） */
  dayStage: DayStage;
  round: number;
  selectedBoardId: string | null;
  hostMode: HostModeConfig;
  onlineJudgeSettings: OnlineJudgeSettings;
  ambientAudio: AmbientAudioSettings;
  ruleOverrides: RuleOverrides;
  seats: PlayerSeat[];
  /** 線上發牌 × 中央操作：已完成傳閱確認身分之座號清單 */
  passRevealConfirmedSeats: number[];
  /** 持久化保存各座位暱稱，供重開新局時「保留上一局暱稱」使用 */
  savedNicknames: Record<number, string>;

  /** 夜間主持進度與消耗品追蹤 */
  currentStepIndex: number;
  currentNightDraft: NightActionDraft;
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  /** 若白天有狼人自爆，記錄其座位（當晚點刀後正式死亡） */
  pendingSelfExplodeSeat: number | null;

  /** 高頻進階角色運行時狀態 */
  lastCharmedSeat: number | null;
  activeCharmedSeat: number | null;
  lastDreamTarget: number | null;
  knightDuelUsed: boolean;
  lastBearRoar: BearRoarResult | null;
  lastFearedSeat?: number | null;
  evilKnightCounterUsed?: boolean;
  hybridState?: HybridRuntimeState;
  seedWolfState?: SeedWolfRuntimeState;
  hiddenWolfState?: HiddenWolfRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  wolfGirlState?: WolfGirlRuntimeState;
  /** 第 1 批：查驗與資訊感知類角色持久化狀態 */
  gargoyleState?: GargoyleRuntimeState;
  pumpkinGhostState?: PumpkinGhostRuntimeState;
  superGravekeeperState?: SuperGravekeeperRuntimeState;
  foxLostAbility?: boolean;
  exiledHistory?: ExiledRecord[];
  lastAwakenedDreamTarget?: number | null;
  lastMoonSpiritHowl?: MoonSpiritHowlResult | null;
  lastNineTailedFoxResult?: NineTailedFoxResult | null;
  lastSeniorVillagerReveal?: SeniorVillagerRevealResult | null;
  /** 第 2 批：干擾／交換／特殊守護持久化狀態 */
  interferenceState?: InterferenceRuntimeState;
  /** 第 3 批：免疫／反傷／額外傷害／特殊擊殺持久化狀態 */
  combatState?: CombatRuntimeState;
  /** 第 4 批：死亡連帶／認主／換牌／陣營轉換持久化狀態 */
  conversionState?: ConversionRuntimeState;
  /** 第 5 批：第三方獨立勝利／特殊計分／收集／贈禮持久化狀態 */
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  /** 第 6 批：最終 13 角色（吞噬／偷竊／無敵／偵探警犬／回溯）持久化狀態 */
  finalBatchState?: FinalBatchRuntimeState;

  /** 自動發言順序與單人倒數計時引擎 */
  dailyRandomDirection: SpeakingDirection;
  speakingQueue: number[];
  currentSpeakerIndex: number;
  speakingMeta: SpeakingOrderResult | null;
  defaultSpeakDurationSec: number;
  remainingSeconds: number;

  /** 警長競選、警徽與白天放逐投票狀態 */
  sheriffState: SheriffState;
  exilePkCandidates: number[];
  /** 放逐投票平票 PK 子階段：none（無 PK）/ pk_speaking（逆序 PK 發言）/ pk_voting（非 PK 重投） */
  exilePkStage?: 'none' | 'pk_speaking' | 'pk_voting';
  /** 放逐投票平票 PK 發言順序（依當天白天發言順序逆序） */
  exilePkSpeakingOrder?: number[];
  /** 首夜有警長競選時，暫存昨晚結算結果，待「公布死訊」階段才正式套用死亡與觸發警徽交接 */
  pendingNightAnnouncement?: PendingNightAnnouncement | null;
  /** 本日白天放逐結果是否已結算（放逐或平安日後鎖定禁止二輪放逐，僅定序王子重投可解除） */
  exileResolvedToday?: ExileResolvedToday | null;
  /** 中央操作雙模式投票紀錄器模式 */
  voteInputMode: VoteInputMode;

  /** 玩家雙模式筆記本（持久化於 localStorage） */
  notebook: NotebookState;

  /** 夜間毒師用毒持久化狀態／盜賊剩餘兩張底牌／入夜前與放逐前快照（供時間回溯與定序王子重投） */
  poisonerPoisonUsed?: boolean;
  thiefBottomCards?: string[];
  preNightSnapshot?: unknown | null;
  preExileSnapshot?: unknown | null;

  /** 歷史紀錄與勝負 */
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
  winner: GameWinner | null;
  winReason: string | null;
  /** 法官於自動勝負觸發後選擇強制繼續（解除自動結束鎖定） */
  forceContinueAfterVictory: boolean;
  /** 自動進入 game_over 前的階段（供強制繼續返回） */
  preGameOverPhase: 'day_announcement' | 'day_vote' | null;
}
