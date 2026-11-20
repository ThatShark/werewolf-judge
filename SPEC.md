# 狼人殺法官輔助網頁 — 專案規格書（SPEC.md）

> 本文件為「狼人殺法官輔助網頁（Werewolf Judge）」的完整設計規格，依據 [`docs/boards-raw.md`](docs/boards-raw.md) 解析結果與專案開發規範制定，作為第一階段（MVP）與後續全板子擴充的實作基準。

---

## 1. 專案目標與設計原則

### 1.1 核心目標
打造一款專為線下聚會法官設計的 **Mobile-First 全站暗黑模式** 輔助網頁，解決法官在低光環境主持時的痛點：
- 即時顯示每一晚、每一步驟的 **法官夜間主持台詞** 與 **常見 Q & A / 規則提醒**，無須來回翻查規則書。
- 自動追蹤玩家存活狀態、特殊身分狀態（白痴免死、女巫雙藥、守衛連守、機械狼學習與入隊等）並自動結算天亮結果與勝負。
- 全程持久化至 `localStorage`，防止手機誤觸重整、上一頁或切換 App 造成對局資料遺失。

### 1.2 技術棧與架構規範
- **前端框架**：React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **狀態管理**：Zustand 5 + `persist` middleware（強制同步寫入 `localStorage`）
- **測試框架**：Vitest 3（`npm run test`）
- **目錄職責與防護紅線**：
  - `src/logic/`：純 TypeScript 規則引擎、資料模型與勝負／結算判定。**嚴禁引入任何 React 或 UI 元件**；任何規則異動皆須同步更新對應 `*.test.ts` 並確保 `npm run test` 全數通過。
  - `src/data/`：板子定義、角色字典、夜間台詞與 Q&A 結構化資料（純 TypeScript / JSON）。
  - `src/store/`：Zustand Store 與 `persist` 持久化層，呼叫 `src/logic/` 執行純函式運算。
  - `src/components/`：React UI 畫面元件（Mobile-First 暗黑模式、最小觸控高度 `>= 48px`、關鍵不可逆操作二次確認）。

---

## 2. 來源文件盤點（`docs/boards-raw.md` 掃描統計）

經分段掃描 [`docs/boards-raw.md`](docs/boards-raw.md)（共 19,632 行），完整盤點結果如下：

- **總板子數量**：**142 個**（其中 **77 個**板子內含 `## 常見 Q & A` 區塊）
- **不重複角色總數**：**128 個**（以 `## 職業介紹` 下的 `###` 角色標題去重統計）

### 2.1 板子人數分類分佈
| 篩選標籤 | 來源分類 | 板子數量 |
| :--- | :--- | :---: |
| `6人` | 6 人局 | 4 |
| `7人` | 7 人局 | 1 |
| `8人` | 8 人局 | 2 |
| `9人` | 9 人局 | 6 |
| `10人` | 10 人局 | 33 |
| `12人` | 12 人局 | 93 |
| `多人` | 11 ~ 16 人局（1）、娛樂局（2） | 3 |
| **合計** | — | **142** |

### 2.2 不重複角色清單（共 128 個，依陣營分類）
- **狼人陣營（49）**：九尾、大灰狼、大野狼、小小灰、小狼、月靈狼、白狼王、石像鬼、灰太狼、百變狼王、血月使徒、邪惡商人、典獄長、刺客、夜之貴族、怪盜狼王、阿努比斯、南瓜鬼、狼王、狼兄、狼巫、狼弟、狼美人、狼術師、狼僕、狼鴉之爪、假面、寂夜導師、梅杜莎、雪狼、傀儡、尋香魅影、惡魔、惡靈騎士、猩紅狼王、黑夜使者、黑蝙蝠、搗蛋鬼、詭術師、夢魘、種狼、蝕日侍女、蝕時狼妃、戰狼、機械狼、隱狼、覺醒石像鬼、覺醒狼王、覺醒狼美人
- **好人陣營（62）**：九尾狐、女巫、子狐、小女孩、占卜師、平民、白夜使者、白晝學者、白痴、白澤、白貓、企鵝、名媛、守墓人、守衛、羊駝、老流氓、兔兔、奇蹟商人、定序王子、河豚、狐狸、流光伯爵、珀爾修斯、烏鴉、純白之女、酒鬼預言家、高級平民、偵探、異族王子、通靈者、通靈師、喜羊羊、超級守墓人、超級黑市商人、黑市商人、愚言家、煉金魔女、禁言長老、蜂之狂獵、預言家、槓精、熊、管家、舞者、蒙面人、燈影預言家、獵人、獵魔人、雙子、騎士、覺醒女巫、覺醒白痴、覺醒預言家、覺醒獵人、覺醒攝夢人、警犬、鏽劍騎士、攝夢人、鐵好人、魔術師、蠱惑師
- **第三方陣營（13）**：白蛇預言家、咒狐、邱比特、鬼魂新娘、混血兒、許仙尋香魅影、野孩子、盜賊、盜寶大師、開膛手傑克、潘朵拉、殭屍、覺醒孤獨少女
- **特殊／變形機制角色（4）**：狂熱粉、復仇者、睡美人、影子

