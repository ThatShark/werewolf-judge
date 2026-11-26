import { getRoleById } from '../data/roles';
import { checkConversionThirdPartyVictory } from './conversionRoles';
import { checkThirdPartySpecialVictory } from './thirdPartySpecialRoles';
import type {
  ConversionRuntimeState,
  ManualVictoryOverrideKind,
  PlayerSeat,
  RuleOverrides,
  ThirdPartySpecialRuntimeState,
  TreasureMasterRuntimeState,
  VictoryCheckOptions,
  VictoryResult,
} from './types';

export interface AliveFactionCounts {
  wolves: number;
  villagers: number;
  gods: number;
}

function getEffectiveSide(
  seat: PlayerSeat,
  ruleOverrides: RuleOverrides,
  treasureMasterState?: TreasureMasterRuntimeState,
  conversionState?: ConversionRuntimeState,
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState,
): 'wolf' | 'villager' | 'god' | null {
  if (!seat.roleId) return null;
  // 百變狼王變身後底牌改為目標神職，仍計入狼人陣營
  if (
    conversionState?.chameleonWolfSeat === seat.seatNumber &&
    conversionState.chameleonOriginalRoleId === 'chameleon_wolf_king'
  ) {
    return 'wolf';
  }
  // 被種狼感染或覺醒石像鬼轉化為狼人者，即時改計入狼人陣營
  if (seat.infectedBySeedWolf || seat.convertedByAwakenedGargoyle) {
    return 'wolf';
  }
  if (
    seat.roleId === 'super_black_market_merchant' &&
    thirdPartySpecialState?.superBlackMarketTurnedWolf
  ) {
    return 'wolf';
  }
  if (seat.roleId === 'wild_child') {
    return conversionState?.wildChildTurnedWolf ? 'wolf' : 'villager';
  }
  if (seat.roleId === 'avenger') {
    if (conversionState?.avengerAlignedFaction === 'wolf') return 'wolf';
    if (conversionState?.avengerAlignedFaction === 'good') return 'god';
    return null;
  }
  if (seat.roleId === 'shadow') {
    if (conversionState?.shadowAvengerThirdParty) return null;
    if (conversionState?.shadowInheritedRoleId) {
      const inh = getRoleById(conversionState.shadowInheritedRoleId);
      if (inh?.faction === 'wolf') return 'wolf';
      if (inh?.category === 'god') return 'god';
      if (inh?.category === 'villager') return 'villager';
    }
    return null;
  }
  if (seat.roleId === 'awakened_lonely_girl') {
    if (conversionState?.awakenedLonelyGirlStatus === 'wolf') return 'wolf';
    if (
      conversionState?.awakenedLonelyGirlStatus === 'inherited' &&
      conversionState.awakenedLonelyGirlInheritedRoleId
    ) {
      const inh = getRoleById(conversionState.awakenedLonelyGirlInheritedRoleId);
      if (inh?.faction === 'wolf') return 'wolf';
      if (inh?.category === 'god') return 'god';
      return 'villager';
    }
    return null;
  }
  if (seat.roleId === 'treasure_master' && treasureMasterState?.affiliation) {
    return treasureMasterState.affiliation;
  }
  // 混血兒不計入狼人陣營；預設不計入屠邊人數，若開啟 hybridCountsAsVillager 則計入平民邊
  if (seat.roleId === 'hybrid') {
    return ruleOverrides.hybridCountsAsVillager ? 'villager' : null;
  }
  const role = getRoleById(seat.roleId);
  if (!role) return null;
  if (role.faction === 'wolf') return 'wolf';
  if (role.category === 'villager') return 'villager';
  if (role.category === 'god') return 'god';
  return null;
}

export function countAliveFactions(
  seats: PlayerSeat[],
  ruleOverrides: RuleOverrides,
  treasureMasterState?: TreasureMasterRuntimeState,
  conversionState?: ConversionRuntimeState,
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState,
): AliveFactionCounts {
  let wolves = 0;
  let villagers = 0;
  let gods = 0;

  for (const seat of seats) {
    if (!seat.isAlive) continue;
    const side = getEffectiveSide(
      seat,
      ruleOverrides,
      treasureMasterState,
      conversionState,
      thirdPartySpecialState,
    );
    if (!side) continue;

    if (side === 'wolf') {
      wolves += 1;
    } else if (side === 'villager') {
      villagers += 1;
      // 白澤繼承人（平民）轉為神／民雙陣營：狼隊屠神亦須淘汰該玩家
      if (seat.baiZeDualFaction) {
        gods += 1;
      }
    } else if (side === 'god') {
      // 白痴翻牌免死後，若規則設定不需追刀（idiotNeedsExtraKill = false），則不再計入存活神職
      if (seat.roleId === 'idiot' && seat.idiotRevealed && !ruleOverrides.idiotNeedsExtraKill) {
        continue;
      }
      gods += 1;
    }
  }

  return { wolves, villagers, gods };
}

