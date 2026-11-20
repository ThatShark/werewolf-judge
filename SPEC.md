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
  | 'wolf_beauty_charm'       // 狼美人選擇魅惑對象（不可連魅、不可自魅）
  | 'dream_catcher_dream'     // 攝夢人強制選擇夢遊者（不可夢自己）
  | 'confirm_only';           // 僅確認身分（如首夜白痴／熊確認）

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
  | 'wolf_kill'                  // 狼刀
  | 'witch_poison'               // 女巫毒殺
  | 'milk_pierce'                // 同守同救奶穿
  | 'exiled'                     // 白天放逐
  | 'hunter_shoot'               // 獵人開槍
  | 'wolf_king_shoot'            // 狼王開槍
  | 'self_explode'               // 狼人自爆
  | 'white_wolf_king_explode'    // 白狼王自爆帶走
  | 'wolf_beauty_charm'          // 狼美人殉情帶走
  | 'knight_duel'                // 騎士決鬥撞狼淘汰
  | 'knight_duel_fail'           // 騎士決鬥撞好人以死謝罪
  | 'dream_catcher_consecutive'  // 攝夢人連續兩晚夢死
  | 'dream_catcher_link'         // 攝夢人夜死牽連夢遊者共死
  | 'mech_wolf_poison'           // 機械狼（學女巫）毒殺
  | 'mech_wolf_kill'             // 機械狼額外刀口
  | 'manual_judge';              // 法官手動標記出局

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
  wolfBeautyCharmTarget: number | null;// 狼美人魅惑對象（不可連魅、不可自魅）
  dreamCatcherTarget: number | null;   // 攝夢人夢遊者對象（強制選自己以外存活者）
}

/** 熊天亮自動咆哮判定結果 */
export interface BearRoarResult {
  bearSeat: number | null;
  bearAlive: boolean;
  leftNeighborSeat: number | null;     // 順時針最近存活鄰居
  rightNeighborSeat: number | null;    // 逆時針最近存活鄰居
  roared: boolean;
  reason: string;
}

/** 發言順序與單人計時模型（src/logic/speakingOrder.ts） */
export type SpeakingDirection = 'clockwise' | 'counterclockwise'; // clockwise=座號遞增(左), counterclockwise=座號遞減(右)
export type SpeakingOrderMode =
  | 'random'        // 隨機起點 + 隨機方向（警上發言／無警長平安夜）
  | 'sheriff_left'  // 警左（警長最後歸票）
  | 'sheriff_right' // 警右（警長最後歸票）
  | 'dead_left'     // 死左（可指定基準死者；若有警長則警長壓軸）
  | 'dead_right';   // 死右（可指定基準死者；若有警長則警長壓軸）

export interface SpeakingOrderResult {
  mode: SpeakingOrderMode;
  direction: SpeakingDirection;
  startSeat: number | null;
  anchorSeat: number | null;           // 警長座位或基準死者座位
  sheriffLastSeat: number | null;      // 排在最後的歸票位警長
  queue: number[];
}

/** 警長競選與警徽狀態模型（src/logic/sheriff.ts） */
export type SheriffStatus =
  | 'not_started'
  | 'sign_up'
  | 'speaking'
  | 'voting'
  | 'pk_speaking'
  | 'pk_voting'
  | 'elected'
  | 'swallowed'
  | 'no_sheriff';

export type BadgeStatus = 'none' | 'active' | 'destroyed' | 'swallowed';

export interface VoteRoundRecord {
  roundIndex: number;                          // 1=首輪投票, 2+=PK 輪
  votes: Record<number, number | null>;        // voterSeat -> targetSeat | null(棄票)
  totals: Record<number, number>;              // targetSeat -> 總票數
  votersByTarget: Record<number, number[]>;    // targetSeat -> 投給他的座位列表
  abstainers: number[];                        // 棄票座位列表
  extraVotes?: Record<number, number>;         // 預留額外票數接口（如烏鴉 +1 票）
  tiedSeats: number[];                         // 若平票，列出最高票候選人
  electedSeat: number | null;                  // 若唯一最高票，列出結果座位
}

