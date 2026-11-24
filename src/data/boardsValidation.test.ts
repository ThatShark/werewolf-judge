import { describe, expect, it, vi } from 'vitest';

// 在 Node 測試環境預先注入記憶體版 localStorage，供 Zustand persist 中介層使用
vi.hoisted(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map<string, string>();
    const memoryStorage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
  }
});

import { ALL_BOARDS, BOARDS_BY_ID } from './boards';
import { ROLES_BY_ID, ROLE_LIST } from './roles';
import { getNightSteps } from '../logic';
import type { NightActionType, PlayerCountFilter } from '../logic/types';
import { useGameStore } from '../store/gameStore';

const VALID_PLAYER_COUNT_FILTERS = new Set<PlayerCountFilter>([
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  'multi',
]);

const VALID_NIGHT_ACTION_TYPES = new Set<NightActionType>([
  'wolf_kill',
  'witch_action',
  'poisoner_poison',
  'seer_check',
  'psychic_check',
  'guard_protect',
  'hunter_gesture',
  'mech_wolf_learn',
  'mech_wolf_reveal_skill',
  'mech_wolf_night_action',
  'wolf_beauty_charm',
  'dream_catcher_dream',
  'wolf_girl_confess',
  'treasure_master_choose',
  'nightmare_fear',
  'hybrid_choose',
  'awakened_seer_check',
  'lantern_seer_check',
  'drunk_seer_check',
  'fool_seer_check',
  'fox_check',
  'gargoyle_check',
  'gargoyle_team_status',
  'wolf_witch_check',
  'pure_white_check',
  'demon_wolf_check',
  'pumpkin_ghost_check',
  'gravekeeper_check',
  'super_gravekeeper_action',
  'super_gravekeeper_heir_check',
  'nine_tailed_fox_check',
  'awakened_dream_catcher_dream',
  'awakened_dream_catcher_judge',
  'magician_swap',
  'wolf_warlock_swap',
  'trickster_wolf_swap',
  'troublemaker_prank',
  'time_eclipse_lock',
  'penguin_freeze',
  'fox_cub_charm',
  'mute_elder_mute',
  'medusa_petrify',
  'silent_night_mentor_action',
  'daylight_scholar_action',
  'fortune_teller_mark',
  'radiant_earl_shield',
  'socialite_favor',
  'enchanter_bewitch',
  'black_bat_shield',
  'dark_night_envoy_shield',
  'alchemy_witch_fog',
  'alchemy_witch_snake',
  'awakened_witch_action',
  'demon_hunter_hunt',
  'wolf_raven_claw_kill',
  'assassin_wolf_assassinate',
  'big_bad_wolf_kill',
  'big_grey_wolf_kill',
  'wolf_younger_brother_kill',
  'bee_wild_hunt_sting',
  'perseus_execute',
  'anubis_scale',
  'awakened_wolf_king_give_gun',
  'awakened_wolf_beauty_charm',
  'scarlet_wolf_king_attach',
  'night_noble_servant',
  'awakened_idiot_shield',
  'warden_wolf_trade',
  'cupid_link',
  'ghost_bride_link',
  'scent_phantom_link',
  'twins_guard',
  'white_snake_action',
  'xu_xian_action',
  'awakened_gargoyle_convert',
  'awakened_lonely_girl_choose',
  'wild_child_choose',
  'shadow_choose',
  'puppet_wolf_choose',
  'zombie_infect',
  'chameleon_wolf_choose',
  'thief_choose',
  'jack_ripper_action',
  'pandora_gift',
  'pandora_knife',
  'sleeping_beauty_pick',
  'exotic_prince_check',
  'nine_tails_mark',
  'bai_ze_clear',
  'dancer_dance',
  'masked_wolf_action',
  'crow_curse',
  'miracle_merchant_gift',
  'black_market_gift',
  'super_black_market_gift',
  'evil_merchant_gift',
  'medium_channel',
  'butler_tea',
  'wolf_maid_tea',
  'lucky_item_action',
  'eclipse_maid_devour',
  'grey_wolf_boss_steal',
  'happy_sheep_action',
  'phantom_wolf_invincible',
  'police_dog_action',
  'little_girl_identify',
  'confirm_only',
]);

