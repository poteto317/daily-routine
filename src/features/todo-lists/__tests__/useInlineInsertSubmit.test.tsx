import { renderHook } from "@testing-library/react";
import { useInlineInsertSubmit } from "../useInlineInsertSubmit";

/** フォーカス済みの入力欄を用意する */
const mountFocusedInput = () => {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.focus();
  return input;
};

describe("useInlineInsertSubmit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("canSubmit", () => {
    it("入力があれば true", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(true);
    });

    it("空欄なら false", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });

    it("空白のみなら false", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "   ", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });

    it("全角スペースのみでも false（normalizeTitle と同じ判定になる）", () => {
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "　　", onAddAction: jest.fn() }),
      );
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe("handleAdd", () => {
    it("有効な入力ではフォーカス中の入力欄を blur してから onAddAction を呼ぶ", () => {
      const input = mountFocusedInput();
      const callOrder: string[] = [];
      input.addEventListener("blur", () => callOrder.push("blur"));
      const onAddAction = jest.fn(() => callOrder.push("add"));

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction }),
      );

      result.current.handleAdd();

      // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
      // ソフトウェアキーボードが閉じない
      expect(callOrder).toEqual(["blur", "add"]);
      expect(document.activeElement).toBe(document.body);
    });

    it("空欄では onAddAction も blur も行わない", () => {
      const input = mountFocusedInput();
      const onAddAction = jest.fn();

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "", onAddAction }),
      );

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input);
    });

    it("空白のみでは onAddAction も blur も行わない", () => {
      const input = mountFocusedInput();
      const onAddAction = jest.fn();

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "   ", onAddAction }),
      );

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input);
    });

    it("フォーカスされた入力欄が無くても onAddAction は呼ばれる", () => {
      const onAddAction = jest.fn();

      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction }),
      );

      expect(() => result.current.handleAdd()).not.toThrow();
      expect(onAddAction).toHaveBeenCalledTimes(1);
    });
  });
});
