/** HTML ドキュメントを入れるキャッシュ。custom-sw.js の NetworkFirst と同じ名前にする */
export const DOCUMENT_CACHE_NAME = "document-cache";

/**
 * トップページをあらかじめキャッシュへ入れる。
 *
 * ビルド時の事前キャッシュに入るのは JS・CSS・フォントだけで、HTML は含まれない。
 * ドキュメントは NetworkFirst で取得したときに初めて保存されるため、
 * 何もしないと「初回に開いた直後にオフラインへ移る」と何も表示できない。
 * Service Worker が有効になった時点で取りに行き、その空白を埋める。
 *
 * 有効化の直後にオフラインだと取得できないが、それは次にオンラインで開いた
 * ときに埋まればよい。ここで投げると activate の waitUntil が失敗し、
 * Service Worker 自体が有効にならないため、失敗は握りつぶす。
 */
export const warmDocumentCache = async () => {
  try {
    const cache = await caches.open(DOCUMENT_CACHE_NAME);
    await cache.addAll(["/"]);
  } catch {
    // 取得できなくても有効化は続ける
  }
};
