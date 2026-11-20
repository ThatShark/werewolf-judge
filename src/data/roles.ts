import type { RoleDefinition } from '../logic/types';

export const ROLES_BY_ID: Record<string, RoleDefinition> = {
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

export const ROLE_LIST: RoleDefinition[] = Object.values(ROLES_BY_ID);

export function getRoleById(roleId: string | null): RoleDefinition | undefined {
  if (!roleId) return undefined;
  return ROLES_BY_ID[roleId];
}
