import { useMemo, useState } from 'react';
import { getRoleById } from '../../data/roles';
import {
  getEligibleExileVoters,
  tallyExileVotes,
  toggleVoterForCandidate,
  votesByVoterToByCandidate,
} from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatSeatDisplay, getRoleBadgeClasses } from '../common/displayHelpers';

interface ExileVotePanelProps {
  disabled?: boolean;
}

export function ExileVotePanel({ disabled = false }: ExileVotePanelProps) {
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const exilePkCandidates = useGameStore((s) => s.exilePkCandidates);
  const voteInputMode = useGameStore((s) => s.voteInputMode);

  const setVoteInputMode = useGameStore((s) => s.setVoteInputMode);
  const submitExileVotes = useGameStore((s) => s.submitExileVotes);
  const exilePlayer = useGameStore((s) => s.exilePlayer);

  const [votesDraft, setVotesDraft] = useState<Record<number, number | null>>({});
  const [selectedCandidateTab, setSelectedCandidateTab] = useState<number | null>(null);
  const [extraVotes, setExtraVotes] = useState<Record<number, number>>({});
  const [showExtraVotes, setShowExtraVotes] = useState(false);
  const [confirmBallotOpen, setConfirmBallotOpen] = useState(false);
  const [lastTallyNotice, setLastTallyNotice] = useState<string | null>(null);

  // 快速直接放逐折疊區
  const [showQuickExile, setShowQuickExile] = useState(false);
  const [quickExileSeat, setQuickExileSeat] = useState<number | null>(null);
  const [confirmQuickExileOpen, setConfirmQuickExileOpen] = useState(false);

  const isOnlineJudge = hostMode.judgeMode === 'online_judge';
  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const eligibleVoters = useMemo(() => getEligibleExileVoters(seats), [seats]);
  const revealedIdiots = useMemo(
    () => seats.filter((s) => s.isAlive && s.roleId === 'idiot' && s.idiotRevealed),
    [seats],
  );

  const activeSheriffSeat =
    sheriffState.badgeStatus === 'active' ? sheriffState.sheriffSeat : null;

  const targetSeats = useMemo(
    () =>
      exilePkCandidates.length > 0
        ? exilePkCandidates
        : aliveSeats.map((s) => s.seatNumber),
    [exilePkCandidates, aliveSeats],
  );

  const normalizedVotes = useMemo(() => {
    const validTargets = new Set(targetSeats);
    const result: Record<number, number | null> = {};
    for (const voter of eligibleVoters) {
      const picked = votesDraft[voter] ?? null;
      result[voter] = picked !== null && validTargets.has(picked) ? picked : null;
    }
    return result;
  }, [eligibleVoters, votesDraft, targetSeats]);

  const votersByCandidate = useMemo(
    () => votesByVoterToByCandidate(normalizedVotes, targetSeats),
    [normalizedVotes, targetSeats],
  );

  const activeCandidateForTally = useMemo(() => {
    if (selectedCandidateTab !== null && targetSeats.includes(selectedCandidateTab)) {
      return selectedCandidateTab;
    }
    return targetSeats[0] ?? null;
  }, [selectedCandidateTab, targetSeats]);

  const normalizedExtraVotes = useMemo(() => {
    const validTargets = new Set(targetSeats);
    const result: Record<number, number> = {};
    for (const [seatKey, bonus] of Object.entries(extraVotes)) {
      const seatNum = Number(seatKey);
      if (bonus > 0 && validTargets.has(seatNum)) {
        result[seatNum] = bonus;
      }
    }
    return result;
  }, [extraVotes, targetSeats]);

  const tallyPreview = useMemo(() => {
    if (eligibleVoters.length === 0) return null;
    return tallyExileVotes({
      seats,
      votes: normalizedVotes,
      sheriffSeat: activeSheriffSeat,
      extraVotes: normalizedExtraVotes,
      pkCandidates: exilePkCandidates,
      roundIndex: exilePkCandidates.length > 0 ? 2 : 1,
    });
  }, [
    eligibleVoters.length,
    seats,
    normalizedVotes,
    activeSheriffSeat,
    normalizedExtraVotes,
    exilePkCandidates,
  ]);

  const isPkRound = exilePkCandidates.length > 0;
  const quickExileObj = seats.find((s) => s.seatNumber === quickExileSeat);

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-50">
            {isPkRound ? '⚖️ 放逐平票 PK 投票' : '🗳️ 雙模式放逐投票紀錄器'}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            自由切換逐人或依候選人唱票，共用同一份票型草稿（自動套用警長 1.5 票與白痴排權）。
          </p>
        </div>
      </div>

      {/* 雙模式切換器 */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => setVoteInputMode('by_voter')}
          className={`min-h-10 rounded-lg text-xs font-extrabold transition ${
            voteInputMode === 'by_voter'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          方式一：逐人記錄
        </button>
        <button
          type="button"
          onClick={() => setVoteInputMode('by_candidate')}
          className={`min-h-10 rounded-lg text-xs font-extrabold transition ${
            voteInputMode === 'by_candidate'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          方式二：依候選人唱票
        </button>
      </div>

      {isPkRound && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-950/35 px-3 py-2 text-xs font-bold text-amber-200">
          ⚖️ 平票 PK 輪：僅可投給 {exilePkCandidates.join('、')} 號（再平票即平安日）。
        </div>
      )}

      {revealedIdiots.length > 0 && (
        <div className="rounded-xl border border-indigo-400/40 bg-indigo-950/30 px-3 py-2 text-xs text-indigo-200">
          🃏 已翻牌白痴（無投票權）：
          {revealedIdiots.map((s) => `${s.seatNumber} 號`).join('、')}
        </div>
      )}

      {lastTallyNotice && (
        <div className="rounded-xl border border-amber-400/45 bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-200">
          {lastTallyNotice}
        </div>
      )}

      {/* 模式一：逐人記錄 */}
      {voteInputMode === 'by_voter' ? (
        <div className="space-y-2">
          {eligibleVoters.map((voterSeat) => {
            const voterObj = seats.find((s) => s.seatNumber === voterSeat);
            const isSheriff = activeSheriffSeat === voterSeat;
            const selectedTarget = normalizedVotes[voterSeat] ?? null;

            return (
              <div
                key={voterSeat}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-100">
                    {voterObj ? formatSeatDisplay(voterObj) : `${voterSeat} 號`}
                  </span>
                  {isSheriff && (
                    <span className="rounded-md border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                      👮 1.5票
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {targetSeats.map((targetSeat) => {
                    const picked = selectedTarget === targetSeat;
                    return (
                      <button
                        key={targetSeat}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setVotesDraft((prev) => ({
                            ...prev,
                            [voterSeat]: picked ? null : targetSeat,
                          }))
                        }
                        className={`min-h-10 rounded-lg border px-2.5 text-xs font-extrabold transition ${
                          picked
                            ? 'border-amber-400 bg-amber-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {targetSeat}號
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setVotesDraft((prev) => ({
                        ...prev,
                        [voterSeat]: null,
                      }))
                    }
                    className={`min-h-10 rounded-lg border px-2.5 text-xs font-bold transition ${
                      selectedTarget === null
                        ? 'border-slate-500 bg-slate-700 text-slate-100'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    棄票
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 模式二：依候選人唱票勾選 */
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">1. 點選得票候選人：</span>
              <span className="text-slate-400">
                棄票 {tallyPreview?.record.abstainers.length ?? 0} 人
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targetSeats.map((candSeat) => {
                const score = tallyPreview?.record.totals[candSeat] ?? 0;
                const voterCount = votersByCandidate[candSeat]?.length ?? 0;
                const active = activeCandidateForTally === candSeat;
                return (
                  <button
                    key={candSeat}
                    type="button"
                    onClick={() => setSelectedCandidateTab(candSeat)}
                    className={`min-h-11 rounded-xl border px-2.5 text-xs font-extrabold transition ${
                      active
                        ? 'border-amber-400 bg-amber-500 text-slate-950'
                        : voterCount > 0 || score > 0
                          ? 'border-amber-500/40 bg-amber-950/35 text-amber-200'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {candSeat}號{score > 0 ? ` (${score}票)` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {activeCandidateForTally !== null && (
            <div className="space-y-2 rounded-xl border border-amber-500/35 bg-slate-950/80 p-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-200">
                  2. 勾選投給「{activeCandidateForTally} 號」的投票者：
                </span>
                <span className="font-bold text-slate-300">
                  目前 {tallyPreview?.record.totals[activeCandidateForTally] ?? 0} 票
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {eligibleVoters.map((voterSeat) => {
                  const votedFor = normalizedVotes[voterSeat] ?? null;
                  const pickedHere = votedFor === activeCandidateForTally;
                  const pickedOther = votedFor !== null && !pickedHere;
                  const isSheriff = activeSheriffSeat === voterSeat;

                  return (
                    <button
                      key={voterSeat}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setVotesDraft((prev) =>
                          toggleVoterForCandidate(prev, activeCandidateForTally, voterSeat),
                        )
                      }
                      className={`min-h-11 rounded-xl border px-2 py-1.5 text-xs font-extrabold transition ${
                        pickedHere
                          ? 'border-amber-400 bg-amber-500 text-slate-950'
                          : pickedOther
                            ? 'border-slate-700 bg-slate-900/70 text-slate-400'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        {voterSeat}號{isSheriff ? '👮' : ''}
                      </div>
                      {pickedOther && (
                        <div className="text-[10px] font-normal">已投 {votedFor}號</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 預留烏鴉額外 +1 票加票鈕 */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
        <button
          type="button"
          onClick={() => setShowExtraVotes((prev) => !prev)}
          className="flex min-h-10 w-full items-center justify-between text-xs font-bold text-slate-300"
        >
          <span>🐦 額外加票設定（如烏鴉詛咒 +1 票）</span>
          <span className="text-amber-300">
            {Object.keys(normalizedExtraVotes).length > 0
              ? `已加票：${Object.entries(normalizedExtraVotes)
                  .map(([s, v]) => `${s}號+${v}`)
                  .join('、')}`
              : showExtraVotes
                ? '收起'
                : '展開'}
          </span>
        </button>

        {showExtraVotes && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-800 pt-2">
            {targetSeats.map((targetSeat) => {
              const hasBonus = (normalizedExtraVotes[targetSeat] ?? 0) > 0;
              return (
                <button
                  key={targetSeat}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setExtraVotes((prev) => ({
                      ...prev,
                      [targetSeat]: hasBonus ? 0 : 1,
                    }))
                  }
                  className={`min-h-10 rounded-lg border px-3 text-xs font-bold transition ${
                    hasBonus
                      ? 'border-indigo-400 bg-indigo-500/30 text-indigo-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {targetSeat} 號 {hasBonus ? '✓ +1票' : '+1票'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 送出計票 */}
      <button
        type="button"
        disabled={disabled || eligibleVoters.length === 0}
        onClick={() => setConfirmBallotOpen(true)}
        className={`min-h-12 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${
          !disabled && eligibleVoters.length > 0
            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.99]'
            : 'cursor-not-allowed bg-slate-800 text-slate-500'
        }`}
      >
        {isPkRound ? '送出 PK 放逐計票' : '一鍵送出放逐計票'}
      </button>

      {/* 快速手動直接放逐 */}
      <div className="border-t border-slate-800 pt-2">
        <button
          type="button"
          onClick={() => setShowQuickExile((prev) => !prev)}
          className="min-h-10 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          {showQuickExile ? '收起快速指定放逐' : '⚡ 略過票型紀錄，直接指定放逐出局座位'}
        </button>

        {showQuickExile && (
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {aliveSeats.map((seat) => {
                const active = quickExileSeat === seat.seatNumber;
                const role = !isOnlineJudge ? getRoleById(seat.roleId) : undefined;
                return (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setQuickExileSeat((prev) =>
                        prev === seat.seatNumber ? null : seat.seatNumber,
                      )
                    }
                    className={`min-h-12 rounded-xl border p-2 text-left transition ${
                      active
                        ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/40'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-slate-100">
                      {seat.seatNumber} 號
                    </div>
                    <div className="truncate text-[10px] text-slate-400">
                      {seat.nickname.trim() || `${seat.seatNumber}號`}
                    </div>
                    {role && (
                      <span
                        className={`mt-1 inline-block rounded border px-1 py-0.5 text-[9px] font-bold ${getRoleBadgeClasses(role.id)}`}
                      >
                        {role.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={disabled || quickExileSeat === null}
              onClick={() => setConfirmQuickExileOpen(true)}
              className="min-h-12 w-full rounded-xl border border-amber-400/50 bg-amber-500/20 px-4 text-sm font-extrabold text-amber-200 hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500"
            >
              {quickExileObj
                ? `直接放逐 ${formatSeatDisplay(quickExileObj)}`
                : '請先點選要直接放逐的座位'}
            </button>
          </div>
        )}
      </div>

      {/* 確認計票 Modal */}
      <ConfirmModal
        open={confirmBallotOpen && tallyPreview !== null}
        title={isPkRound ? '確認送出放逐 PK 計票？' : '確認送出放逐投票紀錄？'}
        description={
          tallyPreview
            ? tallyPreview.outcome === 'exile'
              ? `最高票為 ${tallyPreview.record.electedSeat} 號（${tallyPreview.record.totals[tallyPreview.record.electedSeat!]} 票），確定送出結算？（若為未翻牌白痴將自動翻牌免死）`
              : tallyPreview.outcome === 'tie'
                ? `平票候選人：${tallyPreview.record.tiedSeats.join('、')} 號，將進入平票 PK 輪。`
                : '本輪無人出局（平安日），確定送出？'
            : undefined
        }
        confirmLabel="確認計票"
        tone="warning"
        onConfirm={() => {
          const tally = submitExileVotes(normalizedVotes, {
            extraVotes: normalizedExtraVotes,
          });
          setVotesDraft({});
          setExtraVotes({});
          if (tally.outcome === 'tie') {
            setLastTallyNotice(
              `⚖️ 放逐投票平票：${tally.record.tiedSeats.join('、')} 號進入 PK 輪，請於發言後進行 PK 投票。`,
            );
          } else if (tally.outcome === 'no_exile') {
            setLastTallyNotice('☀️ 本輪無人得票／再次平票，今日平安日無人出局。');
          } else {
            setLastTallyNotice(null);
          }
          setConfirmBallotOpen(false);
        }}
        onCancel={() => setConfirmBallotOpen(false)}
      >
        {tallyPreview && (
          <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
            {Object.entries(tallyPreview.record.totals)
              .sort(([, a], [, b]) => b - a)
              .map(([seatKey, score]) => {
                const voters = tallyPreview.record.votersByTarget[Number(seatKey)] ?? [];
                return (
                  <div key={seatKey}>
                    • {seatKey} 號：{score} 票（
                    {voters.length > 0 ? voters.map((v) => `${v}號`).join('、') : '無投票'}
                    {tallyPreview.record.extraVotes?.[Number(seatKey)]
                      ? `；含額外 +${tallyPreview.record.extraVotes[Number(seatKey)]} 票`
                      : ''}
                    ）
                  </div>
                );
              })}
            <div>
              • 棄票：
              {tallyPreview.record.abstainers.length > 0
                ? tallyPreview.record.abstainers.map((s) => `${s}號`).join('、')
                : '無'}
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* 快速直接放逐 Modal */}
      <ConfirmModal
        open={confirmQuickExileOpen && quickExileObj !== undefined}
        title="確認執行快速放逐？"
        description={
          quickExileObj
            ? `確定將 ${formatSeatDisplay(quickExileObj)} 放逐投票投出？（若為未翻牌白痴將自動翻牌免死）`
            : undefined
        }
        confirmLabel="確認放逐"
        tone="warning"
        onConfirm={() => {
          if (quickExileSeat !== null) {
            exilePlayer(quickExileSeat);
            setQuickExileSeat(null);
            setLastTallyNotice(null);
          }
          setConfirmQuickExileOpen(false);
        }}
        onCancel={() => setConfirmQuickExileOpen(false)}
      />
    </section>
  );
}
