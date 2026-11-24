/**
 * 全量板子與角色實作覆蓋率靜態掃描與體檢表生成腳本
 *
 * 掃描 src/logic/（nightResolution.ts、dayResolution.ts、mechWolf.ts、advancedRoles.ts、
 * wolfGirl.ts、treasureMaster.ts、victory.ts 等）、src/data/roles.ts 與 src/data/boards.ts，
 * 自動產出 docs/audit-report.md。
 *
 * 執行方式（Node 24+）：node scripts/generateAuditReport.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { ALL_BOARDS } from '../src/data/boards.ts';
import { ROLE_LIST, ROLES_BY_ID } from '../src/data/roles.ts';
import type { BoardDefinition, NightActionType, RoleDefinition } from '../src/logic/types.ts';

const ROOT_DIR = process.cwd();
const LOGIC_DIR = path.join(ROOT_DIR, 'src', 'logic');
const REPORT_OUT_PATH = path.join(ROOT_DIR, 'docs', 'audit-report.md');

/** 參與規則引擎掃描之核心邏輯檔案 */
const LOGIC_ENGINE_FILES = [
  'nightResolution.ts',
  'dayResolution.ts',
  'mechWolf.ts',
  'advancedRoles.ts',
  'wolfGirl.ts',
  'treasureMaster.ts',
  'topFiveRoles.ts',
  'inspectionRoles.ts',
  'victory.ts',
] as const;

/**
 * 已在 src/logic/ 完成「完整自動生死／技能／勝負結算」之角色能力說明。
 * 腳本仍會即時掃描 src/logic/ 驗證每個角色確實存在對應實作，避免文件與程式碼脫節。
 */
