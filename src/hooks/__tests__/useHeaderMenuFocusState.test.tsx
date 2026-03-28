import { act, renderHook } from "@testing-library/react";
import { useHeaderMenuFocusState } from "@/hooks/useHeaderMenuFocusState";

describe("useHeaderMenuFocusState", () => {
  it("open 時に先頭メニュー項目へ focus する", () => {
    const firstItem = { focus: jest.fn() } as unknown as HTMLButtonElement;
    const { result, rerender } = renderHook(
      ({ isMenuOpen }) => useHeaderMenuFocusState(isMenuOpen),
      { initialProps: { isMenuOpen: false } },
    );

    act(() => {
      result.current.setMenuItemRef(0, firstItem);
    });

    rerender({ isMenuOpen: true });

    expect(firstItem.focus).toHaveBeenCalled();
  });

  it("close 時に復元フラグが立っていれば menu button に focus を戻す", () => {
    const button = { focus: jest.fn() } as unknown as HTMLButtonElement;
    const { result, rerender } = renderHook(
      ({ isMenuOpen }) => useHeaderMenuFocusState(isMenuOpen),
      { initialProps: { isMenuOpen: true } },
    );

    act(() => {
      result.current.menuButtonRef.current = button;
      result.current.markShouldRestoreFocus();
    });

    rerender({ isMenuOpen: false });

    expect(button.focus).toHaveBeenCalled();
    expect(result.current.shouldRestoreFocusRef.current).toBe(false);
  });
});
