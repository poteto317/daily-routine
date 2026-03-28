import { renderHook } from "@testing-library/react";
import { usePageNavigationState } from "../usePageNavigationState";

describe("usePageNavigationState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("再起動時は保存済みページがあってもhomeを初期表示する", () => {
    localStorage.setItem("currentPage", "journal");

    const { result } = renderHook(() => usePageNavigationState());

    expect(result.current.currentPage).toBe("home");
  });

  it("同一セッション内の更新では保存済みページを復元する", () => {
    localStorage.setItem("currentPage", "journal");
    sessionStorage.setItem("pageSessionInitialized", "1");

    const { result } = renderHook(() => usePageNavigationState());

    expect(result.current.currentPage).toBe("journal");
  });

  it("hydration 済みフラグを返す", () => {
    const { result } = renderHook(() => usePageNavigationState());

    expect(result.current.isHydrated).toBe(true);
  });
});
