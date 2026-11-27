import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { formatChineseDay, formatChineseNight } from '../../logic';
import type {
  DayHistoryEntry,
  NightActionDraft,
  NightHistoryEntry,
} from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import {
  generateGameSummaryImage,
  triggerPngDownload,
  type GeneratedSummaryImage,
} from '../../utils/exportGameSummaryImage';
import { SlideDrawer } from './SlideDrawer';
import { SummaryImageModal } from './SummaryImageModal';
import {
  DEATH_REASON_LABELS,
  formatNightActionLogs,
  formatSeatNum,
} from './displayHelpers';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
  inProgressNight?: {
    round: number;
    draft: NightActionDraft;
    pendingSelfExplodeSeat: number | null;
  } | null;
}

export function HistoryDrawer({
  open,
  onClose,
  nightHistory,
  dayHistory,
  inProgressNight,
}: HistoryDrawerProps) {
  const [selectedRound, setSelectedRound] = useState<'all' | number>('all');
  const [exportingImage, setExportingImage] = useState(false);
  const [summaryImage, setSummaryImage] = useState<GeneratedSummaryImage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const seats = useGameStore((s) => s.seats);
  const round = useGameStore((s) => s.round);
  const winner = useGameStore((s) => s.winner);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const mechWolfState = useGameStore((s) => s.mechWolfState);
  const hybridState = useGameStore((s) => s.hybridState);
  const conversionState = useGameStore((s) => s.conversionState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);

  const board = getBoardById(selectedBoardId);
  const canExportImage = seats.length > 0 && (nightHistory.length > 0 || dayHistory.length > 0);

  const handleExportSummaryImage = async () => {
    if (exportingImage || !canExportImage) return;
    setExportingImage(true);
    try {
      const generated = await generateGameSummaryImage(
        {
          round,
          seats,
          winner,
          sheriffState,
          ruleOverrides,
          nightHistory,
          dayHistory,
          mechWolfState,
          hybridState,
          conversionState,
          thirdPartySpecialState,
        },
        board,
      );
      setSummaryImage(generated);
      setPreviewOpen(true);
      const isTouchDevice =
        typeof navigator !== 'undefined' &&
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1);
      if (!isTouchDevice) {
        triggerPngDownload(generated.blob, generated.filename);
      }
    } finally {
      setExportingImage(false);
    }
  };

  const maxRound = Math.max(
    0,
    ...nightHistory.map((n) => n.round),
    ...dayHistory.map((d) => d.round),
  );

  const rounds = useMemo(
    () => Array.from({ length: maxRound }, (_, idx) => idx + 1),
    [maxRound],
  );

  const visibleRounds = useMemo(() => {
    if (selectedRound === 'all') return rounds;
    return rounds.filter((r) => r === selectedRound);
  }, [rounds, selectedRound]);

  const liveLines = inProgressNight
    ? formatNightActionLogs(
        inProgressNight.draft,
        undefined,
        inProgressNight.pendingSelfExplodeSeat,
      )
    : [];

  return (
    <>
      <SlideDrawer open={open} onClose={onClose} title="歷史紀錄" placement="bottom">
        <div className="space-y-3">
          {canExportImage && (
            <button
              type="button"
              onClick={handleExportSummaryImage}
              disabled={exportingImage}
              className="min-h-12 w-full rounded-md border border-sheriff-border bg-sheriff-tint px-4 text-[14px] font-semibold text-sheriff transition hover:opacity-90 disabled:opacity-60"
            >
              {exportingImage ? '正在產生復盤圖片…' : '匯出復盤表格圖（PNG）'}
            </button>
          )}

          {/* 按晚數／回合快速查閱切換列 */}
        {rounds.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedRound('all')}
              className={`min-h-10 shrink-0 rounded-md px-3 text-[12px] font-semibold transition ${
                selectedRound === 'all'
                  ? 'bg-sheriff text-inverse'
                  : 'border border-subtle bg-canvas text-secondary hover:border-strong hover:text-primary'
              }`}
            >
              全部
            </button>
            {rounds.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRound(r)}
                className={`min-h-10 shrink-0 rounded-md px-3 text-[12px] font-semibold tabular-nums transition ${
                  selectedRound === r
                    ? 'bg-sheriff text-inverse'
                    : 'border border-subtle bg-canvas text-secondary hover:border-strong hover:text-primary'
                }`}
              >
                {formatChineseNight(r)}
              </button>
            ))}
          </div>
        )}

        <div className="divide-y divide-subtle">
          {inProgressNight && selectedRound === 'all' && (
            <section className="border-l-2 border-sheriff py-3 pl-3">
              <h3 className="text-[12px] font-semibold tabular-nums text-sheriff">
                {formatChineseNight(inProgressNight.round)}（進行中）
              </h3>
              {liveLines.length === 0 ? (
                <p className="mt-1 text-[12px] text-muted">尚未確認行動目標。</p>
              ) : (
                <ul className="mt-1.5 space-y-1 text-[14px] text-primary tabular-nums">
                  {liveLines.map((line, idx) => (
                    <li key={idx}>• {line}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {maxRound === 0 && !inProgressNight ? (
            <p className="py-6 text-center text-[14px] text-muted">尚無對局操作紀錄。</p>
          ) : (
            visibleRounds.map((round) => {
              const night = nightHistory.find((n) => n.round === round);
              const day = dayHistory.find((d) => d.round === round);
              const nightSkillLines = night ? formatNightActionLogs(night.draft, night) : [];
              return (
                <section key={round} className="space-y-2 py-3">
                  <h3 className="text-[12px] font-semibold tabular-nums text-sheriff">
                    第 {round} 回合
                  </h3>
                  {night && (
                    <div className="space-y-1.5">
                      <div className="text-[12px] font-semibold text-secondary">
                        {formatChineseNight(round)} · 技能對象與結果
                      </div>
                      {nightSkillLines.length > 0 && (
                        <ul className="space-y-1 text-[14px] text-primary tabular-nums">
                          {nightSkillLines.map((line, idx) => (
                            <li key={idx}>• {line}</li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-1 text-[12px] font-semibold text-secondary">天亮結果</div>
                      {night.deaths.length === 0 ? (
                        <p className="text-[14px] text-good">平安夜</p>
                      ) : (
                        <ul className="space-y-1 text-[14px] text-wolf tabular-nums">
                          {[...night.deaths]
                            .sort((a, b) => a.seat - b.seat)
                            .map((d, i) => (
                              <li key={i}>
                                • {formatSeatNum(d.seat)} 號（{DEATH_REASON_LABELS[d.reason]}）
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {day && day.events.length > 0 && (
                    <div className="space-y-1 border-t border-subtle pt-2">
                      <div className="text-[12px] font-semibold text-secondary">
                        {formatChineseDay(round)} · 白天事件
                      </div>
                      <ul className="space-y-1 text-[14px] text-secondary tabular-nums">
                        {day.events.map((evt, i) => (
                          <li key={i}>• {evt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </SlideDrawer>

    <SummaryImageModal
      open={previewOpen}
      image={summaryImage}
      onClose={() => setPreviewOpen(false)}
    />
    </>
  );
}
