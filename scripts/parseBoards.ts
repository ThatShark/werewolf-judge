/**
 * 一次性離線解析腳本：讀取 docs/boards-raw.md，解析全部 142 個板子與 128 個不重複角色，
 * 生成完整且保留 MVP 3 板子精密設定的 src/data/roles.ts 與 src/data/boards.ts。
 *
 * 執行方式（Node 24+）：node scripts/parseBoards.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type {
  BoardDefinition,
  BoardQA,
  Faction,
  NightActionType,
  NightStepScript,
  PlayerCountFilter,
  RoleCategory,
  RoleDefinition,
  RoleSlot,
  RuleOverrides,
} from '../src/logic/types.ts';

const ROOT_DIR = process.cwd();
const RAW_PATH = path.join(ROOT_DIR, 'docs', 'boards-raw.md');
const ROLES_OUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'roles.ts');
const BOARDS_OUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'boards.ts');

/** 128 個角色的穩定英文識別碼對照表（保留 MVP 10 個核心 ID） */
const ROLE_ID_MAP: Record<string, string> = {
  // MVP 10 核心角色
  小狼: 'wolf',
  狼王: 'wolf_king',
  機械狼: 'mech_wolf',
  平民: 'villager',
  預言家: 'seer',
  通靈師: 'psychic',
  女巫: 'witch',
  獵人: 'hunter',
  白痴: 'idiot',
  守衛: 'guard',

  // 狼人陣營（剩餘 46 個）
  九尾: 'nine_tails_wolf',
  大灰狼: 'big_grey_wolf',
  大野狼: 'big_bad_wolf',
  小小灰: 'little_grey_wolf',
  月靈狼: 'moon_spirit_wolf',
  白狼王: 'white_wolf_king',
  石像鬼: 'gargoyle',
  灰太狼: 'grey_wolf_boss',
  百變狼王: 'chameleon_wolf_king',
  血月使徒: 'blood_moon_apostle',
  邪惡商人: 'evil_merchant',
  典獄長: 'warden_wolf',
  刺客: 'assassin_wolf',
  夜之貴族: 'night_noble',
  怪盜狼王: 'phantom_wolf_king',
  阿努比斯: 'anubis',
  南瓜鬼: 'pumpkin_ghost',
  狼兄: 'wolf_brother',
  狼巫: 'wolf_witch',
  狼弟: 'wolf_younger_brother',
  狼女孩: 'wolf_girl',
  狼美人: 'wolf_beauty',
  狼術師: 'wolf_warlock',
  狼僕: 'wolf_maid',
  狼鴉之爪: 'wolf_raven_claw',
  假面: 'masked_wolf',
  寂夜導師: 'silent_night_mentor',
  梅杜莎: 'medusa',
  雪狼: 'snow_wolf',
  傀儡: 'puppet_wolf',
  尋香魅影: 'scent_phantom',
  惡魔: 'demon_wolf',
  惡靈騎士: 'evil_knight',
  猩紅狼王: 'scarlet_wolf_king',
  黑夜使者: 'dark_night_envoy',
  黑蝙蝠: 'black_bat',
  搗蛋鬼: 'troublemaker_wolf',
  詭術師: 'trickster_wolf',
  夢魘: 'nightmare',
  種狼: 'seed_wolf',
  蝕日侍女: 'eclipse_maid',
  蝕時狼妃: 'time_eclipse_consort',
  戰狼: 'war_wolf',
  隱狼: 'hidden_wolf',
  覺醒石像鬼: 'awakened_gargoyle',
  覺醒狼王: 'awakened_wolf_king',
  覺醒狼美人: 'awakened_wolf_beauty',

  // 好人陣營（剩餘 55 個）
  九尾狐: 'nine_tailed_fox',
  子狐: 'fox_cub',
  小女孩: 'little_girl',
  占卜師: 'fortune_teller',
  白夜使者: 'white_night_envoy',
  白晝學者: 'daylight_scholar',
  白澤: 'bai_ze',
  白貓: 'white_cat',
  企鵝: 'penguin',
  名媛: 'socialite',
  守墓人: 'gravekeeper',
  羊駝: 'alpaca',
  老流氓: 'old_rascal',
  兔兔: 'bunny',
  奇蹟商人: 'miracle_merchant',
  定序王子: 'sequence_prince',
  河豚: 'pufferfish',
  狐狸: 'fox',
  流光伯爵: 'radiant_earl',
  珀爾修斯: 'perseus',
  烏鴉: 'crow',
  純白之女: 'pure_white_maiden',
  酒鬼預言家: 'drunk_seer',
  高級平民: 'senior_villager',
  偵探: 'detective',
  異族王子: 'exotic_prince',
  通靈者: 'medium',
  喜羊羊: 'happy_sheep',
  超級守墓人: 'super_gravekeeper',
  超級黑市商人: 'super_black_market_merchant',
  黑市商人: 'black_market_merchant',
  愚言家: 'fool_seer',
  煉金魔女: 'alchemy_witch',
  毒師: 'poisoner',
  禁言長老: 'mute_elder',
  蜂之狂獵: 'bee_wild_hunt',
  槓精: 'contrarian',
  熊: 'bear',
  管家: 'butler',
  舞者: 'dancer',
  蒙面人: 'masked_villager',
  燈影預言家: 'lantern_seer',
  獵魔人: 'demon_hunter',
  雙子: 'twins',
  騎士: 'knight',
  覺醒女巫: 'awakened_witch',
  覺醒白痴: 'awakened_idiot',
  覺醒預言家: 'awakened_seer',
  覺醒獵人: 'awakened_hunter',
  覺醒攝夢人: 'awakened_dream_catcher',
  警犬: 'police_dog',
  鏽劍騎士: 'rusty_sword_knight',
  攝夢人: 'dream_catcher',
  鐵好人: 'iron_good',
  魔術師: 'magician',
  蠱惑師: 'enchanter',

  // 第三方陣營 & 特殊變形角色（17 個）
  白蛇預言家: 'white_snake_seer',
  咒狐: 'cursed_fox',
  邱比特: 'cupid',
  鬼魂新娘: 'ghost_bride',
  混血兒: 'hybrid',
  許仙尋香魅影: 'xu_xian_phantom',
  野孩子: 'wild_child',
  盜賊: 'thief',
  盜寶大師: 'treasure_master',
  開膛手傑克: 'jack_the_ripper',
  潘朵拉: 'pandora',
  殭屍: 'zombie',
  覺醒孤獨少女: 'awakened_lonely_girl',
  狂熱粉: 'fanatic',
  復仇者: 'avenger',
  睡美人: 'sleeping_beauty',
  影子: 'shadow',
};

/** 明確分類（確保特殊/第三方/平民分類精準無誤） */
const ROLE_META_OVERRIDE: Record<
  string,
  { faction: Faction; category: RoleCategory; extraAliases?: string[] }
> = {
  villager: { faction: 'good', category: 'villager', extraAliases: ['村民'] },
  senior_villager: { faction: 'good', category: 'villager', extraAliases: ['高級村民'] },
  iron_good: { faction: 'good', category: 'villager' },
  old_rascal: { faction: 'good', category: 'villager' },
  // 特殊／變形機制角色歸入 third_party 或對應陣營
  fanatic: { faction: 'third_party', category: 'third_party' },
  avenger: { faction: 'third_party', category: 'third_party' },
  sleeping_beauty: { faction: 'third_party', category: 'third_party' },
  shadow: { faction: 'third_party', category: 'third_party' },
  white_snake_seer: { faction: 'third_party', category: 'third_party' },
  cursed_fox: { faction: 'third_party', category: 'third_party' },
  cupid: { faction: 'third_party', category: 'third_party' },
  ghost_bride: { faction: 'third_party', category: 'third_party' },
  hybrid: { faction: 'third_party', category: 'third_party' },
  xu_xian_phantom: { faction: 'third_party', category: 'third_party' },
  wild_child: { faction: 'third_party', category: 'third_party' },
  thief: { faction: 'third_party', category: 'third_party' },
  treasure_master: { faction: 'third_party', category: 'third_party' },
  jack_the_ripper: { faction: 'third_party', category: 'third_party' },
  pandora: { faction: 'third_party', category: 'third_party' },
  zombie: { faction: 'third_party', category: 'third_party' },
  awakened_lonely_girl: { faction: 'third_party', category: 'third_party' },
};

