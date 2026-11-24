export type Faction = 'wolf' | 'good' | 'third_party';
export type GameWinner = Faction | 'draw';
export type RoleCategory = 'wolf' | 'god' | 'villager' | 'third_party';
export type PlayerCountFilter = '6' | '7' | '8' | '9' | '10' | '12' | 'multi';

/** [V2.0 新增] 中央操作雙模式投票紀錄器模式 */
export type VoteInputMode = 'by_voter' | 'by_candidate';

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
  | 'poisoner_poison'
  | 'seer_check'
  | 'psychic_check'
  | 'guard_protect'
  | 'hunter_gesture'
  | 'mech_wolf_learn'
  | 'mech_wolf_reveal_skill'
  | 'mech_wolf_night_action'
  | 'wolf_beauty_charm'
  | 'dream_catcher_dream'
  | 'wolf_girl_confess'
  | 'treasure_master_choose'
  | 'nightmare_fear'
  | 'hybrid_choose'
  | 'awakened_seer_check'
  | 'lantern_seer_check'
  | 'drunk_seer_check'
  | 'fool_seer_check'
  | 'fox_check'
  | 'gargoyle_check'
  | 'gargoyle_team_status'
  | 'wolf_witch_check'
  | 'pure_white_check'
  | 'demon_wolf_check'
  | 'pumpkin_ghost_check'
  | 'gravekeeper_check'
  | 'super_gravekeeper_action'
  | 'super_gravekeeper_heir_check'
  | 'nine_tailed_fox_check'
  | 'awakened_dream_catcher_dream'
  | 'awakened_dream_catcher_judge'
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
  /** 混血兒是否計入平民邊屠邊人數（預設 false 不計入屠邊；12 人局混血兒可切換開啟） */
  hybridCountsAsVillager?: boolean;
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
  | 'poisoner_poison'
  | 'milk_pierce'
  | 'exiled'
  | 'hunter_shoot'
  | 'wolf_king_shoot'
  | 'self_explode'
  | 'white_wolf_king_explode'
  | 'wolf_beauty_charm'
  | 'wolf_girl_breakup'
  | 'knight_duel'
  | 'knight_duel_fail'
  | 'dream_catcher_consecutive'
  | 'dream_catcher_link'
  | 'mech_wolf_poison'
  | 'mech_wolf_kill'
  | 'masked_delayed_death'
  | 'treasure_master_exile_delayed'
  | 'evil_knight_counter'
  | 'cursed_fox_checked'
  | 'pure_white_check_kill'
  | 'wolf_witch_check_kill'
  | 'nine_tailed_fox_no_tails'
  | 'awakened_dream_catcher_kill'
  | 'good_self_explode'
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
  /** 特殊狀態：蒙面人夜間被毒／攝／狼刀進入負傷延遲死亡（隔天發言後死亡） */
  maskedDelayedDeath?: boolean;
  /** 蒙面人觸發負傷的原始夜間死因 */
  maskedDelayedDeathReason?: DeathReason;
  /** 特殊狀態：盜寶蒙面狼為最後一狼被放逐時暫時不死，隔夜再刀一人後出局 */
  treasureMasterMaskedExileSurvived?: boolean;
  /** 特殊狀態：被種狼感染轉化為狼人陣營並失去原有技能 */
  infectedBySeedWolf?: boolean;
}

export interface MechWolfRuntimeState {
  learnedFromSeat: number | null;
  learnedRoleId: string | null;
  hasJoinedWolfTeam: boolean;
  usedLearnedOneShotSkill: boolean;
  lastGuardedSeat: number | null;
}

export interface WolfGirlRuntimeState {
  confessedSeat: number | null;
  /** true: 表白平民成功（與狼隊同勝但身分維持平民）；false: 表白神職失敗；null: 尚未表白 */
  confessSuccess: boolean | null;
  /** 表白成功時該平民的勝利條件與狼隊相同 */
  alignedWithWolf: boolean;
}

export type TreasureMasterAffiliation = 'wolf' | 'god' | 'villager' | null;

export interface TreasureMasterRuntimeState {
  /** 首夜剩餘三張底牌的角色 ID */
  bottomCards: string[];
  /** 依底牌規則判定之陣營／屠邊歸屬（盜寶狼→wolf；好人雙神→god；好人雙民→villager） */
  affiliation: TreasureMasterAffiliation;
  /** 盜寶狼是否已因場上原狼全滅而入狼隊帶刀 */
  hasJoinedWolfTeam: boolean;
  /** 上一晚選擇使用的底牌角色 ID（連續兩晚不可選相同技能） */
  lastChosenCardRoleId: string | null;
  /** 今晚選擇使用的底牌角色 ID */
  currentNightCardRoleId: string | null;
  /** 盜寶蒙面狼為最後一狼被放逐免死後，標記隔夜點刀後正式死亡 */
  pendingExileDeathNextNight: boolean;
}

export interface HybridRuntimeState {
  /** 首夜選擇的榜樣座號 */
  idolSeat: number | null;
  /** 綁定之勝利陣營（依榜樣所屬陣營即時決定） */
  alignedFaction: Faction | null;
}

