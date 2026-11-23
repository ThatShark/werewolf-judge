# 狼人殺法官輔助網頁 — 完整產品規格書（V2.0 無損合併定案版）

> 本文件為「狼人殺法官輔助網頁（Werewolf Judge）」的完整設計與實作基準，**無損整合**既有 V1 資產（[`docs/boards-raw.md`](docs/boards-raw.md) 143 板子／130 角色盤點、`src/logic/types.ts` 型別架構、MVP 與進階角色邊界測試基準）與 **V2.0 定案版產品規格**（`100dvh` 零滾輪單屏、PWA 全螢幕、3D 主持矩陣 8 種模式、線上法官 TTS、白噪音、雙爆吞警徽、雙模式投票與筆記本、以及雲端多點連線）。

---

## 1. 專案目標、核心設計原則與技術架構

### 1.1 核心體驗與設計原則
1. **核心體驗**：簡單易上手、資訊一目了然、支援手機／平板／電腦自適應排版；採 **Mobile-First 全站暗黑模式**（深灰／深藍黑底色如 `bg-slate-950` / `bg-slate-900`、高對比文字與柔和強調色），主要按鈕與可點擊區塊最小高度 `>= 48px`（`min-h-12`），關鍵不可逆操作具備二次確認防誤觸。
2. **零滾輪單屏設計（Zero-Scroll `100dvh`）**：
   - 主畫面高度鎖死在 `100dvh`（絕不產生垂直滾輪）。
   - 主畫面只保留三區塊：
     - **頂部狀態列**（第幾天／當前階段）
     - **座位區**（狀態用小圖示呈現，如警徽、死亡、毒／救標記）
     - **主要操作按鈕**
   - 「筆記本」、「板子規則（含常見 Q & A）」、「歷史操作紀錄」全部做成從底部或側邊滑出的抽屜面板（Drawer），隨叫隨看、下滑即收。
3. **PWA 全螢幕體驗（`manifest.json`）**：
   - 設定完整 `manifest.json` 與圖示，支援玩家將網站「加入主畫面」，開啟時隱藏瀏覽器上下網址列，獲得原生全螢幕 App 體驗，杜絕網址列伸縮造成的畫面跳動與滾輪。
4. **斷線重連與持久化（`localStorage`）**：
   - 防止手機切換畫面、鎖屏或誤觸重整導致資料遺失。前端透過 Zustand `persist` middleware 與 `localStorage` 強制儲存對局狀態、座位暱稱、房間代碼、玩家 Token 與個人筆記本內容，重新整理後秒回原座位且筆記不遺失。

### 1.2 技術棧、目錄職責與分期策略
- **前端框架**：React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **狀態管理**：Zustand 5 + `persist` middleware（強制同步寫入 `localStorage`）
- **測試框架**：Vitest 3（`npm run test`）
- **目錄職責與防護紅線**：
  - `src/logic/`：純 TypeScript 規則引擎、資料模型與勝負／結算判定。**嚴禁引入任何 React 或 UI 元件**；任何規則異動皆須同步更新對應 `*.test.ts` 並確保 `npm run test` 全數通過。
  - `src/data/`：143 個板子定義、130 個角色字典、夜間台詞與 80 份 Q&A 結構化資料（純 TypeScript / JSON）。
  - `src/store/`：Zustand Store 與 `persist` 持久化層，呼叫 `src/logic/` 執行純函式運算。
  - `src/components/`：React UI 畫面元件（Mobile-First 暗黑模式、最小觸控高度 `>= 48px`、關鍵不可逆操作二次確認）。
- **分期策略**：
  - 沿用並擴充現有 `src/logic/`（純 TypeScript 規則引擎與 32+ 單元測試）與 `src/data/`（143 板子與 130 角色資料）。
  - **里程碑 A（純前端單機完整版）**：實作新版主頁、PWA、`100dvh` 零滾輪工作台、4 種中央操作模式（實體/線上法官 × 實體/線上發牌）、完整日夜流程、語音播報、白噪音、雙模式投票與雙模式筆記本。
  - **里程碑 B（雲端連線多點版）**：接入雲端即時同步（如 Supabase Realtime），實作房間代碼／QR Code 加入大廳、斷線重連 Token、多點操作 4 種模式與狼隊即時預選游標。

---

## 2. 來源文件盤點（`docs/boards-raw.md` 掃描統計）

經分段掃描 [`docs/boards-raw.md`](docs/boards-raw.md)（共 19,875 行），完整盤點結果如下（已轉化為 `src/data/boards.ts` 與 `src/data/roles.ts` 並由 `boardsData.test.ts` 與 `boardsValidation.test.ts` 驗證）：

- **總板子數量**：**143 個**（其中 **80 個**板子內含 `## 常見 Q & A` 區塊）
- **不重複角色總數**：**130 個**（以 `## 職業介紹` 下的 `###` 角色標題去重統計）

### 2.1 板子人數分類分佈
| 篩選標籤 | 來源分類 | 板子數量 |
| :--- | :--- | :---: |
| `6人` | 6 人局 | 4 |
| `7人` | 7 人局 | 1 |
| `8人` | 8 人局 | 2 |
| `9人` | 9 人局 | 6 |
| `10人` | 10 人局 | 33 |
| `12人` | 12 人局 | 94 |
| `多人` | 11 ~ 16 人局（1）、娛樂局（2） | 3 |
| **合計** | — | **143** |