/** 保留既有 MVP 10 核心角色的精煉定義 */
const MVP_CORE_ROLES: Record<string, RoleDefinition> = {
  wolf: {
    id: 'wolf',
    name: '小狼',
    aliases: ['普通狼人', '狼人'],
    faction: 'wolf',
    category: 'wolf',
    description:
      '每晚與狼隊一同睜眼討論戰術並選擇當晚的襲擊對象，可空刀或自刀。白天發言階段可隨時翻牌自爆強制入夜，於當晚完成點刀後正式死亡。',
    warnings: [
      '狼刀永遠優先於其他神職技能，若狼刀後狼人已達勝利條件，即使神職同晚淘汰最後一狼仍視為狼人勝利（狼刀在先）。',
      '自爆的狼人在當晚完成點刀後才正式死亡。',
    ],
  },
  wolf_king: {
    id: 'wolf_king',
    name: '狼王',
    aliases: ['黑狼王'],
    faction: 'wolf',
    category: 'wolf',
    description:
      '擁有狼刀與自爆能力。若自刀死亡、被獵人開槍、被奶穿或白天被放逐出局時可開槍帶走一名存活玩家（可選擇壓槍）；若為最後一隻狼出局、被女巫毒殺或自爆則無法開槍。',
    warnings: [
      '自爆不能發動開槍技能。',
      '作為場上最後一隻存活狼人出局時無法開槍。',
      '被女巫毒殺無法開槍。',
    ],
  },
  mech_wolf: {
    id: 'mech_wolf',
    name: '機械狼',
    aliases: ['覺醒隱狼'],
    faction: 'wolf',
    category: 'wolf',
    description:
      '不能自爆且初期不入狼隊，待場上所有其他狼人皆被淘汰後入狼隊並獲得狼刀。首夜可學習自己以外一名玩家的技能並自第二晚起使用；學習前被通靈師查驗為機械狼，學習後顯示所學對象的真實身分。',
    warnings: [
      '全程不可自爆。',
      '學到女巫僅獲得 1 瓶毒藥（無解藥）。',
      '學到守衛的機械盾可以擋住女巫的毒藥。',
      '學到小狼的額外一刀須等所有小狼皆淘汰、入隊後才能開啟（形成雙刀）。',
    ],
  },
  villager: {
    id: 'villager',
    name: '平民',
    aliases: ['村民'],
    faction: 'good',
    category: 'villager',
    description:
      '沒有特殊技能，黑夜階段全程閉眼，透過白天發言資訊投票放逐疑似狼人的玩家。',
  },
  seer: {
    id: 'seer',
    name: '預言家',
    aliases: [],
    faction: 'good',
    category: 'god',
    description:
      '每晚可以查驗一位存活玩家的所屬陣營（好人或狼人），並在白天透過發言向好人報出資訊。',
  },
  psychic: {
    id: 'psychic',
    name: '通靈師',
    aliases: ['魔鏡少女'],
    faction: 'good',
    category: 'god',
    description:
      '每晚可以查驗一位存活玩家的真實身分，並在白天透過發言向好人報出資訊。',
    warnings: [
      '查驗機械狼時：學習前顯示「機械狼」，學習後顯示機械狼所學習對象的真實身分。',
    ],
  },
  witch: {
    id: 'witch',
    name: '女巫',
    aliases: [],
    faction: 'good',
    category: 'god',
    description:
      '擁有一瓶解藥和一瓶毒藥，兩者不可在同一晚使用。解藥未使用時可得知當晚狼人殺害對象並決定是否救人；毒藥可毒殺一名玩家且對方死後無法發動技能。',
    warnings: [
      '解藥與毒藥不可在同一晚同時使用。',
      '女巫能否自救依開局規則開關決定（僅首夜／全程不可／全程可）。',
    ],
  },
  hunter: {
    id: 'hunter',
    name: '獵人',
    aliases: [],
    faction: 'good',
    category: 'god',
    description:
      '若被狼人刀出局、被奶穿、被狼王開槍或白天被放逐出局時可開槍帶走一名存活玩家，亦可選擇壓槍不發動技能；被女巫毒殺則無法開槍。',
    warnings: ['被女巫毒殺時不可開槍。'],
  },
  idiot: {
    id: 'idiot',
    name: '白痴',
    aliases: ['愚者'],
    faction: 'good',
    category: 'god',
    description:
      '若白天於放逐投票中被投出，可翻開角色牌免疫該次放逐並維持存活，但在之後的放逐公投中失去投票權利。',
    warnings: [
      '白痴翻牌免死後是否仍需被狼人追刀才算神職出局，依開局規則開關決定。',
    ],
  },
  guard: {
    id: 'guard',
    name: '守衛',
    aliases: [],
    faction: 'good',
    category: 'god',
    description:
      '每晚可以守護一名玩家免受狼人殺害，可以守護自己或空守，但不能連續兩晚守護同一名玩家。',
    warnings: [
      '若夜間狼人刀殺某位玩家，且守衛守護與女巫解藥同時作用於該玩家，將導致該玩家死亡，稱為「奶穿」。',
      '守衛之盾只防狼刀，無法擋住女巫的毒藥。',
    ],
  },
};

