import { getRoleById } from '../../data/roles';
import type {
  CombatRuntimeState,
  ConversionRuntimeState,
  HybridRuntimeState,
  MechWolfRuntimeState,
  NightActionDraft,
  NightActionType,
  PlayerSeat,
  ThirdPartySpecialRuntimeState,
} from '../../logic/types';

/** 依步驟 actionType 從當前夜間草稿讀取單目標預選座位 */
export function getInitialTargetForStep(
  actionType: NightActionType,
  draft: NightActionDraft,
  isJackSecondId = false,
): number | null {
  switch (actionType) {
    case 'wolf_kill':
      return draft.seedWolfInfectTarget ?? draft.wolfTarget;
    case 'guard_protect':
      return draft.guardTarget;
    case 'witch_action':
      return draft.witchPoisonTarget;
    case 'seer_check':
      return draft.seerCheckTarget;
    case 'psychic_check':
      return draft.psychicCheckTarget;
    case 'mech_wolf_learn':
      return draft.mechWolfLearnTarget;
    case 'mech_wolf_night_action':
      return draft.mechWolfSkillTarget;
    case 'wolf_beauty_charm':
      return draft.wolfBeautyCharmTarget ?? null;
    case 'dream_catcher_dream':
      return draft.dreamCatcherTarget ?? null;
    case 'nightmare_fear':
      return draft.nightmareFearTarget ?? null;
    case 'hybrid_choose':
      return draft.hybridIdolTarget ?? null;
    case 'lantern_seer_check':
      return draft.lanternSeerCheckTarget ?? null;
    case 'drunk_seer_check':
      return draft.drunkSeerCheckTarget ?? null;
    case 'fool_seer_check':
      return draft.foolSeerCheckTarget ?? null;
    case 'fox_check':
      return draft.foxCheckTarget ?? null;
    case 'gargoyle_check':
      return draft.gargoyleCheckTarget ?? null;
    case 'wolf_witch_check':
      return draft.wolfWitchCheckTarget ?? null;
    case 'pure_white_check':
      return draft.pureWhiteCheckTarget ?? null;
    case 'demon_wolf_check':
      return draft.demonWolfCheckTarget ?? null;
    case 'pumpkin_ghost_check':
      return draft.pumpkinGhostCheckTarget ?? null;
    case 'super_gravekeeper_action':
      return draft.superGravekeeperHeirTarget ?? null;
    case 'awakened_dream_catcher_dream':
      return draft.awakenedDreamTarget ?? null;
    case 'troublemaker_prank':
      return draft.troublemakerTarget ?? null;
    case 'time_eclipse_lock':
      return draft.timeEclipseTarget ?? null;
    case 'penguin_freeze':
      return draft.penguinFreezeTarget ?? null;
    case 'fox_cub_charm':
      return draft.foxCubCharmTarget ?? null;
    case 'mute_elder_mute':
      return draft.muteElderTarget ?? null;
    case 'medusa_petrify':
      return draft.medusaPetrifyTarget ?? null;
    case 'silent_night_mentor_action':
      return draft.silentNightMentorTarget ?? null;
    case 'daylight_scholar_action':
      return draft.daylightScholarTarget ?? null;
    case 'fortune_teller_mark':
      return draft.fortuneTellerMarkTarget ?? null;
    case 'radiant_earl_shield':
      return draft.radiantEarlTarget ?? null;
    case 'socialite_favor':
      return draft.socialiteTarget ?? null;
    case 'enchanter_bewitch':
      return draft.enchanterTarget ?? null;
    case 'black_bat_shield':
      return draft.blackBatTarget ?? null;
    case 'dark_night_envoy_shield':
      return draft.darkNightEnvoyTarget ?? null;
    case 'awakened_witch_action':
      return draft.awakenedWitchPoisonTarget ?? null;
    case 'demon_hunter_hunt':
      return draft.demonHunterTarget ?? null;
    case 'wolf_raven_claw_kill':
      return draft.wolfRavenClawKillTarget ?? null;
    case 'assassin_wolf_assassinate':
      return draft.assassinTarget ?? null;
    case 'big_bad_wolf_kill':
      return draft.bigBadWolfKillTarget ?? null;
    case 'big_grey_wolf_kill':
      return draft.bigGreyWolfKillTarget ?? null;
    case 'wolf_younger_brother_kill':
      return draft.wolfYoungerBrotherKillTarget ?? null;
    case 'perseus_execute':
      return draft.perseusExecuteTarget ?? null;
    case 'awakened_wolf_king_give_gun':
      return draft.awakenedWolfKingGiveGunTarget ?? null;
    case 'awakened_wolf_beauty_charm':
      return draft.awakenedWolfBeautyCharmTarget ?? null;
    case 'scarlet_wolf_king_attach':
      return draft.scarletAttachTarget ?? null;
    case 'night_noble_servant':
      return draft.nightNobleServantTarget ?? null;
    case 'awakened_idiot_shield':
      return draft.awakenedIdiotShieldTarget ?? null;
    case 'twins_guard':
      return draft.twinsGuardTarget ?? null;
    case 'white_snake_action':
      return draft.whiteSnakeTarget ?? null;
    case 'awakened_gargoyle_convert':
      return draft.awakenedGargoyleConvertTarget ?? null;
    case 'awakened_lonely_girl_choose':
      return draft.awakenedLonelyGirlIdolTarget ?? null;
    case 'wild_child_choose':
      return draft.wildChildIdolTarget ?? null;
    case 'shadow_choose':
      return draft.shadowMasterTarget ?? null;
    case 'puppet_wolf_choose':
      return draft.puppetTarget ?? null;
    case 'chameleon_wolf_choose':
      return draft.chameleonWolfTarget ?? null;
    case 'jack_ripper_action':
      return isJackSecondId && draft.round === 1
        ? (draft.jackRipperFanaticTarget ?? null)
        : (draft.jackRipperKillTarget ?? null);
    case 'pandora_gift':
      return draft.pandoraGiftTarget ?? null;
    case 'pandora_knife':
      return draft.pandoraKnifeTarget ?? null;
    case 'sleeping_beauty_pick':
      return draft.sleepingBeautyPickSeat ?? null;
    case 'exotic_prince_check':
      return draft.exoticPrinceCheckTarget ?? null;
    case 'nine_tails_mark':
      return draft.nineTailsMarkTarget ?? null;
    case 'bai_ze_clear':
      return draft.baiZeClearTarget ?? null;
    case 'crow_curse':
      return draft.crowCurseTarget ?? null;
    case 'miracle_merchant_gift':
      return draft.miracleMerchantTarget ?? null;
    case 'black_market_gift':
      return draft.blackMarketTarget ?? null;
    case 'evil_merchant_gift':
      return draft.evilMerchantTarget ?? null;
    case 'butler_tea':
      return draft.butlerTeaTarget ?? null;
    case 'wolf_maid_tea':
      return draft.wolfMaidTeaTarget ?? null;
    case 'lucky_item_action':
      return draft.luckyItemTargetSeat ?? null;
    case 'eclipse_maid_devour':
      return draft.eclipseMaidDevourTarget ?? null;
    case 'grey_wolf_boss_steal':
      return draft.greyWolfBossStealTarget ?? null;
    case 'happy_sheep_action':
      return draft.happySheepTarget ?? null;
    case 'police_dog_action':
      return draft.policeDogTarget ?? null;
    case 'little_girl_identify':
      return draft.littleGirlIdentifyTarget ?? null;
    case 'wolf_girl_confess':
      return draft.wolfGirlConfessTarget ?? null;
    default:
      return null;
  }
}

