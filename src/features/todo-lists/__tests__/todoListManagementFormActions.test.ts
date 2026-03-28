import { createClosedTodoListFormState } from "../managementPageStateActions";
import {
  createTodoListFormCloseAction,
  createTodoListFormOpenAction,
} from "../todoListManagementFormActions";

jest.mock("../managementPageStateActions", () => ({
  createClosedTodoListFormState: jest.fn(),
}));

describe("todoListManagementFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("フォーム open/close action を構築する", () => {
    const setShowForm = jest.fn();
    const setTitleInput = jest.fn();
    (createClosedTodoListFormState as jest.Mock).mockReturnValue({
      showForm: false,
      titleInput: "",
    });

    createTodoListFormOpenAction({ setShowForm })();
    expect(setShowForm).toHaveBeenCalledWith(true);

    createTodoListFormCloseAction({ setShowForm, setTitleInput })();
    expect(createClosedTodoListFormState).toHaveBeenCalledWith();
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setShowForm).toHaveBeenLastCalledWith(false);
  });
});
