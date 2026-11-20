import type {
  PlayerSeat,
  SpeakingDirection,
  SpeakingOrderOptions,
  SpeakingOrderResult,
} from './types';

function clampUnitRandom(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value >= 1) return 0.999999999;
  return value;
}

function getSortedSeats(seats: PlayerSeat[]): PlayerSeat[] {
  return [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
}

/**
 * 自基準座位出發，沿環狀座位順序走訪一圈。
 * - clockwise（順時針）：座號遞增（1 -> 2 -> ... -> N -> 1），對應「警左／死左」。
 * - counterclockwise（逆時針）：座號遞減（N -> ... -> 2 -> 1 -> N），對應「警右／死右」。
 */
function walkCircularSeats(
  sortedSeats: PlayerSeat[],
  anchorSeat: number,
  direction: SpeakingDirection,
  includeAnchor: boolean,
): PlayerSeat[] {
  const total = sortedSeats.length;
  if (total === 0) return [];

  const anchorIndex = sortedSeats.findIndex((seat) => seat.seatNumber === anchorSeat);
  if (anchorIndex === -1) {
    throw new Error(`找不到基準座位：${anchorSeat} 號`);
  }

  const step = direction === 'clockwise' ? 1 : -1;
  const result: PlayerSeat[] = [];

  if (includeAnchor) {
    result.push(sortedSeats[anchorIndex]);
  }

  for (let offset = 1; offset < total; offset += 1) {
    const idx = (anchorIndex + step * offset + total * 2) % total;
    result.push(sortedSeats[idx]);
  }

  return result;
}

/**
 * 計算環狀座位發言順序（自動跳過已出局玩家）：
 * - random：隨機抽出起始存活座位與方向（支援 candidateSeats 供警上候選人發言使用）。
 * - sheriff_left / sheriff_right：警長指定方向，警長自動排於最後一位（歸票位）。
 * - dead_left / dead_right：以指定基準死者為起點（多死由法官指定），若有存活警長則警長排於最後一位（歸票位）。
 */
export function generateSpeakingOrder(
  seats: PlayerSeat[],
  options: SpeakingOrderOptions,
): SpeakingOrderResult {
  const sortedSeats = getSortedSeats(seats);
  const { mode, candidateSeats, sheriffSeat = null, referenceDeadSeat = null } = options;
  const rng = options.rng ?? Math.random;

  if (mode === 'random') {
    const candidateSet = candidateSeats ? new Set(candidateSeats) : null;
    const eligibleSeats = sortedSeats.filter(
      (seat) => seat.isAlive && (!candidateSet || candidateSet.has(seat.seatNumber)),
    );

    if (eligibleSeats.length === 0) {
      return {
        mode,
        direction: 'clockwise',
        startSeat: null,
        anchorSeat: null,
        sheriffLastSeat: null,
        queue: [],
      };
    }

    const startIndex = Math.floor(clampUnitRandom(rng()) * eligibleSeats.length);
    const startSeat = eligibleSeats[startIndex].seatNumber;
    const direction: SpeakingDirection =
      clampUnitRandom(rng()) < 0.5 ? 'clockwise' : 'counterclockwise';

    const eligibleSet = new Set(eligibleSeats.map((s) => s.seatNumber));
    const queue = walkCircularSeats(sortedSeats, startSeat, direction, true)
      .filter((seat) => eligibleSet.has(seat.seatNumber))
      .map((seat) => seat.seatNumber);

    return {
      mode,
      direction,
      startSeat,
      anchorSeat: startSeat,
      sheriffLastSeat: null,
      queue,
    };
  }

  if (mode === 'sheriff_left' || mode === 'sheriff_right') {
    if (sheriffSeat === null) {
      throw new Error('警左／警右發言模式必須指定警長座位');
    }
    const sheriff = sortedSeats.find((seat) => seat.seatNumber === sheriffSeat);
    if (!sheriff || !sheriff.isAlive) {
      throw new Error(`警長座位 ${sheriffSeat} 號不存在或已出局`);
    }

    const direction: SpeakingDirection =
      mode === 'sheriff_left' ? 'clockwise' : 'counterclockwise';
    const others = walkCircularSeats(sortedSeats, sheriffSeat, direction, false)
      .filter((seat) => seat.isAlive)
      .map((seat) => seat.seatNumber);

    const queue = [...others, sheriffSeat];
    return {
      mode,
      direction,
      startSeat: queue[0] ?? null,
      anchorSeat: sheriffSeat,
      sheriffLastSeat: sheriffSeat,
      queue,
    };
  }

  // dead_left | dead_right
  if (referenceDeadSeat === null) {
    throw new Error('死左／死右發言模式必須指定基準死者座位');
  }
  const deadSeatExists = sortedSeats.some((seat) => seat.seatNumber === referenceDeadSeat);
  if (!deadSeatExists) {
    throw new Error(`找不到基準死者座位：${referenceDeadSeat} 號`);
  }

  const direction: SpeakingDirection = mode === 'dead_left' ? 'clockwise' : 'counterclockwise';
  const aliveSheriff =
    sheriffSeat !== null
      ? sortedSeats.find((seat) => seat.seatNumber === sheriffSeat && seat.isAlive) ?? null
      : null;

  const aliveSheriffSeat = aliveSheriff ? aliveSheriff.seatNumber : null;

  const others = walkCircularSeats(sortedSeats, referenceDeadSeat, direction, false)
    .filter((seat) => seat.isAlive && seat.seatNumber !== aliveSheriffSeat)
    .map((seat) => seat.seatNumber);

  const queue = aliveSheriffSeat !== null ? [...others, aliveSheriffSeat] : others;

  return {
    mode,
    direction,
    startSeat: queue[0] ?? null,
    anchorSeat: referenceDeadSeat,
    sheriffLastSeat: aliveSheriffSeat,
    queue,
  };
}
