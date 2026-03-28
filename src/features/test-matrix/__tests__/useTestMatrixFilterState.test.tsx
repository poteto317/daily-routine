import { act, renderHook } from "@testing-library/react";
import { createTestMatrixFilterStateResult } from "../testMatrixFilterStateResult";
import { useTestMatrixFilterState } from "../useTestMatrixFilterState";

jest.mock("../testMatrixFilterStateResult", () => ({
  createTestMatrixFilterStateResult: jest.fn(),
}));

describe("useTestMatrixFilterState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTestMatrixFilterStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("filter 状態を管理し result helper に委譲する", () => {
    const { result } = renderHook(() => useTestMatrixFilterState());

    expect(createTestMatrixFilterStateResult).toHaveBeenCalledWith({
      filterStatus: "all",
      setFilterStatus: expect.any(Function),
    });
    expect(result.current.filterStatus).toBe("all");

    act(() => {
      result.current.setFilterStatus("ok");
    });

    expect(result.current.filterStatus).toBe("ok");
    expect(createTestMatrixFilterStateResult).toHaveBeenLastCalledWith({
      filterStatus: "ok",
      setFilterStatus: expect.any(Function),
    });
  });
});
