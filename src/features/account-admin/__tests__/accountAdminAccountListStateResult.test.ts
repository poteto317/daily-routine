import { createAccountAdminAccountListStateResult } from "../accountAdminAccountListStateResult";

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

describe("createAccountAdminAccountListStateResult", () => {
  it("account list state の公開 shape を返す", () => {
    const setAccounts = jest.fn();

    expect(
      createAccountAdminAccountListStateResult({
        accounts: [account],
        setAccounts,
      }),
    ).toEqual({
      accounts: [account],
      setAccounts,
    });
  });
});
