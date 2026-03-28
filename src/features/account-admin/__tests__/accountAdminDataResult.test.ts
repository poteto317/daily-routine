import { createAccountAdminDataResult } from "../accountAdminDataResult";

describe("createAccountAdminDataResult", () => {
  it("data state の公開 shape を返す", () => {
    const dataState = {
      accounts: [
        {
          uid: "u1",
          email: "user@example.com",
          displayName: "User",
          isAdmin: true,
          isAnonymous: false,
          isTestUser: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          updatedAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      clearError: jest.fn(),
      error: null,
      isAdmin: true,
      loadAccounts: jest.fn(),
      loading: false,
      reportError: jest.fn(),
      checkIsAdmin: jest.fn(),
      setIsAdmin: jest.fn(),
      setLoading: jest.fn(),
    };

    expect(createAccountAdminDataResult({ dataState })).toEqual({
      accounts: dataState.accounts,
      clearError: dataState.clearError,
      error: null,
      isAdmin: true,
      loadAccounts: dataState.loadAccounts,
      loading: false,
      reportError: dataState.reportError,
    });
  });
});
