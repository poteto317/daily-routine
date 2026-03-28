import { createPageNavigationStateResult } from "../pageNavigationStateResult";

describe("createPageNavigationStateResult", () => {
  it("page navigation state の公開 shape を組み立てる", () => {
    const setCurrentPage = jest.fn();

    expect(
      createPageNavigationStateResult({
        currentPage: "settings",
        isHydrated: true,
        setCurrentPage,
      }),
    ).toEqual({
      currentPage: "settings",
      isHydrated: true,
      setCurrentPage,
    });
  });
});
