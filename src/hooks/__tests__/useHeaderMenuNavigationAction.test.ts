import { act, renderHook } from "@testing-library/react";
import { useHeaderMenuNavigationAction } from "@/hooks/useHeaderMenuNavigationAction";

describe("useHeaderMenuNavigationAction", () => {
  it("遷移後にメニューを閉じる", () => {
    const onNavigateRootAction = jest.fn();
    const closeMenu = jest.fn();

    const { result } = renderHook(() =>
      useHeaderMenuNavigationAction(onNavigateRootAction, closeMenu),
    );

    act(() => {
      result.current("settings");
    });

    expect(onNavigateRootAction).toHaveBeenCalledWith("settings");
    expect(closeMenu).toHaveBeenCalledTimes(1);
  });
});
