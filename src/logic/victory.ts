import { getRoleById } from '../data/roles';
import type { PlayerSeat, RuleOverrides, VictoryResult } from './types';

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
