import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminPageActionBindings", () => ({
  createAccountAdminPageActionBindings: jest.fn(),
}));

jest.mock("../accountAdminPageStateResult", () => ({
  createAccountAdminPageStateResult: jest.fn(),
}));

jest.mock("../useAccountAdminActions", () => ({
  useAccountAdminActions: jest.fn(),
}));

jest.mock("../useAccountAdminData", () => ({
  useAccountAdminData: jest.fn(),
}));

jest.mock("../useAccountAdminFormState", () => ({
  useAccountAdminFormState: jest.fn(),
}));

import { createAccountAdminPageActionBindings } from "../accountAdminPageActionBindings";
import { createAccountAdminPageStateResult } from "../accountAdminPageStateResult";
import { useAccountAdminActions } from "../useAccountAdminActions";
import { useAccountAdminData } from "../useAccountAdminData";
import { useAccountAdminFormState } from "../useAccountAdminFormState";
import { useAccountAdminPageState } from "../useAccountAdminPageState";

describe("useAccountAdminPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAccountAdminData as jest.Mock).mockReturnValue({
      accounts: [],
      clearError: jest.fn(),
      error: null,
      isAdmin: true,
      loadAccounts: jest.fn(),
      loading: false,
      reportError: jest.fn(),
    });
    (useAccountAdminFormState as jest.Mock).mockReturnValue({
      cancelEdit: jest.fn(),
      closeCreateForm: jest.fn(),
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      editDisplayName: "",
      editIsAdmin: false,
      editingAccount: null,
      resetCreateForm: jest.fn(),
      setCreateDisplayName: jest.fn(),
      setCreateEmail: jest.fn(),
      setCreateIsAdmin: jest.fn(),
      setCreatePassword: jest.fn(),
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
      showCreateForm: false,
      startEdit: jest.fn(),
      toggleCreateForm: jest.fn(),
    });
    (createAccountAdminPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useAccountAdminActions as jest.Mock).mockReturnValue({
      actionLoading: false,
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleUpdate: jest.fn(),
    });
    (createAccountAdminPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useAccountAdminPageState("u1"));

    expect(useAccountAdminData).toHaveBeenCalledWith("u1");
    expect(useAccountAdminFormState).toHaveBeenCalledTimes(1);
    expect(createAccountAdminPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: "u1",
        createEmail: "",
        editDisplayName: "",
      }),
    );
    expect(useAccountAdminActions).toHaveBeenCalledWith({ bound: true });
    expect(createAccountAdminPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUid: "u1",
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
