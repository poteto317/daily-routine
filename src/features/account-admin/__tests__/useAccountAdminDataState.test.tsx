import { act, renderHook } from "@testing-library/react";

jest.mock("../accountService", () => ({
  checkIsAdmin: jest.fn(),
  getAccounts: jest.fn(),
}));

jest.mock("../accountAdminLoadActions", () => ({
  createLoadAccountsAction: jest.fn(),
}));

jest.mock("../accountAdminErrorActions", () => ({
  createAccountAdminErrorActions: jest.fn(),
}));

jest.mock("../accountAdminDataStateResult", () => ({
  createAccountAdminDataStateResult: jest.fn(),
}));

import { checkIsAdmin, getAccounts } from "../accountService";
import { createAccountAdminDataStateResult } from "../accountAdminDataStateResult";
import { createAccountAdminErrorActions } from "../accountAdminErrorActions";
import { createLoadAccountsAction } from "../accountAdminLoadActions";
import { useAccountAdminDataState } from "../useAccountAdminDataState";

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

describe("useAccountAdminDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAccounts as jest.Mock).mockResolvedValue([account]);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    (createLoadAccountsAction as jest.Mock).mockImplementation(
      ({ setAccounts, setLoading, setError, getAccounts: load }) =>
        async () => {
          try {
            setLoading(true);
            setError(null);
            setAccounts(await load());
          } catch {
            setError("アカウント一覧の取得に失敗しました");
          } finally {
            setLoading(false);
          }
        },
    );
    (createAccountAdminErrorActions as jest.Mock).mockImplementation(
      (setError) => ({
        clearError: () => setError(null),
        reportError: (message: string) => setError(message),
      }),
    );
    (createAccountAdminDataStateResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("一覧読み込み成功時に state を更新する", async () => {
    const { result } = renderHook(() => useAccountAdminDataState());

    await act(async () => {
      await result.current.loadAccounts();
    });

    expect(createLoadAccountsAction).toHaveBeenCalledWith(
      expect.objectContaining({
        getAccounts,
        loadErrorMessage: "アカウント一覧の取得に失敗しました",
      }),
    );
    expect(createAccountAdminDataStateResult).toHaveBeenLastCalledWith({
      accounts: [account],
      checkIsAdmin,
      clearError: expect.any(Function),
      error: null,
      isAdmin: false,
      loadAccounts: expect.any(Function),
      loading: false,
      reportError: expect.any(Function),
      setIsAdmin: expect.any(Function),
      setLoading: expect.any(Function),
    });
    expect(result.current.accounts).toEqual([account]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("一覧読み込み失敗時に error を設定する", async () => {
    (getAccounts as jest.Mock).mockRejectedValueOnce(new Error("failed"));
    const { result } = renderHook(() => useAccountAdminDataState());

    await act(async () => {
      await result.current.loadAccounts();
    });

    expect(createAccountAdminDataStateResult).toHaveBeenLastCalledWith({
      accounts: [],
      checkIsAdmin,
      clearError: expect.any(Function),
      error: "アカウント一覧の取得に失敗しました",
      isAdmin: false,
      loadAccounts: expect.any(Function),
      loading: false,
      reportError: expect.any(Function),
      setIsAdmin: expect.any(Function),
      setLoading: expect.any(Function),
    });
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBe("アカウント一覧の取得に失敗しました");
    expect(result.current.loading).toBe(false);
  });

  it("error helper で clear/report できる", () => {
    const { result } = renderHook(() => useAccountAdminDataState());

    expect(createAccountAdminErrorActions).toHaveBeenCalledWith(
      expect.any(Function),
    );

    act(() => {
      result.current.reportError("err");
    });
    expect(result.current.error).toBe("err");

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
    expect(createAccountAdminDataStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        accounts: [],
        checkIsAdmin,
        clearError: expect.any(Function),
        error: null,
        isAdmin: false,
        loadAccounts: expect.any(Function),
        reportError: expect.any(Function),
        setIsAdmin: expect.any(Function),
        setLoading: expect.any(Function),
      }),
    );
  });
});
