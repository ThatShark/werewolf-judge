import type { RuleOverrides } from './board';
import type { ShootEligibility } from './day';
import type { VictoryResult } from './game';
import type {
  AwakenedDreamCheckOutcome,
  AwakenedSeerCheckOutcome,
  BearRoarResult,
  CombatRuntimeState,
  ConversionRuntimeState,
  DemonWolfCheckOutcome,
  ExiledRecord,
  FinalBatchRuntimeState,
  FoxCheckOutcome,
  GargoyleRuntimeState,
  GravekeeperExileOutcome,
  HiddenWolfRuntimeState,
  HybridRuntimeState,
  InterferenceRuntimeState,
  MechWolfRuntimeState,
  MerchantGiftItem,
  MoonSpiritHowlResult,
  NineTailedFoxResult,
  PandoraBoxItem,
  PsychicCheckOutcome,
  PumpkinGhostRuntimeState,
  SeedWolfRuntimeState,
  SeerCheckOutcome,
  SeniorVillagerRevealResult,
  SuperGravekeeperRuntimeState,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
  WolfGirlRuntimeState,
} from './roleStates';
import type { DeathReason, PlayerSeat } from './seat';

export interface NightActionDraft {
  round: number;
  guardTarget: number | null;
  wolfTarget: number | null;
  witchUseAntidote: boolean;
  witchPoisonTarget: number | null;
  witchSecondPoisonTarget?: number | null;
  guardSecondTarget?: number | null;
  radiantEarlSecondShieldTarget?: number | null;
  mentorAmplifySoloKillTarget?: number | null;
  awakenedGargoyleConvertTargets?: number[];
  demonHunterTargets?: Array<{ actorSeat: number; targetSeat: number }>;
  scentPhantomChains?: Array<[number, number]>;
  mediumSkillActions?: Array<{ actorSeat: number; targetSeat: number }>;
  eclipseMaidDevourDualTargets?: [number, number] | null;
  greyWolfBossIntelligenceGuessCorrect?: boolean | null;
  ghostBrideKillTarget?: number | null;
  evilMerchantPoisonActionTarget?: number | null;
  chameleonWolfOriginalRoleId?: string | null;
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
  /** 第 2 批：干擾、封鎖、目標交換與特殊守護類角色夜間草稿 */
  magicianSwapPair?: [number | null, number | null];
  wolfWarlockSwapPair?: [number | null, number | null];
  tricksterSwapPair?: [number | null, number | null];
  troublemakerTarget?: number | null;
  timeEclipseTarget?: number | null;
  penguinFreezeTarget?: number | null;
  foxCubCharmTarget?: number | null;
  muteElderTarget?: number | null;
  medusaPetrifyTarget?: number | null;
  silentNightMentorMode?: 'amplify' | 'weaken' | null;
  silentNightMentorTarget?: number | null;
  daylightScholarMode?: 'amplify' | 'weaken' | null;
  daylightScholarTarget?: number | null;
  fortuneTellerMarkTarget?: number | null;
  radiantEarlTarget?: number | null;
  socialiteTarget?: number | null;
  enchanterTarget?: number | null;
  blackBatTarget?: number | null;
  darkNightEnvoyTarget?: number | null;
  alchemyFogTargets?: number[];
  awakenedWitchUseAntidote?: boolean;
  awakenedWitchPoisonTarget?: number | null;
  awakenedWitchHelpers?: number[];
  awakenedWitchHelpersApproved?: boolean;
  /** 第 3 批：免疫、反傷、額外傷害與特殊擊殺類夜間草稿 */
  demonHunterTarget?: number | null;
  wolfRavenClawKillTarget?: number | null;
  assassinTarget?: number | null;
  assassinGuessedRoleId?: string | null;
  bigBadWolfKillTarget?: number | null;
  bigGreyWolfKillTarget?: number | null;
  wolfYoungerBrotherKillTarget?: number | null;
  beeWildHuntTargets?: [number | null, number | null];
  perseusExecuteTarget?: number | null;
  anubisDeadSeat?: number | null;
  anubisAliveSeat?: number | null;
  awakenedWolfKingGiveGunTarget?: number | null;
  awakenedWolfBeautyCharmTarget?: number | null;
  scarletAttachTarget?: number | null;
  nightNobleServantTarget?: number | null;
  awakenedIdiotShieldTarget?: number | null;
  wardenTradePair?: [number | null, number | null];
  wardenTradeChoices?: ['trade' | 'betray', 'trade' | 'betray'];
  /** 第 4 批：死亡連帶、認主、換牌與陣營轉換夜間草稿 */
  cupidLoversPair?: [number | null, number | null];
  ghostBrideGroomTarget?: number | null;
  ghostBrideWitnessTarget?: number | null;
  scentPhantomChainPair?: [number | null, number | null];
  twinsGuardTarget?: number | null;
  whiteSnakeTarget?: number | null;
  xuXianBindPair?: [number | null, number | null];
  xuXianKillTarget?: number | null;
  awakenedGargoyleConvertTarget?: number | null;
  awakenedLonelyGirlIdolTarget?: number | null;
  wildChildIdolTarget?: number | null;
  shadowMasterTarget?: number | null;
  puppetTarget?: number | null;
  zombieInfectTargets?: number[];
  chameleonWolfTarget?: number | null;
  thiefChosenRoleId?: string | null;
  jackRipperFanaticTarget?: number | null;
  jackRipperKillTarget?: number | null;
  /** 第 5 批：第三方獨立勝利、特殊計分與收集／贈禮類夜間草稿 */
  pandoraGiftTarget?: number | null;
  pandoraGiftItem?: PandoraBoxItem | null;
  pandoraKnifeTarget?: number | null;
  sleepingBeautyPickSeat?: number | null;
  exoticPrinceCheckTarget?: number | null;
  nineTailsMarkTarget?: number | null;
  baiZeClearTarget?: number | null;
  dancerFloorTargets?: number[];
  maskedWolfCheckTarget?: number | null;
  maskedWolfAlterTarget?: number | null;
  crowCurseTarget?: number | null;
  miracleMerchantTarget?: number | null;
  miracleMerchantItem?: MerchantGiftItem | null;
  blackMarketTarget?: number | null;
  blackMarketItem?: MerchantGiftItem | null;
  superBlackMarketTargets?: {
    seer_check?: number | null;
    witch_poison?: number | null;
    hunter_gun?: number | null;
  };
  evilMerchantTarget?: number | null;
  evilMerchantGiftType?: 'hunter_gun' | 'witch_poison' | null;
  mediumDeadSeat?: number | null;
  mediumHeirSeat?: number | null;
  mediumSkillActionSeat?: number | null;
  mediumSkillTargetSeat?: number | null;
  butlerTeaTarget?: number | null;
  butlerTeaAccepted?: boolean;
  butlerGuardSecondTarget?: number | null;
  wolfMaidTeaTarget?: number | null;
  wolfMaidTeaAccepted?: boolean;
  wolfMaidExtraKillTarget?: number | null;
  luckyItemActorSeat?: number | null;
  luckyItemTargetSeat?: number | null;
  /** 第 6 批：最終 13 角色夜間草稿 */
  eclipseMaidDevourTarget?: number | null;
  eclipseMaidUseSkillTarget?: number | null;
  greyWolfBossStealTarget?: number | null;
  greyWolfBossUseSkillTarget?: number | null;
  happySheepMode?: 'guard' | 'anti_theft' | null;
  happySheepTarget?: number | null;
  phantomWolfActivateInvincible?: boolean;
  policeDogTarget?: number | null;
  littleGirlIdentifyTarget?: number | null;
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
  seerResult?: SeerCheckOutcome | null;
  psychicResult?: PsychicCheckOutcome | null;
  mechWolfPsychicResult?: PsychicCheckOutcome | null;
  awakenedSeerResult?: AwakenedSeerCheckOutcome | null;
  lanternSeerResult?: SeerCheckOutcome | null;
  drunkSeerResult?: SeerCheckOutcome | null;
  foolSeerResult?: SeerCheckOutcome | null;
  foxResult?: FoxCheckOutcome | null;
  gargoyleResult?: PsychicCheckOutcome | null;
  wolfWitchResult?: PsychicCheckOutcome | null;
  pureWhiteResult?: PsychicCheckOutcome | null;
  demonWolfResult?: DemonWolfCheckOutcome | null;
  pumpkinGhostResult?: PsychicCheckOutcome | null;
  gravekeeperResult?: GravekeeperExileOutcome | null;
  awakenedDreamResult?: AwakenedDreamCheckOutcome | null;
  exoticPrinceResult?: { targetSeat: number; foundSleepingBeauty: boolean } | null;
  luckySeerResult?: {
    source?: 'miracle' | 'black_market' | 'super_black_market';
    actorSeat?: number;
    targetSeat: number;
    faction: 'wolf' | 'good';
    roleId?: string;
  } | null;
  eclipseMaidCheckResult?: {
    devouredRoleId: string;
    targetSeat: number;
    faction?: 'wolf' | 'good';
    roleId?: string | null;
  } | null;
  greyWolfBossSeerResult?: { targetSeat: number; faction: 'wolf' | 'good' } | null;
  policeDogResult?: { targetSeat: number; faction: 'wolf' | 'good' } | null;
  littleGirlResult?: { targetSeat: number; caught: boolean } | null;
  mediumResult?: { deadSeat: number; heirSeat: number; skill: string | null } | null;
  /** 機械狼當晚學習到的實際角色 ID（供復盤矩陣顯示簡碼） */
  mechWolfLearnedRoleId?: string | null;
  /** 假面狼人當晚探查舞池結果 */
  maskedWolfCheckResult?: { targetSeat: number; inDanceFloor: boolean } | null;
  /** 通靈者繼承預言家查驗結果 */
  mediumSeerResult?: { actorSeat: number; targetSeat: number; faction: 'wolf' | 'good' } | null;
}

