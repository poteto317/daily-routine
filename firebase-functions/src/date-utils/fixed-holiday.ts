type FixedHoliday = {
  month: number;
  day: number;
};

const FIXED_HOLIDAYS: FixedHoliday[] = [
  { month: 1, day: 1 },
  { month: 2, day: 11 },
  { month: 2, day: 23 },
  { month: 4, day: 29 },
  { month: 5, day: 3 },
  { month: 5, day: 4 },
  { month: 5, day: 5 },
  { month: 8, day: 11 },
  { month: 11, day: 3 },
  { month: 11, day: 23 },
];

/**
 * 月日が固定祝日に該当するか判定する
 */
export const isFixedHoliday = (month: number, day: number): boolean => {
  return FIXED_HOLIDAYS.some(
    (holiday) => holiday.month === month && holiday.day === day,
  );
};
