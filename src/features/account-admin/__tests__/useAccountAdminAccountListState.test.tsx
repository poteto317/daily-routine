import { act, renderHook } from "@testing-library/react";
import { createAccountAdminAccountListStateResult } from "../accountAdminAccountListStateResult";
import { useAccountAdminAccountListState } from "../useAccountAdminAccountListState";

jest.mock("../accountAdminAccountListStateResult", () => ({
  createAccountAdminAccountListStateResult: jest.fn(),
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

describe("useAccountAdminAccountListState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAccountAdminAccountListStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("accounts list を保持する", () => {
    const { result } = renderHook(() => useAccountAdminAccountListState());

    expect(createAccountAdminAccountListStateResult).toHaveBeenCalledWith({
      accounts: [],
      setAccounts: expect.any(Function),
    });

    expect(result.current.accounts).toEqual([]);

    act(() => {
      result.current.setAccounts([account]);
    });

    expect(result.current.accounts).toEqual([account]);
    expect(createAccountAdminAccountListStateResult).toHaveBeenLastCalledWith({
      accounts: [account],
      setAccounts: expect.any(Function),
    });
  });
});
