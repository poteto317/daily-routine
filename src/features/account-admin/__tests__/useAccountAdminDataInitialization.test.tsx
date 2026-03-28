import { renderHook, waitFor } from "@testing-library/react";
import { useAccountAdminDataInitialization } from "../useAccountAdminDataInitialization";

jest.mock("../accountAdminInitializationActions", () => ({
  createInitAccountAdminDataAction: jest.fn(),
}));

import { createInitAccountAdminDataAction } from "../accountAdminInitializationActions";

describe("useAccountAdminDataInitialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createInitAccountAdminDataAction as jest.Mock).mockImplementation(
      ({ uid, checkIsAdmin, setIsAdmin, setLoading, loadAccounts }) =>
        async () => {
          if (!uid) {
            return;
          }
          const admin = await checkIsAdmin(uid);
          setIsAdmin(admin);
          if (admin) {
            await loadAccounts();
            return;
          }
          setLoading(false);
        },
    );
  });

  it("管理者なら一覧読み込みを実行する", async () => {
    const checkIsAdmin = jest.fn().mockResolvedValue(true);
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const loadAccounts = jest.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useAccountAdminDataInitialization({
        uid: "u1",
        checkIsAdmin,
        setIsAdmin,
        setLoading,
        loadAccounts,
      }),
    );

    await waitFor(() => {
      expect(setIsAdmin).toHaveBeenCalledWith(true);
    });

    expect(createInitAccountAdminDataAction).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "u1", checkIsAdmin, loadAccounts }),
    );
    expect(loadAccounts).toHaveBeenCalledTimes(1);
  });

  it("非管理者なら loading を終了する", async () => {
    const checkIsAdmin = jest.fn().mockResolvedValue(false);
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const loadAccounts = jest.fn();

    renderHook(() =>
      useAccountAdminDataInitialization({
        uid: "u2",
        checkIsAdmin,
        setIsAdmin,
        setLoading,
        loadAccounts,
      }),
    );

    await waitFor(() => {
      expect(setIsAdmin).toHaveBeenCalledWith(false);
    });

    expect(loadAccounts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("uid がなければ何もしない", async () => {
    const checkIsAdmin = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const loadAccounts = jest.fn();

    renderHook(() =>
      useAccountAdminDataInitialization({
        uid: undefined,
        checkIsAdmin,
        setIsAdmin,
        setLoading,
        loadAccounts,
      }),
    );

    await waitFor(() => {
      expect(checkIsAdmin).not.toHaveBeenCalled();
    });

    expect(setIsAdmin).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
    expect(loadAccounts).not.toHaveBeenCalled();
  });
});
