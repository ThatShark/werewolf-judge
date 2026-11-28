import type { NightActionDraft, NightStepScript } from './types';

/**
 * 依據單一夜序步驟的 actionType，清除該步驟在 NightActionDraft 中寫入的角色專屬欄位。
 * 用於夜間退回上一步（prevNightStep）時防止已點選的髒資料殘留影響結算。
 */
export function clearNightStepDraftFields(
  draft: NightActionDraft,
  step: Pick<NightStepScript, 'actionType'> | undefined,
): NightActionDraft {
  if (!step) return draft;

  switch (step.actionType) {
    case 'wolf_kill':
      return {
        ...draft,
        wolfTarget: null,
        seedWolfInfectTarget: null,
        mentorAmplifySoloKillTarget: null,
      };
    case 'witch_action':
      return {
        ...draft,
        witchUseAntidote: false,
        witchPoisonTarget: null,
        witchSecondPoisonTarget: null,
      };
    case 'poisoner_poison':
      return { ...draft, poisonerTarget: null };
    case 'seer_check':
      return { ...draft, seerCheckTarget: null };
    case 'psychic_check':
      return { ...draft, psychicCheckTarget: null };
    case 'guard_protect':
      return { ...draft, guardTarget: null, guardSecondTarget: null };
    case 'mech_wolf_learn':
      return { ...draft, mechWolfLearnTarget: null };
    case 'mech_wolf_night_action':
      return { ...draft, mechWolfSkillTarget: null };
    case 'wolf_beauty_charm':
      return { ...draft, wolfBeautyCharmTarget: null };
    case 'dream_catcher_dream':
      return { ...draft, dreamCatcherTarget: null };
    case 'wolf_girl_confess':
      return { ...draft, wolfGirlConfessTarget: null };
    case 'treasure_master_choose':
      return { ...draft, treasureMasterCardRoleId: null };
    case 'nightmare_fear':
      return { ...draft, nightmareFearTarget: null };
    case 'hybrid_choose':
      return { ...draft, hybridIdolTarget: null };
    case 'awakened_seer_check':
      return { ...draft, awakenedSeerTargets: [null, null] };
    case 'lantern_seer_check':
      return { ...draft, lanternSeerCheckTarget: null };
    case 'drunk_seer_check':
      return { ...draft, drunkSeerCheckTarget: null, drunkSeerManualResult: null };
    case 'fool_seer_check':
      return { ...draft, foolSeerCheckTarget: null };
    case 'fox_check':
      return { ...draft, foxCheckTarget: null };
    case 'gargoyle_check':
      return { ...draft, gargoyleCheckTarget: null };
    case 'wolf_witch_check':
      return { ...draft, wolfWitchCheckTarget: null };
    case 'pure_white_check':
      return { ...draft, pureWhiteCheckTarget: null };
    case 'demon_wolf_check':
      return { ...draft, demonWolfCheckTarget: null };
    case 'pumpkin_ghost_check':
      return { ...draft, pumpkinGhostCheckTarget: null };
    case 'super_gravekeeper_action':
      return { ...draft, superGravekeeperHeirTarget: null };
    case 'awakened_dream_catcher_dream':
      return { ...draft, awakenedDreamTarget: null };
    case 'awakened_dream_catcher_judge':
      return { ...draft, awakenedDreamKillTarget: false };
    case 'magician_swap':
      return { ...draft, magicianSwapPair: [null, null] };
    case 'wolf_warlock_swap':
      return { ...draft, wolfWarlockSwapPair: [null, null] };
    case 'trickster_wolf_swap':
      return { ...draft, tricksterSwapPair: [null, null] };
    case 'troublemaker_prank':
      return { ...draft, troublemakerTarget: null };
    case 'time_eclipse_lock':
      return { ...draft, timeEclipseTarget: null };
    case 'penguin_freeze':
      return { ...draft, penguinFreezeTarget: null };
    case 'fox_cub_charm':
      return { ...draft, foxCubCharmTarget: null };
    case 'mute_elder_mute':
      return { ...draft, muteElderTarget: null };
    case 'medusa_petrify':
      return { ...draft, medusaPetrifyTarget: null };
    case 'silent_night_mentor_action':
      return { ...draft, silentNightMentorMode: null, silentNightMentorTarget: null };
    case 'daylight_scholar_action':
      return { ...draft, daylightScholarMode: null, daylightScholarTarget: null };
    case 'fortune_teller_mark':
      return { ...draft, fortuneTellerMarkTarget: null };
    case 'radiant_earl_shield':
      return { ...draft, radiantEarlTarget: null, radiantEarlSecondShieldTarget: null };
    case 'socialite_favor':
      return { ...draft, socialiteTarget: null };
    case 'enchanter_bewitch':
      return { ...draft, enchanterTarget: null };
    case 'black_bat_shield':
      return { ...draft, blackBatTarget: null };
    case 'dark_night_envoy_shield':
      return { ...draft, darkNightEnvoyTarget: null };
    case 'alchemy_witch_fog':
      return { ...draft, alchemyFogTargets: [] };
    case 'awakened_witch_action':
      return {
        ...draft,
        awakenedWitchUseAntidote: false,
        awakenedWitchPoisonTarget: null,
        awakenedWitchHelpers: [],
        awakenedWitchHelpersApproved: false,
      };
    case 'demon_hunter_hunt':
      return { ...draft, demonHunterTarget: null, demonHunterTargets: [] };
    case 'wolf_raven_claw_kill':
      return { ...draft, wolfRavenClawKillTarget: null };
    case 'assassin_wolf_assassinate':
      return { ...draft, assassinTarget: null, assassinGuessedRoleId: null };
    case 'big_bad_wolf_kill':
      return { ...draft, bigBadWolfKillTarget: null };
    case 'big_grey_wolf_kill':
      return { ...draft, bigGreyWolfKillTarget: null };
    case 'wolf_younger_brother_kill':
      return { ...draft, wolfYoungerBrotherKillTarget: null };
    case 'bee_wild_hunt_sting':
      return { ...draft, beeWildHuntTargets: [null, null] };
    case 'perseus_execute':
      return { ...draft, perseusExecuteTarget: null };
    case 'anubis_scale':
      return { ...draft, anubisDeadSeat: null, anubisAliveSeat: null };
    case 'awakened_wolf_king_give_gun':
      return { ...draft, awakenedWolfKingGiveGunTarget: null };
    case 'awakened_wolf_beauty_charm':
      return { ...draft, awakenedWolfBeautyCharmTarget: null };
    case 'scarlet_wolf_king_attach':
      return { ...draft, scarletAttachTarget: null };
    case 'night_noble_servant':
      return { ...draft, nightNobleServantTarget: null };
    case 'awakened_idiot_shield':
      return { ...draft, awakenedIdiotShieldTarget: null };
    case 'warden_wolf_trade':
      return { ...draft, wardenTradePair: [null, null], wardenTradeChoices: undefined };
    case 'cupid_link':
      return { ...draft, cupidLoversPair: [null, null] };
    case 'ghost_bride_link':
      return {
        ...draft,
        ghostBrideGroomTarget: null,
        ghostBrideWitnessTarget: null,
        ghostBrideKillTarget: null,
      };
    case 'scent_phantom_link':
      return { ...draft, scentPhantomChainPair: [null, null], scentPhantomChains: [] };
    case 'twins_guard':
      return { ...draft, twinsGuardTarget: null };
    case 'white_snake_action':
      return { ...draft, whiteSnakeTarget: null };
    case 'xu_xian_action':
      return { ...draft, xuXianBindPair: [null, null], xuXianKillTarget: null };
    case 'awakened_gargoyle_convert':
      return { ...draft, awakenedGargoyleConvertTarget: null, awakenedGargoyleConvertTargets: [] };
    case 'awakened_lonely_girl_choose':
      return { ...draft, awakenedLonelyGirlIdolTarget: null };
    case 'wild_child_choose':
      return { ...draft, wildChildIdolTarget: null };
    case 'shadow_choose':
      return { ...draft, shadowMasterTarget: null };
    case 'puppet_wolf_choose':
      return { ...draft, puppetTarget: null };
    case 'zombie_infect':
      return { ...draft, zombieInfectTargets: [] };
    case 'chameleon_wolf_choose':
      return { ...draft, chameleonWolfTarget: null, chameleonWolfOriginalRoleId: null };
    case 'thief_choose':
      return { ...draft, thiefChosenRoleId: null };
    case 'jack_ripper_action':
      return { ...draft, jackRipperFanaticTarget: null, jackRipperKillTarget: null };
    case 'pandora_gift':
      return { ...draft, pandoraGiftTarget: null, pandoraGiftItem: null };
    case 'pandora_knife':
      return { ...draft, pandoraKnifeTarget: null };
    case 'sleeping_beauty_pick':
      return { ...draft, sleepingBeautyPickSeat: null };
    case 'exotic_prince_check':
      return { ...draft, exoticPrinceCheckTarget: null };
    case 'nine_tails_mark':
      return { ...draft, nineTailsMarkTarget: null };
    case 'bai_ze_clear':
      return { ...draft, baiZeClearTarget: null };
    case 'dancer_dance':
      return { ...draft, dancerFloorTargets: [] };
    case 'masked_wolf_action':
      return { ...draft, maskedWolfCheckTarget: null, maskedWolfAlterTarget: null };
    case 'crow_curse':
      return { ...draft, crowCurseTarget: null };
    case 'miracle_merchant_gift':
      return { ...draft, miracleMerchantTarget: null, miracleMerchantItem: null };
    case 'black_market_gift':
      return { ...draft, blackMarketTarget: null, blackMarketItem: null };
    case 'super_black_market_gift':
      return { ...draft, superBlackMarketTargets: undefined };
    case 'evil_merchant_gift':
      return {
        ...draft,
        evilMerchantTarget: null,
        evilMerchantGiftType: null,
        evilMerchantPoisonActionTarget: null,
      };
    case 'medium_channel':
      return {
        ...draft,
        mediumDeadSeat: null,
        mediumHeirSeat: null,
        mediumSkillActionSeat: null,
        mediumSkillTargetSeat: null,
        mediumSkillActions: [],
      };
    case 'butler_tea':
      return {
        ...draft,
        butlerTeaTarget: null,
        butlerTeaAccepted: false,
        butlerGuardSecondTarget: null,
      };
    case 'wolf_maid_tea':
      return {
        ...draft,
        wolfMaidTeaTarget: null,
        wolfMaidTeaAccepted: false,
        wolfMaidExtraKillTarget: null,
      };
    case 'lucky_item_action':
      return { ...draft, luckyItemActorSeat: null, luckyItemTargetSeat: null };
    case 'eclipse_maid_devour':
      return {
        ...draft,
        eclipseMaidDevourTarget: null,
        eclipseMaidUseSkillTarget: null,
        eclipseMaidDevourDualTargets: null,
      };
    case 'grey_wolf_boss_steal':
      return {
        ...draft,
        greyWolfBossStealTarget: null,
        greyWolfBossUseSkillTarget: null,
        greyWolfBossIntelligenceGuessCorrect: null,
      };
    case 'happy_sheep_action':
      return { ...draft, happySheepMode: null, happySheepTarget: null };
    case 'phantom_wolf_invincible':
      return { ...draft, phantomWolfActivateInvincible: false };
    case 'police_dog_action':
      return { ...draft, policeDogTarget: null };
    case 'little_girl_identify':
      return { ...draft, littleGirlIdentifyTarget: null };
    default:
      return draft;
  }
}
