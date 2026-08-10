import { renderHook } from "@testing-library/react";
import { useDismissKeyboardOnSubmit } from "../useDismissKeyboardOnSubmit";

/** フォーカス済みの要素を用意する */
const mountFocused = (tagName: "input" | "textarea" | "button") => {
  const el = document.createElement(tagName);
  document.body.appendChild(el);
  el.focus();
  return el;
};

describe("useDismissKeyboardOnSubmit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("送信可能ならフォーカス中の入力欄を blur してから onSubmit を呼ぶ", () => {
    const input = mountFocused("input");
    const callOrder: string[] = [];
    input.addEventListener("blur", () => callOrder.push("blur"));
    const onSubmit = jest.fn(() => callOrder.push("submit"));

    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ canSubmit: true, onSubmit }),
    );

    result.current.handleSubmit();

    // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
    // ソフトウェアキーボードが閉じない
    expect(callOrder).toEqual(["blur", "submit"]);
    expect(document.activeElement).toBe(document.body);
  });

  it("textarea にフォーカスがある場合も blur する", () => {
    mountFocused("textarea");
    const onSubmit = jest.fn();

    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ canSubmit: true, onSubmit }),
    );

    result.current.handleSubmit();

    expect(document.activeElement).toBe(document.body);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("送信不可なら onSubmit も blur も行わない", () => {
    const input = mountFocused("input");
    const onSubmit = jest.fn();

    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ canSubmit: false, onSubmit }),
    );

    result.current.handleSubmit();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("テキスト入力以外にフォーカスがある場合はフォーカスを奪わない", () => {
    // ボタンのクリックで送信した場合。入力欄から離れた時点でキーボードは
    // 既に閉じているため、ボタンのフォーカスまで外す必要はない
    const button = mountFocused("button");
    const onSubmit = jest.fn();

    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ canSubmit: true, onSubmit }),
    );

    result.current.handleSubmit();

    expect(document.activeElement).toBe(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("フォーカスされた要素が無くても onSubmit は呼ばれる", () => {
    const onSubmit = jest.fn();

    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ canSubmit: true, onSubmit }),
    );

    expect(() => result.current.handleSubmit()).not.toThrow();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("canSubmit が変わると挙動も切り替わる", () => {
    const input = mountFocused("input");
    const onSubmit = jest.fn();

    const { result, rerender } = renderHook(
      ({ canSubmit }: { canSubmit: boolean }) =>
        useDismissKeyboardOnSubmit({ canSubmit, onSubmit }),
      { initialProps: { canSubmit: false } },
    );

    result.current.handleSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);

    rerender({ canSubmit: true });
    result.current.handleSubmit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(document.body);
  });
});
