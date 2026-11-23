import type { DayHistoryEntry, NightHistoryEntry } from '../../logic/types';
import { SlideDrawer } from './SlideDrawer';
import { DEATH_REASON_LABELS } from './displayHelpers';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  nightHistory: NightHistoryEntry[];
  dayHistory: DayHistoryEntry[];
}

export function HistoryDrawer({
  open,
  onClose,
  nightHistory,
  dayHistory,
}: HistoryDrawerProps) {
  const maxRound = Math.max(
    0,
    ...nightHistory.map((n) => n.round),
    ...dayHistory.map((d) => d.round),
  );

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="歷史操作紀錄"
      subtitle="Action Timeline"
      placement="bottom"
    >
      <div className="space-y-4 pb-4">
        {maxRound === 0 ? (
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
