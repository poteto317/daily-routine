export const getShunbunDate = (year: number): number => {
  return Math.floor(
    20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );
};

export const getShuubunDate = (year: number): number => {
  return Math.floor(
    23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );
};

export const getNthMonday = (
  year: number,
  month: number,
  week: number,
): number => {
  const firstDay = new Date(year, month - 1, 1);
  const firstMonday =
    firstDay.getDay() === 1 ? 1 : ((8 - firstDay.getDay()) % 7) + 1;
  return firstMonday + (week - 1) * 7;
};
