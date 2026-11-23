export type Faction = 'wolf' | 'good' | 'third_party';
export type GameWinner = Faction | 'draw';
export type RoleCategory = 'wolf' | 'god' | 'villager' | 'third_party';
export type PlayerCountFilter = '6' | '7' | '8' | '9' | '10' | '12' | 'multi';

/** [V2.0 新增] 中央操作雙模式投票紀錄器模式 */
export type VoteInputMode = 'by_voter' | 'by_candidate';

/** [V2.0 新增] 法官手動勝負覆蓋類型 */
export type ManualVictoryOverrideKind =
  | 'good_surrender'
  | 'wolf_surrender'
  | 'force_draw'
  | 'good_win'
  | 'wolf_win'
  | 'third_party_win';

export interface RoleDefinition {
  id: string;
  name: string;
  aliases: string[];
  faction: Faction;
  category: RoleCategory;
  description: string;
  warnings?: string[];
}

/** 夜間單一行動步驟（對應「夜間睜眼順序」與「法官夜間主持」表格列） */
export type NightActionType =
  | 'wolf_kill'
  | 'witch_action'
  | 'seer_check'
  | 'psychic_check'
  | 'guard_protect'
  | 'hunter_gesture'
  | 'mech_wolf_learn'
  | 'mech_wolf_reveal_skill'
  | 'mech_wolf_night_action'
  | 'wolf_beauty_charm'
  | 'dream_catcher_dream'
  | 'confirm_only';

export interface NightStepScript {
  stepId: string;
  actorLabel: string;
  actorRoleIds: string[];
  actionType: NightActionType;
  /** 法官夜間主持三段式台詞（直接對應 docs/boards-raw.md 表格三欄） */
  openPrompt: string;
  actionPrompt: string;
  closePrompt: string;
  /** 法官即時提示（例如同守同救奶穿提醒、不能連守提醒） */
  judgeTips?: string[];
}

/** 常見 Q & A 條目 */
export interface BoardQA {
  id: string;
  question: string;
  answer: string;
  relatedRoleIds?: string[];
}

/** 板子內的角色配置項目 */
export interface RoleSlot {
  roleId: string;
  count: number;
}

/** 規則微調開關 */
export type WitchSelfSaveRule = 'first_night_only' | 'never' | 'always';
/** [V2.0 擴充] 吞警徽規則：單爆吞警徽 / 雙爆吞警徽 */
export type BadgeSwallowRule = 'single_explode' | 'double_explode';

export interface RuleOverrides {
  /** 女巫能否自救：僅首夜可自救 / 全程不可自救 / 全程可自救 */
  witchSelfSave: WitchSelfSaveRule;
  /** 白痴白天被放逐翻牌免死後，是否仍需被追刀才算神職出局 */
  idiotNeedsExtraKill: boolean;
  /** 機械狼第一晚是否強制學習一名玩家 */
  mechWolfForceLearnNight1: boolean;
  /** 狼刀在先（預設 true） */
  wolfKillPriority: boolean;
  /** 勝利條件：屠邊（預設）或屠城 */
  victoryMode: 'slaughter_side' | 'slaughter_all';
  /** [V2.0 擴充] 是否開啟警長競選（預設 true） */
  enableSheriff: boolean;
  /** [V2.0 擴充] 吞警徽規則：單爆吞警徽 / 雙爆吞警徽 */
  badgeSwallowRule: BadgeSwallowRule;
  /** [V2.0 擴充] 無警長時有死訊的發言方向（預設 clockwise 順時針） */
  noSheriffDeadDirection: SpeakingDirection;
  /** [V2.0 擴充] 有警長且有死訊時，是否優先採用死左／死右（平安夜切回警左／警右） */
  sheriffUseDeadSideOnDeath: boolean;
}

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
  /** 閉眼到下一角色睜眼緩衝秒數（預設 3，範圍 0 ~ 15） */
  stepBufferSeconds: number;
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

export interface ClaimSeatRoleResult {
  ok: boolean;
  reason?: string;
  seats: PlayerSeat[];
}

export interface StepClaimRoleStatus {
  roleId: string;
  expectedCount: number;
  claimedSeats: number[];
  remainingCount: number;
}

export interface StepClaimSummary {
  roles: StepClaimRoleStatus[];
  /** 此步驟在實體發牌首夜是否有需要認領的角色 */
  requiresClaiming: boolean;
  /** 此步驟所有角色是否皆已認領完成 */
  isComplete: boolean;
  totalExpected: number;
  totalClaimed: number;
}

