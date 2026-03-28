import { act, renderHook } from "@testing-library/react";
import { usePageNavigation } from "../usePageNavigation";

describe("usePageNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    jest.spyOn(window.history, "pushState").mockImplementation(() => undefined);
    jest
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    (window.history.pushState as jest.Mock).mockRestore();
    (window.history.replaceState as jest.Mock).mockRestore();
  });

  it("再起動時は保存済みページがあってもhomeを初期表示する", () => {
    localStorage.setItem("currentPage", "journal");

    const { result } = renderHook(() => usePageNavigation());

    expect(result.current.currentPage).toBe("home");
  });

  it("同一セッション内の更新では保存済みページを復元する", () => {
    localStorage.setItem("currentPage", "journal");
    sessionStorage.setItem("pageSessionInitialized", "1");

    const { result } = renderHook(() => usePageNavigation());

    expect(result.current.currentPage).toBe("journal");
  });

  it("onPageChangeActionはhome以外で履歴pushし、localStorageも更新する", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => usePageNavigation());

    act(() => {
      result.current.onPageChangeAction("settings");
    });

    expect(result.current.currentPage).toBe("settings");
    expect(window.history.pushState).toHaveBeenCalledWith(
      { page: "settings" },
      "",
      "#settings",
    );
    expect(setItemSpy).toHaveBeenCalledWith("currentPage", "settings");

    setItemSpy.mockRestore();
  });

  it("ページ変更時にreplaceStateで状態同期する", () => {
    const { result } = renderHook(() => usePageNavigation());

    act(() => {
      result.current.setCurrentPage("calendar");
    });

    expect(window.history.replaceState).toHaveBeenCalledWith(
      { page: "calendar" },
      "",
      window.location.pathname,
    );
  });
});
