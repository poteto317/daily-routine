import {
  canCreateAccount,
  submitCreateAccount,
  submitDeleteAccount,
  submitUpdateAccount,
} from "../accountAdminPageActionHandlers";

jest.mock("../accountAdminCreateAction", () => ({
  executeCreateAccount: jest.fn(),
}));

jest.mock("../accountAdminMutationActions", () => ({
  executeDeleteAccount: jest.fn(),
  executeUpdateAccount: jest.fn(),
}));

jest.mock("../accountAdminCreateError", () => ({
  getCreateAccountErrorMessage: jest.fn(() => "作成失敗"),
}));

import { executeCreateAccount } from "../accountAdminCreateAction";
import {
  executeDeleteAccount,
  executeUpdateAccount,
} from "../accountAdminMutationActions";

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

describe("accountAdminPageActionHandlers", () => {
  let alertSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("作成可能条件を判定する", () => {
    expect(canCreateAccount("a@example.com", "secret")).toBe(true);
    expect(canCreateAccount("", "secret")).toBe(false);
    expect(canCreateAccount("a@example.com", "")).toBe(false);
  });

  it("アカウント作成後に一覧を再読込する", async () => {
    (executeCreateAccount as jest.Mock).mockResolvedValue({
      needsPageReload: false,
    });
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const resetCreateForm = jest.fn();
    const setActionLoading = jest.fn();

    await submitCreateAccount({
      currentUid: "admin",
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      loadAccounts,
      reportError: jest.fn(),
      clearError: jest.fn(),
      resetCreateForm,
      setActionLoading,
    });

    expect(executeCreateAccount).toHaveBeenCalled();
    expect(resetCreateForm).toHaveBeenCalled();
    expect(loadAccounts).toHaveBeenCalled();
    expect(setActionLoading).toHaveBeenNthCalledWith(1, true);
    expect(setActionLoading).toHaveBeenLastCalledWith(false);
  });

  it("リロードが必要な作成を処理する", async () => {
    (executeCreateAccount as jest.Mock).mockResolvedValue({
      needsPageReload: true,
    });
    const reloadPage = jest.fn();

    await submitCreateAccount({
      currentUid: "admin",
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      resetCreateForm: jest.fn(),
      setActionLoading: jest.fn(),
      reloadPage,
    });

    expect(window.alert).toHaveBeenCalled();
    expect(reloadPage).toHaveBeenCalled();
  });

  it("更新と削除を処理する", async () => {
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const cancelEdit = jest.fn();

    await submitUpdateAccount({
      editingAccount: account,
      editDisplayName: "更新後",
      editIsAdmin: false,
      loadAccounts,
      reportError: jest.fn(),
      clearError: jest.fn(),
      cancelEdit,
      setActionLoading: jest.fn(),
    });

    expect(executeUpdateAccount).toHaveBeenCalledWith({
      editDisplayName: "更新後",
      editIsAdmin: false,
      editingAccount: account,
    });
    expect(cancelEdit).toHaveBeenCalled();

    await submitDeleteAccount({
      account,
      currentUid: "u2",
      loadAccounts,
      reportError: jest.fn(),
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
      confirmFn: jest.fn(() => true),
    });

    expect(executeDeleteAccount).toHaveBeenCalledWith({
      account,
      currentUid: "u2",
    });
  });

  it("削除失敗時にエラーを報告する", async () => {
    (executeDeleteAccount as jest.Mock).mockRejectedValueOnce(
      new Error("failed"),
    );
    const reportError = jest.fn();

    await submitDeleteAccount({
      account,
      currentUid: "u2",
      loadAccounts: jest.fn(),
      reportError,
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
      confirmFn: jest.fn(() => true),
    });

    expect(reportError).toHaveBeenCalledWith("アカウントの削除に失敗しました");
  });

  it("自己削除禁止と confirm キャンセルを扱う", async () => {
    const reportError = jest.fn();

    await submitDeleteAccount({
      account,
      currentUid: "u1",
      loadAccounts: jest.fn(),
      reportError,
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
    });

    expect(reportError).toHaveBeenCalledWith(
      "自分自身のアカウントは削除できません",
    );

    await submitDeleteAccount({
      account,
      currentUid: "u2",
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
      confirmFn: jest.fn(() => false),
    });

    expect(executeDeleteAccount).not.toHaveBeenCalled();
  });

  it("入力不足の作成や編集対象なし更新を何もしない", async () => {
    await submitCreateAccount({
      currentUid: "admin",
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      resetCreateForm: jest.fn(),
      setActionLoading: jest.fn(),
    });

    await submitUpdateAccount({
      editingAccount: null,
      editDisplayName: "",
      editIsAdmin: false,
      loadAccounts: jest.fn(),
      reportError: jest.fn(),
      clearError: jest.fn(),
      cancelEdit: jest.fn(),
      setActionLoading: jest.fn(),
    });

    expect(executeCreateAccount).not.toHaveBeenCalled();
    expect(executeUpdateAccount).not.toHaveBeenCalled();
  });
});
