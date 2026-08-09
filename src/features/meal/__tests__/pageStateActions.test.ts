import type { MealRecord } from "@/types/routine";
import {
  addMealAndReload,
  createMealPageData,
  deleteMealAndReload,
  getRecentMealsFromHistory,
  resetMealFormInputs,
} from "../pageStateActions";

describe("meal pageStateActions", () => {
  const breakfast: MealRecord = {
    id: "1",
    date: "2024-01-12",
    mealType: "breakfast",
    time: "08:00",
    description: "toast",
    notes: "memo",
    createdAt: "2024-01-12T08:00:00.000Z",
    updatedAt: "2024-01-12T08:00:00.000Z",
  };
  const dinner: MealRecord = {
    id: "2",
    date: "2024-01-13",
    mealType: "dinner",
    time: "19:00",
    description: "curry",
    createdAt: "2024-01-13T19:00:00.000Z",
    updatedAt: "2024-01-13T19:00:00.000Z",
  };

  it("履歴から新しい食事順に recent meals を作る", () => {
    expect(
      getRecentMealsFromHistory({
        [breakfast.date]: [breakfast],
        [dinner.date]: [dinner],
      }),
    ).toEqual([dinner, breakfast]);
  });

  it("recent meals は新しい順に最大20件までしか返さない", () => {
    // 「直近20件の履歴表示」という仕様の境界。21日分（1日1件）を渡すと
    // 新しい日付から20件だけが返り、最も古い1件は切り捨てられる。
    const mealHistory = Object.fromEntries(
      Array.from({ length: 21 }, (_, index) => {
        const day = String(index + 1).padStart(2, "0");
        const date = `2024-01-${day}`;
        return [
          date,
          [
            {
              id: `meal-${day}`,
              date,
              mealType: "lunch" as const,
              time: "12:00",
              description: `lunch ${day}`,
              createdAt: `${date}T12:00:00.000Z`,
              updatedAt: `${date}T12:00:00.000Z`,
            },
          ],
        ];
      }),
    );

    const recentMeals = getRecentMealsFromHistory(mealHistory);

    expect(recentMeals).toHaveLength(20);
    expect(recentMeals[0].date).toBe("2024-01-21");
    expect(recentMeals[19].date).toBe("2024-01-02");
    expect(recentMeals.some((meal) => meal.date === "2024-01-01")).toBe(false);
  });

  it("today meals と recent meals から page data を作る", () => {
    expect(
      createMealPageData([breakfast], {
        [breakfast.date]: [breakfast],
        [dinner.date]: [dinner],
      }),
    ).toEqual({
      todayMeals: [breakfast],
      recentMeals: [dinner, breakfast],
    });
  });

  it("フォーム reset 値を返す", () => {
    expect(resetMealFormInputs()).toEqual({
      descriptionInput: "",
      notesInput: "",
    });
  });

  it("説明が空なら追加せず alert する", () => {
    const alertFn = jest.fn();
    const addMeal = jest.fn();

    const result = addMealAndReload({
      today: "2024-01-12",
      mealTypeInput: "lunch",
      timeInput: "12:00",
      descriptionInput: "   ",
      notesInput: " memo ",
      alertMessage: "入力してください",
      addMeal,
      reloadMeals: jest.fn(),
      closeForm: jest.fn(),
      resetForm: jest.fn(),
      alertFn,
    });

    expect(result).toBe(false);
    expect(alertFn).toHaveBeenCalledWith("入力してください");
    expect(addMeal).not.toHaveBeenCalled();
  });

  it("説明があれば追加して再読込しフォームを閉じる", () => {
    const addMeal = jest.fn();
    const reloadMeals = jest.fn();
    const closeForm = jest.fn();
    const resetForm = jest.fn();

    const result = addMealAndReload({
      today: "2024-01-12",
      mealTypeInput: "lunch",
      timeInput: "12:00",
      descriptionInput: " ramen ",
      notesInput: " spicy ",
      alertMessage: "入力してください",
      addMeal,
      reloadMeals,
      closeForm,
      resetForm,
    });

    expect(result).toBe(true);
    expect(addMeal).toHaveBeenCalledWith(
      "2024-01-12",
      "lunch",
      "12:00",
      "ramen",
      {
        notes: "spicy",
      },
    );
    expect(reloadMeals).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
    expect(resetForm).toHaveBeenCalled();
  });

  it("削除確認が通ったときだけ削除して再読込する", () => {
    const deleteMeal = jest.fn();
    const reloadMeals = jest.fn();

    expect(
      deleteMealAndReload({
        date: "2024-01-12",
        mealId: "1",
        confirmMessage: "delete?",
        deleteMeal,
        reloadMeals,
        confirmFn: jest.fn(() => true),
      }),
    ).toBe(true);
    expect(deleteMeal).toHaveBeenCalledWith("2024-01-12", "1");
    expect(reloadMeals).toHaveBeenCalled();
  });

  it("削除確認が拒否されたら何もしない", () => {
    const deleteMeal = jest.fn();
    const reloadMeals = jest.fn();

    expect(
      deleteMealAndReload({
        date: "2024-01-12",
        mealId: "1",
        confirmMessage: "delete?",
        deleteMeal,
        reloadMeals,
        confirmFn: jest.fn(() => false),
      }),
    ).toBe(false);
    expect(deleteMeal).not.toHaveBeenCalled();
    expect(reloadMeals).not.toHaveBeenCalled();
  });
});