/** 取得座位卡片上顯示的當晚行動標記圖示 */
export function getSeatActionIcons(
  seatNumber: number,
  draft: NightActionDraft,
  options: {
    isOnlineJudge: boolean;
    currentActionType: NightActionType;
    showWolfTargetToWitch: boolean;
  },
): string[] {
  const icons: string[] = [];
  if (options.isOnlineJudge) {
    if (
      options.currentActionType === 'witch_action' &&
      options.showWolfTargetToWitch &&
      draft.wolfTarget === seatNumber
    ) {
      icons.push('🐺');
    }
    return icons;
  }

  if (draft.wolfTarget === seatNumber) icons.push('🐺');
  if (draft.guardTarget === seatNumber) icons.push('🛡️');
  if (draft.witchUseAntidote && draft.wolfTarget === seatNumber) icons.push('💊');
  if (draft.witchPoisonTarget === seatNumber) icons.push('☠️');
  if (draft.seerCheckTarget === seatNumber || draft.psychicCheckTarget === seatNumber) {
    icons.push('🔮');
  }
  if (draft.wolfBeautyCharmTarget === seatNumber) icons.push('💘');
  if (draft.dreamCatcherTarget === seatNumber) icons.push('💤');
  if (draft.nightmareFearTarget === seatNumber) icons.push('😱');
  if (draft.hybridIdolTarget === seatNumber) icons.push('🧬');
  if (draft.seedWolfInfectTarget === seatNumber) icons.push('🦠');
  if (draft.mechWolfLearnTarget === seatNumber || draft.mechWolfSkillTarget === seatNumber) {
    icons.push('🤖');
  }
  if (draft.jackRipperKillTarget === seatNumber) icons.push('🔪');
  return icons;
}