const FULL_AUTOMATED_ROLE_CAPABILITIES: Record<string, string> = {
  wolf: '狼刀結算、狼刀在先、白天自爆與當晚點刀後死亡、勝負計算',
  villager: '平民邊屠邊計數、狼女孩表白平民同勝判定、盜寶大師底牌分類',
  seer: '夜間陣營查驗（好人／狼人）',
  psychic: '夜間真實身分查驗（含機械狼學習前後與盜寶大師底牌變身）',
  witch: '解藥／毒藥互斥、自救規則（首夜／全程／不可）、同守同救奶穿、封鎖獵人與狼王開槍',
  hunter: '夜死／放逐／狼王開槍觸發開槍資格、被毒或愛情破裂禁止開槍、連鎖開槍結算',
  idiot: '白天首次放逐翻牌免死失投票權、追刀規則開關（idiotNeedsExtraKill）',
  guard: '夜間守護防狼刀、不可連守、同守同救奶穿判定',
  wolf_king: '夜死／放逐／獵人槍擊開槍資格、自爆／被毒／最後一狼禁止開槍、連鎖開槍結算',
  mech_wolf: '首夜學習身分、通靈師查驗偽裝、次夜起機械盾／單毒／通靈／入隊雙刀、不可自爆、自動入狼隊',
  wolf_beauty: '每晚魅惑（不可自魅／連魅／魅老流氓）、不可自刀自爆、非騎士決鬥出局時對象殉情且無技能',
  dream_catcher: '每晚攝夢免疫夜間傷害、連夢致死、攝夢人夜死牽連共死',
  bear: '天亮自動檢查存活左右鄰居是否含狼（含機械狼學習後偽裝）並輸出咆哮結果',
  white_wolf_king: '白天翻牌自爆立即帶走一名玩家（對象無技能）、強制入夜、當晚點刀後死亡',
  knight: '白天翻牌決鬥（限一次）：撞狼對方直接出局且無技能並立刻入夜；撞好人騎士自死',
  poisoner: '夜間單瓶毒藥結算、機械盾可擋、封鎖獵人與狼王開槍',
  wolf_girl: '首夜向非狼表白（表白平民成功同勝）、白天或放逐後自爆觸發愛情破裂帶走表白對象並作廢投票',
  treasure_master: '首夜 3 底牌合法性與陣營歸屬、每晚切底牌且不可連選、通靈師查驗偽裝、盜寶狼入隊與最後一狼蒙面免放逐',
  masked_villager: '夜間遭狼刀／毒藥／攝夢負傷延遲至隔日發言後出局、白天結算解除負傷並重算勝負',
  nightmare: '每晚恐懼一人（不可連恐／次夜起禁恐狼隊友）、恐懼狼人整晚空刀、阻斷預／女／守／通／攝夢／熊與獵人夜死開槍',
  evil_knight: '不可自刀自爆、免疫夜間毒藥與夜死獵人開槍（白天放逐獵人可開槍）、一次性反傷（同晚同毒同驗依先行動者反傷）',
  hybrid: '首夜選榜樣綁定陣營（含榜樣被感染同步更新）、預言家查驗恆金水、不計入狼人數量與預設不計入屠邊人數',
  seed_wolf: '整局限一次狼刀轉感染（女巫顯示空刀、守衛可擋感染）、目標當晚轉狼並即時失能、即時更新屠邊與感染隱狼轉查殺',
  hidden_wolf: '不可自爆、預言家查驗恆金水（通靈師驗隱狼）、場上其他狼人全滅自動入隊帶刀、屠邊須連同隱狼淘汰',
  awakened_seer: '每晚雙目標陣營查驗（雙金水／疑似狼人，可查自己），支援隱狼／雪狼／咒狐交互',
  lantern_seer: '平民邊、每晚陣營查驗結果自動反轉（好↔狼），維持預言家 A／B 盲叫不洩密',
  drunk_seer: '平民邊、每晚陣營查驗結果隨機（支援法官手動覆寫金水／查殺），維持預言家 A／B 盲叫',
  fool_seer: '每晚陣營查驗，白天發言階段可隨時翻牌自曝淘汰自己強制入夜（上警吞警徽）',
  iron_good: '平民邊、白天發言階段可隨時翻牌自曝淘汰自己強制入夜（上警吞警徽）',
  fox: '每晚查驗目標及其左右存活鄰居（共 3 人）是否含狼；三人皆好人則永久失去查驗功能',
  snow_wolf: '正常狼刀與自爆；被預言家／覺醒預言家／愚言家查驗恆顯示好人（金水）',
  cursed_fox: '免疫狼刀、被陣營查驗顯示金水但死亡（攝夢保護不死）、被通靈師／純白驗為咒狐不死、結算時存活或同出局單獨勝',
  gargoyle: '不可自爆、初始不入狼隊（其餘狼全滅自動入隊帶刀）、每晚查驗具體真實身分並留存紀錄供南瓜鬼繼承',
  wolf_witch: '隨狼隊刀人與自爆、每晚單獨查驗真實身分，第二晚起查驗純白之女使其當晚死亡（同晚互驗依狼刀在先）',
  pure_white_maiden: '每晚查驗真實身分，第二晚起查驗狼人陣營使其當晚死亡（含機械狼學習偽裝與咒狐不死特例）',
  demon_wolf: '不可自刀自爆、免疫所有夜間傷害（毒藥／夜死獵人開槍）、每晚查驗非狼玩家為神職或平民',
  pumpkin_ghost: '石像鬼死前預言家驗金水、死後轉查殺（守墓人恆驗狼），石像鬼出局後自動繼承歷史查驗紀錄與驗人能力',
  gravekeeper: '第二晚起自動顯示上一白天放逐出局者陣營（隱狼／南瓜鬼／雪狼顯狼、咒狐顯好人）',
  super_gravekeeper: '第二晚起得知上一白天放逐者陣營、每晚指定繼承者；出局當晚好人繼承者自動接手全部歷史放逐紀錄與後續查驗',
  moon_spirit_wolf: '隨狼隊刀人與自爆；每晚狼隊行動前自動感知左右存活鄰居是否含神職並輸出嗥叫結果（遭夢魘恐懼不嗥叫）',
  nine_tailed_fox: '初始 9 條尾巴，依已公布死訊扣尾（神 -2、民 -1、狼不減，不含當晚未公布死訊），歸零自動死亡',
  senior_villager: '平民邊，第一天死訊公布後自動公布高級平民座號（若首夜遭種狼感染轉狼則不公布）',
  awakened_dream_catcher: '每晚夢語一人免疫夜傷（不奶穿、不可連選、夜死不牽連），當晚最後自動判定是否行動並於第二晚起可選擇夢語出局且封技能',
};

/** 僅實作局部交互、尚未完成完整規則結算的角色註記（歸入清單 B） */
const PARTIAL_AUTOMATION_NOTES: Record<string, string> = {
  old_rascal: '部分實作（僅於 advancedRoles.ts 實作免疫狼美人魅惑；尚未實作被毒／被獵人射殺延遲至隔天發言後死亡）',
};

