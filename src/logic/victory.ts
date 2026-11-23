import { getRoleById } from '../data/roles';
import type {
  ManualVictoryOverrideKind,
  PlayerSeat,
  RuleOverrides,
  VictoryResult,
} from './types';

export interface AliveFactionCounts {
  wolves: number;
  villagers: number;
  gods: number;
}

export function countAliveFactions(
  seats: PlayerSeat[],
  ruleOverrides: RuleOverrides,
): AliveFactionCounts {
  let wolves = 0;
  let villagers = 0;
  let gods = 0;

  for (const seat of seats) {
    if (!seat.isAlive) continue;
    const role = getRoleById(seat.roleId);
    if (!role) continue;

    if (role.faction === 'wolf') {
      wolves += 1;
    } else if (role.category === 'villager') {
      villagers += 1;
    } else if (role.category === 'god') {
      // 白痴翻牌免死後，若規則設定不需追刀（idiotNeedsExtraKill = false），則不再計入存活神職
      if (role.id === 'idiot' && seat.idiotRevealed && !ruleOverrides.idiotNeedsExtraKill) {
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
): VictoryResult {
  if (seats.length === 0) {
    return { winner: null, winReason: null };
  }

  let hasAnyWolf = false;
  let hasAnyVillager = false;
  let hasAnyGod = false;
  for (const seat of seats) {
    const role = getRoleById(seat.roleId);
    if (!role) continue;
    if (role.faction === 'wolf') hasAnyWolf = true;
    else if (role.category === 'villager') hasAnyVillager = true;
    else if (role.category === 'god') hasAnyGod = true;
  }

  const { wolves, villagers, gods } = countAliveFactions(seats, ruleOverrides);

  const villagersEliminated = hasAnyVillager && villagers === 0;
  const godsEliminated = hasAnyGod && gods === 0;
  const hasGoodRoles = hasAnyVillager || hasAnyGod;

  const wolfWon = !hasGoodRoles
    ? false
    : ruleOverrides.victoryMode === 'slaughter_all'
      ? (!hasAnyVillager || villagers === 0) && (!hasAnyGod || gods === 0)
      : villagersEliminated || godsEliminated;

  const goodWon = hasAnyWolf && wolves === 0;

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
