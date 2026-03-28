import { renderHook } from "@testing-library/react";

jest.mock("../pageNavigationResult", () => ({
  createPageNavigationResult: jest.fn(),
}));

jest.mock("../usePageNavigationActions", () => ({
  usePageNavigationActions: jest.fn(),
}));

jest.mock("../usePageNavigationPersistence", () => ({
  usePageNavigationPersistence: jest.fn(),
}));

jest.mock("../usePageNavigationState", () => ({
  usePageNavigationState: jest.fn(),
}));

import { createPageNavigationResult } from "../pageNavigationResult";
import { usePageNavigation } from "../usePageNavigation";
import { usePageNavigationActions } from "../usePageNavigationActions";
import { usePageNavigationPersistence } from "../usePageNavigationPersistence";
import { usePageNavigationState } from "../usePageNavigationState";

describe("usePageNavigation composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("state/persistence/actions hook を compose して result builder へ委譲する", () => {
    const navigationState = {
      currentPage: "home" as const,
      isHydrated: true,
      setCurrentPage: jest.fn(),
    };
    const navigationActions = {
      onPageChangeAction: jest.fn(),
    };
    const resultState = {
      currentPage: "home" as const,
      isHydrated: true,
      setCurrentPage: navigationState.setCurrentPage,
      onPageChangeAction: navigationActions.onPageChangeAction,
    };

    (usePageNavigationState as jest.Mock).mockReturnValue(navigationState);
    (usePageNavigationActions as jest.Mock).mockReturnValue(navigationActions);
    (createPageNavigationResult as jest.Mock).mockReturnValue(resultState);

    const { result } = renderHook(() => usePageNavigation());

    expect(usePageNavigationPersistence).toHaveBeenCalledWith("home");
    expect(usePageNavigationActions).toHaveBeenCalledWith(
      navigationState.setCurrentPage,
    );
    expect(createPageNavigationResult).toHaveBeenCalledWith({
      navigationState,
      navigationActions,
    });
    expect(result.current).toBe(resultState);
  });
});
