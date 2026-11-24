import type {
  DayHistoryEntry,
  NightActionDraft,
  NightHistoryEntry,
} from '../../logic/types';
import { SlideDrawer } from './SlideDrawer';
import { DEATH_REASON_LABELS, formatSeatNum } from './displayHelpers';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
  inProgressNight?: {
    round: number;
    draft: NightActionDraft;
    pendingSelfExplodeSeat: number | null;
  } | null;
}

function formatInProgressNightLines(
  draft: NightActionDraft,
  pendingSelfExplodeSeat: number | null,
): string[] {
  const lines: string[] = [];
  if (draft.mechWolfLearnTarget !== null) {
    lines.push(`機械狼學習：${formatSeatNum(draft.mechWolfLearnTarget)} 號`);
  }
  if (draft.guardTarget !== null) {
    lines.push(`守衛守護：${formatSeatNum(draft.guardTarget)} 號`);
  }
  if (draft.dreamCatcherTarget != null) {
    lines.push(`攝夢人夢遊：${formatSeatNum(draft.dreamCatcherTarget)} 號`);
  }
  if (draft.mechWolfSkillTarget !== null) {
    lines.push(`機械狼技能：${formatSeatNum(draft.mechWolfSkillTarget)} 號`);
  }
  if (draft.wolfTarget !== null) {
    lines.push(`狼人點刀：${formatSeatNum(draft.wolfTarget)} 號`);
  }
  if (draft.wolfBeautyCharmTarget != null) {
    lines.push(`狼美人魅惑：${formatSeatNum(draft.wolfBeautyCharmTarget)} 號`);
  }
  if (draft.witchUseAntidote) {
    lines.push('女巫用藥：使用解藥');
  } else if (draft.witchPoisonTarget !== null) {
    lines.push(`女巫用藥：毒殺 ${formatSeatNum(draft.witchPoisonTarget)} 號`);
  }
  if (draft.seerCheckTarget !== null) {
    lines.push(`預言家查驗：${formatSeatNum(draft.seerCheckTarget)} 號`);
  }
  if (draft.psychicCheckTarget !== null) {
    lines.push(`通靈師查驗：${formatSeatNum(draft.psychicCheckTarget)} 號`);
  }
  if (pendingSelfExplodeSeat !== null) {
    lines.push(`自爆待出局：${formatSeatNum(pendingSelfExplodeSeat)} 號`);
  }
  return lines;
}

export function HistoryDrawer({
  open,
  onClose,
  nightHistory,
  dayHistory,
  inProgressNight,
}: HistoryDrawerProps) {
  const maxRound = Math.max(
    0,
    ...nightHistory.map((n) => n.round),
    ...dayHistory.map((d) => d.round),
  );

  const liveLines = inProgressNight
    ? formatInProgressNightLines(
        inProgressNight.draft,
        inProgressNight.pendingSelfExplodeSeat,
      )
    : [];

  return (
    <SlideDrawer open={open} onClose={onClose} title="歷史紀錄" placement="bottom">
      <div className="divide-y divide-subtle">
        {inProgressNight && (
          <section className="border-l-2 border-sheriff py-3 pl-3">
            <h3 className="text-[12px] font-semibold tabular-nums text-sheriff">
              N{inProgressNight.round}（進行中）
            </h3>
            {liveLines.length === 0 ? (
              <p className="mt-1 text-[12px] text-muted">尚未確認行動目標。</p>
            ) : (
              <ul className="mt-1.5 space-y-1 text-[14px] text-primary tabular-nums">
                {liveLines.map((line, idx) => (
                  <li key={idx}>• {line}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {maxRound === 0 && !inProgressNight ? (
          <p className="py-6 text-center text-[14px] text-muted">尚無對局操作紀錄。</p>
        ) : (
          Array.from({ length: maxRound }, (_, idx) => idx + 1).map((round) => {
            const night = nightHistory.find((n) => n.round === round);
            const day = dayHistory.find((d) => d.round === round);
            return (
              <section key={round} className="space-y-2 py-3">
                <h3 className="text-[12px] font-semibold tabular-nums text-sheriff">
                  第 {round} 回合
                </h3>
                {night && (
                  <div className="space-y-1">
                    <div className="text-[12px] font-medium text-secondary">夜間</div>
                    {night.deaths.length === 0 ? (
                      <p className="text-[14px] text-good">平安夜</p>
                    ) : (
                      <ul className="space-y-1 text-[14px] text-primary tabular-nums">
                        {night.deaths.map((d, i) => (
                          <li key={i}>
                            • {formatSeatNum(d.seat)} 號（{DEATH_REASON_LABELS[d.reason]}）
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {day && day.events.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[12px] font-medium text-secondary">白天</div>
                    <ul className="space-y-1 text-[14px] text-secondary tabular-nums">
                      {day.events.map((evt, i) => (
                        <li key={i}>• {evt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </SlideDrawer>
  );
}
