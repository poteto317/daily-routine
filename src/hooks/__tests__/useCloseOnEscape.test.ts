import { renderHook } from "@testing-library/react";
import { useCloseOnEscape } from "../useCloseOnEscape";

const pressKey = (key: string) => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key }));
};

/** IME変換中のキー入力を模した dispatch */
const pressKeyWhileComposing = (
  key: string,
  composition: { isComposing?: boolean; keyCode?: number } = {
    isComposing: true,
  },
) => {
  const event = new KeyboardEvent("keydown", { key });
  Object.defineProperty(event, "isComposing", {
    value: composition.isComposing ?? false,
  });
  if (composition.keyCode !== undefined) {
    Object.defineProperty(event, "keyCode", { value: composition.keyCode });
  }
  document.dispatchEvent(event);
};

describe("useCloseOnEscape", () => {
  it("Escapeキーで onClose を呼ぶ", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: true, onClose }));

    pressKey("Escape");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape以外のキーでは onClose を呼ばない", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: true, onClose }));

    pressKey("Enter");
    pressKey("a");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("IME変換中のEscapeでは onClose を呼ばない（変換取り消しと閉じる操作の衝突を防ぐ）", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: true, onClose }));

    pressKeyWhileComposing("Escape");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("isComposing 非対応環境（keyCode 229）でも変換中とみなして閉じない", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: true, onClose }));

    pressKeyWhileComposing("Escape", { isComposing: false, keyCode: 229 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("変換が終わっていれば通常どおりEscapeで閉じる", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: true, onClose }));

    pressKeyWhileComposing("Escape", { isComposing: false });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("isActive が false の間は onClose を呼ばない", () => {
    const onClose = jest.fn();
    renderHook(() => useCloseOnEscape({ isActive: false, onClose }));

    pressKey("Escape");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("unmount 後はリスナーが解除され onClose を呼ばない", () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() =>
      useCloseOnEscape({ isActive: true, onClose }),
    );

    unmount();
    pressKey("Escape");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("onClose の参照が変わってもリスナーを張り直さない", () => {
    // 呼び出し側がインライン関数を渡すケース（DetailPanel の onClose など）。
    // 再レンダリングのたびに addEventListener/removeEventListener が
    // 走らないことを保証する。
    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");

    const { rerender } = renderHook(
      ({ onClose }: { onClose: () => void }) =>
        useCloseOnEscape({ isActive: true, onClose }),
      { initialProps: { onClose: () => undefined } },
    );

    const addCallsAfterMount = addSpy.mock.calls.length;

    // 毎回新しい関数を渡して再レンダリング
    rerender({ onClose: () => undefined });
    rerender({ onClose: () => undefined });

    expect(addSpy.mock.calls.length).toBe(addCallsAfterMount);
    expect(removeSpy).not.toHaveBeenCalled();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("onClose を差し替えた後は最新の onClose が呼ばれる", () => {
    const first = jest.fn();
    const second = jest.fn();

    const { rerender } = renderHook(
      ({ onClose }: { onClose: () => void }) =>
        useCloseOnEscape({ isActive: true, onClose }),
      { initialProps: { onClose: first } },
    );

    rerender({ onClose: second });
    pressKey("Escape");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("isActive が false から true に変わるとEscapeを拾えるようになる", () => {
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ isActive }: { isActive: boolean }) =>
        useCloseOnEscape({ isActive, onClose }),
      { initialProps: { isActive: false } },
    );

    pressKey("Escape");
    expect(onClose).not.toHaveBeenCalled();

    rerender({ isActive: true });
    pressKey("Escape");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
