import {
  buildGameSummaryMatrix,
  buildSummaryImageFilename,
  type GameSummaryInput,
  type GameSummaryMatrix,
  type SummaryWinnerTone,
} from '../logic/gameSummaryMatrix';
import type { BoardDefinition, RoleCategory } from '../logic/types';

const SCALE = 2;
const PADDING = 28;
const LABEL_COL_W = 112;
const SECTION_GAP = 14;

const FONT_SANS =
  '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const FONT_MONO =
  'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const COLORS = {
  bgCanvas: '#0E1117',
  cardBg: '#161B24',
  headerBg: '#1D2432',
  sectionBarBg: '#19202D',
  altRowBg: '#131821',
  border: 'rgba(255, 255, 255, 0.13)',
  borderStrong: 'rgba(255, 255, 255, 0.24)',
  textPrimary: '#F3F4F6',
  textSecondary: '#A3ADBF',
  textMuted: '#6B7280',
  textDim: '#4B5563',
  wolf: '#FF6B6E',
  wolfBg: 'rgba(229, 72, 77, 0.14)',
  wolfBorder: 'rgba(229, 72, 77, 0.42)',
  god: '#3DD68C',
  godBg: 'rgba(48, 164, 108, 0.14)',
  godBorder: 'rgba(48, 164, 108, 0.42)',
  villager: '#D1D5DB',
  villagerBg: 'rgba(255, 255, 255, 0.04)',
  third: '#B6A6FF',
  thirdBg: 'rgba(158, 140, 252, 0.14)',
  thirdBorder: 'rgba(158, 140, 252, 0.42)',
  sheriff: '#F5A623',
  sheriffBg: 'rgba(245, 166, 35, 0.14)',
  sheriffBorder: 'rgba(245, 166, 35, 0.42)',
};

function getCategoryColors(category: RoleCategory): { text: string; bg: string } {
  switch (category) {
    case 'wolf':
      return { text: COLORS.wolf, bg: COLORS.wolfBg };
    case 'god':
      return { text: COLORS.god, bg: COLORS.godBg };
    case 'third_party':
      return { text: COLORS.third, bg: COLORS.thirdBg };
    case 'villager':
    default:
      return { text: COLORS.villager, bg: COLORS.villagerBg };
  }
}

function getWinnerBadgeColors(tone: SummaryWinnerTone): {
  text: string;
  bg: string;
  border: string;
} {
  switch (tone) {
    case 'good':
      return { text: COLORS.god, bg: COLORS.godBg, border: COLORS.godBorder };
    case 'wolf':
      return { text: COLORS.wolf, bg: COLORS.wolfBg, border: COLORS.wolfBorder };
    case 'third_party':
      return { text: COLORS.third, bg: COLORS.thirdBg, border: COLORS.thirdBorder };
    case 'ongoing':
      return { text: COLORS.sheriff, bg: COLORS.sheriffBg, border: COLORS.sheriffBorder };
    case 'draw':
    default:
      return { text: COLORS.textPrimary, bg: COLORS.headerBg, border: COLORS.borderStrong };
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fitTextEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  const segments = text.split(' / ');
  if (segments.length > 1) {
    const lines: string[] = [];
    let current = '';
    for (const seg of segments) {
      const candidate = current ? `${current} / ${seg}` : seg;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = seg;
        if (lines.length >= maxLines - 1) break;
      }
    }
    if (current) lines.push(current);
    return lines.slice(0, maxLines).map((line) => fitTextEllipsis(ctx, line, maxWidth));
  }

  const lines: string[] = [];
  let current = '';
  for (const ch of text) {
    const candidate = current + ch;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = ch;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines).map((line) => fitTextEllipsis(ctx, line, maxWidth));
}

function drawCellText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    font: string;
    color: string;
    align?: CanvasTextAlign;
    padX?: number;
  },
): void {
  const { font, color, align = 'center', padX = 6 } = options;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const maxW = Math.max(12, w - padX * 2);
  const clipped = fitTextEllipsis(ctx, text, maxW);
  const tx = align === 'left' ? x + padX : align === 'right' ? x + w - padX : x + w / 2;
  ctx.fillText(clipped, tx, y + h / 2);
}

