import { act, renderHook } from "@testing-library/react";
import { createAccountAdminStatusStateResult } from "../accountAdminStatusStateResult";
import { useAccountAdminStatusState } from "../useAccountAdminStatusState";

jest.mock("../accountAdminStatusStateResult", () => ({
  createAccountAdminStatusStateResult: jest.fn(),
}));

describe("useAccountAdminStatusState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAccountAdminStatusStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("loading/isAdmin/error state を保持する", () => {
    const { result } = renderHook(() => useAccountAdminStatusState());

    expect(createAccountAdminStatusStateResult).toHaveBeenCalledWith({
      error: null,
      isAdmin: false,
      loading: true,
      setError: expect.any(Function),
      setIsAdmin: expect.any(Function),
      setLoading: expect.any(Function),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.setLoading(false);
      result.current.setIsAdmin(true);
      result.current.setError("err");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.error).toBe("err");
    expect(createAccountAdminStatusStateResult).toHaveBeenLastCalledWith({
      error: "err",
      isAdmin: true,
      loading: false,
      setError: expect.any(Function),
      setIsAdmin: expect.any(Function),
      setLoading: expect.any(Function),
    });
  });
});
