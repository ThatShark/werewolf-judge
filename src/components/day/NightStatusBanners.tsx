import { useState } from 'react';
import type {
  FinalBatchRuntimeState,
  InterferenceRuntimeState,
  ThirdPartySpecialRuntimeState,
} from '../../logic/types';
import { formatSeatNum } from '../common/displayHelpers';

interface NightStatusBannersProps {
  isOnlineJudge: boolean;
  interferenceState?: InterferenceRuntimeState;
  thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  finalBatchState?: FinalBatchRuntimeState;
}

interface StatusPill {
  id: string;
  label: string;
  detail: string;
  tone: 'sheriff' | 'wolf' | 'good' | 'third';
}

/** 單行狀態膠囊列：點擊膠囊才展開詳情，避免多層警告橫幅擠壓單屏高度 */
export function NightStatusBanners({
  isOnlineJudge,
  interferenceState,
  thirdPartySpecialState,
  finalBatchState,
}: NightStatusBannersProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pills: StatusPill[] = [];

  if (interferenceState?.activeMutedSeat != null) {
    pills.push({
      id: 'muted',
      label: `禁言 ${formatSeatNum(interferenceState.activeMutedSeat)}`,
      detail: `${formatSeatNum(interferenceState.activeMutedSeat)} 號今日遭禁言，發言階段不可出聲。`,
      tone: 'sheriff',
    });
  }

  if (interferenceState?.activePetrifiedSeat != null) {
    pills.push({
      id: 'petrified',
      label: `石化 ${formatSeatNum(interferenceState.activePetrifiedSeat)}`,
      detail: `${formatSeatNum(interferenceState.activePetrifiedSeat)} 號今日遭梅杜莎石化，無放逐投票權（白痴不可翻牌）。`,
      tone: 'third',
    });
  }

  if (!isOnlineJudge && interferenceState?.activeTricksterVoteSwap) {
    const [a, b] = interferenceState.activeTricksterVoteSwap;
    pills.push({
      id: 'trickster',
      label: `換票 ${formatSeatNum(a)}⇄${formatSeatNum(b)}`,
      detail: `詭術師換票生效（法官視角）：${formatSeatNum(a)} 號與 ${formatSeatNum(b)} 號放逐計票時自動對調。`,
      tone: 'wolf',
    });
  }

  if (thirdPartySpecialState?.crowActiveCursedSeat != null) {
    pills.push({
      id: 'crow',
      label: `烏鴉 ${formatSeatNum(thirdPartySpecialState.crowActiveCursedSeat)} +1`,
      detail: `${formatSeatNum(thirdPartySpecialState.crowActiveCursedSeat)} 號今日放逐投票自動 +1 票。`,
      tone: 'third',
    });
  }

  if (!isOnlineJudge && thirdPartySpecialState?.butlerActiveVoteBonusSeat != null) {
    pills.push({
      id: 'butler',
      label: `管家 ${formatSeatNum(thirdPartySpecialState.butlerActiveVoteBonusSeat)} +1`,
      detail: `管家上茶（法官視角）：${formatSeatNum(thirdPartySpecialState.butlerActiveVoteBonusSeat)} 號今日票權 +1。`,
      tone: 'good',
    });
  }

  if (!isOnlineJudge && thirdPartySpecialState?.wolfMaidActiveVotePenaltySeat != null) {
    pills.push({
      id: 'wolfmaid',
      label: `狼僕 ${formatSeatNum(thirdPartySpecialState.wolfMaidActiveVotePenaltySeat)} -1`,
      detail: `狼僕上茶（法官視角）：${formatSeatNum(thirdPartySpecialState.wolfMaidActiveVotePenaltySeat)} 號今日票權 -1。`,
      tone: 'wolf',
    });
  }

  if (
    !isOnlineJudge &&
    thirdPartySpecialState &&
    !thirdPartySpecialState.sleepingBeautyAwakened &&
    thirdPartySpecialState.sleepingSeats.length > 0
  ) {
    pills.push({
      id: 'sleep',
      label: `睡眠 ${thirdPartySpecialState.sleepingSeats.length}人`,
      detail: `睡美人睡眠座位：${thirdPartySpecialState.sleepingSeats.map(formatSeatNum).join('、')} 號。`,
      tone: 'third',
    });
  }

  if (finalBatchState?.detectiveRevealedToday) {
    pills.push({
      id: 'detective',
      label: '偵探翻牌',
      detail: '本輪禁止狼人自爆，發言結束後偵探可指定處決一名玩家。',
      tone: 'good',
    });
  }

  if (!isOnlineJudge && finalBatchState?.phantomWolfInvincibleActive) {
    pills.push({
      id: 'phantom',
      label: '怪盜無敵',
      detail: '怪盜狼王今日免疫公投放逐與獵人開槍（法官視角）。',
      tone: 'sheriff',
    });
  }

  if (pills.length === 0) return null;

  const toneClass: Record<StatusPill['tone'], string> = {
    sheriff: 'border-sheriff-border bg-sheriff-tint text-sheriff',
    wolf: 'border-wolf-border bg-wolf-tint text-wolf',
    good: 'border-good-border bg-good-tint text-good',
    third: 'border-third-border bg-third-tint text-third',
  };

  const activePill = pills.find((p) => p.id === expandedId) ?? null;

  return (
    <div className="shrink-0 space-y-1.5">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {pills.map((pill) => {
          const isOpen = expandedId === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setExpandedId(isOpen ? null : pill.id)}
              className={`min-h-8 shrink-0 rounded-md border px-2.5 text-[12px] font-semibold tabular-nums transition ${toneClass[pill.tone]} ${
                isOpen ? 'opacity-100' : 'opacity-90 hover:opacity-100'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
      {activePill && (
        <div className="border-l-2 border-sheriff bg-surface px-3 py-1.5 text-[12px] text-primary">
          {activePill.detail}
        </div>
      )}
    </div>
  );
}
