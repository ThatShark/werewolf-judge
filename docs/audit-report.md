# 全量板子與角色實作覆蓋率體檢表

> 本報告由 `scripts/generateAuditReport.ts` 自動掃描 `src/logic/`（`nightResolution.ts`、`dayResolution.ts`、`mechWolf.ts`、`advancedRoles.ts`、`wolfGirl.ts`、`treasureMaster.ts`、`victory.ts`）、`src/data/roles.ts` 與 `src/data/boards.ts` 生成。

## 一、全量健康與覆蓋率總覽

| 指標項目 | 數值 | 佔比 / 說明 |
| --- | ---: | --- |
| 板子總數（`ALL_BOARDS`） | **143** | 與 `docs/boards-raw.md` 原文對帳 100% 一致 |
| 角色總數（`ROLE_LIST`） | **130** | 涵蓋狼人、好人、第三方陣營全部不重複角色 |
| 清單 A：全自動結算角色 | **43** | 佔總角色數 33.1% |
| 清單 B：僅台詞提示／需手動調整角色 | **87** | 佔總角色數 66.9%（含 1 名部分實作角色） |
| 已達成「全角色 100% 自動結算」板子 | **54 / 143** | 佔總板子數 37.8% |
| 尚待補齊之板子（含至少 1 名清單 B 角色） | **89 / 143** | 缺 1 角色：30 個板子 ／ 缺 2 角色：41 個板子 ／ 缺 3 角色：12 個板子 ／ 缺 4 角色：4 個板子 ／ 缺 5 角色：2 個板子 |

## 二、高優先度補齊排行榜（Top 15 熱門清單 B 角色）

優先依「**補完後可立刻解鎖 100% 自動結算的板子數（僅差 1 角色）**」與「**總出現板子數**」排序，方便規劃下一批規則引擎實作順序：

| 排名 | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 補齊可立即解鎖板子數 | 可立即解鎖之板子（僅差此角色） |
| ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | **烏鴉** | `crow` | 好人 | 6 | **2** | 12 人局 - 烏鴉咒狐、12 人局 - 烏鴉隱狼 |
| 2 | **奇蹟商人** | `miracle_merchant` | 好人 | 5 | **2** | 10 人局 - 奇蹟商人、6 人局 - 奇蹟商人 |
| 3 | **覺醒石像鬼** | `awakened_gargoyle` | 狼人 | 4 | **2** | 10 人局 - 覺石覺攝、12 人局 - 覺石覺攝 |
| 4 | **尋香魅影** | `scent_phantom` | 狼人 | 3 | **2** | 10 人局 - 尋香識命、12 人局 - 尋香識命 |
| 5 | **覺醒孤獨少女** | `awakened_lonely_girl` | 第三方 | 2 | **2** | 10 人局 - 覺醒孤獨少女、12 人局 - 覺醒孤獨少女 |
| 6 | **魔術師** | `magician` | 好人 | 5 | **1** | 12 人局 - 狼王魔術師 |
| 7 | **戰狼** | `war_wolf` | 狼人 | 5 | **1** | 9 人局 - 戰狼騎士 |
| 8 | **狼鴉之爪** | `wolf_raven_claw` | 狼人 | 4 | **1** | 12 人局 - 無目之夜 |
| 9 | **名媛** | `socialite` | 好人 | 3 | **1** | 12 人局 - 月靈狼 |
| 10 | **蠱惑師** | `enchanter` | 好人 | 2 | **1** | 12 人局 - 夢魘惑心 |
| 11 | **黑蝙蝠** | `black_bat` | 狼人 | 1 | **1** | 12 人局 - 黑蝙蝠 |
| 12 | **百變狼王** | `chameleon_wolf_king` | 狼人 | 1 | **1** | 12 人局 - 百變狼王 |
| 13 | **槓精** | `contrarian` | 好人 | 1 | **1** | 12 人局 - 針鋒相槓 |
| 14 | **邪惡商人** | `evil_merchant` | 狼人 | 1 | **1** | 12 人局 - 邪惡商人 |
| 15 | **鬼魂新娘** | `ghost_bride` | 第三方 | 1 | **1** | 12 人局 - 鬼魂新娘 |

## 三、清單 A：全自動結算角色（共 43 個）

以下角色皆已在 `src/logic/` 完整實作自動生死／技能／查驗／勝負結算（依出現板子數由高到低排序）：

| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 對應邏輯模組（`src/logic/`） | 已實作自動結算機制 |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | **小狼** | `wolf` | 狼人 | 130 | `nightResolution.ts`, `dayResolution.ts`, `mechWolf.ts`, `advancedRoles.ts`, `wolfGirl.ts`, `treasureMaster.ts`, `topFiveRoles.ts`, `inspectionRoles.ts`, `victory.ts` | 狼刀結算、狼刀在先、白天自爆與當晚點刀後死亡、勝負計算 |
| 2 | **平民** | `villager` | 好人 | 126 | `wolfGirl.ts`, `treasureMaster.ts`, `inspectionRoles.ts`, `victory.ts` | 平民邊屠邊計數、狼女孩表白平民同勝判定、盜寶大師底牌分類 |
| 3 | **女巫** | `witch` | 好人 | 126 | `nightResolution.ts`, `mechWolf.ts`, `inspectionRoles.ts` | 解藥／毒藥互斥、自救規則（首夜／全程／不可）、同守同救奶穿、封鎖獵人與狼王開槍 |
| 4 | **預言家** | `seer` | 好人 | 119 | `nightResolution.ts`, `mechWolf.ts`, `inspectionRoles.ts` | 夜間陣營查驗（好人／狼人） |
| 5 | **獵人** | `hunter` | 好人 | 80 | `dayResolution.ts`, `topFiveRoles.ts`, `inspectionRoles.ts` | 夜死／放逐／狼王開槍觸發開槍資格、被毒或愛情破裂禁止開槍、連鎖開槍結算 |
| 6 | **守衛** | `guard` | 好人 | 58 | `nightResolution.ts`, `mechWolf.ts`, `inspectionRoles.ts` | 夜間守護防狼刀、不可連守、同守同救奶穿判定 |
| 7 | **狼王** | `wolf_king` | 狼人 | 29 | `dayResolution.ts`, `topFiveRoles.ts`, `inspectionRoles.ts` | 夜死／放逐／獵人槍擊開槍資格、自爆／被毒／最後一狼禁止開槍、連鎖開槍結算 |
| 8 | **攝夢人** | `dream_catcher` | 好人 | 21 | `nightResolution.ts`, `advancedRoles.ts`, `inspectionRoles.ts` | 每晚攝夢免疫夜間傷害、連夢致死、攝夢人夜死牽連共死 |
| 9 | **白痴** | `idiot` | 好人 | 18 | `dayResolution.ts`, `victory.ts` | 白天首次放逐翻牌免死失投票權、追刀規則開關（idiotNeedsExtraKill） |
| 10 | **騎士** | `knight` | 好人 | 16 | `dayResolution.ts` | 白天翻牌決鬥（限一次）：撞狼對方直接出局且無技能並立刻入夜；撞好人騎士自死 |
| 11 | **熊** | `bear` | 好人 | 14 | `advancedRoles.ts` | 天亮自動檢查存活左右鄰居是否含狼（含機械狼學習後偽裝）並輸出咆哮結果 |
| 12 | **狼美人** | `wolf_beauty` | 狼人 | 12 | `nightResolution.ts`, `dayResolution.ts`, `advancedRoles.ts`, `inspectionRoles.ts` | 每晚魅惑（不可自魅／連魅／魅老流氓）、不可自刀自爆、非騎士決鬥出局時對象殉情且無技能 |
| 13 | **混血兒** | `hybrid` | 第三方 | 9 | `mechWolf.ts`, `topFiveRoles.ts`, `victory.ts` | 首夜選榜樣綁定陣營（含榜樣被感染同步更新）、預言家查驗恆金水、不計入狼人數量與預設不計入屠邊人數 |
| 14 | **白狼王** | `white_wolf_king` | 狼人 | 9 | `dayResolution.ts` | 白天翻牌自爆立即帶走一名玩家（對象無技能）、強制入夜、當晚點刀後死亡 |
| 15 | **夢魘** | `nightmare` | 狼人 | 8 | `topFiveRoles.ts`, `inspectionRoles.ts` | 每晚恐懼一人（不可連恐／次夜起禁恐狼隊友）、恐懼狼人整晚空刀、阻斷預／女／守／通／攝夢／熊與獵人夜死開槍 |
| 16 | **通靈師** | `psychic` | 好人 | 8 | `nightResolution.ts`, `mechWolf.ts`, `inspectionRoles.ts` | 夜間真實身分查驗（含機械狼學習前後與盜寶大師底牌變身） |
| 17 | **種狼** | `seed_wolf` | 狼人 | 7 | `topFiveRoles.ts` | 整局限一次狼刀轉感染（女巫顯示空刀、守衛可擋感染）、目標當晚轉狼並即時失能、即時更新屠邊與感染隱狼轉查殺 |
| 18 | **隱狼** | `hidden_wolf` | 狼人 | 6 | `dayResolution.ts`, `mechWolf.ts`, `topFiveRoles.ts` | 不可自爆、預言家查驗恆金水（通靈師驗隱狼）、場上其他狼人全滅自動入隊帶刀、屠邊須連同隱狼淘汰 |
| 19 | **覺醒預言家** | `awakened_seer` | 好人 | 5 | `nightResolution.ts`, `inspectionRoles.ts` | 每晚雙目標陣營查驗（雙金水／疑似狼人，可查自己），支援隱狼／雪狼／咒狐交互 |
| 20 | **咒狐** | `cursed_fox` | 第三方 | 5 | `mechWolf.ts`, `inspectionRoles.ts`, `victory.ts` | 免疫狼刀、被陣營查驗顯示金水但死亡（攝夢保護不死）、被通靈師／純白驗為咒狐不死、結算時存活或同出局單獨勝 |
| 21 | **機械狼** | `mech_wolf` | 狼人 | 5 | `dayResolution.ts`, `mechWolf.ts`, `advancedRoles.ts`, `inspectionRoles.ts` | 首夜學習身分、通靈師查驗偽裝、次夜起機械盾／單毒／通靈／入隊雙刀、不可自爆、自動入狼隊 |
| 22 | **守墓人** | `gravekeeper` | 好人 | 4 | `inspectionRoles.ts` | 第二晚起自動顯示上一白天放逐出局者陣營（隱狼／南瓜鬼／雪狼顯狼、咒狐顯好人） |
| 23 | **純白之女** | `pure_white_maiden` | 好人 | 4 | `nightResolution.ts`, `inspectionRoles.ts` | 每晚查驗真實身分，第二晚起查驗狼人陣營使其當晚死亡（含機械狼學習偽裝與咒狐不死特例） |
| 24 | **惡靈騎士** | `evil_knight` | 狼人 | 3 | `dayResolution.ts`, `topFiveRoles.ts` | 不可自刀自爆、免疫夜間毒藥與夜死獵人開槍（白天放逐獵人可開槍）、一次性反傷（同晚同毒同驗依先行動者反傷） |
| 25 | **石像鬼** | `gargoyle` | 狼人 | 3 | `dayResolution.ts`, `mechWolf.ts`, `inspectionRoles.ts` | 不可自爆、初始不入狼隊（其餘狼全滅自動入隊帶刀）、每晚查驗具體真實身分並留存紀錄供南瓜鬼繼承 |
| 26 | **高級平民** | `senior_villager` | 好人 | 3 | `inspectionRoles.ts` | 平民邊，第一天死訊公布後自動公布高級平民座號（若首夜遭種狼感染轉狼則不公布） |
| 27 | **狼巫** | `wolf_witch` | 狼人 | 3 | `nightResolution.ts`, `inspectionRoles.ts` | 隨狼隊刀人與自爆、每晚單獨查驗真實身分，第二晚起查驗純白之女使其當晚死亡（同晚互驗依狼刀在先） |
| 28 | **覺醒攝夢人** | `awakened_dream_catcher` | 好人 | 2 | `inspectionRoles.ts` | 每晚夢語一人免疫夜傷（不奶穿、不可連選、夜死不牽連），當晚最後自動判定是否行動並於第二晚起可選擇夢語出局且封技能 |
| 29 | **惡魔** | `demon_wolf` | 狼人 | 2 | `dayResolution.ts`, `inspectionRoles.ts` | 不可自刀自爆、免疫所有夜間傷害（毒藥／夜死獵人開槍）、每晚查驗非狼玩家為神職或平民 |
| 30 | **狐狸** | `fox` | 好人 | 2 | `nightResolution.ts`, `inspectionRoles.ts` | 每晚查驗目標及其左右存活鄰居（共 3 人）是否含狼；三人皆好人則永久失去查驗功能 |
| 31 | **毒師** | `poisoner` | 好人 | 2 | `nightResolution.ts`, `inspectionRoles.ts` | 夜間單瓶毒藥結算、機械盾可擋、封鎖獵人與狼王開槍 |
| 32 | **酒鬼預言家** | `drunk_seer` | 好人 | 1 | `nightResolution.ts`, `inspectionRoles.ts` | 平民邊、每晚陣營查驗結果隨機（支援法官手動覆寫金水／查殺），維持預言家 A／B 盲叫 |
| 33 | **愚言家** | `fool_seer` | 好人 | 1 | `nightResolution.ts`, `inspectionRoles.ts` | 每晚陣營查驗，白天發言階段可隨時翻牌自曝淘汰自己強制入夜（上警吞警徽） |
| 34 | **鐵好人** | `iron_good` | 好人 | 1 | `inspectionRoles.ts` | 平民邊、白天發言階段可隨時翻牌自曝淘汰自己強制入夜（上警吞警徽） |
| 35 | **燈影預言家** | `lantern_seer` | 好人 | 1 | `nightResolution.ts`, `inspectionRoles.ts` | 平民邊、每晚陣營查驗結果自動反轉（好↔狼），維持預言家 A／B 盲叫不洩密 |
| 36 | **蒙面人** | `masked_villager` | 好人 | 1 | `nightResolution.ts`, `treasureMaster.ts` | 夜間遭狼刀／毒藥／攝夢負傷延遲至隔日發言後出局、白天結算解除負傷並重算勝負 |
| 37 | **月靈狼** | `moon_spirit_wolf` | 狼人 | 1 | `inspectionRoles.ts` | 隨狼隊刀人與自爆；每晚狼隊行動前自動感知左右存活鄰居是否含神職並輸出嗥叫結果（遭夢魘恐懼不嗥叫） |
| 38 | **九尾狐** | `nine_tailed_fox` | 好人 | 1 | `inspectionRoles.ts` | 初始 9 條尾巴，依已公布死訊扣尾（神 -2、民 -1、狼不減，不含當晚未公布死訊），歸零自動死亡 |
| 39 | **南瓜鬼** | `pumpkin_ghost` | 狼人 | 1 | `mechWolf.ts`, `inspectionRoles.ts` | 石像鬼死前預言家驗金水、死後轉查殺（守墓人恆驗狼），石像鬼出局後自動繼承歷史查驗紀錄與驗人能力 |
| 40 | **雪狼** | `snow_wolf` | 狼人 | 1 | `mechWolf.ts`, `inspectionRoles.ts` | 正常狼刀與自爆；被預言家／覺醒預言家／愚言家查驗恆顯示好人（金水） |
| 41 | **超級守墓人** | `super_gravekeeper` | 好人 | 1 | `nightResolution.ts`, `inspectionRoles.ts` | 第二晚起得知上一白天放逐者陣營、每晚指定繼承者；出局當晚好人繼承者自動接手全部歷史放逐紀錄與後續查驗 |
| 42 | **盜寶大師** | `treasure_master` | 第三方 | 1 | `nightResolution.ts`, `mechWolf.ts`, `treasureMaster.ts`, `victory.ts` | 首夜 3 底牌合法性與陣營歸屬、每晚切底牌且不可連選、通靈師查驗偽裝、盜寶狼入隊與最後一狼蒙面免放逐 |
| 43 | **狼女孩** | `wolf_girl` | 狼人 | 1 | `wolfGirl.ts` | 首夜向非狼表白（表白平民成功同勝）、白天或放逐後自爆觸發愛情破裂帶走表白對象並作廢投票 |

