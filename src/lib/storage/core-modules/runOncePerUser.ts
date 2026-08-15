/** 実行済みかどうか。読めない環境では判断できないので false を返す */
const isAlreadyDone = (markerKey: string): boolean => {
  try {
    return localStorage.getItem(markerKey) !== null;
  } catch {
    // Safari のプライベートモードなど、localStorage への参照自体が例外に
    // なる環境がある。実行済みか判断できないため、飛ばさず試す側に倒す。
    return false;
  }
};

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
 * `task` が例外を投げた場合も同じ扱いにして、呼び出し元へは伝播させない。
 * ログイン直後の準備処理から呼ばれるため、ここで例外が抜けるとログイン
 * そのものが失敗する。1 つの移行の不具合で、アプリに入れなくなるのは重い。
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
  if (isAlreadyDone(markerKey)) return;

  let shouldMarkDone = false;
  try {
    shouldMarkDone = task();
  } catch {
    // 完了として記録せず、次回もう一度試す
  }
  if (!shouldMarkDone) return;

  try {
    localStorage.setItem(markerKey, "true");
  } catch {
    // マーカーを書けなくても処理自体は済んでいる。
    // 次回もう一度走るが、済ませた分は条件に合わなくなるため二重には動かない。
  }
};
