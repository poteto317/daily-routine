const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

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
  new Date(date.getTime() + JST_OFFSET_MS).toISOString().split("T")[0];

/** 今日の日付（JST） */
export const getTodayString = (): string => toJstDateKey(new Date());
