import type {
  FinalBatchRuntimeState,
  InterferenceRuntimeState,
  ThirdPartySpecialRuntimeState,
} from '../../logic/types';

interface NightStatusBannersProps {
  isOnlineJudge: boolean;
  interferenceState?: InterferenceRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  finalBatchState?: FinalBatchRuntimeState;
}

/** 統一渲染天亮後的各角色狀態橫幅（禁言／石化／換票／烏鴉／管家／狼僕／睡美人／偵探／怪盜狼王） */
export function NightStatusBanners({
  isOnlineJudge,
  interferenceState,
  thirdPartySpecialState,
  finalBatchState,
}: NightStatusBannersProps) {
  return (
    <>
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
          🐦 烏鴉詛咒：{thirdPartySpecialState.crowActiveCursedSeat} 號於今日放逐投票無條件 +1 票（計票時已自動帶入）。
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
    </>
  );
}
