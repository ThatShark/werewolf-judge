import type { SpeakingDirection } from './day';
import type { PlayerCountFilter } from './seat';

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
  | 'magician_swap'
  | 'wolf_warlock_swap'
  | 'trickster_wolf_swap'
  | 'troublemaker_prank'
  | 'time_eclipse_lock'
  | 'penguin_freeze'
  | 'fox_cub_charm'
  | 'mute_elder_mute'
  | 'medusa_petrify'
  | 'silent_night_mentor_action'
  | 'daylight_scholar_action'
  | 'fortune_teller_mark'
  | 'radiant_earl_shield'
  | 'socialite_favor'
  | 'enchanter_bewitch'
  | 'black_bat_shield'
  | 'dark_night_envoy_shield'
  | 'alchemy_witch_fog'
  | 'alchemy_witch_snake'
  | 'awakened_witch_action'
  | 'demon_hunter_hunt'
  | 'wolf_raven_claw_kill'
  | 'assassin_wolf_assassinate'
  | 'big_bad_wolf_kill'
  | 'big_grey_wolf_kill'
  | 'wolf_younger_brother_kill'
  | 'bee_wild_hunt_sting'
  | 'perseus_execute'
  | 'anubis_scale'
  | 'awakened_wolf_king_give_gun'
  | 'awakened_wolf_beauty_charm'
  | 'scarlet_wolf_king_attach'
  | 'night_noble_servant'
  | 'awakened_idiot_shield'
  | 'warden_wolf_trade'
  | 'cupid_link'
  | 'ghost_bride_link'
  | 'scent_phantom_link'
  | 'twins_guard'
  | 'white_snake_action'
  | 'xu_xian_action'
  | 'awakened_gargoyle_convert'
  | 'awakened_lonely_girl_choose'
  | 'wild_child_choose'
  | 'shadow_choose'
  | 'puppet_wolf_choose'
  | 'zombie_infect'
  | 'chameleon_wolf_choose'
  | 'thief_choose'
  | 'jack_ripper_action'
  | 'pandora_gift'
  | 'pandora_knife'
  | 'sleeping_beauty_pick'
  | 'exotic_prince_check'
  | 'nine_tails_mark'
  | 'bai_ze_clear'
  | 'dancer_dance'
  | 'masked_wolf_action'
  | 'crow_curse'
  | 'miracle_merchant_gift'
  | 'black_market_gift'
  | 'super_black_market_gift'
  | 'evil_merchant_gift'
  | 'medium_channel'
  | 'butler_tea'
  | 'wolf_maid_tea'
  | 'lucky_item_action'
  | 'eclipse_maid_devour'
  | 'grey_wolf_boss_steal'
  | 'happy_sheep_action'
  | 'phantom_wolf_invincible'
  | 'police_dog_action'
  | 'little_girl_identify'
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
/** 警長投票加權：多0.5票（總計 1.5 票） / 多1票（總計 2 票） */
export type SheriffVoteWeight = 1.5 | 2;

/** 幸運兒首夜可用技能細部設定 */
export interface LuckyFirstNightSkillsConfig {
  blackMarket: {
    seer_check: boolean;
    witch_poison: boolean;
    hunter_gun: boolean;
  };
  miracle: {
    seer_check: boolean;
    witch_poison: boolean;
    guard_shield: boolean;
  };
  superBlackMarket: {
    seer_check: boolean;
    witch_poison: boolean;
    hunter_gun: boolean;
  };
}

export interface RuleOverrides {
  /** 1. 女巫能否自救：不能（預設） / 僅首晚能 / 能 */
  witchSelfSave: WitchSelfSaveRule;
  /** 2. 是否有警長（預設 true） */
  enableSheriff: boolean;
  /** 3. 吞警徽規則：雙爆吞警徽（預設） / 單爆吞警徽 */
  badgeSwallowRule: BadgeSwallowRule;
  /** 3b. 警長投票加權：1.5（多0.5票，預設） / 2（多1票） */
  sheriffVoteWeight?: SheriffVoteWeight;
  /** 4. 勝利條件：屠邊（預設）或屠城 */
  victoryMode: 'slaughter_side' | 'slaughter_all';
  /** 5. 機械狼第一晚是否強制學習一名玩家（預設 true） */
  mechWolfForceLearnNight1: boolean;
  /** 6. 幸運兒第一晚是否就能使用技能（黑市／奇蹟／超級黑市多選） */
  luckyFirstNightSkills: LuckyFirstNightSkillsConfig;
  /** 內部／板子固定規則（不於房間設定 UI 開放修改） */
  idiotNeedsExtraKill?: boolean;
  wolfKillPriority?: boolean;
  noSheriffDeadDirection?: SpeakingDirection;
  sheriffUseDeadSideOnDeath?: boolean;
  hybridCountsAsVillager?: boolean;
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
  /** 板子級首夜／全局特殊限制（源自 docs/boards-raw.md） */
  specialRules?: string[];
  /** 首夜狼人禁止刀人（無狼刀） */
  firstNightNoWolfKill?: boolean;
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

export interface RoleAssignmentValidation {
  valid: boolean;
  errors: string[];
  missingRoles: Record<string, number>;
  extraRoles: Record<string, number>;
}