/** 可重現的偽亂數產生器，確保全板子無頭模擬測試 100% 穩定可重現 */
function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('全板子 100% 自動化驗證與無頭模擬測試套件', () => {
  it('1. 【基礎結構與唯一性檢查】：id 不可重複、name 不可為空、playerCount 與 playerCountFilter 完全對應', () => {
    expect(ALL_BOARDS.length).toBeGreaterThan(0);
    expect(Object.keys(BOARDS_BY_ID)).toHaveLength(ALL_BOARDS.length);

    const seenIds = new Set<string>();

    for (const board of ALL_BOARDS) {
      expect(board.id.trim().length, `板子 ${board.name} 的 id 不可為空`).toBeGreaterThan(0);
      expect(seenIds.has(board.id), `發現重複的板子 id：${board.id}`).toBe(false);
      seenIds.add(board.id);

      expect(BOARDS_BY_ID[board.id], `BOARDS_BY_ID 缺少板子 ${board.id}`).toBe(board);
      expect(board.name.trim().length, `板子 ${board.id} 的 name 不可為空`).toBeGreaterThan(0);
      expect(
        Number.isInteger(board.playerCount) && board.playerCount > 0,
        `板子 ${board.id} 的 playerCount (${board.playerCount}) 必須為正整數`,
      ).toBe(true);
      expect(
        VALID_PLAYER_COUNT_FILTERS.has(board.playerCountFilter),
        `板子 ${board.id} 的 playerCountFilter (${board.playerCountFilter}) 不合法`,
      ).toBe(true);

      if (board.playerCountFilter === 'multi') {
        if (board.playerCountRange) {
          const [min, max] = board.playerCountRange;
          expect(min, `板子 ${board.id} 的 playerCountRange 最小值須小於最大值`).toBeLessThan(max);
          expect(
            board.playerCount >= min && board.playerCount <= max,
            `板子 ${board.id} 的預設人數 ${board.playerCount} 須落在 [${min}, ${max}] 內`,
          ).toBe(true);
        } else {
          // 非標準單一人數標題（如娛樂局）歸類為 multi
          expect(
            /^(6|7|8|9|10|12)\s*人局/.test(board.name),
            `板子 ${board.id} (${board.name}) 標記為 multi 但標題屬單一固定人數`,
          ).toBe(false);
        }
      } else {
        expect(
          Number(board.playerCountFilter),
          `板子 ${board.id} (${board.name}) 的 playerCount (${board.playerCount}) 與 playerCountFilter (${board.playerCountFilter}) 不一致`,
        ).toBe(board.playerCount);
      }
    }
  });

  it('2. 【陣營人數總和自動驗算】：wolf + good + thirdParty 角色總數須精準符合板子人數（或彈性區間／底牌池規則）', () => {
    for (const board of ALL_BOARDS) {
      const allSlots = [
        ...board.composition.wolf,
        ...board.composition.good,
        ...(board.composition.thirdParty ?? []),
      ];

      expect(allSlots.length, `板子 ${board.id} 未定義任何角色配置`).toBeGreaterThan(0);

      for (const slot of allSlots) {
        expect(
          Number.isInteger(slot.count) && slot.count > 0,
          `板子 ${board.id} 角色 ${slot.roleId} 的數量 (${slot.count}) 必須為正整數`,
        ).toBe(true);
      }

      const totalRoleCount = allSlots.reduce((sum, slot) => sum + slot.count, 0);

      if (board.playerCountRange) {
        const [min, max] = board.playerCountRange;
        expect(
          totalRoleCount >= min && totalRoleCount <= max,
          `彈性人數板子 ${board.id} (${board.name}) 的角色總數 ${totalRoleCount} 未落在 playerCountRange [${min}, ${max}] 內`,
        ).toBe(true);
      } else if (board.isFlexibleComposition) {
        // 含額外底牌（盜賊／盜寶大師）或選配池（神職五選三／替代角色）：牌池張數不可少於玩家人數
        expect(
          totalRoleCount,
          `彈性配置板子 ${board.id} (${board.name}) 的牌池總數 ${totalRoleCount} 不可小於玩家人數 ${board.playerCount}`,
        ).toBeGreaterThanOrEqual(board.playerCount);
      } else {
        expect(
          totalRoleCount,
          `固定人數板子 ${board.id} (${board.name}) 的陣營人數總和 (${totalRoleCount}) 不等於 playerCount (${board.playerCount})`,
        ).toBe(board.playerCount);
      }
    }
  });

  it('3. 【角色字典與別名完整性檢查】：所有板子的 composition、nightSchedule 與 qaList 角色 ID 皆存在於 roles.ts', () => {
    expect(ROLE_LIST.length).toBeGreaterThan(0);
    expect(Object.keys(ROLES_BY_ID)).toHaveLength(ROLE_LIST.length);

    // 先驗證 roles.ts 本身無缺漏或空白別名
    for (const role of ROLE_LIST) {
      expect(role.id.trim().length).toBeGreaterThan(0);
      expect(role.name.trim().length, `角色 ${role.id} 的 name 不可為空`).toBeGreaterThan(0);
      expect(ROLES_BY_ID[role.id]).toBe(role);
      for (const alias of role.aliases) {
        expect(alias.trim().length, `角色 ${role.id} 包含空白別名`).toBeGreaterThan(0);
      }
    }

    // 再比對所有板子的所有角色 ID 參考
    for (const board of ALL_BOARDS) {
      const compSlots = [
        ...board.composition.wolf,
        ...board.composition.good,
        ...(board.composition.thirdParty ?? []),
      ];
      for (const slot of compSlots) {
        expect(
          ROLES_BY_ID[slot.roleId],
          `板子 ${board.id} (${board.name}) 的 composition 參考了不存在的角色 ID：「${slot.roleId}」`,
        ).toBeDefined();
      }

      const allSteps = [...board.nightSchedule.firstNight, ...board.nightSchedule.subsequentNights];
      for (const step of allSteps) {
        for (const roleId of step.actorRoleIds) {
          expect(
            ROLES_BY_ID[roleId],
            `板子 ${board.id} (${board.name}) 夜間步驟 ${step.stepId} 的 actorRoleIds 參考了不存在的角色 ID：「${roleId}」`,
          ).toBeDefined();
        }
      }

      for (const qa of board.qaList) {
        for (const roleId of qa.relatedRoleIds ?? []) {
          expect(
            ROLES_BY_ID[roleId],
            `板子 ${board.id} (${board.name}) Q&A (${qa.id}) 的 relatedRoleIds 參考了不存在的角色 ID：「${roleId}」`,
          ).toBeDefined();
        }
      }
    }
  });

  it('4. 【夜間流程與台詞完整性檢查】：firstNight 與 subsequentNights 非空、actionType 合法、三段式台詞完整', () => {
    for (const board of ALL_BOARDS) {
      const { firstNight, subsequentNights } = board.nightSchedule;
      expect(
        firstNight.length,
        `板子 ${board.id} (${board.name}) 的 firstNight 不可為空`,
      ).toBeGreaterThan(0);
      expect(
        subsequentNights.length,
        `板子 ${board.id} (${board.name}) 的 subsequentNights 不可為空`,
      ).toBeGreaterThan(0);

      for (const [nightName, steps] of [
        ['firstNight', firstNight],
        ['subsequentNights', subsequentNights],
      ] as const) {
        const seenStepIds = new Set<string>();

        for (const step of steps) {
          expect(
            step.stepId.trim().length,
            `板子 ${board.id} ${nightName} 存在空白 stepId`,
          ).toBeGreaterThan(0);
          expect(
            seenStepIds.has(step.stepId),
            `板子 ${board.id} ${nightName} 發現重複 stepId：${step.stepId}`,
          ).toBe(false);
          seenStepIds.add(step.stepId);

          expect(
            VALID_NIGHT_ACTION_TYPES.has(step.actionType),
            `板子 ${board.id} ${nightName} 步驟 ${step.stepId} 使用了不合法的 actionType：「${step.actionType}」`,
          ).toBe(true);

          expect(
            step.actorLabel.trim().length,
            `板子 ${board.id} ${nightName} 步驟 ${step.stepId} 缺少 actorLabel`,
          ).toBeGreaterThan(0);
          expect(
            step.openPrompt.trim().length,
            `板子 ${board.id} ${nightName} 步驟 ${step.stepId} 缺少 openPrompt`,
          ).toBeGreaterThan(0);
          expect(
            step.actionPrompt.trim().length,
            `板子 ${board.id} ${nightName} 步驟 ${step.stepId} 缺少 actionPrompt`,
          ).toBeGreaterThan(0);
          expect(
            step.closePrompt.trim().length,
            `板子 ${board.id} ${nightName} 步驟 ${step.stepId} 缺少 closePrompt`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('5. 【全板子無頭模擬開局（Headless Smoke Simulation）】：全部板子皆可順利完成初始化 → 線上發牌 → 第一晚 → 天亮與熊咆哮判定 → 第二晚推進', () => {
    for (let idx = 0; idx < ALL_BOARDS.length; idx += 1) {
      const board = ALL_BOARDS[idx];
      const rng = createSeededRng(20261123 + idx * 97);

      // 重置狀態並選擇板子
      localStorage.clear();
      useGameStore.getState().restartGame({ keepNicknames: false });
      useGameStore.getState().selectBoard(board.id);

      let state = useGameStore.getState();
      expect(state.selectedBoardId, `板子 ${board.id} 選擇失敗`).toBe(board.id);
      expect(state.seats, `板子 ${board.id} 初始化座位數錯誤`).toHaveLength(board.playerCount);

      // 切換為線上發牌並執行發牌
      state.updateHostMode({
        judgeMode: 'physical_judge',
        dealMode: 'online_deal',
        controlMode: 'central_control',
      });
      const dealResult = useGameStore.getState().dealOnlineRoles(rng);
      expect(
        dealResult.ok,
        `板子 ${board.id} (${board.name}) 線上發牌失敗：${dealResult.errors.join(' ')}`,
      ).toBe(true);

      state = useGameStore.getState();
      for (const seat of state.seats) {
        expect(seat.roleId, `板子 ${board.id} 座位 ${seat.seatNumber} 未分配角色`).not.toBeNull();
        expect(ROLES_BY_ID[seat.roleId!]).toBeDefined();
      }

      // 開局 → 傳閱確認身分 → 進入第一晚
      const startResult = useGameStore.getState().startGame();
      expect(
        startResult.ok,
        `板子 ${board.id} (${board.name}) startGame 失敗：${startResult.errors.join(' ')}`,
      ).toBe(true);
      expect(useGameStore.getState().phase).toBe('pass_and_reveal');

      for (const seat of useGameStore.getState().seats) {
        useGameStore.getState().confirmPassRevealSeat(seat.seatNumber);
      }
      const revealResult = useGameStore.getState().completePassAndReveal();
      expect(
        revealResult.ok,
        `板子 ${board.id} (${board.name}) completePassAndReveal 失敗：${revealResult.reason ?? ''}`,
      ).toBe(true);

      state = useGameStore.getState();
      expect(state.phase).toBe('night');
      expect(state.round).toBe(1);

      // 第一晚：逐步推進所有步驟（若含機械狼則填入合法學習目標）
      const night1Steps = getNightSteps(board, 1);
      const mechSeat = state.seats.find((s) => s.roleId === 'mech_wolf');
      const nonMechSeat = state.seats.find((s) => s.roleId !== 'mech_wolf');

      for (let stepIdx = 0; stepIdx < night1Steps.length; stepIdx += 1) {
        const step = night1Steps[stepIdx];
        expect(useGameStore.getState().currentStepIndex).toBe(stepIdx);

        if (step.actionType === 'mech_wolf_learn' && mechSeat && nonMechSeat) {
          useGameStore.getState().updateNightDraft({
            mechWolfLearnTarget: nonMechSeat.seatNumber,
          });
        }

        if (stepIdx < night1Steps.length - 1) {
          useGameStore.getState().nextNightStep();
        }
      }

      // 第一晚結算 → 天亮公告與熊咆哮判定
      useGameStore.getState().finishNight();
      state = useGameStore.getState();
      expect(state.nightHistory).toHaveLength(1);
      expect(['day_announcement', 'game_over']).toContain(state.phase);

      const bearSeat = state.seats.find((s) => s.roleId === 'bear');
      if (bearSeat) {
        expect(
          state.lastBearRoar,
          `含熊板子 ${board.id} (${board.name}) 第一晚天亮缺少熊咆哮判定結果`,
        ).not.toBeNull();
        expect(state.lastBearRoar!.bearSeat).toBe(bearSeat.seatNumber);
        expect(typeof state.lastBearRoar!.roared).toBe('boolean');
        expect(state.lastBearRoar!.reason.trim().length).toBeGreaterThan(0);
      } else {
        expect(state.lastBearRoar).toBeNull();
      }

      // 若未於第一晚結束，模擬跳過開槍 → 白天投票 → 推進至第二晚並走完第二晚所有步驟
      if (state.phase === 'day_announcement') {
        for (const shooter of [...state.pendingShooters]) {
          useGameStore.getState().skipShoot(shooter.seatNumber);
        }

        useGameStore.getState().proceedToDayVote();
        expect(useGameStore.getState().phase).toBe('day_vote');

        useGameStore.getState().advanceToNextNight();
        state = useGameStore.getState();
        expect(state.phase).toBe('night');
        expect(state.round).toBe(2);
        expect(state.currentStepIndex).toBe(0);

        const night2Steps = getNightSteps(board, 2);
        for (let stepIdx = 0; stepIdx < night2Steps.length; stepIdx += 1) {
          expect(useGameStore.getState().currentStepIndex).toBe(stepIdx);
          if (stepIdx < night2Steps.length - 1) {
            useGameStore.getState().nextNightStep();
          }
        }

        useGameStore.getState().finishNight();
        state = useGameStore.getState();
        expect(state.nightHistory).toHaveLength(2);
        expect(['day_announcement', 'game_over']).toContain(state.phase);
      }
    }
  });
});
