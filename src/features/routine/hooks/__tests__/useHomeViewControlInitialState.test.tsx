import { renderHook } from "@testing-library/react";

jest.mock("../homeViewControlStateActions", () => ({
  createInitialHomeViewControlState: jest.fn(),
}));

import { createInitialHomeViewControlState } from "../homeViewControlStateActions";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";

describe("useHomeViewControlInitialState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createInitialHomeViewControlState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
    });
  });

  it("初期 control state を一度だけ構築して保持する", () => {
    const { result, rerender } = renderHook(() =>
      useHomeViewControlInitialState(),
    );

    expect(createInitialHomeViewControlState).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
    });

    rerender();

    expect(createInitialHomeViewControlState).toHaveBeenCalledTimes(1);
  });
});
