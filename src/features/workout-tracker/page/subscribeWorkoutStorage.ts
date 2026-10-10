import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";

/** 同一タブの保存と別タブの変更を購読し、解除関数を返す。 */
export const subscribeWorkoutStorage = (reload: () => void): (() => void) => {
  window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, reload);
  window.addEventListener("storage", reload);
  return () => {
    window.removeEventListener(LOCAL_DATA_UPDATED_AT_EVENT, reload);
    window.removeEventListener("storage", reload);
  };
};
