import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminFormSubmitActions", () => ({
  createAccountAdminUpdateHandler: jest.fn(),
}));

import { createAccountAdminUpdateHandler } from "../accountAdminFormSubmitActions";
import { useAccountAdminUpdateHandler } from "../useAccountAdminUpdateHandler";

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

describe("useAccountAdminUpdateHandler", () => {
  it("update handler 用の依存を束ねる", () => {
    const handler = jest.fn();
    (createAccountAdminUpdateHandler as jest.Mock).mockReturnValue(handler);
    const params = createParams();

    const { result } = renderHook(() => useAccountAdminUpdateHandler(params));

    expect(createAccountAdminUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        editingAccount: params.editingAccount,
        editDisplayName: params.editDisplayName,
        cancelEdit: params.cancelEdit,
      }),
    );
    expect(result.current).toBe(handler);
  });
});

const createParams = () => ({
  loadAccounts: jest.fn().mockResolvedValue(undefined),
  reportError: jest.fn(),
  clearError: jest.fn(),
  cancelEdit: jest.fn(),
  editingAccount: account,
  editDisplayName: "更新後",
  editIsAdmin: false,
  setActionLoading: jest.fn(),
});
