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
import { formatSeatNum } from './displayHelpers';

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
      <SlideDrawer open={open} onClose={onClose} title="筆記本" placement="bottom">
        <div className="space-y-3">
          {/* 模式切換 */}
          <div
            role="tablist"
            aria-label="筆記本模式"
            className="grid grid-cols-2 gap-1 rounded-md border border-subtle bg-canvas p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isFreeform}
              onClick={() => setNotebookMode('freeform')}
              className={`min-h-11 rounded-md text-[14px] font-semibold transition ${
                isFreeform ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              自由筆記
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isFreeform}
              onClick={() => setNotebookMode('grid')}
              className={`min-h-11 rounded-md text-[14px] font-semibold transition ${
                !isFreeform ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              座號表格
            </button>
          </div>

          {isFreeform ? (
            <div className="space-y-1.5">
              <div className="flex justify-end text-[12px] tabular-nums text-muted">
                {notebook.freeformText.length} 字
              </div>
              <textarea
                value={notebook.freeformText}
                onChange={(e) => setNotebookFreeformText(e.target.value)}
                rows={10}
                placeholder="記錄發言、站邊與票型..."
                className="w-full rounded-md border border-subtle bg-canvas px-3 py-2.5 text-[14px] leading-5 text-primary placeholder:text-muted focus:border-sheriff focus:outline-none"
              />
            </div>
          ) : seats.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[14px] text-secondary">尚未建立座位表。</p>
              <button
                type="button"
                onClick={() => setNotebookMode('freeform')}
                className="mt-3 min-h-11 rounded-md border border-subtle bg-canvas px-4 text-[12px] font-semibold text-primary hover:border-strong"
              >
                切換至自由筆記
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {seats.map((seat) => {
                  const hasNote = seatHasGridNote(notebook, seat.seatNumber);
                  const isHighlighted = highlightedSeat === seat.seatNumber;
                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      onClick={() => handleJumpToSeat(seat.seatNumber)}
                      className={`relative min-h-10 shrink-0 rounded-md px-2.5 text-[12px] font-semibold tabular-nums transition ${
                        isHighlighted
                          ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                          : !seat.isAlive
                            ? 'border border-subtle bg-canvas text-muted'
                            : 'border border-subtle bg-canvas text-secondary hover:border-strong hover:text-primary'
                      }`}
                    >
                      {formatSeatNum(seat.seatNumber)}
                      {hasNote && (
                        <span
                          aria-label="已有筆記"
                          className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sheriff"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="overflow-x-auto rounded-md border border-subtle bg-canvas">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-subtle bg-surface text-[12px] font-semibold text-secondary">
                      <th className="sticky left-0 z-10 w-20 border-r border-subtle bg-surface px-2.5 py-2">
                        座號
                      </th>
                      {stages.map((stage) => (
                        <th
                          key={stage.key}
                          className="min-w-[132px] border-r border-subtle px-2.5 py-2 last:border-r-0"
                        >
                          <div className="text-sheriff">{stage.shortLabel}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
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
                          className={isHighlighted ? 'bg-sheriff-tint' : 'bg-canvas'}
                        >
                          <td className="sticky left-0 z-10 border-r border-subtle bg-surface px-2.5 py-2 align-middle">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[14px] font-semibold tabular-nums ${
                                  seat.isAlive ? 'text-primary' : 'text-muted line-through'
                                }`}
                              >
                                {formatSeatNum(seat.seatNumber)}
                              </span>
                              {isSheriff && (
                                <span className="text-[12px] font-semibold text-sheriff">警</span>
                              )}
                            </div>
                            {seat.nickname.trim() && (
                              <div className="max-w-[68px] truncate text-[12px] text-secondary">
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
                                className="border-r border-subtle p-1.5 align-top last:border-r-0"
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
                                  placeholder="標記..."
                                  className="min-h-11 w-full rounded-md border border-subtle bg-elevated px-2.5 text-[14px] text-primary placeholder:text-muted focus:border-sheriff focus:outline-none"
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
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={!hasContent}
              onClick={() => setConfirmClearOpen(true)}
              className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-4 text-[14px] font-semibold text-wolf transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              清空
            </button>
            <button
              type="button"
              onClick={handleCopyNotes}
              className={`min-h-12 flex-1 rounded-md px-4 text-[14px] font-semibold transition ${
                copied
                  ? 'bg-good text-inverse'
                  : 'bg-sheriff text-inverse hover:opacity-90'
              }`}
            >
              {copied ? '已複製筆記' : '複製筆記'}
            </button>
          </div>
        </div>
      </SlideDrawer>

      <ConfirmModal
        open={confirmClearOpen}
        title="清空所有筆記"
        description="將清除自由筆記與座號表格的所有內容，無法復原。"
        confirmLabel="確認清空"
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