---

## 3. 核心資料結構設計（`src/logic/types.ts`）

為涵蓋所有板子的「配置、睜眼順序、法官夜間主持台詞、常見 Q & A、規則微調開關與動態狀態」，資料模型設計如下：

### 3.1 角色與板子靜態定義
```ts
export type Faction = 'wolf' | 'good' | 'third_party';
export type RoleCategory = 'wolf' | 'god' | 'villager' | 'third_party';
export type PlayerCountFilter = '6' | '7' | '8' | '9' | '10' | '12' | 'multi';

export interface RoleDefinition {
  id: string;                 // 例：'wolf', 'wolf_king', 'mech_wolf', 'psychic'
  name: string;               // 正式顯示名稱，例：'機械狼'
  aliases: string[];          // 常見別名（供搜尋命中），例：['覺醒隱狼']
  faction: Faction;
  category: RoleCategory;
  description: string;        // 職業介紹摘要
  warnings?: string[];        // 來源文件中的 [!warning] 或 ==重點== 規則提醒
}

/** 夜間單一行動步驟（對應「夜間睜眼順序」與「法官夜間主持」表格列） */
export type NightActionType =
  | 'wolf_kill'               // 狼人選擇刀口（含空刀／自刀）
  | 'witch_action'            // 女巫解藥／毒藥
  | 'seer_check'              // 預言家查驗陣營
  | 'psychic_check'           // 通靈師查驗真實身分
  | 'guard_protect'           // 守衛選擇守護目標
  | 'hunter_gesture'          // 獵人確認開槍手勢
  | 'mech_wolf_learn'         // 機械狼首夜選擇學習對象
  | 'mech_wolf_reveal_skill'  // 機械狼首夜尾聲確認學到的技能
  | 'mech_wolf_night_action'  // 機械狼第二晚起入隊手勢與技能使用
  | 'confirm_only';           // 僅確認身分（如首夜白痴確認）

export interface NightStepScript {
  stepId: string;
  actorLabel: string;         // 顯示名稱，例：'狼人(狼王)'、'機械狼'
  actorRoleIds: string[];     // 對應角色 ID（用於自動帶出座位與狀態）
  actionType: NightActionType;
  /** 法官夜間主持三段式台詞（直接對應 docs/boards-raw.md 表格三欄） */
  openPrompt: string;         // 例：'女巫請睜眼'
  actionPrompt: string;       // 例：'昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？'
  closePrompt: string;        // 例：'女巫請閉眼'
  /** 法官即時提示（例如同守同救奶穿提醒、不能連守提醒） */
  judgeTips?: string[];
}

/** 常見 Q & A 條目 */
export interface BoardQA {
  id: string;
  question: string;
  answer: string;
  relatedRoleIds?: string[];  // 綁定角色後，於該角色夜間步驟可自動置頂顯示
}

/** 板子內的角色配置項目 */
export interface RoleSlot {
  roleId: string;
  count: number;
}

/** 板子完整定義 */
export interface BoardDefinition {
  id: string;                         // 例：'12p-classic', '12p-wolf-king-guard', '10p-mech-wolf-psychic'
  name: string;                       // 例：'12 人局 - 經典'
  playerCount: number;                // 預設人數（如 12、10）
  playerCountRange?: [number, number];// 彈性人數區間（如 11~16 人局）
  playerCountFilter: PlayerCountFilter;
  keywords: string[];                 // 搜尋關鍵字（含板子別名如「鏡隱迷蹤」、角色別名）
  composition: {
    wolf: RoleSlot[];
    good: RoleSlot[];
    thirdParty?: RoleSlot[];
  };
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
```

