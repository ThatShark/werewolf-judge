import { getRoleById } from '../data/roles';
import type {
  BoardDefinition,
  MechWolfRuntimeState,
  NightActionDraft,
  NightStepScript,
  PlayerSeat,
  RoleAssignmentValidation,
  RoleSlot,
  RuleOverrides,
} from './types';

export const DEFAULT_RULE_OVERRIDES: RuleOverrides = {
  witchSelfSave: 'first_night_only',
  idiotNeedsExtraKill: false,
  mechWolfForceLearnNight1: true,
  wolfKillPriority: true,
  victoryMode: 'slaughter_side',
};

export function createInitialMechWolfState(): MechWolfRuntimeState {
  return {
    learnedFromSeat: null,
    learnedRoleId: null,
    hasJoinedWolfTeam: false,
    usedLearnedOneShotSkill: false,
    lastGuardedSeat: null,
  };
}

export function createEmptyNightDraft(round: number): NightActionDraft {
  return {
    round,
    guardTarget: null,
    wolfTarget: null,
    witchUseAntidote: false,
    witchPoisonTarget: null,
    seerCheckTarget: null,
    psychicCheckTarget: null,
    mechWolfLearnTarget: null,
    mechWolfSkillTarget: null,
  };
}

export function createInitialSeats(
  playerCount: number,
  savedNicknames: Record<number, string> = {},
): PlayerSeat[] {
  return Array.from({ length: playerCount }, (_, index) => {
    const seatNumber = index + 1;
    return {
      seatNumber,
      nickname: savedNicknames[seatNumber] ?? '',
      roleId: null,
      isAlive: true,
    };
  });
}

export function getBoardExpectedRoleCounts(board: BoardDefinition): Record<string, number> {
  const expected: Record<string, number> = {};
  const allSlots: RoleSlot[] = [
    ...board.composition.wolf,
    ...board.composition.good,
    ...(board.composition.thirdParty ?? []),
  ];
  for (const slot of allSlots) {
    expected[slot.roleId] = (expected[slot.roleId] ?? 0) + slot.count;
  }
  return expected;
}

export function isValidPlayerCountForBoard(board: BoardDefinition, count: number): boolean {
  if (board.presetPlayerCounts && board.presetPlayerCounts.length > 0) {
    return board.presetPlayerCounts.includes(count);
  }
  if (board.playerCountRange) {
    return count >= board.playerCountRange[0] && count <= board.playerCountRange[1];
  }
  return count === board.playerCount;
}

export function validateRoleAssignment(
  board: BoardDefinition,
  seats: PlayerSeat[],
): RoleAssignmentValidation {
  const errors: string[] = [];
  const missingRoles: Record<string, number> = {};
  const extraRoles: Record<string, number> = {};

  if (!isValidPlayerCountForBoard(board, seats.length)) {
    errors.push(`座位數量不符：需要 ${board.playerCount} 人，目前為 ${seats.length} 人。`);
  }

  const expectedCounts = getBoardExpectedRoleCounts(board);
  const actualCounts: Record<string, number> = {};
  const unassignedSeats: number[] = [];

  for (const seat of seats) {
    if (!seat.roleId) {
      unassignedSeats.push(seat.seatNumber);
      continue;
    }
    actualCounts[seat.roleId] = (actualCounts[seat.roleId] ?? 0) + 1;
  }

  if (unassignedSeats.length > 0) {
    errors.push(`尚有未分配身分的座位：${unassignedSeats.join('、')} 號。`);
  }

  const allRoleIds = new Set([...Object.keys(expectedCounts), ...Object.keys(actualCounts)]);
  const allowScalingCounts = Boolean(
    board.presetPlayerCounts?.length || board.playerCountRange,
  );

  for (const roleId of allRoleIds) {
    const expected = expectedCounts[roleId] ?? 0;
    const actual = actualCounts[roleId] ?? 0;
    const roleName = getRoleById(roleId)?.name ?? roleId;

    if (board.isFlexibleComposition) {
      if (expected === 0 && actual > 0) {
        extraRoles[roleId] = actual;
        errors.push(`${roleName} 不屬於本板子可選角色。`);
      } else if (!allowScalingCounts && actual > expected) {
        extraRoles[roleId] = actual - expected;
        errors.push(`${roleName} 人數超出：最多 ${expected} 名，目前 ${actual} 名。`);
      }
      continue;
    }

    if (actual < expected) {
      missingRoles[roleId] = expected - actual;
      errors.push(`${roleName} 人數不足：需 ${expected} 名，目前 ${actual} 名。`);
    } else if (actual > expected) {
      extraRoles[roleId] = actual - expected;
      errors.push(`${roleName} 人數超出：需 ${expected} 名，目前 ${actual} 名。`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingRoles,
    extraRoles,
  };
}

export function getNightSteps(board: BoardDefinition, round: number): NightStepScript[] {
  return round <= 1 ? board.nightSchedule.firstNight : board.nightSchedule.subsequentNights;
}
