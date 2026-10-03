const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** サーバーは UTC で動くため、アプリの利用地域に合わせて JST の "HH:mm" を返す */
export const formatJstTime = (now: Date): string => {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const hours = String(jst.getUTCHours()).padStart(2, "0");
  const minutes = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