/** 板子完整定義 */
export interface BoardDefinition {
  id: string;
  name: string;
  playerCount: number;
  playerCountRange?: [number, number];
  playerCountFilter: PlayerCountFilter;
  keywords: string[];
  composition: {
    wolf: RoleSlot[];
    good: RoleSlot[];
    thirdParty?: RoleSlot[];
  };
  /** 是否為彈性選配／含額外底牌／多預設人數之板子 */
  isFlexibleComposition?: boolean;
  /** 特殊配置或額外規則提醒 */
  compositionNote?: string;
  /** 多人數板子可選的預設人數列表 */
  presetPlayerCounts?: number[];
  /** 自動結算支援層級（full: 全自動結算；partial_manual: 含進階角色需手動標記輔助） */
  automationLevel?: 'full' | 'partial_manual';
  /** 夜間流程：支援「每晚相同」或「第一晚 / 第二晚之後」 */
  nightSchedule: {
    firstNight: NightStepScript[];
    subsequentNights: NightStepScript[];
  };
  /** 本板子專屬的常見 Q & A 與通用規則提醒 */
  qaList: BoardQA[];
  /** 此板子在開局畫面應顯示哪些規則微調開關 */
  supportedRuleToggles: Array<keyof RuleOverrides>;
}

export type GamePhase =
  | 'board_select'
  | 'seat_setup'
  | 'pass_and_reveal'
  | 'night'
  | 'day_announcement'
  | 'day_vote'
  | 'game_over';

export type DeathReason =
  | 'wolf_kill'
  | 'witch_poison'
  | 'milk_pierce'
  | 'exiled'
  | 'hunter_shoot'
  | 'wolf_king_shoot'
  | 'self_explode'
  | 'white_wolf_king_explode'
  | 'wolf_beauty_charm'
  | 'knight_duel'
  | 'knight_duel_fail'
  | 'dream_catcher_consecutive'
  | 'dream_catcher_link'
  | 'mech_wolf_poison'
  | 'mech_wolf_kill'
  | 'manual_judge';

export interface PlayerSeat {
  seatNumber: number;
  nickname: string;
  roleId: string | null;
  isAlive: boolean;
  deathReason?: DeathReason;
  deathRound?: number;
  /** 特殊狀態：白痴已翻牌免死（失去投票權） */
  idiotRevealed?: boolean;
}

export interface MechWolfRuntimeState {
  learnedFromSeat: number | null;
  learnedRoleId: string | null;
  hasJoinedWolfTeam: boolean;
  usedLearnedOneShotSkill: boolean;
  lastGuardedSeat: number | null;
}

export interface NightActionDraft {
  round: number;
  guardTarget: number | null;
  wolfTarget: number | null;
  witchUseAntidote: boolean;
  witchPoisonTarget: number | null;
  seerCheckTarget: number | null;
  psychicCheckTarget: number | null;
  mechWolfLearnTarget: number | null;
  mechWolfSkillTarget: number | null;
  wolfBeautyCharmTarget?: number | null;
  dreamCatcherTarget?: number | null;
}

export interface BearRoarResult {
  bearSeat: number | null;
  bearAlive: boolean;
  leftNeighborSeat: number | null;
  rightNeighborSeat: number | null;
  roared: boolean;
  reason: string;
}

/** 發言順序與單人計時型別 */
export type SpeakingDirection = 'clockwise' | 'counterclockwise';

export type SpeakingOrderMode =
  | 'random'
  | 'sheriff_left'
  | 'sheriff_right'
  | 'dead_left'
  | 'dead_right';

export interface SpeakingOrderOptions {
  mode: SpeakingOrderMode;
  /** 隨機模式下可限定候選座位（如警上候選人）；未傳則涵蓋全體存活玩家 */
  candidateSeats?: number[];
  /** 現任警長座位（警左／警右必填；死左／死右有警長時自動排最後歸票位） */
  sheriffSeat?: number | null;
  /** 基準死者座位（死左／死右必填，多死時由法官指定） */
  referenceDeadSeat?: number | null;
  /** 測試可注入之亂數產生器，預設 Math.random */
  rng?: () => number;
}

export interface SpeakingOrderResult {
  mode: SpeakingOrderMode;
  direction: SpeakingDirection;
  startSeat: number | null;
  anchorSeat: number | null;
  sheriffLastSeat: number | null;
  queue: number[];
}

/** 警長競選與投票明細型別 */
export type SheriffStatus =
  | 'not_started'
  | 'sign_up'
  | 'speaking'
  | 'voting'
  | 'pk_speaking'
  | 'pk_voting'
  | 'deferred_after_first_explode'
  | 'elected'
  | 'swallowed'
  | 'no_sheriff';

export type BadgeStatus = 'none' | 'active' | 'destroyed' | 'swallowed';

export interface VoteRoundRecord {
  roundIndex: number;
  votes: Record<number, number | null>;
  totals: Record<number, number>;
  votersByTarget: Record<number, number[]>;
  abstainers: number[];
  extraVotes?: Record<number, number>;
  tiedSeats: number[];
  electedSeat: number | null;
}

export interface SheriffState {
  status: SheriffStatus;
  sheriffSeat: number | null;
  badgeStatus: BadgeStatus;
  candidates: number[];
  withdrawnSeats: number[];
  pkCandidates: number[];
  voteRounds: VoteRoundRecord[];
  pendingBadgeTransferFrom: number | null;
  /** 警上累計自爆次數（搭配 badgeSwallowRule 判定單爆／雙爆吞警徽） */
  explodeCountDuringElection: number;
}

