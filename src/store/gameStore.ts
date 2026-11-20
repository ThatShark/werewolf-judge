import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getBoardById } from '../data/boards';
import {
  DEFAULT_RULE_OVERRIDES,
  createEmptyNightDraft,
  createInitialMechWolfState,
  createInitialSeats,
  getNightSteps,
  resolveDayExile,
  resolveNight,
  resolveSelfExplode,
  resolveShoot,
  validateRoleAssignment,
} from '../logic';
import type {
  DeathReason,
  GameState,
  NightActionDraft,
  RuleOverrides,
  ShootEligibility,
} from '../logic/types';

export const GAME_STORAGE_KEY = 'werewolf-judge-storage';

export interface PendingShooter extends ShootEligibility {
  deathReason: DeathReason;
}

export interface GameStore extends GameState {
  pendingShooters: PendingShooter[];

  selectBoard: (boardId: string) => void;
  updateRuleOverrides: (partial: Partial<RuleOverrides>) => void;
  setSeatNickname: (seatNumber: number, nickname: string) => void;
  assignRole: (seatNumber: number, roleId: string | null) => void;
  startGame: () => { ok: boolean; errors: string[] };

  updateNightDraft: (partial: Partial<NightActionDraft>) => void;
  nextNightStep: () => void;
  prevNightStep: () => void;
  finishNight: () => void;

  triggerShoot: (shooterSeat: number, targetSeat: number) => void;
  skipShoot: (shooterSeat: number) => void;
  proceedToDayVote: () => void;

  exilePlayer: (targetSeat: number) => void;
  selfExplode: (wolfSeat: number) => { allowed: boolean; reason?: string };
  advanceToNextNight: () => void;

  restartGame: (options: { keepNicknames: boolean }) => void;
}

function createInitialGameState(): GameState & { pendingShooters: PendingShooter[] } {
  return {
    phase: 'board_select',
    round: 1,
    selectedBoardId: null,
    ruleOverrides: { ...DEFAULT_RULE_OVERRIDES },
    seats: [],
    savedNicknames: {},
    currentStepIndex: 0,
    currentNightDraft: createEmptyNightDraft(1),
    witchAntidoteUsed: false,
    witchPoisonUsed: false,
    lastGuardedSeat: null,
    mechWolfState: createInitialMechWolfState(),
    pendingSelfExplodeSeat: null,
    nightHistory: [],
    dayHistory: [],
    winner: null,
    winReason: null,
    pendingShooters: [],
  };
}

