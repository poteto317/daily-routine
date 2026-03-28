import { renderHook } from "@testing-library/react";

jest.mock("../mealPageStateActions", () => ({
  createCancelMealFormAction: jest.fn(),
  createOpenMealFormAction: jest.fn(),
  createResetMealFormAction: jest.fn(),
}));

import {
  createCancelMealFormAction,
  createOpenMealFormAction,
  createResetMealFormAction,
} from "../mealPageStateActions";
import { useMealPageFormActions } from "../useMealPageFormActions";

describe("useMealPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("form action を組み立てる", () => {
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const resetForm = jest.fn();
    const params = {
      setShowForm: jest.fn(),
      setDescriptionInput: jest.fn(),
      setNotesInput: jest.fn(),
    };

    (createCancelMealFormAction as jest.Mock).mockReturnValue(handleCancelForm);
    (createOpenMealFormAction as jest.Mock).mockReturnValue(openForm);
    (createResetMealFormAction as jest.Mock).mockReturnValue(resetForm);

    const { result } = renderHook(() => useMealPageFormActions(params));

    expect(createCancelMealFormAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
      setDescriptionInput: params.setDescriptionInput,
      setNotesInput: params.setNotesInput,
    });
    expect(createOpenMealFormAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
    });
    expect(createResetMealFormAction).toHaveBeenCalledWith({
      setDescriptionInput: params.setDescriptionInput,
      setNotesInput: params.setNotesInput,
    });
    expect(result.current).toEqual({
      handleCancelForm,
      openForm,
      resetForm,
    });
  });
});
