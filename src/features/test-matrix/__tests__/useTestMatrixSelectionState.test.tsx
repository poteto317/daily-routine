import { act, renderHook } from "@testing-library/react";
import { createTestMatrixSelectionStateResult } from "../testMatrixSelectionStateResult";
import { useTestMatrixSelectionState } from "../useTestMatrixSelectionState";

jest.mock("../testMatrixSelectionStateResult", () => ({
  createTestMatrixSelectionStateResult: jest.fn(),
}));

describe("useTestMatrixSelectionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTestMatrixSelectionStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("選択状態を管理し result helper に委譲する", () => {
    const { result } = renderHook(() => useTestMatrixSelectionState());

    expect(createTestMatrixSelectionStateResult).toHaveBeenCalledWith({
      selectedItemId: null,
      setSelectedItemId: expect.any(Function),
    });
    expect(result.current.selectedItemId).toBeNull();

    act(() => {
      result.current.setSelectedItemId("1-1");
    });

    expect(result.current.selectedItemId).toBe("1-1");
    expect(createTestMatrixSelectionStateResult).toHaveBeenLastCalledWith({
      selectedItemId: "1-1",
      setSelectedItemId: expect.any(Function),
    });
  });
});
