const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const;

/**
 * 將正整數轉為中文數字（1 → 一、10 → 十、11 → 十一、20 → 二十、23 → 二十三）。
 */
export function toChineseNumeral(num: number): string {
  const safe = Math.max(0, Math.floor(num));
  if (safe < 10) {
    return CHINESE_DIGITS[safe];
  }
  if (safe < 100) {
    const tens = Math.floor(safe / 10);
    const ones = safe % 10;
    const tensPart = tens === 1 ? '十' : `${CHINESE_DIGITS[tens]}十`;
    const onesPart = ones === 0 ? '' : CHINESE_DIGITS[ones];
    return `${tensPart}${onesPart}`;
  }
  return String(safe);
}

/** 格式化為中文天數（1 → 第一天、2 → 第二天） */
export function formatChineseDay(round: number): string {
  return `第${toChineseNumeral(Math.max(1, round))}天`;
}

/** 格式化為中文晚數（1 → 第一晚、2 → 第二晚） */
export function formatChineseNight(round: number): string {
  return `第${toChineseNumeral(Math.max(1, round))}晚`;
}