### 2.2 不重複角色清單（共 130 個，依陣營分類）
- **狼人陣營（50）**：九尾、大灰狼、大野狼、小小灰、小狼、月靈狼、白狼王、石像鬼、灰太狼、百變狼王、血月使徒、邪惡商人、典獄長、刺客、夜之貴族、怪盜狼王、阿努比斯、南瓜鬼、狼王、狼兄、狼巫、狼弟、狼女孩、狼美人、狼術師、狼僕、狼鴉之爪、假面、寂夜導師、梅杜莎、雪狼、傀儡、尋香魅影、惡魔、惡靈騎士、猩紅狼王、黑夜使者、黑蝙蝠、搗蛋鬼、詭術師、夢魘、種狼、蝕日侍女、蝕時狼妃、戰狼、機械狼、隱狼、覺醒石像鬼、覺醒狼王、覺醒狼美人
- **好人陣營（63）**：九尾狐、女巫、子狐、小女孩、占卜師、平民、白夜使者、白晝學者、白痴、白澤、白貓、企鵝、名媛、守墓人、守衛、羊駝、老流氓、兔兔、奇蹟商人、定序王子、河豚、狐狸、流光伯爵、珀爾修斯、烏鴉、純白之女、酒鬼預言家、高級平民、偵探、異族王子、通靈者、通靈師、喜羊羊、超級守墓人、超級黑市商人、黑市商人、愚言家、煉金魔女、毒師、禁言長老、蜂之狂獵、預言家、槓精、熊、管家、舞者、蒙面人、燈影預言家、獵人、獵魔人、雙子、騎士、覺醒女巫、覺醒白痴、覺醒預言家、覺醒獵人、覺醒攝夢人、警犬、鏽劍騎士、攝夢人、鐵好人、魔術師、蠱惑師
- **第三方陣營（13）**：白蛇預言家、咒狐、邱比特、鬼魂新娘、混血兒、許仙尋香魅影、野孩子、盜賊、盜寶大師、開膛手傑克、潘朵拉、殭屍、覺醒孤獨少女
- **特殊／變形機制角色（4）**：狂熱粉、復仇者、睡美人、影子

---

## 3. V2.0 完整產品功能規格

### 3.1 主頁四大入口
主頁採清爽一屏到底（`100dvh` 零滾輪）設計，提供四個主要按鈕：
1. **主持**：進入開局配置與大廳（含 3 個維度共 8 種主持模式選擇）。
2. **加入**：當主持人選擇「線上發牌」或「多點操作」時，玩家可透過輸入房間代碼或掃描 QR Code 加入房間。
3. **規則**：完整且清晰地列出所有 143 個板子規則與 130 個角色技能介紹（支援人數篩選與關鍵字搜尋，命中板子別名與角色別名如「鏡隱迷蹤」「黑狼王」）。
4. **關於**：網站簡介、參考網站（如狼序 WolfCue 等）與社團資訊。

### 3.2 主持三大維度 × 八種模式（3D Matrix）
開局時可自由切換以下三個選項，組合成 8 種主持模式：
- **維度一：法官模式（`實體法官` / `線上法官`）**
  - **實體法官**：由一名遊戲外的人擔任法官，負責口頭主持、閱讀逐字稿與操作介面。
  - **線上法官**：無人主持（全員下場玩），由裝置透過語音輸出（TTS）引導玩家睜閉眼與階段流程，並由玩家操作記錄。
- **維度二：發牌模式（`實體發牌` / `線上發牌`）**
  - **實體發牌**：玩家抽實體卡牌，開局時系統不知道誰是什麼身分；等到第一晚各角色睜眼時，才由法官或玩家輸入該角色是幾號，第一晚結束後所有未輸入身分的座位自動判定為「平民」。
  - **線上發牌**：由系統隨機分配角色。
- **維度三：操作模式（`中央操作` / `多點操作`）**
  - **中央操作**：全場只用一台裝置操作（法官手持操作，或放桌面中央由玩家輪流操作）。
  - **多點操作**：每位玩家使用自己的手機，透過房間代碼或 QR Code 加入房間後，在各自裝置確認身分訊息、使用夜間／白天技能與進行投票。

#### 八種模式完整運作規格
| 模式編號 | 法官模式 | 發牌模式 | 操作模式 | 里程碑 | 運作規格 |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **（1）** | 實體法官 | 實體發牌 | 中央操作 | A（預設） | 由遊戲外法官操作，第一晚每個身分睜眼時先登錄該身分座號，透過按鈕記錄行動與查看介面提示，並由法官記錄白天投票與流程。 |
| **（2）** | 實體法官 | 線上發牌 | 中央操作 | A | 開局前將裝置在玩家間傳一輪確認身分（從 1 號開始，點擊確認身分 → 看完後按確認將身分隱藏 → 交給 2 號；提供「重新發牌」與「重新查看身分」按鈕）。夜間與白天由法官操作介面並口頭主持。 |
| **（3）** | 實體法官 | 實體發牌 | 多點操作 | B | 第一晚各角色睜眼時由玩家在各自手機認領身分座號並操作技能、接收資訊；法官保有上帝視角並負責口頭主持。 |
| **（4）** | 實體法官 | 線上發牌 | 多點操作 | B | 系統發牌至各玩家手機，夜晚由玩家在各自手機操作技能並接收查驗／刀口資訊；法官保有上帝視角並負責口頭主持。 |
| **（5）** | 線上法官 | 實體發牌 | 中央操作 | A | 裝置語音主持，第一晚各角色睜眼時玩家到中央裝置登錄座號並點選技能、查看訊息，白天亦由中央裝置語音引導與記錄投票。 |
| **（6）** | 線上法官 | 線上發牌 | 中央操作 | A | 開局前裝置傳閱一輪讓 1~N 號確認並隱藏身分（含重發與重看按鈕）；夜晚由裝置語音主持，玩家依序睜眼在中央裝置操作技能與接收資訊。 |
| **（7）** | 線上法官 | 實體發牌 | 多點操作 | B | 中央裝置負責語音提醒與公開資訊展示，第一晚各角色睜眼時由玩家在各自手機認領座號、操作技能與投票。 |
| **（8）** | 線上法官 | 線上發牌 | 多點操作 | B | 系統發牌至各玩家手機，中央裝置負責語音提醒與流程推進，所有玩家在各自手機操作技能、查看資訊與投票。 |

