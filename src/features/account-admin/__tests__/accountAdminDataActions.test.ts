import {
  createAccountAdminErrorActions,
  createInitAccountAdminDataAction,
  createLoadAccountsAction,
} from "../accountAdminDataActions";

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

describe("accountAdminDataActions", () => {
  it("loadAccounts action が一覧取得成功時に state を更新する", async () => {
    const setAccounts = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();

    await createLoadAccountsAction({
      setAccounts,
      setLoading,
      setError,
      getAccounts: async () => [account],
      loadErrorMessage: "failed",
    })();

    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setError).toHaveBeenCalledWith(null);
    expect(setAccounts).toHaveBeenCalledWith([account]);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("loadAccounts action が失敗時に error を設定する", async () => {
    const setAccounts = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();
    const logError = jest.fn();
    const error = new Error("failed");

    await createLoadAccountsAction({
      setAccounts,
      setLoading,
      setError,
      getAccounts: async () => {
        throw error;
      },
      loadErrorMessage: "load error",
      logError,
    })();

    expect(setAccounts).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith("load error");
    expect(logError).toHaveBeenCalledWith(error);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("init action が管理者判定に応じて一覧取得または loading 終了を行う", async () => {
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const loadAccounts = jest.fn();

    await createInitAccountAdminDataAction({
      uid: "u1",
      checkIsAdmin: async () => true,
      setIsAdmin,
      setLoading,
      loadAccounts,
    })();

    expect(setIsAdmin).toHaveBeenCalledWith(true);
    expect(loadAccounts).toHaveBeenCalledTimes(1);

    loadAccounts.mockClear();
    setIsAdmin.mockClear();

    await createInitAccountAdminDataAction({
      uid: "u2",
      checkIsAdmin: async () => false,
      setIsAdmin,
      setLoading,
      loadAccounts,
    })();

    expect(setIsAdmin).toHaveBeenCalledWith(false);
    expect(loadAccounts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("uid が無いとき init action は何もしない", async () => {
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const loadAccounts = jest.fn();
    const checkIsAdmin = jest.fn();

    await createInitAccountAdminDataAction({
      uid: undefined,
      checkIsAdmin,
      setIsAdmin,
      setLoading,
      loadAccounts,
    })();

    expect(checkIsAdmin).not.toHaveBeenCalled();
    expect(setIsAdmin).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
    expect(loadAccounts).not.toHaveBeenCalled();
  });

  it("error action が clear/report を返す", () => {
    const setError = jest.fn();
    const { clearError, reportError } = createAccountAdminErrorActions(setError);

    reportError("err");
    clearError();

    expect(setError).toHaveBeenNthCalledWith(1, "err");
    expect(setError).toHaveBeenNthCalledWith(2, null);
  });
});
