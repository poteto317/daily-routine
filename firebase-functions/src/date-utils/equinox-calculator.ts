/**
 * 春分の日の日付を計算する（概算式）
 */
export const getSpringEquinoxDay = (year: number): number => {
  return Math.floor(
    20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );
};

/**
 * 秋分の日の日付を計算する（概算式）
 */
export const getAutumnEquinoxDay = (year: number): number => {
  return Math.floor(
    23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );
};