### 3.3 大廳與開局設定（Lobby）
1. **頂部資訊與規則設定**：
   - 上方顯示「板子名稱」、「板子陣營配置」與「規則按鈕」（點擊滑出規則／Q&A 抽屜）。
   - 法官規則微調開關：
     - 女巫能否自救（首夜／全程／不可）
     - 勝利條件（**屠邊**［神或民全滅］或 **屠城**［好人全滅］）
     - 吞警徽規則（**單爆吞警徽** 或 **雙爆吞警徽**）
     - 無警長時有死訊的發言方向（順時針／逆時針）
     - 板子專屬進階開關（如白痴被放逐翻牌後是否仍需追刀、機械狼首夜是否強制學習、狼刀在先等）。
2. **房間與連線大廳（線上發牌或多點操作時顯示）**：
   - 提供 6～15 人入座位置清單（支援編輯暱稱並寫入 `savedNicknames` 持久化）。
   - 產生「房間代碼」與「QR Code」供玩家加入，並提供「解散房間」按鈕。
3. **夜間音訊與白噪音播放器**：
   - 大廳介面內建音訊功能，提供多款系統預設白噪音，並支援使用者自行上傳音訊檔，於夜晚階段自動播放以掩蓋玩家動作聲響。

### 3.4 夜晚主持與操作（Night Phase）
1. **防誤觸操作邏輯**：法官或玩家點選目標按鈕後，**再次點選可取消選擇**，且必須點擊**額外的「確認」按鈕**才會正式記錄；不合法目標自動鎖定並標註原因（如守衛不可連守、女巫不可同晚解毒、機械狼不可學自己）。
2. **實體法官介面**：顯示當前角色的「主持逐字稿（睜眼／引導／閉眼三段式台詞）」與即時規則提醒，下方為對應的操作按鈕盤，並可隨時從抽屜點開「目前為止所有操作紀錄」與「板子規則／Q&A」。
3. **線上法官介面**：不顯示逐字稿，改為語音播報（TTS）；角色閉眼與下一角色睜眼之間具備「可設定時長」的間隔緩衝，並在切換角色時顯示**「全黑防窺過渡畫面」**，需點擊螢幕後才亮起該角色的操作按鈕。
4. **進度顯示**：無論何種模式，頂部狀態列皆清楚標示「第幾天／當前誰睜眼」。
5. **多點操作協同（狼人隊即時同步）**：
   - 多點模式下，線上法官中央螢幕不顯示個人操作盤，改由玩家在各自裝置操作。
   - 多人同時行動（如狼人隊）時不可出聲討論，狼隊介面需即時同步顯示隊友的游標或預選目標（例如：「3 號預選 7 號」），內建一鍵快捷標籤（如：`自刀`、`落刀`、`聽隊友的`），必須等**所有存活狼人皆點擊「確認鎖定」**後才算正式落刀。

### 3.5 天亮、警長競選與白天流程（Day Phase）
1. **天亮結算與技能觸發**：
   - 清楚公告昨夜平安夜或死亡名單（法官視角標註死因）；場上有「熊」時自動判定並顯示熊咆哮結果；死者為獵人或狼王時自動依規則判定是否可開槍。
2. **警長競選（第一天有開啟警長時）**：
   - **上警與抽順序**：法官勾選上警玩家（或多點模式下玩家自行點選上警／不上警）。隨機抽取一名上警玩家並決定發言方向（順序／逆序）。若僅 1 人上警，跳過發言直接當選警長。
   - **退水機制**：警上玩家可在發言或投票前點擊「退水」（放棄競選）；退水後立即失去投票權。若退水後僅剩 1 人則直接當選；若全員退水則本局警徽流失（無警長）。
   - **警下投票與平票 PK**：發言結束後由具投票權的警下玩家投票，最高票當選。若最高票 2 人以上平票，平票者進入一輪 PK 發言後重新投票。
   - **警上狼人自爆（單爆／雙爆吞警徽）**：警長競選階段若有狼人自爆，立即結束白天進入夜晚，並依房規執行：
     - **單爆吞警徽**：警徽直接流失，本局無警長。
     - **雙爆吞警徽**：第一爆入夜，隔天天亮直接跳過警上發言階段、進入退水與投票環節；若再次自爆則正式吞警徽。
3. **自動抽取發言順序與單人計時器**：
   - **有警長**：由警長決定「警左（警長左邊第一位起順時針）」或「警右（警長右邊第一位起逆時針）」；亦支援依初始房規在有死訊時改為「死左（從座號最小死者為基準）」或「死右」，平安夜再切回警左／警右（警長排在最後歸票位）。
   - **無警長**：平安夜隨機抽取一名存活玩家與方向開始發言；有死訊則從座號最小死亡玩家的旁邊開始（預設順時針，可於設定調整）。
   - **單人發言計時器**：畫面明確顯示當前發言座號與倒數計時，旁邊配置 **`-` 減時間** 與 **`+` 加時間** 按鈕；若玩家提早結束發言，點擊「下一位」直接跳轉並重新計時。
4. **警徽移交與撕毀**：
   - 當警長在白天被放逐或夜間死亡時，自動彈出「移交警徽給幾號」或「撕毀警徽」的確認視窗，系統隨即自動更新下一輪的發言順序基準。
5. **白天角色技能按鈕**：
   - 若場上有可在白天發動技能的角色（如騎士決鬥、白狼王自爆帶人），顯示對應技能按鈕（但在「線上法官」的中央主螢幕上不顯示此個人技能按鈕，避免暴露身分）。
6. **中央操作雙模式投票紀錄器**：
   - 支援法官在兩種計票方式間自由切換（底層寫入同一份 `VoteRoundRecord`，自動排除無投票權之翻牌白痴、套用警長 `1.5` 票權重與預留烏鴉 `+1` 票接口）：
     - **方式一（逐人記錄）**：依序記錄每位玩家投給誰（例：`1 號投給 9 號`、`2 號棄票`、`3 號投給 3 號`...）。
     - **方式二（依候選人唱票勾選）**：選擇得票對象後直接勾選投票者（例：`投給 1 號的有 3、6、9、12 號`、`投給 2 號的無`...）。