/** 原 MVP 3 個板子的精密定義（完全保留 ID、配置、步驟與 Q&A） */
const MVP_BOARD_DEFINITIONS: Record<string, BoardDefinition> = {
  '12 人局 - 經典': {
    id: '12p-classic',
    name: '12 人局 - 經典',
    playerCount: 12,
    playerCountFilter: '12',
    keywords: ['經典', '預女獵白', '白痴', '愚者', '12人'],
    automationLevel: 'full',
    composition: {
      wolf: [{ roleId: 'wolf', count: 4 }],
      good: [
        { roleId: 'villager', count: 4 },
        { roleId: 'seer', count: 1 },
        { roleId: 'witch', count: 1 },
        { roleId: 'hunter', count: 1 },
        { roleId: 'idiot', count: 1 },
      ],
    },
    nightSchedule: {
      firstNight: [
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人',
          actorRoleIds: ['wolf'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: ['解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。'],
        },
        {
          stepId: 'seer_check',
          actorLabel: '預言家',
          actorRoleIds: ['seer'],
          actionType: 'seer_check',
          openPrompt: '預言家請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '預言家請閉眼',
          judgeTips: ['僅告知所屬陣營（好人 / 狼人），不告知具體神職。'],
        },
        {
          stepId: 'hunter_gesture',
          actorLabel: '獵人',
          actorRoleIds: ['hunter'],
          actionType: 'hunter_gesture',
          openPrompt: '獵人請睜眼',
          actionPrompt: '今晚的開槍手勢是...',
          closePrompt: '獵人請閉眼',
          judgeTips: ['被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。'],
        },
        {
          stepId: 'idiot_confirm',
          actorLabel: '白痴',
          actorRoleIds: ['idiot'],
          actionType: 'confirm_only',
          openPrompt: '白痴請睜眼',
          actionPrompt: '(確認白痴是誰)',
          closePrompt: '白痴請閉眼',
          judgeTips: ['僅首夜確認白痴座位，第二晚起無須睜眼。'],
        },
      ],
      subsequentNights: [
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人',
          actorRoleIds: ['wolf'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: ['解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。'],
        },
        {
          stepId: 'seer_check',
          actorLabel: '預言家',
          actorRoleIds: ['seer'],
          actionType: 'seer_check',
          openPrompt: '預言家請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '預言家請閉眼',
          judgeTips: ['僅告知所屬陣營（好人 / 狼人），不告知具體神職。'],
        },
        {
          stepId: 'hunter_gesture',
          actorLabel: '獵人',
          actorRoleIds: ['hunter'],
          actionType: 'hunter_gesture',
          openPrompt: '獵人請睜眼',
          actionPrompt: '今晚的開槍手勢是...',
          closePrompt: '獵人請閉眼',
          judgeTips: ['被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。'],
        },
      ],
    },
    qaList: [
      {
        id: 'classic-qa-1',
        question: '被女巫毒殺的獵人可以開槍嗎？',
        answer: '不能開槍。獵人僅在被狼人刀出局或白天被放逐出局時才能開槍。',
        relatedRoleIds: ['hunter', 'witch'],
      },
      {
        id: 'classic-qa-2',
        question: '白痴白天被放逐翻牌免死後，狼人還需要追刀白痴才能屠神嗎？',
        answer:
          '依本局「白痴追刀」開關決定：預設不用追刀（其餘神職全滅即判屠神）；若開啟追刀則白痴仍算存活神職。',
        relatedRoleIds: ['idiot'],
      },
      {
        id: 'classic-qa-3',
        question: '女巫同一晚可以同時使用解藥和毒藥嗎？',
        answer: '不行，解藥與毒藥不可在同一晚使用。',
        relatedRoleIds: ['witch'],
      },
      {
        id: 'classic-qa-4',
        question: '狼人白天自爆後什麼時候正式死亡？',
        answer: '狼人白天自爆會強制進入夜晚，並在當晚完成點刀後才正式死亡。',
        relatedRoleIds: ['wolf'],
      },
    ],
    supportedRuleToggles: ['witchSelfSave', 'idiotNeedsExtraKill', 'wolfKillPriority'],
  },
  '12 人局 - 狼王守衛': {
    id: '12p-wolf-king-guard',
    name: '12 人局 - 狼王守衛',
    playerCount: 12,
    playerCountFilter: '12',
    keywords: ['狼王守衛', '黑狼王', '狼王', '守衛', '預女獵守', '奶穿', '12人'],
    automationLevel: 'full',
    composition: {
      wolf: [
        { roleId: 'wolf', count: 3 },
        { roleId: 'wolf_king', count: 1 },
      ],
      good: [
        { roleId: 'villager', count: 4 },
        { roleId: 'seer', count: 1 },
        { roleId: 'witch', count: 1 },
        { roleId: 'hunter', count: 1 },
        { roleId: 'guard', count: 1 },
      ],
    },
    nightSchedule: {
      firstNight: [
        {
          stepId: 'guard_protect',
          actorLabel: '守衛',
          actorRoleIds: ['guard'],
          actionType: 'guard_protect',
          openPrompt: '守衛請睜眼',
          actionPrompt: '請選擇要守護的玩家',
          closePrompt: '守衛請閉眼',
          judgeTips: ['不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。'],
        },
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人(狼王)',
          actorRoleIds: ['wolf', 'wolf_king'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['小狼與狼王共同睜眼點刀，可空刀或自刀。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: [
            '同守同救將觸發「奶穿」導致目標死亡。',
            '解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。',
          ],
        },
        {
          stepId: 'seer_check',
          actorLabel: '預言家',
          actorRoleIds: ['seer'],
          actionType: 'seer_check',
          openPrompt: '預言家請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '預言家請閉眼',
        },
        {
          stepId: 'hunter_gesture',
          actorLabel: '獵人',
          actorRoleIds: ['hunter'],
          actionType: 'hunter_gesture',
          openPrompt: '獵人請睜眼',
          actionPrompt: '今晚的開槍手勢是...',
          closePrompt: '獵人請閉眼',
          judgeTips: ['被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。'],
        },
      ],
      subsequentNights: [
        {
          stepId: 'guard_protect',
          actorLabel: '守衛',
          actorRoleIds: ['guard'],
          actionType: 'guard_protect',
          openPrompt: '守衛請睜眼',
          actionPrompt: '請選擇要守護的玩家',
          closePrompt: '守衛請閉眼',
          judgeTips: ['不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。'],
        },
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人(狼王)',
          actorRoleIds: ['wolf', 'wolf_king'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['小狼與狼王共同睜眼點刀，可空刀或自刀。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: [
            '同守同救將觸發「奶穿」導致目標死亡。',
            '解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。',
          ],
        },
        {
          stepId: 'seer_check',
          actorLabel: '預言家',
          actorRoleIds: ['seer'],
          actionType: 'seer_check',
          openPrompt: '預言家請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '預言家請閉眼',
        },
        {
          stepId: 'hunter_gesture',
          actorLabel: '獵人',
          actorRoleIds: ['hunter'],
          actionType: 'hunter_gesture',
          openPrompt: '獵人請睜眼',
          actionPrompt: '今晚的開槍手勢是...',
          closePrompt: '獵人請閉眼',
          judgeTips: ['被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。'],
        },
      ],
    },
    qaList: [
      {
        id: 'wkg-qa-1',
        question: '什麼是「同守同救奶穿」？',
        answer:
          '若夜間狼人刀殺某位玩家，且守衛守護與女巫解藥同時作用於同一名玩家，會導致該玩家死亡。',
        relatedRoleIds: ['guard', 'witch'],
      },
      {
        id: 'wkg-qa-2',
        question: '守衛可以擋住女巫的毒藥嗎？',
        answer: '不行，普通守衛的盾只能防狼刀，無法擋住女巫毒藥。',
        relatedRoleIds: ['guard', 'witch'],
      },
      {
        id: 'wkg-qa-3',
        question: '狼王在哪些情況下可以開槍？哪些情況不能？',
        answer:
          '自刀死亡、被獵人開槍、被奶穿或白天被放逐出局時可開槍；但若被女巫毒殺、白天自爆或作為最後一隻狼出局則無法開槍。',
        relatedRoleIds: ['wolf_king', 'hunter', 'witch'],
      },
      {
        id: 'wkg-qa-4',
        question: '什麼是「狼刀在先」？',
        answer:
          '若當晚狼刀已達成屠民或屠神條件，即使同晚女巫毒殺最後一隻狼，仍判定狼人陣營勝利。',
        relatedRoleIds: ['wolf', 'wolf_king', 'witch'],
      },
    ],
    supportedRuleToggles: ['witchSelfSave', 'wolfKillPriority'],
  },
  '10 人局 - 機械狼通靈師 / 鏡隱迷蹤': {
    id: '10p-mech-wolf-psychic',
    name: '10 人局 - 機械狼通靈師 / 鏡隱迷蹤',
    playerCount: 10,
    playerCountFilter: '10',
    keywords: ['機械狼', '覺醒隱狼', '通靈師', '魔鏡少女', '鏡隱迷蹤', '10人'],
    automationLevel: 'full',
    composition: {
      wolf: [
        { roleId: 'wolf', count: 2 },
        { roleId: 'mech_wolf', count: 1 },
      ],
      good: [
        { roleId: 'villager', count: 4 },
        { roleId: 'psychic', count: 1 },
        { roleId: 'witch', count: 1 },
        { roleId: 'guard', count: 1 },
      ],
    },
    nightSchedule: {
      firstNight: [
        {
          stepId: 'mech_wolf_learn',
          actorLabel: '機械狼',
          actorRoleIds: ['mech_wolf'],
          actionType: 'mech_wolf_learn',
          openPrompt: '機械狼請睜眼',
          actionPrompt: '請選擇要學習的對象',
          closePrompt: '機械狼請閉眼',
          judgeTips: ['不可學習自己；若開啟首夜強制學習開關則不可跳過。'],
        },
        {
          stepId: 'guard_protect',
          actorLabel: '守衛',
          actorRoleIds: ['guard'],
          actionType: 'guard_protect',
          openPrompt: '守衛請睜眼',
          actionPrompt: '請選擇要守護的玩家',
          closePrompt: '守衛請閉眼',
          judgeTips: ['不可連續兩晚守護同一人；普通守衛之盾無法擋毒。'],
        },
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人',
          actorRoleIds: ['wolf'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['首夜僅小狼睜眼，機械狼尚未入隊。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: ['同守同救會觸發奶穿；解藥與毒藥不可同晚使用。'],
        },
        {
          stepId: 'psychic_check',
          actorLabel: '通靈師',
          actorRoleIds: ['psychic'],
          actionType: 'psychic_check',
          openPrompt: '通靈師請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '通靈師請閉眼',
          judgeTips: ['機械狼學習前查驗為「機械狼」，學習後查驗顯示其所學對象的真實身分。'],
        },
        {
          stepId: 'mech_wolf_reveal_skill',
          actorLabel: '機械狼',
          actorRoleIds: ['mech_wolf'],
          actionType: 'mech_wolf_reveal_skill',
          openPrompt: '機械狼請睜眼',
          actionPrompt: '你學習到的技能為...',
          closePrompt: '機械狼請閉眼',
          judgeTips: ['告知機械狼學到的角色技能，自第二晚起生效。'],
        },
      ],
      subsequentNights: [
        {
          stepId: 'guard_protect',
          actorLabel: '守衛',
          actorRoleIds: ['guard'],
          actionType: 'guard_protect',
          openPrompt: '守衛請睜眼',
          actionPrompt: '請選擇要守護的玩家',
          closePrompt: '守衛請閉眼',
          judgeTips: ['不可連續兩晚守護同一名玩家。'],
        },
        {
          stepId: 'mech_wolf_night_action',
          actorLabel: '機械狼',
          actorRoleIds: ['mech_wolf'],
          actionType: 'mech_wolf_night_action',
          openPrompt: '機械狼請睜眼',
          actionPrompt: '今晚的入隊手勢為...\n請問你要使用技能嗎？',
          closePrompt: '機械狼請閉眼',
          judgeTips: [
            '所有小狼皆淘汰後比出已入隊手勢並解鎖狼刀（若學到小狼則同時解鎖雙刀）。',
            '學女巫僅 1 瓶毒；學守衛之機械盾可擋女巫毒藥且不可連守。',
          ],
        },
        {
          stepId: 'wolf_kill',
          actorLabel: '狼人',
          actorRoleIds: ['wolf', 'mech_wolf'],
          actionType: 'wolf_kill',
          openPrompt: '狼人請睜眼',
          actionPrompt: '請選擇要擊殺的目標',
          closePrompt: '狼人請閉眼',
          judgeTips: ['機械狼僅在所有小狼皆出局入隊後才參與本步驟點刀。'],
        },
        {
          stepId: 'witch_action',
          actorLabel: '女巫',
          actorRoleIds: ['witch'],
          actionType: 'witch_action',
          openPrompt: '女巫請睜眼',
          actionPrompt: '昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？',
          closePrompt: '女巫請閉眼',
          judgeTips: ['注意機械狼若學守衛，其機械盾可以擋住女巫的毒藥。'],
        },
        {
          stepId: 'psychic_check',
          actorLabel: '通靈師',
          actorRoleIds: ['psychic'],
          actionType: 'psychic_check',
          openPrompt: '通靈師請睜眼',
          actionPrompt: '請選擇要查驗的玩家，他的身分是...',
          closePrompt: '通靈師請閉眼',
          judgeTips: ['查驗存活玩家真實身分；已學習之機械狼顯示其所學角色身分。'],
        },
      ],
    },
    qaList: [
      {
        id: 'mwp-qa-1',
        question: '通靈師查驗機械狼會看到什麼身分？',
        answer: '機械狼尚未學習前會查驗為「機械狼」；學習後則動態顯示其所學習對象的真實身分。',
        relatedRoleIds: ['mech_wolf', 'psychic'],
      },
      {
        id: 'mwp-qa-2',
        question: '機械狼學到女巫、守衛、小狼各有什麼特殊規則？',
        answer:
          '學女巫僅獲得 1 瓶毒藥（無解藥）；學守衛的機械盾可以擋住女巫毒藥（仍不可連守）；學小狼的額外一刀須等所有小狼皆出局入隊後才能開啟（形成雙刀）。',
        relatedRoleIds: ['mech_wolf', 'witch', 'guard', 'wolf'],
      },
      {
        id: 'mwp-qa-3',
        question: '機械狼可以自爆嗎？什麼時候入狼隊？',
        answer:
          '機械狼全程不可自爆，初期不入狼隊；當場上所有小狼皆淘汰且機械狼仍存活時，自動入隊並解鎖狼刀。',
        relatedRoleIds: ['mech_wolf', 'wolf'],
      },
      {
        id: 'mwp-qa-4',
        question: '小狼全部出局後好人就贏了嗎？',
        answer: '不是，機械狼屬於狼人陣營，好人須淘汰所有小狼與機械狼方能獲勝。',
        relatedRoleIds: ['mech_wolf'],
      },
    ],
    supportedRuleToggles: ['witchSelfSave', 'mechWolfForceLearnNight1', 'wolfKillPriority'],
  },
};

/** 完整支援自動結算的 24 個核心與進階角色 */
const AUTOMATED_ROLE_IDS = new Set([
  'wolf',
  'wolf_king',
  'mech_wolf',
  'villager',
  'seer',
  'psychic',
  'witch',
  'hunter',
  'idiot',
  'guard',
  'wolf_beauty',
  'dream_catcher',
  'bear',
  'white_wolf_king',
  'knight',
  'poisoner',
  'wolf_girl',
  'treasure_master',
  'masked_villager',
  'nightmare',
  'evil_knight',
  'hybrid',
  'seed_wolf',
  'hidden_wolf',
]);

function stripMarkdownFormatting(input: string): string {
  return input
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\+\+([^+]+)\+\+/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[!warning\]/gi, '')
    .replace(/\[!important\]/gi, '')
    .replace(/\[!note\]/gi, '')
    .replace(/\[!tip\]/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();
}

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\r?\n/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s, idx, arr) => s.length > 0 || (idx > 0 && idx < arr.length - 1))
    .join('\n')
    .trim();
}

