import { createAccountAdminDeleteHandler } from "../accountAdminDeleteActions";

jest.mock("../accountAdminPageActionHandlers", () => ({
  submitDeleteAccount: jest.fn(),
}));

import { submitDeleteAccount } from "../accountAdminPageActionHandlers";

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

describe("accountAdminDeleteActions", () => {
  it("delete handler が submitDeleteAccount を呼ぶ", async () => {
    await createAccountAdminDeleteHandler({
      account,
      currentUid: "u2",
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
    })();

    expect(submitDeleteAccount).toHaveBeenCalledWith(
      expect.objectContaining({ account, currentUid: "u2" }),
    );
  });
});