export type ExileVoteOutcome = 'exile' | 'tie' | 'no_exile';

export interface ExileVoteTallyResult {
  outcome: ExileVoteOutcome;
  record: VoteRoundRecord;
}

export interface NightDeathRecord {
  seat: number;
  reason: DeathReason;
}

export interface NightHistoryEntry {
  round: number;
  draft: NightActionDraft;
  deaths: NightDeathRecord[];
  bearRoar?: BearRoarResult | null;
}

export type DayStructuredEventType =
  | 'sheriff_signup'
  | 'sheriff_withdraw'
  | 'sheriff_vote'
  | 'sheriff_elected'
  | 'sheriff_swallowed'
  | 'sheriff_deferred_explode'
  | 'sheriff_no_winner'
  | 'badge_transfer'
  | 'badge_destroy'
  | 'exile_vote'
  | 'exile_pk'
  | 'exile_result'
  | 'idiot_reveal'
  | 'hunter_shoot'
  | 'wolf_king_shoot'
  | 'self_explode'
  | 'white_wolf_king_explode'
  | 'knight_duel'
  | 'wolf_beauty_charm_death'
  | 'manual_judge'
  | 'victory_override_continue'
  | 'declare_winner';

export interface DayStructuredEvent {
  type: DayStructuredEventType;
  summary: string;
  actorSeat?: number | null;
  targetSeat?: number | null;
  voteRecord?: VoteRoundRecord;
}

export interface DayHistoryEntry {
  round: number;
  events: string[];
  structuredEvents?: DayStructuredEvent[];
}

export interface GameState {
  phase: GamePhase;
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

  /** 自動發言順序與單人倒數計時引擎 */
  speakingQueue: number[];
  currentSpeakerIndex: number;
  speakingMeta: SpeakingOrderResult | null;
  defaultSpeakDurationSec: number;
  remainingSeconds: number;

  /** 警長競選、警徽與白天放逐投票狀態 */
  sheriffState: SheriffState;
  exilePkCandidates: number[];
  /** 中央操作雙模式投票紀錄器模式 */
  voteInputMode: VoteInputMode;

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

/** 規則引擎純函式共用結果型別 */
export interface ActionCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface RoleAssignmentValidation {
  valid: boolean;
  errors: string[];
  missingRoles: Record<string, number>;
  extraRoles: Record<string, number>;
}

export interface VictoryResult {
  winner: GameWinner | null;
  winReason: string | null;
}

export interface ShootEligibility {
  seatNumber: number;
  roleId: 'hunter' | 'wolf_king';
  canShoot: boolean;
  reason: string;
}

export interface SeerCheckOutcome {
  targetSeat: number;
  faction: 'wolf' | 'good';
}

export interface PsychicCheckOutcome {
  targetSeat: number;
  perceivedRoleId: string;
}

export interface NightResolutionInput {
  seats: PlayerSeat[];
  round: number;
  draft: NightActionDraft;
  ruleOverrides: RuleOverrides;
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  pendingSelfExplodeSeat: number | null;
  lastCharmedSeat?: number | null;
  lastDreamTarget?: number | null;
}

export interface NightResolutionResult {
  seats: PlayerSeat[];
  deaths: NightDeathRecord[];
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  pendingSelfExplodeSeat: number | null;
  lastCharmedSeat: number | null;
  activeCharmedSeat: number | null;
  lastDreamTarget: number | null;
  bearRoar: BearRoarResult | null;
  seerResult: SeerCheckOutcome | null;
  psychicResult: PsychicCheckOutcome | null;
  mechWolfPsychicResult: PsychicCheckOutcome | null;
  shootEligibilities: ShootEligibility[];
  victory: VictoryResult;
}

export interface DayExileResult {
  seats: PlayerSeat[];
  exiledSeat: number;
  idiotRevealed: boolean;
  charmedDeathSeat: number | null;
  shootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface ShootResolutionResult {
  seats: PlayerSeat[];
  shooterSeat: number;
  targetSeat: number;
  deathReason: 'hunter_shoot' | 'wolf_king_shoot';
  charmedDeathSeat: number | null;
  chainedShootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface SelfExplodeResult {
  allowed: boolean;
  reason?: string;
  pendingSelfExplodeSeat: number | null;
}

export interface WhiteWolfKingExplodeResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  wolfSeat: number;
  targetSeat: number | null;
  charmedDeathSeat: number | null;
  pendingSelfExplodeSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface KnightDuelResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  knightSeat: number;
  targetSeat: number;
  targetWasWolf: boolean;
  eliminatedSeat: number | null;
  deathReason: 'knight_duel' | 'knight_duel_fail' | null;
  enterNightImmediately: boolean;
  knightDuelUsed: boolean;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}
