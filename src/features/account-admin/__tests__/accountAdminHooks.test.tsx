import { act, renderHook } from "@testing-library/react";
import { useAccountAdminFormState } from "../useAccountAdminFormState";
import { useAccountAdminPageState } from "../useAccountAdminPageState";
import { useAccountAdminActions } from "../useAccountAdminActions";

jest.mock("../useAccountAdminData", () => ({
  useAccountAdminData: jest.fn(),
}));

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

import { useAccountAdminData } from "../useAccountAdminData";
import { executeCreateAccount } from "../accountAdminCreateAction";
import {
  executeDeleteAccount,
  executeUpdateAccount,
} from "../accountAdminMutationActions";

const mockUseAccountAdminData =
  useAccountAdminData as jest.MockedFunction<typeof useAccountAdminData>;
const mockExecuteCreateAccount =
  executeCreateAccount as jest.MockedFunction<typeof executeCreateAccount>;
const mockExecuteDeleteAccount =
  executeDeleteAccount as jest.MockedFunction<typeof executeDeleteAccount>;
const mockExecuteUpdateAccount =
  executeUpdateAccount as jest.MockedFunction<typeof executeUpdateAccount>;

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

describe("account-admin hooks", () => {
  let alertSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("useAccountAdminFormStateで作成フォームと編集状態を管理する", () => {
    const { result } = renderHook(() => useAccountAdminFormState());

    act(() => {
      result.current.toggleCreateForm();
      result.current.setCreateEmail("user@example.com");
      result.current.setCreatePassword("secret123");
      result.current.setCreateDisplayName("ユーザー");
      result.current.setCreateIsAdmin(true);
      result.current.startEdit(account);
    });

    expect(result.current.showCreateForm).toBe(true);
    expect(result.current.editingAccount).toEqual(account);
    expect(result.current.editDisplayName).toBe("ユーザー");
    expect(result.current.editIsAdmin).toBe(true);

    act(() => {
      result.current.cancelEdit();
      result.current.closeCreateForm();
      result.current.resetCreateForm();
    });

    expect(result.current.showCreateForm).toBe(false);
    expect(result.current.editingAccount).toBeNull();
    expect(result.current.createEmail).toBe("");
    expect(result.current.createPassword).toBe("");
    expect(result.current.createDisplayName).toBe("");
    expect(result.current.createIsAdmin).toBe(false);
  });

  it("useAccountAdminPageStateでdata/form/actionsを合成する", () => {
    mockUseAccountAdminData.mockReturnValue({
      accounts: [account],
      clearError: jest.fn(),
      error: null,
      isAdmin: true,
      loadAccounts: jest.fn(),
      loading: false,
      reportError: jest.fn(),
    });

    const { result } = renderHook(() => useAccountAdminPageState("u1"));

    expect(result.current.accounts).toEqual([account]);
    expect(result.current.currentUid).toBe("u1");
    expect(typeof result.current.handleCreate).toBe("function");
    expect(typeof result.current.toggleCreateForm).toBe("function");
  });

  it("useAccountAdminActionsで作成・更新・削除を処理する", async () => {
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const reportError = jest.fn();
    const clearError = jest.fn();
    const resetCreateForm = jest.fn();
    const cancelEdit = jest.fn();

    mockExecuteCreateAccount.mockResolvedValue({ needsPageReload: false });
    mockExecuteUpdateAccount.mockResolvedValue(undefined);
    mockExecuteDeleteAccount.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAccountAdminActions({
        currentUid: "u2",
        loadAccounts,
        reportError,
        clearError,
        resetCreateForm,
        cancelEdit,
        editingAccount: account,
        createEmail: "user@example.com",
        createPassword: "secret123",
        createDisplayName: "ユーザー",
        createIsAdmin: true,
        editDisplayName: "更新後",
        editIsAdmin: false,
      }),
    );

    await act(async () => {
      await result.current.handleCreate({ preventDefault: jest.fn() } as never);
    });
    expect(mockExecuteCreateAccount).toHaveBeenCalled();
    expect(resetCreateForm).toHaveBeenCalled();
    expect(loadAccounts).toHaveBeenCalled();

    await act(async () => {
      await result.current.handleUpdate({ preventDefault: jest.fn() } as never);
    });
    expect(mockExecuteUpdateAccount).toHaveBeenCalledWith({
      editDisplayName: "更新後",
      editIsAdmin: false,
      editingAccount: account,
    });
    expect(cancelEdit).toHaveBeenCalled();

    await act(async () => {
      await result.current.handleDelete(account);
    });
    expect(mockExecuteDeleteAccount).toHaveBeenCalledWith({
      account,
      currentUid: "u2",
    });
  });

  it("useAccountAdminActionsでエラーや自己削除禁止を処理する", async () => {
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const reportError = jest.fn();

    mockExecuteCreateAccount.mockRejectedValue(new Error("failed"));
    mockExecuteUpdateAccount.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() =>
      useAccountAdminActions({
        currentUid: "u1",
        loadAccounts,
        reportError,
        clearError: jest.fn(),
        resetCreateForm: jest.fn(),
        cancelEdit: jest.fn(),
        editingAccount: account,
        createEmail: "user@example.com",
        createPassword: "secret123",
        createDisplayName: "ユーザー",
        createIsAdmin: true,
        editDisplayName: "更新後",
        editIsAdmin: false,
      }),
    );

    await act(async () => {
      await result.current.handleCreate({ preventDefault: jest.fn() } as never);
    });
    expect(reportError).toHaveBeenCalledWith("作成失敗");

    await act(async () => {
      await result.current.handleUpdate({ preventDefault: jest.fn() } as never);
    });
    expect(reportError).toHaveBeenCalledWith("アカウントの更新に失敗しました");

    await act(async () => {
      await result.current.handleDelete(account);
    });
    expect(reportError).toHaveBeenCalledWith("自分自身のアカウントは削除できません");
  });

  it("入力不足や削除キャンセルを扱う", async () => {
    const loadAccounts = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAccountAdminActions({
        currentUid: "u2",
        loadAccounts,
        reportError: jest.fn(),
        clearError: jest.fn(),
        resetCreateForm: jest.fn(),
        cancelEdit: jest.fn(),
        editingAccount: null,
        createEmail: "",
        createPassword: "",
        createDisplayName: "",
        createIsAdmin: false,
        editDisplayName: "",
        editIsAdmin: false,
      }),
    );

    await act(async () => {
      await result.current.handleCreate({ preventDefault: jest.fn() } as never);
    });
    expect(mockExecuteCreateAccount).not.toHaveBeenCalled();

    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    await act(async () => {
      await result.current.handleDelete(account);
    });
    expect(mockExecuteDeleteAccount).not.toHaveBeenCalled();
  });
});
