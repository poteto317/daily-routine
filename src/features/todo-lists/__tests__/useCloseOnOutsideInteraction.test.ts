import { renderHook } from "@testing-library/react";
import { useCloseOnOutsideInteraction } from "../useCloseOnOutsideInteraction";

describe("useCloseOnOutsideInteraction", () => {
  it("isActive が false のときリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const onClose = jest.fn();

    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: false,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    const calls = addSpy.mock.calls.filter(([event]) =>
      ["mousedown", "touchstart", "keydown"].includes(event as string),
    );
    expect(calls.length).toBe(0);
    addSpy.mockRestore();
  });

  it("isActive が true のとき selector 外の mousedown で onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("selector 内の mousedown では onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-test-menu", "");
    document.body.appendChild(menuEl);

    menuEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
    document.body.removeChild(menuEl);
  });

  it("Escape キーで onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape 以外のキーでは onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が未指定（false 相当）のとき touchstart では onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が true のとき selector 外の touchstart で onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
        includeTouch: true,
      }),
    );

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("includeTouch が true のとき touchstart リスナーに passive:true が渡される", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose: jest.fn(),
        includeTouch: true,
      }),
    );

    const touchStartCall = addSpy.mock.calls.find(([event]) => event === "touchstart");
    expect(touchStartCall).toBeDefined();
    expect(touchStartCall?.[2]).toEqual({ passive: true });

    addSpy.mockRestore();
  });

  it("isActive が true から false に変わると、以後 mousedown/Escape で onClose が呼ばれなくなる", () => {
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ isActive }) =>
        useCloseOnOutsideInteraction({ isActive, selector: "[data-test-menu]", onClose }),
      { initialProps: { isActive: true } },
    );

    rerender({ isActive: false });

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が true のとき、isActive が false に変わると touchstart でも onClose が呼ばれなくなる", () => {
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ isActive }) =>
        useCloseOnOutsideInteraction({
          isActive,
          selector: "[data-test-menu]",
          onClose,
          includeTouch: true,
        }),
      { initialProps: { isActive: true } },
    );

    rerender({ isActive: false });

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("アンマウント時にリスナーが解除され、以後 mousedown/Escape で onClose が呼ばれなくなる", () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() =>
      useCloseOnOutsideInteraction({ isActive: true, selector: "[data-test-menu]", onClose }),
    );

    unmount();

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が true のとき、アンマウント後は touchstart でも onClose が呼ばれなくなる", () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
        includeTouch: true,
      }),
    );

    unmount();

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
