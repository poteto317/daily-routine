import { renderHook } from "@testing-library/react";

jest.mock("../accountAdminCreateFormStateResult", () => ({
  createAccountAdminCreateFormStateResult: jest.fn(),
}));

jest.mock("../useAccountAdminCreateFormFieldsState", () => ({
  useAccountAdminCreateFormFieldsState: jest.fn(),
}));

jest.mock("../useAccountAdminCreateFormVisibilityState", () => ({
  useAccountAdminCreateFormVisibilityState: jest.fn(),
}));

import { createAccountAdminCreateFormStateResult } from "../accountAdminCreateFormStateResult";
import { useAccountAdminCreateFormFieldsState } from "../useAccountAdminCreateFormFieldsState";
import { useAccountAdminCreateFormState } from "../useAccountAdminCreateFormState";
import { useAccountAdminCreateFormVisibilityState } from "../useAccountAdminCreateFormVisibilityState";

describe("useAccountAdminCreateFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("field/visibility state を compose し reset を束ねる", () => {
    const fields = {
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      setCreateDisplayName: jest.fn(),
      setCreateEmail: jest.fn(),
      setCreateIsAdmin: jest.fn(),
      setCreatePassword: jest.fn(),
    };
    const visibility = {
      closeCreateForm: jest.fn(),
      setShowCreateForm: jest.fn(),
      showCreateForm: false,
      toggleCreateForm: jest.fn(),
    };
    (useAccountAdminCreateFormFieldsState as jest.Mock).mockReturnValue(fields);
    (useAccountAdminCreateFormVisibilityState as jest.Mock).mockReturnValue(
      visibility,
    );
    let capturedResetCreateForm: (() => void) | undefined;
    const resultShape = {
      closeCreateForm: visibility.closeCreateForm,
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      resetCreateForm: jest.fn(),
      setCreateDisplayName: fields.setCreateDisplayName,
      setCreateEmail: fields.setCreateEmail,
      setCreateIsAdmin: fields.setCreateIsAdmin,
      setCreatePassword: fields.setCreatePassword,
      showCreateForm: false,
      toggleCreateForm: visibility.toggleCreateForm,
    };
    (createAccountAdminCreateFormStateResult as jest.Mock).mockImplementation(
      ({ resetCreateForm }) => {
        capturedResetCreateForm = resetCreateForm;
        return { ...resultShape, resetCreateForm };
      },
    );

    const { result } = renderHook(() => useAccountAdminCreateFormState());

    expect(useAccountAdminCreateFormFieldsState).toHaveBeenCalled();
    expect(useAccountAdminCreateFormVisibilityState).toHaveBeenCalled();
    expect(createAccountAdminCreateFormStateResult).toHaveBeenCalledWith({
      fieldsState: fields,
      visibilityState: visibility,
      resetCreateForm: expect.any(Function),
    });
    expect(result.current).toEqual({
      ...resultShape,
      resetCreateForm: expect.any(Function),
    });

    capturedResetCreateForm?.();

    expect(fields.setCreateEmail).toHaveBeenCalledWith("");
    expect(fields.setCreatePassword).toHaveBeenCalledWith("");
    expect(fields.setCreateDisplayName).toHaveBeenCalledWith("");
    expect(fields.setCreateIsAdmin).toHaveBeenCalledWith(false);
    expect(visibility.setShowCreateForm).toHaveBeenCalledWith(false);
  });
});
