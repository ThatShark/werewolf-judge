import { getRoleById } from '../data/roles';
import type {
  ConversionRuntimeState,
  PlayerSeat,
  ThirdPartySpecialRuntimeState,
} from './types';

/**
 * 單一真相來源：判斷座位目前是否屬於狼人陣營
 * （統一考量種狼感染、覺醒石像鬼轉化、野孩子變狼、覺醒孤獨少女變狼、超級黑市商人變狼與原始狼人身分）
 */
export function isSeatEffectiveWolf(
  seat: PlayerSeat | undefined,
  options: {
    conversionState?: ConversionRuntimeState;
    thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  } = {},
): boolean {
  if (!seat || !seat.roleId) return false;
  if (seat.infectedBySeedWolf || seat.convertedByAwakenedGargoyle) return true;
  if (
    seat.roleId === 'super_black_market_merchant' &&
    options.thirdPartySpecialState?.superBlackMarketTurnedWolf
  ) {
    return true;
  }
  if (seat.roleId === 'wild_child' && options.conversionState?.wildChildTurnedWolf) {
    return true;
  }
  if (
    seat.roleId === 'awakened_lonely_girl' &&
    options.conversionState?.awakenedLonelyGirlStatus === 'wolf'
  ) {
    return true;
  }
  if (
    seat.roleId === 'awakened_lonely_girl' &&
    options.conversionState?.awakenedLonelyGirlStatus === 'inherited' &&
    options.conversionState.awakenedLonelyGirlInheritedRoleId
  ) {
    return getRoleById(options.conversionState.awakenedLonelyGirlInheritedRoleId)?.faction === 'wolf';
  }
  if (
    seat.roleId === 'avenger' &&
    options.conversionState?.avengerAlignedFaction === 'wolf'
  ) {
    return true;
  }
  if (
    seat.roleId === 'shadow' &&
    options.conversionState?.shadowInheritedRoleId
  ) {
    return getRoleById(options.conversionState.shadowInheritedRoleId)?.faction === 'wolf';
  }
  if (
    options.conversionState?.chameleonWolfSeat === seat.seatNumber &&
    options.conversionState.chameleonOriginalRoleId === 'chameleon_wolf_king'
  ) {
    return true;
  }
  return getRoleById(seat.roleId)?.faction === 'wolf';
}

/** 判斷場上除了指定孤狼角色外，是否已無任何其他存活狼人（供孤狼入隊判定共用） */
export function hasNoOtherAliveWolves(
  seats: PlayerSeat[],
  excludedRoleId: string,
  options: {
    conversionState?: ConversionRuntimeState;
    thirdPartySpecialState?: ThirdPartySpecialRuntimeState;
  } = {},
): boolean {
  return !seats.some(
    (s) => s.isAlive && s.roleId !== excludedRoleId && isSeatEffectiveWolf(s, options),
  );
}
