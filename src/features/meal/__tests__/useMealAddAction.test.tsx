import { act, renderHook } from "@testing-library/react";

jest.mock("../mealPageStateActions", () => ({
  createMealAddHandler: jest.fn(),
}));

import { createMealAddHandler } from "../mealPageStateActions";
import { useMealAddAction } from "../useMealAddAction";

describe("useMealAddAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("add handler を組み立てて委譲する", () => {
    const addAction = jest.fn();
    (createMealAddHandler as jest.Mock).mockReturnValue(addAction);
    const params = createParams();

    const { result } = renderHook(() => useMealAddAction(params));

    act(() => {
      result.current();
    });

    expect(createMealAddHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    expect(addAction).toHaveBeenCalled();
  });
});

const createParams = () => ({
  today: "2024-01-12",
  mealTypeInput: "lunch" as const,
  timeInput: "12:00",
  descriptionInput: "ramen",
  notesInput: "spicy",
  setTodayMeals: jest.fn(),
  setRecentMeals: jest.fn(),
  setShowForm: jest.fn(),
  setDescriptionInput: jest.fn(),
  setNotesInput: jest.fn(),
});
