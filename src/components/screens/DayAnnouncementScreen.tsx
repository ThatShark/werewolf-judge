import { useMemo, useState } from 'react';
import { getBoardById } from '../../data/boards';
import { getRoleById } from '../../data/roles';
import { checkCanShoot } from '../../logic';
import { useGameStore } from '../../store/gameStore';
import { PendingShooterCard } from '../common/PendingShooterCard';
import { SeatStatusDrawer } from '../common/SeatStatusDrawer';
import { SheriffBadgeTransferCard } from '../common/SheriffBadgeTransferCard';
import {
  formatDeathReason,
  formatSeatDisplay,
  getRoleBadgeClasses,
} from '../common/displayHelpers';
import { CompactSeatStatusGrid } from '../day/CompactSeatStatusGrid';
import { ManualVictoryModal } from '../day/ManualVictoryModal';

export function DayAnnouncementScreen() {
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const round = useGameStore((s) => s.round);
  const seats = useGameStore((s) => s.seats);
  const hostMode = useGameStore((s) => s.hostMode);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const lastBearRoar = useGameStore((s) => s.lastBearRoar);
  const lastMoonSpiritHowl = useGameStore((s) => s.lastMoonSpiritHowl ?? null);
  const lastSeniorVillagerReveal = useGameStore((s) => s.lastSeniorVillagerReveal ?? null);
  const interferenceState = useGameStore((s) => s.interferenceState);
  const thirdPartySpecialState = useGameStore((s) => s.thirdPartySpecialState);
  const finalBatchState = useGameStore((s) => s.finalBatchState);
  const combatState = useGameStore((s) => s.combatState);
  const reviveWithAlchemySnake = useGameStore((s) => s.reviveWithAlchemySnake);
  const triggerWhiteCatDelayedDeath = useGameStore((s) => s.triggerWhiteCatDelayedDeath);
  const triggerOldRascalDelayedDeath = useGameStore((s) => s.triggerOldRascalDelayedDeath);
  const sheriffState = useGameStore((s) => s.sheriffState);
  const pendingShooters = useGameStore((s) => s.pendingShooters);
  const forceContinueAfterVictory = useGameStore((s) => s.forceContinueAfterVictory);

  const triggerShoot = useGameStore((s) => s.triggerShoot);
  const skipShoot = useGameStore((s) => s.skipShoot);
  const transferSheriffBadge = useGameStore((s) => s.transferSheriffBadge);
  const destroySheriffBadge = useGameStore((s) => s.destroySheriffBadge);
  const proceedToDayVote = useGameStore((s) => s.proceedToDayVote);
  const overrideVictory = useGameStore((s) => s.overrideVictory);

  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const board = getBoardById(selectedBoardId);
  const isOnlineJudge = hostMode.judgeMode === 'online_judge';

  const latestNight = useMemo(
    () => nightHistory.find((entry) => entry.round === round) ?? nightHistory[nightHistory.length - 1],
    [nightHistory, round],
  );

  const deaths = latestNight?.deaths ?? [];
  const nightDeadSeats = useMemo(() => deaths.map((d) => d.seat), [deaths]);
  const bearRoar = latestNight?.bearRoar ?? lastBearRoar;

  const disabledShootInfos = useMemo(() => {
    if (isOnlineJudge) return [];
    return deaths
      .map((death) => {
        const eligibility = checkCanShoot(seats, death.seat, death.reason);
        if (!eligibility || eligibility.canShoot) return null;
        return { ...eligibility, deathReason: death.reason };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [deaths, seats, isOnlineJudge]);

  const hasPendingShooters = pendingShooters.length > 0;
  const hasPendingBadgeTransfer = sheriffState.pendingBadgeTransferFrom !== null;
  const isProceedBlocked = hasPendingShooters || hasPendingBadgeTransfer;
  const isDeferredElectionNext =
    sheriffState.status === 'voting' && sheriffState.explodeCountDuringElection === 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* 1. 頂部緊湊座位狀態網格 */}
      <CompactSeatStatusGrid
        seats={seats}
        sheriffState={sheriffState}
        nightDeadSeats={nightDeadSeats}
        onOpenSeatDrawer={() => setSeatDrawerOpen(true)}
      />

      {/* 2. 中央任務操作區（內部局部可微滾，外框嚴格鎖死 100dvh） */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {forceContinueAfterVictory && (
          <div className="rounded-xl border border-amber-400/45 bg-amber-950/35 px-3 py-2 text-xs font-bold text-amber-200">
            ⚖️ 已解除自動勝負鎖定（法官強制繼續模式）：如需結束請點下方「勝負覆蓋」。
          </div>
        )}

        {/* 昨夜死訊公告卡 */}
        <section className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                第 {round} 天 · 天亮結算
              </span>
              <h1 className="text-lg font-extrabold text-slate-50">昨夜結果公告</h1>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
              {deaths.length === 0 ? '平安夜' : `出局 ${deaths.length} 人`}
            </span>
          </div>

          {deaths.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/35 p-4 text-center">
              <div className="text-xl font-extrabold text-emerald-200">☀️ 昨晚平安夜</div>
              <p className="mt-1 text-xs text-emerald-100/80">
                昨夜無人出局，請宣告昨晚是平安夜。
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-200">
                昨晚出局玩家（共 {deaths.length} 名，請只公佈出局座號，勿唸死因）：
              </div>

              {deaths.map((death) => {
                const seat = seats.find((s) => s.seatNumber === death.seat);
                const role = !isOnlineJudge ? getRoleById(seat?.roleId ?? null) : undefined;
                return (
                  <div
                    key={`${death.seat}-${death.reason}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3"
                  >
                    <div>
                      <div className="text-sm font-extrabold text-slate-50">
                        {seat ? formatSeatDisplay(seat) : `${death.seat} 號玩家`}
                      </div>
                      {!isOnlineJudge && (
                        <div className="mt-0.5 text-xs text-rose-300">
                          法官視角死因：{formatDeathReason(death.reason)}
                        </div>
                      )}
                      {!isOnlineJudge && death.reason === 'wolf_beauty_charm' && (
                        <div className="mt-1 inline-block rounded-md border border-rose-500/40 bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                          💘 狼美人殉情帶走（無死亡技能）
                        </div>
                      )}
                      {!isOnlineJudge &&
                        (death.reason === 'dream_catcher_consecutive' ||
                          death.reason === 'dream_catcher_link') && (
                          <div className="mt-1 inline-block rounded-md border border-indigo-500/40 bg-indigo-950/50 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
                            💤 攝夢人夢死／共死（無死亡技能）
                          </div>
                        )}
                    </div>
                    {role && (
                      <span
                        className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-bold ${getRoleBadgeClasses(role.id)}`}
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

        {/* 雙爆吞警徽隔日續選提示 */}
        {isDeferredElectionNext && (
          <section className="rounded-2xl border border-amber-400/50 bg-amber-950/35 p-3 text-xs font-bold text-amber-100">
            👮 雙爆吞警徽續選：進入白天後將自動跳過「上警報名與警上發言」，直接由候選人（
            {sheriffState.candidates.join('、')} 號）進入退水與警下投票。
          </section>
        )}

        {/* 禁言長老／梅杜莎／詭術師／煉金魔女／白貓日間狀態卡 */}
        {interferenceState?.activeMutedSeat !== null &&
          interferenceState?.activeMutedSeat !== undefined && (
            <section className="rounded-2xl border border-amber-400/55 bg-amber-950/35 p-3.5 text-xs font-bold text-amber-100">
              🔇 禁言長老公告：{interferenceState.activeMutedSeat} 號玩家今日遭禁言，發言階段不可出聲，僅能以手勢／肢體表達。
            </section>
          )}

        {interferenceState?.activePetrifiedSeat !== null &&
          interferenceState?.activePetrifiedSeat !== undefined && (
            <section className="rounded-2xl border border-purple-400/50 bg-purple-950/35 p-3.5 text-xs font-bold text-purple-100">
              🗿 梅杜莎石化狀態：{interferenceState.activePetrifiedSeat} 號今日遭石化，無法參與放逐投票（若為白痴被放逐無法翻牌）。
            </section>
          )}

        {!isOnlineJudge && interferenceState?.activeTricksterVoteSwap && (
          <section className="rounded-2xl border border-rose-400/45 bg-rose-950/30 p-3 text-xs font-bold text-rose-100">
            🃏 詭術師換票生效（法官視角）：{interferenceState.activeTricksterVoteSwap[0]} 號 ⇄{' '}
            {interferenceState.activeTricksterVoteSwap[1]} 號於今日放逐計票時將自動對調票數。
          </section>
        )}

        {thirdPartySpecialState?.crowActiveCursedSeat != null && (
          <section className="rounded-2xl border border-violet-400/50 bg-violet-950/35 p-3 text-xs font-bold text-violet-100">
            🐦 烏鴉詛咒：{thirdPartySpecialState.crowActiveCursedSeat} 號於今日放逐投票無條件 +1 票。
          </section>
        )}

        {!isOnlineJudge && thirdPartySpecialState?.butlerActiveVoteBonusSeat != null && (
          <section className="rounded-2xl border border-sky-400/45 bg-sky-950/30 p-3 text-xs font-bold text-sky-100">
            🍵 管家上茶（法官視角）：平民 {thirdPartySpecialState.butlerActiveVoteBonusSeat} 號今日放逐投票票權 +1（警長 2.5 票）。
          </section>
        )}

        {!isOnlineJudge && thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat != null && (
          <section className="rounded-2xl border border-rose-400/45 bg-rose-950/30 p-3 text-xs font-bold text-rose-100">
            🫖 狼僕上茶（法官視角）：平民 {thirdPartySpecialState.wolfMaidActiveVotePenaltySeat} 號今日放逐投票票權 -1（警長 0.5 票）。
          </section>
        )}

        {!isOnlineJudge &&
          thirdPartySpecialState &&
          !thirdPartySpecialState.sleepingBeautyAwakened &&
          thirdPartySpecialState.sleepingSeats.length > 0 && (
            <section className="rounded-2xl border border-indigo-400/45 bg-indigo-950/30 p-3 text-xs font-bold text-indigo-100">
              😴 睡美人睡眠擴散（法官視角）：目前睡眠座位為 {thirdPartySpecialState.sleepingSeats.join('、')} 號（熊不咆哮／女巫毒失效／獵人禁槍／禁言無效）。
            </section>
          )}

        {finalBatchState?.detectiveRevealedToday && (
          <section className="rounded-2xl border border-cyan-400/50 bg-cyan-950/35 p-3 text-xs font-bold text-cyan-100">
            🕵️ 偵探今日已翻牌：本輪全體狼人禁止自爆，發言結束後偵探可指定處決一名玩家。
          </section>
        )}

        {!isOnlineJudge && finalBatchState?.phantomWolfInvincibleActive && (
          <section className="rounded-2xl border border-amber-400/50 bg-amber-950/35 p-3 text-xs font-bold text-amber-100">
            🛡️ 怪盜狼王無敵生效中（法官視角）：今日免疫公投放逐與獵人開槍，下次入夜立即失效。
          </section>
        )}

        {!isOnlineJudge &&
          interferenceState &&
          !interferenceState.alchemySnakeUsed &&
          interferenceState.alchemySnakePendingVictimSeat !== null && (
            <section className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/50 bg-emerald-950/35 p-3.5">
              <div className="text-xs font-bold text-emerald-100">
                🐍 煉金魔女「法老之蛇」可用：發言結束後可救活 {interferenceState.alchemySnakePendingVictimSeat} 號
              </div>
              <button
                type="button"
                onClick={() =>
                  reviveWithAlchemySnake(interferenceState.alchemySnakePendingVictimSeat!)
                }
                className="min-h-11 shrink-0 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white hover:bg-emerald-500"
              >
                發動救活
              </button>
            </section>
          )}

        {seats.some((s) => s.isAlive && s.roleId === 'white_cat' && s.whiteCatRevealed) && (
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-sky-400/50 bg-sky-950/35 p-3.5">
            <div className="text-xs font-bold text-sky-100">
              🐱 白貓已翻牌免死（免疫本輪死亡，於本次放逐階段結束後正式出局）
            </div>
            <button
              type="button"
              onClick={() => triggerWhiteCatDelayedDeath()}
              className="min-h-11 shrink-0 rounded-xl bg-sky-600 px-3 text-xs font-extrabold text-white hover:bg-sky-500"
            >
              結算白貓出局
            </button>
          </section>
        )}

        {combatState && combatState.scarletAttachedSeats.length > 0 && (
          <section className="rounded-2xl border border-rose-500/50 bg-rose-950/35 p-3.5 text-xs font-bold text-rose-100">
            🩸 猩紅之子附著公告：{combatState.scarletAttachedSeats.join('、')} 號已被附著（成為神職技能目標時將於夜間出局）。
          </section>
        )}

        {combatState?.pufferfishWolfKilledToday && (
          <section className="rounded-2xl border border-amber-400/50 bg-amber-950/35 p-3.5 text-xs font-bold text-amber-100">
            🐡 河豚吃狼刀翻牌：今日狼美人的魅惑技能失效！
          </section>
        )}

        {seats.some((s) => s.isAlive && s.oldRascalDelayedDeath) && (
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-orange-400/50 bg-orange-950/35 p-3.5">
            <div className="text-xs font-bold text-orange-100">
              🍺 老流氓中毒／負傷延遲死亡（於本日發言階段結束後正式出局）
            </div>
            <button
              type="button"
              onClick={() => triggerOldRascalDelayedDeath()}
              className="min-h-11 shrink-0 rounded-xl bg-orange-600 px-3 text-xs font-extrabold text-white hover:bg-orange-500"
            >
              結算老流氓出局
            </button>
          </section>
        )}

        {/* 高級平民首日死訊後自動公布卡 */}
        {lastSeniorVillagerReveal && lastSeniorVillagerReveal.seatNumber !== null && round === 1 && (
          <section
            className={`rounded-2xl border p-3.5 ${
              lastSeniorVillagerReveal.revealed
                ? 'border-sky-400/60 bg-sky-950/35'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-lg bg-sky-500/20 px-2 py-0.5 text-[11px] font-extrabold text-sky-200">
                高級平民首日公布
              </span>
            </div>
            <div className="mt-1.5 text-sm font-extrabold text-slate-50">
              {lastSeniorVillagerReveal.revealed
                ? `🪪 請公開宣布：${lastSeniorVillagerReveal.seatNumber} 號為高級平民`
                : '🔇 本日不公布高級平民身分'}
            </div>
            {!isOnlineJudge && (
              <p className="mt-1 text-xs text-slate-300">{lastSeniorVillagerReveal.reason}</p>
            )}
          </section>
        )}

        {/* 月靈狼嗥叫提示卡 */}
        {lastMoonSpiritHowl && lastMoonSpiritHowl.moonSpiritSeat !== null && (
          <section
            className={`rounded-2xl border p-3.5 ${
              lastMoonSpiritHowl.howled
                ? 'border-purple-400/60 bg-purple-950/35'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-lg bg-purple-500/20 px-2 py-0.5 text-[11px] font-extrabold text-purple-200">
                月靈狼嗥叫狀態
              </span>
            </div>
            <div className="mt-1.5 text-sm font-extrabold text-slate-50">
              {lastMoonSpiritHowl.howled ? '🌕 昨夜月靈狼嗥叫了！' : '🌑 昨夜月靈狼沒有嗥叫'}
            </div>
            {!isOnlineJudge && (
              <p className="mt-1 text-xs text-slate-300">{lastMoonSpiritHowl.reason}</p>
            )}
          </section>
        )}

        {/* 熊咆哮天亮公告卡 */}
        {bearRoar && (
          <section
            className={`rounded-2xl border p-3.5 ${
              bearRoar.roared
                ? 'border-amber-400/60 bg-amber-950/35'
                : 'border-emerald-500/40 bg-emerald-950/25'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
                  bearRoar.roared
                    ? 'bg-amber-500/25 text-amber-200'
                    : 'bg-emerald-500/20 text-emerald-200'
                }`}
              >
                天亮熊咆哮公告
              </span>
              {!isOnlineJudge && bearRoar.bearSeat !== null && (
                <span className="text-xs font-semibold text-slate-400">
                  熊：{bearRoar.bearSeat} 號
                </span>
              )}
            </div>
            <div
              className={`mt-1.5 text-base font-extrabold ${
                bearRoar.roared ? 'text-amber-100' : 'text-emerald-100'
              }`}
            >
              {bearRoar.roared
                ? '🐻 昨晚熊咆哮了（身邊有狼）'
                : '🐻 昨晚熊沒有咆哮（身邊無狼）'}
            </div>
            {!isOnlineJudge && (
              <p className="mt-1 text-xs text-slate-300">判定依據：{bearRoar.reason}</p>
            )}
          </section>
        )}

        {/* 警長昨夜出局之警徽交接／撕毀面板 */}
        {sheriffState.pendingBadgeTransferFrom !== null && (
          <SheriffBadgeTransferCard
            fromSeat={sheriffState.pendingBadgeTransferFrom}
            seats={seats}
            onTransfer={transferSheriffBadge}
            onDestroy={destroySheriffBadge}
          />
        )}

        {/* 禁開槍狀態提示（僅實體法官） */}
        {disabledShootInfos.length > 0 && (
          <section className="space-y-2">
            {disabledShootInfos.map((info) => {
              const seat = seats.find((s) => s.seatNumber === info.seatNumber);
              const roleLabel = info.roleId === 'hunter' ? '獵人' : '狼王';
              return (
                <div
                  key={info.seatNumber}
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3"
                >
                  <span className="inline-block rounded-lg bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                    ❌ 不可開槍
                  </span>
                  <div className="mt-1 text-sm font-bold text-slate-100">
                    {seat ? formatSeatDisplay(seat) : `${info.seatNumber} 號`}（{roleLabel}）
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">原因：{info.reason}</p>
                </div>
              );
            })}
          </section>
        )}

        {/* 可開槍結算卡片 */}
        {pendingShooters.map((shooter) => (
          <PendingShooterCard
            key={shooter.seatNumber}
            shooter={shooter}
            seats={seats}
            onShoot={triggerShoot}
            onSkip={skipShoot}
          />
        ))}
      </div>

      {/* 3. 底部固定操作列 */}
      <div className="flex shrink-0 items-center gap-2 border-t border-slate-800 pt-2">
        <button
          type="button"
          onClick={() => setVictoryModalOpen(true)}
          className="min-h-12 shrink-0 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800 active:scale-[0.98]"
        >
          ⚖️ 勝負覆蓋
        </button>
        <button
          type="button"
          disabled={isProceedBlocked}
          onClick={proceedToDayVote}
          className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-extrabold transition ${
            isProceedBlocked
              ? 'cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99]'
          }`}
        >
          {hasPendingShooters
            ? '請先結算開槍 / 壓槍'
            : hasPendingBadgeTransfer
              ? '請先移交 / 撕毀警徽'
              : '進入白天發言與投票 ➜'}
        </button>
      </div>

      <SeatStatusDrawer
        open={seatDrawerOpen}
        board={board}
        onClose={() => setSeatDrawerOpen(false)}
      />

      <ManualVictoryModal
        open={victoryModalOpen}
        onSelectOverride={(kind) => overrideVictory(kind)}
        onClose={() => setVictoryModalOpen(false)}
      />
    </div>
  );
}
