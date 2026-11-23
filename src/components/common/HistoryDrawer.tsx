import type {
  DayHistoryEntry,
  NightActionDraft,
  NightHistoryEntry,
} from '../../logic/types';
import { SlideDrawer } from './SlideDrawer';
import { DEATH_REASON_LABELS } from './displayHelpers';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
  /** 實體法官模式在夜晚進行中時傳入，用於於抽屜檢視「目前為止今晚操作紀錄」 */
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
    lines.push(`機械狼首夜學習：${draft.mechWolfLearnTarget} 號`);
  }
  if (draft.guardTarget !== null) {
    lines.push(`守衛守護：${draft.guardTarget} 號`);
  }
  if (draft.dreamCatcherTarget != null) {
    lines.push(`攝夢人夢遊：${draft.dreamCatcherTarget} 號`);
  }
  if (draft.mechWolfSkillTarget !== null) {
    lines.push(`機械狼技能目標：${draft.mechWolfSkillTarget} 號`);
  }
  if (draft.wolfTarget !== null) {
    lines.push(`狼人點刀：${draft.wolfTarget} 號`);
  }
  if (draft.wolfBeautyCharmTarget != null) {
    lines.push(`狼美人魅惑：${draft.wolfBeautyCharmTarget} 號`);
  }
  if (draft.witchUseAntidote) {
    lines.push('女巫用藥：使用解藥');
  } else if (draft.witchPoisonTarget !== null) {
    lines.push(`女巫用藥：毒殺 ${draft.witchPoisonTarget} 號`);
  }
  if (draft.seerCheckTarget !== null) {
    lines.push(`預言家查驗：${draft.seerCheckTarget} 號`);
  }
  if (draft.psychicCheckTarget !== null) {
    lines.push(`通靈師查驗：${draft.psychicCheckTarget} 號`);
  }
  if (pendingSelfExplodeSeat !== null) {
    lines.push(`自爆待出局：${pendingSelfExplodeSeat} 號`);
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
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="歷史操作紀錄"
      subtitle="Action Timeline"
      placement="bottom"
    >
      <div className="space-y-4 pb-4">
        {inProgressNight && (
          <section className="space-y-2 rounded-2xl border border-amber-500/35 bg-amber-950/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              第 {inProgressNight.round} 晚（進行中 · 目前操作紀錄）
            </h3>
            {liveLines.length === 0 ? (
              <p className="text-xs text-slate-400">今晚尚未確認任何角色行動目標。</p>
            ) : (
              <ul className="space-y-1 text-sm text-amber-50">
                {liveLines.map((line, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {line}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {maxRound === 0 && !inProgressNight ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
            <p className="text-sm text-slate-400">目前尚無任何夜間或白天操作紀錄。</p>
          </div>
        ) : (
          Array.from({ length: maxRound }, (_, idx) => idx + 1).map((round) => {
            const night = nightHistory.find((n) => n.round === round);
            const day = dayHistory.find((d) => d.round === round);
            return (
              <section
                key={round}
                className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  第 {round} 回合
                </h3>
                {night && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-indigo-300">夜間紀錄</p>
                    {night.deaths.length === 0 ? (
                      <p className="text-sm leading-relaxed text-slate-200">平安夜（無人死亡）</p>
                    ) : (
                      <ul className="space-y-1 text-sm text-slate-200">
                        {night.deaths.map((d, i) => (
                          <li key={i} className="leading-relaxed">
                            • {d.seat} 號出局（{DEATH_REASON_LABELS[d.reason]}）
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {day && day.events.length > 0 && (
                  <div className="space-y-1 border-t border-slate-800/80 pt-2">
                    <p className="text-xs font-semibold text-amber-200">白天事件</p>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {day.events.map((evt, i) => (
                        <li key={i} className="leading-relaxed">
                          • {evt}
                        </li>
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
