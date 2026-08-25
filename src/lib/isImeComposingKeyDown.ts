import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type NativeKeyboardEventLike = {
  isComposing?: boolean;
  keyCode?: number;
  which?: number;
};

/**
 * ネイティブの keydown イベントが IME 変換中かどうかを判定する。
 *
 * `isComposing` が未対応のブラウザ向けに、変換中を表す keyCode/which 229 も見る。
 * document へ直接リスナーを張るケース（useCloseOnEscape 等）から使う。
 */
export const isImeComposingNativeKeyDown = (
  nativeEvent: NativeKeyboardEventLike,
) =>
  nativeEvent.isComposing === true ||
  nativeEvent.keyCode === 229 ||
  nativeEvent.which === 229;

/** React の keydown イベントが IME 変換中かどうかを判定する */
export const isImeComposingKeyDown = (
  event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) => isImeComposingNativeKeyDown(event.nativeEvent as NativeKeyboardEventLike);
