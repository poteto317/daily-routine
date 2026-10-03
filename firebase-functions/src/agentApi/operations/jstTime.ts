const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** サーバーは UTC で動くため、アプリの利用地域に合わせて JST の "HH:mm" を返す */
export const formatJstTime = (now: Date): string => {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const hours = String(jst.getUTCHours()).padStart(2, "0");
  const minutes = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/** JST の日付（"YYYY-MM-DD"）を返す。支出の date（アプリのローカル日付）と比べるために使う */
export const toJstDateKey = (now: Date): string => {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
