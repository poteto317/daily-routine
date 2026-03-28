import { renderHook } from "@testing-library/react";

jest.mock("../pageNavigationStateResult", () => ({
  createPageNavigationStateResult: jest.fn(),
}));

import { createPageNavigationStateResult } from "../pageNavigationStateResult";
import { usePageNavigationState } from "../usePageNavigationState";

describe("usePageNavigationState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("initial page と hydration state を result builder へ委譲する", () => {
    const resultShape = {
      currentPage: "home",
      isHydrated: true,
      setCurrentPage: jest.fn(),
      composed: true,
    };
    (createPageNavigationStateResult as jest.Mock).mockReturnValue(resultShape);

    const { result } = renderHook(() => usePageNavigationState());

    expect(createPageNavigationStateResult).toHaveBeenCalledWith({
      currentPage: "home",
      isHydrated: true,
      setCurrentPage: expect.any(Function),
    });
    expect(result.current).toBe(resultShape);
  });
});
