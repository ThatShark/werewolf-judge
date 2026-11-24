import { getRoleById } from '../data/roles';
import type {
  ManualVictoryOverrideKind,
  PlayerSeat,
  RuleOverrides,
  TreasureMasterRuntimeState,
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
): 'wolf' | 'villager' | 'god' | null {
  if (!seat.roleId) return null;
  // 被種狼感染轉化為狼人者，即時改計入狼人陣營（從原好人邊扣除）
  if (seat.infectedBySeedWolf) {
    return 'wolf';
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
): AliveFactionCounts {
  let wolves = 0;
  let villagers = 0;
  let gods = 0;

  for (const seat of seats) {
    if (!seat.isAlive) continue;
    const side = getEffectiveSide(seat, ruleOverrides, treasureMasterState);
    if (!side) continue;

    if (side === 'wolf') {
      wolves += 1;
    } else if (side === 'villager') {
      villagers += 1;
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
  options: { cursedFoxDiedThisResolution?: boolean } = {},
): VictoryResult {
  if (seats.length === 0) {
    return { winner: null, winReason: null };
  }

  let hasAnyWolf = false;
  let hasAnyVillager = false;
  let hasAnyGod = false;
  for (const seat of seats) {
    const side = getEffectiveSide(seat, ruleOverrides, treasureMasterState);
    if (side === 'wolf') hasAnyWolf = true;
    else if (side === 'villager') hasAnyVillager = true;
    else if (side === 'god') hasAnyGod = true;

    // 若原好人（神職／平民）被種狼感染轉為狼人，本局仍視為原本存在該陣營邊，避免最後一神／最後一民被感染時漏判屠邊
    if (seat.infectedBySeedWolf && seat.roleId) {
      const origRole = getRoleById(seat.roleId);
      if (origRole?.category === 'villager') hasAnyVillager = true;
      else if (origRole?.category === 'god') hasAnyGod = true;
    }
  }

  const { wolves, villagers, gods } = countAliveFactions(
    seats,
    ruleOverrides,
    treasureMasterState,
  );

  const villagersEliminated = hasAnyVillager && villagers === 0;
  const godsEliminated = hasAnyGod && gods === 0;
  const hasGoodRoles = hasAnyVillager || hasAnyGod;

  const wolfWon = !hasGoodRoles
    ? false
    : ruleOverrides.victoryMode === 'slaughter_all'
      ? (!hasAnyVillager || villagers === 0) && (!hasAnyGod || gods === 0)
      : villagersEliminated || godsEliminated;

  const goodWon = hasAnyWolf && wolves === 0;

  // 咒狐勝利覆蓋：當好人或狼人任一方達成勝利條件時，若咒狐仍在場（或同結算中同時出局），咒狐單獨獲勝
  if (wolfWon || goodWon) {
    const cursedFox = seats.find((s) => s.roleId === 'cursed_fox');
    if (cursedFox && (cursedFox.isAlive || options.cursedFoxDiedThisResolution)) {
      return {
        winner: 'third_party',
        winReason: '第三方陣營（咒狐）單獨獲勝（結算時咒狐仍在場／同時達成條件）',
      };
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
