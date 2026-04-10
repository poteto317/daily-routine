import {
  createAccountAdminCreateHandler,
  createAccountAdminDeleteHandler,
  createAccountAdminUpdateHandler,
} from "../accountAdminActionStateActions";

jest.mock("../accountAdminPageActionHandlers", () => ({
  submitCreateAccount: jest.fn(),
  submitDeleteAccount: jest.fn(),
  submitUpdateAccount: jest.fn(),
}));

import {
  submitCreateAccount,
  submitDeleteAccount,
  submitUpdateAccount,
} from "../accountAdminPageActionHandlers";

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

describe("accountAdminActionStateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create handler が preventDefault 後に submitCreateAccount を呼ぶ", async () => {
    const preventDefault = jest.fn();

    await createAccountAdminCreateHandler({
      currentUid: "u2",
      createEmail: "user@example.com",
      createPassword: "secret123",
      createDisplayName: "ユーザー",
      createIsAdmin: true,
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      resetCreateForm: jest.fn(),
      setActionLoading: jest.fn(),
    })({ preventDefault } as never);

    expect(preventDefault).toHaveBeenCalled();
    expect(submitCreateAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: "u2",
        createEmail: "user@example.com",
      }),
    );
  });

  it("update handler が preventDefault 後に submitUpdateAccount を呼ぶ", async () => {
    const preventDefault = jest.fn();

    await createAccountAdminUpdateHandler({
      editingAccount: account,
      editDisplayName: "更新後",
      editIsAdmin: false,
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      cancelEdit: jest.fn(),
      setActionLoading: jest.fn(),
    })({ preventDefault } as never);

    expect(preventDefault).toHaveBeenCalled();
    expect(submitUpdateAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        editingAccount: account,
        editDisplayName: "更新後",
      }),
    );
  });

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