export interface SheriffState {
  status: SheriffStatus;
  sheriffSeat: number | null;
  badgeStatus: BadgeStatus;
  candidates: number[];                        // 仍在競選中的上警候選人
  withdrawnSeats: number[];                    // 已退水座位（無警下投票權）
  pkCandidates: number[];                      // 平票 PK 名單
  voteRounds: VoteRoundRecord[];               // 警下與 PK 投票明細
  pendingBadgeTransferFrom: number | null;     // 警長出局等待移交／撕毀警徽
}

/** 結構化白天事件（供復盤時間軸與 UI 渲染） */
export type DayStructuredEventType =
  | 'sheriff_signup'
  | 'sheriff_withdraw'
  | 'sheriff_vote'
  | 'sheriff_elected'
  | 'sheriff_swallowed'
  | 'sheriff_no_winner'
  | 'badge_transfer'
  | 'badge_destroy'
  | 'exile_vote'
  | 'exile_pk'
  | 'exile_result'
  | 'idiot_reveal'
  | 'hunter_shoot'
  | 'wolf_king_shoot'
  | 'self_explode'
  | 'white_wolf_king_explode'
  | 'knight_duel'
  | 'wolf_beauty_charm_death'
  | 'manual_judge'
  | 'declare_winner';

export interface DayStructuredEvent {
  type: DayStructuredEventType;
  summary: string;
  actorSeat?: number | null;
  targetSeat?: number | null;
  voteRecord?: VoteRoundRecord;
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

  /** 高頻進階角色運行時狀態 */
  lastCharmedSeat: number | null;       // 狼美人上一晚魅惑對象（防連魅）
  activeCharmedSeat: number | null;     // 狼美人目前生效之魅惑對象（出局時殉情）
  lastDreamTarget: number | null;       // 攝夢人上一晚夢遊者（連兩晚夢死判定）
  knightDuelUsed: boolean;              // 騎士是否已使用過翻牌決鬥
  lastBearRoar: BearRoarResult | null;  // 最近一次天亮熊咆哮判定結果

  /** 自動發言順序與單人倒數計時引擎 */
  speakingQueue: number[];
  currentSpeakerIndex: number;
  speakingMeta: SpeakingOrderResult | null;
  defaultSpeakDurationSec: number;      // 預設 60 / 90 / 120 秒可調（預設 90）
  remainingSeconds: number;

  /** 警長競選、警徽與白天放逐投票狀態 */
  sheriffState: SheriffState;
  exilePkCandidates: number[];          // 當日白天放逐平票 PK 名單