export interface PendingNightAnnouncement {
  seats: PlayerSeat[];
  pendingShooters: Array<ShootEligibility & { deathReason: DeathReason }>;
  victory: VictoryResult;
}

export interface NightResolutionInput {
  seats: PlayerSeat[];
  round: number;
  draft: NightActionDraft;
  ruleOverrides: RuleOverrides;
  boardId?: string;
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
  interferenceState?: InterferenceRuntimeState;
  combatState?: CombatRuntimeState;
  conversionState?: ConversionRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  finalBatchState?: FinalBatchRuntimeState;
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
  interferenceState: InterferenceRuntimeState;
  combatState: CombatRuntimeState;
  conversionState: ConversionRuntimeState;
  thirdPartySpecialState: ThirdPartySpecialRuntimeState;
  finalBatchState: FinalBatchRuntimeState;
  /** 今晚白貓觸發翻牌免死的座號 */
  whiteCatRevealedSeats: number[];
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
  luckySeerResult?: {
    source?: 'miracle' | 'black_market' | 'super_black_market';
    actorSeat?: number;
    targetSeat: number;
    faction: 'wolf' | 'good';
    roleId?: string;
  } | null;
  exoticPrinceResult?: { targetSeat: number; foundSleepingBeauty: boolean } | null;
  maskedWolfCheckResult?: { targetSeat: number; inDanceFloor: boolean } | null;
  policeDogResult?: { targetSeat: number; faction: 'wolf' | 'good' } | null;
  mediumSeerResult?: { actorSeat: number; targetSeat: number; faction: 'wolf' | 'good' } | null;
  eclipseMaidCheckResult?: {
    devouredRoleId: string;
    targetSeat: number;
    faction?: 'wolf' | 'good';
    roleId?: string | null;
  } | null;
  greyWolfBossSeerResult?: { targetSeat: number; faction: 'wolf' | 'good' } | null;
  littleGirlResult?: { targetSeat: number; caught: boolean } | null;
  mediumResult?: { deadSeat: number; heirSeat: number; skill: string | null } | null;
  shootEligibilities: ShootEligibility[];
  victory: VictoryResult;
}
