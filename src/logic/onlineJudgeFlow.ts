import type { NightActionDraft, NightStepScript, PlayerSeat } from './types';

export interface NightEndSpeechPlan {
  /** 開頭主台詞（不含三、二、一） */
  introText: string;
  /** 依序停頓 1 秒播報的倒數字詞 */
  countdown: readonly ['三', '二', '一'];
  /** 完整文字（供無語音或字幕展示） */
  fullText: string;
}

/** 線上法官每晚開頭固定台詞 */
export function buildNightStartSpeech(): string {
  return '天黑請閉眼';
}

/**
 * 線上法官每晚結尾固定台詞：
 * - 第一晚且開啟警長：「要上警的玩家請舉手，三秒後天亮，三、二、一」
 * - 其餘夜晚或無警長局：「三秒後天亮，三、二、一」
 */
export function buildNightEndSpeech(round: number, enableSheriff: boolean): NightEndSpeechPlan {
  const introText =
    round === 1 && enableSheriff ? '要上警的玩家請舉手，三秒後天亮' : '三秒後天亮';
  return {
    introText,
    countdown: ['三', '二', '一'],
    fullText: `${introText}，三、二、一`,
  };
}

/** 線上法官精簡睜眼台詞（不播報中間操作提示） */
export function buildStepOpenSpeech(
  step: Pick<NightStepScript, 'openPrompt' | 'actorLabel'>,
): string {
  const open = step.openPrompt?.trim();
  return open && open.length > 0 ? open : `${step.actorLabel} 請睜眼`;
}

/** 線上法官精簡閉眼台詞 */
export function buildStepCloseSpeech(
  step: Pick<NightStepScript, 'closePrompt' | 'actorLabel'>,
): string {
  const close = step.closePrompt?.trim();
  return close && close.length > 0 ? close : `${step.actorLabel} 請閉眼`;
}

export type TouchConfirmKind =
  | 'lucky_player'
  | 'cupid_lovers'
  | 'ghost_bride_link'
  | 'scent_phantom_link'
  | 'infected_or_converted'
  | 'jack_fanatic';

export interface TouchConfirmEvent {
  kind: TouchConfirmKind;
  /** 流程標題（供防窺頂部標示，絕不洩露座號） */
  title: string;
  /** 獲得此附加身分／狀態的座號（內部比對用，絕不揭露給其他玩家或另一半） */
  affectedSeats: number[];
}

export interface SeatTouchConfirmView {
  hasStatus: boolean;
  /** 大字主狀態（嚴格資訊隔離：只告知是否獲得該身分／狀態，不揭露禮物內容或隊友座號） */
  headline: string;
  /** 極簡輔助提示 */
  subline: string;
}

/**
 * 取得線上法官輪流確認附加身分的座號順序：固定從 1 號到 N 號升冪排序。
 */
export function getTouchConfirmSeatOrder(seats: PlayerSeat[]): number[] {
  return [...seats].map((s) => s.seatNumber).sort((a, b) => a - b);
}

/**
 * 判斷剛完成的夜間步驟是否觸發「線上法官 1 號起輪流睜眼確認附加身分」機制。
 * 僅在該步驟實際指派了需法官碰頭告知的附加身分／狀態時回傳事件物件，否則回傳 null。
 */