export interface SeedWolfRuntimeState {
  /** 整局限一次之感染技能是否已使用 */
  infectUsed: boolean;
  /** 被成功感染轉化為狼人的座號（若遭守衛擋下則為 null） */
  infectedSeat: number | null;
}

export interface HiddenWolfRuntimeState {
  /** 場上其他狼人全數出局後，隱狼自動入狼隊並獲得狼刀權限 */
  hasJoinedWolfTeam: boolean;
}

export interface ExiledRecord {
  round: number;
  seatNumber: number;
  roleId: string | null;
  infectedBySeedWolf?: boolean;
}

export interface GargoyleCheckRecord {
  round: number;
  targetSeat: number;
  perceivedRoleId: string;
}

export interface GargoyleRuntimeState {
  /** 場上其他狼人全數出局後，石像鬼自動入狼隊並獲得狼刀權限 */
  hasJoinedWolfTeam: boolean;
  /** 石像鬼歷夜查驗紀錄（供石像鬼出局後南瓜鬼繼承） */
  checkHistory: GargoyleCheckRecord[];
}

export interface PumpkinGhostRuntimeState {
  /** 石像鬼出局後南瓜鬼是否已繼承查驗能力與歷史紀錄 */
  hasInherited: boolean;
  inheritedHistory: GargoyleCheckRecord[];
}

export interface SuperGravekeeperRuntimeState {
  /** 最新選定的繼承者座號 */
  heirSeat: number | null;
  /** 超級守墓人出局後，好人繼承者是否已接手墓地查驗 */
  heirInherited: boolean;
  /** 超級守墓人本人的座號（供繼承者得知） */
  superGravekeeperSeat: number | null;
}

export interface AwakenedSeerCheckOutcome {
  targetSeats: [number, number];
  result: 'double_good' | 'suspected_wolf';
}

export interface FoxCheckOutcome {
  centerSeat: number;
  checkedSeats: number[];
  hasWolf: boolean;
  lostAbility: boolean;
}

export interface DemonWolfCheckOutcome {
  targetSeat: number;
  roleType: 'god' | 'villager';
}

export interface GravekeeperExileOutcome {
  exiledSeat: number | null;
  faction: 'wolf' | 'good' | null;
  summary: string;
}

export interface MoonSpiritHowlResult {
  moonSpiritSeat: number | null;
  alive: boolean;
  leftNeighborSeat: number | null;
  rightNeighborSeat: number | null;
  howled: boolean;
  reason: string;
}

export interface NineTailedFoxResult {
  seatNumber: number | null;
  alive: boolean;
  tailsRemaining: number;
  diedFromNoTails: boolean;
  reason: string;
}

export interface SeniorVillagerRevealResult {
  seatNumber: number | null;
  revealed: boolean;
  reason: string;
}

export interface AwakenedDreamCheckOutcome {
  targetSeat: number;
  didActTonight: boolean;
  killedByDream: boolean;
  reason: string;
}

export interface NightActionDraft {
  round: number;
  guardTarget: number | null;
  wolfTarget: number | null;
  witchUseAntidote: boolean;
  witchPoisonTarget: number | null;
  poisonerTarget?: number | null;
  seerCheckTarget: number | null;
  psychicCheckTarget: number | null;
  mechWolfLearnTarget: number | null;
  mechWolfSkillTarget: number | null;
  wolfBeautyCharmTarget?: number | null;
  dreamCatcherTarget?: number | null;
  wolfGirlConfessTarget?: number | null;
  treasureMasterCardRoleId?: string | null;
  nightmareFearTarget?: number | null;
  hybridIdolTarget?: number | null;
  seedWolfInfectTarget?: number | null;
  /** 第 1 批：查驗與資訊感知類角色夜間草稿 */
  awakenedSeerTargets?: [number | null, number | null];
  lanternSeerCheckTarget?: number | null;
  drunkSeerCheckTarget?: number | null;
  drunkSeerManualResult?: 'good' | 'wolf' | null;
  foolSeerCheckTarget?: number | null;
  foxCheckTarget?: number | null;
  gargoyleCheckTarget?: number | null;
  wolfWitchCheckTarget?: number | null;
  pureWhiteCheckTarget?: number | null;
  demonWolfCheckTarget?: number | null;
  pumpkinGhostCheckTarget?: number | null;
  superGravekeeperHeirTarget?: number | null;
  awakenedDreamTarget?: number | null;
  awakenedDreamKillTarget?: boolean;
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
  moonSpiritHowl?: MoonSpiritHowlResult | null;
  nineTailedFoxResult?: NineTailedFoxResult | null;
  seniorVillagerReveal?: SeniorVillagerRevealResult | null;
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
  | 'good_self_explode'
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
  lastFearedSeat?: number | null;
  evilKnightCounterUsed?: boolean;
  hybridState?: HybridRuntimeState;
  seedWolfState?: SeedWolfRuntimeState;
  hiddenWolfState?: HiddenWolfRuntimeState;
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

