import { act, renderHook } from "@testing-library/react";
import { createAccountAdminEditFieldsStateResult } from "../accountAdminEditFieldsStateResult";
import { useAccountAdminEditFieldsState } from "../useAccountAdminEditFieldsState";

jest.mock("../accountAdminEditFieldsStateResult", () => ({
  createAccountAdminEditFieldsStateResult: jest.fn(),
}));

describe("useAccountAdminEditFieldsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAccountAdminEditFieldsStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("編集フォームの field state を管理する", () => {
    const { result } = renderHook(() => useAccountAdminEditFieldsState());

    expect(createAccountAdminEditFieldsStateResult).toHaveBeenCalledWith({
      editDisplayName: "",
      editIsAdmin: false,
      setEditDisplayName: expect.any(Function),
      setEditIsAdmin: expect.any(Function),
    });

    act(() => {
      result.current.setEditDisplayName("更新後");
      result.current.setEditIsAdmin(true);
    });

    expect(result.current.editDisplayName).toBe("更新後");
    expect(result.current.editIsAdmin).toBe(true);
    expect(createAccountAdminEditFieldsStateResult).toHaveBeenLastCalledWith({
      editDisplayName: "更新後",
      editIsAdmin: true,
      setEditDisplayName: expect.any(Function),
      setEditIsAdmin: expect.any(Function),
    });
  });
});
