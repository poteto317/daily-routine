import { createAccountAdminFormStateResult } from "../accountAdminFormStateResult";

describe("accountAdminFormStateResult", () => {
  it("create/edit form と toggle action をまとめる", () => {
    const createForm = {
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
    };
    const editForm = {
      cancelEdit: jest.fn(),
      editDisplayName: "",
      editIsAdmin: false,
      editingAccount: null,
      setEditDisplayName: jest.fn(),
      setEditIsAdmin: jest.fn(),
      startEdit: jest.fn(),
    };
    const toggleCreateForm = jest.fn();

    expect(
      createAccountAdminFormStateResult({
        createForm,
        editForm,
        toggleCreateForm,
      }),
    ).toEqual({
      ...createForm,
      ...editForm,
      toggleCreateForm,
    });
  });
});
