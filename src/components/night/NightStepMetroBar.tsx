import { useEffect, useRef } from 'react';
import type { NightStepScript } from '../../logic/types';

interface NightStepMetroBarProps {
  steps: NightStepScript[];
  currentStepIndex: number;
}

/**
 * 夜間頂部「捷運站點式」水平進度條（Stepper）：
 * 依序呈現當晚所有行動階段節點，並自動滾動高亮目前所在站點。
 */
export function NightStepMetroBar({ steps, currentStepIndex }: NightStepMetroBarProps) {
  const activeStationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeStationRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [currentStepIndex]);

  if (steps.length === 0) return null;

  return (
    <div
      aria-label="夜間階段進度"
      className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto py-0.5"
    >
      {steps.map((step, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;
        const isLast = idx === steps.length - 1;

        return (
          <div
            key={`${step.stepId}-${idx}`}
            ref={isCurrent ? activeStationRef : undefined}
            className="flex shrink-0 items-center"
          >
            <div
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 transition ${
                isCurrent ? 'bg-sheriff-tint' : ''
              }`}
            >
              <span
                className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full border ${
                  isCurrent
                    ? 'border-sheriff bg-sheriff'
                    : isDone
                      ? 'border-good bg-good'
                      : 'border-strong bg-canvas'
                }`}
              />
              <span
                className={`whitespace-nowrap text-[12px] leading-4 ${
                  isCurrent
                    ? 'font-semibold text-sheriff'
                    : isDone
                      ? 'font-medium text-secondary'
                      : 'font-medium text-muted'
                }`}
              >
                {step.actorLabel}
              </span>
            </div>
            {!isLast && (
              <span
                aria-hidden="true"
                className={`h-[2px] w-3 shrink-0 ${isDone ? 'bg-good/70' : 'bg-white/12'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
