import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MealRecord } from "@/types/routine";
import {
  deleteMealRecord,
  getMealHistory,
  getTodayMealRecords,
} from "./storage";
import { createMealDeleteHandler } from "./mealPageStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealDeleteActionParams = {
  setTodayMeals: SetValue<MealRecord[]>;
  setRecentMeals: SetValue<MealRecord[]>;
};

export const useMealDeleteAction = ({
  setTodayMeals,
  setRecentMeals,
}: UseMealDeleteActionParams) => {
  return useCallback(
    (date: string, mealId: string) => {
      createMealDeleteHandler({
        deleteMeal: deleteMealRecord,
        getTodayMealRecords,
        getMealHistory,
        setTodayMeals,
        setRecentMeals,
      })(date, mealId);
    },
    [setRecentMeals, setTodayMeals],
  );
};
