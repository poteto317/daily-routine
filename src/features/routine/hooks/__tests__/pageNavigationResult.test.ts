import { createPageNavigationResult } from "../pageNavigationResult";

describe("createPageNavigationResult", () => {
  it("page navigation の公開 shape を返す", () => {
    const navigationState = {
      currentPage: "home" as const,
      isHydrated: true,
      setCurrentPage: jest.fn(),
    };
    const navigationActions = {
      onPageChangeAction: jest.fn(),
    };

    const result = createPageNavigationResult({
      navigationState,
      navigationActions,
    });

    expect(result).toEqual({
      currentPage: "home",
      setCurrentPage: navigationState.setCurrentPage,
      isHydrated: true,
      onPageChangeAction: navigationActions.onPageChangeAction,
    });
  });
});