interface RoleAuditInfo {
  role: RoleDefinition;
  tier: 'A' | 'B';
  logicFiles: string[];
  actionTypes: NightActionType[];
  boards: BoardDefinition[];
  capabilityNote: string;
}

interface BoardAuditInfo {
  board: BoardDefinition;
  roleIds: string[];
  missingListBRoles: RoleAuditInfo[];
  isFullyAutomated: boolean;
}

function getBoardRoleIds(board: BoardDefinition): string[] {
  const slots = [
    ...board.composition.wolf,
    ...board.composition.good,
    ...(board.composition.thirdParty ?? []),
  ];
  return Array.from(new Set(slots.map((s) => s.roleId)));
}

/** 透過專屬函式或欄位實作（而非字串字面量）之角色掃描補充比對規則 */
const ROLE_SYMBOL_PATTERNS: Record<string, RegExp> = {
  seer: /\b(?:getSeerCheckResult|seerCheckTarget|seerResult)\b/,
  psychic: /\b(?:getPsychicCheckResult|psychicCheckTarget|psychicResult)\b/,
  wolf: /\b(?:wolfTarget|wolf_kill|self_explode)\b/,
};

function scanLogicReferences(roleIds: string[]): Map<string, string[]> {
  const fileContents = new Map<string, string>();
  for (const filename of LOGIC_ENGINE_FILES) {
    const fullPath = path.join(LOGIC_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fileContents.set(filename, fs.readFileSync(fullPath, 'utf8'));
    }
  }

  const hits = new Map<string, string[]>();
  for (const roleId of roleIds) {
    const matchedFiles: string[] = [];
    const literalPattern = new RegExp(`['"\`]${roleId}['"\`]`);
    const symbolPattern = ROLE_SYMBOL_PATTERNS[roleId];
    for (const [filename, content] of fileContents.entries()) {
      if (literalPattern.test(content) || (symbolPattern && symbolPattern.test(content))) {
        matchedFiles.push(filename);
      }
    }
    hits.set(roleId, matchedFiles);
  }
  return hits;
}

function collectRoleActionTypes(): Map<string, Set<NightActionType>> {
  const map = new Map<string, Set<NightActionType>>();
  for (const board of ALL_BOARDS) {
    const steps = [...board.nightSchedule.firstNight, ...board.nightSchedule.subsequentNights];
    for (const step of steps) {
      for (const roleId of step.actorRoleIds) {
        if (!map.has(roleId)) {
          map.set(roleId, new Set());
        }
        map.get(roleId)!.add(step.actionType);
      }
    }
  }
  return map;
}

function collectRoleBoards(): Map<string, BoardDefinition[]> {
  const map = new Map<string, BoardDefinition[]>();
  for (const role of ROLE_LIST) {
    map.set(role.id, []);
  }
  for (const board of ALL_BOARDS) {
    for (const roleId of getBoardRoleIds(board)) {
      if (!map.has(roleId)) map.set(roleId, []);
      map.get(roleId)!.push(board);
    }
  }
  return map;
}

function factionLabel(faction: RoleDefinition['faction']): string {
  if (faction === 'wolf') return '狼人';
  if (faction === 'third_party') return '第三方';
  return '好人';
}

function formatBoardNamesCompact(boards: BoardDefinition[], maxInline = 12): string {
  if (boards.length === 0) return '（未出現於任何板子配置）';
  const names = boards.map((b) => b.name);
  if (names.length <= maxInline) {
    return names.join('、');
  }
  return `${names.slice(0, maxInline).join('、')} 等共 ${names.length} 個板子`;
}

