import type { DayStage } from '../../logic/types';

interface DayStageStepperProps {
  currentStage: DayStage;
  showSheriffStage: boolean;
}

const ALL_STAGES: Array<{ id: DayStage; label: string }> = [
  { id: 'sheriff_election', label: '警長競選' },
  { id: 'death_announcement', label: '死訊遺言' },
  { id: 'speaking', label: '白天發言' },
  { id: 'exile_vote', label: '放逐投票' },
];

export function DayStageStepper({ currentStage, showSheriffStage }: DayStageStepperProps) {
  const visibleStages = showSheriffStage
    ? ALL_STAGES
    : ALL_STAGES.filter((s) => s.id !== 'sheriff_election');
  const currentIdx = visibleStages.findIndex((s) => s.id === currentStage);

  return (
    <nav
      aria-label="白天階段進度"
      className="grid shrink-0 gap-1 rounded-md border border-subtle bg-surface p-1"
      style={{ gridTemplateColumns: `repeat(${visibleStages.length}, minmax(0, 1fr))` }}
    >
      {visibleStages.map((stage, idx) => {
        const isCurrent = stage.id === currentStage;
        const isDone = currentIdx > idx;
        return (
          <div
            key={stage.id}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex min-h-9 items-center justify-center gap-1 rounded-md px-1 text-[12px] font-semibold tabular-nums ${
              isCurrent
                ? 'border-selected-sheriff bg-sheriff-tint text-sheriff'
                : isDone
                  ? 'bg-canvas text-good'
                  : 'bg-canvas text-muted'
            }`}
          >
            <span>{idx + 1}.</span>
            <span className="truncate">{stage.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
