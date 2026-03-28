import { act, renderHook } from "@testing-library/react";

jest.mock("../accountAdminDeleteActions", () => ({
  createAccountAdminDeleteHandler: jest.fn(),
}));

import { createAccountAdminDeleteHandler } from "../accountAdminDeleteActions";
import { useAccountAdminDeleteHandler } from "../useAccountAdminDeleteHandler";

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

describe("useAccountAdminDeleteHandler", () => {
  it("delete handler 用の依存を束ねて実行する", async () => {
    const deleteHandler = jest.fn().mockResolvedValue(undefined);
    (createAccountAdminDeleteHandler as jest.Mock).mockReturnValue(
      deleteHandler,
    );
    const params = createParams();

    const { result } = renderHook(() => useAccountAdminDeleteHandler(params));

    await act(async () => {
      await result.current(account);
    });

    expect(createAccountAdminDeleteHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        account,
        currentUid: params.currentUid,
        setActionLoading: params.setActionLoading,
      }),
    );
    expect(deleteHandler).toHaveBeenCalled();
  });
});

const createParams = () => ({
  currentUid: "u2",
  loadAccounts: jest.fn().mockResolvedValue(undefined),
  reportError: jest.fn(),
  clearError: jest.fn(),
  setActionLoading: jest.fn(),
});
