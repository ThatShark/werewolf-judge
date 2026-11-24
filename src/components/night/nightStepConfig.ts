import type { NightActionDraft, NightActionType } from '../../logic/types';

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
