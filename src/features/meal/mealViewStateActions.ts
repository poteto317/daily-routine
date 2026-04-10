import type { MealRecord, MealType } from "@/types/routine";
import { createMealPageData, resetMealFormInputs } from "./pageStateActions";

type MealHistory = Record<string, MealRecord[]>;

type MealViewState = {
  todayMeals: MealRecord[];
  recentMeals: MealRecord[];
  showForm: boolean;
  mealTypeInput: MealType;
  timeInput: string;
  descriptionInput: string;
  notesInput: string;
};

export const createInitialMealViewState = ({
  todayMeals,
  mealHistory,
  currentTime,
}: {
  todayMeals: MealRecord[];
  mealHistory: MealHistory;
  currentTime: string;
}): MealViewState => {
  const pageData = createMealPageData(todayMeals, mealHistory);
  const resetState = resetMealFormInputs();

  return {
    todayMeals: pageData.todayMeals,
    recentMeals: pageData.recentMeals,
    showForm: false,
    mealTypeInput: "breakfast",
    timeInput: currentTime,
    descriptionInput: resetState.descriptionInput,
    notesInput: resetState.notesInput,
  };
};

export const createReloadedMealViewState = (
  todayMeals: MealRecord[],
  mealHistory: MealHistory,
): Pick<MealViewState, "todayMeals" | "recentMeals"> => {
  return createMealPageData(todayMeals, mealHistory);
};

export const createCanceledMealFormState = (): Pick<
  MealViewState,
  "showForm" | "descriptionInput" | "notesInput"
> => {
  return {
    showForm: false,
    ...resetMealFormInputs(),
  };
};

export const createOpenedMealFormState = (): Pick<
  MealViewState,
  "showForm"
> => {
  return {
    showForm: true,
  };
};

export type { MealViewState };
