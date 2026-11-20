import { useEffect, useMemo, useState } from 'react';
import { isSheriffElectionActive } from '../../logic';
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

  // 死左／死右基準死者候選：優先昨夜死亡座位，無則退回全部已出局座位
  const deadAnchorChoices = useMemo(() => {
    const nightDead = latestNight?.deaths.map((d) => d.seat) ?? [];
    if (nightDead.length > 0) return Array.from(new Set(nightDead));
    return seats.filter((s) => !s.isAlive).map((s) => s.seatNumber);
  }, [latestNight, seats]);

  const effectiveDeadAnchor = useMemo(() => {
    if (selectedDeadAnchor !== null && deadAnchorChoices.includes(selectedDeadAnchor)) {
      return selectedDeadAnchor;
    }
    return deadAnchorChoices[0] ?? null;
  }, [selectedDeadAnchor, deadAnchorChoices]);

  const activeSheriffSeat = useMemo(() => {
    if (sheriffState.badgeStatus !== 'active' || sheriffState.sheriffSeat === null) return null;
    const sheriffObj = seats.find((s) => s.seatNumber === sheriffState.sheriffSeat);
    return sheriffObj?.isAlive ? sheriffObj.seatNumber : null;
  }, [sheriffState, seats]);

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

  return (
    <section className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
      {/* 標題與大字體倒數讀秒 */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            第 {round} 天 · 發言順序與計時
          </span>
          <h2 className="text-base font-bold text-slate-100">單人倒數計時器</h2>
        </div>
        <div
          className={`font-mono text-4xl font-extrabold tabular-nums ${
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

      {/* 預設時間切換 */}
      <div className="grid grid-cols-3 gap-2">
        {TIMER_PRESETS.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setDefaultSpeakDuration(sec);
            }}
            className={`min-h-12 rounded-xl border text-sm font-bold transition ${
              defaultSpeakDurationSec === sec
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {sec} 秒
          </button>
        ))}
      </div>

      {/* 開始／暫停／+10秒／-10秒／重設 */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={handleToggleStartPause}
          className={`col-span-2 min-h-12 rounded-xl px-3 text-sm font-extrabold transition ${
            timerRunning
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-indigo-500 text-white hover:bg-indigo-400'
          }`}
        >
          {timerRunning ? '⏸ 暫停計時' : remainingSeconds === 0 ? '▶ 重新計時' : '▶ 開始計時'}
        </button>
        <button
          type="button"
          onClick={() => adjustSpeakerTime(-10)}
          className="min-h-12 rounded-xl border border-slate-700 bg-slate-800 text-sm font-extrabold text-slate-200 hover:bg-slate-700 active:scale-[0.98]"
        >
          -10秒
        </button>
        <button
          type="button"
          onClick={() => adjustSpeakerTime(10)}
          className="min-h-12 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-sm font-extrabold text-emerald-200 hover:bg-emerald-900/50 active:scale-[0.98]"
        >
          +10秒
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setTimerRunning(false);
          setDefaultSpeakDuration(defaultSpeakDurationSec);
        }}
        className="min-h-10 w-full rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      >
        ↺ 重設當前秒數為 {defaultSpeakDurationSec} 秒
      </button>

      {/* 發言順序抽取模式 */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">自動抽取發言順序</span>
          {speakingMeta && (
            <span className="text-amber-300">
              {MODE_LABELS[speakingMeta.mode]} ·{' '}
              {speakingMeta.direction === 'clockwise' ? '順時針' : '逆時針'}
            </span>
          )}
        </div>

        {/* 多死基準死者快選 */}
        {deadAnchorChoices.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
            <span className="font-bold text-slate-400">基準死者（死左／死右）：</span>
            {deadAnchorChoices.map((seatNum) => (
              <button
                key={seatNum}
                type="button"
                onClick={() => setSelectedDeadAnchor(seatNum)}
                className={`min-h-9 rounded-lg border px-2.5 font-bold ${
                  effectiveDeadAnchor === seatNum
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {seatNum} 號
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleGenerate('random')}
            className="col-span-2 sm:col-span-1 min-h-12 rounded-xl border border-indigo-400/40 bg-indigo-950/40 px-3 text-xs font-extrabold text-indigo-200 hover:bg-indigo-900/50 active:scale-[0.98]"
          >
            {electionActive ? '🎲 隨機抽取（警上）' : '🎲 隨機抽取（平安夜）'}
          </button>
          <button
            type="button"
            disabled={activeSheriffSeat === null}
            onClick={() => handleGenerate('sheriff_left')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              activeSheriffSeat !== null
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40'
                : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
            }`}
          >
            👮 警左
          </button>
          <button
            type="button"
            disabled={activeSheriffSeat === null}
            onClick={() => handleGenerate('sheriff_right')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              activeSheriffSeat !== null
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40'
                : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
            }`}
          >
            👮 警右
          </button>
          <button
            type="button"
            disabled={effectiveDeadAnchor === null}
            onClick={() => handleGenerate('dead_left')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              effectiveDeadAnchor !== null
                ? 'border-rose-500/40 bg-rose-950/30 text-rose-200 hover:bg-rose-900/40'
                : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
            }`}
          >
            💀 死左{effectiveDeadAnchor !== null ? ` (${effectiveDeadAnchor}號)` : ''}
          </button>
          <button
            type="button"
            disabled={effectiveDeadAnchor === null}
            onClick={() => handleGenerate('dead_right')}
            className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold transition ${
              effectiveDeadAnchor !== null
                ? 'border-rose-500/40 bg-rose-950/30 text-rose-200 hover:bg-rose-900/40'
                : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600'
            }`}
          >
            💀 死右{effectiveDeadAnchor !== null ? ` (${effectiveDeadAnchor}號)` : ''}
          </button>
        </div>
      </div>

      {/* 發言順序徽章列與當前發言 */}
      {speakingQueue.length > 0 && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
          <div className="flex flex-wrap gap-1.5">
            {speakingQueue.map((seatNum, idx) => {
              const isDone = idx < currentSpeakerIndex;
              const isCurrent = idx === currentSpeakerIndex;
              const isSheriffLast = speakingMeta?.sheriffLastSeat === seatNum;
              return (
                <span
                  key={`${seatNum}-${idx}`}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-extrabold ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-xs'
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

          {!isSpeakingFinished && currentSpeakerSeat !== null ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/25 p-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  當前發言（第 {currentSpeakerIndex + 1} / {speakingQueue.length} 位）
                </div>
                <div className="mt-0.5 text-lg font-extrabold text-amber-100">
                  🎤 {currentSpeakerObj ? formatSeatDisplay(currentSpeakerObj) : `${currentSpeakerSeat} 號`}
                  {speakingMeta?.sheriffLastSeat === currentSpeakerSeat && '（歸票位）'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  nextSpeaker();
                }}
                className="min-h-12 shrink-0 rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98]"
              >
                下一位發言 ➜
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-3 text-xs font-bold text-emerald-200">
              <span>✅ 本輪發言已全部結束</span>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  resetSpeakingOrder();
                }}
                className="min-h-10 rounded-lg border border-slate-700 bg-slate-800 px-3 text-slate-200 hover:bg-slate-700"
              >
                清除佇列
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
