import { createLoadAccountsAction } from "../accountAdminLoadActions";

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

describe("accountAdminLoadActions", () => {
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
});