/**
 * 純原生 HTML5 Canvas 2x Retina 渲染「座號矩陣復盤表」。
 */
export function renderGameSummaryCanvas(matrix: GameSummaryMatrix): HTMLCanvasElement {
  const seatCount = Math.max(matrix.players.length, 6);
  const seatColW = seatCount <= 10 ? 78 : seatCount <= 12 ? 72 : 66;
  const tableW = LABEL_COL_W + seatCount * seatColW;
  const canvasW = tableW + PADDING * 2;

  const hasSubNotes = matrix.players.some((p) => p.subNote.length > 0);
  const headerH = 66;
  const sectionBarH = 26;
  const rowH = 32;
  const roleRowH = hasSubNotes ? 48 : 36;
  const dayExileRowH = 34;
  const daySkillsRowH = 44;
  const dayElimRowH = 36;
  const footerH = 24;

  // 預先計算總高度
  let totalH = PADDING + headerH + SECTION_GAP;
  // 區塊 A：座號 / 暱稱 / 角色
  totalH += rowH + rowH + roleRowH;
  // 區塊 B：警長競選
  if (matrix.sheriff) {
    totalH += sectionBarH + rowH + matrix.sheriff.voteRows.length * rowH;
  }
  // 區塊 C：白天放逐投票
  if (matrix.dayVoteRows.length > 0) {
    totalH += sectionBarH + matrix.dayVoteRows.length * rowH;
  }
  // 區塊 D：夜間行動明細
  if (matrix.nightMatrix.rounds.length > 0) {
    totalH += SECTION_GAP + sectionBarH + rowH + matrix.nightMatrix.rows.length * rowH;
  }
  // 區塊 E：白天結果與出局總覽（白天放逐 / 技能與連帶 / 出局總覽）
  if (matrix.daySummaryColumns.length > 0) {
    totalH += SECTION_GAP + sectionBarH + rowH + dayExileRowH + daySkillsRowH + dayElimRowH;
  }
  totalH += 10 + footerH + PADDING;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(canvasW * SCALE);
  canvas.height = Math.ceil(totalH * SCALE);
  canvas.style.width = `${canvasW}px`;
  canvas.style.height = `${totalH}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('瀏覽器不支援 HTML5 Canvas 2D 繪圖');
  }
  ctx.scale(SCALE, SCALE);

  // 1. 整體背景
  ctx.fillStyle = COLORS.bgCanvas;
  ctx.fillRect(0, 0, canvasW, totalH);

  let y = PADDING;
  const x0 = PADDING;

  // 2. 頂部標題區
  drawRoundedRect(ctx, x0, y, tableW, headerH, 10);
  ctx.fillStyle = COLORS.cardBg;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 19px ${FONT_SANS}`;
  ctx.fillStyle = COLORS.textPrimary;
  ctx.fillText(
    fitTextEllipsis(ctx, matrix.header.boardTitle, tableW - 180),
    x0 + 18,
    y + 24,
  );

  ctx.font = `500 12px ${FONT_MONO}`;
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText(matrix.header.dateTimeText, x0 + 18, y + 47);

  // 獲勝陣營膠囊徽章
  const badgeColors = getWinnerBadgeColors(matrix.header.winnerTone);
  ctx.font = `700 14px ${FONT_SANS}`;
  const badgeTextW = ctx.measureText(matrix.header.winnerLabel).width;
  const badgeW = Math.max(98, badgeTextW + 28);
  const badgeH = 34;
  const badgeX = x0 + tableW - badgeW - 16;
  const badgeY = y + (headerH - badgeH) / 2;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fillStyle = badgeColors.bg;
  ctx.fill();
  ctx.strokeStyle = badgeColors.border;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  drawCellText(ctx, matrix.header.winnerLabel, badgeX, badgeY, badgeW, badgeH, {
    font: `700 14px ${FONT_SANS}`,
    color: badgeColors.text,
  });

  y += headerH + SECTION_GAP;

  // 輔助函式：繪製區塊 A+B+C 統一外框的每一列
  const seatMatrixStartY = y;
  const seatMatrixH =
    rowH +
    rowH +
    roleRowH +
    (matrix.sheriff ? sectionBarH + rowH + matrix.sheriff.voteRows.length * rowH : 0) +
    (matrix.dayVoteRows.length > 0 ? sectionBarH + matrix.dayVoteRows.length * rowH : 0);

  drawRoundedRect(ctx, x0, seatMatrixStartY, tableW, seatMatrixH, 10);
  ctx.fillStyle = COLORS.cardBg;
  ctx.fill();

  const drawSeatRowGrid = (rowY: number, h: number, bg?: string) => {
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(x0, rowY, tableW, h);
    }
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    // 橫線
    if (rowY > seatMatrixStartY) {
      ctx.beginPath();
      ctx.moveTo(x0, rowY);
      ctx.lineTo(x0 + tableW, rowY);
      ctx.stroke();
    }
    // 縱線
    ctx.beginPath();
    ctx.moveTo(x0 + LABEL_COL_W, rowY);
    ctx.lineTo(x0 + LABEL_COL_W, rowY + h);
    for (let i = 1; i < seatCount; i += 1) {
      const vx = x0 + LABEL_COL_W + i * seatColW;
      ctx.moveTo(vx, rowY);
      ctx.lineTo(vx, rowY + h);
    }
    ctx.stroke();
  };

  const drawSectionSubBar = (barY: number, title: string, rightNote?: string | null) => {
    ctx.fillStyle = COLORS.sectionBarBg;
    ctx.fillRect(x0, barY, tableW, sectionBarH);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, barY);
    ctx.lineTo(x0 + tableW, barY);
    ctx.stroke();

    drawCellText(ctx, title, x0, barY, tableW, sectionBarH, {
      font: `700 12px ${FONT_SANS}`,
      color: COLORS.textSecondary,
      align: 'left',
      padX: 12,
    });
    if (rightNote) {
      drawCellText(ctx, rightNote, x0, barY, tableW, sectionBarH, {
        font: `600 11px ${FONT_SANS}`,
        color: COLORS.sheriff,
        align: 'right',
        padX: 12,
      });
    }
  };

  // === 區塊 A：座號、暱稱、角色 ===
  // A1: 座號
  drawSeatRowGrid(y, rowH, COLORS.headerBg);
  drawCellText(ctx, '座號', x0, y, LABEL_COL_W, rowH, {
    font: `700 12px ${FONT_SANS}`,
    color: COLORS.textSecondary,
  });
  matrix.players.forEach((p, idx) => {
    const cx = x0 + LABEL_COL_W + idx * seatColW;
    const isElectedSheriff = matrix.sheriff?.electedSeat === p.seatNumber;
    const label = isElectedSheriff ? `★${p.seatCode}` : p.seatCode;
    drawCellText(ctx, label, cx, y, seatColW, rowH, {
      font: `700 13px ${FONT_MONO}`,
      color: isElectedSheriff ? COLORS.sheriff : COLORS.textPrimary,
    });
  });
  y += rowH;

  // A2: 暱稱
  drawSeatRowGrid(y, rowH, COLORS.altRowBg);
  drawCellText(ctx, '暱稱', x0, y, LABEL_COL_W, rowH, {
    font: `600 12px ${FONT_SANS}`,
    color: COLORS.textSecondary,
  });
  matrix.players.forEach((p, idx) => {
    const cx = x0 + LABEL_COL_W + idx * seatColW;
    drawCellText(ctx, p.nickname, cx, y, seatColW, rowH, {
      font: `500 11px ${FONT_SANS}`,
      color: p.isAlive ? COLORS.textPrimary : COLORS.textSecondary,
      padX: 4,
    });
  });
  y += rowH;

  // A3: 角色（陣營上色 + 小字加註）
  drawSeatRowGrid(y, roleRowH);
  drawCellText(ctx, '角色', x0, y, LABEL_COL_W, roleRowH, {
    font: `600 12px ${FONT_SANS}`,
    color: COLORS.textSecondary,
  });
  matrix.players.forEach((p, idx) => {
    const cx = x0 + LABEL_COL_W + idx * seatColW;
    const catColors = getCategoryColors(p.roleCategory);
    ctx.fillStyle = catColors.bg;
    ctx.fillRect(cx + 1, y + 1, seatColW - 2, roleRowH - 2);

    if (p.subNote) {
      drawCellText(ctx, p.roleName, cx, y + 3, seatColW, roleRowH - 18, {
        font: `700 12px ${FONT_SANS}`,
        color: catColors.text,
        padX: 3,
      });
      drawCellText(ctx, p.subNote, cx, y + roleRowH - 18, seatColW, 16, {
        font: `600 10px ${FONT_SANS}`,
        color: COLORS.sheriff,
        padX: 3,
      });
    } else {
      drawCellText(ctx, p.roleName, cx, y, seatColW, roleRowH, {
        font: `700 12px ${FONT_SANS}`,
        color: catColors.text,
        padX: 3,
      });
    }
  });
  y += roleRowH;

  // === 區塊 B：警長競選 ===
  if (matrix.sheriff) {
    const sheriffNote =
      matrix.sheriff.electedSeat != null
        ? `★ ${String(matrix.sheriff.electedSeat).padStart(2, '0')}號當選警長${matrix.sheriff.statusNote ? `（${matrix.sheriff.statusNote}）` : ''}`
        : matrix.sheriff.statusNote;
    drawSectionSubBar(y, '警長競選', sheriffNote);
    y += sectionBarH;

    // 上警列
    drawSeatRowGrid(y, rowH, COLORS.altRowBg);
    drawCellText(ctx, '上警', x0, y, LABEL_COL_W, rowH, {
      font: `600 12px ${FONT_SANS}`,
      color: COLORS.textSecondary,
    });
    matrix.sheriff.signUpCells.forEach((val, idx) => {
      const seatNum = matrix.players[idx]?.seatNumber;
      const isElected = seatNum != null && matrix.sheriff?.electedSeat === seatNum;
      const cx = x0 + LABEL_COL_W + idx * seatColW;
      if (isElected) {
        ctx.fillStyle = COLORS.sheriffBg;
        ctx.fillRect(cx + 1, y + 1, seatColW - 2, rowH - 2);
      }
      const displayText = isElected ? '★上警' : val;
      if (displayText) {
        drawCellText(ctx, displayText, cx, y, seatColW, rowH, {
          font: `${isElected ? '700' : '600'} 11px ${FONT_SANS}`,
          color:
            val === '退水*'
              ? COLORS.textSecondary
              : isElected
                ? COLORS.sheriff
                : COLORS.textPrimary,
        });
      }
    });
    y += rowH;

    // 警長投票 / PK 投票列
    matrix.sheriff.voteRows.forEach((vRow, rowIdx) => {
      drawSeatRowGrid(y, rowH, rowIdx % 2 === 1 ? COLORS.altRowBg : undefined);
      drawCellText(ctx, vRow.label, x0, y, LABEL_COL_W, rowH, {
        font: `600 12px ${FONT_SANS}`,
        color: vRow.isPk ? COLORS.sheriff : COLORS.textSecondary,
      });
      vRow.cells.forEach((cell, idx) => {
        const cx = x0 + LABEL_COL_W + idx * seatColW;
        const isNum = /^\d+$/.test(cell);
        drawCellText(ctx, cell, cx, y, seatColW, rowH, {
          font: `${isNum ? '700' : '500'} 12px ${FONT_MONO}`,
          color: isNum
            ? COLORS.textPrimary
            : cell === 'X'
              ? COLORS.textSecondary
              : COLORS.textDim,
        });
      });
      y += rowH;
    });
  }

  // === 區塊 C：白天放逐投票 ===
  if (matrix.dayVoteRows.length > 0) {
    drawSectionSubBar(y, '白天放逐投票');
    y += sectionBarH;

    matrix.dayVoteRows.forEach((vRow, rowIdx) => {
      drawSeatRowGrid(y, rowH, rowIdx % 2 === 0 ? COLORS.altRowBg : undefined);
      drawCellText(ctx, vRow.label, x0, y, LABEL_COL_W, rowH, {
        font: `600 12px ${FONT_SANS}`,
        color: vRow.isPk ? COLORS.sheriff : COLORS.textSecondary,
      });
      vRow.cells.forEach((cell, idx) => {
        const cx = x0 + LABEL_COL_W + idx * seatColW;
        const isExplode = cell === '自爆';
        const isNum = /^\d+$/.test(cell);
        if (isExplode) {
          ctx.fillStyle = COLORS.wolfBg;
          ctx.fillRect(cx + 1, y + 1, seatColW - 2, rowH - 2);
        }
        drawCellText(ctx, cell, cx, y, seatColW, rowH, {
          font: isExplode
            ? `700 11px ${FONT_SANS}`
            : `${isNum ? '700' : '500'} 12px ${FONT_MONO}`,
          color: isExplode
            ? COLORS.wolf
            : isNum
              ? COLORS.textPrimary
              : cell === 'X'
                ? COLORS.textSecondary
                : COLORS.textDim,
        });
      });
      y += rowH;
    });
  }

  // 區塊 A+B+C 外框線
  drawRoundedRect(ctx, x0, seatMatrixStartY, tableW, seatMatrixH, 10);
  ctx.strokeStyle = COLORS.borderStrong;
  ctx.lineWidth = 1;
  ctx.stroke();

  // === 區塊 D：夜間行動明細表 ===
  if (matrix.nightMatrix.rounds.length > 0) {
    y += SECTION_GAP;
    const nightStartY = y;
    const nightColCount = matrix.nightMatrix.rounds.length;
    const nightColW = (tableW - LABEL_COL_W) / nightColCount;
    const nightH = sectionBarH + rowH + matrix.nightMatrix.rows.length * rowH;

    drawRoundedRect(ctx, x0, nightStartY, tableW, nightH, 10);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();

    // 標題列
    ctx.fillStyle = COLORS.sectionBarBg;
    ctx.fillRect(x0, y, tableW, sectionBarH);
    drawCellText(ctx, '夜間行動明細', x0, y, tableW, sectionBarH, {
      font: `700 12px ${FONT_SANS}`,
      color: COLORS.textSecondary,
      align: 'left',
      padX: 12,
    });
    y += sectionBarH;

    const drawNightGrid = (rowY: number, h: number, bg?: string) => {
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(x0, rowY, tableW, h);
      }
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, rowY);
      ctx.lineTo(x0 + tableW, rowY);
      ctx.moveTo(x0 + LABEL_COL_W, rowY);
      ctx.lineTo(x0 + LABEL_COL_W, rowY + h);
      for (let i = 1; i < nightColCount; i += 1) {
        const vx = x0 + LABEL_COL_W + i * nightColW;
        ctx.moveTo(vx, rowY);
        ctx.lineTo(vx, rowY + h);
      }
      ctx.stroke();
    };

    // N1 / N2 / N3 表頭
    drawNightGrid(y, rowH, COLORS.headerBg);
    drawCellText(ctx, '角色 \\ 晚數', x0, y, LABEL_COL_W, rowH, {
      font: `600 11px ${FONT_SANS}`,
      color: COLORS.textSecondary,
    });
    matrix.nightMatrix.roundLabels.forEach((lbl, idx) => {
      const cx = x0 + LABEL_COL_W + idx * nightColW;
      drawCellText(ctx, lbl, cx, y, nightColW, rowH, {
        font: `700 12px ${FONT_MONO}`,
        color: COLORS.textPrimary,
      });
    });
    y += rowH;

    // 各角色行動列
    matrix.nightMatrix.rows.forEach((nRow, rIdx) => {
      const catColors = getCategoryColors(nRow.category);
      drawNightGrid(y, rowH, rIdx % 2 === 1 ? COLORS.altRowBg : undefined);
      ctx.fillStyle = catColors.bg;
      ctx.fillRect(x0 + 1, y + 1, LABEL_COL_W - 2, rowH - 2);
      drawCellText(ctx, nRow.label, x0, y, LABEL_COL_W, rowH, {
        font: `700 12px ${FONT_SANS}`,
        color: catColors.text,
      });

      nRow.cells.forEach((cell, cIdx) => {
        const cx = x0 + LABEL_COL_W + cIdx * nightColW;
        const isEmpty = cell === 'X' || cell === '空';
        const isWolfRow = nRow.key === 'wolf_kill';
        drawCellText(ctx, cell, cx, y, nightColW, rowH, {
          font: `${isEmpty ? '500' : '700'} 12px ${FONT_MONO}`,
          color: isEmpty
            ? COLORS.textDim
            : isWolfRow
              ? COLORS.wolf
              : COLORS.textPrimary,
          padX: 4,
        });
      });
      y += rowH;
    });

    drawRoundedRect(ctx, x0, nightStartY, tableW, nightH, 10);
    ctx.strokeStyle = COLORS.borderStrong;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // === 區塊 E：白天結果與出局總覽 ===
  if (matrix.daySummaryColumns.length > 0) {
    y += SECTION_GAP;
    const dayStartY = y;
    const dayColCount = matrix.daySummaryColumns.length;
    const dayColW = (tableW - LABEL_COL_W) / dayColCount;
    const dayH = sectionBarH + rowH + dayExileRowH + daySkillsRowH + dayElimRowH;

    drawRoundedRect(ctx, x0, dayStartY, tableW, dayH, 10);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();

    ctx.fillStyle = COLORS.sectionBarBg;
    ctx.fillRect(x0, y, tableW, sectionBarH);
    drawCellText(ctx, '白天結果與出局總覽', x0, y, tableW, sectionBarH, {
      font: `700 12px ${FONT_SANS}`,
      color: COLORS.textSecondary,
      align: 'left',
      padX: 12,
    });
    y += sectionBarH;

    const drawDayGrid = (rowY: number, h: number, bg?: string) => {
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(x0, rowY, tableW, h);
      }
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, rowY);
      ctx.lineTo(x0 + tableW, rowY);
      ctx.moveTo(x0 + LABEL_COL_W, rowY);
      ctx.lineTo(x0 + LABEL_COL_W, rowY + h);
      for (let i = 1; i < dayColCount; i += 1) {
        const vx = x0 + LABEL_COL_W + i * dayColW;
        ctx.moveTo(vx, rowY);
        ctx.lineTo(vx, rowY + h);
      }
      ctx.stroke();
    };

    // D1 / D2 / D3 表頭
    drawDayGrid(y, rowH, COLORS.headerBg);
    drawCellText(ctx, '項目 \\ 天數', x0, y, LABEL_COL_W, rowH, {
      font: `600 11px ${FONT_SANS}`,
      color: COLORS.textSecondary,
    });
    matrix.daySummaryColumns.forEach((col, idx) => {
      const cx = x0 + LABEL_COL_W + idx * dayColW;
      drawCellText(ctx, col.label, cx, y, dayColW, rowH, {
        font: `700 12px ${FONT_MONO}`,
        color: COLORS.textPrimary,
      });
    });
    y += rowH;

    // 白天放逐列（僅顯示放逐出局座號，平安日／無人放逐顯示 X）
    drawDayGrid(y, dayExileRowH);
    drawCellText(ctx, '白天放逐', x0, y, LABEL_COL_W, dayExileRowH, {
      font: `600 12px ${FONT_SANS}`,
      color: COLORS.sheriff,
    });
    matrix.daySummaryColumns.forEach((col, idx) => {
      const cx = x0 + LABEL_COL_W + idx * dayColW;
      const isNone = col.exileText === 'X';
      drawCellText(ctx, col.exileText, cx, y, dayColW, dayExileRowH, {
        font: `${isNone ? '500' : '700'} 12px ${FONT_MONO}`,
        color: isNone ? COLORS.textDim : COLORS.sheriff,
        padX: 4,
      });
    });
    y += dayExileRowH;

    // 技能 / 連帶列（支援雙行換行，單獨記錄開槍、自爆、決鬥、殉情等事件）
    drawDayGrid(y, daySkillsRowH, COLORS.altRowBg);
    drawCellText(ctx, '技能 / 連帶', x0, y, LABEL_COL_W, daySkillsRowH, {
      font: `600 12px ${FONT_SANS}`,
      color: COLORS.textSecondary,
    });
    matrix.daySummaryColumns.forEach((col, idx) => {
      const cx = x0 + LABEL_COL_W + idx * dayColW;
      const isNone = col.daySkillsText === '無';
      ctx.font = `${isNone ? '500' : '600'} 11px ${FONT_SANS}`;
      ctx.fillStyle = isNone ? COLORS.textDim : COLORS.textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = wrapTextLines(ctx, col.daySkillsText, Math.max(24, dayColW - 10), 2);
      if (lines.length === 1) {
        ctx.fillText(lines[0], cx + dayColW / 2, y + daySkillsRowH / 2);
      } else {
        ctx.fillText(lines[0], cx + dayColW / 2, y + daySkillsRowH / 2 - 8);
        ctx.fillText(lines[1], cx + dayColW / 2, y + daySkillsRowH / 2 + 8);
      }
    });
    y += daySkillsRowH;

    // 出局總覽列
    drawDayGrid(y, dayElimRowH);
    drawCellText(ctx, '出局總覽', x0, y, LABEL_COL_W, dayElimRowH, {
      font: `700 12px ${FONT_SANS}`,
      color: COLORS.wolf,
    });
    matrix.daySummaryColumns.forEach((col, idx) => {
      const cx = x0 + LABEL_COL_W + idx * dayColW;
      const isPeace = col.eliminatedText === '平安';
      drawCellText(ctx, col.eliminatedText, cx, y, dayColW, dayElimRowH, {
        font: `700 12px ${FONT_MONO}`,
        color: isPeace ? COLORS.god : COLORS.wolf,
        padX: 4,
      });
    });
    y += dayElimRowH;

    drawRoundedRect(ctx, x0, dayStartY, tableW, dayH, 10);
    ctx.strokeStyle = COLORS.borderStrong;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 底部浮水印
  y += 10;
  drawCellText(ctx, '狼人殺法官輔助 · 座號矩陣復盤表', x0, y, tableW, footerH, {
    font: `500 11px ${FONT_SANS}`,
    color: COLORS.textMuted,
    align: 'right',
    padX: 4,
  });

  return canvas;
}

export interface GeneratedSummaryImage {
  blob: Blob;
  dataUrl: string;
  filename: string;
  matrix: GameSummaryMatrix;
}

export async function generateGameSummaryImage(
  state: GameSummaryInput,
  board?: BoardDefinition,
  now: Date = new Date(),
): Promise<GeneratedSummaryImage> {
  const matrix = buildGameSummaryMatrix(state, board, now);
  const canvas = renderGameSummaryCanvas(matrix);
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('無法產生復盤圖片 PNG'));
    }, 'image/png');
  });
  const filename = buildSummaryImageFilename(board?.name, now);
  return { blob, dataUrl, filename, matrix };
}

export function triggerPngDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canNativeShareFile(blob: Blob, filename: string): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    return typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : false;
  } catch {
    return false;
  }
}

export async function shareSummaryPngNative(blob: Blob, filename: string): Promise<boolean> {
  if (!canNativeShareFile(blob, filename)) return false;
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    await navigator.share({
      files: [file],
      title: filename.replace(/\.png$/i, ''),
    });
    return true;
  } catch (err) {
    // 使用者主動取消分享不視為錯誤
    if (err instanceof DOMException && err.name === 'AbortError') {
      return true;
    }
    return false;
  }
}