7. **勝負自動判定與法官手動覆蓋**：
   - 每次天亮、開槍、騎士決鬥、自爆帶人或投票放逐結算後，依「屠邊」或「屠城」設定自動計算存活陣營人數並判定勝負；同時保留「法官強制繼續 / 強制結束 / 好人交牌 / 狼人交牌」的手動覆蓋開關以應對特殊房規。

### 3.6 玩家雙模式筆記本（Notebook Drawer）
- 每位玩家在遊玩階段皆可隨時拉開自己的筆記本抽屜（持久化於 `localStorage`），支援兩種模式切換：
  1. **全空白筆記本**：自由文字記錄區。
  2. **階段×座號結構化表格筆記**：橫軸／縱軸對應各階段（抿牌階段、警上發言、第一天白天、第二天白天...）與 1～N 號玩家格子，方便快速標記身分推測。
- 遊戲結束後支援匯出完整筆記內容。

### 3.7 遊戲結束與復盤結算（Game Over）
1. **網易狼人殺風格結算畫面**：清晰展示勝利陣營、全場玩家「身分回顧」（底牌、存活／死因）與完整「對局回顧」（逐夜逐日行動與票型時間軸）。
2. **匯出與重開**：
   - 提供法官「一鍵匯出紀錄表」功能（含完整行動、票型與筆記）。
   - 提供「保留原配置開啟新局（重新開始，含保留／清空暱稱選項）」與「解散房間」按鈕。

---

## 4. 核心資料結構與架構對齊（既有沿用 vs. V2.0 擴充）

### 4.1 現有 `src/logic/` 與 `src/data/` 模組盤點與 V2.0 擴充對照表

| 既有檔案／模組 | 目前狀態 | V2.0 處置方式 | 說明 |
| :--- | :---: | :---: | :--- |
| `src/data/boards.ts`、`src/data/roles.ts` | 143 板子 / 130 角色 | **`[既有沿用]`** | 直接供主頁「規則」圖鑑、大廳選板、夜間台詞與 TTS 播報使用。 |
| `src/logic/nightResolution.ts`、`mechWolf.ts` | 核心夜結算 | **`[既有沿用]`** + 小幅擴充 | 沿用所有夜結算、奶穿、開槍、機械狼邏輯；新增首夜實體發牌未登錄座位自動補「平民」純函式。 |
| `src/logic/advancedRoles.ts` | 白狼王／狼美／騎士／攝夢／熊 | **`[既有沿用]`** | 完整保留 5 大進階角色自動結算與測試。 |
| `src/logic/sheriff.ts` | 警長競選與單爆吞警徽 | **`[既有沿用]`** + **`[V2.0 擴充]`** | 沿用上警／退水／投票／PK／警徽移交；擴充 `badgeSwallowMode`（單爆 vs 雙爆吞警徽跨日續競選狀態機）。 |
| `src/logic/speakingOrder.ts` | 自動發言順序引擎 | **`[既有沿用]`** + **`[V2.0 擴充]`** | 沿用警左／警右／死左／死右／隨機抽取；擴充無警長有死訊之預設方向開關（順／逆時針）。 |
| `src/logic/voting.ts` | 放逐計票與權重 | **`[既有沿用]`** + **`[V2.0 擴充]`** | 沿用 `VoteRoundRecord`、`1.5` 票與 `extraVotes`；擴充「逐人記錄 ⇄ 依候選人唱票」雙向轉換純函式。 |
| `src/logic/victory.ts`、`manualControl.ts` | 勝負與手動介入 | **`[既有沿用]`** + **`[V2.0 擴充]`** | 沿用屠邊／屠城與手動調整；擴充法官強制繼續／強制結束／好人交牌／狼人交牌。 |
| `src/logic/setup.ts` | 座位與發牌初始化 | **`[既有沿用]`** + **`[V2.0 擴充]`** | 擴充 3D 主持模式初始化、線上隨機洗牌分發、實體發牌首夜認領與自動補平民。 |
| `src/logic/notebook.ts` *(新增)* | — | **`[V2.0 新增]`** | 雙模式筆記本資料模型、階段列自動生成與匯出格式化純函式。 |
| `src/logic/multiplayer.ts` *(新增，Milestone B)* | — | **`[V2.0 新增]`** | 房間代碼／Token 驗證、私有視角過濾（防底牌外洩）與狼隊預選游標鎖定判定純函式。 |
| `src/store/gameStore.ts` | Zustand Persist Store | **`[既有沿用]`** + **`[V2.0 擴充]`** | 保留既有狀態與動作，擴充 3D 模式、TTS 設定、白噪音設定、雙模式筆記本與房間連線狀態。 |

---

### 4.2 角色與板子靜態定義（`src/logic/types.ts` — `[既有沿用]`）
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

### 4.3 規則微調開關（`RuleOverrides`：`[既有沿用]` + `[V2.0 擴充]`）
```ts
export type WitchSelfSaveRule = 'first_night_only' | 'never' | 'always';
/** [V2.0 擴充] 吞警徽規則：單爆吞警徽 / 雙爆吞警徽 */
export type BadgeSwallowRule = 'single_explode' | 'double_explode';

export interface RuleOverrides {
  /** [既有沿用] 女巫能否自救：僅首夜可自救 / 全程不可自救 / 全程可自救 */
  witchSelfSave: WitchSelfSaveRule;
  /** [既有沿用] 白痴白天被放逐翻牌免死後，是否仍需被追刀才算神職出局 */
  idiotNeedsExtraKill: boolean;
  /** [既有沿用] 機械狼第一晚是否強制學習一名玩家 */
  mechWolfForceLearnNight1: boolean;
  /** [既有沿用] 狼刀在先（預設 true） */
  wolfKillPriority: boolean;
  /** [既有沿用] 勝利條件：屠邊（預設）或屠城 */
  victoryMode: 'slaughter_side' | 'slaughter_all';

  /** [V2.0 擴充] 是否開啟警長競選（預設 true） */
  enableSheriff: boolean;
  /** [V2.0 擴充] 吞警徽規則：單爆吞警徽 / 雙爆吞警徽 */
  badgeSwallowRule: BadgeSwallowRule;
  /** [V2.0 擴充] 無警長時有死訊的發言方向（預設 clockwise 順時針） */
  noSheriffDeadDirection: SpeakingDirection;
  /** [V2.0 擴充] 有警長且有死訊時，是否優先採用死左／死右（平安夜切回警左／警右） */
  sheriffUseDeadSideOnDeath: boolean;
}
```

