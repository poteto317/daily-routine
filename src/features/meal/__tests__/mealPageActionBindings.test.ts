import { createMealPageActionBindings } from "../mealPageActionBindings";

describe("mealPageActionBindings", () => {
  it("meal page action 用の依存を束ねる", () => {
    const bindings = createMealPageActionBindings({
      today: "2024-01-12",
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
        today: "2024-01-12",
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
  });
});
