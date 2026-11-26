# 狼人殺法官系統 — 實際實作規則總表（`docs/implemented-spec.md`）

> **文件性質聲明**：本文件所有內容皆直接由 `src/logic/`、`src/store/gameStore.ts`、`src/data/boards.ts`、`src/components/screens/NightConsoleScreen.tsx` 等可執行程式碼**反向翻譯**整理，**未複製 `docs/boards-raw.md` 或 `src/data/roles.ts` 之規格描述**。批次 A–D 全量修復與測試補齊已完成（29 支測試檔 / 193 個測試全數通過，`tsc -b && vite build` 零錯誤）。

---

## 一、引擎全域結算管線實際邏輯

### 1.1 夜間結算管線（`src/logic/nightResolution.ts` `resolveNight`）

1. **前置檢核與回合初始化（`resolveNight`）**：
   - 若 `firstNightNoWolfKill && round === 1 && draft.wolfTarget !== null` 拋錯，並於 `gameStore.ts`、`nightValidation.ts` 與 `NightConsoleScreen.tsx` 依 `isFirstNightNoWolfKillBoard(board)` 同步傳入與防呆阻斷。
   - 每晚重置暫時狀態：`petrified`、`muted`、`activeMutedSeat`、`activePetrifiedSeat`、`activeTricksterVoteSwap`、`alchemySnakePendingVictimSeat`、`alchemySnakePendingVictimSeats`、`bloodMoonSealActiveTonight`（讀取至區域變數 `bloodMoonSealedGood` 後歸 false）、`pufferfishWolfKilledToday`。
   - 同步第 3 批／第 5 批／第 6 批孤狼入隊狀態（狼兄弟、狼鴉之爪、大灰狼、阿努比斯、蝕日侍女、灰太狼等）。
2. **干擾與前置狀態結算**：
   - 依序結算：睡美人睡眠擴散 → 夢魘恐懼 → 寂夜導師／白晝學者（衝突雙死與增幅第二目標實作＋削弱禁毒但保留女巫解藥）→ 梅杜莎石化 → 企鵝冰凍 → 狐狸／子狐魅惑 → 魔術師與狼術師換位（`applyTargetSwaps` 並記錄 `activeNightSwapPairs` 供夜間獵槍套用）→ 搗蛋鬼耍寶（含 `activeTroublemakerPrankedSeat` 供夜／日開槍自射）→ 蝕時狼妃封鎖 → 煉金魔女未明之霧 → 流光伯爵／黑夜使者／黑蝙蝠庇護 → 典獄長交易（含 `mutualBetraySwap` 雙背叛互換）→ 蝕日侍女／灰太狼／管家狼僕前置評估 → 第 4 批首夜選主／綁定（混血兒、邱比特、尋香魅影、野孩子、覺醒孤獨少女、影子、覺醒石像鬼、鬼魂新娘、開膛手傑克、殭屍、盜賊底牌、盜寶大師選牌）。
3. **守衛／攝夢／女巫／覺醒女巫／毒師行動檢核**：
   - 守衛（含增幅第二目標且不受連守限制）與攝夢人先檢核阻斷與轉向（`redirectSkillTarget`、`trackBlackBatTarget`）。
   - 普通女巫解藥與毒藥嚴格互斥，自救依 `ruleOverrides.witchSelfSave`（`never` / `first_night_only` / `always`）驗證；被寂夜導師／白晝學者削弱時僅禁用毒藥，解藥仍可正常開啟；被增幅時可額外使用第二毒目標 `witchSecondPoisonTarget`。
   - 覺醒女巫（1 解 + 3 毒）須指定 1／2／3 名不重複存活協助者且受 `awakenedWitchHelpersApproved !== false` 門控。
   - 毒師完整受 `isSeatBlockedByInterference`、`isSpecialNightImmune`、反傷檢查，並由 `gameStore.ts` 持久化 `poisonerPoisonUsed` 與 `NightConsoleScreen.tsx` 步驟選取。
4. **狼刀與防護／奶穿結算**：
   - 咒狐（`isCursedFoxSeat`，沙龍之夜攝夢時除外）、夢遊者（`isDreamProtected`）、特殊夜間免疫（流光伯爵／黑夜使者／典獄長交易免疫）免於普通狼刀；全狼沉睡或灰太狼偷小狼時 `effectiveWolfTarget = null`。
   - 合併一般守護集合 `guardedByNormal`（守衛、雙子、奇蹟幸運兒盾、通靈者繼承盾、喜羊羊盾、管家次要目標）與機械盾 `guardedByMech`。
   - **奶穿判定**：若 `anyAntidoteUsed && isGuarded`（含機械盾），觸發 `'milk_pierce'` 致死；若 `!anyAntidoteUsed && !isGuarded`，觸發 `'wolf_kill'` 致死。
   - 依序補結算機械狼雙刀、前日自爆狼延遲死亡、血月／盜寶蒙面最後一狼延遲死亡、刺客、狼鴉之爪（無敵穿透流光庇護等特殊免疫）、狼弟覺醒刀、大灰狼、大野狼、阿努比斯天平（可穿透夢遊保護 `isDreamProtected`）。
5. **狼刀在先提前勝負檢核**：
   - 若 `ruleOverrides.wolfKillPriority` 為 true（預設），於狼刀與查驗完成後先檢查蠱惑師替死／覺醒白痴秘密之身等保命機制再評估 `checkVictory`，避免最後一神被保住卻誤判狼勝。
6. **毒藥、反傷、查驗與後段專屬結算**：
   - 毒藥階段（女巫雙毒、覺醒女巫、毒師、機械狼單毒）處理惡靈騎士／惡魔毒免與一次性反傷（同毒同驗依 `seerActsBeforeWitch` 決斷先行動者）、老流氓延遲死亡、白貓翻牌、蒙面人延遲死亡、九尾／舞者／假面免疫。
   - 查驗階段統一接入 `isSeatBlockedByInterference` 與 `redirectSkillTarget`，結算預言家系、通靈師／純白之女／狼巫／石像鬼／南瓜鬼／狐狸／惡魔／守墓人，並執行純白之女／狼巫／咒狐查驗致死與 `cursedFoxDiedTonight` 追蹤。
   - 後段結算蠱惑師替死／連蠱、名媛殉情、梅杜莎夜死牽連、獵魔人／蜂之狂獵／珀爾修斯（先行處決梅杜莎免連帶）、猩紅之子／覺醒白痴秘密之身／覺醒狼美人替死／猩紅狼王連帶／三商與幸運兒（含 `luckySeerResult` 與各防禦交互）／通靈者（含繼承預言家查驗）／管家與狼僕（含同目標抵銷與效果）／睡美人封毒／白澤神職延遲死亡／小女孩／蝕日侍女（流光反噬＋預通攝獵許仙吞噬）／灰太狼／警犬（含 `policeDogResult`）／怪盜狼王無敵。
   - 最後為所有 `deaths` 呼叫 `checkCanShoot` 計算隔天 `shootEligibilities`（含血月封印與入睡禁槍）。

### 1.2 白天結算管線（`dayResolution.ts`、`voting.ts`、`sheriff.ts`、`gameStore.ts`）

1. **警長競選（`sheriff.ts`）**：0 人上警無警長；1 人自動當選；2 人以上經 `speaking` → `voting`（候選人與退水者不可投）→ 平票進入 `pk_speaking`/`pk_voting`（退水者恢復投票權）→ 再平票警徽流失。
2. **吞警徽規則**：預設 `badgeSwallowRule = 'double_explode'`（首日警上首次自爆延後隔日續選 `deferred_after_first_explode`，第二次自爆吞警徽）；設為 `single_explode` 則首次即吞（含 `12p-fool-seer` 預設單爆）。
3. **放逐投票與免死鏈（`voting.ts` `tallyExileVotes`、`dayResolution.ts` `resolveDayExile`）**：
   - 排除存活清單中之已翻牌白痴與已翻牌覺醒白痴（`idiotRevealed`）、`contrarianSilencedVoterSeat`、遭石化者及 PK 候選人；依 `sheriffVoteWeight`（`1.5` 或 `2`）加權；支援 `extraVotes`（烏鴉 +1）、`butlerVoteBonusSeat`（管家 +1）、`wolfMaidVotePenaltySeat`（狼僕 -1）與 `tricksterVoteSwap`（檢查雙目標皆存活且位於合法投票池／PK 內）。
   - `resolveDayExile` 依序檢查免死：怪盜狼王無敵（已傳入 `finalBatchState`）→ 覺醒狼美人放逐替死 → 盜寶最後一狼蒙面人免死 → 血月最後一狼免死 → 白貓翻牌免死 → 白痴／覺醒白痴首放免死（關閉 `awakenedIdiotSecretActive`）。所有放逐死亡皆寫入 `exiledHistory`（含轉化欄位）並同步 `finalizeDayDeathSync`。
4. **開槍資格與連鎖開槍（`checkCanShoot` / `resolveShoot`）**：
   - 支援 `hunter`、`wolf_king`、`awakened_hunter`（獨立規則：僅受種狼感染阻斷）、`awakened_wolf_king`（2 槍與 `wolfDistributedGuns` 分槍小狼）、`evil_merchant_gun`、`grey_wolf_gun`、`pandora_day_gun`（限放逐出局）與 `lucky_gun`（完整傳入 `thirdPartySpecialState` / `round` / `ruleOverrides` / `boardId`）。
   - `HUNTER_SHOOTABLE_REASONS` 與 `WOLF_KING_SHOOTABLE_REASONS` 已移除 `'white_wolf_king_explode'` 並補入 `'socialite_link'`、`'enchanter_substitute'`、`'enchanter_consecutive'`。
5. **自爆／白狼王自爆／騎士決鬥（`resolveSelfExplode` / `resolveWhiteWolfKingExplode` / `resolveKnightDuel`）**：
   - 自爆：於 `inExileVoteStage` 僅允許 `wolf_girl`（投票後亦可發動）；受偵探當日翻牌阻斷。
   - 騎士決鬥：已於 `DayBurstSkillsPanel.tsx` 與 `resolveKnightDuel` 阻斷上警階段（`sheriff_election`）發動；使用 `isSeatEffectiveWolf` 涵蓋所有轉狼角色（戰狼免疫）且撞狼立刻入夜，並以 `finalizeDayDeathSync` 完整同步狀態。

### 1.3 勝利判定優先序（`victory.ts`）

`checkVictory` 執行順序如下：
1. **第 5 批第三方優先勝利**（`checkThirdPartySpecialVictory`）：潘朵拉「希望之光」全場達標即勝。
2. **第 4 批第三方專屬勝利**（`checkConversionThirdPartyVictory`）：開膛手傑克全場僅剩單一性別（未遭偵探指證敗北）→ 許仙白蛇綁定雙死 → 復仇者刺中未變身影子 → 殭屍感染其餘全場存活者 → 人狼戀／鬼魂新娘三人組／白蛇許仙存活清場屠城。好人／狼人計數已先排除尚未出局之獨立第三方（人狼戀、鬼魂新娘、白蛇許仙），防止提前截胡。
3. **屠邊／屠城計數（`getEffectiveSide` + `countAliveFactions`）**：
   - 種狼感染／覺醒石像鬼轉化／超級黑市變狼／野孩子變狼／覺醒孤獨少女變狼／狼女孩表白平民 `wolfGirlState.alignedWithWolf` 計入 `wolf`；`avenger` 依 `avengerAlignedFaction` 計邊；`twins` 與 `exotic_prince` 已修正為 `villager`；`hybrid` 依 `hybridCountsAsVillager` 計為 `villager` 或 `null`；白澤平民繼承人同時計入 `villager` 與 `god`；已翻牌白痴依 `idiotNeedsExtraKill` 決定是否計入 `god`。
4. **咒狐／睡美人截胡覆蓋**：當好人或狼人任一方達標時，若場上存在存活或本輪同歸之 `cursed_fox`（含全死亡路徑 `cursedFoxDiedThisResolution`），或未被喚醒且存活之 `sleepingBeautySeat`，直接覆蓋判第三方單獨勝。
5. **狼／好勝負**：若 `wolfWon && (!goodWon || ruleOverrides.wolfKillPriority)` 判狼勝；否則 `goodWon` 判好人勝。

### 1.4 預設房規（`DEFAULT_RULE_OVERRIDES` & `getDefaultRuleOverridesForBoard` in `setup.ts`）

- **全域預設**：`witchSelfSave: 'never'`、`enableSheriff: true`、`badgeSwallowRule: 'double_explode'`、`sheriffVoteWeight: 1.5`、`victoryMode: 'slaughter_side'`、`mechWolfForceLearnNight1: true`、`idiotNeedsExtraKill: false`、`wolfKillPriority: true`、`hybridCountsAsVillager: false`。
- **板子特化預設**（`getDefaultRuleOverridesForBoard`）：`10p-cupid` / `12p-cupid` / `12p-cupid-thief` 預設 `victoryMode: 'slaughter_all'`；`12p-hybrid` / `12p-wind-espionage` / `10p-board-15uqrqo` / `12p-board-1hfx9f2` 預設 `hybridCountsAsVillager: true`；`12p-board-1hlxijo` 預設 `witchSelfSave: 'always'`；`multi-avenger-shadow` 預設 `idiotNeedsExtraKill: true`；`12p-fool-seer` 預設 `badgeSwallowRule: 'single_explode'`；且為 6 張首夜無狼刀板子設定 `firstNightNoWolfKill: true`。
- **幸運兒首夜預設**（`DEFAULT_LUCKY_FIRST_NIGHT_SKILLS`）：奇蹟商人（驗／毒／盾全 `true`）、黑市商人（全 `false`）、超級黑市商人（僅槍 `true`，驗／毒 `false`）。

---

## 二、全部 130 個角色實際實作規則總表

> 總計收錄 **130 / 130** 個不重複角色（依邏輯模組分成 9 組條列）。

### 2.1 核心基礎與基礎角色（14 名）

#### 1. 小狼（`wolf`｜狼人陣營 / wolf）
- **觸發時機**：每夜依板子 `nightSchedule` 執行 `wolf_kill`；白天於 `DayAnnouncementScreen.tsx`（含上警、死訊、發言階段）可透過 `DayBurstSkillsPanel` 觸發 `selfExplode`；`DayVoteScreen.tsx`（放逐投票階段）禁用一般狼人自爆（`resolveSelfExplode` 當 `inExileVoteStage === true` 除狼女孩外擋下）。
- **目標限制**：每晚集體選擇存活座位或空刀（`null`）；受 `wolfTeamBlocked`、`fearedSeat`（不可行動）、`firstNightNoWolfKill && round === 1` 阻斷；受占卜師標記（限3人）、煉金魔女未明之霧（限3人且不可空刀）、名媛（強制空刀）及搗蛋鬼／魔術師轉移限制；不可自刀對象含惡靈騎士／惡魔／梅杜莎。
- **免疫／反傷／連帶效果**：狼刀可被守衛、機械狼守衛、幸運兒之盾、攝夢人／覺醒攝夢人 `isDreamProtected`、大胖／白貓／戰狼等技能攔截或延遲；「狼刀在先」（`wolfKillPriority` 預設 `true`，`setup.ts` L70）於 `resolveNight` Step 7 先判定勝利，若狼人已達成屠邊/屠城則直接勝出並中斷後續毒殺與查驗。白天自爆於 `resolveSelfExplode`（L736-745）立即標記 `isAlive: false` 並立即呼叫 `checkVictory`。
- **次數限制**：每夜一次集體點刀；自爆全場一次（立即出局入夜）。
- **勝利條件／查驗判定**：`faction === 'wolf'`，`victory.ts` 計入存活狼人，須全部淘汰方能好人勝利；屠邊或屠城依 `ruleOverrides.victoryMode`；預言家查驗為 `'wolf'`（除特定混血兒或特殊機制影響外）。
- **程式碼定位**：`src/logic/nightResolution.ts L406-435, L1450-1753, L2097-2172; src/logic/nightValidation.ts L107-115; src/logic/dayResolution.ts L697-790; src/logic/victory.ts L27-154; src/logic/factionHelpers.ts L12-58; src/store/gameStore.ts L1490-1690, L2557-2630; src/components/screens/DayAnnouncementScreen.tsx L413-445; src/components/screens/DayVoteScreen.tsx L19-23`
- **未實作／僅手動／斷鏈註記**：1) `gameStore.ts` 與 `NightConsoleScreen.tsx` 未替首夜無狼刀板子傳入 `firstNightNoWolfKill: true`；2) 自爆係立即死亡判勝，非「當晚點刀後才正式死亡」；3) `combatState.wolfDistributedGuns` 分槍小狼尚未接通 `checkCanShoot` 開槍。
- **現有行為測試覆蓋**：強（totalBehaviorHits: 217，橫跨 classic12.test.ts、wolfKingGuard12.test.ts、combatRoles.test.ts、flowBugFixes.test.ts、gameStore.test.ts 等 23 檔，嚴格驗證夜刀、空刀、自刀、狼刀在先、自爆與勝利計數）

#### 2. 平民（`villager`｜好人陣營 / villager）
- **觸發時機**：全程無夜間與白天主動技能，僅參與白天發言與放逐投票。
- **目標限制**：無技能目標。
- **免疫／反傷／連帶效果**：無專屬免疫或連帶技能；在面發牌流程可透過 `finalizePhysicalDealVillagers`（`setup.ts` L613-664）自動將未認領角色座位補齊為平民。
- **次數限制**：無技能次數限制。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'villager'`；`victory.ts` L51-65 計入存活平民數，平民全滅即觸發狼人屠邊勝利（另有部分變體受混血兒或九尾狐影響）；預言家查驗回傳 `'good'`。
- **程式碼定位**：`src/logic/victory.ts L27-154; src/logic/setup.ts L613-664; src/logic/types.ts L3, L496-581; src/store/gameStore.ts L2382`
- **未實作／僅手動／斷鏈註記**：無（純投票與勝利計數角色，全自動支援面發牌自動補民與屠民判定）。
- **現有行為測試覆蓋**：強（在 22 個測試檔中被大量作為平民數量計數、屠民勝利、補牌與預言家查驗之基準斷言，含 classic12.test.ts、setup.test.ts、treasureMaster12.test.ts）

#### 3. 預言家（`seer`｜好人陣營 / god）
- **觸發時機**：每夜依板子 `nightSchedule` 的 `seer_check` 步驟觸發；受 `wolfKillPriority` 影響（若狼刀在先已判狼勝則直接結束夜結算）。
- **目標限制**：每晚可查驗一名存活玩家（`getSeerCheckResult`）；受 `fearedSeat`、干擾封鎖與轉向機制限制。
- **免疫／反傷／連帶效果**：查驗惡靈騎士（L2182, L2260-2270）觸發反傷：若同時無女巫毒則反彈擊殺預言家；查驗黑夜使者護盾目標（L2419）觸發反彈擊殺；可觸發管家對預言家驗證狼人時的擊殺（L3125）；受狼刀在先中斷、恐懼、干擾封鎖（含酒鬼/搗蛋鬼/梅杜莎/血月/黑蝙蝠/時蝕等）影響。
- **次數限制**：每晚一次查驗（無全場次數上限）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；查驗結果呼叫 `getSeerCheckResult` 回傳 `'good'` 或 `'wolf'`（對隱狼、石像鬼、雪狼、混血兒、野孩子等依各角色模組規則區分）。
- **程式碼定位**：`src/logic/nightResolution.ts L1879-1890, L2153, L2182, L2260-2270, L2324, L2419, L2643, L3125, L3490; src/logic/mechWolf.ts; src/logic/inspectionRoles.ts; src/components/screens/NightConsoleScreen.tsx`
- **未實作／僅手動／斷鏈註記**：奇蹟／黑市幸運兒獲得 `seer_check` 時，`resolveNight` 未為其產出對應查驗結果（僅預言家本體與覺醒預言家等有完整結果輸出）。
- **現有行為測試覆蓋**：強（totalBehaviorHits: 73，在 inspectionRoles.test.ts、topFiveRoles.test.ts、advancedRoles.test.ts、flowBugFixes.test.ts 等 19 檔驗證對各特殊狼/第三方之陣營查驗、反傷與干擾互動）

#### 4. 女巫（`witch`｜好人陣營 / god）
- **觸發時機**：每夜依 `nightSchedule` 執行 `witch_action`（位於狼刀之後）；僅在解藥未用完時於 UI `showWolfTargetToWitch` 顯示狼刀對象。
- **目標限制**：解藥僅能針對當晚 `effectiveWolfTarget` 施救，且受 `ruleOverrides.witchSelfSave`（`'never' | 'first_night_only' | 'always'`）限制自救；毒藥不可對自己或死人使用（實作上 `canWitchUsePoison` 僅檢查存活，L278）；同晚解藥與毒藥不可並用（L247, L266）。
- **免疫／反傷／連帶效果**：1) 解藥可救下普通狼刀，但與守衛／機械狼守衛／幸運兒之盾同夜命中同一人會觸發 `milk_pierce` 奶穿（L1721-1736），惟對象受攝夢／覺醒攝夢保護 `isDreamProtected` 時跳過奶穿（L1717）；魔盒之刀（L2824）無視解藥；2) 毒藥擊殺原因為 `'witch_poison'`（屬 `POISON_DEATH_REASONS`），使獵人、狼王死後無法開槍；3) 毒中惡靈騎士反傷、機械狼魔免、獵魔人／大胖／白貓／梅杜莎等依 `isSpecialNightImmune` 與反傷判定（L2188-2215）；4) 受「狼刀在先」（Step 7 先判勝）影響，若狼人先達到勝利條件則當晚毒藥不執行。
- **次數限制**：`witchAntidoteUsed` 與 `witchPoisonUsed` 各限全場一次（單夜互斥，由 `canWitchUseAntidote` 與 `canWitchUsePoison` 阻斷並持久化於 `gameStore.ts`）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職（屠邊計算）；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L225-283, L544-545, L1570-1595, L1717-1736, L2172-2216; src/logic/nightValidation.ts L227-243; src/logic/setup.ts L59-71, L115; src/components/screens/NightConsoleScreen.tsx L411-550, L1463-1496, L2789-2843`
- **未實作／僅手動／斷鏈註記**：1) `nightValidation.ts` L227-235 在 `witchPoisonWeakened` 時把整個女巫步驟鎖定並設 `remainingSkillUses: 0`，導致實戰被削弱無法使用解藥（與 `nightResolution.ts` L1578 邏輯矛盾）；2) 時波之亂女巫被增幅時的第二瓶毒藥（雙目標）尚未在 `NightActionDraft` 與 UI 實作；3) `setup.ts` L115 青青草原板子 ID 誤植導致該板女巫必可自救預設未自動生效。
- **現有行為測試覆蓋**：強（totalBehaviorHits: 76，在 classic12.test.ts、advancedRoles.test.ts、inspectionRoles.test.ts、interferenceRoles.test.ts、playtestFixes.test.ts 等 20 檔驗證解藥、自救、奶穿、雙藥互斥與毒藥禁槍）

#### 5. 獵人（`hunter`｜好人陣營 / god）
- **觸發時機**：死亡出局結算時透過 `checkCanShoot` 加入 `pendingShooters`（包含夜晚死訊階段與白天放逐／連鎖開槍階段，由 `DayAnnouncementScreen.tsx` 與 `DayVoteScreen.tsx` 結算並阻斷推進直至處理完畢）。
- **目標限制**：開槍目標為任一存活玩家（不含已出局者），亦可由法官點擊 `skipShoot` 選擇壓槍不開。
- **免疫／反傷／連帶效果**：被 `POISON_DEATH_REASONS` 毒殺（L174）、被雙攝／夢遊連帶出局（不在 `HUNTER_SHOOTABLE_REASONS`）不可開槍；在夜死檢查中若被恐懼 `fearedSeat`（L160）或正在入夢 `isSeatAsleep`（`nightResolution.ts` L3421）則不可開槍（放逐不鎖恐懼）；可觸發連鎖開槍（射中狼王或另一獵人加入 `pendingShooters`）。開槍本身無視守衛守護（非夜刀結算）。
- **次數限制**：死亡觸發單次開槍或壓槍（無主動次數計數器，依死亡事件觸發）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。開槍帶走目標後即時更新存活數與 `checkVictory`。
- **程式碼定位**：`src/logic/dayResolution.ts L42-56, L93-205, L265-350, L564, L943-950; src/logic/nightResolution.ts L3357, L3413-3425; src/components/screens/DayAnnouncementScreen.tsx L340-375; src/components/common/PendingShooterCard.tsx`
- **未實作／僅手動／斷鏈註記**：1) 嚴重 BUG：`HUNTER_SHOOTABLE_REASONS`（L45）包含 `'white_wolf_king_explode'`，導致獵人被白狼王自爆帶走仍可開槍（與各板子原文及 L818 註解衝突）；2) `resolveShoot`（L268）、`resolveDayExile`（L564）與 `resolveNight`（L3413）呼叫 `checkCanShoot` 漏傳 `boardId`，導致 `multi-hunter` 只要出局即開槍在真實結算失效；3) 跨板「被奶穿／被狼王開槍能否開槍」未依板子變體動態切換。
- **現有行為測試覆蓋**：強（totalBehaviorHits: 46，在 classic12.test.ts、advancedRoles.test.ts、combatRoles.test.ts、deepAuditFixes.test.ts、flowBugFixes.test.ts 等 19 檔驗證放逐/狼刀開槍、毒殺禁槍、夢遊/入睡禁槍、白狼王測試等）

#### 6. 守衛（`guard`｜好人陣營 / god）
- **觸發時機**：每夜依 `nightSchedule` 執行 `guard_protect`（通常先於狼刀）。
- **目標限制**：每晚可守護任一存活玩家（含自己）或空守（`null`）；`canGuardTarget`（`nightResolution.ts` L203-224）禁止與 `lastGuardedSeat` 相同（不得連續兩晚守護同一人）。
- **免疫／反傷／連帶效果**：守護成功抵擋普通狼刀（`wolf_kill`）；但若同時女巫使用解藥救同一人則觸發 `milk_pierce` 奶穿致死（`isDreamProtected` 除外）；不阻擋女巫毒藥、毒師毒藥、惡靈騎士反傷（L2275）、機械狼擊殺／毒殺（L1746）、魔盒之刀或白天騎士決鬥／開槍。受恐懼、干擾封鎖與時蝕鎖定轉向影響。
- **次數限制**：每晚一次守護或空守（不可連續兩晚守同一人）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L203-224, L533, L1278-1308, L1693-1736; src/logic/nightValidation.ts L227-243; src/components/screens/NightConsoleScreen.tsx L536-544, L824-833`
- **未實作／僅手動／斷鏈註記**：1) 時波之亂守衛被增幅時的第二守護目標與「額外守護不受連守限制」尚未在 `NightActionDraft`、`canGuardTarget` 與 `NightConsoleScreen.tsx` 實作（僅 `nightValidation.ts` 顯示次數 2 通知）。
- **現有行為測試覆蓋**：強（totalBehaviorHits: 25，在 wolfKingGuard12.test.ts、mechWolf10.test.ts、deepAuditFixes.test.ts、combatRoles.test.ts 等 11 檔驗證連守禁止、空守、自守、奶穿與機械狼學守衛）

#### 7. 白痴（`idiot`｜好人陣營 / god）
- **觸發時機**：於 `resolveDayExile`（`dayResolution.ts` L494-525）判定最高票放逐對象為未翻牌白痴時自動觸發翻牌免死。
- **目標限制**：無主動指定技能目標（被放逐時被動觸發）。
- **免疫／反傷／連帶效果**：白天放逐出局時自動翻牌免死（`idiotRevealed = true`）並中斷放逐死亡；翻牌後在後續所有 `getEligibleExileVoters`（`voting.ts` L39）及警長選舉投票失去投票權，亦不可成為部分規則（如 `canCrowCurse`、`thirdPartySpecialRoles.ts` L609）的烏鴉詛咒目標；不免疫夜間死亡或開槍／決鬥／自爆帶走。
- **次數限制**：全場一次翻牌免疫放逐（`idiotRevealed` 為布林旗標，不允許二次翻牌）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；若 `ruleOverrides.idiotNeedsExtraKill === false`（預設）且僅餘白痴為已翻牌未追刀神職時，視需求計數處理（`victory.ts` L102-112：翻牌後預設仍不計為可阻擋屠神的未追刀神職或依 `idiotNeedsExtraKill` 需補刀方算全滅）。預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/dayResolution.ts L494-525; src/logic/voting.ts L39, L99; src/logic/victory.ts L102-112; src/logic/setup.ts L71, L111; src/logic/thirdPartySpecialRoles.ts L609`
- **未實作／僅手動／斷鏈註記**：1) `idiotNeedsExtraKill` 僅對 `multi-avenger-shadow` 自動預設開啟，其餘板子需手動於房規設定；2) `NightConsoleScreen.tsx` 烏鴉步驟 UI 未隱藏已翻牌白痴選項（須靠邏輯靜默拒絕）。
- **現有行為測試覆蓋**：中上（totalBehaviorHits: 14，在 classic12.test.ts、dayFlow.test.ts、interferenceRoles.test.ts、thirdPartySpecialRoles.test.ts、gameStore.test.ts 等 9 檔驗證翻牌免放逐、失去投票權、追刀計數與烏鴉禁詛）

#### 8. 騎士（`knight`｜好人陣營 / god）
- **觸發時機**：白天發言流程可經由 `DayBurstSkillsPanel` 觸發 `knightDuel`（呼叫 `resolveKnightDuel`）；目前 UI 錯誤地在上警階段（`sheriff_election`）亦開啟入口，放逐投票階段（`DayVoteScreen`）則未掛載。
- **目標限制**：僅能由存活騎士針對「存活且非自己」的其他玩家發動（`dayResolution.ts` L1030 與 UI L242 過濾自己）；已決鬥過（`knightDuelUsed`）則禁止再次發動。
- **免疫／反傷／連帶效果**：目標為狼人時對方立即死亡（`deathReason: 'knight_duel'`，不可發動死亡技能），並直接切換進入黑夜（`enterNightImmediately: true`）；目標為戰狼（`isWarWolfImmuneToDeath`）或非狼人（好人／第三方）時騎士自己以死謝罪（`knight_suicided`），白天流程繼續。決鬥不受守衛夜守影響。
- **次數限制**：全場限一次，透過 `knightDuelUsed` 布林鎖定（`dayResolution.ts` L1014）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；決鬥結果直接重算 `checkVictory`；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/dayResolution.ts L970-1105; src/store/gameStore.ts L2812-2905; src/components/day/DayBurstSkillsPanel.tsx L232-270; src/components/screens/DayAnnouncementScreen.tsx L413-445`
- **未實作／僅手動／斷鏈註記**：1) `DayAnnouncementScreen.tsx` 與 `DayBurstSkillsPanel.tsx` 未在 `dayStage === 'sheriff_election'` 時阻斷騎士決鬥，`resolveKnightDuel` 也無階段檢查（與所有騎士 QA 相違）；2) `resolveKnightDuel` L1065 使用 `isSeatWolfFaction`，漏判野孩子／覺醒孤獨少女／超級黑市幸運兒等轉狼玩家；3) `gameStore.ts` `knightDuel` 呼叫時未傳 `treasureMasterState` 與完整 `victoryOptions`。
- **現有行為測試覆蓋**：中（totalBehaviorHits: 5，在 advancedRoles.test.ts、flowBugFixes.test.ts、interferenceRoles.test.ts 驗證撞狼入夜、撞好人以死謝罪、只能用一次與戰狼免疫；但缺 `gameStore.ts` 上警禁發動及轉狼對象測試）

#### 9. 狼王（`wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：每夜隨狼隊執行 `wolf_kill`；白天可於放逐投票前自爆；死亡且符合 `WOLF_KING_SHOOTABLE_REASONS` 時加入 `pendingShooters` 開槍。
- **目標限制**：夜晚隨狼隊刀人；白天可自爆（投票階段禁止）；開槍目標為任一存活他座，亦可壓槍。
- **免疫／反傷／連帶效果**：被 `POISON_DEATH_REASONS` 毒殺、自爆（`self_explode`）、夢遊雙攝/連帶，或作為最後一隻狼出局時均不可開槍（L224-245）；開槍帶走目標若為獵人或另一狼王將觸發連鎖開槍（但目前 `WOLF_KING_SHOOTABLE_REASONS` 亦誤含 `white_wolf_king_explode`）。自爆於 `resolveSelfExplode` 立即死亡判勝。
- **次數限制**：每晚集體點刀一次；死亡開槍單次或壓槍；自爆全場一次（且自爆禁止開槍）。
- **勝利條件／查驗判定**：`faction === 'wolf'`，計入存活狼人；預言家查驗為 `'wolf'`。
- **程式碼定位**：`src/logic/dayResolution.ts L57-73, L206-253, L697-790; src/logic/nightResolution.ts L3413-3425; src/logic/topFiveRoles.ts L110; src/store/gameStore.ts L1545-1554, L2557-2630`
- **未實作／僅手動／斷鏈註記**：1) `WOLF_KING_SHOOTABLE_REASONS` 誤含 `'white_wolf_king_explode'`；2) 最後一狼檢查 L224-237 未用 `isSeatEffectiveWolf`，漏計野孩子等轉化狼；3) `checkCanShoot` 未像獵人檢查 `fearedSeat`，且 `nightResolution.ts` L3421 僅對 `hunter` 檢查 `isSeatAsleep`；4) 跨板「被獵人開槍／被奶穿能否開槍」未依板子切換。
- **現有行為測試覆蓋**：中（totalBehaviorHits: 13，在 wolfKingGuard12.test.ts、conversionRoles.test.ts、flowBugFixes.test.ts、treasureMaster12.test.ts、setup.test.ts 驗證狼王被放逐/自刀開槍、毒殺/最後一狼禁開槍）

#### 10. 白狼王（`white_wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：每夜隨狼隊執行 `wolf_kill`；白天非放逐投票階段透過 `DayBurstSkillsPanel` 呼叫 `whiteWolfKingExplode`。
- **目標限制**：夜晚隨狼隊刀人；白天可選擇帶走任一非己存活玩家（或壓技只自爆不帶人 `null`）；放逐投票階段禁止自爆。
- **免疫／反傷／連帶效果**：可選帶走一名存活玩家（`targetSeat !== null`），目標死因記為 `'white_wolf_king_explode'`，但目前 BUG 造成若目標為獵人／狼王會再呼叫 `checkCanShoot` 觸發反槍；於 `resolveWhiteWolfKingExplode` L876-885 立即標記白狼王死亡並即時判定勝利，再立即帶走目標並再次判定勝利（非夜刀後才死亡）。
- **次數限制**：全場一次自爆帶人（出局即結束）。
- **勝利條件／查驗判定**：`faction === 'wolf'`，計入存活狼人；預言家查驗為 `'wolf'`。
- **程式碼定位**：`src/logic/dayResolution.ts L818-965; src/components/day/DayBurstSkillsPanel.tsx; src/store/gameStore.ts`
- **未實作／僅手動／斷鏈註記**：1) 嚴重 BUG：`resolveWhiteWolfKingExplode` L943-950 允許被帶走的獵人／狼王反手開槍，違反全部板子規則與該函式註解；2) 白狼王自爆立即死亡而非當晚狼刀結算後死亡。
- **現有行為測試覆蓋**：弱（totalBehaviorHits: 5，在 advancedRoles.test.ts、flowBugFixes.test.ts、playtestFixes.test.ts 驗證自爆帶走目標與進入黑夜，但未測帶走獵人禁開槍反例）

#### 11. 烏鴉（`crow`｜好人陣營 / god）
- **觸發時機**：每夜依 `nightSchedule` 執行 `crow_curse` 步驟，於 `resolveNight` L2903-2911 更新 `crowActiveCursedSeat`。
- **目標限制**：`canCrowCurse`（`thirdPartySpecialRoles.ts` L594-620）禁止連續兩晚詛咒同一人（`crowLastCursedSeat`）且禁止詛咒已翻牌白痴（`idiotRevealed`），允許對自己使用或不詛咒。
- **免疫／反傷／連帶效果**：被詛咒者（`crowActiveCursedSeat`）於當日白天 `tallyExileVotes` 獲得額外 +1 放逐票（由 `getBatch5ExileExtraVotes` 提供）；每晚開始前重設當日詛咒，但保留 `crowLastCursedSeat` 供次夜防連選。
- **次數限制**：每夜一次詛咒（不可連選同一人）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L2903-2911; src/logic/thirdPartySpecialRoles.ts L594-620; src/logic/voting.ts; src/components/screens/NightConsoleScreen.tsx L1364`
- **未實作／僅手動／斷鏈註記**：1) `NightConsoleScreen.tsx` 的 `crow_curse` 未依 `canCrowCurse` 禁用上晚對象或已翻牌白痴，誤點後在 `nightResolution.ts` L2907 會靜默不生效；2) `nightResolution.ts` L2903 未檢查 `fearedSeat` 或干擾封鎖（梅杜莎/血月/企鵝/削弱）。
- **現有行為測試覆蓋**：極弱（totalBehaviorHits: 1，僅 thirdPartySpecialRoles.test.ts 測到一次 `canCrowCurse` 與白痴禁止，缺多回合連選阻斷、被投票加一票整合與 Store 測試）

#### 12. 毒師（`poisoner`｜好人陣營 / god）
- **觸發時機**：每夜依 `nightSchedule` 執行 `poisoner_poison` 步驟。
- **目標限制**：`canPoisonerUsePoison`（`nightResolution.ts` L285-305）僅檢查尚未用毒與目標存活，允許跳過（`null`）；於 L1663-1678 受 `fearedSeat` 阻斷。
- **免疫／反傷／連帶效果**：毒殺死因記為 `'poisoner_poison'`（屬 `POISON_DEATH_REASONS`），使獵人、狼王死後不能開槍；守衛／機械狼守衛不防毒殺（僅 `mechGuardTarget` 與攝夢保護 `isDreamProtected` 可保命）；受「狼刀在先」中斷（Step 7 先判勝）。缺少與惡靈騎士／獵魔人／大胖／白貓／梅杜莎／干擾封鎖的完整交互判定。
- **次數限制**：全場限用一瓶毒藥（由 `poisonerPoisonUsed` 控制，但 Store 層尚未接線持久化）。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L285-305, L1663-1678, L2217-2235; src/logic/inspectionRoles.ts L870`
- **未實作／僅手動／斷鏈註記**：1) 嚴重遺漏：`gameStore.ts` 全未持久化或傳遞 `poisonerPoisonUsed`（實戰可無限用毒）；2) `NightConsoleScreen.tsx` 完全缺少 `poisoner_poison` UI 接線，法官畫面無法選毒殺目標；3) `nightResolution.ts` 缺干擾封鎖、`isSpecialNightImmune` 與反彈處理。
- **現有行為測試覆蓋**：弱（totalBehaviorHits: 3，僅在 treasureMaster12.test.ts 2 次與 wolfGirl12.test.ts 1 次驗證夜間毒殺、攝夢免疫與二次用毒阻斷；零 Store/UI 測試）

#### 13. 奇蹟商人（`miracle_merchant`｜好人陣營 / god）
- **觸發時機**：於 `nightResolution.ts` L2914-2934 執行 `miracle_merchant_gift`，未限定必須在 `round === 1`（即使板子文字規定首夜）。幸運兒於 L2991-3041（及 L1694 盾）使用贈禮技能。
- **目標限制**：目標必須為存活且非奇蹟商人本人（`draft.miracleMerchantTarget !== aliveMiracle.seatNumber`，L2919），可選品項為 `'seer_check' | 'witch_poison' | 'guard_shield'`。
- **免疫／反傷／連帶效果**：若選中狼人（`isSeatWolfFaction(lucky)`），幸運兒不會獲得技能且奇蹟商人當晚立即以 `'merchant_backfire'` 死亡（除非商人受攝夢保護 `isDreamProtected`，L2927-2930）；若給好人且為 `guard_shield`，當晚守護目標若同時被女巫救則會觸發 `milk_pierce` 奶穿（L1724-1736）。幸運兒獲得技能當晚（第 1 晚）即可使用（`DEFAULT_LUCKY_FIRST_NIGHT_SKILLS.miracle` 全為 `true`）。
- **次數限制**：`miracleMerchantUsed` 全場一次贈禮；`miracleLuckyItemUsed` 全場一次消耗。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L1694-1700, L1724-1736, L2914-2934, L2991-3041; src/logic/thirdPartySpecialRoles.ts L715-760; src/logic/setup.ts L28-32; src/components/screens/NightConsoleScreen.tsx L1736-1780`
- **未實作／僅手動／斷鏈註記**：1) `NightConsoleScreen.tsx` L1736-1752 缺少商人禮物類型選單（預設寫死 `seer_check`），且 `lucky_item_action` 未設定 `luckyItemActorSeat`；2) `nightResolution.ts` L1693-1701 已實作幸運兒 `guard_shield`（含奶穿），L2991-3007 已實作 `witch_poison`（但未接夢遊／惡靈／魔免／魔狼盾），而 `seer_check` 完全未於夜間結算回傳結果；3) 《沙龍之夜》允許保留至第 2 晚選幸運兒與毒藥免咒狐尚未分板處理。
- **現有行為測試覆蓋**：極弱（totalBehaviorHits: 2，僅 flowBugFixes.test.ts 與 thirdPartySpecialRoles.test.ts 各 1 次測試夜結算贈毒與允許回合；零 UI/Store/給盾奶穿/反水死亡/查驗測試）

#### 14. 黑市商人（`black_market_merchant`｜好人陣營 / god）
- **觸發時機**：於 `nightResolution.ts` L2935-2954 執行 `black_market_gift`；幸運兒夜間技能自次夜起可用，`hunter_gun` 應於幸運兒死亡時觸發。
- **目標限制**：目標必須為存活且非黑市商人本人（`draft.blackMarketTarget !== aliveBlackMarket.seatNumber`，L2940），品項為 `'seer_check' | 'witch_poison' | 'hunter_gun'`。
- **免疫／反傷／連帶效果**：若選中狼人（`isSeatWolfFaction(lucky)`），幸運兒不獲技能且黑市商人以 `'merchant_backfire'` 死亡（若受攝夢保護則豁免，L2947-2950）。獲得技能當晚（`round === 1`）預設不可使用（`DEFAULT_LUCKY_FIRST_NIGHT_SKILLS.blackMarket` 全為 `false`），須自次夜／次日起方可使用；不提供 `guard_shield`故無盾奶穿。幸運兒獲 `'hunter_gun'` 於 `checkCanShoot` L98-133 檢查死亡開槍，但被真實結算呼叫處漏傳參數阻斷。
- **次數限制**：`blackMarketMerchantUsed` 全場一次贈禮；`blackMarketLuckyItemUsed` 全場一次消耗。
- **勝利條件／查驗判定**：`faction === 'good'`、`category === 'god'`，計入神職；預言家查驗為 `'good'`。
- **程式碼定位**：`src/logic/nightResolution.ts L2935-2954, L2991-3041; src/logic/dayResolution.ts L98-133; src/logic/thirdPartySpecialRoles.ts L715-760; src/logic/setup.ts L22-27; src/components/screens/NightConsoleScreen.tsx L1736-1780`
- **未實作／僅手動／斷鏈註記**：1) `NightConsoleScreen.tsx` 無贈禮品項選單，寫死 `?? 'seer_check'`；2) `lucky_item_action` 未設定 `luckyItemActorSeat` 導致實戰無法觸發技能；3) `resolveNight` 未實作幸運兒 `seer_check` 結果；4) `gameStore.ts` / `resolveDayExile` / `resolveNight` 呼叫 `checkCanShoot` 時未傳 `thirdPartySpecialState`、`round`、`ruleOverrides`，導致黑市幸運兒拿到獵人槍在實戰永遠無法開槍；5) 未檢查 `round === 1`、封鎖與轉狼反水。
- **現有行為測試覆蓋**：極弱（totalBehaviorHits: 2，僅 flowBugFixes.test.ts 測首夜禁毒與 playtestFixes.test.ts 1 次引用；零給槍實戰開槍、反水死亡、次夜用毒端到端測試）

### 2.2 進階與專板模組角色（9 名）

#### 15. 機械狼（`mech_wolf`｜狼人陣營 / wolf）
- **觸發時機**：第 1 晚進行學習（`mech_wolf_learn`，在通靈師查驗前套用）；第 2 晚起發動所學技能（`mech_wolf_night_action`，僅在未受 `fearedSeat` 恐懼時執行，引擎未阻斷冰凍/石化/子狐）。白天全程禁止自爆（`resolveSelfExplode` 第 636 行）。
- **目標限制**：`canMechWolfLearn`：僅第 1 晚、不可選自己、目標須存活；若 `ruleOverrides.mechWolfForceLearnNight1` 為 `true` 則禁止傳入 `null`（`checkMandatoryNightTarget` 亦在 UI 鎖定）。`canMechWolfUseLearnedSkill`：僅第 2 晚起可用，目標須存活（或 `null` 不使用）；學守衛不可連兩晚守同一人；學小狼須 `hasJoinedWolfTeam === true` 才可用。
- **免疫／反傷／連帶效果**：1) `canMechWolfUseLearnedSkill` 與 `resolveNight` 實作四種所學效果：學女巫獲 1 瓶 `mech_wolf_poison`（無解藥）；學守衛之 `mechGuardTarget` 可擋狼刀（同救仍觸發 `milk_pierce`）與 `witch_poison`/`poisoner_poison`，但**未**擋獵人夜死開槍；學小狼入隊後解鎖 `mech_wolf_kill` 雙刀（注意 `mechExtraKillTarget` 未檢查 `isSpecialNightImmune`、咒狐及雙子/喜羊羊等盾）；學通靈師回傳 `mechWolfPsychicResult`。2) 其餘板子所學技能（預言家、覺醒預言家、純白之女、狼美人、熊、攝夢人、咒狐）皆未實作。3) `shouldMechWolfJoinWolfTeam` 僅檢查 `role?.faction === 'wolf'`，未檢查 `isSeatWolfFaction`，存在轉化者/被感染者時會錯誤提早入隊。
- **次數限制**：首夜學習僅 1 次（`round === 1`）；學女巫時 `usedLearnedOneShotSkill` 限制全場 1 瓶毒藥；學守衛受 `lastGuardedSeat` 防連守限制；入隊條件 `hasJoinedWolfTeam` 一旦達成永久為 `true`。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'wolf'`，好人必須淘汰包含機械狼在內的所有狼人陣營才能勝利。`getSeerCheckResult` 永遠驗為 `'wolf'`；`getPsychicCheckResult`／`getGargoyleCheckResult`／`getPureWhiteCheckResult`／`getWolfWitchCheckResult` 學習前顯示 `'mech_wolf'`，學習後顯示 `learnedRoleId`；`doesPureWhiteKillTarget` 學習好人時不出局、未學或學狼人時出局；`isSeatWolfForBear` 未學或學狼陣營才讓熊咆哮。
- **程式碼定位**：`src/logic/mechWolf.ts:12-239; src/logic/nightResolution.ts:1224-1240, 1409-1447, 1729-1752, 1909-1917, 2196, 2223, 2237-2254; src/logic/inspectionRoles.ts:419-423; src/logic/advancedRoles.ts:138-144; src/logic/dayResolution.ts:356, 560, 636; src/store/gameStore.ts:1035, 1155, 1801, 1880; src/components/screens/NightConsoleScreen.tsx:849-866, 3635-3700`
- **未實作／僅手動／斷鏈註記**：1) 學到預言家、覺醒預言家、純白之女、狼美人、熊、攝夢人、咒狐之技能與被動皆未實作（僅 `getPsychicCheckResult` 顯示所學角色 ID）。2) 學到守衛擋獵人夜槍未實作。3) `12p-wind-espionage` 夜間狼刀步驟為 `confirm_only`，靠手動控制。4) `wolfGirlExplode`／`pufferfishExplode` 等部分 Store action 未同步 `mechWolfState`。
- **現有行為測試覆蓋**：`src/logic/mechWolf10.test.ts` (3 個 describe/it 區塊，涵蓋首夜學、通靈師查驗、學女巫/守衛/小狼/通靈師、不可自爆與勝負)、`advancedRoles.test.ts` (1)、`inspectionRoles.test.ts` (1)、`manualControl.test.ts` (1)、`playtestFixes.test.ts` (1)、`setup.test.ts` (2)；但 `gameStore.test.ts` 零覆蓋，且跨板新學技能與轉化者入隊判斷無測試。

#### 16. 狼女孩（`wolf_girl`｜狼人陣營 / wolf）
- **觸發時機**：第 1 晚與狼隊見面前執行 `wolf_girl_confess`（引擎 `resolveNight` 第 1244 行有接線）；白天發言階段或放逐投票階段透過 `resolveWolfGirlExplode`／`wolfGirlExplode` 主動自爆。
- **目標限制**：`canWolfGirlConfess`：限定第 1 晚（`round === 1`）、狼女孩存活、不可跳過（除非傳入 `allowSkip: true`）、不可選自己、目標須存活且 `targetRole.faction !== 'wolf'`（即不可表白狼隊友）。
- **免疫／反傷／連帶效果**：首夜表白對象為平民（`category === 'villager'`）時，`wolfGirlState.confessSuccess = true, alignedWithWolf = true`；為神職時 `false`。白天發動 `resolveWolfGirlExplode` 時，若 `confessedSeat` 存活則強制以 `deathReason: 'wolf_girl_breakup'` 淘汰之，並設定 `voidedExileVote = true`；`checkCanShoot` 第 182 行明確禁止 `'wolf_girl_breakup'` 的獵人／覺醒獵人開槍。注意：狼女孩本身立即被設為 `isAlive: false`（未延遲至當晚點刀後死亡）。
- **次數限制**：表白僅限第 1 晚 1 次；愛情破裂自爆全場僅 1 次（自爆即出局）。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'wolf'`。被表白平民在 `getSeerCheckResult` 仍驗為 `'good'`（符合身分仍維持平民），但在 `victory.ts` 中 `checkVictory` 完全未計入 `wolfGirlState.alignedWithWolf`。
- **程式碼定位**：`src/logic/wolfGirl.ts:13-176; src/logic/nightResolution.ts:1243-1256; src/logic/dayResolution.ts:182-188, 596-615; src/store/gameStore.ts:3006-3063; src/components/day/ExtraDaySkillsSection.tsx:50-54, 222-246; src/components/screens/DayVoteScreen.tsx:54-57, 163-171`
- **未實作／僅手動／斷鏈註記**：1) `NightConsoleScreen.tsx`、`nightStepConfig.ts` 與 `nightValidation.ts` 完全未實作 `wolf_girl_confess` 步驟（座位點擊被 `default` 禁用），且 `gameStore.ts` 從未初始化、傳入或保存 `wolfGirlState`！2) `12p-wolf-girl` 首夜被表白者睜眼（`step_7`）為 `confirm_only`。3) `victory.ts` 未接入 `wolfGirlState.alignedWithWolf`，表白成功之平民不影響屠邊與勝利歸屬。4) `DayVoteScreen.tsx` 第 163 行在 `exileResolvedToday` 結算後隱藏自爆按鈕，且 `wolfGirlExplode` 未寫回 `res.mechWolfState`。5) `gameStore.ts` 未傳遞 `firstNightNoWolfKill: true`。
- **現有行為測試覆蓋**：`src/logic/wolfGirl12.test.ts` (1 個大 describe 含多個案例，測試首夜無刀、表白限制、愛情破裂、獵人禁開槍與屠神) 與 `src/logic/playtestFixes.test.ts` (2 個行為命中，測試放逐投票階段例外自爆)；`gameStore.test.ts` 零覆蓋。

#### 17. 盜寶大師（`treasure_master`｜第三方陣營 / third_party）
- **觸發時機**：首夜須初始化 3 張底牌；每晚於通靈師查驗前選擇 1 張底牌角色（`resolveNight` 第 1259-1274 行）。若處於盜寶蒙面狼放逐免死狀態，則於隔夜點刀後出局（第 1766-1769 行）。
- **目標限制**：`validateTreasureMasterBottomCards`：必須正好 3 張牌；含狼必為「1 狼 1 神 1 民」（禁止雙神盜寶狼、雙民盜寶狼）；不含狼必為「雙神一民」或「雙民一神」。`canTreasureMasterChooseCard`：必須屬於 3 張底牌之一，且 `lastChosenCardRoleId !== cardRoleId`（不可連兩晚選同牌）。
- **免疫／反傷／連帶效果**：1) 依 3 張底牌決定 `affiliation`（`wolf` / `god` / `villager`），盜寶狼於原狼全滅後透過 `syncTreasureMasterTeamStatus` 入狼隊。2) 選為 `masked_villager` 當晚享有蒙面人夜間延遲死亡保護（`killSeat` 第 359 行）。3) `isTreasureMasterLastWolfMasked`：當為盜寶狼最後一狼且當晚選為 `masked_villager` 時，白天放逐免死（`treasureMasterMaskedSurvived: true, pendingExileDeathNextNight: true`），於隔夜狼刀結算後以 `treasure_master_exile_delayed` 出局（`nightResolution.ts` 第 1766 行）。4) **未實作**：選擇其他底牌角色時實際使用該角色技能（僅影響通靈師顯示與蒙面人被動）。
- **次數限制**：每晚選 1 張底牌，受 `lastChosenCardRoleId` 限制不可連兩晚相同；盜寶蒙面狼最後一狼免死僅限一次（`pendingExileDeathNextNight` 檢核）。
- **勝利條件／查驗判定**：`victory.ts` 第 55-57 行 `getEffectiveSide` 依 `treasureMasterState.affiliation` 計入 `wolf`、`god` 或 `villager`（若未初始化底牌則回傳 `null` 不計入任何陣營）。`getPsychicCheckResult` 第 80 行於選牌後顯示 `currentNightCardRoleId`。`getSeerCheckResult` 因未特判 `treasure_master`，查驗時固定依 `roles.ts` 之 `third_party` 回傳 `'good'`（即使為盜寶狼亦然）。
- **程式碼定位**：`src/logic/treasureMaster.ts:14-271; src/logic/mechWolf.ts:80-85; src/logic/nightResolution.ts:357-375, 1259-1274, 1766-1769; src/logic/dayResolution.ts:417-446; src/logic/victory.ts:55-57; src/store/gameStore.ts:373, 1527, 2682, 3065-3103; src/components/common/SeatStatusDrawer.tsx:17, 31`
- **未實作／僅手動／斷鏈註記**：1) `gameStore.ts` 完全未初始化 `treasureMasterState`，無設定 3 底牌的 UI/action，`finishNight`/`checkEarlyNightVictory`/`submitExileVotes`/`exilePlayer` 皆未傳入或更新 `treasureMasterState`。2) `NightConsoleScreen.tsx` 與 `nightStepConfig.ts` 未實作 `treasure_master_choose` 步驟介面；`NightConsoleScreen` 通靈師預覽亦未傳入 `treasureMasterState`。3) 除 `masked_villager` 被動外，每晚切換底牌並使用該角色技能（毒師、獵人、狼王、攝夢人等）皆未實作。4) `gameStore.ts` 未傳遞 `firstNightNoWolfKill: true` 且 `shouldTreasureMasterJoinWolfTeam` 未用 `isSeatWolfFaction`。
- **現有行為測試覆蓋**：`src/logic/treasureMaster12.test.ts` (2 個行為命中涵蓋底牌檢核、連兩晚防重選、通靈查驗、屠邊與盜寶蒙面狼免死)；`gameStore.test.ts` 與 UI 層零覆蓋。

#### 18. 攝夢人（`dream_catcher`｜好人陣營 / god）
- **觸發時機**：每晚執行 `dream_catcher_dream`（第 1 晚即可發動）。連夢死與夜死牽連皆於 `resolveNight` 第 8.5 階段（第 2384-2400 行，位於毒藥與查驗死之後）結算。
- **目標限制**：`canDreamCatcherDream`：攝夢人須存活且未被種狼感染（第 1313 行）；每晚強制選擇自己以外一名存活玩家（不可選自己、不可跳過，除非場上無其他存活者；`checkMandatoryNightTarget` 第 313 行於 UI 強制鎖定），允許連續兩晚選同一人。
- **免疫／反傷／連帶效果**：1) `isDreamProtected` 使夢遊者免疫：狼刀、奶穿、機械狼刀、女巫/覺醒女巫/毒師/機械狼毒、刺客、狼鴉之爪、狼弟覺醒刀、大灰狼、大野狼、**阿努比斯天平（與胡夫地平線規則衝突）**、獵魔人、夜僕死亡、商人反噬、狼巫/純白驗殺、咒狐被預言家/覺醒預言家/愚言家驗死。2) 夢遊者被女巫救不會奶穿（第 1717 行直接跳過狼刀階段）。3) 連兩晚夢同一人（`lastDreamTarget === dreamTarget`）觸發 `dream_catcher_consecutive` 死亡；攝夢人夜死（`!dreamCatcherNow.isAlive`）觸發 `dream_catcher_link` 共死；兩者皆受流光伯爵／黑夜使者／典獄長免疫保護（黑夜使者會反殺攝夢人），且出局夢遊者無法開槍（`checkCanShoot` 不含此兩死因）。4) 被種狼感染失能；被夢魘恐懼時無法攝夢並重置 `nextLastDreamTarget = null`；邱比特奇緣受蝕時狼妃封鎖視為無效，沙龍之夜則轉為自攝。
- **次數限制**：每晚必選 1 名目標，無全場次數限制；連夢紀錄由 `lastDreamTarget` 跨回合持久化追蹤，被恐懼或封鎖無效時歸零。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'good', category: 'god'`，計入好人神職邊。`getSeerCheckResult` 驗為 `'good'`，`getPsychicCheckResult` 驗為 `'dream_catcher'`。
- **程式碼定位**：`src/logic/advancedRoles.ts:102-133; src/logic/nightValidation.ts:313-317; src/logic/nightResolution.ts:1312-1342, 1404-1406, 1717, 1739, 1781, 1789, 1806, 1824, 1835, 1857, 2187, 2205, 2219, 2240, 2293, 2309, 2332, 2384-2400, 2527, 2541, 2925, 2947; src/logic/inspectionRoles.ts:916; src/components/screens/NightConsoleScreen.tsx:876-883, 3725-3742`
- **未實作／僅手動／斷鏈註記**：1) 「12 人局 - 胡夫地平線」之「免疫夜間傷害（除了天平）」未實作且邏輯寫反（引擎讓夢遊免疫天平）。2) 「12 人局 - 沙龍之夜」之「攝夢咒狐當晚不防狼刀」未實作（咒狐仍恆防狼刀），且幸運兒查驗未實作。3) 「12 人局 - 獵日逐光」之蝕日侍女被流光反噬邏輯未實作。4) `resolveNight` 第 1315 行未在引擎端阻斷冰凍／石化／血月封印（僅 UI `evaluateNightStepLockState` 鎖定）。
- **現有行為測試覆蓋**：`src/logic/advancedRoles.test.ts` (4 個行為命中)、`topFiveRoles.test.ts` (1，恐懼重置)、`interferenceRoles.test.ts` (1，流光免疫連夢)、`treasureMaster12.test.ts` (2，免疫毒師)、`deepAuditFixes.test.ts` (1)、`inspectionRoles.test.ts` (1，護咒狐不死)；`gameStore.test.ts` 零覆蓋，胡夫地平線天平穿夢／沙龍之夜咒狐未覆蓋。

#### 19. 熊（`bear`｜好人陣營 / god）
- **觸發時機**：每晚於 `resolveNight` 結算完所有夜間死亡後（第 3436 行，含 `wolfKillPriority` 提早返回時第 2149 行）自動計算，並在天亮公告（`DayAnnouncementScreen`）呈現「昨晚熊咆哮了／沒有咆哮」。
- **目標限制**：無主動選擇目標；`evaluateBearRoar` 將座位依 `seatNumber` 升冪排序，沿順時針（左）與逆時針（右）各自尋找最近一名 `isAlive === true` 的鄰居。`isSeatWolfForBear` 判定為狼的條件：`infectedBySeedWolf`、`convertedByAwakenedGargoyle`、未學習或學到狼陣營的 `mech_wolf`、或 `role.faction === 'wolf'`。
- **免疫／反傷／連帶效果**：1) 被種狼感染（`bear.infectedBySeedWolf`）、昨晚遭夢魘恐懼（`fearedSeat === bear.seatNumber`）、或處於睡美人睡眠狀態（`isSeatAsleep`）時，強制回傳 `roared: false`。2) 機械狼學習到熊時，未實作「場上存在兩頭熊、任一方達成即咆哮」之規則（`evaluateBearRoar` 僅找原生 `bear`）。3) 企鵝冰凍／梅杜莎石化／血月封印未在 `evaluateBearRoar` 中直接阻斷。
- **次數限制**：純被動技能，只要熊存活且未失能／未受恐懼／未睡眠，每回合天亮自動判定一次。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'good', category: 'god'`，計入好人神職邊。`getSeerCheckResult` 驗為 `'good'`，`getPsychicCheckResult` 驗為 `'bear'`。
- **程式碼定位**：`src/logic/advancedRoles.ts:135-235; src/logic/nightResolution.ts:2149, 3435-3442; src/components/day/DayAnnouncementScreen.tsx:281-289; src/components/common/displayHelpers.ts:455-456, 747-748`
- **未實作／僅手動／斷鏈註記**：1) 機械狼在「12 人局 - 風聲諜影」學習到熊時的雙熊咆哮判定未實作（僅檢查原生 `bear`）。2) 各板子 `bear` 的首夜／次夜步驟皆為 `confirm_only`，白天咆哮公告由 `resolveNight` 自動計算並顯示於 `DayAnnouncementScreen`。
- **現有行為測試覆蓋**：`src/logic/advancedRoles.test.ts` (4 個行為命中)、`deepAuditFixes.test.ts` (1，涵蓋轉化者)、`topFiveRoles.test.ts` (1，恐懼不咆哮)、`thirdPartySpecialRoles.test.ts` (1，睡眠不咆哮)；`gameStore.test.ts` 零覆蓋。

#### 20. 狼美人（`wolf_beauty`｜狼人陣營 / wolf）
- **觸發時機**：每晚狼刀後執行 `wolf_beauty_charm`（`10p-animal-dream`/`12p-animal-dream` 為第 2 晚起）；遭夢魘恐懼／企鵝冰凍／梅杜莎石化／子狐魅惑／削弱時無法魅惑並清空 `nextLastCharmedSeat` 與 `nextActiveCharmedSeat`。白天禁止自爆（`resolveSelfExplode` 第 644 行）。
- **目標限制**：`canWolfBeautyCharm`：狼美人須存活；可選 `null`（空魅）；不可選自己；不可連續兩晚選同一人（`lastCharmedSeat === targetSeat`）；目標須存活；不可選老流氓（`target.roleId === 'old_rascal'`）。在狼刀步驟不可自刀（`nightResolution.ts` 第 1387 行拋錯，UI 第 805 行禁用）。
- **免疫／反傷／連帶效果**：1) `applyWolfBeautyCharmDeath`：除 `knight_duel`（騎士決鬥）外，狼美人因夜間死亡、白天放逐、獵人／狼王開槍或白狼王自爆出局時，前一晚（或當晚）有效 `activeCharmedSeat` 跟著以 `wolf_beauty_charm` 殉情，且殉情者不可開槍（`checkCanShoot` 不含此死因）；殉情發生時 `checkVictory` 強制帶入 `wolfKillPriority: true`。2) 河豚吃狼刀翻牌時（`nightResolution.ts` 第 2631 行）清空當晚 `nextActiveCharmedSeat = null`。3) `gameStore.ts` 的 `usePandoraDayGun`、偵探處決與手動標記出局未觸發殉情。
- **次數限制**：每晚最多魅惑 1 人，受 `lastCharmedSeat` 防連魅限制。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'wolf', category: 'wolf'`，計入狼人陣營（須淘汰才算好人勝）；發生殉情時一律啟用 `wolfKillPriority: true` 優先判狼人屠邊。`getSeerCheckResult` 驗為 `'wolf'`，`getPsychicCheckResult` 驗為 `'wolf_beauty'`。
- **程式碼定位**：`src/logic/advancedRoles.ts:17-95; src/logic/nightResolution.ts:1378-1402, 2626-2634, 2723-2741, 3446; src/logic/dayResolution.ts:347-364, 551-572, 644-650, 930-942; src/logic/inspectionRoles.ts:922; src/store/gameStore.ts:1526, 1802, 1881, 2681, 2841-2857, 2875; src/components/screens/NightConsoleScreen.tsx:867-874, 3702-3723`
- **未實作／僅手動／斷鏈註記**：無主要未接線（夜間魅惑與放逐/夜死/開槍殉情均全自動），僅 `usePandoraDayGun`、`resolveDetectiveExecute` 與手動標記出局未呼叫 `applyWolfBeautyCharmDeath`；另當晚遭夢魘恐懼而清空 `nextActiveCharmedSeat` 後若同晚被毒殺，未保留前晚 `activeCharmedSeat`。
- **現有行為測試覆蓋**：`src/logic/advancedRoles.test.ts` (5 個行為命中，涵蓋禁自爆、禁自刀、禁連魅、毒殺殉情、最後一狼放逐殉情屠邊、騎士決鬥不殉情)；`gameStore.test.ts` 零覆蓋，且潘朵拉手槍／偵探處決未連動。

#### 21. 老流氓（`old_rascal`｜好人陣營 / villager）
- **觸發時機**：首夜僅 `confirm_only` 確認身分；夜間被毒或白天/夜死被獵人射殺時進入 `oldRascalDelayedDeath: true` 負傷／中毒狀態；須由法官在 `DayAnnouncementScreen` 手動觸發 `triggerOldRascalDelayedDeath`。
- **目標限制**：無主動技能目標；作為被動目標時免疫狼美人魅惑（`NightConsoleScreen` 亦禁用選取）。
- **免疫／反傷／連帶效果**：1) `canWolfBeautyCharm` 第 39 行直接禁止狼美人選老流氓（`old_rascal`）。2) `isOldRascalDelayableDeath`：未受種狼感染的老流氓遭 `witch_poison`、`awakened_witch_poison`、`poisoner_poison` 或 `hunter_shoot` 時，不立即死亡，改標記 `oldRascalDelayedDeath = true`（`nightResolution.ts` 第 339 行、`resolveShoot` 第 318 行）。3) 被狼刀（`wolf_kill`）、放逐（`exiled`）或殉情等其他死因則直接出局，不延遲。4) `resolveOldRascalDelayedDeath` 執行後以 `old_rascal_delayed_death` 死亡並重算機械狼入隊與勝負。
- **次數限制**：被動抗性可同時涵蓋毒藥與獵人槍，一旦觸發延遲死亡並在隔天結算即永久出局。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'good', category: 'villager'`，`victory.ts` 計入 `villagers`（平民邊），符合「狼隊屠民要屠老流氓」，且負傷期間仍計為存活平民。`getSeerCheckResult` 驗為 `'good'`，`getPsychicCheckResult` 驗為 `'old_rascal'`。
- **程式碼定位**：`src/logic/advancedRoles.ts:39-41; src/logic/combatRoles.ts:402-413; src/logic/nightResolution.ts:339-343; src/logic/dayResolution.ts:318-333, 1185-1225; src/store/gameStore.ts:2186-2210; src/components/screens/DayAnnouncementScreen.tsx:59, 123, 489-503`
- **未實作／僅手動／斷鏈註記**：延遲死亡結算（`triggerOldRascalDelayedDeath`）**僅靠法官手動點擊** `DayAnnouncementScreen.tsx`「延遲死亡技能」抽屜中的按鈕觸發，不會在「第二天發言結束後」自動結算，且在死訊公告階段即顯示按鈕、進入 `DayVoteScreen` 後反而消失。
- **現有行為測試覆蓋**：`src/logic/combatRoles.test.ts` (2 個行為命中，涵蓋獵人射殺延遲死亡與 `resolveOldRascalDelayedDeath`)；女巫毒殺老流氓、不可被狼美魅惑與 Store 流程皆無專屬測試。

#### 22. 蒙面人（`masked_villager`｜好人陣營 / god）
- **觸發時機**：夜間遭毒／攝／狼刀時於 `killSeat` 觸發延遲狀態；白天延遲死亡須靠法官手動點擊 `ExtraDaySkillsSection` 中的按鈕觸發 `triggerMaskedVillagerDelayedDeath`。
- **目標限制**：無主動技能目標（首夜僅 `confirm_only`）。
- **免疫／反傷／連帶效果**：1) `MASKED_DELAYABLE_NIGHT_REASONS` 涵蓋 `wolf_kill`、`witch_poison`、`poisoner_poison`、`mech_wolf_poison`、`mech_wolf_kill`、`milk_pierce`、`dream_catcher_consecutive`、`dream_catcher_link`；命中 `masked_villager`（或當晚切為蒙面人的盜寶大師）時不立即死亡，改設 `maskedDelayedDeath = true` 與 `maskedDelayedDeathReason`。2) 盜寶蒙面狼若為最後一狼且切為蒙面人，白天放逐於 `resolveDayExile` 免死並設 `pendingExileDeathNextNight = true`（惟 `gameStore.ts` 放逐 action 未傳入 `treasureMasterState`）。3) `resolveMaskedVillagerDelayedDeath` 正式淘汰該座位並同步機械狼／盜寶大師入隊與勝負。
- **次數限制**：負傷狀態可保留原始死因（`seat.maskedDelayedDeathReason ?? reason`），正式結算後即出局。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'good', category: 'god'`，`victory.ts` 計入 `gods`（神職邊），負傷期間仍計為存活神職，待 `resolveMaskedVillagerDelayedDeath` 死亡後才扣減神職人數（可觸發屠神）。`getSeerCheckResult` 驗為 `'good'`，`getPsychicCheckResult` 驗為 `'masked_villager'`。
- **程式碼定位**：`src/logic/nightResolution.ts:307-316, 357-375; src/logic/treasureMaster.ts:188-271; src/logic/dayResolution.ts:417-446; src/store/gameStore.ts:3065-3103; src/components/day/ExtraDaySkillsSection.tsx:19-21, 56-59, 248-263`
- **未實作／僅手動／斷鏈註記**：1) 延遲死亡（`triggerMaskedVillagerDelayedDeath`）**僅靠手動點擊**「自爆/技能」抽屜（`ExtraDaySkillsSection.tsx`）內之「結算出局」按鈕觸發，未於第二天白天蒙面人發言結束後自動結算。2) `gameStore.ts` 的 `submitExileVotes` 與 `exilePlayer` 未傳入 `treasureMasterState`，導致盜寶蒙面狼放逐免死在 Store 層未生效。
- **現有行為測試覆蓋**：`src/logic/treasureMaster12.test.ts` (20 個 expect 命中，涵蓋夜死延遲至白天結算屠神及盜寶蒙面狼最後一狼放逐免死)；`gameStore.test.ts` 零覆蓋，且攝夢／毒師實際觸發蒙面人延遲亦缺獨立測試。

#### 23. 雪狼（`snow_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚參與 `wolf_kill`；白天發言／死訊階段可發動 `resolveSelfExplode`；被預言家查驗時觸發偽裝回傳好人。
- **目標限制**：與一般狼人相同：可參與 `wolf_kill`（可空刀、可自刀）；白天非放逐投票階段且非偵探翻牌當日可自爆（`resolveSelfExplode` 未禁止 `snow_wolf`）。
- **免疫／反傷／連帶效果**：`getSeerCheckResult`（第 117 行）對 `snow_wolf` 恆回傳 `'good'`，無免疫傷害或連帶死亡被動；`resolveKnightDuel` 透過 `isSeatWolfFaction` 判定 `targetWasWolf = true` 使雪狼直接出局並進入夜晚。
- **次數限制**：每晚參與一次狼隊落刀；自爆全場一次（自爆即出局）。
- **勝利條件／查驗判定**：`roles.ts` 定義 `faction: 'wolf', category: 'wolf'`，計入狼人陣營（須淘汰才算好人勝）；`getSeerCheckResult`／`getAwakenedSeerCheckResult`／`getFoolSeerCheckResult` 皆視同好人（金水），`getLanternSeerCheckResult` 反轉為查殺；`getPsychicCheckResult` 驗為 `'snow_wolf'`，`getGravekeeperFactionForRecord` 驗為 `'wolf'`。
- **程式碼定位**：`src/logic/mechWolf.ts:115-127; src/logic/inspectionRoles.ts:120-154, 276-278, 505-511; src/logic/dayResolution.ts:586-766, 970-1104`
- **未實作／僅手動／斷鏈註記**：無（全自動結算）
- **現有行為測試覆蓋**：`src/logic/inspectionRoles.test.ts` (4 個行為命中，涵蓋預言家/覺醒預言家/燈影預言家驗雪狼與可自爆)；缺少騎士決鬥雪狼與 `gameStore.test.ts` 覆蓋。

### 2.3 Top 5 熱門進階角色（5 名）

#### 24. 混血兒（`hybrid`｜第三方陣營 / third_party）
- **觸發時機**：僅第一晚（round === 1）在 nightResolution.ts:1212-1221（階段 0.5）觸發 applyHybridChooseIdol；round !== 1 時 canHybridChooseIdol 拒絕執行。
- **目標限制**：canHybridChooseIdol (topFiveRoles.ts:131-158)：混血兒須存活、不可選自己（targetSeat === hybrid.seatNumber）、目標須存在且存活；UI 層（NightConsoleScreen.tsx:570）與 checkMandatoryNightTarget 強制第一晚不可跳過，但 resolveNight 內部傳入 allowSkip: true。
- **免疫／反傷／連帶效果**：夢魘恐懼混血兒無效（nightResolution.ts:1211-1221 未套用 isSeatBlockedByInterference，但 nightValidation.ts:126-142 的 UI 鎖定未豁免 hybrid_choose）；榜樣若被種狼感染，於 nightResolution.ts:1564 與結算同步呼叫 syncHybridAffiliation 將 alignedFaction 改為 'wolf'；不連動邱比特情侶或影子／復仇者陣營轉換。
- **次數限制**：全場僅第一晚選擇一次榜樣（round === 1），無後續夜晚主動技能。
- **勝利條件／查驗判定**：預言家查驗（getSeerCheckResult / getAwakenedSeerCheckResult）恆為 'good' 金水；victory.ts:59-61 中不計入狼人數，當 ruleOverrides.hybridCountsAsVillager 為 false（預設，含 10p-hybrid 等）時不計入屠邊人數，為 true（12p-hybrid、12p-wind-espionage）時固定計入 'villager' 平民邊。
- **程式碼定位**：`src/logic/topFiveRoles.ts:122-205; src/logic/nightResolution.ts:1211-1221, 1564, 2107, 3396; src/logic/nightValidation.ts:308-312; src/logic/victory.ts:58-61; src/logic/mechWolf.ts:118; src/logic/setup.ts:105-112; src/components/screens/NightConsoleScreen.tsx:569-572, 894-902, 1492-1494, 2743-2752`
- **未實作／僅手動／斷鏈註記**：1) setup.ts 板子 ID 寫錯導致 10p-board-15uqrqo 與 12p-board-1hfx9f2 未開啟 hybridCountsAsVillager；2) hybridState.alignedFaction 僅記錄未接入 victory.ts 與 GameOverScreen 勝者名單；3) 邱比特人狼戀、覺醒石像鬼轉化混血兒失敗、multi-avenger-shadow 互選特殊規則 2~5 皆未實作；4) startGame 未重置 hybridState。
- **現有行為測試覆蓋**：有行為測試（totalBehaviorHits = 3）：topFiveRoles.test.ts:360-406 驗證首夜選狼榜樣、預言家金水、不計入狼人數與 hybridCountsAsVillager 開關；deepAuditFixes.test.ts:270 驗證 12p-hybrid 預設規則。缺少 canHybridChooseIdol 邊界、雲端追蹤/雲端探查板子預設規則、種狼感染榜樣同步、邱比特與影子復仇者交互測試。

#### 25. 夢魘（`nightmare`｜狼人陣營 / wolf）
- **觸發時機**：每晚優先睜眼（在各板子排在第一位，僅 10p-cupid / 12p-cupid 排於 hybrid_choose 與 cupid_link 之後），於 resolveNight:570-585（階段 0）結算；白天非放逐投票階段可透過 resolveSelfExplode 自爆。
- **目標限制**：canNightmareFear (topFiveRoles.ts:56-87)：夢魘須存活；允許目標為 null（不恐懼）；不可恐懼自己；不可連續兩晚恐懼同一人（lastFearedSeat === targetSeat）；目標須存活；round === 1 可恐懼狼隊友，round >= 2 禁止恐懼 isSeatWolfFaction(target)。
- **免疫／反傷／連帶效果**：恐懼狼人→wolfTeamBlocked = true（當晚狼刀與種狼感染皆強制為 null，nightValidation 鎖死 wolf_kill 座位）；恐懼神職／平民→當晚技能無效且不消耗女巫解毒／重置守衛與攝夢人連選（lastGuardedSeat/lastDreamTarget/lastAwakenedDreamTarget 重置為 null）；恐懼熊不咆哮、恐懼月靈狼不嗥叫、恐懼獵人當晚夜死禁開槍（但白天放逐或被狼王/白狼王/手槍帶走仍可開槍）；恐懼混血兒無效。未阻斷同板之烏鴉詛咒與蝕時狼妃封鎖。
- **次數限制**：每晚最多發動一次恐懼（allowSkip 允許不恐懼），且受「不可連續兩晚恐懼同一人」限制（若前一晚未恐懼則重置 lastFearedSeat 為 null）。
- **勝利條件／查驗判定**：標準狼人陣營（faction === 'wolf'），計入 victory.ts 的 wolves 存活數；預言家查驗為 'wolf'（查殺），通靈師／石像鬼／純白之女查驗為 'nightmare'。
- **程式碼定位**：`src/logic/topFiveRoles.ts:44-87; src/logic/nightResolution.ts:570-589, 1138-1154, 1280, 1315, 1351, 1381, 1417, 1450, 1534, 1575, 1624, 1666, 1878, 1897, 1929, 1991, 2012, 2041, 2058, 2467, 2516, 2556, 2588, 3413-3442; src/logic/nightValidation.ts:106-142; src/logic/dayResolution.ts:160-173, 727; src/logic/advancedRoles.ts:188; src/logic/inspectionRoles.ts:639, 919; src/components/screens/NightConsoleScreen.tsx:492-502, 565-568, 885-892, 1489-1491, 2714-2741`
- **未實作／僅手動／斷鏈註記**：1) 10p-cupid/12p-cupid 同板角色烏鴉（crow_curse）與蝕時狼妃（time_eclipse_lock）在 nightResolution.ts 未檢查 fearedSeat；2) NightConsoleScreen hunter_gesture 閃卡未判斷獵人被恐懼；3) 自爆採用即時死亡入夜而非延遲至點刀後死亡；4) nightValidation.ts 單體鎖定未豁免 hybrid_choose 與 cupid_link；5) startGame 未重置 lastFearedSeat。
- **現有行為測試覆蓋**：有行為測試（totalBehaviorHits = 5）：topFiveRoles.test.ts:28-208 與 bugfixBatch19.test.ts:260 覆蓋首夜恐狼空刀、次夜禁恐狼與連恐、恐女巫不耗藥、恐預言家／守衛／熊／攝夢人重置連夢、恐獵人夜死禁槍與白天放逐可開槍、evaluateNightStepLockState。缺恐烏鴉、恐狼王、恐邱比特/混血兒、NightConsoleScreen 獵人閃卡測試。

#### 26. 種狼（`seed_wolf`｜狼人陣營 / wolf）
- **觸發時機**：於每晚 wolf_kill 步驟由法官切換「改為種狼感染」觸發，在 nightResolution.ts:1534-1566 結算；白天非放逐投票階段可透過 resolveSelfExplode 自爆。
- **目標限制**：canSeedWolfInfect (topFiveRoles.ts:220-250)：種狼須存活且 !infectUsed；目標須存活且不可為自己、不可為已感染者；禁止感染 known wolf（role.faction === 'wolf' && roleId !== 'hidden_wolf'），明確允許感染 hidden_wolf（隱狼）。允許傳入 null 放棄感染改走普通狼刀。
- **免疫／反傷／連帶效果**：狼刀改為感染時當晚狼刀設為 null（女巫見空刀且無法使用解藥）；目標若被守衛／機械狼守衛／攝夢／覺醒攝夢保護則不會被感染（但感染次數仍消耗）；感染成功時目標即刻設 infectedBySeedWolf = true 並同步混血兒榜樣陣營，目標當晚立即失去預言家／女巫／守衛／狐狸／純白／熊／高級平民／獵人／騎士／白痴等原技能並解除隱狼禁自爆限制；若達成屠邊（如感染最後一神）於 wolfKillPriority 階段立即判狼勝。未對名媛寵幸（9p-board-kxb4iz）做感染攔截。
- **次數限制**：整局遊戲僅限使用一次（seedWolfState.infectUsed === true 後即禁止再次發動；即使目標被守衛擋下亦會消耗此一次性機會）。
- **勝利條件／查驗判定**：種狼本人計為 'wolf'；被感染者於 victory.ts:30 計入 'wolf'（同時於 152-156 保留原本所屬神／民存在標記以防漏判屠邊）；被感染者被預言家／覺醒預言家查驗優先回傳 'wolf' 查殺，守墓人驗屍回傳 'wolf'，通靈師／純白之女／石像鬼仍顯示其原本 roleId（純白第 2 晚起驗被感染者會致死）。
- **程式碼定位**：`src/logic/topFiveRoles.ts:19-24, 33-35, 164, 211-250; src/logic/nightResolution.ts:1534-1566, 1570, 1664, 1871, 1890, 1922, 2097-2172; src/logic/dayResolution.ts:136-146, 496, 660, 998; src/logic/victory.ts:30-32, 152-156; src/logic/mechWolf.ts:102; src/logic/inspectionRoles.ts:212, 417, 506, 652, 758; src/logic/advancedRoles.ts:136, 178; src/components/screens/NightConsoleScreen.tsx:497-502, 530-532, 796-804, 1456-1460, 2680-2695`
- **未實作／僅手動／斷鏈註記**：1) 9p-board-kxb4iz（眾神之戰）中名媛寵幸目標時未阻斷種狼感染；2) 自爆採用即時死亡入夜而非點刀後死亡；3) startGame 未重置 seedWolfState；4) 「隔天和狼人一同睜眼」在實體主持為口頭流程，線上／工具層於白天與隔晚即視同狼隊友。
- **現有行為測試覆蓋**：有行為測試（totalBehaviorHits = 6）：topFiveRoles.test.ts:408-526 與 inspectionRoles.test.ts:447 驗證感染轉狼與失能、女巫見空刀、守衛擋感染、感染隱狼回歸並查殺、感染最後一神立即屠神、感染高級平民不公布。缺重複感染被拒、自感染/感染已知狼被拒、感染後獵人/騎士/白痴失能及名媛寵幸阻斷測試。

#### 27. 隱狼（`hidden_wolf`｜狼人陣營 / wolf）
- **觸發時機**：被動／條件入隊：每晚 resolveNight 結算階段（2106, 3395）呼叫 syncHiddenWolfTeamStatus；一旦場上除自己外已無其他存活狼陣營玩家（或被種狼感染），hasJoinedWolfTeam 轉為 true。白天除被種狼感染外全程不可自爆。
- **目標限制**：無獨立主動選目標技能；入隊後與狼隊共用 wolf_kill 落刀目標選擇。
- **免疫／反傷／連帶效果**：未被種狼感染前不可自爆（dayResolution.ts:660）；被種狼感染後即刻視為已入隊並解除禁自爆限制；若場上仍存在其他存活狼人（包含未入隊機械狼、石像鬼等任何 isSeatWolfFaction(seat) 為 true 者），hasJoinedWolfTeam 維持 false；狼王出局判定 otherAliveWolves 時將存活隱狼計為狼隊友（狼王仍可開槍）。
- **次數限制**：常駐被動身分特性；入隊狀態 hasJoinedWolfTeam 一旦為 true 即持續為 true（topFiveRoles.ts:269）。
- **勝利條件／查驗判定**：victory.ts 計為 'wolf' 狼人陣營（好人須淘汰隱狼方可獲勝）；預言家（getSeerCheckResult）、覺醒預言家（getAwakenedSeerCheckResult）與愚言家（getFoolSeerCheckResult）查驗恆為 'good' 金水（被種狼感染後改為 'wolf' 查殺）；通靈師、純白之女、石像鬼、狼巫查驗皆顯示真實身分 'hidden_wolf'（純白第 2 晚起驗之致死）；守墓人驗屍回傳 'wolf'。
- **程式碼定位**：`src/logic/topFiveRoles.ts:26-30, 246, 256-294; src/logic/nightResolution.ts:2106, 3395; src/logic/dayResolution.ts:224-228, 660-666; src/logic/victory.ts:64; src/logic/mechWolf.ts:116; src/logic/inspectionRoles.ts:407-426, 505-511; src/data/boards.ts ('10p-hidden-wolf-knight', '12p-hidden-wolf-crow', '12p-hidden-wolf-bear', '12p-seed-wolf-3', '12p-board-1cnivrg', '12p-board-1hfx9f2')`
- **未實作／僅手動／斷鏈註記**：1) 嚴重接線缺陷：多數隱狼板子的 wolf_kill 步驟 actorRoleIds 未含 'hidden_wolf'，導致只剩隱狼一人時 evaluateNightStepLockState 仍會鎖死 wolf_kill 使隱狼無法在 UI 刀人；2) 12p-board-1hfx9f2（雲端探查）只剩隱狼與機械狼時卡刀禁刀僅靠誤鎖成立，resolveNight 純函式層未阻斷；3) 隱狼入隊手勢與首夜認隊友（含無目之夜認身分）在板子步驟僅為 confirm_only，無專屬狀態閃卡；4) 白天放逐／自爆未即時同步 hiddenWolfState；5) startGame 未重置 hiddenWolfState。
- **現有行為測試覆蓋**：有行為測試（totalBehaviorHits = 5）：topFiveRoles.test.ts:528-589 與 inspectionRoles.test.ts:45-53 覆蓋預言家／覺醒預言家驗金水、通靈師驗隱狼、禁自爆、他狼皆死後入隊、好人須淘汰隱狼才勝。缺少 12p-board-1hfx9f2 只剩隱狼＋機械狼卡刀測試、wolf_kill UI 鎖定驗證、白天死亡同步 hiddenWolfState 測試。

#### 28. 惡靈騎士（`evil_knight`｜狼人陣營 / wolf）
- **觸發時機**：全程被動觸發：夜晚狼刀檢查禁自刀、階段 8 免疫毒藥、階段 8.2 結算一次性反傷、白天／夜晚獵人開槍階段檢查夜間免疫、白天自爆按鈕禁用。
- **目標限制**：禁止自刀（nightResolution.ts:1487-1495 檢查直接自刀拋錯；NightConsoleScreen 禁用選為狼刀目標）；禁止自爆（dayResolution.ts:652-657）。其餘狼刀目標無額外限制。
- **免疫／反傷／連帶效果**：1) 免疫女巫毒藥、覺醒女巫毒藥、毒師毒藥、機械狼毒藥（nightResolution.ts:2189, 2207, 2220, 2241）；2) 免疫因夜間狼殺／奶穿／機械狼刀出局的獵人開槍（isEvilKnightNightShootImmune + resolveShoot）；3) 一次性反傷（evilKnightCounterUsed）：當晚女巫下毒或預言家查驗惡靈騎士時觸發 'evil_knight_counter' 死亡（守衛守護施法者亦無法擋反傷）；若同晚同毒同驗，依 gameStore 依板子夜間步驟順序計算之 seerActsBeforeWitch 決定由先行動者受反傷，消耗後不再反傷。
- **次數限制**：反傷技能全場僅限觸發一次（evilKnightCounterUsed === true 後耗盡，之後再被毒／驗僅維持毒藥免疫但不再反傷）；免疫夜間傷害為常駐被動。
- **勝利條件／查驗判定**：victory.ts 計為 'wolf' 狼人陣營；預言家查驗為 'wolf' 查殺（即使觸發反傷亦已於階段 6 先產出查殺結果）；通靈師／石像鬼／純白之女查驗為 'evil_knight'。
- **程式碼定位**：`src/logic/topFiveRoles.ts:93-116; src/logic/nightResolution.ts:1487-1495, 2175-2185, 2241, 2257-2285; src/logic/dayResolution.ts:293, 652-657; src/store/gameStore.ts:970-972, 989, 1022-1024, 1040, 1552; src/components/screens/NightConsoleScreen.tsx:806, 815-816`
- **未實作／僅手動／斷鏈註記**：1) 跨板下夜間反傷僅偵測普通女巫（witch）與預言家（seer），未涵蓋覺醒女巫／毒師／覺醒預言家等；2) NIGHT_SHOOT_DEATH_REASONS 漏列部分進階夜間死因；3) gameStore triggerShoot 記錄 dayHistory 時未判斷 result.targetSurvived，射擊免疫時文案仍誤寫「開槍帶走」；4) startGame 未重置 evilKnightCounterUsed。
- **現有行為測試覆蓋**：有行為測試（totalBehaviorHits = 5）：topFiveRoles.test.ts:210-358 覆蓋禁自刀、禁自爆、免疫女巫毒並一次性反傷（守衛擋不住反傷）、反傷耗盡後不再觸發、seerActsBeforeWitch 先後反傷順序、夜死獵人開槍免疫 vs 白天放逐獵人可帶走。缺守衛護惡靈騎士不死、狼王開槍、毒師／覺醒角色、gameStore triggerShoot 免疫文案測試。

### 2.4 查驗與預言系角色（19 名）

#### 29. 通靈師（`psychic`｜好人陣營 / god）
- **觸發時機**：每晚（包含第 1 晚與第 2 晚起）於夜間步驟 psychic_check 觸發，屬主動選目標查驗並可由法官即時揭曉結果。
- **目標限制**：UI（NightConsoleScreen#L841-L848）僅限點選存活玩家（!isAlive 禁用），可查驗自己、可連續多晚查驗同一目標；純邏輯 getPsychicCheckResult 不檢查 isAlive，只要目標有 roleId 即可查詢。
- **免疫／反傷／連帶效果**：不具備免疫能力；若通靈師於本晚或先前遭種狼感染（infectedBySeedWolf）或遭夢魘恐懼（fearedSeat），則無法發動查驗（psychicResult 為 null）。注意 resolveNight 未對通靈師檢查企鵝／梅杜莎／血月／導師學者削弱，亦未套用 redirectSkillTarget（蝕時狼妃／魔術師／搗蛋鬼）與 trackBlackBatTarget。
- **次數限制**：每晚最多查驗 1 名玩家（可選 null 跳過），無全場次數上限。
- **勝利條件／查驗判定**：屬好人陣營神職（faction: 'good', category: 'god'），victory.ts 計入存活神職（gods），狼隊屠神或屠城須淘汰之。查驗回傳目標真實底牌：若目標為已學習身分的機械狼則回傳 learnedRoleId（未學則 'mech_wolf'），若為當晚選牌的盜寶大師則回傳 currentNightCardRoleId，其餘回傳真實 roleId（含隱狼、雪狼、咒狐等）。被預言家系查驗為金水。
- **程式碼定位**：`src/logic/mechWolf.ts#L64-L91 (getPsychicCheckResult)；src/logic/nightResolution.ts#L1889-L1907 (resolveNight)；src/logic/inspectionRoles.ts#L879-L881 (evaluateAwakenedDreamTargetActed)；src/components/screens/NightConsoleScreen.tsx#L584-L587, #L841-L848, #L2879-L2899；src/store/gameStore.ts#L1130`
- **未實作／僅手動／斷鏈註記**：1) resolveNight 未接線 isSeatBlockedByInterference、redirectSkillTarget 與 trackBlackBatTarget（影響 12p-salon-night 蝕時狼妃／沙龍夜互動）；2) NightConsoleScreen 呼叫 getPsychicCheckResult 未傳第 4 參數 treasureMasterState，導致盜寶大師板夜間即時預覽與結算紀錄可能不一致。
- **現有行為測試覆蓋**：中強：mechWolf10.test.ts 驗證首夜機械狼先學習後通靈師查驗結果（3 筆斷言）、treasureMaster12.test.ts 驗證查驗盜寶大師變身身分（2 筆）、topFiveRoles.test.ts 驗證查驗隱狼顯示 hidden_wolf（1 筆）、manualControl.test.ts 與 setup.test.ts 亦有涉入。缺少受幹擾／感染／UI 預覽漏傳 treasureMasterState 測試。

#### 30. 覺醒預言家（`awakened_seer`｜好人陣營 / god）
- **觸發時機**：每晚於夜間步驟 awakened_seer_check 主動選取兩位目標並於確認查驗後即時揭曉雙驗結果。
- **目標限制**：UI（NightConsoleScreen#L903-L920）須點選 2 名不同之存活玩家（含自己）；因點已選座位會取消選取，UI 上無法點選同一個座號兩次（只能選自己＋另一人以達成單驗效果）。getAwakenedSeerCheckResult 本身可接受任意兩座號（含同座號），不檢查 isAlive。
- **免疫／反傷／連帶效果**：當覺醒預言家查驗任一目標為咒狐（且該咒狐未受攝夢人／覺醒攝夢人保護）時，咒狐於 resolveNight 第 2326-2344 行以 cursed_fox_checked 出局。自身若於先前或當晚遭種狼感染或遭夢魘恐懼則無法查驗；但 resolveNight 未套用 isSeatBlockedByInterference、redirectSkillTarget 與 trackBlackBatTarget。
- **次數限制**：每晚可雙驗 1 次，無全場次數上限。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods。雙目標皆通過 getSeerCheckResult 判定為 'good'（含隱狼、雪狼、混血兒、咒狐、石像鬼死前之南瓜鬼等）時回傳 'double_good'（雙金水），否則（至少一人為狼）回傳 'suspected_wolf'（疑似狼人）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L107-L130 (findAwakenedSeerSeat, getAwakenedSeerCheckResult), #L882-L888；src/logic/nightResolution.ts#L1933-L1945, #L2326-L2344；src/components/screens/NightConsoleScreen.tsx#L598-L604, #L903-L920, #L2914-L2939；src/store/gameStore.ts#L1132`
- **未實作／僅手動／斷鏈註記**：1) resolveNight 未接線 isSeatBlockedByInterference、redirectSkillTarget 與 trackBlackBatTarget（在 12p-salon-night 有蝕時狼妃時不會反彈）；2) UI 僅點選 1 名目標時 checkMandatoryNightTarget 未攔截且 NightConsoleScreen 會當作未選滿而直接推進略過（[seat, null] 導致 resolveNight 不結算）。
- **現有行為測試覆蓋**：中弱：inspectionRoles.test.ts#L39-L54 有 1 個 it 測試雙金水、疑似狼人、查自己、隱狼／雪狼／咒狐計好人；缺少經由 resolveNight 觸發雙驗並擊殺咒狐、僅選 1 人、或受幹擾封鎖的測試。

#### 31. 咒狐（`cursed_fox`｜第三方陣營 / third_party）
- **觸發時機**：首夜 confirm_only 確認身分；主要為被動觸發（夜間受狼刀／被陣營查驗／蝕日侍女吞噬，以及勝負結算時機）。
- **目標限制**：夜間於有首夜確認步驟的板子（如 10p-cursed-fox、12p-salon-night 等）僅為 confirm_only，無主動技能與目標選擇。
- **免疫／反傷／連帶效果**：1) 免疫狼刀與奶穿（nightResolution.ts#L1719 !wolfTargetIsCursedFox）；注意 mech_wolf_kill（#L1739）未加 !isCursedFoxSeat 防護。2) 被預言家、覺醒預言家或愚言家查驗（nightResolution.ts#L2323-L2344）立即以 cursed_fox_checked 出局（若受攝夢人／覺醒攝夢人保護則不死）；被燈影／酒鬼預言家或幸運兒 seer_check 查驗未接入此死亡迴圈。3) 被純白之女查驗不出局（doesPureWhiteKillTarget#L416 回傳 false）；被獵魔人狩獵視為非狼，觸發獵魔人自死（demon_hunter_backfire）。4) 沙龍之夜蝕日侍女吞噬咒狐（#L3304-L3316）可免疫當晚狼刀。
- **次數限制**：被動永久效果，無使用次數限制。
- **勝利條件／查驗判定**：屬第三方陣營（faction: 'third_party', category: 'third_party'），不計入 wolves、villagers 或 gods。被預言家系查驗為好人（金水），被守墓人系查驗為好人，被通靈師／純白之女／石像鬼／狼巫查驗顯示真實身分 'cursed_fox'。victory.ts#L180-L187 規定：當狼人或好人任一方達成勝利條件（wolfWon || goodWon）時，若咒狐仍存活或 options.cursedFoxDiedThisResolution 為 true，覆蓋判為第三方咒狐單獨獲勝（但潘朵拉／希望之光與第 4 批部分專屬第三方勝利優先順序更高）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L268-L274 (findCursedFoxSeat, isCursedFoxSeat), #L416, #L508；src/logic/mechWolf.ts#L119；src/logic/nightResolution.ts#L1685, #L1719, #L2323-L2344, #L3304-L3316, #L3449；src/logic/victory.ts#L181-L186`
- **未實作／僅手動／斷鏈註記**：1) 沙龍之夜「幸運兒查驗咒狐致死」未實作（lucky_item_action 未實作 seer_check）；2) mech_wolf_kill 未加咒狐免疫檢查；3) cursedFoxDiedThisResolution 僅於夜間 cursed_fox_checked 時設定，夜間其他死因同亡或白天連帶同亡未納入。
- **現有行為測試覆蓋**：中強：inspectionRoles.test.ts#L150-L210 涵蓋免疫狼刀、被預言家驗死、攝夢保護不死與雲端探查同晚雙亡獨勝，另有純白驗咒狐不出局與守墓人驗咒狐為好人；缺少覺醒預言家驗死咒狐、幸運兒驗死咒狐、獵魔人狩咒狐反殺及白天同死勝負測試。

#### 32. 守墓人（`gravekeeper`｜好人陣營 / god）
- **觸發時機**：第 1 晚為 confirm_only 認身分；第 2 晚起（round >= 2）於 gravekeeper_check 步驟自動顯示昨日白天放逐出局玩家之陣營。
- **目標限制**：被動接收前一天（round - 1）白天放逐紀錄，不選擇目標；若前一天有多筆紀錄取最後一筆（[...exiledHistory].reverse().find(...)）。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果；覺醒攝夢人技能判定（evaluateAwakenedDreamTargetActed#L843）明確規定守墓人晚上「必定有行動」。若守墓人已出局或遭血月封印／恐懼／石化／冰凍／削弱，nightValidation.ts 會鎖死 UI 步驟（但 nightResolution.ts#L2077 仍會計算 gravekeeperResult 存入 nightHistory）。
- **次數限制**：第 1 晚無放逐紀錄可用（回傳 faction: null）；第 2 晚起每晚固定自動結算 1 次。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods。getGravekeeperFactionForRecord() 判定規則：infectedBySeedWolf → 'wolf'；cursed_fox → 'good'；role.faction === 'wolf'（含隱狼、雪狼、石像鬼、南瓜鬼等）→ 'wolf'；其餘 → 'good'。被預言家驗為金水。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L496-L542 (getGravekeeperFactionForRecord, getGravekeeperExileResult), #L843；src/logic/nightResolution.ts#L2074-L2079；src/components/screens/NightConsoleScreen.tsx#L654-L659, #L3159-L3165；src/store/gameStore.ts#L1142, #L1914-L1926`
- **未實作／僅手動／斷鏈註記**：1) gameStore.submitExileVotes() 投票計票放逐時未寫入 exiledHistory（僅手動放逐按鈕 exilePlayer() 有寫入），導致正常投票放逐後守墓人無紀錄可查；2) ExiledRecord 與 getGravekeeperFactionForRecord() 未考慮覺醒石像鬼轉化（convertedByAwakenedGargoyle），在覺石覺攝板子會誤判被轉化者為好人。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L382-L390 僅測試 getGravekeeperExileResult() 查驗第 1 晚無紀錄、第 2 晚南瓜鬼為狼、咒狐為好人；缺少 resolveNight 整合與 gameStore exiledHistory 流程測試（尤其未測出 submitExileVotes 漏寫 Bug）。

#### 33. 純白之女（`pure_white_maiden`｜好人陣營 / god）
- **觸發時機**：每晚於 pure_white_check 步驟主動查驗 1 名玩家真實底牌；第 1 晚（round === 1）只驗不殺，第 2 晚起（round >= 2）查驗到符合條件之狼人目標會使其於該晚結算死亡。
- **目標限制**：UI（NightConsoleScreen#L926-L932）僅限選擇存活玩家，可查驗自己與重複查驗同一人；純邏輯不限制 isAlive。
- **免疫／反傷／連帶效果**：第 2 晚起查驗到狼人陣營（含被種狼感染者、未學習或學到狼陣營的機械狼）會於 resolveNight#L2306-L2320 使目標以 pure_white_check_kill 出局；若目標受攝夢人／覺醒攝夢人保護則不死，且查驗咒狐不出局（僅顯示 'cursed_fox'）。注意若自身與狼巫同晚互驗且狼巫先於 line 2295 殺死純白之女，line 2308 仍會讓純白之女的驗殺結算生效（同死後由狼刀在先判狼勝）。resolveNight 未對純白之女檢查 isSeatBlockedByInterference 與 redirectSkillTarget。
- **次數限制**：每晚主動查驗 1 名目標（可選 null 跳過），無次數上限。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods。底牌查驗沿用 getPsychicCheckResult（機械狼反映 learnedRoleId、盜寶大師反映 currentNightCardRoleId）。被預言家驗為金水。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L368-L426 (findPureWhiteMaidenSeat, getPureWhiteCheckResult, doesPureWhiteKillTarget), #L907-L909；src/logic/nightResolution.ts#L2025-L2037, #L2306-L2320；src/components/screens/NightConsoleScreen.tsx#L636-L639, #L926-L932, #L3072-L3136；src/store/gameStore.ts#L1139`
- **未實作／僅手動／斷鏈註記**：1) resolveNight 未對純白之女套用 isSeatBlockedByInterference（冰凍／石化／血月／削弱）與 redirectSkillTarget（蝕時狼妃等）；2) NightConsoleScreen 預覽查驗未傳入 treasureMasterState。
- **現有行為測試覆蓋**：中強：inspectionRoles.test.ts#L266-L317 驗證首夜只驗不殺、第 2 晚起同晚互驗狼刀在先、機械狼學習平民後不出局且顯示平民；缺少未學習機械狼被驗死、被種狼感染者被驗死、以及受攝夢保護免死之測試。

#### 34. 石像鬼（`gargoyle`｜狼人陣營 / wolf）
- **觸發時機**：每晚於 gargoyle_check 步驟主動查驗 1 人真實底牌（且將結果寫入 gargoyleState.checkHistory）；第 2 晚起另有 gargoyle_team_status 提示是否已入狼隊。白天全程禁止自爆（dayResolution.ts#L668）。
- **目標限制**：UI 僅限選擇存活玩家，可自查或連晚重複查驗同一人；純邏輯不限制 isAlive。
- **免疫／反傷／連帶效果**：無特殊免疫。出局後立即於 syncPumpkinGhostInheritance() 將全部 checkHistory 移交給南瓜鬼並使其解鎖驗人能力（同時南瓜鬼被預言家驗為查殺）。與其他狼人不同，石像鬼在「其餘狼人皆淘汰」時自動入狼隊（hasJoinedWolfTeam = true），但不因此獲得自爆能力。resolveNight 未對石像鬼檢查企鵝／梅杜莎／削弱封鎖。
- **次數限制**：每晚查驗 1 次，無次數上限；入隊為一次性永久狀態轉換。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 從開局起即計入存活狼人（wolves），好人須淘汰石像鬼方可獲勝。預言家查驗為狼人（查殺）、守墓人查驗為狼人；自身查驗透過 getPsychicCheckResult 回傳目標真實身分（如隱狼回傳 'hidden_wolf'）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L31-L36, #L91-L94, #L284-L328 (getGargoyleCheckResult, shouldGargoyleJoinWolfTeam, syncGargoyleTeamStatus), #L901-L903；src/logic/dayResolution.ts#L668-L674；src/logic/nightResolution.ts#L1989-L2008, #L3397；src/components/screens/NightConsoleScreen.tsx#L626-L629, #L3064-L3136`
- **未實作／僅手動／斷鏈註記**：1) 入隊後無法於 UI 執行狼刀（P1）：boards.ts 之 wolf_kill 步驟未列 gargoyle，nightValidation.ts 因其他狼皆死而直接鎖死 wolf_kill 步驟；2) gameStore 僅於 exilePlayer 與 finishNight 同步 syncGargoyleTeamStatus，submitExileVotes／開槍／決鬥／自爆／手動改存活皆未同步，導致入夜首步 gargoyle_team_status 顯示延遲；3) gargoyle_team_status 在單純被動提示後僅依賴系統狀態顯示手勢。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L212-L264 驗證不可自爆、預言家查驗為查殺、查驗底牌寫入 checkHistory、其他狼全滅時入隊；缺少隱狼查驗整合測試與石像鬼入隊後透過 wolf_kill 刀人之流程測試。

#### 35. 高級平民（`senior_villager`｜好人陣營 / villager）
- **觸發時機**：夜間無主動步驟（首夜板子配置 confirm_only 認身分）；於第 1 晚結算（round === 1）計算 evaluateSeniorVillagerReveal()，並於第 1 天死訊公告階段（DayAnnouncementScreen#L297-L303）顯示公開宣告結果（第 2 天起不再顯示）。
- **目標限制**：無主動技能與目標選擇。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果；若首夜遭種狼感染（infectedBySeedWolf = true），不僅轉計為狼人陣營，且第 1 天死訊後不再公布高級平民身分。覺醒攝夢人判定其晚上沒有行動。
- **次數限制**：僅第 1 天死訊後觸發一次公布判定。
- **勝利條件／查驗判定**：屬好人陣營平民（faction: 'good', category: 'villager'），victory.ts 計入 villagers（被種狼感染後改計 wolves）；被預言家與守墓人驗為好人（感染後皆轉為狼人）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L736-L770 (findSeniorVillagerSeat, evaluateSeniorVillagerReveal), #L854；src/logic/nightResolution.ts#L3443；src/components/screens/DayAnnouncementScreen.tsx#L297-L303；src/store/gameStore.ts#L434, #L1173`
- **未實作／僅手動／斷鏈註記**：1) gameStore.startGame() 的 baseRuntimeReset 未重置 lastSeniorVillagerReveal（雖首夜 finishNight 會覆寫）；2) 白天 DayAnnouncementScreen 公告文字為純畫面提示（線上語音模式需留意僅在 death_announcement 區塊顯示）。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L446-L453 僅單元測試 evaluateSeniorVillagerReveal() 第 1 天公布、第 2 天不公布、被感染不公布（3 筆斷言）；缺少 resolveNight 整合及 DayAnnouncementScreen UI 顯示測試。

#### 36. 狼巫（`wolf_witch`｜狼人陣營 / wolf）
- **觸發時機**：每晚於狼隊落刀（wolf_kill）參與點刀後，單獨於 wolf_witch_check 步驟查驗 1 名玩家真實身分（首夜只驗不殺，第 2 晚起驗中純白之女致死）。白天可發動狼人自爆。
- **目標限制**：UI 僅限選擇存活玩家，不禁止查驗狼隊友或自己；純邏輯不限制 isAlive。
- **免疫／反傷／連帶效果**：第 2 晚起（round >= 2）查驗到純白之女且對方未受攝夢人／覺醒攝夢人保護時，於 resolveNight#L2290-L2304 以 wolf_witch_check_kill 擊殺純白之女。resolveNight 僅檢查 fearedSeat，未檢查企鵝／梅杜莎／導師學者削弱。白天可自爆（未列入禁止清單）。
- **次數限制**：每晚可查驗 1 次，無全場次數上限。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；被預言家系與守墓人系查驗均為狼人；自身查驗透過 getPsychicCheckResult 回傳目標真實底牌。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L364-L390 (findWolfWitchSeat, getWolfWitchCheckResult, doesWolfWitchKillTarget), #L904-L906；src/logic/nightResolution.ts#L2011-L2022, #L2290-L2304；src/components/screens/NightConsoleScreen.tsx#L631-L634, #L925, #L3072-L3136；src/store/gameStore.ts#L1138`
- **未實作／僅手動／斷鏈註記**：1) resolveNight 未檢查企鵝／梅杜莎／削弱等幹擾狀態；2) NightConsoleScreen 即時預覽呼叫 getWolfWitchCheckResult 未傳入 treasureMasterState。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L266-L300 測試首夜只驗不殺、第 2 晚起驗殺純白之女、以及同晚互驗雙方皆死判狼勝；缺少邱比特奇緣中無純白之女之純查驗測試與攝夢保護純白免死測試。

#### 37. 覺醒攝夢人（`awakened_dream_catcher`｜好人陣營 / god）
- **觸發時機**：每晚初段於 awakened_dream_catcher_dream 步驟指定夢語者，並於每晚最末 awakened_dream_catcher_judge 步驟得知目標當晚是否有行動；第 2 晚起於判定步驟可選擇是否將夢語者夢語出局。
- **目標限制**：強制選目標（nightValidation.ts#L318-L322 禁止空選，但 resolveNight 傳 allowSkip: true）；不可選自己、不可選已出局者、不可連續兩晚選同一名夢語者（canAwakenedDreamCatcherDream）。
- **免疫／反傷／連帶效果**：1) 夢語者透過 isDreamProtected()（nightResolution.ts#L1404）免疫狼刀、奶穿、種狼感染、女巫／毒師／機械狼毒、純白之女／狼巫驗殺、預言家驗死咒狐、獵魔人／阿努比斯／奇蹟商人反噬等夜間傷害，且同守同救不奶穿。2) 與舊版攝夢人不同，覺醒攝夢人夜晚出局時夢語者不會共死。3) 第 2 晚起可使夢語者出局（awakened_dream_catcher_kill），該死因不在 HUNTER_SHOOTABLE_REASONS 與 WOLF_KING_SHOOTABLE_REASONS 內，出局者無法開槍或發動死亡技能。4) 缺漏：若覺醒攝夢人當晚較早已被刀／毒死，resolveNight#L2362 仍未檢查其是否存活而照常結算夢語出局；evaluateAwakenedDreamTargetActed 未計入同板覺醒石像鬼轉化行動。
- **次數限制**：每晚強制夢語 1 人；夢語出局能力從第 2 晚起每晚可選擇發動（無次數上限）。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods；被預言家與守墓人驗為好人。行動偵測規則：守墓人／超級守墓人必為 true；獵人／平民／高級平民／鐵好人必為 false；遭恐懼必為 false；其餘依 draft 實際行動判定。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L776-L940 (findAwakenedDreamCatcherSeat, canAwakenedDreamCatcherDream, evaluateAwakenedDreamTargetActed)；src/logic/nightResolution.ts#L1345-L1372, #L1404-L1406, #L2360-L2381；src/logic/nightValidation.ts#L318-L322；src/components/screens/NightConsoleScreen.tsx#L671-L681, #L965-L973, #L3217-L3254`
- **未實作／僅手動／斷鏈註記**：1) gameStore.startGame() 未重置 lastAwakenedDreamTarget；2) resolveNight 僅檢查 fearedSeat，未檢查血月／冰凍／石化／削弱／蝕時狼妃反彈；3) 若覺醒攝夢人當晚較早階段已夜死，夜末 awakened_dream_catcher_judge 在 UI 與 resolveNight 仍可誤觸發夢語出局；4) evaluateAwakenedDreamTargetActed 漏判 awakened_gargoyle 等新角色行動旗標。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L455-L498 測試首夜夢語保護不奶穿且偵測獵人無行動、第 2 晚夢語守墓人必有行動並發動夢語出局；缺少不可連夢／不可自夢驗證、覺醒攝夢人夜死不牽連夢語者、及夜死夢語者封槍（checkCanShoot）斷言測試。

#### 38. 惡魔（`demon_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚於狼隊落刀（wolf_kill）參與點刀（不可自刀）後，於 demon_wolf_check 步驟單獨睜眼查驗 1 名非狼玩家。白天不可自爆。
- **目標限制**：canDemonWolfCheck() 與 NightConsoleScreen#L940-L948 禁止查驗已出局玩家及任何 isSeatWolfFaction(target) 為 true 的狼隊友（含轉化／感染者）；可選 null 跳過不查。
- **免疫／反傷／連帶效果**：1) 免疫所有夜間毒藥（nightResolution.ts#L2190, #L2208, #L2221, #L2242 檢查 !isDemonWolfSeat）。2) 免疫夜死獵人開槍（dayResolution.ts#L294 呼叫 isDemonWolfNightShootImmune，涵蓋 wolf_kill、milk_pierce、mech_wolf_kill、pure_white_check_kill、wolf_witch_check_kill）；不免疫白天放逐／決鬥／狼王開槍。3) 不可自刀（nightResolution.ts#L1496-L1504 與 UI#L807）且不可自爆（dayResolution.ts#L676）。
- **次數限制**：每晚最多查驗 1 次，無全場次數上限；夜間免疫為常駐被動效果。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；被預言家系與守墓人系查驗為狼人。自身查驗僅回傳目標 role.category === 'god' ? 'god' : 'villager'（神職或平民，不含具體角色名）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L432-L490 (findDemonWolfSeat, isDemonWolfNightShootImmune, canDemonWolfCheck, getDemonWolfCheckResult), #L910-L912；src/logic/dayResolution.ts#L294, #L676-L682；src/logic/nightResolution.ts#L1496-L1504, #L2039-L2050, #L2177-L2254；src/components/screens/NightConsoleScreen.tsx#L641-L644, #L807, #L940-L948, #L3138-L3157`
- **未實作／僅手動／斷鏈註記**：resolveNight 僅檢查 fearedSeat，未檢查冰凍／石化／削弱；若目標為 third_party 角色會因 role.category === 'god' ? 'god' : 'villager' 而回傳 'villager'（目前所屬板子未含 third_party 主角色）。
- **現有行為測試覆蓋**：中強：inspectionRoles.test.ts#L319-L380 驗證不可自爆、查驗神／民、免疫女巫毒、不可自刀、免疫夜死獵人開槍與不免疫白天放逐獵人開槍；缺少不可查狼隊友（canDemonWolfCheck 拒絕狼目標）與被種狼感染或第三方被查結果測試。

#### 39. 狐狸（`fox`｜好人陣營 / god）
- **觸發時機**：每晚於 fox_check 步驟主動查驗 1 名存活目標及其左右兩側存活鄰居。
- **目標限制**：UI（NightConsoleScreen#L933-L939）僅限選擇存活玩家，不禁止選擇自己（若選自己則查自己＋左右最近兩位存活鄰居），可選 null 跳過；失能後不可再選。getFoxCheckResult 依 findAliveNeighbors 環狀略過已死亡座位找左右最近存活者並去重。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果。若查驗三人皆非狼（!hasWolf），resolveNight#L1984-L1986 設定 nextFoxLostAbility = true 永久失能（nightValidation.ts#L249 鎖死後續所有夜晚步驟）。注意 12p-board-1g1jcg 同場存在企鵝，nightValidation 會於企鵝冰凍狐狸時鎖死 UI，但 resolveNight#L1977 未檢查 isSeatBlockedByInterference（僅檢查 fearedSeat）。
- **次數限制**：每晚最多查驗 1 次；一旦任何一晚查驗的三人中皆無狼人（含被種狼感染者），foxLostAbility 永久設為 true，後續所有夜晚無法再發動。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods；被預言家系與守墓人系查驗為好人。查驗邏輯以 isSeatWolfFaction() 判斷 3 人中是否至少含 1 名狼陣營（含被種狼感染／覺醒石像鬼轉化者），僅回傳 hasWolf（含狼／全好人）與 lostAbility。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L58-L88 (findAliveNeighbors), #L222-L262 (findFoxSeat, getFoxCheckResult), #L898-L900；src/logic/nightResolution.ts#L1977-L1986；src/logic/nightValidation.ts#L249-L254；src/components/screens/NightConsoleScreen.tsx#L621-L624, #L933-L939, #L3037-L3062；src/store/gameStore.ts#L429, #L1136, #L1169`
- **未實作／僅手動／斷鏈註記**：1) resolveNight#L1977 未檢查 penguinFrozenSeat / isSeatBlockedByInterference（與同板 12p-board-1g1jcg 的企鵝聯動在純邏輯層漏封）；2) gameStore.startGame() 的 baseRuntimeReset 未重置 foxLostAbility。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L127-L142 驗證查含狼三人組保留能力、查全好人三人組永久失能、失能後回傳 null；缺少跨已死座位環狀尋找鄰居、被種狼感染後變狼偵測、以及經由 resolveNight 與 nightValidation 鎖定流程之測試。

#### 40. 酒鬼預言家（`drunk_seer`｜好人陣營 / villager）
- **觸發時機**：每晚於 drunk_seer_check 步驟主動查驗 1 名玩家，並可由實體法官手動指定金水／查殺或採隨機結果。
- **目標限制**：UI 僅限選擇存活玩家，可查自己與連續查同一人；純邏輯 getDrunkSeerCheckResult 僅檢查目標存在且有 roleId，不檢查 isAlive。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果；注意酒鬼預言家查驗咒狐時（即使給出金水結果），在 nightResolution.ts#L2323-L2344 並不會加入 factionCheckedSeats，咒狐不會死。resolveNight 未檢查 isSeatBlockedByInterference（僅檢查 fearedSeat）。
- **次數限制**：每晚最多查驗 1 次，無全場次數上限。
- **勝利條件／查驗判定**：屬好人陣營平民（faction: 'good', category: 'villager'），victory.ts 計入 villagers（狼隊屠民即可將其包含在內）；被預言家系與守墓人系查驗為好人。查驗結果完全依法官 manualOverride（'good' | 'wolf'）或 rng() < 0.5 隨機回傳，與目標真實身分無關；InfoFlashcardModal 標題顯示「查驗結果」以隱藏酒鬼身分。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L161-L186 (findDrunkSeerSeat, getDrunkSeerCheckResult), #L892-L894；src/logic/nightResolution.ts#L1958-L1968；src/components/screens/NightConsoleScreen.tsx#L611-L614, #L922, #L2090-L2096, #L2964-L3012；src/store/gameStore.ts#L1134`
- **未實作／僅手動／斷鏈註記**：NightConsoleScreen 選「🎲 隨機」時，展示給玩家的隨機結果未回寫鎖定至 draft.drunkSeerManualResult，導致畫面重渲染可能跳變，且 finishNight() 結算時 resolveNight() 會重擲一次隨機數，造成展示結果與 nightHistory 紀錄不一致。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L69-L76 僅單元測試 getDrunkSeerCheckResult() 之 rng 隨機與 manualOverride（4 筆斷言）；缺少 resolveNight 整合及隨機結果與 UI 顯示一致性測試。

#### 41. 愚言家（`fool_seer`｜好人陣營 / god）
- **觸發時機**：每晚於 fool_seer_check 步驟查驗 1 名玩家陣營；白天階段一～三可隨時於 DayBurstSkillsPanel 抽屜發動翻牌自曝。
- **目標限制**：夜間 UI 僅限選擇存活玩家；白天好人自曝僅限自身存活且未遭種狼感染（canGoodSelfExplode）。DayVoteScreen（階段四）未展示自曝入口。
- **免疫／反傷／連帶效果**：白天發動自曝（goodSelfExplode）後立即以 good_self_explode 死亡並強制進入下一晚（若未觸發勝負）；警上競選期間呼叫 handleSheriffElectionExplode() 處理吞警徽。缺漏：12p-fool-seer 未預設 single_explode，首爆依預設 double_explode 只會延遲吞警徽；gameStore.goodSelfExplode 未合併／清除 pendingNightAnnouncement，若於警長競選期自曝會遺失首夜夜死狀態；被種狼感染後轉以狼人自爆流程處理。
- **次數限制**：每晚查驗 1 次（無上限）；白天翻牌自曝限自身存活時發動 1 次即出局。
- **勝利條件／查驗判定**：屬好人陣營神職（faction: 'good', category: 'god'），victory.ts 計入 gods；夜間查驗直接呼叫 getSeerCheckResult()，驗到咒狐會致死（factionCheckedSeats 包含 effectiveFoolTarget），驗隱狼／雪狼／混血兒為金水。被預言家與守墓人驗為好人。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L192-L216 (findFoolSeerSeat, getFoolSeerCheckResult, canGoodSelfExplode), #L895-L897；src/logic/dayResolution.ts#L771-L815 (resolveGoodSelfExplode)；src/logic/nightResolution.ts#L1971-L1975；src/store/gameStore.ts#L1135, #L1987-L2049；src/components/day/DayBurstSkillsPanel.tsx#L76-L85, #L328-L364`
- **未實作／僅手動／斷鏈註記**：1) 12p-fool-seer 未覆寫預設 badgeSwallowRule 為 single_explode，與 qa_123 首爆即吞警徽預期不符；2) gameStore.goodSelfExplode 漏接 pendingNightAnnouncement、finalizeDayDeathSync 與狀態清理；3) DayBurstSkillsPanel 於線上法官（online_judge）模式隱藏愚言家自曝按鈕；4) resolveNight 未檢查 isSeatBlockedByInterference。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L78-L125 驗證夜間查驗及 resolveGoodSelfExplode() 自曝進入黑夜；缺少被種狼感染後禁止好人自曝、以及 gameStore.goodSelfExplode() 接線與吞警徽（qa_123）測試。

#### 42. 燈影預言家（`lantern_seer`｜好人陣營 / villager）
- **觸發時機**：每晚於 lantern_seer_check 步驟主動查驗 1 名玩家並即時揭曉反轉結果。
- **目標限制**：UI 僅限選擇存活玩家，可查自己與連查同人；純邏輯依 getSeerCheckResult 僅檢查目標有 roleId。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果；燈影預言家查驗咒狐（雖反轉為查殺）不會加入 nightResolution.ts#L2323 factionCheckedSeats，咒狐不會因此出局。resolveNight 未檢查 isSeatBlockedByInterference。
- **次數限制**：每晚最多查驗 1 次，無次數上限。
- **勝利條件／查驗判定**：屬好人陣營平民（faction: 'good', category: 'villager'），victory.ts 計入 villagers；被預言家與守墓人驗為好人。查驗結果完全反轉 getSeerCheckResult()：真預言家驗為 'good'（含平民、神職、雪狼、隱狼等）→ 顯示 'wolf'（查殺）；真預言家驗為 'wolf' → 顯示 'good'（金水）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L136-L155 (findLanternSeerSeat, getLanternSeerCheckResult), #L889-L891；src/logic/nightResolution.ts#L1948-L1955；src/components/screens/NightConsoleScreen.tsx#L606-L609, #L921, #L2082-L2089, #L2941-L2962；src/store/gameStore.ts#L1133`
- **未實作／僅手動／斷鏈註記**：UI 洩漏底牌（P1/P2）：NightConsoleScreen#L2084「放大展示給玩家看」Flashcard 的 eyebrow 寫死「燈影預言家查驗」，會直接向玩家暴露其並非真預言家（應如酒鬼預言家顯示「查驗結果」）。另 resolveNight 未接 isSeatBlockedByInterference。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L56-L67 僅驗證 getLanternSeerCheckResult() 對平民／小狼／雪狼之反轉結果（3 筆斷言）；缺少 resolveNight 整合與咒狐／被感染者互動測試。

#### 43. 九尾狐（`nine_tailed_fox`｜好人陣營 / god）
- **觸發時機**：第 1 晚為 confirm_only 認身分；第 2 晚起（round >= 2）於夜晚最後步驟 nine_tailed_fox_check 被動檢查剩餘尾巴數量，並在 resolveNight#L2347 結算是否歸零出局。
- **目標限制**：無目標選擇，純被動盤點全場已公布死亡之好人座位。
- **免疫／反傷／連帶效果**：初始 9 條尾巴；每名「已公布死亡」（!seat.isAlive 且 deathRound < currentRound）之神職（category === 'god'）扣 2 條、平民（category === 'villager'）扣 1 條、狼陣營不扣；當 tailsRemaining === 0 且九尾狐仍存活時，resolveNight#L2348-L2358 以 nine_tailed_fox_no_tails 使其出局。注意其不檢查 infectedBySeedWolf（僅看 role.faction）。
- **次數限制**：每晚被動結算 1 次；歸零出局為一次性觸發。
- **勝利條件／查驗判定**：屬好人陣營神職（faction: 'good', category: 'god'），victory.ts 計入 gods；被預言家與守墓人驗為好人。扣尾計算僅含 deathRound < currentRound 的既往死亡，不含當晚尚未公布之死訊。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L677-L730 (findNineTailedFoxSeat, evaluateNineTailedFoxTails)；src/logic/nightResolution.ts#L2347-L2358, #L3488；src/components/screens/NightConsoleScreen.tsx#L661-L664, #L3205-L3215；src/store/gameStore.ts#L433, #L1127, #L1172`
- **未實作／僅手動／斷鏈註記**：gameStore.startGame() 的 baseRuntimeReset 未重置 lastNineTailedFoxResult；且若某玩家無 deathRound 欄位（undefined）時會被視為已公布死亡而計入扣尾。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L416-L444 僅單元測試 evaluateNineTailedFoxTails() 計算剩餘尾巴與 deathRound >= currentRound 排除（3 筆斷言）；缺少透過 resolveNight 實際觸發 nine_tailed_fox_no_tails 死亡與勝負結算測試。

#### 44. 南瓜鬼（`pumpkin_ghost`｜狼人陣營 / wolf）
- **觸發時機**：第 1 晚起參與狼隊 wolf_kill 落刀；第 2 晚起板子配有 pumpkin_ghost_check 步驟（石像鬼出局前鎖死，石像鬼出局並繼承後開放查驗真實底牌並顯示歷史紀錄）。白天可自爆。
- **目標限制**：繼承前技能鎖定（nightValidation.ts#L267-L272）；繼承後 UI 僅限選擇存活玩家，可查自己與重複查驗。
- **免疫／反傷／連帶效果**：被動偽裝與繼承：石像鬼（gargoyle）存活期間，預言家驗南瓜鬼為金水；石像鬼出局後，syncPumpkinGhostInheritance() 設定 hasInherited = true 並繼承 gargoyleState.checkHistory，同時預言家驗南瓜鬼轉為查殺。守墓人／超級守墓人驗南瓜鬼一律顯示為狼人（getGravekeeperFactionForRecord）。resolveNight 未對南瓜鬼檢查企鵝／梅杜莎／削弱封鎖。
- **次數限制**：繼承後每晚可查驗 1 次，無次數上限；繼承本身為一次性永久轉換。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；守墓人系固定驗為狼人；預言家系於石像鬼死前驗為金水、死後驗為查殺；繼承後透過 getPsychicCheckResult 查驗真實底牌。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L38-L43, #L91-L94, #L288-L290, #L330-L358 (syncPumpkinGhostInheritance, getPumpkinGhostCheckResult), #L504-L511, #L913-L915；src/logic/mechWolf.ts#L130-L136；src/logic/nightResolution.ts#L2053-L2071, #L3398-L3402；src/logic/nightValidation.ts#L267-L272；src/components/screens/NightConsoleScreen.tsx#L646-L652, #L949-L955, #L3072-L3136`
- **未實作／僅手動／斷鏈註記**：gameStore 僅於 exilePlayer 與 finishNight 呼叫 syncPumpkinGhostInheritance()；若石像鬼死於 submitExileVotes（正常投票放逐）、開槍、騎士決鬥、自爆或手動切換存活，入夜時 pumpkinGhostState.hasInherited 尚未更新，nightValidation.ts#L267 會錯誤鎖死 pumpkin_ghost_check 步驟。另 startGame 未重置 pumpkinGhostState。
- **現有行為測試覆蓋**：中：inspectionRoles.test.ts#L212-L264 驗證石像鬼死前預言家驗南瓜鬼金水、石像鬼死後轉查殺、繼承 checkHistory 與驗人、以及石像鬼仍存活時不繼承；缺少經由白天放逐／開槍後次夜 pumpkin_ghost_check UI 解鎖之 store 測試。

#### 45. 超級守墓人（`super_gravekeeper`｜好人陣營 / god）
- **觸發時機**：第 1 晚起每晚可於 super_gravekeeper_action 選擇繼承者；第 2 晚起同步驟顯示昨日放逐陣營。原超級守墓人出局後於第 2 晚起每晚另有 super_gravekeeper_heir_check 步驟供繼承者讀取昨日與歷史全部放逐陣營。
- **目標限制**：canSuperGravekeeperChooseHeir() 禁止選擇自己或已出局玩家，允許指定存活好人／狼人／第三方或選 null 不指定（但選狼人／第三方在死亡時不會繼承成功）。
- **免疫／反傷／連帶效果**：無免疫或連帶死亡效果。當超級守墓人出局時，syncSuperGravekeeperInheritance() 檢查最後指定之 heirSeat 是否為「存活且未感染且 role.faction === 'good'」的好人，若是則將 heirInherited 設為 true（若為狼人、咒狐、已出局或已受種狼感染者則不觸發）。繼承後於 NightConsoleScreen 的 super_gravekeeper_heir_check 步驟顯示昨日放逐結果、原超級守墓人號碼及全部 exiledHistory，且繼承者沒有選擇新繼承者的步驟。覺醒攝夢人判定其晚上必定有行動。
- **次數限制**：每晚可更新 1 次繼承者（可覆寫）；繼承本身僅在超級守墓人出局後觸發 1 次（heirInherited = true），繼承者無法再選新繼承者。
- **勝利條件／查驗判定**：屬好人陣營神職（god），victory.ts 計入 gods；被預言家驗為好人。放逐陣營查詢共用 getGravekeeperExileResult() 與 getGravekeeperFactionForRecord()（南瓜鬼／隱狼為狼、咒狐為好）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L45-L51, #L500-L599 (canSuperGravekeeperChooseHeir, syncSuperGravekeeperInheritance), #L843；src/logic/nightResolution.ts#L2074-L2094, #L3403-L3406；src/components/screens/NightConsoleScreen.tsx#L654-L659, #L956-L964, #L3159-L3203；src/store/gameStore.ts#L428, #L1168, #L1936-L1939`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen 每晚重設草稿為 null，若第 2 晚起未重選繼承者直接確認，resolveNight#L2090 會把已選好的 heirSeat 覆寫清除為 null；2) 同守墓人，gameStore.submitExileVotes() 漏寫 exiledHistory 且與開槍／自爆等皆漏呼叫 syncSuperGravekeeperInheritance()；3) super_gravekeeper_heir_check 的 actorRoleIds 為 []，就算繼承者也已死亡，nightValidation 仍不會鎖定該步驟；4) startGame 未重置 superGravekeeperState。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L382-L404 僅測試 getGravekeeperExileResult 與 syncSuperGravekeeperInheritance（好人繼承成功、狼人繼承失敗）；缺少多晚保留 heirSeat、UI 顯示全部歷史紀錄、以及 gameStore 投票放逐整合測試。

#### 46. 鐵好人（`iron_good`｜好人陣營 / villager）
- **觸發時機**：黑夜全程無行動（boards.ts 無夜間步驟）；白天階段一～三可隨時於 DayBurstSkillsPanel 翻牌自曝淘汰自己並強制入夜。
- **目標限制**：無夜間目標；白天好人自曝僅限自身存活且未被種狼感染。DayVoteScreen 階段四未提供入口。
- **免疫／反傷／連帶效果**：無免疫效果；白天自曝後（good_self_explode）強制入夜，若處於警上階段則呼叫 handleSheriffElectionExplode() 處理吞警徽（同愚言家存在 12p-fool-seer 預設為雙爆而非單爆、且 goodSelfExplode 漏處理 pendingNightAnnouncement 之缺漏）。覺醒攝夢人判定其晚上沒有行動。
- **次數限制**：全場僅能自曝 1 次即出局。
- **勝利條件／查驗判定**：屬好人陣營平民（faction: 'good', category: 'villager'），victory.ts 計入 villagers；被預言家與守墓人驗為好人。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L204-L216 (canGoodSelfExplode), #L855；src/logic/dayResolution.ts#L771-L815 (resolveGoodSelfExplode)；src/store/gameStore.ts#L1987-L2049 (goodSelfExplode)；src/components/day/DayBurstSkillsPanel.tsx#L76-L85, #L328-L364`
- **未實作／僅手動／斷鏈註記**：1) 12p-fool-seer 未設預設 single_explode 導致首爆延遲吞警徽（qa_123）；2) gameStore.goodSelfExplode 漏接 pendingNightAnnouncement 合併／清理及 finalizeDayDeathSync；3) online_judge 模式 UI 隱藏了自曝按鈕。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L106-L115 僅測試 resolveGoodSelfExplode() 成功出局與入夜；缺少被感染禁止、gameStore.goodSelfExplode() 吞警徽（qa_123）及 UI 互動測試。

#### 47. 月靈狼（`moon_spirit_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚於狼隊行動前（nightResolution.ts#L1375，於夢魘恐懼後、狼刀與女巫之前）自動計算嗥叫結果，於 NightConsoleScreen wolf_kill 步驟即時預覽提示，並於天亮 DayAnnouncementScreen#L291-L295 公布「昨夜月靈狼嗥叫了／沒有嗥叫」。
- **目標限制**：無主動目標選擇，依 findAliveNeighbors() 環狀檢查左右最近存活鄰居之 role.category === 'god'。
- **免疫／反傷／連帶效果**：無特殊免疫；若月靈狼當晚遭夢魘恐懼（fearedSeat === moonSpirit.seatNumber）或已死亡，則不嗥叫（howled: false）。鄰居若為已遭種狼感染（infectedBySeedWolf）之神職亦不視為神職（inspectionRoles.ts#L652）。白天可自爆。
- **次數限制**：每晚自動被動判定 1 次，無次數上限。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；被預言家與守墓人驗為狼人。嗥叫僅反映狼刀前存活左右鄰居是否含未感染之神職（category === 'god'）。
- **程式碼定位**：`src/logic/inspectionRoles.ts#L605-L671 (findMoonSpiritWolfSeat, evaluateMoonSpiritHowl)；src/logic/nightResolution.ts#L1375, #L2150, #L3487；src/components/screens/NightConsoleScreen.tsx#L666-L669, #L2901-L2912；src/components/screens/DayAnnouncementScreen.tsx#L291-L295；src/store/gameStore.ts#L432, #L1126, #L1171`
- **未實作／僅手動／斷鏈註記**：1) gameStore.startGame() 的 baseRuntimeReset 未重置 lastMoonSpiritHowl；2) evaluateMoonSpiritHowl 僅判斷 fearedSeat，未檢查企鵝冰凍／梅杜莎石化等（目前 12p-moon-spirit-wolf 未含該等角色）。
- **現有行為測試覆蓋**：弱：inspectionRoles.test.ts#L406-L414 僅測試 evaluateMoonSpiritHowl() 鄰居含神職嗥叫、被恐懼不嗥叫、鄰居死後改判新鄰居（3 筆斷言）；缺少 resolveNight 整合、被種狼感染鄰居不計神職、以及 DayAnnouncementScreen 公告測試。

### 2.5 干擾／換位／庇護系角色（21 名）

#### 48. 魔術師（`magician`｜好人陣營 / god）
- **觸發時機**：全夜晚優先行動階段（夜間步驟 actionType: 'magician_swap'，於各板子 firstNight 與 subsequentNights 執行）；僅當晚有效。
- **目標限制**：canMagicianSwap 要求魔術師存活且未被種狼感染；可傳入 [null, null] 空換；不可單邊 null、不可兩邊同號、不可選已出局座位、不可選 magicianSwappedSeats 已用過的號碼；允許交換自己。
- **免疫／反傷／連帶效果**：透過 applyTargetSwaps(seatNum, [effectiveMagicianPair, effectiveWolfWarlockPair]) 依序套用於 guardTarget、wolfTarget、witchPoisonTarget、awakenedWitchPoisonTarget、seerCheckTarget；對 zombieInfectTargets 不生效（符合殭屍板規格）。若 rawMagicianPair 與 rawTricksterPair 為同一組座位對（不計順序），兩者於當晚抵銷失效但仍消耗魔術師的號碼紀錄。夜槍 resolveShoot、其他神職技能（通靈師/毒師/獵魔等）及 NightConsoleScreen 即時預覽未套用換位。
- **次數限制**：每晚可換一組（或空換）；magicianSwappedSeats 陣列持久化記錄整局已交換過的座號，每個號碼牌整局僅限交換一次（即使與詭術師抵銷亦計入消耗）。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；未感染時 getSeerCheckResult 判為 'good'（金水），被種狼感染後判為 'wolf' 且失能；getPsychicCheckResult 回傳 'magician'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:65-130 (isSameSwapPair, applySingleSwap, applyTargetSwaps, canMagicianSwap), src/logic/nightResolution.ts:751-800,1168,1486,1584,1653,1882,3524, src/components/screens/NightConsoleScreen.tsx:254-255,974-999,1537-1539,3256-3267`
- **未實作／僅手動／斷鏈註記**：1) 12p-board-1hvme02「夜槍帶走 3 會變成帶 2」於 dayResolution.ts resolveShoot 未接線；2) NightConsoleScreen 預言家即時查驗與女巫刀口顯示未套用換位；3) 其他非預/巫/守/狼技能未套用 swapNightTarget；4) 僅選 1 人的半套交換於 UI 未阻擋確認。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:28-87 驗證魔術師換狼刀/預言家查驗、整局不可重複換同一號、與詭術師同換抵銷（共 2 處命中）。缺乏與狼術師串聯換位（12p-board-1hvme02）、被種狼感染失能、及夜槍換目標測試。

#### 49. 流光伯爵（`radiant_earl`｜好人陣營 / god）
- **觸發時機**：自第二晚起每晚行動（boards.ts 各板子於 firstNight 為 confirm_only，subsequentNights 為 radiant_earl_shield）。
- **目標限制**：canRadiantEarlShield 要求流光伯爵存活且未感染、round >= 2、目標不可為自己（earl.seatNumber）、不可與 lastRadiantEarlTarget 相同（不可連兩晚同一人）、目標須存活；允許 null 跳過。
- **免疫／反傷／連帶效果**：使 radiantShieldSeat 列入 isSpecialNightImmune，實作中免疫：wolf_kill / milk_pierce、assassin_wolf_kill、wolf_raven_claw_kill（注意：此項違反 12p-board-1cnivi6 原文「無法防住狼鴉之爪的無敵刀」）、witch_poison、awakened_witch_poison、dream_catcher_consecutive、dream_catcher_link、demon_hunter_kill、anubis_scale_kill、night_noble_servant_death。對 demon_hunter_backfire、white_snake_kill、xu_xian_kill、poisoner_poison 未套用免疫；蝕日侍女吞噬「流光反噬」完全未實作。
- **次數限制**：第二晚起每晚最多一次，透過 lastRadiantEarlTarget 阻斷連續兩晚庇護同一玩家。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'radiant_earl'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:565-594 (canRadiantEarlShield), src/logic/nightResolution.ts:851-862,1156-1159,1718,1781,1789,2188,2206,2394,2397,2527,3517, src/components/screens/NightConsoleScreen.tsx:1118-1131,1579-1581`
- **未實作／僅手動／斷鏈註記**：1) 蝕日侍女吞噬流光伯爵或被庇護者的「流光反噬」完全未實作；2) 12p-board-1cnivi6 無法防住狼鴉之爪無敵刀寫反為免疫；3) 獵魔人狩獵好人反彈未套用庇護免疫；4) 寂夜導師增幅第二庇護目標及免連守（qa_122）與保護蝕日侍女免反噬未實作。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:341-378 僅測試第 2 晚庇護目標免疫攝夢人連夢致死（共 2 處命中）。首夜禁用、不可連盾、不可自盾、防狼刀/防毒、與蝕日侍女流光反噬等皆無測試。

#### 50. 蝕時狼妃（`time_eclipse_consort`｜狼人陣營 / wolf）
- **觸發時機**：每晚行動（time_eclipse_lock）；可於白天發言／警上階段自爆（resolveSelfExplode 允許，放逐投票階段禁用），自爆不能開槍（checkCanShoot 僅限 hunter/wolf_king/awakened_hunter）。
- **目標限制**：canTimeEclipseLock 要求存活、!state.timeEclipseUsed、不可連續兩晚選 lastTimeEclipseTarget、目標須存活（允許封鎖自己或傳 null 跳過）。
- **免疫／反傷／連帶效果**：當 timeEclipseUsed 為 false 時，redirectSkillTarget（用於 guard、witch 毒、awakened_witch 毒、seer）與 dream_catcher 專屬分支會將神職對 timeEclipseLockedSeat 的操作反彈至神職自身（女巫解藥不反彈；12p-salon-night 攝夢人改為攝夢自己，其餘板子攝夢無效），生效一次後將 timeEclipseUsed 設為 true 失效。惟 nightValidation.ts:170-179 誤鎖了被封鎖者自身的所有 UI 技能按鈕。
- **次數限制**：每晚可指定一名玩家，但「反彈生效」整局僅限一次（timeEclipseUsed 設為 true 後 canTimeEclipseLock 即回傳 disallowed）；未觸發反彈前僅受不可連續兩晚封鎖同一人限制。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'time_eclipse_consort'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:236-259 (canTimeEclipseLock), src/logic/nightResolution.ts:814-824,1162-1183,1291-1308,1330-1342,1584,1653,1882, src/logic/nightValidation.ts:170-179, src/logic/dayResolution.ts:586-766`
- **未實作／僅手動／斷鏈註記**：1) nightValidation.ts 誤將封鎖對象自身 UI 操作全部鎖死；2) 10p/12p-cupid 烏鴉詛咒反彈、12p-salon-night 覺醒預言家/通靈師/獵魔人/奇蹟商人反彈未接線；3) resolveNight 未檢查是否遭夢魘恐懼；4) 次晚無狀態通知告知蝕時狼妃已失去技能。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:151-166 測試女巫毒被封鎖者反彈自毒及消耗一次性；src/logic/deepAuditFixes.test.ts:275-308 測試 12p-cupid 守衛反彈自守與不奶穿（共 3 處命中）。缺反彈守衛自守致奶穿（qa_049 Case 2）、烏鴉/覺醒預言家/通靈師/獵魔/奇蹟商人反彈及沙龍之夜攝夢自攝測試。

#### 51. 戰狼（`war_wolf`｜狼人陣營 / wolf）
- **觸發時機**：被動常駐免傷（夜間 killSeat、白天 resolveShoot 與 resolveKnightDuel）；夜晚參與 wolf_kill。白天自爆於 resolveSelfExplode:701 被強制禁用。
- **目標限制**：無戰狼專屬目標限制；狼隊共刀階段可參與點刀（可空刀或自刀）。
- **免疫／反傷／連帶效果**：在 killSeat、resolveShoot 與 resolveKnightDuel 呼叫 isWarWolfImmuneToDeath，使戰狼免疫：witch_poison、awakened_witch_poison、poisoner_poison、hunter_shoot、knight_duel（免死且騎士存活繼續白天）、pure_white_check_kill、dream_catcher_consecutive、dream_catcher_link、awakened_dream_catcher_kill。漏列 demon_hunter_kill、socialite_link 及覺醒獵人開槍 awakened_hunter_shoot。
- **次數限制**：被動免傷無次數上限；白天無法自爆。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'war_wolf'。12p-wolf-beauty-3 狼刀在先由全域預設 wolfKillPriority: true 生效。
- **程式碼定位**：`src/logic/interferenceRoles.ts:766-782 (GOD_SKILL_DEATH_REASONS, isWarWolfImmuneToDeath), src/logic/nightResolution.ts:334, src/logic/dayResolution.ts:295,701,1066`
- **未實作／僅手動／斷鏈註記**：1) 未免疫獵魔人狩獵（demon_hunter_kill）與名媛殉情（socialite_link）及覺醒獵人開槍（awakened_hunter_shoot）；2) 程式碼禁止戰狼自爆（dayResolution.ts:701），與 bucket_5.json 通用狼刀模板內的自爆敘述不一致。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:437-470 驗證免疫獵人開槍與騎士決鬥，可被白天放逐出局；src/logic/deepAuditFixes.test.ts:249-257 驗證戰狼不可自爆（共 3 處命中）。缺乏免疫雙女巫毒藥、攝夢連夢/共死及與獵魔人/名媛交互測試。

#### 52. 煉金魔女（`alchemy_witch`｜好人陣營 / god）
- **觸發時機**：每晚可選擇發動未明之霧（alchemy_witch_fog），夜尾確認死亡資訊（alchemy_witch_snake）；隔天白天由 DayAnnouncementScreen 延遲抽屜手動發動 reviveWithAlchemySnake。
- **目標限制**：canAlchemyWitchUseFog 要求存活且未感染、!alchemyFogUsed、必須指定 3 位不重複的存活玩家（或傳空陣列跳過）。法老之蛇於白天針對夜死玩家發動。
- **免疫／反傷／連帶效果**：未明之霧發動後，resolveNight:1459-1468 強制普通狼刀目標必須在該 3 名玩家內且不可空刀（除非狼隊被封刀），wolf_raven_claw_kill 不受此限制。法老之蛇於夜結算紀錄 deaths[0].seat 至 alchemySnakePendingVictimSeat，白天由 resolveAlchemySnakeRevive 復活該玩家並清除死亡欄位。惟未實作「先發言再報死訊」、多死者選一及復活後同步移除 pendingShooters。
- **次數限制**：alchemyFogUsed（未明之霧）與 alchemySnakeUsed（法老之蛇）各整局限定使用一次。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'alchemy_witch'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:532-558 (canAlchemyWitchUseFog), src/logic/nightResolution.ts:738-748,1458-1468,2478-2483, src/logic/nightValidation.ts:358-362, src/logic/dayResolution.ts:1155-1180 (resolveAlchemySnakeRevive), src/store/gameStore.ts:2051-2077, src/components/screens/DayAnnouncementScreen.tsx:115-120,455-471, src/components/screens/NightConsoleScreen.tsx:1000-1020,3269-3287`
- **未實作／僅手動／斷鏈註記**：1) 未實作「法老之蛇未用且煉金魔女存活時，白天先發言再公布死訊」之白天階段順序；2) 多人夜死時僅記錄 deaths[0].seat 無法任選死者；3) 復活未同步清理 pendingShooters 且未驗煉金魔女仍存活；4) NightConsoleScreen 未限制未明之霧後 wolf_kill 的座位點擊，且法老之蛇步驟僅顯示 wolfTarget。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:280-339 驗證未明之霧限 3 目標且禁空刀、記錄 alchemySnakePendingVictimSeat 與 resolveAlchemySnakeRevive 救活（共 2 處命中）。缺乏 wolf_raven_claw 不受霧限制測試、多死選救測試與日間延遲公告時序測試。

#### 53. 企鵝（`penguin`｜好人陣營 / god）
- **觸發時機**：每晚最優先階段行動（penguin_freeze），若當晚遭夢魘恐懼則自身行動無效。
- **目標限制**：canPenguinFreeze 要求存活且未感染，不可與 lastPenguinTarget 相同，目標須存活（允許冰凍自己或傳 null 跳過）。
- **免疫／反傷／連帶效果**：penguinFrozeWolf 使 wolfTeamBlocked = true（含種狼無法感染）；penguinFrozenSeat 使 isSeatBlockedByInterference 為 true，並單獨阻斷 socialite、enchanter、witch（全藥封鎖）、seer、guard、wolf_beauty、mute_elder、demon_hunter、bee_wild_hunt、awakened_witch。但 resolveNight 中 fox_check（isRoleBlocked）與 crow_curse 未檢查 penguinFrozenSeat；nightValidation 的 wolf_kill 亦未因凍狼鎖定步驟與提示具體狼座號。
- **次數限制**：每晚一次，透過 lastPenguinTarget 阻斷連續兩晚冰凍同一人。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'penguin'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:265-285 (canPenguinFreeze), src/logic/nightResolution.ts:592-618,871,892,1143,1151,1576,1878,2467,2516,2556, src/logic/nightValidation.ts:159-167, src/components/screens/NightConsoleScreen.tsx:1043-1051`
- **未實作／僅手動／斷鏈註記**：1) nightValidation 與 NightConsoleScreen 在企鵝凍到狼人時未鎖定 wolf_kill 步驟，也未向狼隊顯示被冰凍的具體狼人座號；2) resolveNight 的 fox_check 與 crow_curse 未檢查 penguinFrozenSeat（僅 UI nightValidation 有鎖定）。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:168-200 驗證企鵝冰凍狼人導致狼隊空刀（共 2 處命中）。缺乏不可連凍同一人、冰凍神職阻斷（如狐狸/烏鴉）及被夢魘恐懼時企鵝自身失能測試。

#### 54. 寂夜導師（`silent_night_mentor`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚於狼隊前行動（silent_night_mentor_action；首夜僅 confirm_only）；白天不可自爆（dayResolution.ts:692）。
- **目標限制**：canSilentNightMentorAct 要求存活、round >= 2、對應模式次數未用、目標存活；雖可點擊白晝學者或自己，但 resolveMentorScholarInteraction 會過濾對導師／學者的效果（仍消耗次數）。
- **免疫／反傷／連帶效果**：1) 與白晝學者彼此免疫增幅／削弱（filterImmune）；2) 同晚對同一非免疫玩家施技則雙方無效且該玩家隔天死（mentor_scholar_clash）；3) 同晚皆對小狼（roleId === 'wolf'）施技則技能不變且寂夜導師隔天死；4) 所有其他狼人出局後透過 syncSilentNightMentorTeamStatus 入狼隊；5) 削弱（weaken）阻止目標使用技能（女巫僅禁毒、仍可用解藥）與狼人削弱封刀，但未實作任何「增幅」實際效果與削弱流光/蝕日侍女。
- **次數限制**：silentNightMentorAmplifyUsed 與 silentNightMentorWeakenUsed 各全場一次，同一晚只能擇一模式（amplify 或 weaken）或跳過。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'silent_night_mentor'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:360-388,422-487 (canSilentNightMentorAct, syncSilentNightMentorTeamStatus, resolveMentorScholarInteraction), src/logic/nightResolution.ts:668-721,2407-2409,2489-2492, src/logic/dayResolution.ts:692-698, src/logic/nightValidation.ts:194-245, src/components/screens/NightConsoleScreen.tsx:1079-1093,1564-1569,3289-3325`
- **未實作／僅手動／斷鏈註記**：1) 增幅（amplify）第二目標選擇與額外行動結算（含增幅蝕日侍女／導師單殺及免被吞噬）完全未實作；2) 削弱狼人時 nightValidation 未鎖死 wolf_kill 步驟；3) 削弱 radiant_earl 與 eclipse_maid 於 resolveNight 未生效；4) 導師未入狼隊前夜間 UI 仍與狼同步驟（依賴口頭確認）。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:232-278 與 src/logic/bugfixBatch19.test.ts:276-304 驗證不可自爆、與白晝學者同選衝突致死、女巫被削弱仍可用解藥及 nightValidation 鎖定（共 3 處命中）。缺乏第二晚起限制、入狼隊、增幅功能及兩者皆選小狼時導師死亡之測試。

#### 55. 名媛（`socialite`｜好人陣營 / god）
- **觸發時機**：每晚於狼刀前行動（socialite_favor）；若當晚遭夢魘恐懼或企鵝冰凍則無法發動。
- **目標限制**：canSocialiteFavor 要求存活且未感染，不可與 lastSocialiteTarget 相同，目標須存活；允許選自己（但 line 1528 排除自寵阻刀）。
- **免疫／反傷／連帶效果**：若狼刀目標等於名媛寵幸目標（且非名媛自己），resolveNight:1523-1532 將 effectiveWolfTarget 設為 null 且阻斷種狼感染（socialiteBlockedWolfKill），目標免疫狼刀；但不防女巫毒。若名媛當晚夜死或遭種狼感染（!socialiteNow.isAlive || socialiteNow.infectedBySeedWolf），resolveNight:2449 以 'socialite_link' 殺死寵幸者。漏缺：UI 女巫未隱藏刀口、獵人殉情無法開槍、戰狼未免疫 socialite_link。
- **次數限制**：每晚一次，透過 lastSocialiteTarget 阻斷連續兩晚寵幸同一玩家。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'socialite'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:596-618 (canSocialiteFavor), src/logic/nightResolution.ts:864-882,1523-1535,2447-2452, src/components/screens/NightConsoleScreen.tsx:1132-1140,1582-1584`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen 未於名媛阻刀時對女巫隱藏刀口；2) HUNTER_SHOOTABLE_REASONS 漏列 'socialite_link' 致殉情獵人無法開槍；3) 12p-socialite 戰狼未免疫 'socialite_link'；4) 名媛被石化/削弱時 resolveNight 未阻斷其技能。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:341-380 僅驗證寵幸目標遭狼刀轉空刀存活（共 2 處命中）。缺乏不可連寵幸同一人、名媛夜死／被感染時寵幸者殉情、戰狼免疫殉情、以及女巫毒殺寵幸者測試。

#### 56. 白晝學者（`daylight_scholar`｜好人陣營 / god）
- **觸發時機**：第二晚起每晚行動（daylight_scholar_action；首夜僅 confirm_only）。
- **目標限制**：canDaylightScholarAct 要求存活且未感染、round >= 2、對應模式次數未用、目標存活；對自己或寂夜導師施放會被 filterImmune 無效化（仍耗次數）。
- **免疫／反傷／連帶效果**：與寂夜導師彼此互免增幅／削弱（filterImmune）；同晚對同一人施技則雙方無效且目標死於 mentor_scholar_clash；同晚皆選小狼則狼隊照常行動且寂夜導師死。削弱可禁用一般目標夜間技能（女巫保留解藥僅禁毒），但增幅完全未實作。
- **次數限制**：daylightScholarAmplifyUsed 與 daylightScholarWeakenUsed 各全場一次，每晚僅能使用其中一個技能。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'daylight_scholar'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:390-420,441-487 (canDaylightScholarAct, resolveMentorScholarInteraction), src/logic/nightResolution.ts:687-721,2407-2409, src/logic/nightValidation.ts:194-245, src/components/screens/NightConsoleScreen.tsx:1094-1108,1570-1575,3289-3325`
- **未實作／僅手動／斷鏈註記**：1) 增幅（amplify）第二目標與額外技能結算完全未實作；2) 削弱狼人時 nightValidation 未鎖定 wolf_kill；3) NightConsoleScreen 選擇模式後未強制選擇目標座位即允許確認。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:232-278 測試與寂夜導師同選一人衝突死亡（共 2 處命中）。缺乏第二晚限制、彼此互免、增幅功能、及削弱單體神職測試。

#### 57. 蠱惑師（`enchanter`｜好人陣營 / god）
- **觸發時機**：每晚行動（enchanter_bewitch）；遭夢魘恐懼或企鵝冰凍則無法發動。
- **目標限制**：canEnchanterBewitch 要求存活且未感染，不可選自己（enchanter.seatNumber），目標須存活（允許連續兩晚選同一人以觸發心智混亂致死，或傳 null 跳過）。
- **免疫／反傷／連帶效果**：若蠱惑師當晚位於 deaths（且當晚有有效蠱惑目標），8.55 階段將蠱惑師移出 deaths 恢復存活，改殺 enchanterTargetSeat（'enchanter_substitute'）；否則若與 lastEnchanterTarget 相同則殺目標（'enchanter_consecutive'）。惟 12p-wolf-beauty-3 啟用 wolfKillPriority 時，若蠱惑師為最後一神被狼刀，會在 2097 行先判狼勝而無法觸發替死；且替死／連蠱死因未接入獵人／狼王開槍。
- **次數限制**：每晚一次，無冷卻與全場次數限制；連續兩晚選同一人會使目標因 enchanter_consecutive 死亡。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'enchanter'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:620-641 (canEnchanterBewitch), src/logic/nightResolution.ts:884-905,2430-2444, src/components/screens/NightConsoleScreen.tsx:1141-1149,1585-1587`
- **未實作／僅手動／斷鏈註記**：1) wolfKillPriority 會在蠱惑師替死前誤判最後一神出局狼勝；2) 'enchanter_substitute' 與 'enchanter_consecutive' 未接入開槍理由集合；3) 若被梅杜莎石化／導師削弱未阻斷技能；4) 未考量 12p-wolf-beauty-3 戰狼是否應免疫神職替死。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:385-400 僅驗證蠱惑師當晚被狼刀由被蠱惑者替死（共 2 處命中）。缺乏連續兩晚蠱惑同一人致死（enchanter_consecutive）及開槍/狼刀在先交互測試。

#### 58. 子狐（`fox_cub`｜好人陣營 / god）
- **觸發時機**：自第二晚起每晚可用（10p/12p-animal-dream 首夜為 confirm_only，次夜起為 fox_cub_charm）；遭夢魘恐懼則當晚無效。
- **目標限制**：canFoxCubCharm 要求存活且未感染、round >= 2、!foxCubUsed、目標存活（可選自己或任何存活玩家，或傳 null 跳過不消耗次數）。
- **免疫／反傷／連帶效果**：魅惑狼陣營玩家時，foxCubCharmedWolf 使 wolfTeamBlocked = true（當晚狼隊不可刀人）；若魅惑目標為狼美人（foxCubCharmedSeat === aliveWolfBeauty.seatNumber），wolfBeautyFeared = true 阻斷狼美人當晚魅惑；魅惑好人則僅消耗次數無事發生。惟 nightValidation 與 NightConsoleScreen 未對應鎖定 wolf_kill 與 wolf_beauty_charm 步驟。
- **次數限制**：foxCubUsed 布林值限制全場僅能發動並消耗一次。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'fox_cub'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:287-311 (canFoxCubCharm), src/logic/nightResolution.ts:620-647,1152,1381-1385, src/components/screens/NightConsoleScreen.tsx:1052-1060,1555-1557`
- **未實作／僅手動／斷鏈註記**：1) nightValidation.ts 與 NightConsoleScreen 未因 foxCubCharmTarget 鎖定狼隊狼刀與狼美人魅惑步驟；2) nightValidation.ts 未在 foxCubUsed 為 true 後鎖定 fox_cub_charm 步驟；3) resolveNight 未檢查是否遭企鵝冰凍。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:216-229 驗證第 2 晚魅惑狼人導致狼隊空刀且消耗一次性技能（共 2 處命中）。缺乏首夜禁止、魅惑好人無事發生、與魅惑狼美人阻斷魅惑測試。

#### 59. 覺醒女巫（`awakened_witch`｜好人陣營 / god）
- **觸發時機**：每晚行動（awakened_witch_action）；若被恐懼/冰凍/石化/削弱/血月封印則當晚無法用藥。
- **目標限制**：解藥依 ruleOverrides.witchSelfSave 限制自救（且空刀禁用）；毒藥不可與解藥同晚使用，目標須存活，且必須選擇 (已用毒數 + 1) 位不重複且未出現在 awakenedWitchUsedHelpers 的存活玩家（允許含覺醒女巫自己）。
- **免疫／反傷／連帶效果**：解藥救活被狼刀者（同守同救仍觸發 milk_pierce）；毒藥需 1/2/3 位未曾擔任過協助者之存活玩家（可選自己），無論 awakenedWitchHelpersApproved 是否同意皆消耗毒次與協助者名單；同意時目標以 'awakened_witch_poison' 死亡（受流光/黑夜使者/惡靈/惡魔免疫，遇梅杜莎石化反彈，且列入 POISON_DEATH_REASONS 禁止獵人/狼王開槍）。惟 UI 未檢核協助者人數與自救限制，亦未在面板顯示刀口。
- **次數限制**：全場 1 瓶解藥（awakenedWitchAntidoteUsed）與 3 瓶毒藥（awakenedWitchPoisonsUsed < 3），協助者不可跨瓶重複。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'awakened_witch'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:697-760 (canAwakenedWitchUseAntidote, canAwakenedWitchUsePoison), src/logic/nightResolution.ts:1619-1660,2203-2215,3513,3544, src/logic/dayResolution.ts:71, src/components/screens/NightConsoleScreen.tsx:1172-1187,1597-1604,3327-3408`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen 的 pendingValidation 未檢核 awakened_witch_action（未選滿協助者或違規自救未在 UI 阻擋）；2) 面板與線上法官模式未顯示今晚狼刀對象供使用解藥；3) nightValidation.ts 未在雙藥耗盡時鎖定步驟。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:402-426 驗證第 1 瓶毒選 1 位協助者並同意投毒（共 2 處命中）。缺乏解藥救人、不能同晚雙開、自救限制、第 2/3 瓶需 2/3 位協助者、協助者重複阻斷、協助者反對仍耗毒次、及被毒死禁開槍測試。

#### 60. 黑蝙蝠（`black_bat`｜狼人陣營 / wolf）
- **觸發時機**：每晚狼隊後行動（black_bat_shield）；白天可自爆（未在禁用自爆清單）。
- **目標限制**：canBlackBatShield 要求存活、!blackBatReflectUsed、不可與 lastBlackBatTarget 相同、目標須存活；允許庇護自己（bat.seatNumber）或傳 null 跳過。
- **免疫／反傷／連帶效果**：透過 trackBlackBatTarget 依 resolveNight 結算順序（guard -> witch 毒 -> awakened_witch 毒 -> seer）記錄施放者至 blackBatCasters，若非空且 !blackBatReflectUsed，則消耗 blackBatReflectUsed = true 並僅反殺 blackBatCasters[0]（'black_bat_reflect'）；被庇護者本身不免疫女巫毒藥。漏缺：未追蹤女巫解藥，且被反殺之守衛其防護仍有效。
- **次數限制**：每晚可選一人庇護，一旦成功觸發反彈（blackBatReflectUsed = true），後續夜晚即無法再使用庇護。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'black_bat'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:643-666 (canBlackBatShield), src/logic/nightResolution.ts:826-836,1186-1196,1308,1587,1658,1884,2411-2415,3518, src/components/screens/NightConsoleScreen.tsx:1150-1158,1588-1590`
- **未實作／僅手動／斷鏈註記**：1) 女巫使用解藥對被庇護者施放技能時未觸發 trackBlackBatTarget 反彈；2) 若守衛因保護被庇護者而遭黑蝙蝠反彈死亡，該守衛的防護（effectiveGuardTarget）仍替被庇護者擋下狼刀。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:341-382 測試庇護 6 號使預言家驗 6 號被反彈死亡（共 2 處命中）。缺乏不能連庇護、可庇護自己、反彈成功後技能永久失效、以及守衛與女巫同時施放之優先死亡順序測試。

#### 61. 黑夜使者（`dark_night_envoy`｜狼人陣營 / wolf）
- **觸發時機**：每晚狼隊後行動（dark_night_envoy_shield）；白天可自爆（未在禁用清單）。
- **目標限制**：canDarkNightEnvoyShield 要求存活、不可與 lastDarkNightEnvoyTarget 相同、目標須存活且 isSeatWolfFaction(target) 為 true（僅限狼陣營，含可庇護自己）。
- **免疫／反傷／連帶效果**：將 darkNightEnvoyShieldSeat 列入 isSpecialNightImmune（免疫狼刀、奶穿、女巫毒、攝夢連夢/共死、獵魔等夜間傷害）；若當晚被庇護狼人遭預言家查驗、女巫/覺醒女巫潑毒、或攝夢人連續兩晚雙攝，於 8.5/8.55 反殺所有該些施法者（'dark_night_envoy_counter'）。
- **次數限制**：每晚一次（無全場次數限制），透過 lastDarkNightEnvoyTarget 阻斷連續兩晚庇護同一位狼人。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'dark_night_envoy'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:668-691 (canDarkNightEnvoyShield), src/logic/nightResolution.ts:838-848,1158,2392-2393,2417-2428,3519, src/components/screens/NightConsoleScreen.tsx:1159-1171,1591-1593`
- **未實作／僅手動／斷鏈註記**：無核心規則缺口（僅缺預言家與攝夢人反殺之獨立單元測試）。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:341-384 僅測試女巫毒被庇護狼人遭反殺（共 2 處命中）。缺乏僅能庇護狼陣營、不可連選、免疫夜間傷害、預言家查驗反殺與攝夢人雙攝反殺測試。

#### 62. 占卜師（`fortune_teller`｜好人陣營 / god）
- **觸發時機**：每晚第一個行動（fortune_teller_mark）。
- **目標限制**：canFortuneTellerMark 要求存活且未感染、!fortuneTellerUsed、目標須存活（允許標記自己或傳 null 跳過）。
- **免疫／反傷／連帶效果**：標記後以 findAliveNeighbors 取得標記座位與左右存活鄰居（共最多 3 席），於 resolveNight:1453 限制 wolfTarget 與 1813 限制 bigGreyWolfKillTarget 僅能擊殺該範圍內玩家（狼隊仍可空刀）。NightConsoleScreen 未同步對 wolf_kill 與 big_grey_wolf_kill 過濾座位。
- **次數限制**：fortuneTellerUsed 布林值限制全場只能發動並消耗一次。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'fortune_teller'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:493-530 (canFortuneTellerMark, getFortuneTellerAllowedKillSeats), src/logic/nightResolution.ts:723-736,1453-1457,1813-1820, src/logic/combatRoles.ts:171-183 (canBigGreyWolfKill), src/components/screens/NightConsoleScreen.tsx:1109-1117,1576-1578`
- **未實作／僅手動／斷鏈註記**：NightConsoleScreen.tsx 在 wolf_kill 與 big_grey_wolf_kill 步驟未依據占卜師標記禁用範圍外座位（且呼叫 canBigGreyWolfKill 漏傳 fortuneAllowedSeats），以及 nightValidation 未在已用後鎖定步驟。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:280-305 驗證標記後狼刀範圍外目標被阻擋拋錯（共 2 處命中）。缺乏大灰狼單刀受占卜師標記限制及僅能使用一次之測試。

#### 63. 梅杜莎（`medusa`｜狼人陣營 / wolf）
- **觸發時機**：每晚於狼隊之前行動（medusa_petrify）；白天可自爆（resolveSelfExplode 允許）。
- **目標限制**：canMedusaPetrify 要求存活、不可選自己（medusa.seatNumber）、不可與 lastMedusaTarget 相同、目標須存活；允許傳 null 跳過。狼刀階段禁止自刀（nightResolution:1506）。
- **免疫／反傷／連帶效果**：被石化者（petrified = true 持續至下個夜晚開始）：1) 反彈雙女巫毒藥致死（medusa_poison_reflect）；2) 無法使用當晚技能（含女巫解毒皆封鎖、狼人則僅該名狼人失能）；3) 白天無放逐投票權且白痴被放逐不可翻牌；4) 梅杜莎夜間死亡或白天被放逐時，石化者跟隨出局（medusa_petrify_link）；梅杜莎自爆不牽連。漏缺：perseus_execute 在 nightResolution:2597 晚於 medusa_petrify_link (2455)，導致珀爾修斯處決梅杜莎時石化者不會跟隨出局。
- **次數限制**：每晚一次，透過 lastMedusaTarget 阻斷連續兩晚石化同一名玩家。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'medusa'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:331-354 (canMedusaPetrify), src/logic/nightResolution.ts:433,649-666,1144,1505-1512,1577,2193-2194,2210-2211,2455-2460,2598, src/logic/dayResolution.ts:497,534-548, src/logic/voting.ts:40,102-104, src/logic/nightValidation.ts:145-155, src/components/screens/NightConsoleScreen.tsx:1070-1078,1561-1563`
- **未實作／僅手動／斷鏈註記**：1) 12p-medusa 中珀爾修斯夜間處決梅杜莎時，石化者未跟隨出局（結算順序錯誤）；2) nightValidation.ts:146 未豁免免疫石化的 perseus_execute；3) NightConsoleScreen 的 wolf_kill 未禁用梅杜莎自刀。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:168-215 驗證石化反彈女巫毒、禁止投票與白痴放逐無法翻牌；src/logic/combatRoles.test.ts:191-225 驗證珀爾修斯處決石化目標反噬（共 3 處命中）。缺乏不可自刀、不可連選同一人、梅杜莎被放逐連帶石化者出局、及梅杜莎自爆不連帶測試。

#### 64. 禁言長老（`mute_elder`｜好人陣營 / god）
- **觸發時機**：每晚行動（mute_elder_mute）；若遭夢魘恐懼、企鵝冰凍、睡美人睡眠等封鎖則無效。
- **目標限制**：canMuteElderMute 要求存活且未感染、目標須存活（允許禁言自己、允許連續兩晚禁言同一人、允許 null 跳過）。
- **免疫／反傷／連帶效果**：每晚入夜重置 muted = false 與 activeMutedSeat = null；於 8.55 階段設定 muted = true 與 activeMutedSeat；若禁言長老處於睡美人睡眠狀態（isSeatAsleep），於 8.68h 清除 muted 與 activeMutedSeat。白天僅透過 NightStatusBanners 顯示禁言膠囊，SpeakingTimerPanel 未強制跳過。另有重大順序問題：2468 行以狼刀後 updatedSeats 驗證 canMuteElderMute，選中當晚死者會拋錯。
- **次數限制**：每晚一次，無不可連選與全場次數限制。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts 計入 gods；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'mute_elder'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:313-329 (canMuteElderMute), src/logic/nightResolution.ts:434,455,2462-2475,3185-3189, src/components/day/NightStatusBanners.tsx:34-41, src/components/screens/NightConsoleScreen.tsx:1061-1069,1558-1560`
- **未實作／僅手動／斷鏈註記**：1) resolveNight:2468 以狼刀後 updatedSeats 檢查目標存活，選到當晚剛死者會在 finishNight 拋錯；2) 白天禁言僅靠狀態膠囊提醒法官口頭執行（手動主持）。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:168-201 僅驗證設定 seat.muted = true（共 2 處命中）。缺乏入睡清除禁言、目標當晚被刀死後禁言崩潰風險與次晚清除測試。

#### 65. 詭術師（`trickster_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚行動（trickster_wolf_swap），換票效果僅隔天白天放逐投票有效；白天發言／警上階段可自爆。
- **目標限制**：canTricksterWolfSwap 要求存活、不可與 lastTricksterPair 中任一號碼重複（不可連續兩晚選同一號碼）、不可兩邊同號或單邊 null、目標須存活；允許空換 [null, null] 或換自己。
- **免疫／反傷／連帶效果**：若與魔術師選擇相同兩號碼則相互抵銷（activeTricksterVoteSwap = null）；否則次日白天放逐計票時 tallyExileVotes 對調兩位玩家總票數與得票來源（votersByTarget）。惟未檢查換票雙方是否皆存活且均在 PK 候選內，可能造成投出已死玩家或非 PK 玩家；ExileVotePanel 預覽亦未套用換票。
- **次數限制**：每晚可交換一組（或空換），透過 lastTricksterPair 阻斷連續兩晚選擇同一號碼。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'trickster_wolf'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:65-75,163-192 (isSameSwapPair, canTricksterWolfSwap), src/logic/nightResolution.ts:760-781, src/logic/voting.ts:140-163 (tallyExileVotes), src/store/gameStore.ts:1747, src/components/day/NightStatusBanners.tsx:52-60, src/components/screens/NightConsoleScreen.tsx:974-999,1543-1545`
- **未實作／僅手動／斷鏈註記**：1) tallyExileVotes 未驗證換票兩方皆存活且在 PK 候選名單內；2) ExileVotePanel 預覽未傳入 tricksterVoteSwap；3) NightConsoleScreen 未阻擋僅選 1 人的半套操作。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:68-106 驗證與魔術師同換抵銷與隔天換票放逐結果（共 2 處命中）。缺乏不可連續兩晚選同一號碼及 PK 輪/死者換票邊界測試。

#### 66. 搗蛋鬼（`troublemaker_wolf`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚於狼隊前行動（12p-troublemaker-wolf 首夜為 confirm_only，次夜起為 troublemaker_prank）；白天不可自爆（dayResolution.ts:684）。
- **目標限制**：canTroublemakerPrank 要求存活、不可選自己（tm.seatNumber）、不可連續兩晚選 lastTroublemakerTarget、目標須存活；允許傳 null 跳過。
- **免疫／反傷／連帶效果**：若被耍寶者為夜間施法神職（guard、witch 毒、awakened_witch 毒、seer），redirectSkillTarget 將技能目標轉為施法者自己（若為守衛且上晚已自守則死亡 troublemaker_self_guard）；若被耍寶者為狼陣營且狼隊有落刀，狼刀轉為該狼人自刀；所有其他狼人出局後透過 syncTroublemakerTeamStatus 入狼隊。惟獵人被耍寶出局開槍帶走自己完全未實作。
- **次數限制**：每晚一次，透過 lastTroublemakerTarget 阻斷連續兩晚對同一人耍寶。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'troublemaker_wolf'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:198-234 (canTroublemakerPrank, syncTroublemakerTeamStatus), src/logic/nightResolution.ts:802-812,1169-1171,1294-1301,1470-1484,2403-2405,2485-2488, src/logic/dayResolution.ts:684-690, src/components/screens/NightConsoleScreen.tsx:1021-1033,1546-1548`
- **未實作／僅手動／斷鏈註記**：1) 獵人被搗蛋鬼耍寶後「無論日槍或夜槍，出局開槍帶走自己」完全未實作（resolveShoot 反而禁止自射）；2) NightConsoleScreen 女巫刀口顯示未反映狼隊被耍寶後的自刀轉移；3) 搗蛋鬼未入狼隊前夜間 UI 仍與狼同步驟（依賴口頭確認）。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:124-150 驗證搗蛋鬼不可自爆與耍寶守衛致連兩晚自守死亡（共 2 處命中）。缺乏耍寶狼人轉自刀、耍寶神職反彈自己、全狼死光入狼隊及獵人開槍自帶測試。

#### 67. 狼術師（`wolf_warlock`｜狼人陣營 / wolf）
- **觸發時機**：每晚於魔術師之後行動（wolf_warlock_swap），僅當晚有效；白天發言／警上階段可自爆。
- **目標限制**：canWolfWarlockSwap 要求存活、不可兩邊同號或單邊 null、不可選 wolfWarlockSwappedSeats 中已使用過的號碼、目標須存活；允許空換 [null, null] 或換自己。
- **免疫／反傷／連帶效果**：於魔術師之後執行 applyTargetSwaps([effectiveMagicianPair, effectiveWolfWarlockPair])，對 guard、wolf_kill、witch 毒、awakened_witch 毒、seer 目標進行對調；與魔術師擁有獨立的已換號碼清單 wolfWarlockSwappedSeats。夜槍 resolveShoot 與其餘技能未套用對調。
- **次數限制**：每晚可換一組（或空換），wolfWarlockSwappedSeats 持久化記錄整局每個號碼牌僅限交換一次。
- **勝利條件／查驗判定**：屬狼人陣營（faction: 'wolf'），victory.ts 計入 wolves；getSeerCheckResult 判為 'wolf'（查殺）；getPsychicCheckResult 回傳 'wolf_warlock'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:76-97,132-161 (applyTargetSwaps, canWolfWarlockSwap), src/logic/nightResolution.ts:782-800,1168,1486,1584,1653,1882, src/components/screens/NightConsoleScreen.tsx:974-999,1540-1542,3256-3267`
- **未實作／僅手動／斷鏈註記**：1) 12p-board-1hvme02 夜槍帶走對調目標未接線；2) NightConsoleScreen 預言家即時查驗與女巫刀口預覽未套用狼術師換位；3) UI 未阻擋僅選 1 人的半套操作。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:107-122 僅測試單獨交換 2 & 3 使狼刀 2 改死 3（共 2 處命中）。缺乏魔術師→狼術師複合順序（12p-board-1hvme02 案例）、整局限換一次阻斷及夜槍換位測試。

#### 68. 白貓（`white_cat`｜好人陣營 / god）
- **觸發時機**：任何致死時機被動翻牌（killSeat / resolveShoot / resolveDayExile），延遲死亡應於「下一次放逐階段結束後」觸發（目前僅能透過 DayAnnouncementScreen 延遲抽屜手動呼叫 triggerWhiteCatDelayedDeath）。
- **目標限制**：被動觸發角色，無主動目標限制；已被種狼感染後（infectedBySeedWolf）失去翻牌免死能力。
- **免疫／反傷／連帶效果**：於 killSeat、resolveShoot、resolveDayExile 呼叫 shouldWhiteCatSurviveDeath：未感染的白貓任何死亡（除 white_cat_delayed_death 與 manual_judge）皆標記 whiteCatRevealed = true 並維持 isAlive = true；已翻牌期間再次於上述三函式遇死亦免疫；resolvePufferfishExplode 排除已翻牌白貓。惟狼美人殉情（applyWolfBeautyCharmDeath）、未翻牌白貓遭河豚炸死、白狼王自爆帶人等皆漏接保護；延遲死亡按鈕亦誤置於 DayAnnouncementScreen 而非放逐投票結束後。
- **次數限制**：翻牌免死限觸發一次（翻牌後免疫期間延至下次放逐結束死亡）；每次觸發僅對應一輪延遲死亡。
- **勝利條件／查驗判定**：屬好人陣營神職（category: 'god'），victory.ts:100-106 在 whiteCatRevealed 期間因 isAlive 仍為 true 故計入存活 gods（符合最後一神白貓被刀不判狼勝、推最後一狼判好人勝之 Tip）；getSeerCheckResult 判為 'good'（感染後轉 'wolf'）；getPsychicCheckResult 回傳 'white_cat'。
- **程式碼定位**：`src/logic/interferenceRoles.ts:785-799 (shouldWhiteCatSurviveDeath), src/logic/nightResolution.ts:346-354, src/logic/dayResolution.ts:291-315,468-490,1109-1150, src/logic/combatRoles.ts:381, src/logic/victory.ts:100-106, src/store/gameStore.ts:2079-2108, src/components/screens/DayAnnouncementScreen.tsx:120-126,473-487`
- **未實作／僅手動／斷鏈註記**：1) 狼美人殉情、未翻牌被河豚炸死、白狼王帶走等未接線 shouldWhiteCatSurviveDeath；2) 延遲死亡結算僅於 DayAnnouncementScreen 提供且 advanceToNextNight 不會自動執行；3) 白天放逐翻牌免死時 exileResolvedToday 誤記為 'exile'；4) triggerWhiteCatDelayedDeath 未執行 finalizeDayDeathSync。
- **現有行為測試覆蓋**：src/logic/interferenceRoles.test.ts:402-436 驗證被覺醒女巫毒殺翻牌免死與 resolveWhiteCatDelayedDeath 出局（共 2 處命中）。缺乏夜間狼刀翻牌後勝利判定（最後一神 Tip）、白天投票/開槍免死、及與狼美人/河豚交互測試。

### 2.6 戰鬥／開槍／帶人系角色（20 名）

#### 69. 獵魔人（`demon_hunter`｜好人陣營 / god）
- **觸發時機**：第二晚起每晚夜間步驟 demon_hunter_hunt 觸發（於 nightResolution 步驟 8.58 結算）。
- **目標限制**：round >= 2 起可選 1 名存活且非自己的玩家（可傳 null 跳過）；受血月封印、夢魘恐懼、企鵝冰凍、梅杜莎石化、導師/學者削弱封鎖；被種狼感染後失能。
- **免疫／反傷／連帶效果**：1) isDemonHunterImmuneToPoison：未受種狼感染時免疫 witch_poison 與 awakened_witch_poison（不免疫 poisoner_poison／mech_wolf_poison）；2) 狩獵到夜之貴族的 nightNobleServantSeat 時抵消夜僕狀態，雙方不死且可於隔晚重選夜僕；3) 狩獵目標若為狼人陣營（isSeatWolfFaction）則目標死於 demon_hunter_kill（受夢遊者保護與特殊夜免保護，但未納入戰狼免疫）；4) 狩獵目標為非狼人（好人或咒狐）則獵魔人自身死於 demon_hunter_backfire（守衛與攝夢不擋反傷）；5) 目標會觸發猩紅之子（godSkillTargets 含 demonHunterTarget）。
- **次數限制**：第二晚起每晚可使用 1 次，無全場次數上限（直至出局或被感染）。
- **勝利條件／查驗判定**：好人陣營神職（god），計入好人神邊屠邊數；預言家驗為金水（被感染/轉化/傀儡化後為查殺），通靈師/石像鬼/純白驗為 demon_hunter。
- **程式碼定位**：`src/logic/combatRoles.ts:61-80; src/logic/nightResolution.ts:334,2508-2535,2645,3283-3303; src/components/screens/NightConsoleScreen.tsx:1188-1191,1605-1607`
- **未實作／僅手動／斷鏈註記**：1) 12p-war-wolf 原文「戰狼除外」未實作（GOD_SKILL_DEATH_REASONS 漏了 demon_hunter_kill，戰狼會被狩死）；2) 12p-salon-night（2 獵魔人）與 multi-lianliankan（4 獵魔人）僅支援單一 draft.demonHunterTarget，多人同時行動會互相覆蓋。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試覆蓋（測毒免疫、殺狼、自死、抵消夜僕）；finalBatchRoles.test.ts 有 1 處測試覆蓋（蝕日侍女吞獵魔人）；gameStore.test.ts 僅於 multi-lianliankan 跑 confirm_only，無實際狩獵行為斷言。整體中等，缺戰狼獵魔與多獵魔人板測試。

#### 70. 河豚（`pufferfish`｜好人陣營 / god）
- **觸發時機**：白天放逐投票階段可手動呼叫 gameStore.pufferfishExplode（UI 未接線）；夜間吃狼刀時於 nightResolution 步驟 8.58 自動觸發翻牌並顯示於 DayAnnouncementScreen。
- **目標限制**：傳入之 voterSeatsForPufferfish 去重後，僅炸死仍存活且非「已翻牌白貓（roleId === 'white_cat' && whiteCatRevealed）」之投票者；若過濾後為空陣列則不可翻牌。未檢查河豚本身是否為被投者以外限制。
- **免疫／反傷／連帶效果**：1) 白天主動翻牌（resolvePufferfishExplode）：炸死所有投給河豚之存活非已翻牌白貓玩家（deathReason: pufferfish_explode）；2) 夜間被狼刀（d.reason === 'wolf_kill'）死亡時，設 combatState.pufferfishWolfKilledToday = true 並將 nextActiveCharmedSeat 清為 null，使當晚／當天狼美人魅惑失效。
- **次數限制**：combatState.pufferfishBombUsed 控制白天翻牌炸票全場限用 1 次；感染後（infectedBySeedWolf）失效。
- **勝利條件／查驗判定**：好人陣營神職（god），計入神邊；預言家驗為金水，通靈師/純白/石像鬼驗為 pufferfish。
- **程式碼定位**：`src/logic/combatRoles.ts:357-399; src/logic/nightResolution.ts:2626-2634; src/store/gameStore.ts:2110-2144; src/components/screens/DayAnnouncementScreen.tsx:311-315`
- **未實作／僅手動／斷鏈註記**：1) gameStore.pufferfishExplode 完全未接線至任何 UI（ExileVotePanel / DayVoteScreen / DayBurstSkillsPanel），無法在對局介面操作炸票；2) PK 兩輪累積投票者清單與「唯一投票給河豚的玩家最高票出局不得翻牌」條件未實作；3) 白天炸死狼美人未連動 applyWolfBeautyCharmDeath 清魅惑；4) 機械狼 qa_152 未檢查 whiteCatRevealed。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 個測試案例（2 處 expect）驗證 resolvePufferfishExplode 炸死投票玩家，無 UI/PK/白貓免疫/吃刀廢狼美魅惑之測試。

#### 71. 覺醒狼王（`awakened_wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：每晚夜間步驟 awakened_wolf_king_give_gun 觸發分槍（於 nightResolution 第 3 批前置執行）；白天可一般自爆（resolveSelfExplode）；出局開槍未接線。
- **目標限制**：分槍（canAwakenedWolfKingGiveGun）僅限選存活且 roleId === 'wolf' 之小狼（可多次對同一小狼分槍，或選 null 不分）。開槍目標限制未實作。
- **免疫／反傷／連帶效果**：分槍會使 combatState.awakenedWolfKingGuns 減 1 並累加 combatState.wolfDistributedGuns[targetSeat]；開槍與連鎖開槍效果在 dayResolution.ts 完全未實作。
- **次數限制**：初始 awakenedWolfKingGuns = 2，每晚最多分 1 把槍，總計最多分出 2 把；開槍次數機制未於 dayResolution 實作。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 awakened_wolf_king。
- **程式碼定位**：`src/logic/combatRoles.ts:32-33,449-465; src/logic/nightResolution.ts:989-1002; src/logic/dayResolution.ts:50,62,75-254; src/components/screens/NightConsoleScreen.tsx:1248-1251,1638-1640`
- **未實作／僅手動／斷鏈註記**：dayResolution.ts（checkCanShoot / resolveShoot）與 PendingShooterCard 完全未實作覺醒狼王本人（雙槍/多死因開槍）以及持槍小狼（wolfDistributedGuns）之開槍資格與多次開槍結算，僅完成夜間分槍計數。自爆亦為即時淘汰而非點刀後死亡。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 處測試分槍給小狼並驗證計數（awakenedWolfKingGuns 減 1、wolfDistributedGuns[2] 變 1），零開槍行為測試。

#### 72. 狼鴉之爪（`wolf_raven_claw`｜狼人陣營 / wolf）
- **觸發時機**：於 nightResolution 開頭／結尾同步入隊狀態；第二晚起夜間步驟 wolf_raven_claw_kill（nightResolution 步驟 5，於常規狼刀之後）發動無敵刀。
- **目標限制**：不可自爆（dayResolution.ts:702）；無敵刀可選任何存活玩家（含狼隊友或自己），但必須在 wolfRavenClawJoinedTeam === true（場上存活狼人陣營 <= 2）後才可使用。
- **免疫／反傷／連帶效果**：無敵刀（wolf_raven_claw_kill）無視普通守衛（guard）與戰狼免疫，但受夢遊者保護（isDreamProtected）與特殊夜免（isSpecialNightImmune：流光伯爵／黑夜使者／典獄長互交易）阻擋，且會觸發白貓免死／覺醒白痴秘密之身／覺醒狼美替死。
- **次數限制**：wolfRavenClawInvincibleUsed 控制無敵刀整場限用 1 次（程式碼未強制限制只能在「入隊當晚」使用，入隊後任一晚未使用前皆可開）。
- **勝利條件／查驗判定**：狼人陣營（wolf），開局即計入勝利判定之存活狼人數（isSeatWolfFaction 為 true）；預言家驗為查殺，通靈師/純白/石像鬼驗為 wolf_raven_claw。
- **程式碼定位**：`src/logic/combatRoles.ts:86-114; src/logic/nightResolution.ts:465-468,1785-1792,2711-2714; src/logic/dayResolution.ts:702; src/components/screens/NightConsoleScreen.tsx:1192-1195,1608-1610`
- **未實作／僅手動／斷鏈註記**：gameStore 白天出局流程未同步 syncWolfRavenClawTeamStatus，若白天放逐使狼人降至 <= 2，隔晚 NightConsoleScreen 會誤鎖無敵刀按鈕；resolveNight 中亦未檢查狼鴉之爪本人是否被夢魘恐懼／企鵝冰凍。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處斷言（禁止自爆 + 入隊後無視守衛擊殺 4 號並設定 wolfRavenClawInvincibleUsed）。

#### 73. 覺醒狼美人（`awakened_wolf_beauty`｜狼人陣營 / wolf）
- **觸發時機**：第一晚起每隔一晚於夜間步驟 awakened_wolf_beauty_charm 魅惑，替死僅於 nightResolution 步驟 8.58 結算；白天放逐替死未接線。
- **目標限制**：不可自爆（dayResolution.ts:706）；不可自刀（nightResolution.ts:1513-1520）；魅惑不可選自己、須選存活玩家，且替死已觸發後無法再魅惑。
- **免疫／反傷／連帶效果**：夜間初次面臨出局（deaths 含她）時，若 !awakenedWolfBeautySubstituteUsed 且 awakenedWolfBeautyActiveCharmSeat != null，移除第一筆死亡紀錄並設 isAlive: true，消耗替死次數並以 awakened_wolf_beauty_substitute 殺死被魅惑者；若被覺醒獵人開槍則直接出局不替死。
- **次數限制**：round - awakenedWolfBeautyLastCharmRound >= 2（每隔一晚可魅惑）；替死全場限觸發 1 次（awakenedWolfBeautySubstituteUsed）。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊存活數；預言家驗為查殺，通靈師/純白/石像鬼驗為 awakened_wolf_beauty。
- **程式碼定位**：`src/logic/combatRoles.ts:467-489; src/logic/nightResolution.ts:964-981,1513-1520,2680-2697; src/logic/dayResolution.ts:706; src/components/screens/NightConsoleScreen.tsx:1252-1255,1641-1643`
- **未實作／僅手動／斷鏈註記**：1) 白天放逐（dayResolution.ts resolveDayExile）完全未實作覺醒狼美人翻牌免死與魅惑者替死；2) nightResolution.ts 未在每晚開頭重置 awakenedWolfBeautyActiveCharmSeat，導致隔一晚不能魅惑時仍沿用前晚目標替死；3) 同晚多技能致死僅移除第一筆 deaths；4) 夜間魅惑未檢查夢魘恐懼／冰凍／石化。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 處測試夜間女巫毒覺醒狼美人時由被魅惑者替死（deathReason: awakened_wolf_beauty_substitute）。缺白天放逐替死、隔晚清空與覺醒獵人夜槍例外測試。

#### 74. 血月使徒（`blood_moon_apostle`｜狼人陣營 / wolf）
- **觸發時機**：白天發言階段自爆（觸發當晚血月封印）；白天作為最後一狼被放逐時翻牌存活並於下一晚步驟 5 復仇刀後出局。
- **目標限制**：可自爆（放逐投票階段除外）；可於狼刀階段自刀或空刀；最後一狼放逐免死僅限尚未觸發過 bloodMoonExileSurvived 且場上無其他存活狼人時。
- **免疫／反傷／連帶效果**：1) 最後一狼被放逐時免死一次（bloodMoonExileSurvived: true），存活至隔晚復仇刀步驟後於 nightResolution:1772-1778 以 blood_moon_exile_delayed 死亡（wolfKillPriority 為 true 時復仇刀屠邊仍優先於自身出局判狼勝）；2) 白天自爆啟動 bloodMoonSealActiveTonight: true，封印當晚所有好人神職步驟（nightValidation:91-103 與 nightResolution:1138-1140）。
- **次數限制**：自爆限一次（出局）；最後一狼放逐免死限一次（!target.bloodMoonExileSurvived）。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數（放逐免死期間仍計為存活狼人）；預言家驗為查殺，通靈師/純白/石像鬼驗為 blood_moon_apostle。
- **程式碼定位**：`src/logic/combatRoles.ts:343-351; src/logic/dayResolution.ts:448-465,736-745; src/logic/nightValidation.ts:91-103; src/logic/nightResolution.ts:460-461,1138-1140,1574,1771-1778,2509,2548,2581; src/store/gameStore.ts:2585-2666`
- **未實作／僅手動／斷鏈註記**：1) nightResolution.ts:3411-3433 未於血月封印期間阻擋獵人夜間死亡開槍（影響含獵人的 12p-noisy-party）；2) 自爆於 resolveSelfExplode 即刻死亡而非「完成點刀後正式死亡」。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（最後一狼放逐免死、血月自爆封印女巫解藥）；playtestFixes.test.ts 有 1 處測試血月封印女巫解藥與守衛。缺最後一狼放逐隔夜復仇刀後出局與獵人板封印測試。

#### 75. 覺醒獵人（`awakened_hunter`｜好人陣營 / god）
- **觸發時機**：出局進入 pendingShooters 後觸發開槍；UI 實際執行為手動單體射殺而非方向射殺。
- **目標限制**：在 resolveAwakenedHunterDirectionShoot 中僅可選 left 或 right 方向自動命中最近存活狼人（無法射好人或自己）；在實際 UI（PendingShooterCard -> resolveShoot）卻變成可選場上任一非己存活玩家。
- **免疫／反傷／連帶效果**：resolveAwakenedHunterDirectionShoot 直接擊殺選定方向最近存活狼人（deathReason: awakened_hunter_shoot），不觸發覺醒狼美人替死；但若走日間開槍 UI（resolveShoot）則受戰狼／惡魔／惡靈騎士夜傷免疫與白貓／老流氓延遲判定影響。
- **次數限制**：出局時開槍 1 次（resolveAwakenedHunterDirectionShoot 未阻擋被種狼感染者，checkCanShoot 則阻擋被種狼感染者）。
- **勝利條件／查驗判定**：好人陣營神職（god），計入好人神邊；預言家驗為金水，通靈師/純白/石像鬼驗為 awakened_hunter。
- **程式碼定位**：`src/logic/combatRoles.ts:416-434,492-536; src/logic/dayResolution.ts:92-204; src/store/gameStore.ts:1511-1621,2146-2184; src/components/common/PendingShooterCard.tsx:15-118`
- **未實作／僅手動／斷鏈註記**：1) dayResolution.ts:148-204 與一般獵人共用規則，錯誤禁止覺醒獵人被毒殺、被恐懼、愛情破裂或特殊死因時開槍；2) PendingShooterCard 僅提供單人目標選單並呼叫 triggerShoot（resolveShoot），從未接線 gameStore.awakenedHunterShoot（左／右方向最近狼人）；3) gameStore.awakenedHunterShoot 未清除 pendingShooters 亦未檢查連鎖開槍。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 1 處測試 resolveAwakenedHunterDirectionShoot 向右射殺最近狼人；flowBugFixes.test.ts 有 2 處測試 checkCanShoot 辨識 awakened_hunter。零 UI／Store 整合測試與毒殺開槍測試。

#### 76. 覺醒白痴（`awakened_idiot`｜好人陣營 / god）
- **觸發時機**：第一晚起每晚夜間步驟 awakened_idiot_shield（nightResolution 步驟 8.58 結算保護）；白天於 resolveDayExile 放逐時自動翻牌免死。
- **目標限制**：夜間秘密之身可選任何存活玩家（包含自己），前提為 awakenedIdiotSecretActive === true 且未受種狼感染；未消耗前每晚可重複選擇。
- **免疫／反傷／連帶效果**：1) 夜間秘密之身：若保護目標當晚在 deaths 名單中，移除第一筆死亡並恢復存活且消耗秘密之身（awakenedIdiotSecretActive = false）；若保護目標未在 deaths 中則改檢查覺醒白痴本人是否在 deaths，若有則免死並消耗秘密之身；2) 白天首次被放逐（未受感染、未石化）：翻牌免死（idiotRevealed: true）。
- **次數限制**：秘密之身於實際抵擋 1 次死亡後永久失效（awakenedIdiotSecretActive = false）；白天放逐免死限 1 次（!idiotRevealed）。
- **勝利條件／查驗判定**：好人陣營神職（god），且 victory.ts:102 僅豁免 idiot，故覺醒白痴翻牌後仍計入存活神職（gods）；預言家驗為金水，通靈師/純白/石像鬼驗為 awakened_idiot。
- **程式碼定位**：`src/logic/combatRoles.ts:591-605; src/logic/nightResolution.ts:945-962,2655-2678,3523; src/logic/dayResolution.ts:493-520; src/logic/voting.ts:39,99; src/logic/victory.ts:102; src/components/screens/NightConsoleScreen.tsx:1264-1267,1650-1652`
- **未實作／僅手動／斷鏈註記**：1) dayResolution.ts:493-520 放逐翻牌免死時未將 awakenedIdiotSecretActive 設為 false；2) voting.ts:39,99 與 ExileVotePanel.tsx:183 漏掉 awakened_idiot，翻牌後仍具投票權；3) nightResolution.ts:2097 wolfKillPriority 早於秘密之身救援（2656 行），可能導致覺醒白痴／被護最後一神在狼刀在先時誤判狼勝；4) nightResolution.ts:950 未檢查夢魘恐懼等干擾封鎖。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 處測試秘密之身保護他人未受傷改護自己抵擋狼刀。零白天放逐翻牌、失秘、失票測試。

#### 77. 蜂之狂獵（`bee_wild_hunt`｜好人陣營 / god）
- **觸發時機**：第二晚起每晚夜間步驟 bee_wild_hunt_sting（於 nightResolution 步驟 8.58 結算）。
- **目標限制**：round >= 2 起可選任意 2 名存活玩家（可重複選同一人，或兩者皆 null 跳過）；受血月封印、夢魘恐懼、企鵝冰凍、梅杜莎石化、導師/學者削弱封鎖；被種狼感染後失能。
- **免疫／反傷／連帶效果**：1) 兩目標皆為狼人陣營（isSeatWolfFaction）：皆以 bee_wild_hunt_kill 出局（若選同一人僅 kill 1 次）；2) 一狼一好：無事發生；3) 兩目標皆非狼人：設 combatState.beeWildHuntLostAbility = true（永久失能，下一晚 UI 鎖定並顯示失能提示）。不受守衛／攝夢阻擋。
- **次數限制**：每晚可發動 1 次，無次數上限，直到選中兩名好人導致 beeWildHuntLostAbility === true 後永久失去技能。
- **勝利條件／查驗判定**：好人陣營神職（god），計入神邊；預言家驗為金水，通靈師/純白/石像鬼驗為 bee_wild_hunt。
- **程式碼定位**：`src/logic/combatRoles.ts:252-271; src/logic/nightValidation.ts:255-260; src/logic/nightResolution.ts:2546-2577; src/components/screens/NightConsoleScreen.tsx:1211-1227,1626-1628,3566-3573`
- **未實作／僅手動／斷鏈註記**：nightResolution.ts:2638-2647 的猩紅之子 godSkillTargets 未列入 beeWildHuntTargets，在「猩紅蜂舞」板子中蜂之狂獵選中被猩紅附著的玩家時不會觸發猩紅之子出局。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（雙狼同時死亡、雙好永久失能），無選同一人／一狼一好／猩紅之子互動測試。

#### 78. 夜之貴族（`night_noble`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚夜間步驟 night_noble_servant 選夜僕，並於同晚 nightResolution 步驟 8.58 結算隔天死亡（非延遲至再下一晚）。
- **目標限制**：可自爆；round >= 2 起可選任一存活玩家（含自己或狼隊友）為夜僕；僅當先前夜僕已出局（或 nightNobleServantSeat === null）時可選新夜僕。
- **免疫／反傷／連帶效果**：夜僕目標若與當晚獵魔人狩獵目標相同，清空 nightNobleServantSeat 雙方不死；否則夜僕於當晚步驟 8.58 死於 night_noble_servant_death（受 isDreamProtected 與 isSpecialNightImmune 保護）。
- **次數限制**：場上同時僅能有 1 名未出局夜僕，夜僕出局後隔晚可再選。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊存活數；預言家驗為查殺，通靈師/純白/石像鬼驗為 night_noble。
- **程式碼定位**：`src/logic/combatRoles.ts:570-589; src/logic/nightResolution.ts:2496-2544; src/components/screens/NightConsoleScreen.tsx:1260-1263,1647-1649`
- **未實作／僅手動／斷鏈註記**：1) nightResolution.ts:2497 以 updatedSeats 驗證 canNightNobleChooseServant，若夜之貴族在較早步驟（如女巫毒／自刀）死亡，resolveNight 會拋錯崩潰；2) line 2540 在結算死亡前就清空 nightNobleServantSeat，若夜僕被攝夢／秘密之身救下，隔晚仍可選新夜僕；3) 自爆即刻死亡而非點刀後死亡。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（選夜僕致死、與獵魔人狩獵同目標抵消）。缺夜僕未死鎖定下一晚、與夜之貴族同晚出局時機測試。

#### 79. 猩紅狼王（`scarlet_wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：第一晚起每晚夜間步驟 scarlet_wolf_king_attach 附著；於天亮 DayAnnouncementScreen 公開附著名單；隔晚起受神職技能指定或猩紅狼王夜死時觸發死亡。
- **目標限制**：不可自爆（dayResolution.ts:707）；附著可選任一存活玩家（可選自己），不可重複附著同一人，全場累積上限 3 人。
- **免疫／反傷／連帶效果**：1) 夜間：先前已公布附著之玩家（prevScarletAttached）若出現在神職夜間目標集合 godSkillTargets，死於 scarlet_child_trigger；2) 夜間猩紅狼王出局時，所有 scarletAttachedSeats（自身除外）死於 scarlet_wolf_link；3) 最後一狼入隊狀態 syncScarletWolfKingTeamStatus（僅於 resolveNight 同步）。
- **次數限制**：全場最多附著 3 名玩家（scarletAttachedSeats.length >= 3 後禁止再附著）。
- **勝利條件／查驗判定**：狼人陣營（wolf），開局即計入勝利判定存活狼人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 scarlet_wolf_king。
- **程式碼定位**：`src/logic/combatRoles.ts:538-568; src/logic/nightResolution.ts:463,471-474,983-987,2636-2653,2700-2707,2717-2720; src/logic/dayResolution.ts:707; src/components/screens/DayAnnouncementScreen.tsx:305-309`
- **未實作／僅手動／斷鏈註記**：1) 白天死亡（放逐/開槍/決鬥）完全未觸發 scarlet_wolf_link 連帶死亡與連帶屠邊勝；2) godSkillTargets 漏掉 beeWildHuntTargets（同板子神職蜂之狂獵無法觸發猩紅之子死亡）；3) 白天狼人全滅未即時同步 scarletWolfKingJoinedTeam。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 處測試寫入 scarletAttachTarget 卻未斷言任何行為（既未測最多 3 人、亦未測神職技能觸發死亡或狼王出局連帶死亡）。

#### 80. 狼兄（`wolf_brother`｜狼人陣營 / wolf）
- **觸發時機**：首夜有 confirm_only 步驟與狼弟互認；每晚參與 wolf_kill。
- **目標限制**：不可自爆（dayResolution.ts:704）；每晚與小狼共同參與 wolf_kill（可空刀或自刀）。
- **免疫／反傷／連帶效果**：狼兄存活時，isWolfYoungerBrotherSeerDisguised 與 getSeerCheckResult 使狼弟被預言家驗為金水；狼兄死亡後於 syncWolfBrothersState 記錄 wolfBrotherDiedRound，使狼弟於隔晚覺醒並於再下一晚入隊。
- **次數限制**：常規每晚隨狼隊刀人；死亡被動觸發狼弟覺醒僅一次。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 wolf_brother。
- **程式碼定位**：`src/logic/combatRoles.ts:193-227; src/logic/mechWolf.ts:139-145; src/logic/dayResolution.ts:704; src/logic/nightResolution.ts:464,2710`
- **未實作／僅手動／斷鏈註記**：gameStore 白天放逐／出局未同步 syncWolfBrothersState，若狼兄於白天死亡，隔晚 NightConsoleScreen 會因 wolfBrotherDiedRound 仍為 null 而鎖死狼弟覺醒刀。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（禁止狼兄自爆，及狼兄出局後查驗狼弟與狼弟覺醒）。缺狼兄白天出局測試。

#### 81. 狼弟（`wolf_younger_brother`｜狼人陣營 / wolf）
- **觸發時機**：首夜與狼兄互認；狼兄死後第一晚起於 wolf_younger_brother_kill 發動覺醒無敵刀；覺醒的下一晚（round > wolfBrotherDiedRound + 1）正式入狼隊。
- **目標限制**：可以自爆（未在不可自爆清單）；覺醒刀須於狼兄出局且尚未用過後，對任一存活玩家發動（可自刀）。
- **免疫／反傷／連帶效果**：1) 狼兄存活期間被預言家（getSeerCheckResult）驗為 good（金水），狼兄死後轉為 wolf（查殺）；2) 覺醒無敵刀（wolf_younger_brother_kill）無視普通守衛（僅受 isDreamProtected 與 isSpecialNightImmune 阻擋）；3) 僅當 round > wolfBrotherDiedRound + 1 才將 wolfYoungerBrotherJoinedTeam 設為 true（不提前入隊）。
- **次數限制**：覺醒無敵刀全場限用 1 次（wolfYoungerBrotherAwakenedKillUsed）；入隊後每晚隨狼隊刀人。
- **勝利條件／查驗判定**：狼人陣營（wolf），開局即計入勝利判定狼人數；狼兄存活時預言家驗為金水（但通靈師/純白/石像鬼仍驗為 wolf_younger_brother，獵魔人/蜂之狂獵亦視為狼人陣營）。
- **程式碼定位**：`src/logic/combatRoles.ts:193-246; src/logic/mechWolf.ts:139-145; src/logic/nightResolution.ts:464,1794-1811,2710; src/components/screens/NightConsoleScreen.tsx:1207-1210,1623-1625`
- **未實作／僅手動／斷鏈註記**：1) 12p-guard-wolf-brother 與 12p-wolf-brother 的 wolf_kill.actorRoleIds 未列 wolf_younger_brother，導致狼弟於 round > wolfBrotherDiedRound + 1 入隊且無其他存活狼時，UI wolf_kill 會被 nightValidation 鎖死；2) 狼兄白天出局未同步 wolfBrotherDiedRound，導致隔晚 NightConsoleScreen 誤鎖覺醒刀。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處斷言（狼兄死前驗金水、狼兄死後第 2 晚發動覺醒無敵刀無視守衛且當晚未入隊）。缺第 3 晚正式入隊後使用 wolf_kill 測試。

#### 82. 阿努比斯（`anubis`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚夜間步驟 anubis_scale（於 nightResolution 步驟 5 結算）。
- **目標限制**：不可自爆（dayResolution.ts:705）；round >= 2 起選 1 名已出局玩家（左側）與 1 名存活玩家（右側），且雙方均不可在 combatState.anubisUsedSeats 中（每人整局限上天平 1 次）。
- **免疫／反傷／連帶效果**：天平比較規則：神 > 民、民 > 狼、狼 > 神；右側玩家死亡時受 isDreamProtected 與 isSpecialNightImmune 保護（deathReason: anubis_scale_kill），未勝出（含同陣營平手或反向剋制）則阿努比斯死於 anubis_scale_backfire；syncAnubisTeamStatus 當無其他存活狼時入隊。
- **次數限制**：第二晚起每晚最多用 1 次，受限於場上未上過天平的死者與活人數量。
- **勝利條件／查驗判定**：狼人陣營（wolf），開局即計入狼人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 anubis。
- **程式碼定位**：`src/logic/combatRoles.ts:289-337; src/logic/nightResolution.ts:470,1843-1863,2716; src/logic/dayResolution.ts:705; src/components/screens/NightConsoleScreen.tsx:1232-1247,1632-1637,3575-3581`
- **未實作／僅手動／斷鏈註記**：1) 白天淘汰最後其他狼人時，gameStore 未即時同步 anubisJoinedTeam；2) nightResolution 未在步驟 5 檢查阿努比斯是否當晚被恐懼（依賴 UI 鎖定）。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 3 處測試斷言（神 > 民使右側 4 號出局），缺「民 > 狼」、「狼 > 神」、平手／敗北反噬阿努比斯本人與已上天平不可重複測試。

#### 83. 刺客（`assassin_wolf`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚於狼刀前夜間步驟 assassin_wolf_assassinate 紀錄，於 nightResolution 第 3 批前置判定是否阻斷狼刀並於步驟 5 執行擊殺。
- **目標限制**：可自爆；round >= 2 起可選 1 名存活玩家並指定 1 個角色 ID 猜測（可傳 null 跳過刺殺）。
- **免疫／反傷／連帶效果**：1) 猜中 targetObj.roleId === assassinGuessedRoleId：目標死於 assassin_wolf_kill（受 isDreamProtected 與 isSpecialNightImmune 保護，不受守衛與戰狼免疫阻擋）；2) 猜錯：設 assassinMissedBlockWolf = true，併入 wolfTeamBlocked 使當晚狼隊無法動刀（rawWolfTarget = null）。
- **次數限制**：第二晚起每晚最多刺殺 1 次，無全場次數上限。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 assassin_wolf。
- **程式碼定位**：`src/logic/combatRoles.ts:120-134; src/logic/nightResolution.ts:908-924,1154,1450,1781-1783; src/components/screens/NightConsoleScreen.tsx:1196-1198,1611-1616,3536-3564`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen pendingValidation 未驗證刺客選座號後是否已選猜測角色；2) 自爆為即時死亡而非當晚點刀後死亡。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（猜錯使狼隊空刀、猜對刺殺死亡）。缺女巫/獵魔人同晚交互測試。

#### 84. 大野狼（`big_bad_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚於女巫步驟後之 big_bad_wolf_kill 夜間步驟（於 nightResolution 步驟 5 結算）。
- **目標限制**：可自爆；僅當場上所有狼人陣營均存活（!seats.some(s => !s.isAlive && isSeatWolfFaction(s))）時，可選任一存活玩家發動額外刀。
- **免疫／反傷／連帶效果**：額外刀（big_bad_wolf_kill）可被普通守衛（effectiveGuardTarget）、夢遊者（isDreamProtected）與特殊夜免（isSpecialNightImmune）阻擋，不受女巫解藥影響（發生於女巫步驟後）。
- **次數限制**：四狼全在場時每晚可額外刀 1 人；一旦任一狼人出局即永久失效。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 big_bad_wolf。
- **程式碼定位**：`src/logic/combatRoles.ts:140-154; src/logic/nightResolution.ts:1831-1841; src/components/screens/NightConsoleScreen.tsx:1199-1202,1617-1619`
- **未實作／僅手動／斷鏈註記**：1) 若狼隊當晚自刀導致已有狼在步驟 5 前段死亡，步驟 5 後段 canBigBadWolfExtraKill(updatedSeats, ...) 會直接拋出 Error 中斷結算；2) 自爆為即時死亡而非點刀後死亡。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（四狼在場可額外刀一人），缺任一狼死後禁用額外刀與守衛擋大野狼刀測試。

#### 85. 大灰狼（`big_grey_wolf`｜狼人陣營 / wolf）
- **觸發時機**：首夜 confirm_only 互認；第二晚起每晚夜間步驟 big_grey_wolf_kill（於 nightResolution 步驟 5 結算）。
- **目標限制**：不可自爆（dayResolution.ts:703）；round >= 2 起可選任一存活玩家（若占卜師標記則須在 fortuneAllowedSeats 內）。
- **免疫／反傷／連帶效果**：1) 單獨擊殺（big_grey_wolf_kill）不受普通守衛與女巫解藥影響（女巫亦不見其刀口），受 isDreamProtected 與 isSpecialNightImmune 阻擋；2) 若當晚占卜師發動標記，須受 fortuneAllowedSeats 限制；3) syncBigGreyWolfTeamStatus 於其他狼全滅時入隊。
- **次數限制**：單獨擊殺全場限用 1 次（bigGreyWolfKillUsed）。
- **勝利條件／查驗判定**：狼人陣營（wolf），開局即計入狼人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 big_grey_wolf。
- **程式碼定位**：`src/logic/combatRoles.ts:156-187; src/logic/nightResolution.ts:469,1813-1829,2715; src/logic/dayResolution.ts:703; src/components/screens/NightConsoleScreen.tsx:1203-1206,1620-1622`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen:1204 未傳入 fortuneAllowedSeats 給 canBigGreyWolfKill，UI 未於當晚即時限制占卜師標記範圍；2) 白天出局未同步 bigGreyWolfJoinedTeam。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（第 2 晚單獨擊殺與消耗 bigGreyWolfKillUsed），缺第 1 晚禁用、占卜師限刀互動與入隊測試。

#### 86. 珀爾修斯（`perseus`｜好人陣營 / god）
- **觸發時機**：第二晚起每晚夜間步驟 perseus_execute（於 nightResolution 步驟 8.58 結算）。
- **目標限制**：round >= 2 起可選任一存活玩家處決（含自己）；受血月封印與夢魘恐懼封鎖，被種狼感染後失能。
- **免疫／反傷／連帶效果**：處決直接擊殺目標（perseus_execute，無視守衛）；若目標為當晚梅杜莎石化對象（medusaPetrifiedSeat），珀爾修斯自身以 perseus_petrify_backfire 死亡。nightResolution:2588 僅檢查夢魘恐懼而未因石化阻止結算。
- **次數限制**：處決技能全場限用 1 次（combatState.perseusExecuteUsed）。
- **勝利條件／查驗判定**：好人陣營神職（god），計入神邊；預言家驗為金水，通靈師/純白/石像鬼驗為 perseus。
- **程式碼定位**：`src/logic/combatRoles.ts:273-287; src/logic/nightResolution.ts:2579-2602; src/logic/nightValidation.ts:145-155; src/components/screens/NightConsoleScreen.tsx:1228-1231,1629-1631`
- **未實作／僅手動／斷鏈註記**：雖然 nightResolution:2588 允許石化下執行處決，但 nightResolution:662 仍對珀爾修斯寫入 petrified: true，導致 nightValidation.ts:145-155 鎖死 UI 技能按鈕、voting.ts:40 剝奪其投票權、梅杜莎出局時會觸發 medusa_petrify_link 將珀爾修斯殺死，未能真正免疫石化。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處測試（處決被石化玩家時目標與珀爾修斯雙雙出局）。缺免疫石化測試。

#### 87. 典獄長（`warden_wolf`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起每晚夜間步驟 warden_wolf_trade（第 3 批前置運算並於步驟 5 結算死亡）。
- **目標限制**：可自爆；round >= 2 起每晚可選 2 名不同且未曾參與交易（!wardenTradedSeats.includes）的存活玩家（可包含典獄長自己）。
- **免疫／反傷／連帶效果**：1) 雙方均非典獄長且皆選 trade：兩人加入 wardenImmuneSeats（isSpecialNightImmune 免疫狼刀/毒藥/其他夜間擊殺）；2) 一 trade 一 betray：選 trade 者死於 warden_trade_death；3) 典獄長參與交易：選項相同典獄長死，不同則對方死；4) 雙方背叛僅回傳 mutualBetraySwap 未於結算生效。
- **次數限制**：第二晚起每晚最多發動 1 次交易，每名玩家全場最多被選入交易 1 次（wardenTradedSeats）。
- **勝利條件／查驗判定**：狼人陣營（wolf），計入狼隊人數；預言家驗為查殺，通靈師/純白/石像鬼驗為 warden_wolf。
- **程式碼定位**：`src/logic/combatRoles.ts:607-657; src/logic/nightResolution.ts:926-943,1159,1865-1867; src/components/screens/NightConsoleScreen.tsx:1268-1285,1653-1658,3583-3613`
- **未實作／僅手動／斷鏈註記**：1) nightResolution.ts:926-943 完全忽略 evaluateWardenTrade 回傳的 mutualBetraySwap，雙方選擇背叛時實際上無法互換／轉移彼此當晚技能目標；2) NightConsoleScreen pendingValidation 未檢查是否已選滿 2 位交易玩家；3) 自爆為即時死亡而非點刀後死亡。
- **現有行為測試覆蓋**：combatRoles.test.ts 僅 1 處測試一交易一背叛使交易者出局（warden_trade_death）；零雙方交易免傷、雙方背叛互換目標、典獄長自參交易測試。

#### 88. 鏽劍騎士（`rusty_sword_knight`｜好人陣營 / god）
- **觸發時機**：吃狼刀死亡的下一晚（round === rustySwordKilledRound + 1）於 nightResolution 步驟 8.58 自動結算。
- **目標限制**：被動觸發角色，無主動指定目標；自動搜尋座號逆時針方向最近之存活 isSeatWolfFaction 玩家。
- **免疫／反傷／連帶效果**：僅當死亡原因為 wolf_kill 時記錄 rustySwordKilledRound = round；於 round === rustySwordKilledRound + 1 夜晚結算時，以 findRustySwordCounterTarget 逆時針（座號遞減繞圈）尋找第一位存活狼人陣營玩家並以 rusty_sword_counter 擊殺，同時標記 rustySwordTriggered = true。
- **次數限制**：全場僅觸發 1 次（rustySwordTriggered）。
- **勝利條件／查驗判定**：好人陣營神職（god），計入神邊；預言家驗為金水，通靈師/純白/石像鬼驗為 rusty_sword_knight。
- **程式碼定位**：`src/logic/combatRoles.ts:416-441; src/logic/nightResolution.ts:2604-2623; src/logic/types.ts:687-688`
- **未實作／僅手動／斷鏈註記**：未檢查鏽劍騎士是否被種狼感染（infectedBySeedWolf），亦未處理若死於同守同救 milk_pierce 的邊界；其餘邏輯全自動結算。
- **現有行為測試覆蓋**：combatRoles.test.ts 有 2 處斷言（第 1 晚吃狼刀，第 2 晚天亮左側最近狼人 1 號死於 rusty_sword_counter）。缺被女巫毒不觸發與跨過已死亡狼人測試。

### 2.7 轉化／連線／情侶系角色（16 名）

#### 89. 覺醒石像鬼（`awakened_gargoyle`｜狼人陣營 / wolf）
- **觸發時機**：第一晚（round === 1）awakened_gargoyle_convert 步驟觸發轉化（nightResolution.ts:1059-1068）；狼刀階段與狼隊共同行動。
- **目標限制**：canAwakenedGargoyleConvert (conversionRoles.ts:226-242)：須有存活覺醒石像鬼、僅限 round === 1、目標存活、非狼人陣營 (!isSeatWolfFaction)、且必須與任意存活狼人相鄰 (isAdjacentToWolf)。允許轉化 hybrid（bug）並禁止選 mech_wolf。
- **免疫／反傷／連帶效果**：轉化成功時將目標座位的 convertedByAwakenedGargoyle 設為 true（nightResolution.ts:1063-1067）。被轉化者被熊視為狼（advancedRoles.ts:136）、被預言家驗為查殺（mechWolf.ts:103）、並直接計入 isSeatWolfFaction（topFiveRoles.ts:34）與 isSeatEffectiveWolf（factionHelpers.ts:20）。但未實作轉化者「不入狼隊、不能自爆、場上所有狼人死光才入狼隊帶刀」的階段轉換與限制。
- **次數限制**：僅限 round === 1 使用（canAwakenedGargoyleConvert），但 draft 僅有一個 awakenedGargoyleConvertTarget 欄位，雙石像鬼板會互覆蓋。
- **勝利條件／查驗判定**：覺醒石像鬼與轉化者在 victory.ts:30-31 皆計為 'wolf'；預言家查驗為查殺（mechWolf.ts:103）。注意轉化者未像 infectedBySeedWolf 在 victory.ts:152 保留原好人邊存在旗標，若最後一神／民被轉化可能漏判屠邊。
- **程式碼定位**：`src/logic/conversionRoles.ts:226-242; src/logic/nightResolution.ts:1059-1068; src/logic/victory.ts:30-31; src/logic/factionHelpers.ts:20; src/logic/mechWolf.ts:103; src/logic/advancedRoles.ts:136; src/logic/topFiveRoles.ts:34; src/components/screens/NightConsoleScreen.tsx:1331-1334, 1680-1682`
- **未實作／僅手動／斷鏈註記**：1) 10p/12p-wind-espionage 有兩隻覺醒石像鬼，但 draft 與 ConversionRuntimeState 僅單一欄位，第二隻會覆蓋第一隻；且 12p-wind-espionage 的狼刀步驟錯設為 confirm_only；2) 轉化者 N2+ 入隊步驟為 confirm_only，未控管「不能自爆」及「原生狼死光前不入隊」；3) 轉化混血兒未失敗反而直接變狼（違反 qa_154）；4) 轉化機械狼僅前端阻擋（違反 qa_153）；5) 狼隊空刀但石像鬼轉化時 evaluateAwakenedDreamTargetActed 誤判無行動（違反 qa_035/qa_104）。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (1 處情境測試轉化與查殺)、src/logic/deepAuditFixes.test.ts (1 處測試熊對轉化者咆哮)，缺多石像鬼／機械狼／混血兒／轉化者入隊與覺醒攝夢人行動測試。

#### 90. 邱比特（`cupid`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）cupid_link 步驟；情侶確認彼此為 confirm_only。
- **目標限制**：canCupidLink (conversionRoles.ts:77-94)：須有存活邱比特、僅 round === 1、必須選擇 2 名不同存活玩家（可選自己）。checkMandatoryNightTarget 在 N1 強制必選 2 人；NightConsoleScreen 僅檢查目標存活。
- **免疫／反傷／連帶效果**：evaluateCupidAffiliation (conversionRoles.ts:97-108) 判定情侶陣營歸屬（雙狼→wolf、雙好→good、一好一狼→third_party）。syncConversionOnDeaths (conversionRoles.ts:501-507) 若情侶任一方死亡，另一方立即以 'cupid_lover_link' 殉情；因 'cupid_lover_link' 不在 HUNTER_SHOOTABLE_REASONS / WOLF_KING_SHOOTABLE_REASONS (dayResolution.ts:42-65)，殉情獵人與狼王不可開槍。
- **次數限制**：僅限 round === 1 使用一次，不可跳過（nightValidation.ts:338-342）。
- **勝利條件／查驗判定**：預言家查驗恆為好人金水（mechWolf.ts:120）；victory.ts:66 對 cupid 回傳 null（不計入神／民，符合 qa_146）。人狼戀（cupidAffiliation === 'third_party'）且場上僅剩邱比特與情侶存活時，checkConversionThirdPartyVictory (751-760) 判第三方屠城勝。雙好／雙狼時未實作讓邱比特計為好／狼勝負防截胡（雙好時邱比特不計數仍跟隨好人勝）。
- **程式碼定位**：`src/logic/conversionRoles.ts:77-108, 501-507, 751-760; src/logic/nightResolution.ts:1014-1020; src/logic/nightValidation.ts:338-342; src/logic/mechWolf.ts:120; src/logic/setup.ts:116; src/components/screens/NightConsoleScreen.tsx:1286-1304, 1659-1661`
- **未實作／僅手動／斷鏈註記**：1) victory.ts:177 未阻斷人狼戀下「狼死光但邱比特還活著」時好人直接勝，或「好人屠邊但邱比特還活著」時狼人直接勝；2) evaluateCupidAffiliation 與 topFiveRoles.ts 未處理混血兒與邱比特／情侶交錯連動（qa_047/qa_148）；3) gameStore.ts submitExileVotes 未呼叫 finalizeDayDeathSync，投票放逐情侶不觸發殉情；4) 12p-cupid-thief 未套用 slaughter_all，而 10p/12p-cupid 開局即強制屠城而非僅限第三方局。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (人狼戀殉情與金水)、src/logic/deepAuditFixes.test.ts (resolveDayExile 情侶殉情與 slaughter_all 預設)。缺雙好／雙狼歸屬、邱比特存活截胡與混血兒連動測試。

#### 91. 尋香魅影（`scent_phantom`｜狼人陣營 / wolf）
- **觸發時機**：每晚 scent_phantom_link 步驟皆可連線（N1 強制在 nightValidation.ts:348-352 要求必選 2 人，與原文「可選擇」略嚴）。
- **目標限制**：canScentPhantomLink (conversionRoles.ts:139-158)：須有存活尋香魅影、!state.scentPhantomTriggered、選 2 名不同存活玩家（可選自己）。NightConsoleScreen 僅檢查存活未檢查 triggered。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:518-529)：鏈中任一人死亡，標記 scentPhantomTriggered = true，另一人以 'scent_phantom_link' 殉情，獵人／狼王不可開槍。dayResolution.ts:708 禁止自爆。syncScentPhantomTeamStatus (160-171) 當無其他存活狼人陣營時設 scentPhantomJoinedTeam = true。
- **次數限制**：鏈子觸發過一次（scentPhantomTriggered = true）後不可再用。
- **勝利條件／查驗判定**：屬狼人陣營（victory.ts:64 計為 wolf，預言家驗查殺 mechWolf.ts:152）。
- **程式碼定位**：`src/logic/conversionRoles.ts:139-171, 518-529, 613; src/logic/nightResolution.ts:1038-1049; src/logic/dayResolution.ts:708; src/components/screens/NightConsoleScreen.tsx:1288-1304, 1668-1670`
- **未實作／僅手動／斷鏈註記**：1) multi-lianliankan 有 6 名尋香魅影但 draft 與 state 僅單一欄位，會互相覆蓋共用；2) 下一晚若不連線（跳過），nightResolution.ts:1038 不會清除上一晚的 scentPhantomChain；3) 首夜隨機得知狼隊友／另一尋香魅影位置完全靠口頭；4) UI 未呼叫 canScentPhantomLink 阻擋已觸發後的操作，也未檢核入隊前不可參與狼刀。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (鏈子殉情與禁自爆)、src/store/gameStore.test.ts (連連看 6 confirm_only 煙霧通關)。缺多尋香魅影並存、清空舊鏈、入隊帶刀及殉情禁槍測試。

#### 92. 覺醒孤獨少女（`awakened_lonely_girl`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）awakened_lonely_girl_choose 步驟選定偶像；N2+ 為 confirm_only。
- **目標限制**：NightValidation.ts:333-337 強制首夜必選 1 人；NightConsoleScreen.tsx:1354 僅檢查目標存活，未檢查不可選自己，後端亦無 canAwakenedLonelyGirlChoose 檢核。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:582-592)：偶像若死因為 'exiled'，設 status = 'wolf'；否則（非放逐出局）設 status = 'inherited' 並記錄 awakenedLonelyGirlInheritedRoleId。但繼承偶像的實際夜／日技能與預言家變狼查殺皆未接線執行。
- **次數限制**：首夜一次選定，不可變更。
- **勝利條件／查驗判定**：victory.ts:42-54：status === 'wolf' 計為 wolf、'inherited' 依繼承角色計邊、'good' 錯計為 'villager'（違反 qa_054/qa_161）。getSeerCheckResult 恆回傳 'good'（即使變狼亦未變查殺）。
- **程式碼定位**：`src/logic/conversionRoles.ts:582-592; src/logic/factionHelpers.ts:31-42; src/logic/victory.ts:42-54; src/logic/nightResolution.ts:1070-1072; src/logic/nightValidation.ts:333-337; src/components/screens/NightConsoleScreen.tsx:1354, 1683-1685`
- **未實作／僅手動／斷鏈註記**：1) UI 與 nightResolution 均未禁止首夜選自己當偶像；2) 繼承偶像身分後（如預言家／女巫／獵人／狼人），全系統技能與查驗皆未讀取 awakenedLonelyGirlInheritedRoleId，僅改勝利邊數；3) 變狼後 getSeerCheckResult 仍回傳金水、resolveSelfExplode 亦未放行自爆；4) submitExileVotes 投票放逐偶像未呼叫 finalizeDayDeathSync；5) status === 'good' 時 victory.ts:53 錯計入平民。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (僅測試偶像白天放逐後變狼)。缺夜間非放逐死亡繼承、不計入民／神（qa_054/161）、繼承技能與查殺測試。

#### 93. 白蛇預言家（`white_snake_seer`｜第三方陣營 / third_party）
- **觸發時機**：每晚 white_snake_action 步驟（未解鎖前查驗、解鎖後下晚起發動靈襲）。
- **目標限制**：NightConsoleScreen.tsx:1353 僅檢查目標存活（未禁自選，無專屬檢核函式）。
- **免疫／反傷／連帶效果**：當 white_snake_action 選中 xu_xian_phantom 或 syncConversionOnDeaths 偵測許仙出局（!xuXian.isAlive）時，設 whiteSnakeUnlockedAttack = true（nightResolution.ts:2747-2751；conversionRoles.ts:568-571）。解鎖後選目標改為執行 doKill(target, 'white_snake_kill')。
- **次數限制**：每晚一次查驗或靈襲；解鎖後失去查驗功能（nightResolution.ts:2747-2754）。
- **勝利條件／查驗判定**：預言家查驗恆為狼人（mechWolf.ts:105）。victory.ts:66 對其計 null；場上僅剩白蛇與許仙存活時 checkConversionThirdPartyVictory (775-786) 判第三方屠城勝。
- **程式碼定位**：`src/logic/conversionRoles.ts:568-571, 775-786; src/logic/nightResolution.ts:2744-2756; src/logic/mechWolf.ts:105; src/components/screens/NightConsoleScreen.tsx:1353, 1674-1676`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen 無查驗結果揭曉／Flashcard，無法自動顯示目標「是否為許仙尋香魅影」；2) UI 沒區分查驗與靈襲狀態提示；3) victory.ts 未擋下「狼人全死但白蛇／許仙存活」的好人勝利截胡。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (預言家查殺、驗許仙解鎖、與許仙雙死勝)。缺許仙死亡解鎖、靈襲殺人（white_snake_kill）與屠城測試。

#### 94. 許仙尋香魅影（`xu_xian_phantom`｜第三方陣營 / third_party）
- **觸發時機**：每晚 xu_xian_action 步驟選擇綁定；所有狼人出局後應可同晚追加靈襲（UI 缺靈襲選擇）。
- **目標限制**：canXuXianBind (conversionRoles.ts:195-218)：須有存活許仙、!xuXianTriggered、選 2 名不同存活玩家（可選自己）、不可與 xuXianLastBoundPair 有任何重複玩家。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:532-552)：綁定對任一人出局則 xuXianTriggered = true 且另一人以 'xu_xian_link' 殉情（獵人不可開槍）；若綁定對剛好是白蛇＋許仙且雙死，設 xuXianThirdPartyInstantWin = true 觸發第三方直勝。狼死光後 nightResolution.ts:2758-2764 支援 draft.xuXianKillTarget 靈襲。
- **次數限制**：綁定殉情僅能觸發 1 次（xuXianTriggered）；連續兩晚不可選重複玩家。
- **勝利條件／查驗判定**：預言家查驗恆為狼人（mechWolf.ts:106）。觸發白蛇＋許仙綁定雙死直勝（719-724），或僅剩白蛇／許仙存活屠城勝（775-786）。
- **程式碼定位**：`src/logic/conversionRoles.ts:195-218, 532-552, 719-724, 775-786; src/logic/nightResolution.ts:1130-1136, 2758-2764; src/logic/mechWolf.ts:106; src/components/screens/NightConsoleScreen.tsx:1289-1304, 1677-1679`
- **未實作／僅手動／斷鏈註記**：1) NightConsoleScreen 與 nightStepConfig 完全未接線 draft.xuXianKillTarget，UI 無法發動靈襲；2) 第 2 晚若跳過綁定，nightResolution.ts 未清除 xuXianActiveBoundPair；3) NightConsoleScreen 未呼叫 canXuXianBind（沒擋連綁重複或已觸發）；4) 10p/12p-board-x6xglu/18sbphw 特別規則「蝕日侍女吞噬許仙綁定白蛇許仙直接勝」完全未實作；5) victory.ts 狼死光直接判好人勝導致許仙無法等到狼死光後靈襲。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (預言家查殺、綁定自己與白蛇雙死第三方直接勝)。缺連綁重複阻擋、跳過清空、與全狼出局靈襲測試。

#### 95. 殭屍（`zombie`｜第三方陣營 / third_party）
- **觸發時機**：每晚 zombie_infect 步驟可感染 0～2 人。
- **目標限制**：canZombieInfect (conversionRoles.ts:262-281) 及 UI (NightConsoleScreen.tsx:1306-1325)：須有存活殭屍、0～2 名不重複存活玩家、不可選自己、不可選已被感染者。
- **免疫／反傷／連帶效果**：將選中玩家寫入 conversionState.zombieInfectedSeats 並標記 seat.infectedByZombie = true。無特別免疫或連帶死亡機制。
- **次數限制**：每晚至多 2 人，每人至多被感染一次；可選 0 人跳過。
- **勝利條件／查驗判定**：victory.ts:66 對 zombie 計 null；預言家查驗為好人金水（mechWolf.ts:152）。checkConversionThirdPartyVictory (734-746)：殭屍存活且場上所有其他存活玩家皆被感染時第三方單獨獲勝。
- **程式碼定位**：`src/logic/conversionRoles.ts:262-281, 734-746; src/logic/nightResolution.ts:1120-1128; src/components/screens/NightConsoleScreen.tsx:1306-1325, 1695-1697`
- **未實作／僅手動／斷鏈註記**：N1/N2+「所有感染者一起睜眼」為 confirm_only 手動主持步驟。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (1 晚感染全場達成第三方勝利)。缺 canZombieInfect 拒絕自己／已感染／超過 2 人測試。

#### 96. 百變狼王（`chameleon_wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：boards.ts N1 無專屬步驟（僅於其他神職台詞唸「百變狼王手勢為...」）；N2+ 有 chameleon_wolf_choose。
- **目標限制**：UI (NightConsoleScreen.tsx:1357) 在 N2+ 可任選一名存活玩家寫入 chameleonWolfTarget，無任何規則驗證。
- **免疫／反傷／連帶效果**：僅實作 dayResolution.ts:710 禁止自爆，及 conversionRoles.ts:614-620 場上無其他存活狼人時設 chameleonJoinedTeam = true（但該旗標無任何後續使用）。五種百變神職變體之免疫／反咆哮／魅惑殉情／無解藥／無限開槍均未實作。
- **次數限制**：無實作限制。
- **勝利條件／查驗判定**：目前在 roles.ts 為 faction: 'wolf', category: 'wolf'，直接算成第 4 隻狼且被預言家驗查殺，與原神職被替換為百變狼王之規則不符。
- **程式碼定位**：`src/logic/conversionRoles.ts:614-620; src/logic/nightResolution.ts:1096-1098; src/logic/dayResolution.ts:710; src/components/screens/NightConsoleScreen.tsx:1357, 1698-1700; src/data/boards.ts (12p-wolf-king-chameleon-wolf-king)`
- **未實作／僅手動／斷鏈註記**：幾乎全未實作：1) 板子把 chameleon_wolf_king 當第 4 隻獨立狼造成 13 張牌（3 狼＋1 百變＋4 民＋5 神）；2) 沒有首夜把 1 神職轉變為百變狼王之狀態機；3) N2+ chameleon_wolf_choose 寫入的 chameleonWolfSeat 全專案無人讀取；4) 百變預言家／熊／女巫／獵人／攝夢人五種變體效果全部依賴人工主持或完全不符。
- **現有行為測試覆蓋**：零行為測試（totalBehaviorHits === 0）。

#### 97. 鬼魂新娘（`ghost_bride`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）ghost_bride_link／ghost_bride_link_2 選新郎與證婚人；N2+ 為帶刀步驟（未實作擊殺）。
- **目標限制**：canGhostBrideChoose (conversionRoles.ts:110-133)：須有存活鬼魂新娘、僅 round === 1、新郎不可為新娘且存活、證婚人不可為新娘或新郎且存活。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:510-515)：新娘或新郎任一方死亡，另一方以 'ghost_bride_link' 殉情，獵人與狼王因殉情死不可開槍（dayResolution.ts）。但「狼死光後新娘／證婚人帶刀」尚未實作。
- **次數限制**：新郎與證婚人僅於首夜選定；狼死光才開放帶刀（未實作）。
- **勝利條件／查驗判定**：預言家查驗鬼魂新娘為金水、新郎證婚人依原身分（符合 qa_167）。三人存活於場上剩此三人時屠城勝（conversionRoles.ts:761-774）。新郎／證婚人在 victory.ts 仍保留原陣營邊數，未與好人／狼人隔離。
- **程式碼定位**：`src/logic/conversionRoles.ts:110-133, 510-515, 761-774; src/logic/nightResolution.ts:1022-1036; src/logic/nightValidation.ts:343-347; src/logic/mechWolf.ts:152; src/components/screens/NightConsoleScreen.tsx:1287-1304, 1662-1667`
- **未實作／僅手動／斷鏈註記**：1) N1 兩步驟共用 pendingDualTargets 且 checkMandatoryNightTarget 在第 1 步強制選 2 人；2) NightConsoleScreen 未呼叫 canGhostBrideChoose（允許自選新娘）；3) N2+「新娘新郎／證婚人帶刀」無草稿欄位與擊殺結算（N2+ ghost_bride_link 甚至誤用連結 UI 且送出會拋錯）；4) victory.ts 狼人死光直接判好人勝，導致三人組無法等到狼死後帶刀屠城。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (N1 選新郎與證婚人、狼死後第三方屠城勝)。缺 canGhostBrideChoose 檢核、殉情互死與獵人／狼王不可開槍測試。

#### 98. 開膛手傑克（`jack_the_ripper`｜第三方陣營 / third_party）
- **觸發時機**：主身分版每晚 jack_ripper_action 殺人；第二身分版首夜選狂熱粉，任一方死後次晚起殺人（但 12p-jack-the-ripper-2 板子排程缺此 actionType）。
- **目標限制**：主身分版 (canJackRipperKill)：須存活、每晚必殺自己以外 1 位存活玩家（不可空刀）。第二身分版：N1 canJackRipperSelectFanatic 選自己以外 1 位存活玩家為狂熱粉；解鎖後傑克無論生死皆可殺自己以外 1 位存活玩家。
- **免疫／反傷／連帶效果**：nightResolution.ts:2775-2780：開膛手傑克之刀可被普通守衛擋下，但女巫解藥無法救（因不寫入 wolfTarget）。第二身分板：傑克或狂熱粉任一方死亡即設 jackRipperKillUnlocked = true，解鎖後傑克出局仍可殺；已出局偵探 ≥ 2 人且過半同意可於白天集結指證（resolveDetectiveCollectiveAccusation），成功則 jackRipperThirdPartyDefeated = true。
- **次數限制**：每晚至多擊殺 1 人；偵探集結指證全場限 1 次。
- **勝利條件／查驗判定**：預言家查驗為好人金水（mechWolf.ts:152）。checkConversionThirdPartyVictory (700-715)：若 !jackRipperThirdPartyDefeated 且全體存活者性別相同（皆男或皆女），第三方單獨勝（主身分與第二身分版共用）。
- **程式碼定位**：`src/logic/conversionRoles.ts:307-473, 603-610, 700-715; src/logic/nightResolution.ts:1100-1118, 2766-2782; src/components/screens/NightConsoleScreen.tsx:1339-1351, 1701-1707; src/components/day/ExtraDaySkillsSection.tsx:23-156; src/components/screens/SeatSetupScreen.tsx:680-750; src/store/gameStore.ts:705-753, 2906-2930`
- **未實作／僅手動／斷鏈註記**：1) 12p-jack-the-ripper-2 在 boards.ts 中 N1 步驟為 confirm_only 且 N2+ 無 jack_ripper_action 步驟，UI 流程完全無法指定狂熱粉或執行第二身分板擊殺；2) 主身分版雖禁止空刀但 checkMandatoryNightTarget 未強制攔截；3) 未於開局強制檢查所有座位均已設定男／女性別；4) submitExileVotes 放逐狂熱粉未觸發 syncConversionOnDeaths。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (選狂熱粉死後解鎖殺)、src/logic/deepAuditFixes.test.ts (雙板完整規則、守衛擋刀／女巫不救、偵探指證敗北)。缺主身分板禁空刀、gameStore.detectiveCollectiveAccuse 與性別設定邊界測試。

#### 99. 傀儡（`puppet_wolf`｜狼人陣營 / wolf）
- **觸發時機**：邏輯層限定 round === 1，但 12p-neighbor-only 板子未排入 puppet_wolf_choose 步驟。
- **目標限制**：canPuppetChoose (conversionRoles.ts:244-260)：須有存活 puppet_wolf、僅 round === 1、目標存活、非狼人陣營、須與狼人相鄰。
- **免疫／反傷／連帶效果**：僅實作兩項：1) 被傀儡化玩家 (seat.isPuppetized = true) 被預言家驗為查殺（mechWolf.ts:104）；2) 傀儡角色 (puppet_wolf) 禁止自爆（dayResolution.ts:709）。完全未實作被傀儡化者「預言家驗人相反、女巫失效、守衛失效、獵人失效」。
- **次數限制**：僅首夜開刀前指定一次。
- **勝利條件／查驗判定**：puppet_wolf 在 roles.ts 與 victory.ts 計為狼人陣營（wolf），預言家驗為查殺；被傀儡化者原勝利歸屬不變，但被預言家驗查殺（mechWolf.ts:104）。
- **程式碼定位**：`src/logic/conversionRoles.ts:244-260; src/logic/nightResolution.ts:1087-1094; src/logic/dayResolution.ts:709; src/logic/mechWolf.ts:104; src/components/screens/NightConsoleScreen.tsx:1335-1338, 1692-1694`
- **未實作／僅手動／斷鏈註記**：1) 12p-neighbor-only 板子 N1 沒有 puppet_wolf_choose 步驟（只在 wolf_kill 台詞附帶一句），UI 無法選出傀儡；2) 傀儡化後的四大技能錯亂／失效（預言家反驗、女巫／守衛／獵人失效）完全未實作；3) 原狼全出局後傀儡不入隊與不帶刀邏輯未實作。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (僅測被傀儡化者被預言家驗查殺)。缺相鄰限制、傀儡禁自爆、及四項技能錯亂／失效測試。

#### 100. 影子（`shadow`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）shadow_choose 選定主人；N2+ confirm_only 告知繼承身分。
- **目標限制**：NightValidation.ts:328-332 強制 round === 1 必選 1 人；NightConsoleScreen.tsx:1356 僅檢查存活，未禁止選擇自己。
- **免疫／反傷／連帶效果**：nightResolution.ts:1076-1085 記錄 shadowMasterSeat 並依主人身分設定復仇者陣營（若主人為 avenger 則設 shadowAvengerThirdParty = true）。主人死亡時 syncConversionOnDeaths (595-600) 設定 shadowInheritedRoleId = master.roleId。但繼承後之技能／藥水狀態／陣營轉換全未實作。復仇者刺中未變身影子則復仇者獨勝（651-663）。
- **次數限制**：開局首夜選定一次，主人出局後繼承其身分。
- **勝利條件／查驗判定**：victory.ts 與 getSeerCheckResult 完全未處理 shadow 與 shadowInheritedRoleId，故影子在勝利計數恆回傳 null、在預言家眼中恆為金水。
- **程式碼定位**：`src/logic/conversionRoles.ts:595-600, 651; src/logic/nightResolution.ts:1076-1085; src/logic/nightValidation.ts:328-332; src/components/screens/NightConsoleScreen.tsx:1356, 1689-1691; src/store/gameStore.ts:2217-2258`
- **未實作／僅手動／斷鏈註記**：1) UI 未禁止影子選自己為主人；2) 繼承主人後，victory.ts、factionHelpers.ts、mechWolf.ts、nightResolution.ts 與 dayResolution.ts 均未讀取 shadowInheritedRoleId（影子既不算好也不算狼，不能用技能也不會被驗查殺）；3) 復仇者白天刺殺雖有 store 方法但無 UI 入口。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (測復仇者刺中未變身影子單獨勝)、src/logic/deepAuditFixes.test.ts (1 處房規測試)。缺主人出局繼承身分、繼承狼查殺／入隊、與繼承女巫藥水測試。

#### 101. 盜賊（`thief`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）thief_choose 步驟（目前 UI 無入口）。
- **目標限制**：canThiefChooseCard (conversionRoles.ts:283-304)：須有 2 張底牌、雙狼牌應重開（allowed: false）、所選須在底牌內、若底牌含狼人強制必選狼人。
- **免疫／反傷／連帶效果**：nightResolution.ts:1005-1012 當 round === 1 && draft.thiefChosenRoleId 時，呼叫 canThiefChooseCard 驗證並直接將盜賊座位之 roleId 替換為所選底牌角色。無額外免疫。
- **次數限制**：僅限第一晚使用一次，換牌後沿用新角色規則。
- **勝利條件／查驗判定**：未換牌前 thief 屬 third_party；換牌後 roleId 直接變更為所選角色，故勝負與查驗完全比照該角色。
- **程式碼定位**：`src/logic/conversionRoles.ts:283-304; src/logic/nightResolution.ts:1005-1012; src/logic/setup.ts:658-661`
- **未實作／僅手動／斷鏈註記**：極嚴重未接線：1) NightConsoleScreen.tsx 完全無 case 'thief_choose' UI，無法於首夜操作選擇底牌；2) setup.ts dealRandomRoles 無法把狼牌抽入底牌且可能誤將盜賊抽進底牌（違反 qa_144）；3) gameStore.ts 從未生成或填入 conversionState.thiefBottomCards。
- **現有行為測試覆蓋**：零完整流程行為測試（totalBehaviorHits === 0；僅 conversionRoles.test.ts:241-243 有 3 行 canThiefChooseCard 純檢核斷言）。

#### 102. 雙子（`twins`｜好人陣營 / god）
- **觸發時機**：N1 confirm_only 互認；出局後的下一晚（twinsDeadRound + 1）twins_guard 步驟發動守護。
- **目標限制**：canTwinsGuard (conversionRoles.ts:173-189)：須 twinsDeadRound !== null 且 round === twinsDeadRound + 1、!twinsGuardUsed、目標存在且存活（允許選任何人）。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:555-565)：兩位雙子任一死亡，另一位立即以 'twins_link' 死亡，並記錄 twinsDeadRound = round。隔晚（round === twinsDeadRound + 1）守護於 nightResolution.ts:1723 可免除狼刀（若與女巫解藥同用會奶穿）。
- **次數限制**：亡語守護全場僅限使用 1 次（twinsGuardUsed）。
- **勝利條件／查驗判定**：預言家查驗為好人金水；但因 roles.ts category 錯設為 'god'，victory.ts:66 錯將雙子計為神職而非平民。
- **程式碼定位**：`src/logic/conversionRoles.ts:173-189, 555-565; src/logic/nightResolution.ts:1051-1057, 1723; src/logic/nightValidation.ts:84; src/components/screens/NightConsoleScreen.tsx:1327-1330, 1671-1673`
- **未實作／僅手動／斷鏈註記**：1) 致命鎖死 Bug：evaluateNightStepLockState (nightValidation.ts:84) 會因為兩名雙子已出局而將 twins_guard 步驟鎖死，使玩家在 UI 無法點擊隔晚守護目標；2) submitExileVotes 投票放逐不會觸發 twins_link 與設定 twinsDeadRound；3) roles.ts 錯將雙子設為 category: 'god' 導致 victory.ts 算入神職而非平民。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (1 處測同生共死與隔晚守護擋狼刀)。缺 twinsGuard 步驟鎖定檢核、投票放逐雙子、與陣營類別計算測試。

#### 103. 野孩子（`wild_child`｜第三方陣營 / third_party）
- **觸發時機**：第一晚（round === 1）wild_child_choose 步驟選定榜樣。
- **目標限制**：NightValidation.ts:323-327 強制 round === 1 必選 1 人；NightConsoleScreen.tsx:1355 僅檢查目標存活，未禁止選擇自己。
- **免疫／反傷／連帶效果**：syncConversionOnDeaths (conversionRoles.ts:574-579)：當 wildChildIdolSeat 死亡時設 wildChildTurnedWolf = true。factionHelpers.ts:27 據此回傳 isSeatEffectiveWolf = true。但未連動預言家查殺、自爆與夢魘／騎士判定。
- **次數限制**：首夜選定一次，不可變更。
- **勝利條件／查驗判定**：victory.ts:39-41 榜樣未死計為 'villager'（符合 qa_162）、榜樣死亡後計為 'wolf'；getSeerCheckResult 固定為 'good'（變狼後未同步為查殺）。
- **程式碼定位**：`src/logic/conversionRoles.ts:574-579; src/logic/factionHelpers.ts:27-29; src/logic/victory.ts:39-41; src/logic/nightResolution.ts:1073-1075; src/logic/nightValidation.ts:323-327; src/components/screens/NightConsoleScreen.tsx:1355, 1686-1688`
- **未實作／僅手動／斷鏈註記**：1) UI 與 nightResolution 均未禁止首夜選自己為榜樣；2) 變狼後 getSeerCheckResult 仍驗為金水、resolveSelfExplode 無法自爆、canNightmareFear／resolveKnightDuel 亦未視為狼；3) submitExileVotes 放逐榜樣未呼叫 finalizeDayDeathSync。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (夜死變狼)、src/logic/deepAuditFixes.test.ts (白天放逐後 isSeatEffectiveWolf 轉狼與阻止好人誤判勝)。缺變狼後預言家查殺、自爆、與禁自選榜樣測試。

#### 104. 狂熱粉（`fanatic`｜第三方陣營 / third_party）
- **觸發時機**：僅第一晚被指定與傑克相認，無其他主動夜間步驟。
- **目標限制**：由開膛手傑克於 round === 1 依 canJackRipperSelectFanatic 指定（不可為傑克自己且須存活）。狂熱粉本人無主動技能目標。
- **免疫／反傷／連帶效果**：被傑克指定後 secondRoleId 轉為 'fanatic'（原偵探身分失效，被排除於 resolveDetectiveCollectiveAccusation 之外）；狂熱粉本身無擊殺技能，但其死亡會於 syncConversionOnDeaths (604-610) 解鎖開膛手傑克擊殺（jackRipperKillUnlocked = true）。
- **次數限制**：無主動技能次數。
- **勝利條件／查驗判定**：victory.ts:66 計為 null；與開膛手傑克同享單一性別第三方勝利條件（或同遭偵探指證失敗）。
- **程式碼定位**：`src/logic/conversionRoles.ts:322-339, 419-424, 604-610; src/logic/nightResolution.ts:1100-1118; src/components/day/ExtraDaySkillsSection.tsx:27-36; src/store/gameStore.ts:713-726, 2906-2930`
- **未實作／僅手動／斷鏈註記**：12p-jack-the-ripper-2 板子在 boards.ts 首夜無 jack_ripper_action 步驟，導致無法於實際 UI 流程指定狂熱粉；submitExileVotes 放逐狂熱粉未呼叫 finalizeDayDeathSync 解鎖傑克。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (狂熱粉死解鎖傑克)、src/logic/deepAuditFixes.test.ts (選為狂熱粉後排除在偵探集結之外)。缺選狂熱粉限制與主身分／投票放逐邊界測試。

### 2.8 第三方與特殊機制角色（13 名）

#### 105. 復仇者（`avenger`｜第三方陣營 / third_party）
- **觸發時機**：首夜（round === 1）步驟為 confirm_only；陣營於 nightResolution.ts 第 1076-1085 行隨 shadowMasterTarget 寫入（若主人為 wolf -> 'good'，非狼 -> 'wolf'，主人為 avenger -> 'third_party'）。刺殺需手動呼叫 gameStore.avengerAssassinate，無自動死亡觸發。
- **目標限制**：resolveAvengerAssassinate(seats, state, targetSeat, round) 僅驗證 target 存在且 isAlive；未檢查復仇者自身是否已死亡，也未阻止對自己或重複發動刺殺。
- **免疫／反傷／連帶效果**：resolveAvengerAssassinate：若刺殺目標為「未變身的影子」（target.roleId === 'shadow' && !state.shadowInheritedRoleId），設 avengerInstantWin = true 並觸發第三方獨自勝利（目標不倒牌）；若目標為對立陣營（依 avengerAlignedFaction === 'good'/'wolf' 對照 isSeatWolfFaction(target)），目標以 deathReason: 'avenger_assassinate' 出局；同陣營或 avengerAlignedFaction === 'third_party' 時目標不倒牌。
- **次數限制**：程式碼未實作次數計數器（resolveAvengerAssassinate 未紀錄 avengerAssassinateUsed），理論上可被重複呼叫。
- **勝利條件／查驗判定**：checkConversionThirdPartyVictory 檢查 state.avengerInstantWin -> 'third_party' 勝。victory.ts getEffectiveSide 未處理 'avenger'（roles.ts 為 third_party），故目前不計入好人/狼人屠邊人數。getSeerCheckResult 回傳 'good'；getPsychicCheckResult 回傳 'avenger'。
- **程式碼定位**：`src/logic/conversionRoles.ts:222, 594-600, 626-692, 726-731; src/logic/nightResolution.ts:1076-1085; src/logic/mechWolf.ts:93-154; src/logic/setup.ts:113; src/store/gameStore.ts:2217-2258; src/data/boards.ts:9189-9212`
- **未實作／僅手動／斷鏈註記**：1) victory.ts getEffectiveSide 未實作 avengerAlignedFaction 歸屬，導致好人側復仇者未計為神職、狼側復仇者未計為狼人；2) 死亡後刺殺未於 nightResolution/dayResolution 自動觸發，且 gameStore.avengerAssassinate 未接線至任何 UI 元件（全靠手動/Store 呼叫）。
- **現有行為測試覆蓋**：src/logic/conversionRoles.test.ts (lines 191-208) 僅測影子選狼後 avengerAlignedFaction === 'good' 及刺中未變身影子立即第三方勝；src/logic/deepAuditFixes.test.ts (line 271) 僅測板子預設白痴追刀規則。未測刺殺對立/同陣營生死與勝負計數。

#### 106. 白澤（`bai_ze`｜好人陣營 / god）
- **觸發時機**：首夜為 confirm_only；第二晚起 nightSchedule 排程 bai_ze_clear，nightResolution.ts 於 2838 行在白澤（updatedSeats）仍存活時清除 draft.baiZeClearTarget 標記。繼承需手動呼叫 gameStore.setBaiZeHeir。
- **目標限制**：bai_ze_clear：NightConsoleScreen 僅限制目標為存活玩家（含可選自己）。resolveBaiZeInherit：要求 heir 存活且有 roleId。
- **免疫／反傷／連帶效果**：清除：clearBaiZeMarks 移除 targetSeat 於 nineTailsMarkedSeats 之標記。繼承：resolveBaiZeInherit 對存活平民設 seat.baiZeDualFaction = true（神/民雙陣營）；對狼人設 baiZeHeirRoleType = 'wolf' 無事發生；對神職設 baiZeHeirRoleType = 'god'，於 nightResolution.ts 3191-3226 行攔截該神職之夜死（若場上仍有其他存活神職或雙陣營平民則撤銷死亡並設 seat.baiZeDelayedDeath = true；若為最後一神則不延遲直接出局）。
- **次數限制**：清除每晚一次；繼承於 resolveBaiZeInherit 未阻斷重複指定（後蓋前）。
- **勝利條件／查驗判定**：一般好人神職計數；若平民成為繼承人（baiZeDualFaction = true），victory.ts countAliveFactions 與 checkVictory 同時計為 villagers +1 與 gods +1。預言家驗 'good'，通靈師驗 'bai_ze'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:414-435, 487-521; src/logic/nightResolution.ts:2838-2846, 3191-3226; src/logic/victory.ts:96-99, 148; src/store/gameStore.ts:2373-2398; src/components/screens/NightConsoleScreen.tsx:1363, 1723-1725; src/data/boards.ts:24474-24552`
- **未實作／僅手動／斷鏈註記**：1) baiZeDelayedDeath 在夜死被延遲後，dayResolution.ts 與 gameStore.ts 均無對應結算函式或 UI 讓該神職於放逐投票結束後正式出局；2) gameStore.setBaiZeHeir 未接線至任何 UI 元件；3) resolveBaiZeInherit 未檢核白澤是否為最後一神或死於獵殺時刻。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 179-188) 僅測 resolveBaiZeInherit 指定平民轉雙陣營後防屠神；未測夜間清除標記、神職繼承人延遲死亡、最後一神不延遲與狼人繼承。

#### 107. 管家（`butler`｜好人陣營 / god）
- **觸發時機**：首夜 confirm_only；第二晚起於 nightResolution.ts 第 3109 行結算 draft.butlerTeaTarget。
- **目標限制**：round >= 2、butler 存活（updatedSeats）且目標不在 butlerServedSeats 中；邏輯與 UI 未禁止選自己。
- **免疫／反傷／連帶效果**：預言家接茶：當晚驗出 seerResult.faction === 'wolf' 時擊殺被驗者（butler_seer_kill）。小狼接茶：撤銷 deaths 中首筆 'wolf_kill' 並復活該玩家。守衛接茶：設 butlerDayProtectedSeat = effectiveGuardTarget，並於 1727 行將 draft.butlerGuardSecondTarget 列入普通守護判定。平民接茶：設 butlerActiveVoteBonusSeat。狼僕／平民強制接受（不可拒絕）。
- **次數限制**：每晚最多一人，以 butlerServedSeats 紀錄並阻斷對同一名玩家重複上茶。
- **勝利條件／查驗判定**：標準好人神職計數；預言家驗 'good'，通靈師驗 'butler'。
- **程式碼定位**：`src/logic/nightResolution.ts:478-480, 1727-1728, 3109-3143; src/components/screens/NightConsoleScreen.tsx:1368, 1771-1773; src/components/day/NightStatusBanners.tsx:71-78; src/data/boards.ts:25886-25964`
- **未實作／僅手動／斷鏈註記**：1) `nightResolution.ts` L1727-1728 已實作 `butlerGuardSecondTarget` 次要目標防狼刀，L3109-3143 已寫入 `butlerDayProtectedSeat` 與 `butlerActiveVoteBonusSeat`；2) 未實作與狼僕同選目標相互抵銷；3) UI 硬編碼 `butlerTeaAccepted: true`（受茶者無法拒絕）且缺 `butlerGuardSecondTarget` 輸入；4) 女巫多一瓶毒、`dayResolution.ts` 守衛護至天亮防放逐、`voting.ts` 平民 +1 票權均未接入結算。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 277-290) 僅測管家上茶給預言家驗到狼僕時擊殺狼僕（butler_seer_kill）。其餘五種身分效果、拒絕上茶、相互抵銷與投票加權均無測試。

#### 108. 舞者（`dancer`｜好人陣營 / god）
- **觸發時機**：首夜 confirm_only；第二晚起於 subsequentNights step 1 執行 dancer_dance，並於 nightResolution.ts 第 2869 行結算。
- **目標限制**：canDancerPickFloor：僅限 round >= 2、剩餘未進過舞池之存活人數 >= 3、必須選滿 3 位不同且未曾進過舞池（dancerVisitedSeats）的存活玩家（可包含舞者自己）。
- **免疫／反傷／連帶效果**：resolveDancerFloor：若存活的舞者在 targets 3 人之中，該 3 人皆列入 immuneToWolfKillSeats，nightResolution.ts 第 2887-2897 行會移除他們當晚的 'wolf_kill' 死亡並復活；陣營較少的一方（2:1）以 deathReason: 'dance_out' 出局，3 人同陣營則無人出局。與假面改判 maskedAlterSeatTonight 連動翻轉單目標陣營判定。
- **次數限制**：第二晚起每晚一次；每人整局只能進舞池一次（dancerVisitedSeats）。
- **勝利條件／查驗判定**：標準好人神職計數；預言家驗 'good'，通靈師驗 'dancer'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:524-591; src/logic/nightResolution.ts:2869-2901; src/logic/nightValidation.ts:353-357; src/components/screens/NightConsoleScreen.tsx:1425-1442, 1726-1728; src/data/boards.ts:16456-16534`
- **未實作／僅手動／斷鏈註記**：1) 原文 Tip「舞者免疫女巫毒藥」在 nightResolution.ts 與 killSeat 完全未實作；2) NightConsoleScreen 未禁用已進過舞池之座位（dancerVisitedSeats）；3) nightValidation.ts checkMandatoryNightTarget 允許 dancer_dance 選 0 人跳過。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 191-223) 測試第二晚舞池 2 好 1 狼淘汰少數狼、且舞者入池免除狼刀。未測三人同陣營、假面改判、不足三人與重複選限制、以及舞者毒藥免疫。

#### 109. 邪惡商人（`evil_merchant`｜狼人陣營 / wolf）
- **觸發時機**：每晚隨狼隊wolf_kill，並於夜間步驟 evil_merchant_gift 寫入贈禮狀態（nightResolution.ts 3043 行）。
- **目標限制**：nightResolution.ts 僅檢查 evilMerchantDisabled === false、evil_merchant 存活與 draft.evilMerchantTarget != null，未限制目標必須為非己的小狼；NightConsoleScreen 僅限存活玩家。
- **免疫／反傷／連帶效果**：dayResolution.ts resolveSelfExplode 禁止邪惡商人自爆。nightResolution.ts 3043-3056 行僅於狀態寫入 evilMerchantGunHolderSeat（首晚或 hunter_gun）或清空槍位改寫入 evilMerchantPoisonHolderSeat（witch_poison），並無任何後續擊殺、回收或防護連動。
- **次數限制**：應由 evilMerchantDisabled 控管「槍或毒使用後永久失效」，但程式碼從未將 evilMerchantDisabled 設為 true。
- **勝利條件／查驗判定**：標準狼人陣營計數；預言家驗 'wolf'，通靈師驗 'evil_merchant'。
- **程式碼定位**：`src/logic/dayResolution.ts:713; src/logic/nightResolution.ts:3043-3056; src/components/screens/NightConsoleScreen.tsx:1367, 1759-1763; src/data/boards.ts:24930-25062`
- **未實作／僅手動／斷鏈註記**：高度未實作：1) nightResolution.ts 未禁止邪惡商人自刀；2) 第 2 晚起未檢核「白天須有未持槍之其他狼人出局」，且 UI 硬編碼第 2 晚起永遠給毒藥；3) dayResolution.ts checkCanShoot 未讀取 evilMerchantGunHolderSeat，持槍小狼出局無法開槍；4) nightResolution.ts 與 UI 皆未實作持毒小狼下毒功能；5) evilMerchantDisabled 從未被設為 true；6) 技能目標未限定為小狼。
- **現有行為測試覆蓋**：零行為測試（totalBehaviorHits === 0）。

#### 110. 異族王子（`exotic_prince`｜好人陣營 / god）
- **觸發時機**：首夜 confirm_only；第二晚起於 nightResolution.ts 第 490-500 行結算 draft.exoticPrinceCheckTarget。
- **目標限制**：NightConsoleScreen 僅限制目標存活（未限制不能選自己）；nightResolution.ts 限制 round >= 2 且 exotic_prince 存活。
- **免疫／反傷／連帶效果**：isSeatAsleep 對 roleId === 'exotic_prince' 恆回傳 false；advanceSleepSpread 若 round === 1 抽中 exotic_prince 則 sleepingBeautySeat = null（本場無睡美人）；resolveExoticPrinceCheck 查中 sleepingBeautySeat 時設 sleepingBeautyAwakened = true 並清空 sleepingSeats。
- **次數限制**：第二晚起每晚可查驗 1 位玩家。
- **勝利條件／查驗判定**：因 roles.ts 誤設為 category: 'god'，victory.ts 目前計為神職（應為平民）；預言家驗 'good'，通靈師驗 'exotic_prince'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:347-411; src/logic/nightResolution.ts:490-500; src/logic/nightValidation.ts:181-192; src/data/roles.ts:1124-1129; src/components/screens/NightConsoleScreen.tsx:1361, 1717-1719; src/data/boards.ts:26585-26607`
- **未實作／僅手動／斷鏈註記**：1) roles.ts 將 category 錯設為 'god'（原文為「平民」），導致 victory.ts 將其計為神職；2) nightValidation.ts 直接以 sleepingSeats 鎖定行動而未呼 isSeatAsleep，會誤鎖異族王子查驗；3) NightResolutionResult 與 NightConsoleScreen 無查驗成功告知介面（法官無結果橫幅）。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 75-142) 測試第二晚之後異族王子查中睡美人可喚醒並清除 sleepingSeats。未測首夜抽中異族王子、睡眠擴散不鎖王子與王子的平民計邊。

#### 111. 假面（`masked_wolf`｜狼人陣營 / wolf）
- **觸發時機**：首夜 confirm_only；第二晚起執行 masked_wolf_action，並於 nightResolution.ts 第 2849-2867 行結算。
- **目標限制**：round >= 2、UI 限存活玩家（可選雙目標）；nightResolution.ts 檢查不可與上一晚 maskedWolfLastCheckSeat / maskedWolfLastAlterSeat 相同。
- **免疫／反傷／連帶效果**：dayResolution.ts 禁止自爆；syncBatch5LoneWolfTeamStatus 當場上無其他存活團隊狼人時設 maskedWolfJoinedTeam = true。resolveDancerFloor 依 maskedAlterSeatTonight 翻轉該座位在舞池內的狼/好人判定（不在舞池則無效）。
- **次數限制**：第二晚起每晚可查 1 人、改判 1 人（皆不可連續兩晚選同一人）。
- **勝利條件／查驗判定**：標準狼人陣營計數（計入存活狼人數量）；預言家驗 'wolf'，通靈師驗 'masked_wolf'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:524-591, 758-792; src/logic/dayResolution.ts:712; src/logic/nightResolution.ts:2849-2867; src/components/screens/NightConsoleScreen.tsx:1410-1424, 1729-1734; src/data/boards.ts:16467-16556`
- **未實作／僅手動／斷鏈註記**：1) 原文 Tip「假面免疫女巫毒藥」在 nightResolution.ts 與 killSeat 完全未實作；2) NightConsoleScreen 與 NightResolutionResult 無顯示「查驗目標是否進入舞池」之結果橫幅；3) 連選同人於 nightResolution.ts 僅靜默略過而非報錯，UI 亦未禁用前晚目標；4) boards.ts 將 masked_wolf 列入每晚 wolf_kill actorRoleIds，未限制入隊前不與狼隊見面；5) nightResolution.ts 以 updatedSeats 判斷假面存活，若於夜死後可能無法改判。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 191-223) 僅將 masked_wolf 放入測試座位陣列，未實際傳入 maskedWolfCheckTarget 或 maskedWolfAlterTarget，亦未測孤狼入隊、禁連選與毒藥免疫（實質上技能行為未涵蓋）。

#### 112. 通靈者（`medium`｜好人陣營 / god）
- **觸發時機**：首夜 confirm_only；第二晚起於 medium_channel 通靈給繼承者，繼承者須於下晚之後（receivedRound < round）才可使用。
- **目標限制**：canMediumChannel：deadSeat 必須已死且未曾被通靈（mediumChanneledDeadSeats）；heirSeat 必須存活、非通靈者本人且未曾繼承（mediumInheritedHeirs）。UI 未於座格上禁用不合法目標。
- **免疫／反傷／連帶效果**：getChannelableSkillForRole：僅 wolf->wolf_kill、seer->seer_check、witch->witch_poison、guard->guard_shield。nightResolution.ts：繼承狼刀（medium_knife）會被守衛盾、通靈盾或同目標女巫解藥擋下；繼承盾（mediumShieldSeat）列入 guardedByNormal，若同目標又被女巫解藥救起會觸發 milk_pierce。
- **次數限制**：每晚可通靈 1 名死者給 1 名存活者；每位死者限被通靈 1 次、每位存活者限繼承 1 次、每次繼承技能限用 1 次。
- **勝利條件／查驗判定**：標準好人神職計數；預言家驗 'good'，通靈師驗 'medium'。未實作雙通靈刀同殺最後狼與最後神/民之優先判狼勝。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:720-752; src/logic/nightResolution.ts:1703-1713, 3059-3106; src/components/screens/NightConsoleScreen.tsx:1411-1424, 1765-1770; src/data/boards.ts:22348-22519`
- **未實作／僅手動／斷鏈註記**：1) 繼承的預言家查驗（seer_check）在 nightResolution.ts 與 UI 完全未實作；2) draft 僅有單組 mediumSkillActionSeat/Target，不支援多名繼承者同晚行動；3) medium_knife 在 step 8.68f 執行而非 wolf_kill 之前（違反繼承者刀優先順序），且無雙刀同殺最後一狼與最後一神/民優先判狼勝之邏輯；4) 12p-medium 繼承者行動步驟皆為 confirm_only 且無 UI 選單；5) nightResolution.ts 用 updatedSeats 檢查通靈者存活。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 258-313) 測通靈死狼給平民，次晚發動 medium_knife 擊殺。未測預言家查驗、女巫毒、守衛盾奶穿與多刀、同晚兩把通靈刀、不可自查、不可重複通靈/繼承。

#### 113. 九尾（`nine_tails_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚執行 nine_tails_mark（nightResolution.ts 2829 行）；白天獵殺時刻須主動呼叫 gameStore.triggerNineTailsHunt（無 UI 按鈕）。
- **目標限制**：NightConsoleScreen 僅限選存活目標；addNineTailsMark 無額外限制（可重複點同一人或自己）。
- **免疫／反傷／連帶效果**：dayResolution.ts 禁止自爆；syncBatch5LoneWolfTeamStatus 於場上無其他存活團隊狼人時設 nineTailsJoinedTeam = true。addNineTailsMark 不疊層（array 去重）。resolveNineTailsHunt：若存活的「九尾＋被標記存活玩家」（A 組）人數嚴格大於其餘存活玩家（B 組），B 組全員以 deathReason: 'nine_tails_hunt' 出局（此死因不在可開槍集合內，故無法開槍）；若 A <= B 則不處理。
- **次數限制**：每晚一次標記；白天獵殺時刻可重複發動（無次數上限）。
- **勝利條件／查驗判定**：標準狼人陣營計數（計入存活狼人數量）；預言家驗 'wolf'，通靈師驗 'nine_tails_wolf'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:414-485, 758-792; src/logic/dayResolution.ts:711; src/logic/nightResolution.ts:2829-2837; src/store/gameStore.ts:2335-2371; src/components/screens/NightConsoleScreen.tsx:1362, 1720-1722; src/data/boards.ts:24485-24563`
- **未實作／僅手動／斷鏈註記**：1) 投警徽票與放逐票（含 qa_138 PK 投票）自動標記目標完全未實作；2) gameStore.triggerNineTailsHunt 未接線至任何 UI 元件；3) 原文 Tip「九尾免疫女巫毒藥」未實作；4) nightValidation.ts 未強制每晚必須標記一名玩家；5) nightResolution.ts 以 updatedSeats 判斷九尾存活，且 boards.ts 每晚都把 nine_tails_wolf 列入 wolf_kill actorRoleIds。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 144-178) 測首夜九尾標記與 resolveNineTailsHunt（A > B）成功淘汰 B 方。未測獵殺失敗（A <= B）、孤狼入隊、投票標記、毒藥免疫與白澤無法傳承。

#### 114. 潘朵拉（`pandora`｜第三方陣營 / third_party）
- **觸發時機**：每晚執行 pandora_gift（nightResolution.ts 2793 行），白天可透過 store 呼叫 pandoraDayGift / usePandoraHopeLight / usePandoraDayGun；魔盒刀於 nightResolution.ts 2814 行結算。
- **目標限制**：canPandoraGift：僅限存活且未曾獲贈過魔盒之玩家（含潘朵拉自己），且魔盒尚有該項道具。canPandoraKnifeHolderAttack：潘朵拉自己開出刀時須待 5 個魔盒全數送出（pandoraRemainingBoxes.length === 0）方可使用。
- **免疫／反傷／連帶效果**：applyPandoraGift：開出 poison 時若目標為 pandora 則免疫無傷，否則目標以 deathReason: 'pandora_poison'（屬 POISON_DEATH_REASONS 不可開槍）出局。nightResolution.ts 魔盒刀（pandora_knife）於 8.68a 結算，不檢查 witchUseAntidote（無視解藥）。resolvePandoraHopeLight：使用者為場上最後一狼／第三方／民／神時設 pandoraHopeLightWinner 立即判該陣營勝。checkThirdPartySpecialVictory 於 victory.ts 最高優先級判定。
- **次數限制**：魔盒共 5 個（knife, poison, hope_light, day_gun x2），每人整局最多獲贈 1 次，贈完為止。
- **勝利條件／查驗判定**：checkThirdPartySpecialVictory 具全場最高勝出優先權：(1) 全場僅剩潘朵拉存活；(2) 5 盒送完且其餘獲贈者全死而潘朵拉存活；(3) pandoraHopeLightWinner 成立。預言家驗 'good'，通靈師驗 'pandora'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:92-325; src/logic/mechWolf.ts:121; src/logic/nightResolution.ts:2793-2826; src/logic/victory.ts:123; src/store/gameStore.ts:2260-2333, 2932-3004; src/components/day/ExtraDaySkillsSection.tsx:159-219; src/components/screens/NightConsoleScreen.tsx:1358-1359, 1708-1713`
- **未實作／僅手動／斷鏈註記**：1) 日槍規則寫反：dayResolution.ts 放逐未賦予日槍開槍資格，反而是 ExtraDaySkillsSection 與 gameStore.usePandoraDayGun 讓持有者白天隨時開槍殺人；2) NightConsoleScreen pandora_gift 未設定 pandoraGiftItem，導致夜間贈盒在 UI 實質無效；3) 9p-pandora 夜序沒有 pandora_knife 步驟；4) 白天贈盒（pandoraDayGift，亦缺潘朵拉存活檢查）與希望之光（usePandoraHopeLight）無 UI 接線。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 30-73) 測查驗為好人、自毒免疫、5 盒送完他方全滅優先勝與希望之光；src/logic/flowBugFixes.test.ts (lines 100-109) 測 pandora_day_gun 射殺覺醒獵人可連鎖開槍。未測魔盒刀無視解藥與日槍放逐規則。

#### 115. 睡美人（`sleeping_beauty`｜第三方陣營 / third_party）
- **觸發時機**：每晚 resolveNight 开头呼叫 advanceSleepSpread 自動推進睡眠狀態；勝利判定於 checkVictory 好人／狼人達標時覆蓋結算。
- **目標限制**：advanceSleepSpread(seats, state, round, pickedSeat)：首夜可指定場上任一座位，若為 exotic_prince 則作廢。
- **免疫／反傷／連帶效果**：advanceSleepSpread：首夜指定 sleepingBeautySeat（若選中 exotic_prince 則本場無睡美人）；次夜起每晚向左右擴散 1 格（環狀不跳過死座）。睡眠中效果：熊不咆哮（nightResolution.ts 3437 行）、女巫毒藥無效（3172 行移除 witch_poison）、禁言長老無效（3185 行清空 activeMutedSeat 與 muted）、全狼睡眠則狼刀空刀（1689 行）、夜死獵人無法開槍（3420 行）。
- **次數限制**：整場 1 名睡美人，每晚自動左右各擴散 1 格直到被異族王子查中喚醒（sleepingBeautyAwakened = true）清空所有睡眠狀態。
- **勝利條件／查驗判定**：victory.ts 第 188-200 行：當好人或狼人達成勝利條件時，若 sleepingBeautySeat != null、!sleepingBeautyAwakened 且該座位仍存活，第三方（睡美人）單獨獲勝。sleeping_beauty 本身不計入屠邊人數。預言家驗 'good'，通靈師驗 'sleeping_beauty'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:328-411; src/logic/nightResolution.ts:483-501, 1689-1691, 3171-3189, 3420-3442; src/logic/nightValidation.ts:181-192; src/logic/victory.ts:188-200; src/data/boards.ts:26517-26653`
- **未實作／僅手動／斷鏈註記**：1) 12p-sleeping-beauty 缺少首夜 sleeping_beauty_pick 步驟且 gameStore 無隨機抽取邏輯，實際遊玩睡美人不會啟動；2) dayResolution.ts checkCanShoot 未檢查 isSeatAsleep，白天放逐睡眠獵人仍可開槍；3) nightValidation.ts 直接用 sleepingSeats 鎖定步驟，誤鎖異族王子且連同女巫解藥一起鎖死；4) nightResolution.ts 1690 行在女巫行動之後才清空全狼睡眠狼刀，導致女巫仍會看見刀口。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 75-142) 測首夜指定與擴散、熊不咆哮、女巫毒失敗、全狼睡眠空刀、異族王子喚醒；src/logic/deepAuditFixes.test.ts (lines 187-210) 測睡美人勝利覆蓋。未測白天獵人睡眠不可開槍、且 bucket_8.json 因索引關鍵字差異顯示 0 命中。

#### 116. 超級黑市商人（`super_black_market_merchant`｜好人陣營 / god）
- **觸發時機**：首夜透過 super_black_market_gift 選出三名幸運兒；幸運兒毒於夜間 lucky_item_action 結算，槍於出局 checkCanShoot 判定。
- **目標限制**：NightConsoleScreen 限選 3 名不重複存活玩家（未禁止選自己）；nightResolution.ts 僅檢查 entries.length === 3，未檢查不重複、存活或非己。
- **免疫／反傷／連帶效果**：dayResolution.ts 禁止自爆；3 位幸運兒皆為非狼陣營時設 superBlackMarketTurnedWolf = true，轉為狼人陣營（victory.ts 與 isSeatEffectiveWolf 計入狼人），且無其他存活團隊狼人時由 syncBatch5LoneWolfTeamStatus 設 superBlackMarketJoinedTeam = true。幸運兒毒藥於 nightResolution.ts 3032 行結算（witch_poison）；幸運兒槍由 dayResolution.ts checkCanShoot（非狼王等內建射手且非毒死）發動，受 ruleOverrides.luckyFirstNightSkills.superBlackMarket 管制首夜權限。
- **次數限制**：超級黑市商人整局贈禮 1 次（superBlackMarketUsed）；3 件道具各限用 1 次。
- **勝利條件／查驗判定**：未變身時屬好人神職；若 superBlackMarketTurnedWolf = true，victory.ts getEffectiveSide 與 isSeatEffectiveWolf 立即改計為 'wolf'。預言家目前因未接 superBlackMarketTurnedWolf 而恆驗 'good'，通靈師驗 'super_black_market_merchant'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:630-718, 758-792; src/logic/nightResolution.ts:1693-1701, 2956-3041; src/logic/dayResolution.ts:97-133, 715; src/logic/factionHelpers.ts:21-26; src/logic/victory.ts:33-38; src/components/screens/NightConsoleScreen.tsx:1387-1390, 1426-1442, 1750-1757; src/data/boards.ts:25206-25341`
- **未實作／僅手動／斷鏈註記**：1) 幸運兒「查驗（seer_check）」在 nightResolution.ts 與 UI 完全未實作；2) checkCanShoot 當狼王拿槍時會因 isBuiltInShooter 而略過幸運兒槍，無法帶走兩名玩家；3) triggerShoot 開槍後未標記 superBlackMarketGifts 該項為 used: true；4) mechWolf.ts getSeerCheckResult 未考量 superBlackMarketTurnedWolf，變狼後預言家仍驗好人；5) NightConsoleScreen 沒有設定 luckyItemActorSeat 之 UI，且第二晚起步驟 2 仍顯示選 3 人贈禮介面而非確認變身/入隊。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 226-256) 測三名幸運兒皆好人時轉為 superBlackMarketTurnedWolf = true；src/logic/flowBugFixes.test.ts (lines 153-160) 測首夜幸運兒房規預設值。未測幸運兒用毒/開槍/查驗、狼王雙槍、轉狼後勝負計數與孤狼入隊。

#### 117. 狼僕（`wolf_maid`｜狼人陣營 / wolf）
- **觸發時機**：首夜 confirm_only（狼隊見面告知位置）；第二晚起於 nightResolution.ts 第 3145 行結算 draft.wolfMaidTeaTarget，並在場上無其他狼人時入狼隊帶刀。
- **目標限制**：round >= 2、wolf_maid 存活（initialSeats）且目標不在 wolfMaidServedSeats 中；UI 與邏輯未禁止選自己。
- **免疫／反傷／連帶效果**：dayResolution.ts 禁止自爆；syncBatch5LoneWolfTeamStatus 於無其他存活團隊狼人時設 wolfMaidJoinedTeam = true。上茶效果：預言家或女巫接受即死亡（wolf_maid_tea_kill）；守衛接受且有守護目標時，該首選目標死亡（wolf_maid_tea_kill）；小狼接受且有 draft.wolfMaidExtraKillTarget 時額外死亡一人（wolf_kill）；平民強制接受並設 wolfMaidActiveVotePenaltySeat；管家強制接受（得知狼僕位置由法官口頭告知）。
- **次數限制**：每晚最多一人，以 wolfMaidServedSeats 紀錄並阻斷對同一名玩家重複上茶。
- **勝利條件／查驗判定**：標準狼人陣營計數；預言家驗 'wolf'，通靈師驗 'wolf_maid'。
- **程式碼定位**：`src/logic/thirdPartySpecialRoles.ts:758-792; src/logic/dayResolution.ts:714; src/logic/nightResolution.ts:481-482, 3145-3169; src/components/screens/NightConsoleScreen.tsx:1369, 1774-1776; src/components/day/NightStatusBanners.tsx:80-87; src/data/boards.ts:25874-25975`
- **未實作／僅手動／斷鏈註記**：1) 違反 qa_143：nightResolution.ts 女巫行動早於狼僕上茶結算且未封鎖，女巫被上茶後仍可使用解藥與毒藥；2) 與管家選擇同一目標「相互抵銷」未實作；3) NightConsoleScreen 硬編碼 wolfMaidTeaAccepted: true，且無輸入 wolfMaidExtraKillTarget 之介面；4) 守衛接茶未無效化次要目標且主目標仍能先擋狼刀；5) 小狼加刀於 3166 行繞過守衛/解藥/夢遊；6) 平民 -1 票權（警長變 0.5 票）僅顯示橫幅，未接入 voting.ts 計票。
- **現有行為測試覆蓋**：src/logic/thirdPartySpecialRoles.test.ts (lines 258-291) 僅測狼僕上茶給女巫導致女巫死亡（wolf_maid_tea_kill）。未測 qa_143（女巫被上茶禁用解藥）、先知/守衛/管家/小狼/平民效果、拒絕機制、與管家抵銷及孤狼入隊。

### 2.9 最後批次與其餘角色（13 名）

#### 118. 蝕日侍女（`eclipse_maid`｜狼人陣營 / wolf）
- **觸發時機**：第二晚起夜間步驟 eclipse_maid_devour（於 nightResolution.ts 步驟 8.69b 結算）；所有其他狼人出局時 syncFinalBatchLoneWolfTeamStatus 設 eclipseMaidJoinedTeam = true。
- **目標限制**：canEclipseMaidDevour 限制 round >= 2、目標存活且 !isSeatWolfFaction(target)；NightConsoleScreen 未呼叫檢核函式鎖定目標，且未阻擋吞噬幸運兒獲得之技能。
- **免疫／反傷／連帶效果**：僅於 nightResolution.ts:3267-3325 實作：吞女巫撤銷 witch_poison 並改由侍女執行 eclipse_maid_kill（設 witchPoisonUsed）；吞獵魔人移除侍女的 witch_poison 死亡並狩狼殺狼／狩好自死；吞咒狐移除侍女的 wolf_kill 死亡；吞奇蹟商人選狼時侍女 merchant_backfire 自死。dayResolution.ts:716 禁止自爆。其他所有吞噬交互（流光伯爵反噬與庇護、預言／覺醒預言／通靈查驗、攝夢連夢、獵人奪槍、許仙綁定）皆未實作。
- **次數限制**：第二晚起每晚可吞噬一次；整場於其他狼全滅後入隊。
- **勝利條件／查驗判定**：faction = wolf；預言家驗為狼人（查殺），通靈師／純白／石像鬼驗為 eclipse_maid。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:56-72,401-422; src/logic/nightResolution.ts:3258-3326; src/logic/dayResolution.ts:716; src/components/screens/NightConsoleScreen.tsx:1408,1780-1785`
- **未實作／僅手動／斷鏈註記**：流光伯爵反噬與庇護、預言家／覺醒預言家／通靈師查驗結果與封鎖、攝夢人攝夢與連夢致死、獵人奪槍、許仙綁定、寂夜導師增幅封鎖、獵魔人被吞後不免毒、咒狐被吞後不防狼刀與免被驗死皆未實作；未入隊前不參與狼刀亦僅依賴台詞／手動。
- **現有行為測試覆蓋**：極弱（僅 finalBatchRoles.test.ts L33-64 測不可自爆與吞女巫奪毒，其餘吞噬交互零測試）

#### 119. 羊駝（`alpaca`｜好人陣營 / villager）
- **觸發時機**：無主動技能，全夜閉眼。
- **目標限制**：無主動目標選擇。
- **免疫／反傷／連帶效果**：無特殊免疫或連鎖效果。
- **次數限制**：無技能次數。
- **勝利條件／查驗判定**：faction = good, category = villager；計入平民邊（villagers）屠邊／屠城計數；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 alpaca。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:43-45; src/logic/victory.ts:65; src/logic/mechWolf.ts:147-153`
- **未實作／僅手動／斷鏈註記**：無（全自動結算，同平民）
- **現有行為測試覆蓋**：正常（finalBatchRoles.test.ts L66-110 測 isAnimalVillagerRole 與屠民勝利計數）

#### 120. 兔兔（`bunny`｜好人陣營 / villager）
- **觸發時機**：無主動技能，全夜閉眼。
- **目標限制**：無主動目標選擇。
- **免疫／反傷／連帶效果**：無特殊免疫或連鎖效果。
- **次數限制**：無技能次數。
- **勝利條件／查驗判定**：faction = good, category = villager；計入平民邊（villagers）屠邊／屠城計數；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 bunny。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:43-45; src/logic/victory.ts:65; src/logic/mechWolf.ts:147-153`
- **未實作／僅手動／斷鏈註記**：無（全自動結算，同平民）
- **現有行為測試覆蓋**：正常（finalBatchRoles.test.ts L66-110 測 isAnimalVillagerRole 與屠民勝利計數）

#### 121. 定序王子（`sequence_prince`｜好人陣營 / god）
- **觸發時機**：放逐投票結算後（DayVoteScreen.tsx 顯示按鈕）呼叫 triggerSequencePrinceRevote。
- **目標限制**：無目標選擇，僅要求場上存在存活之 sequence_prince。
- **免疫／反傷／連帶效果**：gameStore.ts triggerSequencePrinceRevote 僅重設 exilePkCandidates、exilePkStage、exilePkSpeakingOrder 與 exileResolvedToday，未復活已放逐死亡玩家亦未切回發言階段。
- **次數限制**：sequencePrinceUsed 整場僅限發動一次。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 sequence_prince。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:168-182; src/store/gameStore.ts:2400-2421; src/components/screens/DayVoteScreen.tsx:59-64,137-146`
- **未實作／僅手動／斷鏈註記**：翻牌後「再發言一次」須法官手動控制流程；且若放逐結果已使目標死亡（或遊戲直接 game_over），Store 未回滾死亡與警徽狀態。
- **現有行為測試覆蓋**：薄弱（finalBatchRoles.test.ts L202-206 僅測次數限制；bugfixBatch19.test.ts L159-189 僅測重投後清空 exileResolvedToday，未驗證已死座位復活）

#### 122. 槓精（`contrarian`｜好人陣營 / god）
- **觸發時機**：白天發言階段（目前僅 gameStore.resolveContrarianVote 存在，無 UI 入口）。
- **目標限制**：目標須為槓精以外的存活玩家（finalBatchRoles.ts:220-229）。
- **免疫／反傷／連帶效果**：resolveContrarianDebate 若過半則設 silencedVoterSeat = targetSeat，且若 target 為現任警長則將 newSheriffSeat 轉交給槓精；未過半則 silencedVoterSeat = 槓精本人。但 voting.ts 與 gameStore.ts submitExileVotes 未讀取 contrarianSilencedVoterSeat，失去投票權實質未生效。
- **次數限制**：contrarianUsed 整場僅限發動一次。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 contrarian。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:188-246; src/store/gameStore.ts:2423-2450`
- **未實作／僅手動／斷鏈註記**：src/components/ 完全未接線開槓 UI；計票（voting.ts / ExileVotePanel）未排除 contrarianSilencedVoterSeat；「中止目標發言」僅能手動跳過。
- **現有行為測試覆蓋**：極弱（僅 finalBatchRoles.test.ts L207-211 單測 resolveContrarianDebate 回傳值，零 Store 與計票整合測試）

#### 123. 偵探（`detective`｜好人陣營 / god）
- **觸發時機**：偵探怪盜板為白天發言階段翻牌、警上／發言完畢後處決（僅存於 gameStore 無 UI）；第二身分板為已出局偵探於白天集結指證（ExtraDaySkillsSection）。
- **目標限制**：偵探怪盜板處決目標須存活；第二身分板指證目標須為場上任意座位且已出局偵探 >= 2 人。
- **免疫／反傷／連帶效果**：偵探怪盜板：triggerDetectiveReveal 奪取警徽並於 dayResolution.ts:617 禁用當日狼人自爆；detectiveExecutePlayer 處決目標（怪盜狼王無敵時免死）並設定警犬於 round + 1 激活（處決狼→check、處決好→bite）。第二身分板：已出局偵探（非狂熱粉）達 2 人且達半數同意可指證開膛手傑克使第三方失敗。
- **次數限制**：偵探怪盜板翻牌與處決皆限整場 1 次（detectiveUsed）；第二身分板集結指證整場 1 次（jackRipperDetAccusationUsed）。
- **勝利條件／查驗判定**：faction = good, category = god（第二身分板依其主身分計入對應陣營，偵探為 secondRoleId）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 detective（或主身分）。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:252-343; src/logic/conversionRoles.ts:396-473; src/logic/dayResolution.ts:617-623; src/store/gameStore.ts:2452-2513,2906-2930; src/components/day/ExtraDaySkillsSection.tsx:27-156; src/components/day/NightStatusBanners.tsx:103-110`
- **未實作／僅手動／斷鏈註記**：偵探怪盜板的翻牌奪徽與處決在 src/components/ 完全無 UI 按鈕可觸發；未指定目標時由法官隨機指定亦未實作；處決後遺言與開槍判定未接線；resolveDetectiveExecute 未檢核偵探存活與當日已翻牌。第二身分板集結指證已全接線 UI。
- **現有行為測試覆蓋**：中（finalBatchRoles.test.ts L158-167 測偵探怪盜板；deepAuditFixes.test.ts L114-185 測第二身分板集結指證）

#### 124. 灰太狼（`grey_wolf_boss`｜狼人陣營 / wolf）
- **觸發時機**：每晚夜間步驟 grey_wolf_boss_steal（於 nightResolution.ts 8.69c 結算）；他狼全滅後 syncFinalBatchLoneWolfTeamStatus 設 greyWolfBossJoinedTeam = true。
- **目標限制**：canGreyWolfBossSteal 禁止偷自己、禁止非存活玩家、每人整局只能被偷一次（greyWolfBossStolenSeats）。
- **免疫／反傷／連帶效果**：受喜羊羊防盜阻斷時偷取失敗（仍消耗該對象被偷名額）；round >= 2 偷小狼／小小灰時撤銷 wolf_kill 改殺 greyWolfBossUseSkillTarget（grey_wolf_steal_kill），但因結算順序晚於女巫，女巫仍能看刀口；偷女巫未封鎖原女巫毒藥且錯讀未扣前 witchPoisonUsed；偷獵人僅設 flag 未接線開槍。dayResolution.ts:717 禁自爆。
- **次數限制**：每晚可偷一次，同一名玩家全場限被偷一次。
- **勝利條件／查驗判定**：faction = wolf；預言家驗為狼人（查殺），通靈師／純白／石像鬼驗為 grey_wolf_boss。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:78-98,401-422; src/logic/nightResolution.ts:3328-3361; src/logic/dayResolution.ts:717; src/components/screens/NightConsoleScreen.tsx:1409,1786-1791`
- **未實作／僅手動／斷鏈註記**：偷預言家查驗、偷喜羊羊「智鬥」猜測（猜錯出局／猜對歸隊失偷竊）、偷獵人奪槍與毒消耗、偷女巫封鎖原女巫、偷小狼封鎖女巫見刀口皆未實作或破損；NightConsoleScreen 亦未強制必偷且未過濾已偷／自己座位。
- **現有行為測試覆蓋**：極弱（僅 finalBatchRoles.test.ts L66-110 測不可自爆與被喜羊羊防盜阻斷，智鬥／女巫／獵人／預言家／入隊皆零測試）

#### 125. 喜羊羊（`happy_sheep`｜好人陣營 / god）
- **觸發時機**：每晚夜間步驟 happy_sheep_action（於 nightResolution.ts 開頭結算）。
- **目標限制**：canHappySheepAct 限制目標須存活，不可連續兩晚守護同一玩家、不可連續兩晚防盜同一玩家（對自己使用則連續兩晚不可再選自己）。
- **免疫／反傷／連帶效果**：選 guard 時計入 nightResolution.ts:1726 guardedByNormal（擋狼刀，同守同救觸發 milk_pierce 奶穿）；選 anti_theft 時於 line 3334 阻斷灰太狼偷取；若目標為自己則同時賦予守護與防盜雙效。
- **次數限制**：每晚可使用一次（守護或防盜，對自己視為同時兩者）。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 happy_sheep。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:100-130; src/logic/nightResolution.ts:518-541,1721-1737,3334,3522; src/components/screens/NightConsoleScreen.tsx:1399,1792-1797`
- **未實作／僅手動／斷鏈註記**：NightConsoleScreen.tsx 缺少「守護／防盜」模式切換按鈕（永遠預設為 guard），且未於點擊座位時呼叫 canHappySheepAct 過濾連選目標。
- **現有行為測試覆蓋**：薄弱（finalBatchRoles.test.ts 僅測防盜與連防盜同一人被拒，未測守護擋刀、奶穿與對己雙效）

#### 126. 小女孩（`little_girl`｜好人陣營 / god）
- **觸發時機**：第二晚起狼隊階段指認（邏輯於 nightResolution.ts 8.69a 結算，但板子步驟未配置）。
- **目標限制**：canWolvesIdentifyLittleGirl 僅檢查 round >= 2 與 !littleGirlIdentifyUsed，未限制目標須存活。
- **免疫／反傷／連帶效果**：指認目標 roleId === 'little_girl' 時，若 deaths 中存在 wolf_kill 則移除並復活該被刀玩家，並對小女孩執行 doKill(..., 'little_girl_caught')。未檢核小女孩是否仍存活或當晚 wolf_kill 是否確實成死。
- **次數限制**：littleGirlIdentifyUsed 全場狼隊僅限指認一次。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 little_girl。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:384-395; src/logic/nightResolution.ts:3235-3256; src/components/screens/NightConsoleScreen.tsx:1401,1806-1808`
- **未實作／僅手動／斷鏈註記**：12p-big-bad-wolf-little-girl 板子在 src/data/boards.ts 完全缺少 little_girl_identify 夜間步驟；狼隊與小女孩夜間討論與指認投票是否算數僅靠手動。
- **現有行為測試覆蓋**：薄弱（僅 finalBatchRoles.test.ts L217-236 測第 2 晚指認成功代死）

#### 127. 怪盜狼王（`phantom_wolf_king`｜狼人陣營 / wolf）
- **觸發時機**：每晚均可與狼隊刀人，任意夜晚於 phantom_wolf_invincible 發動無敵（持續至下次入夜 L503 失效）；無敵失效後可於白天自爆。
- **目標限制**：canPhantomWolfActivateInvincible 無目標（僅自身開關），且場上須有其他存活狼人（aliveWolves.length > 1）。
- **免疫／反傷／連帶效果**：無敵期間（phantomWolfInvincibleActive）：nightResolution.ts 8.69e 移除自身夜間死亡；resolveDayExile（L403）免疫放逐；resolveDetectiveExecute（L321）免疫偵探處決。但 resolveShoot（獵人／狼王開槍）、resolveKnightDuel 等皆未檢查無敵；且 gameStore 放逐未傳 finalBatchState 導致實戰放逐無敵失效。dayResolution.ts:625 僅於無敵使用並失效後方允許自爆。
- **次數限制**：phantomWolfInvincibleUsed 整場僅限發動一次無敵；作為最後一狼時不可發動。
- **勝利條件／查驗判定**：faction = wolf；預言家驗為狼人（查殺），通靈師／純白／石像鬼驗為 phantom_wolf_king。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:136-162; src/logic/nightResolution.ts:503,510-516,3375-3388; src/logic/dayResolution.ts:402-414,625-634; src/components/day/NightStatusBanners.tsx:112-119; src/components/screens/NightConsoleScreen.tsx:1798-1802`
- **未實作／僅手動／斷鏈註記**：NightConsoleScreen.tsx 缺少發動無敵的 UI 開關；gameStore submitExileVotes／exilePlayer 漏傳 finalBatchState；DayBurstSkillsPanel 漏傳 finalBatchState；開槍免疫未實作。
- **現有行為測試覆蓋**：薄弱（finalBatchRoles.test.ts L112-188 測開無敵免夜毒與直接呼叫 resolveDayExile，未測免槍、最後一狼禁開與 gameStore 接線）

#### 128. 警犬（`police_dog`｜好人陣營 / god）
- **觸發時機**：偵探白天處決後，於當晚（round + 1）police_dog_action 激活並僅限該晚發動。
- **目標限制**：canPoliceDogAct 僅檢查存活、policeDogActivatedRound === round、policeDogMode 非空及 !policeDogUsed；未驗證目標是否存活或非己。
- **免疫／反傷／連帶效果**：撕咬模式（bite）直接執行 doKill(target, 'police_dog_bite')，不受守衛守護影響（符合 qa_140）；查驗模式（check）未產生任何查驗結果。
- **次數限制**：policeDogUsed 整場最多發動一次（僅激活當晚有效，當晚未用即失效）。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 police_dog。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:345-361; src/logic/nightResolution.ts:3363-3372; src/components/screens/NightConsoleScreen.tsx:1400,1803-1805`
- **未實作／僅手動／斷鏈註記**：查驗模式（policeDogMode === 'check'）完全未實作結果計算與 UI 展示；NightConsoleScreen 與 nightValidation 未於未激活／已使用時鎖定步驟；且因偵探無 UI 入口而實戰無法激活。
- **現有行為測試覆蓋**：極弱（僅 finalBatchRoles.test.ts L163-185 測撕咬模式，查驗模式與非激活夜鎖定皆零測試）

#### 129. 白夜使者（`white_night_envoy`｜好人陣營 / god）
- **觸發時機**：第二天起（round >= 2）可發動（gameStore.triggerWhiteNightRewind 存在但無 UI 且未限制 dayStage === 'speaking'）。
- **目標限制**：無目標選擇，須場上有存活白夜使者。
- **免疫／反傷／連帶效果**：gameStore.triggerWhiteNightRewind 欲從 undoStack 尋找快照但因 finishNight 未推入符合標籤的快照而必定掉入 fallback，僅復活當回合出局玩家並設 whiteNightEnvoyUsed = true，未能還原藥水、前夜狀態與各角色運行時狀態。
- **次數限制**：whiteNightEnvoyUsed 整場僅限使用一次。
- **勝利條件／查驗判定**：faction = good, category = god；計入神職邊（gods）；預言家驗為好人（金水），通靈師／純白／石像鬼驗為 white_night_envoy。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:367-382; src/store/gameStore.ts:2515-2555`
- **未實作／僅手動／斷鏈註記**：src/components/ 完全未接線發動按鈕；未限制僅能於白天發言階段發動；undoStack 快照搜尋失效導致無法真正重跑上一晚完整初始狀態。
- **現有行為測試覆蓋**：極弱（僅 finalBatchRoles.test.ts L213-216 測 canWhiteNightEnvoyRewind 回合限制，零 triggerWhiteNightRewind 行為測試）

#### 130. 小小灰（`little_grey_wolf`｜狼人陣營 / wolf）
- **觸發時機**：每晚於 wolf_kill 與狼隊行動，白天發言階段可自爆（dayResolution.ts:586）。
- **目標限制**：與小狼相同：wolf_kill 可空刀、可自刀（受占卜／未明之霧等全域限制）。
- **免疫／反傷／連帶效果**：白天自爆於 resolveSelfExplode 即刻死亡入夜（非原文點刀後正式死亡）；第 2 晚起若被灰太狼偷取，原 wolf_kill 在 8.69c 被撤銷改由灰太狼代刀（但晚於女巫步驟）。
- **次數限制**：每晚一刀（含空刀）；自爆全場一次。
- **勝利條件／查驗判定**：faction = wolf；計入狼人數量；預言家驗為狼人（查殺），通靈師／純白／石像鬼驗為 little_grey_wolf。
- **程式碼定位**：`src/logic/finalBatchRoles.ts:48-50; src/logic/dayResolution.ts:727-766; src/logic/nightResolution.ts:3337-3351`
- **未實作／僅手動／斷鏈註記**：青青草原預設 wolfKillPriority 依 DEFAULT_RULE_OVERRIDES 為 true（狼刀在先自動生效）；自爆即刻死亡而非當晚點刀後死亡；被灰太狼偷時女巫仍可看到原本狼刀刀口。
- **現有行為測試覆蓋**：正常（finalBatchRoles.test.ts L66-110 測 isLittleGreyWolfRole 與 resolveSelfExplode 允許）

---

## 三、全部 143 個板子特殊全局規則與實際生效邏輯

### 3.1 具特殊全局規則／預設覆蓋／雙板差異之板子實際生效狀態

| 全局規則 / 特例類別 | 適用板子 ID 與名稱 | 原文規則摘要 | 程式碼實際生效邏輯 | 狀態 | 程式碼位置 |
| --- | --- | --- | --- | --- | --- |
| 混血兒計邊預設（hybridCountsAsVillager） | `10p-board-15uqrqo, 12p-board-1hfx9f2, 12p-hybrid, 12p-wind-espionage` | 《混血兒》《風聲諜影》《雲端追蹤》《雲端探查》混血兒計入平民邊（屠邊需一同清零）。 | setup.ts:105-112 僅將 12p-hybrid 與 12p-wind-espionage 設為 true；其餘兩分支誤寫為不存在的 '10p-cloud-tracking' 與 '12p-cloud-exploration'（實際 boardId 為 10p-board-15uqrqo 與 12p-board-1hfx9f2），且 SeatSetupScreen.tsx 與 boards.ts supportedRuleToggles 皆無 hybridCountsAsVillager 開關。 | 部分實作（存在死分支且缺 UI 開關） | `src/logic/setup.ts:105-112; src/logic/victory.ts:58-60; src/components/screens/SeatSetupScreen.tsx` |
| 女巫自救預設（witchSelfSave） | `12p-board-1hlxijo, 6p~12p 全體女巫板` | 全場預設不可自救（never），惟《青青草原》明定「此板子女巫可以自救」（always）。 | setup.ts:119-121 誤寫為不存在的 '12p-green-prairie' 與 '12p-green-grassland'，未能匹配青青草原實際 ID '12p-board-1hlxijo'，導致青青草原預設仍為 witchSelfSave: 'never'。 | 未生效（boardId 拼錯成死分支） | `src/logic/setup.ts:119-121; src/logic/nightResolution.ts:248-252` |
| 首夜無刀規則（firstNightNoWolfKill） | `10p-animal-dream, 12p-animal-dream, 12p-wolf-girl, 12p-treasure-master, multi-hunter, multi-lianliankan, 12p-wind-espionage` | 上述板子首夜狼人無刀（含無狼隊之連連看）。 | nightValidation.ts:38,70,106-112 與 nightResolution.ts:406,427-429 雖有 firstNightNoWolfKill?: boolean 檢核，但 boards.ts、gameStore.ts 與 NightConsoleScreen.tsx 全線皆未定義及傳入此旗標，僅靠 firstNight 拿掉 wolf_kill；其中 12p-wind-espionage 連首夜與次夜都錯設為 confirm_only。 | 邏輯存在但資料層與 UI/Store 未串接 | `src/logic/nightValidation.ts:38,70,106-112; src/logic/nightResolution.ts:406,427-429; src/store/gameStore.ts; src/components/screens/NightConsoleScreen.tsx:392-404` |
| 屠城／屠邊與第三方勝利模式（victoryMode） | `10p-cupid, 12p-cupid, 12p-cupid-thief, 10p-board-x6xglu, 12p-board-18sbphw, 12p-ghost-bride, 10p-zombie, 12p-zombie` | 邱比特奇緣與盜賊邱比特採屠城勝；第三方陣營（人狼戀、鬼魂新娘、白蛇許仙）皆採清空外人屠城勝，其餘標準板多採屠邊。 | setup.ts:116-118 將 10p-cupid 與 12p-cupid 預設為 'slaughter_all'；12p-cupid-thief 則仍預設 'slaughter_side'（需靠 UI 手動切）；第三方屠城另有 conversionRoles.ts:695-790 checkConversionThirdPartyVictory 判定。 | 大部分一致（12p-cupid-thief 預設未自動切屠城） | `src/logic/setup.ts:116-118; src/logic/victory.ts; src/logic/conversionRoles.ts:695-790` |
| 白痴追刀規則（idiotNeedsExtraKill） | `multi-avenger-shadow, 8p-ragnarok, 10p-idiot, 10p-masked-wolf, 10p-board-13wywxf, 12p-board-1ak9dbq, 12p-board-1fid5th, 12p-assassin-wolf, 12p-twin-fantasy, 12p-medusa, 12p-cupid-thief, 12p-cupid` | 多數白痴板翻牌後需狼隊追刀才計入出局或依板子設定；《影子 & 復仇者》明定需追刀。 | `setup.ts` 為 `multi-avenger-shadow` 自動開啟 `idiotNeedsExtraKill: true`；`SeatSetupScreen.tsx` 已提供「白痴翻牌追刀規則」開局切換開關，供含白痴板組自由切換。 | 完全一致（含 UI 開關） | `src/logic/setup.ts; src/logic/victory.ts; src/components/screens/SeatSetupScreen.tsx` |
| 警長有無與雙爆吞警徽規則（enableSheriff / badgeSwallowRule） | `6p-classic ~ multi-lianliankan (全 143 板)` | 6~8 人局與部分娛樂局無警長競選；9~12 人局支援警長、雙爆吞警徽、1.5 票權及部分特殊警徽傳承規則。 | `DEFAULT_RULE_OVERRIDES` 全域預設 `enableSheriff: true`、`badgeSwallowRule: 'double_explode'`、`sheriffVoteWeight: 1.5`、`12p-fool-seer` 預設 `single_explode`，並可於 `SeatSetupScreen` 切換。 | 依房規切換支援（含 `12p-fool-seer` 單爆預設） | `src/logic/setup.ts:getDefaultRuleOverridesForBoard; src/components/screens/SeatSetupScreen.tsx` |
| 夜間死亡遺言規則（shouldNightDeathHaveLastWords） | `全 143 板（含 12p-wolf-girl 等特殊板）` | 一般 10~12 人局首夜出局者有遺言，次夜起無遺言；部分娛樂／特殊板有個別遺言差異。 | `nightValidation.ts` 以 `round === 1` 判定夜死遺言（首夜有遺言、次夜起無遺言）。 | 全域單一規則（`round === 1`） | `src/logic/nightValidation.ts` |
| 狼刀在先與機械狼首夜強制學習 | `全 143 板（含所有機械狼板）` | 全體採用狼刀在先（wolfKillPriority）；機械狼第一晚預設必須學習一名玩家。 | `wolfKillPriority` 預設 `true`（先處理蠱惑師替死／覺醒白痴秘密之身護盾後再算狼刀勝）；`mechWolfForceLearnNight1` 預設 `true`，於 `victory.ts` 與 `mechWolf.ts` 運作正常且 UI 有提供開關。 | 完全一致 | `src/logic/setup.ts; src/logic/victory.ts; src/logic/mechWolf.ts` |
| 雙板與跨人數變體板組區分 | `12p-jack-the-ripper vs 12p-jack-the-ripper-2; 10p/12p-nightmare vs -2; 10p vs 12p-wind-espionage` | 同名或雙版本板組（開膛手傑克主/第二身分版、網易/私版夢魘、10人/12人風聲諜影等）各有獨立結構或額外角色互動。 | `SeatSetupScreen.tsx`、`conversionRoles.ts` 與 `gameStore.ts` 正確實作第二身分槽位與指證／解鎖邏輯；`boards.ts` 已將 `12p-jack-the-ripper-2` 首夜／次夜與 `12p-wind-espionage` 狼刀補齊為標準可操作步驟。 | 完全一致（含雙板獨立排程） | `src/components/screens/SeatSetupScreen.tsx; src/logic/conversionRoles.ts; src/store/gameStore.ts; src/data/boards.ts` |
| 板子人數與配置總數一致性 | `10p-masked-wolf, 12p-wolf-king-chameleon-wolf-king, 12p-neighbor-only, 12p-awakened-lonely-girl, 12p-sleeping-beauty, multi-avenger-shadow` | 標準定人數板組之陣容角色張數應等於玩家人數（不含盜賊／盜寶大師／多選池額外底牌）。 | `12p-sleeping-beauty`、`12p-neighbor-only` 等異常板組角色數已於批次 A 對齊為 12 人（底牌／多選池保留對應數量並於 `dealBoardRolesWithBottomCards` 正確發牌）。 | 已對齊（含底牌與多選池發牌邏輯） | `src/data/boards.ts; src/logic/setup.ts` |

### 3.2 全部 143 個板子實際排程與規則對照總覽

| # | 板子 ID | 板子名稱 | 人數 | 首夜關鍵步驟（`actionType`） | 次夜關鍵步驟（`actionType`） | `supportedRuleToggles` | 程式碼特化／實際生效註記 |
| ---: | --- | --- | ---: | --- | --- | --- | --- |
| 1 | `6p-classic` | 6 人局 - 經典預獵 | 6 | `wolf_kill → seer_check → confirm_only` | `wolf_kill → seer_check` | wolfKillPriority | 標準全局管線 |
| 2 | `6p-classic-2` | 6 人局 - 經典預守 | 6 | `guard_protect → wolf_kill → seer_check` | `guard_protect → wolf_kill → seer_check` | wolfKillPriority | 標準全局管線 |
| 3 | `6p-miracle-merchant` | 6 人局 - 奇蹟商人 | 6 | `wolf_kill → seer_check → miracle_merchant_gift → lucky_item_action` | `wolf_kill → seer_check → lucky_item_action` | wolfKillPriority | 標準全局管線 |
| 4 | `6p-cloud-pursuit` | 6 人局 - 雲端追捕 | 6 | `wolf_kill → witch_action → seer_check` | `wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 5 | `7p-survivor` | 7 人局 - 生還者 | 7 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 6 | `8p-ragnarok` | 8 人局 - 諸神黃昏 | 8 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 7 | `8p-doomsday-outlaws` | 8 人局 - 末日狂徒 | 8 | `guard_protect → wolf_kill → seer_check → confirm_only` | `guard_protect → wolf_kill → seer_check` | wolfKillPriority | 標準全局管線 |
| 8 | `9p-classic` | 9 人局 - 經典 | 9 | `wolf_kill → witch_action → seer_check → hunter_gesture` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 9 | `9p-seed-wolf` | 9 人局 - 種狼 | 9 | `wolf_kill → witch_action → hunter_gesture → confirm_only` | `wolf_kill → witch_action → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 10 | `9p-war-wolf-knight` | 9 人局 - 戰狼騎士 | 9 | `wolf_kill → witch_action → seer_check → confirm_only` | `wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 11 | `9p-board-kxb4iz` | 9 人局 - 眾神之戰 | 9 | `penguin_freeze → socialite_favor → wolf_kill → witch_action → hunter_gesture → confirm_only → confirm_only` | `penguin_freeze → socialite_favor → wolf_kill → witch_action → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 12 | `9p-board-e9uyvs` | 9 人局 - 動物園 | 9 | `penguin_freeze → wolf_kill → crow_curse → confirm_only` | `penguin_freeze → wolf_kill → crow_curse` | wolfKillPriority | 標準全局管線 |
| 13 | `9p-pandora` | 9 人局 - 潘朵拉 | 9 | `wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture → pandora_gift → confirm_only` | `wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture → pandora_gift → confirm_only → confirm_only → confirm_only` | witchSelfSave, wolfKillPriority, victoryMode | 含非單純確認之 confirm_only(4步) |
| 14 | `10p-classic` | 10 人局 - 經典 | 10 | `wolf_kill → witch_action → seer_check → hunter_gesture` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 15 | `10p-idiot` | 10 人局 - 白痴 | 10 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 16 | `10p-masked-wolf` | 10 人局 - 假面之夜 | 10 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 17 | `10p-wolf-king-white-wolf-king-knight` | 10 人局 - 白狼王騎士 | 10 | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 18 | `10p-wolf-beauty-knight` | 10 人局 - 狼美人騎士 | 10 | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 19 | `10p-snow-wolf-knight` | 10 人局 - 雪狼騎士 | 10 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 20 | `10p-hidden-wolf-knight` | 10 人局 - 隱狼騎士 | 10 | `wolf_kill → confirm_only → witch_action → seer_check → hunter_gesture → confirm_only` | `confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 21 | `10p-board-13wywxf` | 10 人局 - 血月獵魔 | 10 | `wolf_kill → witch_action → seer_check → confirm_only → confirm_only` | `wolf_kill → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 22 | `10p-nightmare` | 10 人局 - 夢魘攝夢(網易版) | 10 | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 23 | `10p-nightmare-2` | 10 人局 - 夢魘攝夢(私版) | 10 | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 24 | `10p-mech-wolf-psychic` | 10 人局 - 機械狼通靈師 / 鏡隱迷蹤 | 10 | `mech_wolf_learn → guard_protect → wolf_kill → witch_action → psychic_check → mech_wolf_reveal_skill` | `guard_protect → mech_wolf_night_action → wolf_kill → witch_action → psychic_check` | witchSelfSave, mechWolfForceLearnNight1, wolfKillPriority | 標準全局管線 |
| 25 | `10p-miracle-merchant` | 10 人局 - 奇蹟商人 | 10 | `wolf_kill → witch_action → seer_check → miracle_merchant_gift → lucky_item_action` | `wolf_kill → witch_action → seer_check → lucky_item_action` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 26 | `10p-wolf-king-awakened-wolf-king` | 10 人局 - 覺醒狼王奇商 | 10 | `wolf_kill → awakened_wolf_king_give_gun → confirm_only → witch_action → seer_check → miracle_merchant_gift → lucky_item_action` | `wolf_kill → awakened_wolf_king_give_gun → confirm_only → witch_action → seer_check → lucky_item_action` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 27 | `10p-board-yjr1j3` | 10 人局 - 尋香識命 | 10 | `guard_protect → wolf_kill → scent_phantom_link → witch_action → awakened_seer_check` | `guard_protect → scent_phantom_link → wolf_kill → witch_action → awakened_seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 28 | `10p-board-zm108y` | 10 人局 - 暗夜星辰 | 10 | `confirm_only → wolf_kill → awakened_wolf_beauty_charm → witch_action → seer_check → confirm_only` | `confirm_only → wolf_kill → awakened_wolf_beauty_charm → witch_action → seer_check` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 29 | `10p-board-1468z48` | 10 人局 - 覺石覺攝 | 10 | `awakened_dream_catcher_dream → wolf_kill → awakened_gargoyle_convert → witch_action → seer_check → confirm_only → awakened_dream_catcher_judge` | `awakened_dream_catcher_dream → confirm_only → wolf_kill → witch_action → seer_check → gravekeeper_check → awakened_dream_catcher_judge` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 30 | `10p-witch-awakened-witch` | 10 人局 - 覺醒女巫 | 10 | `guard_protect → wolf_kill → awakened_wolf_king_give_gun → confirm_only → awakened_witch_action → confirm_only → seer_check` | `guard_protect → wolf_kill → awakened_wolf_king_give_gun → confirm_only → awakened_witch_action → confirm_only → seer_check` | wolfKillPriority | 含非單純確認之 confirm_only(4步) |
| 31 | `10p-board-10c9sqq` | 10 人局 - 永序之輪 | 10 | `wolf_kill → time_eclipse_lock → witch_action → seer_check → confirm_only` | `wolf_kill → time_eclipse_lock → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 32 | `10p-board-11aiiid` | 10 人局 - 獵日逐光 | 10 | `wolf_kill → eclipse_maid_devour → witch_action → seer_check → confirm_only` | `eclipse_maid_devour → radiant_earl_shield → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 33 | `10p-board-149pwdx` | 10 人局 - 覺醒之夜 | 10 | `awakened_idiot_shield → wolf_kill → witch_action → seer_check` | `awakened_idiot_shield → wolf_kill → night_noble_servant → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 34 | `10p-board-12kdffu` | 10 人局 - 純白夜影 | 10 | `guard_protect → wolf_kill → witch_action → pure_white_check → wolf_witch_check` | `guard_protect → wolf_kill → wolf_witch_check → witch_action → pure_white_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 35 | `10p-board-znal43` | 10 人局 - 時波之亂 | 10 | `confirm_only → confirm_only → wolf_kill → witch_action → seer_check` | `daylight_scholar_action → silent_night_mentor_action → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 36 | `10p-board-11cingk` | 10 人局 - 猩紅蜂舞 | 10 | `guard_protect → scarlet_wolf_king_attach → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → scarlet_wolf_king_attach → wolf_kill → witch_action → seer_check → bee_wild_hunt_sting` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 37 | `10p-misty-crow` | 10 人局 - 迷霧鴉影 | 10 | `dream_catcher_dream → alchemy_witch_fog → confirm_only → wolf_kill → seer_check → alchemy_witch_snake` | `dream_catcher_dream → alchemy_witch_fog → confirm_only → wolf_kill → wolf_raven_claw_kill → seer_check → alchemy_witch_snake` | wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 38 | `10p-animal-dream` | 10 人局 - 動物夢境 | 10 | `confirm_only → confirm_only → confirm_only → confirm_only` | `fox_cub_charm → wolf_kill → wolf_beauty_charm` | wolfKillPriority | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；specialRules: 此板子第一夜無人可使用技能，只有熊還是會咆哮。 |
| 39 | `10p-cupid` | 10 人局 - 邱比特奇緣 | 10 | `hybrid_choose → cupid_link → confirm_only → nightmare_fear → dream_catcher_dream → wolf_kill → time_eclipse_lock → witch_action → seer_check → hunter_gesture → crow_curse` | `nightmare_fear → dream_catcher_dream → wolf_kill → time_eclipse_lock → witch_action → seer_check → hunter_gesture → crow_curse` | witchSelfSave, wolfKillPriority, victoryMode | setup.ts: victoryMode=slaughter_all |
| 40 | `10p-hybrid` | 10 人局 - 混血兒 | 10 | `hybrid_choose → wolf_kill → witch_action → seer_check → hunter_gesture` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 41 | `10p-wind-espionage` | 10 人局 - 風聲諜影 | 10 | `dream_catcher_dream → wolf_kill → awakened_gargoyle_convert → awakened_gargoyle_convert → witch_action → seer_check → hunter_gesture → confirm_only → confirm_only → confirm_only → psychic_check` | `dream_catcher_dream → confirm_only → confirm_only → wolf_kill → witch_action → seer_check → psychic_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 42 | `10p-board-15uqrqo` | 10 人局 - 雲端追蹤 | 10 | `hybrid_choose → confirm_only → mech_wolf_learn → wolf_kill → wolf_beauty_charm → witch_action → seer_check → awakened_seer_check → hunter_gesture → psychic_check → pure_white_check → mech_wolf_reveal_skill` | `mech_wolf_night_action → wolf_kill → wolf_beauty_charm → witch_action → seer_check → awakened_seer_check → psychic_check → pure_white_check → hunter_gesture` | witchSelfSave, mechWolfForceLearnNight1, wolfKillPriority, victoryMode | ⚠️ setup.ts 誤寫 10p-cloud-tracking，hybridCountsAsVillager 未生效 |
| 43 | `10p-awakened-lonely-girl` | 10 人局 - 覺醒孤獨少女 | 10 | `awakened_lonely_girl_choose → dream_catcher_dream → wolf_kill → witch_action → seer_check` | `confirm_only → dream_catcher_dream → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority, victoryMode | 含非單純確認之 confirm_only(1步) |
| 44 | `10p-cursed-fox` | 10 人局 - 咒狐 | 10 | `confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 45 | `10p-board-x6xglu` | 10 人局 - 千年之戀 | 10 | `xu_xian_action → white_snake_action → wolf_kill → eclipse_maid_devour → witch_action → seer_check → confirm_only` | `eclipse_maid_devour → xu_xian_action → white_snake_action → radiant_earl_shield → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority, victoryMode | specialRules: 如果蝕日侍女偷到許仙尋香魅影的綁定技能，並剛好綁定到白蛇預言家和許仙尋香魅影兩人，則第三方陣營直接獲勝。；如果許仙尋香魅影的綁定技能綁定自己白蛇預言家，並且透過綁定導致雙方一起死亡，第三方陣營也會直接獲勝。 |
| 46 | `10p-zombie` | 10 人局 - 殭屍 | 10 | `zombie_infect → confirm_only → magician_swap → wolf_kill → witch_action → seer_check` | `zombie_infect → confirm_only → magician_swap → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 47 | `multi-avenger-shadow` | 11 ~ 16 人局 - 影子 & 復仇者 | 12 | `hybrid_choose → shadow_choose → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only → confirm_only` | `confirm_only → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority, victoryMode | setup.ts: idiotNeedsExtraKill=true；含非單純確認之 confirm_only(2步) |
| 48 | `12p-classic` | 12 人局 - 經典 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 49 | `12p-wolf-king-guard` | 12 人局 - 狼王守衛 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 50 | `12p-wolf-king` | 12 人局 - 狼王攝夢 | 12 | `dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 51 | `12p-wolf-king-knight` | 12 人局 - 狼王騎士 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 52 | `12p-wolf-king-magician` | 12 人局 - 狼王魔術師 | 12 | `magician_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | `magician_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 53 | `12p-wolf-king-guard-white-wolf-king` | 12 人局 - 白狼王守衛 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 54 | `12p-wolf-king-white-wolf-king-knight` | 12 人局 - 白狼王騎士 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 55 | `12p-wolf-beauty-knight` | 12 人局 - 狼美人騎士 | 12 | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 56 | `12p-wolf-beauty` | 12 人局 - 狼美人獵騎 | 12 | `wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 57 | `12p-wolf-beauty-2` | 12 人局 - 狼美人獵守 | 12 | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 58 | `12p-wolf-beauty-old-rascal` | 12 人局 - 狼美人老流氓 | 12 | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture → confirm_only` | `guard_protect → wolf_kill → wolf_beauty_charm → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 59 | `12p-evil-knight-knight` | 12 人局 - 惡靈騎士 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 60 | `12p-board-1ak9dbq` | 12 人局 - 快言快語 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 61 | `12p-gargoyle-gravekeeper` | 12 人局 - 石像鬼守墓人 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only → gargoyle_check` | `gargoyle_team_status → wolf_kill → witch_action → seer_check → hunter_gesture → gravekeeper_check → gargoyle_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 62 | `12p-board-1fid5th` | 12 人局 - 血月獵魔 | 12 | `wolf_kill → witch_action → seer_check → confirm_only → confirm_only` | `wolf_kill → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 63 | `12p-assassin-wolf` | 12 人局 - 刺客獵魔 | 12 | `wolf_kill → witch_action → seer_check → confirm_only → confirm_only` | `assassin_wolf_assassinate → wolf_kill → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 64 | `12p-war-wolf` | 12 人局 - 戰狼獵魔 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 65 | `12p-nightmare` | 12 人局 - 夢魘攝夢 | 12 | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `nightmare_fear → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 66 | `12p-guard-nightmare` | 12 人局 - 夢魘守衛 | 12 | `nightmare_fear → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `nightmare_fear → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 67 | `12p-nightmare-2` | 12 人局 - 夢魘惑心 | 12 | `nightmare_fear → guard_protect → enchanter_bewitch → wolf_kill → witch_action → seer_check` | `nightmare_fear → guard_protect → enchanter_bewitch → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 68 | `12p-mech-wolf-psychic` | 12 人局 - 機械狼通靈師 / 鏡隱迷蹤 | 12 | `mech_wolf_learn → guard_protect → wolf_kill → witch_action → hunter_gesture → psychic_check → mech_wolf_reveal_skill` | `guard_protect → mech_wolf_night_action → wolf_kill → witch_action → psychic_check → hunter_gesture` | witchSelfSave, mechWolfForceLearnNight1, wolfKillPriority | 標準全局管線 |
| 69 | `12p-guard-wolf-brother` | 12 人局 - 狼兄弟守衛 | 12 | `guard_protect → confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_younger_brother_kill → wolf_kill → witch_action → seer_check → hunter_gesture → wolf_younger_brother_kill` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 70 | `12p-wolf-brother` | 12 人局 - 狼兄弟黑市 | 12 | `guard_protect → confirm_only → wolf_kill → witch_action → seer_check → black_market_gift → lucky_item_action` | `guard_protect → wolf_younger_brother_kill → wolf_kill → witch_action → seer_check → lucky_item_action → wolf_younger_brother_kill` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 71 | `12p-wolf-king-awakened-wolf-king` | 12 人局 - 覺醒狼王奇商 | 12 | `dream_catcher_dream → wolf_kill → awakened_wolf_king_give_gun → confirm_only → witch_action → seer_check → miracle_merchant_gift → lucky_item_action` | `dream_catcher_dream → wolf_kill → awakened_wolf_king_give_gun → confirm_only → witch_action → seer_check → lucky_item_action` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 72 | `12p-hidden-wolf-crow` | 12 人局 - 烏鴉隱狼 | 12 | `wolf_kill → confirm_only → witch_action → seer_check → hunter_gesture → crow_curse` | `confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture → crow_curse` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 73 | `12p-hidden-wolf-bear` | 12 人局 - 熊隱狼 | 12 | `wolf_kill → confirm_only → witch_action → hunter_gesture → confirm_only → confirm_only` | `confirm_only → wolf_kill → witch_action → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 74 | `12p-board-1a55af5` | 12 人局 - 尋香識命 | 12 | `guard_protect → wolf_kill → scent_phantom_link → witch_action → awakened_seer_check → hunter_gesture` | `guard_protect → scent_phantom_link → wolf_kill → witch_action → awakened_seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 75 | `12p-board-1b7f950` | 12 人局 - 暗夜星辰 | 12 | `confirm_only → wolf_kill → awakened_wolf_beauty_charm → witch_action → seer_check → confirm_only` | `confirm_only → wolf_kill → awakened_wolf_beauty_charm → witch_action → seer_check` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 76 | `12p-wolf-king-chameleon-wolf-king` | 12 人局 - 百變狼王 | 12 | `dream_catcher_dream → wolf_kill → witch_action → seer_check → confirm_only → hunter_gesture` | `chameleon_wolf_choose → dream_catcher_dream → wolf_kill → witch_action → seer_check → confirm_only → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 77 | `12p-board-1fwxong` | 12 人局 - 詭術之境 | 12 | `magician_swap → trickster_wolf_swap → wolf_kill → witch_action → seer_check → confirm_only` | `magician_swap → trickster_wolf_swap → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 78 | `12p-board-1hvme02` | 12 人局 - 魔幻對決 | 12 | `magician_swap → wolf_warlock_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | `magician_swap → wolf_warlock_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 79 | `12p-board-1frn80a` | 12 人局 - 覺石覺攝 | 12 | `awakened_dream_catcher_dream → wolf_kill → awakened_gargoyle_convert → witch_action → seer_check → hunter_gesture → confirm_only → awakened_dream_catcher_judge` | `awakened_dream_catcher_dream → confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture → gravekeeper_check → awakened_dream_catcher_judge` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 80 | `12p-witch-awakened-witch` | 12 人局 - 覺醒女巫 | 12 | `guard_protect → wolf_kill → awakened_wolf_king_give_gun → confirm_only → awakened_witch_action → confirm_only → seer_check → hunter_gesture` | `guard_protect → wolf_kill → awakened_wolf_king_give_gun → confirm_only → awakened_witch_action → confirm_only → seer_check → hunter_gesture` | wolfKillPriority | 含非單純確認之 confirm_only(4步) |
| 81 | `12p-masked-wolf` | 12 人局 - 假面舞會 | 12 | `confirm_only → confirm_only → wolf_kill → witch_action → seer_check → confirm_only` | `dancer_dance → masked_wolf_action → wolf_kill → witch_action → seer_check` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 82 | `12p-board-1bxo1ms` | 12 人局 - 永序之輪 | 12 | `guard_protect → wolf_kill → time_eclipse_lock → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → time_eclipse_lock → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 83 | `12p-board-1cvwref` | 12 人局 - 獵日逐光 | 12 | `dream_catcher_dream → wolf_kill → eclipse_maid_devour → witch_action → seer_check → confirm_only` | `eclipse_maid_devour → radiant_earl_shield → dream_catcher_dream → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 84 | `12p-board-1fv459z` | 12 人局 - 覺醒之夜 | 12 | `awakened_idiot_shield → wolf_kill → witch_action → seer_check → confirm_only` | `awakened_idiot_shield → wolf_kill → night_noble_servant → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 85 | `12p-board-1e5robw` | 12 人局 - 純白夜影 | 12 | `guard_protect → wolf_kill → witch_action → hunter_gesture → pure_white_check → wolf_witch_check` | `guard_protect → wolf_kill → wolf_witch_check → witch_action → pure_white_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 86 | `12p-board-1b8ou05` | 12 人局 - 時波之亂 | 12 | `confirm_only → confirm_only → guard_protect → wolf_kill → witch_action → seer_check` | `daylight_scholar_action → silent_night_mentor_action → guard_protect → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 87 | `12p-board-1cxwwcm` | 12 人局 - 猩紅蜂舞 | 12 | `guard_protect → scarlet_wolf_king_attach → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → scarlet_wolf_king_attach → wolf_kill → witch_action → seer_check → bee_wild_hunt_sting` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 88 | `12p-board-1g1jcg` | 12 人局 - 動物園 | 12 | `penguin_freeze → wolf_kill → fox_check → crow_curse → confirm_only` | `penguin_freeze → wolf_kill → fox_check → crow_curse` | wolfKillPriority | 標準全局管線 |
| 89 | `12p-animal-dream` | 12 人局 - 動物夢境 | 12 | `confirm_only → confirm_only → confirm_only → confirm_only → confirm_only` | `fox_cub_charm → wolf_kill → wolf_beauty_charm` | wolfKillPriority | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；specialRules: 此板子第一夜無人可使用技能，只有熊還是會咆哮。 |
| 90 | `12p-noisy-party` | 12 人局 - 鬧鬧派對 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → hunter_gesture → confirm_only → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 91 | `12p-misty-crow` | 12 人局 - 迷霧鴉影 | 12 | `dream_catcher_dream → alchemy_witch_fog → confirm_only → wolf_kill → seer_check → confirm_only → alchemy_witch_snake` | `dream_catcher_dream → alchemy_witch_fog → confirm_only → wolf_kill → wolf_raven_claw_kill → seer_check → alchemy_witch_snake` | idiotNeedsExtraKill, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 92 | `12p-board-1cnivrg` | 12 人局 - 無目之夜 | 12 | `dream_catcher_dream → confirm_only → wolf_kill → witch_action → confirm_only → hunter_gesture → confirm_only → confirm_only → seer_check → gargoyle_check` | `dream_catcher_dream → confirm_only → gargoyle_team_status → confirm_only → wolf_kill → wolf_raven_claw_kill → witch_action → seer_check → hunter_gesture → gargoyle_check` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(3步) |
| 93 | `12p-board-1cnivi6` | 12 人局 - 無目之城 | 12 | `confirm_only → wolf_kill → confirm_only → eclipse_maid_devour → witch_action → seer_check → confirm_only → confirm_only` | `silent_night_mentor_action → eclipse_maid_devour → radiant_earl_shield → confirm_only → wolf_kill → wolf_raven_claw_kill → witch_action → seer_check → demon_hunter_hunt` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 94 | `12p-twin-fantasy` | 12 人局 - 雙生幻想 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture → twins_guard` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 95 | `12p-lantern-shadow` | 12 人局 - 燈影 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → lantern_seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → lantern_seer_check → confirm_only` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 96 | `12p-seer-drunk-seer` | 12 人局 - 酒鬼預言家 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → drunk_seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check → drunk_seer_check → confirm_only` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 97 | `12p-fool-seer` | 12 人局 - 自曝愚言家 | 12 | `guard_protect → wolf_kill → witch_action → fool_seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → fool_seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 98 | `12p-big-bad-wolf-little-girl` | 12 人局 - 小女孩大野狼 | 12 | `guard_protect → wolf_kill → witch_action → big_bad_wolf_kill → hunter_gesture` | `guard_protect → wolf_kill → witch_action → big_bad_wolf_kill → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 99 | `12p-seed-wolf` | 12 人局 - 種狼(飯局版) | 12 | `wolf_kill → witch_action → fox_check → confirm_only → confirm_only → confirm_only` | `wolf_kill → witch_action → fox_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 100 | `12p-seed-wolf-2` | 12 人局 - 種狼(京城版) | 12 | `guard_protect → wolf_kill → witch_action → seer_check → confirm_only` | `guard_protect → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 101 | `12p-seed-wolf-3` | 12 人局 - 種狼(娛百版) | 12 | `guard_protect → wolf_kill → confirm_only → witch_action → seer_check → hunter_gesture` | `guard_protect → confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 102 | `12p-seed-wolf-4` | 12 人局 - 種狼(私版) | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 103 | `12p-neighbor-only` | 12 人局 - 唯鄰是從 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 104 | `12p-wolf-beauty-3` | 12 人局 - 狼美人惑騎 | 12 | `enchanter_bewitch → wolf_kill → wolf_beauty_charm → witch_action → confirm_only → confirm_only → confirm_only → confirm_only` | `enchanter_bewitch → wolf_kill → wolf_beauty_charm → witch_action → confirm_only` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(2步) |
| 105 | `12p-big-grey-wolf-fortune-teller` | 12 人局 - 大灰狼占卜師 | 12 | `fortune_teller_mark → wolf_kill → witch_action → seer_check → hunter_gesture` | `fortune_teller_mark → confirm_only → wolf_kill → big_grey_wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(1步) |
| 106 | `12p-nine-tails-wolf-nine-tailed-fox` | 12 人局 - 九尾狐 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture → nine_tailed_fox_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 107 | `12p-board-1gwfsm6` | 12 人局 - 針鋒相槓 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 108 | `12p-socialite` | 12 人局 - 名媛 | 12 | `hybrid_choose → socialite_favor → wolf_kill → witch_action → seer_check → hunter_gesture` | `socialite_favor → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 109 | `12p-medium` | 12 人局 - 通靈者 | 12 | `confirm_only → guard_protect → wolf_kill → witch_action → seer_check` | `medium_channel → confirm_only → guard_protect → wolf_kill → witch_action → seer_check → confirm_only → confirm_only → wolf_kill` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(3步) |
| 110 | `12p-moon-spirit-wolf` | 12 人局 - 月靈狼 | 12 | `nightmare_fear → socialite_favor → wolf_kill → witch_action → confirm_only → confirm_only` | `nightmare_fear → socialite_favor → wolf_kill → witch_action` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 111 | `12p-demon-wolf` | 12 人局 - 惡魔 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → demon_wolf_check` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → demon_wolf_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 112 | `12p-troublemaker-wolf` | 12 人局 - 搗蛋鬼 | 12 | `confirm_only → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `troublemaker_prank → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 113 | `12p-board-19vcnl0` | 12 人局 - 孤注一擲 | 12 | `dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `warden_wolf_trade → confirm_only → confirm_only → confirm_only → confirm_only → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(3步) |
| 114 | `12p-khufu-horizon` | 12 人局 - 胡夫地平線 | 12 | `dream_catcher_dream → confirm_only → alchemy_witch_fog → wolf_kill → seer_check → hunter_gesture → alchemy_witch_snake` | `dream_catcher_dream → anubis_scale → alchemy_witch_fog → wolf_kill → seer_check → hunter_gesture → alchemy_witch_snake` | wolfKillPriority | 標準全局管線 |
| 115 | `12p-board-1iex5ls` | 12 人局 - 黑白使者 | 12 | `dream_catcher_dream → wolf_kill → dark_night_envoy_shield → witch_action → seer_check → confirm_only` | `dream_catcher_dream → wolf_kill → dark_night_envoy_shield → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 116 | `12p-medusa` | 12 人局 - 梅杜莎之眼 | 12 | `medusa_petrify → wolf_kill → witch_action → seer_check → confirm_only → confirm_only` | `medusa_petrify → wolf_kill → witch_action → seer_check → perseus_execute` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority | 標準全局管線 |
| 117 | `12p-black-bat` | 12 人局 - 黑蝙蝠 | 12 | `guard_protect → wolf_kill → black_bat_shield → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → black_bat_shield → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 118 | `12p-wolf-girl` | 12 人局 - 狼女孩 | 12 | `guard_protect → wolf_girl_confess → confirm_only → poisoner_poison → seer_check → hunter_gesture → confirm_only` | `guard_protect → wolf_kill → poisoner_poison → seer_check → hunter_gesture` | wolfKillPriority | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；含非單純確認之 confirm_only(1步)；specialRules: 此板子第一夜狼人無刀。 |
| 119 | `12p-board-1hb0a89` | 12 人局 - 青丘夜影 | 12 | `guard_protect → confirm_only → nine_tails_mark → wolf_kill → witch_action → seer_check` | `guard_protect → bai_ze_clear → nine_tails_mark → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 120 | `12p-pumpkin-ghost` | 12 人局 - 南瓜鬼 | 12 | `wolf_kill → witch_action → seer_check → hunter_gesture → super_gravekeeper_action → gargoyle_check` | `gargoyle_team_status → wolf_kill → witch_action → seer_check → hunter_gesture → super_gravekeeper_action → super_gravekeeper_heir_check → gargoyle_check → pumpkin_ghost_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 121 | `12p-evil-merchant` | 12 人局 - 邪惡商人 | 12 | `guard_protect → wolf_kill → evil_merchant_gift → confirm_only → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → evil_merchant_gift → confirm_only → confirm_only → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(3步) |
| 122 | `12p-super-black-market-merchant-black-market-merchant` | 12 人局 - 超級黑市商人 | 12 | `guard_protect → wolf_kill → witch_action → seer_check → super_black_market_gift` | `guard_protect → super_black_market_gift → wolf_kill → witch_action → seer_check → confirm_only → confirm_only → confirm_only → super_black_market_gift → wolf_kill` | witchSelfSave, wolfKillPriority | 含非單純確認之 confirm_only(3步) |
| 123 | `12p-detective` | 12 人局 - 偵探怪盜 | 12 | `guard_protect → phantom_wolf_invincible → wolf_kill → witch_action → confirm_only → confirm_only` | `guard_protect → phantom_wolf_invincible → wolf_kill → witch_action → wolf_kill → police_dog_action` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 124 | `12p-board-1hlxijo` | 12 人局 - 青青草原 | 12 | `happy_sheep_action → grey_wolf_boss_steal → wolf_kill → witch_action → seer_check → hunter_gesture → grey_wolf_boss_steal` | `happy_sheep_action → grey_wolf_boss_steal → wolf_kill → witch_action → seer_check → hunter_gesture → grey_wolf_boss_steal` | witchSelfSave, wolfKillPriority | ⚠️ setup.ts 誤寫 12p-green-prairie/grassland，witchSelfSave=always 未生效 |
| 125 | `12p-board-18851fx` | 12 人局 - 一盞榮枯 | 12 | `confirm_only → confirm_only → guard_protect → wolf_kill → witch_action → seer_check` | `wolf_maid_tea → butler_tea → wolf_maid_tea → guard_protect → wolf_kill → witch_action → seer_check` | witchSelfSave, wolfKillPriority | 標準全局管線 |
| 126 | `12p-jack-the-ripper` | 12 人局 - 開膛手傑克 | 12 | `guard_protect → jack_ripper_action → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → jack_ripper_action → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | conversionRoles.ts: 主身分版（首夜可殺） |
| 127 | `12p-jack-the-ripper-2` | 12 人局 - 開膛手傑克 (第二身分) | 12 | `confirm_only → confirm_only → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → demon_wolf_check` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture → demon_wolf_check` | witchSelfSave, wolfKillPriority | conversionRoles.ts: 第二身分版；⚠️ FN/SN 步驟退化為 confirm_only；含非單純確認之 confirm_only(2步) |
| 128 | `12p-sleeping-beauty` | 12 人局 - 睡美人 | 12 | `wolf_kill → witch_action → hunter_gesture → mute_elder_mute → confirm_only → confirm_only` | `exotic_prince_check → wolf_kill → witch_action → hunter_gesture → mute_elder_mute` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 129 | `12p-cupid-thief` | 12 人局 - 盜賊邱比特 | 12 | `thief_choose → cupid_link → confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture → confirm_only` | `wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority, victoryMode | ⚠️ 預設仍為 slaughter_side；thiefBottomCards 未初期化 |
| 130 | `12p-cupid` | 12 人局 - 邱比特奇緣 | 12 | `hybrid_choose → cupid_link → confirm_only → nightmare_fear → dream_catcher_dream → wolf_kill → time_eclipse_lock → witch_action → seer_check → hunter_gesture → crow_curse → confirm_only → wolf_witch_check` | `nightmare_fear → dream_catcher_dream → wolf_kill → wolf_witch_check → time_eclipse_lock → witch_action → seer_check → hunter_gesture → crow_curse` | witchSelfSave, idiotNeedsExtraKill, wolfKillPriority, victoryMode | setup.ts: victoryMode=slaughter_all |
| 131 | `12p-crow-cursed-fox` | 12 人局 - 烏鴉咒狐 | 12 | `confirm_only → wolf_kill → witch_action → seer_check → hunter_gesture → crow_curse` | `wolf_kill → witch_action → seer_check → hunter_gesture → crow_curse` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 132 | `12p-hybrid` | 12 人局 - 混血兒 | 12 | `hybrid_choose → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | setup.ts: hybridCountsAsVillager=true |
| 133 | `12p-wind-espionage` | 12 人局 - 風聲諜影 | 12 | `hybrid_choose → mech_wolf_learn → dream_catcher_dream → confirm_only → awakened_gargoyle_convert → awakened_gargoyle_convert → witch_action → seer_check → hunter_gesture → confirm_only → confirm_only → confirm_only → psychic_check → mech_wolf_reveal_skill` | `dream_catcher_dream → mech_wolf_night_action → confirm_only → confirm_only → confirm_only → witch_action → seer_check → psychic_check → hunter_gesture` | witchSelfSave, mechWolfForceLearnNight1, wolfKillPriority, victoryMode | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；setup.ts: hybridCountsAsVillager=true；⚠️ FN/SN 狼刀誤設 confirm_only；含非單純確認之 confirm_only(4步) |
| 134 | `12p-board-1hfx9f2` | 12 人局 - 雲端探查 | 12 | `hybrid_choose → confirm_only → mech_wolf_learn → wolf_kill → wolf_beauty_charm → confirm_only → witch_action → seer_check → awakened_seer_check → hunter_gesture → confirm_only → confirm_only → confirm_only → psychic_check → pure_white_check → mech_wolf_reveal_skill` | `mech_wolf_night_action → confirm_only → wolf_kill → wolf_beauty_charm → witch_action → seer_check → awakened_seer_check → psychic_check → pure_white_check → hunter_gesture → gravekeeper_check` | witchSelfSave, mechWolfForceLearnNight1, wolfKillPriority, victoryMode | ⚠️ setup.ts 誤寫 12p-cloud-exploration，hybridCountsAsVillager 未生效；含非單純確認之 confirm_only(2步) |
| 135 | `12p-salon-night` | 12 人局 - 沙龍之夜 | 12 | `confirm_only → dream_catcher_dream → awakened_wolf_beauty_charm → wolf_kill → time_eclipse_lock → eclipse_maid_devour → witch_action → awakened_seer_check → confirm_only → confirm_only → miracle_merchant_gift → lucky_item_action → psychic_check` | `eclipse_maid_devour → dream_catcher_dream → awakened_wolf_beauty_charm → wolf_kill → time_eclipse_lock → witch_action → awakened_seer_check → psychic_check → demon_hunter_hunt → demon_hunter_hunt → lucky_item_action` | witchSelfSave, wolfKillPriority, victoryMode | nightResolution.ts:1337 特判攝夢／蝕時鎖定 |
| 136 | `12p-awakened-lonely-girl` | 12 人局 - 覺醒孤獨少女 | 12 | `awakened_lonely_girl_choose → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | `confirm_only → dream_catcher_dream → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 含非單純確認之 confirm_only(1步) |
| 137 | `12p-wild-child` | 12 人局 - 野孩子 | 12 | `wild_child_choose → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 138 | `12p-board-18sbphw` | 12 人局 - 千年之戀 | 12 | `xu_xian_action → white_snake_action → wolf_kill → eclipse_maid_devour → witch_action → seer_check → hunter_gesture → confirm_only` | `eclipse_maid_devour → xu_xian_action → white_snake_action → radiant_earl_shield → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | specialRules: 如果蝕日侍女偷到許仙尋香魅影的綁定技能，並剛好綁定到白蛇預言家和許仙尋香魅影兩人，則第三方陣營直接獲勝。；如果許仙尋香魅影的綁定技能綁定自己白蛇預言家，並且透過綁定導致雙方一起死亡，第三方陣營也會直接獲勝。 |
| 139 | `12p-ghost-bride` | 12 人局 - 鬼魂新娘 | 12 | `ghost_bride_link → ghost_bride_link → confirm_only → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | `ghost_bride_link → confirm_only → guard_protect → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 含非單純確認之 confirm_only(2步) |
| 140 | `12p-zombie` | 12 人局 - 殭屍 | 12 | `zombie_infect → confirm_only → magician_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | `zombie_infect → confirm_only → magician_swap → wolf_kill → witch_action → seer_check → hunter_gesture` | witchSelfSave, wolfKillPriority, victoryMode | 標準全局管線 |
| 141 | `12p-treasure-master` | 12 人局 - 盜寶大師 | 12 | `dream_catcher_dream → confirm_only → poisoner_poison → confirm_only → treasure_master_choose → psychic_check → hunter_gesture` | `treasure_master_choose → dream_catcher_dream → wolf_kill → poisoner_poison → psychic_check → hunter_gesture` | wolfKillPriority, victoryMode | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；specialRules: 此板子第一夜狼人無刀。 |
| 142 | `multi-hunter` | 娛樂局 - 獵殺潛狼 / 獵人局 | 6 | `confirm_only` | `wolf_kill` | wolfKillPriority | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill）；dayResolution.ts:152 獵人任意死因可開槍（⚠️ 多處漏傳 boardId）；specialRules: 此板子第一夜狼隊無刀。 |
| 143 | `multi-lianliankan` | 娛樂局 - 連連看 | 10 | `scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link` | `scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link → scent_phantom_link → demon_hunter_hunt → demon_hunter_hunt → demon_hunter_hunt → demon_hunter_hunt` | wolfKillPriority | 首夜排程無 wolf_kill（⚠️ store 未傳 firstNightNoWolfKill） |