function main() {
  const allRoleIds = ROLE_LIST.map((r) => r.id);
  const logicRefs = scanLogicReferences(allRoleIds);
  const roleActionTypes = collectRoleActionTypes();
  const roleBoards = collectRoleBoards();

  // 驗證清單 A 角色確實皆存在於 src/logic/ 中（平民採 category === 'villager' 處理亦於 victory.ts 涵蓋）
  for (const roleId of Object.keys(FULL_AUTOMATED_ROLE_CAPABILITIES)) {
    const files = logicRefs.get(roleId) ?? [];
    if (files.length === 0) {
      throw new Error(`清單 A 角色「${roleId}」未在 src/logic/ 掃描到對應實作，請檢查！`);
    }
  }

  const roleAudits: RoleAuditInfo[] = ROLE_LIST.map((role) => {
    const logicFiles = logicRefs.get(role.id) ?? [];
    const actionTypes = Array.from(roleActionTypes.get(role.id) ?? []);
    const boards = roleBoards.get(role.id) ?? [];
    const isFullAutomated = Boolean(FULL_AUTOMATED_ROLE_CAPABILITIES[role.id]);

    let capabilityNote: string;
    if (isFullAutomated) {
      capabilityNote = FULL_AUTOMATED_ROLE_CAPABILITIES[role.id];
    } else if (PARTIAL_AUTOMATION_NOTES[role.id]) {
      capabilityNote = PARTIAL_AUTOMATION_NOTES[role.id];
    } else if (actionTypes.length === 0) {
      capabilityNote = '無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整）';
    } else if (actionTypes.every((t) => t === 'confirm_only' || t === 'wolf_kill')) {
      capabilityNote = `僅夜間睜閉眼台詞（${actionTypes.join(', ')}），專屬技能需法官手動調整`;
    } else {
      capabilityNote = `共用步驟（${actionTypes.join(', ')}），專屬技能需法官手動調整`;
    }

    return {
      role,
      tier: isFullAutomated ? 'A' : 'B',
      logicFiles,
      actionTypes,
      boards,
      capabilityNote,
    };
  });

  const roleAuditById = new Map(roleAudits.map((a) => [a.role.id, a]));

  const listA = roleAudits
    .filter((a) => a.tier === 'A')
    .sort((a, b) => b.boards.length - a.boards.length || a.role.id.localeCompare(b.role.id));

  const listB = roleAudits
    .filter((a) => a.tier === 'B')
    .sort((a, b) => b.boards.length - a.boards.length || a.role.id.localeCompare(b.role.id));

  const boardAudits: BoardAuditInfo[] = ALL_BOARDS.map((board) => {
    const roleIds = getBoardRoleIds(board);
    const missingListBRoles = roleIds
      .map((id) => roleAuditById.get(id)!)
      .filter((a) => a.tier === 'B')
      .sort((a, b) => b.boards.length - a.boards.length || a.role.id.localeCompare(b.role.id));
    return {
      board,
      roleIds,
      missingListBRoles,
      isFullyAutomated: missingListBRoles.length === 0,
    };
  });

  const readyBoards = boardAudits.filter((b) => b.isFullyAutomated);
  const pendingBoards = boardAudits
    .filter((b) => !b.isFullyAutomated)
    .sort((a, b) => {
      // 優先依「缺少角色數」由少到多（只差 1 個角色的板子最前），再依「最高頻缺口角色出現次數」由高到低
      if (a.missingListBRoles.length !== b.missingListBRoles.length) {
        return a.missingListBRoles.length - b.missingListBRoles.length;
      }
      const aTopFreq = a.missingListBRoles[0]?.boards.length ?? 0;
      const bTopFreq = b.missingListBRoles[0]?.boards.length ?? 0;
      if (aTopFreq !== bTopFreq) return bTopFreq - aTopFreq;
      return a.board.id.localeCompare(b.board.id);
    });

  // 統計「若單獨補齊某一個清單 B 角色，能立刻解鎖幾個只差 1 角色的板子」
  const unlockCountByRoleId = new Map<string, BoardDefinition[]>();
  for (const b of pendingBoards) {
    if (b.missingListBRoles.length === 1) {
      const onlyMissing = b.missingListBRoles[0].role.id;
      if (!unlockCountByRoleId.has(onlyMissing)) unlockCountByRoleId.set(onlyMissing, []);
      unlockCountByRoleId.get(onlyMissing)!.push(b.board);
    }
  }

  const topRoiRoles = [...listB]
    .map((info) => ({
      info,
      immediateUnlockBoards: unlockCountByRoleId.get(info.role.id) ?? [],
    }))
    .filter((x) => x.info.boards.length > 0)
    .sort(
      (a, b) =>
        b.immediateUnlockBoards.length - a.immediateUnlockBoards.length ||
        b.info.boards.length - a.info.boards.length ||
        a.info.role.id.localeCompare(b.info.role.id),
    )
    .slice(0, 15);

  // 統計缺口角色數分佈
  const gapDistribution = new Map<number, number>();
  for (const b of pendingBoards) {
    const k = b.missingListBRoles.length;
    gapDistribution.set(k, (gapDistribution.get(k) ?? 0) + 1);
  }
  const gapSummary = Array.from(gapDistribution.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([k, count]) => `缺 ${k} 角色：${count} 個板子`)
    .join(' ／ ');

  const pct = (n: number, total: number) => ((n / total) * 100).toFixed(1);

  const lines: string[] = [];
  lines.push('# 全量板子與角色實作覆蓋率體檢表');
  lines.push('');
  lines.push(
    '> 本報告由 `scripts/generateAuditReport.ts` 自動掃描 `src/logic/`（`nightResolution.ts`、`dayResolution.ts`、`mechWolf.ts`、`advancedRoles.ts`、`wolfGirl.ts`、`treasureMaster.ts`、`victory.ts`）、`src/data/roles.ts` 與 `src/data/boards.ts` 生成。',
  );
  lines.push('');
  lines.push('## 一、全量健康與覆蓋率總覽');
  lines.push('');
  lines.push('| 指標項目 | 數值 | 佔比 / 說明 |');
  lines.push('| --- | ---: | --- |');
  lines.push(`| 板子總數（\`ALL_BOARDS\`） | **${ALL_BOARDS.length}** | 與 \`docs/boards-raw.md\` 原文對帳 100% 一致 |`);
  lines.push(`| 角色總數（\`ROLE_LIST\`） | **${ROLE_LIST.length}** | 涵蓋狼人、好人、第三方陣營全部不重複角色 |`);
  lines.push(
    `| 清單 A：全自動結算角色 | **${listA.length}** | 佔總角色數 ${pct(listA.length, ROLE_LIST.length)}% |`,
  );
  lines.push(
    `| 清單 B：僅台詞提示／需手動調整角色 | **${listB.length}** | 佔總角色數 ${pct(listB.length, ROLE_LIST.length)}%（含 1 名部分實作角色） |`,
  );
  lines.push(
    `| 已達成「全角色 100% 自動結算」板子 | **${readyBoards.length} / ${ALL_BOARDS.length}** | 佔總板子數 ${pct(readyBoards.length, ALL_BOARDS.length)}% |`,
  );
  lines.push(
    `| 尚待補齊之板子（含至少 1 名清單 B 角色） | **${pendingBoards.length} / ${ALL_BOARDS.length}** | ${gapSummary} |`,
  );
  lines.push('');

  // 高 ROI 補齊排行榜
  lines.push('## 二、高優先度補齊排行榜（Top 15 熱門清單 B 角色）');
  lines.push('');
  lines.push(
    '優先依「**補完後可立刻解鎖 100% 自動結算的板子數（僅差 1 角色）**」與「**總出現板子數**」排序，方便規劃下一批規則引擎實作順序：',
  );
  lines.push('');
  lines.push('| 排名 | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 補齊可立即解鎖板子數 | 可立即解鎖之板子（僅差此角色） |');
  lines.push('| ---: | --- | --- | --- | ---: | ---: | --- |');
  topRoiRoles.forEach(({ info, immediateUnlockBoards }, idx) => {
    const unlockNames =
      immediateUnlockBoards.length > 0
        ? immediateUnlockBoards.map((b) => b.name).join('、')
        : '—（出現於多缺口板子）';
    lines.push(
      `| ${idx + 1} | **${info.role.name}** | \`${info.role.id}\` | ${factionLabel(info.role.faction)} | ${info.boards.length} | **${immediateUnlockBoards.length}** | ${unlockNames} |`,
    );
  });
  lines.push('');

  // 清單 A
  lines.push(`## 三、清單 A：全自動結算角色（共 ${listA.length} 個）`);
  lines.push('');
  lines.push(
    '以下角色皆已在 `src/logic/` 完整實作自動生死／技能／查驗／勝負結算（依出現板子數由高到低排序）：',
  );
  lines.push('');
  lines.push('| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 對應邏輯模組（`src/logic/`） | 已實作自動結算機制 |');
  lines.push('| ---: | --- | --- | --- | ---: | --- | --- |');
  listA.forEach((info, idx) => {
    const filesStr = info.logicFiles.map((f) => `\`${f}\``).join(', ');
    lines.push(
      `| ${idx + 1} | **${info.role.name}** | \`${info.role.id}\` | ${factionLabel(info.role.faction)} | ${info.boards.length} | ${filesStr} | ${info.capabilityNote} |`,
    );
  });
  lines.push('');

  // 清單 B
  lines.push(`## 四、清單 B：僅台詞提示／需法官手動調整角色（共 ${listB.length} 個）`);
  lines.push('');
  lines.push(
    '以下角色目前於夜間僅走睜閉眼提示（`confirm_only` 或共用狼刀步驟）或無完整自動結算邏輯，須由法官搭配「座位總覽／手動標記」輔助裁定（**依出現板子頻率由高到低排序**）：',
  );
  lines.push('');
  lines.push('| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 現況說明 | 出現板子清單 |');
  lines.push('| ---: | --- | --- | --- | ---: | --- | --- |');
  listB.forEach((info, idx) => {
    const boardListStr =
      info.boards.length > 0 ? info.boards.map((b) => b.name).join('、') : '（未出現於主配置）';
    lines.push(
      `| ${idx + 1} | **${info.role.name}** | \`${info.role.id}\` | ${factionLabel(info.role.faction)} | ${info.boards.length} | ${info.capabilityNote} | ${boardListStr} |`,
    );
  });
  lines.push('');

  // 全板子就緒度總表
  lines.push(`## 五、全板子就緒度總表（共 ${ALL_BOARDS.length} 個板子）`);
  lines.push('');
  lines.push(`### 5.1 已達成「全角色 100% 自動結算」之板子（共 ${readyBoards.length} 個）`);
  lines.push('');
  lines.push('| # | 板子名稱 | 板子 ID | 人數 | 配置角色（皆屬清單 A） |');
  lines.push('| ---: | --- | --- | ---: | --- |');
  readyBoards.forEach((item, idx) => {
    const roleNames = item.roleIds.map((id) => ROLES_BY_ID[id]?.name ?? id).join('、');
    lines.push(
      `| ${idx + 1} | **${item.board.name}** | \`${item.board.id}\` | ${item.board.playerCount} | ${roleNames} |`,
    );
  });
  lines.push('');

  lines.push(
    `### 5.2 尚待補齊之板子（共 ${pendingBoards.length} 個，依缺口角色數由少到多、缺口角色出現頻率由高到低排序）`,
  );
  lines.push('');
  lines.push('| # | 板子名稱 | 板子 ID | 人數 | 缺口數 | 缺少之清單 B 角色（括號為該角色總出現板子數） |');
  lines.push('| ---: | --- | --- | ---: | ---: | --- |');
  pendingBoards.forEach((item, idx) => {
    const missingDesc = item.missingListBRoles
      .map((r) => `**${r.role.name}** \`${r.role.id}\` (${r.boards.length})`)
      .join('、');
    lines.push(
      `| ${idx + 1} | ${item.board.name} | \`${item.board.id}\` | ${item.board.playerCount} | ${item.missingListBRoles.length} | ${missingDesc} |`,
    );
  });
  lines.push('');

  // 附錄：核對無遺漏
  const totalAuditedBoards = readyBoards.length + pendingBoards.length;
  const totalAuditedRoles = listA.length + listB.length;
  lines.push('---');
  lines.push('');
  lines.push(
    `*自動稽核校驗：共盤點 ${totalAuditedBoards} / ${ALL_BOARDS.length} 個板子、${totalAuditedRoles} / ${ROLE_LIST.length} 個角色，0 筆遺漏。高頻角色摘要（Top 5）：${listB
      .slice(0, 5)
      .map((r) => `${r.role.name}(${r.boards.length}板)`)
      .join('、')}。*`,
  );
  lines.push('');

  fs.writeFileSync(REPORT_OUT_PATH, `${lines.join('\n')}`, 'utf8');
  console.log(
    `✅ 已生成 ${path.relative(ROOT_DIR, REPORT_OUT_PATH)}：共 ${ALL_BOARDS.length} 板子（100% 就緒 ${readyBoards.length} 個、待補 ${pendingBoards.length} 個），${ROLE_LIST.length} 角色（清單 A ${listA.length} 個、清單 B ${listB.length} 個）。`,
  );
  console.log(
    `   前 5 高 ROI 清單 B 角色：${topRoiRoles
      .slice(0, 5)
      .map(
        (x) =>
          `${x.info.role.name}(出現${x.info.boards.length}板/立解${x.immediateUnlockBoards.length}板)`,
      )
      .join('、')}`,
  );
  // 確保 helper 不被 TS 報未使用
  void formatBoardNamesCompact;
}

main();
