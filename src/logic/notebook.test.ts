import { describe, expect, it } from 'vitest';
import {
  buildNotebookStages,
  createInitialNotebookState,
  formatNotebookExportText,
  hasNotebookContent,
  seatHasGridNote,
  setNotebookGridCell,
} from './notebook';
import type { PlayerSeat } from './types';

const SAMPLE_SEATS: PlayerSeat[] = [
  { seatNumber: 1, nickname: '阿明', roleId: 'wolf', isAlive: true },
  { seatNumber: 2, nickname: '', roleId: 'seer', isAlive: true },
  { seatNumber: 3, nickname: '小美', roleId: 'witch', isAlive: false, deathRound: 1 },
];

describe('玩家雙模式筆記本純邏輯（notebook.ts）', () => {
  it('依據天數與警長開關自動生成階段列', () => {
    const withSheriff = buildNotebookStages({ round: 2, enableSheriff: true });
    expect(withSheriff.map((s) => s.key)).toEqual(['pre_game', 'sheriff', 'day_1', 'day_2']);
    expect(withSheriff[0].label).toBe('抿牌階段');
    expect(withSheriff[1].label).toBe('警上發言');
    expect(withSheriff[2].label).toBe('第一天白天');
    expect(withSheriff[3].label).toBe('第二天白天');

    const withoutSheriff = buildNotebookStages({ round: 1, enableSheriff: false });
    expect(withoutSheriff.map((s) => s.key)).toEqual(['pre_game', 'day_1']);

    // 即使關閉警長或 round 較小，若既有筆記已有資料仍會保留該階段列
    const preserved = buildNotebookStages({
      round: 1,
      enableSheriff: false,
      existingGridCells: {
        sheriff: { 1: '警上起跳預言家' },
        day_3: { 2: '歸票 1 號' },
      },
    });
    expect(preserved.map((s) => s.key)).toEqual([
      'pre_game',
      'sheriff',
      'day_1',
      'day_2',
      'day_3',
    ]);
  });

  it('支援不可變更新表格儲存格、清空自動裁剪與內容偵測', () => {
    const initial = createInitialNotebookState('grid');
    expect(hasNotebookContent(initial)).toBe(false);
    expect(seatHasGridNote(initial, 1)).toBe(false);

    const updated = setNotebookGridCell(initial, 'pre_game', 1, '表情緊張偏狼');
    expect(initial.gridCells).toEqual({});
    expect(updated.gridCells.pre_game[1]).toBe('表情緊張偏狼');
    expect(hasNotebookContent(updated)).toBe(true);
    expect(seatHasGridNote(updated, 1)).toBe(true);
    expect(seatHasGridNote(updated, 2)).toBe(false);

    // 清空該格後自動移除空的 stageKey
    const cleared = setNotebookGridCell(updated, 'pre_game', 1, '');
    expect(cleared.gridCells).toEqual({});
    expect(hasNotebookContent(cleared)).toBe(false);
  });

  it('將空白自由筆記與結構化表格筆記格式化為清晰匯出純文字', () => {
    const emptyText = formatNotebookExportText(
      createInitialNotebookState(),
      SAMPLE_SEATS,
      '12 人局 - 經典',
    );
    expect(emptyText).toContain('【個人筆記本】12 人局 - 經典');
    expect(emptyText).toContain('尚無筆記內容');

    let nb = createInitialNotebookState('freeform');
    nb = { ...nb, freeformText: '2 號真預言家，3 號銀水偏女巫' };
    nb = setNotebookGridCell(nb, 'pre_game', 1, '抿牌像狼');
    nb = setNotebookGridCell(nb, 'sheriff', 2, '起跳發 3 號金水');
    nb = setNotebookGridCell(nb, 'day_1', 3, '認女巫救 2 號');

    const exported = formatNotebookExportText(nb, SAMPLE_SEATS, '12 人局 - 經典', {
      round: 1,
      enableSheriff: true,
    });

    expect(exported).toContain('【個人筆記本】12 人局 - 經典');
    expect(exported).toContain('■ 自由筆記');
    expect(exported).toContain('2 號真預言家，3 號銀水偏女巫');
    expect(exported).toContain('■ 階段 × 座號筆記');
    expect(exported).toContain('[抿牌階段]');
    expect(exported).toContain('- 1 號（阿明）：抿牌像狼');
    expect(exported).toContain('[警上發言]');
    expect(exported).toContain('- 2 號：起跳發 3 號金水');
    expect(exported).toContain('[第一天白天]');
    expect(exported).toContain('- 3 號（小美）：認女巫救 2 號');
  });
});
