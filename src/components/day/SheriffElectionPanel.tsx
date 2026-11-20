import { useMemo, useState } from 'react';
import { getEligibleSheriffVoters, isSheriffElectionActive } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatSeatDisplay, formatSeatShort } from '../common/displayHelpers';

interface SheriffElectionPanelProps {
  disabled?: boolean;
}

export function SheriffElectionPanel({ disabled = false }: SheriffElectionPanelProps) {
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const sheriffState = useGameStore((s) => s.sheriffState);

  const startSheriffElection = useGameStore((s) => s.startSheriffElection);
  const withdrawSheriffCandidate = useGameStore((s) => s.withdrawSheriffCandidate);
  const submitSheriffVotes = useGameStore((s) => s.submitSheriffVotes);

  const [selectedSignupSeats, setSelectedSignupSeats] = useState<number[]>([]);
  const [votesDraft, setVotesDraft] = useState<Record<number, number | null>>({});
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [lastOutcomeNotice, setLastOutcomeNotice] = useState<string | null>(null);

  const aliveSeats = useMemo(() => seats.filter((s) => s.isAlive), [seats]);
  const electionActive = isSheriffElectionActive(sheriffState);

  const activeCandidates = useMemo(
    () =>
      sheriffState.pkCandidates.length > 0
        ? sheriffState.pkCandidates
        : sheriffState.candidates,
    [sheriffState],
  );

  const eligibleVoters = useMemo(
    () => (electionActive ? getEligibleSheriffVoters(sheriffState, seats) : []),
    [electionActive, sheriffState, seats],
  );

  const normalizedVotes = useMemo(() => {
    const validTargets = new Set(activeCandidates);
    const result: Record<number, number | null> = {};
    for (const voter of eligibleVoters) {
      const picked = votesDraft[voter] ?? null;
      result[voter] = picked !== null && validTargets.has(picked) ? picked : null;
    }
    return result;
  }, [eligibleVoters, votesDraft, activeCandidates]);

  // 第二天起若從未開啟過警長競選且不在競選中，隱藏報名面板
  if (round > 1 && sheriffState.status === 'not_started') {
    return null;
  }

  // 已產生明確警長狀態的精簡顯示列
  if (
    sheriffState.status === 'elected' ||
    sheriffState.status === 'swallowed' ||
    sheriffState.status === 'no_sheriff'
  ) {
    const sheriffSeatObj =
      sheriffState.sheriffSeat !== null
        ? seats.find((s) => s.seatNumber === sheriffState.sheriffSeat)
        : undefined;

    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-400">警徽狀態</span>
          {sheriffState.badgeStatus === 'active' && sheriffSeatObj ? (
            <span className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 font-extrabold text-amber-200">
              👮 現任警長：{formatSeatDisplay(sheriffSeatObj)}（放逐 1.5 票）
            </span>
          ) : sheriffState.badgeStatus === 'swallowed' ? (
            <span className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 font-bold text-rose-200">
              💥 警上自爆吞警徽（本局無警長）
            </span>
          ) : sheriffState.badgeStatus === 'destroyed' ? (
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-bold text-slate-300">
              🗑️ 警徽已撕毀（本局後續無警長）
            </span>
          ) : (
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-bold text-slate-300">
              ℹ️ 本局無警長
            </span>
          )}
        </div>
        {lastOutcomeNotice && (
          <p className="mt-2 text-xs font-semibold text-amber-300">{lastOutcomeNotice}</p>
        )}
      </section>
    );
  }

  // 第一天未開啟警長競選：勾選上警名單
  if (sheriffState.status === 'not_started') {
    const toggleCandidate = (seatNumber: number) => {
      setSelectedSignupSeats((prev) =>
        prev.includes(seatNumber)
          ? prev.filter((s) => s !== seatNumber)
          : [...prev, seatNumber].sort((a, b) => a - b),
      );
    };

    return (
      <section className="space-y-3 rounded-2xl border border-amber-500/35 bg-slate-900/95 p-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            第一天 · 警長競選
          </span>
          <h2 className="text-base font-bold text-slate-50">👮 勾選上警名單</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            點選所有舉手上警的玩家；0 人直接宣告無警長，1 人自動當選，2 人以上進入警上發言與投票。
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {aliveSeats.map((seat) => {
            const active = selectedSignupSeats.includes(seat.seatNumber);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={disabled}
                onClick={() => toggleCandidate(seat.seatNumber)}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  active
                    ? 'border-amber-400 bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold">{seat.seatNumber} 號</span>
                  {active && <span className="text-xs font-bold text-amber-300">✓</span>}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {seat.nickname.trim() || `${seat.seatNumber} 號玩家`}
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
          className="min-h-12 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          {selectedSignupSeats.length === 0
            ? '無人上警（宣告本局無警長）'
            : selectedSignupSeats.length === 1
              ? `確認 ${selectedSignupSeats[0]} 號單獨上警（自動當選）`
              : `確認上警名單（${selectedSignupSeats.join('、')} 號）並開始競選`}
        </button>
      </section>
    );
  }

  // 警長競選進行中：退水與警下逐票投票
  const isPk = sheriffState.pkCandidates.length > 0;

  return (
    <section className="space-y-3.5 rounded-2xl border border-amber-500/40 bg-slate-900/95 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {isPk ? '警長平票 PK' : '警上發言與警下投票'}
          </span>
          <h2 className="text-base font-bold text-slate-50">
            {isPk
              ? `⚖️ PK 候選人：${activeCandidates.join('、')} 號`
              : '👮 警長候選人與逐票紀錄'}
          </h2>
        </div>
        <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-200">
          候選 {activeCandidates.length} 人
        </span>
      </div>

      {lastOutcomeNotice && (
        <div className="rounded-xl border border-amber-400/45 bg-amber-950/35 px-3 py-2 text-xs font-bold text-amber-200">
          {lastOutcomeNotice}
        </div>
      )}

      {/* 候選人退水區 */}
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/75 p-3">
        <div className="text-xs font-bold text-slate-300">上警候選人（點擊「退水」移出競選）：</div>
        <div className="flex flex-wrap gap-2">
          {activeCandidates.map((seatNum) => {
            const seatObj = seats.find((s) => s.seatNumber === seatNum);
            return (
              <div
                key={seatNum}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-2.5 py-1.5"
              >
                <span className="text-xs font-extrabold text-amber-100">
                  {seatObj ? formatSeatShort(seatObj) : `${seatNum}號`}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    withdrawSheriffCandidate(seatNum);
                    setVotesDraft((prev) => {
                      const next: Record<number, number | null> = {};
                      for (const [k, v] of Object.entries(prev)) {
                        next[Number(k)] = v === seatNum ? null : v;
                      }
                      return next;
                    });
                  }}
                  className="min-h-8 rounded-lg border border-slate-700 bg-slate-800 px-2 text-[11px] font-bold text-slate-200 hover:bg-rose-900/60 hover:text-rose-100"
                >
                  退水
                </button>
              </div>
            );
          })}
        </div>
        {sheriffState.withdrawnSeats.length > 0 && (
          <div className="text-[11px] text-slate-400">
            已退水（無警下投票權）：{sheriffState.withdrawnSeats.join('、')} 號
          </div>
        )}
      </div>

      {/* 警下投票明細 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300">
          警下投票明細（共 {eligibleVoters.length} 位具投票權）：
        </div>
        {eligibleVoters.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
            所有存活玩家皆曾上警，本輪無警下投票者（送出計票將依流局處理）。
          </div>
        ) : (
          <div className="space-y-2">
            {eligibleVoters.map((voterSeat) => {
              const voterObj = seats.find((s) => s.seatNumber === voterSeat);
              const selectedTarget = normalizedVotes[voterSeat] ?? null;
              return (
                <div
                  key={voterSeat}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5"
                >
                  <div className="mb-2 text-xs font-bold text-slate-200">
                    {voterObj ? formatSeatDisplay(voterObj) : `${voterSeat} 號`}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCandidates.map((candSeat) => {
                      const picked = selectedTarget === candSeat;
                      return (
                        <button
                          key={candSeat}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            setVotesDraft((prev) => ({
                              ...prev,
                              [voterSeat]: picked ? null : candSeat,
                            }))
                          }
                          className={`min-h-10 rounded-lg border px-3 text-xs font-extrabold transition ${
                            picked
                              ? 'border-amber-400 bg-amber-500 text-slate-950'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          投 {candSeat} 號
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
                      className={`min-h-10 rounded-lg border px-3 text-xs font-bold transition ${
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
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirmSubmitOpen(true)}
        className="min-h-12 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
      >
        送出{isPk ? ' PK ' : '警下'}計票
      </button>

      <ConfirmModal
        open={confirmSubmitOpen}
        title={`確認送出${isPk ? '警長 PK ' : '警下'}投票紀錄？`}
        description="系統將自動統計票數，決定當選警長、進入平票 PK 或流局。"
        confirmLabel="確認計票"
        tone="warning"
        onConfirm={() => {
          const res = submitSheriffVotes(normalizedVotes);
          setVotesDraft({});
          if (res.outcome === 'pk') {
            setLastOutcomeNotice(
              `⚖️ 警長投票平票：${res.record.tiedSeats.join('、')} 號進入 PK，請發言後進行 PK 投票。`,
            );
          } else if (res.outcome === 'no_sheriff') {
            setLastOutcomeNotice('ℹ️ 警長競選流局，本局無警長。');
          } else {
            setLastOutcomeNotice(null);
          }
          setConfirmSubmitOpen(false);
        }}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </section>
  );
}
