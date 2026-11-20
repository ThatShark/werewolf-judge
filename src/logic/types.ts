export type Faction = 'wolf' | 'good' | 'third_party';
export type RoleCategory = 'wolf' | 'god' | 'villager' | 'third_party';
export type PlayerCountFilter = '6' | '7' | '8' | '9' | '10' | '12' | 'multi';

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
}

export interface NightDeathRecord {
  seat: number;
  reason: DeathReason;
}

export interface NightHistoryEntry {
  round: number;
  draft: NightActionDraft;
  deaths: NightDeathRecord[];
}

export interface DayHistoryEntry {
  round: number;
  events: string[];
}

export interface GameState {
  phase: GamePhase;
  round: number;
  selectedBoardId: string | null;
  ruleOverrides: RuleOverrides;
  seats: PlayerSeat[];
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

  /** 歷史紀錄與勝負 */
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
  winner: Faction | null;
  winReason: string | null;
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
  winner: Faction | null;
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
}

export interface NightResolutionResult {
  seats: PlayerSeat[];
  deaths: NightDeathRecord[];
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  pendingSelfExplodeSeat: number | null;
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
  shootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface ShootResolutionResult {
  seats: PlayerSeat[];
  shooterSeat: number;
  targetSeat: number;
  deathReason: 'hunter_shoot' | 'wolf_king_shoot';
  chainedShootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

export interface SelfExplodeResult {
  allowed: boolean;
  reason?: string;
  pendingSelfExplodeSeat: number | null;
}
