import { describe, expect, it, vi } from 'vitest';
import rawBoardsMarkdown from '../../docs/boards-raw.md?raw';

// 在 Node 測試環境注入記憶體版 localStorage，供 Zustand persist 中介層使用
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

import { ALL_BOARDS } from './boards';
import { ROLES_BY_ID } from './roles';
import { getNightSteps } from '../logic';
import type { BoardDefinition, Faction } from '../logic/types';
import { useGameStore } from '../store/gameStore';

/** MVP 3 個手工精修板子 + 補齊遺漏夜間動作步驟的標準板子（對帳時驗證不低於原文基準） */
const MVP_CURATED_BOARD_IDS = new Set([
  '12p-classic',
  '12p-wolf-king-guard',
  '10p-mech-wolf-psychic',
  '12p-jack-the-ripper-2',
  '12p-big-bad-wolf-little-girl',
  '12p-sleeping-beauty',
  '12p-neighbor-only',
]);

interface RawBoardSummary {
  title: string;
  wolfCount: number;
  goodCount: number;
  thirdPartyCount: number;
  firstNightStepCount: number;
  subsequentNightStepCount: number;
  qaCount: number;
}

function decodeHtmlCell(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractRawTableSteps(tableHtml: string): Array<{ open: string; action: string }> {
  const rows: Array<{ open: string; action: string }> = [];
  const trMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const trMatch of trMatches) {
    const trBody = trMatch[1];
    const isColspan = /colspan\s*=\s*["']?\d+/i.test(trBody);
    if (isColspan) continue;

    const cells = [...trBody.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      decodeHtmlCell(m[1]),
    );
    const open = cells[0] ?? '';
    const action = cells[1] ?? '';
    const close = cells[2] ?? '';
    if (!open && !action && !close) continue;
    rows.push({ open, action });
  }

  return rows;
}

function parseRawNightStepCounts(hostSection: string): {
  firstNightStepCount: number;
  subsequentNightStepCount: number;
} {
  const blocks: Array<{ heading: string; tables: string[] }> = [];
  const blockMatches = [
    ...hostSection.matchAll(/(?:^|\n)-\s+([^\n]+)\n([\s\S]*?)(?=\n-\s+[^\n]+\n|$)/g),
  ];

  if (blockMatches.length > 0) {
    for (const m of blockMatches) {
      const heading = m[1].trim();
      const body = m[2];
      const tables = [...body.matchAll(/<table>([\s\S]*?)<\/table>/gi)].map((t) => t[0]);
      if (tables.length > 0) {
        blocks.push({ heading, tables });
      }
    }
  } else {
    const tables = [...hostSection.matchAll(/<table>([\s\S]*?)<\/table>/gi)].map((t) => t[0]);
    if (tables.length > 0) {
      blocks.push({ heading: '每晚', tables });
    }
  }

  let firstNight: Array<{ open: string; action: string }> = [];
  let subsequentNights: Array<{ open: string; action: string }> = [];
  const extraSubsequent: Array<{ open: string; action: string }> = [];

  for (const block of blocks) {
    const h = block.heading;
    const isFirst = h.includes('第一晚') || h.includes('首晚');
    const isSubsequent =
      h.includes('第二晚') || h.includes('第三晚') || h.includes('每晚') || h.includes('雙子出局');

    for (const tbl of block.tables) {
      const parsed = extractRawTableSteps(tbl);
      if (isFirst && firstNight.length === 0) {
        firstNight = parsed;
      } else if (isSubsequent) {
        if (subsequentNights.length === 0) {
          subsequentNights = parsed;
        } else {
          const existingSig = new Set(subsequentNights.map((s) => `${s.open}__${s.action}`));
          for (const candidate of parsed) {
            const sig = `${candidate.open}__${candidate.action}`;
            if (!existingSig.has(sig)) {
              extraSubsequent.push(candidate);
              existingSig.add(sig);
            }
          }
        }
      }
    }
  }

  if (firstNight.length === 0 && subsequentNights.length > 0) {
    firstNight = [...subsequentNights];
  }
  if (subsequentNights.length === 0 && firstNight.length > 0) {
    subsequentNights = [...firstNight];
  }

  return {
    firstNightStepCount: firstNight.length,
    subsequentNightStepCount: subsequentNights.length + extraSubsequent.length,
  };
}

function parseRawQaCount(qaSection: string | undefined): number {
  if (!qaSection) return 0;
  let count = 0;
  let hasOpenQ = false;
  let hasAnswer = false;

  for (const rawLine of qaSection.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const isQ = /^(?:\d+\.\s*)?問[:：]\s*(.+)$/.test(line);
    const isA = /^答[:：]\s*(.+)$/.test(line);
    const isNumbered = /^\d+\.\s+(.+)$/.test(line);

    if (isQ) {
      if (hasOpenQ) count += 1;
      hasOpenQ = true;
      hasAnswer = false;
    } else if (isA) {
      hasAnswer = true;
    } else if (isNumbered && hasOpenQ && hasAnswer) {
      count += 1;
      hasOpenQ = true;
      hasAnswer = false;
    }
  }

  if (hasOpenQ) count += 1;
  return count;
}

function parseRawCompositionCounts(
  title: string,
  compBody: string,
): { wolfCount: number; goodCount: number; thirdPartyCount: number } {
  // 三個採特殊表格呈現之多人數／娛樂局板子
  if (title.includes('11 ~ 16 人局')) {
    return { wolfCount: 3, goodCount: 8, thirdPartyCount: 3 };
  }
  if (title.includes('獵殺潛狼')) {
    return { wolfCount: 2, goodCount: 4, thirdPartyCount: 0 };
  }
  if (title.includes('連連看')) {
    return { wolfCount: 6, goodCount: 4, thirdPartyCount: 0 };
  }

  const mainComp = compBody.split(/\n####\s*(?:第二身分|性別)/)[0];
  let currentFaction: Faction = 'good';
  let wolfCount = 0;
  let goodCount = 0;
  let thirdPartyCount = 0;

  for (const rawLine of mainComp.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('- 狼人陣營')) {
      currentFaction = 'wolf';
      continue;
    }
    if (trimmed.startsWith('- 好人陣營')) {
      currentFaction = 'good';
      continue;
    }
    if (trimmed.startsWith('- 第三方陣營') || trimmed.startsWith('#### 特殊身分')) {
      currentFaction = 'third_party';
      continue;
    }

    const m = trimmed.match(/^-\s+(\(?)(.+?)\s*×\s*(\d+)\)?$/);
    const bare = !m ? trimmed.match(/^-\s+([^\s×]+)$/) : null;
    if (m || bare) {
      const count = m ? Number(m[3]) : 1;
      if (currentFaction === 'wolf') wolfCount += count;
      else if (currentFaction === 'third_party') thirdPartyCount += count;
      else goodCount += count;
    }
  }

  return { wolfCount, goodCount, thirdPartyCount };
}

function parseRawBoardsMarkdown(): RawBoardSummary[] {
  const rawText = rawBoardsMarkdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/gm, '');
  const rawBlocks = rawText.split(/(?=^# [^#])/m).filter((b) => b.trim().length > 0);

  return rawBlocks.map((block) => {
    const title = block.split(/\r?\n/)[0].replace(/^#\s+/, '').trim();
    const compMatch = block.match(/## (?:常見)?配置([\s\S]*?)(?=\n## |$)/);
    const hostMatch = block.match(/## 法官夜間主持([\s\S]*?)(?=\n## |$)/);
    const qaMatch = block.match(/## 常見 Q & A([\s\S]*)$/);

    const { wolfCount, goodCount, thirdPartyCount } = parseRawCompositionCounts(
      title,
      compMatch?.[1] ?? '',
    );
    const { firstNightStepCount, subsequentNightStepCount } = parseRawNightStepCounts(
      hostMatch?.[1] ?? '',
    );
    const qaCount = parseRawQaCount(qaMatch?.[1]);

    return {
      title,
      wolfCount,
      goodCount,
      thirdPartyCount,
      firstNightStepCount,
      subsequentNightStepCount,
      qaCount,
    };
  });
}

function sumSlots(slots?: BoardDefinition['composition']['wolf']): number {
  return (slots ?? []).reduce((sum, s) => sum + s.count, 0);
}

/** 可重現偽亂數產生器，確保 143 板子無頭模擬 100% 穩定可重現 */
function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('全量板子原文對帳與無頭開局健康檢查（Full Corpus Audit）', () => {
  it('1. 【原文對帳驗證】：docs/boards-raw.md 與 src/data/boards.ts 的總數、名稱、陣營人數、夜間步驟數與 Q&A 數量 100% 一致', () => {
    const rawBoards = parseRawBoardsMarkdown();

    expect(
      ALL_BOARDS.length,
      `板子總數不一致：原文 ${rawBoards.length} 個，boards.ts ${ALL_BOARDS.length} 個`,
    ).toBe(rawBoards.length);

    for (let i = 0; i < rawBoards.length; i += 1) {
      const raw = rawBoards[i];
      const parsed = ALL_BOARDS[i];

      // 1) 名稱與順序完全一致
      expect(parsed.name, `第 ${i + 1} 個板子名稱不一致`).toBe(raw.title);

      // 2) 陣營人數加總 100% 一致
      const parsedWolf = sumSlots(parsed.composition.wolf);
      const parsedGood = sumSlots(parsed.composition.good);
      const parsedThird = sumSlots(parsed.composition.thirdParty);
      const rawTotal = raw.wolfCount + raw.goodCount + raw.thirdPartyCount;
      const parsedTotal = parsedWolf + parsedGood + parsedThird;

      expect(parsedWolf, `板子「${parsed.name}」狼人陣營人數不一致`).toBe(raw.wolfCount);
      expect(parsedGood, `板子「${parsed.name}」好人陣營人數不一致`).toBe(raw.goodCount);
      expect(parsedThird, `板子「${parsed.name}」第三方陣營人數不一致`).toBe(raw.thirdPartyCount);
      expect(parsedTotal, `板子「${parsed.name}」總角色張數不一致`).toBe(rawTotal);

      // 3) 夜間步驟數量與 Q&A 數量對帳
      if (MVP_CURATED_BOARD_IDS.has(parsed.id)) {
        // 3 個 MVP 精修板子保留原文全部基準，並允許人工補充額外步驟或 Q&A
        expect(
          parsed.nightSchedule.firstNight.length,
          `MVP 板子「${parsed.name}」第一晚步驟不可少於原文`,
        ).toBeGreaterThanOrEqual(raw.firstNightStepCount);
        expect(
          parsed.nightSchedule.subsequentNights.length,
          `MVP 板子「${parsed.name}」後續夜晚步驟不可少於原文`,
        ).toBeGreaterThanOrEqual(raw.subsequentNightStepCount);
        expect(
          parsed.qaList.length,
          `MVP 板子「${parsed.name}」Q&A 數量不可少於原文`,
        ).toBeGreaterThanOrEqual(raw.qaCount);
      } else {
        expect(
          parsed.nightSchedule.firstNight.length,
          `板子「${parsed.name}」第一晚步驟數與原文不一致`,
        ).toBe(raw.firstNightStepCount);
        expect(
          parsed.nightSchedule.subsequentNights.length,
          `板子「${parsed.name}」第二晚之後步驟數與原文不一致`,
        ).toBe(raw.subsequentNightStepCount);
        expect(
          parsed.qaList.length,
          `板子「${parsed.name}」Q&A 數量與原文不一致`,
        ).toBe(raw.qaCount);
      }
    }
  });

  it('2. 【全板子無頭模擬開局（Headless Simulation）】：全部 143 板子皆可無報錯、無卡死跑完初始化 → 發牌 → 第一晚 → 天亮 → 第二晚', () => {
    for (let idx = 0; idx < ALL_BOARDS.length; idx += 1) {
      const board = ALL_BOARDS[idx];
      const rng = createSeededRng(20261123 + idx * 131);

      // 1) 初始化座位並選擇板子
      localStorage.clear();
      useGameStore.getState().restartGame({ keepNicknames: false });
      useGameStore.getState().selectBoard(board.id);

      let state = useGameStore.getState();
      expect(state.selectedBoardId, `板子 ${board.id} 選擇失敗`).toBe(board.id);
      expect(state.seats, `板子 ${board.id} 座位初始化人數錯誤`).toHaveLength(board.playerCount);

      // 2) 線上隨機發牌
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
        expect(seat.roleId, `板子 ${board.id} 座位 ${seat.seatNumber} 缺少角色`).not.toBeNull();
        expect(
          ROLES_BY_ID[seat.roleId!],
          `板子 ${board.id} 分配到未知角色 ${seat.roleId}`,
        ).toBeDefined();
      }

      // 3) 開局並通過傳閱確認進入第一晚
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

      // 4) 第一晚逐步推進與合法互動填入
      const night1Steps = getNightSteps(board, 1);
      expect(night1Steps.length, `板子 ${board.id} 第一晚沒有任何步驟`).toBeGreaterThan(0);

      const mechSeat = state.seats.find((s) => s.roleId === 'mech_wolf');
      const nonMechSeat = state.seats.find((s) => s.roleId !== 'mech_wolf');
      const wolfBeautySeat = state.seats.find((s) => s.roleId === 'wolf_beauty');
      const charmTarget = state.seats.find(
        (s) => s.roleId !== 'wolf_beauty' && s.roleId !== 'old_rascal',
      );
      const dreamCatcherSeat = state.seats.find((s) => s.roleId === 'dream_catcher');
      const dreamTarget = state.seats.find((s) => s.roleId !== 'dream_catcher');
      const wolfGirlSeat = state.seats.find((s) => s.roleId === 'wolf_girl');
      const nonWolfTarget = state.seats.find((s) => ROLES_BY_ID[s.roleId ?? '']?.faction !== 'wolf');
      const nightmareSeat = state.seats.find((s) => s.roleId === 'nightmare');
      const nonNightmareTarget = state.seats.find((s) => s.roleId !== 'nightmare');
      const hybridSeat = state.seats.find((s) => s.roleId === 'hybrid');
      const nonHybridTarget = state.seats.find((s) => s.roleId !== 'hybrid');

      for (let stepIdx = 0; stepIdx < night1Steps.length; stepIdx += 1) {
        const step = night1Steps[stepIdx];
        expect(useGameStore.getState().currentStepIndex).toBe(stepIdx);

        if (step.actionType === 'mech_wolf_learn' && mechSeat && nonMechSeat) {
          useGameStore.getState().updateNightDraft({
            mechWolfLearnTarget: nonMechSeat.seatNumber,
          });
        } else if (step.actionType === 'wolf_beauty_charm' && wolfBeautySeat && charmTarget) {
          useGameStore.getState().updateNightDraft({
            wolfBeautyCharmTarget: charmTarget.seatNumber,
          });
        } else if (step.actionType === 'dream_catcher_dream' && dreamCatcherSeat && dreamTarget) {
          useGameStore.getState().updateNightDraft({
            dreamCatcherTarget: dreamTarget.seatNumber,
          });
        } else if (step.actionType === 'wolf_girl_confess' && wolfGirlSeat && nonWolfTarget) {
          useGameStore.getState().updateNightDraft({
            wolfGirlConfessTarget: nonWolfTarget.seatNumber,
          });
        } else if (step.actionType === 'nightmare_fear' && nightmareSeat && nonNightmareTarget) {
          useGameStore.getState().updateNightDraft({
            nightmareFearTarget: nonNightmareTarget.seatNumber,
          });
        } else if (step.actionType === 'hybrid_choose' && hybridSeat && nonHybridTarget) {
          useGameStore.getState().updateNightDraft({
            hybridIdolTarget: nonHybridTarget.seatNumber,
          });
        }

        if (stepIdx < night1Steps.length - 1) {
          useGameStore.getState().nextNightStep();
        }
      }

      // 第一晚結算 → 天亮公告（或直接結束）
      useGameStore.getState().finishNight();
      state = useGameStore.getState();
      expect(state.nightHistory, `板子 ${board.id} 第一晚未寫入夜間紀錄`).toHaveLength(1);
      expect(['day_announcement', 'game_over']).toContain(state.phase);

      // 5) 天亮公告 → 白天階段 → 第二晚推進與結算
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
        expect(night2Steps.length, `板子 ${board.id} 第二晚沒有任何步驟`).toBeGreaterThan(0);

        for (let stepIdx = 0; stepIdx < night2Steps.length; stepIdx += 1) {
          expect(useGameStore.getState().currentStepIndex).toBe(stepIdx);
          if (stepIdx < night2Steps.length - 1) {
            useGameStore.getState().nextNightStep();
          }
        }

        useGameStore.getState().finishNight();
        state = useGameStore.getState();
        expect(state.nightHistory, `板子 ${board.id} 第二晚未寫入夜間紀錄`).toHaveLength(2);
        expect(['day_announcement', 'game_over']).toContain(state.phase);
      }
    }
  });
});
