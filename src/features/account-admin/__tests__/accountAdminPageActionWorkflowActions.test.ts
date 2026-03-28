import {
  blockSelfAccountDeletion,
  completeCreateAccount,
  confirmAccountDeletion,
  runAccountAdminAction,
} from "../accountAdminPageActionWorkflowActions";

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

describe("accountAdminPageActionWorkflowActions", () => {
  it("共通 action 実行で loading と error lifecycle を管理する", async () => {
    const setActionLoading = jest.fn();
    const clearError = jest.fn();
    const execute = jest.fn().mockResolvedValue(undefined);
    const onError = jest.fn();

    await runAccountAdminAction({
      clearError,
      setActionLoading,
      execute,
      onError,
    });

    expect(setActionLoading).toHaveBeenNthCalledWith(1, true);
    expect(clearError).toHaveBeenCalled();
    expect(execute).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(setActionLoading).toHaveBeenLastCalledWith(false);
  });

  it("共通 action 実行で失敗時に onError と logError を呼ぶ", async () => {
    const error = new Error("failed");
    const onError = jest.fn();
    const logError = jest.fn();

    await runAccountAdminAction({
      clearError: jest.fn(),
      setActionLoading: jest.fn(),
      execute: jest.fn().mockRejectedValue(error),
      onError,
      logError,
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(logError).toHaveBeenCalledWith(error);
  });

  it("作成完了後に reload 必要有無で処理を切り替える", async () => {
    const resetCreateForm = jest.fn();
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const alertFn = jest.fn();
    const reloadPage = jest.fn();

    await completeCreateAccount({
      needsPageReload: false,
      resetCreateForm,
      loadAccounts,
      alertFn,
      reloadPage,
    });

    expect(resetCreateForm).toHaveBeenCalledTimes(1);
    expect(loadAccounts).toHaveBeenCalledTimes(1);
    expect(alertFn).not.toHaveBeenCalled();
    expect(reloadPage).not.toHaveBeenCalled();

    await completeCreateAccount({
      needsPageReload: true,
      resetCreateForm,
      loadAccounts,
      alertFn,
      reloadPage,
    });

    expect(alertFn).toHaveBeenCalled();
    expect(reloadPage).toHaveBeenCalled();
  });

  it("自己削除ガードと削除確認を判定する", () => {
    const reportError = jest.fn();

    expect(
      blockSelfAccountDeletion({
        account,
        currentUid: "u1",
        reportError,
      }),
    ).toBe(true);
    expect(reportError).toHaveBeenCalledWith("自分自身のアカウントは削除できません");

    expect(
      blockSelfAccountDeletion({
        account,
        currentUid: "u2",
        reportError: jest.fn(),
      }),
    ).toBe(false);

    const confirmFn = jest.fn(() => true);
    expect(confirmAccountDeletion({ account, confirmFn })).toBe(true);
    expect(confirmFn).toHaveBeenCalled();
  });
});