### 3.2 規則微調開關（Rule Overrides）
```ts
export type WitchSelfSaveRule = 'first_night_only' | 'never' | 'always';

export interface RuleOverrides {
  /** 女巫能否自救：僅首夜可自救 / 全程不可自救 / 全程可自救 */
  witchSelfSave: WitchSelfSaveRule;
  /** 白痴白天被放逐翻牌免死後，是否仍需被追刀才算神職出局 */
  idiotNeedsExtraKill: boolean;
  /** 機械狼第一晚是否強制學習一名玩家 */
  mechWolfForceLearnNight1: boolean;
  /** 狼刀在先（預設 true） */
  wolfKillPriority: boolean;
  /** 勝利條件：屠邊（預設）或屠城 */
  victoryMode: 'slaughter_side' | 'slaughter_all';
}
```

### 3.3 對局運行時狀態（Zustand Persist Store）
```ts
export type GamePhase =
  | 'board_select'      // 選板子與規則微調
  | 'seat_setup'        // 編輯座位暱稱與分配身分
  | 'night'             // 夜間逐步驟主持
  | 'day_announcement'  // 天亮公佈昨夜死亡與觸發技能（開槍）
  | 'day_vote'          // 白天發言、自爆與放逐投票
  | 'game_over';        // 遊戲結束與復盤紀錄

export type DeathReason =
  | 'wolf_kill'         // 狼刀
  | 'witch_poison'      // 女巫毒殺
  | 'milk_pierce'       // 同守同救奶穿
  | 'exiled'            // 白天放逐
  | 'hunter_shoot'      // 獵人開槍
  | 'wolf_king_shoot'   // 狼王開槍
  | 'self_explode'      // 狼人自爆
  | 'mech_wolf_poison'  // 機械狼（學女巫）毒殺
  | 'mech_wolf_kill';   // 機械狼額外刀口

export interface PlayerSeat {
  seatNumber: number;           // 1..N
  nickname: string;             // 可留空，UI 預設顯示「{seatNumber} 號」
  roleId: string | null;
  isAlive: boolean;
  deathReason?: DeathReason;
  deathRound?: number;
  /** 特殊狀態 */
  idiotRevealed?: boolean;      // 白痴已翻牌免死（失去投票權）
}

export interface MechWolfRuntimeState {
  learnedFromSeat: number | null;   // 學習對象座位號
  learnedRoleId: string | null;     // 學習到的角色 ID
  hasJoinedWolfTeam: boolean;       // 所有小狼死完後轉為 true
  usedLearnedOneShotSkill: boolean; // 學女巫毒藥等一次性技能是否已用
  lastGuardedSeat: number | null;   // 若學守衛，記錄前一晚守護對象
}

export interface NightActionDraft {
  round: number;
  guardTarget: number | null;          // 守衛守護對象（null 表示空守）
  wolfTarget: number | null;           // 狼人刀口（null 表示空刀）
  witchUseAntidote: boolean;           // 女巫是否使用解藥
  witchPoisonTarget: number | null;    // 女巫毒殺對象
  seerCheckTarget: number | null;      // 預言家查驗對象
  psychicCheckTarget: number | null;   // 通靈師查驗對象
  mechWolfLearnTarget: number | null;  // 機械狼首夜學習對象
  mechWolfSkillTarget: number | null;  // 機械狼使用學習技能目標（毒／守／查／雙刀）
}

export interface GameState {
  phase: GamePhase;
  round: number;                        // 第幾晚／第幾天（從 1 起算）
  selectedBoardId: string | null;
  ruleOverrides: RuleOverrides;
  seats: PlayerSeat[];
  /** 持久化保存各座位暱稱，供重開新局時「保留上一局暱稱」使用 */
  savedNicknames: Record<number, string>;

  /** 夜間主持進度與消耗品追蹤 */
  currentStepIndex: number;
  currentNightDraft: NightActionDraft;
  witchAntidoteUsed: boolean;
  witchPoisonUsed: boolean;
  lastGuardedSeat: number | null;
  mechWolfState: MechWolfRuntimeState;
  /** 若白天有狼人自爆，記錄其座位（當晚點刀後正式死亡） */
  pendingSelfExplodeSeat: number | null;

  /** 歷史紀錄與勝負 */
  nightHistory: Array<{ round: number; draft: NightActionDraft; deaths: Array<{ seat: number; reason: DeathReason }> }>;
  dayHistory: Array<{ round: number; events: string[] }>;
  winner: Faction | null;
  winReason: string | null;
}
```