### 4.4 對局運行時狀態（`src/logic/types.ts`：`[既有沿用]` + `[V2.0 擴充]`）
```ts
export type GamePhase =
  | 'home'              // [V2.0 擴充] 主頁四大入口（主持 / 加入 / 規則 / 關於）
  | 'join_room'         // [V2.0 擴充] 加入房間（房間代碼 / QR Code）
  | 'rules_atlas'       // [V2.0 擴充] 143 板子與 130 角色規則圖鑑
  | 'about'             // [V2.0 擴充] 關於本網站與參考連結
  | 'board_select'      // [既有沿用] 選板子與 3D 模式／規則微調（大廳）
  | 'seat_setup'        // [既有沿用] 座位暱稱、大廳入座與發牌設定
  | 'pass_and_reveal'   // [V2.0 擴充] 線上發牌 × 中央操作：1~N 號傳閱確認身分
  | 'night'             // [既有沿用] 夜間逐步驟主持
  | 'day_announcement'  // [既有沿用] 天亮公佈昨夜死亡與觸發技能（開槍）
  | 'day_vote'          // [既有沿用] 警長競選、白天發言、自爆與放逐投票
  | 'game_over';        // [既有沿用] 遊戲結束與網易風格復盤紀錄

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
  roleId: string | null;        // 實體發牌開局時為 null，首夜認領後寫入，首夜結束未認領者自動設為 'villager'
  isAlive: boolean;
  deathReason?: DeathReason;
  deathRound?: number;
  /** 特殊狀態 */
  idiotRevealed?: boolean;      // 白痴已翻牌免死（失去投票權）
}

export interface MechWolfRuntimeState {
  learnedFromSeat: number | null;
  learnedRoleId: string | null;
  hasJoinedWolfTeam: boolean;
  usedLearnedOneShotSkill: boolean;
  lastGuardedSeat: number | null;
}

export interface NightActionDraft {
  round: number;
  guardTarget: number | null;
  wolfTarget: number | null;
  witchUseAntidote: boolean;
  witchPoisonTarget: number | null;
  seerCheckTarget: number | null;
  psychicCheckTarget: number | null;
  mechWolfLearnTarget: number | null;
  mechWolfSkillTarget: number | null;
  wolfBeautyCharmTarget: number | null;
  dreamCatcherTarget: number | null;
}

export interface BearRoarResult {
  bearSeat: number | null;
  bearAlive: boolean;
  leftNeighborSeat: number | null;
  rightNeighborSeat: number | null;
  roared: boolean;
  reason: string;
}

export type SpeakingDirection = 'clockwise' | 'counterclockwise';
export type SpeakingOrderMode =
  | 'random'
  | 'sheriff_left'
  | 'sheriff_right'
  | 'dead_left'
  | 'dead_right';

export interface SpeakingOrderResult {
  mode: SpeakingOrderMode;
  direction: SpeakingDirection;
  startSeat: number | null;
  anchorSeat: number | null;
  sheriffLastSeat: number | null;
  queue: number[];
}

export type SheriffStatus =
  | 'not_started'
  | 'sign_up'
  | 'speaking'
  | 'voting'
  | 'pk_speaking'
  | 'pk_voting'
  | 'deferred_after_first_explode' // [V2.0 擴充] 雙爆吞警徽：首爆入夜，隔天跳過警上發言直接進入退水與投票
  | 'elected'
  | 'swallowed'
  | 'no_sheriff';

export type BadgeStatus = 'none' | 'active' | 'destroyed' | 'swallowed';

export interface VoteRoundRecord {
  roundIndex: number;
  votes: Record<number, number | null>;
  totals: Record<number, number>;
  votersByTarget: Record<number, number[]>;
  abstainers: number[];
  extraVotes?: Record<number, number>;
  tiedSeats: number[];
  electedSeat: number | null;
}

export interface SheriffState {
  status: SheriffStatus;
  sheriffSeat: number | null;
  badgeStatus: BadgeStatus;
  candidates: number[];
  withdrawnSeats: number[];
  pkCandidates: number[];
  voteRounds: VoteRoundRecord[];
  pendingBadgeTransferFrom: number | null;
  /** [V2.0 擴充] 警上累計自爆次數（搭配 badgeSwallowRule 判定單爆／雙爆吞警徽） */
  explodeCountDuringElection: number;
}

export type DayStructuredEventType =
  | 'sheriff_signup'
  | 'sheriff_withdraw'
  | 'sheriff_vote'
  | 'sheriff_elected'
  | 'sheriff_swallowed'
  | 'sheriff_deferred_explode'   // [V2.0 擴充] 雙爆吞警徽首爆入夜
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
```