  /** 玩家雙模式筆記本（持久化於 localStorage） */
  notebook: NotebookState;

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
  poisonerPoisonUsed?: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  pendingSelfExplodeSeat: number | null;
  lastCharmedSeat?: number | null;
  lastDreamTarget?: number | null;
  wolfGirlState?: WolfGirlRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  /** 首夜狼人無刀板子（如狼女孩、盜寶大師）於第一晚強制禁止狼刀 */
  firstNightNoWolfKill?: boolean;
  /** 夢魘上一晚恐懼對象（不可連恐同一人） */
  lastFearedSeat?: number | null;
  /** 惡靈騎士一次性反傷是否已觸發 */
  evilKnightCounterUsed?: boolean;
  /** 同晚預言家與女巫同時對惡靈騎士施放技能時，預言家是否先於女巫行動（預設 false：女巫先於預言家） */
  seerActsBeforeWitch?: boolean;
  hybridState?: HybridRuntimeState;
  seedWolfState?: SeedWolfRuntimeState;
  hiddenWolfState?: HiddenWolfRuntimeState;
  /** 第 1 批：查驗與資訊感知類角色輸入狀態 */
  gargoyleState?: GargoyleRuntimeState;
  pumpkinGhostState?: PumpkinGhostRuntimeState;
  superGravekeeperState?: SuperGravekeeperRuntimeState;
  foxLostAbility?: boolean;
  exiledHistory?: ExiledRecord[];
  lastAwakenedDreamTarget?: number | null;
  /** 測試可注入之亂數產生器（酒鬼預言家預設隨機用） */
  rng?: () => number;
}

export interface NightResolutionResult {
  seats: PlayerSeat[];
  deaths: NightDeathRecord[];
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  poisonerPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  pendingSelfExplodeSeat: number | null;
  lastCharmedSeat: number | null;
  activeCharmedSeat: number | null;
  lastDreamTarget: number | null;
  wolfGirlState: WolfGirlRuntimeState;
  treasureMasterState: TreasureMasterRuntimeState;
  lastFearedSeat: number | null;
  evilKnightCounterUsed: boolean;
  hybridState: HybridRuntimeState;
  seedWolfState: SeedWolfRuntimeState;
  hiddenWolfState: HiddenWolfRuntimeState;
  gargoyleState: GargoyleRuntimeState;
  pumpkinGhostState: PumpkinGhostRuntimeState;
  superGravekeeperState: SuperGravekeeperRuntimeState;
  foxLostAbility: boolean;
  lastAwakenedDreamTarget: number | null;
  /** 今晚因蒙面人被動而進入負傷／中毒延遲死亡的座號 */
  maskedDelayedSeats: number[];
  bearRoar: BearRoarResult | null;
  moonSpiritHowl: MoonSpiritHowlResult | null;
  nineTailedFoxResult: NineTailedFoxResult | null;
  seniorVillagerReveal: SeniorVillagerRevealResult | null;
  seerResult: SeerCheckOutcome | null;
  psychicResult: PsychicCheckOutcome | null;
  mechWolfPsychicResult: PsychicCheckOutcome | null;
  awakenedSeerResult: AwakenedSeerCheckOutcome | null;
  lanternSeerResult: SeerCheckOutcome | null;
  drunkSeerResult: SeerCheckOutcome | null;
  foolSeerResult: SeerCheckOutcome | null;
  foxResult: FoxCheckOutcome | null;
  gargoyleResult: PsychicCheckOutcome | null;
  wolfWitchResult: PsychicCheckOutcome | null;
  pureWhiteResult: PsychicCheckOutcome | null;
  demonWolfResult: DemonWolfCheckOutcome | null;
  pumpkinGhostResult: PsychicCheckOutcome | null;
  gravekeeperResult: GravekeeperExileOutcome | null;
  awakenedDreamResult: AwakenedDreamCheckOutcome | null;
  shootEligibilities: ShootEligibility[];
  victory: VictoryResult;
}

export interface GoodSelfExplodeResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  actorSeat: number;
  enterNightImmediately: boolean;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface DayExileResult {
  seats: PlayerSeat[];
  exiledSeat: number;
  idiotRevealed: boolean;
  /** 盜寶蒙面狼為最後一狼被放逐時暫時免死並可隔夜再刀一人 */
  treasureMasterMaskedSurvived?: boolean;
  charmedDeathSeat: number | null;
  shootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  victory: VictoryResult;
}

export interface WolfGirlExplodeResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  wolfGirlSeat: number;
  /** 因愛情破裂直接出局的先前表白對象（若存活），出局後無法發動技能 */
  breakupDeathSeat: number | null;
  /** 本輪放逐投票是否直接作廢 */
  voidedExileVote: boolean;
  pendingSelfExplodeSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface MaskedDelayedDeathResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  eliminatedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  victory: VictoryResult;
}

export interface ShootResolutionResult {
  seats: PlayerSeat[];
  shooterSeat: number;
  targetSeat: number;
  deathReason: 'hunter_shoot' | 'wolf_king_shoot';
  /** 夜間獵人開槍射中惡靈騎士時，惡靈騎士免疫夜間傷害存活 */
  targetSurvived?: boolean;
  charmedDeathSeat: number | null;
  chainedShootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  hiddenWolfState?: HiddenWolfRuntimeState;
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
