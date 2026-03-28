import { act, renderHook } from "@testing-library/react";
import { useHomePopStateListener } from "../useHomePopStateListener";

describe("useHomePopStateListener", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("フォーム表示中の戻る操作ではフォームを閉じる", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    renderHook(() =>
      useHomePopStateListener({
        showFormRef: { current: true },
        closeFormActionRef: { current: closeFormAction },
        setCurrentPageActionRef: { current: setCurrentPageAction },
      }),
    );

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { page: "settings" } }),
      );
    });

    expect(closeFormAction).toHaveBeenCalledTimes(1);
    expect(setCurrentPageAction).not.toHaveBeenCalled();
  });

  it("フォーム非表示時の戻る操作でページを復元する", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    renderHook(() =>
      useHomePopStateListener({
        showFormRef: { current: false },
        closeFormActionRef: { current: closeFormAction },
        setCurrentPageActionRef: { current: setCurrentPageAction },
      }),
    );

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { page: "settings" } }),
      );
    });

    expect(setCurrentPageAction).toHaveBeenCalledWith("settings");
    expect(localStorage.getItem("currentPage")).toBe("settings");
  });
});
