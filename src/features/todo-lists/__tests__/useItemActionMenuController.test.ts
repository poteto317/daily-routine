import { act, renderHook } from "@testing-library/react";
import { useItemActionMenuController } from "../useItemActionMenuController";

describe("useItemActionMenuController", () => {
  it("初期状態では itemMenuItemId が null", () => {
    const { result } = renderHook(() => useItemActionMenuController());
    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("toggleItemMenu で指定アイテムのメニューが開く", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    expect(result.current.itemMenuItemId).toBe("item-1");
  });

  it("同じ itemId で再度 toggleItemMenu を呼ぶと閉じる", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });
    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("別の itemId で toggleItemMenu を呼ぶと切り替わる", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });
    act(() => {
      result.current.toggleItemMenu("item-2");
    });

    expect(result.current.itemMenuItemId).toBe("item-2");
  });

  it("closeItemMenu でメニューが閉じる", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });
    act(() => {
      result.current.closeItemMenu();
    });

    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("メニュー外の mousedown で自動クローズする", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("メニュー外の touchstart で自動クローズする", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new Event("touchstart", { bubbles: true }));
    });

    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("Escape キーでメニューが閉じる", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.itemMenuItemId).toBeNull();
  });

  it("Escape 以外のキーでは閉じない", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(result.current.itemMenuItemId).toBe("item-1");
  });

  it("[data-item-menu] 要素内の mousedown ではメニューが閉じない", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    // data-item-menu 属性を持つ要素をDOMに追加
    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-item-menu", "");
    document.body.appendChild(menuEl);

    act(() => {
      menuEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.itemMenuItemId).toBe("item-1");

    document.body.removeChild(menuEl);
  });

  it("[data-item-menu] 要素内の touchstart ではメニューが閉じない", () => {
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-item-menu", "");
    document.body.appendChild(menuEl);

    act(() => {
      menuEl.dispatchEvent(new Event("touchstart", { bubbles: true }));
    });

    expect(result.current.itemMenuItemId).toBe("item-1");

    document.body.removeChild(menuEl);
  });

  it("itemMenuItemId が null のときはイベントリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const { result } = renderHook(() => useItemActionMenuController());

    // 初期状態(null)では登録されない
    expect(result.current.itemMenuItemId).toBeNull();
    const calls = addSpy.mock.calls.filter(
      ([event]) =>
        event === "mousedown" || event === "touchstart" || event === "keydown",
    );
    expect(calls.length).toBe(0);

    addSpy.mockRestore();
  });

  it("別アイテムへ切り替えてもリスナーが追加で登録されない（isOpen 依存）", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const { result } = renderHook(() => useItemActionMenuController());

    // 最初のアイテムを開く
    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    const addCount1 = addSpy.mock.calls.filter(([event]) =>
      ["mousedown", "touchstart", "keydown"].includes(event as string),
    ).length;
    expect(addCount1).toBe(3);

    // 別のアイテムへ切り替える（isOpen=true→trueのまま → cleanup & re-register は起きない）
    act(() => {
      result.current.toggleItemMenu("item-2");
    });

    // メニューは別アイテムで開いたまま（trueのまま）→ 追加登録されない
    const addCount2 = addSpy.mock.calls.filter(([event]) =>
      ["mousedown", "touchstart", "keydown"].includes(event as string),
    ).length;
    expect(addCount2).toBe(3);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("touchstart リスナーに passive:true オプションが渡される", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const { result } = renderHook(() => useItemActionMenuController());

    act(() => {
      result.current.toggleItemMenu("item-1");
    });

    const touchStartCall = addSpy.mock.calls.find(
      ([event]) => event === "touchstart",
    );
    expect(touchStartCall).toBeDefined();
    expect(touchStartCall?.[2]).toEqual({ passive: true });

    addSpy.mockRestore();
  });
});
