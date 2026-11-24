import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { isSeatWolfFaction } from '../../logic';
import { formatNotebookExportText, hasNotebookContent } from '../../logic/notebook';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { SlideDrawer } from '../common/SlideDrawer';
import {
  buildGameReplayText,
  buildReplayDownloadFilename,
  formatDeathReason,
  formatFactionLabel,
  formatSeatNum,
  formatVoteRecordLines,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

type ReplayDrawerTab = 'identities' | 'timeline' | 'notes';

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

  const [replayOpen, setReplayOpen] = useState(false);
  const [replayTab, setReplayTab] = useState<ReplayDrawerTab>('identities');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmContinueOpen, setConfirmContinueOpen] = useState(false);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);
  const [confirmDissolveOpen, setConfirmDissolveOpen] = useState(false);

  const board = getBoardById(selectedBoardId);
  const noteHasContent = useMemo(() => hasNotebookContent(notebook), [notebook]);

  const winningSeats = useMemo(() => {
    if (!winner || winner === 'draw') return seats;
    return seats.filter((seat) => {
      const role = getRoleById(seat.roleId);
      if (winner === 'wolf') return isSeatWolfFaction(seat);
      if (winner === 'third_party') return role?.faction === 'third_party';
      return !isSeatWolfFaction(seat) && role?.faction !== 'third_party';
    });
  }, [seats, winner]);

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
  const replayTabs: Array<{ id: ReplayDrawerTab; label: string }> = showNotesTab
    ? [
        { id: 'identities', label: `全場身分 (${seats.length})` },
        { id: 'timeline', label: '時間軸' },
        { id: 'notes', label: '筆記' },
      ]
    : [
        { id: 'identities', label: `全場身分 (${seats.length})` },
        { id: 'timeline', label: '時間軸' },
      ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* 1. 極簡獲勝宣告（移除冗餘輪數／存活／警長摘要） */}
      <section className={`shrink-0 border-l-4 bg-surface px-4 py-4 ${accentBorder}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className={`text-[24px] font-bold leading-8 ${titleColor}`}>
              {isDraw ? '本局平局' : `${formatFactionLabel(winner)}勝利`}
            </h1>
            {winReason && <p className="mt-1 text-[14px] text-secondary">{winReason}</p>}
          </div>
          <button
            type="button"
            onClick={() => setConfirmContinueOpen(true)}
            className="min-h-10 shrink-0 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-muted hover:border-strong hover:text-primary"
          >
            誤判繼續
          </button>
        </div>
      </section>

      {/* 2. 獲勝玩家座號與角色清單 */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-subtle bg-surface">
        <div className="shrink-0 border-b border-subtle px-3.5 py-2.5 text-[12px] font-semibold text-secondary">
          {isDraw ? '全場玩家' : '獲勝玩家名單'}
        </div>
        <div className="min-h-0 flex-1 divide-y divide-subtle overflow-y-auto px-3.5">
          {winningSeats.map((seat) => {
            const role = getRoleById(seat.roleId);
            return (
              <div
                key={seat.seatNumber}
                className="flex min-h-12 items-center justify-between gap-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="w-7 shrink-0 text-[16px] font-semibold tabular-nums text-primary">
                    {formatSeatNum(seat.seatNumber)}
                  </span>
                  <span className="truncate text-[14px] font-medium text-primary">
                    {seat.nickname.trim() || `${seat.seatNumber}號`}
                  </span>
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
      </section>

      {/* 3. 底部核心操作列：復盤紀錄 ＋ 結束 ＋ 再來一局（Single Primary CTA） */}
      <footer className="flex shrink-0 items-center gap-2 border-t border-subtle pt-2">
        <button
          type="button"
          onClick={() => setReplayOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-surface px-4 text-[14px] font-semibold text-primary hover:border-strong"
        >
          復盤紀錄
        </button>
        <button
          type="button"
          onClick={() => setConfirmDissolveOpen(true)}
          className="min-h-12 shrink-0 rounded-md border border-subtle bg-canvas px-3 text-[12px] font-medium text-secondary hover:border-wolf-border hover:text-wolf"
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

      {/* 復盤紀錄抽屜（全場身分／時間軸／筆記／匯出） */}
      <SlideDrawer
        open={replayOpen}
        onClose={() => setReplayOpen(false)}
        title="復盤紀錄"
        placement="bottom"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <nav
              role="tablist"
              aria-label="復盤分頁"
              className={`grid flex-1 gap-1 rounded-md border border-subtle bg-canvas p-1 ${
                showNotesTab ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              {replayTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={replayTab === t.id}
                  onClick={() => setReplayTab(t.id)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums transition ${
                    replayTab === t.id
                      ? 'bg-elevated text-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={handleCopyReplay}
                className="min-h-10 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:text-primary"
              >
                {copied ? '已複製' : '複製'}
              </button>
              <button
                type="button"
                onClick={handleDownloadReplay}
                className="min-h-10 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:text-primary"
              >
                {downloaded ? '已下載' : '匯出'}
              </button>
            </div>
          </div>

          {replayTab === 'identities' && (
            <div className="divide-y divide-subtle">
              {seats.map((seat) => {
                const role = getRoleById(seat.roleId);
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
                        <div className="truncate text-[14px] text-primary">
                          {seat.nickname.trim() || `${seat.seatNumber}號`}
                        </div>
                        <div className="text-[12px] text-muted tabular-nums">
                          {seat.isAlive
                            ? '存活'
                            : `R${seat.deathRound ?? '?'} · ${formatDeathReason(seat.deathReason)}`}
                        </div>
                      </div>
                    </div>
                    {role && (
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[12px] font-semibold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {replayTab === 'timeline' && (
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

          {showNotesTab && replayTab === 'notes' && (
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
      </SlideDrawer>

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
