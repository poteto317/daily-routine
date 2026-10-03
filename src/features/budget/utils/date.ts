export const toMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * 月だけをずらした日付を返す。戻り値は常にその月の1日になる
 * （日は保持しない）。呼び出し元は年月だけを必要としており日は
 * 使わないため、常に1日を返すことで日オーバーフローを避けている
 * （`date` の日部分をそのまま `setMonth` に渡すと、月末日（29〜31日）
 * がずらした先の月に存在しない場合にさらに翌月へ繰り上がってしまう。
 * 例: 3/31 の1ヶ月後を素朴に計算すると 4/31 が存在せず 5/1 になる）。
 * 日を保持したい用途にはこの関数を使わないこと。
 * （関数名にも "ToFirstDay" として契約を明示している）
 */
export const shiftMonthToFirstDay = (date: Date, offset: number): Date => {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
};

export const isCurrentMonthDate = (
  date: Date,
  now: Date = new Date(),
): boolean => {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
};

export const daysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/** "YYYY-MM" 形式の月キーを、その月の1日を表す Date に変換する。 */
export const monthKeyToDate = (monthKey: string): Date => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
};

/** "YYYY-MM" 形式の月キーからその月の日数を返す。 */
export const daysInMonthByKey = (monthKey: string): number => {
  return daysInMonth(monthKeyToDate(monthKey));
};

export const toDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** "YYYY-MM-DD" の日付が、now の日付（ローカル）より前かどうか。固定長なので文字列比較で判定できる */
export const isBeforeToday = (dateValue: string, now: Date): boolean =>
  dateValue < toDateKey(now);

export const getDefaultExpenseDate = (targetMonth: Date): string => {
  const now = new Date();
  if (isCurrentMonthDate(targetMonth, now)) {
    return toDateKey(now);
  }
  return `${toMonthKey(targetMonth)}-01`;
};

export const formatExpenseDate = (date: string): string => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
};

/** ローカル時刻を "HH:mm" 形式で返す。 */
export const formatTimeOfDay = (date: Date): string => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/** "YYYY-MM-DD" 形式の日付文字列から先頭7文字（"YYYY-MM"）の月キーを取り出す。 */
export const getMonthKeyFromDateValue = (value: string): string =>
  value.slice(0, 7);

/** "YYYY-MM-DD" 形式の日付文字列から日部分を数値で取り出す。 */
export const getDayFromDateValue = (value: string): number =>
  Number(value.slice(8, 10));

/** 月キー（"YYYY-MM"）と日（数値）から "YYYY-MM-DD" 形式の日付文字列を組み立てる。 */
export const buildDateValue = (monthKey: string, day: number): string =>
  `${monthKey}-${String(day).padStart(2, "0")}`;

/**
 * 日付文字列（"YYYY-MM-DD"）の「月」だけを差し替える。選択中の「日」が
 * 新しい月の日数を超える場合（例: 31日→30日までの月）は、その月の
 * 末日にクランプする。
 */
export const clampDateToMonth = (value: string, monthKey: string): string => {
  const day = getDayFromDateValue(value);
  const maxDay = daysInMonthByKey(monthKey);
  const clampedDay = Math.min(day, maxDay);

  return buildDateValue(monthKey, clampedDay);
};
