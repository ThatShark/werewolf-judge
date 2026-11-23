import { useMemo, useRef, useState } from 'react';
import { getBoardById } from '../../data/boards';
import {
  buildNotebookStages,
  formatNotebookExportText,
  hasNotebookContent,
  seatHasGridNote,
} from '../../logic/notebook';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from './ConfirmModal';
import { SlideDrawer } from './SlideDrawer';

interface NotebookDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotebookDrawer({ open, onClose }: NotebookDrawerProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const notebook = useGameStore((s) => s.notebook);
  const setNotebookMode = useGameStore((s) => s.setNotebookMode);
  const setNotebookFreeformText = useGameStore((s) => s.setNotebookFreeformText);
  const setNotebookGridCell = useGameStore((s) => s.setNotebookGridCell);
  const clearNotebook = useGameStore((s) => s.clearNotebook);

  const [copied, setCopied] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [highlightedSeat, setHighlightedSeat] = useState<number | null>(null);

  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const board = getBoardById(selectedBoardId);
  const stages = useMemo(
    () =>
      buildNotebookStages({
        round,
        enableSheriff: ruleOverrides.enableSheriff,
        existingGridCells: notebook.gridCells,
      }),
    [round, ruleOverrides.enableSheriff, notebook.gridCells],
  );

  const hasContent = useMemo(() => hasNotebookContent(notebook), [notebook]);

  const exportText = useMemo(
    () =>
      formatNotebookExportText(notebook, seats, board?.name, {
        round,
        enableSheriff: ruleOverrides.enableSheriff,
      }),
    [notebook, seats, board?.name, round, ruleOverrides.enableSheriff],
  );

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = exportText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleJumpToSeat = (seatNumber: number) => {
    setHighlightedSeat(seatNumber);
    const rowEl = rowRefs.current[seatNumber];
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.setTimeout(() => {
      setHighlightedSeat((prev) => (prev === seatNumber ? null : prev));
    }, 1500);
  };

  const isFreeform = notebook.mode === 'freeform';

  return (
    <>
      <SlideDrawer
        open={open}
        onClose={onClose}
        title="玩家雙模式筆記本"
        subtitle="自動儲存於本機 · 重整不遺失"
        placement="bottom"
      >
        <div className="space-y-3.5 pb-2">
          {/* 模式切換分頁 */}
          <div
            role="tablist"
            aria-label="筆記本模式切換"
            className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isFreeform}
              onClick={() => setNotebookMode('freeform')}
              className={`min-h-12 rounded-xl px-3 text-sm font-bold transition active:scale-[0.98] ${
                isFreeform
                  ? 'border border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              📝 全空白筆記
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isFreeform}
              onClick={() => setNotebookMode('grid')}
              className={`min-h-12 rounded-xl px-3 text-sm font-bold transition active:scale-[0.98] ${
                !isFreeform
                  ? 'border border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              📊 階段 × 座號表格
            </button>
          </div>

          {/* 模式一：全空白自由文字筆記 */}
          {isFreeform ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>自由記錄抿牌、發言邏輯、站邊與票型</span>
                <span>{notebook.freeformText.length} 字</span>
              </div>
              <textarea
                value={notebook.freeformText}
                onChange={(e) => setNotebookFreeformText(e.target.value)}
                rows={10}
                placeholder="例：&#10;• 警上 3 號起跳預言家發 7 號查殺，9 號對跳給 5 號金水&#10;• 2 號發言偏匪、6 號像女巫..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-base leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          ) : seats.length === 0 ? (
            /* 尚未選擇板子時的表格空狀態 */
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
              <p className="text-sm font-bold text-slate-200">尚未建立座位表</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                請先選擇板子以自動生成 1～N 號玩家表格，或切換至「全空白筆記」先行記錄。
              </p>
              <button
                type="button"
                onClick={() => setNotebookMode('freeform')}
                className="mt-3 min-h-12 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
              >
                切換至全空白筆記
              </button>
            </div>
          ) : (
            /* 模式二：階段 × 座號結構化表格 */
            <div className="space-y-3">
              {/* 座號快速定位列 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>座號快速定位（橫向可滑動查看各階段）</span>
                  <span>{stages.length} 個階段</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {seats.map((seat) => {
                    const hasNote = seatHasGridNote(notebook, seat.seatNumber);
                    const isHighlighted = highlightedSeat === seat.seatNumber;
                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        onClick={() => handleJumpToSeat(seat.seatNumber)}
                        className={`relative min-h-10 shrink-0 rounded-xl border px-3 text-xs font-bold transition active:scale-95 ${
                          isHighlighted
                            ? 'border-amber-400 bg-amber-500/25 text-amber-100'
                            : !seat.isAlive
                              ? 'border-slate-800 bg-slate-950/60 text-slate-500'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        {seat.seatNumber} 號
                        {hasNote && (
                          <span
                            aria-label="已有筆記"
                            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 橫向可捲動表格 */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/95 text-xs font-bold text-slate-300">
                      <th className="sticky left-0 z-10 w-24 border-r border-slate-800 bg-slate-900 px-2.5 py-2.5">
                        座號
                      </th>
                      {stages.map((stage) => (
                        <th
                          key={stage.key}
                          className="min-w-[136px] border-r border-slate-800/70 px-2.5 py-2.5 last:border-r-0"
                        >
                          <div className="text-amber-300">{stage.shortLabel}</div>
                          <div className="text-[11px] font-medium text-slate-400">
                            {stage.label}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {seats.map((seat) => {
                      const isSheriff =
                        sheriffState.badgeStatus === 'active' &&
                        sheriffState.sheriffSeat === seat.seatNumber;
                      const isHighlighted = highlightedSeat === seat.seatNumber;

                      return (
                        <tr
                          key={seat.seatNumber}
                          ref={(el) => {
                            rowRefs.current[seat.seatNumber] = el;
                          }}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-amber-500/15'
                              : !seat.isAlive
                                ? 'bg-slate-950/50'
                                : 'bg-slate-950'
                          }`}
                        >
                          <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-900/95 px-2.5 py-2 align-middle">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-sm font-extrabold ${
                                  seat.isAlive ? 'text-slate-100' : 'text-slate-500 line-through'
                                }`}
                              >
                                {seat.seatNumber}號
                              </span>
                              {isSheriff && (
                                <span title="警長" className="text-xs">
                                  👮
                                </span>
                              )}
                              {!seat.isAlive && (
                                <span className="rounded bg-rose-950/80 px-1 py-0.5 text-[10px] font-bold text-rose-300">
                                  出局
                                </span>
                              )}
                            </div>
                            {seat.nickname.trim() && (
                              <div className="mt-0.5 max-w-[78px] truncate text-[11px] text-slate-400">
                                {seat.nickname.trim()}
                              </div>
                            )}
                          </td>

                          {stages.map((stage) => {
                            const cellValue =
                              notebook.gridCells[stage.key]?.[seat.seatNumber] ?? '';
                            return (
                              <td
                                key={stage.key}
                                className="border-r border-slate-800/60 p-1.5 align-top last:border-r-0"
                              >
                                <input
                                  type="text"
                                  value={cellValue}
                                  onChange={(e) =>
                                    setNotebookGridCell(
                                      stage.key,
                                      seat.seatNumber,
                                      e.target.value,
                                    )
                                  }
                                  aria-label={`${seat.seatNumber} 號 ${stage.label}筆記`}
                                  placeholder="標記身分／發言..."
                                  className="min-h-11 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:bg-slate-950 focus:outline-none"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 底部動作列 */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopyNotes}
              className={`min-h-12 flex-1 rounded-xl border px-4 text-sm font-extrabold transition active:scale-[0.98] ${
                copied
                  ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                  : 'border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
              }`}
            >
              {copied ? '✓ 已複製筆記內容！' : '📋 一鍵複製筆記'}
            </button>

            <button
              type="button"
              disabled={!hasContent}
              onClick={() => setConfirmClearOpen(true)}
              className="min-h-12 shrink-0 rounded-xl border border-rose-500/40 bg-rose-950/45 px-4 text-sm font-bold text-rose-200 transition hover:bg-rose-900/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              🗑️ 清空
            </button>
          </div>
        </div>
      </SlideDrawer>

      <ConfirmModal
        open={confirmClearOpen}
        title="確定清空目前所有筆記？"
        description="將同時清除「全空白筆記」與「階段 × 座號表格」內的所有文字紀錄，此操作無法復原。"
        confirmLabel="確認清空筆記"
        tone="danger"
        onConfirm={() => {
          clearNotebook('all');
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </>
  );
}
