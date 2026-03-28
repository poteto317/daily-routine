import { createAccountAdminPageStateResult } from "../accountAdminPageStateResult";

describe("accountAdminPageStateResult", () => {
  it("account admin page の公開 state を組み立てる", () => {
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

    const data = {
      accounts: [account],
      clearError: jest.fn(),
      error: null,
      isAdmin: true,
      loadAccounts: jest.fn(),
      loading: false,
      reportError: jest.fn(),
    };
    const form = {
      cancelEdit: jest.fn(),
      closeCreateForm: jest.fn(),
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      editDisplayName: "更新後",
      editIsAdmin: false,
      editingAccount: account,
      resetCreateForm: jest.fn(),
      setCreateDisplayName: jest.fn(),
      setCreateEmail: jest.fn(),
      setCreateIsAdmin: jest.fn(),
      setCreatePassword: jest.fn(),
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
      showCreateForm: false,
      startEdit: jest.fn(),
      toggleCreateForm: jest.fn(),
    };
    const actions = {
      actionLoading: false,
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleUpdate: jest.fn(),
    };

    expect(
      createAccountAdminPageStateResult({
        actions,
        currentUid: "u1",
        data,
        form,
      }),
    ).toEqual({
      ...data,
      ...form,
      ...actions,
      currentUid: "u1",
    });
  });
});
