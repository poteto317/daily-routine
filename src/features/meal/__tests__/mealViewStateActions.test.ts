import type { MealRecord } from "@/types/routine";
import {
  createCanceledMealFormState,
  createInitialMealViewState,
  createOpenedMealFormState,
  createReloadedMealViewState,
} from "../mealViewStateActions";

describe("mealViewStateActions", () => {
  const breakfast: MealRecord = {
    id: "1",
    date: "2024-01-12",
    mealType: "breakfast",
    time: "08:00",
    description: "toast",
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

  it("初期view stateをまとめて作る", () => {
    expect(
      createInitialMealViewState({
        todayMeals: [breakfast],
        mealHistory: {
          [breakfast.date]: [breakfast],
          [dinner.date]: [dinner],
        },
        currentTime: "08:30",
      }),
    ).toEqual({
      todayMeals: [breakfast],
      recentMeals: [dinner, breakfast],
      showForm: false,
      mealTypeInput: "breakfast",
      timeInput: "08:30",
      descriptionInput: "",
      notesInput: "",
    });
  });

  it("再読込用のmeal stateを作る", () => {
    expect(
      createReloadedMealViewState([breakfast], {
        [breakfast.date]: [breakfast],
        [dinner.date]: [dinner],
      }),
    ).toEqual({
      todayMeals: [breakfast],
      recentMeals: [dinner, breakfast],
    });
  });

  it("キャンセル時のフォーム状態を作る", () => {
    expect(createCanceledMealFormState()).toEqual({
      showForm: false,
      descriptionInput: "",
      notesInput: "",
    });
  });

  it("フォームオープン状態を作る", () => {
    expect(createOpenedMealFormState()).toEqual({
      showForm: true,
    });
  });
});