export function getTouchConfirmEventAfterStep(
  step: Pick<NightStepScript, 'actionType'>,
  draft: NightActionDraft,
  round: number,
  boardId?: string | null,
): TouchConfirmEvent | null {
  switch (step.actionType) {
    case 'miracle_merchant_gift':
      if (draft.miracleMerchantTarget != null) {
        return {
          kind: 'lucky_player',
          title: '幸運兒身分確認',
          affectedSeats: [draft.miracleMerchantTarget],
        };
      }
      return null;
    case 'black_market_gift':
      if (draft.blackMarketTarget != null) {
        return {
          kind: 'lucky_player',
          title: '幸運兒身分確認',
          affectedSeats: [draft.blackMarketTarget],
        };
      }
      return null;
    case 'super_black_market_gift': {
      const targets = draft.superBlackMarketTargets;
      if (!targets) return null;
      const seats = Array.from(
        new Set(
          [targets.seer_check, targets.witch_poison, targets.hunter_gun].filter(
            (n): n is number => n != null,
          ),
        ),
      ).sort((a, b) => a - b);
      if (seats.length > 0) {
        return {
          kind: 'lucky_player',
          title: '幸運兒身分確認',
          affectedSeats: seats,
        };
      }
      return null;
    }
    case 'evil_merchant_gift':
      if (draft.evilMerchantTarget != null) {
        return {
          kind: 'lucky_player',
          title: '幸運兒身分確認',
          affectedSeats: [draft.evilMerchantTarget],
        };
      }
      return null;
    case 'cupid_link': {
      const pair = draft.cupidLoversPair;
      if (round === 1 && pair && pair[0] != null && pair[1] != null) {
        return {
          kind: 'cupid_lovers',
          title: '情侶身分確認',
          affectedSeats: Array.from(new Set([pair[0], pair[1]])).sort((a, b) => a - b),
        };
      }
      return null;
    }
    case 'ghost_bride_link': {
      if (
        round === 1 &&
        draft.ghostBrideGroomTarget != null &&
        draft.ghostBrideWitnessTarget != null
      ) {
        return {
          kind: 'ghost_bride_link',
          title: '連線身分確認',
          affectedSeats: Array.from(
            new Set([draft.ghostBrideGroomTarget, draft.ghostBrideWitnessTarget]),
          ).sort((a, b) => a - b),
        };
      }
      return null;
    }
    case 'scent_phantom_link': {
      const pair = draft.scentPhantomChainPair;
      if (round === 1 && pair && pair[0] != null && pair[1] != null) {
        return {
          kind: 'scent_phantom_link',
          title: '連線身分確認',
          affectedSeats: Array.from(new Set([pair[0], pair[1]])).sort((a, b) => a - b),
        };
      }
      return null;
    }
    case 'wolf_kill':
      if (draft.seedWolfInfectTarget != null) {
        return {
          kind: 'infected_or_converted',
          title: '附加狀態確認',
          affectedSeats: [draft.seedWolfInfectTarget],
        };
      }
      return null;
    case 'zombie_infect':
      if (draft.zombieInfectTargets && draft.zombieInfectTargets.length > 0) {
        return {
          kind: 'infected_or_converted',
          title: '附加狀態確認',
          affectedSeats: Array.from(new Set(draft.zombieInfectTargets)).sort((a, b) => a - b),
        };
      }
      return null;
    case 'awakened_gargoyle_convert':
      if (draft.awakenedGargoyleConvertTarget != null) {
        return {
          kind: 'infected_or_converted',
          title: '附加狀態確認',
          affectedSeats: [draft.awakenedGargoyleConvertTarget],
        };
      }
      return null;
    case 'puppet_wolf_choose':
      if (draft.puppetTarget != null) {
        return {
          kind: 'infected_or_converted',
          title: '附加狀態確認',
          affectedSeats: [draft.puppetTarget],
        };
      }
      return null;
    case 'jack_ripper_action':
      if (
        round === 1 &&
        boardId === '12p-jack-the-ripper-2' &&
        draft.jackRipperFanaticTarget != null
      ) {
        return {
          kind: 'jack_fanatic',
          title: '附加身分確認',
          affectedSeats: [draft.jackRipperFanaticTarget],
        };
      }
      return null;
    default:
      return null;
  }
}

/**
 * 資訊隔離鐵律：
 * 輪流確認環節只告知該玩家「是否獲得該附加身分／狀態」，
 * 絕不揭露禮物內容、另一半座號或轉化來源細節。
 */
export function getSeatTouchConfirmView(
  seatNumber: number,
  event: TouchConfirmEvent,
): SeatTouchConfirmView {
  const hasStatus = event.affectedSeats.includes(seatNumber);
  if (!hasStatus) {
    return {
      hasStatus: false,
      headline: '你沒有獲得附加身分',
      subline: '確認後請閉眼',
    };
  }

  switch (event.kind) {
    case 'lucky_player':
      return {
        hasStatus: true,
        headline: '你是幸運兒',
        subline: '請於後續幸運兒專屬步驟睜眼查看詳情',
      };
    case 'cupid_lovers':
      return {
        hasStatus: true,
        headline: '你成為了情侶',
        subline: '請於後續情侶相認步驟睜眼相認',
      };
    case 'ghost_bride_link':
      return {
        hasStatus: true,
        headline: '你成為了連線對象',
        subline: '請於後續專屬步驟睜眼確認',
      };
    case 'scent_phantom_link':
      return {
        hasStatus: true,
        headline: '你已被連線',
        subline: '請於後續專屬步驟睜眼確認',
      };
    case 'infected_or_converted':
      return {
        hasStatus: true,
        headline: '你已被轉化／感染',
        subline: '請記住你的附加狀態後閉眼',
      };
    case 'jack_fanatic':
      return {
        hasStatus: true,
        headline: '你成為了狂熱粉',
        subline: '請於後續相認步驟睜眼相認',
      };
  }
}
