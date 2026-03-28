import type { MealRecord, MealType } from "@/types/routine";
import { sortMealsByDateTimeDesc } from "./utils/mealFormat";

type MealHistory = Record<string, MealRecord[]>;

type MealPageData = {
  todayMeals: MealRecord[];
  recentMeals: MealRecord[];
};

type MealFormInputs = {
  mealTypeInput: MealType;
  timeInput: string;
  descriptionInput: string;
  notesInput: string;
};

type MealFormResetState = {
  descriptionInput: string;
  notesInput: string;
};

type AddMealArgs = {
  today: string;
  mealTypeInput: MealType;
  timeInput: string;
  descriptionInput: string;
  notesInput: string;
  alertMessage: string;
  addMeal: (
    date: string,
    mealType: MealType,
    time: string,
    description: string,
    options?: { notes?: string },
  ) => void;
  reloadMeals: () => void;
  closeForm: () => void;
  resetForm: () => void;
  alertFn?: (message?: string) => void;
};

type DeleteMealArgs = {
  date: string;
  mealId: string;
  confirmMessage: string;
  deleteMeal: (date: string, mealId: string) => void;
  reloadMeals: () => void;
  confirmFn?: (message?: string) => boolean;
};

export const getRecentMealsFromHistory = (
  mealHistory: MealHistory,
): MealRecord[] => {
  const allMeals = Object.values(mealHistory).flatMap((meals) => meals);
  return sortMealsByDateTimeDesc(allMeals).slice(0, 20);
};

export const createMealPageData = (
  todayMeals: MealRecord[],
  mealHistory: MealHistory,
): MealPageData => {
  return {
    todayMeals,
    recentMeals: getRecentMealsFromHistory(mealHistory),
  };
};

export const resetMealFormInputs = (): MealFormResetState => {
  return {
    descriptionInput: "",
    notesInput: "",
  };
};

export const addMealAndReload = ({
  today,
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  alertMessage,
  addMeal,
  reloadMeals,
  closeForm,
  resetForm,
  alertFn = window.alert,
}: AddMealArgs): boolean => {
  const trimmedDescription = descriptionInput.trim();
  const trimmedNotes = notesInput.trim();

  if (!trimmedDescription) {
    alertFn(alertMessage);
    return false;
  }

  addMeal(today, mealTypeInput, timeInput, trimmedDescription, {
    notes: trimmedNotes || undefined,
  });
  reloadMeals();
  closeForm();
  resetForm();
  return true;
};

export const deleteMealAndReload = ({
  date,
  mealId,
  confirmMessage,
  deleteMeal,
  reloadMeals,
  confirmFn = window.confirm,
}: DeleteMealArgs): boolean => {
  if (!confirmFn(confirmMessage)) {
    return false;
  }

  deleteMeal(date, mealId);
  reloadMeals();
  return true;
};

export type { MealFormInputs, MealFormResetState, MealPageData };
