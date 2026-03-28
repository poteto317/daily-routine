import { createTodoListManagementFormStateResult } from "../todoListManagementFormStateResult";

describe("createTodoListManagementFormStateResult", () => {
  it("management form の公開 shape を返す", () => {
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const formState = {
      inputRef: { current: null } as React.RefObject<HTMLInputElement | null>,
      setShowForm: jest.fn(),
      setTitleInput: jest.fn(),
      showForm: false,
      titleInput: "",
    };

    expect(
      createTodoListManagementFormStateResult({
        closeForm,
        formState,
        openForm,
      }),
    ).toEqual({
      closeForm,
      inputRef: formState.inputRef,
      openForm,
      setTitleInput: formState.setTitleInput,
      showForm: false,
      titleInput: "",
    });
  });
});
