import { renderHook } from "@testing-library/react";

jest.mock("../useAccountAdminActionState", () => ({
  useAccountAdminActionState: jest.fn(),
}));

jest.mock("../useAccountAdminActionHandlers", () => ({
  useAccountAdminActionHandlers: jest.fn(),
}));

jest.mock("../accountAdminActionsResult", () => ({
  createAccountAdminActionsResult: jest.fn(),
}));

import { createAccountAdminActionsResult } from "../accountAdminActionsResult";
import { useAccountAdminActionHandlers } from "../useAccountAdminActionHandlers";
import { useAccountAdminActionState } from "../useAccountAdminActionState";
import { useAccountAdminActions } from "../useAccountAdminActions";

describe("useAccountAdminActions composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAccountAdminActionState as jest.Mock).mockReturnValue({
      actionLoading: false,
      setActionLoading: jest.fn(),
    });
    (useAccountAdminActionHandlers as jest.Mock).mockReturnValue({
      handleCreate: jest.fn(),
      handleUpdate: jest.fn(),
      handleDelete: jest.fn(),
    });
    (createAccountAdminActionsResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("action state・handlers・result builder を compose する", () => {
    const params = {
      currentUid: "u2",
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      resetCreateForm: jest.fn(),
      cancelEdit: jest.fn(),
      editingAccount: null,
      createEmail: "user@example.com",
      createPassword: "secret123",
      createDisplayName: "ユーザー",
      createIsAdmin: true,
      editDisplayName: "更新後",
      editIsAdmin: false,
    };

    const { result } = renderHook(() => useAccountAdminActions(params));

    expect(useAccountAdminActionState).toHaveBeenCalledTimes(1);
    expect(useAccountAdminActionHandlers).toHaveBeenCalledWith({
      ...params,
      setActionLoading: expect.any(Function),
    });
    expect(createAccountAdminActionsResult).toHaveBeenCalledWith({
      actionLoading: false,
      handleCreate: expect.any(Function),
      handleUpdate: expect.any(Function),
      handleDelete: expect.any(Function),
    });
    expect(result.current).toEqual({
      actionLoading: false,
      handleCreate: expect.any(Function),
      handleUpdate: expect.any(Function),
      handleDelete: expect.any(Function),
    });
  });
});
