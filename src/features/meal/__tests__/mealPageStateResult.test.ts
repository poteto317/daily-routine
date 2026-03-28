import { createMealPageStateResult } from "../mealPageStateResult";

describe("mealPageStateResult", () => {
  it("meal page 表示用の result を組み立てる", () => {
    const setDescriptionInput = jest.fn();
    const setMealTypeInput = jest.fn();
    const setNotesInput = jest.fn();
    const setTimeInput = jest.fn();
    const handleAddMeal = jest.fn();
    const handleCancelForm = jest.fn();
    const handleDeleteMeal = jest.fn();
    const openForm = jest.fn();
    const todayMeals = [
      {
        id: "meal-1",
        date: "2024-01-12",
        mealType: "lunch" as const,
        time: "12:00",
        description: "ramen",
        createdAt: "2024-01-12T12:00:00.000Z",
        updatedAt: "2024-01-12T12:00:00.000Z",
      },
    ];

    expect(
      createMealPageStateResult({
        descriptionInput: "ramen",
        mealTypeInput: "lunch",
        notesInput: "spicy",
        recentMeals: todayMeals,
        showForm: true,
        timeInput: "12:00",
        today: "2024-01-12",
        todayMeals,
        handleAddMeal,
        handleCancelForm,
        handleDeleteMeal,
        openForm,
        setDescriptionInput,
        setMealTypeInput,
        setNotesInput,
        setTimeInput,
      }),
    ).toEqual({
      descriptionInput: "ramen",
      mealTypeInput: "lunch",
      notesInput: "spicy",
      recentMeals: todayMeals,
      showForm: true,
      timeInput: "12:00",
      today: "2024-01-12",
      todayMeals,
      handleAddMeal,
      handleCancelForm,
      handleDeleteMeal,
      openForm,
      setDescriptionInput,
      setMealTypeInput,
      setNotesInput,
      setTimeInput,
    });
  });
});
