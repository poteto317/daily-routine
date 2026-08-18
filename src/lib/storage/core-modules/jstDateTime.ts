const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * JST に寄せた Date を作る。
 *
 * 取り出すときは必ず UTC 系のゲッター（getUTCDay など）を使う。
 * ローカル系のゲッターを使うと端末のタイムゾーンが二重にかかる。
 */
const toJstShifted = (date: Date): Date =>
  new Date(date.getTime() + JST_OFFSET_MS);

/**
 * 渡した瞬間の JST の日付を YYYY-MM-DD で返す。
 *
 * 端末のタイムゾーンには依存させない。祝日判定も電車遅延も日本向けで
 * 作られており、海外から使っても「日本の日付」で記録が並ぶのが自然なため。
 *
 * `date.toISOString()` をそのまま使うと UTC の日付になる。日本時間の
 * 0〜9 時は UTC ではまだ前日で、その時間帯の記録が前日として保存される。
 *
 * 「今日」が欲しいときは getTodayString を使う。
 */
export const toJstDateKey = (date: Date): string =>
  toJstShifted(date).toISOString().split("T")[0];

/**
 * JST の曜日（0 = 日曜）。
 *
 * 日付キーと同じ基準で求める。片方だけ端末ローカルにすると、表示する曜日と
 * 記録する日付が別の日を指すことになる。
 *
 * 組み立て済みの日付（new Date(year, month - 1, day) など）の曜日が欲しい
 * ときは使わないこと。その用途では素の getDay() が正しく、ここを通すと
 * 端末のタイムゾーンによっては 1 日ずれる。
 */
export const toJstDay = (date: Date): number => toJstShifted(date).getUTCDay();

/** JST の時刻（HH:mm） */
export const toJstTime = (date: Date): string => {
  const shifted = toJstShifted(date);
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

/** 今日の日付（JST） */
export const getTodayString = (): string => toJstDateKey(new Date());

/**
 * JST の「今日」を表す Date を作る。
 *
 * 曜日や祝日の判定は Date を受け取る関数に任せるため、JST の日付から
 * ローカルの日付として組み立て直す。こうすると、その関数が使う素の
 * getDay() が JST の曜日と一致する。
 *
 * JST の日付そのものが欲しいときは getTodayString を使うこと。
 */
export const getJstToday = (): Date => {
  const [year, month, day] = getTodayString().split("-").map(Number);

  return new Date(year, month - 1, day);
};
