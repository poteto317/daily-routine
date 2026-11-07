import { createMealPageActionBindings } from "../mealPageActionBindings";

describe("mealPageActionBindings", () => {
  it("meal page action 用の依存を束ねる", () => {
    const bindings = createMealPageActionBindings({
      mealTypeInput: "lunch",
      timeInput: "12:00",
      descriptionInput: "ramen",
      notesInput: "spicy",
      setTodayMeals: jest.fn(),
      setRecentMeals: jest.fn(),
      setShowForm: jest.fn(),
      setDescriptionInput: jest.fn(),
      setNotesInput: jest.fn(),
    });

    expect(bindings).toEqual(
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は束ねない
    expect(bindings).not.toHaveProperty("today");
  });
});
