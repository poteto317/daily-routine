import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlInitialState", () => ({
  useHomeViewControlInitialState: jest.fn(),
}));

jest.mock("../useHomeViewControlRuntimeState", () => ({
  useHomeViewControlRuntimeState: jest.fn(),
}));

import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "../useHomeViewControlRuntimeState";

describe("useHomeViewControlState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useHomeViewControlInitialState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
    });
    (useHomeViewControlRuntimeState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      selectedViewMode: { mode: 3 },
      setFilterCategory: jest.fn(),
      setIsEditMode: jest.fn(),
      setSelectedViewMode: jest.fn(),
    });
  });

  it("initial state hook と runtime state hook を compose する", () => {
    const { result } = renderHook(() => useHomeViewControlState());

    expect(useHomeViewControlInitialState).toHaveBeenCalledWith();
    expect(useHomeViewControlRuntimeState).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
    });
    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedViewMode).toEqual({ mode: 3 });
  });
});
