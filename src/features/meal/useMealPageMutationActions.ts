import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";
import { createMealPageMutationActionsResult } from "./mealPageMutationActionsResult";
import { useMealAddAction } from "./useMealAddAction";
import { useMealDeleteAction } from "./useMealDeleteAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealPageMutationActionsParams = {
  today: string;
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

export const useMealPageMutationActions = ({
  today,
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  setTodayMeals,
  setRecentMeals,
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: UseMealPageMutationActionsParams) => {
  const handleAddMeal = useMealAddAction({
    today,
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
  const handleDeleteMeal = useMealDeleteAction({
    setTodayMeals,
    setRecentMeals,
  });

  return createMealPageMutationActionsResult({
    handleAddMeal,
    handleDeleteMeal,
  });
};
