import { act, renderHook } from "@testing-library/react";
import { useMobileActionMenuController } from "../useMobileActionMenuController";

describe("useMobileActionMenuController", () => {
  it("初期状態では mobileMenuItemId が null", () => {
    const { result } = renderHook(() => useMobileActionMenuController());
    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("toggleMobileMenu で指定アイテムのメニューが開く", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    expect(result.current.mobileMenuItemId).toBe("item-1");
  });

  it("同じ itemId で再度 toggleMobileMenu を呼ぶと閉じる", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });
    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("別の itemId で toggleMobileMenu を呼ぶと切り替わる", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });
    act(() => {
      result.current.toggleMobileMenu("item-2");
    });

    expect(result.current.mobileMenuItemId).toBe("item-2");
  });

  it("closeMobileMenu でメニューが閉じる", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });
    act(() => {
      result.current.closeMobileMenu();
    });

    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("メニュー外の mousedown で自動クローズする", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("メニュー外の touchstart で自動クローズする", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new Event("touchstart", { bubbles: true }));
    });

    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("Escape キーでメニューが閉じる", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.mobileMenuItemId).toBeNull();
  });

  it("Escape 以外のキーでは閉じない", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(result.current.mobileMenuItemId).toBe("item-1");
  });

  it("[data-mobile-menu] 要素内の mousedown ではメニューが閉じない", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    // data-mobile-menu 属性を持つ要素をDOMに追加
    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-mobile-menu", "");
    document.body.appendChild(menuEl);

    act(() => {
      menuEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.mobileMenuItemId).toBe("item-1");

    document.body.removeChild(menuEl);
  });

  it("[data-mobile-menu] 要素内の touchstart ではメニューが閉じない", () => {
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-mobile-menu", "");
    document.body.appendChild(menuEl);

    act(() => {
      menuEl.dispatchEvent(new Event("touchstart", { bubbles: true }));
    });

    expect(result.current.mobileMenuItemId).toBe("item-1");

    document.body.removeChild(menuEl);
  });

  it("mobileMenuItemId が null のときはイベントリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const { result } = renderHook(() => useMobileActionMenuController());

    // 初期状態(null)では登録されない
    expect(result.current.mobileMenuItemId).toBeNull();
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
    const { result } = renderHook(() => useMobileActionMenuController());

    // 最初のアイテムを開く
    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    const addCount1 = addSpy.mock.calls.filter(([event]) =>
      ["mousedown", "touchstart", "keydown"].includes(event as string),
    ).length;
    expect(addCount1).toBe(3);

    // 別のアイテムへ切り替える（isOpen=true→trueのまま → cleanup & re-register は起きない）
    act(() => {
      result.current.toggleMobileMenu("item-2");
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
    const { result } = renderHook(() => useMobileActionMenuController());

    act(() => {
      result.current.toggleMobileMenu("item-1");
    });

    const touchStartCall = addSpy.mock.calls.find(
      ([event]) => event === "touchstart",
    );
    expect(touchStartCall).toBeDefined();
    expect(touchStartCall?.[2]).toEqual({ passive: true });

    addSpy.mockRestore();
  });
});
