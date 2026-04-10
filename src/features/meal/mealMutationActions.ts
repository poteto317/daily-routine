import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";
import { MEAL_PAGE_MESSAGES } from "./helpers";
import { addMealAndReload, deleteMealAndReload } from "./pageStateActions";
import { createResetMealFormAction } from "./mealFormActions";
import { createReloadMealsAction } from "./mealReloadActions";

type MealHistory = Record<string, MealRecord[]>;

type MealStorageReaders = {
  getTodayMealRecords: () => MealRecord[];
  getMealHistory: () => MealHistory;
};

type MealStateSetters = {
  setTodayMeals: Dispatch<SetStateAction<MealRecord[]>>;
  setRecentMeals: Dispatch<SetStateAction<MealRecord[]>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
};

type CreateMealAddHandlerArgs = MealStorageReaders &
  MealStateSetters & {
    today: string;
    mealTypeInput: MealType;
    timeInput: string;
    descriptionInput: string;
    notesInput: string;
    addMeal: (
      date: string,
      mealType: MealType,
      time: string,
      description: string,
      options?: { notes?: string },
    ) => void;
  };

type CreateMealDeleteHandlerArgs = MealStorageReaders &
  Pick<MealStateSetters, "setTodayMeals" | "setRecentMeals"> & {
    deleteMeal: (date: string, mealId: string) => void;
  };

export const createMealAddHandler = ({
  today,
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  addMeal,
  getTodayMealRecords,
  getMealHistory,
  setTodayMeals,
  setRecentMeals,
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: CreateMealAddHandlerArgs) => {
  const reloadMeals = createReloadMealsAction({
    getTodayMealRecords,
    getMealHistory,
    setTodayMeals,
    setRecentMeals,
  });
  const resetForm = createResetMealFormAction({
    setDescriptionInput,
    setNotesInput,
  });

  return () => {
    addMealAndReload({
      today,
      mealTypeInput,
      timeInput,
      descriptionInput,
      notesInput,
      alertMessage: MEAL_PAGE_MESSAGES.alertMissingContent,
      addMeal,
      reloadMeals,
      closeForm: () => setShowForm(false),
      resetForm,
    });
  };
};

export const createMealDeleteHandler = ({
  deleteMeal,
  getTodayMealRecords,
  getMealHistory,
  setTodayMeals,
  setRecentMeals,
}: CreateMealDeleteHandlerArgs) => {
  const reloadMeals = createReloadMealsAction({
    getTodayMealRecords,
    getMealHistory,
    setTodayMeals,
    setRecentMeals,
  });

  return (date: string, mealId: string) => {
    deleteMealAndReload({
      date,
      mealId,
      confirmMessage: MEAL_PAGE_MESSAGES.confirmDeleteMeal(date),
      deleteMeal,
      reloadMeals,
    });
  };
};
