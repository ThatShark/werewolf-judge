import { useEffect, useMemo, useState } from 'react';
import { playSoftTimerChime } from '../../audio/timerChime';
import { isSheriffElectionActive, resolveDaySpeakingRule } from '../../logic';
import type { SpeakingOrderMode } from '../../logic/types';
import { useGameStore } from '../../store/gameStore';
import { formatSeatNum } from '../common/displayHelpers';

const TIMER_PRESETS = [60, 90, 120] as const;

const MODE_LABELS: Record<SpeakingOrderMode, string> = {
  random: '隨機',
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
  const dailyRandomDirection = useGameStore((s) => s.dailyRandomDirection);
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
  const [manualStartSeat, setManualStartSeat] = useState<number | null>(null);

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
      playSoftTimerChime();
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
        dailyRandomDirection,
      }),
    [seats, nightDeadSeats, activeSheriffSeat, ruleOverrides, dailyRandomDirection],
  );

  const effectiveDeadAnchor = useMemo(() => {
    if (selectedDeadAnchor !== null && deadAnchorChoices.includes(selectedDeadAnchor)) {
      return selectedDeadAnchor;
    }
    return ruleRecommendation.defaultDeadAnchor ?? deadAnchorChoices[0] ?? null;
  }, [selectedDeadAnchor, deadAnchorChoices, ruleRecommendation.defaultDeadAnchor]);

  const electionActive = isSheriffElectionActive(sheriffState);

  // 無警長／警徽流失時：進入白天發言自動生成預設發言順序（有死者從死者身邊起，平安夜隨機存活者＋隨機方向）
  useEffect(() => {
    if (electionActive || activeSheriffSeat !== null || speakingQueue.length > 0) return;
    if (nightDeadSeats.length > 0 && effectiveDeadAnchor !== null) {
      const autoMode: SpeakingOrderMode =
        dailyRandomDirection === 'clockwise' ? 'dead_left' : 'dead_right';
      generateSpeakingOrder({ mode: autoMode, referenceDeadSeat: effectiveDeadAnchor });
    } else if (seats.some((s) => s.isAlive)) {
      generateSpeakingOrder({ mode: 'random' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionActive, activeSheriffSeat]);

  const aliveSeatNumbers = useMemo(
    () => seats.filter((s) => s.isAlive).map((s) => s.seatNumber),
    [seats],
  );
  const allowSheriffDeadSide =
    activeSheriffSeat !== null &&
    nightDeadSeats.length === 1 &&
    Boolean(ruleOverrides.sheriffUseDeadSideOnDeath);
  const showDeadSideButtons = activeSheriffSeat === null || allowSheriffDeadSide;
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
    <section className="space-y-3">
      {/* 專業計時器主面盤 */}
      <div className="rounded-lg border border-subtle bg-surface p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold tabular-nums text-secondary">
              {currentSpeakerSeat !== null
                ? `發言中 ${currentSpeakerIndex + 1} / ${speakingQueue.length}`
                : isSpeakingFinished
                  ? `發言完畢 ${speakingQueue.length} / ${speakingQueue.length}`
                  : `D${round} 發言計時`}
            </div>
            <div className="mt-0.5 truncate text-[18px] font-semibold leading-6 tabular-nums text-primary">
              {currentSpeakerSeat !== null
                ? `${formatSeatNum(currentSpeakerSeat)} 號${
                    currentSpeakerObj?.nickname.trim() ? ` ${currentSpeakerObj.nickname.trim()}` : ''
                  }${speakingMeta?.sheriffLastSeat === currentSpeakerSeat ? '（歸票）' : ''}`
                : isSpeakingFinished
                  ? '所有人發言完畢'
                  : '尚未抽取順序'}
            </div>
          </div>

          <div
            className={`shrink-0 font-mono text-[36px] font-bold leading-none tabular-nums ${
              remainingSeconds === 0
                ? 'text-wolf'
                : remainingSeconds <= 10
                  ? 'text-sheriff'
                  : 'text-primary'
            }`}
          >
            {formatTimer(remainingSeconds)}
          </div>
        </div>

        {/* 主控制列：-10s / 開始暫停 / +10s */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => adjustSpeakerTime(-10)}
            aria-label="減少 10 秒"
            className="min-h-12 rounded-md border border-subtle bg-canvas text-[14px] font-semibold tabular-nums text-secondary hover:border-strong hover:text-primary"
          >
            -10s
          </button>
          <button
            type="button"
            onClick={handleToggleStartPause}
            className={`col-span-2 min-h-12 rounded-md px-2 text-[14px] font-semibold transition ${
              timerRunning
                ? 'border border-sheriff-border bg-sheriff-tint text-sheriff'
                : 'bg-sheriff text-inverse hover:opacity-90'
            }`}
          >
            {timerRunning ? '暫停' : remainingSeconds === 0 ? '重計' : '開始計時'}
          </button>
          <button
            type="button"
            onClick={() => adjustSpeakerTime(10)}
            aria-label="增加 10 秒"
            className="min-h-12 rounded-md border border-subtle bg-canvas text-[14px] font-semibold tabular-nums text-good hover:border-strong"
          >
            +10s
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {TIMER_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setDefaultSpeakDuration(sec);
              }}
              className={`min-h-10 flex-1 rounded-md text-[12px] font-semibold tabular-nums transition ${
                defaultSpeakDurationSec === sec
                  ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                  : 'border border-subtle bg-canvas text-secondary hover:border-strong'
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
            className="min-h-10 flex-[1.5] rounded-md border border-strong bg-elevated px-3 text-[12px] font-semibold text-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            下一位 →
          </button>
        </div>
      </div>

      {/* 發言順序抽取 */}
      <div className="space-y-2">
        {deadAnchorChoices.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-secondary">基準死者</span>
            {deadAnchorChoices.map((seatNum) => (
              <button
                key={seatNum}
                type="button"
                onClick={() => setSelectedDeadAnchor(seatNum)}
                className={`min-h-9 rounded-md px-2.5 font-semibold tabular-nums ${
                  effectiveDeadAnchor === seatNum
                    ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                    : 'border border-subtle bg-surface text-secondary'
                }`}
              >
                {formatSeatNum(seatNum)}
              </button>
            ))}
          </div>
        )}

        {/* 有警長時顯示警左／警右（單死且房規允許時同步顯示死左／死右）；無警長時支援自動抽選與手動指定起點方向 */}
        <div
          className={`grid gap-1.5 ${
            activeSheriffSeat !== null
              ? showDeadSideButtons
                ? 'grid-cols-4'
                : 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {activeSheriffSeat === null && (
            <button
              type="button"
              onClick={() => handleGenerate('random')}
              className={`min-h-11 rounded-md px-1 text-[12px] font-semibold transition ${
                electionActive || isRecommended('random')
                  ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                  : 'border border-subtle bg-surface text-secondary hover:border-strong'
              }`}
            >
              隨機抽序
            </button>
          )}
          {activeSheriffSeat !== null && (
            <>
              <button
                type="button"
                onClick={() => handleGenerate('sheriff_left')}
                className={`min-h-11 rounded-md px-1 text-[12px] font-semibold transition ${
                  speakingMeta?.mode === 'sheriff_left' || isRecommended('sheriff_left')
                    ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                    : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                警左（順時針）
              </button>
              <button
                type="button"
                onClick={() => handleGenerate('sheriff_right')}
                className={`min-h-11 rounded-md px-1 text-[12px] font-semibold transition ${
                  speakingMeta?.mode === 'sheriff_right' || isRecommended('sheriff_right')
                    ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                    : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                警右（逆時針）
              </button>
            </>
          )}
          {showDeadSideButtons && (
            <>
              <button
                type="button"
                disabled={effectiveDeadAnchor === null}
                onClick={() => handleGenerate('dead_left')}
                className={`min-h-11 rounded-md px-1 text-[12px] font-semibold transition ${
                  effectiveDeadAnchor === null
                    ? 'cursor-not-allowed border border-subtle bg-canvas text-muted opacity-45'
                    : speakingMeta?.mode === 'dead_left' || isRecommended('dead_left')
                      ? 'border-selected-wolf bg-wolf-tint text-wolf'
                      : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                死左
              </button>
              <button
                type="button"
                disabled={effectiveDeadAnchor === null}
                onClick={() => handleGenerate('dead_right')}
                className={`min-h-11 rounded-md px-1 text-[12px] font-semibold transition ${
                  effectiveDeadAnchor === null
                    ? 'cursor-not-allowed border border-subtle bg-canvas text-muted opacity-45'
                    : speakingMeta?.mode === 'dead_right' || isRecommended('dead_right')
                      ? 'border-selected-wolf bg-wolf-tint text-wolf'
                      : 'border border-subtle bg-surface text-secondary hover:border-strong'
                }`}
              >
                死右
              </button>
            </>
          )}
        </div>

        {/* 無警長時允許法官手動指定起點與方向 */}
        {activeSheriffSeat === null && aliveSeatNumbers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-subtle bg-surface px-2.5 py-2 text-[12px]">
            <span className="text-secondary">手動起點</span>
            <select
              aria-label="手動指定發言起點座位"
              value={manualStartSeat ?? aliveSeatNumbers[0]}
              onChange={(e) => setManualStartSeat(Number(e.target.value))}
              className="min-h-9 rounded-md border border-subtle bg-canvas px-2 text-[12px] font-semibold tabular-nums text-primary"
            >
              {aliveSeatNumbers.map((sn) => (
                <option key={sn} value={sn}>
                  {formatSeatNum(sn)} 號
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const start = manualStartSeat ?? aliveSeatNumbers[0];
                const idx = aliveSeatNumbers.indexOf(start);
                const prevSeat =
                  aliveSeatNumbers[(idx - 1 + aliveSeatNumbers.length) % aliveSeatNumbers.length];
                generateSpeakingOrder({ mode: 'dead_left', referenceDeadSeat: prevSeat });
              }}
              className="min-h-9 rounded-md border border-subtle bg-canvas px-2.5 font-semibold text-primary hover:border-strong"
            >
              順時針
            </button>
            <button
              type="button"
              onClick={() => {
                const start = manualStartSeat ?? aliveSeatNumbers[0];
                const idx = aliveSeatNumbers.indexOf(start);
                const nextSeat = aliveSeatNumbers[(idx + 1) % aliveSeatNumbers.length];
                generateSpeakingOrder({ mode: 'dead_right', referenceDeadSeat: nextSeat });
              }}
              className="min-h-9 rounded-md border border-subtle bg-canvas px-2.5 font-semibold text-primary hover:border-strong"
            >
              逆時針
            </button>
          </div>
        )}
      </div>

      {/* 發言佇列 */}
      {speakingQueue.length > 0 && (
        <div className="space-y-1.5 border-t border-subtle pt-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-secondary">
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
              className="text-[12px] text-muted hover:text-primary"
            >
              清除
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {speakingQueue.map((seatNum, idx) => {
              const isDone = idx < currentSpeakerIndex;
              const isCurrent = idx === currentSpeakerIndex;
              const isSheriffLast = speakingMeta?.sheriffLastSeat === seatNum;
              return (
                <span
                  key={`${seatNum}-${idx}`}
                  className={`inline-flex h-7 items-center rounded-md px-2 text-[12px] font-semibold tabular-nums ${
                    isCurrent
                      ? 'bg-sheriff text-inverse'
                      : isDone
                        ? 'border border-subtle bg-canvas text-muted line-through'
                        : 'border border-subtle bg-surface text-primary'
                  }`}
                >
                  {formatSeatNum(seatNum)}
                  {isSheriffLast ? '警' : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
