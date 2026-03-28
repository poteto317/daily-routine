import { renderHook } from "@testing-library/react";

jest.mock("../todoListManagementFormActions", () => ({
  createTodoListFormCloseAction: jest.fn(),
  createTodoListFormOpenAction: jest.fn(),
}));

jest.mock("../todoListManagementFormActionsResult", () => ({
  createTodoListManagementFormActionsResult: jest.fn(),
}));

import {
  createTodoListFormCloseAction,
  createTodoListFormOpenAction,
} from "../todoListManagementFormActions";
import { createTodoListManagementFormActionsResult } from "../todoListManagementFormActionsResult";
import { useTodoListManagementFormActions } from "../useTodoListManagementFormActions";

describe("useTodoListManagementFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("todo list form action を組み立てる", () => {
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const params = {
      setShowForm: jest.fn(),
      setTitleInput: jest.fn(),
    };

    (createTodoListFormCloseAction as jest.Mock).mockReturnValue(closeForm);
    (createTodoListFormOpenAction as jest.Mock).mockReturnValue(openForm);
    (createTodoListManagementFormActionsResult as jest.Mock).mockReturnValue({
      formActions: true,
    });

    const { result } = renderHook(() =>
      useTodoListManagementFormActions(params),
    );

    expect(createTodoListFormCloseAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
      setTitleInput: params.setTitleInput,
    });
    expect(createTodoListFormOpenAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
    });
    expect(createTodoListManagementFormActionsResult).toHaveBeenCalledWith({
      closeForm,
      openForm,
    });
    expect(result.current).toEqual({
      formActions: true,
    });
  });
});
