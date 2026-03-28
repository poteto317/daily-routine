import { act, renderHook } from "@testing-library/react";
import { usePageNavigationActions } from "../usePageNavigationActions";

jest.mock("../pageNavigationStateActions", () => ({
  applyPageChangeAction: jest.fn(),
}));

jest.mock("../pageNavigationActionsResult", () => ({
  createPageNavigationActionsResult: jest.fn(),
}));

import { createPageNavigationActionsResult } from "../pageNavigationActionsResult";
import { applyPageChangeAction } from "../pageNavigationStateActions";

describe("usePageNavigationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ページ変更 action を委譲する", () => {
    const setCurrentPage = jest.fn();
    const onPageChangeAction = jest.fn();
    const resultShape = { onPageChangeAction, composed: true };
    (createPageNavigationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      usePageNavigationActions(setCurrentPage),
    );

    expect(result.current).toBe(resultShape);
    expect(createPageNavigationActionsResult).toHaveBeenCalledWith({
      onPageChangeAction: expect.any(Function),
    });

    const builtOnPageChangeAction = (
      createPageNavigationActionsResult as jest.Mock
    ).mock.calls[0][0].onPageChangeAction as (page: "settings") => void;

    act(() => {
      builtOnPageChangeAction("settings");
    });

    expect(applyPageChangeAction).toHaveBeenCalledWith(
      expect.objectContaining({
        page: "settings",
        setCurrentPage,
      }),
    );
  });
});
