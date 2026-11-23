# 全量板子與角色實作覆蓋率體檢表

> 本報告由 `scripts/generateAuditReport.ts` 自動掃描 `src/logic/`（`nightResolution.ts`、`dayResolution.ts`、`mechWolf.ts`、`advancedRoles.ts`、`wolfGirl.ts`、`treasureMaster.ts`、`victory.ts`）、`src/data/roles.ts` 與 `src/data/boards.ts` 生成。

## 一、全量健康與覆蓋率總覽

| 指標項目 | 數值 | 佔比 / 說明 |
| --- | ---: | --- |
| 板子總數（`ALL_BOARDS`） | **143** | 與 `docs/boards-raw.md` 原文對帳 100% 一致 |
| 角色總數（`ROLE_LIST`） | **130** | 涵蓋狼人、好人、第三方陣營全部不重複角色 |
| 清單 A：全自動結算角色 | **19** | 佔總角色數 14.6% |
| 清單 B：僅台詞提示／需手動調整角色 | **111** | 佔總角色數 85.4%（含 1 名部分實作角色） |
| 已達成「全角色 100% 自動結算」板子 | **25 / 143** | 佔總板子數 17.5% |
| 尚待補齊之板子（含至少 1 名清單 B 角色） | **118 / 143** | 缺 1 角色：40 個板子 ／ 缺 2 角色：48 個板子 ／ 缺 3 角色：16 個板子 ／ 缺 4 角色：9 個板子 ／ 缺 5 角色：2 個板子 ／ 缺 6 角色：2 個板子 ／ 缺 7 角色：1 個板子 |

## 二、高優先度補齊排行榜（Top 15 熱門清單 B 角色）

優先依「**補完後可立刻解鎖 100% 自動結算的板子數（僅差 1 角色）**」與「**總出現板子數**」排序，方便規劃下一批規則引擎實作順序：

| 排名 | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 補齊可立即解鎖板子數 | 可立即解鎖之板子（僅差此角色） |
| ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | **夢魘** | `nightmare` | 狼人 | 8 | **4** | 10 人局 - 夢魘攝夢(網易版)、10 人局 - 夢魘攝夢(私版)、12 人局 - 夢魘守衛、12 人局 - 夢魘攝夢 |
| 2 | **惡靈騎士** | `evil_knight` | 狼人 | 3 | **3** | 12 人局 - 快言快語、12 人局 - 惡靈騎士、8 人局 - 諸神黃昏 |
| 3 | **混血兒** | `hybrid` | 第三方 | 9 | **2** | 10 人局 - 混血兒、12 人局 - 混血兒 |
| 4 | **種狼** | `seed_wolf` | 狼人 | 7 | **2** | 12 人局 - 種狼(京城版)、12 人局 - 種狼(私版) |
| 5 | **隱狼** | `hidden_wolf` | 狼人 | 6 | **2** | 10 人局 - 隱狼騎士、12 人局 - 熊隱狼 |
| 6 | **奇蹟商人** | `miracle_merchant` | 好人 | 5 | **2** | 10 人局 - 奇蹟商人、6 人局 - 奇蹟商人 |
| 7 | **覺醒孤獨少女** | `awakened_lonely_girl` | 第三方 | 2 | **2** | 10 人局 - 覺醒孤獨少女、12 人局 - 覺醒孤獨少女 |
| 8 | **惡魔** | `demon_wolf` | 狼人 | 2 | **2** | 12 人局 - 惡魔、12 人局 - 開膛手傑克 (第二身分) |
| 9 | **咒狐** | `cursed_fox` | 第三方 | 5 | **1** | 10 人局 - 咒狐 |
| 10 | **魔術師** | `magician` | 好人 | 5 | **1** | 12 人局 - 狼王魔術師 |
| 11 | **戰狼** | `war_wolf` | 狼人 | 5 | **1** | 9 人局 - 戰狼騎士 |
| 12 | **黑蝙蝠** | `black_bat` | 狼人 | 1 | **1** | 12 人局 - 黑蝙蝠 |
| 13 | **百變狼王** | `chameleon_wolf_king` | 狼人 | 1 | **1** | 12 人局 - 百變狼王 |
| 14 | **槓精** | `contrarian` | 好人 | 1 | **1** | 12 人局 - 針鋒相槓 |
| 15 | **酒鬼預言家** | `drunk_seer` | 好人 | 1 | **1** | 12 人局 - 酒鬼預言家 |

## 三、清單 A：全自動結算角色（共 19 個）

以下角色皆已在 `src/logic/` 完整實作自動生死／技能／查驗／勝負結算（依出現板子數由高到低排序）：

| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 對應邏輯模組（`src/logic/`） | 已實作自動結算機制 |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | **小狼** | `wolf` | 狼人 | 130 | `nightResolution.ts`, `dayResolution.ts`, `mechWolf.ts`, `advancedRoles.ts`, `wolfGirl.ts`, `treasureMaster.ts`, `victory.ts` | 狼刀結算、狼刀在先、白天自爆與當晚點刀後死亡、勝負計算 |
| 2 | **平民** | `villager` | 好人 | 126 | `wolfGirl.ts`, `treasureMaster.ts`, `victory.ts` | 平民邊屠邊計數、狼女孩表白平民同勝判定、盜寶大師底牌分類 |
| 3 | **女巫** | `witch` | 好人 | 126 | `nightResolution.ts`, `mechWolf.ts` | 解藥／毒藥互斥、自救規則（首夜／全程／不可）、同守同救奶穿、封鎖獵人與狼王開槍 |
| 4 | **預言家** | `seer` | 好人 | 119 | `nightResolution.ts`, `mechWolf.ts` | 夜間陣營查驗（好人／狼人） |
| 5 | **獵人** | `hunter` | 好人 | 80 | `dayResolution.ts` | 夜死／放逐／狼王開槍觸發開槍資格、被毒或愛情破裂禁止開槍、連鎖開槍結算 |
| 6 | **守衛** | `guard` | 好人 | 58 | `nightResolution.ts`, `mechWolf.ts` | 夜間守護防狼刀、不可連守、同守同救奶穿判定 |
| 7 | **狼王** | `wolf_king` | 狼人 | 29 | `dayResolution.ts` | 夜死／放逐／獵人槍擊開槍資格、自爆／被毒／最後一狼禁止開槍、連鎖開槍結算 |
| 8 | **攝夢人** | `dream_catcher` | 好人 | 21 | `nightResolution.ts`, `advancedRoles.ts` | 每晚攝夢免疫夜間傷害、連夢致死、攝夢人夜死牽連共死 |
| 9 | **白痴** | `idiot` | 好人 | 18 | `dayResolution.ts`, `victory.ts` | 白天首次放逐翻牌免死失投票權、追刀規則開關（idiotNeedsExtraKill） |
| 10 | **騎士** | `knight` | 好人 | 16 | `dayResolution.ts` | 白天翻牌決鬥（限一次）：撞狼對方直接出局且無技能並立刻入夜；撞好人騎士自死 |
| 11 | **熊** | `bear` | 好人 | 14 | `advancedRoles.ts` | 天亮自動檢查存活左右鄰居是否含狼（含機械狼學習後偽裝）並輸出咆哮結果 |
| 12 | **狼美人** | `wolf_beauty` | 狼人 | 12 | `nightResolution.ts`, `dayResolution.ts`, `advancedRoles.ts` | 每晚魅惑（不可自魅／連魅／魅老流氓）、不可自刀自爆、非騎士決鬥出局時對象殉情且無技能 |
| 13 | **白狼王** | `white_wolf_king` | 狼人 | 9 | `dayResolution.ts` | 白天翻牌自爆立即帶走一名玩家（對象無技能）、強制入夜、當晚點刀後死亡 |
| 14 | **通靈師** | `psychic` | 好人 | 8 | `nightResolution.ts`, `mechWolf.ts` | 夜間真實身分查驗（含機械狼學習前後與盜寶大師底牌變身） |
| 15 | **機械狼** | `mech_wolf` | 狼人 | 5 | `dayResolution.ts`, `mechWolf.ts`, `advancedRoles.ts` | 首夜學習身分、通靈師查驗偽裝、次夜起機械盾／單毒／通靈／入隊雙刀、不可自爆、自動入狼隊 |
| 16 | **毒師** | `poisoner` | 好人 | 2 | `nightResolution.ts` | 夜間單瓶毒藥結算、機械盾可擋、封鎖獵人與狼王開槍 |
| 17 | **蒙面人** | `masked_villager` | 好人 | 1 | `nightResolution.ts`, `treasureMaster.ts` | 夜間遭狼刀／毒藥／攝夢負傷延遲至隔日發言後出局、白天結算解除負傷並重算勝負 |
| 18 | **盜寶大師** | `treasure_master` | 第三方 | 1 | `nightResolution.ts`, `mechWolf.ts`, `treasureMaster.ts`, `victory.ts` | 首夜 3 底牌合法性與陣營歸屬、每晚切底牌且不可連選、通靈師查驗偽裝、盜寶狼入隊與最後一狼蒙面免放逐 |
| 19 | **狼女孩** | `wolf_girl` | 狼人 | 1 | `wolfGirl.ts` | 首夜向非狼表白（表白平民成功同勝）、白天或放逐後自爆觸發愛情破裂帶走表白對象並作廢投票 |

## 四、清單 B：僅台詞提示／需法官手動調整角色（共 111 個）

以下角色目前於夜間僅走睜閉眼提示（`confirm_only` 或共用狼刀步驟）或無完整自動結算邏輯，須由法官搭配「座位總覽／手動標記」輔助裁定（**依出現板子頻率由高到低排序**）：

| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 現況說明 | 出現板子清單 |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | **混血兒** | `hybrid` | 第三方 | 9 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 邱比特奇緣、10 人局 - 混血兒、10 人局 - 雲端追蹤、11 ~ 16 人局 - 影子 & 復仇者、12 人局 - 名媛、12 人局 - 邱比特奇緣、12 人局 - 混血兒、12 人局 - 風聲諜影、12 人局 - 雲端探查 |
| 2 | **獵魔人** | `demon_hunter` | 好人 | 8 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 血月獵魔、12 人局 - 血月獵魔、12 人局 - 刺客獵魔、12 人局 - 戰狼獵魔、12 人局 - 覺醒之夜、12 人局 - 無目之城、12 人局 - 沙龍之夜、娛樂局 - 連連看 |
| 3 | **夢魘** | `nightmare` | 狼人 | 8 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 夢魘攝夢(網易版)、10 人局 - 夢魘攝夢(私版)、10 人局 - 邱比特奇緣、12 人局 - 夢魘攝夢、12 人局 - 夢魘守衛、12 人局 - 夢魘惑心、12 人局 - 月靈狼、12 人局 - 邱比特奇緣 |
| 4 | **種狼** | `seed_wolf` | 狼人 | 7 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 種狼、9 人局 - 眾神之戰、12 人局 - 種狼(飯局版)、12 人局 - 種狼(京城版)、12 人局 - 種狼(娛百版)、12 人局 - 種狼(私版)、12 人局 - 狼美人惑騎 |
| 5 | **烏鴉** | `crow` | 好人 | 6 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 動物園、10 人局 - 邱比特奇緣、12 人局 - 烏鴉隱狼、12 人局 - 動物園、12 人局 - 邱比特奇緣、12 人局 - 烏鴉咒狐 |
| 6 | **蝕日侍女** | `eclipse_maid` | 狼人 | 6 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 獵日逐光、10 人局 - 千年之戀、12 人局 - 獵日逐光、12 人局 - 無目之城、12 人局 - 沙龍之夜、12 人局 - 千年之戀 |
| 7 | **隱狼** | `hidden_wolf` | 狼人 | 6 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 隱狼騎士、12 人局 - 烏鴉隱狼、12 人局 - 熊隱狼、12 人局 - 無目之夜、12 人局 - 種狼(娛百版)、12 人局 - 雲端探查 |
| 8 | **覺醒預言家** | `awakened_seer` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 尋香識命、10 人局 - 雲端追蹤、12 人局 - 尋香識命、12 人局 - 雲端探查、12 人局 - 沙龍之夜 |
| 9 | **咒狐** | `cursed_fox` | 第三方 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 雲端追蹤、10 人局 - 咒狐、12 人局 - 烏鴉咒狐、12 人局 - 雲端探查、12 人局 - 沙龍之夜 |
| 10 | **魔術師** | `magician` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 殭屍、12 人局 - 狼王魔術師、12 人局 - 詭術之境、12 人局 - 魔幻對決、12 人局 - 殭屍 |
| 11 | **奇蹟商人** | `miracle_merchant` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 6 人局 - 奇蹟商人、10 人局 - 奇蹟商人、10 人局 - 覺醒狼王奇商、12 人局 - 覺醒狼王奇商、12 人局 - 沙龍之夜 |
| 12 | **河豚** | `pufferfish` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 動物夢境、10 人局 - 風聲諜影、12 人局 - 動物夢境、12 人局 - 鬧鬧派對、12 人局 - 風聲諜影 |
| 13 | **流光伯爵** | `radiant_earl` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 獵日逐光、10 人局 - 千年之戀、12 人局 - 獵日逐光、12 人局 - 無目之城、12 人局 - 千年之戀 |
| 14 | **蝕時狼妃** | `time_eclipse_consort` | 狼人 | 5 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 永序之輪、10 人局 - 邱比特奇緣、12 人局 - 永序之輪、12 人局 - 邱比特奇緣、12 人局 - 沙龍之夜 |
| 15 | **戰狼** | `war_wolf` | 狼人 | 5 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 9 人局 - 戰狼騎士、12 人局 - 戰狼獵魔、12 人局 - 狼美人惑騎、12 人局 - 名媛、12 人局 - 通靈者 |
| 16 | **覺醒石像鬼** | `awakened_gargoyle` | 狼人 | 4 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 覺石覺攝、10 人局 - 風聲諜影、12 人局 - 覺石覺攝、12 人局 - 風聲諜影 |
| 17 | **覺醒狼王** | `awakened_wolf_king` | 狼人 | 4 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒狼王奇商、10 人局 - 覺醒女巫、12 人局 - 覺醒狼王奇商、12 人局 - 覺醒女巫 |
| 18 | **守墓人** | `gravekeeper` | 好人 | 4 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺石覺攝、12 人局 - 石像鬼守墓人、12 人局 - 覺石覺攝、12 人局 - 雲端探查 |
| 19 | **純白之女** | `pure_white_maiden` | 好人 | 4 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 純白夜影、10 人局 - 雲端追蹤、12 人局 - 純白夜影、12 人局 - 雲端探查 |
| 20 | **狼鴉之爪** | `wolf_raven_claw` | 狼人 | 4 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 迷霧鴉影、12 人局 - 迷霧鴉影、12 人局 - 無目之夜、12 人局 - 無目之城 |
| 21 | **煉金魔女** | `alchemy_witch` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 迷霧鴉影、12 人局 - 迷霧鴉影、12 人局 - 胡夫地平線 |
| 22 | **羊駝** | `alpaca` | 好人 | 3 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 10 人局 - 動物夢境、12 人局 - 動物夢境、12 人局 - 青青草原 |
| 23 | **覺醒狼美人** | `awakened_wolf_beauty` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 暗夜星辰、12 人局 - 暗夜星辰、12 人局 - 沙龍之夜 |
| 24 | **血月使徒** | `blood_moon_apostle` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 10 人局 - 血月獵魔、12 人局 - 血月獵魔、12 人局 - 鬧鬧派對 |
| 25 | **邱比特** | `cupid` | 第三方 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 邱比特奇緣、12 人局 - 盜賊邱比特、12 人局 - 邱比特奇緣 |
| 26 | **惡靈騎士** | `evil_knight` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 8 人局 - 諸神黃昏、12 人局 - 惡靈騎士、12 人局 - 快言快語 |
| 27 | **石像鬼** | `gargoyle` | 狼人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 石像鬼守墓人、12 人局 - 無目之夜、12 人局 - 南瓜鬼 |
| 28 | **企鵝** | `penguin` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 眾神之戰、9 人局 - 動物園、12 人局 - 動物園 |
| 29 | **尋香魅影** | `scent_phantom` | 狼人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 尋香識命、12 人局 - 尋香識命、娛樂局 - 連連看 |
| 30 | **高級平民** | `senior_villager` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 種狼、12 人局 - 種狼(飯局版)、12 人局 - 狼美人惑騎 |
| 31 | **定序王子** | `sequence_prince` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 永序之輪、12 人局 - 詭術之境、12 人局 - 永序之輪 |
| 32 | **寂夜導師** | `silent_night_mentor` | 狼人 | 3 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 時波之亂、12 人局 - 時波之亂、12 人局 - 無目之城 |
| 33 | **名媛** | `socialite` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 眾神之戰、12 人局 - 名媛、12 人局 - 月靈狼 |
| 34 | **白貓** | `white_cat` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 風聲諜影、12 人局 - 動物夢境、12 人局 - 風聲諜影 |
| 35 | **狼巫** | `wolf_witch` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 純白夜影、12 人局 - 純白夜影、12 人局 - 邱比特奇緣 |
| 36 | **覺醒攝夢人** | `awakened_dream_catcher` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺石覺攝、12 人局 - 覺石覺攝 |
| 37 | **覺醒獵人** | `awakened_hunter` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 暗夜星辰、12 人局 - 暗夜星辰 |
| 38 | **覺醒白痴** | `awakened_idiot` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒之夜、12 人局 - 覺醒之夜 |
| 39 | **覺醒孤獨少女** | `awakened_lonely_girl` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒孤獨少女、12 人局 - 覺醒孤獨少女 |
| 40 | **覺醒女巫** | `awakened_witch` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒女巫、12 人局 - 覺醒女巫 |
| 41 | **蜂之狂獵** | `bee_wild_hunt` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 猩紅蜂舞、12 人局 - 猩紅蜂舞 |
| 42 | **兔兔** | `bunny` | 好人 | 2 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 9 人局 - 動物園、12 人局 - 動物園 |
| 43 | **白晝學者** | `daylight_scholar` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 時波之亂、12 人局 - 時波之亂 |
| 44 | **惡魔** | `demon_wolf` | 狼人 | 2 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 惡魔、12 人局 - 開膛手傑克 (第二身分) |
| 45 | **蠱惑師** | `enchanter` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 夢魘惑心、12 人局 - 狼美人惑騎 |
| 46 | **狐狸** | `fox` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 動物園、12 人局 - 種狼(飯局版) |
| 47 | **子狐** | `fox_cub` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 動物夢境、12 人局 - 動物夢境 |
| 48 | **夜之貴族** | `night_noble` | 狼人 | 2 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒之夜、12 人局 - 覺醒之夜 |
| 49 | **猩紅狼王** | `scarlet_wolf_king` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 猩紅蜂舞、12 人局 - 猩紅蜂舞 |
| 50 | **白蛇預言家** | `white_snake_seer` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 千年之戀、12 人局 - 千年之戀 |
| 51 | **狼兄** | `wolf_brother` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 狼兄弟守衛、12 人局 - 狼兄弟黑市 |
| 52 | **狼弟** | `wolf_younger_brother` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 狼兄弟守衛、12 人局 - 狼兄弟黑市 |
| 53 | **許仙尋香魅影** | `xu_xian_phantom` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 千年之戀、12 人局 - 千年之戀 |
| 54 | **殭屍** | `zombie` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 殭屍、12 人局 - 殭屍 |
| 55 | **阿努比斯** | `anubis` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 胡夫地平線 |
| 56 | **刺客** | `assassin_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 刺客獵魔 |
| 57 | **復仇者** | `avenger` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 11 ~ 16 人局 - 影子 & 復仇者 |
| 58 | **白澤** | `bai_ze` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 青丘夜影 |
| 59 | **大野狼** | `big_bad_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 小女孩大野狼 |
| 60 | **大灰狼** | `big_grey_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 大灰狼占卜師 |
| 61 | **黑蝙蝠** | `black_bat` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑蝙蝠 |
| 62 | **黑市商人** | `black_market_merchant` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 狼兄弟黑市 |
| 63 | **管家** | `butler` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 一盞榮枯 |
| 64 | **百變狼王** | `chameleon_wolf_king` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 百變狼王 |
| 65 | **槓精** | `contrarian` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 針鋒相槓 |
| 66 | **舞者** | `dancer` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 假面舞會 |
| 67 | **黑夜使者** | `dark_night_envoy` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑白使者 |
| 68 | **偵探** | `detective` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 69 | **酒鬼預言家** | `drunk_seer` | 好人 | 1 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 12 人局 - 酒鬼預言家 |
| 70 | **邪惡商人** | `evil_merchant` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 邪惡商人 |
| 71 | **異族王子** | `exotic_prince` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 睡美人 |
| 72 | **愚言家** | `fool_seer` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 自曝愚言家 |
| 73 | **占卜師** | `fortune_teller` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 大灰狼占卜師 |
| 74 | **鬼魂新娘** | `ghost_bride` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 鬼魂新娘 |
| 75 | **灰太狼** | `grey_wolf_boss` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 76 | **喜羊羊** | `happy_sheep` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 77 | **鐵好人** | `iron_good` | 好人 | 1 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 12 人局 - 自曝愚言家 |
| 78 | **開膛手傑克** | `jack_the_ripper` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 開膛手傑克 |
| 79 | **燈影預言家** | `lantern_seer` | 好人 | 1 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 12 人局 - 燈影 |
| 80 | **小女孩** | `little_girl` | 好人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 小女孩大野狼 |
| 81 | **小小灰** | `little_grey_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 82 | **假面** | `masked_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 假面舞會 |
| 83 | **通靈者** | `medium` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 通靈者 |
| 84 | **梅杜莎** | `medusa` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 梅杜莎之眼 |
| 85 | **月靈狼** | `moon_spirit_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 月靈狼 |
| 86 | **禁言長老** | `mute_elder` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 睡美人 |
| 87 | **九尾狐** | `nine_tailed_fox` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 九尾狐 |
| 88 | **九尾** | `nine_tails_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青丘夜影 |
| 89 | **老流氓** | `old_rascal` | 好人 | 1 | 部分實作（僅於 advancedRoles.ts 實作免疫狼美人魅惑；尚未實作被毒／被獵人射殺延遲至隔天發言後死亡） | 12 人局 - 狼美人老流氓 |
| 90 | **潘朵拉** | `pandora` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 潘朵拉 |
| 91 | **珀爾修斯** | `perseus` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 梅杜莎之眼 |
| 92 | **怪盜狼王** | `phantom_wolf_king` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 93 | **警犬** | `police_dog` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 94 | **南瓜鬼** | `pumpkin_ghost` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 南瓜鬼 |
| 95 | **傀儡** | `puppet_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 唯鄰是從 |
| 96 | **鏽劍騎士** | `rusty_sword_knight` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 種狼(飯局版) |
| 97 | **影子** | `shadow` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 11 ~ 16 人局 - 影子 & 復仇者 |
| 98 | **睡美人** | `sleeping_beauty` | 第三方 | 1 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 12 人局 - 睡美人 |
| 99 | **雪狼** | `snow_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 10 人局 - 雪狼騎士 |
| 100 | **超級黑市商人** | `super_black_market_merchant` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 超級黑市商人 |
| 101 | **超級守墓人** | `super_gravekeeper` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 南瓜鬼 |
| 102 | **盜賊** | `thief` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 盜賊邱比特 |
| 103 | **詭術師** | `trickster_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 詭術之境 |
| 104 | **搗蛋鬼** | `troublemaker_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 搗蛋鬼 |
| 105 | **雙子** | `twins` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 雙生幻想 |
| 106 | **典獄長** | `warden_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 孤注一擲 |
| 107 | **白夜使者** | `white_night_envoy` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑白使者 |
| 108 | **野孩子** | `wild_child` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 野孩子 |
| 109 | **狼僕** | `wolf_maid` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 一盞榮枯 |
| 110 | **狼術師** | `wolf_warlock` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 魔幻對決 |
| 111 | **狂熱粉** | `fanatic` | 第三方 | 0 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | （未出現於主配置） |

