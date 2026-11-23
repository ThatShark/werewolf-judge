import { useEffect, useMemo, useState } from 'react';
import { isSheriffElectionActive, resolveDaySpeakingRule } from '../../logic';
import type { SpeakingOrderMode } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { formatSeatDisplay } from '../common/displayHelpers';

const TIMER_PRESETS = [60, 90, 120] as const;

const MODE_LABELS: Record<SpeakingOrderMode, string> = {
  random: '隨機抽取',
  sheriff_left: '警左',
  sheriff_right: '警右',
  dead_left: '死左',
  dead_right: '死右',
};

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SpeakingTimerPanel() {
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const ruleOverrides = useGameStore((s) => s.ruleOverrides);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const speakingQueue = useGameStore((s) => s.speakingQueue);
  const currentSpeakerIndex = useGameStore((s) => s.currentSpeakerIndex);
  const speakingMeta = useGameStore((s) => s.speakingMeta);
  const defaultSpeakDurationSec = useGameStore((s) => s.defaultSpeakDurationSec);
  const remainingSeconds = useGameStore((s) => s.remainingSeconds);

  const setDefaultSpeakDuration = useGameStore((s) => s.setDefaultSpeakDuration);
  const generateSpeakingOrder = useGameStore((s) => s.generateSpeakingOrder);
  const nextSpeaker = useGameStore((s) => s.nextSpeaker);
  const adjustSpeakerTime = useGameStore((s) => s.adjustSpeakerTime);
  const tickSpeakerTimer = useGameStore((s) => s.tickSpeakerTimer);
  const resetSpeakingOrder = useGameStore((s) => s.resetSpeakingOrder);

  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDeadAnchor, setSelectedDeadAnchor] = useState<number | null>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      tickSpeakerTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, tickSpeakerTimer]);

  useEffect(() => {
    if (remainingSeconds <= 0 && timerRunning) {
      setTimerRunning(false);
    }
  }, [remainingSeconds, timerRunning]);

  const latestNight = useMemo(
    () => nightHistory.find((entry) => entry.round === round) ?? nightHistory[nightHistory.length - 1],
    [nightHistory, round],
  );

  const nightDeadSeats = useMemo(
    () => Array.from(new Set(latestNight?.deaths.map((d) => d.seat) ?? [])).sort((a, b) => a - b),
    [latestNight],
  );

  const deadAnchorChoices = useMemo(() => {
    if (nightDeadSeats.length > 0) return nightDeadSeats;
    return seats.filter((s) => !s.isAlive).map((s) => s.seatNumber);
  }, [nightDeadSeats, seats]);

  const activeSheriffSeat = useMemo(() => {
    if (sheriffState.badgeStatus !== 'active' || sheriffState.sheriffSeat === null) return null;
    const sheriffObj = seats.find((s) => s.seatNumber === sheriffState.sheriffSeat);
    return sheriffObj?.isAlive ? sheriffObj.seatNumber : null;
  }, [sheriffState, seats]);

  const ruleRecommendation = useMemo(
    () =>
      resolveDaySpeakingRule({
        seats,
        nightDeadSeats,
        sheriffSeat: activeSheriffSeat,
        ruleOverrides,
      }),
    [seats, nightDeadSeats, activeSheriffSeat, ruleOverrides],
  );

  const effectiveDeadAnchor = useMemo(() => {
    if (selectedDeadAnchor !== null && deadAnchorChoices.includes(selectedDeadAnchor)) {
      return selectedDeadAnchor;
    }
    return ruleRecommendation.defaultDeadAnchor ?? deadAnchorChoices[0] ?? null;
  }, [selectedDeadAnchor, deadAnchorChoices, ruleRecommendation.defaultDeadAnchor]);

  const electionActive = isSheriffElectionActive(sheriffState);
  const currentSpeakerSeat =
    currentSpeakerIndex < speakingQueue.length ? speakingQueue[currentSpeakerIndex] : null;
  const currentSpeakerObj =
    currentSpeakerSeat !== null ? seats.find((s) => s.seatNumber === currentSpeakerSeat) : undefined;
  const isSpeakingFinished =
    speakingQueue.length > 0 && currentSpeakerIndex >= speakingQueue.length;

  const handleGenerate = (mode: SpeakingOrderMode) => {
    setTimerRunning(false);
    if (mode === 'random') {
      if (electionActive) {
        const candidateSeats =
          sheriffState.pkCandidates.length > 0
            ? sheriffState.pkCandidates
            : sheriffState.candidates;
        generateSpeakingOrder({ mode: 'random', candidateSeats });
      } else {
        generateSpeakingOrder({ mode: 'random' });
      }
      return;
    }

    if (mode === 'dead_left' || mode === 'dead_right') {
      if (effectiveDeadAnchor === null) return;
      generateSpeakingOrder({ mode, referenceDeadSeat: effectiveDeadAnchor });
      return;
    }

    if (activeSheriffSeat === null) return;
    generateSpeakingOrder({ mode });
  };

  const handleToggleStartPause = () => {
    if (!timerRunning && remainingSeconds === 0) {
      adjustSpeakerTime(defaultSpeakDurationSec);
    }
    setTimerRunning((prev) => !prev);
  };

  const isRecommended = (mode: SpeakingOrderMode) =>
    !electionActive && ruleRecommendation.recommendedModes.includes(mode);

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5">
      {/* 醒目當前發言座號 ＋ 倒數計時 ＋ 加減秒數與下一位 */}
      <div className="rounded-2xl border border-amber-500/35 bg-slate-950/90 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              {currentSpeakerSeat !== null
                ? `當前發言（${currentSpeakerIndex + 1}/${speakingQueue.length}）`
                : isSpeakingFinished
                  ? '本輪發言已結束'
                  : `第 ${round} 天 · 單人發言計時`}
            </span>
            <div className="mt-0.5 truncate text-lg font-extrabold text-amber-100">
              {currentSpeakerSeat !== null
                ? `🎤 ${currentSpeakerObj ? formatSeatDisplay(currentSpeakerObj) : `${currentSpeakerSeat} 號`}${
                    speakingMeta?.sheriffLastSeat === currentSpeakerSeat ? '（歸票）' : ''
                  }`
                : isSpeakingFinished
                  ? '✅ 全員發言完畢'
                  : '尚未抽取發言順序'}
            </div>
          </div>

          <div
            className={`shrink-0 font-mono text-4xl font-extrabold tabular-nums ${
              remainingSeconds === 0
                ? 'text-rose-400'
                : remainingSeconds <= 10
                  ? 'text-amber-300'
                  : 'text-slate-50'
            }`}
          >
            {formatTimer(remainingSeconds)}
          </div>
        </div>

        {/* 主控制列：開始／暫停 ＋ - 減時間 ＋ + 加時間 ＋ 下一位 */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => adjustSpeakerTime(-10)}
            aria-label="減少 10 秒"
            className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 text-base font-extrabold text-slate-100 hover:bg-slate-700 active:scale-[0.98]"
          >
            -10s
          </button>
          <button
            type="button"
            onClick={handleToggleStartPause}
            className={`col-span-2 min-h-12 rounded-xl px-2 text-sm font-extrabold transition active:scale-[0.98] ${
              timerRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {timerRunning ? '⏸ 暫停' : remainingSeconds === 0 ? '▶ 重計' : '▶ 開始計時'}
          </button>
          <button
            type="button"
            onClick={() => adjustSpeakerTime(10)}
            aria-label="增加 10 秒"
            className="min-h-12 rounded-xl border border-emerald-500/45 bg-emerald-950/45 text-base font-extrabold text-emerald-200 hover:bg-emerald-900/50 active:scale-[0.98]"
          >
            +10s
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {TIMER_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setDefaultSpeakDuration(sec);
              }}
              className={`min-h-10 flex-1 rounded-xl border text-xs font-bold transition ${
                defaultSpeakDurationSec === sec
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {sec}s
            </button>
          ))}
          <button
            type="button"
            disabled={currentSpeakerSeat === null}
            onClick={() => {
              setTimerRunning(false);
              nextSpeaker();
            }}
            className="min-h-10 flex-[1.6] rounded-xl bg-amber-500 px-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            下一位 ➜
          </button>
        </div>
      </div>

      {/* 房規連動推薦與發言順序抽取 */}
      <div className="space-y-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-300">
          <span className="font-bold text-amber-300">房規建議：</span>
          {electionActive ? '警長競選中，請隨機抽取上警候選人發言順序' : ruleRecommendation.reason}
        </div>

        {/* 多死基準死者快選 */}
        {deadAnchorChoices.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-2.5 py-2 text-xs">
            <span className="font-bold text-slate-400">基準死者：</span>
            {deadAnchorChoices.map((seatNum) => (
              <button
                key={seatNum}
                type="button"
                onClick={() => setSelectedDeadAnchor(seatNum)}
                className={`min-h-8 rounded-lg border px-2.5 text-xs font-bold ${
                  effectiveDeadAnchor === seatNum
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {seatNum}號
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleGenerate('random')}
            className={`col-span-2 sm:col-span-1 min-h-12 rounded-xl border px-3 text-xs font-extrabold transition active:scale-[0.98] ${
              electionActive || isRecommended('random')
                ? 'border-indigo-400 bg-indigo-500/25 text-indigo-100 ring-1 ring-indigo-400/50'
                : 'border-indigo-400/35 bg-indigo-950/35 text-indigo-200 hover:bg-indigo-900/40'
            }`}
          >
            {electionActive ? '🎲 隨機抽（警上）' : '🎲 隨機抽取'}
          </button>

          <button
            type="button"
            disabled={activeSheriffSeat === null}
            onClick={() => handleGenerate('sheriff_left')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              activeSheriffSeat === null
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                : isRecommended('sheriff_left')
                  ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50'
                  : 'border-amber-500/35 bg-amber-950/25 text-amber-200 hover:bg-amber-900/40'
            }`}
          >
            👮 警左
          </button>

          <button
            type="button"
            disabled={activeSheriffSeat === null}
            onClick={() => handleGenerate('sheriff_right')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              activeSheriffSeat === null
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                : isRecommended('sheriff_right')
                  ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50'
                  : 'border-amber-500/35 bg-amber-950/25 text-amber-200 hover:bg-amber-900/40'
            }`}
          >
            👮 警右
          </button>

          <button
            type="button"
            disabled={effectiveDeadAnchor === null}
            onClick={() => handleGenerate('dead_left')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              effectiveDeadAnchor === null
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                : isRecommended('dead_left')
                  ? 'border-rose-400 bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/50'
                  : 'border-rose-500/35 bg-rose-950/25 text-rose-200 hover:bg-rose-900/40'
            }`}
          >
            💀 死左{effectiveDeadAnchor !== null ? ` (${effectiveDeadAnchor}號)` : ''}
          </button>

          <button
            type="button"
            disabled={effectiveDeadAnchor === null}
            onClick={() => handleGenerate('dead_right')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              effectiveDeadAnchor === null
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
                : isRecommended('dead_right')
                  ? 'border-rose-400 bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/50'
                  : 'border-rose-500/35 bg-rose-950/25 text-rose-200 hover:bg-rose-900/40'
            }`}
          >
            💀 死右{effectiveDeadAnchor !== null ? ` (${effectiveDeadAnchor}號)` : ''}
          </button>
        </div>
      </div>

      {/* 發言佇列徽章列 */}
      {speakingQueue.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-300">
              {speakingMeta
                ? `${MODE_LABELS[speakingMeta.mode]} · ${
                    speakingMeta.direction === 'clockwise' ? '順時針' : '逆時針'
                  }`
                : '發言順序'}
            </span>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                resetSpeakingOrder();
              }}
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-bold text-slate-300 hover:bg-slate-700"
            >
              清除佇列
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {speakingQueue.map((seatNum, idx) => {
              const isDone = idx < currentSpeakerIndex;
              const isCurrent = idx === currentSpeakerIndex;
              const isSheriffLast = speakingMeta?.sheriffLastSeat === seatNum;
              return (
                <span
                  key={`${seatNum}-${idx}`}
                  className={`inline-flex items-center gap-0.5 rounded-lg border px-2 py-1 text-xs font-extrabold ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : isDone
                        ? 'border-slate-800 bg-slate-900 text-slate-500 line-through'
                        : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  {seatNum}號{isSheriffLast ? '👮' : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
