import type { Faction, GameWinner } from './seat';

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
  convertedByAwakenedGargoyle?: boolean;
  effectiveFaction?: 'wolf' | 'good' | 'third_party';
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

export interface SeerCheckOutcome {
  targetSeat: number;
  faction: 'wolf' | 'good';
}

export interface PsychicCheckOutcome {
  targetSeat: number;
  perceivedRoleId: string;
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

export interface BearRoarResult {
  bearSeat: number | null;
  bearAlive: boolean;
  leftNeighborSeat: number | null;
  rightNeighborSeat: number | null;
  roared: boolean;
  reason: string;
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

/** 第 2 批：干擾、封鎖、目標交換與特殊守護類角色持久化執行期狀態 */
export interface InterferenceRuntimeState {
  magicianSwappedSeats: number[];
  wolfWarlockSwappedSeats: number[];
  tricksterSwappedSeats: number[];
  activeTricksterVoteSwap: [number, number] | null;
  lastTroublemakerTarget: number | null;
  troublemakerJoinedWolfTeam: boolean;
  lastTimeEclipseTarget: number | null;
  timeEclipseUsed: boolean;
  lastPenguinTarget: number | null;
  foxCubUsed: boolean;
  activeMutedSeat: number | null;
  lastMedusaTarget: number | null;
  activePetrifiedSeat: number | null;
  silentNightMentorAmplifyUsed: boolean;
  silentNightMentorWeakenUsed: boolean;
  silentNightMentorJoinedWolfTeam: boolean;
  daylightScholarAmplifyUsed: boolean;
  daylightScholarWeakenUsed: boolean;
  fortuneTellerUsed: boolean;
  lastRadiantEarlTarget: number | null;
  lastSocialiteTarget: number | null;
  lastEnchanterTarget: number | null;
  lastBlackBatTarget: number | null;
  blackBatReflectUsed: boolean;
  lastDarkNightEnvoyTarget: number | null;
  alchemyFogUsed: boolean;
  alchemySnakeUsed: boolean;
  alchemySnakePendingVictimSeat: number | null;
  awakenedWitchAntidoteUsed: boolean;
  awakenedWitchPoisonsUsed: number;
  awakenedWitchUsedHelpers: number[];
  /** 當晚有效的換位對（供白天夜槍目標對調使用） */
  activeNightSwapPairs?: Array<[number, number]>;
  /** 當晚／今日受搗蛋鬼耍寶的座號（供獵人日／夜槍自射使用） */
  activeTroublemakerPrankedSeat?: number | null;
  /** 當晚多位死者座號（供煉金魔女法老之蛇擇一救活） */
  alchemySnakePendingVictimSeats?: number[];
  /** 當晚受寂夜導師／白晝學者增幅之座號 */
  amplifiedSeatsTonight?: number[];
}

/** 第 3 批：免疫、反傷、額外傷害與特殊擊殺類角色持久化狀態 */
export interface CombatRuntimeState {
  wolfRavenClawJoinedTeam: boolean;
  wolfRavenClawInvincibleUsed: boolean;
  bigGreyWolfJoinedTeam: boolean;
  bigGreyWolfKillUsed: boolean;
  wolfBrotherDiedRound: number | null;
  wolfYoungerBrotherAwakenedKillUsed: boolean;
  wolfYoungerBrotherJoinedTeam: boolean;
  beeWildHuntLostAbility: boolean;
  perseusExecuteUsed: boolean;
  anubisJoinedTeam: boolean;
  anubisUsedSeats: number[];
  bloodMoonSealActiveTonight: boolean;
  bloodMoonPendingExileDeathNextNight: boolean;
  pufferfishBombUsed: boolean;
  pufferfishWolfKilledToday: boolean;
  /** 覺醒狼王剩餘槍數（初始 2） */
  awakenedWolfKingGuns: number;
  /** 各小狼被分到的槍數（seatNumber -> count） */
  wolfDistributedGuns: Record<number, number>;
  awakenedWolfBeautyLastCharmRound: number | null;
  awakenedWolfBeautyActiveCharmSeat: number | null;
  awakenedWolfBeautySubstituteUsed: boolean;
  scarletWolfKingJoinedTeam: boolean;
  /** 已公布附著「猩紅之子」的座號（最多 3 人） */
  scarletAttachedSeats: number[];
  /** 目前存活的夜僕座號（出局前不可選新夜僕） */
  nightNobleServantSeat: number | null;
  /** 覺醒白痴秘密之身是否仍有效（初始 true，抵擋一次傷害或白天翻牌後失效） */
  awakenedIdiotSecretActive: boolean;
  /** 鏽劍騎士被狼刀殺死之回合（下一晚天亮觸發左狼倒牌） */
  rustySwordKilledRound: number | null;
  rustySwordTriggered: boolean;
  /** 典獄長已參與過交易的座號（每人整局限 1 次） */
  wardenTradedSeats: number[];
}

/** 第 4 批：死亡連帶、首夜認主、換牌與陣營轉換類持久化狀態 */
export interface ConversionRuntimeState {
  cupidLovers: [number, number] | null;
  cupidAffiliation: 'good' | 'wolf' | 'third_party' | null;
  ghostBrideGroomSeat: number | null;
  ghostBrideWitnessSeat: number | null;
  scentPhantomChain: [number, number] | null;
  scentPhantomTriggered: boolean;
  scentPhantomJoinedTeam: boolean;
  twinsDeadRound: number | null;
  twinsGuardUsed: boolean;
  whiteSnakeUnlockedAttack: boolean;
  xuXianLastBoundPair: [number, number] | null;
  xuXianActiveBoundPair: [number, number] | null;
  xuXianTriggered: boolean;
  xuXianThirdPartyInstantWin: boolean;
  awakenedGargoyleConvertedSeat: number | null;
  awakenedLonelyGirlIdolSeat: number | null;
  awakenedLonelyGirlStatus: 'good' | 'wolf' | 'inherited';
  awakenedLonelyGirlInheritedRoleId: string | null;
  wildChildIdolSeat: number | null;
  wildChildTurnedWolf: boolean;
  shadowMasterSeat: number | null;
  shadowInheritedRoleId: string | null;
  shadowAvengerThirdParty: boolean;
  avengerAlignedFaction: 'good' | 'wolf' | 'third_party' | null;
  avengerInstantWin: boolean;
  puppetSeat: number | null;
  zombieInfectedSeats: number[];
  chameleonWolfSeat: number | null;
  chameleonOriginalRoleId?: string | null;
  chameleonJoinedTeam: boolean;
  awakenedGargoyleConvertedSeats?: number[];
  thiefBottomCards: string[];
  thiefChosenRoleId: string | null;
  jackRipperFanaticSeat: number | null;
  jackRipperKillUnlocked: boolean;
  /** 第二身分板：已出局偵探是否已使用過一次集結指證 */
  jackRipperDetAccusationUsed: boolean;
  /** 第二身分板：偵探集結指證開膛手傑克成功後，第三方陣營失敗 */
  jackRipperThirdPartyDefeated: boolean;
}

/** 潘朵拉魔盒道具類型 */
export type PandoraBoxItem = 'knife' | 'poison' | 'hope_light' | 'day_gun';
/** 商人贈禮道具類型 */
export type MerchantGiftItem = 'seer_check' | 'witch_poison' | 'guard_shield' | 'hunter_gun';
/** 通靈者可通靈技能類型 */
export type MediumSkillType = 'wolf_kill' | 'seer_check' | 'witch_poison' | 'guard_shield';

/** 第 5 批：第三方獨立勝利、特殊計分與收集／贈禮類持久化狀態 */
export interface ThirdPartySpecialRuntimeState {
  // 潘朵拉（5 個魔盒：1 刀、1 毒、1 希望之光、2 日槍）
  pandoraRemainingBoxes: PandoraBoxItem[];
  pandoraGiftHistory: Array<{ seat: number; item: PandoraBoxItem; used: boolean }>;
  pandoraKnifeUsed: boolean;
  pandoraHopeLightWinner: GameWinner | null;
  // 睡美人 & 異族王子
  sleepingBeautySeat: number | null;
  sleepingBeautyAwakened: boolean;
  sleepingSeats: number[];
  // 九尾 & 白澤
  nineTailsMarkedSeats: number[];
  nineTailsJoinedTeam: boolean;
  baiZeHeirSeat: number | null;
  baiZeHeirRoleType: 'villager' | 'god' | 'wolf' | null;
  // 舞者 & 假面
  dancerVisitedSeats: number[];
  maskedWolfJoinedTeam: boolean;
  maskedWolfLastCheckSeat: number | null;
  maskedWolfLastAlterSeat: number | null;
  // 烏鴉
  crowLastCursedSeat: number | null;
  crowActiveCursedSeat: number | null;
  // 奇蹟商人 & 黑市商人 & 超級黑市商人 & 邪惡商人
  miracleMerchantUsed: boolean;
  miracleLuckySeat: number | null;
  miracleLuckyItem: MerchantGiftItem | null;
  miracleLuckyItemUsed: boolean;
  blackMarketMerchantUsed: boolean;
  blackMarketLuckySeat: number | null;
  blackMarketLuckyItem: MerchantGiftItem | null;
  blackMarketLuckyItemUsed: boolean;
  superBlackMarketUsed: boolean;
  superBlackMarketGifts: Array<{ seat: number; item: MerchantGiftItem; used: boolean }>;
  superBlackMarketTurnedWolf: boolean;
  superBlackMarketJoinedTeam: boolean;
  evilMerchantGunHolderSeat: number | null;
  evilMerchantPoisonHolderSeat: number | null;
  evilMerchantDisabled: boolean;
  evilMerchantLastDayNoGunWolfDied?: boolean;
  // 通靈者
  mediumChanneledDeadSeats: number[];
  mediumInheritedHeirs: Array<{
    heirSeat: number;
    fromDeadSeat: number;
    skill: MediumSkillType;
    receivedRound: number;
    used: boolean;
  }>;
  // 管家 & 狼僕
  butlerServedSeats: number[];
  butlerActiveTeaSeat: number | null;
  butlerActiveVoteBonusSeat: number | null;
  butlerDayProtectedSeat: number | null;
  wolfMaidJoinedTeam: boolean;
  wolfMaidServedSeats: number[];
  wolfMaidActiveTeaSeat: number | null;
  wolfMaidActiveVotePenaltySeat: number | null;
}

/** 第 6 批：最終 13 個角色（吞噬／偷竊／防盜／無敵／翻牌處決／重投／回溯）持久化狀態 */
export interface FinalBatchRuntimeState {
  // 蝕日侍女
  eclipseMaidJoinedTeam: boolean;
  eclipseMaidDevouredSeatTonight: number | null;
  // 灰太狼 & 喜羊羊
  greyWolfBossJoinedTeam: boolean;
  greyWolfBossStolenSeats: number[];
  greyWolfBossBorrowedHunterGun: boolean;
  happySheepLastProtectSeat: number | null;
  happySheepLastAntiTheftSeat: number | null;
  // 怪盜狼王
  phantomWolfInvincibleUsed: boolean;
  phantomWolfInvincibleActive: boolean;
  // 定序王子
  sequencePrinceUsed: boolean;
  // 槓精
  contrarianUsed: boolean;
  contrarianSilencedVoterSeat: number | null;
  // 偵探 & 警犬
  detectiveRevealedToday: boolean;
  detectiveUsed: boolean;
  policeDogActivatedRound: number | null;
  policeDogMode: 'bite' | 'check' | null;
  policeDogUsed: boolean;
  // 白夜使者
  whiteNightEnvoyUsed: boolean;
  // 小女孩
  littleGirlIdentifyUsed: boolean;
}
