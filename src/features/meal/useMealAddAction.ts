import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";
import { addMealRecord, getMealHistory, getTodayMealRecords } from "./storage";
import { createMealAddHandler } from "./mealPageStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealAddActionParams = {
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

export const useMealAddAction = ({
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
}: UseMealAddActionParams) => {
  return useCallback(() => {
    createMealAddHandler({
      today,
      mealTypeInput,
      timeInput,
      descriptionInput,
      notesInput,
      addMeal: addMealRecord,
      getTodayMealRecords,
      getMealHistory,
      setTodayMeals,
      setRecentMeals,
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    })();
  }, [
    descriptionInput,
    mealTypeInput,
    notesInput,
    setDescriptionInput,
    setNotesInput,
    setRecentMeals,
    setShowForm,
    setTodayMeals,
    timeInput,
    today,
  ]);
};