export interface SeatFactionChip {
  label: '狼' | '神' | '民' | '三方';
  className: string;
}

/** 取得角色精簡陣營標記（狼／神／民／三方） */
export function getSeatFactionChip(roleId: string | null): SeatFactionChip | null {
  const role = getRoleById(roleId);
  if (!role) return null;
  if (role.faction === 'wolf') {
    return { label: '狼', className: 'text-wolf' };
  }
  if (role.faction === 'third_party') {
    return { label: '三方', className: 'text-third' };
  }
  if (role.category === 'god') {
    return { label: '神', className: 'text-good' };
  }
  return { label: '民', className: 'text-secondary' };
}

export interface SeatStatusTag {
  label: string;
  tone: 'wolf' | 'good' | 'sheriff' | 'third' | 'muted';
}

export interface SeatStatusContext {
  draft: NightActionDraft;
  activeCharmedSeat?: number | null;
  lastDreamTarget?: number | null;
  hybridState?: HybridRuntimeState;
  mechWolfState?: MechWolfRuntimeState;
  combatState?: CombatRuntimeState;
  conversionState?: ConversionRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
}

/**
 * 彙整單一座位的所有附著狀態標籤（供實體法官開啟「顯示底牌」時一眼判讀）。
 */
export function getSeatAttachedStatusTags(
  seat: PlayerSeat,
  ctx: SeatStatusContext,
): SeatStatusTag[] {
  const tags: SeatStatusTag[] = [];
  const sn = seat.seatNumber;
  const { draft, hybridState, mechWolfState, combatState, conversionState, thirdPartySpecialState } =
    ctx;

  if (hybridState?.idolSeat === sn) tags.push({ label: '被混血', tone: 'third' });
  if (seat.maskedDelayedDeath || seat.oldRascalDelayedDeath || seat.baiZeDelayedDeath) {
    tags.push({ label: '負傷', tone: 'wolf' });
  }
  const isLucky =
    thirdPartySpecialState?.miracleLuckySeat === sn ||
    thirdPartySpecialState?.blackMarketLuckySeat === sn ||
    Boolean(thirdPartySpecialState?.superBlackMarketGifts?.some((g) => g.seat === sn));
  if (isLucky) tags.push({ label: '幸運兒', tone: 'sheriff' });

  if (
    ctx.activeCharmedSeat === sn ||
    draft.wolfBeautyCharmTarget === sn ||
    combatState?.awakenedWolfBeautyActiveCharmSeat === sn
  ) {
    tags.push({ label: '魅惑', tone: 'wolf' });
  }
  if (draft.witchPoisonTarget === sn || draft.poisonerTarget === sn || draft.awakenedWitchPoisonTarget === sn) {
    tags.push({ label: '中毒', tone: 'wolf' });
  }
  if (draft.guardTarget === sn) tags.push({ label: '守護', tone: 'good' });
  if (draft.dreamCatcherTarget === sn || ctx.lastDreamTarget === sn) {
    tags.push({ label: '連夢', tone: 'third' });
  }
  if (draft.nightmareFearTarget === sn) tags.push({ label: '恐懼', tone: 'wolf' });
  if (seat.infectedBySeedWolf || seat.infectedByZombie || draft.seedWolfInfectTarget === sn) {
    tags.push({ label: '感染', tone: 'third' });
  }
  if (seat.petrified || draft.medusaPetrifyTarget === sn) tags.push({ label: '石化', tone: 'wolf' });
  if (seat.muted || draft.muteElderTarget === sn) tags.push({ label: '禁言', tone: 'sheriff' });
  if (conversionState?.cupidLovers?.includes(sn)) tags.push({ label: '情侶', tone: 'third' });
  if (seat.idiotRevealed || seat.whiteCatRevealed) tags.push({ label: '翻牌', tone: 'sheriff' });
  if (seat.isPuppetized) tags.push({ label: '傀儡', tone: 'wolf' });
  if (combatState?.scarletAttachedSeats?.includes(sn)) tags.push({ label: '猩紅', tone: 'wolf' });
  if (combatState?.nightNobleServantSeat === sn) tags.push({ label: '夜僕', tone: 'third' });
  if (thirdPartySpecialState?.sleepingSeats?.includes(sn)) tags.push({ label: '沉睡', tone: 'third' });
  if (thirdPartySpecialState?.crowActiveCursedSeat === sn || draft.crowCurseTarget === sn) {
    tags.push({ label: '詛咒', tone: 'sheriff' });
  }
  if (mechWolfState?.learnedFromSeat === sn || draft.mechWolfLearnTarget === sn) {
    tags.push({ label: '被學', tone: 'sheriff' });
  }

  return tags;
}
