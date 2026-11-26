import { useEffect, useRef, useState } from 'react';
import { playSoftTimerChime } from '../../audio/timerChime';

interface InlineCountdownTimerProps {
  title: string;
  initialSeconds?: number;
  presets?: readonly number[];
  /** 當前發言者標示（選填，例如「04 號（第 1 / 3 位）」） */
  currentSpeakerLabel?: string;
  canPrev?: boolean;
  canNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function InlineCountdownTimer({
  title,
  initialSeconds = 90,
  presets = [60, 90, 120],
  currentSpeakerLabel,
  canPrev = false,
  canNext = false,
  onPrev,
  onNext,
}: InlineCountdownTimerProps) {
  const [duration, setDuration] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const chimedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      if (!chimedRef.current) {
        chimedRef.current = true;
        playSoftTimerChime();
      }
    }
  }, [remaining, running]);

  const handleToggle = () => {
    if (!running && remaining === 0) {
      setRemaining(duration);
      chimedRef.current = false;
    }
    if (!running) {
      chimedRef.current = false;
    }
    setRunning((prev) => !prev);
  };

  const handleAdjust = (delta: number) => {
    setRemaining((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > 0) chimedRef.current = false;
      return next;
    });
  };

  const handleSelectPreset = (sec: number) => {
    setRunning(false);
    setDuration(sec);
    setRemaining(sec);
    chimedRef.current = false;
  };

  const resetTimer = () => {
    setRunning(false);
    setRemaining(duration);
    chimedRef.current = false;
  };

  return (
    <div className="rounded-lg border border-subtle bg-surface p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-secondary">{title}</div>
          {currentSpeakerLabel ? (
            <div className="mt-0.5 truncate text-[14px] font-semibold tabular-nums text-primary">
              {currentSpeakerLabel}
            </div>
          ) : (
            <div className="mt-0.5 text-[12px] text-muted">
              {remaining === 0 ? '時間到' : running ? '倒數中' : '就緒'}
            </div>
          )}
        </div>
        <div
          className={`shrink-0 font-mono text-[28px] font-bold leading-none tabular-nums ${
            remaining === 0
              ? 'text-wolf'
              : remaining <= 10
                ? 'text-sheriff'
                : 'text-primary'
          }`}
        >
          {formatSec(remaining)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => handleAdjust(-10)}
          className="min-h-11 rounded-md border border-subtle bg-canvas text-[12px] font-semibold tabular-nums text-secondary hover:border-strong hover:text-primary"
        >
          -10s
        </button>
        <button
          type="button"
          onClick={handleToggle}
          className={`col-span-2 min-h-11 rounded-md px-2 text-[14px] font-semibold transition ${
            running
              ? 'border border-sheriff-border bg-sheriff-tint text-sheriff'
              : 'bg-sheriff text-inverse hover:opacity-90'
          }`}
        >
          {running ? '暫停' : remaining === 0 ? '重計' : '開始計時'}
        </button>
        <button
          type="button"
          onClick={() => handleAdjust(10)}
          className="min-h-11 rounded-md border border-subtle bg-canvas text-[12px] font-semibold tabular-nums text-good hover:border-strong"
        >
          +10s
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        {presets.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => handleSelectPreset(sec)}
            className={`min-h-9 flex-1 rounded-md text-[12px] font-semibold tabular-nums transition ${
              duration === sec
                ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                : 'border border-subtle bg-canvas text-secondary hover:border-strong'
            }`}
          >
            {sec}s
          </button>
        ))}
        <button
          type="button"
          onClick={resetTimer}
          className="min-h-9 rounded-md border border-subtle bg-canvas px-2.5 text-[12px] font-medium text-secondary hover:border-strong hover:text-primary"
        >
          重設
        </button>
      </div>

      {(onPrev || onNext) && (
        <div className="grid grid-cols-2 gap-1.5 border-t border-subtle pt-2">
          {onPrev && (
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => {
                resetTimer();
                onPrev();
              }}
              className="min-h-11 rounded-md border border-subtle bg-canvas px-3 text-[12px] font-semibold text-secondary hover:border-strong hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← 上一位
            </button>
          )}
          {onNext && (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                resetTimer();
                onNext();
              }}
              className={`${onPrev ? '' : 'col-span-2'} min-h-11 rounded-md border border-strong bg-elevated px-3 text-[12px] font-semibold text-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              下一位 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
