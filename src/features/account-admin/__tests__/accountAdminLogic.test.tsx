import { act, renderHook, waitFor } from "@testing-library/react";
import { useAccountAdminData } from "../useAccountAdminData";
import { executeCreateAccount } from "../accountAdminCreateAction";
import { getCreateAccountErrorMessage } from "../accountAdminCreateError";
import {
  executeDeleteAccount,
  executeUpdateAccount,
} from "../accountAdminMutationActions";
import * as accountAdminIndex from "../index";

jest.mock("../accountService", () => ({
  checkIsAdmin: jest.fn(),
  createAccountRecord: jest.fn(),
  createAuthUser: jest.fn(),
  deleteAccountRecord: jest.fn(),
  getAccount: jest.fn(),
  getAccounts: jest.fn(),
  updateAccountRecord: jest.fn(),
}));

import {
  checkIsAdmin,
  createAccountRecord,
  createAuthUser,
  deleteAccountRecord,
  getAccount,
  getAccounts,
  updateAccountRecord,
} from "../accountService";

const mockCheckIsAdmin = checkIsAdmin as jest.MockedFunction<typeof checkIsAdmin>;
const mockCreateAccountRecord =
  createAccountRecord as jest.MockedFunction<typeof createAccountRecord>;
const mockCreateAuthUser = createAuthUser as jest.MockedFunction<typeof createAuthUser>;
const mockDeleteAccountRecord =
  deleteAccountRecord as jest.MockedFunction<typeof deleteAccountRecord>;
const mockGetAccounts = getAccounts as jest.MockedFunction<typeof getAccounts>;
const mockUpdateAccountRecord =
  updateAccountRecord as jest.MockedFunction<typeof updateAccountRecord>;

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

describe("account-admin logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useAccountAdminDataが管理者なら一覧を読み込む", async () => {
    mockCheckIsAdmin.mockResolvedValue(true);
    mockGetAccounts.mockResolvedValue([account]);

    const { result } = renderHook(() => useAccountAdminData("u1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.accounts).toEqual([account]);

    act(() => {
      result.current.reportError("err");
    });
    expect(result.current.error).toBe("err");

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("useAccountAdminDataが非管理者や取得失敗を扱う", async () => {
    mockCheckIsAdmin.mockResolvedValue(false);

    const nonAdmin = renderHook(() => useAccountAdminData("u2"));
    await waitFor(() => {
      expect(nonAdmin.result.current.loading).toBe(false);
    });
    expect(nonAdmin.result.current.isAdmin).toBe(false);
    expect(mockGetAccounts).not.toHaveBeenCalled();

    mockCheckIsAdmin.mockResolvedValue(true);
    mockGetAccounts.mockRejectedValue(new Error("failed"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const failed = renderHook(() => useAccountAdminData("u3"));
    await waitFor(() => {
      expect(failed.result.current.loading).toBe(false);
    });

    expect(failed.result.current.error).toBe("アカウント一覧の取得に失敗しました");
    (console.error as jest.Mock).mockRestore();
  });

  it("create/update/delete action helperを実行する", async () => {
    mockCreateAuthUser.mockResolvedValue({ uid: "u9" } as never);
    mockCreateAccountRecord.mockResolvedValue(undefined as never);
    mockUpdateAccountRecord.mockResolvedValue(undefined as never);
    mockDeleteAccountRecord.mockResolvedValue(undefined as never);

    await expect(
      executeCreateAccount({
        createEmail: "new@example.com",
        createPassword: "secret123",
        createDisplayName: "",
        createIsAdmin: true,
        hasExistingUser: true,
      }),
    ).resolves.toEqual({ needsPageReload: true });

    expect(mockCreateAuthUser).toHaveBeenCalledWith("new@example.com", "secret123");
    expect(mockCreateAccountRecord).toHaveBeenCalledWith("u9", {
      email: "new@example.com",
      password: "secret123",
      displayName: "new",
      isAdmin: true,
    });

    await executeUpdateAccount({
      editingAccount: account,
      editDisplayName: "更新後",
      editIsAdmin: false,
    });
    expect(mockUpdateAccountRecord).toHaveBeenCalledWith("u1", {
      displayName: "更新後",
      isAdmin: false,
    });

    await executeDeleteAccount({ account, currentUid: "u2" });
    expect(mockDeleteAccountRecord).toHaveBeenCalledWith("u1");

    await executeDeleteAccount({ account, currentUid: "u1" });
    expect(mockDeleteAccountRecord).toHaveBeenCalledTimes(1);
  });

  it("create error messageをコード別に返す", () => {
    expect(getCreateAccountErrorMessage({ code: "auth/email-already-in-use" })).toBe(
      "このメールアドレスは既に使用されています",
    );
    expect(getCreateAccountErrorMessage({ code: "auth/weak-password" })).toBe(
      "パスワードは6文字以上で入力してください",
    );
    expect(getCreateAccountErrorMessage({ code: "auth/invalid-email" })).toBe(
      "メールアドレスの形式が正しくありません",
    );
    expect(getCreateAccountErrorMessage({ code: "network-request-failed" })).toBe(
      "通信エラーが発生しました。電波の良い場所で再度お試しください",
    );
    expect(getCreateAccountErrorMessage({ code: "other" })).toBe(
      "アカウントの作成に失敗しました。時間をおいて再度お試しください",
    );
    expect(getCreateAccountErrorMessage(undefined)).toBe(
      "アカウントの作成に失敗しました。時間をおいて再度お試しください",
    );
  });

  it("公開indexに主要exportがある", () => {
    expect(accountAdminIndex.AccountAdminPage).toBeDefined();
    expect(accountAdminIndex.checkIsAdmin).toBe(checkIsAdmin);
    expect(accountAdminIndex.getAccount).toBe(getAccount);
  });
});
