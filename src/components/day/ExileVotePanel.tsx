import { useMemo, useState } from 'react';
import {
  assignAllVotesToCandidate,
  clearVotesForCandidate,
  getBatch5ExileExtraVotes,
  getEligibleExileVoters,
  getExilePkSpeakingOrder,
  tallyExileVotes,
  toggleVoterForCandidate,
  votesByVoterToByCandidate,
} from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { InlineCountdownTimer } from '../common/InlineCountdownTimer';
import { SlideDrawer } from '../common/SlideDrawer';
import { formatSeatNum, splitSeatsIntoSymmetricColumns } from '../common/displayHelpers';

interface ExileVotePanelProps {
  disabled?: boolean;
}

export function ExileVotePanel({ disabled = false }: ExileVotePanelProps) {
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const speakingMeta = useGameStore((s) => s.speakingMeta);
  const exilePkCandidates = useGameStore((s) => s.exilePkCandidates);
  const exilePkStage = useGameStore((s) => s.exilePkStage ?? 'none');
  const exilePkSpeakingOrder = useGameStore((s) => s.exilePkSpeakingOrder ?? []);
  const voteInputMode = useGameStore((s) => s.voteInputMode);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const finalBatchState = useGameStore((s) => s.finalBatchState);
  const interferenceState = useGameStore((s) => s.interferenceState);

  const setVoteInputMode = useGameStore((s) => s.setVoteInputMode);
  const advanceExilePkToVoting = useGameStore((s) => s.advanceExilePkToVoting);
  const submitExileVotes = useGameStore((s) => s.submitExileVotes);
  const exilePlayer = useGameStore((s) => s.exilePlayer);

  const [votesDraft, setVotesDraft] = useState<Record<number, number | null>>({});
  const [selectedCandidateTab, setSelectedCandidateTab] = useState<number | null>(null);
  const [extraVotes, setExtraVotes] = useState<Record<number, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmBallotOpen, setConfirmBallotOpen] = useState(false);
  const [quickExileSeat, setQuickExileSeat] = useState<number | null>(null);
  const [confirmQuickExileOpen, setConfirmQuickExileOpen] = useState(false);
  const [lastTallyNotice, setLastTallyNotice] = useState<string | null>(null);
  const [pkSpeakerIdx, setPkSpeakerIdx] = useState(0);

  const sheriffVoteWeight = ruleOverrides.sheriffVoteWeight ?? 1.5;
  const isPkRound = exilePkCandidates.length > 0;
  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const eligibleVoters = useMemo(
    () => getEligibleExileVoters(seats, exilePkCandidates),
    [seats, exilePkCandidates],
  );
  const activeSheriffSeat =
    sheriffState.badgeStatus === 'active' ? sheriffState.sheriffSeat : null;

  const targetSeats = useMemo(
    () =>
      exilePkCandidates.length > 0 ? exilePkCandidates : aliveSeats.map((s) => s.seatNumber),
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

  const autoExtraVotes = useMemo(
    () => getBatch5ExileExtraVotes(thirdPartySpecialState),
    [thirdPartySpecialState],
  );

  const normalizedExtraVotes = useMemo(() => {
    const validTargets = new Set(targetSeats);
    const result: Record<number, number> = {};
    for (const [seatKey, bonus] of Object.entries(autoExtraVotes)) {
      const seatNum = Number(seatKey);
      if (bonus > 0 && validTargets.has(seatNum)) {
        result[seatNum] = (result[seatNum] ?? 0) + bonus;
      }
    }
    for (const [seatKey, bonus] of Object.entries(extraVotes)) {
      const seatNum = Number(seatKey);
      if (bonus > 0 && validTargets.has(seatNum)) {
        result[seatNum] = (result[seatNum] ?? 0) + bonus;
      }
    }
    return result;
  }, [autoExtraVotes, extraVotes, targetSeats]);

  const tallyPreview = useMemo(() => {
    if (eligibleVoters.length === 0) return null;
    const raw = tallyExileVotes({
      seats,
      votes: normalizedVotes,
      sheriffSeat: activeSheriffSeat,
      sheriffVoteWeight,
      extraVotes: normalizedExtraVotes,
      pkCandidates: exilePkCandidates,
      roundIndex: isPkRound ? 2 : 1,
      tricksterVoteSwap: interferenceState?.activeTricksterVoteSwap ?? null,
      silencedVoterSeat: finalBatchState?.contrarianSilencedVoterSeat ?? null,
      butlerVoteBonusSeat: thirdPartySpecialState?.butlerActiveVoteBonusSeat ?? null,
      wolfMaidVotePenaltySeat: thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat ?? null,
    });
    const entries = Object.entries(raw.record.totals);
    const maxVotes = entries.reduce((m, [, v]) => Math.max(m, v), 0);
    const topSeats =
      maxVotes > 0
        ? entries
            .filter(([, v]) => v === maxVotes)
            .map(([k]) => Number(k))
            .sort((a, b) => a - b)
        : [];
    return { ...raw, totals: raw.record.totals, topSeats, maxVotes };
  }, [
    seats,
    normalizedVotes,
    activeSheriffSeat,
    sheriffVoteWeight,
    normalizedExtraVotes,
    eligibleVoters.length,
    exilePkCandidates,
    isPkRound,
    interferenceState?.activeTricksterVoteSwap,
    finalBatchState?.contrarianSilencedVoterSeat,
    thirdPartySpecialState?.butlerActiveVoteBonusSeat,
    thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat,
  ]);

  const activeModifierTags = useMemo(() => {
    const tags: string[] = [];
    if (finalBatchState?.contrarianSilencedVoterSeat != null) {
      tags.push(`開槓禁票 ${formatSeatNum(finalBatchState.contrarianSilencedVoterSeat)} 號`);
    }
    if (thirdPartySpecialState?.butlerActiveVoteBonusSeat != null) {
      tags.push(`管家加票 ${formatSeatNum(thirdPartySpecialState.butlerActiveVoteBonusSeat)} 號(+1)`);
    }
    if (thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat != null) {
      tags.push(`狼僕減票 ${formatSeatNum(thirdPartySpecialState.wolfMaidActiveVotePenaltySeat)} 號(-1)`);
    }
    if (thirdPartySpecialState?.crowActiveCursedSeat != null) {
      tags.push(`烏鴉詛咒 ${formatSeatNum(thirdPartySpecialState.crowActiveCursedSeat)} 號(+1)`);
    }
    if (interferenceState?.activeTricksterVoteSwap) {
      tags.push(
        `詭術換票 ${formatSeatNum(interferenceState.activeTricksterVoteSwap[0])}↔${formatSeatNum(interferenceState.activeTricksterVoteSwap[1])}`,
      );
    }
    return tags;
  }, [finalBatchState, thirdPartySpecialState, interferenceState]);

  const targetSeatObjects = useMemo(
    () => targetSeats.map((num) => seats.find((s) => s.seatNumber === num)).filter(Boolean) as typeof seats,
    [targetSeats, seats],
  );
  const { left: leftTargets, right: rightTargets } = splitSeatsIntoSymmetricColumns(targetSeatObjects);

  const handleToggleVoter = (voterSeat: number) => {
    if (disabled || activeCandidateForTally === null) return;
    setVotesDraft((prev) =>
      toggleVoterForCandidate(prev, activeCandidateForTally, voterSeat),
    );
  };

  const handleConfirmBallot = () => {
    setConfirmBallotOpen(false);
    const res = submitExileVotes(normalizedVotes, {
      extraVotes: normalizedExtraVotes,
      sheriffVoteWeight,
    });
    setVotesDraft({});
    setExtraVotes({});
    setPkSpeakerIdx(0);
    if (res.outcome === 'exile' && res.record.electedSeat !== null) {
      setLastTallyNotice(`放逐結果：${formatSeatNum(res.record.electedSeat)} 號出局`);
    } else if (res.outcome === 'tie') {
      setLastTallyNotice(`平票 PK：${res.record.tiedSeats.map(formatSeatNum).join('、')} 號`);
    } else if (res.outcome === 'no_exile') {
      setLastTallyNotice('平安日（無人出局）');
    } else {
      setLastTallyNotice('已結算放逐結果');
    }
  };

  const pkSet = useMemo(() => new Set(exilePkCandidates), [exilePkCandidates]);
  const ineligibleAliveSeats = useMemo(
    () =>
      aliveSeats.filter(
        (s) =>
          (s.roleId === 'idiot' && s.statuses.idiotRevealed) ||
          Boolean(s.statuses.petrified) ||
          (isPkRound && pkSet.has(s.seatNumber)),
      ),
    [aliveSeats, isPkRound, pkSet],
  );
  const abstainerCount = useMemo(
    () => eligibleVoters.filter((v) => normalizedVotes[v] === null).length,
    [eligibleVoters, normalizedVotes],
  );

  const handleAllVotesForCandidate = (candidateSeat: number) => {
    if (disabled) return;
    setSelectedCandidateTab(candidateSeat);
    setVotesDraft(assignAllVotesToCandidate(eligibleVoters, candidateSeat));
  };

  const handleClearVotesForCandidate = (candidateSeat: number) => {
    if (disabled) return;
    setVotesDraft((prev) => clearVotesForCandidate(prev, candidateSeat));
  };

  // 平票 PK 發言階段（依當天白天發言逆序發言 → 完成後進入非 PK 重投）
  if (isPkRound && exilePkStage === 'pk_speaking') {
    const pkOrder =
      exilePkSpeakingOrder.length > 0
        ? exilePkSpeakingOrder
        : getExilePkSpeakingOrder(
            speakingMeta?.queue && speakingMeta.queue.length > 0
              ? speakingMeta.queue
              : speakingQueue,
            exilePkCandidates,
          );
    const clampedIdx = Math.min(pkSpeakerIdx, pkOrder.length);
    const currentPkSeat = clampedIdx < pkOrder.length ? pkOrder[clampedIdx] : null;

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-sheriff">放逐平票 · PK 逆序發言</span>
          <span className="text-[12px] text-secondary">依白天發言順序逆序</span>
        </div>

        <div className="space-y-2 rounded-lg border border-sheriff-border bg-surface p-3">
          <div className="text-[12px] text-secondary">
            平票候選人 PK 發言順序（發言結束後由非 PK 玩家重新投票）：
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pkOrder.map((seatNum, idx) => {
              const isCurrent = idx === clampedIdx;
              const isDone = idx < clampedIdx;
              return (
                <span
                  key={seatNum}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-[14px] font-semibold tabular-nums ${
                    isCurrent
                      ? 'bg-sheriff text-inverse'
                      : isDone
                        ? 'border border-subtle bg-canvas text-muted opacity-55'
                        : 'border border-sheriff-border bg-sheriff-tint text-sheriff'
                  }`}
                >
                  <span className="text-[12px] opacity-80">{idx + 1}.</span>
                  {formatSeatNum(seatNum)} 號
                </span>
              );
            })}
          </div>
        </div>

        <InlineCountdownTimer
          title="放逐 PK 發言倒數"
          initialSeconds={60}
          presets={[30, 60, 90]}
          currentSpeakerLabel={
            currentPkSeat !== null
              ? `${formatSeatNum(currentPkSeat)} 號（第 ${clampedIdx + 1} / ${pkOrder.length} 位）`
              : '全體 PK 候選人發言完畢'
          }
          canPrev={clampedIdx > 0}
          canNext={clampedIdx < pkOrder.length - 1}
          onPrev={() => setPkSpeakerIdx((prev) => Math.max(0, prev - 1))}
          onNext={() =>
            setPkSpeakerIdx((prev) => Math.min(Math.max(0, pkOrder.length - 1), prev + 1))
          }
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setVotesDraft({});
            setPkSpeakerIdx(0);
            advanceExilePkToVoting();
          }}
          className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
        >
          PK 發言完畢 → 進入 PK 重新投票
        </button>
      </section>
    );
  }

  const renderTargetRow = (seat: (typeof seats)[number]) => {
    const isActive = activeCandidateForTally === seat.seatNumber;
    const total = tallyPreview?.totals[seat.seatNumber] ?? 0;
    const extra = normalizedExtraVotes[seat.seatNumber] ?? 0;
    const isTop = tallyPreview?.topSeats.includes(seat.seatNumber) && total > 0;

    return (
      <div
        key={seat.seatNumber}
        className={`flex h-12 w-full items-center justify-between gap-1 rounded-md px-2 transition ${
          isActive
            ? 'border-selected-sheriff bg-sheriff-tint text-primary'
            : 'border border-subtle bg-surface text-primary hover:border-strong'
        }`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelectedCandidateTab(seat.seatNumber)}
          className="flex h-full min-w-0 flex-1 items-center justify-between gap-1.5 text-left"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="w-6 shrink-0 text-[14px] font-semibold tabular-nums">
              {formatSeatNum(seat.seatNumber)}
            </span>
            <span className="truncate text-[12px] text-secondary">
              {seat.nickname.trim() || `${seat.seatNumber}號`}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 tabular-nums">
            {extra > 0 && (
              <span className="text-[12px] font-semibold text-third">+{extra}</span>
            )}
            <span
              className={`text-[18px] font-semibold leading-none ${
                isTop ? 'text-wolf' : total > 0 ? 'text-primary' : 'text-muted'
              }`}
            >
              {total}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-2.5">
      {/* 頂部精簡列：標題／PK 標記 ＋ 外置計票模式切換 ＋ 右上角選單 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[14px] font-semibold text-primary">
            {exilePkCandidates.length > 0 ? 'PK 投票' : '放逐計票'}
          </span>
          {tallyPreview && tallyPreview.topSeats.length > 0 && tallyPreview.maxVotes > 0 && (
            <span className="truncate text-[12px] font-semibold tabular-nums text-wolf">
              領先 {tallyPreview.topSeats.map(formatSeatNum).join('/')}（{tallyPreview.maxVotes}）
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="min-h-10 shrink-0 rounded-md border border-subtle bg-surface px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          更多
        </button>
      </div>

      {/* 計票模式切換直接外移至主畫面 */}
      <div className="grid grid-cols-2 gap-1 rounded-md border border-subtle bg-canvas p-1">
        <button
          type="button"
          onClick={() => setVoteInputMode('by_candidate')}
          className={`min-h-10 rounded-md text-[12px] font-semibold transition ${
            voteInputMode === 'by_candidate'
              ? 'bg-elevated text-sheriff'
              : 'text-secondary hover:text-primary'
          }`}
        >
          依候選人點票
        </button>
        <button
          type="button"
          onClick={() => setVoteInputMode('by_voter')}
          className={`min-h-10 rounded-md text-[12px] font-semibold transition ${
            voteInputMode === 'by_voter'
              ? 'bg-elevated text-sheriff'
              : 'text-secondary hover:text-primary'
          }`}
        >
          逐號點選
        </button>
      </div>

      {activeModifierTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded border border-subtle bg-surface px-2.5 py-2">
          {activeModifierTags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-info/40 bg-info-tint/60 px-2 py-0.5 text-[11px] font-semibold text-info"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {lastTallyNotice && (
        <div className="border-l-2 border-sheriff bg-surface px-3 py-1.5 text-[12px] font-semibold text-sheriff tabular-nums">
          {lastTallyNotice}
        </div>
      )}

      {/* 候選座位雙欄票數表（右側大號 tabular-nums 票數 ＋ +1 小標記） */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col gap-1.5">{leftTargets.map(renderTargetRow)}</div>
        <div className="flex flex-col gap-1.5">{rightTargets.map(renderTargetRow)}</div>
      </div>

      {/* 投給當前焦點候選人的投票人點選區 */}
      {ineligibleAliveSeats.length > 0 && (
        <div className="text-[12px] text-muted tabular-nums">
          無投票權（已排除）：
          {ineligibleAliveSeats
            .map((s) => {
              const tag =
                isPkRound && pkSet.has(s.seatNumber)
                  ? 'PK候選人'
                  : s.statuses.petrified
                    ? '石化'
                    : '白痴已翻牌';
              return `${formatSeatNum(s.seatNumber)}號(${tag})`;
            })
            .join('、')}
        </div>
      )}

      <div className="flex items-center justify-between text-[12px] text-secondary tabular-nums">
        <span>
          已投 {eligibleVoters.length - abstainerCount} 人 · 棄票 {abstainerCount} 人
        </span>
        {activeSheriffSeat !== null && (
          <span className="font-semibold text-sheriff">
            警長 {formatSeatNum(activeSheriffSeat)} 號（{sheriffVoteWeight} 票）
          </span>
        )}
      </div>

      {voteInputMode === 'by_candidate' && activeCandidateForTally !== null && (
        <div className="space-y-1.5 border-t border-subtle pt-2">
          <div className="flex items-center justify-between gap-2 text-[12px] text-secondary tabular-nums">
            <span className="truncate">
              投給{' '}
              <strong className="text-sheriff">{formatSeatNum(activeCandidateForTally)} 號</strong>{' '}
              （{(votersByCandidate[activeCandidateForTally] ?? []).length} 人）
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                disabled={disabled || eligibleVoters.length === 0}
                onClick={() => handleAllVotesForCandidate(activeCandidateForTally)}
                className="min-h-9 rounded-md border border-sheriff-border bg-sheriff-tint px-2.5 text-[12px] font-semibold text-sheriff hover:opacity-90 disabled:opacity-40"
              >
                全票
              </button>
              <button
                type="button"
                disabled={disabled || (votersByCandidate[activeCandidateForTally] ?? []).length === 0}
                onClick={() => handleClearVotesForCandidate(activeCandidateForTally)}
                className="min-h-9 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-semibold text-secondary hover:border-wolf-border hover:text-wolf disabled:opacity-40"
              >
                全取消
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {eligibleVoters.map((voterSeat) => {
              const votedTarget = normalizedVotes[voterSeat] ?? null;
              const isForActive = votedTarget === activeCandidateForTally;
              const isForOther = votedTarget !== null && !isForActive;
              const isSheriff = activeSheriffSeat === voterSeat;
              return (
                <button
                  key={voterSeat}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleToggleVoter(voterSeat)}
                  className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
                    isForActive
                      ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                      : isForOther
                        ? 'border border-subtle bg-canvas text-muted opacity-55'
                        : 'border border-subtle bg-surface text-primary hover:border-strong'
                  }`}
                >
                  {formatSeatNum(voterSeat)}
                  {isSheriff && <span className="ml-0.5 text-[12px] text-sheriff">*</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {voteInputMode === 'by_voter' && (
        <div className="divide-y divide-subtle border-t border-subtle pt-1">
          {eligibleVoters.map((voterSeat) => {
            const picked = normalizedVotes[voterSeat] ?? null;
            return (
              <div key={voterSeat} className="flex items-center justify-between gap-2 py-2">
                <span className="w-10 shrink-0 text-[14px] font-semibold tabular-nums text-primary">
                  {formatSeatNum(voterSeat)}
                </span>
                <div className="flex flex-1 flex-wrap justify-end gap-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setVotesDraft((prev) => ({
                        ...prev,
                        [voterSeat]: null,
                      }))
                    }
                    className={`min-h-9 rounded-md px-2 text-[12px] font-semibold ${
                      picked === null
                        ? 'border-selected-wolf bg-wolf-tint text-wolf'
                        : 'border border-subtle bg-canvas text-muted'
                    }`}
                  >
                    棄票
                  </button>
                  {targetSeats.map((target) => (
                    <button
                      key={target}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setVotesDraft((prev) => ({
                          ...prev,
                          [voterSeat]: prev[voterSeat] === target ? null : target,
                        }))
                      }
                      className={`min-h-9 min-w-9 rounded-md px-2 text-[12px] font-semibold tabular-nums ${
                        picked === target
                          ? 'bg-sheriff text-inverse'
                          : 'border border-subtle bg-canvas text-secondary'
                      }`}
                    >
                      {formatSeatNum(target)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 底部單一主按鈕：確認放逐結果 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirmBallotOpen(true)}
        className={`min-h-12 w-full rounded-md px-4 text-[14px] font-semibold transition ${
          disabled
            ? 'cursor-not-allowed bg-elevated text-muted'
            : 'bg-sheriff text-inverse hover:opacity-90'
        }`}
      >
        確認放逐結果
      </button>

      {/* 右上角計票選單抽屜（清空草稿、計票模式、附加票調整、直接放逐、撤銷） */}
      <SlideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="計票選單">
        <div className="divide-y divide-subtle">
          <div className="space-y-2 py-3">
            <div className="text-[12px] font-semibold text-secondary">計票方式</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setVoteInputMode('by_candidate')}
                className={`min-h-11 rounded-md text-[14px] font-semibold ${
                  voteInputMode === 'by_candidate'
                    ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                    : 'border border-subtle bg-canvas text-secondary'
                }`}
              >
                依候選人點票
              </button>
              <button
                type="button"
                onClick={() => setVoteInputMode('by_voter')}
                className={`min-h-11 rounded-md text-[14px] font-semibold ${
                  voteInputMode === 'by_voter'
                    ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                    : 'border border-subtle bg-canvas text-secondary'
                }`}
              >
                逐號填寫
              </button>
            </div>
          </div>

          <div className="space-y-2 py-3">
            <div className="text-[12px] font-semibold text-secondary">特殊附加票（+1）</div>
            <div className="grid grid-cols-3 gap-1.5">
              {targetSeats.map((seatNum) => {
                const count = extraVotes[seatNum] ?? 0;
                return (
                  <div
                    key={seatNum}
                    className="flex items-center justify-between rounded-md border border-subtle bg-canvas px-2 py-1.5"
                  >
                    <span className="text-[12px] font-semibold tabular-nums text-primary">
                      {formatSeatNum(seatNum)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExtraVotes((prev) => ({
                            ...prev,
                            [seatNum]: Math.max(0, (prev[seatNum] ?? 0) - 1),
                          }))
                        }
                        className="min-h-8 min-w-8 rounded bg-surface text-[12px] text-secondary"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-[12px] font-semibold tabular-nums text-third">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExtraVotes((prev) => ({
                            ...prev,
                            [seatNum]: (prev[seatNum] ?? 0) + 1,
                          }))
                        }
                        className="min-h-8 min-w-8 rounded bg-surface text-[12px] text-secondary"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 py-3">
            <div className="text-[12px] font-semibold text-secondary">快速直接放逐</div>
            <div className="grid grid-cols-4 gap-1.5">
              {aliveSeats.map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  onClick={() => setQuickExileSeat(s.seatNumber)}
                  className={`min-h-10 rounded-md text-[12px] font-semibold tabular-nums ${
                    quickExileSeat === s.seatNumber
                      ? 'border-selected-wolf bg-wolf-tint text-wolf'
                      : 'border border-subtle bg-canvas text-secondary'
                  }`}
                >
                  {formatSeatNum(s.seatNumber)}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={disabled || quickExileSeat === null}
              onClick={() => setConfirmQuickExileOpen(true)}
              className="min-h-11 w-full rounded-md bg-wolf text-[14px] font-semibold text-primary disabled:bg-elevated disabled:text-muted"
            >
              {quickExileSeat !== null
                ? `直接放逐 ${formatSeatNum(quickExileSeat)} 號`
                : '選擇直接放逐座位'}
            </button>
          </div>

          <div className="flex gap-2 py-3">
            <button
              type="button"
              onClick={() => {
                setVotesDraft({});
                setExtraVotes({});
                setMenuOpen(false);
              }}
              className="min-h-11 flex-1 rounded-md border border-subtle bg-canvas text-[12px] font-semibold text-secondary hover:text-primary"
            >
              清空草稿
            </button>
          </div>
        </div>
      </SlideDrawer>

      <ConfirmModal
        open={confirmBallotOpen}
        title="確認放逐結果"
        description={
          tallyPreview && tallyPreview.topSeats.length === 1 && tallyPreview.maxVotes > 0
            ? `最高票 ${formatSeatNum(tallyPreview.topSeats[0])} 號（${tallyPreview.maxVotes} 票）將放逐出局。`
            : tallyPreview && tallyPreview.topSeats.length > 1 && tallyPreview.maxVotes > 0
              ? isPkRound
                ? `PK 投票再次平票（${tallyPreview.topSeats.map(formatSeatNum).join('、')} 號，${tallyPreview.maxVotes} 票），將判定平安日（無人出局）。`
                : `平票 ${tallyPreview.topSeats.map(formatSeatNum).join('、')} 號（${tallyPreview.maxVotes} 票），將進入平票 PK 逆序發言。`
              : '無人得票，將判定平安日。'
        }
        confirmLabel="確認結算"
        tone="warning"
        onConfirm={handleConfirmBallot}
        onCancel={() => setConfirmBallotOpen(false)}
      />

      <ConfirmModal
        open={confirmQuickExileOpen && quickExileSeat !== null}
        title="確認直接放逐"
        description={
          quickExileSeat !== null ? `將直接宣告 ${formatSeatNum(quickExileSeat)} 號放逐出局。` : undefined
        }
        confirmLabel="確認放逐"
        tone="danger"
        onConfirm={() => {
          if (quickExileSeat !== null) {
            exilePlayer(quickExileSeat);
            setQuickExileSeat(null);
            setMenuOpen(false);
          }
          setConfirmQuickExileOpen(false);
        }}
        onCancel={() => setConfirmQuickExileOpen(false)}
      />
    </div>
  );
}
