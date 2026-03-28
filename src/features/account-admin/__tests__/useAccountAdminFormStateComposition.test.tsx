import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminFormStateResult", () => ({
  createAccountAdminFormStateResult: jest.fn(),
}));

jest.mock("../accountAdminFormToggleAction", () => ({
  createAccountAdminToggleCreateFormAction: jest.fn(),
}));

jest.mock("../useAccountAdminCreateFormState", () => ({
  useAccountAdminCreateFormState: jest.fn(),
}));

jest.mock("../useAccountAdminEditFormState", () => ({
  useAccountAdminEditFormState: jest.fn(),
}));

import { createAccountAdminFormStateResult } from "../accountAdminFormStateResult";
import { createAccountAdminToggleCreateFormAction } from "../accountAdminFormToggleAction";
import { useAccountAdminCreateFormState } from "../useAccountAdminCreateFormState";
import { useAccountAdminEditFormState } from "../useAccountAdminEditFormState";
import { useAccountAdminFormState } from "../useAccountAdminFormState";

describe("useAccountAdminFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAccountAdminCreateFormState as jest.Mock).mockReturnValue({
      closeCreateForm: jest.fn(),
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      resetCreateForm: jest.fn(),
      setCreateDisplayName: jest.fn(),
      setCreateEmail: jest.fn(),
      setCreateIsAdmin: jest.fn(),
      setCreatePassword: jest.fn(),
      showCreateForm: false,
      toggleCreateForm: jest.fn(),
    });
    (useAccountAdminEditFormState as jest.Mock).mockReturnValue({
      cancelEdit: jest.fn(),
      editDisplayName: "",
      editIsAdmin: false,
      editingAccount: null,
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
      startEdit: jest.fn(),
    });
    (createAccountAdminToggleCreateFormAction as jest.Mock).mockReturnValue(
      jest.fn(),
    );
    (createAccountAdminFormStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("create/edit/toggle/result を compose する", () => {
    const { result } = renderHook(() => useAccountAdminFormState());

    expect(useAccountAdminCreateFormState).toHaveBeenCalledTimes(1);
    expect(useAccountAdminEditFormState).toHaveBeenCalledTimes(1);
    expect(createAccountAdminToggleCreateFormAction).toHaveBeenCalledWith({
      cancelEdit: expect.any(Function),
      toggleCreateFormBase: expect.any(Function),
    });
    expect(createAccountAdminFormStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        createForm: expect.objectContaining({ showCreateForm: false }),
        editForm: expect.objectContaining({ editingAccount: null }),
        toggleCreateForm: expect.any(Function),
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
