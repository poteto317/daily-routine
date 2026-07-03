import { renderHook } from "@testing-library/react";
import { useTodoListUndoRedoKeyboard } from "../useTodoListUndoRedoKeyboard";

const fireKeyDown = (
  key: string,
  opts: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
  target: Element | null = null,
) => {
  const event = new KeyboardEvent("keydown", {
    key,
    metaKey: opts.metaKey ?? false,
    ctrlKey: opts.ctrlKey ?? false,
    shiftKey: opts.shiftKey ?? false,
    altKey: opts.altKey ?? false,
    bubbles: true,
  });
  // 要素が指定された場合はその要素から dispatch してバブリングで window に届かせる
  (target ?? window).dispatchEvent(event);
  return event;
};

describe("useTodoListUndoRedoKeyboard", () => {
  let undo: jest.Mock;
  let redo: jest.Mock;

  beforeEach(() => {
    undo = jest.fn();
    redo = jest.fn();
  });

  it("Cmd+Z で undo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z", { metaKey: true });
    expect(undo).toHaveBeenCalledTimes(1);
    expect(redo).not.toHaveBeenCalled();
  });

  it("Ctrl+Z で undo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z", { ctrlKey: true });
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("Cmd+Shift+Z で redo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z", { metaKey: true, shiftKey: true });
    expect(redo).toHaveBeenCalledTimes(1);
    expect(undo).not.toHaveBeenCalled();
  });

  it("Ctrl+Y で redo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("y", { ctrlKey: true });
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it("修飾キーなしの z では何も呼ばれない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z");
    expect(undo).not.toHaveBeenCalled();
    expect(redo).not.toHaveBeenCalled();
  });

  it("大文字 Z（Cmd+Z）でも undo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("Z", { metaKey: true });
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("大文字 Z + Shift（Cmd+Shift+Z）でも redo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("Z", { metaKey: true, shiftKey: true });
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it("大文字 Y（Ctrl+Y）でも redo が呼ばれる", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("Y", { ctrlKey: true });
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it("target が null のとき undo が呼ばれる（非HTMLElement は入力欄とみなさない）", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    const event = new KeyboardEvent("keydown", { key: "z", metaKey: true, bubbles: true });
    Object.defineProperty(event, "target", { value: null });
    window.dispatchEvent(event);
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("input 要素がフォーカス中は undo を呼ばない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    fireKeyDown("z", { metaKey: true }, input);
    expect(undo).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("textarea 要素がフォーカス中は undo を呼ばない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();
    fireKeyDown("z", { metaKey: true }, textarea);
    expect(undo).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("contenteditable 要素がフォーカス中は undo を呼ばない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    const div = document.createElement("div");
    // jsdom は isContentEditable を未実装のため Object.defineProperty で設定
    Object.defineProperty(div, "isContentEditable", { value: true, configurable: true });
    document.body.appendChild(div);
    fireKeyDown("z", { metaKey: true }, div);
    expect(undo).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it("アンマウント時にイベントリスナーが削除される", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useTodoListUndoRedoKeyboard({ undo, redo }),
    );
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  it("AltGr（Ctrl+Alt+Z）では undo を呼ばない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z", { ctrlKey: true, altKey: true });
    expect(undo).not.toHaveBeenCalled();
    expect(redo).not.toHaveBeenCalled();
  });

  it("AltGr（Ctrl+Alt+Shift+Z）では redo を呼ばない", () => {
    renderHook(() => useTodoListUndoRedoKeyboard({ undo, redo }));
    fireKeyDown("z", { ctrlKey: true, altKey: true, shiftKey: true });
    expect(undo).not.toHaveBeenCalled();
    expect(redo).not.toHaveBeenCalled();
  });

  it("undo/redo の参照が変わっても最新の関数が呼ばれる", () => {
    const undo1 = jest.fn();
    const redo1 = jest.fn();
    const undo2 = jest.fn();
    const redo2 = jest.fn();

    const { rerender } = renderHook(
      ({ u, r }) => useTodoListUndoRedoKeyboard({ undo: u, redo: r }),
      { initialProps: { u: undo1, r: redo1 } },
    );

    rerender({ u: undo2, r: redo2 });
    fireKeyDown("z", { metaKey: true });

    expect(undo1).not.toHaveBeenCalled();
    expect(undo2).toHaveBeenCalledTimes(1);
  });
});