  /** 歷史紀錄與勝負 */
  nightHistory: Array<{
    round: number;
    draft: NightActionDraft;
    deaths: Array<{ seat: number; reason: DeathReason }>;
    bearRoar?: BearRoarResult | null;
  }>;
  dayHistory: Array<{
    round: number;
    events: string[];
    structuredEvents?: DayStructuredEvent[];
  }>;
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

### 4.4 天亮結算與白天完整流程（Day Resolution, Speaking Order & Voting）
1. **天亮公告卡與熊咆哮提示**：
   - 明確顯示「昨晚平安夜」或「昨晚死亡玩家：X 號、Y 號」（法官視角可查看死因如狼刀／毒殺／奶穿／攝夢連夢／攝夢牽連／狼美人殉情，避免誤報）。
   - 若場上有「熊」，系統自動依天亮存活座位計算左右最近存活鄰居是否含狼，直接呈現「🐻 熊咆哮了」或「🐻 熊沒有咆哮」及判定依據。
   - 若死者為獵人或狼王，系統自動依規則顯示「✅ 可開槍」或「❌ 不可開槍（原因：被毒殺／被攝夢夢死或牽連／狼美人殉情／最後一狼／自爆）」，並提供「發動開槍帶走目標」或「壓槍不開」按鈕。
2. **警長競選與警徽交接（Sheriff Election & Badge）**：
   - 支援完整警上流程：記錄**上警名單**、**退水名單**（退水者失去警下投票權；若僅餘 1 名候選人可直接當選）、**警下投票明細（誰投誰／棄票）**、**平票 PK**、**當選警長**。
   - **警上自爆吞警徽**：警長競選進行期間若發生普通狼人或白狼王自爆，自動判定「吞警徽（本局無警長）」並強制入夜，完整寫入復盤時間軸。
   - **警徽交牌與撕毀**：警長因任何原因出局時，自動進入待處理警徽狀態，法官可記錄「移交警徽給指定存活座位」或「撕毀警徽」。
3. **自動抽取發言順序與單人倒數計時引擎**：
   - **隨機抽取模式**：適用於警上候選人發言（僅抽上警名單）或無警長之平安夜（全體存活玩家），隨機抽出起始存活座位與方向（順時針＝座號遞增／逆時針＝座號遞減），自動跳過已出局玩家。
   - **警長指定模式**：支援「警左／警右」與「死左／死右（昨夜多死時可指定基準死者座位）」，自動跳過已出局玩家並將警長排於最後一位（歸票位）。
   - **單人倒數計時器**：預設 60 / 90 / 120 秒可調（預設 90 秒），提供「生成發言順序」、「下一位發言」以及即時加減秒數（如 `+10s` / `-10s`），全部持久化至 Zustand Store。
4. **放逐投票明細與計票**：
   - 記錄每位具投票權之存活玩家（自動排除已翻牌無投票權之白痴）的投票對象或棄票。
   - 自動計票（警長預設 `1.5` 票權重，並預留烏鴉額外 `+1` 票 `extraVotes` 接口），自動判定最高票放逐、平票 PK 或平安日（無人出局／二次 PK 平票）。
5. **白天突發技能與結構化復盤**：
   - 結構化記錄並自動結算：「普通狼人自爆」、「白狼王自爆帶走目標（被帶走者無法發動技能，強制入夜）」、「騎士翻牌決鬥目標（撞狼直接淘汰目標且不觸發死亡技能並立即入夜；撞好人騎士自刎並繼續白天）」、「白痴翻牌免死」。
   - 所有事件同步寫入 `dayHistory.events`（人類可讀摘要）與 `dayHistory.structuredEvents`（結構化票型與行動紀錄）。
6. **自動勝負判定**：
   - 每次夜晚結算、開槍結算、騎士決鬥、白狼王自爆帶人、狼美人殉情或白天放逐後自動執行勝負判定，觸發「狼刀在先」或屠邊條件時立即提示勝負結果與原因。

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

### 核心引擎與白天完整流程升級（Phase 1.5 驗證基準）

在既有 10 個核心角色與 3 個 MVP 板子之上，擴充白天完整流程引擎與 5 個高頻進階角色之「誰對誰做了什麼」自動結算規則：

1. **自動抽取發言順序與計時引擎（`src/logic/speakingOrder.ts`）**：
   - 環狀方向：`clockwise`（順時針／座號遞增／警左與死左）、`counterclockwise`（逆時針／座號遞減／警右與死右），一律自動跳過 `isAlive === false` 的出局座位。
   - **隨機抽取模式**：可限定 `candidateSeats`（警上發言）或全體存活玩家（無警長平安夜），隨機抽取起始座位與方向（支援注入 `rng` 供決定性測試）。
   - **警長指定模式**：支援 `sheriff_left`、`sheriff_right`、`dead_left`、`dead_right`（多死時可指定 `referenceDeadSeat`），若有存活警長一律將警長排於佇列最後一位（歸票位）。
   - Store 狀態支援 `speakingQueue`、`currentSpeakerIndex`、`defaultSpeakDurationSec`（60/90/120 秒可調）、`remainingSeconds`，以及生成順序、下一位、`+10s`/`-10s` 調時。
2. **警長競選、吞警徽與警徽交接（`src/logic/sheriff.ts`）**：
   - 記錄上警、退水（退水後無警下投票權）、警下投票明細（誰投誰／棄票）、平票 PK、當選警長。
   - 警上競選期間發生任何狼人自爆（含白狼王自爆）➜ 自動判定「吞警徽（本局無警長）」並強制入夜。
   - 警長出局時觸發待移交狀態，支援移交給指定存活玩家或撕毀警徽。
3. **放逐投票明細與計票（`src/logic/voting.ts`）**：
   - 自動排除已翻牌無投票權之白痴。
   - 警長持有警徽且存活時具 `1.5` 票權重（可參數化覆寫）；預留烏鴉額外 `+1` 票（`extraVotes`）接口。
   - 自動計票並產出最高票放逐、平票 PK 或平安日結果，同步寫入結構化復盤時間軸。
4. **五個高頻進階角色自動結算規則**：
   - **白狼王（`white_wolf_king`）**：白天可隨時亮牌自爆並立即帶走一名存活玩家（被帶走者無法發動技能，例如獵人不可開槍），立即檢查勝負；若未結束則強制入夜，白狼王本身於當晚點刀後死亡。若於警上自爆，亦觸發吞警徽。
   - **狼美人（`wolf_beauty`）**：不可自爆、不可自刀；每晚於狼刀後魅惑一名自己以外的存活玩家，不可連續兩晚魅惑同一人。除「與騎士決鬥出局（`knight_duel`）」外，狼美人以任何方式出局（夜死、放逐、開槍，包含作為最後一狼出局），前一晚魅惑之存活對象皆跟著殉情（`wolf_beauty_charm`）且無法發動技能；若因殉情達成屠邊，狼人獲勝。
   - **騎士（`knight`）**：整局限一次，白天翻牌決鬥一名存活玩家：撞狼則該狼即時出局（`knight_duel`）且不能發動死亡技能（狼王不開槍、狼美人不殉情），未結束則直接進入夜晚；撞好人（或非狼）則騎士以死謝罪（`knight_duel_fail`），繼續白天流程。
   - **攝夢人（`dream_catcher`）**：每晚強制選擇自己以外一名存活玩家成為夢遊者（當晚免疫狼刀與女巫毒藥，且不觸發奶穿）。若連續兩晚夢同一人，該夢遊者於天亮夢死（`dream_catcher_consecutive`）且無技能；若攝夢人本晚夜死，當晚夢遊者牽連共死（`dream_catcher_link`）且無技能。
   - **熊（`bear`）**：每次天亮於所有夜間死亡結算完畢後自動判定：熊死亡則不咆哮；熊存活則尋找其順時針（左）與逆時針（右）最近之兩位存活玩家，若任一人為狼人陣營（機械狼若已學習好人身分則視同好人不咆哮），則熊咆哮，否則不咆哮。

---

## 6. 開發階段規劃（Roadmap）

1. **Phase 1（MVP 核心實作與測試）**：
   - 建立 `src/logic/types.ts`、角色字典與 3 個 MVP 板子完整資料（含夜間台詞與 Q&A）。
   - 實作純函式規則引擎（夜間結算、開槍判定、白痴免死、機械狼學習／查驗／入隊、狼刀在先勝負判定）並完成完整 Vitest 測試套件（`npm run test` 全綠）。
   - 建立 Zustand + `persist` Store（含暱稱保留／清空重開機制）。
   - 實作 Mobile-First 暗黑 UI：開局選板子（人數篩選＋關鍵字搜尋＋規則開關）、座位暱稱與身分分配、夜間主持控制台（台詞卡＋Q&A 抽屜）、天亮結算與白天投票。
2. **Phase 1.5（核心引擎與白天完整流程升級）**：
   - 實作環狀發言順序自動抽取與單人倒數計時引擎（`src/logic/speakingOrder.ts` & `gameStore.ts`）。
   - 實作白天完整行為與投票紀錄系統（警長競選、吞警徽、警徽移交／撕毀、放逐投票明細與烏鴉 `+1` 票接口、白天突發技能與結構化復盤時間軸）。
   - 擴充 5 個高頻進階角色自動結算規則（白狼王、狼美人、騎士、攝夢人、熊），並補齊對應 Vitest 單元測試門禁。
3. **Phase 2（全量 142 板子匯入與進階角色持續擴充）**：
   - 維護離線解析腳本，將 `docs/boards-raw.md` 全數 142 個板子的配置、台詞與 77 份 Q&A 自動轉換為結構化資料，並將已支援自動結算的角色步驟對應至專屬 `NightActionType`。
   - 持續依角色出現頻率擴充其餘進階角色，同時保留「純主持台詞模式」與法官手動調整能力。
