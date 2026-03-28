import { createAccountAdminCreateFormStateResult } from "../accountAdminCreateFormStateResult";

describe("createAccountAdminCreateFormStateResult", () => {
  it("create form の公開 shape を返す", () => {
    const fieldsState = {
      createDisplayName: "User",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret",
      setCreateDisplayName: jest.fn(),
      setCreateEmail: jest.fn(),
      setCreateIsAdmin: jest.fn(),
      setCreatePassword: jest.fn(),
    };
    const visibilityState = {
      closeCreateForm: jest.fn(),
      setShowCreateForm: jest.fn(),
      showCreateForm: true,
      toggleCreateForm: jest.fn(),
    };
    const resetCreateForm = jest.fn();

    const result = createAccountAdminCreateFormStateResult({
      fieldsState,
      visibilityState,
      resetCreateForm,
    });

    expect(result).toEqual({
      closeCreateForm: visibilityState.closeCreateForm,
      createDisplayName: "User",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret",
      resetCreateForm,
      setCreateDisplayName: fieldsState.setCreateDisplayName,
      setCreateEmail: fieldsState.setCreateEmail,
      setCreateIsAdmin: fieldsState.setCreateIsAdmin,
      setCreatePassword: fieldsState.setCreatePassword,
      showCreateForm: true,
      toggleCreateForm: visibilityState.toggleCreateForm,
    });
  });
});
