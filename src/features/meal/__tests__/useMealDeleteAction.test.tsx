import { act, renderHook } from "@testing-library/react";

jest.mock("../mealPageStateActions", () => ({
  createMealDeleteHandler: jest.fn(),
}));

import { createMealDeleteHandler } from "../mealPageStateActions";
import { useMealDeleteAction } from "../useMealDeleteAction";

describe("useMealDeleteAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delete handler を組み立てて委譲する", () => {
    const deleteAction = jest.fn();
    (createMealDeleteHandler as jest.Mock).mockReturnValue(deleteAction);
    const params = createParams();

    const { result } = renderHook(() => useMealDeleteAction(params));

    act(() => {
      result.current("2024-01-12", "meal-1");
    });

    expect(createMealDeleteHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setTodayMeals: params.setTodayMeals,
        setRecentMeals: params.setRecentMeals,
      }),
    );
    expect(deleteAction).toHaveBeenCalledWith("2024-01-12", "meal-1");
  });
});

const createParams = () => ({
  setTodayMeals: jest.fn(),
  setRecentMeals: jest.fn(),
});
