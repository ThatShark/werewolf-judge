import { syncMechWolfTeamStatus } from './mechWolf';
import type {
  DeathReason,
  MechWolfRuntimeState,
  PlayerSeat,
  RuleOverrides,
  TreasureMasterRuntimeState,
  VictoryCheckOptions,
  VictoryResult,
} from './types';
import { checkVictory } from './victory';

export interface ManualToggleSeatResult {
  seats: PlayerSeat[];
  seatNumber: number;
  becameAlive: boolean;
  mechWolfState: MechWolfRuntimeState;
  victory: VictoryResult;
}

/**
 * 法官手動切換單一座位的存活／出局狀態（供進階角色、特殊死因或誤點還原使用）。
 */
export function toggleSeatAliveManually(
  seats: PlayerSeat[],
  seatNumber: number,
  round: number,
  mechWolfState: MechWolfRuntimeState,
  ruleOverrides: RuleOverrides,
  reason: DeathReason = 'manual_judge',
  treasureMasterState?: TreasureMasterRuntimeState,
  victoryOptions?: VictoryCheckOptions,
): ManualToggleSeatResult {
  const target = seats.find((seat) => seat.seatNumber === seatNumber);
  if (!target) {
    throw new Error(`找不到 ${seatNumber} 號座位`);
  }

  const becameAlive = !target.isAlive;

  const updatedSeats = seats.map((seat) => {
    if (seat.seatNumber !== seatNumber) return seat;
    if (becameAlive) {
      const { deathReason: _removedReason, deathRound: _removedRound, ...rest } = seat;
      return {
        ...rest,
        isAlive: true,
      };
    }
    return {
      ...seat,
      isAlive: false,
      deathReason: reason,
      deathRound: round,
    };
  });

  const nextMechWolfState = syncMechWolfTeamStatus(updatedSeats, mechWolfState);
  const victory = checkVictory(updatedSeats, ruleOverrides, treasureMasterState, victoryOptions);

  return {
    seats: updatedSeats,
    seatNumber,
    becameAlive,
    mechWolfState: nextMechWolfState,
    victory,
  };
}
