import { renderHook } from "@testing-library/react";
import { usePageNavigationPersistence } from "../usePageNavigationPersistence";

jest.mock("../pageNavigationStateActions", () => ({
  syncCurrentPageState: jest.fn(),
}));

import { syncCurrentPageState } from "../pageNavigationStateActions";

describe("usePageNavigationPersistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("currentPage の変更を永続化 action に委譲する", () => {
    renderHook(() => usePageNavigationPersistence("calendar"));

    expect(syncCurrentPageState).toHaveBeenCalledWith(
      expect.objectContaining({ currentPage: "calendar" }),
    );
  });
});
