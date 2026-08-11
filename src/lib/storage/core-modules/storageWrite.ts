import { dispatchStorageWriteFailed } from "./storageWriteFailureEvent";

/**
 * localStorage への書き込みを実行し、失敗したら通知に変換する。
 *
 * 「保存に失敗しても例外は投げず、通知に変えてユーザーに伝える」という
 * 方針をここだけが持つ。呼び出し側は何を書くかだけを書けばよい。
 *
 * 例外を握り潰さず通知するのは、UI 上は成功したように見えたまま
 * データが消えるのを防ぐため。再スローしないのは、保存に失敗しても
 * 操作自体は続けられる必要があるため。
 */
export const runStorageWrite = (key: string, write: () => void): void => {
  if (typeof window === "undefined") return;

  try {
    write();
  } catch (error) {
    dispatchStorageWriteFailed(key, error);
  }
};
