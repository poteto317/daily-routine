import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminDataResult", () => ({
  createAccountAdminDataResult: jest.fn(),
}));

jest.mock("../useAccountAdminDataInitialization", () => ({
  useAccountAdminDataInitialization: jest.fn(),
}));

jest.mock("../useAccountAdminDataState", () => ({
  useAccountAdminDataState: jest.fn(),
}));

import { createAccountAdminDataResult } from "../accountAdminDataResult";
import { useAccountAdminData } from "../useAccountAdminData";
import { useAccountAdminDataInitialization } from "../useAccountAdminDataInitialization";
import { useAccountAdminDataState } from "../useAccountAdminDataState";

describe("useAccountAdminData composition", () => {
  it("data state と initialization を compose する", () => {
    const dataState = {
      accounts: [],
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
    const builtResult = {
      accounts: [],
      clearError: dataState.clearError,
      error: null,
      isAdmin: true,
      loadAccounts: dataState.loadAccounts,
      loading: false,
      reportError: dataState.reportError,
    };

    (useAccountAdminDataState as jest.Mock).mockReturnValue(dataState);
    (createAccountAdminDataResult as jest.Mock).mockReturnValue(builtResult);

    const { result } = renderHook(() => useAccountAdminData("u1"));

    expect(useAccountAdminDataState).toHaveBeenCalledTimes(1);
    expect(useAccountAdminDataInitialization).toHaveBeenCalledWith({
      uid: "u1",
      checkIsAdmin: dataState.checkIsAdmin,
      setIsAdmin: dataState.setIsAdmin,
      setLoading: dataState.setLoading,
      loadAccounts: dataState.loadAccounts,
    });
    expect(createAccountAdminDataResult).toHaveBeenCalledWith({ dataState });
    expect(result.current).toBe(builtResult);
  });
});
