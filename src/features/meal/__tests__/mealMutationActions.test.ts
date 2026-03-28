import { createMealAddHandler, createMealDeleteHandler } from "../mealMutationActions";

describe("mealMutationActions", () => {
  it("追加 handler が保存・再読込・フォームクローズを行う", () => {
    const addedMeal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "lunch" as const,
      time: "12:00",
      description: "ramen",
      createdAt: "2024-01-12T12:00:00.000Z",
      updatedAt: "2024-01-12T12:00:00.000Z",
    };
    const addMeal = jest.fn();
    const setTodayMeals = jest.fn();
    const setRecentMeals = jest.fn();
    const setShowForm = jest.fn();
    const setDescriptionInput = jest.fn();
    const setNotesInput = jest.fn();

    createMealAddHandler({
      today: "2024-01-12",
      mealTypeInput: "lunch",
      timeInput: "12:00",
      descriptionInput: " ramen ",
      notesInput: " spicy ",
      addMeal,
      getTodayMealRecords: () => [addedMeal],
      getMealHistory: () => ({ [addedMeal.date]: [addedMeal] }),
      setTodayMeals,
      setRecentMeals,
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    })();

    expect(addMeal).toHaveBeenCalledWith("2024-01-12", "lunch", "12:00", "ramen", {
      notes: "spicy",
    });
    expect(setTodayMeals).toHaveBeenCalledWith([addedMeal]);
    expect(setRecentMeals).toHaveBeenCalledWith([addedMeal]);
    expect(setShowForm).toHaveBeenCalledWith(false);
    expect(setDescriptionInput).toHaveBeenCalledWith("");
    expect(setNotesInput).toHaveBeenCalledWith("");
  });

  it("削除 handler が確認後に削除・再読込する", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "dinner" as const,
      time: "19:00",
      description: "curry",
      createdAt: "2024-01-12T19:00:00.000Z",
      updatedAt: "2024-01-12T19:00:00.000Z",
    };
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const deleteMeal = jest.fn();
    const setTodayMeals = jest.fn();
    const setRecentMeals = jest.fn();

    createMealDeleteHandler({
      deleteMeal,
      getTodayMealRecords: () => [meal],
      getMealHistory: () => ({ [meal.date]: [meal] }),
      setTodayMeals,
      setRecentMeals,
    })("2024-01-12", "meal-1");

    expect(deleteMeal).toHaveBeenCalledWith("2024-01-12", "meal-1");
    expect(setTodayMeals).toHaveBeenCalledWith([meal]);
    expect(setRecentMeals).toHaveBeenCalledWith([meal]);

    confirmSpy.mockRestore();
  });
});