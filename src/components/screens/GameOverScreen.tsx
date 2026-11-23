import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  buildGameReplayText,
  formatDeathReason,
  formatFactionLabel,
  formatSeatDisplay,
  formatSheriffStatusSummary,
  formatVoteRecordLines,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

export function GameOverScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const winner = useGameStore((s) => s.winner);
  const winReason = useGameStore((s) => s.winReason);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const dayHistory = useGameStore((s) => s.dayHistory);
  const restartGame = useGameStore((s) => s.restartGame);
  const forceContinueGame = useGameStore((s) => s.forceContinueGame);

  const [copied, setCopied] = useState(false);
  const [confirmContinueOpen, setConfirmContinueOpen] = useState(false);

  const board = getBoardById(selectedBoardId);

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
        { round, winner, winReason, seats, sheriffState, nightHistory, dayHistory },
        board,
      ),
    [round, winner, winReason, seats, sheriffState, nightHistory, dayHistory, board],
  );

  const handleCopyReplay = async () => {
    try {
      await navigator.clipboard.writeText(replayText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // 若瀏覽器環境不允許 Clipboard API，建立暫存文字框複製
      const textarea = document.createElement('textarea');
      textarea.value = replayText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  const isWolfWin = winner === 'wolf';
  const isThirdPartyWin = winner === 'third_party';
  const isDraw = winner === 'draw';

  return (
    <div className="space-y-4 pb-10">
      {/* 勝利陣營橫幅 */}
      <section
        className={`rounded-2xl border p-5 text-center shadow-lg ${
          isWolfWin
            ? 'border-rose-500/50 bg-rose-950/40'
            : isThirdPartyWin
              ? 'border-amber-500/50 bg-amber-950/40'
              : isDraw
                ? 'border-slate-500/60 bg-slate-900/90'
                : 'border-emerald-500/50 bg-emerald-950/40'
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Game Over · 對局結束
        </p>
        <h1
          className={`mt-1.5 text-2xl font-extrabold ${
            isWolfWin
              ? 'text-rose-200'
              : isThirdPartyWin
                ? 'text-amber-200'
                : isDraw
                  ? 'text-slate-100'
                  : 'text-emerald-200'
          }`}
        >
          {isWolfWin ? '🐺 ' : isThirdPartyWin ? '🦊 ' : isDraw ? '🤝 ' : '✨ '}
          {isDraw ? '本局平局結束' : `${formatFactionLabel(winner)}勝利！`}
        </h1>
        {winReason && (
          <p className="mt-2 text-sm font-medium text-slate-200">{winReason}</p>
        )}
        {sheriffSummary && (
          <div className="mt-2.5 inline-block rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-200">
            👮 {sheriffSummary}
          </div>
        )}
      </section>

      {/* 一鍵複製復盤文字 ＋ 法官強制繼續對局 */}
      <section className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={handleCopyReplay}
          className={`min-h-12 flex-1 rounded-xl border px-4 py-3 text-sm font-extrabold transition active:scale-[0.99] ${
            copied
              ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
              : 'border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
          }`}
        >
          {copied ? '✓ 已複製完整復盤文字！' : '📋 一鍵複製完整復盤文字'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmContinueOpen(true)}
          className="min-h-12 rounded-xl border border-indigo-400/50 bg-indigo-950/50 px-4 py-3 text-sm font-extrabold text-indigo-200 hover:bg-indigo-900/50 active:scale-[0.99]"
        >
          ⚖️ 法官強制繼續對局
        </button>
      </section>

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

      {/* 全場身分與存活總覽 */}
      <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <h2 className="text-sm font-bold text-slate-200">全場身分總覽</h2>
        <div className="space-y-2">
          {seats.map((seat) => {
            const role = getRoleById(seat.roleId);
            return (
              <div
                key={seat.seatNumber}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/75 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-100">
                    {formatSeatDisplay(seat)}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {seat.isAlive
                      ? seat.idiotRevealed
                        ? '存活（白痴已翻牌免死）'
                        : '存活至結束'
                      : `第 ${seat.deathRound ?? '?'} 輪出局 · ${formatDeathReason(seat.deathReason)}`}
                  </div>
                </div>
                {role && (
                  <span
                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${getRoleBadgeClasses(role.id)}`}
                  >
                    {role.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 完整時間軸復盤日誌 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <h2 className="text-sm font-bold text-slate-200">完整時間軸復盤日誌</h2>
        <div className="space-y-3">
          {timelineRounds.map(({ round: r, night, day }) => (
            <div
              key={r}
              className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs"
            >
              {night && (
                <div>
                  <div className="font-extrabold text-indigo-300">🌙 第 {r} 晚</div>
                  <ul className="mt-1 space-y-1 text-slate-300">
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
                <div className={night ? 'border-t border-slate-800 pt-2' : ''}>
                  <div className="font-extrabold text-amber-300">☀️ 第 {r} 天</div>
                  <ul className="mt-1.5 space-y-1.5 text-slate-300">
                    {(() => {
                      const remainingVoteEvents = [...(day.structuredEvents ?? [])].filter(
                        (s) => s.voteRecord,
                      );
                      return day.events.map((evt, idx) => {
                        const matchIdx = remainingVoteEvents.findIndex((s) => s.summary === evt);
                        const matched =
                          matchIdx !== -1 ? remainingVoteEvents.splice(matchIdx, 1)[0] : undefined;
                        return (
                          <li key={idx} className="space-y-1">
                            <div>• {evt}</div>
                            {matched?.voteRecord && (
                              <div className="ml-3 space-y-0.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-300">
                                {formatVoteRecordLines(matched.voteRecord).map((line, lIdx) => (
                                  <div key={lIdx}>- {line}</div>
                                ))}
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
          ))}
        </div>
      </section>

      {/* 快速重開操作 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => restartGame({ keepNicknames: true })}
          className="min-h-12 rounded-xl border border-amber-400/50 bg-amber-500/20 px-4 py-3 text-sm font-extrabold text-amber-200 hover:bg-amber-500/30 active:scale-[0.99]"
        >
          保留暱稱並再開一局
        </button>
        <button
          type="button"
          onClick={() => restartGame({ keepNicknames: false })}
          className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700 active:scale-[0.99]"
        >
          全部清空回選板子
        </button>
      </section>
    </div>
  );
}