export function checkVictory(
  seats: PlayerSeat[],
  ruleOverrides: RuleOverrides,
  treasureMasterState?: TreasureMasterRuntimeState,
  options: VictoryCheckOptions = {},
): VictoryResult {
  if (seats.length === 0) {
    return { winner: null, winReason: null };
  }

  // 第 5 批：潘朵拉與希望之光最高優先權勝利判定（與其他陣營同達標時優先判定）
  const specialTpWin = checkThirdPartySpecialVictory(seats, options.thirdPartySpecialState);
  if (specialTpWin.winner !== null) {
    return specialTpWin;
  }

  // 第 4 批第三方陣營專屬勝利條件優先判定（殭屍全場感染、許仙白蛇雙死、復仇者獨勝、人狼戀／鬼魂新娘／白蛇許仙屠城）
  const conversionTpWin = checkConversionThirdPartyVictory(seats, options.conversionState);
  if (conversionTpWin.winner !== null) {
    return conversionTpWin;
  }

  let hasAnyWolf = false;
  let hasAnyVillager = false;
  let hasAnyGod = false;
  for (const seat of seats) {
    const side = getEffectiveSide(
      seat,
      ruleOverrides,
      treasureMasterState,
      options.conversionState,
      options.thirdPartySpecialState,
    );
    if (side === 'wolf') hasAnyWolf = true;
    else if (side === 'villager') {
      hasAnyVillager = true;
      if (seat.baiZeDualFaction) hasAnyGod = true;
    } else if (side === 'god') hasAnyGod = true;

    // 若原好人（神職／平民）被種狼感染或覺醒石像鬼轉化為狼人，本局仍視為原本存在該陣營邊，避免最後一神／最後一民被轉化時漏判屠邊
    if ((seat.infectedBySeedWolf || seat.convertedByAwakenedGargoyle) && seat.roleId) {
      const origRole = getRoleById(seat.roleId);
      if (origRole?.category === 'villager') hasAnyVillager = true;
      else if (origRole?.category === 'god') hasAnyGod = true;
    }
  }

  // 若場上仍有未出局的獨立屠城第三方（人狼戀、鬼魂新娘三人組、白蛇／許仙），好人與狼人尚未將其淘汰前不得截胡結束遊戲
  const conv = options.conversionState;
  const hasAliveIndependentThirdParty = (() => {
    if (conv?.cupidAffiliation === 'third_party' && conv.cupidLovers) {
      const cupidSeat = seats.find((s) => s.roleId === 'cupid');
      const loverA = seats.find((s) => s.seatNumber === conv.cupidLovers![0]);
      const loverB = seats.find((s) => s.seatNumber === conv.cupidLovers![1]);
      if (cupidSeat?.isAlive || loverA?.isAlive || loverB?.isAlive) return true;
    }
    if (conv?.ghostBrideGroomSeat != null) {
      const bride = seats.find((s) => s.roleId === 'ghost_bride');
      const groom = seats.find((s) => s.seatNumber === conv.ghostBrideGroomSeat);
      const witness =
        conv.ghostBrideWitnessSeat != null
          ? seats.find((s) => s.seatNumber === conv.ghostBrideWitnessSeat)
          : undefined;
      if (bride?.isAlive || groom?.isAlive || witness?.isAlive) return true;
    }
    const hasAliveSnakeOrXu = seats.some(
      (s) => s.isAlive && (s.roleId === 'white_snake_seer' || s.roleId === 'xu_xian_phantom'),
    );
    if (hasAliveSnakeOrXu) return true;
    return false;
  })();

  const { wolves, villagers, gods } = countAliveFactions(
    seats,
    ruleOverrides,
    treasureMasterState,
    options.conversionState,
    options.thirdPartySpecialState,
  );

  const villagersEliminated = hasAnyVillager && villagers === 0;
  const godsEliminated = hasAnyGod && gods === 0;
  const hasGoodRoles = hasAnyVillager || hasAnyGod;

  const wolfWon = hasAliveIndependentThirdParty
    ? false
    : !hasGoodRoles
      ? false
      : ruleOverrides.victoryMode === 'slaughter_all'
        ? (!hasAnyVillager || villagers === 0) && (!hasAnyGod || gods === 0)
        : villagersEliminated || godsEliminated;

  const goodWon = !hasAliveIndependentThirdParty && hasAnyWolf && wolves === 0;

  // 咒狐／睡美人勝利覆蓋：當好人或狼人任一方達成勝利條件時
  if (wolfWon || goodWon) {
    const cursedFox = seats.find((s) => s.roleId === 'cursed_fox');
    if (cursedFox && (cursedFox.isAlive || options.cursedFoxDiedThisResolution)) {
      return {
        winner: 'third_party',
        winReason: '第三方陣營（咒狐）單獨獲勝（結算時咒狐仍在場／同時達成條件）',
      };
    }
    const sleepingBeautySeatNum = options.thirdPartySpecialState?.sleepingBeautySeat;
    if (
      sleepingBeautySeatNum != null &&
      !options.thirdPartySpecialState?.sleepingBeautyAwakened
    ) {
      const sbSeat = seats.find((s) => s.seatNumber === sleepingBeautySeatNum);
      if (sbSeat?.isAlive) {
        return {
          winner: 'third_party',
          winReason: `第三方陣營（睡美人 ${sleepingBeautySeatNum} 號）單獨獲勝（好人／狼人達標時睡美人仍存活且未被異族王子驗出）`,
        };
      }
    }
  }

  if (wolfWon && (!goodWon || ruleOverrides.wolfKillPriority)) {
    if (ruleOverrides.victoryMode === 'slaughter_all') {
      return { winner: 'wolf', winReason: '狼人陣營屠城勝利（所有好人已出局）' };
    }
    if (villagersEliminated && godsEliminated) {
      return { winner: 'wolf', winReason: '狼人陣營屠邊勝利（平民與神職皆已出局）' };
    }
    if (villagersEliminated) {
      return { winner: 'wolf', winReason: '狼人陣營屠民勝利（所有平民已出局）' };
    }
    return { winner: 'wolf', winReason: '狼人陣營屠神勝利（所有神職已出局）' };
  }

  if (goodWon) {
    return { winner: 'good', winReason: '好人陣營勝利（所有狼人已出局）' };
  }

  return { winner: null, winReason: null };
}