---

## 4. 實用功能與 UI / UX 設計規格

所有畫面嚴格遵守 **Mobile-First 暗黑模式**（低亮度深灰／深藍黑底色如 `bg-slate-950` / `bg-slate-900`、高對比文字與柔和強調色），主要觸控元件最小高度 `>= 48px`（`min-h-12`），保留足夠安全間距。

### 4.1 開局選板子畫面（Board Selector）
1. **人數篩選標籤列**：
   - 提供 `全部`、`6人`、`7人`、`8人`、`9人`、`10人`、`12人`、`多人` 標籤按鈕，支援單指點擊快速切換。
2. **關鍵字搜尋框**：
   - 支援即時過濾板子名稱、別名（如「鏡隱迷蹤」）、角色名稱與角色別名（如搜尋「黑狼王」命中 `12 人局 - 狼王守衛`）。
3. **板子資訊卡片 & 規則微調區**：
   - 選定板子後顯示完整陣營配置、第一晚／第二晚之後睜眼順序摘要。
   - 依 `board.supportedRuleToggles` 動態顯示該板子支援的**規則微調開關**（例如：女巫首夜能否自救、白痴被投出後是否需追刀、機械狼首夜是否強制學習）。

### 4.2 座位暱稱與身分分配（Seat & Role Setup）
1. **座位暱稱編輯**：
   - 顯示 `1 ~ N` 號座位清單，每個座位皆可直接點擊輸入或修改「玩家暱稱」（例如「阿明」、「小美」），空白時自動顯示「N 號玩家」。
   - 暱稱即時同步寫入 `savedNicknames` 並持久化至 `localStorage`。
2. **快速身分指派**：
   - 顯示待分配角色計數器（如「小狼 2/4」、「預言家 0/1」），法官點選角色後再點選對應座位即可快速指派，全部配齊後才允許進入第一晚（防止漏配）。
3. **重開新局（防誤觸與暱稱選項）**：
   - 點擊「重開新局」按鈕時彈出二次確認 Modal，明確提供兩個獨立大按鈕：
     - **保留上一局暱稱並重開**：保留 `savedNicknames` 與板子／座位暱稱，重置角色、存活狀態與回合紀錄。
     - **全部清空並重開**：清除所有暱稱與對局狀態，回到乾淨開局狀態。

### 4.3 夜間主持控制台（Night Console）
1. **步驟進度條**：頂部顯示「第 N 晚」與當前睜眼進度（如 `步驟 2 / 5：女巫`），支援「上一步」修正誤點。
2. **法官台詞卡（Script Card）**：
   - 清楚分區呈現三段台詞：
     - 👁️ **睜眼**：`openPrompt`
     - 🗣️ **引導台詞**：`actionPrompt`（放大字體、高對比呈現；如為女巫步驟，系統同時在旁提示「今晚狼刀目標為 X 號」與解藥／毒藥剩餘狀態）
     - 🙈 **閉眼**：`closePrompt`
3. **即時規則提醒 & 常見 Q & A 面板**：
   - 當前步驟若有對應 `judgeTips` 或相關 `BoardQA`（例如守衛連守禁止、女巫解毒不可同晚、機械狼學習後查驗變化），於操作區上方顯示精簡醒目提醒條。
   - 右上角常駐「Q & A 規則速查」大按鈕，隨時可拉開 Bottom Sheet 查閱本板子所有 Q&A 與角色規則，不中斷夜間操作進度。
4. **座位操作盤（大按鈕防誤觸）**：
   - 採 2~3 欄大格按鈕呈現所有座位（含座號、暱稱、身分徽章、存活／特殊狀態標記）。
   - 不合法目標自動鎖定並標註原因（例如守衛不可連守昨晚目標、女巫首夜不可自救若開關關閉、機械狼不可學自己）。
   - 最後一步點擊「結束今夜 ➜ 天亮結算」時須顯示操作摘要並進行二次確認。

