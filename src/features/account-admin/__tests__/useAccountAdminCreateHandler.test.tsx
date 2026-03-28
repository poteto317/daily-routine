import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminFormSubmitActions", () => ({
  createAccountAdminCreateHandler: jest.fn(),
}));

import { createAccountAdminCreateHandler } from "../accountAdminFormSubmitActions";
import { useAccountAdminCreateHandler } from "../useAccountAdminCreateHandler";

describe("useAccountAdminCreateHandler", () => {
  it("create handler 用の依存を束ねる", () => {
    const handler = jest.fn();
    (createAccountAdminCreateHandler as jest.Mock).mockReturnValue(handler);
    const params = createParams();

    const { result } = renderHook(() => useAccountAdminCreateHandler(params));

    expect(createAccountAdminCreateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: params.currentUid,
        createEmail: params.createEmail,
        resetCreateForm: params.resetCreateForm,
      }),
    );
    expect(result.current).toBe(handler);
  });
});

const createParams = () => ({
  currentUid: "u2",
  loadAccounts: jest.fn().mockResolvedValue(undefined),
  reportError: jest.fn(),
  clearError: jest.fn(),
  resetCreateForm: jest.fn(),
  createEmail: "user@example.com",
  createPassword: "secret123",
  createDisplayName: "ユーザー",
  createIsAdmin: true,
  setActionLoading: jest.fn(),
});
