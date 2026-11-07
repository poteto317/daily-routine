import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type MealPageActionBindingsArgs = {
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

export const createMealPageActionBindings = ({
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  setTodayMeals,
  setRecentMeals,
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: MealPageActionBindingsArgs) => {
  return {
    mealTypeInput,
    timeInput,
    descriptionInput,
    notesInput,
    setTodayMeals,
    setRecentMeals,
    setShowForm,
    setDescriptionInput,
    setNotesInput,
  };
};
