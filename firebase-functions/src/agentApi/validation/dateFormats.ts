export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "YYYY-MM-DD" の年月日が暦の上で実在するか（例: 2026-02-30 は false） */
export const isRealDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  // Date.UTC は 0〜99 年を 1900 年代に補正するため、setUTCFullYear で年を直接設定する
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/** DATE_PATTERN に一致し、かつ実在する日付か */
export const isValidDate = (value: string): boolean =>
  DATE_PATTERN.test(value) && isRealDate(value);
