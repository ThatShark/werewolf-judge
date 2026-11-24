import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { formatNotebookExportText, hasNotebookContent } from '../../logic/notebook';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  buildGameReplayText,
  buildReplayDownloadFilename,
  formatDeathReason,
  formatFactionLabel,
  formatSeatNum,
  formatSheriffStatusSummary,
  formatVoteRecordLines,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

type ReviewTab = 'identities' | 'timeline' | 'notes';

interface GameOverScreenProps {
  onOpenNotebook?: () => void;
}

export function GameOverScreen({ onOpenNotebook }: GameOverScreenProps) {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const hostMode = useGameStore((s) => s.hostMode);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const winner = useGameStore((s) => s.winner);
  const winReason = useGameStore((s) => s.winReason);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const mechWolfState = useGameStore((s) => s.mechWolfState);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const notebook = useGameStore((s) => s.notebook);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const dayHistory = useGameStore((s) => s.dayHistory);
  const restartGame = useGameStore((s) => s.restartGame);
  const dissolveRoom = useGameStore((s) => s.dissolveRoom);
  const forceContinueGame = useGameStore((s) => s.forceContinueGame);

  const [activeTab, setActiveTab] = useState<ReviewTab>('identities');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmContinueOpen, setConfirmContinueOpen] = useState(false);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);
  const [confirmDissolveOpen, setConfirmDissolveOpen] = useState(false);

  const board = getBoardById(selectedBoardId);
  const aliveCount = useMemo(() => seats.filter((s) => s.isAlive).length, [seats]);
  const noteHasContent = useMemo(() => hasNotebookContent(notebook), [notebook]);

  const timelineRounds = useMemo(() => {
    const maxRound = Math.max(
      round,
      ...nightHistory.map((n) => n.round),
      ...dayHistory.map((d) => d.round),
      1,
    );
    const items: Array<{
      round: number;
      night?: (typeof nightHistory)[number];
      day?: (typeof dayHistory)[number];
    }> = [];
    for (let r = 1; r <= maxRound; r += 1) {
      const night = nightHistory.find((n) => n.round === r);
      const day = dayHistory.find((d) => d.round === r);
      if (night || day) {
        items.push({ round: r, night, day });
      }
    }
    return items;
  }, [round, nightHistory, dayHistory]);

  const sheriffSummary = useMemo(
    () => formatSheriffStatusSummary(sheriffState, seats),
    [sheriffState, seats],
  );

  const replayText = useMemo(
    () =>
      buildGameReplayText(
        {
          round,
          winner,
          winReason,
          seats,
          sheriffState,
          mechWolfState,
          notebook,
          ruleOverrides,
          nightHistory,
          dayHistory,
        },
        board,
      ),
    [
      round,
      winner,
      winReason,
      seats,
      sheriffState,
      mechWolfState,
      notebook,
      ruleOverrides,
      nightHistory,
      dayHistory,
      board,
    ],
  );

  const notebookPreviewText = useMemo(
    () =>
      formatNotebookExportText(notebook, seats, board?.name, {
        round,
        enableSheriff: ruleOverrides.enableSheriff,
      }),
    [notebook, seats, board?.name, round, ruleOverrides.enableSheriff],
  );

  const handleCopyReplay = async () => {
    try {
      await navigator.clipboard.writeText(replayText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = replayText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  const handleDownloadReplay = () => {
    const blob = new Blob([replayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildReplayDownloadFilename(board?.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

  const isWolfWin = winner === 'wolf';
  const isThirdPartyWin = winner === 'third_party';
  const isDraw = winner === 'draw';

  const accentBorder = isWolfWin
    ? 'border-wolf'
    : isThirdPartyWin
      ? 'border-third'
      : isDraw
        ? 'border-strong'
        : 'border-good';

  const titleColor = isWolfWin
    ? 'text-wolf'
    : isThirdPartyWin
      ? 'text-third'
      : isDraw
        ? 'text-primary'
        : 'text-good';

  const learnedRoleName = mechWolfState.learnedRoleId
    ? (getRoleById(mechWolfState.learnedRoleId)?.name ?? mechWolfState.learnedRoleId)
    : null;

  const showNotesTab = hostMode.judgeMode !== 'physical_judge';
  const reviewTabs: Array<{ id: ReviewTab; label: string }> = showNotesTab
    ? [
        { id: 'identities', label: `身分 (${seats.length})` },
        { id: 'timeline', label: '時間軸' },
        { id: 'notes', label: '筆記' },
      ]
    : [
        { id: 'identities', label: `身分 (${seats.length})` },
        { id: 'timeline', label: '時間軸' },
      ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部戰局結算橫條 */}
      <section className={`shrink-0 border-l-2 bg-surface px-3 py-2.5 ${accentBorder}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className={`truncate text-[18px] font-semibold leading-6 ${titleColor}`}>
              {isDraw ? '本局平局' : `${formatFactionLabel(winner)}勝利`}
            </h1>
            {winReason && <p className="mt-0.5 text-[12px] text-secondary">{winReason}</p>}
            <div className="mt-1 flex flex-wrap gap-2 text-[12px] tabular-nums text-muted">
              <span>{round} 輪</span>
              <span>·</span>
              <span>
                存活 {aliveCount}/{seats.length}
              </span>
              {sheriffSummary && (
                <>
                  <span>·</span>
                  <span className="text-sheriff">{sheriffSummary}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmContinueOpen(true)}
            className="min-h-10 shrink-0 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
          >
            強制繼續
          </button>
        </div>
      </section>

      {/* 2. 分頁列 */}
      <nav
        role="tablist"
        aria-label="復盤分頁"
        className={`grid shrink-0 gap-1 rounded-md border border-subtle bg-surface p-1 ${
          showNotesTab ? 'grid-cols-3' : 'grid-cols-2'
        }`}
      >
        {reviewTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums transition ${
              activeTab === t.id ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* 3. 中央復盤內容 */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-subtle bg-surface px-3 py-2">
        {activeTab === 'identities' && (
          <div className="divide-y divide-subtle">
            {seats.map((seat) => {
              const role = getRoleById(seat.roleId);
              const isSheriff =
                sheriffState.badgeStatus === 'active' &&
                sheriffState.sheriffSeat === seat.seatNumber;
              return (
                <div
                  key={seat.seatNumber}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`w-6 shrink-0 text-[14px] font-semibold tabular-nums ${
                        seat.isAlive ? 'text-primary' : 'text-muted line-through'
                      }`}
                    >
                      {formatSeatNum(seat.seatNumber)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] text-primary">
                          {seat.nickname.trim() || `${seat.seatNumber}號`}
                        </span>
                        {isSheriff && (
                          <span className="text-[12px] font-semibold text-sheriff">警</span>
                        )}
                      </div>
                      <div className="text-[12px] text-muted tabular-nums">
                        {seat.isAlive
                          ? '存活'
                          : `R${seat.deathRound ?? '?'} · ${formatDeathReason(seat.deathReason)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {seat.roleId === 'mech_wolf' && learnedRoleName && (
                      <span className="text-[12px] text-third">學:{learnedRoleName}</span>
                    )}
                    {role && (
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[12px] font-semibold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="divide-y divide-subtle">
            {timelineRounds.map(({ round: r, night, day }) => (
              <div key={r} className="space-y-1.5 py-2.5">
                <div className="text-[12px] font-semibold tabular-nums text-sheriff">
                  第 {r} 回合
                </div>
                {night && (
                  <div className="text-[12px] text-secondary tabular-nums">
                    夜間：
                    {night.deaths.length === 0
                      ? '平安夜'
                      : night.deaths
                          .map((d) => `${formatSeatNum(d.seat)}號(${formatDeathReason(d.reason)})`)
                          .join('、')}
                  </div>
                )}
                {day && day.events.length > 0 && (
                  <ul className="space-y-1 text-[12px] text-primary">
                    {day.events.map((evt, idx) => {
                      const matchedVote = day.structuredEvents?.find(
                        (s) => s.summary === evt && s.voteRecord,
                      )?.voteRecord;
                      return (
                        <li key={idx}>
                          <div>• {evt}</div>
                          {matchedVote && (
                            <div className="mt-0.5 pl-3 text-[12px] tabular-nums text-muted">
                              {formatVoteRecordLines(matchedVote).join(' / ')}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {showNotesTab && activeTab === 'notes' && (
          <div className="space-y-2 py-1">
            {noteHasContent ? (
              <pre className="whitespace-pre-wrap font-sans text-[12px] leading-5 text-secondary">
                {notebookPreviewText}
              </pre>
            ) : (
              <p className="py-6 text-center text-[14px] text-muted">尚無筆記內容。</p>
            )}
            {onOpenNotebook && (
              <button
                type="button"
                onClick={onOpenNotebook}
                className="min-h-11 w-full rounded-md border border-subtle bg-canvas text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
              >
                開啟筆記本編輯
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. 底部操作列：匯出／解散線框 ＋ 單一實心主按鈕（再來一局） */}
      <footer className="flex shrink-0 items-center gap-1.5 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={handleCopyReplay}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          {copied ? '已複製' : '複製'}
        </button>
        <button
          type="button"
          onClick={handleDownloadReplay}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-3 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          {downloaded ? '已下載' : '匯出'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDissolveOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-wolf-border bg-wolf-tint px-3 text-[12px] font-semibold text-wolf"
        >
          結束
        </button>
        <button
          type="button"
          onClick={() => setConfirmRestartOpen(true)}
          className="min-h-12 flex-1 rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90"
        >
          再來一局
        </button>
      </footer>

      <ConfirmModal
        open={confirmContinueOpen}
        title="強制繼續對局"
        description="解除勝負鎖定並返回對局流程。"
        confirmLabel="確認繼續"
        tone="warning"
        onConfirm={() => {
          forceContinueGame();
          setConfirmContinueOpen(false);
        }}
        onCancel={() => setConfirmContinueOpen(false)}
      />

      <ConfirmModal
        open={confirmRestartOpen}
        title="再來一局"
        description="保留目前板子與玩家暱稱，重置回合與身分。"
        confirmLabel="確認重開"
        tone="primary"
        onConfirm={() => {
          restartGame({ keepNicknames: true });
          setConfirmRestartOpen(false);
        }}
        onCancel={() => setConfirmRestartOpen(false)}
      />

      <ConfirmModal
        open={confirmDissolveOpen}
        title="結束並清空房間"
        description="將清空本局資料並返回選板畫面。"
        confirmLabel="確認結束"
        tone="danger"
        onConfirm={() => {
          dissolveRoom();
          setConfirmDissolveOpen(false);
        }}
        onCancel={() => setConfirmDissolveOpen(false)}
      />
    </div>
  );
}
