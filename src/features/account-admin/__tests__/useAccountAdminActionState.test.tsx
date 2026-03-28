import { act, renderHook } from "@testing-library/react";
import { createAccountAdminActionStateResult } from "../accountAdminActionStateResult";
import { useAccountAdminActionState } from "../useAccountAdminActionState";

jest.mock("../accountAdminActionStateResult", () => ({
  createAccountAdminActionStateResult: jest.fn(),
}));

describe("useAccountAdminActionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAccountAdminActionStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("actionLoading を更新できる", () => {
    const { result } = renderHook(() => useAccountAdminActionState());

    expect(createAccountAdminActionStateResult).toHaveBeenCalledWith({
      actionLoading: false,
      setActionLoading: expect.any(Function),
    });

    expect(result.current.actionLoading).toBe(false);

    act(() => {
      result.current.setActionLoading(true);
    });

    expect(result.current.actionLoading).toBe(true);
    expect(createAccountAdminActionStateResult).toHaveBeenLastCalledWith({
      actionLoading: true,
      setActionLoading: expect.any(Function),
    });
  });
});
