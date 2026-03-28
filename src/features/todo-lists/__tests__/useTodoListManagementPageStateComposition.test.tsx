import { createRef } from "react";
import { renderHook } from "@testing-library/react";

jest.mock("../todoListManagementPageStateResult", () => ({
  createTodoListManagementPageStateResult: jest.fn(),
}));

jest.mock("../todoListManagementTitleEditingBindings", () => ({
  createTodoListManagementTitleEditingBindings: jest.fn(),
}));

jest.mock("../useTodoListManagementDataState", () => ({
  useTodoListManagementDataState: jest.fn(),
}));

jest.mock("../useTodoListManagementFormFocus", () => ({
  useTodoListManagementFormFocus: jest.fn(),
}));

jest.mock("../useTodoListManagementFormState", () => ({
  useTodoListManagementFormState: jest.fn(),
}));

jest.mock("../useTodoListManagementTitleEditing", () => ({
  useTodoListManagementTitleEditing: jest.fn(),
}));

import { createTodoListManagementPageStateResult } from "../todoListManagementPageStateResult";
import { createTodoListManagementTitleEditingBindings } from "../todoListManagementTitleEditingBindings";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";
import { useTodoListManagementFormFocus } from "../useTodoListManagementFormFocus";
import { useTodoListManagementFormState } from "../useTodoListManagementFormState";
import { useTodoListManagementPageState } from "../useTodoListManagementPageState";
import { useTodoListManagementTitleEditing } from "../useTodoListManagementTitleEditing";

describe("useTodoListManagementPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useTodoListManagementFormState as jest.Mock).mockReturnValue({
      closeForm: jest.fn(),
      inputRef: createRef<HTMLInputElement>(),
      openForm: jest.fn(),
      setTitleInput: jest.fn(),
      showForm: false,
      titleInput: "Inbox",
    });
    (useTodoListManagementDataState as jest.Mock).mockReturnValue({
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      lists: [],
      openList: jest.fn(),
    });
    (createTodoListManagementTitleEditingBindings as jest.Mock).mockReturnValue(
      {
        bound: true,
      },
    );
    (useTodoListManagementTitleEditing as jest.Mock).mockReturnValue({
      cancelEditListTitle: jest.fn(),
      commitEditListTitle: jest.fn(),
      editingListId: null,
      editingListTitleValue: "",
      setEditingListTitleValue: jest.fn(),
      startEditListTitle: jest.fn(),
    });
    (createTodoListManagementPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("form/data/titleEditing/result を compose する", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate }),
    );

    expect(useTodoListManagementDataState).toHaveBeenCalledWith({
      closeForm: expect.any(Function),
      navigate,
      titleInput: "Inbox",
    });
    expect(createTodoListManagementTitleEditingBindings).toHaveBeenCalledWith({
      handleRename: expect.any(Function),
    });
    expect(useTodoListManagementTitleEditing).toHaveBeenCalledWith({
      bound: true,
    });
    expect(useTodoListManagementFormFocus).toHaveBeenCalledWith({
      inputRef: expect.any(Object),
      showForm: false,
    });
    expect(createTodoListManagementPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "Inbox",
        showForm: false,
        lists: [],
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