### 4.5 V2.0 新增領域型別（3D 主持矩陣、TTS、白噪音、雙模式投票與筆記本、多點連線）
```ts
/** [V2.0 新增] 主持三大維度（組合成 8 種主持模式） */
export type JudgeMode = 'physical_judge' | 'online_judge';
export type DealMode = 'physical_deal' | 'online_deal';
export type ControlMode = 'central_control' | 'multi_device';

export interface HostModeConfig {
  judgeMode: JudgeMode;     // 預設 'physical_judge'
  dealMode: DealMode;       // 預設 'physical_deal'
  controlMode: ControlMode; // 預設 'central_control'
}

/** [V2.0 新增] 線上法官語音播報（TTS）與防窺設定 */
export interface OnlineJudgeSettings {
  ttsEnabled: boolean;
  ttsRate: number;              // 語速（預設 1.0）
  stepBufferSeconds: number;    // 閉眼到下一角色睜眼緩衝秒數（可調，預設 3 秒）
}

/** [V2.0 新增] 夜間白噪音播放器設定 */
export type AmbientPresetId = 'none' | 'rain' | 'white_noise' | 'pink_noise' | 'campfire' | 'custom';

export interface AmbientAudioSettings {
  presetId: AmbientPresetId;
  customFileName?: string | null;
  volume: number;               // 0 ~ 1
  autoPlayAtNight: boolean;
}

/** [V2.0 新增] 中央操作雙模式投票紀錄器模式 */
export type VoteInputMode = 'by_voter' | 'by_candidate';

/** [V2.0 新增] 玩家雙模式筆記本（持久化於 localStorage） */
export type NotebookMode = 'freeform' | 'grid';

export interface NotebookState {
  mode: NotebookMode;
  freeformText: string;
  /** key: stageKey（如 'pre_game', 'sheriff', 'day_1', 'day_2'），value: Record<seatNumber, string> */
  gridCells: Record<string, Record<number, string>>;
}

/** [V2.0 新增 - Milestone B] 雲端多點房間與狼隊即時預選游標 */
export type WolfQuickTag = 'self_kill' | 'lock_kill' | 'follow_team';

export interface WolfCursorSelection {
  wolfSeat: number;
  hoverTargetSeat: number | null;
  quickTag?: WolfQuickTag | null;
  isLocked: boolean;            // 必須所有存活狼人皆 isLocked === true 才正式落刀
}

export interface RoomSessionState {
  roomCode: string | null;
  playerToken: string | null;   // 持久化於 localStorage，供斷線重連秒回原座位
  mySeatNumber: number | null;
  isHost: boolean;
  wolfCursors: Record<number, WolfCursorSelection>;
}
```

> **`GameState`（Zustand Persist Store）擴充總覽**：完整保留既有 `phase`、`round`、`selectedBoardId`、`ruleOverrides`、`seats`、`savedNicknames`、`currentStepIndex`、`currentNightDraft`、`witchAntidoteUsed`、`witchPoisonUsed`、`lastGuardedSeat`、`mechWolfState`、`pendingSelfExplodeSeat`、`lastCharmedSeat`、`activeCharmedSeat`、`lastDreamTarget`、`knightDuelUsed`、`lastBearRoar`、`speakingQueue`、`currentSpeakerIndex`、`speakingMeta`、`defaultSpeakDurationSec`、`remainingSeconds`、`sheriffState`、`exilePkCandidates`、`nightHistory`、`dayHistory`、`winner`、`winReason`；並新增 `hostMode: HostModeConfig`、`onlineJudgeSettings: OnlineJudgeSettings`、`ambientAudio: AmbientAudioSettings`、`voteInputMode: VoteInputMode`、`notebook: NotebookState`、`forceContinueAfterVictory: boolean` 與（Milestone B）`roomSession: RoomSessionState`。

---

## 5. 規則引擎防呆規則與 Vitest 邊界測試基準

### 5.1 MVP 板子 1（基礎基準）：`12 人局 - 經典` `[既有已驗證]`
- **陣營配置**：小狼 × 4；平民(村民) × 4、預言家 × 1、女巫 × 1、獵人 × 1、白痴(愚者) × 1。
- **夜間睜眼順序**：
  - 第一晚：`狼人 ➜ 女巫 ➜ 預言家 ➜ 獵人 ➜ 白痴`
  - 第二晚之後：`狼人 ➜ 女巫 ➜ 預言家 ➜ 獵人`
- **支援規則微調開關**：`witchSelfSave`、`idiotNeedsExtraKill`、`wolfKillPriority`
- **Vitest 必測邊界**：
  1. 狼刀致死、女巫解藥救回成平安夜、解藥與毒藥不可同晚使用、女巫自救受 `witchSelfSave` 控制。
  2. 獵人被狼刀或放逐可開槍；被女巫毒殺不可開槍。
  3. 白痴白天被放逐翻牌免死（`isAlive = true`, `idiotRevealed = true`）並失去投票權；`idiotNeedsExtraKill = false` 時其餘神職全滅即判屠神，`true` 時須追刀才算屠神。
  4. 狼人白天自爆強制入夜，且自爆狼於當晚點刀後才正式死亡。

### 5.2 MVP 板子 2（進階互動）：`12 人局 - 狼王守衛` `[既有已驗證]`
- **陣營配置**：小狼 × 3、狼王(黑狼王) × 1；平民(村民) × 4、預言家 × 1、女巫 × 1、獵人 × 1、守衛 × 1。
- **夜間睜眼順序**：每晚 `守衛 ➜ 狼人(狼王) ➜ 女巫 ➜ 預言家 ➜ 獵人`。
- **支援規則微調開關**：`witchSelfSave`、`wolfKillPriority`
- **Vitest 必測邊界**：
  1. **同守同救奶穿**：守衛守 A ＋ 狼刀 A ＋ 女巫救 A ➜ A 死亡（`deathReason = 'milk_pierce'`）。
  2. **守衛連守限制**：第 N 晚守 A 後，第 N+1 晚不可再守 A（允許空守、改守他人或守自己）。
  3. **守衛防禦範圍**：守衛之盾可擋狼刀，但**不可擋女巫毒藥**。
  4. **狼王開槍狀態機**：自刀死亡／被獵人帶走／被奶穿／白天放逐可開槍（非最後一狼）；被女巫毒殺／白天自爆／最後一狼出局不可開槍。
  5. **獵人開槍狀態機**：狼刀／奶穿／狼王開槍／放逐可開槍；女巫毒殺不可開槍。
  6. **狼刀在先原則**：當晚狼刀已達屠邊時，即使女巫同晚毒殺最後一狼或獵人帶走最後一狼，仍判狼人勝利。

### 5.3 MVP 板子 3（動態變形）：`10 人局 - 機械狼通靈師 / 鏡隱迷蹤` `[既有已驗證]`
- **陣營配置**：小狼 × 2、機械狼(覺醒隱狼) × 1；平民(村民) × 4、通靈師(魔鏡少女) × 1、女巫 × 1、守衛 × 1。
- **夜間睜眼順序**：
  - 第一晚：`機械狼 ➜ 守衛 ➜ 狼人 ➜ 女巫 ➜ 通靈師 ➜ 機械狼`
  - 第二晚之後：`守衛 ➜ 機械狼 ➜ 狼人 ➜ 女巫 ➜ 通靈師`
