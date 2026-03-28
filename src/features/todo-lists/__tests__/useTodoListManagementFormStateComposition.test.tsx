import { renderHook } from "@testing-library/react";

jest.mock("../todoListManagementFormStateResult", () => ({
  createTodoListManagementFormStateResult: jest.fn(),
}));

jest.mock("../useTodoListManagementFormActions", () => ({
  useTodoListManagementFormActions: jest.fn(),
}));

jest.mock("../useTodoListManagementFormViewState", () => ({
  useTodoListManagementFormViewState: jest.fn(),
}));

import { createTodoListManagementFormStateResult } from "../todoListManagementFormStateResult";
import { useTodoListManagementFormActions } from "../useTodoListManagementFormActions";
import { useTodoListManagementFormState } from "../useTodoListManagementFormState";
import { useTodoListManagementFormViewState } from "../useTodoListManagementFormViewState";

describe("useTodoListManagementFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("form state と form action hook を compose する", () => {
    const formState = {
      inputRef: { current: null },
      setShowForm: jest.fn(),
      setTitleInput: jest.fn(),
      showForm: false,
      titleInput: "",
    };
    const actions = {
      closeForm: jest.fn(),
      openForm: jest.fn(),
    };
    (useTodoListManagementFormViewState as jest.Mock).mockReturnValue(
      formState,
    );
    (useTodoListManagementFormActions as jest.Mock).mockReturnValue(actions);
    (createTodoListManagementFormStateResult as jest.Mock).mockImplementation(
      ({ closeForm, formState, openForm }) => ({
        closeForm,
        inputRef: formState.inputRef,
        openForm,
        setTitleInput: formState.setTitleInput,
        showForm: formState.showForm,
        titleInput: formState.titleInput,
      }),
    );

    const { result } = renderHook(() => useTodoListManagementFormState());

    expect(useTodoListManagementFormViewState).toHaveBeenCalledTimes(1);
    expect(useTodoListManagementFormActions).toHaveBeenCalledWith({
      setShowForm: formState.setShowForm,
      setTitleInput: formState.setTitleInput,
    });
    expect(createTodoListManagementFormStateResult).toHaveBeenCalledWith({
      closeForm: actions.closeForm,
      formState,
      openForm: actions.openForm,
    });
    expect(result.current).toEqual({
      closeForm: actions.closeForm,
      inputRef: expect.objectContaining({ current: null }),
      openForm: actions.openForm,
      setTitleInput: formState.setTitleInput,
      showForm: false,
      titleInput: "",
    });
  });
});
