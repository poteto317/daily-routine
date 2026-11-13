import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings/storage";
import type { AppSettings } from "@/types/routine";

type SwipeAction = AppSettings["swipeAction"];

/**
 * 設定が変わったかもしれないときに、読み直させる。
 * - SETTINGS_UPDATED_EVENT: 同じタブで saveSettings() が呼ばれたとき
 * - storage: 別のタブ・ウィンドウが localStorage を書いたとき
 *   （キーでは絞らない。スナップショットが文字列なので、値が同じなら再描画は起きない）
 */
const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(SETTINGS_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SETTINGS_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/**
 * 受け付ける値の一覧。
 * 型（SwipeAction）をキーにしているので、swipeAction に値を足すと、ここが型エラーになる
 * （足した値を、getSnapshot が黙って "edit" に直すのを防ぐ）。
 */
const SWIPE_ACTIONS: Record<SwipeAction, true> = { delete: true, edit: true };

const isSwipeAction = (value: unknown): value is SwipeAction =>
  typeof value === "string" && Object.hasOwn(SWIPE_ACTIONS, value);

/**
 * 保存された値を、受け付ける値（SWIPE_ACTIONS）のどれかにして返す。
 * 保存データは型を検証していないので（インポートや同期で壊れた値が入りうる）、そのまま返さない。
 * オブジェクトや配列を返すと、読むたびに参照が変わり、useSyncExternalStore が再描画を繰り返して描画が止まる。
 * 受け付ける値でないときは、"edit" として扱う（スワイプの実行（src/features/routine/helpersPresentation.ts の createSwipeHandler）が、"delete" 以外を編集として扱うのに合わせている）。
 */
const getSnapshot = (): SwipeAction => {
  const saved: unknown = getSettings().swipeAction;
  return isSwipeAction(saved) ? saved : "edit";
};

const getServerSnapshot = (): SwipeAction => DEFAULT_SETTINGS.swipeAction;

/**
 * 保存された設定のうち、スワイプの動作（swipeAction）を購読して返す。
 *
 * 描画中に `getSettings()` を直接呼ぶと React Compiler に固定されるため、このフックを使う
 * （`getSettings()` は props・state・フックの戻り値のどれにも依存しないので、最初の描画の値が
 * キャッシュされ、設定が変わっても古い値のまま表示される。書き方によっては、ほかの props などが
 * 変わるまで古い値のままになる。Issue #224）。
 *
 * - 設定の全体ではなく、文字列の値だけをスナップショットにする
 *   （`getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返すので、全体を返すと再描画が止まらない）。
 * - 保存された値が、受け付ける値（"delete"・"edit"）でないとき（壊れた値を含む）は、"edit" を返す。
 * - サーバーでの描画とハイドレーションの最初の描画では、既定値を返す。
 */
export const useSwipeActionSetting = (): SwipeAction =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
