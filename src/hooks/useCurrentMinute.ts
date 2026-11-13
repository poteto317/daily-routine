import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** いまの「分」の開始時刻（epoch ミリ秒）。同じ分のあいだは同じ値を返す */
export const getCurrentMinute = (): number =>
  Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;

/** 表示に使う現在時刻を読み直させる（アプリがバックグラウンドから戻ったときなどに呼ぶ） */
export const notifyCurrentMinute = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 * 描画時に使う現在時刻（分単位）。
 * notifyCurrentMinute() が呼ばれ、分が変わっていれば、このフックを使うコンポーネントが再描画される。
 *
 * - 毎分のタイマーは持たない。値が進むのは、notifyCurrentMinute() が呼ばれたときと、
 *   コンポーネントが別の理由で再描画されたときだけ（いま通知を呼ぶのは useRoutineForegroundSync）。
 * - サーバーでの描画と、ハイドレーションの最初の描画で描かれるコンポーネントからは使わない。
 *   サーバーとクライアントで分がずれると、ハイドレーションの不一致になる
 *   （いまの利用箇所は、最初の描画ではローディングを返す AuthGuard の内側だけ）。
 * - 開発時だけ、分の変わり目に React が getSnapshot を続けて 2 回呼ぶあいだで値が変わると、
 *   「The result of getSnapshot should be cached」の警告が 1 回出ることがある。
 *   本番ビルドではこの確認は行われず、無限ループにもならない。
 *   ストアに値をキャッシュして直すと、別の理由の再描画でも分が進む今の動作が変わるため、
 *   意図して直していない（Issue #225）。
 */
export const useCurrentMinute = (): number =>
  useSyncExternalStore(subscribe, getCurrentMinute, getCurrentMinute);