## 五、全板子就緒度總表（共 143 個板子）

### 5.1 已達成「全角色 100% 自動結算」之板子（共 25 個）

| # | 板子名稱 | 板子 ID | 人數 | 配置角色（皆屬清單 A） |
| ---: | --- | --- | ---: | --- |
| 1 | **6 人局 - 經典預獵** | `6p-classic` | 6 | 小狼、平民、預言家、獵人 |
| 2 | **6 人局 - 經典預守** | `6p-classic-2` | 6 | 小狼、平民、預言家、守衛 |
| 3 | **6 人局 - 雲端追捕** | `6p-cloud-pursuit` | 6 | 小狼、狼王、平民、預言家、女巫 |
| 4 | **7 人局 - 生還者** | `7p-survivor` | 7 | 小狼、白狼王、平民、預言家、女巫、獵人、守衛 |
| 5 | **8 人局 - 末日狂徒** | `8p-doomsday-outlaws` | 8 | 小狼、平民、預言家、守衛、騎士 |
| 6 | **9 人局 - 經典** | `9p-classic` | 9 | 小狼、平民、預言家、女巫、獵人 |
| 7 | **10 人局 - 經典** | `10p-classic` | 10 | 小狼、平民、預言家、女巫、獵人 |
| 8 | **10 人局 - 白痴** | `10p-idiot` | 10 | 小狼、平民、預言家、女巫、獵人、白痴 |
| 9 | **10 人局 - 假面之夜** | `10p-masked-wolf` | 10 | 小狼、平民、預言家、女巫、獵人、守衛、白痴 |
| 10 | **10 人局 - 白狼王騎士** | `10p-wolf-king-white-wolf-king-knight` | 10 | 小狼、白狼王、平民、預言家、女巫、守衛、騎士 |
| 11 | **10 人局 - 狼美人騎士** | `10p-wolf-beauty-knight` | 10 | 小狼、狼美人、平民、預言家、女巫、守衛、騎士 |
| 12 | **10 人局 - 機械狼通靈師 / 鏡隱迷蹤** | `10p-mech-wolf-psychic` | 10 | 小狼、機械狼、平民、通靈師、女巫、守衛 |
| 13 | **12 人局 - 經典** | `12p-classic` | 12 | 小狼、平民、預言家、女巫、獵人、白痴 |
| 14 | **12 人局 - 狼王守衛** | `12p-wolf-king-guard` | 12 | 小狼、狼王、平民、預言家、女巫、獵人、守衛 |
| 15 | **12 人局 - 狼王攝夢** | `12p-wolf-king` | 12 | 小狼、狼王、平民、預言家、女巫、獵人、攝夢人 |
| 16 | **12 人局 - 狼王騎士** | `12p-wolf-king-knight` | 12 | 小狼、狼王、平民、預言家、女巫、守衛、騎士 |
| 17 | **12 人局 - 白狼王守衛** | `12p-wolf-king-guard-white-wolf-king` | 12 | 小狼、白狼王、平民、預言家、女巫、獵人、守衛 |
| 18 | **12 人局 - 白狼王騎士** | `12p-wolf-king-white-wolf-king-knight` | 12 | 小狼、白狼王、平民、預言家、女巫、守衛、騎士 |
| 19 | **12 人局 - 狼美人騎士** | `12p-wolf-beauty-knight` | 12 | 小狼、狼美人、平民、預言家、女巫、守衛、騎士 |
| 20 | **12 人局 - 狼美人獵騎** | `12p-wolf-beauty` | 12 | 小狼、狼美人、平民、預言家、女巫、獵人、騎士 |
| 21 | **12 人局 - 狼美人獵守** | `12p-wolf-beauty-2` | 12 | 小狼、狼美人、平民、預言家、女巫、獵人、守衛 |
| 22 | **12 人局 - 機械狼通靈師 / 鏡隱迷蹤** | `12p-mech-wolf-psychic` | 12 | 小狼、機械狼、平民、通靈師、女巫、獵人、守衛 |
| 23 | **12 人局 - 狼女孩** | `12p-wolf-girl` | 12 | 小狼、狼女孩、平民、預言家、毒師、獵人、守衛 |
| 24 | **12 人局 - 盜寶大師** | `12p-treasure-master` | 12 | 小狼、狼王、平民、通靈師、毒師、獵人、攝夢人、蒙面人、盜寶大師 |
| 25 | **娛樂局 - 獵殺潛狼 / 獵人局** | `multi-hunter` | 6 | 小狼、獵人 |

