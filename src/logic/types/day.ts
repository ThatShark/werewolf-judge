import type { VictoryResult } from './game';
import type {
  CombatRuntimeState,
  HiddenWolfRuntimeState,
  MechWolfRuntimeState,
  TreasureMasterRuntimeState,
} from './roleStates';
import type { PlayerSeat } from './seat';

/** [V2.0 新增] 中央操作雙模式投票紀錄器模式 */
export type VoteInputMode = 'by_voter' | 'by_candidate';

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
  /** 當輪具投票權之座位清單（供區分棄票 X 與無投票權 -） */
  eligibleVoters?: number[];
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
  /** 最初上警報名名單（不受後續退水或雙爆移除已死候選人影響） */
  initialCandidates?: number[];
  /** 警長競選最初當選座號（不受後續移交或撕毀警徽影響） */
  initialElectedSeat?: number | null;
  withdrawnSeats: number[];
  pkCandidates: number[];
  /** 上警競選發言的原始順序（供平票 PK 依逆序發言使用） */
  initialSpeakingOrder?: number[];
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

export interface ExileResolvedToday {
  outcome: 'exile' | 'no_exile' | 'idiot_revealed' | 'survived';
  seat: number | null;
  summary: string;
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
  /** 本事件造成出局的座號清單（含連鎖殉情等） */
  eliminatedSeats?: number[];
  /** 結構化結果標記（如 knight_hit / knight_miss / idiot_reveal 等） */
  outcomeTag?: string;
  voteRecord?: VoteRoundRecord;
}

export interface DayHistoryEntry {
  round: number;
  events: string[];
  structuredEvents?: DayStructuredEvent[];
}

/** 規則引擎純函式共用結果型別 */
export interface ActionCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface ShootEligibility {
  seatNumber: number;
  roleId:
    | 'hunter'
    | 'wolf_king'
    | 'awakened_hunter'
    | 'lucky_gun'
    | 'awakened_wolf_king'
    | 'wolf_gun'
    | 'pandora_day_gun'
    | 'evil_merchant_gun'
    | 'grey_wolf_gun';
  canShoot: boolean;
  reason: string;
  shotsRemaining?: number;
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
  /** 覺醒狼美人翻牌免死時由魅惑對象代替出局之座號 */
  awakenedWolfBeautySubstitutedSeat?: number | null;
  charmedDeathSeat: number | null;
  shootEligibility: ShootEligibility | null;
  mechWolfState: MechWolfRuntimeState;
  treasureMasterState?: TreasureMasterRuntimeState;
  combatState?: CombatRuntimeState;
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
  seats?: PlayerSeat[];
  pendingSelfExplodeSeat: number | null;
  mechWolfState?: MechWolfRuntimeState;
  victory?: VictoryResult;
}

export interface WhiteWolfKingExplodeResult {
  allowed: boolean;
  reason?: string;
  seats: PlayerSeat[];
  wolfSeat: number;
  targetSeat: number | null;
  charmedDeathSeat: number | null;
  chainedShootEligibility?: ShootEligibility | null;
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