function appendDayEvent(
  dayHistory: GameState['dayHistory'],
  round: number,
  event: string,
): GameState['dayHistory'] {
  const existingIndex = dayHistory.findIndex((entry) => entry.round === round);
  if (existingIndex === -1) {
    return [...dayHistory, { round, events: [event] }];
  }
  return dayHistory.map((entry, idx) =>
    idx === existingIndex ? { ...entry, events: [...entry.events, event] } : entry,
  );
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialGameState(),

      selectBoard: (boardId) => {
        const board = getBoardById(boardId);
        if (!board) {
          throw new Error(`找不到板子：${boardId}`);
        }
        const { savedNicknames } = get();
        set({
          selectedBoardId: board.id,
          phase: 'seat_setup',
          round: 1,
          seats: createInitialSeats(board.playerCount, savedNicknames),
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(1),
          witchAntidoteUsed: false,
          witchPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
          nightHistory: [],
          dayHistory: [],
          winner: null,
          winReason: null,
          pendingShooters: [],
        });
      },

      updateRuleOverrides: (partial) => {
        set((state) => ({
          ruleOverrides: {
            ...state.ruleOverrides,
            ...partial,
          },
        }));
      },

      setSeatNickname: (seatNumber, nickname) => {
        set((state) => ({
          savedNicknames: {
            ...state.savedNicknames,
            [seatNumber]: nickname,
          },
          seats: state.seats.map((seat) =>
            seat.seatNumber === seatNumber ? { ...seat, nickname } : seat,
          ),
        }));
      },

      assignRole: (seatNumber, roleId) => {
        set((state) => ({
          seats: state.seats.map((seat) =>
            seat.seatNumber === seatNumber ? { ...seat, roleId } : seat,
          ),
        }));
      },

      startGame: () => {
        const { selectedBoardId, seats } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) {
          return { ok: false, errors: ['尚未選擇板子'] };
        }
        const validation = validateRoleAssignment(board, seats);
        if (!validation.valid) {
          return { ok: false, errors: validation.errors };
        }
        set({
          phase: 'night',
          round: 1,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(1),
          witchAntidoteUsed: false,
          witchPoisonUsed: false,
          lastGuardedSeat: null,
          mechWolfState: createInitialMechWolfState(),
          pendingSelfExplodeSeat: null,
          nightHistory: [],
          dayHistory: [],
          winner: null,
          winReason: null,
          pendingShooters: [],
        });
        return { ok: true, errors: [] };
      },

      updateNightDraft: (partial) => {
        set((state) => ({
          currentNightDraft: {
            ...state.currentNightDraft,
            ...partial,
          },
        }));
      },

      nextNightStep: () => {
        const { selectedBoardId, round, currentStepIndex } = get();
        const board = getBoardById(selectedBoardId);
        if (!board) return;
        const steps = getNightSteps(board, round);
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        }
      },

      prevNightStep: () => {
        set((state) => ({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        }));
      },

      finishNight: () => {
        const state = get();
        const result = resolveNight({
          seats: state.seats,
          round: state.round,
          draft: state.currentNightDraft,
          ruleOverrides: state.ruleOverrides,
          witchAntidoteUsed: state.witchAntidoteUsed,
          witchPoisonUsed: state.witchPoisonUsed,
          lastGuardedSeat: state.lastGuardedSeat,
          mechWolfState: state.mechWolfState,
          pendingSelfExplodeSeat: state.pendingSelfExplodeSeat,
        });

        const deathMap = new Map(result.deaths.map((d) => [d.seat, d.reason]));
        const pendingShooters: PendingShooter[] = result.shootEligibilities
          .filter((item) => item.canShoot)
          .map((item) => ({
            ...item,
            deathReason: deathMap.get(item.seatNumber) ?? 'wolf_kill',
          }));

        set({
          seats: result.seats,
          witchAntidoteUsed: result.witchAntidoteUsed,
          witchPoisonUsed: result.witchPoisonUsed,
          lastGuardedSeat: result.lastGuardedSeat,
          mechWolfState: result.mechWolfState,
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          nightHistory: [
            ...state.nightHistory,
            {
              round: state.round,
              draft: { ...state.currentNightDraft },
              deaths: result.deaths,
            },
          ],
          pendingShooters,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : 'day_announcement',
        });
      },

      triggerShoot: (shooterSeat, targetSeat) => {
        const state = get();
        const shooter = state.pendingShooters.find((s) => s.seatNumber === shooterSeat);
        if (!shooter) {
          throw new Error(`座位 ${shooterSeat} 號目前無開槍資格`);
        }

        const result = resolveShoot(
          state.seats,
          shooterSeat,
          targetSeat,
          shooter.deathReason,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );

        const remainingShooters = state.pendingShooters.filter(
          (s) => s.seatNumber !== shooterSeat,
        );
        if (result.chainedShootEligibility?.canShoot) {
          remainingShooters.push({
            ...result.chainedShootEligibility,
            deathReason: result.deathReason,
          });
        }

        const actorLabel = shooter.roleId === 'hunter' ? '獵人' : '狼王';
        const nextDayHistory = appendDayEvent(
          state.dayHistory,
          state.round,
          `${shooterSeat} 號（${actorLabel}）開槍帶走 ${targetSeat} 號`,
        );

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          pendingShooters: remainingShooters,
          dayHistory: nextDayHistory,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : state.phase,
        });
      },

      skipShoot: (shooterSeat) => {
        set((state) => ({
          pendingShooters: state.pendingShooters.filter((s) => s.seatNumber !== shooterSeat),
          dayHistory: appendDayEvent(
            state.dayHistory,
            state.round,
            `${shooterSeat} 號選擇壓槍不開`,
          ),
        }));
      },

      proceedToDayVote: () => {
        set((state) => ({
          phase: state.winner ? 'game_over' : 'day_vote',
        }));
      },

      exilePlayer: (targetSeat) => {
        const state = get();
        const result = resolveDayExile(
          state.seats,
          targetSeat,
          state.round,
          state.ruleOverrides,
          state.mechWolfState,
        );

        const eventText = result.idiotRevealed
          ? `${targetSeat} 號（白痴）被放逐投票投出，翻牌免死並失去投票權`
          : `${targetSeat} 號於白天放逐出局`;

        const pendingShooters: PendingShooter[] =
          result.shootEligibility?.canShoot && !result.victory.winner
            ? [{ ...result.shootEligibility, deathReason: 'exiled' }]
            : [];

        set({
          seats: result.seats,
          mechWolfState: result.mechWolfState,
          dayHistory: appendDayEvent(state.dayHistory, state.round, eventText),
          pendingShooters,
          winner: result.victory.winner,
          winReason: result.victory.winReason,
          phase: result.victory.winner ? 'game_over' : state.phase,
        });
      },

      selfExplode: (wolfSeat) => {
        const state = get();
        const result = resolveSelfExplode(state.seats, wolfSeat);
        if (!result.allowed) {
          return { allowed: false, reason: result.reason };
        }

        const nextRound = state.round + 1;
        set({
          pendingSelfExplodeSeat: result.pendingSelfExplodeSeat,
          dayHistory: appendDayEvent(
            state.dayHistory,
            state.round,
            `${wolfSeat} 號狼人自爆，強制進入第 ${nextRound} 晚（當晚點刀後正式死亡）`,
          ),
          round: nextRound,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(nextRound),
          pendingShooters: [],
          phase: 'night',
        });

        return { allowed: true };
      },

      advanceToNextNight: () => {
        const state = get();
        if (state.winner) return;
        const nextRound = state.round + 1;
        set({
          round: nextRound,
          currentStepIndex: 0,
          currentNightDraft: createEmptyNightDraft(nextRound),
          pendingShooters: [],
          phase: 'night',
        });
      },

      restartGame: ({ keepNicknames }) => {
        const state = get();
        if (keepNicknames) {
          const board = getBoardById(state.selectedBoardId);
          set({
            ...createInitialGameState(),
            selectedBoardId: board ? board.id : null,
            ruleOverrides: { ...state.ruleOverrides },
            savedNicknames: { ...state.savedNicknames },
            seats: board ? createInitialSeats(board.playerCount, state.savedNicknames) : [],
            phase: board ? 'seat_setup' : 'board_select',
          });
          return;
        }

        set(createInitialGameState());
      },
    }),
    {
      name: GAME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
