const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * JST に寄せた Date を作る。取り出すときは UTC 系のゲッターを使う。
 *
 * service worker は別バンドルのため @/lib/storage/core を参照できず、
 * 本体の jstDateTime.ts と同じ規則をここに複製している。片方だけ変えると
 * 通知の重複防止キーが本体の記録と食い違うため、両方を揃えて直すこと。
 */
const toJstShifted = (date) => new Date(date.getTime() + JST_OFFSET_MS);

/** JST の日付（YYYY-MM-DD） */
export const toJstDateKey = (date) =>
  toJstShifted(date).toISOString().split("T")[0];

/** JST の曜日（0 = 日曜） */
export const toJstDay = (date) => toJstShifted(date).getUTCDay();

const DAY_MS = 24 * 60 * 60 * 1000;

/** JST の 0 時からの経過ミリ秒 */
const toJstMsOfDay = (date) => {
  const shifted = toJstShifted(date);

  return (
    shifted.getUTCHours() * 60 * 60 * 1000 +
    shifted.getUTCMinutes() * 60 * 1000 +
    shifted.getUTCSeconds() * 1000 +
    shifted.getUTCMilliseconds()
  );
};

/**
 * JST の時刻（HH:mm + minutesAfter）と今の時刻の差をミリ秒で返す。
 *
 * スケジュールの時刻は日本時間として登録されているため、端末のタイムゾーンで
 * 組み立てると海外の端末で別の時刻に通知される。JST の 0 時からの経過時間
 * どうしで比べて、端末のタイムゾーンを判定から外す。
 *
 * 一日を輪と見て近いほうの差を返す。こうしないと 23:50 の 30 分後のように
 * 日付をまたぐ時刻が、ほぼ 24 時間差とみなされて通知されない。
 */
export const diffFromJstScheduleMs = (now, time, minutesAfter = 0) => {
  const [hour, minute] = time.split(":").map(Number);
  const scheduleMs =
    ((((hour * 60 + minute + minutesAfter) * 60 * 1000) % DAY_MS) + DAY_MS) %
    DAY_MS;
  const rawDiff = Math.abs(toJstMsOfDay(now) - scheduleMs);

  return Math.min(rawDiff, DAY_MS - rawDiff);
};