### 4.4 天亮結算與白天階段（Day Resolution & Voting）
1. **天亮公告卡**：
   - 明確顯示「昨晚平安夜」或「昨晚死亡玩家：X 號、Y 號」（法官視角可查看死因如狼刀／毒殺／奶穿，避免誤報）。
   - 若死者為獵人或狼王，系統自動依規則顯示「✅ 可開槍」或「❌ 不可開槍（原因：被毒殺／最後一狼／自爆）」，並提供「發動開槍帶走目標」或「壓槍不開」按鈕。
2. **白天放逐與自爆**：
   - 提供「放逐投票出局」與「狼人自爆」兩個明確區隔的操作區（皆需二次確認）。
   - 若白痴被放逐：自動觸發翻牌免死流程（標記 `idiotRevealed = true`、保留存活、標示「無投票權」）。
   - 若狼人自爆：強制跳轉進入下一晚，並標記該狼人「當晚完成點刀後正式死亡」（狼王自爆不可開槍）。
3. **自動勝負判定**：
   - 每次夜晚結算、開槍結算或白天放逐後自動執行勝負判定，觸發「狼刀在先」或屠邊條件時立即提示勝負結果與原因。

---

## 5. 第一階段 MVP 驗證板子規格與測試基準

第一階段選定以下 **3 個代表性板子** 作為規則引擎（`src/logic/`）與 Vitest 單元測試的開發驗證基準：

### MVP 板子 1（基礎基準）：`12 人局 - 經典`
- **陣營配置**：
  - 狼人陣營：小狼 × 4
  - 好人陣營：平民(村民) × 4、預言家 × 1、女巫 × 1、獵人 × 1、白痴(愚者) × 1
- **夜間睜眼順序**：
  - 第一晚：`狼人 ➜ 女巫 ➜ 預言家 ➜ 獵人 ➜ 白痴`
  - 第二晚之後：`狼人 ➜ 女巫 ➜ 預言家 ➜ 獵人`
- **支援規則微調開關**：`witchSelfSave`、`idiotNeedsExtraKill`、`wolfKillPriority`
- **核心驗證重點（Vitest 必測案例）**：
  1. 基本夜結算：狼刀致死、女巫解藥救回成平安夜、女巫解藥與毒藥不可同晚使用、女巫自救受 `witchSelfSave` 開關控制。
  2. 獵人開槍判定：被狼刀或放逐可開槍；被女巫毒殺不可開槍。
  3. 白痴免死與追刀規則：
     - 白痴白天被投出後翻牌免死（`isAlive = true`, `idiotRevealed = true`），失去投票權。
     - 當 `idiotNeedsExtraKill = false`（預設）：其餘神職皆出局且白痴已翻牌免死時，是否直接判屠神勝利。
     - 當 `idiotNeedsExtraKill = true`：白痴翻牌免死後仍算存活神職，必須被狼刀／毒殺追刀才算神職全滅。
  4. 狼人白天自爆強制入夜，且自爆狼於當晚點刀後才正式死亡。

### MVP 板子 2（進階互動）：`12 人局 - 狼王守衛`
- **陣營配置**：
  - 狼人陣營：小狼 × 3、狼王(黑狼王) × 1
  - 好人陣營：平民(村民) × 4、預言家 × 1、女巫 × 1、獵人 × 1、守衛 × 1
- **夜間睜眼順序**：
  - 每晚：`守衛 ➜ 狼人(狼王) ➜ 女巫 ➜ 預言家 ➜ 獵人`