## 四、清單 B：僅台詞提示／需法官手動調整角色（共 87 個）

以下角色目前於夜間僅走睜閉眼提示（`confirm_only` 或共用狼刀步驟）或無完整自動結算邏輯，須由法官搭配「座位總覽／手動標記」輔助裁定（**依出現板子頻率由高到低排序**）：

| # | 角色名稱 | 角色 ID | 陣營 | 出現板子數 | 現況說明 | 出現板子清單 |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | **獵魔人** | `demon_hunter` | 好人 | 8 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 血月獵魔、12 人局 - 血月獵魔、12 人局 - 刺客獵魔、12 人局 - 戰狼獵魔、12 人局 - 覺醒之夜、12 人局 - 無目之城、12 人局 - 沙龍之夜、娛樂局 - 連連看 |
| 2 | **烏鴉** | `crow` | 好人 | 6 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 動物園、10 人局 - 邱比特奇緣、12 人局 - 烏鴉隱狼、12 人局 - 動物園、12 人局 - 邱比特奇緣、12 人局 - 烏鴉咒狐 |
| 3 | **蝕日侍女** | `eclipse_maid` | 狼人 | 6 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 獵日逐光、10 人局 - 千年之戀、12 人局 - 獵日逐光、12 人局 - 無目之城、12 人局 - 沙龍之夜、12 人局 - 千年之戀 |
| 4 | **魔術師** | `magician` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 殭屍、12 人局 - 狼王魔術師、12 人局 - 詭術之境、12 人局 - 魔幻對決、12 人局 - 殭屍 |
| 5 | **奇蹟商人** | `miracle_merchant` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 6 人局 - 奇蹟商人、10 人局 - 奇蹟商人、10 人局 - 覺醒狼王奇商、12 人局 - 覺醒狼王奇商、12 人局 - 沙龍之夜 |
| 6 | **河豚** | `pufferfish` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 動物夢境、10 人局 - 風聲諜影、12 人局 - 動物夢境、12 人局 - 鬧鬧派對、12 人局 - 風聲諜影 |
| 7 | **流光伯爵** | `radiant_earl` | 好人 | 5 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 獵日逐光、10 人局 - 千年之戀、12 人局 - 獵日逐光、12 人局 - 無目之城、12 人局 - 千年之戀 |
| 8 | **蝕時狼妃** | `time_eclipse_consort` | 狼人 | 5 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 永序之輪、10 人局 - 邱比特奇緣、12 人局 - 永序之輪、12 人局 - 邱比特奇緣、12 人局 - 沙龍之夜 |
| 9 | **戰狼** | `war_wolf` | 狼人 | 5 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 9 人局 - 戰狼騎士、12 人局 - 戰狼獵魔、12 人局 - 狼美人惑騎、12 人局 - 名媛、12 人局 - 通靈者 |
| 10 | **覺醒石像鬼** | `awakened_gargoyle` | 狼人 | 4 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 覺石覺攝、10 人局 - 風聲諜影、12 人局 - 覺石覺攝、12 人局 - 風聲諜影 |
| 11 | **覺醒狼王** | `awakened_wolf_king` | 狼人 | 4 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒狼王奇商、10 人局 - 覺醒女巫、12 人局 - 覺醒狼王奇商、12 人局 - 覺醒女巫 |
| 12 | **狼鴉之爪** | `wolf_raven_claw` | 狼人 | 4 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 迷霧鴉影、12 人局 - 迷霧鴉影、12 人局 - 無目之夜、12 人局 - 無目之城 |
| 13 | **煉金魔女** | `alchemy_witch` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 迷霧鴉影、12 人局 - 迷霧鴉影、12 人局 - 胡夫地平線 |
| 14 | **羊駝** | `alpaca` | 好人 | 3 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 10 人局 - 動物夢境、12 人局 - 動物夢境、12 人局 - 青青草原 |
| 15 | **覺醒狼美人** | `awakened_wolf_beauty` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 暗夜星辰、12 人局 - 暗夜星辰、12 人局 - 沙龍之夜 |
| 16 | **血月使徒** | `blood_moon_apostle` | 狼人 | 3 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 10 人局 - 血月獵魔、12 人局 - 血月獵魔、12 人局 - 鬧鬧派對 |
| 17 | **邱比特** | `cupid` | 第三方 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 邱比特奇緣、12 人局 - 盜賊邱比特、12 人局 - 邱比特奇緣 |
| 18 | **企鵝** | `penguin` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 眾神之戰、9 人局 - 動物園、12 人局 - 動物園 |
| 19 | **尋香魅影** | `scent_phantom` | 狼人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 尋香識命、12 人局 - 尋香識命、娛樂局 - 連連看 |
| 20 | **定序王子** | `sequence_prince` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 永序之輪、12 人局 - 詭術之境、12 人局 - 永序之輪 |
| 21 | **寂夜導師** | `silent_night_mentor` | 狼人 | 3 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 時波之亂、12 人局 - 時波之亂、12 人局 - 無目之城 |
| 22 | **名媛** | `socialite` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 眾神之戰、12 人局 - 名媛、12 人局 - 月靈狼 |
| 23 | **白貓** | `white_cat` | 好人 | 3 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 風聲諜影、12 人局 - 動物夢境、12 人局 - 風聲諜影 |
| 24 | **覺醒獵人** | `awakened_hunter` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 暗夜星辰、12 人局 - 暗夜星辰 |
| 25 | **覺醒白痴** | `awakened_idiot` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒之夜、12 人局 - 覺醒之夜 |
| 26 | **覺醒孤獨少女** | `awakened_lonely_girl` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒孤獨少女、12 人局 - 覺醒孤獨少女 |
| 27 | **覺醒女巫** | `awakened_witch` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒女巫、12 人局 - 覺醒女巫 |
| 28 | **蜂之狂獵** | `bee_wild_hunt` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 猩紅蜂舞、12 人局 - 猩紅蜂舞 |
| 29 | **兔兔** | `bunny` | 好人 | 2 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 9 人局 - 動物園、12 人局 - 動物園 |
| 30 | **白晝學者** | `daylight_scholar` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 時波之亂、12 人局 - 時波之亂 |
| 31 | **蠱惑師** | `enchanter` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 夢魘惑心、12 人局 - 狼美人惑騎 |
| 32 | **子狐** | `fox_cub` | 好人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 動物夢境、12 人局 - 動物夢境 |
| 33 | **夜之貴族** | `night_noble` | 狼人 | 2 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 10 人局 - 覺醒之夜、12 人局 - 覺醒之夜 |
| 34 | **猩紅狼王** | `scarlet_wolf_king` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 10 人局 - 猩紅蜂舞、12 人局 - 猩紅蜂舞 |
| 35 | **白蛇預言家** | `white_snake_seer` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 千年之戀、12 人局 - 千年之戀 |
| 36 | **狼兄** | `wolf_brother` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 狼兄弟守衛、12 人局 - 狼兄弟黑市 |
| 37 | **狼弟** | `wolf_younger_brother` | 狼人 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 狼兄弟守衛、12 人局 - 狼兄弟黑市 |
| 38 | **許仙尋香魅影** | `xu_xian_phantom` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 千年之戀、12 人局 - 千年之戀 |
| 39 | **殭屍** | `zombie` | 第三方 | 2 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 10 人局 - 殭屍、12 人局 - 殭屍 |
| 40 | **阿努比斯** | `anubis` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 胡夫地平線 |
| 41 | **刺客** | `assassin_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 刺客獵魔 |
| 42 | **復仇者** | `avenger` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 11 ~ 16 人局 - 影子 & 復仇者 |
| 43 | **白澤** | `bai_ze` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 青丘夜影 |
| 44 | **大野狼** | `big_bad_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 小女孩大野狼 |
| 45 | **大灰狼** | `big_grey_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 大灰狼占卜師 |
| 46 | **黑蝙蝠** | `black_bat` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑蝙蝠 |
| 47 | **黑市商人** | `black_market_merchant` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 狼兄弟黑市 |
| 48 | **管家** | `butler` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 一盞榮枯 |
| 49 | **百變狼王** | `chameleon_wolf_king` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 百變狼王 |
| 50 | **槓精** | `contrarian` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 針鋒相槓 |
| 51 | **舞者** | `dancer` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 假面舞會 |
| 52 | **黑夜使者** | `dark_night_envoy` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑白使者 |
| 53 | **偵探** | `detective` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 54 | **邪惡商人** | `evil_merchant` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 邪惡商人 |
| 55 | **異族王子** | `exotic_prince` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 睡美人 |
| 56 | **占卜師** | `fortune_teller` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 大灰狼占卜師 |
| 57 | **鬼魂新娘** | `ghost_bride` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 鬼魂新娘 |
| 58 | **灰太狼** | `grey_wolf_boss` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 59 | **喜羊羊** | `happy_sheep` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 60 | **開膛手傑克** | `jack_the_ripper` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 開膛手傑克 |
| 61 | **小女孩** | `little_girl` | 好人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 小女孩大野狼 |
| 62 | **小小灰** | `little_grey_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青青草原 |
| 63 | **假面** | `masked_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 假面舞會 |
| 64 | **通靈者** | `medium` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 通靈者 |
| 65 | **梅杜莎** | `medusa` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 梅杜莎之眼 |
| 66 | **禁言長老** | `mute_elder` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 睡美人 |
| 67 | **九尾** | `nine_tails_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 青丘夜影 |
| 68 | **老流氓** | `old_rascal` | 好人 | 1 | 部分實作（僅於 advancedRoles.ts 實作免疫狼美人魅惑；尚未實作被毒／被獵人射殺延遲至隔天發言後死亡） | 12 人局 - 狼美人老流氓 |
| 69 | **潘朵拉** | `pandora` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 9 人局 - 潘朵拉 |
| 70 | **珀爾修斯** | `perseus` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 梅杜莎之眼 |
| 71 | **怪盜狼王** | `phantom_wolf_king` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 72 | **警犬** | `police_dog` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 偵探怪盜 |
| 73 | **傀儡** | `puppet_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill），專屬技能需法官手動調整 | 12 人局 - 唯鄰是從 |
| 74 | **鏽劍騎士** | `rusty_sword_knight` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 種狼(飯局版) |
| 75 | **影子** | `shadow` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 11 ~ 16 人局 - 影子 & 復仇者 |
| 76 | **睡美人** | `sleeping_beauty` | 第三方 | 1 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | 12 人局 - 睡美人 |
| 77 | **超級黑市商人** | `super_black_market_merchant` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 超級黑市商人 |
| 78 | **盜賊** | `thief` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 盜賊邱比特 |
| 79 | **詭術師** | `trickster_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 詭術之境 |
| 80 | **搗蛋鬼** | `troublemaker_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 搗蛋鬼 |
| 81 | **雙子** | `twins` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 雙生幻想 |
| 82 | **典獄長** | `warden_wolf` | 狼人 | 1 | 僅夜間睜閉眼台詞（wolf_kill, confirm_only），專屬技能需法官手動調整 | 12 人局 - 孤注一擲 |
| 83 | **白夜使者** | `white_night_envoy` | 好人 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 黑白使者 |
| 84 | **野孩子** | `wild_child` | 第三方 | 1 | 僅夜間睜閉眼台詞（confirm_only），專屬技能需法官手動調整 | 12 人局 - 野孩子 |
| 85 | **狼僕** | `wolf_maid` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 一盞榮枯 |
| 86 | **狼術師** | `wolf_warlock` | 狼人 | 1 | 僅夜間睜閉眼台詞（confirm_only, wolf_kill），專屬技能需法官手動調整 | 12 人局 - 魔幻對決 |
| 87 | **狂熱粉** | `fanatic` | 第三方 | 0 | 無專屬夜間互動步驟（被動／白天／特殊身分規則需法官手動調整） | （未出現於主配置） |

## 五、全板子就緒度總表（共 143 個板子）

### 5.1 已達成「全角色 100% 自動結算」之板子（共 54 個）

| # | 板子名稱 | 板子 ID | 人數 | 配置角色（皆屬清單 A） |
| ---: | --- | --- | ---: | --- |
| 1 | **6 人局 - 經典預獵** | `6p-classic` | 6 | 小狼、平民、預言家、獵人 |
| 2 | **6 人局 - 經典預守** | `6p-classic-2` | 6 | 小狼、平民、預言家、守衛 |
| 3 | **6 人局 - 雲端追捕** | `6p-cloud-pursuit` | 6 | 小狼、狼王、平民、預言家、女巫 |
| 4 | **7 人局 - 生還者** | `7p-survivor` | 7 | 小狼、白狼王、平民、預言家、女巫、獵人、守衛 |
| 5 | **8 人局 - 諸神黃昏** | `8p-ragnarok` | 8 | 狼王、白狼王、惡靈騎士、預言家、女巫、獵人、守衛、白痴 |
| 6 | **8 人局 - 末日狂徒** | `8p-doomsday-outlaws` | 8 | 小狼、平民、預言家、守衛、騎士 |
| 7 | **9 人局 - 經典** | `9p-classic` | 9 | 小狼、平民、預言家、女巫、獵人 |
| 8 | **9 人局 - 種狼** | `9p-seed-wolf` | 9 | 小狼、種狼、平民、高級平民、熊、女巫、獵人 |
| 9 | **10 人局 - 經典** | `10p-classic` | 10 | 小狼、平民、預言家、女巫、獵人 |
| 10 | **10 人局 - 白痴** | `10p-idiot` | 10 | 小狼、平民、預言家、女巫、獵人、白痴 |
| 11 | **10 人局 - 假面之夜** | `10p-masked-wolf` | 10 | 小狼、平民、預言家、女巫、獵人、守衛、白痴 |
| 12 | **10 人局 - 白狼王騎士** | `10p-wolf-king-white-wolf-king-knight` | 10 | 小狼、白狼王、平民、預言家、女巫、守衛、騎士 |
| 13 | **10 人局 - 狼美人騎士** | `10p-wolf-beauty-knight` | 10 | 小狼、狼美人、平民、預言家、女巫、守衛、騎士 |
| 14 | **10 人局 - 雪狼騎士** | `10p-snow-wolf-knight` | 10 | 小狼、雪狼、平民、預言家、女巫、獵人、騎士 |
| 15 | **10 人局 - 隱狼騎士** | `10p-hidden-wolf-knight` | 10 | 小狼、隱狼、平民、預言家、女巫、獵人、騎士 |
| 16 | **10 人局 - 夢魘攝夢(網易版)** | `10p-nightmare` | 10 | 小狼、狼王、夢魘、平民、預言家、女巫、獵人、攝夢人 |
| 17 | **10 人局 - 夢魘攝夢(私版)** | `10p-nightmare-2` | 10 | 小狼、夢魘、平民、預言家、女巫、獵人、攝夢人 |
| 18 | **10 人局 - 機械狼通靈師 / 鏡隱迷蹤** | `10p-mech-wolf-psychic` | 10 | 小狼、機械狼、平民、通靈師、女巫、守衛 |
| 19 | **10 人局 - 純白夜影** | `10p-board-12kdffu` | 10 | 小狼、狼巫、平民、純白之女、女巫、守衛 |
| 20 | **10 人局 - 混血兒** | `10p-hybrid` | 10 | 小狼、平民、預言家、女巫、獵人、混血兒 |
| 21 | **10 人局 - 雲端追蹤** | `10p-board-15uqrqo` | 10 | 狼美人、機械狼、預言家、覺醒預言家、通靈師、純白之女、女巫、獵人、咒狐、混血兒 |
| 22 | **10 人局 - 咒狐** | `10p-cursed-fox` | 10 | 小狼、平民、預言家、女巫、獵人、咒狐 |
| 23 | **12 人局 - 經典** | `12p-classic` | 12 | 小狼、平民、預言家、女巫、獵人、白痴 |
| 24 | **12 人局 - 狼王守衛** | `12p-wolf-king-guard` | 12 | 小狼、狼王、平民、預言家、女巫、獵人、守衛 |
| 25 | **12 人局 - 狼王攝夢** | `12p-wolf-king` | 12 | 小狼、狼王、平民、預言家、女巫、獵人、攝夢人 |
| 26 | **12 人局 - 狼王騎士** | `12p-wolf-king-knight` | 12 | 小狼、狼王、平民、預言家、女巫、守衛、騎士 |
| 27 | **12 人局 - 白狼王守衛** | `12p-wolf-king-guard-white-wolf-king` | 12 | 小狼、白狼王、平民、預言家、女巫、獵人、守衛 |
| 28 | **12 人局 - 白狼王騎士** | `12p-wolf-king-white-wolf-king-knight` | 12 | 小狼、白狼王、平民、預言家、女巫、守衛、騎士 |
| 29 | **12 人局 - 狼美人騎士** | `12p-wolf-beauty-knight` | 12 | 小狼、狼美人、平民、預言家、女巫、守衛、騎士 |
| 30 | **12 人局 - 狼美人獵騎** | `12p-wolf-beauty` | 12 | 小狼、狼美人、平民、預言家、女巫、獵人、騎士 |
| 31 | **12 人局 - 狼美人獵守** | `12p-wolf-beauty-2` | 12 | 小狼、狼美人、平民、預言家、女巫、獵人、守衛 |
| 32 | **12 人局 - 惡靈騎士** | `12p-evil-knight-knight` | 12 | 小狼、惡靈騎士、平民、預言家、女巫、獵人、守衛 |
| 33 | **12 人局 - 快言快語** | `12p-board-1ak9dbq` | 12 | 小狼、狼王、白狼王、惡靈騎士、平民、預言家、女巫、獵人、守衛、白痴 |
| 34 | **12 人局 - 石像鬼守墓人** | `12p-gargoyle-gravekeeper` | 12 | 小狼、石像鬼、平民、預言家、女巫、獵人、守墓人 |
| 35 | **12 人局 - 夢魘攝夢** | `12p-nightmare` | 12 | 小狼、夢魘、平民、預言家、女巫、獵人、攝夢人 |
| 36 | **12 人局 - 夢魘守衛** | `12p-guard-nightmare` | 12 | 小狼、夢魘、平民、預言家、女巫、獵人、守衛 |
| 37 | **12 人局 - 機械狼通靈師 / 鏡隱迷蹤** | `12p-mech-wolf-psychic` | 12 | 小狼、機械狼、平民、通靈師、女巫、獵人、守衛 |
| 38 | **12 人局 - 熊隱狼** | `12p-hidden-wolf-bear` | 12 | 小狼、隱狼、平民、熊、女巫、獵人、白痴 |
| 39 | **12 人局 - 純白夜影** | `12p-board-1e5robw` | 12 | 小狼、狼巫、平民、純白之女、女巫、獵人、守衛 |
| 40 | **12 人局 - 燈影** | `12p-lantern-shadow` | 12 | 小狼、狼王、平民、燈影預言家、預言家、女巫、守衛、騎士 |
| 41 | **12 人局 - 酒鬼預言家** | `12p-seer-drunk-seer` | 12 | 小狼、狼王、平民、酒鬼預言家、預言家、女巫、守衛、騎士 |
| 42 | **12 人局 - 自曝愚言家** | `12p-fool-seer` | 12 | 小狼、狼王、平民、鐵好人、愚言家、女巫、獵人、守衛 |
| 43 | **12 人局 - 種狼(京城版)** | `12p-seed-wolf-2` | 12 | 小狼、種狼、平民、預言家、女巫、守衛、騎士 |
| 44 | **12 人局 - 種狼(娛百版)** | `12p-seed-wolf-3` | 12 | 小狼、種狼、隱狼、平民、預言家、女巫、獵人、守衛 |
| 45 | **12 人局 - 種狼(私版)** | `12p-seed-wolf-4` | 12 | 小狼、種狼、平民、預言家、女巫、獵人、守衛 |
| 46 | **12 人局 - 九尾狐** | `12p-nine-tails-wolf-nine-tailed-fox` | 12 | 小狼、平民、預言家、女巫、獵人、九尾狐 |
| 47 | **12 人局 - 惡魔** | `12p-demon-wolf` | 12 | 小狼、惡魔、平民、預言家、女巫、獵人、守衛 |
| 48 | **12 人局 - 狼女孩** | `12p-wolf-girl` | 12 | 小狼、狼女孩、平民、預言家、毒師、獵人、守衛 |
| 49 | **12 人局 - 南瓜鬼** | `12p-pumpkin-ghost` | 12 | 小狼、石像鬼、南瓜鬼、平民、預言家、女巫、獵人、超級守墓人 |
| 50 | **12 人局 - 開膛手傑克 (第二身分)** | `12p-jack-the-ripper-2` | 12 | 小狼、惡魔、平民、預言家、女巫、獵人、守衛 |
| 51 | **12 人局 - 混血兒** | `12p-hybrid` | 12 | 小狼、平民、預言家、女巫、獵人、守衛、混血兒 |
| 52 | **12 人局 - 雲端探查** | `12p-board-1hfx9f2` | 12 | 狼美人、機械狼、隱狼、預言家、覺醒預言家、通靈師、純白之女、女巫、獵人、守墓人、咒狐、混血兒 |
| 53 | **12 人局 - 盜寶大師** | `12p-treasure-master` | 12 | 小狼、狼王、平民、通靈師、毒師、獵人、攝夢人、蒙面人、盜寶大師 |
| 54 | **娛樂局 - 獵殺潛狼 / 獵人局** | `multi-hunter` | 6 | 小狼、獵人 |

### 5.2 尚待補齊之板子（共 89 個，依缺口角色數由少到多、缺口角色出現頻率由高到低排序）

| # | 板子名稱 | 板子 ID | 人數 | 缺口數 | 缺少之清單 B 角色（括號為該角色總出現板子數） |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | 12 人局 - 烏鴉咒狐 | `12p-crow-cursed-fox` | 12 | 1 | **烏鴉** `crow` (6) |
| 2 | 12 人局 - 烏鴉隱狼 | `12p-hidden-wolf-crow` | 12 | 1 | **烏鴉** `crow` (6) |
| 3 | 10 人局 - 奇蹟商人 | `10p-miracle-merchant` | 10 | 1 | **奇蹟商人** `miracle_merchant` (5) |
| 4 | 12 人局 - 狼王魔術師 | `12p-wolf-king-magician` | 12 | 1 | **魔術師** `magician` (5) |
| 5 | 6 人局 - 奇蹟商人 | `6p-miracle-merchant` | 6 | 1 | **奇蹟商人** `miracle_merchant` (5) |
| 6 | 9 人局 - 戰狼騎士 | `9p-war-wolf-knight` | 9 | 1 | **戰狼** `war_wolf` (5) |
| 7 | 10 人局 - 覺石覺攝 | `10p-board-1468z48` | 10 | 1 | **覺醒石像鬼** `awakened_gargoyle` (4) |
| 8 | 12 人局 - 無目之夜 | `12p-board-1cnivrg` | 12 | 1 | **狼鴉之爪** `wolf_raven_claw` (4) |
| 9 | 12 人局 - 覺石覺攝 | `12p-board-1frn80a` | 12 | 1 | **覺醒石像鬼** `awakened_gargoyle` (4) |
| 10 | 10 人局 - 尋香識命 | `10p-board-yjr1j3` | 10 | 1 | **尋香魅影** `scent_phantom` (3) |
| 11 | 12 人局 - 尋香識命 | `12p-board-1a55af5` | 12 | 1 | **尋香魅影** `scent_phantom` (3) |
| 12 | 12 人局 - 月靈狼 | `12p-moon-spirit-wolf` | 12 | 1 | **名媛** `socialite` (3) |
| 13 | 10 人局 - 覺醒孤獨少女 | `10p-awakened-lonely-girl` | 10 | 1 | **覺醒孤獨少女** `awakened_lonely_girl` (2) |
| 14 | 12 人局 - 覺醒孤獨少女 | `12p-awakened-lonely-girl` | 12 | 1 | **覺醒孤獨少女** `awakened_lonely_girl` (2) |
| 15 | 12 人局 - 夢魘惑心 | `12p-nightmare-2` | 12 | 1 | **蠱惑師** `enchanter` (2) |
| 16 | 12 人局 - 黑蝙蝠 | `12p-black-bat` | 12 | 1 | **黑蝙蝠** `black_bat` (1) |
| 17 | 12 人局 - 孤注一擲 | `12p-board-19vcnl0` | 12 | 1 | **典獄長** `warden_wolf` (1) |
| 18 | 12 人局 - 針鋒相槓 | `12p-board-1gwfsm6` | 12 | 1 | **槓精** `contrarian` (1) |
| 19 | 12 人局 - 邪惡商人 | `12p-evil-merchant` | 12 | 1 | **邪惡商人** `evil_merchant` (1) |
| 20 | 12 人局 - 鬼魂新娘 | `12p-ghost-bride` | 12 | 1 | **鬼魂新娘** `ghost_bride` (1) |
| 21 | 12 人局 - 開膛手傑克 | `12p-jack-the-ripper` | 12 | 1 | **開膛手傑克** `jack_the_ripper` (1) |
| 22 | 12 人局 - 唯鄰是從 | `12p-neighbor-only` | 12 | 1 | **傀儡** `puppet_wolf` (1) |
| 23 | 12 人局 - 種狼(飯局版) | `12p-seed-wolf` | 12 | 1 | **鏽劍騎士** `rusty_sword_knight` (1) |
| 24 | 12 人局 - 超級黑市商人 | `12p-super-black-market-merchant-black-market-merchant` | 12 | 1 | **超級黑市商人** `super_black_market_merchant` (1) |
| 25 | 12 人局 - 搗蛋鬼 | `12p-troublemaker-wolf` | 12 | 1 | **搗蛋鬼** `troublemaker_wolf` (1) |
| 26 | 12 人局 - 雙生幻想 | `12p-twin-fantasy` | 12 | 1 | **雙子** `twins` (1) |
| 27 | 12 人局 - 野孩子 | `12p-wild-child` | 12 | 1 | **野孩子** `wild_child` (1) |
| 28 | 12 人局 - 狼美人老流氓 | `12p-wolf-beauty-old-rascal` | 12 | 1 | **老流氓** `old_rascal` (1) |
| 29 | 12 人局 - 百變狼王 | `12p-wolf-king-chameleon-wolf-king` | 12 | 1 | **百變狼王** `chameleon_wolf_king` (1) |
| 30 | 9 人局 - 潘朵拉 | `9p-pandora` | 9 | 1 | **潘朵拉** `pandora` (1) |
| 31 | 10 人局 - 血月獵魔 | `10p-board-13wywxf` | 10 | 2 | **獵魔人** `demon_hunter` (8)、**血月使徒** `blood_moon_apostle` (3) |
| 32 | 12 人局 - 刺客獵魔 | `12p-assassin-wolf` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**刺客** `assassin_wolf` (1) |
| 33 | 12 人局 - 血月獵魔 | `12p-board-1fid5th` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**血月使徒** `blood_moon_apostle` (3) |
| 34 | 12 人局 - 戰狼獵魔 | `12p-war-wolf` | 12 | 2 | **獵魔人** `demon_hunter` (8)、**戰狼** `war_wolf` (5) |
| 35 | 娛樂局 - 連連看 | `multi-lianliankan` | 10 | 2 | **獵魔人** `demon_hunter` (8)、**尋香魅影** `scent_phantom` (3) |
| 36 | 10 人局 - 獵日逐光 | `10p-board-11aiiid` | 10 | 2 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5) |
| 37 | 12 人局 - 獵日逐光 | `12p-board-1cvwref` | 12 | 2 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5) |
| 38 | 10 人局 - 永序之輪 | `10p-board-10c9sqq` | 10 | 2 | **蝕時狼妃** `time_eclipse_consort` (5)、**定序王子** `sequence_prince` (3) |
| 39 | 10 人局 - 覺醒狼王奇商 | `10p-wolf-king-awakened-wolf-king` | 10 | 2 | **奇蹟商人** `miracle_merchant` (5)、**覺醒狼王** `awakened_wolf_king` (4) |
| 40 | 10 人局 - 殭屍 | `10p-zombie` | 10 | 2 | **魔術師** `magician` (5)、**殭屍** `zombie` (2) |
| 41 | 12 人局 - 永序之輪 | `12p-board-1bxo1ms` | 12 | 2 | **蝕時狼妃** `time_eclipse_consort` (5)、**定序王子** `sequence_prince` (3) |
| 42 | 12 人局 - 魔幻對決 | `12p-board-1hvme02` | 12 | 2 | **魔術師** `magician` (5)、**狼術師** `wolf_warlock` (1) |
| 43 | 12 人局 - 通靈者 | `12p-medium` | 12 | 2 | **戰狼** `war_wolf` (5)、**通靈者** `medium` (1) |
| 44 | 12 人局 - 鬧鬧派對 | `12p-noisy-party` | 12 | 2 | **河豚** `pufferfish` (5)、**血月使徒** `blood_moon_apostle` (3) |
| 45 | 12 人局 - 名媛 | `12p-socialite` | 12 | 2 | **戰狼** `war_wolf` (5)、**名媛** `socialite` (3) |
| 46 | 12 人局 - 狼美人惑騎 | `12p-wolf-beauty-3` | 12 | 2 | **戰狼** `war_wolf` (5)、**蠱惑師** `enchanter` (2) |
| 47 | 12 人局 - 覺醒狼王奇商 | `12p-wolf-king-awakened-wolf-king` | 12 | 2 | **奇蹟商人** `miracle_merchant` (5)、**覺醒狼王** `awakened_wolf_king` (4) |
| 48 | 12 人局 - 殭屍 | `12p-zombie` | 12 | 2 | **魔術師** `magician` (5)、**殭屍** `zombie` (2) |
| 49 | 10 人局 - 迷霧鴉影 | `10p-misty-crow` | 10 | 2 | **狼鴉之爪** `wolf_raven_claw` (4)、**煉金魔女** `alchemy_witch` (3) |
| 50 | 10 人局 - 覺醒女巫 | `10p-witch-awakened-witch` | 10 | 2 | **覺醒狼王** `awakened_wolf_king` (4)、**覺醒女巫** `awakened_witch` (2) |
| 51 | 12 人局 - 迷霧鴉影 | `12p-misty-crow` | 12 | 2 | **狼鴉之爪** `wolf_raven_claw` (4)、**煉金魔女** `alchemy_witch` (3) |
| 52 | 12 人局 - 覺醒女巫 | `12p-witch-awakened-witch` | 12 | 2 | **覺醒狼王** `awakened_wolf_king` (4)、**覺醒女巫** `awakened_witch` (2) |
| 53 | 10 人局 - 暗夜星辰 | `10p-board-zm108y` | 10 | 2 | **覺醒狼美人** `awakened_wolf_beauty` (3)、**覺醒獵人** `awakened_hunter` (2) |
| 54 | 10 人局 - 時波之亂 | `10p-board-znal43` | 10 | 2 | **寂夜導師** `silent_night_mentor` (3)、**白晝學者** `daylight_scholar` (2) |
| 55 | 12 人局 - 暗夜星辰 | `12p-board-1b7f950` | 12 | 2 | **覺醒狼美人** `awakened_wolf_beauty` (3)、**覺醒獵人** `awakened_hunter` (2) |
| 56 | 12 人局 - 時波之亂 | `12p-board-1b8ou05` | 12 | 2 | **寂夜導師** `silent_night_mentor` (3)、**白晝學者** `daylight_scholar` (2) |
| 57 | 12 人局 - 盜賊邱比特 | `12p-cupid-thief` | 12 | 2 | **邱比特** `cupid` (3)、**盜賊** `thief` (1) |
| 58 | 12 人局 - 胡夫地平線 | `12p-khufu-horizon` | 12 | 2 | **煉金魔女** `alchemy_witch` (3)、**阿努比斯** `anubis` (1) |
| 59 | 9 人局 - 眾神之戰 | `9p-board-kxb4iz` | 9 | 2 | **企鵝** `penguin` (3)、**名媛** `socialite` (3) |
| 60 | 10 人局 - 猩紅蜂舞 | `10p-board-11cingk` | 10 | 2 | **蜂之狂獵** `bee_wild_hunt` (2)、**猩紅狼王** `scarlet_wolf_king` (2) |
| 61 | 10 人局 - 覺醒之夜 | `10p-board-149pwdx` | 10 | 2 | **覺醒白痴** `awakened_idiot` (2)、**夜之貴族** `night_noble` (2) |
| 62 | 12 人局 - 猩紅蜂舞 | `12p-board-1cxwwcm` | 12 | 2 | **蜂之狂獵** `bee_wild_hunt` (2)、**猩紅狼王** `scarlet_wolf_king` (2) |
| 63 | 12 人局 - 狼兄弟守衛 | `12p-guard-wolf-brother` | 12 | 2 | **狼兄** `wolf_brother` (2)、**狼弟** `wolf_younger_brother` (2) |
| 64 | 12 人局 - 小女孩大野狼 | `12p-big-bad-wolf-little-girl` | 12 | 2 | **大野狼** `big_bad_wolf` (1)、**小女孩** `little_girl` (1) |
| 65 | 12 人局 - 大灰狼占卜師 | `12p-big-grey-wolf-fortune-teller` | 12 | 2 | **大灰狼** `big_grey_wolf` (1)、**占卜師** `fortune_teller` (1) |
| 66 | 12 人局 - 一盞榮枯 | `12p-board-18851fx` | 12 | 2 | **管家** `butler` (1)、**狼僕** `wolf_maid` (1) |
| 67 | 12 人局 - 青丘夜影 | `12p-board-1hb0a89` | 12 | 2 | **白澤** `bai_ze` (1)、**九尾** `nine_tails_wolf` (1) |
| 68 | 12 人局 - 黑白使者 | `12p-board-1iex5ls` | 12 | 2 | **黑夜使者** `dark_night_envoy` (1)、**白夜使者** `white_night_envoy` (1) |
| 69 | 12 人局 - 假面舞會 | `12p-masked-wolf` | 12 | 2 | **舞者** `dancer` (1)、**假面** `masked_wolf` (1) |
| 70 | 12 人局 - 梅杜莎之眼 | `12p-medusa` | 12 | 2 | **梅杜莎** `medusa` (1)、**珀爾修斯** `perseus` (1) |
| 71 | 11 ~ 16 人局 - 影子 & 復仇者 | `multi-avenger-shadow` | 12 | 2 | **復仇者** `avenger` (1)、**影子** `shadow` (1) |
| 72 | 12 人局 - 覺醒之夜 | `12p-board-1fv459z` | 12 | 3 | **獵魔人** `demon_hunter` (8)、**覺醒白痴** `awakened_idiot` (2)、**夜之貴族** `night_noble` (2) |
| 73 | 10 人局 - 邱比特奇緣 | `10p-cupid` | 10 | 3 | **烏鴉** `crow` (6)、**蝕時狼妃** `time_eclipse_consort` (5)、**邱比特** `cupid` (3) |
| 74 | 12 人局 - 動物園 | `12p-board-1g1jcg` | 12 | 3 | **烏鴉** `crow` (6)、**企鵝** `penguin` (3)、**兔兔** `bunny` (2) |
| 75 | 12 人局 - 邱比特奇緣 | `12p-cupid` | 12 | 3 | **烏鴉** `crow` (6)、**蝕時狼妃** `time_eclipse_consort` (5)、**邱比特** `cupid` (3) |
| 76 | 9 人局 - 動物園 | `9p-board-e9uyvs` | 9 | 3 | **烏鴉** `crow` (6)、**企鵝** `penguin` (3)、**兔兔** `bunny` (2) |
| 77 | 10 人局 - 動物夢境 | `10p-animal-dream` | 10 | 3 | **河豚** `pufferfish` (5)、**羊駝** `alpaca` (3)、**子狐** `fox_cub` (2) |
| 78 | 10 人局 - 風聲諜影 | `10p-wind-espionage` | 10 | 3 | **河豚** `pufferfish` (5)、**覺醒石像鬼** `awakened_gargoyle` (4)、**白貓** `white_cat` (3) |
| 79 | 12 人局 - 詭術之境 | `12p-board-1fwxong` | 12 | 3 | **魔術師** `magician` (5)、**定序王子** `sequence_prince` (3)、**詭術師** `trickster_wolf` (1) |
| 80 | 12 人局 - 風聲諜影 | `12p-wind-espionage` | 12 | 3 | **河豚** `pufferfish` (5)、**覺醒石像鬼** `awakened_gargoyle` (4)、**白貓** `white_cat` (3) |
| 81 | 12 人局 - 狼兄弟黑市 | `12p-wolf-brother` | 12 | 3 | **狼兄** `wolf_brother` (2)、**狼弟** `wolf_younger_brother` (2)、**黑市商人** `black_market_merchant` (1) |
| 82 | 12 人局 - 偵探怪盜 | `12p-detective` | 12 | 3 | **偵探** `detective` (1)、**怪盜狼王** `phantom_wolf_king` (1)、**警犬** `police_dog` (1) |
| 83 | 12 人局 - 睡美人 | `12p-sleeping-beauty` | 12 | 3 | **異族王子** `exotic_prince` (1)、**禁言長老** `mute_elder` (1)、**睡美人** `sleeping_beauty` (1) |
| 84 | 10 人局 - 千年之戀 | `10p-board-x6xglu` | 10 | 4 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**白蛇預言家** `white_snake_seer` (2)、**許仙尋香魅影** `xu_xian_phantom` (2) |
| 85 | 12 人局 - 千年之戀 | `12p-board-18sbphw` | 12 | 4 | **蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**白蛇預言家** `white_snake_seer` (2)、**許仙尋香魅影** `xu_xian_phantom` (2) |
| 86 | 12 人局 - 動物夢境 | `12p-animal-dream` | 12 | 4 | **河豚** `pufferfish` (5)、**羊駝** `alpaca` (3)、**白貓** `white_cat` (3)、**子狐** `fox_cub` (2) |
| 87 | 12 人局 - 青青草原 | `12p-board-1hlxijo` | 12 | 4 | **羊駝** `alpaca` (3)、**灰太狼** `grey_wolf_boss` (1)、**喜羊羊** `happy_sheep` (1)、**小小灰** `little_grey_wolf` (1) |
| 88 | 12 人局 - 無目之城 | `12p-board-1cnivi6` | 12 | 5 | **獵魔人** `demon_hunter` (8)、**蝕日侍女** `eclipse_maid` (6)、**流光伯爵** `radiant_earl` (5)、**狼鴉之爪** `wolf_raven_claw` (4)、**寂夜導師** `silent_night_mentor` (3) |
| 89 | 12 人局 - 沙龍之夜 | `12p-salon-night` | 12 | 5 | **獵魔人** `demon_hunter` (8)、**蝕日侍女** `eclipse_maid` (6)、**奇蹟商人** `miracle_merchant` (5)、**蝕時狼妃** `time_eclipse_consort` (5)、**覺醒狼美人** `awakened_wolf_beauty` (3) |

---

*自動稽核校驗：共盤點 143 / 143 個板子、130 / 130 個角色，0 筆遺漏。高頻角色摘要（Top 5）：獵魔人(8板)、烏鴉(6板)、蝕日侍女(6板)、魔術師(5板)、奇蹟商人(5板)。*