/** 解析含有括號別名的角色字串，例：「平民(村民)」、「混血兒(暗戀者/孤獨少女)」 */
function parseRoleNameAndAliases(raw: string): { baseName: string; aliases: string[] } {
  let cleaned = raw.trim();
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  const match = cleaned.match(/^(.+?)\(([^)]+)\)$/);
  if (!match) {
    return { baseName: cleaned, aliases: [] };
  }
  const baseName = match[1].trim();
  const aliases = match[2]
    .split(/[/／、,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { baseName, aliases };
}

/** 將板子名稱轉成穩定唯一的 ASCII ID */
function makeBoardId(title: string, usedIds: Set<string>): string {
  const countMatch = title.match(/^(\d+)\s*人局\s*-\s*(.+)$/);
  const prefix = countMatch ? `${countMatch[1]}p` : 'multi';
  const namePart = countMatch ? countMatch[2] : title;

  // 若為 ASCII 英文或含英文，取 slug；中文以穩定查表或簡潔 hash 確保唯一且可讀
  const tokens: string[] = [];
  for (const [zh, id] of Object.entries(ROLE_ID_MAP)) {
    if (namePart.includes(zh)) {
      tokens.push(id.replace(/_/g, '-'));
    }
  }

  let slug = tokens.slice(0, 3).join('-');
  if (!slug) {
    // 非角色名板子給予語意化識別碼
    const semanticMap: Record<string, string> = {
      經典: 'classic',
      鏡隱迷蹤: 'mirror-maze',
      假面之夜: 'masked-night',
      生還者: 'survivor',
      諸神黃昏: 'ragnarok',
      末日狂徒: 'doomsday-outlaws',
      動物狂歡夜: 'animal-carnival',
      奇幻之夜: 'fantasy-night',
      鬧鬧派對: 'noisy-party',
      迷霧鴉影: 'misty-crow',
      雙生幻想: 'twin-fantasy',
      燈影: 'lantern-shadow',
      胡夫地平線: 'khufu-horizon',
      偵探怪盜: 'detective-phantom',
      風聲諜影: 'wind-espionage',
      沙龍之夜: 'salon-night',
      唯鄰是從: 'neighbor-only',
      連連看: 'lianliankan',
      獵殺潛狼: 'hunt-hidden-wolf',
      動物夢境: 'animal-dream',
      永夜降臨: 'eternal-night',
      暗黑童話: 'dark-fairytale',
      血月奇譚: 'blood-moon-tale',
      命運輪盤: 'wheel-of-fate',
      迷失之境: 'lost-realm',
      無間道: 'infernal-affairs',
      聖殿騎士: 'templar-knight',
      真假預言: 'true-false-seer',
      孤島求生: 'island-survival',
      夜幕低垂: 'nightfall',
      假面舞會: 'masquerade',
      狼人殺戮: 'wolf-slaughter',
      雙面謎團: 'two-faced-mystery',
      時光裂縫: 'time-rift',
      星月奇緣: 'star-moon',
      暗夜迷局: 'dark-night-puzzle',
      幻影魔城: 'phantom-castle',
      雲端追捕: 'cloud-pursuit',
      狼羊大戰: 'wolf-sheep-war',
    };
    for (const [k, v] of Object.entries(semanticMap)) {
      if (namePart.includes(k)) {
        slug = v;
        break;
      }
    }
  }

  if (!slug) {
    // 保底以 UTF-8 hex short hash
    let hash = 0;
    for (let i = 0; i < title.length; i += 1) {
      hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
    }
    slug = `board-${hash.toString(36)}`;
  }

  let candidate = `${prefix}-${slug}`;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${prefix}-${slug}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

/** 展開帶有 rowspan 與 colspan 的 HTML 表格成二維文字矩陣 */
function parseHtmlTable(tableHtml: string): Array<{ isColspanRow: boolean; cells: string[] }> {
  const rows: Array<{ isColspanRow: boolean; cells: string[] }> = [];
  const occupied: Array<Array<string | undefined>> = [];

  const trMatches = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  trMatches.forEach((trMatch, rowIndex) => {
    if (!occupied[rowIndex]) occupied[rowIndex] = [];

    const tdMatches = [...trMatch[1].matchAll(/<t[dh]\b([^>]*)>([\s\S]*?)<\/t[dh]>/gi)];
    let colCursor = 0;
    let hasColspan3 = false;

    for (const tdMatch of tdMatches) {
      while (occupied[rowIndex][colCursor] !== undefined) {
        colCursor += 1;
      }
      const attrs = tdMatch[1] || '';
      const cellText = decodeHtmlText(tdMatch[2]);
      const rowspan = Number(attrs.match(/rowspan\s*=\s*["']?(\d+)/i)?.[1] ?? '1');
      const colspan = Number(attrs.match(/colspan\s*=\s*["']?(\d+)/i)?.[1] ?? '1');

      if (colspan >= 3 && tdMatches.length === 1) {
        hasColspan3 = true;
      }

      for (let r = 0; r < rowspan; r += 1) {
        if (!occupied[rowIndex + r]) occupied[rowIndex + r] = [];
        for (let c = 0; c < colspan; c += 1) {
          occupied[rowIndex + r][colCursor + c] = cellText;
        }
      }
      colCursor += colspan;
    }

    rows.push({
      isColspanRow: hasColspan3,
      cells: (occupied[rowIndex] || []).map((v) => v ?? ''),
    });
  });

  return rows;
}

/** 由角色名稱/別名尋找對應的所有可能 RoleId */
function resolveRoleIdsFromLabel(
  label: string,
  boardRoleIds: string[],
  roleLookup: Map<string, string>,
  boardWolfRoleIds: string[] = [],
): string[] {
  const matched = new Set<string>();
  const normalized = label.replace(/[（()）\s]/g, '');

  // 「狼人」步驟：優先包含板子中會睜眼刀人的狼人陣營角色
  if (normalized.includes('狼人') || normalized === '狼') {
    const soloWolfIds = new Set([
      'mech_wolf',
      'hidden_wolf',
      'gargoyle',
      'awakened_gargoyle',
      'scent_phantom',
      'xu_xian_phantom',
      'wolf_younger_brother',
    ]);
    for (const rId of boardWolfRoleIds) {
      if (!soloWolfIds.has(rId)) {
        matched.add(rId);
      }
    }
    if (matched.size === 0) {
      for (const rId of boardWolfRoleIds) {
        matched.add(rId);
      }
    }
  }

  // 直接名稱或別名比對（長字優先）
  const sortedNames = [...roleLookup.keys()].sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (name.length >= 2 && normalized.includes(name)) {
      const rId = roleLookup.get(name)!;
      if (boardRoleIds.includes(rId)) {
        matched.add(rId);
      }
    }
  }
  // 單字角色如「熊」
  for (const name of sortedNames) {
    if (name.length === 1 && normalized.includes(name)) {
      const rId = roleLookup.get(name)!;
      if (boardRoleIds.includes(rId)) {
        matched.add(rId);
      }
    }
  }

  return [...matched];
}

/** 決定夜間步驟對應的 NightActionType（未自動化角色安全降級為 confirm_only） */
function inferNightActionType(
  actorLabel: string,
  actorRoleIds: string[],
  openPrompt: string,
  actionPrompt: string,
  boardRoleIds: string[],
  hasCustomWolfMechanic: boolean,
): NightActionType {
  const combined = `${actorLabel} ${openPrompt} ${actionPrompt}`;

  // 純確認或相認步驟
  if (
    /^\(.*確認.*\)$/.test(actionPrompt.trim()) ||
    actionPrompt.includes('確認') ||
    actionPrompt.includes('請相認') ||
    actionPrompt.includes('認識彼此')
  ) {
    return 'confirm_only';
  }

  // 機械狼
  if (actorRoleIds.includes('mech_wolf') || actorLabel.includes('機械狼')) {
    if (actionPrompt.includes('學習的對象')) return 'mech_wolf_learn';
    if (actionPrompt.includes('學習到的技能') || actionPrompt.includes('學到的技能')) {
      return 'mech_wolf_reveal_skill';
    }
    if (actionPrompt.includes('入隊手勢') || actionPrompt.includes('使用技能')) {
      return 'mech_wolf_night_action';
    }
    return 'confirm_only';
  }

  // 狼人點刀（含種狼「擊殺或感染」與各類進階狼隊點刀）
  if (
    (actorLabel.startsWith('狼人') || actorRoleIds.includes('wolf')) &&
    (actionPrompt.includes('擊殺的目標') ||
      actionPrompt.includes('擊殺或感染') ||
      actionPrompt.includes('襲擊') ||
      actionPrompt.includes('刀誰'))
  ) {
    return hasCustomWolfMechanic ? 'wolf_kill' : 'wolf_kill';
  }

  // 標準女巫
  if (
    actorRoleIds.includes('witch') &&
    actorRoleIds.length === 1 &&
    !actorLabel.includes('覺醒女巫') &&
    !actorLabel.includes('煉金魔女') &&
    (combined.includes('解藥') || combined.includes('毒藥'))
  ) {
    return 'witch_action';
  }

  // 毒師（僅一瓶毒藥）
  if (
    actorRoleIds.includes('poisoner') &&
    actorRoleIds.length === 1 &&
    combined.includes('毒')
  ) {
    return 'poisoner_poison';
  }

  // 狼女孩首夜表白
  if (
    actorRoleIds.includes('wolf_girl') &&
    actorRoleIds.length === 1 &&
    combined.includes('表白')
  ) {
    return 'wolf_girl_confess';
  }

  // 盜寶大師選擇底牌身分
  if (
    actorRoleIds.includes('treasure_master') &&
    actorRoleIds.length === 1 &&
    (combined.includes('選擇一個身分') || combined.includes('剩餘的三個身分'))
  ) {
    return 'treasure_master_choose';
  }

  // 標準預言家
  if (
    actorRoleIds.includes('seer') &&
    actorRoleIds.length === 1 &&
    !actorLabel.includes('酒鬼') &&
    !actorLabel.includes('燈影') &&
    !actorLabel.includes('白蛇') &&
    !actorLabel.includes('覺醒預言家') &&
    !actorLabel.includes('愚言家') &&
    combined.includes('查驗')
  ) {
    return 'seer_check';
  }

  // 標準通靈師
  if (
    actorRoleIds.includes('psychic') &&
    actorRoleIds.length === 1 &&
    combined.includes('查驗')
  ) {
    return 'psychic_check';
  }

  // 標準守衛
  if (
    actorRoleIds.includes('guard') &&
    actorRoleIds.length === 1 &&
    combined.includes('守護')
  ) {
    return 'guard_protect';
  }

  // 標準獵人
  if (
    actorRoleIds.includes('hunter') &&
    actorRoleIds.length === 1 &&
    !actorLabel.includes('覺醒獵人') &&
    combined.includes('開槍手勢')
  ) {
    return 'hunter_gesture';
  }

  // 標準狼美人魅惑
  if (
    actorRoleIds.includes('wolf_beauty') &&
    actorRoleIds.length === 1 &&
    !actorLabel.includes('覺醒狼美人') &&
    combined.includes('魅惑')
  ) {
    return 'wolf_beauty_charm';
  }

  // 標準攝夢人攝夢
  if (
    actorRoleIds.includes('dream_catcher') &&
    actorRoleIds.length === 1 &&
    !actorLabel.includes('覺醒攝夢人') &&
    (combined.includes('攝夢') || combined.includes('夢遊'))
  ) {
    return 'dream_catcher_dream';
  }

  // 夢魘恐懼
  if (
    actorRoleIds.includes('nightmare') &&
    actorRoleIds.length === 1 &&
    combined.includes('恐懼')
  ) {
    return 'nightmare_fear';
  }

  // 混血兒首夜選榜樣
  if (
    actorRoleIds.includes('hybrid') &&
    actorRoleIds.length === 1 &&
    (combined.includes('混的玩家') || combined.includes('榜樣'))
  ) {
    return 'hybrid_choose';
  }

  return 'confirm_only';
}

function parseHostStepsFromSection(
  sectionText: string,
  boardRoleIds: string[],
  roleLookup: Map<string, string>,
  hasCustomWolfMechanic: boolean,
  boardWolfRoleIds: string[],
): { firstNight: NightStepScript[]; subsequentNights: NightStepScript[] } {
  const parseTableSteps = (tableHtml: string, branchNote?: string): NightStepScript[] => {
    const rows = parseHtmlTable(tableHtml);
    const steps: NightStepScript[] = [];
    const pendingTips: string[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (row.isColspanRow) {
        const tipText = row.cells[0]?.trim();
        if (tipText) {
          if (steps.length > 0 && i === rows.length - 1) {
            const prev = steps[steps.length - 1];
            prev.judgeTips = [...(prev.judgeTips ?? []), tipText];
          } else {
            pendingTips.push(tipText);
          }
        }
        continue;
      }

      const openPrompt = (row.cells[0] || '').trim();
      const actionPrompt = (row.cells[1] || '').trim();
      const closePrompt = (row.cells[2] || '').trim();
      if (!openPrompt && !actionPrompt && !closePrompt) continue;

      let actorLabel = openPrompt
        .replace(/請睜眼.*$/, '')
        .replace(/睜眼.*$/, '')
        .trim();
      if (!actorLabel) actorLabel = `步驟 ${steps.length + 1}`;
      if (branchNote) {
        actorLabel = `${actorLabel}（${branchNote}）`;
      }

      const actorRoleIds = resolveRoleIdsFromLabel(
        actorLabel,
        boardRoleIds,
        roleLookup,
        boardWolfRoleIds,
      );
      const actionType = inferNightActionType(
        actorLabel,
        actorRoleIds,
        openPrompt,
        actionPrompt,
        boardRoleIds,
        hasCustomWolfMechanic,
      );

      const tips = [...pendingTips];
      pendingTips.length = 0;

      if (actionType === 'confirm_only' && !actionPrompt.includes('確認') && !actionPrompt.includes('相認')) {
        tips.push('此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。');
      }

      steps.push({
        stepId: `step_${steps.length + 1}`,
        actorLabel,
        actorRoleIds,
        actionType,
        openPrompt: openPrompt || `${actorLabel}請睜眼`,
        actionPrompt: actionPrompt || '(依規則執行夜間行動)',
        closePrompt: closePrompt || `${actorLabel}請閉眼`,
        ...(tips.length > 0 ? { judgeTips: tips } : {}),
      });
    }

    // 確保 stepId 唯一
    const seenIds = new Set<string>();
    return steps.map((step, idx) => {
      const baseId = step.actionType === 'confirm_only' ? `step_${idx + 1}` : step.actionType;
      let id = baseId;
      let n = 2;
      while (seenIds.has(id)) {
        id = `${baseId}_${n}`;
        n += 1;
      }
      seenIds.add(id);
      return { ...step, stepId: id };
    });
  };

  // 切分各區塊（例：- 第一晚、- 第二晚之後、- 第二晚 (條件) 等）
  const blocks: Array<{ heading: string; tables: string[] }> = [];
  const blockMatches = [
    ...sectionText.matchAll(/(?:^|\n)-\s+([^\n]+)\n([\s\S]*?)(?=\n-\s+[^\n]+\n|$)/g),
  ];

  if (blockMatches.length > 0) {
    for (const m of blockMatches) {
      const heading = m[1].trim();
      const body = m[2];
      const tables = [...body.matchAll(/<table>([\s\S]*?)<\/table>/gi)].map((t) => t[0]);
      if (tables.length > 0) {
        blocks.push({ heading, tables });
      }
    }
  } else {
    const tables = [...sectionText.matchAll(/<table>([\s\S]*?)<\/table>/gi)].map((t) => t[0]);
    if (tables.length > 0) {
      blocks.push({ heading: '每晚', tables });
    }
  }

  let firstNight: NightStepScript[] = [];
  let subsequentNights: NightStepScript[] = [];
  const extraSubsequentSteps: NightStepScript[] = [];

  for (const block of blocks) {
    const h = block.heading;
    const isFirst = h.includes('第一晚') || h.includes('首晚');
    const isSubsequent =
      h.includes('第二晚') || h.includes('第三晚') || h.includes('每晚') || h.includes('雙子出局');

    const condMatch = h.match(/\(([^)]+)\)/);
    const branchNote = condMatch ? condMatch[1] : undefined;

    for (const tbl of block.tables) {
      const parsed = parseTableSteps(tbl);
      if (isFirst && firstNight.length === 0) {
        firstNight = parsed;
      } else if (isSubsequent) {
        if (subsequentNights.length === 0) {
          subsequentNights = branchNote
            ? parsed.map((s) => ({
                ...s,
                judgeTips: [`情境條件：${branchNote}`, ...(s.judgeTips ?? [])],
              }))
            : parsed;
        } else {
          // 合併條件分支中額外出現的步驟
          const existingSignature = new Set(
            subsequentNights.map((s) => `${s.openPrompt}__${s.actionPrompt}`),
          );
          for (const candidate of parsed) {
            const sig = `${candidate.openPrompt}__${candidate.actionPrompt}`;
            if (!existingSignature.has(sig)) {
              extraSubsequentSteps.push({
                ...candidate,
                stepId: `${candidate.stepId}_cond`,
                actorLabel: branchNote
                  ? `${candidate.actorLabel}（${branchNote}）`
                  : candidate.actorLabel,
                judgeTips: [
                  `條件分支步驟（${h}）`,
                  ...(candidate.judgeTips ?? []),
                ],
              });
              existingSignature.add(sig);
            }
          }
        }
      }
    }
  }

  if (firstNight.length === 0 && subsequentNights.length > 0) {
    firstNight = subsequentNights.map((s) => ({ ...s }));
  }
  if (subsequentNights.length === 0 && firstNight.length > 0) {
    subsequentNights = firstNight.map((s) => ({ ...s }));
  }
  if (extraSubsequentSteps.length > 0) {
    subsequentNights = [...subsequentNights, ...extraSubsequentSteps].map((s, idx) => ({
      ...s,
      stepId: `${s.stepId}_${idx + 1}`,
    }));
  }

  return { firstNight, subsequentNights };
}

function parseQAList(
  qaSection: string | undefined,
  boardId: string,
  boardRoleIds: string[],
  roleLookup: Map<string, string>,
): BoardQA[] {
  if (!qaSection) return [];
  const lines = qaSection.split(/\r?\n/);
  const items: Array<{ question: string; answer: string }> = [];
  let currentQ: string | null = null;
  let currentA: string[] = [];

  const flush = () => {
    if (currentQ !== null) {
      const q = stripMarkdownFormatting(currentQ);
      const a = stripMarkdownFormatting(currentA.join('\n'));
      if (q) {
        items.push({ question: q, answer: a || '請依當局約定規則裁定。' });
      }
    }
    currentQ = null;
    currentA = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const qMatch = line.match(/^(?:\d+\.\s*)?問[:：]\s*(.+)$/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    const aMatch = line.match(/^答[:：]\s*(.+)$/);

    if (qMatch) {
      flush();
      currentQ = qMatch[1];
    } else if (aMatch) {
      currentA.push(aMatch[1]);
    } else if (numberedMatch && currentQ !== null && currentA.length > 0) {
      // 少數條目漏寫「問：」字樣（如「3. 如果混血兒進鍊子...」）
      flush();
      currentQ = numberedMatch[1];
    } else if (currentQ !== null) {
      if (currentA.length > 0) {
        currentA.push(line);
      } else {
        currentQ = `${currentQ}\n${line}`;
      }
    }
  }
  flush();

  return items.map((item, idx) => {
    const combined = `${item.question} ${item.answer}`;
    const relatedRoleIds = resolveRoleIdsFromLabel(combined, boardRoleIds, roleLookup);
    return {
      id: `${boardId}-qa-${idx + 1}`,
      question: item.question,
      answer: item.answer,
      ...(relatedRoleIds.length > 0 ? { relatedRoleIds } : {}),
    };
  });
}

function main() {
  const rawText = fs
    .readFileSync(RAW_PATH, 'utf8')
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/gm, '');
  const rawBoards = rawText.split(/(?=^# [^#])/m).filter((b) => b.trim().length > 0);
  if (rawBoards.length === 0) {
    throw new Error('未從 docs/boards-raw.md 解析到任何板子');
  }

  // 第一輪：掃描全部 128 個角色名稱、別名、陣營與職業介紹
  const roleAliasMap = new Map<string, Set<string>>();
  const roleFactionVotes = new Map<string, Faction[]>();
  const roleDescriptions = new Map<string, string[]>();
  const roleWarnings = new Map<string, Set<string>>();

  for (const rawBoard of rawBoards) {
    const compMatch = rawBoard.match(/## (?:常見)?配置([\s\S]*?)(?=\n## |$)/);
    if (compMatch) {
      let currentFaction: Faction = 'good';
      for (const line of compMatch[1].split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- 狼人陣營')) {
          currentFaction = 'wolf';
          continue;
        }
        if (trimmed.startsWith('- 好人陣營') || trimmed.startsWith('- 神職陣營') || trimmed.startsWith('- 平民陣營')) {
          currentFaction = 'good';
          continue;
        }
        if (trimmed.startsWith('- 第三方陣營') || trimmed.startsWith('#### 第二身分') || trimmed.startsWith('#### 特殊身分')) {
          currentFaction = 'third_party';
          continue;
        }
        if (trimmed.startsWith('#### 性別')) {
          break;
        }
        const slotMatch = trimmed.match(/^-\s+\(?(.+?)\s*×\s*\d+\)?$/);
        const bareMatch = !slotMatch ? trimmed.match(/^-\s+([^\s×]+)$/) : null;
        const roleLabel = slotMatch?.[1] ?? bareMatch?.[1];
        if (roleLabel && !['男性', '女性'].includes(roleLabel)) {
          const { baseName, aliases } = parseRoleNameAndAliases(roleLabel);
          if (!roleAliasMap.has(baseName)) roleAliasMap.set(baseName, new Set());
          aliases.forEach((a) => roleAliasMap.get(baseName)!.add(a));
          if (!roleFactionVotes.has(baseName)) roleFactionVotes.set(baseName, []);
          roleFactionVotes.get(baseName)!.push(currentFaction);
        }
      }
    }

    const introMatch = rawBoard.match(/## 職業介紹([\s\S]*?)(?=\n## |$)/);
    if (introMatch) {
      const blocks = introMatch[1].split(/(?=^###\s+)/m);
      for (const block of blocks) {
        const headerMatch = block.match(/^###\s+(.+)\r?\n([\s\S]*)$/);
        if (!headerMatch) continue;
        const roleName = headerMatch[1].trim();
        // 移除 #### 子標題後作為職業介紹正文
        const bodyRaw = headerMatch[2].split(/\n####\s+/)[0].trim();
        const warnings: string[] = [];
        const bodyLines: string[] = [];
        for (const line of bodyRaw.split(/\r?\n/)) {
          const t = line.trim();
          if (!t) continue;
          if (t.startsWith('> [!warning]') || t.startsWith('> [!important]')) {
            continue;
          }
          if (t.startsWith('>')) {
            const cleanWarn = stripMarkdownFormatting(t.replace(/^>\s*/, ''));
            if (cleanWarn) warnings.push(cleanWarn);
          } else {
            bodyLines.push(stripMarkdownFormatting(t));
          }
        }
        const desc = bodyLines.join('\n').trim();
        if (desc) {
          if (!roleDescriptions.has(roleName)) roleDescriptions.set(roleName, []);
          roleDescriptions.get(roleName)!.push(desc);
        }
        if (warnings.length > 0) {
          if (!roleWarnings.has(roleName)) roleWarnings.set(roleName, new Set());
          warnings.forEach((w) => roleWarnings.get(roleName)!.add(w));
        }
      }
    }
  }

  // 補上特殊表格配置角色陣營（影子、復仇者、睡美人、狂熱粉、尋香魅影、獵魔人）
  const allRoleNames = [...new Set([...roleDescriptions.keys(), ...Object.keys(ROLE_ID_MAP)])];
  const unmappedRoles = allRoleNames.filter((name) => !ROLE_ID_MAP[name]);
  if (unmappedRoles.length > 0) {
    throw new Error(`發現未登錄於 ROLE_ID_MAP 的新角色：${unmappedRoles.join('、')}`);
  }

  const rolesById: Record<string, RoleDefinition> = {};
  const roleLookup = new Map<string, string>();

  // 先建立所有 RoleDefinition（確保 MVP 10 個完全保留）
  for (const name of allRoleNames) {
    const id = ROLE_ID_MAP[name];
    if (!id) {
      throw new Error(`找不到角色「${name}」的 ID 對照`);
    }
    if (MVP_CORE_ROLES[id]) {
      rolesById[id] = MVP_CORE_ROLES[id];
    } else {
      const override = ROLE_META_OVERRIDE[id];
      const votes = roleFactionVotes.get(name) ?? [];
      let faction: Faction = override?.faction ?? 'good';
      if (!override) {
        const wolfCount = votes.filter((v) => v === 'wolf').length;
        const goodCount = votes.filter((v) => v === 'good').length;
        const thirdCount = votes.filter((v) => v === 'third_party').length;
        if (thirdCount > wolfCount && thirdCount > goodCount) faction = 'third_party';
        else if (wolfCount >= goodCount && wolfCount > 0) faction = 'wolf';
        else faction = 'good';
      }
      const category: RoleCategory =
        override?.category ??
        (faction === 'wolf' ? 'wolf' : faction === 'third_party' ? 'third_party' : 'god');

      const aliases = Array.from(
        new Set([...(roleAliasMap.get(name) ?? []), ...(override?.extraAliases ?? [])]),
      );
      const descriptions = roleDescriptions.get(name) ?? [];
      // 挑選資訊最完整但不過長的第一則或最長描述
      const bestDesc =
        descriptions.sort((a, b) => b.length - a.length)[0] ?? `${name}，請依該板子規則使用技能。`;
      const warnings = Array.from(roleWarnings.get(name) ?? []).slice(0, 3);

      rolesById[id] = {
        id,
        name,
        aliases,
        faction,
        category,
        description: bestDesc,
        ...(warnings.length > 0 ? { warnings } : {}),
      };
    }

    roleLookup.set(name, id);
    for (const alias of rolesById[id].aliases) {
      if (!roleLookup.has(alias)) {
        roleLookup.set(alias, id);
      }
    }
  }

  // 第二輪：解析全部 142 個板子
  const usedBoardIds = new Set<string>(
    Object.values(MVP_BOARD_DEFINITIONS).map((b) => b.id),
  );
  const allBoards: BoardDefinition[] = [];

  for (const rawBoard of rawBoards) {
    const title = rawBoard.split(/\r?\n/)[0].replace(/^#\s+/, '').trim();

    // 若為 3 個 MVP 板子，直接使用精密設定並確保不變
    if (MVP_BOARD_DEFINITIONS[title]) {
      allBoards.push(MVP_BOARD_DEFINITIONS[title]);
      continue;
    }

    const id = makeBoardId(title, usedBoardIds);
    const countMatch = title.match(/^(\d+)\s*人局/);
    let playerCount = countMatch ? Number(countMatch[1]) : 12;
    let playerCountRange: [number, number] | undefined;
    let playerCountFilter: PlayerCountFilter = 'multi';
    if (countMatch) {
      const n = countMatch[1];
      if (['6', '7', '8', '9', '10', '12'].includes(n)) {
        playerCountFilter = n as PlayerCountFilter;
      }
    }

    const wolfSlots: RoleSlot[] = [];
    const goodSlots: RoleSlot[] = [];
    const thirdPartySlots: RoleSlot[] = [];
    let isFlexibleComposition = false;
    let compositionNote: string | undefined;
    let presetPlayerCounts: number[] | undefined;

    const addSlot = (bucket: RoleSlot[], roleId: string, count: number) => {
      const existing = bucket.find((s) => s.roleId === roleId);
      if (existing) existing.count += count;
      else bucket.push({ roleId, count });
    };

    const compMatch = rawBoard.match(/## (?:常見)?配置([\s\S]*?)(?=\n## |$)/);
    const compBody = compMatch?.[1] ?? '';

    if (title.includes('11 ~ 16 人局')) {
      playerCount = 12;
      playerCountRange = [11, 16];
      presetPlayerCounts = [11, 12, 13, 14, 15, 16];
      isFlexibleComposition = true;
      compositionNote = '支援 11 ~ 16 人彈性開局（預設以 12 人配置列出，可於座位頁面調整人數與身分）。';
      addSlot(wolfSlots, 'wolf', 3);
      addSlot(goodSlots, 'villager', 3);
      addSlot(goodSlots, 'seer', 1);
      addSlot(goodSlots, 'witch', 1);
      addSlot(goodSlots, 'hunter', 1);
      addSlot(goodSlots, 'idiot', 1);
      addSlot(goodSlots, 'guard', 1);
      addSlot(thirdPartySlots, 'shadow', 1);
      addSlot(thirdPartySlots, 'avenger', 1);
      addSlot(thirdPartySlots, 'hybrid', 1);
    } else if (title.includes('獵殺潛狼')) {
      playerCount = 6;
      playerCountRange = [6, 12];
      presetPlayerCounts = [6, 10, 12];
      isFlexibleComposition = true;
      compositionNote = '娛樂局支援 6 / 10 / 12 人配置（小狼與獵人比例依人數調整）。';
      addSlot(wolfSlots, 'wolf', 2);
      addSlot(goodSlots, 'hunter', 4);
    } else if (title.includes('連連看')) {
      playerCount = 10;
      addSlot(wolfSlots, 'scent_phantom', 6);
      addSlot(goodSlots, 'demon_hunter', 4);
      compositionNote = '娛樂局：6 名尋香魅影 vs 4 名獵魔人，第一晚無狼刀。';
    } else {
      // 標準條列配置解析（僅取 #### 第二身分 / #### 性別 之前的主配置，但記錄特殊身分）
      const mainComp = compBody.split(/\n####\s*(?:第二身分|性別)/)[0];
      let currentFaction: Faction = 'good';
      for (const line of mainComp.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('- 狼人陣營')) {
          currentFaction = 'wolf';
          continue;
        }
        if (trimmed.startsWith('- 好人陣營')) {
          currentFaction = 'good';
          if (trimmed.includes('五選三')) {
            isFlexibleComposition = true;
            compositionNote = '神職五選三：從預言家、女巫、獵人、守衛、白痴中選出 3 名上場。';
          }
          continue;
        }
        if (trimmed.startsWith('- 第三方陣營')) {
          currentFaction = 'third_party';
          continue;
        }
        if (trimmed.startsWith('#### 特殊身分')) {
          currentFaction = 'third_party';
          isFlexibleComposition = true;
          compositionNote = '含特殊額外身分（睡美人），可依實際發牌調整。';
          continue;
        }

        const m = trimmed.match(/^-\s+(\(?)(.+?)\s*×\s*(\d+)\)?$/);
        const bare = !m ? trimmed.match(/^-\s+([^\s×]+)$/) : null;
        if (m || bare) {
          const isOptional = Boolean(m?.[1]);
          const rawRoleLabel = (m?.[2] ?? bare?.[1] ?? '').trim();
          const count = m ? Number(m[3]) : 1;
          if (isOptional) {
            isFlexibleComposition = true;
            compositionNote = compositionNote ?? `含選用／替代角色（${rawRoleLabel}）。`;
          }
          const { baseName } = parseRoleNameAndAliases(rawRoleLabel);
          const roleId = roleLookup.get(baseName);
          if (!roleId) {
            throw new Error(`板子「${title}」無法識別角色：「${rawRoleLabel}」`);
          }
          const targetBucket =
            currentFaction === 'wolf'
              ? wolfSlots
              : currentFaction === 'third_party'
                ? thirdPartySlots
                : goodSlots;
          addSlot(targetBucket, roleId, count);
        }
      }

      if (compBody.includes('#### 第二身分')) {
        compositionNote = '含第二身分機制（開膛手傑克 / 狂熱粉 / 偵探），請搭配實體牌與性別提示主持。';
      }

      const sumRoles = [...wolfSlots, ...goodSlots, ...thirdPartySlots].reduce(
        (acc, s) => acc + s.count,
        0,
      );
      if (sumRoles !== playerCount) {
        isFlexibleComposition = true;
        if (!compositionNote) {
          compositionNote = `牌池共 ${sumRoles} 張牌（含盜賊／額外底牌），從中發出 ${playerCount} 張上場。`;
        }
      }
    }

    const boardRoleIds = Array.from(
      new Set([...wolfSlots, ...goodSlots, ...thirdPartySlots].map((s) => s.roleId)),
    );

    const boardWolfRoleIds = wolfSlots.map((s) => s.roleId);
    const hasCustomWolfMechanic = wolfSlots.some((s) => !['wolf', 'wolf_king'].includes(s.roleId));

    const hostMatch = rawBoard.match(/## 法官夜間主持([\s\S]*?)(?=\n## |$)/);
    const { firstNight, subsequentNights } = parseHostStepsFromSection(
      hostMatch?.[1] ?? '',
      boardRoleIds,
      roleLookup,
      hasCustomWolfMechanic,
      boardWolfRoleIds,
    );

    const qaMatch = rawBoard.match(/## 常見 Q & A([\s\S]*)$/);
    const qaList = parseQAList(qaMatch?.[1], id, boardRoleIds, roleLookup);

    // 決定自動化支援等級：若僅含 MVP 核心 10 角色且所有步驟皆非進階 confirm_only（或僅首夜白痴確認）
    const usesOnlyCoreRoles = boardRoleIds.every((rId) => AUTOMATED_ROLE_IDS.has(rId));
    const hasThirdParty = thirdPartySlots.length > 0;
    const automationLevel: 'full' | 'partial_manual' =
      usesOnlyCoreRoles && !hasThirdParty && !isFlexibleComposition ? 'full' : 'partial_manual';

    // 推斷規則開關
    const supportedRuleToggles: Array<keyof RuleOverrides> = [];
    if (boardRoleIds.includes('witch')) supportedRuleToggles.push('witchSelfSave');
    if (boardRoleIds.includes('idiot')) supportedRuleToggles.push('idiotNeedsExtraKill');
    if (boardRoleIds.includes('mech_wolf')) supportedRuleToggles.push('mechWolfForceLearnNight1');
    if (wolfSlots.length > 0) supportedRuleToggles.push('wolfKillPriority');
    if (hasThirdParty) supportedRuleToggles.push('victoryMode');

    // 組裝搜尋關鍵字（含子名稱、所有角色名稱與別名、人數標籤）
    const keywordSet = new Set<string>();
    const titleBody = title.replace(/^\d+\s*人局\s*-\s*/, '');
    titleBody
      .split(/[/&、]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((k) => keywordSet.add(k));
    if (countMatch) keywordSet.add(`${countMatch[1]}人`);
    for (const rId of boardRoleIds) {
      const r = rolesById[rId];
      if (r) {
        keywordSet.add(r.name);
        r.aliases.forEach((a) => keywordSet.add(a));
      }
    }

    allBoards.push({
      id,
      name: title,
      playerCount,
      ...(playerCountRange ? { playerCountRange } : {}),
      playerCountFilter,
      keywords: [...keywordSet],
      composition: {
        wolf: wolfSlots,
        good: goodSlots,
        ...(thirdPartySlots.length > 0 ? { thirdParty: thirdPartySlots } : {}),
      },
      ...(isFlexibleComposition ? { isFlexibleComposition: true } : {}),
      ...(compositionNote ? { compositionNote } : {}),
      ...(presetPlayerCounts ? { presetPlayerCounts } : {}),
      automationLevel,
      nightSchedule: {
        firstNight,
        subsequentNights,
      },
      qaList,
      supportedRuleToggles,
    });
  }

  // 輸出 src/data/roles.ts
  const rolesOut = `// 此檔案由 scripts/parseBoards.ts 自動自 docs/boards-raw.md 解析生成（共 ${Object.keys(rolesById).length} 個不重複角色）
import type { RoleDefinition } from '../logic/types';

export const ROLES_BY_ID: Record<string, RoleDefinition> = ${JSON.stringify(rolesById, null, 2)};

export const ROLE_LIST: RoleDefinition[] = Object.values(ROLES_BY_ID);

export function getRoleById(roleId: string | null): RoleDefinition | undefined {
  if (!roleId) return undefined;
  return ROLES_BY_ID[roleId];
}
`;

  fs.writeFileSync(ROLES_OUT_PATH, rolesOut, 'utf8');

  // 輸出 src/data/boards.ts（保留 MVP_BOARDS 與 ALL_BOARDS）
  const mvpIds = ['12p-classic', '12p-wolf-king-guard', '10p-mech-wolf-psychic'];
  const mvpBoards = mvpIds.map((mvpId) => {
    const found = allBoards.find((b) => b.id === mvpId);
    if (!found) throw new Error(`遺失 MVP 板子：${mvpId}`);
    return found;
  });

  const boardsOut = `// 此檔案由 scripts/parseBoards.ts 自動自 docs/boards-raw.md 解析生成（共 ${allBoards.length} 個板子）
import type { BoardDefinition, PlayerCountFilter } from '../logic/types';

export const ALL_BOARDS: BoardDefinition[] = ${JSON.stringify(allBoards, null, 2)};

export const MVP_BOARDS: BoardDefinition[] = ${JSON.stringify(mvpBoards, null, 2)};

export const BOARDS_BY_ID: Record<string, BoardDefinition> = Object.fromEntries(
  ALL_BOARDS.map((board) => [board.id, board]),
);

export function getBoardById(boardId: string | null): BoardDefinition | undefined {
  if (!boardId) return undefined;
  return BOARDS_BY_ID[boardId];
}

export function filterBoards(
  boards: BoardDefinition[],
  countFilter: PlayerCountFilter | 'all',
  query: string,
): BoardDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();
  return boards.filter((board) => {
    if (countFilter !== 'all' && board.playerCountFilter !== countFilter) {
      return false;
    }
    if (!normalizedQuery) return true;
    const haystack = [board.name, ...board.keywords].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
`;

  fs.writeFileSync(BOARDS_OUT_PATH, boardsOut, 'utf8');

  // 統計摘要輸出
  const qaCount = allBoards.filter((b) => b.qaList.length > 0).length;
  const filterCounts = allBoards.reduce<Record<string, number>>((acc, b) => {
    acc[b.playerCountFilter] = (acc[b.playerCountFilter] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`✅ 解析完成：${allBoards.length} 個板子、${Object.keys(rolesById).length} 個角色、${qaCount} 份 Q&A`);
  console.log('人數分類分佈：', filterCounts);
}

main();
