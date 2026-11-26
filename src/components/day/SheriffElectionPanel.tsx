import { useMemo, useState } from 'react';
import {
  assignAllVotesToCandidate,
  getEligibleSheriffVoters,
  getSheriffPkSpeakingOrder,
  isSheriffElectionActive,
  toggleVoterForCandidate,
  votesByVoterToByCandidate,
} from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { InlineCountdownTimer } from '../common/InlineCountdownTimer';
import { formatSeatNum } from '../common/displayHelpers';

interface SheriffElectionPanelProps {
  disabled?: boolean;
}

export function SheriffElectionPanel({ disabled = false }: SheriffElectionPanelProps) {
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const speakingMeta = useGameStore((s) => s.speakingMeta);
  const voteInputMode = useGameStore((s) => s.voteInputMode);

  const setVoteInputMode = useGameStore((s) => s.setVoteInputMode);
  const startSheriffElection = useGameStore((s) => s.startSheriffElection);
  const advanceSheriffToVoting = useGameStore((s) => s.advanceSheriffToVoting);
  const advanceSheriffPkToVoting = useGameStore((s) => s.advanceSheriffPkToVoting);
  const withdrawSheriffCandidate = useGameStore((s) => s.withdrawSheriffCandidate);
  const submitSheriffVotes = useGameStore((s) => s.submitSheriffVotes);

  const [selectedSignupSeats, setSelectedSignupSeats] = useState<number[]>([]);
  const [votesDraft, setVotesDraft] = useState<Record<number, number | null>>({});
  const [selectedCandidateTab, setSelectedCandidateTab] = useState<number | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [pendingWithdrawSeat, setPendingWithdrawSeat] = useState<number | null>(null);
  const [lastOutcomeNotice, setLastOutcomeNotice] = useState<string | null>(null);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const electionActive = isSheriffElectionActive(sheriffState);

  const activeCandidates = useMemo(
    () =>
      sheriffState.pkCandidates.length > 0 ? sheriffState.pkCandidates : sheriffState.candidates,
    [sheriffState],
  );

  const eligibleVoters = useMemo(
    () => (electionActive ? getEligibleSheriffVoters(sheriffState, seats) : []),
    [electionActive, sheriffState, seats],
  );

  const isPkRound =
    sheriffState.status === 'pk_speaking' ||
    sheriffState.status === 'pk_voting' ||
    sheriffState.pkCandidates.length > 0;

  const lockedOutVoters = useMemo(() => {
    const excluded = isPkRound
      ? new Set(sheriffState.pkCandidates)
      : new Set([...sheriffState.candidates, ...sheriffState.withdrawnSeats]);
    return aliveSeats
      .filter((s) => excluded.has(s.seatNumber))
      .map((s) => s.seatNumber)
      .sort((a, b) => a - b);
  }, [aliveSeats, isPkRound, sheriffState.pkCandidates, sheriffState.candidates, sheriffState.withdrawnSeats]);

  const normalizedVotes = useMemo(() => {
    const validTargets = new Set(activeCandidates);
    const result: Record<number, number | null> = {};
    for (const voter of eligibleVoters) {
      const picked = votesDraft[voter] ?? null;
      result[voter] = picked !== null && validTargets.has(picked) ? picked : null;
    }
    return result;
  }, [eligibleVoters, votesDraft, activeCandidates]);

  const votersByCandidate = useMemo(
    () => votesByVoterToByCandidate(normalizedVotes, activeCandidates),
    [normalizedVotes, activeCandidates],
  );

  const activeCandidateForTally = useMemo(() => {
    if (selectedCandidateTab !== null && activeCandidates.includes(selectedCandidateTab)) {
      return selectedCandidateTab;
    }
    return activeCandidates[0] ?? null;
  }, [selectedCandidateTab, activeCandidates]);

  if (!ruleOverrides.enableSheriff && sheriffState.status === 'not_started') {
    return (
      <div className="py-6 text-center text-[14px] text-secondary">本局已關閉警長競選</div>
    );
  }

  if (round > 1 && sheriffState.status === 'not_started') {
    return <div className="py-6 text-center text-[14px] text-secondary">本局無警長</div>;
  }

  // 警長競選已結束（當選／吞警徽／流失）
  if (
    sheriffState.status === 'elected' ||
    sheriffState.status === 'swallowed' ||
    sheriffState.status === 'no_sheriff'
  ) {
    return (
      <section className="space-y-2 rounded-lg border border-subtle bg-surface p-3.5">
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-secondary">警長競選結果</span>
          {sheriffState.badgeStatus === 'active' && sheriffState.sheriffSeat !== null ? (
            <span className="font-semibold tabular-nums text-sheriff">
              警長 {formatSeatNum(sheriffState.sheriffSeat)} 號（1.5 票）
            </span>
          ) : sheriffState.badgeStatus === 'swallowed' ? (
            <span className="font-semibold text-wolf">警上自爆吞警徽</span>
          ) : sheriffState.badgeStatus === 'destroyed' ? (
            <span className="text-muted">警徽已撕毀</span>
          ) : (
            <span className="text-muted">警徽流失（本局無警長）</span>
          )}
        </div>
        {lastOutcomeNotice && (
          <p className="text-[12px] text-sheriff">{lastOutcomeNotice}</p>
        )}
      </section>
    );
  }

  // 步驟 A：上警報名
  if (sheriffState.status === 'not_started') {
    const toggleCandidate = (seatNumber: number) => {
      setSelectedSignupSeats((prev) =>
        prev.includes(seatNumber)
          ? prev.filter((s) => s !== seatNumber)
          : [...prev, seatNumber].sort((a, b) => a - b),
      );
    };

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[14px] font-semibold text-primary">步驟 A · 勾選上警名單</span>
          <span className="text-secondary">
            {ruleOverrides.badgeSwallowRule === 'double_explode' ? '雙爆吞徽' : '單爆吞徽'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {aliveSeats.map((seat) => {
            const active = selectedSignupSeats.includes(seat.seatNumber);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={disabled}
                onClick={() => toggleCandidate(seat.seatNumber)}
                className={`min-h-12 rounded-md px-2.5 text-left transition ${
                  active
                    ? 'border-selected-sheriff bg-sheriff-tint text-primary'
                    : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                <div className="text-[14px] font-semibold tabular-nums text-primary">
                  {formatSeatNum(seat.seatNumber)}
                </div>
                <div className="truncate text-[12px] text-secondary">
                  {seat.nickname.trim() || `${seat.seatNumber}號`}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            startSheriffElection(selectedSignupSeats);
            setVotesDraft({});
            setLastOutcomeNotice(null);
          }}
          className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
        >
          {selectedSignupSeats.length === 0
            ? '無人上警（警徽流失）'
            : selectedSignupSeats.length === 1
              ? `${formatSeatNum(selectedSignupSeats[0])} 號自動當選`
              : `確認上警（${selectedSignupSeats.length} 人）→ 開始發言`}
        </button>
      </section>
    );
  }

  // 步驟 B：競選發言與退水
  if (sheriffState.status === 'speaking') {
    const order =
      sheriffState.initialSpeakingOrder && sheriffState.initialSpeakingOrder.length > 0
        ? sheriffState.initialSpeakingOrder.filter((sn) => sheriffState.candidates.includes(sn))
        : speakingQueue.filter((sn) => sheriffState.candidates.includes(sn));
    const dirLabel = speakingMeta?.direction === 'counterclockwise' ? '逆時針' : '順時針';

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-primary">步驟 B · 上警競選發言</span>
          <span className="text-[12px] font-semibold text-sheriff">{dirLabel}</span>
        </div>

        <div className="space-y-2 rounded-lg border border-subtle bg-surface p-3">
          <div className="text-[12px] text-secondary">
            發言順序（點擊候選人可隨時「退水」）：
          </div>
          <div className="flex flex-wrap gap-1.5">
            {order.map((seatNum, idx) => (
              <div
                key={seatNum}
                className="flex items-center gap-1.5 rounded-md border border-subtle bg-canvas px-2.5 py-1.5"
              >
                <span className="text-[12px] text-muted tabular-nums">{idx + 1}.</span>
                <span className="text-[14px] font-semibold tabular-nums text-primary">
                  {formatSeatNum(seatNum)} 號
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setPendingWithdrawSeat(seatNum)}
                  className="min-h-8 rounded border border-subtle bg-surface px-2 text-[12px] text-secondary hover:border-wolf-border hover:text-wolf"
                >
                  退水
                </button>
              </div>
            ))}
          </div>
          {sheriffState.withdrawnSeats.length > 0 && (
            <div className="border-t border-subtle pt-2 text-[12px] text-muted tabular-nums">
              已退水（首輪無投票權，PK 時恢復）：{sheriffState.withdrawnSeats.map(formatSeatNum).join('、')} 號
            </div>
          )}
        </div>

        <InlineCountdownTimer title="警上競選發言倒數" />

        <button
          type="button"
          disabled={disabled}
          onClick={advanceSheriffToVoting}
          className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
        >
          發言完畢 → 進入警下投票
        </button>

        <ConfirmModal
          open={pendingWithdrawSeat !== null}
          title="確認退水"
          description={
            pendingWithdrawSeat !== null
              ? `${formatSeatNum(pendingWithdrawSeat)} 號退出警長競選（失去警下投票權）。`
              : undefined
          }
          confirmLabel="確認退水"
          tone="warning"
          onConfirm={() => {
            if (pendingWithdrawSeat !== null) {
              withdrawSheriffCandidate(pendingWithdrawSeat);
            }
            setPendingWithdrawSeat(null);
          }}
          onCancel={() => setPendingWithdrawSeat(null)}
        />
      </section>
    );
  }

  // 步驟 D-1：平票 PK 逆序發言
  if (sheriffState.status === 'pk_speaking') {
    const pkOrder = getSheriffPkSpeakingOrder(
      sheriffState.initialSpeakingOrder,
      sheriffState.pkCandidates,
    );

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-sheriff">步驟 D · 警長平票 PK 發言</span>
          <span className="text-[12px] text-secondary">依上警發言逆序</span>
        </div>

        <div className="space-y-2 rounded-lg border border-sheriff-border bg-surface p-3">
          <div className="text-[12px] text-secondary">PK 逆序發言名單：</div>
          <div className="flex flex-wrap gap-1.5">
            {pkOrder.map((seatNum, idx) => (
              <span
                key={seatNum}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-sheriff-border bg-sheriff-tint px-3 text-[14px] font-semibold tabular-nums text-sheriff"
              >
                <span className="text-[12px] text-secondary">{idx + 1}.</span>
                {formatSeatNum(seatNum)} 號
              </span>
            ))}
          </div>
        </div>

        <InlineCountdownTimer title="警長平票 PK 發言倒數" />

        <button
          type="button"
          disabled={disabled}
          onClick={advanceSheriffPkToVoting}
          className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
        >
          PK 發言完畢 → 進入 PK 投票
        </button>
      </section>
    );
  }

  // 步驟 C（警下投票）與步驟 D-2（PK 投票）
  const isPk = sheriffState.status === 'pk_voting' || sheriffState.pkCandidates.length > 0;
  const isDeferredContinuation =
    sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1;

  const handleConfirmSubmit = () => {
    setConfirmSubmitOpen(false);
    const res = submitSheriffVotes(normalizedVotes);
    setVotesDraft({});
    if (res.outcome === 'elected' && res.record.electedSeat !== null) {
      setLastOutcomeNotice(`${formatSeatNum(res.record.electedSeat)} 號當選警長`);
    } else if (res.outcome === 'pk') {
      setLastOutcomeNotice(`平票 PK：${res.record.tiedSeats.map(formatSeatNum).join('、')} 號`);
    } else {
      setLastOutcomeNotice('警徽流失（本局無警長）');
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-semibold text-primary">
          {isPk ? '步驟 D · 警長 PK 投票' : '步驟 C · 警下投票'}
        </span>
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

      {isDeferredContinuation && (
        <div className="border-l-2 border-wolf bg-wolf-tint px-3 py-1.5 text-[12px] font-semibold text-wolf">
          雙爆首爆續選：跳過發言直接退水與投票
        </div>
      )}

      {/* 候選人列（含票數、全票快捷與退水鍵） */}
      <div className="grid grid-cols-2 gap-1.5">
        {activeCandidates.map((seatNum) => {
          const isActive = activeCandidateForTally === seatNum;
          const voteCount = (votersByCandidate[seatNum] ?? []).length;
          return (
            <div
              key={seatNum}
              className={`flex h-12 items-center justify-between gap-1 rounded-md px-2 ${
                isActive
                  ? 'border-selected-sheriff bg-sheriff-tint'
                  : 'border border-subtle bg-surface'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedCandidateTab(seatNum)}
                className="flex h-full min-w-0 flex-1 items-center justify-between pr-1 text-left"
              >
                <span className="text-[14px] font-semibold tabular-nums text-primary">
                  {formatSeatNum(seatNum)} 號
                </span>
                <span className="text-[18px] font-semibold tabular-nums text-sheriff">
                  {voteCount}
                </span>
              </button>
              {voteInputMode === 'by_candidate' && (
                <button
                  type="button"
                  disabled={disabled || eligibleVoters.length === 0}
                  onClick={() => {
                    setSelectedCandidateTab(seatNum);
                    setVotesDraft(assignAllVotesToCandidate(eligibleVoters, seatNum));
                  }}
                  className="min-h-8 shrink-0 rounded border border-subtle bg-canvas px-1.5 text-[12px] font-semibold text-secondary hover:border-sheriff-border hover:text-sheriff disabled:opacity-40"
                >
                  全票
                </button>
              )}
              {!isPk && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setPendingWithdrawSeat(seatNum)}
                  className="min-h-8 shrink-0 rounded border border-subtle bg-canvas px-1.5 text-[12px] text-secondary hover:border-wolf-border hover:text-wolf"
                >
                  退水
                </button>
              )}
            </div>
          );
        })}
      </div>

      {lockedOutVoters.length > 0 && (
        <div className="text-[12px] text-muted tabular-nums">
          {isPk
            ? `無投票權（平票 PK 候選人，退水玩家已恢復投票權）：${lockedOutVoters.map(formatSeatNum).join('、')} 號`
            : `無投票權（上警／退水已鎖定）：${lockedOutVoters.map(formatSeatNum).join('、')} 號`}
        </div>
      )}

      {/* 警下投票人點選（僅警下且未退水玩家） */}
      {eligibleVoters.length === 0 ? (
        <div className="border-l-2 border-subtle pl-3 text-[12px] text-muted">
          全員上警或退水，無警下投票人（結算將警徽流失）。
        </div>
      ) : voteInputMode === 'by_candidate' && activeCandidateForTally !== null ? (
        <div className="space-y-1.5 border-t border-subtle pt-2">
          <div className="text-[12px] text-secondary tabular-nums">
            點選投給 <strong className="text-sheriff">{formatSeatNum(activeCandidateForTally)} 號</strong> 的警下座位
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {eligibleVoters.map((voterSeat) => {
              const target = normalizedVotes[voterSeat] ?? null;
              const isForActive = target === activeCandidateForTally;
              const isForOther = target !== null && !isForActive;
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
                  className={`min-h-11 rounded-md text-[14px] font-semibold tabular-nums transition ${
                    isForActive
                      ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                      : isForOther
                        ? 'border border-subtle bg-canvas text-muted opacity-55'
                        : 'border border-subtle bg-surface text-primary hover:border-strong'
                  }`}
                >
                  {formatSeatNum(voterSeat)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
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
                  {activeCandidates.map((cand) => (
                    <button
                      key={cand}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setVotesDraft((prev) => ({
                          ...prev,
                          [voterSeat]: prev[voterSeat] === cand ? null : cand,
                        }))
                      }
                      className={`min-h-9 min-w-9 rounded-md px-2 text-[12px] font-semibold tabular-nums ${
                        picked === cand
                          ? 'bg-sheriff text-inverse'
                          : 'border border-subtle bg-canvas text-secondary'
                      }`}
                    >
                      {formatSeatNum(cand)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirmSubmitOpen(true)}
        className="min-h-12 w-full rounded-md bg-sheriff px-4 text-[14px] font-semibold text-inverse transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
      >
        {isPk ? '確認 PK 投票結果' : '確認警長投票結果'}
      </button>

      <ConfirmModal
        open={confirmSubmitOpen}
        title={isPk ? '確認警長 PK 投票結果' : '確認警長投票結果'}
        confirmLabel="確認結算"
        tone="warning"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmSubmitOpen(false)}
      />

      <ConfirmModal
        open={pendingWithdrawSeat !== null}
        title="確認退水"
        description={
          pendingWithdrawSeat !== null
            ? `${formatSeatNum(pendingWithdrawSeat)} 號退出警長競選。`
            : undefined
        }
        confirmLabel="確認退水"
        tone="warning"
        onConfirm={() => {
          if (pendingWithdrawSeat !== null) {
            withdrawSheriffCandidate(pendingWithdrawSeat);
          }
          setPendingWithdrawSeat(null);
        }}
        onCancel={() => setPendingWithdrawSeat(null)}
      />
    </section>
  );
}
