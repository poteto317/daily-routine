import { renderHook } from "@testing-library/react";
import { useTodoListDetailClipboardActions } from "../useTodoListDetailClipboardActions";

describe("useTodoListDetailClipboardActions", () => {
  describe("clearClipboard", () => {
    it("clearClipboard を呼ぶと setClipboardItems が空配列で呼ばれる", () => {
      const setClipboardItems = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailClipboardActions({ setClipboardItems }),
      );

      result.current.clearClipboard();

      expect(setClipboardItems).toHaveBeenCalledWith([]);
      expect(setClipboardItems).toHaveBeenCalledTimes(1);
    });

    it("複数回呼んでもそのたびに setClipboardItems が空配列で呼ばれる", () => {
      const setClipboardItems = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailClipboardActions({ setClipboardItems }),
      );

      result.current.clearClipboard();
      result.current.clearClipboard();

      expect(setClipboardItems).toHaveBeenCalledTimes(2);
      expect(setClipboardItems).toHaveBeenNthCalledWith(1, []);
      expect(setClipboardItems).toHaveBeenNthCalledWith(2, []);
    });
  });

  describe("参照安定性", () => {
    it("clearClipboard の参照はレンダリング間で安定している", () => {
      const setClipboardItems = jest.fn();
      const { result, rerender } = renderHook(() =>
        useTodoListDetailClipboardActions({ setClipboardItems }),
      );

      const clearRef = result.current.clearClipboard;
      rerender();

      expect(result.current.clearClipboard).toBe(clearRef);
    });
  });
});
