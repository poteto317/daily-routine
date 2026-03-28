import { checkIsAdmin } from "../accountService";
import { createAccountAdminDataStateResult } from "../accountAdminDataStateResult";

describe("createAccountAdminDataStateResult", () => {
  it("data state の公開 shape を返す", () => {
    const clearError = jest.fn();
    const loadAccounts = jest.fn();
    const reportError = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();

    expect(
      createAccountAdminDataStateResult({
        accounts: [],
        checkIsAdmin,
        clearError,
        error: null,
        isAdmin: false,
        loadAccounts,
        loading: false,
        reportError,
        setIsAdmin,
        setLoading,
      }),
    ).toEqual({
      accounts: [],
      checkIsAdmin,
      clearError,
      error: null,
      isAdmin: false,
      loadAccounts,
      loading: false,
      reportError,
      setIsAdmin,
      setLoading,
    });
  });
});
