import {
  createCancelMealFormAction,
  createOpenMealFormAction,
  createResetMealFormAction,
} from "../mealFormActions";

describe("mealFormActions", () => {
  it("reset, cancel, open action がフォーム state を更新する", () => {
    const setShowForm = jest.fn();
    const setDescriptionInput = jest.fn();
    const setNotesInput = jest.fn();

    createResetMealFormAction({
      setDescriptionInput,
      setNotesInput,
    })();

    expect(setDescriptionInput).toHaveBeenCalledWith("");
    expect(setNotesInput).toHaveBeenCalledWith("");

    createCancelMealFormAction({
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    })();

    expect(setShowForm).toHaveBeenCalledWith(false);

    createOpenMealFormAction({ setShowForm })();

    expect(setShowForm).toHaveBeenLastCalledWith(true);
  });
});