- **支援規則微調開關**：`witchSelfSave`、`wolfKillPriority`
- **核心驗證重點（Vitest 必測案例）**：
  1. **同守同救奶穿**：守衛守護 A 且狼人刀 A 且女巫救 A ➜ A 死亡（`deathReason = 'milk_pierce'`）。
  2. **守衛連守限制**：第 N 晚守護 A 後，第 N+1 晚不可再守護 A（允許空守或改守他人，且守衛可守自己）。
  3. **守衛防禦範圍**：守衛之盾可擋狼刀，但**不可擋女巫毒藥**。
  4. **狼王開槍狀態機**：
     - 可開槍：自刀死亡、被獵人開槍帶走、被奶穿、白天被放逐出局（前提：非場上最後一隻存活狼人）。
     - 不可開槍：被女巫毒殺、白天自爆、或作為最後一隻狼出局。
  5. **獵人開槍狀態機**：被狼刀、被奶穿、被狼王開槍、被放逐皆可開槍；被女巫毒殺不可開槍。
  6. **狼刀在先原則**：若當晚狼刀已達成屠民或屠神，即使女巫同晚毒殺最後一隻狼（或獵人開槍帶走最後一隻狼），仍判定狼人陣營勝利。

### MVP 板子 3（動態變形）：`10 人局 - 機械狼通靈師 / 鏡隱迷蹤`
- **陣營配置**：
  - 狼人陣營：小狼 × 2、機械狼(覺醒隱狼) × 1
  - 好人陣營：平民(村民) × 4、通靈師(魔鏡少女) × 1、女巫 × 1、守衛 × 1
- **夜間睜眼順序**：
  - 第一晚：`機械狼 ➜ 守衛 ➜ 狼人 ➜ 女巫 ➜ 通靈師 ➜ 機械狼`
  - 第二晚之後：`守衛 ➜ 機械狼 ➜ 狼人 ➜ 女巫 ➜ 通靈師`
- **支援規則微調開關**：`witchSelfSave`、`mechWolfForceLearnNight1`、`wolfKillPriority`
- **核心驗證重點（Vitest 必測案例）**：
  1. **首夜學習機制**：機械狼首夜選擇自己以外一名玩家學習其技能（`mechWolfForceLearnNight1 = true` 時不可跳過），首夜最後一步得知所學身分，第二晚起生效。
  2. **通靈師查驗身分變化**：
     - 機械狼尚未學習前：查驗結果為「機械狼」。
     - 機械狼學習後：查驗結果動態變為「所學習對象的真實身分」（例：學平民 ➜ 顯示「平民」；學守衛 ➜ 顯示「守衛」）。
  3. **機械狼特化技能結算**：
     - 學到女巫：僅獲得 1 瓶毒藥（無解藥），使用後標記消耗。
     - 學到守衛：機械盾**可以擋住女巫的毒藥**（與真守衛區分）；同時受不能連守限制。
     - 學到小狼：獲得額外一刀，但須等場上所有小狼皆淘汰、機械狼入隊後才能開啟（形成雙刀）。
     - 學到通靈師：每晚可查驗一名玩家真實身分。
  4. **入隊與自爆限制**：
     - 機械狼全程不可自爆，初期不入狼隊。
     - 當所有小狼皆出局且機械狼仍存活時，自動切換 `hasJoinedWolfTeam = true`，次晚主持提示「入隊手勢」並解鎖狼刀（與學小狼之雙刀）。
  5. **勝負計算**：機械狼屬於狼人陣營，好人需淘汰所有小狼**與**機械狼方能獲勝。

---

## 6. 開發階段規劃（Roadmap）

1. **Phase 1（MVP 核心實作與測試）**：
   - 建立 `src/logic/types.ts`、角色字典與 3 個 MVP 板子完整資料（含夜間台詞與 Q&A）。
   - 實作純函式規則引擎（夜間結算、開槍判定、白痴免死、機械狼學習／查驗／入隊、狼刀在先勝負判定）並完成完整 Vitest 測試套件（`npm run test` 全綠）。
   - 建立 Zustand + `persist` Store（含暱稱保留／清空重開機制）。
   - 實作 Mobile-First 暗黑 UI：開局選板子（人數篩選＋關鍵字搜尋＋規則開關）、座位暱稱與身分分配、夜間主持控制台（台詞卡＋Q&A 抽屜）、天亮結算與白天投票。
2. **Phase 2（全量 142 板子匯入與進階角色擴充）**：
   - 撰寫離線解析腳本，將 `docs/boards-raw.md` 全數 142 個板子的配置、台詞與 77 份 Q&A 自動轉換為結構化資料。
   - 依角色出現頻率分批擴充高頻進階技能（如攝夢人、騎士、熊、狼美人、白狼王、夢魘、混血兒等），同時支援「純主持台詞模式」讓尚未實作自動結算的特殊板子也能立即使用。
