import { act, renderHook } from "@testing-library/react";
import { createAccountAdminEditingAccountStateResult } from "../accountAdminEditingAccountStateResult";
import { useAccountAdminEditingAccountState } from "../useAccountAdminEditingAccountState";

jest.mock("../accountAdminEditingAccountStateResult", () => ({
  createAccountAdminEditingAccountStateResult: jest.fn(),
}));

const account = {
  uid: "u1",
  email: "user@example.com",
  displayName: "ユーザー",
  isAdmin: true,
  isAnonymous: false,
  isTestUser: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useAccountAdminEditingAccountState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createAccountAdminEditingAccountStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("editingAccount の保持を管理する", () => {
    const { result } = renderHook(() => useAccountAdminEditingAccountState());

    expect(createAccountAdminEditingAccountStateResult).toHaveBeenCalledWith({
      editingAccount: null,
      setEditingAccount: expect.any(Function),
    });

    expect(result.current.editingAccount).toBeNull();

    act(() => {
      result.current.setEditingAccount(account);
    });

    expect(result.current.editingAccount).toEqual(account);
    expect(
      createAccountAdminEditingAccountStateResult,
    ).toHaveBeenLastCalledWith({
      editingAccount: account,
      setEditingAccount: expect.any(Function),
    });
  });
});
