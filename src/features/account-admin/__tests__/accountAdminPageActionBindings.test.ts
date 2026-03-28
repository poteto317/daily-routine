import { createAccountAdminPageActionBindings } from "../accountAdminPageActionBindings";

describe("accountAdminPageActionBindings", () => {
  it("account admin actions 用の依存を束ねる", () => {
    const bindings = createAccountAdminPageActionBindings({
      cancelEdit: jest.fn(),
      clearError: jest.fn(),
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      currentUid: "u1",
      editDisplayName: "更新後",
      editIsAdmin: false,
      editingAccount: null,
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      resetCreateForm: jest.fn(),
    });

    expect(bindings).toEqual(
      expect.objectContaining({
        currentUid: "u1",
        createEmail: "user@example.com",
        editDisplayName: "更新後",
      }),
    );
  });
});
