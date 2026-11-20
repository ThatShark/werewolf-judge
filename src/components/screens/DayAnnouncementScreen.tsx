import { useMemo } from 'react';
import { getRoleById } from '../../data/roles';
import { checkCanShoot } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { PendingShooterCard } from '../common/PendingShooterCard';
import {
  formatDeathReason,
  formatSeatDisplay,
  getRoleBadgeClasses,
} from '../common/displayHelpers';

export function DayAnnouncementScreen() {
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const proceedToDayVote = useGameStore((s) => s.proceedToDayVote);

  const latestNight = useMemo(
    () => nightHistory.find((entry) => entry.round === round) ?? nightHistory[nightHistory.length - 1],
    [nightHistory, round],
  );

  const deaths = latestNight?.deaths ?? [];

  // 檢核昨晚死亡的獵人或狼王是否被禁止開槍
  const disabledShootInfos = useMemo(() => {
    return deaths
      .map((death) => {
        const eligibility = checkCanShoot(seats, death.seat, death.reason);
        if (!eligibility || eligibility.canShoot) return null;
        return { ...eligibility, deathReason: death.reason };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [deaths, seats]);

  const hasPendingShooters = pendingShooters.length > 0;

  return (
    <div className="space-y-4 pb-28">
      {/* 天亮公告卡 */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              第 {round} 天 · 天亮了
            </span>
            <h1 className="mt-0.5 text-xl font-extrabold text-slate-50">昨夜結算公告</h1>
          </div>
        </div>

        {deaths.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/35 p-5 text-center">
            <div className="text-2xl font-extrabold text-emerald-200">☀️ 昨晚平安夜</div>
            <p className="mt-1.5 text-sm text-emerald-100/80">
              昨夜無人出局，請宣告昨晚是平安夜。
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3.5 py-2.5 text-sm font-bold text-rose-200">
              昨晚出局玩家（共 {deaths.length} 名，法官請只公佈出局座號，勿唸死因）：
            </div>

            {deaths.map((death) => {
              const seat = seats.find((s) => s.seatNumber === death.seat);
              const role = getRoleById(seat?.roleId ?? null);
              return (
                <div
                  key={`${death.seat}-${death.reason}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5"
                >
                  <div>
                    <div className="text-base font-extrabold text-slate-50">
                      {seat ? formatSeatDisplay(seat) : `${death.seat} 號玩家`}
                    </div>
                    <div className="mt-1 text-xs text-rose-300">
                      法官視角死因：{formatDeathReason(death.reason)}
                    </div>
                  </div>
                  {role && (
                    <span
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${getRoleBadgeClasses(role.id)}`}
                    >
                      {role.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 禁開槍狀態提示 */}
      {disabledShootInfos.length > 0 && (
        <section className="space-y-2">
          {disabledShootInfos.map((info) => {
            const seat = seats.find((s) => s.seatNumber === info.seatNumber);
            const roleLabel = info.roleId === 'hunter' ? '獵人' : '狼王';
            return (
              <div
                key={info.seatNumber}
                className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4"
              >
                <span className="inline-block rounded-lg bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                  ❌ 不可開槍
                </span>
                <div className="mt-1.5 text-sm font-bold text-slate-100">
                  {seat ? formatSeatDisplay(seat) : `${info.seatNumber} 號`}（{roleLabel}）
                </div>
                <p className="mt-1 text-xs text-slate-300">原因：{info.reason}</p>
              </div>
            );
          })}
        </section>
      )}

      {/* 可開槍結算卡片（含連鎖開槍） */}
      {pendingShooters.map((shooter) => (
        <PendingShooterCard
          key={shooter.seatNumber}
          shooter={shooter}
          seats={seats}
          onShoot={triggerShoot}
          onSkip={skipShoot}
        />
      ))}

      {/* 前往白天發言與投票 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={hasPendingShooters}
            onClick={proceedToDayVote}
            className={`min-h-12 w-full rounded-xl px-5 py-3.5 text-base font-extrabold transition ${
              hasPendingShooters
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99]'
            }`}
          >
            {hasPendingShooters
              ? '請先結算開槍 / 壓槍後再進入白天投票'
              : '進入白天發言與放逐投票 ➜'}
          </button>
        </div>
      </div>
    </div>
  );
}
