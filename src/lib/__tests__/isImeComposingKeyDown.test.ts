import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  isImeComposingKeyDown,
  isImeComposingNativeKeyDown,
} from "../isImeComposingKeyDown";

type NativeLike = {
  isComposing?: boolean;
  keyCode?: number;
  which?: number;
};

const asReactEvent = (nativeEvent: NativeLike) =>
  ({ nativeEvent }) as ReactKeyboardEvent<HTMLInputElement>;

describe("isImeComposingNativeKeyDown", () => {
  it("isComposing が true なら変換中と判定する", () => {
    expect(isImeComposingNativeKeyDown({ isComposing: true })).toBe(true);
  });

  it("keyCode 229 でも変換中と判定する（isComposing 非対応環境向け）", () => {
    expect(isImeComposingNativeKeyDown({ keyCode: 229 })).toBe(true);
  });

  it("which 229 でも変換中と判定する", () => {
    expect(isImeComposingNativeKeyDown({ which: 229 })).toBe(true);
  });

  it("いずれにも該当しなければ変換中ではない", () => {
    expect(
      isImeComposingNativeKeyDown({ isComposing: false, keyCode: 27 }),
    ).toBe(false);
  });

  it("情報が何もなければ変換中ではない", () => {
    expect(isImeComposingNativeKeyDown({})).toBe(false);
  });
});

describe("isImeComposingKeyDown", () => {
  it("React イベントの nativeEvent を見て判定する", () => {
    expect(isImeComposingKeyDown(asReactEvent({ isComposing: true }))).toBe(
      true,
    );
    expect(isImeComposingKeyDown(asReactEvent({ keyCode: 229 }))).toBe(true);
    expect(isImeComposingKeyDown(asReactEvent({ isComposing: false }))).toBe(
      false,
    );
  });
});