- **支援規則微調開關**：`witchSelfSave`、`mechWolfForceLearnNight1`、`wolfKillPriority`
- **Vitest 必測邊界**：
  1. **首夜學習**：選擇自己以外一名玩家學習（`mechWolfForceLearnNight1 = true` 不可跳過），首夜尾聲得知所學身分，第二晚生效。
  2. **通靈師查驗變化**：學習前查驗為「機械狼」；學習後動態變為「所學對象真實身分」。
  3. **機械狼特化技能**：學女巫僅得 1 瓶毒藥（無解藥）；學守衛之機械盾**可擋女巫毒藥**且不可連守；學小狼待所有小狼出局入隊後開啟雙刀；學通靈師每晚查驗真實身分。
  4. **入隊與自爆限制**：機械狼全程不可自爆、初期不入隊；所有小狼出局且機械狼存活時自動 `hasJoinedWolfTeam = true`。
  5. **勝負計算**：機械狼屬狼人陣營，好人須淘汰所有小狼**與**機械狼方獲勝。

### 5.4 Phase 1.5 白天流程與 5 個高頻進階角色自動結算基準 `[既有已驗證]`
1. **發言順序（`speakingOrder.ts`）**：環狀跳過出局者；支援隨機抽取（含可注入 `rng`）、`sheriff_left`/`sheriff_right`/`dead_left`/`dead_right`，有存活警長一律排最後歸票位。
2. **警長與投票（`sheriff.ts`、`voting.ts`）**：上警、退水（無投票權、餘 1 人直選、全員退水流失）、警下投票與平票 PK、警徽移交／撕毀、白痴免死排除投票權、警長 `1.5` 票與烏鴉 `extraVotes` 接口。
3. **白狼王（`white_wolf_king`）**：白天亮牌自爆立即帶走一名存活玩家（被帶走者無法發動技能），檢查勝負後強制入夜，白狼王當晚點刀後死亡；警上自爆亦計入吞警徽。
4. **狼美人（`wolf_beauty`）**：不可自爆、不可自刀；每晚魅惑自己以外存活者且不可連魅；除「騎士決鬥出局（`knight_duel`）」外，任何方式出局皆帶走前一晚魅惑對象殉情（無技能），殉情達成屠邊則狼勝。
5. **騎士（`knight`）**：整局限一次，白天翻牌決鬥存活者：撞狼該狼即時出局且無死亡技能並直接入夜；撞好人騎士自刎並繼續白天。
6. **攝夢人（`dream_catcher`）**：每晚強制選自己以外存活者為夢遊者（當晚免疫狼刀與女巫毒藥且不觸發奶穿）；連兩晚夢同一人則天亮夢死且無技能；攝夢人夜死則夢遊者牽連共死且無技能。
7. **熊（`bear`）**：天亮夜死結算後自動判定：熊死不咆哮；熊活則檢查左右最近存活鄰居是否含狼（機械狼已學好人視同好人不咆哮）。

### 5.5 V2.0 新增規則引擎測試門禁 `[V2.0 擴充必測]`
1. **實體發牌首夜動態認領**：開局 `roleId = null`；第一晚各角色步驟依序認領座號（防重複指派與人數超額）；首夜結束後所有 `roleId === null` 座位自動判定為 `villager`。
2. **雙爆吞警徽狀態機**：
   - `badgeSwallowRule === 'single_explode'`：警上首次自爆即吞警徽（`status = 'swallowed'`）。
   - `badgeSwallowRule === 'double_explode'`：警上首次自爆後強制入夜並將 `status` 設為 `deferred_after_first_explode`、`explodeCountDuringElection = 1`；隔天天亮自動跳過警上發言直接進入退水與投票；若再次自爆則正式吞警徽。
3. **無警長死訊發言方向**：無警長且昨夜有死訊時，從座號最小死者出發依 `noSheriffDeadDirection`（順時針／逆時針）生成存活發言佇列。
4. **雙模式投票等價性**：同一批投票透過「逐人記錄（`by_voter`）」與「依候選人唱票（`by_candidate`）」操作，必須產出完全一致的 `VoteRoundRecord` 與計票結果。
5. **法官手動勝負覆蓋**：達成自動勝負條件後，法官可選擇「強制繼續」解除鎖定，或隨時宣告「好人交牌／狼人交牌／強制結束」。

---

## 6. 分階段開發路線圖（Phased Development Roadmap）

### 6.1 已完成基線（Baseline）
- **Phase 1 / 1.5 / 2（已完成）**：`src/data/` 全量 143 板子與 130 角色資料、`src/logic/` 純函式規則引擎與 32+ Vitest 單元測試、既有 Zustand Persist Store 與 MVP 基礎畫面。

---

### 6.2 里程碑 A：純前端單機完整版（Standalone Local-First）

#### Phase A1：PWA 基礎、零滾輪 `100dvh` 殼層與主頁四大入口
- **目標**：建立 V2.0 單屏無滾輪視覺框架、PWA 全螢幕設定與四大主頁入口。
- **核心任務**：
  1. 建立 `public/manifest.json`、App Icons 與 `index.html` 全螢幕 meta（支援加入主畫面隱藏網址列）。
  2. 建立 `100dvh` 零滾輪佈局殼層（頂部狀態列＋座位區／主區＋底部主操作區）與統一滑出抽屜元件（Drawer：筆記本、板子規則／Q&A、歷史操作紀錄）。
  3. 實作新版主頁四大入口：**主持**、**加入**（單機期預留房間加入介面骨架）、**規則**（獨立可篩選與搜尋的 143 板子與 130 角色圖鑑）、**關於**（網站簡介、狼序 WolfCue 等參考網站與社團資訊）。
- **驗收**：手機直式與桌面寬度無垂直滾輪；`npm run test` & `npm run build` 全綠。

