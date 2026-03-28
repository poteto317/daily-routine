import { createAccountAdminEditFormStateResult } from "../accountAdminEditFormStateResult";
import type { Account } from "../types";

describe("createAccountAdminEditFormStateResult", () => {
  it("edit form の公開 shape を返す", () => {
    const fieldsState = {
      editDisplayName: "User",
      editIsAdmin: true,
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
    };
    const editingAccount: Account = {
      uid: "u1",
      email: "user@example.com",
      displayName: "User",
      isAdmin: true,
      isAnonymous: false,
      isTestUser: false,
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const editingState = {
      editingAccount,
      setEditingAccount: jest.fn(),
    };
    const startEdit = jest.fn();
    const cancelEdit = jest.fn();

    const result = createAccountAdminEditFormStateResult({
      fieldsState,
      editingState,
      startEdit,
      cancelEdit,
    });

    expect(result).toEqual({
      cancelEdit,
      editDisplayName: "User",
      editIsAdmin: true,
      editingAccount,
      setEditDisplayName: fieldsState.setEditDisplayName,
      setEditIsAdmin: fieldsState.setEditIsAdmin,
      startEdit,
    });
  });
});
