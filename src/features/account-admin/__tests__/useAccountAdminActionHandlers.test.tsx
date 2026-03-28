import { act, renderHook } from "@testing-library/react";

jest.mock("../accountAdminActionHandlersResult", () => ({
  createAccountAdminActionHandlersResult: jest.fn(),
}));

import { useAccountAdminActionHandlers } from "../useAccountAdminActionHandlers";

jest.mock("../useAccountAdminCreateHandler", () => ({
  useAccountAdminCreateHandler: jest.fn(),
}));

jest.mock("../useAccountAdminUpdateHandler", () => ({
  useAccountAdminUpdateHandler: jest.fn(),
}));

jest.mock("../useAccountAdminDeleteHandler", () => ({
  useAccountAdminDeleteHandler: jest.fn(),
}));

import { createAccountAdminActionHandlersResult } from "../accountAdminActionHandlersResult";
import { useAccountAdminCreateHandler } from "../useAccountAdminCreateHandler";
import { useAccountAdminDeleteHandler } from "../useAccountAdminDeleteHandler";
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

describe("useAccountAdminActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create/update/delete handler を組み立てて委譲する", async () => {
    const createHandler = jest.fn().mockResolvedValue(undefined);
    const updateHandler = jest.fn().mockResolvedValue(undefined);
    const deleteHandler = jest.fn().mockResolvedValue(undefined);

    (useAccountAdminCreateHandler as jest.Mock).mockReturnValue(createHandler);
    (useAccountAdminUpdateHandler as jest.Mock).mockReturnValue(updateHandler);
    (useAccountAdminDeleteHandler as jest.Mock).mockReturnValue(deleteHandler);
    (createAccountAdminActionHandlersResult as jest.Mock).mockReturnValue({
      handleCreate: createHandler,
      handleUpdate: updateHandler,
      handleDelete: deleteHandler,
    });

    const params = createParams();
    const { result } = renderHook(() => useAccountAdminActionHandlers(params));

    await act(async () => {
      await result.current.handleCreate({ preventDefault: jest.fn() } as never);
      await result.current.handleUpdate({ preventDefault: jest.fn() } as never);
      await result.current.handleDelete(account);
    });

    expect(useAccountAdminCreateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: params.currentUid,
        createEmail: params.createEmail,
        setActionLoading: params.setActionLoading,
      }),
    );
    expect(useAccountAdminUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        editingAccount: params.editingAccount,
        editDisplayName: params.editDisplayName,
        setActionLoading: params.setActionLoading,
      }),
    );
    expect(useAccountAdminDeleteHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: params.currentUid,
        setActionLoading: params.setActionLoading,
      }),
    );
    expect(createAccountAdminActionHandlersResult).toHaveBeenCalledWith({
      handleCreate: createHandler,
      handleUpdate: updateHandler,
      handleDelete: deleteHandler,
    });
    expect(createHandler).toHaveBeenCalled();
    expect(updateHandler).toHaveBeenCalled();
    expect(deleteHandler).toHaveBeenCalled();
  });
});

const createParams = () => ({
  currentUid: "u2",
  loadAccounts: jest.fn().mockResolvedValue(undefined),
  reportError: jest.fn(),
  clearError: jest.fn(),
  resetCreateForm: jest.fn(),
  cancelEdit: jest.fn(),
  editingAccount: account,
  createEmail: "user@example.com",
  createPassword: "secret123",
  createDisplayName: "ユーザー",
  createIsAdmin: true,
  editDisplayName: "更新後",
  editIsAdmin: false,
  setActionLoading: jest.fn(),
});
