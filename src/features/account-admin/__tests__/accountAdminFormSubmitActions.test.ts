import {
  createAccountAdminCreateHandler,
  createAccountAdminUpdateHandler,
} from "../accountAdminFormSubmitActions";

jest.mock("../accountAdminPageActionHandlers", () => ({
  submitCreateAccount: jest.fn(),
  submitUpdateAccount: jest.fn(),
}));

import {
  submitCreateAccount,
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

describe("accountAdminFormSubmitActions", () => {
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
});
