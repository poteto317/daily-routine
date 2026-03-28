import { renderHook } from "@testing-library/react";
import { useHomePageData } from "../useHomePageData";
import { useHomePageDependencies } from "../useHomePageDependencies";
import { useHomePageEffects } from "../useHomePageEffects";

jest.mock("../useHomePageDependencies", () => ({
  useHomePageDependencies: jest.fn(),
}));

jest.mock("../useHomePageEffects", () => ({
  useHomePageEffects: jest.fn(),
}));

describe("useHomePageData", () => {
  const homePageData = {
    routineOps: {},
    currentPage: "home" as const,
    isHydrated: true,
    onPageChangeAction: jest.fn(),
    view: {},
    crud: {},
    display: {},
    trainDelays: [],
  };

  const dependencies = {
    homePageData,
    showForm: true,
    closeFormAction: jest.fn(),
    setCurrentPageAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useHomePageDependencies as jest.Mock).mockReturnValue(dependencies);
  });

  it("依存データ取得と副作用実行を委譲し、HomePageDataを返す", () => {
    const { result } = renderHook(() => useHomePageData());

    expect(useHomePageEffects).toHaveBeenCalledWith({
      showForm: dependencies.showForm,
      closeFormAction: dependencies.closeFormAction,
      setCurrentPageAction: dependencies.setCurrentPageAction,
    });
    expect(result.current).toBe(homePageData);
  });
});
