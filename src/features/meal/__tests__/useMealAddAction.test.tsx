import { act, renderHook } from "@testing-library/react";

jest.mock("../mealPageStateActions", () => ({
  createMealAddHandler: jest.fn(),
}));

import { createMealAddHandler } from "../mealPageStateActions";
import { useMealAddAction } from "../useMealAddAction";

describe("useMealAddAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2024-01-12T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("add handler を組み立てて委譲する", () => {
    const addAction = jest.fn();
    (createMealAddHandler as jest.Mock).mockReturnValue(addAction);
    const params = createParams();

    const { result } = renderHook(() => useMealAddAction(params));

    act(() => {
      result.current();
    });

    // 保存する日付は、保存を押した時点の今日（2024-01-12 12:00 JST）
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
