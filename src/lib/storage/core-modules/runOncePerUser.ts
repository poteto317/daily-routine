/**
 * ユーザーごとに 1 度だけ処理を実行する。
 *
 * データの移行は元に戻せないため、取りこぼすより二重に適用しないことを
 * 優先する。実行済みかどうかはマーカーキーで覚える。
 *
 * `task` の戻り値は「完了として記録してよいか」。`false` を返すとマーカーを
 * 書かず、次回もう一度実行する。途中で失敗した処理を完了扱いにすると、
 * 直せる機会を永久に失うため。
 *
 * @param uid ユーザー ID
 * @param markerSuffix 用途を区別する文字列。混ざると別の処理まで飛ばされる
 */
export const runOncePerUser = (
  uid: string,
  markerSuffix: string,
  task: () => boolean,
): void => {
  if (typeof window === "undefined") return;

  const markerKey = `user:${uid}:${markerSuffix}`;
  if (localStorage.getItem(markerKey)) return;

  if (!task()) return;

  try {
    localStorage.setItem(markerKey, "true");
  } catch {
    // マーカーを書けなくても処理自体は済んでいる。
    // 次回もう一度走るが、済ませた分は条件に合わなくなるため二重には動かない。
  }
};
