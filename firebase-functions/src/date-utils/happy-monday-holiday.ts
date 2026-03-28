/**
 * ハッピーマンデー制度の祝日に該当するか判定する
 * （1月第2月曜・7月第3月曜・9月第3月曜・10月第2月曜）
 */
export const isHappyMondayHoliday = (
  month: number,
  day: number,
  dayOfWeek: number,
): boolean => {
  if (dayOfWeek !== 1) return false;

  const weekNum = Math.ceil(day / 7);

  if (month === 1 && weekNum === 2) return true;
  if (month === 7 && weekNum === 3) return true;
  if (month === 9 && weekNum === 3) return true;
  if (month === 10 && weekNum === 2) return true;

  return false;
};
