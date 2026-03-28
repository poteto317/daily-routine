import { createAccountAdminEditingAccountStateResult } from "../accountAdminEditingAccountStateResult";

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

describe("createAccountAdminEditingAccountStateResult", () => {
  it("editing account state の公開 shape を返す", () => {
    const setEditingAccount = jest.fn();

    expect(
      createAccountAdminEditingAccountStateResult({
        editingAccount: account,
        setEditingAccount,
      }),
    ).toEqual({
      editingAccount: account,
      setEditingAccount,
    });
  });
});
