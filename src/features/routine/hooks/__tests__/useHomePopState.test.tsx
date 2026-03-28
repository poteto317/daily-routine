import { act, renderHook } from "@testing-library/react";
import { useHomePopState } from "../useHomePopState";

describe("useHomePopState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("フォーム表示中の戻る操作ではフォームを閉じる", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    renderHook(() =>
      useHomePopState({
        showForm: true,
        closeFormAction,
        setCurrentPageAction,
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
      useHomePopState({
        showForm: false,
        closeFormAction,
        setCurrentPageAction,
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

  it("不正なstateはhomeとして扱う", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    renderHook(() =>
      useHomePopState({
        showForm: false,
        closeFormAction,
        setCurrentPageAction,
      }),
    );

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { page: "unknown" } }),
      );
    });

    expect(setCurrentPageAction).toHaveBeenCalledWith("home");
    expect(localStorage.getItem("currentPage")).toBe("home");
  });
});