### 5.2 尚待補齊之板子（共 118 個，依缺口角色數由少到多、缺口角色出現頻率由高到低排序）

| # | 板子名稱 | 板子 ID | 人數 | 缺口數 | 缺少之清單 B 角色（括號為該角色總出現板子數） |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | 10 人局 - 混血兒 | `10p-hybrid` | 10 | 1 | **混血兒** `hybrid` (9) |
| 2 | 12 人局 - 混血兒 | `12p-hybrid` | 12 | 1 | **混血兒** `hybrid` (9) |
| 3 | 10 人局 - 夢魘攝夢(網易版) | `10p-nightmare` | 10 | 1 | **夢魘** `nightmare` (8) |
| 4 | 10 人局 - 夢魘攝夢(私版) | `10p-nightmare-2` | 10 | 1 | **夢魘** `nightmare` (8) |
| 5 | 12 人局 - 夢魘守衛 | `12p-guard-nightmare` | 12 | 1 | **夢魘** `nightmare` (8) |
| 6 | 12 人局 - 夢魘攝夢 | `12p-nightmare` | 12 | 1 | **夢魘** `nightmare` (8) |
| 7 | 12 人局 - 種狼(京城版) | `12p-seed-wolf-2` | 12 | 1 | **種狼** `seed_wolf` (7) |
| 8 | 12 人局 - 種狼(私版) | `12p-seed-wolf-4` | 12 | 1 | **種狼** `seed_wolf` (7) |
| 9 | 10 人局 - 隱狼騎士 | `10p-hidden-wolf-knight` | 10 | 1 | **隱狼** `hidden_wolf` (6) |
| 10 | 12 人局 - 熊隱狼 | `12p-hidden-wolf-bear` | 12 | 1 | **隱狼** `hidden_wolf` (6) |
| 11 | 10 人局 - 咒狐 | `10p-cursed-fox` | 10 | 1 | **咒狐** `cursed_fox` (5) |
| 12 | 10 人局 - 奇蹟商人 | `10p-miracle-merchant` | 10 | 1 | **奇蹟商人** `miracle_merchant` (5) |
| 13 | 12 人局 - 狼王魔術師 | `12p-wolf-king-magician` | 12 | 1 | **魔術師** `magician` (5) |
| 14 | 6 人局 - 奇蹟商人 | `6p-miracle-merchant` | 6 | 1 | **奇蹟商人** `miracle_merchant` (5) |
| 15 | 9 人局 - 戰狼騎士 | `9p-war-wolf-knight` | 9 | 1 | **戰狼** `war_wolf` (5) |
| 16 | 12 人局 - 快言快語 | `12p-board-1ak9dbq` | 12 | 1 | **惡靈騎士** `evil_knight` (3) |
| 17 | 12 人局 - 惡靈騎士 | `12p-evil-knight-knight` | 12 | 1 | **惡靈騎士** `evil_knight` (3) |
| 18 | 8 人局 - 諸神黃昏 | `8p-ragnarok` | 8 | 1 | **惡靈騎士** `evil_knight` (3) |
| 19 | 10 人局 - 覺醒孤獨少女 | `10p-awakened-lonely-girl` | 10 | 1 | **覺醒孤獨少女** `awakened_lonely_girl` (2) |
| 20 | 12 人局 - 覺醒孤獨少女 | `12p-awakened-lonely-girl` | 12 | 1 | **覺醒孤獨少女** `awakened_lonely_girl` (2) |
| 21 | 12 人局 - 惡魔 | `12p-demon-wolf` | 12 | 1 | **惡魔** `demon_wolf` (2) |
| 22 | 12 人局 - 開膛手傑克 (第二身分) | `12p-jack-the-ripper-2` | 12 | 1 | **惡魔** `demon_wolf` (2) |
| 23 | 10 人局 - 雪狼騎士 | `10p-snow-wolf-knight` | 10 | 1 | **雪狼** `snow_wolf` (1) |
| 24 | 12 人局 - 黑蝙蝠 | `12p-black-bat` | 12 | 1 | **黑蝙蝠** `black_bat` (1) |
| 25 | 12 人局 - 孤注一擲 | `12p-board-19vcnl0` | 12 | 1 | **典獄長** `warden_wolf` (1) |
| 26 | 12 人局 - 針鋒相槓 | `12p-board-1gwfsm6` | 12 | 1 | **槓精** `contrarian` (1) |
| 27 | 12 人局 - 邪惡商人 | `12p-evil-merchant` | 12 | 1 | **邪惡商人** `evil_merchant` (1) |
| 28 | 12 人局 - 鬼魂新娘 | `12p-ghost-bride` | 12 | 1 | **鬼魂新娘** `ghost_bride` (1) |
| 29 | 12 人局 - 開膛手傑克 | `12p-jack-the-ripper` | 12 | 1 | **開膛手傑克** `jack_the_ripper` (1) |
| 30 | 12 人局 - 燈影 | `12p-lantern-shadow` | 12 | 1 | **燈影預言家** `lantern_seer` (1) |
| 31 | 12 人局 - 唯鄰是從 | `12p-neighbor-only` | 12 | 1 | **傀儡** `puppet_wolf` (1) |
| 32 | 12 人局 - 九尾狐 | `12p-nine-tails-wolf-nine-tailed-fox` | 12 | 1 | **九尾狐** `nine_tailed_fox` (1) |
| 33 | 12 人局 - 酒鬼預言家 | `12p-seer-drunk-seer` | 12 | 1 | **酒鬼預言家** `drunk_seer` (1) |
| 34 | 12 人局 - 超級黑市商人 | `12p-super-black-market-merchant-black-market-merchant` | 12 | 1 | **超級黑市商人** `super_black_market_merchant` (1) |
| 35 | 12 人局 - 搗蛋鬼 | `12p-troublemaker-wolf` | 12 | 1 | **搗蛋鬼** `troublemaker_wolf` (1) |
| 36 | 12 人局 - 雙生幻想 | `12p-twin-fantasy` | 12 | 1 | **雙子** `twins` (1) |
| 37 | 12 人局 - 野孩子 | `12p-wild-child` | 12 | 1 | **野孩子** `wild_child` (1) |
| 38 | 12 人局 - 狼美人老流氓 | `12p-wolf-beauty-old-rascal` | 12 | 1 | **老流氓** `old_rascal` (1) |
| 39 | 12 人局 - 百變狼王 | `12p-wolf-king-chameleon-wolf-king` | 12 | 1 | **百變狼王** `chameleon_wolf_king` (1) |
| 40 | 9 人局 - 潘朵拉 | `9p-pandora` | 9 | 1 | **潘朵拉** `pandora` (1) |
| 41 | 10 人局 - 血月獵魔 | `10p-board-13wywxf` | 10 | 2 | **獵魔人** `demon_hunter` (8)、**血月使徒** `blood_moon_apostle` (3) |
| 42 | 12 人局 - 刺客獵魔 | `12p-assassin-wolf` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**刺客** `assassin_wolf` (1) |
| 43 | 12 人局 - 血月獵魔 | `12p-board-1fid5th` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**血月使徒** `blood_moon_apostle` (3) |
| 44 | 12 人局 - 夢魘惑心 | `12p-nightmare-2` | 12 | 2 | **夢魘** `nightmare` (8)、**蠱惑師** `enchanter` (2) |
| 45 | 12 人局 - 戰狼獵魔 | `12p-war-wolf` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**戰狼** `war_wolf` (5) |
| 46 | 娛樂局 - 連連看 | `multi-lianliankan` | 10 | 2 | **獵魔人** `demon_hunter` (8)、**尋香魅影** `scent_phantom` (3) |
| 47 | 12 人局 - 種狼(娛百版) | `12p-seed-wolf-3` | 12 | 2 | **種狼** `seed_wolf` (7)、**隱狼** `hidden_wolf` (6) |
| 48 | 9 人局 - 種狼 | `9p-seed-wolf` | 9 | 2 | **種狼** `seed_wolf` (7)、**高級平民** `senior_villager` (3) |
| 49 | 10 人局 - 獵日逐光 | `10p-board-11aiiid` | 10 | 2 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5) |
| 50 | 12 人局 - 獵日逐光 | `12p-board-1cvwref` | 12 | 2 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5) |
| 51 | 12 人局 - 烏鴉咒狐 | `12p-crow-cursed-fox` | 12 | 2 | **烏鴉** `crow` (6)、**咒狐** `cursed_fox` (5) |
| 52 | 12 人局 - 烏鴉隱狼 | `12p-hidden-wolf-crow` | 12 | 2 | **烏鴉** `crow` (6)、**隱狼** `hidden_wolf` (6) |
| 53 | 10 人局 - 永序之輪 | `10p-board-10c9sqq` | 10 | 2 | **蝕時狼妃** `time_eclipse_consort` (5)、**定序王子** `sequence_prince` (3) |
| 54 | 10 人局 - 尋香識命 | `10p-board-yjr1j3` | 10 | 2 | **覺醒預言家** `awakened_seer` (5)、**尋香魅影** `scent_phantom` (3) |
| 55 | 10 人局 - 覺醒狼王奇商 | `10p-wolf-king-awakened-wolf-king` | 10 | 2 | **奇蹟商人** `miracle_merchant` (5)、**覺醒狼王** `awakened_wolf_king` (4) |
| 56 | 10 人局 - 殭屍 | `10p-zombie` | 10 | 2 | **魔術師** `magician` (5)、**殭屍** `zombie` (2) |
| 57 | 12 人局 - 尋香識命 | `12p-board-1a55af5` | 12 | 2 | **覺醒預言家** `awakened_seer` (5)、**尋香魅影** `scent_phantom` (3) |
| 58 | 12 人局 - 永序之輪 | `12p-board-1bxo1ms` | 12 | 2 | **蝕時狼妃** `time_eclipse_consort` (5)、**定序王子** `sequence_prince` (3) |
| 59 | 12 人局 - 魔幻對決 | `12p-board-1hvme02` | 12 | 2 | **魔術師** `magician` (5)、**狼術師** `wolf_warlock` (1) |
| 60 | 12 人局 - 通靈者 | `12p-medium` | 12 | 2 | **戰狼** `war_wolf` (5)、**通靈者** `medium` (1) |
| 61 | 12 人局 - 鬧鬧派對 | `12p-noisy-party` | 12 | 2 | **河豚** `pufferfish` (5)、**血月使徒** `blood_moon_apostle` (3) |
| 62 | 12 人局 - 覺醒狼王奇商 | `12p-wolf-king-awakened-wolf-king` | 12 | 2 | **奇蹟商人** `miracle_merchant` (5)、**覺醒狼王** `awakened_wolf_king` (4) |
| 63 | 12 人局 - 殭屍 | `12p-zombie` | 12 | 2 | **魔術師** `magician` (5)、**殭屍** `zombie` (2) |
| 64 | 10 人局 - 純白夜影 | `10p-board-12kdffu` | 10 | 2 | **純白之女** `pure_white_maiden` (4)、**狼巫** `wolf_witch` (3) |
| 65 | 10 人局 - 迷霧鴉影 | `10p-misty-crow` | 10 | 2 | **狼鴉之爪** `wolf_raven_claw` (4)、**煉金魔女** `alchemy_witch` (3) |
| 66 | 10 人局 - 覺醒女巫 | `10p-witch-awakened-witch` | 10 | 2 | **覺醒狼王** `awakened_wolf_king` (4)、**覺醒女巫** `awakened_witch` (2) |
| 67 | 12 人局 - 純白夜影 | `12p-board-1e5robw` | 12 | 2 | **純白之女** `pure_white_maiden` (4)、**狼巫** `wolf_witch` (3) |
| 68 | 12 人局 - 石像鬼守墓人 | `12p-gargoyle-gravekeeper` | 12 | 2 | **守墓人** `gravekeeper` (4)、**石像鬼** `gargoyle` (3) |
| 69 | 12 人局 - 迷霧鴉影 | `12p-misty-crow` | 12 | 2 | **狼鴉之爪** `wolf_raven_claw` (4)、**煉金魔女** `alchemy_witch` (3) |
| 70 | 12 人局 - 覺醒女巫 | `12p-witch-awakened-witch` | 12 | 2 | **覺醒狼王** `awakened_wolf_king` (4)、**覺醒女巫** `awakened_witch` (2) |
| 71 | 10 人局 - 暗夜星辰 | `10p-board-zm108y` | 10 | 2 | **覺醒狼美人** `awakened_wolf_beauty` (3)、**覺醒獵人** `awakened_hunter` (2) |
| 72 | 10 人局 - 時波之亂 | `10p-board-znal43` | 10 | 2 | **寂夜導師** `silent_night_mentor` (3)、**白晝學者** `daylight_scholar` (2) |
| 73 | 12 人局 - 暗夜星辰 | `12p-board-1b7f950` | 12 | 2 | **覺醒狼美人** `awakened_wolf_beauty` (3)、**覺醒獵人** `awakened_hunter` (2) |
| 74 | 12 人局 - 時波之亂 | `12p-board-1b8ou05` | 12 | 2 | **寂夜導師** `silent_night_mentor` (3)、**白晝學者** `daylight_scholar` (2) |
| 75 | 12 人局 - 盜賊邱比特 | `12p-cupid-thief` | 12 | 2 | **邱比特** `cupid` (3)、**盜賊** `thief` (1) |
| 76 | 12 人局 - 胡夫地平線 | `12p-khufu-horizon` | 12 | 2 | **煉金魔女** `alchemy_witch` (3)、**阿努比斯** `anubis` (1) |
| 77 | 10 人局 - 猩紅蜂舞 | `10p-board-11cingk` | 10 | 2 | **蜂之狂獵** `bee_wild_hunt` (2)、**猩紅狼王** `scarlet_wolf_king` (2) |
| 78 | 10 人局 - 覺醒之夜 | `10p-board-149pwdx` | 10 | 2 | **覺醒白痴** `awakened_idiot` (2)、**夜之貴族** `night_noble` (2) |
| 79 | 12 人局 - 猩紅蜂舞 | `12p-board-1cxwwcm` | 12 | 2 | **蜂之狂獵** `bee_wild_hunt` (2)、**猩紅狼王** `scarlet_wolf_king` (2) |
| 80 | 12 人局 - 狼兄弟守衛 | `12p-guard-wolf-brother` | 12 | 2 | **狼兄** `wolf_brother` (2)、**狼弟** `wolf_younger_brother` (2) |
| 81 | 12 人局 - 小女孩大野狼 | `12p-big-bad-wolf-little-girl` | 12 | 2 | **大野狼** `big_bad_wolf` (1)、**小女孩** `little_girl` (1) |
| 82 | 12 人局 - 大灰狼占卜師 | `12p-big-grey-wolf-fortune-teller` | 12 | 2 | **大灰狼** `big_grey_wolf` (1)、**占卜師** `fortune_teller` (1) |
| 83 | 12 人局 - 一盞榮枯 | `12p-board-18851fx` | 12 | 2 | **管家** `butler` (1)、**狼僕** `wolf_maid` (1) |
| 84 | 12 人局 - 青丘夜影 | `12p-board-1hb0a89` | 12 | 2 | **白澤** `bai_ze` (1)、**九尾** `nine_tails_wolf` (1) |
| 85 | 12 人局 - 黑白使者 | `12p-board-1iex5ls` | 12 | 2 | **黑夜使者** `dark_night_envoy` (1)、**白夜使者** `white_night_envoy` (1) |
| 86 | 12 人局 - 自曝愚言家 | `12p-fool-seer` | 12 | 2 | **愚言家** `fool_seer` (1)、**鐵好人** `iron_good` (1) |
| 87 | 12 人局 - 假面舞會 | `12p-masked-wolf` | 12 | 2 | **舞者** `dancer` (1)、**假面** `masked_wolf` (1) |
| 88 | 12 人局 - 梅杜莎之眼 | `12p-medusa` | 12 | 2 | **梅杜莎** `medusa` (1)、**珀爾修斯** `perseus` (1) |
| 89 | 12 人局 - 名媛 | `12p-socialite` | 12 | 3 | **混血兒** `hybrid` (9)、**戰狼** `war_wolf` (5)、**名媛** `socialite` (3) |
| 90 | 11 ~ 16 人局 - 影子 & 復仇者 | `multi-avenger-shadow` | 12 | 3 | **混血兒** `hybrid` (9)、**復仇者** `avenger` (1)、**影子** `shadow` (1) |
| 91 | 12 人局 - 覺醒之夜 | `12p-board-1fv459z` | 12 | 3 | **獵魔人** `demon_hunter` (8)、**覺醒白痴** `awakened_idiot` (2)、**夜之貴族** `night_noble` (2) |
| 92 | 12 人局 - 月靈狼 | `12p-moon-spirit-wolf` | 12 | 3 | **夢魘** `nightmare` (8)、**名媛** `socialite` (3)、**月靈狼** `moon_spirit_wolf` (1) |
| 93 | 9 人局 - 眾神之戰 | `9p-board-kxb4iz` | 9 | 3 | **種狼** `seed_wolf` (7)、**企鵝** `penguin` (3)、**名媛** `socialite` (3) |
| 94 | 12 人局 - 無目之夜 | `12p-board-1cnivrg` | 12 | 3 | **隱狼** `hidden_wolf` (6)、**狼鴉之爪** `wolf_raven_claw` (4)、**石像鬼** `gargoyle` (3) |
| 95 | 9 人局 - 動物園 | `9p-board-e9uyvs` | 9 | 3 | **烏鴉** `crow` (6)、**企鵝** `penguin` (3)、**兔兔** `bunny` (2) |
| 96 | 10 人局 - 動物夢境 | `10p-animal-dream` | 10 | 3 | **河豚** `pufferfish` (5)、**羊駝** `alpaca` (3)、**子狐** `fox_cub` (2) |
| 97 | 10 人局 - 風聲諜影 | `10p-wind-espionage` | 10 | 3 | **河豚** `pufferfish` (5)、**覺醒石像鬼** `awakened_gargoyle` (4)、**白貓** `white_cat` (3) |
| 98 | 12 人局 - 詭術之境 | `12p-board-1fwxong` | 12 | 3 | **魔術師** `magician` (5)、**定序王子** `sequence_prince` (3)、**詭術師** `trickster_wolf` (1) |
| 99 | 10 人局 - 覺石覺攝 | `10p-board-1468z48` | 10 | 3 | **覺醒石像鬼** `awakened_gargoyle` (4)、**守墓人** `gravekeeper` (4)、**覺醒攝夢人** `awakened_dream_catcher` (2) |
| 100 | 12 人局 - 覺石覺攝 | `12p-board-1frn80a` | 12 | 3 | **覺醒石像鬼** `awakened_gargoyle` (4)、**守墓人** `gravekeeper` (4)、**覺醒攝夢人** `awakened_dream_catcher` (2) |
| 101 | 12 人局 - 南瓜鬼 | `12p-pumpkin-ghost` | 12 | 3 | **石像鬼** `gargoyle` (3)、**南瓜鬼** `pumpkin_ghost` (1)、**超級守墓人** `super_gravekeeper` (1) |
| 102 | 12 人局 - 狼兄弟黑市 | `12p-wolf-brother` | 12 | 3 | **狼兄** `wolf_brother` (2)、**狼弟** `wolf_younger_brother` (2)、**黑市商人** `black_market_merchant` (1) |
| 103 | 12 人局 - 偵探怪盜 | `12p-detective` | 12 | 3 | **偵探** `detective` (1)、**怪盜狼王** `phantom_wolf_king` (1)、**警犬** `police_dog` (1) |
| 104 | 12 人局 - 睡美人 | `12p-sleeping-beauty` | 12 | 3 | **異族王子** `exotic_prince` (1)、**禁言長老** `mute_elder` (1)、**睡美人** `sleeping_beauty` (1) |
| 105 | 10 人局 - 雲端追蹤 | `10p-board-15uqrqo` | 10 | 4 | **混血兒** `hybrid` (9)、**覺醒預言家** `awakened_seer` (5)、**咒狐** `cursed_fox` (5)、**純白之女** `pure_white_maiden` (4) |
| 106 | 12 人局 - 風聲諜影 | `12p-wind-espionage` | 12 | 4 | **混血兒** `hybrid` (9)、**河豚** `pufferfish` (5)、**覺醒石像鬼** `awakened_gargoyle` (4)、**白貓** `white_cat` (3) |
| 107 | 12 人局 - 種狼(飯局版) | `12p-seed-wolf` | 12 | 4 | **種狼** `seed_wolf` (7)、**高級平民** `senior_villager` (3)、**狐狸** `fox` (2)、**鏽劍騎士** `rusty_sword_knight` (1) |
| 108 | 12 人局 - 狼美人惑騎 | `12p-wolf-beauty-3` | 12 | 4 | **種狼** `seed_wolf` (7)、**戰狼** `war_wolf` (5)、**高級平民** `senior_villager` (3)、**蠱惑師** `enchanter` (2) |
| 109 | 10 人局 - 千年之戀 | `10p-board-x6xglu` | 10 | 4 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**白蛇預言家** `white_snake_seer` (2)、**許仙尋香魅影** `xu_xian_phantom` (2) |
| 110 | 12 人局 - 千年之戀 | `12p-board-18sbphw` | 12 | 4 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**白蛇預言家** `white_snake_seer` (2)、**許仙尋香魅影** `xu_xian_phantom` (2) |
| 111 | 12 人局 - 動物園 | `12p-board-1g1jcg` | 12 | 4 | **烏鴉** `crow` (6)、**企鵝** `penguin` (3)、**兔兔** `bunny` (2)、**狐狸** `fox` (2) |
| 112 | 12 人局 - 動物夢境 | `12p-animal-dream` | 12 | 4 | **河豚** `pufferfish` (5)、**羊駝** `alpaca` (3)、**白貓** `white_cat` (3)、**子狐** `fox_cub` (2) |
| 113 | 12 人局 - 青青草原 | `12p-board-1hlxijo` | 12 | 4 | **羊駝** `alpaca` (3)、**灰太狼** `grey_wolf_boss` (1)、**喜羊羊** `happy_sheep` (1)、**小小灰** `little_grey_wolf` (1) |
| 114 | 10 人局 - 邱比特奇緣 | `10p-cupid` | 10 | 5 | **混血兒** `hybrid` (9)、**夢魘** `nightmare` (8)、**烏鴉** `crow` (6)、**蝕時狼妃** `time_eclipse_consort` (5)、**邱比特** `cupid` (3) |
| 115 | 12 人局 - 無目之城 | `12p-board-1cnivi6` | 12 | 5 | **獵魔人** `demon_hunter` (8)、**蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**狼鴉之爪** `wolf_raven_claw` (4)、**寂夜導師** `silent_night_mentor` (3) |
| 116 | 12 人局 - 雲端探查 | `12p-board-1hfx9f2` | 12 | 6 | **混血兒** `hybrid` (9)、**隱狼** `hidden_wolf` (6)、**覺醒預言家** `awakened_seer` (5)、**咒狐** `cursed_fox` (5)、**守墓人** `gravekeeper` (4)、**純白之女** `pure_white_maiden` (4) |
| 117 | 12 人局 - 邱比特奇緣 | `12p-cupid` | 12 | 6 | **混血兒** `hybrid` (9)、**夢魘** `nightmare` (8)、**烏鴉** `crow` (6)、**蝕時狼妃** `time_eclipse_consort` (5)、**邱比特** `cupid` (3)、**狼巫** `wolf_witch` (3) |
| 118 | 12 人局 - 沙龍之夜 | `12p-salon-night` | 12 | 7 | **獵魔人** `demon_hunter` (8)、**蝕日侍女** `eclipse_maid` (6)、**覺醒預言家** `awakened_seer` (5)、**咒狐** `cursed_fox` (5)、**奇蹟商人** `miracle_merchant` (5)、**蝕時狼妃** `time_eclipse_consort` (5)、**覺醒狼美人** `awakened_wolf_beauty` (3) |

---

*自動稽核校驗：共盤點 143 / 143 個板子、130 / 130 個角色，0 筆遺漏。高頻角色摘要（Top 5）：混血兒(9板)、獵魔人(8板)、夢魘(8板)、種狼(7板)、烏鴉(6板)。*
