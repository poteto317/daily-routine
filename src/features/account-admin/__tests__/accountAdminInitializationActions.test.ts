import { createInitAccountAdminDataAction } from "../accountAdminInitializationActions";

describe("accountAdminInitializationActions", () => {
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
});
