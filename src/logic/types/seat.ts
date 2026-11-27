export type Faction = 'wolf' | 'good' | 'third_party';
export type GameWinner = Faction | 'draw';
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
  | 'enchanter_consecutive'
  | 'enchanter_substitute'
  | 'socialite_link'
  | 'medusa_petrify_link'
  | 'medusa_poison_reflect'
  | 'black_bat_reflect'
  | 'dark_night_envoy_counter'
  | 'mentor_scholar_clash'
  | 'troublemaker_self_guard'
  | 'white_cat_delayed_death'
  | 'awakened_witch_poison'
  | 'demon_hunter_kill'
  | 'demon_hunter_backfire'
  | 'wolf_raven_claw_kill'
  | 'assassin_wolf_kill'
  | 'big_bad_wolf_kill'
  | 'big_grey_wolf_kill'
  | 'wolf_younger_brother_kill'
  | 'bee_wild_hunt_kill'
  | 'perseus_execute'
  | 'perseus_petrify_backfire'
  | 'anubis_scale_kill'
  | 'anubis_scale_backfire'
  | 'blood_moon_exile_delayed'
  | 'pufferfish_explode'
  | 'awakened_wolf_king_shoot'
  | 'awakened_wolf_beauty_substitute'
  | 'awakened_hunter_shoot'
  | 'scarlet_child_trigger'
  | 'scarlet_wolf_link'
  | 'night_noble_servant_death'
  | 'old_rascal_delayed_death'
  | 'rusty_sword_counter'
  | 'warden_trade_death'
  | 'cupid_lover_link'
  | 'ghost_bride_link'
  | 'scent_phantom_link'
  | 'twins_link'
  | 'white_snake_kill'
  | 'xu_xian_kill'
  | 'xu_xian_link'
  | 'avenger_assassinate'
  | 'jack_ripper_kill'
  | 'pandora_poison'
  | 'pandora_knife'
  | 'pandora_day_gun'
  | 'nine_tails_hunt'
  | 'dance_out'
  | 'merchant_backfire'
  | 'medium_knife'
  | 'butler_seer_kill'
  | 'wolf_maid_tea_kill'
  | 'eclipse_maid_kill'
  | 'grey_wolf_steal_kill'
  | 'detective_execute'
  | 'police_dog_bite'
  | 'little_girl_caught'
  | 'bai_ze_delayed_death'
  | 'ghost_bride_kill'
  | 'evil_merchant_poison'
  | 'manual_judge';

/** 座位附加之角色專屬狀態旗標（收斂自原 PlayerSeat 頂層欄位） */
export interface SeatRoleStatuses {
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
  /** 特殊狀態：白貓已翻牌免疫一次死亡，延遲至下一次白天放逐階段結束後才正式出局 */
  whiteCatRevealed?: boolean;
  /** 特殊狀態：當晚被梅杜莎石化（當晚無法用技、隔天無法投票、白痴無法翻牌） */
  petrified?: boolean;
  /** 特殊狀態：當晚被禁言長老禁言（隔天白天不可發言） */
  muted?: boolean;
  /** 特殊狀態：老流氓被毒／被獵人射殺後進入延遲死亡（隔天發言結束後死亡） */
  oldRascalDelayedDeath?: boolean;
  /** 特殊狀態：血月使徒作為最後一狼被放逐免死，隔夜復仇刀後正式出局 */
  bloodMoonExileSurvived?: boolean;
  /** 特殊狀態：遭覺醒石像鬼轉化為狼人陣營（轉化者） */
  convertedByAwakenedGargoyle?: boolean;
  /** 特殊狀態：遭傀儡狼選為傀儡（驗查殺、技能錯亂） */
  isPuppetized?: boolean;
  /** 特殊狀態：遭殭屍感染 */
  infectedByZombie?: boolean;
  /** 特殊狀態：白澤繼承人（平民）轉為神／民雙陣營 */
  baiZeDualFaction?: boolean;
  /** 特殊狀態：白澤繼承人（神職）夜死延遲至下一放逐投票結束後生效 */
  baiZeDelayedDeath?: boolean;
}

export interface PlayerSeat {
  seatNumber: number;
  nickname: string;
  roleId: string | null;
  /** 第二身分（開膛手傑克第二身分板使用：開膛手傑克 / 狂熱粉 / 偵探） */
  secondRoleId?: 'jack_the_ripper' | 'fanatic' | 'detective' | null;
  /** 玩家性別（開膛手傑克雙板子使用：男 × 6、女 × 6） */
  gender?: 'male' | 'female';
  isAlive: boolean;
  deathReason?: DeathReason;
  deathRound?: number;
  /** 角色專屬附加狀態（翻牌、感染、禁言、石化、延遲死亡等） */
  statuses: SeatRoleStatuses;
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
