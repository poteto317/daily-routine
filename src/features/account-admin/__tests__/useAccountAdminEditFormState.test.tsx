import { act, renderHook } from "@testing-library/react";

jest.mock("../accountAdminEditFormStateResult", () => ({
  createAccountAdminEditFormStateResult: jest.fn(),
}));

jest.mock("../useAccountAdminEditFieldsState", () => ({
  useAccountAdminEditFieldsState: jest.fn(),
}));

jest.mock("../useAccountAdminEditingAccountState", () => ({
  useAccountAdminEditingAccountState: jest.fn(),
}));

import { createAccountAdminEditFormStateResult } from "../accountAdminEditFormStateResult";
import type { Account } from "../types";
import { useAccountAdminEditFieldsState } from "../useAccountAdminEditFieldsState";
import { useAccountAdminEditFormState } from "../useAccountAdminEditFormState";
import { useAccountAdminEditingAccountState } from "../useAccountAdminEditingAccountState";

const account: Account = {
  uid: "u1",
  email: "user@example.com",
  displayName: "ユーザー",
  isAdmin: true,
  isAnonymous: false,
  isTestUser: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useAccountAdminEditFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("editing target と edit fields を compose し start/cancel を束ねる", () => {
    const fields = {
      editDisplayName: "",
      editIsAdmin: false,
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
    };
    const editing = {
      editingAccount: null,
      setEditingAccount: jest.fn(),
    };
    (useAccountAdminEditFieldsState as jest.Mock).mockReturnValue(fields);
    (useAccountAdminEditingAccountState as jest.Mock).mockReturnValue(editing);
    let capturedStartEdit: ((account: Account) => void) | undefined;
    let capturedCancelEdit: (() => void) | undefined;
    const resultShape = {
      cancelEdit: jest.fn(),
      editDisplayName: "",
      editIsAdmin: false,
      editingAccount: null,
      setEditDisplayName: fields.setEditDisplayName,
      setEditIsAdmin: fields.setEditIsAdmin,
      startEdit: jest.fn(),
    };
    (createAccountAdminEditFormStateResult as jest.Mock).mockImplementation(
      ({ startEdit, cancelEdit }) => {
        capturedStartEdit = startEdit;
        capturedCancelEdit = cancelEdit;
        return {
          ...resultShape,
          startEdit,
          cancelEdit,
        };
      },
    );

    const { result } = renderHook(() => useAccountAdminEditFormState());

    expect(useAccountAdminEditFieldsState).toHaveBeenCalledTimes(1);
    expect(useAccountAdminEditingAccountState).toHaveBeenCalledTimes(1);
    expect(createAccountAdminEditFormStateResult).toHaveBeenCalledWith({
      fieldsState: fields,
      editingState: editing,
      startEdit: expect.any(Function),
      cancelEdit: expect.any(Function),
    });
    expect(result.current).toEqual({
      ...resultShape,
      startEdit: expect.any(Function),
      cancelEdit: expect.any(Function),
    });

    act(() => {
      capturedStartEdit?.(account);
    });

    expect(editing.setEditingAccount).toHaveBeenCalledWith(account);
    expect(fields.setEditDisplayName).toHaveBeenCalledWith("ユーザー");
    expect(fields.setEditIsAdmin).toHaveBeenCalledWith(true);

    act(() => {
      capturedCancelEdit?.();
    });

    expect(editing.setEditingAccount).toHaveBeenLastCalledWith(null);
  });
});
