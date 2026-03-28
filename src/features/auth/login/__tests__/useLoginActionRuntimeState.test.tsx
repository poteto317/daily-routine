import { act, renderHook } from "@testing-library/react";
import { createLoginActionRuntimeStateResult } from "../loginActionRuntimeStateResult";
import { useLoginActionRuntimeState } from "../useLoginActionRuntimeState";

jest.mock("../loginActionRuntimeStateResult", () => ({
  createLoginActionRuntimeStateResult: jest.fn(),
}));

describe("useLoginActionRuntimeState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLoginActionRuntimeStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("error と loading を更新できる", () => {
    const { result } = renderHook(() => useLoginActionRuntimeState());

    expect(createLoginActionRuntimeStateResult).toHaveBeenCalledWith({
      error: null,
      loading: false,
      setError: expect.any(Function),
      setLoading: expect.any(Function),
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setError("err");
      result.current.setLoading(true);
    });

    expect(result.current.error).toBe("err");
    expect(result.current.loading).toBe(true);
    expect(createLoginActionRuntimeStateResult).toHaveBeenLastCalledWith({
      error: "err",
      loading: true,
      setError: expect.any(Function),
      setLoading: expect.any(Function),
    });
  });
});