#### Phase A2：3D 主持矩陣、大廳設定、實體／線上發牌與白噪音播放器
- **目標**：完成開局大廳與兩種發牌模式，並補齊所有新增房規開關與測試。
- **核心任務**：
  1. 擴充 `src/logic/types.ts`、`src/logic/setup.ts` 與 `src/store/gameStore.ts`（3D 主持模式、雙爆吞警徽／無警長死訊方向等開關、線上隨機發牌、實體發牌首夜認領與補平民），同步撰寫 Vitest 單元測試。
  2. 重構大廳畫面：頂部板子資訊與規則抽屜按鈕、3D 模式切換器、規則微調開關、6～15 人座位清單（保留／清空暱稱）。
  3. 實作「線上發牌 × 中央操作」傳閱確認身分畫面（1~N 號點擊顯示 → 確認隱藏交給下一位，含「重新發牌」與「重新查看身分」）。
  4. 實作大廳「夜間音訊與白噪音播放器」：內建多款系統預設白噪音（Web Audio 合成／預設音軌）＋使用者自訂音訊上傳，於夜晚自動播放。
- **驗收**：中央操作 4 種模式（模式 1、2、5、6）皆可順利開局進入第一晚；Vitest 全綠。

#### Phase A3：零滾輪 `100dvh` 夜間控制台、防誤觸雙確認與線上法官（TTS＋防窺黑屏）
- **目標**：完整打通中央操作 4 種模式的夜間主持體驗。
- **核心任務**：
  1. 重構夜間控制台為 `100dvh` 零滾輪三區塊（頂部「第幾天／當前誰睜眼」、中央座位小圖示狀態、底部操作盤；歷史操作紀錄與板子規則收進滑出抽屜）。
  2. 實作防誤觸邏輯：點選目標可再次點選取消，且必須點擊額外「確認」按鈕才正式記錄。
  3. 整合「實體發牌」首夜各角色睜眼登錄座號步驟，與首夜結束自動將未登錄座位判定為平民。
  4. 實作「線上法官」模式：隱藏逐字稿、Web Speech API 語音播報（TTS）、可調閉眼／睜眼緩衝秒數、切換角色時顯示「全黑防窺過渡畫面（點擊才亮起操作盤）」。
- **驗收**：模式（1）（2）（5）（6）皆可從第一晚順暢推進至天亮；線上法官無逐字稿外洩且具備防窺過渡；Vitest 全綠。

#### Phase A4：天亮與白天零滾輪工作台、雙爆吞警徽與雙模式投票紀錄器
- **目標**：完整實作 V2.0 白天流程與進階房規。
- **核心任務**：
  1. 擴充 `src/logic/sheriff.ts`、`src/logic/speakingOrder.ts`、`src/logic/voting.ts`、`src/logic/victory.ts` 與 Vitest 測試：補齊單爆／雙爆吞警徽、無警長死訊方向、雙模式投票等價轉換與法官手動勝負覆蓋（強制繼續／強制結束／好人交牌／狼人交牌）。
  2. 重構天亮與白天畫面為 `100dvh` 零滾輪工作台：警長競選（上警、抽順序、1 人直接當選、退水、警下投票與平票 PK）、警徽移交／撕毀彈窗、單人發言計時器（`-`/`+` 調時＋「下一位」跳轉重置）。
  3. 實作「中央操作雙模式投票紀錄器」（方式一：逐人記錄 ⇄ 方式二：依候選人唱票勾選）。
  4. 白天個人技能按鈕（騎士決鬥、白狼王自爆等）於「線上法官」中央螢幕自動隱藏。
- **驗收**：雙爆吞警徽跨日流程、雙模式投票與發言計時全數通過 Vitest 與互動驗證。

#### Phase A5：玩家雙模式筆記本抽屜與網易風格結算復盤（Milestone A 驗收）
- **目標**：完成玩家筆記本、網易風結算與匯出，正式收官單機完整版。
- **核心任務**：
  1. 新增 `src/logic/notebook.ts` 與滑出式「玩家雙模式筆記本 Drawer」（`localStorage` 持久化）：全空白自由筆記本 ⇄ 階段×座號結構化表格筆記（抿牌階段、警上發言、第一天白天、第二天白天... × 1~N 號）。
  2. 重構結算畫面為「網易狼人殺風格結算畫面」：勝利陣營、全場玩家身分回顧（底牌、存活／死因）、完整逐夜逐日對局回顧與票型時間軸。
  3. 實作「一鍵匯出紀錄表（含完整行動、票型與筆記）」、「保留原配置開啟新局（重新開始）」與「解散房間」。
- **驗收**：中央操作 4 種模式完整跑通至復盤匯出；重整頁面後對局與筆記本完整保留。

---

### 6.3 里程碑 B：雲端連線多點版（Cloud Realtime Multiplayer）

#### Phase B1：雲端即時同步接入、房間大廳與斷線重連 Token
- **核心任務**：接入 Supabase Realtime（或等效雲端同步）；實作 6～15 人房間大廳、房間代碼／QR Code 產生與主頁「加入」掃碼入房、「解散房間」廣播；實作玩家裝置 Token＋`localStorage` 斷線秒回原座位且筆記不遺失。

#### Phase B2：多點操作權限隔離與四種多點模式打通（模式 3、4、7、8）
- **核心任務**：實作法官上帝視角 vs 玩家私有視角隔離（防止封包洩漏底牌）；打通多點線上發牌分發、多點實體發牌首夜手機認領；線上法官中央螢幕僅語音播報與公開進度，隱藏個人操作盤與白天技能按鈕。

#### Phase B3：狼隊即時預選游標協同與多點白天同步投票（Milestone B 驗收）
- **核心任務**：實作狼隊夜間即時同步游標／預選目標（如「3 號預選 7 號」）、快捷標籤（`自刀`、`落刀`、`聽隊友的`）、必須所有存活狼人點擊「確認鎖定」才正式落刀；實作多點白天同步上警／退水／投票／個人技能與全體同步網易風復盤。
