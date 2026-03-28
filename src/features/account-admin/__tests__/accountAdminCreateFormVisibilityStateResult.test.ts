import { createAccountAdminCreateFormVisibilityStateResult } from "../accountAdminCreateFormVisibilityStateResult";

describe("createAccountAdminCreateFormVisibilityStateResult", () => {
  it("create form visibility state の公開 shape を返す", () => {
    const closeCreateForm = jest.fn();
    const setShowCreateForm = jest.fn();
    const toggleCreateForm = jest.fn();

    expect(
      createAccountAdminCreateFormVisibilityStateResult({
        closeCreateForm,
        setShowCreateForm,
        showCreateForm: true,
        toggleCreateForm,
      }),
    ).toEqual({
      closeCreateForm,
      setShowCreateForm,
      showCreateForm: true,
      toggleCreateForm,
    });
  });
});
