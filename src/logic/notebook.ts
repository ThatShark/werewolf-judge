import type {
  NotebookMode,
  NotebookStageColumn,
  NotebookState,
  PlayerSeat,
} from './types';

export interface BuildNotebookStagesOptions {
  round: number;
  enableSheriff: boolean;
  existingGridCells?: Record<string, Record<number, string>>;
}

export interface FormatNotebookExportOptions {
  round?: number;
  enableSheriff?: boolean;
}

export function createInitialNotebookState(mode: NotebookMode = 'freeform'): NotebookState {
  return {
    mode,
    freeformText: '',
    gridCells: {},
  };
}

function hasNonEmptyCellInStage(stageMap?: Record<number, string>): boolean {
  if (!stageMap) return false;
  return Object.values(stageMap).some((val) => typeof val === 'string' && val.trim().length > 0);
}

/**
 * 依據當前天數、警長開關與既有筆記資料，自動生成階段列：
 * pre_game（抿牌階段） -> sheriff（警上發言，開啟警長或已有筆記時顯示） -> day_1, day_2, ...
 */
export function buildNotebookStages(
  options: BuildNotebookStagesOptions,
): NotebookStageColumn[] {
  const { round, enableSheriff, existingGridCells } = options;
  const stages: NotebookStageColumn[] = [
    { key: 'pre_game', label: '抿牌階段', shortLabel: '抿牌' },
  ];

  const hasSheriffNotes = hasNonEmptyCellInStage(existingGridCells?.sheriff);
  if (enableSheriff || hasSheriffNotes) {
    stages.push({ key: 'sheriff', label: '警上發言', shortLabel: '警上' });
  }

  let maxDay = Math.max(1, Math.floor(round || 1));
  if (existingGridCells) {
    for (const [key, seatMap] of Object.entries(existingGridCells)) {
      const match = /^day_(\d+)$/.exec(key);
      if (match && hasNonEmptyCellInStage(seatMap)) {
        const dayNum = Number(match[1]);
        if (dayNum > maxDay) {
          maxDay = dayNum;
        }
      }
    }
  }

  for (let day = 1; day <= maxDay; day += 1) {
    stages.push({
      key: `day_${day}`,
      label: `第 ${day} 天白天`,
      shortLabel: `D${day}`,
    });
  }

  return stages;
}

/** 不可變更新單一階段 × 座號儲存格，空字串時自動清除該格以保持資料精簡 */
export function setNotebookGridCell(
  notebook: NotebookState,
  stageKey: string,
  seatNumber: number,
  value: string,
): NotebookState {
  const prevStage = notebook.gridCells[stageKey] ?? {};
  const nextStage: Record<number, string> = { ...prevStage };

  if (value.length === 0) {
    delete nextStage[seatNumber];
  } else {
    nextStage[seatNumber] = value;
  }

  const nextGridCells: Record<string, Record<number, string>> = {
    ...notebook.gridCells,
  };

  if (Object.keys(nextStage).length === 0) {
    delete nextGridCells[stageKey];
  } else {
    nextGridCells[stageKey] = nextStage;
  }

  return {
    ...notebook,
    gridCells: nextGridCells,
  };
}

/** 檢查筆記本（自由文字或表格）是否包含任何非空白內容 */
export function hasNotebookContent(notebook?: NotebookState | null): boolean {
  if (!notebook) return false;
  if (notebook.freeformText.trim().length > 0) {
    return true;
  }
  return Object.values(notebook.gridCells ?? {}).some((stageMap) =>
    hasNonEmptyCellInStage(stageMap),
  );
}

/** 檢查特定座號在表格模式中是否已有任何筆記 */
export function seatHasGridNote(
  notebook: NotebookState,
  seatNumber: number,
): boolean {
  return Object.values(notebook.gridCells).some((stageMap) => {
    const val = stageMap?.[seatNumber];
    return typeof val === 'string' && val.trim().length > 0;
  });
}

function formatSeatLabel(seatNumber: number, seatMap: Map<number, PlayerSeat>): string {
  const seat = seatMap.get(seatNumber);
  const nickname = seat?.nickname.trim();
  return nickname ? `${seatNumber} 號（${nickname}）` : `${seatNumber} 號`;
}

/**
 * 將空白自由筆記與階段×座號結構化表格筆記整理為清晰可複製／匯出的純文字。
 */
export function formatNotebookExportText(
  notebook: NotebookState,
  seats: PlayerSeat[],
  boardName?: string,
  options?: FormatNotebookExportOptions,
): string {
  const lines: string[] = [];
  const headerTitle = boardName ? `【個人筆記本】${boardName}` : '【個人筆記本】';
  lines.push(headerTitle);

  const freeformTrimmed = notebook.freeformText.trim();
  const hasGrid = Object.values(notebook.gridCells).some((stageMap) =>
    hasNonEmptyCellInStage(stageMap),
  );

  if (!freeformTrimmed && !hasGrid) {
    lines.push('（尚無筆記內容）');
    return lines.join('\n');
  }

  if (freeformTrimmed) {
    lines.push('');
    lines.push('■ 自由筆記');
    lines.push(freeformTrimmed);
  }

  if (hasGrid) {
    const seatMap = new Map<number, PlayerSeat>();
    for (const s of seats) {
      seatMap.set(s.seatNumber, s);
    }

    const stages = buildNotebookStages({
      round: options?.round ?? 1,
      enableSheriff: options?.enableSheriff ?? true,
      existingGridCells: notebook.gridCells,
    });

    // 若 gridCells 內含有自訂或未知 stageKey，也一併保留避免遺漏
    const knownKeys = new Set(stages.map((st) => st.key));
    const extraStages: NotebookStageColumn[] = Object.keys(notebook.gridCells)
      .filter((key) => !knownKeys.has(key) && hasNonEmptyCellInStage(notebook.gridCells[key]))
      .map((key) => ({ key, label: key, shortLabel: key }));

    const allStages = [...stages, ...extraStages];

    lines.push('');
    lines.push('■ 階段 × 座號筆記');

    for (const stage of allStages) {
      const stageCells = notebook.gridCells[stage.key];
      if (!hasNonEmptyCellInStage(stageCells)) continue;

      lines.push(`[${stage.label}]`);
      const seatNumbers = Object.keys(stageCells)
        .map((k) => Number(k))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b);

      for (const seatNum of seatNumbers) {
        const content = stageCells[seatNum]?.trim();
        if (!content) continue;
        lines.push(`  - ${formatSeatLabel(seatNum, seatMap)}：${content}`);
      }
    }
  }

  return lines.join('\n');
}
