import type { BoardDefinition, NightStepScript, PlayerCountFilter } from '../logic/types';

const CLASSIC_COMMON_STEPS: NightStepScript[] = [
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
];

const CLASSIC_IDIOT_CONFIRM_STEP: NightStepScript = {
  stepId: 'idiot_confirm',
  actorLabel: '白痴',
  actorRoleIds: ['idiot'],
  actionType: 'confirm_only',
  openPrompt: '白痴請睜眼',
  actionPrompt: '(確認白痴是誰)',
  closePrompt: '白痴請閉眼',
  judgeTips: ['僅首夜確認白痴座位，第二晚起無須睜眼。'],
};

const WOLF_KING_GUARD_STEPS: NightStepScript[] = [
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
];

const MECH_WOLF_FIRST_NIGHT_STEPS: NightStepScript[] = [
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
];

const MECH_WOLF_SUBSEQUENT_STEPS: NightStepScript[] = [
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
];

export const MVP_BOARDS: BoardDefinition[] = [
  {
    id: '12p-classic',
    name: '12 人局 - 經典',
    playerCount: 12,
    playerCountFilter: '12',
    keywords: ['經典', '預女獵白', '白痴', '愚者', '12人'],
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
      firstNight: [...CLASSIC_COMMON_STEPS, CLASSIC_IDIOT_CONFIRM_STEP],
      subsequentNights: [...CLASSIC_COMMON_STEPS],
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
        answer: '依本局「白痴追刀」開關決定：預設不用追刀（其餘神職全滅即判屠神）；若開啟追刀則白痴仍算存活神職。',
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
  {
    id: '12p-wolf-king-guard',
    name: '12 人局 - 狼王守衛',
    playerCount: 12,
    playerCountFilter: '12',
    keywords: ['狼王守衛', '黑狼王', '狼王', '守衛', '預女獵守', '奶穿', '12人'],
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
      firstNight: [...WOLF_KING_GUARD_STEPS],
      subsequentNights: [...WOLF_KING_GUARD_STEPS],
    },
    qaList: [
      {
        id: 'wkg-qa-1',
        question: '什麼是「同守同救奶穿」？',
        answer: '若夜間狼人刀殺某位玩家，且守衛守護與女巫解藥同時作用於同一名玩家，會導致該玩家死亡。',
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
  {
    id: '10p-mech-wolf-psychic',
    name: '10 人局 - 機械狼通靈師 / 鏡隱迷蹤',
    playerCount: 10,
    playerCountFilter: '10',
    keywords: ['機械狼', '覺醒隱狼', '通靈師', '魔鏡少女', '鏡隱迷蹤', '10人'],
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
      firstNight: [...MECH_WOLF_FIRST_NIGHT_STEPS],
      subsequentNights: [...MECH_WOLF_SUBSEQUENT_STEPS],
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
];

export const BOARDS_BY_ID: Record<string, BoardDefinition> = Object.fromEntries(
  MVP_BOARDS.map((board) => [board.id, board]),
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
