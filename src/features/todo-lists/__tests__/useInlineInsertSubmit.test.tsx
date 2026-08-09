import { renderHook } from "@testing-library/react";
import { useInlineInsertSubmit } from "../useInlineInsertSubmit";

const setup = (inputText: string) => {
  const onAddAction = jest.fn();
  const blur = jest.fn();
  const { result } = renderHook(() =>
    useInlineInsertSubmit({ inputText, onAddAction }),
  );
  // input要素の代わりに blur だけを持つオブジェクトを差し込む
  result.current.inputRef.current = { blur } as unknown as HTMLInputElement;
  return { result, onAddAction, blur };
};

describe("useInlineInsertSubmit", () => {
  describe("canSubmit", () => {
    it("入力があれば true", () => {
      const { result } = setup("Todo");
      expect(result.current.canSubmit).toBe(true);
    });

    it("空欄なら false", () => {
      const { result } = setup("");
      expect(result.current.canSubmit).toBe(false);
    });

    it("空白のみなら false", () => {
      const { result } = setup("   ");
      expect(result.current.canSubmit).toBe(false);
    });

    it("全角スペースのみでも false（normalizeTitle と同じ判定になる）", () => {
      const { result } = setup("　　");
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe("handleAdd", () => {
    it("有効な入力では blur してから onAddAction を呼ぶ", () => {
      const { result, onAddAction, blur } = setup("Todo");
      const callOrder: string[] = [];
      blur.mockImplementation(() => callOrder.push("blur"));
      onAddAction.mockImplementation(() => callOrder.push("add"));

      result.current.handleAdd();

      // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
      // ソフトウェアキーボードが閉じない
      expect(callOrder).toEqual(["blur", "add"]);
    });

    it("空欄では onAddAction も blur も呼ばない", () => {
      const { result, onAddAction, blur } = setup("");

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(blur).not.toHaveBeenCalled();
    });

    it("空白のみでは onAddAction も blur も呼ばない", () => {
      const { result, onAddAction, blur } = setup("   ");

      result.current.handleAdd();

      expect(onAddAction).not.toHaveBeenCalled();
      expect(blur).not.toHaveBeenCalled();
    });

    it("inputRef が未設定でも onAddAction は呼ばれる（描画前の呼び出しで落ちない）", () => {
      const onAddAction = jest.fn();
      const { result } = renderHook(() =>
        useInlineInsertSubmit({ inputText: "Todo", onAddAction }),
      );

      expect(() => result.current.handleAdd()).not.toThrow();
      expect(onAddAction).toHaveBeenCalledTimes(1);
    });
  });
});