/**
 * 判斷自動勝負結果是否應鎖定並進入 game_over：
 * 若法官先前已選擇「強制繼續（forceContinueAfterVictory = true）」，則不再自動鎖定結束。
 */
export function shouldTriggerAutoVictory(
  victory: VictoryResult,
  forceContinueAfterVictory: boolean,
): boolean {
  return victory.winner !== null && !forceContinueAfterVictory;
}

/**
 * 產生法官手動勝負覆蓋結果（好人交牌／狼人交牌／強制結束平局／指定陣營勝）。
 */
export function createManualVictoryResult(
  kind: ManualVictoryOverrideKind,
  customReason?: string,
): VictoryResult {
  const trimmed = customReason?.trim();
  switch (kind) {
    case 'good_surrender':
      return {
        winner: 'wolf',
        winReason: trimmed || '法官手動覆蓋：好人陣營交牌，狼人陣營勝利',
      };
    case 'wolf_surrender':
      return {
        winner: 'good',
        winReason: trimmed || '法官手動覆蓋：狼人陣營交牌，好人陣營勝利',
      };
    case 'force_draw':
      return {
        winner: 'draw',
        winReason: trimmed || '法官手動覆蓋：強制結束，本局判定平局',
      };
    case 'good_win':
      return {
        winner: 'good',
        winReason: trimmed || '法官手動宣告：好人陣營勝利',
      };
    case 'wolf_win':
      return {
        winner: 'wolf',
        winReason: trimmed || '法官手動宣告：狼人陣營勝利',
      };
    case 'third_party_win':
      return {
        winner: 'third_party',
        winReason: trimmed || '法官手動宣告：第三方陣營勝利',
      };
  }
}
