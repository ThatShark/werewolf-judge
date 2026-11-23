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

  const bannerTheme = isWolfWin
    ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/90 via-slate-950 to-rose-950/50'
    : isThirdPartyWin
      ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/90 via-slate-950 to-amber-950/50'
      : isDraw
        ? 'border-slate-600/70 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900'
        : 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-cyan-950/50';

  const emblemTheme = isWolfWin
    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
    : isThirdPartyWin
      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
      : isDraw
        ? 'border-slate-500/50 bg-slate-700/40 text-slate-200'
        : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200';

  const titleTheme = isWolfWin
    ? 'text-rose-200'
    : isThirdPartyWin
      ? 'text-amber-200'
      : isDraw
        ? 'text-slate-100'
        : 'text-emerald-200';

  const learnedRoleName = mechWolfState.learnedRoleId
    ? (getRoleById(mechWolfState.learnedRoleId)?.name ?? mechWolfState.learnedRoleId)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
      {/* 1. 頂部網易風格勝利橫幅（固定不捲動） */}
      <section className={`shrink-0 rounded-2xl border px-3.5 py-3 shadow-lg ${bannerTheme}`}>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-inner ${emblemTheme}`}
            >
              {isWolfWin ? '🐺' : isThirdPartyWin ? '🦊' : isDraw ? '🤝' : '🛡️'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300/90">
                Game Over · 戰局結算
              </p>
              <h1 className={`truncate text-xl font-black tracking-tight ${titleTheme}`}>
                {isDraw ? '本局平局結束' : `${formatFactionLabel(winner)}勝利！`}
              </h1>
              {winReason && (
                <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-300">
                  {winReason}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmContinueOpen(true)}
            className="min-h-11 shrink-0 rounded-xl border border-indigo-400/45 bg-indigo-950/60 px-2.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-900/60 active:scale-95"
          >
            ⚖️ 強制繼續
          </button>
        </div>

        {/* 局數統計與警徽摘要列 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-0.5 text-slate-200">
            ⏱️ 共 {round} 輪
          </span>
          <span className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-0.5 text-slate-200">
            👥 存活 {aliveCount} / {seats.length}
          </span>
          {sheriffSummary && (
            <span className="rounded-lg border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-amber-200">
              👮 {sheriffSummary}
            </span>
          )}
        </div>
      </section>

      {/* 2. 分頁切換列（固定不捲動） */}
      <nav
        role="tablist"
        aria-label="復盤檢視分頁"
        className="grid shrink-0 grid-cols-3 gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'identities'}
          onClick={() => setActiveTab('identities')}
          className={`min-h-11 rounded-xl px-2 text-xs font-extrabold transition active:scale-[0.98] ${
            activeTab === 'identities'
              ? 'border border-amber-400/50 bg-amber-500/20 text-amber-200'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`}
        >
          🎭 身分回顧 ({seats.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'timeline'}
          onClick={() => setActiveTab('timeline')}
          className={`min-h-11 rounded-xl px-2 text-xs font-extrabold transition active:scale-[0.98] ${
            activeTab === 'timeline'
              ? 'border border-amber-400/50 bg-amber-500/20 text-amber-200'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`}
        >
          📜 對局回顧 ({timelineRounds.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notes'}
          onClick={() => setActiveTab('notes')}
          className={`relative min-h-11 rounded-xl px-2 text-xs font-extrabold transition active:scale-[0.98] ${
            activeTab === 'notes'
              ? 'border border-amber-400/50 bg-amber-500/20 text-amber-200'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`}
        >
          📝 個人筆記
          {noteHasContent && (
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" />
          )}
        </button>
      </nav>

      {/* 3. 中央內部可捲動內容區 */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-800/90 bg-slate-900/75 p-3">
        {activeTab === 'identities' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {seats.map((seat) => {
              const role = getRoleById(seat.roleId);
              const isSheriff =
                sheriffState.badgeStatus === 'active' &&
                sheriffState.sheriffSeat === seat.seatNumber;
              const isMechWolf = seat.roleId === 'mech_wolf';
              const factionStripe = !role
                ? 'bg-slate-600'
                : role.faction === 'wolf'
                  ? 'bg-rose-500'
                  : role.category === 'god'
                    ? 'bg-indigo-400'
                    : role.category === 'villager'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400';

              return (
                <div
                  key={seat.seatNumber}
                  className={`relative overflow-hidden rounded-xl border p-2.5 transition ${
                    seat.isAlive
                      ? 'border-slate-700/90 bg-slate-950/90'
                      : 'border-slate-800/80 bg-slate-950/55 opacity-85'
                  }`}
                >
                  {/* 陣營左側色條 */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1 ${factionStripe}`}
                  />

                  <div className="pl-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-black text-slate-100">
                          {seat.seatNumber}
                        </span>
                        <span className="truncate text-xs font-bold text-slate-200">
                          {seat.nickname.trim() || `${seat.seatNumber} 號`}
                        </span>
                      </div>
                      {isSheriff && (
                        <span
                          title="警長"
                          className="shrink-0 rounded-md border border-amber-400/40 bg-amber-500/20 px-1 py-0.5 text-[10px] font-bold text-amber-200"
                        >
                          👮 警
                        </span>
                      )}
                    </div>

                    {/* 底牌角色標籤 */}
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-xs font-extrabold ${getRoleBadgeClasses(seat.roleId)}`}
                      >
                        {role?.name ?? '未指派'}
                      </span>
                      {isMechWolf && learnedRoleName && (
                        <span className="rounded-md border border-fuchsia-400/40 bg-fuchsia-950/70 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-200">
                          學：{learnedRoleName}
                        </span>
                      )}
                    </div>

                    {/* 最終存活或死因標籤 */}
                    <div className="mt-2 text-[11px] leading-snug">
                      {seat.isAlive ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {seat.idiotRevealed ? '存活（白痴翻牌）' : '存活至結束'}
                        </span>
                      ) : (
                        <span className="font-medium text-rose-300/90">
                          第 {seat.deathRound ?? '?'} 輪 · {formatDeathReason(seat.deathReason)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {timelineRounds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                本局尚無日夜行動紀錄
              </div>
            ) : (
              timelineRounds.map(({ round: r, night, day }) => (
                <div
                  key={r}
                  className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs"
                >
                  {night && (
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-300">
                        <span>🌙</span>
                        <span>第 {r} 晚</span>
                      </div>
                      <ul className="mt-1.5 space-y-1 text-slate-300">
                        {night.draft.mechWolfLearnTarget !== null && (
                          <li>• 機械狼首夜學習：{night.draft.mechWolfLearnTarget} 號</li>
                        )}
                        {night.draft.mechWolfSkillTarget !== null && (
                          <li>
                            • 機械狼使用學習技能：{night.draft.mechWolfSkillTarget} 號
                          </li>
                        )}
                        {night.draft.guardTarget !== null && (
                          <li>• 守衛守護：{night.draft.guardTarget} 號</li>
                        )}
                        <li>
                          • 狼人點刀：
                          {night.draft.wolfTarget !== null
                            ? `${night.draft.wolfTarget} 號`
                            : '空刀'}
                        </li>
                        {night.draft.witchUseAntidote && <li>• 女巫使用解藥救人</li>}
                        {night.draft.witchPoisonTarget !== null && (
                          <li>• 女巫使用毒藥：{night.draft.witchPoisonTarget} 號</li>
                        )}
                        {night.draft.seerCheckTarget !== null && (
                          <li>• 預言家查驗：{night.draft.seerCheckTarget} 號</li>
                        )}
                        {night.draft.psychicCheckTarget !== null && (
                          <li>• 通靈師查驗：{night.draft.psychicCheckTarget} 號</li>
                        )}
                        {night.draft.wolfBeautyCharmTarget != null && (
                          <li>• 狼美人魅惑：{night.draft.wolfBeautyCharmTarget} 號</li>
                        )}
                        {night.draft.dreamCatcherTarget != null && (
                          <li>• 攝夢人攝夢：{night.draft.dreamCatcherTarget} 號</li>
                        )}
                        {night.bearRoar && (
                          <li className="text-amber-200">• 熊判定：{night.bearRoar.reason}</li>
                        )}
                        <li className="font-semibold text-amber-200">
                          • 天亮結果：
                          {night.deaths.length === 0
                            ? '平安夜'
                            : night.deaths
                                .map((d) => `${d.seat} 號（${formatDeathReason(d.reason)}）`)
                                .join('、')}
                        </li>
                      </ul>
                    </div>
                  )}

                  {day && day.events.length > 0 && (
                    <div className={night ? 'border-t border-slate-800 pt-2.5' : ''}>
                      <div className="flex items-center gap-1.5 font-extrabold text-amber-300">
                        <span>☀️</span>
                        <span>第 {r} 天</span>
                      </div>
                      <ul className="mt-1.5 space-y-1.5 text-slate-300">
                        {(() => {
                          const remainingVoteEvents = [...(day.structuredEvents ?? [])].filter(
                            (s) => s.voteRecord,
                          );
                          return day.events.map((evt, idx) => {
                            const matchIdx = remainingVoteEvents.findIndex(
                              (s) => s.summary === evt,
                            );
                            const matched =
                              matchIdx !== -1
                                ? remainingVoteEvents.splice(matchIdx, 1)[0]
                                : undefined;
                            return (
                              <li key={idx} className="space-y-1">
                                <div>• {evt}</div>
                                {matched?.voteRecord && (
                                  <div className="ml-3 space-y-0.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-300">
                                    {formatVoteRecordLines(matched.voteRecord).map(
                                      (line, lIdx) => (
                                        <div key={lIdx}>- {line}</div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-400">
                以下筆記將自動附帶於匯出戰報中
              </p>
              {onOpenNotebook && (
                <button
                  type="button"
                  onClick={onOpenNotebook}
                  className="min-h-10 shrink-0 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
                >
                  ✏️ 編輯筆記
                </button>
              )}
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950/85 p-3 font-sans text-xs leading-relaxed text-slate-200">
              {notebookPreviewText}
            </pre>
          </div>
        )}
      </div>

      {/* 4. 底部匯出與大廳控制列（固定不捲動） */}
      <section className="shrink-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyReplay}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition active:scale-[0.98] sm:text-sm ${
              copied
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                : 'border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
            }`}
          >
            {copied ? '✓ 已複製戰報！' : '📋 複製紀錄表'}
          </button>
          <button
            type="button"
            onClick={handleDownloadReplay}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition active:scale-[0.98] sm:text-sm ${
              downloaded
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                : 'border-sky-400/45 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
            }`}
          >
            {downloaded ? '✓ 已下載 .txt！' : '⬇️ 下載紀錄表 (.txt)'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirmRestartOpen(true)}
            className="min-h-12 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-3 text-xs font-extrabold text-emerald-200 transition hover:bg-emerald-900/50 active:scale-[0.98] sm:text-sm"
          >
            🔄 重新開始新局
          </button>
          <button
            type="button"
            onClick={() => setConfirmDissolveOpen(true)}
            className="min-h-12 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3 text-xs font-extrabold text-rose-200 transition hover:bg-rose-900/55 active:scale-[0.98] sm:text-sm"
          >
            🚪 解散房間回主頁
          </button>
        </div>
      </section>

      {/* 二次確認彈窗 */}
      <ConfirmModal
        open={confirmContinueOpen}
        title="解除結束鎖定並強制繼續對局？"
        description="系統將清除目前的勝負狀態並返回原本的白天階段，後續對局改由法官手動控制結算（可透過「勝負覆蓋」隨時結束）。"
        confirmLabel="確認強制繼續"
        tone="warning"
        onConfirm={() => {
          setConfirmContinueOpen(false);
          forceContinueGame();
        }}
        onCancel={() => setConfirmContinueOpen(false)}
      />

      <ConfirmModal
        open={confirmRestartOpen}
        title="保留原配置重新開始新局？"
        description="將保留目前的板子、3D 主持模式、房規設定與座位暱稱，並清空本局身分、歷史紀錄與個人筆記本。"
        confirmLabel="確認重新開始"
        tone="warning"
        onConfirm={() => {
          setConfirmRestartOpen(false);
          restartGame({ keepNicknames: true });
        }}
        onCancel={() => setConfirmRestartOpen(false)}
      />

      <ConfirmModal
        open={confirmDissolveOpen}
        title="確定解散房間並返回主頁？"
        description="將清空目前對局紀錄、已選板子、座位暱稱與個人筆記本，並直接返回主頁。"
        confirmLabel="確認解散房間"
        tone="danger"
        onConfirm={() => {
          setConfirmDissolveOpen(false);
          dissolveRoom();
        }}
        onCancel={() => setConfirmDissolveOpen(false)}
      />
    </div>
  );
}
