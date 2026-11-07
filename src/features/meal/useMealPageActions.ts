import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";
import { createMealPageActionsResult } from "./mealPageActionsResult";
import { useMealPageMutationActions } from "./useMealPageMutationActions";
import { useMealPageReloadAction } from "./useMealPageReloadAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealPageActionsParams = {
  mealTypeInput: MealType;
  timeInput: string;
  descriptionInput: string;
  notesInput: string;
  setTodayMeals: SetValue<MealRecord[]>;
  setRecentMeals: SetValue<MealRecord[]>;
  setShowForm: SetValue<boolean>;
  setDescriptionInput: SetValue<string>;
  setNotesInput: SetValue<string>;
};

export const useMealPageActions = ({
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  setTodayMeals,
  setRecentMeals,
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: UseMealPageActionsParams) => {
  const { reloadMeals } = useMealPageReloadAction({
    setTodayMeals,
    setRecentMeals,
  });
  const { handleAddMeal, handleDeleteMeal } = useMealPageMutationActions({
    mealTypeInput,
    timeInput,
    descriptionInput,
    notesInput,
    setTodayMeals,
    setRecentMeals,
    setShowForm,
    setDescriptionInput,
    setNotesInput,
  });

  return createMealPageActionsResult({
    handleAddMeal,
    handleDeleteMeal,
    reloadMeals,
  });
};
